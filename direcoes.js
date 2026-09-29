/* ==========================================
   MÓDULO DE CIRCUMAMBULAÇÕES (DIREÇÕES)
   MÉTODO HELENÍSTICO PURISTA (VETTIUS VALENS)

   Fontes:
   - Método de ascensão (Ascensão Oblíqua, 1° de ascensão = 1 ano):
     Vettius Valens, Anthology I.6.
   - Lotes (Fortuna, Espírito e os 5 lotes planetários): método de
     Paulo de Alexandria.
   - Termos egípcios: tabela padrão consolidada (ver
     EGYPTIAN_TERMS_DIRECOES abaixo).
   - Zodíaco tropical puro, 0° Áries = equinócio real, sem offset
     histórico (nem 8°, nem 10°) — mesma configuração padrão (offset=0)
     usada pelo Delphic Oracle (Project Hindsight / Robert Schmidt).

   Nota de design: os afetas direcionáveis (Ascendente, Sol, Lua,
   Sizígia e os 7 Lotes) representam, cada um, seu próprio domínio
   temático a ser investigado via circumambulação. Não há, por
   enquanto, implementação de planetas individuais como pontos
   direcionáveis — não há atestação direta disso nas fontes.
   ========================================== */

let selectedAphetesKey = "ASC"; // Afeta padrão inicial

/* MATRIZ DE TERMOS EGÍPCIOS DE VETTIUS VALENS */
const EGYPTIAN_TERMS_DIRECOES = [
  [{ pId: "Jupiter", pSym: "♃", deg: 6 }, { pId: "Venus", pSym: "♀", deg: 12 }, { pId: "Mercury", pSym: "☿", deg: 20 }, { pId: "Mars", pSym: "♂", deg: 25 }, { pId: "Saturn", pSym: "♄", deg: 30 }],
  [{ pId: "Venus", pSym: "♀", deg: 8 }, { pId: "Mercury", pSym: "☿", deg: 14 }, { pId: "Jupiter", pSym: "♃", deg: 22 }, { pId: "Saturn", pSym: "♄", deg: 27 }, { pId: "Mars", pSym: "♂", deg: 30 }],
  [{ pId: "Mercury", pSym: "☿", deg: 6 }, { pId: "Jupiter", pSym: "♃", deg: 12 }, { pId: "Venus", pSym: "♀", deg: 17 }, { pId: "Mars", pSym: "♂", deg: 24 }, { pId: "Saturn", pSym: "♄", deg: 30 }],
  [{ pId: "Mars", pSym: "♂", deg: 7 }, { pId: "Venus", pSym: "♀", deg: 13 }, { pId: "Mercury", pSym: "☿", deg: 19 }, { pId: "Jupiter", pSym: "♃", deg: 26 }, { pId: "Saturn", pSym: "♄", deg: 30 }],
  [{ pId: "Jupiter", pSym: "♃", deg: 6 }, { pId: "Venus", pSym: "♀", deg: 11 }, { pId: "Saturn", pSym: "♄", deg: 18 }, { pId: "Mercury", pSym: "☿", deg: 24 }, { pId: "Mars", pSym: "♂", deg: 30 }],
  [{ pId: "Mercury", pSym: "☿", deg: 7 }, { pId: "Venus", pSym: "♀", deg: 17 }, { pId: "Jupiter", pSym: "♃", deg: 21 }, { pId: "Mars", pSym: "♂", deg: 28 }, { pId: "Saturn", pSym: "♄", deg: 30 }],
  [{ pId: "Saturn", pSym: "♄", deg: 6 }, { pId: "Mercury", pSym: "☿", deg: 14 }, { pId: "Jupiter", pSym: "♃", deg: 21 }, { pId: "Venus", pSym: "♀", deg: 28 }, { pId: "Mars", pSym: "♂", deg: 30 }],
  [{ pId: "Mars", pSym: "♂", deg: 7 }, { pId: "Venus", pSym: "♀", deg: 11 }, { pId: "Mercury", pSym: "☿", deg: 19 }, { pId: "Jupiter", pSym: "♃", deg: 24 }, { pId: "Saturn", pSym: "♄", deg: 30 }],
  [{ pId: "Jupiter", pSym: "♃", deg: 12 }, { pId: "Venus", pSym: "♀", deg: 17 }, { pId: "Mercury", pSym: "☿", deg: 21 }, { pId: "Saturn", pSym: "♄", deg: 26 }, { pId: "Mars", pSym: "♂", deg: 30 }],
  [{ pId: "Mercury", pSym: "☿", deg: 7 }, { pId: "Jupiter", pSym: "♃", deg: 14 }, { pId: "Venus", pSym: "♀", deg: 22 }, { pId: "Saturn", pSym: "♄", deg: 26 }, { pId: "Mars", pSym: "♂", deg: 30 }],
  [{ pId: "Mercury", pSym: "☿", deg: 7 }, { pId: "Venus", pSym: "♀", deg: 13 }, { pId: "Jupiter", pSym: "♃", deg: 20 }, { pId: "Mars", pSym: "♂", deg: 25 }, { pId: "Saturn", pSym: "♄", deg: 30 }],
  [{ pId: "Venus", pSym: "♀", deg: 12 }, { pId: "Jupiter", pSym: "♃", deg: 16 }, { pId: "Mercury", pSym: "☿", deg: 19 }, { pId: "Mars", pSym: "♂", deg: 28 }, { pId: "Saturn", pSym: "♄", deg: 30 }]
];

/* ==========================================================
   ASCENSÃO OBLÍQUA — CÁLCULO TRIGONOMÉTRICO EXATO
   Substitui a tabela discreta de 7 climas (antiga
   obterTemposAscensionaisValens) por cálculo contínuo, válido para
   qualquer latitude (Norte ou Sul), sem necessidade de tabela nem de
   lógica de espelhamento hemisférico.

   Método: mesma convenção usada por Vettius Valens (Anthology I.6) —
   1 grau de ascensão (tempo-grau equatorial) = 1 ano de vida.
   Zodíaco tropical puro (0° Áries = equinócio real, sem offset histórico).
   Configuração alinhada ao Delphic Oracle (Project Hindsight / Robert Schmidt).
   ========================================================== */

/* Obliquidade da eclíptica (valor moderno; pode ser trocado por um
   valor histórico se um dia quiserem testar precisão antiga, mas o
   Delphic Oracle usa o valor exato/moderno por padrão) */
const OBLIQUIDADE_ECLIPTICA_GRAUS = 23.4367;

function grausParaRad(g) {
  return (g * Math.PI) / 180;
}

function radParaGraus(r) {
  return (r * 180) / Math.PI;
}

function normalizar360(g) {
  return ((g % 360) + 360) % 360;
}

/**
 * Declinação de um ponto da eclíptica.
 * sin(δ) = sin(ε) × sin(λ)
 * @param {number} longitudeEclipticaGraus - longitude tropical absoluta (0-360, 0 = Áries)
 * @returns {number} declinação em graus (positiva = Norte, negativa = Sul)
 */
function calcularDeclinacao(longitudeEclipticaGraus) {
  const eps = grausParaRad(OBLIQUIDADE_ECLIPTICA_GRAUS);
  const lam = grausParaRad(longitudeEclipticaGraus);
  return radParaGraus(Math.asin(Math.sin(eps) * Math.sin(lam)));
}

/**
 * Ascensão Reta (RA) de um ponto da eclíptica.
 * @param {number} longitudeEclipticaGraus - longitude tropical absoluta (0-360)
 * @returns {number} ascensão reta em graus (0-360)
 */
function calcularAscensaoReta(longitudeEclipticaGraus) {
  const eps = grausParaRad(OBLIQUIDADE_ECLIPTICA_GRAUS);
  const lam = grausParaRad(longitudeEclipticaGraus);
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  return normalizar360(radParaGraus(ra));
}

/**
 * Diferença Ascensional (AD).
 * AD = arcsin(tan(δ) × tan(latitude))
 * O sinal da latitude (negativo no Hemisfério Sul) já resolve
 * automaticamente a inversão Norte/Sul — não precisa de tabela espelhada.
 * @param {number} declinacaoGraus
 * @param {number} latitudeGraus - positiva = Norte, negativa = Sul
 * @returns {number} AD em graus
 */
function calcularDiferencaAscensional(declinacaoGraus, latitudeGraus) {
  const decl = grausParaRad(declinacaoGraus);
  const lat = grausParaRad(latitudeGraus);
  let produto = Math.tan(decl) * Math.tan(lat);
  // Proteção para latitudes extremas (círculo polar) — não deve ocorrer
  // em uso normal, mas evita NaN caso alguém teste uma latitude extrema.
  produto = Math.max(-1, Math.min(1, produto));
  return radParaGraus(Math.asin(produto));
}

/**
 * Ascensão Oblíqua (OA) de um ponto da eclíptica, para uma latitude dada.
 * OA = RA − AD
 * @param {number} longitudeEclipticaGraus - longitude tropical absoluta (0-360)
 * @param {number} latitudeGraus - positiva = Norte, negativa = Sul
 * @returns {number} ascensão oblíqua em graus (0-360)
 */
function calcularAscensaoObliqua(longitudeEclipticaGraus, latitudeGraus) {
  const decl = calcularDeclinacao(longitudeEclipticaGraus);
  const ra = calcularAscensaoReta(longitudeEclipticaGraus);
  const ad = calcularDiferencaAscensional(decl, latitudeGraus);
  return normalizar360(ra - ad);
}

/**
 * Tempo de ascensão (em "anos", pela convenção 1° = 1 ano) entre dois
 * graus absolutos da eclíptica, percorridos na ordem direta dos signos
 * (sentido do início ao fim, sempre para frente).
 * @param {number} grauInicioAbs - grau absoluto de partida (0-360)
 * @param {number} grauFimAbs - grau absoluto de chegada (0-360)
 * @param {number} latitudeGraus - latitude do nativo (positiva=N, negativa=S)
 * @returns {number} anos decorridos (sempre positivo, considera volta ao
 *   zodíaco se o fim "está atrás" do início em termos de OA)
 */
function tempoAscensionalEntreGraus(grauInicioAbs, grauFimAbs, latitudeGraus) {
  const oaInicio = calcularAscensaoObliqua(grauInicioAbs, latitudeGraus);
  const oaFim = calcularAscensaoObliqua(grauFimAbs, latitudeGraus);
  let anos = oaFim - oaInicio;
  if (anos < 0) anos += 360;
  return anos;
}

const MONOLINE_ZODIAC_SVGS_DIRECOES = [
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

const SIGN_COLORS_DIRECOES = ["var(--element-fogo)", "var(--element-terra)", "var(--element-ar)", "var(--element-agua)", "var(--element-fogo)", "var(--element-terra)", "var(--element-ar)", "var(--element-agua)", "var(--element-fogo)", "var(--element-terra)", "var(--element-ar)", "var(--element-agua)"];

function getSignSVGDir(signIndex, size = 22) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${SIGN_COLORS_DIRECOES[signIndex]}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_DIRECOES[signIndex]}</svg>`;
}

function getPlanet3DSVGDir(planetId) {
  if (typeof getPlanet3DSVG === 'function') {
    return getPlanet3DSVG(planetId);
  }
  return '';
}

function formatarDataBRDir(data) {
  if (!data || isNaN(data.getTime())) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  return `${d}/${m}/${a}`;
}

/* Ícones plotados na pauta (marcadores de lote/sizígia/ângulo) — vêm do
   mesmo bloco central novo (planetIcons.js) usado em toda ferramenta já
   migrada, respeitando o interruptor simples/esférico igual os demais. */
const LOTE_ICON_KEY_DIR = {
  fortune: 'fortune', spirit: 'spirit', venus: 'eros',
  mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis'
};
function getItemSVGDir(key) {
  if (typeof getIconeSVG !== 'function') return `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
  if (key === 'Syz' || key === 'Sizígia') return getIconeSVG('outro', 'sizigia', 22);
  if (LOTE_ICON_KEY_DIR[key]) return getIconeSVG('lote', LOTE_ICON_KEY_DIR[key], 22);
  if (key === 'ASC' || key === 'DSC' || key === 'MC' || key === 'IC') {
    return (typeof getAnguloCirculoSVG === 'function') ? getAnguloCirculoSVG(key, 26) : `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
  }
  return `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
}

function getAfetaCursorSVG(key) {
  const planetKeys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'NodoNorte'];
  if (planetKeys.includes(key)) {
    return getPlanet3DSVGDir(key);
  }
  return getItemSVGDir(key === 'Syz' ? 'Sizígia' : key);
}

/* SÍMBOLOS DOS ASPECTOS EM SVG VETORIAL */
function getAspectSymbolSVGDir(type) {
  switch (type) {
    case 'conj':
      return `<svg width="11" height="11" viewBox="0 0 20 20"><circle cx="8" cy="12" r="5" fill="none" stroke="var(--aspect-conjuncao)" stroke-width="2.2"/><line x1="12" y1="8" x2="18" y2="2" stroke="var(--aspect-conjuncao)" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    case 'sex':
      return `<svg width="11" height="11" viewBox="0 0 20 20"><path d="M10 2v16M3 6l14 8M3 14L17 6" stroke="var(--aspect-sextil)" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    case 'squ':
      return `<svg width="11" height="11" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="none" stroke="var(--aspect-quadratura)" stroke-width="2.5"/></svg>`;
    case 'tri':
      return `<svg width="11" height="11" viewBox="0 0 20 20"><polygon points="10,2 19,17 1,17" fill="none" stroke="var(--aspect-trigono)" stroke-width="2.5"/></svg>`;
    case 'opp':
      return `<svg width="13" height="11" viewBox="0 0 24 20"><circle cx="5" cy="10" r="4" fill="none" stroke="var(--aspect-oposicao)" stroke-width="2.2"/><line x1="9" y1="10" x2="15" y2="10" stroke="var(--aspect-oposicao)" stroke-width="2.2"/><circle cx="19" cy="10" r="4" fill="none" stroke="var(--aspect-oposicao)" stroke-width="2.2"/></svg>`;
    default: return '';
  }
}

/* BUSCA O GRAU DO AFETA MAPEANDO OS NOMES EXATOS DA API PYTHON */
function obterGrauEfetivoAfeta(key, data) {
  const ascAbs = data.Ascendente ? (data.Ascendente.grau_absoluto ?? 0) : 0;

    const pObj = {
    Sun: data.Sol ? data.Sol.grau_absoluto : 0,
    Moon: data.Lua ? data.Lua.grau_absoluto : 0,
    Mercury: data.Mercúrio ? data.Mercúrio.grau_absoluto : 0,
    Venus: data.Vênus ? data.Vênus.grau_absoluto : 0,
    Mars: data.Marte ? data.Marte.grau_absoluto : 0,
    Jupiter: data.Júpiter ? data.Júpiter.grau_absoluto : 0,
    Saturn: data.Saturno ? data.Saturno.grau_absoluto : 0
  };

    const lotesGlobais = (typeof window.currentLotes !== 'undefined' && window.currentLotes) ? window.currentLotes : [];
  const buscarLote = (chave) => {
    const l = lotesGlobais.find(item => item.key === chave);
    return l ? l.deg : 0;
  };

  switch (key) {
    case "ASC": return ascAbs;
    case "Sun": return pObj.Sun;
    case "Moon": return pObj.Moon;
    case "Syz": return data.Sizigia ? data.Sizigia.grau_absoluto : 0;
    case "fortune": return buscarLote('fortune');
    case "spirit": return buscarLote('spirit');
    case "venus": return buscarLote('venus');
    case "mercury": return buscarLote('mercury');
    case "mars": return buscarLote('mars');
    case "jupiter": return buscarLote('jupiter');
    case "saturn": return buscarLote('saturn');
    default: return ascAbs;
  }
}

/* CÁLCULO DOS RAIOS DOS ASPECTOS (AKTINOBOLIA) MAPEANDO OS NOMES REALMENTE PRESENTES NA API */
function calcularRaiosAspectos(data, startAbsDeg, birthDate) {
  const latAtual = (typeof currentGeo !== 'undefined' && currentGeo) ? currentGeo.lat : 0;

  // Monta o objeto "planetas" diretamente a partir do formato real de currentCalculatedData
    const planetas = {
    Sun: data.Sol ? { grau_absoluto: data.Sol.grau_absoluto } : null,
    Moon: data.Lua ? { grau_absoluto: data.Lua.grau_absoluto } : null,
    Mercury: data.Mercúrio ? { grau_absoluto: data.Mercúrio.grau_absoluto } : null,
    Venus: data.Vênus ? { grau_absoluto: data.Vênus.grau_absoluto } : null,
    Mars: data.Marte ? { grau_absoluto: data.Marte.grau_absoluto } : null,
    Jupiter: data.Júpiter ? { grau_absoluto: data.Júpiter.grau_absoluto } : null,
    Saturn: data.Saturno ? { grau_absoluto: data.Saturno.grau_absoluto } : null
  };

  const mapKeys = { 
    Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', 
    Mars: 'Mars', Jupiter: 'Jupiter', Saturn: 'Saturn'
  };
  
  const planetIds = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

  const aspectDefs = [
    { offset: 0, type: 'conj' },
    { offset: 60, type: 'sex' },
    { offset: 90, type: 'squ' },
    { offset: 120, type: 'tri' },
    { offset: 180, type: 'opp' },
    { offset: 240, type: 'tri' },
    { offset: 270, type: 'squ' },
    { offset: 300, type: 'sex' }
  ];

  const raios = [];

  planetIds.forEach(pId => {
    const itemKey = mapKeys[pId];
    const item = planetas[itemKey];
    if (!item || item.grau_absoluto === undefined) return;
    const pDegAbs = item.grau_absoluto;

      aspectDefs.forEach(asp => {
      const rayAbsDeg = (pDegAbs + asp.offset) % 360;
      const accumulatedYears = tempoAscensionalEntreGraus(startAbsDeg, rayAbsDeg, latAtual);

      // Converte tempo acumulado na data exata
      const rayDate = new Date(birthDate.getTime() + (accumulatedYears * 365.25 * 24 * 60 * 60 * 1000));

      raios.push({
        rayAbsDeg: rayAbsDeg,
        signIdx: Math.floor(rayAbsDeg / 30),
        degInSign: rayAbsDeg % 30,
        planetId: pId,
        aspectType: asp.type,
        yearsOld: accumulatedYears.toFixed(1),
        exactDate: formatarDataBRDir(rayDate)
      });
    });
  });
   
  // ALVOS CORPORAIS (Fortuna, Espírito e Sizígia) - Apenas por Conjunção (0°)
  const lotesGlobaisRaios = (typeof window.currentLotes !== 'undefined' && window.currentLotes) ? window.currentLotes : [];
  const buscarLoteRaio = (chave) => {
    const l = lotesGlobaisRaios.find(item => item.key === chave);
    return l ? l.deg : undefined;
  };

  const syzDeg = data.Sizigia ? data.Sizigia.grau_absoluto : undefined;

  const alvosCorporais = [
    { key: 'fortune', deg: buscarLoteRaio('fortune') },
    { key: 'spirit', deg: buscarLoteRaio('spirit') },
    { key: 'Syz', deg: syzDeg }
  ];

  alvosCorporais.forEach(alvo => {
    if (alvo.deg === undefined) return;
    const targetDeg = alvo.deg;

    const accumulatedYears = tempoAscensionalEntreGraus(startAbsDeg, targetDeg, latAtual);

    const rayDate = new Date(birthDate.getTime() + (accumulatedYears * 365.25 * 24 * 60 * 60 * 1000));

    raios.push({
      rayAbsDeg: targetDeg,
      signIdx: Math.floor(targetDeg / 30),
      degInSign: targetDeg % 30,
      planetId: alvo.key,
      aspectType: 'conj',
      yearsOld: accumulatedYears.toFixed(1),
      exactDate: formatarDataBRDir(rayDate)
    });
  });

  return raios;
}

/* CÁLCULO DAS DIREÇÕES: TERMOS COMPLETOS (0° A 30°) */
function calcular12SignosCircumambulatoria(startAbsDeg, birthDate, data) {
  const latAtual = (typeof currentGeo !== 'undefined' && currentGeo) ? currentGeo.lat : 0;
  const tabela = [];
  let currDate = new Date(birthDate);
  let totalYearsAccum = 0;

  const startSignIdx = Math.floor(startAbsDeg / 30);
  const startDegInSign = startAbsDeg % 30;

  for (let sOffset = 0; sOffset < 12; sOffset++) {
    const signIdx = (startSignIdx + sOffset) % 12;
    const signTerms = EGYPTIAN_TERMS_DIRECOES[signIdx];
    const signBaseAbsDeg = signIdx * 30;

    let prevTermDeg = 0;

    signTerms.forEach((t) => {
      const termStartDeg = prevTermDeg;
      const termEndDeg = t.deg;
      prevTermDeg = t.deg;

      let startDate = null;
      let endDate = null;
      let startYearsOld = null;
      let endYearsOld = null;

      if (sOffset > 0 || termEndDeg > startDegInSign) {
        let effStart = (sOffset === 0 && termStartDeg < startDegInSign) ? startDegInSign : termStartDeg;
        let effEnd = termEndDeg;

        const effStartAbs = signBaseAbsDeg + effStart;
        const effEndAbs = signBaseAbsDeg + effEnd;
        const years = tempoAscensionalEntreGraus(effStartAbs, effEndAbs, latAtual);

        startDate = new Date(currDate);
        endDate = new Date(currDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);

        if (sOffset > 0 || termStartDeg >= startDegInSign) {
          startYearsOld = totalYearsAccum.toFixed(1);
        }

        endYearsOld = (totalYearsAccum + years).toFixed(1);

        totalYearsAccum += years;
        currDate = new Date(endDate);
      }

      tabela.push({
        signIdx: signIdx,
        termStartDeg: termStartDeg,
        termEndDeg: termEndDeg,
        termPlanetId: t.pId,
        termPlanetSym: t.pSym,
        startYearsOld: startYearsOld,
        endYearsOld: endYearsOld,
        startDate: startDate,
        endDate: endDate
      });
    });
  }

  return tabela;
}

function alternarAfetaCircumambulation(key) {
  selectedAphetesKey = key;
  circumambulacaoLinhasSelecionadas = new Set(); // as linhas mudam de signo/ordem com o afeta
  renderCircumambulaçõesUI();
}

/* Linhas (signos) marcadas pra mandar pro Relatório — vazio = imagem inteira.
   Estado só da tela atual, não é preferência. */
let circumambulacaoLinhasSelecionadas = new Set();
let circumambulacaoMontador = null;
function alternarLinhaCircumambulacaoRelatorio(idx, marcado) {
  if (marcado) circumambulacaoLinhasSelecionadas.add(idx);
  else circumambulacaoLinhasSelecionadas.delete(idx);
  renderCircumambulaçõesUI();
}
window.alternarLinhaCircumambulacaoRelatorio = alternarLinhaCircumambulacaoRelatorio;

/* PNG da página inteira (título + cabeçalho + pautas) pro botão de galeria,
   pronto de antemão — o iPhone/iPad só abre "Salvar Imagem" se for chamado
   direto do toque (mesma razão das outras ferramentas). O salvar em si é
   salvarPngNaGaleria (mandala.js). */
let circumambulacaoPngPronto = null;
let circumambulacaoPngTimer = null;
function agendarPngCircumambulacao() {
  circumambulacaoPngPronto = null;
  clearTimeout(circumambulacaoPngTimer);
  circumambulacaoPngTimer = setTimeout(async () => {
    if (typeof html2canvas !== 'function') return;
    const elemento = document.getElementById('circumambulacao-container');
    if (!elemento) return;
    try {
      const modoEscuro = document.documentElement.classList.contains('tema-escuro');
      await rasterizarCabecalhosMandala(elemento);
      const canvas = await html2canvas(elemento, { backgroundColor: modoEscuro ? '#1c1917' : '#fffdf5', scale: 2, useCORS: true, onclone: aplicarCabecalhosRasterizadosNoClone });
      if (document.getElementById('circumambulacao-container') === elemento) {
        circumambulacaoPngPronto = canvas.toDataURL('image/png');
      }
    } catch (err) {
      console.error('Erro ao preparar o PNG da Circumambulação:', err);
    }
  }, 250);
}

function salvarCircumambulacaoNaGaleria() {
  if (!circumambulacaoPngPronto) { alert('A imagem ainda está sendo preparada. Toque de novo em um instante.'); return; }
  salvarPngNaGaleria(circumambulacaoPngPronto, `Astro_Hellenic_Circumambulacao_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`);
}
window.salvarCircumambulacaoNaGaleria = salvarCircumambulacaoNaGaleria;

/* Manda pro Relatório SEM título nem cabeçalho: a imagem inteira das
   pautas, ou — se houver linhas marcadas — só essas linhas. */
async function capturarCircumambulacaoParaRelatorio() {
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }
  const modoEscuro = document.documentElement.classList.contains('tema-escuro');
  const fundo = modoEscuro ? '#1c1917' : '#fffdf5';
  const indices = Array.from(circumambulacaoLinhasSelecionadas).sort((a, b) => a - b);
  let temp = null;
  try {
    let alvo;
    if (indices.length && circumambulacaoMontador) {
      const { montarSvgPautas, signPassages } = circumambulacaoMontador;
      temp = document.createElement('div');
      temp.style.cssText = `position: fixed; top: 0; left: -9999px; width: 920px; background: var(--bg-main); font-family: "Montserrat", sans-serif;`;
      temp.innerHTML = montarSvgPautas(indices.map(i => signPassages[i]), 0, indices);
      document.body.appendChild(temp);
      alvo = temp;
    } else {
      alvo = document.getElementById('circumambulacaoPautas');
      if (!alvo) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
    }
    const canvas = await html2canvas(alvo, { backgroundColor: fundo, scale: 2, useCORS: true });
    const total = adicionarCapturaRelatorio('circumambulacao', canvas.toDataURL('image/png'));
    const oQue = indices.length ? `${indices.length} linha(s)` : 'a imagem inteira';
    alert(`Circumambulação pelos Termos (${oQue}) foi adicionada ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar a Circumambulação ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  } finally {
    if (temp && temp.parentNode) temp.parentNode.removeChild(temp);
  }
}
window.capturarCircumambulacaoParaRelatorio = capturarCircumambulacaoParaRelatorio;

function iniciarModuloDirecoes() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  renderCircumambulaçõesUI();
}

function renderCircumambulaçõesUI() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  const data = currentCalculatedData;
  const startAbsDeg = obterGrauEfetivoAfeta(selectedAphetesKey, data);
  const birthDate = new Date(currentMoment);

  const afetasDisponiveis = [
    { key: "ASC", type: "item" },
    { key: "Sun", type: "planet" },
    { key: "Moon", type: "planet" },
    { key: "Syz", type: "item" },
    { key: "fortune", type: "item" },
    { key: "spirit", type: "item" },
    { key: "venus", type: "item" },
    { key: "mercury", type: "item" },
    { key: "mars", type: "item" },
    { key: "jupiter", type: "item" },
    { key: "saturn", type: "item" }
  ];

  const tabelaDirecoes = calcular12SignosCircumambulatoria(startAbsDeg, birthDate, data);
  const raiosAspectos = calcularRaiosAspectos(data, startAbsDeg, birthDate);
  const hoje = new Date();

  const signPassages = [];
  let currentPassage = null;

  tabelaDirecoes.forEach((row) => {
    if (!currentPassage || currentPassage.signIdx !== row.signIdx) {
      currentPassage = {
        signIdx: row.signIdx,
        terms: []
      };
      signPassages.push(currentPassage);
    }
    currentPassage.terms.push(row);
  });

  /* Layout vertical da pauta: reduzido para caber tudo numa página só,
     mantendo as mesmas proporções internas da caixa original (k é o
     fator de redução aplicado a todos os deslocamentos verticais). */
  const boxHeight = 96;
  const rowHeight = 108;
  const k = boxHeight / 110;
  const afetaCursorSvgHTML = getAfetaCursorSVG(selectedAphetesKey);
  const natalDegInSign = startAbsDeg % 30;

  /* Desenha uma pauta (linha) de signo, posicionada em localIdx dentro
     do <svg> que a contém — pode ser o bloco único da tela ou uma das
     colunas da impressão. ehPrimeiraGlobal indica se essa é a
     primeiríssima pauta de toda a circumambulação (onde entram a
     marcação da posição natal e o corte dos raios anteriores a ela),
     independente de em qual coluna ela estiver sendo desenhada. */
  function gerarLinhaSigno(passage, localIdx, ehPrimeiraGlobal) {
    const yOffset = 10 + (localIdx * rowHeight);
    let rowHtml = '';

    // Moldura da Pauta
    rowHtml += `<rect x="10" y="${yOffset}" width="900" height="${boxHeight}" rx="8" ry="8" fill="var(--bg-card)" stroke="var(--table-border)" stroke-width="1.2"/>`;

    // Ícone Monoline do Signo
    rowHtml += `<g transform="translate(18, ${yOffset + Math.round(38 * k)})">${getSignSVGDir(passage.signIdx, Math.round(34 * k))}</g>`;

    const x0 = 75;  // 0°
    const x1 = 880; // 30°
    const barWidth = x1 - x0; // 805px
    const scale = barWidth / 30; // 26.83px/grau

    const yAspectLine = yOffset + Math.round(32 * k); // Linha da Pista Superior (Aspectos)
    const yBaseline   = yOffset + Math.round(55 * k); // Linha Guia Central (Régua de Graus)

    // LINHA TRACEJADA DA PISTA SUPERIOR (ASPECTOS)
    rowHtml += `<line x1="${x0}" y1="${yAspectLine}" x2="${x1}" y2="${yAspectLine}" stroke="var(--gold-primary)" stroke-width="1.0" stroke-dasharray="3,3" opacity="0.6"/>`;

    // LINHA GUIA CENTRAL (RÉGUA DE GRAUS)
    rowHtml += `<line x1="${x0}" y1="${yBaseline}" x2="${x1}" y2="${yBaseline}" stroke="var(--gold-primary)" stroke-width="1.8"/>`;

    // DENTINHOS VISÍVEIS DE TODOS OS 30 GRAUS
    const tickShort = Math.round(4 * k);
    const tickMed = Math.round(6 * k);
    const tickTall = Math.round(8 * k);
    const tickLabelOffset = Math.round(12 * k);
    for (let d = 0; d <= 30; d++) {
      const xDeg = x0 + (d * scale);
      let tickY1 = yBaseline - tickShort;
      let tickY2 = yBaseline + tickShort;
      let strokeW = 1.0;
      let opacity = 0.6;

      if (d % 10 === 0) {
        tickY1 = yBaseline - tickTall;
        tickY2 = yBaseline + tickTall;
        strokeW = 1.8;
        opacity = 1.0;
        rowHtml += `<text x="${xDeg}" y="${yBaseline - tickLabelOffset}" font-size="9" font-weight="700" fill="var(--text-faint)" text-anchor="middle">${d}°</text>`;
      } else if (d % 5 === 0) {
        tickY1 = yBaseline - tickMed;
        tickY2 = yBaseline + tickMed;
        strokeW = 1.4;
        opacity = 0.85;
      }

      rowHtml += `<line x1="${xDeg}" y1="${tickY1}" x2="${xDeg}" y2="${tickY2}" stroke="var(--gold-primary)" stroke-width="${strokeW}" opacity="${opacity}"/>`;
    }

    // BLOCOS DOS 5 TERMOS COMPLETOS
    const termHeight = Math.round(26 * k);
    const termLabel1Offset = Math.round(39 * k);
    const termLabel2Offset = Math.round(49 * k);
    passage.terms.forEach(term => {
      const xStart = x0 + (term.termStartDeg * scale);
      const xEnd = x0 + (term.termEndDeg * scale);
      const wTerm = xEnd - xStart;

      rowHtml += `<rect x="${xStart}" y="${yBaseline + 1}" width="${wTerm}" height="${termHeight}" fill="var(--bg-card)" stroke="var(--gold-primary)" stroke-width="1"/>`;

      const xCenter = xStart + (wTerm / 2);
      const termIconTamanhoDir = Math.max(10, termHeight - 6);
      if (typeof getIconeTermoSVG === 'function') {
        rowHtml += getIconeTermoSVG(term.termPlanetId, termIconTamanhoDir, 'var(--gold-primary)')
          .replace('<svg ', `<svg x="${xCenter - termIconTamanhoDir / 2}" y="${yBaseline + 1 + (termHeight - termIconTamanhoDir) / 2}" `);
      }

      if (term.startYearsOld !== null && term.startDate !== null) {
        rowHtml += `<text x="${xStart + 3}" y="${yBaseline + termLabel1Offset}" font-size="8.5" font-weight="800" fill="var(--primary-blue)" text-anchor="start">${term.startYearsOld} anos</text>`;
        rowHtml += `<text x="${xStart + 3}" y="${yBaseline + termLabel2Offset}" font-size="7.5" font-weight="500" fill="var(--text-muted)" text-anchor="start">${formatarDataBRDir(term.startDate)}</text>`;
      }
    });

    // RENDERIZAÇÃO DOS RAIOS DOS ASPECTOS
    const raiosDoSigno = raiosAspectos.filter(r => {
      if (r.signIdx !== passage.signIdx) return false;
      if (ehPrimeiraGlobal && r.degInSign < natalDegInSign) return false;
      return true;
    });

    raiosDoSigno.sort((a, b) => a.degInSign - b.degInSign);

    let prevX = -999;
    let currentLevel = 0;
    const rayLevelShift = Math.round(18 * k);

    raiosDoSigno.forEach(r => {
      const xRay = x0 + (r.degInSign * scale);

      if (xRay - prevX < 38) {
        currentLevel = (currentLevel === 0) ? 1 : 0;
      } else {
        currentLevel = 0;
      }
      prevX = xRay;

      const yShift = currentLevel * rayLevelShift;
      const yTop = yAspectLine - yShift;

      rowHtml += `<line x1="${xRay}" y1="${yTop - Math.round(10 * k)}" x2="${xRay}" y2="${yBaseline - Math.round(4 * k)}" stroke="var(--gold-primary)" stroke-width="0.8" opacity="0.7"/>`;

      // RENDERIZAÇÃO DA IDADE (ANOS) E DA DATA EXATA (DD/MM/AAAA)
      rowHtml += `<text x="${xRay}" y="${yTop - Math.round(21 * k)}" font-size="7.5" font-weight="800" fill="var(--primary-blue)" text-anchor="middle">${r.yearsOld} anos</text>`;
      rowHtml += `<text x="${xRay}" y="${yTop - Math.round(13 * k)}" font-size="7" font-weight="600" fill="var(--text-muted)" text-anchor="middle">${r.exactDate}</text>`;

      const aspectSVG = getAspectSymbolSVGDir(r.aspectType);

      const isPlanetaReal = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'].includes(r.planetId);
      const iconSVG = isPlanetaReal
        ? getPlanet3DSVGDir(r.planetId)
        : getItemSVGDir(r.planetId === 'Syz' ? 'Sizígia' : r.planetId);
      const escalaIcone = isPlanetaReal ? ((r.planetId === 'Saturn') ? 0.95 : 0.75) : 1;

      rowHtml += `<g transform="translate(${xRay - 13}, ${yTop - 7})">${aspectSVG}</g>`;
      rowHtml += `<g transform="translate(${xRay + 1}, ${yTop - 9}) scale(${escalaIcone})">${iconSVG}</g>`;
    });

    // MARCAÇÃO DA POSIÇÃO NATAL INICIAL
    if (ehPrimeiraGlobal) {
      const xNatal = x0 + (natalDegInSign * scale);
      const natalTop = yOffset + Math.round(10 * k);
      const natalBottom = yOffset + boxHeight - Math.round(6 * k);

      rowHtml += `<line x1="${xNatal}" y1="${natalTop}" x2="${xNatal}" y2="${natalBottom}" stroke="var(--element-fogo)" stroke-width="2"/>`;
      rowHtml += `<text x="${xNatal + 3}" y="${yBaseline + Math.round(11 * k)}" font-size="8" font-weight="900" fill="var(--element-fogo)" text-anchor="start">0.0 anos</text>`;
      rowHtml += `<text x="${xNatal + 3}" y="${yBaseline + Math.round(21 * k)}" font-size="7" font-weight="700" fill="var(--element-fogo)" text-anchor="start">${formatarDataBRDir(birthDate)}</text>`;
    }

    // CURSOR DO AFETA NO "HOJE"
    passage.terms.forEach(term => {
      if (term.startDate && term.endDate && hoje >= term.startDate && hoje < term.endDate) {
        const tTotal = term.endDate.getTime() - term.startDate.getTime();
        const tElapsed = hoje.getTime() - term.startDate.getTime();
        const frac = Math.max(0, Math.min(1, tElapsed / tTotal));

        const currDeg = term.termStartDeg + (frac * (term.termEndDeg - term.termStartDeg));
        const xHoje = x0 + (currDeg * scale);
        const hojeTop = yOffset + Math.round(10 * k);
        const hojeBottom = yOffset + boxHeight - Math.round(6 * k);

        rowHtml += `<line x1="${xHoje}" y1="${hojeTop}" x2="${xHoje}" y2="${hojeBottom}" stroke="var(--primary-blue)" stroke-width="1.5" stroke-dasharray="3,3"/>`;
        rowHtml += `<g transform="translate(${xHoje - 12}, ${yBaseline - Math.round(12 * k)})">${afetaCursorSvgHTML}</g>`;
      }
    });

    return rowHtml;
  }

  /* Monta um <svg> completo com as pautas passadas em passagesSubset,
     empilhadas a partir do topo. offsetGlobalInicial é a posição (no
     conjunto completo de 12 pautas) da primeira pauta desse subconjunto
     — necessário para saber se a marcação da posição natal cai aqui. */
  function montarSvgPautas(passagesSubset, offsetGlobalInicial, indicesGlobais) {
    const alturaSvg = 20 + (passagesSubset.length * rowHeight);
    let svgInner = '';
    passagesSubset.forEach((passage, idxLocal) => {
      const globalIdx = indicesGlobais ? indicesGlobais[idxLocal] : (offsetGlobalInicial + idxLocal);
      svgInner += gerarLinhaSigno(passage, idxLocal, globalIdx === 0);
    });
    return `<svg viewBox="0 0 920 ${alturaSvg}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block;">${svgInner}</svg>`;
  }

  // Uma única coluna com todas as pautas, na tela e na impressão.
  const svgTela = montarSvgPautas(signPassages, 0);
  // Usado por capturarCircumambulacaoParaRelatorio (só as linhas marcadas).
  circumambulacaoMontador = { montarSvgPautas, signPassages };
  const alturaSvgTela = 20 + (signPassages.length * rowHeight);
  const caixasLinhasHTML = signPassages.map((passage, i) => {
    const topPct = ((10 + (i * rowHeight) + (boxHeight / 2)) / alturaSvgTela) * 100;
    return `<input type="checkbox" ${circumambulacaoLinhasSelecionadas.has(i) ? 'checked' : ''} onchange="alternarLinhaCircumambulacaoRelatorio(${i}, this.checked)" title="Mandar só esta linha para o Relatório" style="position: absolute; left: -24px; top: ${topPct.toFixed(3)}%; transform: translateY(-50%); width: 16px; height: 16px; margin: 0; cursor: pointer;">`;
  }).join('');

  const afetaLabelsDir = {
    ASC: "Ascendente", Sun: "Sol", Moon: "Lua", Syz: "Sizígia Prenatal",
    fortune: "Lote da Fortuna", spirit: "Lote do Espírito", venus: "Lote de Eros",
    mercury: "Lote da Necessidade", mars: "Lote da Audácia", jupiter: "Lote da Vitória",
    saturn: "Lote de Nêmesis"
  };
  function iconeAfetaDir(af) {
    return af.type === "planet"
      ? getPlanet3DSVGDir(af.key)
      : getItemSVGDir(af.key === "Syz" ? "Sizígia" : af.key);
  }

  const afetaAtual = afetasDisponiveis.find(af => af.key === selectedAphetesKey) || afetasDisponiveis[0];
  const iconAtualHTML = iconeAfetaDir(afetaAtual);

  const afetaMenuRowsHTML = afetasDisponiveis.map(af => {
    const label = afetaLabelsDir[af.key] || af.key;
    return `<div onclick="alternarAfetaCircumambulation('${af.key}')" title="${escapeHtml(label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${iconeAfetaDir(af)}</div>`;
  }).join('');

  const btnCss = "width: 36px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 0; color: var(--primary-blue);";
  const totalMarcadas = circumambulacaoLinhasSelecionadas.size;
  const dicaRelatorio = totalMarcadas
    ? `Adicionar ao Relatório só as ${totalMarcadas} linha(s) marcada(s) (sem título nem cabeçalho)`
    : 'Adicionar ao Relatório a imagem inteira (sem título nem cabeçalho). Marque a caixinha de uma ou mais linhas pra mandar só elas';

  let html = `
    <div style="width: 100%;">
      <div style="display: flex; justify-content: flex-end; align-items: flex-start; gap: 6px; margin-bottom: 8px; padding: 0 20px;">
        <div style="position: relative; flex-shrink: 0;">
          <button type="button" onclick="const menu=document.getElementById('direcoesAfetaMenu'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="${btnCss}" title="Afeta Direcionado">
            ${iconAtualHTML}
          </button>
          <div id="direcoesAfetaMenu" style="display: none; position: absolute; top: 40px; right: 0; background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 40px; max-height: 220px; overflow-y: auto; box-sizing: border-box;">
            ${afetaMenuRowsHTML}
          </div>
        </div>
        <button type="button" onclick="salvarCircumambulacaoNaGaleria()" title="Salvar a página inteira como imagem na galeria (com título e cabeçalho)" style="${btnCss}">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
        </button>
        <button type="button" onclick="capturarCircumambulacaoParaRelatorio()" title="${escapeHtml(dicaRelatorio)}" style="${btnCss}">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
        </button>
      </div>
    <div class="dir-outer" id="circumambulacao-container" style="width: 100%; min-height: 100%; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">

        <h3 class="dir-titulo" style="font-family: 'Cinzel', serif; font-weight: 800; color: var(--primary-blue); margin-top: 0; margin-bottom: 10px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
          Circumambulação pelos Termos
        </h3>

        <!-- CABEÇALHO PADRÃO: o mesmo de todas as ferramentas (montarCabecalhoMandalaImagemHTML, mandala.js). O seletor de afeta fica na barra de botões acima, não aqui. -->
        <div class="dir-cabecalho">${montarCabecalhoMandalaImagemHTML(data)}</div>

        <!-- PAUTAS DOS SIGNOS: uma coluna só, na tela e na impressão. As caixinhas (só na tela, ignoradas nas imagens) ficam na margem esquerda. -->
        <div style="width: 100%; overflow-x: auto;">
          <div id="circumambulacaoPautas" style="position: relative; margin: 0 24px;">
            <span data-html2canvas-ignore="true">${caixasLinhasHTML}</span>
            ${svgTela}
          </div>
        </div>

    </div>
    </div>
  `;

  container.innerHTML = html;
  agendarPngCircumambulacao();
}
