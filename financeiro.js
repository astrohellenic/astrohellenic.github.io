/* ==========================================
   MÓDULO FINANCEIRO (ENTRADAS) — ETAPA 1
   O que o astrólogo RECEBEU, mês a mês (só entradas — despesas ficam de fora).
   Cada entrada tem UMA data só: a que o astrólogo informa (ou, no futuro, a que o webhook
   do meio de pagamento entregar). Nenhum cálculo de "dia útil" — cada profissional tem o
   seu plano de recebimento.

   Tudo fica no Supabase, em 2 tabelas novas (SQL no fim deste arquivo):
     areas    — Astrologia, Psicanálise, Cartomância… (cadastradas pelo próprio astrólogo)
     entradas — cada recebimento

   Colunas origem / status / id_externo já existem de olho no webhook (etapa futura):
   hoje tudo nasce 'manual' / 'confirmada'.

   Se as tabelas não existirem no Supabase, a tela mostra um aviso em vez de quebrar.
   ========================================== */

const FIN_FORMAS_PAGAMENTO = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Transferência', 'Outro'];
const FIN_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

let finAreasCache = [];
let finEntradasCache = [];
let finMapasCache = [];
let finServicosCache = [];
let finPastasClientes = ['Clientes']; // pastas cujos mapas aparecem na busca de cliente (configuracoes.financeiro_pastas_clientes)
let finMapaPorId = {}; // TODOS os mapas por id, pra mostrar o código do cliente mesmo se a pasta dele não está na busca
let finClienteEscolhido = null; // cliente tocado na busca da janela de entrada ({id, nome, codigo})
let finMes = null; // { ano, mes } — mes de 0 a 11

/* data de hoje no fuso do aparelho (toISOString() devolveria o dia seguinte à noite no Brasil) */
function finHojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function finFormatarMoeda(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function finFormatarDataBR(iso) {
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${a.slice(2)}`;
}

/* "275", "275,50", "1.275,50", "R$ 275,00" -> número (ou null se inválido) */
function finLerValor(txt) {
  let s = String(txt || '').replace(/[R$\s]/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

function finIntervaloDoMes() {
  const { ano, mes } = finMes;
  const ini = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  const prox = mes === 11 ? { a: ano + 1, m: 1 } : { a: ano, m: mes + 2 };
  const fim = `${prox.a}-${String(prox.m).padStart(2, '0')}-01`;
  return { ini, fim };
}

/* Serviços de uma entrada: um pagamento pode ter vários (combo). Entradas antigas, sem "itens", valem como um serviço só. */
function finItensDaEntrada(e) {
  if (Array.isArray(e.itens) && e.itens.length) return e.itens;
  return [{ produto: e.produto || '', area_id: e.area_id || null, valor: Number(e.valor || 0) }];
}

/* "0150 - Nome" quando a entrada está ligada a um cliente cadastrado (o código é da organização do astrólogo); senão só o nome gravado */
function finNomeClienteEntrada(e) {
  const m = e.mapa_id && finMapaPorId[String(e.mapa_id)];
  return m ? finRotuloCliente(m) : e.cliente_nome;
}

/* PONTO DE ENTRADA DO MÓDULO — chamado por abrirModuloTecnica('financeiro') (supabase.js) */
async function iniciarModuloFinanceiro() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (!finMes) {
    const h = finHojeISO().split('-');
    finMes = { ano: Number(h[0]), mes: Number(h[1]) - 1 };
  }

  container.innerHTML = `
    <div data-spinner-troca style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: var(--gold-primary);"></i>
    </div>
  `;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { renderFinanceiro(container, { semSessao: true }); return; }

    const { ini, fim } = finIntervaloDoMes();
    const [areasRes, entradasRes, mapasRes, servicosRes, configRes] = await Promise.all([
      supabaseClient.from('areas').select('*').eq('user_id', user.id).order('ordem', { ascending: true }).order('nome', { ascending: true }),
      supabaseClient.from('entradas').select('*').eq('user_id', user.id).gte('data', ini).lt('data', fim).order('data', { ascending: true }).order('created_at', { ascending: true }),
      supabaseClient.from('mapas').select('id, nome, codigo, pasta'),
      supabaseClient.from('relatorio_presets').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true }),
      supabaseClient.from('configuracoes').select('financeiro_pastas_clientes').eq('user_id', user.id).maybeSingle()
    ]);

    if (areasRes.error || entradasRes.error) { renderFinanceiro(container, { tabelasIndisponiveis: true }); return; }

    finAreasCache = areasRes.data || [];
    finEntradasCache = entradasRes.data || [];
    // Só a pasta "Clientes" por padrão (as outras guardam mapas de pergunta, de conhecidos etc.);
    // o astrólogo escolhe outras pastas no botão "Pastas".
    finPastasClientes = (!configRes.error && configRes.data && Array.isArray(configRes.data.financeiro_pastas_clientes))
      ? configRes.data.financeiro_pastas_clientes
      : ['Clientes'];
    const todosMapas = (!mapasRes.error && mapasRes.data) ? mapasRes.data : [];
    finMapaPorId = {};
    todosMapas.forEach(m => { finMapaPorId[String(m.id)] = m; });
    finMapasCache = todosMapas
      .filter(m => finPastasClientes.includes(m.pasta))
      .sort((a, b) => finRotuloCliente(a).localeCompare(finRotuloCliente(b), 'pt-BR', { numeric: true }));
    finServicosCache = (!servicosRes.error && servicosRes.data) ? servicosRes.data : [];

    renderFinanceiro(container, {});
  } catch (e) {
    console.error('Erro ao carregar o financeiro:', e);
    renderFinanceiro(container, { tabelasIndisponiveis: true });
  }
}

function finRotuloCliente(m) {
  return m.codigo ? `${m.codigo} - ${m.nome}` : m.nome;
}

function renderFinanceiro(container, ctx) {
  if (ctx.semSessao) {
    container.innerHTML = `<div style="padding: 40px; text-align: center; font-size: 12px; color: var(--text-muted);">Sessão não identificada.</div>`;
    return;
  }
  if (ctx.tabelasIndisponiveis) {
    container.innerHTML = `
      <div style="max-width: 480px; margin: 40px auto; background: var(--bg-main); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 24px; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0 0 10px 0; text-transform: uppercase;">Financeiro</h2>
        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0;">
          Não foi possível carregar o Financeiro (as tabelas "areas" e "entradas" não responderam). Recarregue a página; se continuar, avise o suporte.
        </p>
      </div>`;
    return;
  }

  const total = finEntradasCache.reduce((s, e) => s + Number(e.valor || 0), 0);
  const areaPorId = {};
  finAreasCache.forEach(a => { areaPorId[a.id] = a; });

  // subtotais por área (inclui "Sem área" só se houver)
  const subtotais = {};
  finEntradasCache.forEach(e => {
    finItensDaEntrada(e).forEach(it => {
      const chave = it.area_id && areaPorId[it.area_id] ? it.area_id : '_sem';
      subtotais[chave] = (subtotais[chave] || 0) + Number(it.valor || 0);
    });
  });
  const linhasSubtotais = Object.keys(subtotais).map(k => {
    const nome = k === '_sem' ? 'Sem área' : areaPorId[k].nome;
    const pct = total > 0 ? Math.round((subtotais[k] / total) * 100) : 0;
    return `<div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px; padding: 3px 0;">
      <span style="color: var(--text-dark);">${escapeHtml(nome)} <span style="color: var(--text-muted);">(${pct}%)</span></span>
      <strong style="color: var(--primary-blue);">${finFormatarMoeda(subtotais[k])}</strong>
    </div>`;
  }).join('');

  const linhas = finEntradasCache.length
    ? finEntradasCache.map(e => {
        const area = [...new Set(finItensDaEntrada(e).map(it => it.area_id && areaPorId[it.area_id] ? areaPorId[it.area_id].nome : '').filter(Boolean))].join(' + ');
        const detalhe = [e.produto, e.observacao].filter(Boolean).join(' — ');
        return `
        <div onclick="abrirFormEntradaFin('${e.id}')" style="display: grid; grid-template-columns: 62px 1fr auto; gap: 10px; align-items: center; padding: 10px 4px; border-bottom: 1px solid var(--border-color); cursor: pointer;">
          <div style="font-size: 12px; color: var(--text-muted);">${finFormatarDataBR(e.data)}</div>
          <div style="min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(finNomeClienteEntrada(e) || 'Sem cliente')}</div>
            <div style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml([area, detalhe, e.forma_pagamento].filter(Boolean).join(' · '))}</div>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-dark); white-space: nowrap;">${finFormatarMoeda(e.valor)}</div>
        </div>`;
      }).join('')
    : `<div style="font-size: 12px; color: var(--text-muted); padding: 16px 0; text-align: center;">Nenhuma entrada em ${FIN_MESES[finMes.mes]} de ${finMes.ano}.</div>`;

  const btn = 'background: var(--bg-card); border: 1px solid var(--gold-primary); color: var(--primary-blue); border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer;';

  container.innerHTML = `
    <div id="financeiro-container" style="width: 100%; min-height: 100%; padding: 20px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; background-color: var(--bg-main);">
      <div style="max-width: 640px; margin: 0 auto;">

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px;">
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0; text-transform: uppercase;">Entradas</h2>
          <div style="display: flex; gap: 8px;">
            <button onclick="abrirPastasFin()" style="${btn}">Pastas</button>
            <button onclick="abrirAreasFin()" style="${btn}">Áreas</button>
            <button class="fin-btn-nova" onclick="abrirFormEntradaFin()" style="${btn}">+ Entrada</button>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <button onclick="navegarMesFin(-1)" style="${btn}" title="Mês anterior"><i class="fa-solid fa-chevron-left"></i></button>
          <div style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: var(--primary-blue); text-transform: uppercase;">${FIN_MESES[finMes.mes]} ${finMes.ano}</div>
          <button onclick="navegarMesFin(1)" style="${btn}" title="Próximo mês"><i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div style="border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; background: var(--bg-card);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em;">Total do mês</div>
          <div class="fin-total" style="font-size: 26px; font-weight: 800; color: var(--primary-blue); margin: 2px 0 8px 0;">${finFormatarMoeda(total)}</div>
          ${linhasSubtotais}
        </div>

        <div style="border: 1px solid var(--border-color); border-radius: 12px; padding: 4px 12px; background: var(--bg-card);">
          ${linhas}
        </div>

      </div>
    </div>
  `;
}

function navegarMesFin(delta) {
  let { ano, mes } = finMes;
  mes += delta;
  if (mes < 0) { mes = 11; ano--; }
  if (mes > 11) { mes = 0; ano++; }
  finMes = { ano, mes };
  iniciarModuloFinanceiro();
}

/* ---------- janela de nova entrada / edição ---------- */

function fecharModalFin() {
  const o = document.getElementById('finModalOverlay');
  if (o) o.remove();
}

function abrirFormEntradaFin(id) {
  const e = id ? finEntradasCache.find(x => x.id === id) : null;
  if (id && !e) return;

  const opcoesForma = '<option value="">—</option>' +
    FIN_FORMAS_PAGAMENTO.map(f => `<option ${e && e.forma_pagamento === f ? 'selected' : ''}>${f}</option>`).join('');
  // cliente já gravado: se ainda está nas pastas da busca mostra "código - nome"; senão (outra pasta, ou nome digitado) mantém o nome
  finClienteEscolhido = null;
  let clienteInicial = '';
  if (e && e.cliente_nome) {
    const m = e.mapa_id && finMapaPorId[String(e.mapa_id)];
    if (m) { finClienteEscolhido = m; clienteInicial = finRotuloCliente(m); }
    else { if (e.mapa_id) finClienteEscolhido = { id: e.mapa_id, nome: e.cliente_nome, codigo: null }; clienteInicial = e.cliente_nome; }
  }
  const lbl = 'font-size: 11px; font-weight: 600; margin-top: 10px; display: block;';

  fecharModalFin();
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="modal-box" style="width: 420px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800;">${e ? 'Editar entrada' : 'Nova entrada'}</div>

      <label style="${lbl}">Data</label>
      <input type="date" id="finData" class="modal-input" value="${e ? e.data : finHojeISO()}" style="width: 100%; box-sizing: border-box; -webkit-appearance: none; appearance: none; min-height: 36px;">

      <label style="${lbl}">Cliente</label>
      <input type="text" id="finCliente" class="modal-input" placeholder="Digite o código ou o nome" value="${escapeHtml(clienteInicial)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <div id="finSugCliente" style="display: none;"></div>

      <label style="${lbl}">Serviços</label>
      <div id="finItens"></div>
      <button type="button" class="btn-secondary" id="finAddItem" style="margin-top: 8px;">+ Serviço (combo)</button>
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; font-size: 12px; font-weight: 700;">
        <span>Total do pagamento</span><span id="finTotalForm" style="font-size: 16px;">R$ 0,00</span>
      </div>

      <label style="${lbl}">Forma de pagamento</label>
      <select id="finForma" class="modal-select">${opcoesForma}</select>

      <label style="${lbl}">Observação</label>
      <input type="text" id="finObs" class="modal-input" value="${e ? escapeHtml(e.observacao || '') : ''}" autocomplete="off">

      <div class="modal-actions" style="margin-top: 16px;">
        ${e ? '<button type="button" class="btn-secondary" id="finApagar" style="margin-right: auto;">Apagar</button>' : ''}
        <button type="button" class="btn-secondary" id="finCancelar">Cancelar</button>
        <button type="button" class="btn-primary" id="finSalvar">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#finCancelar').onclick = fecharModalFin;
  overlay.querySelector('#finSalvar').onclick = () => salvarEntradaFin(id || null);
  if (e) overlay.querySelector('#finApagar').onclick = () => apagarEntradaFin(id);
  finLigarBusca(overlay.querySelector('#finCliente'), overlay.querySelector('#finSugCliente'),
    finMapasCache.map(m => ({ rotulo: finRotuloCliente(m), mapa: m })), item => { finClienteEscolhido = item ? item.mapa : null; }, false);
  (e ? finItensDaEntrada(e) : [{}]).forEach(it => finAdicionarLinhaServico(it));
  overlay.querySelector('#finAddItem').onclick = () => finAdicionarLinhaServico({}, true);
  if (!e) setTimeout(() => { try { overlay.querySelector('.finItValor').focus(); } catch (x) {} }, 30);
}

/* uma linha de serviço (produto + área + valor) dentro da janela da entrada */
function finAdicionarLinhaServico(it, focar) {
  const lista = document.getElementById('finItens');
  if (!lista) return;
  const opcoesArea = '<option value="">Sem área</option>' +
    finAreasCache.map(a => `<option value="${a.id}" ${it.area_id === a.id ? 'selected' : ''}>${escapeHtml(a.nome)}</option>`).join('');
  const linha = document.createElement('div');
  linha.className = 'finItem';
  linha.style.cssText = 'border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; margin-top: 6px;';
  linha.innerHTML = `
    <input type="text" class="modal-input finItProduto" placeholder="Serviço (ex.: Mapa Natal Clássico)" value="${escapeHtml(it.produto || '')}" autocomplete="off">
    <div class="finItSug" style="display: none;"></div>
    <div style="display: grid; grid-template-columns: 1fr 110px auto; gap: 6px; margin-top: 6px; align-items: center;">
      <select class="modal-select finItArea">${opcoesArea}</select>
      <input type="text" class="modal-input finItValor" inputmode="decimal" placeholder="275,00" value="${it.valor !== undefined && it.valor !== null ? String(it.valor).replace('.', ',') : ''}" autocomplete="off">
      <i class="fa-solid fa-xmark finItRemover" title="Tirar este serviço" style="cursor: pointer; padding: 6px; color: var(--danger);"></i>
    </div>`;
  lista.appendChild(linha);
  finLigarBusca(linha.querySelector('.finItProduto'), linha.querySelector('.finItSug'),
    finServicosCache.map(s => ({ rotulo: s.nome })), () => {}, true);
  linha.querySelector('.finItValor').addEventListener('input', finAtualizarTotalForm);
  linha.querySelector('.finItRemover').onclick = () => { if (lista.children.length > 1) { linha.remove(); finAtualizarTotalForm(); } };
  finAtualizarTotalForm();
  if (focar) { try { linha.querySelector('.finItProduto').focus(); } catch (x) {} }
}

function finAtualizarTotalForm() {
  const alvo = document.getElementById('finTotalForm');
  if (!alvo) return;
  let t = 0;
  document.querySelectorAll('#finItens .finItValor').forEach(i => { t += finLerValor(i.value) || 0; });
  alvo.textContent = finFormatarMoeda(t);
  // um serviço só: esconde o "x" (não dá pra ficar sem nenhum)
  const linhas = document.querySelectorAll('#finItens .finItem');
  linhas.forEach(l => { l.querySelector('.finItRemover').style.visibility = linhas.length > 1 ? 'visible' : 'hidden'; });
}

/* BUSCA NA JANELA: lista de sugestões própria, embaixo do campo. Só filtra enquanto a pessoa digita e NUNCA mexe no que
   está escrito — o <datalist> do navegador apagava/trocava o texto no meio da digitação. Escolher = tocar numa sugestão. */
function finLigarBusca(input, caixa, itens, aoEscolher, mostrarTudoNoFoco) {
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let achados = [];
  const esconder = () => { caixa.style.display = 'none'; caixa.innerHTML = ''; };
  const mostrar = () => {
    const q = norm(input.value).trim();
    achados = (q ? itens.filter(i => norm(i.rotulo).includes(q)) : (mostrarTudoNoFoco ? itens : [])).slice(0, 8);
    if (!achados.length) { esconder(); return; }
    caixa.style.cssText = 'display: block; margin-top: 4px; max-height: 220px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card);';
    caixa.innerHTML = achados.map((i, k) =>
      `<div data-k="${k}" style="padding: 10px 12px; font-size: 13px; cursor: pointer; border-bottom: 1px solid var(--border-color);">${escapeHtml(i.rotulo)}</div>`).join('');
  };
  input.addEventListener('input', () => { aoEscolher(null); mostrar(); });
  if (mostrarTudoNoFoco) input.addEventListener('focus', mostrar);
  caixa.addEventListener('click', ev => {
    const el = ev.target.closest('[data-k]');
    if (!el) return;
    const item = achados[Number(el.dataset.k)];
    input.value = item.rotulo;
    aoEscolher(item);
    esconder();
  });
}

async function salvarEntradaFin(id) {
  const data = document.getElementById('finData').value;
  if (!data) { alert('Informe a data.'); return; }

  const itens = [];
  for (const l of document.querySelectorAll('#finItens .finItem')) {
    const produto = l.querySelector('.finItProduto').value.trim();
    const textoValor = l.querySelector('.finItValor').value.trim();
    if (!produto && !textoValor) continue; // linha vazia: ignora
    const v = finLerValor(textoValor);
    if (v === null) { alert('Informe um valor válido em cada serviço (ex.: 275,00).'); return; }
    itens.push({ produto: produto || null, area_id: l.querySelector('.finItArea').value || null, valor: v });
  }
  if (!itens.length) { alert('Informe o valor do serviço.'); return; }
  const valor = Math.round(itens.reduce((t, i) => t + i.valor, 0) * 100) / 100;
  const areasUnicas = [...new Set(itens.map(i => i.area_id))];

  // cliente: se o texto bate com um cliente cadastrado, liga o cadastro; senão guarda só o nome digitado
  const textoCliente = document.getElementById('finCliente').value.trim();
  const mapa = (textoCliente && finClienteEscolhido && (finRotuloCliente(finClienteEscolhido) === textoCliente || finClienteEscolhido.nome === textoCliente)) ? finClienteEscolhido : null;

  const registro = {
    data,
    valor,
    itens,
    produto: itens.map(i => i.produto).filter(Boolean).join(' + ') || null,
    area_id: areasUnicas.length === 1 ? areasUnicas[0] : null, // combo com áreas diferentes: a divisão fica em itens
    forma_pagamento: document.getElementById('finForma').value || null,
    observacao: document.getElementById('finObs').value.trim() || null,
    mapa_id: mapa ? String(mapa.id) : null,
    cliente_nome: mapa ? mapa.nome : (textoCliente || null)
  };

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Sessão não identificada.'); return; }

    const { error } = id
      ? await supabaseClient.from('entradas').update(registro).eq('id', id)
      : await supabaseClient.from('entradas').insert({ ...registro, user_id: user.id });
    if (error) { alert('Erro ao salvar a entrada: ' + error.message); return; }

    // se a entrada caiu em outro mês, vai pra ele (senão pareceria que sumiu)
    const [a, m] = data.split('-').map(Number);
    finMes = { ano: a, mes: m - 1 };
    fecharModalFin();
    await iniciarModuloFinanceiro();
  } catch (e) {
    alert('Erro de conexão ao salvar a entrada.');
  }
}

async function apagarEntradaFin(id) {
  if (!await astroConfirm('Apagar esta entrada? Essa ação não pode ser desfeita.')) return;
  try {
    const { error } = await supabaseClient.from('entradas').delete().eq('id', id);
    if (error) { alert('Erro ao apagar a entrada: ' + error.message); return; }
    fecharModalFin();
    await iniciarModuloFinanceiro();
  } catch (e) {
    alert('Erro de conexão ao apagar a entrada.');
  }
}

/* ---------- pastas de clientes (quais pastas aparecem na busca de cliente) ---------- */

function abrirPastasFin() {
  fecharModalFin();
  const pastas = (typeof customFolders !== 'undefined' && Array.isArray(customFolders)) ? [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR')) : [];
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  const lista = pastas.map((p, k) => `
    <label style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; font-weight: 600; cursor: pointer;">
      <input type="checkbox" class="finChkPasta" data-pasta="${escapeHtml(p)}" ${finPastasClientes.includes(p) ? 'checked' : ''} style="width: 18px; height: 18px; flex-shrink: 0;">
      <span>${escapeHtml(p)}</span>
    </label>`).join('');
  overlay.innerHTML = `
    <div class="modal-box" style="width: 380px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800; margin-bottom: 4px;">Pastas de clientes</div>
      <div style="font-size: 12px; line-height: 1.4; margin-bottom: 8px;">Só os mapas das pastas marcadas aparecem na busca de cliente das entradas.</div>
      ${lista || '<div style="font-size: 12px;">Nenhuma pasta encontrada.</div>'}
      <div class="modal-actions" style="margin-top: 16px;">
        <button type="button" class="btn-secondary" id="finCancelar">Cancelar</button>
        <button type="button" class="btn-primary" id="finSalvarPastas">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#finCancelar').onclick = fecharModalFin;
  overlay.querySelector('#finSalvarPastas').onclick = salvarPastasFin;
}

async function salvarPastasFin() {
  const marcadas = Array.from(document.querySelectorAll('#finModalOverlay .finChkPasta:checked')).map(c => c.dataset.pasta);
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Sessão não identificada.'); return; }
    const { error } = await supabaseClient.from('configuracoes')
      .upsert({ user_id: user.id, financeiro_pastas_clientes: marcadas }, { onConflict: 'user_id' });
    if (error) { alert('Erro ao salvar as pastas: ' + error.message); return; }
    fecharModalFin();
    await iniciarModuloFinanceiro();
  } catch (e) { alert('Erro de conexão ao salvar as pastas.'); }
}

/* ---------- áreas (Astrologia, Psicanálise…) ---------- */

function abrirAreasFin() {
  fecharModalFin();
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';

  const lista = finAreasCache.length
    ? finAreasCache.map(a => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 13px; font-weight: 700;">${escapeHtml(a.nome)}</span>
          <span style="display: flex; gap: 12px;">
            <i class="fa-solid fa-pen" onclick="renomearAreaFin('${a.id}')" title="Renomear" style="cursor: pointer;"></i>
            <i class="fa-solid fa-trash" onclick="apagarAreaFin('${a.id}')" title="Apagar" style="cursor: pointer; color: var(--danger);"></i>
          </span>
        </div>`).join('')
    : '<div style="font-size: 12px; padding: 8px 0;">Nenhuma área ainda. Crie a primeira (ex.: Astrologia).</div>';

  overlay.innerHTML = `
    <div class="modal-box" style="width: 380px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800; margin-bottom: 6px;">Áreas de atuação</div>
      ${lista}
      <div class="modal-actions" style="margin-top: 16px;">
        <button type="button" class="btn-secondary" id="finFechar">Fechar</button>
        <button type="button" class="btn-primary" id="finNovaArea">+ Área</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#finFechar').onclick = fecharModalFin;
  overlay.querySelector('#finNovaArea').onclick = criarAreaFin;
}

async function criarAreaFin() {
  const nome = await astroPrompt('Nome da nova área (ex.: Astrologia):');
  if (!nome || !nome.trim()) return;
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Sessão não identificada.'); return; }
    const { error } = await supabaseClient.from('areas').insert({ user_id: user.id, nome: nome.trim(), ordem: finAreasCache.length });
    if (error) { alert('Erro ao criar a área: ' + error.message); return; }
    await finRecarregarAreas();
  } catch (e) { alert('Erro de conexão ao criar a área.'); }
}

async function renomearAreaFin(id) {
  const a = finAreasCache.find(x => x.id === id);
  if (!a) return;
  const nome = await astroPrompt('Novo nome da área:', a.nome);
  if (!nome || !nome.trim() || nome.trim() === a.nome) return;
  try {
    const { error } = await supabaseClient.from('areas').update({ nome: nome.trim() }).eq('id', id);
    if (error) { alert('Erro ao renomear a área: ' + error.message); return; }
    await finRecarregarAreas();
  } catch (e) { alert('Erro de conexão ao renomear a área.'); }
}

async function apagarAreaFin(id) {
  const a = finAreasCache.find(x => x.id === id);
  if (!a) return;
  if (!await astroConfirm(`Apagar a área "${a.nome}"? As entradas dela continuam, só ficam "Sem área".`)) return;
  try {
    const { error } = await supabaseClient.from('areas').delete().eq('id', id);
    if (error) { alert('Erro ao apagar a área: ' + error.message); return; }
    await finRecarregarAreas();
  } catch (e) { alert('Erro de conexão ao apagar a área.'); }
}

/* recarrega tudo (a lista do mês mostra o nome da área) e reabre a janela de áreas */
async function finRecarregarAreas() {
  await iniciarModuloFinanceiro();
  abrirAreasFin();
}
