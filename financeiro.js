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
    const [areasRes, entradasRes, mapasRes, servicosRes] = await Promise.all([
      supabaseClient.from('areas').select('*').eq('user_id', user.id).order('ordem', { ascending: true }).order('nome', { ascending: true }),
      supabaseClient.from('entradas').select('*').eq('user_id', user.id).gte('data', ini).lt('data', fim).order('data', { ascending: true }).order('created_at', { ascending: true }),
      supabaseClient.from('mapas').select('id, nome, codigo'),
      supabaseClient.from('relatorio_presets').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true })
    ]);

    if (areasRes.error || entradasRes.error) { renderFinanceiro(container, { tabelasIndisponiveis: true }); return; }

    finAreasCache = areasRes.data || [];
    finEntradasCache = entradasRes.data || [];
    finMapasCache = (!mapasRes.error && mapasRes.data) ? mapasRes.data : [];
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
    const chave = e.area_id && areaPorId[e.area_id] ? e.area_id : '_sem';
    subtotais[chave] = (subtotais[chave] || 0) + Number(e.valor || 0);
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
        const area = e.area_id && areaPorId[e.area_id] ? areaPorId[e.area_id].nome : '';
        const detalhe = [e.produto, e.observacao].filter(Boolean).join(' — ');
        return `
        <div onclick="abrirFormEntradaFin('${e.id}')" style="display: grid; grid-template-columns: 62px 1fr auto; gap: 10px; align-items: center; padding: 10px 4px; border-bottom: 1px solid var(--border-color); cursor: pointer;">
          <div style="font-size: 12px; color: var(--text-muted);">${finFormatarDataBR(e.data)}</div>
          <div style="min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(e.cliente_nome || 'Sem cliente')}</div>
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

  const opcoesArea = '<option value="">Sem área</option>' +
    finAreasCache.map(a => `<option value="${a.id}" ${e && e.area_id === a.id ? 'selected' : ''}>${escapeHtml(a.nome)}</option>`).join('');
  const opcoesForma = '<option value="">—</option>' +
    FIN_FORMAS_PAGAMENTO.map(f => `<option ${e && e.forma_pagamento === f ? 'selected' : ''}>${f}</option>`).join('');
  const listaClientes = finMapasCache.map(m => `<option value="${escapeHtml(finRotuloCliente(m))}"></option>`).join('');
  const listaProdutos = finServicosCache.map(s => `<option value="${escapeHtml(s.nome)}"></option>`).join('');
  const clienteInicial = e && e.cliente_nome
    ? (() => { const m = e.mapa_id && finMapasCache.find(x => String(x.id) === String(e.mapa_id)); return m ? finRotuloCliente(m) : e.cliente_nome; })()
    : '';
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

      <label style="${lbl}">Valor (R$)</label>
      <input type="text" id="finValor" class="modal-input" inputmode="decimal" placeholder="275,00" value="${e ? String(e.valor).replace('.', ',') : ''}" autocomplete="off">

      <label style="${lbl}">Cliente</label>
      <input type="text" id="finCliente" class="modal-input" list="finListaClientes" placeholder="Digite para buscar, ou escreva um nome" value="${escapeHtml(clienteInicial)}" autocomplete="off">
      <datalist id="finListaClientes">${listaClientes}</datalist>

      <label style="${lbl}">Produto / serviço</label>
      <input type="text" id="finProduto" class="modal-input" list="finListaProdutos" placeholder="Ex.: Mapa Natal Clássico" value="${e ? escapeHtml(e.produto || '') : ''}" autocomplete="off">
      <datalist id="finListaProdutos">${listaProdutos}</datalist>

      <label style="${lbl}">Área</label>
      <select id="finArea" class="modal-select">${opcoesArea}</select>

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
  if (!e) setTimeout(() => { try { overlay.querySelector('#finValor').focus(); } catch (x) {} }, 30);
}

async function salvarEntradaFin(id) {
  const data = document.getElementById('finData').value;
  const valor = finLerValor(document.getElementById('finValor').value);
  if (!data) { alert('Informe a data.'); return; }
  if (valor === null) { alert('Informe um valor válido (ex.: 275,00).'); return; }

  // cliente: se o texto bate com um cliente cadastrado, liga o cadastro; senão guarda só o nome digitado
  const textoCliente = document.getElementById('finCliente').value.trim();
  const mapa = textoCliente ? finMapasCache.find(m => finRotuloCliente(m) === textoCliente) : null;

  const registro = {
    data,
    valor,
    produto: document.getElementById('finProduto').value.trim() || null,
    area_id: document.getElementById('finArea').value || null,
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
