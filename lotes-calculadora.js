/* ==========================================
   MÓDULO DA CALCULADORA DE LOTES
   Ferramenta adicional — não altera calculateSevenLots()
   nem nenhum outro módulo já existente.

   Parte 1: lotes pré-calculados para o mapa carregado.
   Parte 2: calculadora livre (ponto de partida + Planeta A/B).

   Fórmulas conforme especificação do usuário. Onde não indicado
   autor específico na fonte, usa-se a atribuição genérica
   "Tradição Helenística".
   ========================================== */

const MONOLINE_ZODIAC_SVGS_LOTES = [
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

const SIGN_NAMES_LOTES = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

/* SVG cru dentro de <img> (data URI) em vez de <svg> inline: o html2canvas
   usado pelas capturas de "Adicionar ao Relatório" tem dois bugs conhecidos
   com <svg> inline — some em certos layouts e corta viewBox de origem
   negativa (ex.: "-12 -12 24 24"). Envolvendo como <img>, o navegador já
   rasteriza o SVG antes do html2canvas tocar nele (mesmo padrão de
   liberacao.js/svgComoImagemZR). */
function svgComoImagemLotes(svgInterno, largura, altura, viewBox) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="${viewBox}">${svgInterno}</svg>`;
  return `<img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="${largura}" height="${altura}" style="display: block; margin: 0 auto;" alt="">`;
}

/* Vira <img> (ver svgComoImagemLotes), então não enxerga var(--x) do CSS —
   a cor certa (clara/escura) precisa vir já resolvida em hexadecimal. */
function getSignSVGLotes(signIndex, size = 22) {
  if (signIndex < 0 || signIndex > 11) return '';
  const corSigno = corElementoSigno(signIndex); // cor do elemento: papiro.js (fonte única); resolvida em hexadecimal porque vira <img>
  const interno = `<g style="color: ${corSigno};">${MONOLINE_ZODIAC_SVGS_LOTES[signIndex]}</g>`;
  return svgComoImagemLotes(interno, size, size, '0 0 64 64');
}

/* Reaproveita o SVG esférico/simples já definido globalmente (decenios.js/horas.js) conforme a Aparência escolhida pelo usuário. */
function getPlanet3DSVGLotes(planetId, size = 26) {
  if (typeof getPlanet3DSVG === 'function') {
    return getPlanet3DSVG(planetId, size);
  }
  return '';
}

/* Mesmo triângulo do ícone novo usado em ASC/DSC/MC/IC em toda outra
   ferramenta (getAnguloCirculoSVG, tabelaTecnica.js) — envolvido em <img>
   pelo mesmo motivo de svgComoImagemLotes (fundo creme fixo, não muda
   com o tema, igual ao resto do sistema). */
function getASCIconSVGLotes(size = 22) {
  if (typeof getIconeFragmento !== 'function') return '';
  const ceu = typeof temaCeuAtivoNosIcones === 'function' && temaCeuAtivoNosIcones();
  const frag = getIconeFragmento('outro', 'angulo', undefined, ceu ? COR_TINTA_OCRE : undefined);
  // Tema Céu: mesmo triângulo só de contorno ocre (sem preenchimento) com letras em terracota de getAnguloCirculoSVG.
  const fundo = ceu ? '' : getIconeFundoSilhueta('outro', 'angulo', '#fffdf5');
  const interno = `<g transform="translate(50,50) scale(0.9) translate(-50,-50)">${fundo}${frag}</g><text x="50" y="58" font-size="16" font-weight="900" fill="${ceu ? '#a03e25' : '#000000'}" text-anchor="middle">ASC</text>`;
  return svgComoImagemLotes(interno, size, size, '0 0 100 100');
}

/* item.key aqui vem em português ("eros", "necessidade", "coragem",
   "vitoria", "nemesis") — de-para pro nome que o ícone novo dos lotes
   usa (mesmo padrão de LOTE_ICON_KEY em mandala.js/liberacao.js). Só
   esses 5 + fortuna/espírito têm ícone dedicado no sistema central; os
   demais lotes desta calculadora (dezenas deles) não têm — continuam
   com a abreviação genérica, que é o certo pra eles. */
const LOTE_ICON_KEY_LOTES = {
  eros: 'eros', necessidade: 'necessity', coragem: 'courage', vitoria: 'victory', nemesis: 'nemesis'
};
function getLoteHermeticoIconSVG(loteKey, size = 22) {
  if (typeof getIconeFragmento !== 'function') return '';
  const frag = `${window.temaMandala === 'ceu' ? '' : '<circle cx="50" cy="50" r="48" fill="#fffdf5"/>'}${getIconeFragmento('lote', LOTE_ICON_KEY_LOTES[loteKey])}`;
  return svgComoImagemLotes(frag, size, size, '0 0 100 100');
}

/* Ícone genérico de lote (mesmo padrão de círculo + símbolo usado em liberacao.js/direcoes.js), com uma abreviação curta no lugar de um único glifo planetário quando o lote combina mais de um termo.
   Cor gravada direto no SVG: como <img> não herda currentColor nem var(--x)
   de fora, precisa vir com a cor já resolvida em hexadecimal dentro dela —
   mesma cor usada em todos os lugares que chamam esta função (ver
   renderLoteCardHTML/renderSeletorLotes). */
function getLoteAbbrevIconSVG(abbrev, size = 22) { // Tema Céu (papiro): lotes sempre em preto de tinta (#1a1410)
  const cor = window.temaMandala === 'ceu' ? '#1a1410' : (document.documentElement.classList.contains('tema-escuro') ? '#8ab4e8' : '#103b70');
  const len = (abbrev || '').length;
  const fontSize = len <= 2 ? 10 : (len === 3 ? 8.3 : (len === 4 ? 7 : 6));
  const interno = `<circle cx="0" cy="0" r="10" fill="none" stroke="${cor}" stroke-width="1.8"/><text x="0" y="3" font-size="${fontSize}" font-weight="800" fill="${cor}" text-anchor="middle">${abbrev}</text>`;
  return svgComoImagemLotes(interno, size, size, '-12 -12 24 24');
}

function getLoteFortunaIconSVG(size = 22) {
  if (typeof getIconeFragmento !== 'function') return '';
  const frag = `${window.temaMandala === 'ceu' ? '' : '<circle cx="50" cy="50" r="48" fill="#fffdf5"/>'}${getIconeFragmento('lote', 'fortune')}`;
  return svgComoImagemLotes(frag, size, size, '0 0 100 100');
}

function getLoteEspiritoIconSVG(size = 22) {
  if (typeof getIconeFragmento !== 'function') return '';
  const frag = `${window.temaMandala === 'ceu' ? '' : '<circle cx="50" cy="50" r="48" fill="#fffdf5"/>'}${getIconeFragmento('lote', 'spirit')}`;
  return svgComoImagemLotes(frag, size, size, '0 0 100 100');
}

/* Dispara o ícone correto para um item de lote já calculado (Parte 1). */
function getLoteIconHTMLLotes(lotObj, size = 24) {
  if (lotObj.iconType === 'fortune') return getLoteFortunaIconSVG(size);
  if (lotObj.iconType === 'spirit') return getLoteEspiritoIconSVG(size);
  if (LOTE_ICON_KEY_LOTES[lotObj.key]) return getLoteHermeticoIconSVG(lotObj.key, size);
  return getLoteAbbrevIconSVG(lotObj.abbrev || '', size);
}

/* ==========================================
   MATEMÁTICA DOS LOTES
   ========================================== */

function norm360Lotes(v) {
  return ((v % 360) + 360) % 360;
}

function angularDistLotes(a, b) {
  const d = Math.abs(norm360Lotes(a) - norm360Lotes(b));
  return d > 180 ? 360 - d : d;
}

/* ASC + A − B (dia); se invert=true e a seita for noturna, inverte para ASC + B − A. */
function calcLotePonto(ascAbs, a, b, isDay, invert) {
  let termA = a, termB = b;
  if (invert && !isDay) {
    termA = b;
    termB = a;
  }
  return norm360Lotes(ascAbs + termA - termB);
}

function casaDoGrauLotes(grauAbs, ascAbs) {
  const signoAsc = Math.floor(norm360Lotes(ascAbs) / 30);
  const signo = Math.floor(norm360Lotes(grauAbs) / 30);
  return ((signo - signoAsc + 12) % 12) + 1;
}

function obterAbsPlanetasLotes(data) {
  return {
    asc: data.Ascendente ? data.Ascendente.grau_absoluto : 0,
    sun: data.Sol ? data.Sol.grau_absoluto : 0,
    moon: data.Lua ? data.Lua.grau_absoluto : 0,
    merc: data.Mercúrio ? data.Mercúrio.grau_absoluto : 0,
    ven: data.Vênus ? data.Vênus.grau_absoluto : 0,
    mars: data.Marte ? data.Marte.grau_absoluto : 0,
    jup: data.Júpiter ? data.Júpiter.grau_absoluto : 0,
    sat: data.Saturno ? data.Saturno.grau_absoluto : 0
  };
}

const PLANET_NAMES_PT_LOTES = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };

function absDoPlanetaLotes(planetId, p) {
  switch (planetId) {
    case 'Sun': return p.sun;
    case 'Moon': return p.moon;
    case 'Mercury': return p.merc;
    case 'Venus': return p.ven;
    case 'Mars': return p.mars;
    case 'Jupiter': return p.jup;
    case 'Saturn': return p.sat;
    default: return 0;
  }
}

/* ==========================================
   PARTE 1 — LOTES PRÉ-CALCULADOS
   ========================================== */

function computeAllLotesPrecalculados(data, isDay) {
  const p = obterAbsPlanetasLotes(data);
  const asc = p.asc;
  const seitaTxt = isDay ? 'diurna' : 'noturna';

  const fortuna = calcLotePonto(asc, p.moon, p.sun, isDay, true);
  const espirito = calcLotePonto(asc, p.sun, p.moon, isDay, true);
  const eros = calcLotePonto(asc, espirito, fortuna, isDay, true);
  const necessidade = calcLotePonto(asc, fortuna, p.merc, isDay, true);
  const coragem = calcLotePonto(asc, fortuna, p.mars, isDay, true);
  const vitoria = calcLotePonto(asc, espirito, p.jup, isDay, true);
  const nemesis = calcLotePonto(asc, fortuna, p.sat, isDay, true);
  const religiao = calcLotePonto(asc, p.merc, p.moon, isDay, true);

  const casamentoDorHomem = norm360Lotes(asc + p.ven - p.sat);
  const casamentoDorMulher = norm360Lotes(asc + p.sat - p.ven);
  const casamentoValens = norm360Lotes(asc + p.jup - p.ven);

  const exaltacao = isDay
    ? norm360Lotes(asc + 19 - p.sun)
    : norm360Lotes(asc + 33 - p.moon);

  const divida = norm360Lotes(asc + p.sat - p.merc);

  const filhosValens = calcLotePonto(asc, p.jup, p.sat, isDay, true);
  const filhosPaulo = norm360Lotes(asc + p.sat - p.jup);
  const filhosHomens = calcLotePonto(asc, p.merc, p.jup, isDay, true);
  const filhasMulheres = calcLotePonto(asc, p.ven, p.jup, isDay, true);

  const paiCombusto = angularDistLotes(p.sat, p.sun) < 15;
  const pai = paiCombusto
    ? calcLotePonto(asc, p.jup, p.mars, isDay, true)
    : calcLotePonto(asc, p.sat, p.sun, isDay, true);

  const mae = calcLotePonto(asc, p.moon, p.ven, isDay, true);

  const inimigos = norm360Lotes(asc + p.mars - p.sat);

  return [
    {
      key: 'fortuna', nome: 'Lote da Fortuna', iconType: 'fortune', deg: fortuna,
      legenda: `Lote da Fortuna — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Lua − Sol' : 'ASC + Sol − Lua'})`
    },
    {
      key: 'espirito', nome: 'Lote do Espírito', iconType: 'spirit', deg: espirito,
      legenda: `Lote do Espírito — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Sol − Lua' : 'ASC + Lua − Sol'})`
    },
    {
      key: 'eros', nome: 'Lote de Eros', abbrev: 'ERO', deg: eros,
      legenda: `Lote de Eros — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Espírito − Fortuna' : 'ASC + Fortuna − Espírito'})`
    },
    {
      key: 'necessidade', nome: 'Lote da Necessidade', abbrev: 'NEC', deg: necessidade,
      legenda: `Lote da Necessidade — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Fortuna − Mercúrio' : 'ASC + Mercúrio − Fortuna'})`
    },
    {
      key: 'coragem', nome: 'Lote da Coragem', abbrev: 'COR', deg: coragem,
      legenda: `Lote da Coragem — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Fortuna − Marte' : 'ASC + Marte − Fortuna'})`
    },
    {
      key: 'vitoria', nome: 'Lote da Vitória', abbrev: 'VIT', deg: vitoria,
      legenda: `Lote da Vitória — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Espírito − Júpiter' : 'ASC + Júpiter − Espírito'})`
    },
    {
      key: 'nemesis', nome: 'Lote de Nêmesis', abbrev: 'NEM', deg: nemesis,
      legenda: `Lote de Nêmesis — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Fortuna − Saturno' : 'ASC + Saturno − Fortuna'})`
    },
    {
      key: 'religiao', nome: 'Lote da Religião', abbrev: 'REL', deg: religiao,
      legenda: `Lote da Religião — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Mercúrio − Lua' : 'ASC + Lua − Mercúrio'})`
    },
    {
      key: 'casamentoDorHomem', nome: 'Casamento (Dorotheus, Homem)', abbrev: 'CDH', deg: casamentoDorHomem,
      legenda: `Lote do Casamento (versão masculina) — Dorotheus de Sidon, fórmula fixa (ASC + Vênus − Saturno), sem inversão por seita`
    },
    {
      key: 'casamentoDorMulher', nome: 'Casamento (Dorotheus, Mulher)', abbrev: 'CDM', deg: casamentoDorMulher,
      legenda: `Lote do Casamento (versão feminina) — Dorotheus de Sidon, fórmula fixa (ASC + Saturno − Vênus), sem inversão por seita`
    },
    {
      key: 'casamentoValens', nome: 'Casamento (Valens, Geral)', abbrev: 'CV', deg: casamentoValens,
      legenda: `Lote do Casamento (versão geral) — Vettius Valens, fórmula fixa originalmente noturna (ASC + Júpiter − Vênus), sem inversão por seita`
    },
    {
      key: 'exaltacao', nome: 'Lote da Exaltação', abbrev: 'EXA', deg: exaltacao,
      legenda: `Lote da Exaltação — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + 19°Áries − Sol' : 'ASC + 3°Touro − Lua'})`
    },
    {
      key: 'divida', nome: 'Lote da Dívida', abbrev: 'DIV', deg: divida,
      legenda: `Lote da Dívida — Tradição Helenística, fórmula fixa (ASC + Saturno − Mercúrio), sem inversão por seita`
    },
    {
      key: 'filhosValens', nome: 'Filhos (Valens)', abbrev: 'FIV', deg: filhosValens,
      legenda: `Lote dos Filhos (versão de Valens) — Vettius Valens, fórmula ${seitaTxt} (${isDay ? 'ASC + Júpiter − Saturno' : 'ASC + Saturno − Júpiter'})`
    },
    {
      key: 'filhosPaulo', nome: 'Filhos (Paulo)', abbrev: 'FIP', deg: filhosPaulo,
      legenda: `Lote dos Filhos (variação de Paulo) — Paulo de Alexandria, fórmula fixa (ASC + Saturno − Júpiter), sem inversão por seita`
    },
    {
      key: 'filhosHomens', nome: 'Lote dos Filhos-Homens', abbrev: 'FIH', deg: filhosHomens,
      legenda: `Lote dos Filhos-Homens — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Mercúrio − Júpiter' : 'ASC + Júpiter − Mercúrio'})`
    },
    {
      key: 'filhasMulheres', nome: 'Lote das Filhas-Mulheres', abbrev: 'FIM', deg: filhasMulheres,
      legenda: `Lote das Filhas-Mulheres — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Vênus − Júpiter' : 'ASC + Júpiter − Vênus'})`
    },
    {
      key: 'pai', nome: 'Lote do Pai', abbrev: 'PAI', deg: pai,
      legenda: `Lote do Pai — Tradição Helenística, fórmula ${seitaTxt} (${paiCombusto ? (isDay ? 'ASC + Júpiter − Marte' : 'ASC + Marte − Júpiter') : (isDay ? 'ASC + Saturno − Sol' : 'ASC + Sol − Saturno')})${paiCombusto ? ' — Saturno sob os raios do Sol (menos de 15°), usando a fórmula alternativa' : ''}`
    },
    {
      key: 'mae', nome: 'Lote da Mãe', abbrev: 'MÃE', deg: mae,
      legenda: `Lote da Mãe — Tradição Helenística, fórmula ${seitaTxt} (${isDay ? 'ASC + Lua − Vênus' : 'ASC + Vênus − Lua'})`
    },
    {
      key: 'inimigos', nome: 'Lote dos Inimigos', abbrev: 'INI', deg: inimigos,
      legenda: `Lote dos Inimigos — Tradição Helenística, fórmula fixa (ASC + Marte − Saturno), válida de dia e de noite, sem inversão por seita`
    }
  ];
}

/* ==========================================
   PARTE 2 — CALCULADORA LIVRE (ESTADO)
   ========================================== */

let lotesCalcStartPoint = 'ASC';
let lotesCalcPlanetA = 'Sun';
let lotesCalcPlanetB = 'Moon';
let lotesCalcManualSect = null; // null = automático (pela seita do mapa) | true = dia | false = noite

/* Lotes que o astrólogo salvou a partir da Calculadora Livre (Parte 2) —
   cada um vira seu próprio quadrinho, junto com os 20 pré-calculados da
   Parte 1. lotesSelecionadosRelatorio guarda as chaves (fixas ou dos
   salvos) marcadas pra entrar no relatório — o astrólogo pode selecionar
   qualquer combinação antes de clicar em "Adicionar ao Relatório". */
let lotesCustomSalvos = [];
let lotesSelecionadosRelatorio = new Set();

function alternarSelecaoLoteRelatorio(key, marcado) {
  if (marcado) lotesSelecionadosRelatorio.add(key);
  else lotesSelecionadosRelatorio.delete(key);
  // o cartão marcado leva a marca terracota na margem (mesmo padrão do item ativo das outras ferramentas)
  const caixa = document.querySelector(`input[data-lote-relatorio-key="${key}"]`);
  const cartao = caixa && caixa.closest('.cartao');
  if (cartao) cartao.classList.toggle('ativo', !!marcado);
}
window.alternarSelecaoLoteRelatorio = alternarSelecaoLoteRelatorio;

function removerLoteCustomSalvo(id) {
  lotesCustomSalvos = lotesCustomSalvos.filter(l => l.id !== id);
  lotesSelecionadosRelatorio.delete(id);
  renderLotesUI();
}

function alternarLotesStartPoint(key) {
  lotesCalcStartPoint = key;
  renderLotesUI();
}

function alternarLotesPlanetA(key) {
  lotesCalcPlanetA = key;
  renderLotesUI();
}

function alternarLotesPlanetB(key) {
  lotesCalcPlanetB = key;
  renderLotesUI();
}

function alternarLotesSeitaManual(val) {
  lotesCalcManualSect = val;
  renderLotesUI();
}

function resolveStartPointAbsLotes(key, p, lotesPart1) {
  if (key === 'ASC') return p.asc;
  if (PLANET_NAMES_PT_LOTES[key]) return absDoPlanetaLotes(key, p);
  const lot = lotesPart1.find(l => l.key === key);
  return lot ? lot.deg : p.asc;
}

function getPontoLabelLotes(key, lotesPart1) {
  if (key === 'ASC') return 'Ascendente';
  if (PLANET_NAMES_PT_LOTES[key]) return PLANET_NAMES_PT_LOTES[key];
  const lot = lotesPart1.find(l => l.key === key);
  return lot ? lot.nome.replace(/^Lote (d[aoe]s?) /i, '') : key;
}

function getPontoIconHTMLLotes(key, lotesPart1, size) {
  if (key === 'ASC') return getASCIconSVGLotes(size);
  if (PLANET_NAMES_PT_LOTES[key]) return getPlanet3DSVGLotes(key, size);
  const lot = lotesPart1.find(l => l.key === key);
  return lot ? getLoteIconHTMLLotes(lot, size) : '';
}

/* ==========================================
   RENDERIZAÇÃO
   ========================================== */

function renderLoteCardHTML(iconHTML, nome, deg, ascAbs, legenda, opts) {
  opts = opts || {};
  const signo = Math.floor(norm360Lotes(deg) / 30);
  const casa = casaDoGrauLotes(deg, ascAbs);
  const marcado = !!(opts.key && lotesSelecionadosRelatorio.has(opts.key));
  const checkboxHTML = opts.key ? `<input type="checkbox" data-html2canvas-ignore="true" data-lote-relatorio-key="${opts.key}" ${marcado ? 'checked' : ''} onchange="alternarSelecaoLoteRelatorio('${opts.key}', this.checked)" title="Selecionar para o Relatório">` : '';
  const removerHTML = opts.onRemover ? `<button type="button" class="botao-icone botao-apagar" data-html2canvas-ignore="true" style="margin-left: auto; width: 28px; height: 28px;" title="Remover este lote salvo" onclick="${opts.onRemover}">${menuIcone('lixeira', 16)}</button>` : '';
  return `
    <div class="cartao${marcado ? ' ativo' : ''}" style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${checkboxHTML}
        <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: var(--azul-egipcio-escuro); flex-shrink: 0;">${iconHTML}</div>
        <div class="nome-nivel" style="flex: 1; line-height: 1.25;">${escapeHtml(nome)}</div>
        ${removerHTML}
      </div>
      <div class="linha-info" style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 22px; flex: 0 0 22px;">${getSignSVGLotes(signo, 22)}</div>
        <div>
          <div style="font-size: 12.5px; font-weight: 700;">${SIGN_NAMES_LOTES[signo]} ${formatDegMin(deg)}</div>
          <div class="texto-apagado" style="font-size: 10.5px; font-weight: 600;">Casa ${casa}</div>
        </div>
      </div>
      <div class="texto-apagado" style="font-size: 10px; font-style: italic; line-height: 1.35;">${escapeHtml(legenda)}</div>
    </div>
  `;
}

function renderSeletorLotes(menuId, iconHTML, menuRowsHTML, label) {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <span class="rotulo" style="color: var(--preto-tinta);">${label}</span>
      <div style="position: relative;">
        <button type="button" class="botao-icone" style="width: 44px; height: 44px;" onclick="document.querySelectorAll('.lotesCalcMenu').forEach(m => { if (m.id !== '${menuId}') m.style.display = 'none'; }); const menu = document.getElementById('${menuId}'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';">
          ${iconHTML}
        </button>
        <div id="${menuId}" class="lotesCalcMenu menu-flutuante" style="display: none; position: absolute; top: 48px; left: 50%; transform: translateX(-50%); z-index: 9999; width: 44px; box-sizing: border-box; max-height: 260px; overflow-y: auto;">
          ${menuRowsHTML}
        </div>
      </div>
    </div>
  `;
}

/* Calcula o resultado atual da Calculadora Livre (Parte 2) a partir do
   estado global (ponto de partida, Planeta A/B, seita) — usado tanto pra
   desenhar o quadrinho de pré-visualização quanto pra salvar o lote. */
function calcularResultadoLotesLivre(p, lotesPart1, isDayAuto) {
  const effectiveIsDay = (lotesCalcManualSect !== null) ? lotesCalcManualSect : isDayAuto;
  const startAbs = resolveStartPointAbsLotes(lotesCalcStartPoint, p, lotesPart1);
  const aAbs = absDoPlanetaLotes(lotesCalcPlanetA, p);
  const bAbs = absDoPlanetaLotes(lotesCalcPlanetB, p);
  const resultAbs = calcLotePonto(startAbs, aAbs, bAbs, effectiveIsDay, true);

  const startLabel = getPontoLabelLotes(lotesCalcStartPoint, lotesPart1);
  const aLabel = PLANET_NAMES_PT_LOTES[lotesCalcPlanetA];
  const bLabel = PLANET_NAMES_PT_LOTES[lotesCalcPlanetB];
  /* Na tela: "distância DE (planeta B) ATÉ (planeta A)" de dia; à noite a
     ordem se inverte (é o que calcLotePonto faz com invert=true). */
  const deLabel = effectiveIsDay ? bLabel : aLabel;
  const ateLabel = effectiveIsDay ? aLabel : bLabel;
  const formulaTxt = `${deLabel} → ${ateLabel}, a partir de ${startLabel}`;
  const formulaMat = effectiveIsDay ? `${startLabel} + ${aLabel} − ${bLabel}` : `${startLabel} + ${bLabel} − ${aLabel}`;
  const sectLabelTxt = lotesCalcManualSect === null ? `automática (${isDayAuto ? 'dia' : 'noite'})` : (lotesCalcManualSect ? 'dia — manual' : 'noite — manual');
  const resultLegenda = `Calculadora Livre — distância de ${deLabel} até ${ateLabel}, contada a partir de ${startLabel} • seita ${sectLabelTxt} • fórmula: ${formulaMat}`;

  return { resultAbs, formulaTxt, resultLegenda };
}

/* Salva o resultado atual da Calculadora Livre como um novo quadrinho
   permanente (igual aos 20 pré-calculados da Parte 1), pra poder ser
   selecionado e enviado ao relatório junto com os outros. */
async function salvarLoteCalculadoraLivre() {
  if (!currentCalculatedData) return;
  const data = currentCalculatedData;
  const p = obterAbsPlanetasLotes(data);
  const isDayAuto = ((p.sun - p.asc + 360) % 360) >= 180;
  const lotesPart1 = computeAllLotesPrecalculados(data, isDayAuto);
  const { resultAbs, formulaTxt, resultLegenda } = calcularResultadoLotesLivre(p, lotesPart1, isDayAuto);

  const nome = await astroPrompt('Nome para este lote calculado:', formulaTxt);
  if (nome === null) return; // cancelado

  const id = 'custom-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  lotesCustomSalvos.push({ id, nome: nome.trim() || formulaTxt, deg: resultAbs, legenda: resultLegenda });
  lotesSelecionadosRelatorio.add(id);
  renderLotesUI();
}
window.salvarLoteCalculadoraLivre = salvarLoteCalculadoraLivre;

function renderToggleSeitaLotes(isDayAuto) {
  const opts = [
    { val: 'null', label: 'Auto', icon: isDayAuto ? '☉' : '☽', ativo: lotesCalcManualSect === null },
    { val: 'true', label: 'Dia', icon: '☉', ativo: lotesCalcManualSect === true },
    { val: 'false', label: 'Noite', icon: '☽', ativo: lotesCalcManualSect === false }
  ];
  const buttons = opts.map(o =>
    `<button type="button" class="folder-tab-btn${o.ativo ? ' active' : ''}" onclick="alternarLotesSeitaManual(${o.val})"><span>${o.icon}</span> ${o.label}</button>`
  ).join('');
  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <span class="rotulo" style="color: var(--preto-tinta);">Seita</span>
      <div style="display: flex; gap: 14px; align-items: center; height: 44px;">${buttons}</div>
    </div>
  `;
}

function iniciarModuloLotes() {
  const container = document.getElementById("mandala-container");
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar a Calculadora de Lotes.</div>`;
    return;
  }

  renderLotesUI();
}

function renderLotesUI() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  const data = currentCalculatedData;
  const p = obterAbsPlanetasLotes(data);
  const isDayAuto = ((p.sun - p.asc + 360) % 360) >= 180;

  const lotesPart1 = computeAllLotesPrecalculados(data, isDayAuto);

  const svgGaleriaL = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  const svgRelatorioL = '<svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';

  let html = `
    <div class="lotes-outer painel" id="lotes-container" style="width: 100%; min-height: 100%; font-family: 'Montserrat', sans-serif;">

      <!-- Título e, na mesma linha, os botões: galeria e relatório -->
      <div class="cabeca-ferramenta">
        <h3 class="lotes-titulo titulo-ferramenta">Calculadora de Lotes</h3>
        <div class="acoes-ferramenta">
          <button type="button" class="botao-icone" onclick="salvarLotesNaGaleria()" title="Salvar a Calculadora de Lotes como imagem na galeria (com título e cabeçalho)">${svgGaleriaL}</button>
          <div style="position: relative; flex-shrink: 0;">
            <button type="button" class="botao-icone" onclick="const m=document.getElementById('lotesMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório">${svgRelatorioL}</button>
            <div id="lotesMenuRelatorio" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; min-width: 230px;">
              <div class="item-menu" onclick="capturarLotesInteiraParaRelatorio()">Ferramenta inteira (sem cabeçalho)</div>
              <div class="item-menu" onclick="capturarLotesSelecionadosParaRelatorio()">Só os lotes marcados</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CABEÇALHO PADRÃO (função global, o mesmo de todas as ferramentas) -->
      ${montarCabecalhoMandalaImagemHTML(data, null, { tintaSobreFolha: true })}

      <div id="lotesConteudoArea">

      <!-- PARTE 1: LOTES PRÉ-CALCULADOS -->
      <h4 class="titulo-secao">Parte 1 — Lotes Pré-Calculados</h4>

      <div class="grade-lotes">
        ${lotesPart1.map(l => renderLoteCardHTML(getLoteIconHTMLLotes(l, 24), l.nome, l.deg, p.asc, l.legenda, { key: l.key })).join('')}
      </div>

      <hr class="divisa">

      ${lotesCustomSalvos.length ? `
      <!-- LOTES SALVOS DA CALCULADORA LIVRE -->
      <h4 class="titulo-secao">Lotes Salvos (Calculadora Livre)</h4>

      <div class="grade-lotes">
        ${lotesCustomSalvos.map(c => renderLoteCardHTML(getLoteAbbrevIconSVG('✓', 24), c.nome, c.deg, p.asc, c.legenda, { key: c.id, onRemover: `removerLoteCustomSalvo('${c.id}')` })).join('')}
      </div>

      <hr class="divisa">
      ` : ''}
  `;

  /* PARTE 2: CALCULADORA LIVRE */
  const startPointOptions = [
    { key: 'ASC', label: 'Ascendente' },
    { key: 'Sun', label: 'Sol' },
    { key: 'Moon', label: 'Lua' },
    { key: 'Mercury', label: 'Mercúrio' },
    { key: 'Venus', label: 'Vênus' },
    { key: 'Mars', label: 'Marte' },
    { key: 'Jupiter', label: 'Júpiter' },
    { key: 'Saturn', label: 'Saturno' },
    ...lotesPart1.map(l => ({ key: l.key, label: l.nome }))
  ];
  const planetOptions = [
    { key: 'Sun', label: 'Sol' },
    { key: 'Moon', label: 'Lua' },
    { key: 'Mercury', label: 'Mercúrio' },
    { key: 'Venus', label: 'Vênus' },
    { key: 'Mars', label: 'Marte' },
    { key: 'Jupiter', label: 'Júpiter' },
    { key: 'Saturn', label: 'Saturno' }
  ];

  const startMenuRows = startPointOptions.map(o =>
    `<div onclick="alternarLotesStartPoint('${o.key}')" title="${escapeHtml(o.label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center; color: var(--azul-egipcio-escuro);">${getPontoIconHTMLLotes(o.key, lotesPart1, 22)}</div>`
  ).join('');
  const planetAMenuRows = planetOptions.map(o =>
    `<div onclick="alternarLotesPlanetA('${o.key}')" title="${escapeHtml(o.label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVGLotes(o.key, 22)}</div>`
  ).join('');
  const planetBMenuRows = planetOptions.map(o =>
    `<div onclick="alternarLotesPlanetB('${o.key}')" title="${escapeHtml(o.label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVGLotes(o.key, 22)}</div>`
  ).join('');

  const startIconHTML = getPontoIconHTMLLotes(lotesCalcStartPoint, lotesPart1, 26);
  const planetAIconHTML = getPlanet3DSVGLotes(lotesCalcPlanetA, 26);
  const planetBIconHTML = getPlanet3DSVGLotes(lotesCalcPlanetB, 26);

  const { resultAbs, formulaTxt, resultLegenda } = calcularResultadoLotesLivre(p, lotesPart1, isDayAuto);

  html += `
      <!-- PARTE 2: CALCULADORA LIVRE -->
      <h4 class="titulo-secao">Parte 2 — Calculadora Livre</h4>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: 22px;">
          ${renderSeletorLotes('lotesPlanetBMenu', planetBIconHTML, planetBMenuRows, 'Distância de')}
          ${renderSeletorLotes('lotesPlanetAMenu', planetAIconHTML, planetAMenuRows, 'Até')}
          ${renderSeletorLotes('lotesStartMenu', startIconHTML, startMenuRows, 'Contar do')}
          ${renderToggleSeitaLotes(isDayAuto)}
        </div>

        <div style="max-width: 260px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 8px;">
          ${renderLoteCardHTML(getLoteAbbrevIconSVG('=', 24), formulaTxt, resultAbs, p.asc, resultLegenda)}
          <button type="button" class="botao-texto" data-html2canvas-ignore="true" onclick="salvarLoteCalculadoraLivre()" style="align-self: center; padding: 6px 16px; font-size: 12px;">Salvar este Lote</button>
        </div>
      </div>

      <hr class="divisa">

      </div>
    </div>
  `;

  container.innerHTML = html;
}

/* Monta, fora da tela (não é a tela real do usuário — é um grid novo,
   só com os quadrinhos marcados), uma imagem com os lotes selecionados
   e guarda pro relatório. Diferente das outras ferramentas, aqui não dá
   pra "capturar a tela toda", porque o astrólogo escolhe um subconjunto
   dos 20 pré-calculados + qualquer lote que tenha salvo na Calculadora
   Livre — cada envio pega só o que estiver marcado no momento. */
async function capturarLotesSelecionadosParaRelatorio() {
  const menuRel = document.getElementById('lotesMenuRelatorio');
  if (menuRel) menuRel.style.display = 'none';
  if (lotesSelecionadosRelatorio.size === 0) {
    alert('Marque a caixinha de pelo menos um lote antes de adicionar ao relatório.');
    return;
  }
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }
  if (!currentCalculatedData) return;

  const data = currentCalculatedData;
  const p = obterAbsPlanetasLotes(data);
  const isDayAuto = ((p.sun - p.asc + 360) % 360) >= 180;
  const lotesPart1 = computeAllLotesPrecalculados(data, isDayAuto);

  const todosDisponiveis = lotesPart1.map(l => ({ key: l.key, iconHTML: getLoteIconHTMLLotes(l, 24), nome: l.nome, deg: l.deg, legenda: l.legenda }))
    .concat(lotesCustomSalvos.map(c => ({ key: c.id, iconHTML: getLoteAbbrevIconSVG('✓', 24), nome: c.nome, deg: c.deg, legenda: c.legenda })));

  const selecionados = todosDisponiveis.filter(l => lotesSelecionadosRelatorio.has(l.key));
  if (!selecionados.length) {
    alert('Os lotes marcados não foram encontrados — desmarque e marque de novo.');
    return;
  }

  /* Nem título embutido, nem largura fixa: o astrólogo pediu que a
     imagem enviada ao relatório seja só os quadrinhos marcados, do
     tamanho exato deles — sem um "Lotes Selecionados" escrito (o
     relatório já mostra isso no Índice; virou rótulo duplicado, sem
     sentido pro cliente ler) e sem sobrar fundo vazio quando é só 1 ou 2
     lotes (a largura fixa de 900px, pensada pra caber vários lado a
     lado, deixava um vão vazio à direita quando tinha menos que isso).
     Largura calculada em função de quantos cartões cabem por linha
     (até 3): 1 lote = 1 coluna, 2 = 2 colunas, 3+ = 3 colunas por linha
     (quebrando pra linha de baixo se passar de 3). */
  const CARD_W = 220, GAP = 12, PAD = 20;
  const numCols = Math.min(selecionados.length, 3);
  const larguraTotal = (numCols * CARD_W) + ((numCols - 1) * GAP) + (PAD * 2);

  const temp = document.createElement('div');
  temp.className = 'lotes-captura-temp'; // no Tema Céu herda as variáveis de cor em tinta da folha
  temp.style.cssText = `position: fixed; top: 0; left: -9999px; width: ${larguraTotal}px; padding: ${PAD}px; background: transparent; font-family: "Montserrat", sans-serif;`;
  temp.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${numCols}, ${CARD_W}px); gap: ${GAP}px;">
      ${selecionados.map(l => renderLoteCardHTML(l.iconHTML, l.nome, l.deg, p.asc, l.legenda)).join('')}
    </div>
  `;
  document.body.appendChild(temp);

  try {
    // Fallback só pra eventuais áreas transparentes — acompanha o modo
    // atual em vez de cravar sempre o creme do Tema Claro (mesmo padrão
    // de capturarTelaParaRelatorio em relatorio.js).
    const modoEscuroCapturaLotes = document.documentElement.classList.contains('tema-escuro');
    const fundoCapt = window.temaMandala === 'ceu' ? null : (modoEscuroCapturaLotes ? '#1c1917' : '#fffdf5'); // Tema Céu: sem fundo
    const canvas = recortarCanvasAoConteudo(await html2canvas(temp, { backgroundColor: fundoCapt, scale: 2, useCORS: true }), fundoCapt);
    const total = adicionarCapturaRelatorio('lotes_calculados', canvas.toDataURL('image/png'));
    alert(`${selecionados.length} lote(s) adicionado(s) ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar lotes ao relatório:', err);
    alert('Não foi possível adicionar os lotes selecionados ao relatório.');
  } finally {
    document.body.removeChild(temp);
  }
}
window.capturarLotesSelecionadosParaRelatorio = capturarLotesSelecionadosParaRelatorio;

/* Botão de galeria: título + cabeçalho padrão + a ferramenta inteira, SÓ AO
   TOCAR (ver capturarESalvarNaGaleria e gerarImagemHtmlComCabecalho, mandala.js). */
function salvarLotesNaGaleria() {
  const area = document.getElementById('lotesConteudoArea');
  if (!area) return;
  capturarESalvarNaGaleria(
    () => gerarImagemHtmlComCabecalho(area, { titulo: 'CALCULADORA DE LOTES', comCabecalho: true, papiro: true }),
    `Astro_Hellenic_Lotes_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
window.salvarLotesNaGaleria = salvarLotesNaGaleria;

/* Manda pro Relatório a ferramenta inteira, SEM título nem cabeçalho. */
async function capturarLotesInteiraParaRelatorio() {
  const menu = document.getElementById('lotesMenuRelatorio');
  if (menu) menu.style.display = 'none';
  const area = document.getElementById('lotesConteudoArea');
  if (!area) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  try {
    const fundo = window.temaMandala === 'ceu' ? null : (document.documentElement.classList.contains('tema-escuro') ? '#1c1917' : '#fffdf5'); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('lotes_calculados', canvas.toDataURL('image/png'));
    alert(`"Calculadora de Lotes" foi adicionada ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar a Calculadora de Lotes ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarLotesInteiraParaRelatorio = capturarLotesInteiraParaRelatorio;
