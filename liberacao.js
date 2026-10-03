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
const SIGN_COLORS_ZR = ["#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8"];

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
  const modoEscuro = document.documentElement.classList.contains('tema-escuro');
  const cores = modoEscuro
    ? ["#ff6b4a", "#d99a5c", "#38bdf8", "#60a5fa", "#ff6b4a", "#d99a5c", "#38bdf8", "#60a5fa", "#ff6b4a", "#d99a5c", "#38bdf8", "#60a5fa"]
    : SIGN_COLORS_ZR;
  // Tema Céu (papiro): glifo de signo em azul-tinta, sem cor por elemento.
  const corSigno = (typeof window !== 'undefined' && window.temaMandala === 'ceu') ? ['#a62b1f', '#6b4a2b', '#17707f', '#1f3a66'][signIndex % 4] : cores[signIndex];
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
  const papiro = typeof window !== 'undefined' && window.temaMandala === 'ceu';
  const frag = `${papiro ? '' : '<circle cx="50" cy="50" r="48" fill="#fffdf5"/>'}${getIconeFragmento('lote', loteKey)}`;
  return svgComoImagemZR(frag, 22, 22, '0 0 100 100');
}

/* ==========================================
   MINI MANDALA NATAL NO TOPO DA LIBERAÇÃO ZODIACAL
   ==========================================
   Cópia de gerarMandalaSVG (profeccao.js), que por sua vez é cópia fiel
   de renderMandala() em mandala.js: mesmos anéis/hastes/ticks dourados,
   aspectos, dodecatemoria, termos egípcios, lotes herméticos e planetas
   em SVG 3D com sombra e mancha de combustão, só sem a faixa de céu/
   espaço sideral (não cabe numa miniatura). Reaproveita direto os
   globais já carregados por mandala.js antes deste arquivo (PLANETS_DEF,
   EGYPTIAN_TERMS, MONOLINE_ZODIAC_SVGS, ELEMENT_SIGN_COLORS,
   SIGN_ELEMENTS, eclToScreenAngle, polarToCart, formatDegMin,
   calculateSevenLots, aplicarEmpilhamentoRadial, aplicarDesvioLateralLotes)
   — não os redeclara aqui. Só os defs/planetas em SVG 3D
   (construirDefsPlanetasZR/fragmentoPlaneta3DZR) precisam de cópia
   própria, porque em profeccao.js eles só existem dentro do IIFE do
   módulo, sem versão global reaproveitável, e usam IDs de gradiente/
   filtro sufixados por instância (não podem colidir com os mesmos IDs
   fixos usados pela mandala principal em mandala.js). */

let wheelInstanceCounterZR = 0;

/* Regente de cada signo (mesma ordem/fonte de SIGNS em profeccao.js) —
   usado para desenhar a coroa sobre o regente do signo destacado de
   cada nível (L1/L2/L3/L4) da Liberação Zodiacal. */
const SIGNS_RULERS_ZR = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

function construirDefsPlanetasZR(sufixo) {
  return `
      <radialGradient id="combustionGlow_${sufixo}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.9" /><stop offset="30%" stop-color="#fde68a" stop-opacity="0.75" /><stop offset="53%" stop-color="#f59e0b" stop-opacity="0.45" /><stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </radialGradient>
  `;
}

function fragmentoPlaneta3DZR(planetId, sufixo) {
  return (typeof getIconeFragmento === 'function') ? getIconeFragmento('planeta', planetId) : '';
}

/* Gera a mandala natal completa em SVG — cópia fiel de gerarMandalaSVG
   (profeccao.js), incluindo os destaques de signo (fatia semitransparente
   do centro até a borda + faixa sólida na borda externa). Em vez dos
   destaques de Profecção (ano profectado/ASC da RS/mês aberto), aqui são
   os 4 níveis da árvore da Liberação Zodiacal que estiverem abertos no
   momento (L1/L2/L3/L4) — mesmos tons e transparência de profeccao.js
   pros 3 primeiros (verde, amarelo, azul/índigo), com um 4º tom (grafite)
   criado no mesmo padrão pro L4, que não existia lá. */
function gerarMandalaNatalZR(dados, opcoes = {}) {
  if (!dados || !dados.Ascendente) {
    return `<div style="padding: 40px 10px; text-align: center; color: var(--text-faint); font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`;
  }

  const l1SignIdx = (opcoes.l1SignIdx !== undefined) ? opcoes.l1SignIdx : null;
  const l2SignIdx = (opcoes.l2SignIdx !== undefined) ? opcoes.l2SignIdx : null;
  const l3SignIdx = (opcoes.l3SignIdx !== undefined) ? opcoes.l3SignIdx : null;
  const l4SignIdx = (opcoes.l4SignIdx !== undefined) ? opcoes.l4SignIdx : null;
  /* Signo onde vai cair o Salto (Lysis) de cada nível, dentro do
     período ATIVO do nível pai — independente de "agora" já ter
     chegado lá ou não (estrutural, não temporal: mesma lógica do
     PICO, só que a referência do salto é o signo ativo do nível
     acima, não a Fortuna). null quando o período pai é curto demais
     pra sequer chegar num salto. L1 nunca tem (não subdivide nada). */
  const l2SaltoSignIdx = (opcoes.l2SaltoSignIdx !== undefined) ? opcoes.l2SaltoSignIdx : null;
  const l3SaltoSignIdx = (opcoes.l3SaltoSignIdx !== undefined) ? opcoes.l3SaltoSignIdx : null;
  const l4SaltoSignIdx = (opcoes.l4SaltoSignIdx !== undefined) ? opcoes.l4SaltoSignIdx : null;
  /* Chave do lote (fortune/spirit/venus/...) a colocar na Casa 1 do
     desenho, no lugar do Ascendente — mesma lógica de rotação de
     alternarRotacaoCasa1/selectedHouse1Lot em mandala.js, só que aqui
     não tem opção "ASC": a Liberação sempre gira em torno de um lote. */
  const loteCasa1 = (opcoes.loteCasa1 !== undefined) ? opcoes.loteCasa1 : null;

  /* Mesma "tinta" clara/escura de mandala.js (esta função é cópia fiel
     de renderMandala) — cores resolvidas em hexadecimal porque este SVG
     acaba virando <img> (ver converterMandalaLiberacaoEmImagem logo
     depois do render), então var(--x) não seria enxergado por quem lê o
     canvas depois. ELEMENT_SIGN_COLORS fica sombreado só aqui dentro
     (a versão global, de mandala.js, continua intocada).

     fundoDisco/halo (escuro) usam --bg-card (#262220), NÃO --bg-main
     (#1c1917) como em mandala.js — diferença de propósito, não descuido:
     aqui o disco fica dentro de um cartão próprio (#liberacaoMandalaCapture,
     fundo var(--bg-card)), enquanto na Mandala principal o disco fica
     direto sobre #main-stage (fundo var(--bg-main)), sem cartão por
     baixo. No Tema Claro os dois fundos são o mesmo branco (#ffffff),
     por isso esse descasamento nunca apareceu antes de existir tema
     escuro — usar --bg-main aqui deixava uma "moldura" mais clara entre
     a borda dourada do cartão e o quadrado escuro do disco. */
  const modoEscuro = document.documentElement.classList.contains('tema-escuro');
  /* TEMA CÉU — roda SECUNDÁRIA ("tinta sobre o papiro"): mesma lógica da Profecção (ver gerarMandalaSVG em
     profeccao.js): sem fundo/céu, azul-tinta na estrutura e terracota nos destaques. Quem observa o céu é a
     mandala principal; aqui o astrólogo já está escrevendo no papiro. */
  const papiro = typeof window !== 'undefined' && window.temaMandala === 'ceu';
  const AZ_TINTA = '#1d3a66', TERRACOTA = '#a03e25';
  const tinta = papiro ? {
    fundoDisco: 'none', dourado: AZ_TINTA, douradoCasas: TERRACOTA, halo: 'none',
    inkForte: AZ_TINTA, inkPlaneta: '#1a1410', navio: TERRACOTA, linhaConectora: 'rgba(29,58,102,0.55)',
    aspectoOposicao: TERRACOTA, aspectoTrigono: AZ_TINTA, aspectoQuadratura: TERRACOTA, aspectoSextil: AZ_TINTA,
    elementoFogo: '#a62b1f', elementoTerra: '#6b4a2b', elementoAr: '#17707f', elementoAgua: '#1f3a66',
    dodecatemoriaLinha: 'rgba(29,58,102,0.45)',
    picoBg: 'none', picoBorder: AZ_TINTA, picoText: AZ_TINTA,
    saltoBg: 'none', saltoBorder: TERRACOTA, saltoText: TERRACOTA, saltoLabel: TERRACOTA,
  } : modoEscuro ? {
    fundoDisco: '#262220', dourado: '#d9ae3f', douradoCasas: '#e8c667', halo: '#262220',
    inkForte: '#e8e6df', inkPlaneta: '#e8e6df', navio: '#8ab4e8', linhaConectora: '#6b7280',
    aspectoOposicao: '#fb7185', aspectoTrigono: '#60a5fa', aspectoQuadratura: '#ff6b4a', aspectoSextil: '#38bdf8',
    elementoFogo: '#ff6b4a', elementoTerra: '#d99a5c', elementoAr: '#38bdf8', elementoAgua: '#60a5fa',
    dodecatemoriaLinha: 'rgba(217,174,63,0.35)',
    picoBg: '#4a3a12', picoBorder: '#d99a2b', picoText: '#f0b35c',
    saltoBg: '#3a1f1f', saltoBorder: '#6b3232', saltoText: '#f4a8a8', saltoLabel: '#f4a8a8',
  } : {
    fundoDisco: '#ffffff', dourado: '#c59b27', douradoCasas: '#aa820a', halo: '#ffffff',
    inkForte: '#000000', inkPlaneta: '#0f172a', navio: '#103b70', linhaConectora: '#94a3b8',
    aspectoOposicao: '#881337', aspectoTrigono: '#1d4ed8', aspectoQuadratura: '#e84118', aspectoSextil: '#0ea5e9',
    elementoFogo: '#e84118', elementoTerra: '#8b4513', elementoAr: '#0ea5e9', elementoAgua: '#1d4ed8',
    dodecatemoriaLinha: 'rgba(170,130,10,0.3)',
    picoBg: '#fef3c7', picoBorder: '#f59e0b', picoText: '#b45309',
    saltoBg: '#fee2e2', saltoBorder: '#f87171', saltoText: '#991b1b', saltoLabel: '#7f1d1d',
  };
  const ELEMENT_SIGN_COLORS = { fire: tinta.elementoFogo, earth: tinta.elementoTerra, air: tinta.elementoAr, water: tinta.elementoAgua };

  const goldColor = tinta.dourado;
  const sufixo = `zr${wheelInstanceCounterZR++}`;

  const ascAbs = dados.Ascendente.grau_absoluto;
  const mcAbs = dados.MC ? dados.MC.grau_absoluto : (ascAbs + 270) % 360;
  const nodeAbs = dados.Nodo_Norte ? dados.Nodo_Norte.grau_absoluto : 0;
  const syzAbs = dados.Sizigia ? dados.Sizigia.grau_absoluto : 0;

  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = dados[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0, retro: item ? Boolean(item.retro) : false, lat: item ? (item.lat || 0) : 0 };
  });

  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  const lotes = calculateSevenLots(ascAbs, isDay, pObj);

  /* Signos de PICO (casas 1, 4, 7 e 10 a partir do signo da Fortuna) —
     mesma lógica/fonte de angularSignsFromFort em renderLiberacaoUI,
     sempre a partir da Fortuna, nunca do lote escolhido pra Casa 1 do
     desenho (loteCasa1) nem do lote ativo na árvore (selectedZRPhase). */
  const fortSignIdxZR = Math.floor(lotes.find(l => l.key === "fortune").deg / 30);
  const picoSignsZR = [fortSignIdxZR, (fortSignIdxZR + 3) % 12, (fortSignIdxZR + 6) % 12, (fortSignIdxZR + 9) % 12];

  let house1RefAbs = ascAbs;
  if (loteCasa1) {
    const targetLot = lotes.find(l => l.key === loteCasa1);
    if (targetLot) house1RefAbs = targetLot.deg;
  }

  const outerRingItems = [];
  PLANETS_DEF.forEach(p => {
    outerRingItems.push({
      type: "planet", id: p.id, deg: pObj[p.id].abs, retro: pObj[p.id].retro,
      eclLat: pObj[p.id].lat, aScreen: eclToScreenAngle(pObj[p.id].abs, house1RefAbs)
    });
  });
  if (nodeAbs > 0) {
    outerRingItems.push({ type: "node", label: "☊", deg: nodeAbs, color: tinta.inkForte, aScreen: eclToScreenAngle(nodeAbs, house1RefAbs) });
    outerRingItems.push({ type: "node", label: "☋", deg: (nodeAbs + 180) % 360, color: tinta.inkForte, aScreen: eclToScreenAngle((nodeAbs + 180) % 360, house1RefAbs) });
  }
  if (syzAbs > 0) {
    outerRingItems.push({ type: "syzygy", label: "SIZ", deg: syzAbs, color: tinta.inkForte, aScreen: eclToScreenAngle(syzAbs, house1RefAbs) });
  }
  lotes.forEach(lot => {
    outerRingItems.push({ type: "lot", label: lot.label, lotType: lot.type, sym: lot.sym, deg: lot.deg, color: goldColor, aScreen: eclToScreenAngle(lot.deg, house1RefAbs) });
  });

  aplicarEmpilhamentoRadial(outerRingItems, 7.5);
  aplicarDesvioLateralLotes(outerRingItems, 6);

  const latPxPerGrau = 12;
  const pR = 390;
  const R = { Aspects: 110, SignSector: 215, Dodec: 238, Termos: 262 };
  const R_OuterLine = 399;

  const degToPxPR = (2 * Math.PI * pR) / 360;
  const rSobRaiosGlow = degToPxPR * 15;
  let maxRaioItens = pR + rSobRaiosGlow;
  outerRingItems.forEach(item => {
    if (item.type === 'lot') return;
    const base = item.type === 'planet' ? pR + (item.eclLat * latPxPerGrau) : pR;
    const raio = base + (item.rOffset || 0);
    if (raio > maxRaioItens) maxRaioItens = raio;
  });
  const R_canvas = Math.max(maxRaioItens + 50, R_OuterLine + 55);
  const cx = R_canvas, cy = R_canvas;
  const canvasSize = R_canvas * 2;

  let svg = `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; margin: 0 auto;">
      <defs>${construirDefsPlanetasZR(sufixo)}</defs>
      <rect width="${canvasSize}" height="${canvasSize}" fill="${tinta.fundoDisco}"/>`;

  function desenharFatiaDestaque(signIdx, cor) {
    if (signIdx === null || signIdx === undefined) return '';
    const angInicial = eclToScreenAngle(signIdx * 30, house1RefAbs);
    const passos = 15;
    let d = `M ${cx} ${cy} `;
    for (let s = 0; s <= passos; s++) {
      const p = polarToCart(cx, cy, R_OuterLine, angInicial - (30 * s / passos));
      d += `L ${p.x} ${p.y} `;
    }
    d += 'Z';
    return `<path d="${d}" fill="${cor}"/>`;
  }

  svg += desenharFatiaDestaque(l4SignIdx, papiro ? "rgba(23, 112, 127, 0.16)" : "rgba(148, 163, 184, 0.45)");
  svg += desenharFatiaDestaque(l3SignIdx, papiro ? "rgba(29, 58, 102, 0.14)" : "rgba(224, 231, 255, 0.6)");
  svg += desenharFatiaDestaque(l2SignIdx, papiro ? "rgba(107, 74, 43, 0.18)" : "rgba(254, 240, 138, 0.5)");
  svg += desenharFatiaDestaque(l1SignIdx, papiro ? "rgba(160, 62, 37, 0.20)" : "rgba(163, 230, 53, 0.4)");

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Aspects}" fill="${tinta.fundoDisco}" stroke="${goldColor}" stroke-width="2"/>`;

  const occupiedSigns = new Set();
  PLANETS_DEF.forEach(p => { occupiedSigns.add(Math.floor(pObj[p.id].abs / 30)); });
  const occupiedArray = Array.from(occupiedSigns);
  for (let i = 0; i < occupiedArray.length; i++) {
    for (let j = i + 1; j < occupiedArray.length; j++) {
      let diff = Math.abs(occupiedArray[i] - occupiedArray[j]);
      if (diff > 6) diff = 12 - diff;
      let col = null;
      if (diff === 6) col = tinta.aspectoOposicao;
      else if (diff === 4) col = tinta.aspectoTrigono;
      else if (diff === 3) col = tinta.aspectoQuadratura;
      else if (diff === 2) col = tinta.aspectoSextil;
      if (col) {
        const pt1 = polarToCart(cx, cy, R.Aspects - 4, eclToScreenAngle(occupiedArray[i] * 30 + 15, house1RefAbs));
        const pt2 = polarToCart(cx, cy, R.Aspects - 4, eclToScreenAngle(occupiedArray[j] * 30 + 15, house1RefAbs));
        svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${col}" stroke-width="1.8" opacity="0.9"/>`;
      }
    }
  }

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.SignSector}" fill="none" stroke="${goldColor}" stroke-width="2"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Dodec}" fill="none" stroke="${goldColor}" stroke-width="1.5"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Termos}" fill="none" stroke="${goldColor}" stroke-width="2"/>`;

  /* ORDEM DE CAMADAS DA RODA (mesmo padrao de mandala.js, 28/09/2026): a
     estrutura da mandala (circulos, raios, dentinhos) sempre por tras de
     tudo; depois as linhas pretas dos eixos ASC/DSC/MC/IC; depois todos
     os icones por cima. Os loops que desenhavam linha+icone juntos
     (dodecatemoria, termos) foram separados em duas passadas: uma so de
     linha aqui, outra so de icone la embaixo, depois das linhas dos
     eixos. */

  for (let i = 0; i < 12; i++) {
    const pt1 = polarToCart(cx, cy, R.Aspects, eclToScreenAngle(i * 30, house1RefAbs));
    const pt2 = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(i * 30, house1RefAbs));
    svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.8"/>`;
  }

  for (let i = 0; i < 12; i++) {
    for (let d = 0; d < 12; d++) {
      const pt1 = polarToCart(cx, cy, R.SignSector, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
      const pt2 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
      svg += `<line x1="${pt1.x}" x2="${pt2.x}" y1="${pt1.y}" y2="${pt2.y}" stroke="${tinta.dodecatemoriaLinha}" stroke-width="0.8"/>`;
    }
  }

  for (let s = 0; s < 12; s++) {
    let prev = 0;
    EGYPTIAN_TERMS[s].forEach(term => {
      const pt1 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((s * 30) + prev, house1RefAbs));
      const pt2 = polarToCart(cx, cy, R.Termos, eclToScreenAngle((s * 30) + prev, house1RefAbs));
      svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.2"/>`;
      prev = term.deg;
    });
  }

  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 12 : ((deg % 5 === 0) ? 8 : 4);
    const p1 = polarToCart(cx, cy, R.Termos, aScreen);
    const p2 = polarToCart(cx, cy, R.Termos - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.5 : 0.8}"/>`;
  }

  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 10 : ((deg % 5 === 0) ? 6 : 3);
    const p1 = polarToCart(cx, cy, R.SignSector, aScreen);
    const p2 = polarToCart(cx, cy, R.SignSector - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.2 : 0.6}"/>`;
  }

  const ascPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(ascAbs, house1RefAbs));
  const dscPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(ascAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${ascPt.x}" y1="${ascPt.y}" x2="${dscPt.x}" y2="${dscPt.y}" stroke="${papiro ? COR_TINTA_OCRE : tinta.inkForte}" stroke-width="2.5"/>`;

  const mcPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(mcAbs, house1RefAbs));
  const icPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(mcAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${mcPt.x}" y1="${mcPt.y}" x2="${icPt.x}" y2="${icPt.y}" stroke="${papiro ? COR_TINTA_OCRE : tinta.inkForte}" stroke-width="2.5"/>`;

  /* A PARTIR DAQUI SO ICONE - nada de linha/dentinho novo abaixo disso,
     pra manter a estrutura da roda sempre por tras. */

  const rEixoInterno = R.SignSector - 12;
  const eixosInternos = [
    { label: "ASC", deg: ascAbs, color: papiro ? TERRACOTA : tinta.inkForte },
    { label: "DSC", deg: (ascAbs + 180) % 360, color: papiro ? TERRACOTA : tinta.inkForte },
    { label: "MC", deg: mcAbs, color: papiro ? TERRACOTA : tinta.inkForte },
    { label: "IC", deg: (mcAbs + 180) % 360, color: papiro ? TERRACOTA : tinta.inkForte }
  ];
  eixosInternos.forEach(eixo => {
    const aScreen = eclToScreenAngle(eixo.deg, house1RefAbs);
    const pPos = polarToCart(cx, cy, rEixoInterno, aScreen);
    const anguloFrag = getIconeFragmento('outro', 'angulo', undefined, papiro ? COR_TINTA_OCRE : undefined);
    const anguloFundo = papiro ? '' : getIconeFundoSilhueta('outro', 'angulo', '#fffdf5');
    svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <g transform="scale(0.4) translate(-50, -50) rotate(${aScreen - 180} 50 50)">${anguloFundo}${anguloFrag}</g>
        <text x="0" y="3.5" font-size="6.5" font-weight="900" fill="${eixo.color}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="1.8" paint-order="stroke fill">${eixo.label}</text>
        <text x="0" y="24" font-size="8" font-weight="bold" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(eixo.deg)}</text>
    </g>`;
  });

  const refSignIdx = Math.floor(house1RefAbs / 30);
  for (let i = 0; i < 12; i++) {
    const aMid = eclToScreenAngle((i * 30) + 15, house1RefAbs);
    const pNum = polarToCart(cx, cy, 122, aMid);
    svg += `<text x="${pNum.x}" y="${pNum.y + 5}" font-family="'Cinzel', serif" font-size="15" font-weight="bold" fill="${tinta.douradoCasas}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="4" paint-order="stroke fill">${((i - refSignIdx + 12) % 12) + 1}</text>`;

    const pSym = polarToCart(cx, cy, 166, aMid);
    svg += `<svg x="${pSym.x - 17}" y="${pSym.y - 17}" width="34" height="34" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[i]]};">${MONOLINE_ZODIAC_SVGS[i]}</svg>`;
  }

  for (let i = 0; i < 12; i++) {
    for (let d = 0; d < 12; d++) {
      const pDod = polarToCart(cx, cy, (R.SignSector + R.Dodec) / 2, eclToScreenAngle((i * 30) + (d * 2.5) + 1.25, house1RefAbs));
      svg += `<svg x="${pDod.x - 5.5}" y="${pDod.y - 5.5}" width="11" height="11" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[(i + d) % 12]]};">${MONOLINE_ZODIAC_SVGS[(i + d) % 12]}</svg>`;
    }
  }

  // term.p e so o glifo Unicode ("♃" etc) - de-para pro id do planeta
  // que o icone novo dos termos usa (mesmo mapa de mandala.js). So os 5
  // regentes de termo egipcio (nunca Sol/Lua) entram aqui.
  const TERMO_PLANET_BY_SYMBOL_ZR = { '♃': 'Jupiter', '♀': 'Venus', '☿': 'Mercury', '♂': 'Mars', '♄': 'Saturn' };
  const termoIconTamanhoZR = 18;

  for (let s = 0; s < 12; s++) {
    let prev = 0;
    EGYPTIAN_TERMS[s].forEach(term => {
      const pTerm = polarToCart(cx, cy, (R.Dodec + R.Termos) / 2, eclToScreenAngle((s * 30) + (prev + term.deg) / 2, house1RefAbs));
      const termoPlanetIdZR = TERMO_PLANET_BY_SYMBOL_ZR[term.p];
      svg += getIconeTermoSVG(termoPlanetIdZR, termoIconTamanhoZR, goldColor)
        .replace('<svg ', `<svg x="${pTerm.x - termoIconTamanhoZR / 2}" y="${pTerm.y - termoIconTamanhoZR / 2}" `);
      prev = term.deg;
    });
  }

  function desenharFaixaDestaque(signIdx, cor, rInterno, rExterno) {
    if (signIdx === null || signIdx === undefined) return '';
    const angInicial = eclToScreenAngle(signIdx * 30, house1RefAbs);
    const passos = 15;
    const pontosFora = [];
    for (let s = 0; s <= passos; s++) pontosFora.push(polarToCart(cx, cy, rExterno, angInicial - (30 * s / passos)));
    const pontosDentro = [];
    for (let s = passos; s >= 0; s--) pontosDentro.push(polarToCart(cx, cy, rInterno, angInicial - (30 * s / passos)));
    const pontos = pontosFora.concat(pontosDentro);
    const d = pontos.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return `<path d="${d}" fill="${cor}"/>`;
  }

  svg += desenharFaixaDestaque(l4SignIdx, papiro ? "#17707f" : "#475569", R_OuterLine + 4, R_OuterLine + 12);
  svg += desenharFaixaDestaque(l3SignIdx, papiro ? AZ_TINTA : "#6366f1", R_OuterLine + 14, R_OuterLine + 22);
  svg += desenharFaixaDestaque(l2SignIdx, papiro ? "#6b4a2b" : "#eab308", R_OuterLine + 24, R_OuterLine + 32);
  svg += desenharFaixaDestaque(l1SignIdx, papiro ? TERRACOTA : "#65a30d", R_OuterLine + 34, R_OuterLine + 42);

  /* RÓTULOS DE PICO E SALTO — ficam na mesma faixa de raio das
     barrinhas coloridas dos níveis, desenhados por cima delas, igual
     aos planetas. PICO: mesmos signos (casas 1, 4, 7 e 10 a partir da
     Fortuna) já marcados na tabela, em qualquer lote. SALTO: estrutural,
     não temporal — mostra onde o Lysis de cada nível VAI cair dentro do
     período ativo do nível pai, independente de "agora" já ter chegado
     lá ou não (é por isso que o signo do salto pode aparecer sem
     nenhuma faixa colorida por baixo: pode não ser o período
     selecionado no momento, só o que vai virar salto mais adiante
     dentro do mesmo ciclo). L1 nunca tem (não subdivide nada). Igual às
     coroas dos regentes, o número do(s) nível(is) em salto fica escrito
     acima do badge, e quando mais de um nível cai no mesmo signo eles
     dividem um badge só (números unidos por "-").

     Quando o MESMO signo tem pico e salto ao mesmo tempo, os dois
     badges se sobreporiam nesse raio — por isso são deslocados um em
     relação ao outro: um acima/abaixo do outro quando o signo cai do
     lado esquerdo/direito da roda (ângulo mais horizontal), e um do
     lado do outro quando cai em cima/embaixo (ângulo mais vertical). */
  const rPicoZR = R_OuterLine + 23;
  const signosComPicoZR = new Set(picoSignsZR);

  const niveisSaltoPorSignoZR = {};
  [[2, l2SaltoSignIdx], [3, l3SaltoSignIdx], [4, l4SaltoSignIdx]].forEach(([nivel, signIdx]) => {
    if (signIdx === null || signIdx === undefined) return;
    if (!niveisSaltoPorSignoZR[signIdx]) niveisSaltoPorSignoZR[signIdx] = [];
    niveisSaltoPorSignoZR[signIdx].push(nivel);
  });
  const signosComSaltoZR = new Set(Object.keys(niveisSaltoPorSignoZR).map(Number));

  function deslocamentoBadgesZR(signIdx) {
    const aScreen = eclToScreenAngle((signIdx * 30) + 15, house1RefAbs);
    const rad = aScreen * Math.PI / 180;
    const ladoEsquerdoOuDireito = Math.abs(Math.cos(rad)) > Math.abs(Math.sin(rad));
    return ladoEsquerdoOuDireito
      ? { pico: { x: 0, y: -14 }, salto: { x: 0, y: 14 } }
      : { pico: { x: -19, y: 0 }, salto: { x: 19, y: 0 } };
  }

  picoSignsZR.forEach(signIdx => {
    const desloc = signosComSaltoZR.has(signIdx) ? deslocamentoBadgesZR(signIdx).pico : { x: 0, y: 0 };
    const aScreenPico = eclToScreenAngle((signIdx * 30) + 15, house1RefAbs);
    const pPico = polarToCart(cx, cy, rPicoZR, aScreenPico);
    svg += `<g transform="translate(${pPico.x + desloc.x}, ${pPico.y + desloc.y})">
        <rect x="-17" y="-7" width="34" height="14" rx="3" fill="${tinta.picoBg}" stroke="${tinta.picoBorder}" stroke-width="1"/>
        <text x="0" y="3.2" font-size="8" font-weight="800" fill="${tinta.picoText}" text-anchor="middle" font-family="'Montserrat', sans-serif">PICO</text>
    </g>`;
  });

  Object.keys(niveisSaltoPorSignoZR).forEach(signIdxKey => {
    const signIdx = Number(signIdxKey);
    const desloc = signosComPicoZR.has(signIdx) ? deslocamentoBadgesZR(signIdx).salto : { x: 0, y: 0 };
    const aScreenSalto = eclToScreenAngle((signIdx * 30) + 15, house1RefAbs);
    const pSalto = polarToCart(cx, cy, rPicoZR, aScreenSalto);
    const rotuloNiveisSalto = niveisSaltoPorSignoZR[signIdxKey].join('-');
    svg += `<g transform="translate(${pSalto.x + desloc.x}, ${pSalto.y + desloc.y})">
        <text x="0" y="-11" font-size="8" font-weight="900" fill="${tinta.saltoLabel}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="2" paint-order="stroke fill">${rotuloNiveisSalto}</text>
        <rect x="-17" y="-7" width="34" height="14" rx="3" fill="${tinta.saltoBg}" stroke="${tinta.saltoBorder}" stroke-width="1"/>
        <text x="0" y="3.2" font-size="8" font-weight="800" fill="${tinta.saltoText}" text-anchor="middle" font-family="'Montserrat', sans-serif">SALTO</text>
    </g>`;
  });

  // Pontos calculados (nodos, sizígia, lotes): círculo cremoso por trás do ícone; no papiro não há nada atrás.
  const circuloFundoPonto = papiro ? '' : '<circle cx="0" cy="0" r="11" fill="#fffdf5"/>';

  const sunItem = outerRingItems.find(it => it.type === 'planet' && it.id === 'Sun');
  if (sunItem && !papiro) { // no papiro não há mancha de combustão (é um brilho de céu)
    const sunGlowPos = polarToCart(cx, cy, pR, sunItem.aScreen);
    svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaiosGlow}" fill="${tinta.fundoDisco}"/>`;
    svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaiosGlow}" fill="url(#combustionGlow_${sufixo})"/>`;
  }

  outerRingItems.forEach(item => {
    if (item.type === 'planet') return;
    const raioEfetivo = (item.type === 'lot' ? 276 : pR) + (item.rOffset || 0);
    const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
    const p2 = polarToCart(cx, cy, (item.type === 'lot' ? raioEfetivo - 12 : raioEfetivo - 19), item.aShift);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${item.color}" stroke-width="1.2"/>`;

    const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
    if (item.type === "node") {
      const nodeKeyZR = (item.label === '☊') ? 'northNode' : 'southNode';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
          ${circuloFundoPonto}
          <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('outro', nodeKeyZR)}</g>
          <text x="0" y="19" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "syzygy") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
          ${circuloFundoPonto}
          <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('outro', 'sizigia')}</g>
          <text x="0" y="21" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "lot") {
      const loteKeyZR = LOTE_ICON_KEY_LIB[item.lotType] || 'fortune';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
          ${circuloFundoPonto}
          <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('lote', loteKeyZR)}</g>
          <text x="0" y="17" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    }
  });

  const ORDEM_CALDAICA = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  outerRingItems
    .filter(item => item.type === 'planet')
    .sort((a, b) => ORDEM_CALDAICA.indexOf(a.id) - ORDEM_CALDAICA.indexOf(b.id))
    .forEach(item => {
      const raioEfetivo = pR + (item.eclLat * latPxPerGrau) + (item.rOffset || 0);
      const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
      const p2 = polarToCart(cx, cy, raioEfetivo - 19, item.aShift);
      svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${tinta.linhaConectora}" stroke-width="1.2"/>`;

      const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
      const planetSvgContent = papiro ? getIconeFragmento('planeta', item.id, dados) : fragmentoPlaneta3DZR(item.id, sufixo);
      let retroSymbol = item.retro ? `<tspan fill="${papiro ? TERRACOTA : '#dc2626'}" font-weight="900"> ℞</tspan>` : '';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
          <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
          <text x="0" y="27" font-size="10.5" font-weight="800" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
      </g>`;
    });

  /* COROA SOBRE O REGENTE DE CADA NÍVEL DESTACADO (L1/L2/L3/L4). Quando
     o mesmo planeta rege mais de um nível ao mesmo tempo, ele recebe
     UMA coroa só (não uma empilhada em cima da outra) — o número acima
     da coroa é que muda, juntando os níveis com "-" (ex.: "1-3"). */
  const niveisPorRegenteZR = {};
  [[1, l1SignIdx], [2, l2SignIdx], [3, l3SignIdx], [4, l4SignIdx]].forEach(([nivel, signIdx]) => {
    if (signIdx === null || signIdx === undefined || !SIGNS_RULERS_ZR[signIdx]) return;
    const rulerId = SIGNS_RULERS_ZR[signIdx];
    if (!niveisPorRegenteZR[rulerId]) niveisPorRegenteZR[rulerId] = [];
    niveisPorRegenteZR[rulerId].push(nivel);
  });

  Object.keys(niveisPorRegenteZR).forEach(rulerId => {
    const rulerItem = outerRingItems.find(it => it.type === 'planet' && it.id === rulerId);
    if (!rulerItem) return;
    const raioEfetivo = pR + (rulerItem.eclLat * latPxPerGrau) + (rulerItem.rOffset || 0);
    const pCoroa = polarToCart(cx, cy, raioEfetivo, rulerItem.aShift);
    const rotuloNiveis = niveisPorRegenteZR[rulerId].join('-');
    svg += `<g transform="translate(${pCoroa.x}, ${pCoroa.y - 17})">
        <text x="0" y="-11" font-size="9" font-weight="900" fill="${tinta.navio}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="2.5" paint-order="stroke fill">${rotuloNiveis}</text>
        <path d="M -9,5 L -9,-2 L -4.5,2.5 L 0,-7 L 4.5,2.5 L 9,-2 L 9,5 Z" fill="${papiro ? 'none' : '#f5c518'}" stroke="${papiro ? TERRACOTA : '#a8790a'}" stroke-width="${papiro ? 1.4 : 0.9}" stroke-linejoin="round"/>
        <circle cx="0" cy="-7" r="1.6" fill="${papiro ? TERRACOTA : '#dc2626'}"/>
        <circle cx="-9" cy="-2" r="1.3" fill="${papiro ? TERRACOTA : '#dc2626'}"/>
        <circle cx="9" cy="-2" r="1.3" fill="${papiro ? TERRACOTA : '#dc2626'}"/>
    </g>`;
  });

  svg += `</svg>`;
  return svg;
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
    mercury: "Lote da Necessidade", mars: "Lote da Audácia", jupiter: "Lote da Vitória", saturn: "Lote de Nêmesis"
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
    return `<div onclick="alternarLoteLiberacao('${l.key}')" title="${escapeHtml(label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center; color: var(--primary-blue);">${getLotIconSVG(l.key)}</div>`;
  }).join('');

  let html = `
    <div style="width: 100%;">
      <div style="display: flex; justify-content: flex-end; align-items: flex-start; gap: 6px; margin-bottom: 8px; padding: 0 20px;">
        <button type="button" onclick="salvarLiberacaoNaGaleria()" title="Salvar a ferramenta inteira como imagem na galeria (com título e cabeçalho)" style="${LIB_BTN_ICONE_CSS}">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
        </button>
        <div style="position: relative; flex-shrink: 0;">
          <button type="button" onclick="const m=document.getElementById('liberacaoMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório" style="${LIB_BTN_ICONE_CSS}">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
          </button>
          <div id="liberacaoMenuRelatorio" style="display: none; position: absolute; top: 40px; right: 0; background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; min-width: 210px; overflow: hidden;">
            <div onclick="capturarLiberacaoParaRelatorio('inteira')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary-blue); border-bottom: 1px solid var(--border-color);">Ferramenta inteira (com cabeçalho)</div>
            <div onclick="capturarLiberacaoParaRelatorio('mandala')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary-blue); border-bottom: 1px solid var(--border-color);">Só a mandala (com cabeçalho)</div>
            <div onclick="capturarLiberacaoParaRelatorio('tabela')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary-blue);">Só a tabela</div>
          </div>
        </div>
      </div>
    <div class="lib-outer" id="liberacao-container" style="width: 100%; min-height: 100%; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">

      <div id="liberacaoHeaderCapture">
        <!-- Título + seletor de lote ativo lado a lado. -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
          <h3 class="lib-titulo" style="font-family: 'Cinzel', serif; font-weight: 800; color: var(--primary-blue); margin: 0; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
            Liberação Zodiacal
          </h3>
          <div style="position: relative; flex-shrink: 0;">
            <button type="button" onclick="const menu=document.getElementById('liberacaoLoteMenu'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: 34px; height: 34px; border-radius: 6px; background: var(--bg-main); color: var(--primary-blue); border: 1px solid var(--gold-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Lote Ativo">
              ${getLotIconSVG(selectedZRPhase)}
            </button>
            <div id="liberacaoLoteMenu" style="display: none; position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 40px; max-height: 220px; overflow-y: auto; box-sizing: border-box;">
              ${loteMenuRowsHTML}
            </div>
          </div>
        </div>

        <!-- CABEÇALHO PADRÃO (o mesmo de todas as ferramentas), com "Lote tal na Casa 1": a Liberação sempre gira em torno de um lote. -->
        ${montarCabecalhoMandalaImagemHTML(currentCalculatedData, 'liberacaoCabecalhoPadrao', { loteCasa1: selectedZRPhase, tintaSobreFolha: true })}
      </div>

      <div id="liberacaoMandalaCapture" style="width: 100%; margin: 0 0 20px; background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); box-sizing: border-box;">
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
    let peakBadgeL1 = isPeakL1
      ? `<span style="background: var(--badge-bg); color: var(--badge-text); border: 1px solid var(--badge-border); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; margin-left: 8px;">PICO</span>`
      : ``;

    html += `
      <div style="margin-bottom: 12px; border: 1px solid var(--gold-primary); border-radius: 8px; overflow: hidden; background: var(--bg-card);">
        <div onclick="alternarL1Accordion(${i})" style="padding: 12px 16px; background: ${isExpanded ? 'rgba(163, 230, 53, 0.4)' : 'var(--bg-card)'}; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none; border-bottom: ${isExpanded ? '1px solid var(--table-border)' : 'none'};">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${getSignSVGZR(currSign, 24)}
            <div>
              <strong style="color: var(--primary-blue); font-family: 'Cinzel', serif; font-size: 13px;">L1: ${SIGN_NAMES_ZR[currSign].toUpperCase()}</strong>
              <span style="font-size: 12px; color: var(--text-muted); margin-left: 6px;">${durationYears} Anos</span>
              ${peakBadgeL1}
            </div>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: var(--text-muted-3);">
            ${formatarDataBR(currentStart)} a ${formatarDataBR(currentEnd)}
          </div>
        </div>
    `;

    if (isExpanded) {
      html += `
        <div style="padding: 10px; background: var(--bg-card);">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid var(--table-border); border-radius: 6px; overflow: hidden; font-size: 12px; text-align: center; background: var(--bg-card);">
            <thead>
              <tr style="background-color: #103b70; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">
                <th style="padding: 8px;">L2 Subperíodo</th>
                <th style="padding: 8px;">Duração</th>
                <th style="padding: 8px;">Início</th>
                <th style="padding: 8px;">Término</th>
                <th style="padding: 8px;">Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      subperiodosL2.forEach((sub, sIdx) => {
        const isL2Expanded = (expandedL2Key === `${i}_${sIdx}`);
        const bgRow = sIdx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)';
        const isPeakL2 = angularSignsFromFort.includes(sub.signIdx);

        let statusL2 = "";
        if (sub.isLysis) {
          statusL2 += `<span style="background: var(--danger-bg); color: var(--danger-text); border: 1px solid var(--danger-border); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; margin-right: 4px;">SALTO</span>`;
        }
        if (isPeakL2) {
          statusL2 += `<span style="background: var(--badge-bg); color: var(--badge-text); border: 1px solid var(--badge-border); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px;">PICO</span>`;
        }

        html += `
          <tr onclick="alternarL2Accordion(${i}, ${sIdx}, event)" style="border-bottom: 1px solid var(--table-border); background-color: ${isL2Expanded ? 'rgba(254, 240, 138, 0.5)' : bgRow}; cursor: pointer;">
            <td style="padding: 8px; text-align: center;">${getSignSVGZR(sub.signIdx, 20)}</td>
            <td style="padding: 8px; font-weight: 600; color: var(--primary-blue);">${sub.months} Meses (${sub.days} Dias)</td>
            <td style="padding: 8px; color: var(--text-muted-3);">${formatarDataBR(sub.start)}</td>
            <td style="padding: 8px; color: var(--text-muted-3);">${formatarDataBR(sub.end)}</td>
            <td style="padding: 8px; text-align: center;">${statusL2}</td>
          </tr>
        `;

        if (isL2Expanded) {
          const subperiodosL3 = calcularSubperiodosL3(sub.signIdx, sub.start, sub.end);
          html += `
            <tr>
              <td colspan="5" style="padding: 8px 12px; background: var(--bg-hover); border-bottom: 1px solid var(--border-color);">
                <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid var(--primary-blue); border-radius: 6px; overflow: hidden; font-size: 11px; text-align: center; background: var(--bg-card);">
                  <thead>
                    <tr style="background-color: #103b70; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
                      <th style="padding: 6px;">L3 Subperíodo</th>
                      <th style="padding: 6px;">Duração</th>
                      <th style="padding: 6px;">Início</th>
                      <th style="padding: 6px;">Término</th>
                      <th style="padding: 6px;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
          `;

          subperiodosL3.forEach((subL3, l3Idx) => {
            const isL3Expanded = (expandedL3Key === `${i}_${sIdx}_${l3Idx}`);
            const bgRowL3 = l3Idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-hover)';
            const isPeakL3 = angularSignsFromFort.includes(subL3.signIdx);

            let statusL3 = "";
            if (subL3.isLysis) {
              statusL3 += `<span style="background: var(--danger-bg); color: var(--danger-text); border: 1px solid var(--danger-border); padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 8px; margin-right: 4px;">SALTO</span>`;
            }
            if (isPeakL3) {
              statusL3 += `<span style="background: var(--badge-bg); color: var(--badge-text); border: 1px solid var(--badge-border); padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 8px;">PICO</span>`;
            }

            html += `
              <tr onclick="alternarL3Accordion(${i}, ${sIdx}, ${l3Idx}, event)" style="border-bottom: 1px solid var(--table-border-soft); background-color: ${isL3Expanded ? 'rgba(224, 231, 255, 0.6)' : bgRowL3}; cursor: pointer;">
                <td style="padding: 6px; text-align: center;">${getSignSVGZR(subL3.signIdx, 18)}</td>
                <td style="padding: 6px; font-weight: 600; color: var(--primary-blue);">${subL3.days} Dias</td>
                <td style="padding: 6px; color: var(--text-muted-3); line-height: 1.2;">${formatarDataHoraBR(subL3.start)}</td>
                <td style="padding: 6px; color: var(--text-muted-3); line-height: 1.2;">${formatarDataHoraBR(subL3.end)}</td>
                <td style="padding: 6px; text-align: center;">${statusL3}</td>
              </tr>
            `;

            if (isL3Expanded) {
              const subperiodosL4 = calcularSubperiodosL4(subL3.signIdx, subL3.start, subL3.end);
              html += `
                <tr>
                  <td colspan="5" style="padding: 6px 10px; border-bottom: 1px solid var(--table-border-soft);">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid var(--table-border-soft); border-radius: 6px; overflow: hidden; font-size: 10px; text-align: center; background: var(--bg-card);">
                      <thead>
                        <tr style="background-color: #475569; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 8px; letter-spacing: 0.5px;">
                          <th style="padding: 5px;">L4 Subperíodo</th>
                          <th style="padding: 5px;">Duração</th>
                          <th style="padding: 5px;">Início</th>
                          <th style="padding: 5px;">Término</th>
                          <th style="padding: 5px;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
              `;

              subperiodosL4.forEach((subL4, l4Idx) => {
                const isL4Ativo = (hoje >= subL4.start && hoje < subL4.end);
                const bgRowL4 = isL4Ativo ? 'rgba(148, 163, 184, 0.45)' : (l4Idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-hover)');
                const isPeakL4 = angularSignsFromFort.includes(subL4.signIdx);

                let statusL4 = "";
                if (subL4.isLysis) {
                  statusL4 += `<span style="background: var(--danger-bg); color: var(--danger-text); border: 1px solid var(--danger-border); padding: 1px 4px; border-radius: 3px; font-weight: 700; font-size: 7px; margin-right: 3px;">SALTO</span>`;
                }
                if (isPeakL4) {
                  statusL4 += `<span style="background: var(--badge-bg); color: var(--badge-text); border: 1px solid var(--badge-border); padding: 1px 4px; border-radius: 3px; font-weight: 700; font-size: 7px;">PICO</span>`;
                }

                html += `
                  <tr style="border-bottom: 1px solid var(--table-border-soft); background-color: ${bgRowL4};">
                    <td style="padding: 5px; text-align: center;">${getSignSVGZR(subL4.signIdx, 16)}</td>
                    <td style="padding: 5px; font-weight: 600; color: var(--primary-blue);">${subL4.hours} Horas</td>
                    <td style="padding: 5px; color: var(--text-muted-3); line-height: 1.2;">${formatarDataHoraBR(subL4.start)}</td>
                    <td style="padding: 5px; color: var(--text-muted-3); line-height: 1.2;">${formatarDataHoraBR(subL4.end)}</td>
                    <td style="padding: 5px; text-align: center;">${statusL4}</td>
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
    </div>
    </div>
  `;

  container.innerHTML = html;
  encolherTabelasLZRVisiveis(container);
}

const LIB_BTN_ICONE_CSS = "width: 36px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 0; color: var(--primary-blue);";

/* IMAGENS DA LIBERAÇÃO (galeria e relatório). Título + cabeçalho padrão +
   cartão da mandala saem direto do SVG (rápido); a tabela (árvore L1-L4) é
   HTML, então é a única parte que passa pelo html2canvas. "opc": {titulo,
   cabecalho, mandala, tabela} (booleanos). Devolve o canvas (escala 2). */
/* Tema Céu: a imagem sai sobre o papiro (cor chapada, pra o recorte automático achar a borda), tanto no modo
   claro quanto no escuro — a tela já é papiro nos dois. */
function fundoCapturaLiberacao() {
  // Imagem pro RELATÓRIO (window.__capturaSemFundo ligado só durante a captura): sem fundo nenhum, só as linhas em tinta.
  if (typeof window !== 'undefined' && window.temaMandala === 'ceu') return window.__capturaSemFundo ? null : papiroCores().chapado;
  return document.documentElement.classList.contains('tema-escuro') ? '#1c1917' : '#fffdf5';
}

async function montarImagemLiberacao(opc) {
  const papiro = typeof window !== 'undefined' && window.temaMandala === 'ceu';
  const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
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
    partes += `<rect x="${borda / 2}" y="${y + borda / 2}" width="${W - borda}" height="${alturaCartao - borda}" rx="${raio}" ry="${raio}" fill="${cs.backgroundColor}" stroke="${cs.borderTopColor}" stroke-width="${borda}"/>${svgRoda}`;
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
