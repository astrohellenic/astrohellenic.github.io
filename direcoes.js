/* ==========================================
   MÓDULO DE CIRCUMAMBULAÇÕES (DIREÇÕES)
   MÉTODO HELENÍSTICO PURISTA (VETTIUS VALENS)
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

/* TEMPOS DE ASCENSÃO OBLÍQUA DOS SIGNOS (VALENS) - CLIMA III/IV */
const VALENS_ASCENSION_TIMES = [20, 24, 28, 32, 36, 40, 40, 36, 32, 28, 24, 20];

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

const SIGN_COLORS_DIRECOES = ["#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8"];

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
  if (!data) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  return `${d}/${m}/${a}`;
}

function getItemSVGDir(key) {
  if (key === 'Syz' || key === 'Sizígia') {
    return `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" stroke="#103b70" stroke-width="1.8" fill="none"/><path d="M 0 -10 A 10 10 0 0 1 0 10 Q 3.8 -3.8 -3.8 -10 Z" fill="#103b70"/><circle cx="0" cy="0" r="2.3" fill="#103b70"/></svg>`;
  }

  const lotConfig = {
    'venus':   { sym: '♀', y: 2, size: 15 },
    'mercury': { sym: '☿', y: 4, size: 15 },
    'mars':    { sym: '♂', y: 2, size: 15 },
    'jupiter': { sym: '♃', y: 4, size: 15 },
    'saturn':  { sym: '♄', y: 4, size: 15 }
  };

  if (key === 'fortune') {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="none" stroke="#103b70" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#103b70" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#103b70" stroke-width="1.5"/></svg>`;
  }
  if (key === 'spirit') {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><text x="0" y="9" font-size="26" font-weight="400" fill="#103b70" text-anchor="middle">Φ</text></svg>`;
  }

  const cfg = lotConfig[key];
  if (cfg) {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="none" stroke="#103b70" stroke-width="1.5"/><text x="0" y="${cfg.y}" font-size="${cfg.size}" font-weight="bold" fill="#103b70" text-anchor="middle">${cfg.sym}</text></svg>`;
  }

  return `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
}

function getAfetaCursorSVG(key) {
  const planetKeys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  if (planetKeys.includes(key)) {
    return getPlanet3DSVGDir(key);
  }
  if (key === 'ASC') {
    return `<svg width="24" height="24" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.8"/><text x="0" y="3.5" font-size="9" font-weight="900" fill="#103b70" text-anchor="middle">ASC</text></svg>`;
  }
  return getItemSVGDir(key === 'Syz' ? 'Sizígia' : key);
}

/* SÍMBOLOS DOS ASPECTOS EM SVG VETORIAL */
function getAspectSymbolSVGDir(type) {
  switch (type) {
    case 'conj': // Conjunção (Preto)
      return `<svg width="11" height="11" viewBox="0 0 20 20"><circle cx="8" cy="12" r="5" fill="none" stroke="#000000" stroke-width="2.2"/><line x1="12" y1="8" x2="18" y2="2" stroke="#000000" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    case 'sex': // Sextil (Azul claro)
      return `<svg width="11" height="11" viewBox="0 0 20 20"><path d="M10 2v16M3 6l14 8M3 14L17 6" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    case 'squ': // Quadratura (Vermelho)
      return `<svg width="11" height="11" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="none" stroke="#e84118" stroke-width="2.5"/></svg>`;
    case 'tri': // Trígono (Azul escuro)
      return `<svg width="11" height="11" viewBox="0 0 20 20"><polygon points="10,2 19,17 1,17" fill="none" stroke="#1d4ed8" stroke-width="2.5"/></svg>`;
    case 'opp': // Oposição (Vinho / Vermelho Escuro)
      return `<svg width="13" height="11" viewBox="0 0 24 20"><circle cx="5" cy="10" r="4" fill="none" stroke="#881337" stroke-width="2.2"/><line x1="9" y1="10" x2="15" y2="10" stroke="#881337" stroke-width="2.2"/><circle cx="19" cy="10" r="4" fill="none" stroke="#881337" stroke-width="2.2"/></svg>`;
    default: return '';
  }
}

function obterGrauEfetivoAfeta(key, data) {
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const pObj = {};
  const mapKeys = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };
  ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach(id => {
    const item = data[mapKeys[id]];
    pObj[id] = item ? item.grau_absoluto : 0;
  });

  const isDay = ((pObj.Sun - ascAbs + 360) % 360) >= 180;
  const fortAbs = (isDay ? (ascAbs + pObj.Moon - pObj.Sun) : (ascAbs + pObj.Sun - pObj.Moon) + 36000) % 360;
  const spirAbs = (isDay ? (ascAbs + pObj.Sun - pObj.Moon) : (ascAbs + pObj.Moon - pObj.Sun) + 36000) % 360;
  const erosAbs = (isDay ? (ascAbs + pObj.Venus - spirAbs) : (ascAbs + spirAbs - pObj.Venus) + 36000) % 360;
  const necAbs = (isDay ? (ascAbs + fortAbs - pObj.Mercury) : (ascAbs + pObj.Mercury - fortAbs) + 36000) % 360;
  const courAbs = (isDay ? (ascAbs + fortAbs - pObj.Mars) : (ascAbs + pObj.Mars - fortAbs) + 36000) % 360;
  const vicAbs = (isDay ? (ascAbs + pObj.Jupiter - spirAbs) : (ascAbs + spirAbs - pObj.Jupiter) + 36000) % 360;
  const nemAbs = (isDay ? (ascAbs + fortAbs - pObj.Saturn) : (ascAbs + pObj.Saturn - fortAbs) + 36000) % 360;

  switch (key) {
    case "ASC": return ascAbs;
    case "Sun": return pObj.Sun;
    case "Moon": return pObj.Moon;
    case "Syz": return data.Sizigia ? data.Sizigia.grau_absoluto : 0;
    case "fortune": return fortAbs;
    case "spirit": return spirAbs;
    case "venus": return erosAbs;
    case "mercury": return necAbs;
    case "mars": return courAbs;
    case "jupiter": return vicAbs;
    case "saturn": return nemAbs;
    default: return ascAbs;
  }
}

/* CÁLCULO DOS RAIOS DOS ASPECTOS (AKTINOBOLIA) DOS 7 PLANETAS POR ASCENSÃO OBLÍQUA */
function calcularRaiosAspectos(data, startAbsDeg) {
  const mapKeys = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };
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
    const item = data[mapKeys[pId]];
    if (!item || item.grau_absoluto === undefined) return;
    const pDegAbs = item.grau_absoluto;

    aspectDefs.forEach(asp => {
      const rayAbsDeg = (pDegAbs + asp.offset) % 360;
      const distDeg = (rayAbsDeg - startAbsDeg + 360) % 360;

      let currDeg = startAbsDeg;
      let accumulatedYears = 0;
      let degToCover = distDeg;

      while (degToCover > 0.0001) {
        const sIdx = Math.floor(currDeg / 30);
        const degInS = currDeg % 30;
        const degLeftInSign = 30 - degInS;

        const stepDeg = Math.min(degToCover, degLeftInSign);
        const ascTimePerDegree = VALENS_ASCENSION_TIMES[sIdx] / 30;
        accumulatedYears += stepDeg * ascTimePerDegree;

        currDeg = (currDeg + stepDeg) % 360;
        degToCover -= stepDeg;
      }

      raios.push({
        rayAbsDeg: rayAbsDeg,
        signIdx: Math.floor(rayAbsDeg / 30),
        degInSign: rayAbsDeg % 30,
        planetId: pId,
        aspectType: asp.type,
        yearsOld: accumulatedYears.toFixed(1)
      });
    });
  });

  return raios;
}

/* CÁLCULO DAS DIREÇÕES: TERMOS COMPLETOS (0° A 30°) */
function calcular12SignosCircumambulatoria(startAbsDeg, birthDate) {
  const tabela = [];
  let currDate = new Date(birthDate);
  let totalYearsAccum = 0;

  const startSignIdx = Math.floor(startAbsDeg / 30);
  const startDegInSign = startAbsDeg % 30;

  for (let sOffset = 0; sOffset < 12; sOffset++) {
    const signIdx = (startSignIdx + sOffset) % 12;
    const signTerms = EGYPTIAN_TERMS_DIRECOES[signIdx];

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

        const remDeg = effEnd - effStart;
        const ascTimePerDegree = VALENS_ASCENSION_TIMES[signIdx] / 30;
        const years = remDeg * ascTimePerDegree;

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
  renderCircumambulaçõesUI();
}

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

  const tabelaDirecoes = calcular12SignosCircumambulatoria(startAbsDeg, birthDate);
  const raiosAspectos = calcularRaiosAspectos(data, startAbsDeg);
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

  const rowHeight = 120;
  const svgTotalHeight = 20 + (signPassages.length * rowHeight);

  const afetaCursorSvgHTML = getAfetaCursorSVG(selectedAphetesKey);
  const natalDegInSign = startAbsDeg % 30;

  let html = `
    <div style="background: #fffdf5; border-radius: 16px; padding: 20px; max-width: 960px; margin: 20px auto; font-family: 'Montserrat', sans-serif;">
      <div style="background: #ffffff; border: 2px solid #c59b27; border-radius: 12px; padding: 20px; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <h3 style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; margin-top: 0; margin-bottom: 20px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
          Circumambulação pelos Termos
        </h3>
        
        <!-- BOTOEIRA DE AFETAS INTACTA -->
        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
  `;

  afetasDisponiveis.forEach(af => {
    const isSel = (af.key === selectedAphetesKey);
    const styleBtn = isSel 
      ? "background: #f1f5f9; color: #103b70; border: 1px solid #c59b27;" 
      : "background: #fffdf5; color: #103b70; border: 1px solid #c59b27;";

    let iconHTML = af.type === "planet" ? getPlanet3DSVGDir(af.key) : getItemSVGDir(af.key === "Syz" ? "Sizígia" : af.key);

    html += `
      <button onclick="alternarAfetaCircumambulation('${af.key}')" style="${styleBtn} width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="${af.key}">
        <div style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">${iconHTML}</div>
      </button>
    `;
  });

  html += `
        </div>

        <!-- PAUTAS DAS 12 LINHAS DOS SIGNOS EM SVG -->
        <div style="width: 100%; overflow-x: auto;">
          <svg viewBox="0 0 920 ${svgTotalHeight}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block;">
  `;

  signPassages.forEach((passage, pIdx) => {
    const yOffset = 10 + (pIdx * rowHeight);

    // Moldura da Pauta
    html += `<rect x="10" y="${yOffset}" width="900" height="110" rx="8" ry="8" fill="#fffdf5" stroke="#c59b27" stroke-width="1.2"/>`;

    // Ícone Monoline do Signo
    html += `<g transform="translate(18, ${yOffset + 38})">${getSignSVGDir(passage.signIdx, 34)}</g>`;

    const x0 = 75;  // 0°
    const x1 = 880; // 30°
    const barWidth = x1 - x0; // 805px
    const scale = barWidth / 30; // 26.83px/grau

    const yAspectLine = yOffset + 32; // Linha da Pista Superior (Aspectos)
    const yBaseline   = yOffset + 55; // Linha Guia Central (Régua de Graus)

    // LINHA TRACEJADA DA PISTA SUPERIOR (ASPECTOS)
    html += `<line x1="${x0}" y1="${yAspectLine}" x2="${x1}" y2="${yAspectLine}" stroke="#c59b27" stroke-width="1.0" stroke-dasharray="3,3" opacity="0.6"/>`;

    // LINHA GUIA CENTRAL (RÉGUA DE GRAUS)
    html += `<line x1="${x0}" y1="${yBaseline}" x2="${x1}" y2="${yBaseline}" stroke="#c59b27" stroke-width="1.8"/>`;

    // DENTINHOS VISÍVEIS DE TODOS OS 30 GRAUS (1° A 30°)
    for (let d = 0; d <= 30; d++) {
      const xDeg = x0 + (d * scale);
      let tickY1 = yBaseline - 4;
      let tickY2 = yBaseline + 4;
      let strokeW = 1.0;
      let opacity = 0.6;

      if (d % 10 === 0) {
        tickY1 = yBaseline - 8;
        tickY2 = yBaseline + 8;
        strokeW = 1.8;
        opacity = 1.0;
        // Números dos Graus Principais
        html += `<text x="${xDeg}" y="${yBaseline - 12}" font-size="9" font-weight="700" fill="#94a3b8" text-anchor="middle">${d}°</text>`;
      } else if (d % 5 === 0) {
        tickY1 = yBaseline - 6;
        tickY2 = yBaseline + 6;
        strokeW = 1.4;
        opacity = 0.85;
      }

      html += `<line x1="${xDeg}" y1="${tickY1}" x2="${xDeg}" y2="${tickY2}" stroke="#c59b27" stroke-width="${strokeW}" opacity="${opacity}"/>`;
    }

    // BLOCOS DOS 5 TERMOS COMPLETOS (0° A 30°)
    passage.terms.forEach(term => {
      const xStart = x0 + (term.termStartDeg * scale);
      const xEnd = x0 + (term.termEndDeg * scale);
      const wTerm = xEnd - xStart;

      // Caixa do Termo Egípcio
      html += `<rect x="${xStart}" y="${yBaseline + 1}" width="${wTerm}" height="26" fill="#ffffff" stroke="#c59b27" stroke-width="1"/>`;

      // Símbolo Dourado do Regente do Termo
      const xCenter = xStart + (wTerm / 2);
      html += `<text x="${xCenter}" y="${yBaseline + 18}" font-size="14" font-weight="bold" fill="#c59b27" text-anchor="middle">${term.termPlanetSym}</text>`;

      // Exibe idade/data ABAIXO DA CAIXA apenas para transições pós-nascimento
      if (term.startYearsOld !== null && term.startDate !== null) {
        html += `<text x="${xStart + 3}" y="${yBaseline + 39}" font-size="8.5" font-weight="800" fill="#103b70" text-anchor="start">${term.startYearsOld} anos</text>`;
        html += `<text x="${xStart + 3}" y="${yBaseline + 49}" font-size="7.5" font-weight="500" fill="#64748b" text-anchor="start">${formatarDataBRDir(term.startDate)}</text>`;
      }
    });

      // RENDERIZAÇÃO DOS RAIOS DOS ASPECTOS (COM SISTEMA ANTI-COLISÃO POR NÍVEIS)
    const raiosDoSigno = raiosAspectos.filter(r => {
      if (r.signIdx !== passage.signIdx) return false;
      if (pIdx === 0 && r.degInSign < natalDegInSign) return false;
      return true;
    });

    // 1. Ordena os raios do signo por grau para identificar colisões sequenciais
    raiosDoSigno.sort((a, b) => a.degInSign - b.degInSign);

    let prevX = -999;
    let currentLevel = 0; // Nível 0 = base, Nível 1 = suspenso

    raiosDoSigno.forEach(r => {
      const xRay = x0 + (r.degInSign * scale);

      // 2. Se a distância em pixels do aspecto anterior for menor que 38px, alterna o andar
      if (xRay - prevX < 38) {
        currentLevel = (currentLevel === 0) ? 1 : 0;
      } else {
        currentLevel = 0; // Reseta para o nível base se houver espaço suficiente
      }
      prevX = xRay;

      // 3. Define a elevação vertical do andar (18px para cima no nível 1)
      const yShift = currentLevel * 18;
      const yTop = yAspectLine - yShift;

      // Traço de Alinhamento estendido verticalmente conforme o nível
      html += `<line x1="${xRay}" y1="${yTop - 10}" x2="${xRay}" y2="${yBaseline - 4}" stroke="#c59b27" stroke-width="0.8" opacity="0.7"/>`;

      // Idade do Aspecto (Acima do ícone, no nível ajustado)
      html += `<text x="${xRay}" y="${yTop - 13}" font-size="8" font-weight="800" fill="#103b70" text-anchor="middle">${r.yearsOld} anos</text>`;

      const aspectSVG = getAspectSymbolSVGDir(r.aspectType);
      const planet3DSVG = getPlanet3DSVGDir(r.planetId);
      const escalaPlaneta = (r.planetId === 'Saturn') ? 0.95 : 0.75;

      // Símbolos do Aspecto e Planeta posicionados no nível correspondente
      html += `<g transform="translate(${xRay - 13}, ${yTop - 7})">${aspectSVG}</g>`;
      html += `<g transform="translate(${xRay + 1}, ${yTop - 9}) scale(${escalaPlaneta})">${planet3DSVG}</g>`;
    });

    // MARCAÇÃO DA POSIÇÃO NATAL INICIAL DO AFETA (DENTRO DA CAIXA DO TERMO)
    if (pIdx === 0) {
      const xNatal = x0 + (natalDegInSign * scale);

      // Traço Vermelho de Posição Inicial
      html += `<line x1="${xNatal}" y1="${yOffset + 10}" x2="${xNatal}" y2="${yOffset + 104}" stroke="#e84118" stroke-width="2"/>`;

      // Texto Vermelho da Idade Inicial DENTRO DO RECT DO TERMO
      html += `<text x="${xNatal + 3}" y="${yBaseline + 11}" font-size="8" font-weight="900" fill="#e84118" text-anchor="start">0.0 anos</text>`;
      html += `<text x="${xNatal + 3}" y="${yBaseline + 21}" font-size="7" font-weight="700" fill="#e84118" text-anchor="start">${formatarDataBRDir(birthDate)}</text>`;
    }

    // CURSOR DO AFETA NO "HOJE"
    passage.terms.forEach(term => {
      if (term.startDate && term.endDate && hoje >= term.startDate && hoje < term.endDate) {
        const tTotal = term.endDate.getTime() - term.startDate.getTime();
        const tElapsed = hoje.getTime() - term.startDate.getTime();
        const frac = Math.max(0, Math.min(1, tElapsed / tTotal));

        const currDeg = term.termStartDeg + (frac * (term.termEndDeg - term.termStartDeg));
        const xHoje = x0 + (currDeg * scale);

        // Linha Guia Vertical do Afeta
        html += `<line x1="${xHoje}" y1="${yOffset + 10}" x2="${xHoje}" y2="${yOffset + 104}" stroke="#103b70" stroke-width="1.5" stroke-dasharray="3,3"/>`;

        // SVG do Afeta Selecionado no grau exato
        html += `<g transform="translate(${xHoje - 12}, ${yBaseline - 12})">${afetaCursorSvgHTML}</g>`;
      }
    });

  });

  html += `
          </svg>
        </div>

      </div>
    </div>
  `;

  container.innerHTML = html;
}
