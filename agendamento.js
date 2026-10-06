/* ==========================================
   MÓDULO DE AGENDA (ETAPA 1 — SEM GOOGLE AGENDA AINDA)
   Ferramenta de uso do dia a dia: marcar um agendamento novo (cliente já
   cadastrado + serviço + data/hora, com os horários livres calculados
   sozinho) e ver os já marcados. Ainda não fala com a Google Agenda —
   isso é a próxima etapa, depois que a integração com o Google estiver
   configurada.

   O que é "configura uma vez e não mexe mais" (disponibilidade — dias/
   horários que atende — e quais pastas de clientes entram no seletor)
   NÃO fica aqui, fica em Configurações → Agenda (página configuracoes.js:
   carregarConfiguracoesAgenda, salvarDisponibilidadeAgenda,
   salvarPastasVisiveisAgenda). Este arquivo
   só LÊ o resultado dessas configurações (agenda_disponibilidade,
   configuracoes.agenda_pastas_visiveis) pra calcular horários livres e
   filtrar a lista de clientes.

   Tudo fica no Supabase, em tabelas novas:

     agenda_disponibilidade — regras recorrentes por dia da semana
     agendamentos           — os agendamentos em si

   E 3 colunas novas na tabela "configuracoes" já existente:
     agenda_duracao_padrao_minutos, agenda_intervalo_minutos,
     agenda_pastas_visiveis

   Nenhuma dessas tabelas/colunas é criada por este arquivo — precisa
   rodar o SQL de configuração no Supabase antes (ver AGENDA_SETUP_SQL
   no fim deste arquivo). Enquanto isso não for feito, a tela mostra um
   aviso em vez de quebrar.
   ========================================== */

const AGENDA_DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

let agendaDisponibilidadeCache = [];
let agendaAgendamentosCache = [];
let agendaMapasCache = [];
let agendaTodosMapasCache = []; // todos os clientes (pra achar o contato de um compromisso), sem o filtro de pastas
let agendaServicosCache = [];
let agendaConfigCache = { duracao: 60, intervalo: 0, pastasVisiveis: null };

/* PONTO DE ENTRADA DO MÓDULO — chamado por abrirModuloTecnica('agenda') (supabase.js) */
async function iniciarModuloAgenda() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  container.innerHTML = `
    <div class="menu-vazio" style="min-height: 200px;">Carregando...</div>
  `;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { renderAgendaSetup(container, { semSessao: true }); return; }

    const hojeISO = new Date().toISOString().slice(0, 10);

    const [dispRes, agsRes, mapasRes, servicosRes, configRes] = await Promise.all([
      supabaseClient.from('agenda_disponibilidade').select('*').eq('user_id', user.id).order('dia_semana', { ascending: true }),
      supabaseClient.from('agendamentos').select('*').eq('user_id', user.id).gte('data', hojeISO).order('data', { ascending: true }).order('hora_inicio', { ascending: true }),
      supabaseClient.from('mapas').select('id, nome, codigo, pasta, cidade, tipo, whatsapp, email'),
      supabaseClient.from('relatorio_presets').select('id, nome, duracao_minutos').eq('user_id', user.id).order('nome', { ascending: true }),
      supabaseClient.from('configuracoes').select('agenda_duracao_padrao_minutos, agenda_intervalo_minutos, agenda_pastas_visiveis').eq('user_id', user.id).maybeSingle()
    ]);

    // As duas tabelas novas são essenciais — sem elas não tem como mostrar
    // nada de verdade. mapas/relatorio_presets/configuracoes já existem
    // faz tempo, então erro neles é tratado como caso raro (cai pro
    // padrão), não trava a tela inteira.
    if (dispRes.error || agsRes.error) {
      console.error('Agenda: erro ao ler as tabelas:', dispRes.error || agsRes.error);
      renderAgendaSetup(container, { tabelasIndisponiveis: true, detalhe: (dispRes.error || agsRes.error).message });
      return;
    }

    agendaDisponibilidadeCache = dispRes.data || [];
    agendaAgendamentosCache = agsRes.data || [];
    const todosOsMapas = (!mapasRes.error && mapasRes.data) ? mapasRes.data : [];
    agendaServicosCache = (!servicosRes.error && servicosRes.data) ? servicosRes.data : [];
    if (servicosRes.error) {
      // coluna duracao_minutos ainda não criada no Supabase: cai pra lista só com nome (duração padrão da agenda)
      const alt = await supabaseClient.from('relatorio_presets').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true });
      agendaServicosCache = (!alt.error && alt.data) ? alt.data : [];
    }

    // pastasVisiveis null = ainda não configurado -> mostra todas as pastas
    // (comportamento de antes, pra não sumir cliente sem o astrólogo pedir).
    const pastasVisiveis = (!configRes.error && configRes.data && Array.isArray(configRes.data.agenda_pastas_visiveis))
      ? configRes.data.agenda_pastas_visiveis
      : null;

    agendaTodosMapasCache = todosOsMapas;
    agendaMapasCache = pastasVisiveis
      ? todosOsMapas.filter(m => pastasVisiveis.includes(m.pasta))
      : todosOsMapas;

    // Mesma ordem escolhida na tela de Pastas (currentSortField/
    // currentSortDirection e compararValoresOrdenacao vêm de supabase.js,
    // já carregado nessa página) — assim o cliente aparece na mesma
    // posição relativa nos dois lugares.
    if (typeof compararValoresOrdenacao === 'function') {
      agendaMapasCache.sort((a, b) => {
        const resultado = compararValoresOrdenacao(a, b, currentSortField);
        return currentSortDirection === 'desc' ? -resultado : resultado;
      });
    }

    agendaConfigCache = {
      duracao: (!configRes.error && configRes.data && configRes.data.agenda_duracao_padrao_minutos) || 60,
      intervalo: (!configRes.error && configRes.data && configRes.data.agenda_intervalo_minutos) || 0,
      pastasVisiveis: pastasVisiveis
    };

    renderAgendaSetup(container, {
      disponibilidade: agendaDisponibilidadeCache,
      agendamentos: agendaAgendamentosCache,
      mapas: agendaMapasCache,
      servicos: agendaServicosCache
    });
  } catch (e) {
    console.error('Erro ao carregar a agenda:', e);
    renderAgendaSetup(container, { tabelasIndisponiveis: true, detalhe: e && e.message });
  }
}

/* MONTA A TELA INTEIRA (disponibilidade + novo agendamento + lista) */
function renderAgendaSetup(container, ctx) {
  if (ctx.semSessao) {
    container.innerHTML = `<div class="menu-vazio">Sessão não identificada.</div>`;
    return;
  }

  if (ctx.tabelasIndisponiveis) {
    container.innerHTML = `
      <div id="agenda-container" class="painel">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Agenda</h3></div>
        <hr class="divisa">
        <p class="ag-nota">Não foi possível carregar a agenda agora. Recarregue a página; se continuar, pode faltar criar as tabelas de agenda no Supabase.</p>
        ${ctx.detalhe ? `<p class="ag-nota" style="opacity:.6">Detalhe: ${escapeHtml(String(ctx.detalhe))}</p>` : ''}
      </div>
    `;
    return;
  }

  const { disponibilidade, agendamentos, mapas, servicos } = ctx;
  const hojeISO = new Date().toISOString().slice(0, 10);

  const opcoesClientes = mapas.length
    ? mapas.map(m => {
        const rotulo = m.codigo ? `${m.codigo} - ${m.nome}` : m.nome;
        return `<option value="${m.id}" data-nome="${escapeHtml(m.nome)}">${escapeHtml(rotulo)}</option>`;
      }).join('')
    : '<option value="">Nenhum cliente nas pastas visíveis</option>';

  const avisoSemDisponibilidade = disponibilidade.length === 0
    ? `<div class="ag-aviso">
        Você ainda não configurou sua disponibilidade — vá em <a href="#" onclick="abrirConfiguracoes('agenda'); return false;">Configurações → Agenda</a> (engrenagem na barra superior) pra escolher os dias/horários que atende antes de marcar um agendamento.
      </div>`
    : '';

  const opcoesServicos = servicos.length
    ? servicos.map(s => `<option value="${s.id}">${escapeHtml(s.nome)}</option>`).join('')
    : '<option value="">Nenhum serviço cadastrado ainda</option>';

  const listaAgendamentosHTML = agendamentos.length
    ? agendamentos.map(a => {
        const servicoDataHora = `${escapeHtml(a.servico_nome || 'Serviço')} — ${agendaFormatarDataBR(a.data)} às ${a.hora_inicio.slice(0, 5)}`;
        const rotuloCancelar = escapeHtml((a.cliente_nome || 'Cliente') + ' — ' + (a.servico_nome || 'Serviço') + ' — ' + agendaFormatarDataBR(a.data) + ' ' + a.hora_inicio.slice(0, 5)).replace(/'/g, "\\'");
        return `
      <div class="ag-item">
        <div class="ag-item-corpo">
          <div class="ag-item-nome">${escapeHtml(a.cliente_nome || 'Cliente')}</div>
          <div class="ag-item-det">${servicoDataHora}</div>
        </div>
        <button type="button" class="botao-icone botao-apagar" onclick="apagarAgendamento('${a.id}', '${rotuloCancelar}')" title="Cancelar agendamento">${menuIcone('lixeira', 18)}</button>
      </div>
    `;
      }).join('')
    : `<div class="menu-vazio">Nenhum agendamento futuro ainda.</div>`;

  container.innerHTML = `
    <div id="agenda-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">

      <div class="cabeca-ferramenta">
        <h3 class="titulo-ferramenta">Agenda</h3>
      </div>
      <div class="ag-bloco" id="agGoogleCompromissos"><div class="menu-vazio">Carregando compromissos...</div></div>

      <hr class="divisa">

      <div class="ag-colunas">
        <div class="ag-bloco">
          <div class="titulo-secao">Novo Agendamento</div>

          ${avisoSemDisponibilidade}

          <label class="rotulo ag-rotulo">Cliente</label>
          <select id="agNovoCliente" class="modal-select">${opcoesClientes}</select>

          <label class="rotulo ag-rotulo">Serviço</label>
          <select id="agNovoServico" class="modal-select" onchange="atualizarHorariosDisponiveisAgenda()">${opcoesServicos}</select>

          <label class="rotulo ag-rotulo">Data</label>
          <input type="date" id="agNovaData" class="modal-input" min="${hojeISO}" onchange="atualizarHorariosDisponiveisAgenda()">

          <label class="rotulo ag-rotulo">Horário</label>
          <select id="agNovoHorario" class="modal-select"><option value="">Escolha uma data</option></select>

          <div class="ag-acoes">
            <button type="button" class="botao-texto" onclick="confirmarNovoAgendamento()">Agendar</button>
          </div>
        </div>

        <div class="ag-bloco">
          <div class="titulo-secao">Próximos Agendamentos</div>
          ${listaAgendamentosHTML}
        </div>
      </div>

      <hr class="divisa">
    </div>
  `;
  carregarCompromissosGoogleAgenda();
}

/* COMPROMISSOS DAS AGENDAS DO GOOGLE (as marcadas em Configurações → Agenda como "bloqueiam horário"), igual ao Google:
   dia a dia, com horário, título e de qual agenda é. Só leitura; quem busca é o servidor (api/google.js, ação "eventos"). */
let agendaDiasCompromissos = 14;
const AGENDA_SEMANA_CURTA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function agendaSomarDiasISO(iso, n) {
  const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/* contato (WhatsApp e e-mail) do cliente do compromisso: acha o cliente pelo código no começo do título/da agenda (ex.: "0157 - Nome")
   ou, se não tiver código, pelo nome completo dentro do título (só quando der um cliente só) */
function agendaClienteDoCompromisso(ev) {
  const mapas = agendaTodosMapasCache || [];
  const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  for (const texto of [ev.titulo, ev.calendario]) {
    const cod = String(texto || '').match(/^\s*(\d{3,6})\b/);
    if (cod) {
      const achados = mapas.filter(m => m.codigo && String(m.codigo).replace(/^0+/, '') === cod[1].replace(/^0+/, ''));
      if (achados.length === 1) return achados[0];
    }
  }
  const t = norm(ev.titulo);
  const porNome = mapas.filter(m => m.nome && norm(m.nome).length >= 6 && t.includes(norm(m.nome)));
  return porNome.length === 1 ? porNome[0] : null;
}

function agendaContatoDoCompromisso(ev) {
  const m = agendaClienteDoCompromisso(ev);
  if (!m) return '';
  const partes = [];
  const zap = m.whatsapp ? String(m.whatsapp).trim() : '';
  if (zap) {
    const num = zap.replace(/\D/g, '');
    partes.push(`WhatsApp: ${num ? `<a href="https://wa.me/${num}" target="_blank" rel="noopener">${escapeHtml(zap)}</a>` : escapeHtml(zap)}`);
  }
  if (m.email) partes.push(`E-mail: ${escapeHtml(String(m.email).trim())}`);
  return partes.length ? `<div class="ag-item-det">${partes.join(' · ')}</div>` : '';
}

async function carregarCompromissosGoogleAgenda() {
  const caixa = document.getElementById('agGoogleCompromissos');
  if (!caixa) return;
  const seletor = `
    <select class="modal-select" style="max-width: 190px" onchange="agendaDiasCompromissos = parseInt(this.value, 10); carregarCompromissosGoogleAgenda();">
      ${[7, 14, 30].map(n => `<option value="${n}" ${n === agendaDiasCompromissos ? 'selected' : ''}>Próximos ${n} dias</option>`).join('')}
    </select>`;
  try {
    // "hoje" no horário de Brasília (a agenda do astrólogo é de lá)
    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    const r = await chamarApiGoogleConexao({ acao: 'eventos', de: hoje, ate: agendaSomarDiasISO(hoje, agendaDiasCompromissos - 1) });
    if (!r.ok) throw new Error(r.erro || 'erro');
    if (!r.conectado) {
      caixa.innerHTML = `<div class="titulo-secao">Meus compromissos</div>
        <div class="menu-vazio">Conecte a Google Agenda em <a href="#" onclick="abrirConfiguracoes('agenda'); return false;">Configurações → Agenda</a> para ver aqui os compromissos das suas agendas.</div>`;
      return;
    }
    const porDia = new Map();
    r.eventos.forEach(ev => { if (!porDia.has(ev.data)) porDia.set(ev.data, []); porDia.get(ev.data).push(ev); });
    const dias = Array.from(porDia.keys()).sort();
    const corpo = dias.length ? dias.map(dia => {
      const d = new Date(dia + 'T12:00:00Z');
      const titulo = `${AGENDA_SEMANA_CURTA[d.getUTCDay()]}, ${agendaFormatarDataBR(dia).slice(0, 5)}${dia === hoje ? ' — hoje' : ''}`;
      return `<div class="ag-dia"><div class="ag-dia-titulo">${escapeHtml(titulo)}</div>` + porDia.get(dia).map(ev => `
        <div class="ag-item">
          <div class="ag-item-corpo">
            <div class="ag-item-nome" style="white-space: normal">${escapeHtml(ev.titulo)}</div>
            <div class="ag-item-det">${ev.diaInteiro ? 'Dia inteiro' : escapeHtml(ev.hora_inicio + (ev.hora_fim ? ' – ' + ev.hora_fim : ''))}${ev.calendario ? ' · ' + escapeHtml(ev.calendario) : ''}${ev.local ? ' · ' + escapeHtml(ev.local) : ''}</div>
            ${agendaContatoDoCompromisso(ev)}
          </div>
        </div>`).join('') + '</div>';
    }).join('') : '<div class="menu-vazio">Nenhum compromisso nesse período.</div>';
    caixa.innerHTML = `<div class="cabeca-ferramenta" style="justify-content: space-between"><div class="titulo-secao" style="margin:0">Meus compromissos</div>${seletor}</div><hr class="divisa">${corpo}`;
  } catch (e) {
    console.error('Agenda: compromissos do Google:', e);
    caixa.innerHTML = `<div class="titulo-secao">Meus compromissos</div><div class="menu-vazio">Não foi possível carregar os compromissos agora. Recarregue em instantes.</div>`;
  }
}

/* Duração do horário: a do serviço escolhido (Configurações → Serviços), ou a duração padrão da agenda se o serviço não tem */
function agendaDuracaoDoServicoEscolhido() {
  const sel = document.getElementById('agNovoServico');
  const sv = sel ? agendaServicosCache.find(x => String(x.id) === String(sel.value)) : null;
  return (sv && Number(sv.duracao_minutos) > 0) ? Number(sv.duracao_minutos) : agendaConfigCache.duracao;
}

/* RECALCULA OS HORÁRIOS LIVRES PRA DATA ESCOLHIDA NO FORM DE NOVO AGENDAMENTO */
async function atualizarHorariosDisponiveisAgenda() {
  const dataStr = document.getElementById('agNovaData').value;
  const selectHorario = document.getElementById('agNovoHorario');
  if (!selectHorario) return;

  if (!dataStr) { selectHorario.innerHTML = '<option value="">Escolha uma data</option>'; return; }
  selectHorario.innerHTML = '<option value="">Carregando...</option>';

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: agendamentosDoDia, error } = await supabaseClient
      .from('agendamentos')
      .select('hora_inicio, hora_fim')
      .eq('user_id', user.id)
      .eq('data', dataStr);

    if (error) { selectHorario.innerHTML = '<option value="">Erro ao calcular horários</option>'; return; }

    const horarios = agendaGerarHorariosDisponiveis(dataStr, agendaDisponibilidadeCache, agendamentosDoDia || [], agendaDuracaoDoServicoEscolhido(), agendaConfigCache.intervalo);

    selectHorario.innerHTML = horarios.length
      ? horarios.map(h => `<option value="${h}">${h}</option>`).join('')
      : '<option value="">Nenhum horário livre nesse dia</option>';
  } catch (e) {
    selectHorario.innerHTML = '<option value="">Erro ao calcular horários</option>';
  }
}

/* CRIA O AGENDAMENTO ESCOLHIDO NO FORMULÁRIO */
async function confirmarNovoAgendamento() {
  const clienteSelect = document.getElementById('agNovoCliente');
  const servicoSelect = document.getElementById('agNovoServico');
  const data = document.getElementById('agNovaData').value;
  const horaInicio = document.getElementById('agNovoHorario').value;

  if (!clienteSelect.value) { alert("Selecione o cliente."); return; }
  if (!servicoSelect.value) { alert("Selecione o serviço."); return; }
  if (!data) { alert("Selecione a data."); return; }
  if (!horaInicio) { alert("Selecione um horário disponível."); return; }

  const horaFim = agendaSomarMinutosAoHorario(horaInicio, agendaDuracaoDoServicoEscolhido());
  const opcaoCliente = clienteSelect.options[clienteSelect.selectedIndex];
  const clienteNome = opcaoCliente.dataset.nome || opcaoCliente.text;
  const servicoNome = servicoSelect.options[servicoSelect.selectedIndex].text;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient.from('agendamentos').insert({
      user_id: user.id,
      mapa_id: clienteSelect.value,
      cliente_nome: clienteNome,
      servico_id: servicoSelect.value,
      servico_nome: servicoNome,
      data: data,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      status: 'confirmado'
    });

    if (!error) {
      await iniciarModuloAgenda();
    } else {
      alert("Erro ao criar agendamento: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao criar agendamento.");
  }
}

/* CANCELA (APAGA, COM CONFIRMAÇÃO) UM AGENDAMENTO JÁ MARCADO */
async function apagarAgendamento(id, rotulo) {
  if (!await astroConfirm(`Cancelar o agendamento "${rotulo}"? Essa ação não pode ser desfeita.`)) return;

  try {
    const { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
    if (!error) {
      await iniciarModuloAgenda();
    } else {
      alert("Erro ao cancelar agendamento: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao cancelar agendamento.");
  }
}

/* ==========================================
   HELPERS DE DATA/HORA (sem depender de nenhuma lib nova)
   ========================================== */

function agendaFormatarDataBR(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function agendaSomarMinutosAoHorario(horaHHMM, minutos) {
  const [h, m] = horaHHMM.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/* Gera os horários de início possíveis num dia, a partir das regras de
   disponibilidade daquele dia da semana, cortando os que colidem com
   agendamentos que já existem nesse dia. */
function agendaGerarHorariosDisponiveis(dataISO, regrasDisponibilidade, agendamentosDoDia, duracaoMin, intervaloMin) {
  const diaSemana = new Date(dataISO + 'T00:00:00').getDay();
  const regrasDoDia = (regrasDisponibilidade || []).filter(r => r.dia_semana === diaSemana);
  const ocupados = (agendamentosDoDia || []).map(a => [a.hora_inicio.slice(0, 5), a.hora_fim.slice(0, 5)]);
  const horarios = [];

  regrasDoDia.forEach(regra => {
    const [hI, mI] = regra.hora_inicio.slice(0, 5).split(':').map(Number);
    const [hF, mF] = regra.hora_fim.slice(0, 5).split(':').map(Number);
    let minutoAtual = hI * 60 + mI;
    const minutoFim = hF * 60 + mF;

    while (minutoAtual + duracaoMin <= minutoFim) {
      const inicioSlot = `${String(Math.floor(minutoAtual / 60)).padStart(2, '0')}:${String(minutoAtual % 60).padStart(2, '0')}`;
      const fimSlot = agendaSomarMinutosAoHorario(inicioSlot, duracaoMin);
      const sobrepoe = ocupados.some(([oi, of_]) => inicioSlot < of_ && oi < fimSlot);
      if (!sobrepoe) horarios.push(inicioSlot);
      minutoAtual += duracaoMin + intervaloMin;
    }
  });

  return horarios;
}

/* ==========================================
   SQL DE CONFIGURAÇÃO (rodar uma vez no SQL Editor do Supabase — este
   arquivo só documenta, não executa nada sozinho):

   alter table configuracoes
     add column if not exists agenda_duracao_padrao_minutos integer,
     add column if not exists agenda_intervalo_minutos integer,
     add column if not exists agenda_pastas_visiveis jsonb;

   create table agenda_disponibilidade (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) not null,
     dia_semana smallint not null, -- 0=domingo ... 6=sábado
     hora_inicio time not null,
     hora_fim time not null,
     created_at timestamptz default now()
   );
   alter table agenda_disponibilidade enable row level security;
   create policy "Usuário gerencia sua própria disponibilidade"
     on agenda_disponibilidade for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);

   create table agendamentos (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) not null,
     mapa_id text, -- id de "mapas" (não é uuid nesse projeto, por isso text)
     cliente_nome text,
     servico_id text, -- id de "relatorio_presets" (idem)
     servico_nome text,
     data date not null,
     hora_inicio time not null,
     hora_fim time not null,
     status text not null default 'confirmado',
     observacoes text,
     created_at timestamptz default now()
   );
   alter table agendamentos enable row level security;
   create policy "Usuário gerencia seus próprios agendamentos"
     on agendamentos for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ========================================== */
