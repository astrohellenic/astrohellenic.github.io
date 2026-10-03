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
let finCombos = []; // combos cadastrados: [{ id, nome, area_id, valor }] (configuracoes.financeiro_combos)
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
      supabaseClient.from('relatorio_presets').select('id, nome, valor, area_id').eq('user_id', user.id).order('nome', { ascending: true }),
      supabaseClient.from('configuracoes').select('financeiro_pastas_clientes, financeiro_combos').eq('user_id', user.id).maybeSingle()
    ]);

    if (areasRes.error || entradasRes.error) { renderFinanceiro(container, { tabelasIndisponiveis: true }); return; }

    finAreasCache = areasRes.data || [];
    finEntradasCache = entradasRes.data || [];
    // Só a pasta "Clientes" por padrão (as outras guardam mapas de pergunta, de conhecidos etc.);
    // o astrólogo escolhe outras pastas no botão "Pastas".
    finPastasClientes = (!configRes.error && configRes.data && Array.isArray(configRes.data.financeiro_pastas_clientes))
      ? configRes.data.financeiro_pastas_clientes
      : ['Clientes'];
    finCombos = (!configRes.error && configRes.data && Array.isArray(configRes.data.financeiro_combos)) ? configRes.data.financeiro_combos : [];
    const todosMapas = (!mapasRes.error && mapasRes.data) ? mapasRes.data : [];
    finMapaPorId = {};
    todosMapas.forEach(m => { finMapaPorId[String(m.id)] = m; });
    finMapasCache = todosMapas
      .filter(m => finPastasClientes.includes(m.pasta))
      .sort((a, b) => finRotuloCliente(a).localeCompare(finRotuloCliente(b), 'pt-BR', { numeric: true }));
    finServicosCache = (!servicosRes.error && servicosRes.data) ? servicosRes.data : [];
    if (servicosRes.error) {
      // colunas valor/area_id ainda não criadas em relatorio_presets: cai pra lista só com nome
      const alt = await supabaseClient.from('relatorio_presets').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true });
      finServicosCache = (!alt.error && alt.data) ? alt.data : [];
    }

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
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(finNomeClienteEntrada(e) || 'Sem cliente')}</div>
            <div style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml([area, detalhe, e.forma_pagamento].filter(Boolean).join(' · '))}</div>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-dark); white-space: nowrap;">${finFormatarMoeda(e.valor)}</div>
        </div>`;
      }).join('')
    : `<div style="font-size: 12px; color: var(--text-muted); padding: 16px 0; text-align: center;">Nenhuma entrada em ${FIN_MESES[finMes.mes]} de ${finMes.ano}.</div>`;

  // mesmo botão de ícone das outras ferramentas (salvar na galeria etc.): 36x36, borda dourada fina
  const btnIco = "width: 36px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 0; color: var(--primary-blue);";
  const btn = 'background: var(--bg-card); border: 1px solid var(--gold-primary); color: var(--primary-blue); border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer;';

  container.innerHTML = `
    <div id="financeiro-container" style="width: 100%; min-height: 100%; padding: 20px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; background-color: var(--bg-main);">
      <div id="finColuna" style="max-width: 640px; margin: 0 auto;">

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px;">
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0; text-transform: uppercase;">Entradas</h2>
          <div data-html2canvas-ignore="true" style="display: flex; gap: 8px;">
            <button onclick="abrirCombosFin()" style="${btn}">Combos</button>
            <button onclick="abrirPastasFin()" style="${btn}">Pastas</button>
            <button onclick="abrirAreasFin()" style="${btn}">Áreas</button>
            <button class="fin-btn-nova" onclick="abrirFormEntradaFin()" style="${btn}">+ Entrada</button>
          </div>
        </div>

        <div id="finLinhaMes" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <button data-html2canvas-ignore="true" onclick="navegarMesFin(-1)" style="${btn}" title="Mês anterior"><i class="fa-solid fa-chevron-left"></i></button>
          <div style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: var(--primary-blue); text-transform: uppercase;">${FIN_MESES[finMes.mes]} ${finMes.ano}</div>
          <button data-html2canvas-ignore="true" onclick="navegarMesFin(1)" style="${btn}" title="Próximo mês"><i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div style="border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; background: var(--bg-card);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em;">Total do mês</div>
            <div data-html2canvas-ignore="true" style="display: flex; gap: 8px;">
              <button type="button" class="fin-ico-btn" onclick="salvarEntradasImagem()" title="Salvar como imagem no aparelho" style="${btnIco}">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
              </button>
              <button type="button" class="fin-ico-btn" id="finBtnPdf" onclick="imprimirEntradasPDF()" title="Salvar em PDF" style="${btnIco}">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18,22 V8 H46 V22"/><rect x="8" y="22" width="48" height="24" rx="4"/><path d="M18,38 H46 V58 H18 Z"/><circle cx="47" cy="30" r="1.5"/></svg>
              </button>
            </div>
          </div>
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

/* ---------- RELATÓRIO DO MÊS (imagem e PDF) ----------
   O PDF tem o MESMO desenho da tela (título, mês, cartão do total com as áreas e a lista), em páginas A4. Tudo em
   px com alturas fixas (linha da lista = 50px etc.), pra reparti-las nas páginas sem medir nada. O servidor de PDF
   (api/gerar-pdf.js) conta as folhas pela classe .rel-page e refaz o PDF "folha por folha" se o Chrome paginar
   diferente, então cada página daqui TEM que ser um .rel-page e caber em 297mm. */

const FIN_PG_ALTURA = 1122;      // px (297mm)
const FIN_PG_TOPO = 36;          // px
const FIN_PG_BASE = 44;          // px: rodapé
const FIN_PG_LINHA = 50;         // px: cada entrada da lista
const FIN_PG_CABECALHO = 108;    // px: título + mês (só na 1ª página)

/* cores do PDF: com papiro, a tinta do Tema Céu; sem papiro, as cores do tema atual (lidas do CSS) */
function finCoresPdf(papiro) {
  if (papiro) {
    return { fundo: (window.PAPIRO_FOLHA_JPG ? `url("${window.PAPIRO_FOLHA_JPG}") center / 100% 100% no-repeat, #e8d5a0` : '#e8d5a0'),
      azul: '#1d3a66', titulo: '#a03e25', total: '#a03e25', texto: '#1a1410', mudo: '#1a1410', borda: 'rgba(95, 65, 30, 0.45)', cartao: 'transparent' };
  }
  const v = nome => (getComputedStyle(document.documentElement).getPropertyValue(nome) || '').trim();
  const azul = v('--primary-blue') || '#103b70';
  return { fundo: v('--bg-main') || '#ffffff', azul, titulo: azul, total: azul, texto: v('--text-dark') || '#1a1410',
    mudo: v('--text-muted') || '#666666', borda: v('--border-color') || '#dddddd', cartao: v('--bg-card') || 'transparent' };
}

function finRelCss(c) {
  return `
  .finrp-pg { width: 210mm; height: 297mm; padding: ${FIN_PG_TOPO}px 40px 0 40px; position: relative; overflow: hidden; background: ${c.fundo}; color: ${c.texto}; font-family: 'Montserrat', sans-serif; box-sizing: border-box; page-break-after: always; break-after: page; }
  .finrp-pg:last-child { page-break-after: auto; break-after: auto; }
  .finrp-pg * { box-sizing: border-box; margin: 0; padding: 0; }
  .finrp-col { width: 640px; margin: 0 auto; }
  .finrp-titulo { height: 44px; margin-bottom: 14px; font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: ${c.titulo}; text-transform: uppercase; line-height: 44px; }
  .finrp-mes { height: 36px; margin-bottom: 14px; text-align: center; font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: ${c.azul}; text-transform: uppercase; line-height: 36px; }
  .finrp-cartao { border: 1px solid ${c.borda}; border-radius: 12px; background: ${c.cartao}; margin-bottom: 14px; overflow: hidden; }
  .finrp-total { padding: 14px 16px; }
  .finrp-total-rot { height: 16px; line-height: 16px; font-size: 11px; font-weight: 700; color: ${c.mudo}; text-transform: uppercase; letter-spacing: 0.03em; }
  .finrp-total-val { height: 32px; line-height: 32px; margin: 2px 0 8px 0; font-size: 26px; font-weight: 800; color: ${c.total}; }
  .finrp-area { height: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
  .finrp-area span span { color: ${c.mudo}; }
  .finrp-area strong { color: ${c.azul}; }
  .finrp-lista { padding: 4px 12px; }
  .finrp-lin { height: ${FIN_PG_LINHA}px; display: grid; grid-template-columns: 62px 1fr auto; column-gap: 10px; align-items: center; padding: 0 4px; border-bottom: 1px solid ${c.borda}; }
  .finrp-lin:last-child { border-bottom: 0; }
  .finrp-data { font-size: 12px; color: ${c.mudo}; }
  .finrp-nome { font-size: 13px; line-height: 18px; font-weight: 700; color: ${c.azul}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .finrp-det { font-size: 11px; line-height: 15px; color: ${c.mudo}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .finrp-val { font-size: 13px; font-weight: 700; color: ${c.texto}; white-space: nowrap; }
  .finrp-rodape { position: absolute; left: 40px; right: 40px; bottom: 16px; display: flex; justify-content: space-between; font-size: 9px; color: ${c.mudo}; opacity: 0.8; }`;
}

/* monta as páginas (HTML) do mês que está na tela */
function finMontarPaginasRelatorio() {
  const areaPorId = {};
  finAreasCache.forEach(a => { areaPorId[a.id] = a; });
  const { ano, mes } = finMes;
  const total = finEntradasCache.reduce((t, e) => t + Number(e.valor || 0), 0);

  const subtotais = {};
  finEntradasCache.forEach(e => {
    const chave = e.area_id && areaPorId[e.area_id] ? e.area_id : '_sem';
    subtotais[chave] = (subtotais[chave] || 0) + Number(e.valor || 0);
  });
  const chaves = Object.keys(subtotais);
  const linhasArea = chaves.map(k => {
    const nome = k === '_sem' ? 'Sem área' : areaPorId[k].nome;
    const pct = total > 0 ? Math.round((subtotais[k] / total) * 100) : 0;
    return `<div class="finrp-area"><span>${escapeHtml(nome)} <span>(${pct}%)</span></span><strong>${finFormatarMoeda(subtotais[k])}</strong></div>`;
  }).join('');
  const cartaoTotal = `<div class="finrp-cartao finrp-total"><div class="finrp-total-rot">Total do mês</div><div class="finrp-total-val">${finFormatarMoeda(total)}</div>${linhasArea}</div>`;
  const alturaCartaoTotal = 2 + 28 + 16 + 2 + 32 + 8 + 24 * chaves.length + 14; // borda + padding + conteúdo + margem de baixo

  const linhaHtml = e => {
    const area = e.area_id && areaPorId[e.area_id] ? areaPorId[e.area_id].nome : '';
    const detalhe = [e.produto, e.observacao].filter(Boolean).join(' — ');
    return `<div class="finrp-lin"><div class="finrp-data">${finFormatarDataBR(e.data)}</div><div style="min-width: 0;"><div class="finrp-nome">${escapeHtml(finNomeClienteEntrada(e) || 'Sem cliente')}</div><div class="finrp-det">${escapeHtml([area, detalhe, e.forma_pagamento].filter(Boolean).join(' · '))}</div></div><div class="finrp-val">${finFormatarMoeda(e.valor)}</div></div>`;
  };

  const util = FIN_PG_ALTURA - FIN_PG_TOPO - FIN_PG_BASE;
  const porPrimeira = Math.max(1, Math.floor((util - FIN_PG_CABECALHO - alturaCartaoTotal - 10) / FIN_PG_LINHA));
  const porOutra = Math.max(1, Math.floor((util - 10) / FIN_PG_LINHA));
  const grupos = [finEntradasCache.slice(0, porPrimeira)];
  for (let i = porPrimeira; i < finEntradasCache.length; i += porOutra) grupos.push(finEntradasCache.slice(i, i + porOutra));

  const cabecalho = `<div class="finrp-titulo">Entradas</div><div class="finrp-mes">${FIN_MESES[mes]} ${ano}</div>`;
  const paginas = grupos.map((g, idx) => {
    const lista = g.length ? `<div class="finrp-cartao finrp-lista">${g.map(linhaHtml).join('')}</div>` : '';
    return `<div class="finrp-col">${idx === 0 ? cabecalho + cartaoTotal : ''}${lista}</div>`;
  });

  const hoje = finFormatarDataBR(finHojeISO());
  return {
    total: paginas.length,
    html: paginas.map((p, n) => `<div class="finrp-pg rel-page">${p}<div class="finrp-rodape"><span>Astro Hellenic · Entradas ${FIN_MESES[mes]} ${ano}</span><span>emitido em ${hoje} · página ${n + 1} de ${paginas.length}</span></div></div>`).join('')
  };
}

function finNomeArquivoRelatorio(ext) {
  return `Entradas_${finMes.ano}-${String(finMes.mes + 1).padStart(2, '0')}.${ext}`;
}

/* Botão da impressora. No Tema Céu pergunta se é pra sair sobre o papiro (como a capa do Relatório); nos outros temas vai direto. */
function imprimirEntradasPDF() {
  if (!finEntradasCache.length) { alert('Não há entradas neste mês para salvar.'); return; }
  if (!document.body.classList.contains('tema-ceu')) { baixarEntradasPDF(false); return; }
  fecharModalFin();
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="modal-box" style="width: 340px; max-width: 100%; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800;">Salvar em PDF</div>
      <button type="button" class="btn-primary" id="finPdfPapiro" style="width: 100%;">Sobre papiro (tinta sobre papiro)</button>
      <button type="button" class="btn-secondary" id="finPdfSimples" style="width: 100%;">Sem papiro (fundo liso)</button>
      <button type="button" class="btn-secondary" id="finPdfCancelar" style="width: 100%;">Cancelar</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#finPdfPapiro').onclick = () => { fecharModalFin(); baixarEntradasPDF(true); };
  overlay.querySelector('#finPdfSimples').onclick = () => { fecharModalFin(); baixarEntradasPDF(false); };
  overlay.querySelector('#finPdfCancelar').onclick = fecharModalFin;
}

/* PDF: manda o HTML pro mesmo servidor de PDF do Relatório (Chrome de verdade) e baixa o resultado */
async function baixarEntradasPDF(papiro) {
  if (!finEntradasCache.length) { alert('Não há entradas neste mês para salvar.'); return; }
  const botao = document.getElementById('finBtnPdf');
  const original = botao ? botao.innerHTML : '';
  if (botao) { botao.disabled = true; botao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
  // aba nova pro PDF: tem que abrir AGORA, no toque (depois do await o navegador bloquearia)
  const abaPdf = window.astroAbaPdf ? window.astroAbaPdf.abrir() : null;
  try {
    const { html } = finMontarPaginasRelatorio();
    const cores = finCoresPdf(papiro === true);
    const doc = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap">
<style>@page { size: A4; margin: 0; } html, body { margin: 0; padding: 0; background: #ffffff; } ${finRelCss(cores)}</style></head><body>${html}</body></html>`;
    const url = (typeof RELATORIO_PDF_API_URL !== 'undefined') ? RELATORIO_PDF_API_URL : 'https://astrohellenicgithubio.vercel.app/api/gerar-pdf';
    let resposta;
    try {
      resposta = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html: doc }) });
    } catch (errRede) {
      throw new Error('a conexão com o servidor de PDF caiu. Tente de novo.');
    }
    if (!resposta.ok) {
      let detalhe = '';
      try { detalhe = (await resposta.text()).slice(0, 200); } catch (_) {}
      throw new Error(`o servidor de PDF respondeu ${resposta.status}${detalhe ? ': ' + detalhe : ''}`);
    }
    const blob = await resposta.blob();
    if (window.astroAbaPdf) window.astroAbaPdf.mostrar(abaPdf, blob, finNomeArquivoRelatorio('pdf'));
  } catch (err) {
    if (window.astroAbaPdf) window.astroAbaPdf.fechar(abaPdf);
    console.error('Erro ao gerar o PDF das entradas:', err);
    alert('Não foi possível gerar o PDF: ' + err.message);
  } finally {
    if (botao) { botao.disabled = false; botao.innerHTML = original; }
  }
}

/* IMAGEM: salva a tela do mês IGUAL ao que está na tela (título, mês, total com as áreas e a lista), sem os botões.
   É a mesma captura das outras ferramentas: no Tema Céu sai só a tinta e a folha de papiro entra por baixo
   (capturarESalvarNaGaleria); nos outros temas sai com o fundo da tela. */
function salvarEntradasImagem() {
  const coluna = document.getElementById('finColuna');
  if (!coluna) return;
  if (!finEntradasCache.length) { alert('Não há entradas neste mês para salvar.'); return; }
  capturarESalvarNaGaleria(async () => {
    const semFundo = window.__capturaSemFundo === true;
    let fundo = null;
    if (!semFundo) {
      const folha = document.getElementById('financeiro-container');
      fundo = folha ? getComputedStyle(folha).backgroundColor : '';
      if (!fundo || fundo === 'rgba(0, 0, 0, 0)' || fundo === 'transparent') fundo = '#ffffff';
    }
    return html2canvas(coluna, {
      scale: 2,
      backgroundColor: semFundo ? null : fundo,
      useCORS: true,
      onclone: doc => {
        const c = doc.getElementById('finColuna');
        if (c) { c.style.padding = '24px'; c.style.background = 'transparent'; }
        // linhas de texto de uma linha só (com reticências) perdiam a base das letras na captura: dá um respiro de altura
        doc.querySelectorAll('#finColuna [style*="text-overflow"]').forEach(el => { el.style.lineHeight = '1.3'; });
        const mes = doc.getElementById('finLinhaMes');
        if (mes) mes.style.justifyContent = 'center'; // sem as setas, o mês fica no meio
      }
    });
  }, 'Astro_Hellenic_' + finNomeArquivoRelatorio('png'));
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
      <input type="date" id="finData" class="modal-input" max="${finHojeISO()}" value="${e ? e.data : finHojeISO()}" style="width: 100%; box-sizing: border-box; -webkit-appearance: none; appearance: none; min-height: 36px;">

      <label style="${lbl}">Cliente</label>
      <input type="text" id="finCliente" class="modal-input" placeholder="Digite o código ou o nome" value="${escapeHtml(clienteInicial)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <div id="finSugCliente" style="display: none;"></div>
      <button type="button" class="btn-secondary" id="finNovoCli" style="margin-top: 6px; align-self: flex-start;">+ Novo cliente</button>
      <div id="finNovoCliPainel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; margin-top: 6px;">
        <label style="${lbl}; margin-top: 0;">Nome do novo cliente</label>
        <input type="text" id="finNcNome" class="modal-input" autocomplete="off">
        <label style="${lbl}">Código (ex.: 0153 ou T0010 - 0139)</label>
        <input type="text" id="finNcCodigo" class="modal-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <div class="modal-actions" style="margin-top: 10px;">
          <button type="button" class="btn-secondary" id="finNcCancelar">Cancelar</button>
          <button type="button" class="btn-primary" id="finNcCriar">Criar cliente</button>
        </div>
      </div>

      <label style="${lbl}">Produto / serviço</label>
      <input type="text" id="finProduto" class="modal-input" placeholder="Ex.: Mapa Natal Clássico" value="${e ? escapeHtml(e.produto || '') : ''}" autocomplete="off">
      <div id="finSugProduto" style="display: none;"></div>

      <label style="${lbl}">Área</label>
      <select id="finArea" class="modal-select">${opcoesArea}</select>

      <label style="${lbl}">Valor (R$)</label>
      <input type="text" id="finValor" class="modal-input" inputmode="decimal" placeholder="275,00" value="${e ? String(e.valor).replace('.', ',') : ''}" autocomplete="off">

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
  const painelNc = overlay.querySelector('#finNovoCliPainel');
  overlay.querySelector('#finNovoCli').onclick = () => { painelNc.style.display = 'block'; try { overlay.querySelector('#finNcNome').focus(); } catch (x) {} };
  overlay.querySelector('#finNcCancelar').onclick = () => { painelNc.style.display = 'none'; };
  overlay.querySelector('#finNcCriar').onclick = () => criarClienteFin(overlay);
  finLigarBusca(overlay.querySelector('#finCliente'), overlay.querySelector('#finSugCliente'),
    finMapasCache.map(m => ({ rotulo: finRotuloCliente(m), mapa: m })), item => { finClienteEscolhido = item ? item.mapa : null; }, false);
  // sugestões do serviço: combos cadastrados primeiro, depois os serviços (Configurações → Serviços); escolher um já preenche área e valor, se ele tiver
  finLigarBusca(overlay.querySelector('#finProduto'), overlay.querySelector('#finSugProduto'),
    [...finCombos.map(c => ({ rotulo: c.nome, combo: c })), ...finServicosCache.map(s => ({ rotulo: s.nome, combo: s }))],
    item => {
      if (!item || !item.combo) return;
      if (item.combo.area_id) overlay.querySelector('#finArea').value = item.combo.area_id;
      if (item.combo.valor !== undefined && item.combo.valor !== null && item.combo.valor !== '') overlay.querySelector('#finValor').value = String(item.combo.valor).replace('.', ',');
    }, true);
  if (!e) setTimeout(() => { try { overlay.querySelector('#finCliente').focus(); } catch (x) {} }, 30);
}

/* CLIENTE NOVO direto da entrada (quem não tem mapa, ex.: terapia). Entra na pasta "Clientes" como o "Importar Lista em Massa"
   faz com quem só tem nome e código: data de nascimento provisória, que o astrólogo troca se um dia fizer o mapa dele. */
async function criarClienteFin(overlay) {
  const nome = overlay.querySelector('#finNcNome').value.trim();
  const codigo = overlay.querySelector('#finNcCodigo').value.trim();
  if (!nome) { alert('Informe o nome do cliente.'); return; }
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Sessão não identificada.'); return; }
    const { data, error } = await supabaseClient.from('mapas').insert([{
      pasta: 'Clientes', tipo: 'Natal', codigo: codigo || null, nome,
      data_nascimento: '01/01/2000', hora_nascimento: '', cidade: 'Brasil',
      latitude: -23.5505, longitude: -46.6333, user_id: user.id
    }]).select('id, nome, codigo, pasta').single();
    if (error || !data) { alert('Erro ao criar o cliente: ' + (error ? error.message : 'sem resposta')); return; }
    finMapaPorId[String(data.id)] = data;
    finMapasCache.push(data);
    finClienteEscolhido = data;
    overlay.querySelector('#finCliente').value = finRotuloCliente(data);
    overlay.querySelector('#finNovoCliPainel').style.display = 'none';
  } catch (e) { alert('Erro de conexão ao criar o cliente.'); }
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
  const valor = finLerValor(document.getElementById('finValor').value);
  if (!data) { alert('Informe a data.'); return; }
  if (data > finHojeISO()) { alert('Essa data ainda não chegou — só dá para lançar entradas até hoje.'); return; }
  if (valor === null) { alert('Informe um valor válido (ex.: 275,00).'); return; }

  // cliente: se o texto bate com um cliente cadastrado, liga o cadastro; senão guarda só o nome digitado
  const textoCliente = document.getElementById('finCliente').value.trim();
  const mapa = (textoCliente && finClienteEscolhido && (finRotuloCliente(finClienteEscolhido) === textoCliente || finClienteEscolhido.nome === textoCliente)) ? finClienteEscolhido : null;

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

/* ---------- combos (dois ou mais serviços vendidos juntos, com nome e preço próprios) ---------- */

function abrirCombosFin() {
  fecharModalFin();
  const nomeArea = id => { const a = finAreasCache.find(x => x.id === id); return a ? a.nome : ''; };
  const lista = finCombos.length
    ? finCombos.map(c => `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
          <div style="min-width: 0;">
            <div style="font-size: 13px; font-weight: 700;">${escapeHtml(c.nome)}</div>
            <div style="font-size: 11px;">${escapeHtml([nomeArea(c.area_id), c.valor !== null && c.valor !== undefined ? finFormatarMoeda(c.valor) : ''].filter(Boolean).join(' · ') || 'Sem área nem valor padrão')}</div>
          </div>
          <span style="display: flex; gap: 12px; flex-shrink: 0;">
            <i class="fa-solid fa-pen" onclick="abrirFormComboFin('${c.id}')" title="Editar" style="cursor: pointer;"></i>
            <i class="fa-solid fa-trash" onclick="apagarComboFin('${c.id}')" title="Apagar" style="cursor: pointer; color: var(--danger);"></i>
          </span>
        </div>`).join('')
    : '<div style="font-size: 12px; padding: 8px 0;">Nenhum combo ainda. Ex.: "Mapa Astral + Retificação".</div>';
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="modal-box" style="width: 400px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800; margin-bottom: 4px;">Combos</div>
      <div style="font-size: 12px; line-height: 1.4; margin-bottom: 6px;">Um combo é vendido como um serviço só, com nome e preço próprios. Ao escolher o combo numa entrada, a área e o valor já vêm preenchidos.</div>
      ${lista}
      <div class="modal-actions" style="margin-top: 16px;">
        <button type="button" class="btn-secondary" id="finFechar">Fechar</button>
        <button type="button" class="btn-primary" id="finNovoCombo">+ Combo</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#finFechar').onclick = fecharModalFin;
  overlay.querySelector('#finNovoCombo').onclick = () => abrirFormComboFin();
}

function abrirFormComboFin(id) {
  const c = id ? finCombos.find(x => x.id === id) : null;
  fecharModalFin();
  const opcoesArea = '<option value="">Sem área</option>' +
    finAreasCache.map(a => `<option value="${a.id}" ${c && c.area_id === a.id ? 'selected' : ''}>${escapeHtml(a.nome)}</option>`).join('');
  const lbl = 'font-size: 11px; font-weight: 600; margin-top: 10px; display: block;';
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="modal-box" style="width: 400px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800;">${c ? 'Editar combo' : 'Novo combo'}</div>
      <label style="${lbl}">Nome</label>
      <input type="text" id="finComboNome" class="modal-input" placeholder="Ex.: Mapa Astral + Retificação" value="${c ? escapeHtml(c.nome) : ''}" autocomplete="off">
      <label style="${lbl}">Área</label>
      <select id="finComboArea" class="modal-select">${opcoesArea}</select>
      <label style="${lbl}">Valor padrão (R$) — opcional</label>
      <input type="text" id="finComboValor" class="modal-input" inputmode="decimal" placeholder="500,00" value="${c && c.valor !== null && c.valor !== undefined ? String(c.valor).replace('.', ',') : ''}" autocomplete="off">
      <div class="modal-actions" style="margin-top: 16px;">
        <button type="button" class="btn-secondary" id="finCancelar">Cancelar</button>
        <button type="button" class="btn-primary" id="finSalvarCombo">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#finCancelar').onclick = abrirCombosFin;
  overlay.querySelector('#finSalvarCombo').onclick = async () => {
    const nome = document.getElementById('finComboNome').value.trim();
    if (!nome) { alert('Dê um nome ao combo.'); return; }
    const txtValor = document.getElementById('finComboValor').value.trim();
    const valor = txtValor ? finLerValor(txtValor) : null;
    if (txtValor && valor === null) { alert('Valor inválido (ex.: 500,00).'); return; }
    const novo = { id: c ? c.id : String(Date.now()), nome, area_id: document.getElementById('finComboArea').value || null, valor };
    await salvarCombosFin(c ? finCombos.map(x => x.id === c.id ? novo : x) : [...finCombos, novo]);
  };
}

async function apagarComboFin(id) {
  const c = finCombos.find(x => x.id === id);
  if (!c || !await astroConfirm(`Apagar o combo "${c.nome}"? As entradas já lançadas continuam como estão.`)) return;
  await salvarCombosFin(finCombos.filter(x => x.id !== id));
}

async function salvarCombosFin(lista) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Sessão não identificada.'); return; }
    const { error } = await supabaseClient.from('configuracoes')
      .upsert({ user_id: user.id, financeiro_combos: lista }, { onConflict: 'user_id' });
    if (error) { alert('Erro ao salvar os combos: ' + error.message); return; }
    finCombos = lista;
    abrirCombosFin();
  } catch (e) { alert('Erro de conexão ao salvar os combos.'); }
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
