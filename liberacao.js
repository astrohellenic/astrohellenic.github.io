/* ==========================================
   MÓDULO DE LIBERAÇÃO ZODIACAL (APHESIS)
   ========================================== */

let selectedZRPhase = "fortune"; // Fortuna como lote padrão inicial
let expandedL1Index = null; // Detectado automaticamente com base no momento atual
let expandedL2Key = null; // Guarda a chave do L2 expandido (ex: "0_2")
let expandedL3Key = null; // Guarda a chave do L3 expandido (ex: "0_2_1")

// Anos Helenísticos (Valens): Áries(15), Touro(8), Gêmeos(20), Câncer(25), Leão(19), Virgem(20), Libra(8), Escorpião(15), Sagitário(12), Capricórnio(27), Aquário(30), Peixes(12)
const ZR_SIGN_YEARS = [15, 8, 20, 25, 19, 20, 8, 15, 12, 27, 30, 12];

const MONOLINE_ZODIAC_SVGS_ZR = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,52V12c0,0,0-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" points="52,53 57,58 52,63 "></polyline>`,
  `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="1" y1="28" x2="36" y2="63"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
  `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="7" y1="32" x2="57" y2="32"></line>`
];

const SIGN_NAMES_ZR = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

/* Embrulha um SVG "solto" (string) numa <img src="data:image/svg+xml,...">
   em vez de deixar o <svg> direto no HTML. O html2canvas (usado pelo
   botão "Adicionar ao Relatório") tem bugs conhecidos com SVG inline
   dentro de tabelas aninhadas (some inteiro, sem nem dar erro) e com
   viewBox de origem negativa como "-12 -12 24 24" (ícone sai cortado) —
   os dois casos exatos dos ícones desta tela (signo dentro das tabelas
   L2/L3/L4, e o selo redondo do lote ativo). Como <img> vira só um
   desenho já pronto (o navegador rasteriza o SVG antes, fora do
   html2canvas), esses dois bugs somem. Precisa do "xmlns" — sem ele o
   SVG isolado numa data URI não é XML válido e não carrega como imagem
   (inline direto no HTML não precisa, mas isolado como recurso precisa). */
function svgComoImagemZR(svgInterno, largura, altura, viewBox) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="${viewBox}">${svgInterno}</svg>`;
  return `<img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="${largura}" height="${altura}" style="display: block; margin: 0 auto;" alt="">`;
}

/* Vira <img> (ver svgComoImagemZR), então não enxerga var(--x) do CSS —
   a cor certa (clara/escura) precisa vir já resolvida em hexadecimal. */
function getSignSVGZR(signIndex, size = 22) {
  if (signIndex < 0 || signIndex > 11) return '';
  const corSigno = corElementoSigno(signIndex); // cor do elemento: papiro.js (fonte única); resolvida em hexadecimal porque vira <img>
  const interno = `<g style="color: ${corSigno};">${MONOLINE_ZODIAC_SVGS_ZR[signIndex]}</g>`;
  return svgComoImagemZR(interno, size, size, '0 0 64 64');
}

const LOTE_ICON_KEY_LIB = {
  fortune: 'fortune', spirit: 'spirit', venus: 'eros',
  mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis'
};
function getLotIconSVG(lotKey) {
  if (typeof getIconeFragmento !== 'function') return '';
  const loteKey = LOTE_ICON_KEY_LIB[lotKey] || 'fortune';
  // Fundo creme fixo (não muda com o tema): o botão "Lote Ativo" usa
  // background: var(--bg-main), escuro no tema escuro — sem esse fundo,
  // os ícones simples com partes só de contorno (Necessidade/Eros, por
  // exemplo) ficam quase invisíveis nele, mesmo bug já visto e corrigido
  // na mandala principal.
  // Tema Céu (papiro): sem o círculo creme — o fundo é a própria folha de papiro.
  const papiro = typeof window !== 'undefined' && Tema.ceu();
  const frag = `${papiro ? '' : '<circle cx="50" cy="50" r="48" fill="#fffdf5"/>'}${getIconeFragmento('lote', loteKey)}`;
  return svgComoImagemZR(frag, 22, 22, '0 0 100 100');
}

/* ==========================================
   MINI MANDALA NATAL NO TOPO DA LIBERAÇÃO ZODIACAL
   ==========================================
   Desenhada pela roda central (desenharRodaSVG, roda.js) — ver gerarMandalaNatalZR mais abaixo. Aqui ficam só os ids de SVG por
   instância (a mandala não pode colidir com os mesmos ids fixos usados pela mandala principal) e o planeta. */

let wheelInstanceCounterZR = 0;

/* Regente de cada signo (mesma ordem/fonte de SIGNS em profeccao.js) —
   usado para desenhar a coroa sobre o regente do signo destacado de
   cada nível (L1/L2/L3/L4) da Liberação Zodiacal. */
const SIGNS_RULERS_ZR = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

function construirDefsPlanetasZR(sufixo) {
  return `
      <radialGradient id="combustionGlow_${sufixo}" cx="50%" cy="50%" r="50%">
          ${combustaoStopsAuto()}
      </radialGradient>
  `;
}

function fragmentoPlaneta3DZR(planetId, sufixo) {
  return (typeof getIconeFragmento === 'function') ? getIconeFragmento('planeta', planetId) : '';
}

/* Mandala natal da Liberação em SVG — desenhada pela RODA CENTRAL (desenharRodaSVG, roda.js), a mesma de todas as ferramentas: o
   estilo (francês / Astro Hellenic) e o desenho em si moram lá. Aqui ficam só as coisas DESTA ferramenta: os 4 níveis da árvore
   (fatias + etiquetas em faixa + coroas com o número do nível), os rótulos de PICO e SALTO e as cores deles. Casa 1 sempre num lote. */
function gerarMandalaNatalZR(dados, opcoes = {}) {
  if (!dados || !dados.Ascendente) {
    return `<div style="padding: 40px 10px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`;
  }

  const l1SignIdx = (opcoes.l1SignIdx !== undefined) ? opcoes.l1SignIdx : null;
  const l2SignIdx = (opcoes.l2SignIdx !== undefined) ? opcoes.l2SignIdx : null;
  const l3SignIdx = (opcoes.l3SignIdx !== undefined) ? opcoes.l3SignIdx : null;
  const l4SignIdx = (opcoes.l4SignIdx !== undefined) ? opcoes.l4SignIdx : null;
  /* Signo onde vai cair o Salto (Lysis) de cada nível, dentro do período ATIVO do nível pai — independente de "agora" já ter
     chegado lá ou não (estrutural, não temporal: mesma lógica do PICO, só que a referência do salto é o signo ativo do nível
     acima, não a Fortuna). null quando o período pai é curto demais pra sequer chegar num salto. L1 nunca tem. */
  const l2SaltoSignIdx = (opcoes.l2SaltoSignIdx !== undefined) ? opcoes.l2SaltoSignIdx : null;
  const l3SaltoSignIdx = (opcoes.l3SaltoSignIdx !== undefined) ? opcoes.l3SaltoSignIdx : null;
  const l4SaltoSignIdx = (opcoes.l4SaltoSignIdx !== undefined) ? opcoes.l4SaltoSignIdx : null;
  /* Chave do lote (fortune/spirit/venus/...) a colocar na Casa 1 do desenho, no lugar do Ascendente — mesma lógica de
     alternarRotacaoCasa1/selectedHouse1Lot em mandala.js, só que aqui não tem opção "ASC": a Liberação sempre gira em torno de um lote. */
  const loteCasa1 = (opcoes.loteCasa1 !== undefined) ? opcoes.loteCasa1 : null;

  /* Cores PRÓPRIAS da Liberação (pico, salto, rótulo das coroas), todas da paleta de época: sem preenchimento, só contorno e letra.
     PICO em azul egípcio escuro, SALTO em terracota; o rótulo das coroas em azul egípcio escuro. */
  const papiro = typeof window !== 'undefined' && Tema.ceu();
  const palZ = paletaEpoca(Tema.nomePaleta(!papiro && Tema.modoEscuro()));
  const cores = {
    picoBg: 'none', picoBorder: palZ.azulEscuro, picoText: palZ.azulEscuro,
    saltoBg: 'none', saltoBorder: palZ.terracota, saltoText: palZ.terracota, saltoLabel: palZ.terracota, navio: palZ.azulEscuro,
  };

  const sufixo = `zr${wheelInstanceCounterZR++}`;

  /* RÓTULOS DE PICO E SALTO — ficam na mesma faixa de raio das barrinhas coloridas dos níveis, desenhados por cima delas. PICO: os
     signos das casas 1, 4, 7 e 10 a partir da Fortuna (sempre a Fortuna, nunca o lote da Casa 1 nem o ativo na árvore). SALTO:
     estrutural — onde o Lysis de cada nível VAI cair; quando mais de um nível cai no mesmo signo, dividem um badge só (números unidos
     por "-"). Quando o MESMO signo tem pico e salto, os badges são deslocados: um acima/abaixo do outro no lado esquerdo/direito da
     roda, e um do lado do outro em cima/embaixo. A posição (raio) vem do estilo da mandala (ctx.raioDestaque). */
  const rotulosPicoSalto = (ctx) => {
    const { cx, cy, house1RefAbs, raioDestaque, lotes, tinta } = ctx;
    const fortSignIdx = Math.floor(lotes.find(l => l.key === "fortune").deg / 30);
    const picoSigns = [fortSignIdx, (fortSignIdx + 3) % 12, (fortSignIdx + 6) % 12, (fortSignIdx + 9) % 12];
    const rPico = raioDestaque + 23;
    const signosComPico = new Set(picoSigns);

    const niveisSaltoPorSigno = {};
    [[2, l2SaltoSignIdx], [3, l3SaltoSignIdx], [4, l4SaltoSignIdx]].forEach(([nivel, signIdx]) => {
      if (signIdx === null || signIdx === undefined) return;
      if (!niveisSaltoPorSigno[signIdx]) niveisSaltoPorSigno[signIdx] = [];
      niveisSaltoPorSigno[signIdx].push(nivel);
    });
    const signosComSalto = new Set(Object.keys(niveisSaltoPorSigno).map(Number));

    function deslocamentoBadges(signIdx) {
      const aScreen = eclToScreenAngle((signIdx * 30) + 15, house1RefAbs);
      const rad = aScreen * Math.PI / 180;
      const ladoEsquerdoOuDireito = Math.abs(Math.cos(rad)) > Math.abs(Math.sin(rad));
      return ladoEsquerdoOuDireito
        ? { pico: { x: 0, y: -14 }, salto: { x: 0, y: 14 } }
        : { pico: { x: -19, y: 0 }, salto: { x: 19, y: 0 } };
    }

    let out = '';
    picoSigns.forEach(signIdx => {
      const desloc = signosComSalto.has(signIdx) ? deslocamentoBadges(signIdx).pico : { x: 0, y: 0 };
      const aScreenPico = eclToScreenAngle((signIdx * 30) + 15, house1RefAbs);
      const pPico = polarToCart(cx, cy, rPico, aScreenPico);
      out += `<g transform="translate(${pPico.x + desloc.x}, ${pPico.y + desloc.y})">
        <rect x="-17" y="-7" width="34" height="14" fill="${cores.picoBg}" stroke="${cores.picoBorder}" stroke-width="1"/>
        <text x="0" y="3.2" font-size="8" font-weight="800" fill="${cores.picoText}" text-anchor="middle" font-family="'Montserrat', sans-serif">PICO</text>
    </g>`;
    });

    Object.keys(niveisSaltoPorSigno).forEach(signIdxKey => {
      const signIdx = Number(signIdxKey);
      const desloc = signosComPico.has(signIdx) ? deslocamentoBadges(signIdx).salto : { x: 0, y: 0 };
      const aScreenSalto = eclToScreenAngle((signIdx * 30) + 15, house1RefAbs);
      const pSalto = polarToCart(cx, cy, rPico, aScreenSalto);
      const rotuloNiveisSalto = niveisSaltoPorSigno[signIdxKey].join('-');
      out += `<g transform="translate(${pSalto.x + desloc.x}, ${pSalto.y + desloc.y})">
        <text x="0" y="-11" font-size="8" font-weight="900" fill="${cores.saltoLabel}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="2" paint-order="stroke fill">${rotuloNiveisSalto}</text>
        <rect x="-17" y="-7" width="34" height="14" fill="${cores.saltoBg}" stroke="${cores.saltoBorder}" stroke-width="1"/>
        <text x="0" y="3.2" font-size="8" font-weight="800" fill="${cores.saltoText}" text-anchor="middle" font-family="'Montserrat', sans-serif">SALTO</text>
    </g>`;
    });
    return out;
  };

  /* COROA SOBRE O REGENTE DE CADA NÍVEL DESTACADO (L1/L2/L3/L4). Quando o mesmo planeta rege mais de um nível ao mesmo tempo, ele
     recebe UMA coroa só — o número acima dela é que muda, juntando os níveis com "-" (ex.: "1-3"). */
  const niveisPorRegente = {};
  [[1, l1SignIdx], [2, l2SignIdx], [3, l3SignIdx], [4, l4SignIdx]].forEach(([nivel, signIdx]) => {
    if (signIdx === null || signIdx === undefined || !SIGNS_RULERS_ZR[signIdx]) return;
    const rulerId = SIGNS_RULERS_ZR[signIdx];
    if (!niveisPorRegente[rulerId]) niveisPorRegente[rulerId] = [];
    niveisPorRegente[rulerId].push(nivel);
  });
  const coroas = Object.keys(niveisPorRegente).map(rulerId => ({
    rulerId,
    rotulo: { texto: niveisPorRegente[rulerId].join('-'), cor: cores.navio },
    preenchimento: 'none', contorno: palZ.terracota, espessura: 1.4, ponto: palZ.terracota
  }));

  return desenharRodaSVG({
    tintaPapiro: papiro,
    ferramenta: {
      dados, loteCasa1,
      folgaCanvas: 55, // quatro níveis de etiqueta por fora (até raioDestaque + 42) pedem mais folga que a Profecção (três)
      fundoDisco: papiro ? 'none' : palZ.fundoCreme, // o disco tem a cor do painel por baixo
      abertura: ({ canvasSize, fundoDisco }) => `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; margin: 0 auto;">
      <defs>${construirDefsPlanetasZR(sufixo)}</defs>
      <rect width="${canvasSize}" height="${canvasSize}" fill="${fundoDisco}"/>`,
      fragmentoPlaneta: (id) => fragmentoPlaneta3DZR(id, sufixo),
      glowSol: (pos, raio, tinta) => `<circle cx="${pos.x}" cy="${pos.y}" r="${raio}" fill="${tinta.fundoDisco}"/>` +
        `<circle cx="${pos.x}" cy="${pos.y}" r="${raio}" fill="url(#combustionGlow_${sufixo})"/>`,
      destaques: {
        // fatias por baixo de tudo, do nível mais fundo (4) pro mais alto (1): as cores dos níveis são as mesmas em toda mandala (corNivelMandala)
        fatias: [
          { signIdx: l4SignIdx, cor: corNivelMandala(4, 0.40) },
          { signIdx: l3SignIdx, cor: corNivelMandala(3, 0.40) },
          { signIdx: l2SignIdx, cor: corNivelMandala(2, 0.40) },
          { signIdx: l1SignIdx, cor: corNivelMandala(1, 0.40) }
        ],
        faixas: [
          { signIdx: l4SignIdx, cor: corNivelMandala(4), de: 4, ate: 12 },
          { signIdx: l3SignIdx, cor: corNivelMandala(3), de: 14, ate: 22 },
          { signIdx: l2SignIdx, cor: corNivelMandala(2), de: 24, ate: 32 },
          { signIdx: l1SignIdx, cor: corNivelMandala(1), de: 34, ate: 42 }
        ],
        depoisDasFaixas: rotulosPicoSalto,
        coroas
      }
    }
  }).svg;
}

function iniciarModuloLiberacao() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  renderLiberacaoUI();
}

function alternarLoteLiberacao(lotKey) {
  selectedZRPhase = lotKey;
  expandedL1Index = null;
  expandedL2Key = null;
  expandedL3Key = null;
  renderLiberacaoUI();
}

function alternarL1Accordion(index) {
  expandedL1Index = (expandedL1Index === index) ? null : index;
  expandedL2Key = null;
  expandedL3Key = null;
  renderLiberacaoUI();
}

function alternarL2Accordion(l1Idx, l2Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}`;
  expandedL2Key = (expandedL2Key === key) ? null : key;
  expandedL3Key = null;
  renderLiberacaoUI();
}

function alternarL3Accordion(l1Idx, l2Idx, l3Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}_${l3Idx}`;
  expandedL3Key = (expandedL3Key === key) ? null : key;
  renderLiberacaoUI();
}

function calcularDataFimZR(dataInicio, anos) {
  const totalDias = anos * 360;
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + totalDias);
  return dataFim;
}

function formatarDataBR(data) {
  if (!data) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  return `${d}/${m}/${a}`;
}

// FORMATAÇÃO COM DATA E HORÁRIO EMPILHADOS PARA L3 E L4
function formatarDataHoraBR(data) {
  if (!data) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  const hh = String(data.getHours()).padStart(2, '0');
  const mm = String(data.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${a}<br><span style="font-size: 9px; opacity: 0.8; font-weight: 500;">${hh}:${mm}h</span>`;
}

// CÁLCULO DOS SUBPERÍODOS DO L2 (Meses de 30 dias)
function calcularSubperiodosL2(l1SignIdx, l1Start, l1Years) {
  const subperiodos = [];
  const l1Days = l1Years * 360;
  const l1End = new Date(l1Start.getTime() + l1Days * 24 * 60 * 60 * 1000);

  let currSign = l1SignIdx;
  let currStart = new Date(l1Start);
  let count = 0;

  while (currStart < l1End) {
    if (count === 12) {
      currSign = (l1SignIdx + 6) % 12; // Salto (Lysis)
    }

    const months = ZR_SIGN_YEARS[currSign];
    const days = months * 30;
    let currEnd = new Date(currStart.getTime() + days * 24 * 60 * 60 * 1000);

    let isClamped = false;
    if (currEnd > l1End) {
      currEnd = new Date(l1End);
      isClamped = true;
    }

    subperiodos.push({
      signIdx: currSign,
      months: months,
      days: days,
      start: new Date(currStart),
      end: new Date(currEnd),
      isLysis: (count === 12)
    });

    if (isClamped) break;

    currStart = new Date(currEnd);
    currSign = (currSign + 1) % 12;
    count++;
  }

  return subperiodos;
}

// CÁLCULO DOS SUBPERÍODOS DO L3 (Cada unidade do signo = 2.5 dias)
function calcularSubperiodosL3(l2SignIdx, l2Start, l2End) {
  const subperiodos = [];
  let currSign = l2SignIdx;
  let currStart = new Date(l2Start);
  let count = 0;

  while (currStart < l2End) {
    if (count === 12) {
      currSign = (l2SignIdx + 6) % 12; // Salto (Lysis)
    }

    const yearsVal = ZR_SIGN_YEARS[currSign];
    const totalDaysL3 = yearsVal * 2.5;
    let currEnd = new Date(currStart.getTime() + totalDaysL3 * 24 * 60 * 60 * 1000);

    let isClamped = false;
    if (currEnd > l2End) {
      currEnd = new Date(l2End);
      isClamped = true;
    }

    subperiodos.push({
      signIdx: currSign,
      days: totalDaysL3,
      start: new Date(currStart),
      end: new Date(currEnd),
      isLysis: (count === 12)
    });

    if (isClamped) break;

    currStart = new Date(currEnd);
    currSign = (currSign + 1) % 12;
    count++;
  }

  return subperiodos;
}

// CÁLCULO DOS SUBPERÍODOS DO L4 (Cada unidade do signo = 5 horas)
function calcularSubperiodosL4(l3SignIdx, l3Start, l3End) {
  const subperiodos = [];
  let currSign = l3SignIdx;
  let currStart = new Date(l3Start);
  let count = 0;

  while (currStart < l3End) {
    if (count === 12) {
      currSign = (l3SignIdx + 6) % 12; // Salto (Lysis)
    }

    const yearsVal = ZR_SIGN_YEARS[currSign];
    const totalHoursL4 = yearsVal * 5;
    let currEnd = new Date(currStart.getTime() + totalHoursL4 * 60 * 60 * 1000);

    let isClamped = false;
    if (currEnd > l3End) {
      currEnd = new Date(l3End);
      isClamped = true;
    }

    subperiodos.push({
      signIdx: currSign,
      hours: totalHoursL4,
      start: new Date(currStart),
      end: new Date(currEnd),
      isLysis: (count === 12)
    });

    if (isClamped) break;

    currStart = new Date(currEnd);
    currSign = (currSign + 1) % 12;
    count++;
  }

  return subperiodos;
}

function renderLiberacaoUI() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  const data = currentCalculatedData;
  const ascAbs = data.Ascendente.grau_absoluto;

  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0 };
  });

  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  const lotes = calculateSevenLots(ascAbs, isDay, pObj);

  const fortLot = lotes.find(l => l.key === "fortune");
  const fortSignIdx = Math.floor(fortLot.deg / 30);
  const angularSignsFromFort = [
    fortSignIdx,
    (fortSignIdx + 3) % 12,
    (fortSignIdx + 6) % 12,
    (fortSignIdx + 9) % 12
  ];

  const activeLotObj = lotes.find(l => l.key === selectedZRPhase) || fortLot;
  const signoEspirito = Math.floor(lotes.find(l => l.key === "spirit").deg / 30);
  let startSignIdx;
  if (selectedZRPhase === "spirit" && signoEspirito === fortSignIdx) {
    // Valens, Anthology IV.V: quando Espírito e Fortuna caem no mesmo signo
    // (Lua Nova/Cheia exata), a contagem de L1 do Espírito começa no signo seguinte.
    startSignIdx = (signoEspirito + 1) % 12;
  } else {
    startSignIdx = Math.floor(activeLotObj.deg / 30);
  }

  // DETECÇÃO AUTOMÁTICA DO L1 ATIVO SE NENHUM ESTIVER EXPANDIDO MANUALMENTE
  const hoje = new Date();
  if (expandedL1Index === null) {
    let checkStart = new Date(currentMoment);
    for (let i = 0; i < 12; i++) {
      const currSign = (startSignIdx + i) % 12;
      const durationYears = ZR_SIGN_YEARS[currSign];
      const checkEnd = calcularDataFimZR(checkStart, durationYears);

      if (hoje >= checkStart && hoje < checkEnd) {
        expandedL1Index = i;
        break;
      }
      checkStart = new Date(checkEnd);
    }
    if (expandedL1Index === null) expandedL1Index = 0; // Fallback
  }

  // DETECÇÃO AUTOMÁTICA DO L2/L3 ATIVOS (mesmo princípio do L1: já abre no
  // subperíodo do momento atual, em cascata, sem precisar clicar).
  if (expandedL2Key === null || expandedL3Key === null) {
    let l1Start = new Date(currentMoment);
    let l1Sign = startSignIdx;
    let l1Years = ZR_SIGN_YEARS[l1Sign];
    for (let i = 0; i <= expandedL1Index; i++) {
      const currSign = (startSignIdx + i) % 12;
      const durationYears = ZR_SIGN_YEARS[currSign];
      const currentEnd = calcularDataFimZR(l1Start, durationYears);
      if (i === expandedL1Index) {
        l1Sign = currSign;
        l1Years = durationYears;
      } else {
        l1Start = new Date(currentEnd);
      }
    }

    const subperiodosL2Auto = calcularSubperiodosL2(l1Sign, l1Start, l1Years);

    if (expandedL2Key === null) {
      const idxL2 = subperiodosL2Auto.findIndex(sub => hoje >= sub.start && hoje < sub.end);
      if (idxL2 !== -1) expandedL2Key = `${expandedL1Index}_${idxL2}`;
    }

    if (expandedL2Key !== null && expandedL3Key === null) {
      const [l1IdxKey, l2IdxKey] = expandedL2Key.split('_').map(Number);
      if (l1IdxKey === expandedL1Index) {
        const l2Sub = subperiodosL2Auto[l2IdxKey];
        if (l2Sub) {
          const subperiodosL3Auto = calcularSubperiodosL3(l2Sub.signIdx, l2Sub.start, l2Sub.end);
          const idxL3 = subperiodosL3Auto.findIndex(sub => hoje >= sub.start && hoje < sub.end);
          if (idxL3 !== -1) expandedL3Key = `${l1IdxKey}_${l2IdxKey}_${idxL3}`;
        }
      }
    }
  }

  /* DESCOBRE O SIGNO ABERTO DE CADA NÍVEL (L1/L2/L3/L4), PRA PINTAR A
     MANDALA NO TOPO COM O MESMO TOM DA LINHA CORRESPONDENTE NA ÁRVORE
     ABAIXO. Espelha exatamente as mesmas condições (isExpanded/
     isL2Expanded/isL3Expanded, e "hoje" pro L4) que o loop de
     renderização mais abaixo usa pra decidir qual linha pintar — precisa
     ser calculado aqui porque a mandala é desenhada antes da árvore.
     L4 não tem estado de expansão próprio (as linhas L4 aparecem todas
     de uma vez, sem acordeão): "ativo" ali significa a única linha cujo
     intervalo contém o momento atual. */
  let l1HighlightSignIdx = null;
  let l2HighlightSignIdx = null;
  let l3HighlightSignIdx = null;
  let l4HighlightSignIdx = null;
  /* Onde o Lysis de cada nível VAI cair, dentro do período ativo do
     nível pai — estrutural, não temporal: existe mesmo que "agora"
     ainda não tenha chegado nesse subperíodo específico (ou nunca vá
     chegar, se o salto cair fora do período pai). null quando o
     período pai é curto demais pra sequer conter um salto. L1 nunca
     tem (é o topo da hierarquia, não subdivide nada). */
  let l2SaltoSignIdx = null;
  let l3SaltoSignIdx = null;
  let l4SaltoSignIdx = null;
  {
    let detStart = new Date(currentMoment);
    for (let i = 0; i < 12; i++) {
      const detSign = (startSignIdx + i) % 12;
      const detYears = ZR_SIGN_YEARS[detSign];
      const detEnd = calcularDataFimZR(detStart, detYears);

      if (i === expandedL1Index) {
        l1HighlightSignIdx = detSign;
        const detSubL2 = calcularSubperiodosL2(detSign, detStart, detYears);
        const lysisL2 = detSubL2.find(sub => sub.isLysis);
        if (lysisL2) l2SaltoSignIdx = lysisL2.signIdx;

        detSubL2.forEach((sub, sIdx) => {
          if (expandedL2Key === `${i}_${sIdx}`) {
            l2HighlightSignIdx = sub.signIdx;
            const detSubL3 = calcularSubperiodosL3(sub.signIdx, sub.start, sub.end);
            const lysisL3 = detSubL3.find(subL3 => subL3.isLysis);
            if (lysisL3) l3SaltoSignIdx = lysisL3.signIdx;

            detSubL3.forEach((subL3, l3Idx) => {
              if (expandedL3Key === `${i}_${sIdx}_${l3Idx}`) {
                l3HighlightSignIdx = subL3.signIdx;
                const detSubL4 = calcularSubperiodosL4(subL3.signIdx, subL3.start, subL3.end);
                const lysisL4 = detSubL4.find(subL4 => subL4.isLysis);
                if (lysisL4) l4SaltoSignIdx = lysisL4.signIdx;

                const l4Ativo = detSubL4.find(subL4 => hoje >= subL4.start && hoje < subL4.end);
                if (l4Ativo) l4HighlightSignIdx = l4Ativo.signIdx;
              }
            });
          }
        });
      }

      detStart = new Date(detEnd);
    }
  }

  const lotesInfo = [
    { key: "fortune" },
    { key: "spirit" },
    { key: "venus" },
    { key: "mercury" },
    { key: "mars" },
    { key: "jupiter" },
    { key: "saturn" }
  ];

  const loteLabelsZR = {
    fortune: "Lote da Fortuna", spirit: "Lote do Espírito", venus: "Lote de Eros",
    mercury: "Lote da Necessidade", mars: "Lote da Coragem", jupiter: "Lote da Vitória", saturn: "Lote de Nêmesis"
  };

  /* CABEÇALHO COM OS MESMOS DADOS DO MAPA (mesma fonte que a mandala usa) */
  const headerTitle = currentSubjectName;
  const diasSemanaZRLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diaSemanaFormatted = diasSemanaZRLabels[currentMoment.getDay()];
  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
  const anoH = currentMoment.getFullYear();
  const mesH = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const diaH = String(currentMoment.getDate()).padStart(2, '0');
  const horaH = String(currentMoment.getHours()).padStart(2, '0');
  const minH = String(currentMoment.getMinutes()).padStart(2, '0');

  const loteMenuRowsHTML = lotesInfo.map(l => {
    const label = loteLabelsZR[l.key] || l.key;
    return `<div onclick="alternarLoteLiberacao('${l.key}')" title="${escapeHtml(label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center; color: var(--azul-egipcio-escuro);">${getLotIconSVG(l.key)}</div>`;
  }).join('');

  const svgGaleriaZ = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  const svgRelatorioZ = '<svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';
  const seloPico = (extra) => `<span class="selo"${extra ? ` style="${extra}"` : ''}>PICO</span>`;
  const seloSalto = (extra) => `<span class="selo salto"${extra ? ` style="${extra}"` : ''}>SALTO</span>`;

  let html = `
    <div style="width: 100%;">
    <div class="lib-outer painel" id="liberacao-container" style="width: 100%; min-height: 100%; font-family: 'Montserrat', sans-serif;">

      <div id="liberacaoHeaderCapture">
        <!-- Título, e na mesma linha os botões: lote ativo (Casa 1), salvar na galeria e enviar ao relatório. -->
        <div class="cabeca-ferramenta">
          <h3 class="lib-titulo titulo-ferramenta">Liberação Zodiacal</h3>
          <div class="acoes-ferramenta">
            <div style="position: relative; flex-shrink: 0;">
              <button type="button" class="botao-icone" onclick="const menu=document.getElementById('liberacaoLoteMenu'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" title="Lote da Casa 1">
                ${getLotIconSVG(selectedZRPhase)}
              </button>
              <div id="liberacaoLoteMenu" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; width: 44px; box-sizing: border-box; max-height: 260px; overflow-y: auto;">
                ${loteMenuRowsHTML}
              </div>
            </div>
            <button type="button" class="botao-icone" onclick="salvarLiberacaoNaGaleria()" title="Salvar a ferramenta inteira como imagem na galeria (com título e cabeçalho)">${svgGaleriaZ}</button>
            <div style="position: relative; flex-shrink: 0;">
              <button type="button" class="botao-icone" onclick="const m=document.getElementById('liberacaoMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório">${svgRelatorioZ}</button>
              <div id="liberacaoMenuRelatorio" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; min-width: 230px;">
                <div class="item-menu" onclick="capturarLiberacaoParaRelatorio('inteira')">Ferramenta inteira (com cabeçalho)</div>
                <div class="item-menu" onclick="capturarLiberacaoParaRelatorio('mandala')">Só a mandala (com cabeçalho)</div>
                <div class="item-menu" onclick="capturarLiberacaoParaRelatorio('tabela')">Só a tabela</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CABEÇALHO PADRÃO (o mesmo de todas as ferramentas), com "Lote tal na Casa 1": a Liberação sempre gira em torno de um lote. -->
        ${montarCabecalhoMandalaImagemHTML(currentCalculatedData, 'liberacaoCabecalhoPadrao', { loteCasa1: selectedZRPhase, tintaSobreFolha: true })}
      </div>

      <div id="liberacaoMandalaCapture" class="cartao" style="width: 100%; margin: 0 0 20px; padding: 12px 10px; box-sizing: border-box;">
        <!-- A mandala fica como SVG (vetorial); as imagens pra galeria/relatório saem dela direto (ver montarImagemLiberacao). -->
        <div id="liberacaoMandalaImgHost">
          <div style="max-width: 480px; margin: 0 auto;">
            ${gerarMandalaNatalZR(currentCalculatedData, {
              loteCasa1: selectedZRPhase,
              l1SignIdx: l1HighlightSignIdx,
              l2SignIdx: l2HighlightSignIdx,
              l3SignIdx: l3HighlightSignIdx,
              l4SignIdx: l4HighlightSignIdx,
              l2SaltoSignIdx: l2SaltoSignIdx,
              l3SaltoSignIdx: l3SaltoSignIdx,
              l4SaltoSignIdx: l4SaltoSignIdx
            })}
          </div>
        </div>
      </div>

      <hr class="divisa">

      <div id="liberacaoArvoreCapture">
  `;

  let currentStart = new Date(currentMoment);

  for (let i = 0; i < 12; i++) {
    const currSign = (startSignIdx + i) % 12;
    const durationYears = ZR_SIGN_YEARS[currSign];
    const currentEnd = calcularDataFimZR(currentStart, durationYears);
    const isExpanded = (expandedL1Index === i);
    const subperiodosL2 = calcularSubperiodosL2(currSign, currentStart, durationYears);

    const isPeakL1 = angularSignsFromFort.includes(currSign);

    // Nível 1: um cartão (linha em cima e embaixo); o aberto leva a marca terracota na margem e o nome em terracota.
    html += `
      <div class="cartao${isExpanded ? ' ativo' : ''}" style="margin-bottom: 12px; padding: 0;">
        <div onclick="alternarL1Accordion(${i})" style="padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; user-select: none;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${getSignSVGZR(currSign, 24)}
            <div>
              <span class="nome-nivel">Nível 1: ${SIGN_NAMES_ZR[currSign].toUpperCase()}</span>
              <span class="texto-apagado" style="font-size: 12px; margin-left: 6px;">${durationYears} Anos</span>
              ${isPeakL1 ? seloPico('margin-left: 8px;') : ''}
            </div>
          </div>
          <strong class="texto-apagado" style="font-size: 12px;">${formatarDataBR(currentStart)} a ${formatarDataBR(currentEnd)}</strong>
        </div>
    `;

    if (isExpanded) {
      html += `
        <div class="envolve-tabela" style="padding: 0 10px 10px;">
          <table class="tabela-epoca" style="font-size: 12px;">
            <thead>
              <tr>
                <th class="centro">Nível 2 Subperíodo</th>
                <th>Duração</th>
                <th>Início</th>
                <th>Término</th>
                <th class="centro">Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      subperiodosL2.forEach((sub, sIdx) => {
        const isL2Expanded = (expandedL2Key === `${i}_${sIdx}`);
        const isPeakL2 = angularSignsFromFort.includes(sub.signIdx);
        const statusL2 = (sub.isLysis ? seloSalto('margin-right: 4px;') : '') + (isPeakL2 ? seloPico() : '');

        html += `
          <tr class="clicavel${isL2Expanded ? ' ativa aberta' : ''}" onclick="alternarL2Accordion(${i}, ${sIdx}, event)">
            <td class="centro">${signoComNome(getSignSVGZR(sub.signIdx, 20), sub.signIdx)}</td>
            <td>${sub.months} Meses (${sub.days} Dias)</td>
            <td>${formatarDataBR(sub.start)}</td>
            <td>${formatarDataBR(sub.end)}</td>
            <td class="centro">${statusL2}</td>
          </tr>
        `;

        if (isL2Expanded) {
          const subperiodosL3 = calcularSubperiodosL3(sub.signIdx, sub.start, sub.end);
          html += `
            <tr>
              <td colspan="5" class="encaixe">
                <table class="tabela-epoca" style="font-size: 11px;">
                  <thead>
                    <tr>
                      <th class="centro">Nível 3 Subperíodo</th>
                      <th>Duração</th>
                      <th>Início</th>
                      <th>Término</th>
                      <th class="centro">Status</th>
                    </tr>
                  </thead>
                  <tbody>
          `;

          subperiodosL3.forEach((subL3, l3Idx) => {
            const isL3Expanded = (expandedL3Key === `${i}_${sIdx}_${l3Idx}`);
            const isPeakL3 = angularSignsFromFort.includes(subL3.signIdx);
            const statusL3 = (subL3.isLysis ? seloSalto('margin-right: 4px; font-size: 9px;') : '') + (isPeakL3 ? seloPico('font-size: 9px;') : '');

            html += `
              <tr class="clicavel${isL3Expanded ? ' ativa aberta' : ''}" onclick="alternarL3Accordion(${i}, ${sIdx}, ${l3Idx}, event)">
                <td class="centro">${signoComNome(getSignSVGZR(subL3.signIdx, 18), subL3.signIdx)}</td>
                <td>${subL3.days} Dias</td>
                <td style="line-height: 1.2;">${formatarDataHoraBR(subL3.start)}</td>
                <td style="line-height: 1.2;">${formatarDataHoraBR(subL3.end)}</td>
                <td class="centro">${statusL3}</td>
              </tr>
            `;

            if (isL3Expanded) {
              const subperiodosL4 = calcularSubperiodosL4(subL3.signIdx, subL3.start, subL3.end);
              html += `
                <tr>
                  <td colspan="5" class="encaixe">
                    <table class="tabela-epoca" style="font-size: 10px;">
                      <thead>
                        <tr>
                          <th class="centro">Nível 4 Subperíodo</th>
                          <th>Duração</th>
                          <th>Início</th>
                          <th>Término</th>
                          <th class="centro">Status</th>
                        </tr>
                      </thead>
                      <tbody>
              `;

              subperiodosL4.forEach((subL4, l4Idx) => {
                const isL4Ativo = (hoje >= subL4.start && hoje < subL4.end);
                const isPeakL4 = angularSignsFromFort.includes(subL4.signIdx);
                const statusL4 = (subL4.isLysis ? seloSalto('margin-right: 3px; font-size: 8px;') : '') + (isPeakL4 ? seloPico('font-size: 8px;') : '');

                html += `
                  <tr${isL4Ativo ? ' class="ativa"' : ''}>
                    <td class="centro">${signoComNome(getSignSVGZR(subL4.signIdx, 16), subL4.signIdx)}</td>
                    <td>${subL4.hours} Horas</td>
                    <td style="line-height: 1.2;">${formatarDataHoraBR(subL4.start)}</td>
                    <td style="line-height: 1.2;">${formatarDataHoraBR(subL4.end)}</td>
                    <td class="centro">${statusL4}</td>
                  </tr>
                `;
              });

              html += `
                      </tbody>
                    </table>
                  </td>
                </tr>
              `;
            }
          });

          html += `
                  </tbody>
                </table>
              </td>
            </tr>
          `;
        }
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `</div>`;
    currentStart = new Date(currentEnd);
  }

  html += `
      </div>
      <hr class="divisa">
    </div>
    </div>
  `;

  container.innerHTML = html;
  encolherTabelasLZRVisiveis(container);
}


/* IMAGENS DA LIBERAÇÃO (galeria e relatório). Título + cabeçalho padrão +
   cartão da mandala saem direto do SVG (rápido); a tabela (árvore L1-L4) é
   HTML, então é a única parte que passa pelo html2canvas. "opc": {titulo,
   cabecalho, mandala, tabela} (booleanos). Devolve o canvas (escala 2). */
/* Tema Céu: a imagem sai sobre o papiro (cor chapada, pra o recorte automático achar a borda), tanto no modo
   claro quanto no escuro — a tela já é papiro nos dois. */
function fundoCapturaLiberacao() {
  // Imagem pro RELATÓRIO (window.__capturaSemFundo ligado só durante a captura): sem fundo nenhum, só as linhas em tinta.
  if (typeof window !== 'undefined' && Tema.ceu()) return window.__capturaSemFundo ? null : papiroCores().chapado;
  return Tema.fundoPainel();
}

async function montarImagemLiberacao(opc) {
  const papiro = typeof window !== 'undefined' && Tema.ceu();
  const modoEscuro = !papiro && Tema.modoEscuro();
  const fundo = fundoCapturaLiberacao();
  const arvoreEl = document.getElementById('liberacaoArvoreCapture');
  const cardEl = document.getElementById('liberacaoMandalaCapture');
  const roda = cardEl && cardEl.querySelector('svg');
  const W = (opc.tabela && arvoreEl) ? Math.max(320, Math.round(arvoreEl.getBoundingClientRect().width)) : 960;

  let y = 0, partes = '';
  const cores = papiro ? coresCabecalhoTinta() : coresCabecalhoMandala(modoEscuro, null);
  if (opc.titulo) {
    partes += `<text x="${W / 2}" y="26" text-anchor="middle" font-family="serif" font-size="20" font-weight="800" letter-spacing="1" fill="${cores.titulo}">LIBERAÇÃO ZODIACAL</text>`;
    y += 44;
  }
  if (opc.cabecalho) {
    const k = Math.min(1, W / 960);
    const grupo = montarCabecalhoMandalaGrupoSVG(currentCalculatedData, 2, cores, selectedZRPhase)
      .replace(/'Cinzel', serif/g, 'serif').replace(/'Montserrat', sans-serif/g, 'sans-serif');
    partes += `<g transform="translate(${(W - 960 * k) / 2}, ${y}) scale(${k})">${grupo}</g>`;
    y += (79 * k) + 16;
  }
  if (opc.mandala && roda) {
    const cs = getComputedStyle(cardEl);
    const borda = parseFloat(cs.borderTopWidth) || 0, raio = parseFloat(cs.borderTopLeftRadius) || 0;
    const roda_s = Math.min(480, W - 24);
    const alturaCartao = roda_s + 24;
    const svgRoda = new XMLSerializer().serializeToString(roda)
      .replace(/ style="[^"]*"/, '')
      .replace('<svg ', `<svg x="${(W - roda_s) / 2}" y="${y + 12}" width="${roda_s}" height="${roda_s}" `);
    const bordaEsq = parseFloat(cs.borderLeftWidth) || 0;
    const moldura = bordaEsq > 0
      ? `<rect x="${borda / 2}" y="${y + borda / 2}" width="${W - borda}" height="${alturaCartao - borda}" rx="${raio}" ry="${raio}" fill="${cs.backgroundColor}" stroke="${cs.borderTopColor}" stroke-width="${borda}"/>`
      : (borda > 0 ? `<line x1="0" y1="${y + borda / 2}" x2="${W}" y2="${y + borda / 2}" stroke="${cs.borderTopColor}" stroke-width="${borda}"/><line x1="0" y1="${y + alturaCartao - borda / 2}" x2="${W}" y2="${y + alturaCartao - borda / 2}" stroke="${cs.borderBottomColor}" stroke-width="${borda}"/>` : '');
    partes += `${moldura}${svgRoda}`;
    y += alturaCartao + 16;
  }
  const alturaTopo = y > 0 ? y - 16 : 0;

  let topoCanvas = null;
  if (alturaTopo > 0) {
    topoCanvas = await rasterizarSvgParaCanvas(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${alturaTopo}" viewBox="0 0 ${W} ${alturaTopo}">${partes}</svg>`, W, alturaTopo, fundo, 2);
  }
  let arvoreCanvas = null;
  if (opc.tabela && arvoreEl) {
    if (typeof html2canvas !== 'function') throw new Error('html2canvas não carregou');
    arvoreCanvas = await html2canvas(arvoreEl, { backgroundColor: fundo, scale: 2, useCORS: true });
  }
  if (!topoCanvas) return arvoreCanvas;
  if (!arvoreCanvas) return topoCanvas;

  const saida = document.createElement('canvas');
  saida.width = Math.max(topoCanvas.width, arvoreCanvas.width);
  saida.height = topoCanvas.height + 32 + arvoreCanvas.height;
  const ctx = saida.getContext('2d');
  if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, saida.width, saida.height); }
  ctx.drawImage(topoCanvas, Math.round((saida.width - topoCanvas.width) / 2), 0);
  ctx.drawImage(arvoreCanvas, Math.round((saida.width - arvoreCanvas.width) / 2), topoCanvas.height + 32);
  return saida;
}

/* Botão de galeria: título + cabeçalho + mandala + tabela, SÓ AO TOCAR (ver
   capturarESalvarNaGaleria, mandala.js — igual em todas as ferramentas). */
function salvarLiberacaoNaGaleria() {
  capturarESalvarNaGaleria(
    () => montarImagemLiberacao({ titulo: true, cabecalho: true, mandala: true, tabela: true }),
    `Astro_Hellenic_Liberacao_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
window.salvarLiberacaoNaGaleria = salvarLiberacaoNaGaleria;

/* Manda pro Relatório. modo: 'inteira' (cabeçalho + mandala + tabela), 'mandala'
   (cabeçalho + mandala) ou 'tabela' (só a tabela, sem cabeçalho). A mandala
   sempre leva o cabeçalho — é ele que avisa "Lote tal na Casa 1". */
async function capturarLiberacaoParaRelatorio(modo) {
  const menu = document.getElementById('liberacaoMenuRelatorio');
  if (menu) menu.style.display = 'none';
  const opc = modo === 'tabela' ? { tabela: true }
    : modo === 'mandala' ? { cabecalho: true, mandala: true }
    : { cabecalho: true, mandala: true, tabela: true };
  window.__capturaSemFundo = true;
  const fundo = fundoCapturaLiberacao();
  try {
    const bruto = await montarImagemLiberacao(opc);
    if (!bruto) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
    const canvas = recortarCanvasAoConteudo(bruto, fundo);
    const rotuloLote = (typeof RELATORIO_LOT_NOMES !== 'undefined' && RELATORIO_LOT_NOMES[selectedZRPhase]) || selectedZRPhase;
    const oQue = modo === 'tabela' ? 'Tabela' : modo === 'mandala' ? 'Mandala' : 'Mandala + Tabela';
    const total = adicionarCapturaRelatorio('liberacao_' + selectedZRPhase, canvas.toDataURL('image/png'));
    alert(`Liberação Zodiacal — ${rotuloLote} (${oQue}) foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar a Liberação Zodiacal ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  } finally {
    window.__capturaSemFundo = false;
  }
}
window.capturarLiberacaoParaRelatorio = capturarLiberacaoParaRelatorio;

/* ENCOLHE TABELAS LARGAS DEMAIS (L2/L3/L4) PARA CABEREM NA TELA (SEM CORTE),
   EM VEZ DE FICAREM TRAVADAS/CORTADAS EM TELAS ESTREITAS — mesma técnica
   usada nos Decênios e no Painel Técnico. Como essas tabelas usam
   width:100% para preencher o cartão no desktop, primeiro mede a largura
   "natural" sem essa restrição: se já coubesse do jeito de sempre, não
   mexe em nada (zero mudança visual em telas largas). */
function encolherTabelaLZR(table) {
  if (!table || table.dataset.zrScaled === '1') return;
  const parent = table.parentElement;
  if (!parent) return;

  const parentStyles = getComputedStyle(parent);
  const availableWidth = parent.clientWidth
    - parseFloat(parentStyles.paddingLeft || 0)
    - parseFloat(parentStyles.paddingRight || 0);
  if (availableWidth <= 0) return;

  const larguraOriginal = table.style.width;
  table.style.width = 'auto';
  const naturalWidth = table.offsetWidth;

  if (naturalWidth <= availableWidth) {
    table.style.width = larguraOriginal;
    return;
  }

  const naturalHeight = table.offsetHeight;
  const escala = availableWidth / naturalWidth;
  const scaledHeight = naturalHeight * escala;

  const outerScroll = document.createElement('div');
  outerScroll.style.textAlign = 'center';
  const scaleBox = document.createElement('div');
  scaleBox.style.display = 'inline-block';
  scaleBox.style.width = (naturalWidth * escala) + 'px';
  scaleBox.style.height = scaledHeight + 'px';

  table.parentNode.insertBefore(outerScroll, table);
  outerScroll.appendChild(scaleBox);
  scaleBox.appendChild(table);

  table.style.transformOrigin = 'top left';
  table.style.transform = `scale(${escala})`;
  table.dataset.zrScaled = '1';
  // Contorna uma peculiaridade do navegador: um contêiner ao redor de uma
  // <table> transformada pode calcular a própria altura com base no
  // tamanho ANTES da escala, sobrando um espaço vazio grande abaixo dela.
  outerScroll.style.height = scaledHeight + 'px';
}

function encolherTabelasLZRVisiveis(root) {
  if (!root) return;
  root.querySelectorAll('table:not([data-zr-scaled="1"])').forEach(t => {
    if (t.offsetParent !== null) encolherTabelaLZR(t);
  });
}
