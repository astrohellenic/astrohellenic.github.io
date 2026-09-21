/* ==========================================
   MÓDULO DE AGENDA (ETAPA 1 — SEM GOOGLE AGENDA AINDA)
   Ferramenta de uso do dia a dia: marcar um agendamento novo (cliente já
   cadastrado + serviço + data/hora, com os horários livres calculados
   sozinho) e ver os já marcados. Ainda não fala com a Google Agenda —
   isso é a próxima etapa, depois que a integração com o Google estiver
   configurada.

   O que é "configura uma vez e não mexe mais" (disponibilidade — dias/
   horários que atende — e quais pastas de clientes entram no seletor)
   NÃO fica aqui, fica em Configurações → Agenda (telas e funções de
   salvar em supabase.js: abrirConfiguracoesAgenda, carregarConfiguracoesAgenda,
   salvarDisponibilidadeAgenda, salvarPastasVisiveisAgenda). Este arquivo
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
let agendaServicosCache = [];
let agendaConfigCache = { duracao: 60, intervalo: 0, pastasVisiveis: null };

/* PONTO DE ENTRADA DO MÓDULO — chamado por abrirModuloTecnica('agenda') (supabase.js) */
async function iniciarModuloAgenda() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: var(--gold-primary);"></i>
    </div>
  `;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { renderAgendaSetup(container, { semSessao: true }); return; }

    const hojeISO = new Date().toISOString().slice(0, 10);

    const [dispRes, agsRes, mapasRes, servicosRes, configRes] = await Promise.all([
      supabaseClient.from('agenda_disponibilidade').select('*').eq('user_id', user.id).order('dia_semana', { ascending: true }),
      supabaseClient.from('agendamentos').select('*').eq('user_id', user.id).gte('data', hojeISO).order('data', { ascending: true }).order('hora_inicio', { ascending: true }),
      supabaseClient.from('mapas').select('id, nome, codigo, pasta, cidade, tipo'),
      supabaseClient.from('relatorio_presets').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true }),
      supabaseClient.from('configuracoes').select('agenda_duracao_padrao_minutos, agenda_intervalo_minutos, agenda_pastas_visiveis').eq('user_id', user.id).maybeSingle()
    ]);

    // As duas tabelas novas são essenciais — sem elas não tem como mostrar
    // nada de verdade. mapas/relatorio_presets/configuracoes já existem
    // faz tempo, então erro neles é tratado como caso raro (cai pro
    // padrão), não trava a tela inteira.
    if (dispRes.error || agsRes.error) {
      renderAgendaSetup(container, { tabelasIndisponiveis: true });
      return;
    }

    agendaDisponibilidadeCache = dispRes.data || [];
    agendaAgendamentosCache = agsRes.data || [];
    const todosOsMapas = (!mapasRes.error && mapasRes.data) ? mapasRes.data : [];
    agendaServicosCache = (!servicosRes.error && servicosRes.data) ? servicosRes.data : [];

    // pastasVisiveis null = ainda não configurado -> mostra todas as pastas
    // (comportamento de antes, pra não sumir cliente sem o astrólogo pedir).
    const pastasVisiveis = (!configRes.error && configRes.data && Array.isArray(configRes.data.agenda_pastas_visiveis))
      ? configRes.data.agenda_pastas_visiveis
      : null;

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
    renderAgendaSetup(container, { tabelasIndisponiveis: true });
  }
}

/* MONTA A TELA INTEIRA (disponibilidade + novo agendamento + lista) */
function renderAgendaSetup(container, ctx) {
  if (ctx.semSessao) {
    container.innerHTML = `<div style="padding: 40px; text-align: center; font-size: 12px; color: var(--text-muted);">Sessão não identificada.</div>`;
    return;
  }

  if (ctx.tabelasIndisponiveis) {
    container.innerHTML = `
      <div style="max-width: 480px; margin: 40px auto; background: var(--bg-main); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 24px; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0 0 10px 0; text-transform: uppercase;">Agenda</h2>
        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0;">
          As tabelas de agenda ainda não existem no Supabase deste projeto. Rode o SQL de configuração (o astrólogo já recebeu esse script) e recarregue a página.
        </p>
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
    ? `<div style="font-size: 11px; color: var(--badge-text); background: var(--badge-bg); border: 1px solid var(--badge-border); border-radius: 8px; padding: 8px 10px; margin-bottom: 12px; line-height: 1.4;">
        Você ainda não configurou sua disponibilidade — vá em <strong>Configurações → Agenda</strong> pra escolher os dias/horários que atende antes de marcar um agendamento.
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
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card);">
        <div style="min-width: 0;">
          <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(a.cliente_nome || 'Cliente')}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${servicoDataHora}</div>
        </div>
        <i class="fa-solid fa-trash" onclick="apagarAgendamento('${a.id}', '${rotuloCancelar}')" title="Cancelar agendamento" style="color: var(--danger); cursor: pointer; margin-left: 8px; flex-shrink: 0;"></i>
      </div>
    `;
      }).join('')
    : `<div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">Nenhum agendamento futuro ainda.</div>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">

      <div style="background: var(--bg-main); padding: 16px 20px; border-radius: 14px; border: 1.5px solid var(--gold-primary); margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0; text-transform: uppercase;">Agenda</h2>
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">
          Ainda sem sincronizar com a Google Agenda — por enquanto, tudo fica só aqui dentro.
        </div>
      </div>

      <div style="max-width: 480px; margin: 0 auto 20px auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px;">Novo Agendamento</div>

        ${avisoSemDisponibilidade}

        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Cliente</label>
        <select id="agNovoCliente" class="modal-select" style="margin-bottom: 10px;">${opcoesClientes}</select>

        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Serviço</label>
        <select id="agNovoServico" class="modal-select" style="margin-bottom: 10px;">${opcoesServicos}</select>

        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Data</label>
        <input type="date" id="agNovaData" class="modal-input" min="${hojeISO}" style="margin-bottom: 10px;" onchange="atualizarHorariosDisponiveisAgenda()">

        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Horário</label>
        <select id="agNovoHorario" class="modal-select" style="margin-bottom: 14px;"><option value="">Escolha uma data</option></select>

        <button onclick="confirmarNovoAgendamento()" style="width: 100%; background: #103b70; color: #fffdf5; border: 1px solid #c59b27; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Agendar
        </button>
      </div>

      <div style="max-width: 480px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px;">Próximos Agendamentos</div>
        ${listaAgendamentosHTML}
      </div>

    </div>
  `;
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

    const horarios = agendaGerarHorariosDisponiveis(dataStr, agendaDisponibilidadeCache, agendamentosDoDia || [], agendaConfigCache.duracao, agendaConfigCache.intervalo);

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

  const horaFim = agendaSomarMinutosAoHorario(horaInicio, agendaConfigCache.duracao);
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
  if (!confirm(`Cancelar o agendamento "${rotulo}"? Essa ação não pode ser desfeita.`)) return;

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
