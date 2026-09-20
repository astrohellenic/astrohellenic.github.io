/* ==========================================
   MÓDULO DE AGENDA (ETAPA 1 — SEM GOOGLE AGENDA AINDA)
   Deixa o astrólogo configurar os dias/horários em que atende e marcar
   agendamentos internos (cliente já cadastrado + serviço + data/hora),
   calculando sozinho quais horários estão livres naquele dia. Ainda não
   fala com a Google Agenda — isso é a próxima etapa, depois que a
   integração com o Google estiver configurada. Por enquanto, tudo fica
   só no Supabase, em tabelas novas:

     agenda_disponibilidade — regras recorrentes por dia da semana
     agendamentos           — os agendamentos em si

   E 2 colunas novas na tabela "configuracoes" já existente:
     agenda_duracao_padrao_minutos, agenda_intervalo_minutos

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
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37;"></i>
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
      servicos: agendaServicosCache,
      duracaoPadrao: agendaConfigCache.duracao,
      intervaloPadrao: agendaConfigCache.intervalo,
      pastasVisiveis: pastasVisiveis
    });
  } catch (e) {
    console.error('Erro ao carregar a agenda:', e);
    renderAgendaSetup(container, { tabelasIndisponiveis: true });
  }
}

/* MONTA A TELA INTEIRA (disponibilidade + novo agendamento + lista) */
function renderAgendaSetup(container, ctx) {
  if (ctx.semSessao) {
    container.innerHTML = `<div style="padding: 40px; text-align: center; font-size: 12px; color: #64748b;">Sessão não identificada.</div>`;
    return;
  }

  if (ctx.tabelasIndisponiveis) {
    container.innerHTML = `
      <div style="max-width: 480px; margin: 40px auto; background: #fffdf5; border: 1.5px solid #d4af37; border-radius: 14px; padding: 24px; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0 0 10px 0; text-transform: uppercase;">Agenda</h2>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
          As tabelas de agenda ainda não existem no Supabase deste projeto. Rode o SQL de configuração (o astrólogo já recebeu esse script) e recarregue a página.
        </p>
      </div>
    `;
    return;
  }

  const { disponibilidade, agendamentos, mapas, servicos, duracaoPadrao, intervaloPadrao } = ctx;
  const hojeISO = new Date().toISOString().slice(0, 10);

  const blocoDias = AGENDA_DIAS_SEMANA.map((nomeDia, idx) => {
    const regra = disponibilidade.find(r => r.dia_semana === idx);
    return `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <input type="checkbox" id="agDia${idx}" ${regra ? 'checked' : ''} onchange="document.getElementById('agHoraBloco${idx}').style.display = this.checked ? 'flex' : 'none';">
        <label for="agDia${idx}" style="font-size: 12px; font-weight: 600; color: #103b70; width: 66px; flex-shrink: 0;">${nomeDia}</label>
        <div id="agHoraBloco${idx}" style="display: ${regra ? 'flex' : 'none'}; gap: 6px; align-items: center;">
          <input type="time" id="agInicio${idx}" class="modal-input" style="width: 100px;" value="${regra ? regra.hora_inicio.slice(0, 5) : '09:00'}">
          <span style="font-size: 11px; color: #64748b;">até</span>
          <input type="time" id="agFim${idx}" class="modal-input" style="width: 100px;" value="${regra ? regra.hora_fim.slice(0, 5) : '18:00'}">
        </div>
      </div>
    `;
  }).join('');

  const opcoesClientes = mapas.length
    ? mapas.map(m => {
        const rotulo = m.codigo ? `${m.codigo} - ${m.nome}` : m.nome;
        return `<option value="${m.id}" data-nome="${escapeHtml(m.nome)}">${escapeHtml(rotulo)}</option>`;
      }).join('')
    : '<option value="">Nenhum cliente nas pastas visíveis</option>';

  const pastasParaExibir = (typeof customFolders !== 'undefined' && Array.isArray(customFolders)) ? customFolders : [];
  const blocoPastas = pastasParaExibir.length
    ? pastasParaExibir.map(pasta => {
        const marcada = !ctx.pastasVisiveis || ctx.pastasVisiveis.includes(pasta);
        return `
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; color: #103b70; cursor: pointer;">
            <input type="checkbox" class="agPastaCheckbox" value="${escapeHtml(pasta)}" ${marcada ? 'checked' : ''}>
            ${escapeHtml(pasta)}
          </label>
        `;
      }).join('')
    : '<div style="font-size: 11px; color: #64748b;">Nenhuma pasta encontrada.</div>';

  const opcoesServicos = servicos.length
    ? servicos.map(s => `<option value="${s.id}">${escapeHtml(s.nome)}</option>`).join('')
    : '<option value="">Nenhum serviço cadastrado ainda</option>';

  const listaAgendamentosHTML = agendamentos.length
    ? agendamentos.map(a => {
        const servicoDataHora = `${escapeHtml(a.servico_nome || 'Serviço')} — ${agendaFormatarDataBR(a.data)} às ${a.hora_inicio.slice(0, 5)}`;
        const rotuloCancelar = escapeHtml((a.cliente_nome || 'Cliente') + ' — ' + (a.servico_nome || 'Serviço') + ' — ' + agendaFormatarDataBR(a.data) + ' ' + a.hora_inicio.slice(0, 5)).replace(/'/g, "\\'");
        return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 8px; border: 1px solid #e2d9c2; border-radius: 8px; background: #ffffff;">
        <div style="min-width: 0;">
          <div style="font-size: 12px; font-weight: 700; color: #103b70; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(a.cliente_nome || 'Cliente')}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${servicoDataHora}</div>
        </div>
        <i class="fa-solid fa-trash" onclick="apagarAgendamento('${a.id}', '${rotuloCancelar}')" title="Cancelar agendamento" style="color: #dc2626; cursor: pointer; margin-left: 8px; flex-shrink: 0;"></i>
      </div>
    `;
      }).join('')
    : `<div style="font-size: 11px; color: #64748b; padding: 8px 0;">Nenhum agendamento futuro ainda.</div>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">

      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">Agenda</h2>
        <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          Ainda sem sincronizar com a Google Agenda — por enquanto, tudo fica só aqui dentro.
        </div>
      </div>

      <div style="max-width: 480px; margin: 0 auto 20px auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px;">Sua Disponibilidade</div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 14px; line-height: 1.4;">
          Marque os dias que você atende e o horário de cada um.
        </div>

        ${blocoDias}

        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <div style="flex: 1;">
            <label style="font-size: 11px; font-weight: 600; color: #64748b;">Duração de cada atendimento (min)</label>
            <input type="number" id="agDuracaoPadrao" class="modal-input" min="5" step="5" value="${duracaoPadrao}">
          </div>
          <div style="flex: 1;">
            <label style="font-size: 11px; font-weight: 600; color: #64748b;">Intervalo entre atendimentos (min)</label>
            <input type="number" id="agIntervaloPadrao" class="modal-input" min="0" step="5" value="${intervaloPadrao}">
          </div>
        </div>

        <button onclick="salvarDisponibilidadeAgenda()" style="width: 100%; margin-top: 14px; background: #103b70; color: #fffdf5; border: 1px solid #c59b27; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Salvar Disponibilidade
        </button>
      </div>

      <div style="max-width: 480px; margin: 0 auto 20px auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px;">Pastas Visíveis no Agendamento</div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 12px; line-height: 1.4;">
          Marque só as pastas que têm clientes de verdade — desmarque as que usa pra teste, perguntas etc. Sem marcar nada, mostra clientes de todas as pastas.
        </div>
        ${blocoPastas}
        <button onclick="salvarPastasVisiveisAgenda()" style="width: 100%; margin-top: 8px; background: #103b70; color: #fffdf5; border: 1px solid #c59b27; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Salvar Pastas Visíveis
        </button>
      </div>

      <div style="max-width: 480px; margin: 0 auto 20px auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px;">Novo Agendamento</div>

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Cliente</label>
        <select id="agNovoCliente" class="modal-select" style="margin-bottom: 10px;">${opcoesClientes}</select>

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Serviço</label>
        <select id="agNovoServico" class="modal-select" style="margin-bottom: 10px;">${opcoesServicos}</select>

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Data</label>
        <input type="date" id="agNovaData" class="modal-input" min="${hojeISO}" style="margin-bottom: 10px;" onchange="atualizarHorariosDisponiveisAgenda()">

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Horário</label>
        <select id="agNovoHorario" class="modal-select" style="margin-bottom: 14px;"><option value="">Escolha uma data</option></select>

        <button onclick="confirmarNovoAgendamento()" style="width: 100%; background: #103b70; color: #fffdf5; border: 1px solid #c59b27; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Agendar
        </button>
      </div>

      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px;">Próximos Agendamentos</div>
        ${listaAgendamentosHTML}
      </div>

    </div>
  `;
}

/* SALVA A DISPONIBILIDADE (substitui todas as regras do usuário pelas
   marcadas agora) + a duração/intervalo padrão (na tabela configuracoes) */
async function salvarDisponibilidadeAgenda() {
  const novasRegras = [];
  for (let dia = 0; dia <= 6; dia++) {
    const checkbox = document.getElementById(`agDia${dia}`);
    if (!checkbox || !checkbox.checked) continue;
    const inicio = document.getElementById(`agInicio${dia}`).value;
    const fim = document.getElementById(`agFim${dia}`).value;
    if (!inicio || !fim) continue;
    if (inicio >= fim) { alert(`No dia ${AGENDA_DIAS_SEMANA[dia]}, o horário final precisa ser depois do inicial.`); return; }
    novasRegras.push({ dia_semana: dia, hora_inicio: inicio, hora_fim: fim });
  }

  const duracaoPadrao = parseInt(document.getElementById('agDuracaoPadrao').value, 10) || 60;
  const intervaloPadrao = parseInt(document.getElementById('agIntervaloPadrao').value, 10) || 0;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error: erroDelete } = await supabaseClient.from('agenda_disponibilidade').delete().eq('user_id', user.id);
    if (erroDelete) { alert("Erro ao salvar disponibilidade: " + erroDelete.message); return; }

    if (novasRegras.length) {
      const { error: erroInsert } = await supabaseClient
        .from('agenda_disponibilidade')
        .insert(novasRegras.map(r => ({ ...r, user_id: user.id })));
      if (erroInsert) { alert("Erro ao salvar disponibilidade: " + erroInsert.message); return; }
    }

    const { error: erroConfig } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, agenda_duracao_padrao_minutos: duracaoPadrao, agenda_intervalo_minutos: intervaloPadrao }, { onConflict: 'user_id' });
    if (erroConfig) { alert("Erro ao salvar duração/intervalo: " + erroConfig.message); return; }

    await iniciarModuloAgenda();
  } catch (e) {
    alert("Erro de conexão ao salvar disponibilidade.");
  }
}

/* SALVA QUAIS PASTAS ENTRAM NO SELETOR DE CLIENTE DO NOVO AGENDAMENTO.
   Antes de salvar pela primeira vez (coluna ainda null), mostra clientes
   de TODAS as pastas — ver o "null = todas" em iniciarModuloAgenda. Depois
   de salvar, vale exatamente o que ficou marcado (inclusive nenhuma, se
   for esse o caso). */
async function salvarPastasVisiveisAgenda() {
  const marcadas = Array.from(document.querySelectorAll('.agPastaCheckbox:checked')).map(c => c.value);

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, agenda_pastas_visiveis: marcadas }, { onConflict: 'user_id' });

    if (error) { alert("Erro ao salvar pastas visíveis: " + error.message); return; }

    await iniciarModuloAgenda();
  } catch (e) {
    alert("Erro de conexão ao salvar pastas visíveis.");
  }
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
