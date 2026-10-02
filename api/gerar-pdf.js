/* Endpoint /api/gerar-pdf — recebe o HTML da prévia do Relatório (já
   pronta, exatamente como aparece na tela do astrólogo) e devolve um
   PDF de verdade, gerado por um Chrome headless rodando aqui no
   servidor (nunca no aparelho de quem clicou em "Baixar PDF" — é
   isso que evita a inconsistência entre navegadores/aparelhos que já
   tinha sido tentada e abandonada antes, ver CLAUDE.md do repositório).

   Não lê nada do Supabase e não sabe nada sobre login do astrólogo:
   só recebe HTML pronto e devolve PDF pronto. Todo o dado sensível do
   cliente (nome, data de nascimento etc.) já estava só dentro desse
   HTML, exatamente como já estava na tela do astrólogo logado — essa
   função não guarda, não loga e não repassa esse HTML pra lugar
   nenhum, só usa ele em memória pra montar o PDF e descarta. */

// Tanto @sparticuz/chromium quanto puppeteer-core (nas versões atuais)
// viram ES Module puro por dentro — "require()" direto funciona só por
// acaso em Node novo (que tolera require de ESM); no Node da Vercel dá
// "ERR_REQUIRE_ESM" na hora, um pacote de cada vez (foi exatamente assim
// que apareceu: corrigiu o chromium, publicou, e só aí apareceu o mesmo
// erro no puppeteer-core). import() dinâmico funciona em qualquer versão
// de Node de dentro de um arquivo CommonJS como este — por isso os dois
// são carregados dentro da função (nunca com require() no topo do
// arquivo), cacheados na primeira chamada de cada instância da função.
let dependenciasPromise;
function carregarDependencias() {
  if (!dependenciasPromise) {
    dependenciasPromise = Promise.all([
      import('puppeteer-core'),
      import('@sparticuz/chromium')
    ]).then(([puppeteerMod, chromiumMod]) => ({
      launch: puppeteerMod.launch,
      chromium: chromiumMod.default
    }));
  }
  return dependenciasPromise;
}

// Só esses sites podem chamar essa função. Sem isso, qualquer site na
// internet poderia usar esse endpoint pra converter HTML em PDF às
// custas da conta Vercel do astrólogo.
const ORIGENS_PERMITIDAS = [
  'https://astrohellenic.com',
  'https://www.astrohellenic.com',
  'https://astrohellenic.github.io'
];

// Limite generoso (um relatório bem longo, com várias mandalas em
// base64 embutidas, ainda cabe bem abaixo disso) só pra impedir um
// corpo de requisição absurdamente grande de travar a função à toa.
const TAMANHO_MAXIMO_HTML = 25 * 1024 * 1024; // 25 MB

function aplicarCors(req, res) {
  const origem = req.headers.origin;
  if (origem && ORIGENS_PERMITIDAS.includes(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Roda DENTRO do Chrome: para cada folha, diz se o conteúdo visível cabe em uma A4 (então só a 1ª página importa).
const MEDIR_SE_FOLHAS_CABEM = function() {
  const folha = 297 * 96 / 25.4;
  return Array.from(document.querySelectorAll('.rel-page')).map(pagina => {
    if (pagina.classList.contains('rel-capa')) return true; // capa: tamanho fixo, o que vaza é cortado
    const topo = pagina.getBoundingClientRect().top;
    let maisBaixo = 0;
    pagina.querySelectorAll('*').forEach(el => {
      if (el.classList && el.classList.contains('rel-num-pagina-canto')) return;
      const r = el.getBoundingClientRect();
      if (r.width && r.height) maisBaixo = Math.max(maisBaixo, r.bottom - topo);
    });
    return maisBaixo <= folha + 1;
  });
};

// Roda DENTRO do Chrome (pagina.evaluate): não pode usar nada daqui de fora.
const AJUSTAR_EXCESSO_DAS_FOLHAS = function() {
  /* Rede de segurança contra "folha extra com só o número da página" (ver .rel-page em relatorio.js):
     já com o layout de IMPRESSÃO pronto, procura folhas (.rel-page, exceto a capa) mais altas que uma A4.
     - Se o excesso é só "casca" (padding/margem final: nenhum conteúdo visível passa de 297mm), trava a
       folha em 297mm e corta o resto — nada de conteúdo se perde, só some a folha extra.
     - Se é uma IMAGEM que ficou grande demais (conteúdo de verdade passando da folha), encolhe a imagem
       proporcionalmente exatamente pelo excesso.
     Devolve a lista do que ajustou (pra diagnóstico). */
  const mm = 96 / 25.4, folha = 297 * mm, ajustes = [];
  const todas = Array.from(document.querySelectorAll('.rel-page'));
  document.querySelectorAll('.rel-page:not(.rel-capa)').forEach(pagina => {
    const i = todas.indexOf(pagina); // posição real no PDF (a capa é a página 1)
    const excesso = pagina.scrollHeight - folha;
    if (excesso <= 1.5) return;
    const topo = pagina.getBoundingClientRect().top;
    let maisBaixo = 0;
    pagina.querySelectorAll('*').forEach(el => {
      if (el.classList && el.classList.contains('rel-num-pagina-canto')) return;
      const r = el.getBoundingClientRect();
      if (r.width && r.height) maisBaixo = Math.max(maisBaixo, r.bottom - topo);
    });
    if (maisBaixo <= folha + 1) {
      pagina.style.cssText += `;height: 297mm; min-height: 297mm; overflow: hidden; break-inside: avoid; page-break-inside: avoid;`;
      ajustes.push({ pagina: i + 1, excessoMm: +(excesso / mm).toFixed(1), acao: 'folha travada em 297mm (só casca passava)' });
      return;
    }
    const imagem = pagina.querySelector('.rel-img-mandala, .rel-img-captura');
    if (!imagem) { ajustes.push({ pagina: i + 1, excessoMm: +(excesso / mm).toFixed(1), acao: 'conteúdo passa da folha, sem imagem pra encolher' }); return; }
    const caixa = imagem.getBoundingClientRect();
    const fator = (caixa.height - (maisBaixo - folha) - 1) / caixa.height;
    if (fator < 0.3 || fator >= 1) { ajustes.push({ pagina: i + 1, excessoMm: +(excesso / mm).toFixed(1), acao: 'fator fora do limite', fator }); return; }
    const w = (caixa.width * fator) / mm, h = (caixa.height * fator) / mm;
    imagem.style.cssText += `;flex: none; width: ${w.toFixed(2)}mm; height: ${h.toFixed(2)}mm; max-width: ${w.toFixed(2)}mm; max-height: ${h.toFixed(2)}mm;`;
    ajustes.push({ pagina: i + 1, excessoMm: +(excesso / mm).toFixed(1), acao: 'imagem encolhida', fator: +fator.toFixed(3) });
  });
  return ajustes;
};

module.exports = async function handler(req, res) {
  aplicarCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Método não permitido.' });
    return;
  }

  const html = req.body && req.body.html;
  if (!html || typeof html !== 'string') {
    res.status(400).json({ erro: 'Faltou o HTML do relatório no corpo da requisição.' });
    return;
  }
  if (html.length > TAMANHO_MAXIMO_HTML) {
    res.status(413).json({ erro: 'HTML do relatório maior do que o esperado.' });
    return;
  }

  let navegador;
  try {
    const { launch, chromium } = await carregarDependencias();
    navegador = await launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 }, // proporção A4 em px, só pro layout inicial antes do @media print entrar
      executablePath: await chromium.executablePath(),
      headless: true
    });

    const pagina = await navegador.newPage();

    // "load" (não "networkidle0"): esse HTML é totalmente autônomo — sem
    // chamadas de API, sem scripts — só fontes do Google Fonts, ícones do
    // Font Awesome e imagens (mandala, capturas) já com URL pronta. Espera
    // essas imagens específicas carregarem de verdade (ou falharem) antes
    // de gerar o PDF, em vez de confiar num tempo fixo de espera.
    await pagina.setContent(html, { waitUntil: 'load', timeout: 45000 });
    await pagina.evaluate(async () => {
      const imagens = Array.from(document.images);
      await Promise.all(imagens.map(async img => {
        // "img.complete" pode ser true com a imagem ainda sem ter sido
        // DECODIFICADA de verdade (o evento "load" dispara antes disso
        // terminar, principalmente em imagens grandes — uma captura de
        // ferramenta em alta resolução, por exemplo). Se o layout de
        // paginação for calculado com a imagem só "carregada" mas ainda
        // decodificando, o tamanho que entra nessa conta pode não ser o
        // tamanho final — foi visto na prática (29/09/2026) uma página
        // de captura empurrando o número dela pra uma folha extra mesmo
        // com a altura da página travada em 297mm, sem imagem visível
        // cortada ou distorcida (sintoma de timing, não de CSS errado).
        // "decode()" só resolve quando a imagem está de verdade pronta
        // pra ser desenhada, garantindo que o tamanho já é o definitivo
        // antes do Chrome calcular onde cada página termina.
        if (typeof img.decode === 'function') {
          try { await img.decode(); return; } catch (_) { /* cai no fallback abaixo */ }
        }
        if (img.complete) return;
        await new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }));
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      // Força o navegador a terminar de calcular o layout com os tamanhos
      // finais (imagens decodificadas, fontes prontas) antes de seguir —
      // ler uma medida força o "reflow"; dois quadros de animação
      // garantem que isso já foi pintado de verdade, não só agendado.
      document.body.getBoundingClientRect();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });

    await pagina.emulateMediaType('print');

    /* REDE DE SEGURANÇA contra "folha extra com só o número da página" (29/09 e 02/10/2026): depois do layout
       de impressão pronto, mede cada folha. Se alguma passou de uma A4 só por "casca" (padding/margem final,
       nenhum conteúdo visível além de 297mm), trava a folha em 297mm; se foi uma imagem grande demais, encolhe
       a imagem pelo excesso. Nunca corta conteúdo visível. O que foi ajustado volta no cabeçalho
       X-PDF-Ajustes (diagnóstico). */
    let ajustes = [];
    try {
      ajustes = await pagina.evaluate(AJUSTAR_EXCESSO_DAS_FOLHAS);
    } catch (e) {
      console.error('Ajuste de excesso das folhas falhou (segue sem ele):', e);
    }
    // Diagnóstico: quantas folhas (.rel-page) existem e quais passam de uma A4 (altura em mm, já em impressão).
    let folhas = null;
    try {
      folhas = await pagina.evaluate(() => {
        const mm = 96 / 25.4;
        const todas = Array.from(document.querySelectorAll('.rel-page'));
        return {
          total: todas.length,
          altas: todas.map((el, i) => ({ pagina: i + 1, classe: (el.className || '').replace('rel-page', '').trim(), altura: +(el.scrollHeight / mm).toFixed(1), caixa: +(el.getBoundingClientRect().height / mm).toFixed(1) }))
            .filter(f => f.altura > 297.5 || f.caixa > 297.5)
        };
      });
    } catch (e) { /* só diagnóstico */ }

    const opcoesPdf = {
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    };
    let pdf = await pagina.pdf(opcoesPdf);
    const contarPaginas = buf => (Buffer.from(buf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    let paginasPdf = contarPaginas(pdf);
    let corte = null;

    /* GARANTIA SEM CSS: o relatório tem N folhas (.rel-page) e cada uma deve virar UMA página do PDF. Se o PDF
       saiu com mais páginas que folhas (a "folha extra com só o número"), o Chrome partiu alguma folha em duas
       na hora de paginar — e isso só acontece na paginação de verdade, não dá pra prever medindo antes (foi
       medido: nenhuma folha "alta" e mesmo assim sobravam páginas). Então, quando isso acontece, refaz o PDF
       FOLHA POR FOLHA: mostra uma folha de cada vez, imprime só a 1ª página dela e junta tudo num PDF só
       (pdf-lib). Assim cada folha vira exatamente uma página, independente de como o Chrome pagina. Só deixa
       passar mais de uma página numa folha cujo conteúdo visível realmente passa de uma A4. Se algo falhar,
       devolve o PDF como saiu. */
    if (folhas && paginasPdf > folhas.total) {
      try {
        const cabe = await pagina.evaluate(MEDIR_SE_FOLHAS_CABEM);
        const { PDFDocument } = await import('pdf-lib');
        const final = await PDFDocument.create();
        for (let i = 0; i < folhas.total; i++) {
          await pagina.evaluate(indice => {
            Array.from(document.querySelectorAll('.rel-page')).forEach((el, k) => { el.style.display = (k === indice) ? '' : 'none'; });
          }, i);
          const parte = await pagina.pdf(cabe[i] ? Object.assign({}, opcoesPdf, { pageRanges: '1' }) : opcoesPdf);
          const docParte = await PDFDocument.load(parte);
          const copiadas = await final.copyPages(docParte, docParte.getPageIndices());
          copiadas.forEach(p => final.addPage(p));
        }
        const bytes = await final.save();
        const paginasFinal = final.getPageCount();
        if (paginasFinal >= folhas.total && paginasFinal < paginasPdf) {
          corte = { de: paginasPdf, para: paginasFinal, metodo: 'folha por folha' };
          pdf = Buffer.from(bytes);
          paginasPdf = paginasFinal;
        }
      } catch (e) {
        console.error('Refazer folha por folha falhou (devolve o PDF como saiu):', e);
      }
    }

    await navegador.close();
    navegador = null;

    res.setHeader('Content-Type', 'application/pdf');
    // Quantas páginas o PDF realmente tem (conta os objetos /Type /Page) x quantas folhas o relatório tem.
    res.setHeader('Access-Control-Expose-Headers', 'X-PDF-Ajustes, X-PDF-Diag');
    res.setHeader('X-PDF-Ajustes', encodeURIComponent(JSON.stringify(ajustes)).slice(0, 1500));
    res.setHeader('X-PDF-Diag', encodeURIComponent(JSON.stringify({ paginasPdf, folhas, corte })).slice(0, 1500));
    res.status(200).send(Buffer.from(pdf));
  } catch (err) {
    console.error('Erro ao gerar PDF do relatório:', err);
    if (navegador) { try { await navegador.close(); } catch (_) {} }
    res.status(500).json({ erro: 'Não foi possível gerar o PDF no servidor.' });
  }
};
