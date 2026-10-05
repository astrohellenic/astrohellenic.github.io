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
    <div data-spinner-troca class="menu-vazio" style="min-height: 200px;">Carregando...</div>
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
    container.innerHTML = `<div class="menu-vazio">Sessão não identificada.</div>`;
    return;
  }
  if (ctx.tabelasIndisponiveis) {
    container.innerHTML = `
      <div id="financeiro-container" class="painel">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Financeiro</h3></div>
        <hr class="divisa">
        <p class="ag-nota">Não foi possível carregar o Financeiro (as tabelas "areas" e "entradas" não responderam). Recarregue a página; se continuar, avise o suporte.</p>
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
    return `<div class="fin-area">
      <span>${escapeHtml(nome)} <span class="fin-pct">(${pct}%)</span></span>
      <strong>${finFormatarMoeda(subtotais[k])}</strong>
    </div>`;
  }).join('');

  const linhas = finEntradasCache.length
    ? finEntradasCache.map(e => {
        const area = e.area_id && areaPorId[e.area_id] ? areaPorId[e.area_id].nome : '';
        const detalhe = [e.produto, e.observacao].filter(Boolean).join(' — ');
        return `
        <div class="fin-linha" onclick="abrirFormEntradaFin('${e.id}')">
          <div class="fin-data">${finFormatarDataBR(e.data)}</div>
          <div style="min-width: 0;">
            <div class="fin-nome">${escapeHtml(finNomeClienteEntrada(e) || 'Sem cliente')}</div>
            <div class="fin-det">${escapeHtml([area, detalhe, e.forma_pagamento].filter(Boolean).join(' · '))}</div>
          </div>
          <div class="fin-valor">${finFormatarMoeda(e.valor)}</div>
        </div>`;
      }).join('')
    : `<div class="menu-vazio">Nenhuma entrada em ${FIN_MESES[finMes.mes]} de ${finMes.ano}.</div>`;

  const svgGaleria = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  const svgImprimir = menuIcone('imprimir', 22);

  container.innerHTML = `
    <div id="financeiro-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
      <div id="finColuna" class="fin-coluna">

        <div class="cabeca-ferramenta">
          <h3 class="titulo-ferramenta">Entradas</h3>
        </div>
        <div data-html2canvas-ignore="true" class="fin-acoes">
          <button type="button" class="botao-texto" onclick="abrirCombosFin()">Combos</button>
          <button type="button" class="botao-texto" onclick="abrirPastasFin()">Pastas</button>
          <button type="button" class="botao-texto" onclick="abrirAreasFin()">Áreas</button>
          <button type="button" class="botao-texto" onclick="abrirFormEntradaFin()">+ Entrada</button>
        </div>

        <hr class="divisa">

        <div id="finLinhaMes" class="fin-mes">
          <button type="button" class="botao-icone" data-html2canvas-ignore="true" onclick="navegarMesFin(-1)" title="Mês anterior">${menuIcone('voltar', 22)}</button>
          <div class="titulo-secao" style="margin: 0;">${FIN_MESES[finMes.mes]} ${finMes.ano}</div>
          <button type="button" class="botao-icone" data-html2canvas-ignore="true" onclick="navegarMesFin(1)" title="Próximo mês">${menuIcone('avancar', 22)}</button>
        </div>

        <hr class="divisa">

        <div class="fin-total-bloco">
          <div class="fin-total-topo">
            <div class="rotulo" style="color: var(--preto-tinta);">Total do mês</div>
            <div data-html2canvas-ignore="true" class="acoes-fin">
              <button type="button" class="botao-icone" onclick="salvarEntradasImagem()" title="Salvar como imagem no aparelho">${svgGaleria}</button>
              <button type="button" class="botao-icone" id="finBtnPdf" onclick="imprimirEntradasPDF()" title="Salvar em PDF">${svgImprimir}</button>
            </div>
          </div>
          <div class="fin-total">${finFormatarMoeda(total)}</div>
          ${linhasSubtotais}
        </div>

        <hr class="divisa">

        <div class="fin-lista">
          ${linhas}
        </div>

        <hr class="divisa">
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

/* cores do PDF: as da paleta clara (papel), em qualquer tema do software. Com papiro, a folha de papiro por baixo; sem, fundo branco. */
function finCoresPdf(papiro) {
  return {
    fundo: papiro ? (window.PAPIRO_FOLHA_JPG ? `url("${window.PAPIRO_FOLHA_JPG}") center / 100% 100% no-repeat, #e8d5a0` : '#e8d5a0') : '#ffffff',
    azul: '#1034A6', linha: '#1F5FA3', titulo: '#A03E25', total: '#A03E25', texto: '#1A1410', mudo: '#1A1410'
  };
}

function finRelCss(c) {
  return `
  .finrp-pg { width: 210mm; height: 297mm; padding: ${FIN_PG_TOPO}px 40px 0 40px; position: relative; overflow: hidden; background: ${c.fundo}; color: ${c.texto}; font-family: 'Montserrat', sans-serif; box-sizing: border-box; page-break-after: always; break-after: page; }
  .finrp-pg:last-child { page-break-after: auto; break-after: auto; }
  .finrp-pg * { box-sizing: border-box; margin: 0; padding: 0; }
  .finrp-col { width: 640px; margin: 0 auto; }
  .finrp-titulo { height: 44px; margin-bottom: 14px; font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; letter-spacing: .2em; text-align: center; color: ${c.titulo}; text-transform: uppercase; line-height: 44px; }
  .finrp-mes { height: 36px; margin-bottom: 14px; text-align: center; font-family: 'Cinzel', serif; font-size: 14px; font-weight: 800; letter-spacing: .2em; color: ${c.titulo}; text-transform: uppercase; line-height: 30px; border-bottom: 4px double ${c.linha}; }
  .finrp-cartao { border: 0; background: transparent; margin-bottom: 14px; overflow: hidden; }
  .finrp-total { padding: 14px 0; border-bottom: 4px double ${c.linha}; }
  .finrp-total-rot { height: 16px; line-height: 16px; font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: ${c.texto}; text-transform: uppercase; letter-spacing: .14em; }
  .finrp-total-val { height: 32px; line-height: 32px; margin: 2px 0 8px 0; font-size: 26px; font-weight: 800; color: ${c.total}; }
  .finrp-area { height: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
  .finrp-area span span { color: ${c.mudo}; }
  .finrp-area strong { color: ${c.azul}; }
  .finrp-lista { padding: 4px 0; }
  .finrp-lin { height: ${FIN_PG_LINHA}px; display: grid; grid-template-columns: 62px 1fr auto; column-gap: 10px; align-items: center; padding: 0 4px; border-bottom: 1px solid ${c.linha}; }
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
  const alturaCartaoTotal = 4 + 28 + 16 + 2 + 32 + 8 + 24 * chaves.length + 14; // borda + padding + conteúdo + margem de baixo

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
  fecharModalFin();
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="janela" style="width: 340px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">Salvar em PDF</div>
      <div class="janela-linha-botoes">
        <button type="button" class="botao-texto" id="finPdfPapiro">Com papiro (tinta sobre papiro)</button>
        <button type="button" class="botao-texto" id="finPdfSimples">Sem papiro (fundo branco)</button>
        <button type="button" class="botao-texto" id="finPdfCancelar">Cancelar</button>
      </div>
    </div></div>`;
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
  if (botao) { botao.disabled = true; botao.innerHTML = menuIcone('relogio', 22); }
  // aba nova pro PDF: tem que abrir AGORA, no toque (depois do await o navegador bloquearia)
  const abaPdf = window.astroAbaPdf ? window.astroAbaPdf.abrir() : null;
  try {
    const { html } = finMontarPaginasRelatorio();
    const cores = finCoresPdf(papiro === true);
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${finNomeArquivoRelatorio('pdf').replace(/\.pdf$/, '')}</title>
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
        doc.querySelectorAll('#finColuna .fin-nome, #finColuna .fin-det').forEach(el => { el.style.lineHeight = '1.3'; });
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
  const lbl = '';

  fecharModalFin();
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="janela" style="width: 420px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">${e ? 'Editar entrada' : 'Nova entrada'}</div>

      <label style="${lbl}">Data</label>
      <input type="date" id="finData" class="modal-input" max="${finHojeISO()}" value="${e ? e.data : finHojeISO()}" style="width: 100%; box-sizing: border-box; -webkit-appearance: none; appearance: none; min-height: 36px;">

      <label style="${lbl}">Cliente</label>
      <input type="text" id="finCliente" class="modal-input" placeholder="Digite o código ou o nome" value="${escapeHtml(clienteInicial)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <div id="finSugCliente" style="display: none;"></div>
      <button type="button" class="botao-texto" id="finNovoCli" style="align-self: flex-start;">+ Novo cliente</button>
      <div id="finNovoCliPainel" class="janela-subbloco" style="display: none;">
        <label style="${lbl}; margin-top: 0;">Nome do novo cliente</label>
        <input type="text" id="finNcNome" class="modal-input" autocomplete="off">
        <label style="${lbl}">Código (ex.: 0153 ou T0010 - 0139)</label>
        <input type="text" id="finNcCodigo" class="modal-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <div class="janela-acoes">
          <button type="button" class="botao-texto janela-sec" id="finNcCancelar">Cancelar</button>
          <button type="button" class="botao-texto" id="finNcCriar">Criar cliente</button>
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

      <div class="janela-acoes">
        ${e ? '<button type="button" class="botao-texto janela-apagar" id="finApagar" style="margin-right: auto;">Apagar</button>' : ''}
        <button type="button" class="botao-texto janela-sec" id="finCancelar">Cancelar</button>
        <button type="button" class="botao-texto" id="finSalvar">Salvar</button>
      </div>
    </div></div>`;
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
    caixa.className = 'janela-sugestoes';
    caixa.style.display = 'block';
    caixa.innerHTML = achados.map((i, k) =>
      `<div class="janela-sugestao" data-k="${k}">${escapeHtml(i.rotulo)}</div>`).join('');
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
        <div class="janela-linha">
          <div style="min-width: 0;">
            <div class="janela-linha-nome">${escapeHtml(c.nome)}</div>
            <div class="janela-linha-det">${escapeHtml([nomeArea(c.area_id), c.valor !== null && c.valor !== undefined ? finFormatarMoeda(c.valor) : ''].filter(Boolean).join(' · ') || 'Sem área nem valor padrão')}</div>
          </div>
          <span class="janela-linha-acoes">
            <button type="button" class="botao-icone" style="color: var(--cinza);" onclick="abrirFormComboFin('${c.id}')" title="Editar">${menuIcone('editar', 18)}</button>
            <button type="button" class="botao-icone botao-apagar" onclick="apagarComboFin('${c.id}')" title="Apagar">${menuIcone('lixeira', 18)}</button>
          </span>
        </div>`).join('')
    : '<div class="menu-vazio" style="text-align: left; padding: 8px 0;">Nenhum combo ainda. Ex.: "Mapa Astral + Retificação".</div>';
  const overlay = document.createElement('div');
  overlay.id = 'finModalOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="janela" style="width: 400px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">Combos</div>
      <div class="re-ajuda">Um combo é vendido como um serviço só, com nome e preço próprios. Ao escolher o combo numa entrada, a área e o valor já vêm preenchidos.</div>
      ${lista}
      <div class="janela-acoes">
        <button type="button" class="botao-texto janela-sec" id="finFechar">Fechar</button>
        <button type="button" class="botao-texto" id="finNovoCombo">+ Combo</button>
      </div>
    </div></div>`;
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
    <div class="janela" style="width: 400px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">${c ? 'Editar combo' : 'Novo combo'}</div>
      <label style="${lbl}">Nome</label>
      <input type="text" id="finComboNome" class="modal-input" placeholder="Ex.: Mapa Astral + Retificação" value="${c ? escapeHtml(c.nome) : ''}" autocomplete="off">
      <label style="${lbl}">Área</label>
      <select id="finComboArea" class="modal-select">${opcoesArea}</select>
      <label style="${lbl}">Valor padrão (R$) — opcional</label>
      <input type="text" id="finComboValor" class="modal-input" inputmode="decimal" placeholder="500,00" value="${c && c.valor !== null && c.valor !== undefined ? String(c.valor).replace('.', ',') : ''}" autocomplete="off">
      <div class="janela-acoes">
        <button type="button" class="botao-texto janela-sec" id="finCancelar">Cancelar</button>
        <button type="button" class="botao-texto" id="finSalvarCombo">Salvar</button>
      </div>
    </div></div>`;
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
    <label class="janela-linha janela-linha-check">
      <input type="checkbox" class="finChkPasta" data-pasta="${escapeHtml(p)}" ${finPastasClientes.includes(p) ? 'checked' : ''}>
      <span>${escapeHtml(p)}</span>
    </label>`).join('');
  overlay.innerHTML = `
    <div class="janela" style="width: 380px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">Pastas de clientes</div>
      <div class="re-ajuda">Só os mapas das pastas marcadas aparecem na busca de cliente das entradas.</div>
      ${lista || '<div class="menu-vazio" style="text-align: left; padding: 8px 0;">Nenhuma pasta encontrada.</div>'}
      <div class="janela-acoes">
        <button type="button" class="botao-texto janela-sec" id="finCancelar">Cancelar</button>
        <button type="button" class="botao-texto" id="finSalvarPastas">Salvar</button>
      </div>
    </div></div>`;
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
        <div class="janela-linha">
          <span class="janela-linha-nome">${escapeHtml(a.nome)}</span>
          <span class="janela-linha-acoes">
            <button type="button" class="botao-icone" style="color: var(--cinza);" onclick="renomearAreaFin('${a.id}')" title="Renomear">${menuIcone('editar', 18)}</button>
            <button type="button" class="botao-icone botao-apagar" onclick="apagarAreaFin('${a.id}')" title="Apagar">${menuIcone('lixeira', 18)}</button>
          </span>
        </div>`).join('')
    : '<div class="menu-vazio" style="text-align: left; padding: 8px 0;">Nenhuma área ainda. Crie a primeira (ex.: Astrologia).</div>';

  overlay.innerHTML = `
    <div class="janela" style="width: 380px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">Áreas de atuação</div>
      ${lista}
      <div class="janela-acoes">
        <button type="button" class="botao-texto janela-sec" id="finFechar">Fechar</button>
        <button type="button" class="botao-texto" id="finNovaArea">+ Área</button>
      </div>
    </div></div>`;
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
