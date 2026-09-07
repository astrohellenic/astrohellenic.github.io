/* ==========================================
   MÓDULO DE LIBERAÇÃO ZODIACAL (APHESIS)
   ========================================== */

let selectedZRPhase = "fortune"; // Fortuna como lote padrão inicial

const ZR_SIGN_YEARS = [15, 8, 20, 25, 19, 20, 8, 15, 12, 30, 30, 12]; // Áries a Peixes

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

const SIGN_COLORS_ZR = ["#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8"];

function getSignSVGZR(signIndex, size = 22) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${SIGN_COLORS_ZR[signIndex]}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_ZR[signIndex]}</svg>`;
}

function getLotIconSVG(lotKey) {
  if (lotKey === 'fortune') {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="currentColor" stroke-width="1.8"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="currentColor" stroke-width="1.8"/></svg>`;
  }
  if (lotKey === 'spirit') {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><text x="0" y="0" font-size="24" font-weight="400" font-family="'Montserrat', sans-serif" fill="currentColor" text-anchor="middle" dominant-baseline="central">Φ</text></svg>`;
  }

  const lotConfig = {
    venus:   { sym: '♀', y: -1.5, size: 10.5 },
    mercury: { sym: '☿', y: -0.5, size: 11 },
    mars:    { sym: '♂', y: -1.5 size: 10 },
    jupiter: { sym: '♃', y: 0, size: 10 },
    saturn:  { sym: '♄', y: -0.5, size: 10 }
  };

  const cfg = lotConfig[lotKey] || { sym: '', y: 0, size: 10 };

  return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="0" y="${cfg.y}" font-size="${cfg.size}" font-weight="bold" fill="currentColor" text-anchor="middle" dominant-baseline="central">${cfg.sym}</text></svg>`;
}

function iniciarModuloLiberacao() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  renderLiberacaoUI();
}

function alternarLoteLiberacao(lotKey) {
  selectedZRPhase = lotKey;
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
  const startSignIdx = Math.floor(activeLotObj.deg / 30);

  const lotesInfo = [
    { key: "fortune" },
    { key: "spirit" },
    { key: "venus" },
    { key: "mercury" },
    { key: "mars" },
    { key: "jupiter" },
    { key: "saturn" }
  ];

  let html = `
    <div style="background: #fffdf5; border: 1px solid #c59b27; border-radius: 12px; padding: 20px; font-family: 'Montserrat', sans-serif; color: #0f172a; max-width: 900px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h3 style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; margin-top: 0; margin-bottom: 20px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">Liberação Zodiacal - L1</h3>
      
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
  `;

  lotesInfo.forEach(l => {
    const isSel = l.key === selectedZRPhase;
    const styleBg = isSel 
      ? "background: #103b70; color: #ffffff; border: 1px solid #c59b27;" 
      : "background: #fffdf5; color: #103b70; border: 1px solid #c59b27;";
    
    html += `
      <button onclick="alternarLoteLiberacao('${l.key}')" style="${styleBg} width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="${l.key}">
        ${getLotIconSVG(l.key)}
      </button>
    `;
  });

  html += `
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; background: #ffffff;">
        <thead>
          <tr style="background-color: #103b70; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
            <th style="padding: 10px 8px; width: 50px; border: 1px solid #103b70;"></th>
            <th style="padding: 10px 8px; border: 1px solid #103b70;">Duração</th>
            <th style="padding: 10px 8px; border: 1px solid #103b70;">Início do Período</th>
            <th style="padding: 10px 8px; border: 1px solid #103b70;">Término do Período</th>
            <th style="padding: 10px 8px; border: 1px solid #103b70;">Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  let currentStart = new Date(currentMoment);

  for (let i = 0; i < 12; i++) {
    const currSign = (startSignIdx + i) % 12;
    const durationYears = ZR_SIGN_YEARS[currSign];
    const currentEnd = calcularDataFimZR(currentStart, durationYears);
    const isPeak = angularSignsFromFort.includes(currSign);

    let statusText = "";
    if (isPeak) {
      statusText = `<span style="background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; letter-spacing: 0.5px;">PICO</span>`;
    }

    const bgRow = i % 2 === 0 ? '#ffffff' : '#fffdf5';

    html += `
      <tr style="border-bottom: 1px solid #e2d9c2; background-color: ${bgRow};">
        <td style="padding: 10px 8px; text-align: center; border: 1px solid #e2d9c2;">${getSignSVGZR(currSign, 22)}</td>
        <td style="padding: 10px 8px; font-weight: 600; border: 1px solid #e2d9c2;">${durationYears} anos</td>
        <td style="padding: 10px 8px; border: 1px solid #e2d9c2;">${formatarDataBR(currentStart)}</td>
        <td style="padding: 10px 8px; border: 1px solid #e2d9c2;">${formatarDataBR(currentEnd)}</td>
        <td style="padding: 10px 8px; border: 1px solid #e2d9c2;">${statusText}</td>
      </tr>
    `;

    currentStart = new Date(currentEnd);
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}
