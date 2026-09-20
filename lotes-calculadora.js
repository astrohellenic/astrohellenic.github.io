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
const SIGN_COLORS_LOTES = ["#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8"];

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
  const modoEscuro = document.documentElement.classList.contains('tema-escuro');
  const cores = modoEscuro
    ? ["#ff6b4a", "#c9863f", "#38bdf8", "#60a5fa", "#ff6b4a", "#c9863f", "#38bdf8", "#60a5fa", "#ff6b4a", "#c9863f", "#38bdf8", "#60a5fa"]
    : SIGN_COLORS_LOTES;
  const interno = `<g style="color: ${cores[signIndex]};">${MONOLINE_ZODIAC_SVGS_LOTES[signIndex]}</g>`;
  return svgComoImagemLotes(interno, size, size, '0 0 64 64');
}

/* Reaproveita o SVG esférico/simples já definido globalmente (decenios.js/horas.js) conforme a Aparência escolhida pelo usuário. */
function getPlanet3DSVGLotes(planetId, size = 26) {
  if (typeof getPlanet3DSVG === 'function') {
    return getPlanet3DSVG(planetId, size);
  }
  return '';
}

/* Mesmo círculo preto sobre fundo branco usado para ASC/DSC/MC/IC na mandala e no Painel Técnico — cores resolvidas em hex pelo mesmo motivo do comentário acima (vira <img>). */
function getASCIconSVGLotes(size = 22) {
  const modoEscuro = document.documentElement.classList.contains('tema-escuro');
  const fundo = modoEscuro ? '#262220' : '#ffffff';
  const tinta = modoEscuro ? '#e8e6df' : '#000000';
  const interno = `<circle cx="0" cy="0" r="10" fill="${fundo}" stroke="${tinta}" stroke-width="1.8"/><text x="0" y="3.5" font-size="9" font-weight="900" fill="${tinta}" text-anchor="middle">ASC</text>`;
  return svgComoImagemLotes(interno, size, size, '-12 -12 24 24');
}

/* Ícone genérico de lote (mesmo padrão de círculo + símbolo usado em liberacao.js/direcoes.js), com uma abreviação curta no lugar de um único glifo planetário quando o lote combina mais de um termo.
   Cor gravada direto no SVG: como <img> não herda currentColor nem var(--x)
   de fora, precisa vir com a cor já resolvida em hexadecimal dentro dela —
   mesma cor usada em todos os lugares que chamam esta função (ver
   renderLoteCardHTML/renderSeletorLotes). */
function getLoteAbbrevIconSVG(abbrev, size = 22) {
  const cor = document.documentElement.classList.contains('tema-escuro') ? '#8ab4e8' : '#103b70';
  const len = (abbrev || '').length;
  const fontSize = len <= 2 ? 10 : (len === 3 ? 8.3 : (len === 4 ? 7 : 6));
  const interno = `<circle cx="0" cy="0" r="10" fill="none" stroke="${cor}" stroke-width="1.8"/><text x="0" y="3" font-size="${fontSize}" font-weight="800" fill="${cor}" text-anchor="middle">${abbrev}</text>`;
  return svgComoImagemLotes(interno, size, size, '-12 -12 24 24');
}

function getLoteFortunaIconSVG(size = 22) {
  const cor = document.documentElement.classList.contains('tema-escuro') ? '#8ab4e8' : '#103b70';
  const interno = `<circle cx="0" cy="0" r="10" fill="none" stroke="${cor}" stroke-width="1.8"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="${cor}" stroke-width="1.8"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="${cor}" stroke-width="1.8"/>`;
  return svgComoImagemLotes(interno, size, size, '-12 -12 24 24');
}

function getLoteEspiritoIconSVG(size = 22) {
  const cor = document.documentElement.classList.contains('tema-escuro') ? '#8ab4e8' : '#103b70';
  const interno = `<text x="0" y="9" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="${cor}" text-anchor="middle">Φ</text>`;
  return svgComoImagemLotes(interno, size, size, '-12 -12 24 24');
}

/* Dispara o ícone correto para um item de lote já calculado (Parte 1). */
function getLoteIconHTMLLotes(lotObj, size = 24) {
  if (lotObj.iconType === 'fortune') return getLoteFortunaIconSVG(size);
  if (lotObj.iconType === 'spirit') return getLoteEspiritoIconSVG(size);
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
  const checkboxHTML = opts.key ? `
    <input type="checkbox" data-lote-relatorio-key="${opts.key}" ${lotesSelecionadosRelatorio.has(opts.key) ? 'checked' : ''} onchange="alternarSelecaoLoteRelatorio('${opts.key}', this.checked)" title="Selecionar para o Relatório" style="width: 15px; height: 15px; cursor: pointer; flex-shrink: 0;">
  ` : '';
  const removerHTML = opts.onRemover ? `
    <i class="fa-solid fa-trash" style="color: var(--danger); cursor: pointer; font-size: 11px; margin-left: auto; flex-shrink: 0;" title="Remover este lote salvo" onclick="${opts.onRemover}"></i>
  ` : '';
  return `
    <div style="border: 1px solid var(--gold-primary); border-radius: 10px; background: var(--bg-card); padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${checkboxHTML}
        <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: var(--primary-blue); flex-shrink: 0;">${iconHTML}</div>
        <div style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 12.5px; color: var(--primary-blue); line-height: 1.25; flex: 1;">${escapeHtml(nome)}</div>
        ${removerHTML}
      </div>
      <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px 10px;">
        ${getSignSVGLotes(signo, 22)}
        <div>
          <div style="font-size: 12.5px; font-weight: 700; color: var(--primary-blue);">${SIGN_NAMES_LOTES[signo]} ${formatDegMin(deg)}</div>
          <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Casa ${casa}</div>
        </div>
      </div>
      <div style="font-size: 10px; color: var(--text-muted); font-style: italic; line-height: 1.35;">${escapeHtml(legenda)}</div>
    </div>
  `;
}

function renderSeletorLotes(menuId, iconHTML, menuRowsHTML, label) {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <span style="font-size: 9.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px;">${label}</span>
      <div style="position: relative;">
        <button type="button" onclick="document.querySelectorAll('.lotesCalcMenu').forEach(m => { if (m.id !== '${menuId}') m.style.display = 'none'; }); const menu = document.getElementById('${menuId}'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: 42px; height: 42px; border-radius: 8px; background: var(--bg-main); color: var(--primary-blue); border: 1px solid var(--gold-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${iconHTML}
        </button>
        <div id="${menuId}" class="lotesCalcMenu" style="display: none; position: absolute; top: 46px; left: 50%; transform: translateX(-50%); background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 44px; max-height: 240px; overflow-y: auto; box-sizing: border-box;">
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
  const formulaTxt = effectiveIsDay ? `${startLabel} + ${aLabel} − ${bLabel}` : `${startLabel} + ${bLabel} − ${aLabel}`;
  const sectLabelTxt = lotesCalcManualSect === null ? `automática (${isDayAuto ? 'dia' : 'noite'})` : (lotesCalcManualSect ? 'dia — manual' : 'noite — manual');
  const resultLegenda = `Calculadora Livre — fórmula: ASC-equivalente ${formulaTxt} • seita ${sectLabelTxt}`;

  return { resultAbs, formulaTxt, resultLegenda };
}

/* Salva o resultado atual da Calculadora Livre como um novo quadrinho
   permanente (igual aos 20 pré-calculados da Parte 1), pra poder ser
   selecionado e enviado ao relatório junto com os outros. */
function salvarLoteCalculadoraLivre() {
  if (!currentCalculatedData) return;
  const data = currentCalculatedData;
  const p = obterAbsPlanetasLotes(data);
  const isDayAuto = ((p.sun - p.asc + 360) % 360) >= 180;
  const lotesPart1 = computeAllLotesPrecalculados(data, isDayAuto);
  const { resultAbs, formulaTxt, resultLegenda } = calcularResultadoLotesLivre(p, lotesPart1, isDayAuto);

  const nome = prompt('Nome para este lote calculado:', formulaTxt);
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
  const buttons = opts.map(o => {
    return `<button type="button" onclick="alternarLotesSeitaManual(${o.val})" style="padding: 0 10px; height: 42px; font-size: 10.5px; font-weight: 700; border: 1px solid var(--gold-primary); border-left: none; background: ${o.ativo ? '#103b70' : 'var(--bg-main)'}; color: ${o.ativo ? '#ffffff' : 'var(--primary-blue)'}; cursor: pointer;">${o.icon} ${o.label}</button>`;
  }).join('');
  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <span style="font-size: 9.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px;">Seita</span>
      <div style="display: flex; border-radius: 8px; overflow: hidden; border-left: 1px solid var(--gold-primary);">${buttons}</div>
    </div>
  `;
}

function iniciarModuloLotes() {
  const container = document.getElementById("mandala-container");
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar a Calculadora de Lotes.</div>`;
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

  /* CABEÇALHO PADRÃO: mesmo contorno/fundo do cabeçalho da mandala (creme #fffdf5, borda dourada #c59b27), usado por Decênios, Liberação Zodiacal e Circumambulações. */
  const headerTitle = currentCustomCode ? `${currentCustomCode} ${currentSubjectName}` : currentSubjectName;
  const diasSemanaLotesLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diaSemanaFormatted = diasSemanaLotesLabels[currentMoment.getDay()];
  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
  const anoH = currentMoment.getFullYear();
  const mesH = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const diaH = String(currentMoment.getDate()).padStart(2, '0');
  const horaH = String(currentMoment.getHours()).padStart(2, '0');
  const minH = String(currentMoment.getMinutes()).padStart(2, '0');

  let html = `
    <div class="lotes-outer" style="width: 100%; min-height: 100%; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">

      <h3 class="lotes-titulo" style="font-family: 'Cinzel', serif; font-weight: 800; color: var(--primary-blue); margin-top: 0; margin-bottom: 10px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
        Calculadora de Lotes
      </h3>

      <div class="lotes-cabecalho" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; background: var(--bg-main); border: 2px solid var(--gold-primary); border-radius: 10px; padding: 10px 16px; flex-wrap: wrap;">
        <div>
          <div style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 15px; color: var(--primary-blue);">${escapeHtml(headerTitle)}</div>
          <div style="font-size: 11.5px; color: var(--text-muted-2); font-weight: 500; margin-top: 2px;">${diaSemanaFormatted} • ${diaH}/${mesH}/${anoH} às ${horaH}:${minH} (${fusoFormatted}) • ${escapeHtml(currentGeo.city)} • <strong style="color: var(--badge-text);">${isDayAuto ? 'Natividade Diurna' : 'Natividade Noturna'}</strong></div>
        </div>
        <button type="button" onclick="capturarLotesSelecionadosParaRelatorio()" title="Adiciona os lotes marcados (caixinha em cada quadrinho) como um bloco no Relatório" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif; flex-shrink: 0;">
          <i class="fa-solid fa-file-circle-plus"></i> Adicionar ao Relatório
        </button>
      </div>

      <!-- PARTE 1: LOTES PRÉ-CALCULADOS -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 13px; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.5px;">Parte 1 — Lotes Pré-Calculados</span>
        <div style="flex: 1; height: 1px; background: var(--gold-primary); opacity: 0.5;"></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 28px;">
        ${lotesPart1.map(l => renderLoteCardHTML(getLoteIconHTMLLotes(l, 24), l.nome, l.deg, p.asc, l.legenda, { key: l.key })).join('')}
      </div>

      ${lotesCustomSalvos.length ? `
      <!-- LOTES SALVOS DA CALCULADORA LIVRE -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 13px; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.5px;">Lotes Salvos (Calculadora Livre)</span>
        <div style="flex: 1; height: 1px; background: var(--gold-primary); opacity: 0.5;"></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 28px;">
        ${lotesCustomSalvos.map(c => renderLoteCardHTML(getLoteAbbrevIconSVG('✓', 24), c.nome, c.deg, p.asc, c.legenda, { key: c.id, onRemover: `removerLoteCustomSalvo('${c.id}')` })).join('')}
      </div>
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
    `<div onclick="alternarLotesStartPoint('${o.key}')" title="${escapeHtml(o.label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center; color: var(--primary-blue);">${getPontoIconHTMLLotes(o.key, lotesPart1, 22)}</div>`
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
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 13px; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.5px;">Parte 2 — Calculadora Livre</span>
        <div style="flex: 1; height: 1px; background: var(--gold-primary); opacity: 0.5;"></div>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--gold-primary); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: 22px;">
          ${renderSeletorLotes('lotesStartMenu', startIconHTML, startMenuRows, 'Ponto de Partida')}
          <div style="align-self: center; font-family: 'Cinzel', serif; font-weight: 800; font-size: 18px; color: var(--gold-primary); margin-top: 20px;">+</div>
          ${renderSeletorLotes('lotesPlanetAMenu', planetAIconHTML, planetAMenuRows, 'Planeta A')}
          <div style="align-self: center; font-family: 'Cinzel', serif; font-weight: 800; font-size: 18px; color: var(--gold-primary); margin-top: 20px;">−</div>
          ${renderSeletorLotes('lotesPlanetBMenu', planetBIconHTML, planetBMenuRows, 'Planeta B')}
          ${renderToggleSeitaLotes(isDayAuto)}
        </div>

        <div style="max-width: 260px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 8px;">
          ${renderLoteCardHTML(getLoteAbbrevIconSVG('=', 24), formulaTxt, resultAbs, p.asc, resultLegenda)}
          <button type="button" onclick="salvarLoteCalculadoraLivre()" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif;">
            <i class="fa-solid fa-floppy-disk"></i> Salvar este Lote
          </button>
        </div>
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

  const temp = document.createElement('div');
  temp.style.cssText = 'position: fixed; top: 0; left: -9999px; width: 900px; padding: 20px; background: var(--bg-main); font-family: "Montserrat", sans-serif;';
  temp.innerHTML = `
    <h3 style="font-family: 'Cinzel', serif; font-weight: 800; color: var(--primary-blue); margin-top: 0; margin-bottom: 14px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">Lotes Selecionados</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
      ${selecionados.map(l => renderLoteCardHTML(l.iconHTML, l.nome, l.deg, p.asc, l.legenda)).join('')}
    </div>
  `;
  document.body.appendChild(temp);

  try {
    // Fallback só pra eventuais áreas transparentes — acompanha o modo
    // atual em vez de cravar sempre o creme do Tema Claro (mesmo padrão
    // de capturarTelaParaRelatorio em relatorio.js).
    const modoEscuroCapturaLotes = document.documentElement.classList.contains('tema-escuro');
    const canvas = await html2canvas(temp, { backgroundColor: modoEscuroCapturaLotes ? '#1c1917' : '#fffdf5', scale: 2, useCORS: true });
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
