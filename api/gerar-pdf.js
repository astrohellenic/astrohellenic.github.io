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
      await Promise.all(imagens.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }));
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });

    await pagina.emulateMediaType('print');

    const pdf = await pagina.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    await navegador.close();
    navegador = null;

    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(Buffer.from(pdf));
  } catch (err) {
    console.error('Erro ao gerar PDF do relatório:', err);
    if (navegador) { try { await navegador.close(); } catch (_) {} }
    res.status(500).json({ erro: 'Não foi possível gerar o PDF no servidor.' });
  }
};
