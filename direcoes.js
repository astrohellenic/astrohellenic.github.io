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
  [{ pId: "Saturn", pSym: "♄", deg: 7 }, { pId: "Mercury", pSym: "☿", deg: 13 }, { pId: "Venus", pSym: "♀", deg: 20 }, { pId: "Jupiter", pSym: "♃", deg: 25 }, { pId: "Mars", pSym: "♂", deg: 30 }],
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

function getSignSVGDir(signIndex, size = 20) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${SIGN_COLORS_DIRECOES[signIndex]}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_DIRECOES[signIndex]}</svg>`;
}

function getPlanet3DSVGDir(planetId) {
  if (typeof getPlanet3DSVG === 'function') {
    return getPlanet3DSVG(planetId);
  }
  return '';
}

function getItemSVGDir(key) {
  if (typeof getItemSVG === 'function') {
    return getItemSVG(key);
  }
  return '';
}

function formatDegMinDir(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return '-';
  const degInSign = absDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutes = Math.round((degInSign - degrees) * 60);
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${degrees}°${minStr}′`;
}

function formatarDataBRDir(data) {
  if (!data) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  return `${d}/${m}/${a}`;
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

function calcularTabelaCircumambulatoria(startAbsDeg, birthDate) {
  const tabela = [];
  let currAbsDeg = startAbsDeg;
  let currDate = new Date(birthDate);
  let totalYearsAccum = 0;

  while (totalYearsAccum < 120) {
    const signIdx = Math.floor(currAbsDeg / 30);
    const degInSign = currAbsDeg % 30;
    const signTerms = EGYPTIAN_TERMS_DIRECOES[signIdx];

    let currentTerm = signTerms[0];
    for (let t of signTerms) {
      if (degInSign < t.deg) {
        currentTerm = t;
        break;
      }
    }

    const remDegInTerm = currentTerm.deg - degInSign;
    const ascTimePerDegree = VALENS_ASCENSION_TIMES[signIdx] / 30;
    const yearsInTerm = remDegInTerm * ascTimePerDegree;

    const startDate = new Date(currDate);
    const endDate = new Date(currDate.getTime() + yearsInTerm * 365.25 * 24 * 60 * 60 * 1000);

    tabela.push({
      signIdx: signIdx,
      startDegAbs: currAbsDeg,
      endDegAbs: (currAbsDeg + remDegInTerm) % 360,
      termPlanetId: currentTerm.pId,
      durationYears: yearsInTerm.toFixed(2),
      startYearsOld: totalYearsAccum.toFixed(2),
      endYearsOld: (totalYearsAccum + yearsInTerm).toFixed(2),
      startDate: startDate,
      endDate: endDate
    });

    totalYearsAccum += yearsInTerm;
    currDate = new Date(endDate);
    currAbsDeg = (currAbsDeg + remDegInTerm) % 360;
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

  const tabelaDirecoes = calcularTabelaCircumambulatoria(startAbsDeg, birthDate);
  const hoje = new Date();

  let html = `
    <div style="background: #fffdf5; border-radius: 16px; padding: 20px; max-width: 960px; margin: 20px auto; font-family: 'Montserrat', sans-serif;">
      <div style="background: #ffffff; border: 2px solid #c59b27; border-radius: 12px; padding: 20px; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <h3 style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; margin-top: 0; margin-bottom: 20px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
          Circumambulação pelos Termos
        </h3>
        
        <!-- BOTOEIRA DE AFETAS -->
        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
  `;

  afetasDisponiveis.forEach(af => {
    const isSel = (af.key === selectedAphetesKey);
    const styleBtn = isSel 
      ? "background: #103b70; color: #ffffff; border: 1px solid #c59b27;" 
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

        <!-- TABELA DE CIRCUMAMBULAÇÃO -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #c59b27; border-radius: 8px; overflow: hidden; font-size: 12px; text-align: center; background: #ffffff;">
          <thead>
            <tr style="background-color: #103b70; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
              <th style="padding: 10px 8px;">Signo</th>
              <th style="padding: 10px 8px;">Posição do Afeta</th>
              <th style="padding: 10px 8px;">Termo Egípcio</th>
              <th style="padding: 10px 8px;">Idade</th>
              <th style="padding: 10px 8px;">Início</th>
              <th style="padding: 10px 8px;">Término</th>
            </tr>
          </thead>
          <tbody>
  `;

  tabelaDirecoes.forEach((row, idx) => {
    const isCurrent = (hoje >= row.startDate && hoje < row.endDate);
    const bgRow = idx % 2 === 0 ? '#ffffff' : '#fffdf5';
    
    const rowStyle = isCurrent 
      ? "background-color: #fefcf2; border-left: 4px solid #c59b27; border-bottom: 1px solid #e5d5a1;" 
      : `background-color: ${bgRow}; border-bottom: 1px solid #e5d5a1;`;

    html += `
      <tr style="${rowStyle}">
        <td style="padding: 10px 8px; text-align: center;">${getSignSVGDir(row.signIdx, 22)}</td>
        <td style="padding: 10px 8px; font-weight: 600; color: #334155;">${formatDegMinDir(row.startDegAbs)} a ${formatDegMinDir(row.endDegAbs)}</td>
        <td style="padding: 10px 8px; text-align: center;">
          <div style="width: 28px; height: 28px; margin: 0 auto;">${getPlanet3DSVGDir(row.termPlanetId)}</div>
        </td>
        <td style="padding: 10px 8px; font-weight: 600; color: #103b70;">${row.startYearsOld} a ${row.endYearsOld} anos</td>
        <td style="padding: 10px 8px; color: #334155;">${formatarDataBRDir(row.startDate)}</td>
        <td style="padding: 10px 8px; color: #334155;">${formatarDataBRDir(row.endDate)}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
