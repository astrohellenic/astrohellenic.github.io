/* ==========================================
   MÓDULO DE LIBERAÇÃO ZODIACAL (APHESIS)
   ========================================== */

let selectedZRPhase = "fortune"; // Fortuna como lote padrão inicial
let expandedL1Index = 0; // Primeiro L1 expandido por padrão
let expandedL2Key = null; // Guarda a chave do L2 expandido (ex: "0_2")

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

function getSignSVGZR(signIndex, size = 22) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${SIGN_COLORS_ZR[signIndex]}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_ZR[signIndex]}</svg>`;
}

function getLotIconSVG(lotKey) {
  if (lotKey === 'fortune') {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="currentColor" stroke-width="1.8"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="currentColor" stroke-width="1.8"/></svg>`;
  }
  if (lotKey === 'spirit') {
    return `<svg width="22" height="22" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><text x="0" y="0" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="currentColor" text-anchor="middle" dominant-baseline="central">Φ</text></svg>`;
  }

  const lotConfig = {
    venus:   { sym: '♀', y: -4, size: 15 },
    mercury: { sym: '☿', y: -0.5, size: 15 },
    mars:    { sym: '♂', y: -4, size: 15 },
    jupiter: { sym: '♃', y: 0, size: 15 },
    saturn:  { sym: '♄', y: -0.5, size: 15 }
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
  expandedL1Index = 0;
  expandedL2Key = null;
  renderLiberacaoUI();
}

function alternarL1Accordion(index) {
  expandedL1Index = (expandedL1Index === index) ? null : index;
  expandedL2Key = null;
  renderLiberacaoUI();
}

function alternarL2Accordion(l1Idx, l2Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}`;
  expandedL2Key = (expandedL2Key === key) ? null : key;
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

// CÁLCULO DOS SUB-SUBPERÍODOS DO L3 (Dias brutos = Anos do signo)
function calcularSubperiodosL3(l2SignIdx, l2Start, l2End) {
  const subperiodos = [];
  let currSign = l2SignIdx;
  let currStart = new Date(l2Start);
  let count = 0;

  while (currStart < l2End) {
    if (count === 12) {
      currSign = (l2SignIdx + 6) % 12; // Salto (Lysis)
    }

    const days = ZR_SIGN_YEARS[currSign];
    let currEnd = new Date(currStart.getTime() + days * 24 * 60 * 60 * 1000);

    let isClamped = false;
    if (currEnd > l2End) {
      currEnd = new Date(l2End);
      isClamped = true;
    }

    subperiodos.push({
      signIdx: currSign,
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
    <div style="background: #fffdf5; border-radius: 16px; padding: 20px; max-width: 900px; margin: 20px auto;">
      <div style="background: #ffffff; border: 1px solid #c59b27; border-radius: 12px; padding: 20px; font-family: 'Montserrat', sans-serif; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h3 style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; margin-top: 0; margin-bottom: 20px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">Liberação Zodiacal</h3>
          
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

  html += `</div>`;

  let currentStart = new Date(currentMoment);

  for (let i = 0; i < 12; i++) {
    const currSign = (startSignIdx + i) % 12;
    const durationYears = ZR_SIGN_YEARS[currSign];
    const currentEnd = calcularDataFimZR(currentStart, durationYears);
    const isExpanded = (expandedL1Index === i);
    const subperiodosL2 = calcularSubperiodosL2(currSign, currentStart, durationYears);

    const isPeakL1 = angularSignsFromFort.includes(currSign);
    let peakBadgeL1 = isPeakL1 
      ? `<span style="background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; margin-left: 8px;">PICO</span>` 
      : ``;

    html += `
      <div style="margin-bottom: 12px; border: 1px solid #c59b27; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div onclick="alternarL1Accordion(${i})" style="padding: 12px 16px; background: ${isExpanded ? '#fefcf2' : '#ffffff'}; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none; border-bottom: ${isExpanded ? '1px solid #e5d5a1' : 'none'};">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${getSignSVGZR(currSign, 24)}
            <div>
              <strong style="color: #103b70; font-family: 'Cinzel', serif; font-size: 13px;">L1: ${SIGN_NAMES_ZR[currSign].toUpperCase()}</strong>
              <span style="font-size: 12px; color: #64748b; margin-left: 6px;">${durationYears} Anos</span>
              ${peakBadgeL1}
            </div>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #334155;">
            ${formatarDataBR(currentStart)} a ${formatarDataBR(currentEnd)}
          </div>
        </div>
    `;

    if (isExpanded) {
      html += `
        <div style="padding: 10px; background: #fffdf5;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #c59b27; border-radius: 6px; overflow: hidden; font-size: 12px; text-align: center; background: #ffffff;">
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
        const bgRow = sIdx % 2 === 0 ? '#ffffff' : '#fffdf5';
        const isPeakL2 = angularSignsFromFort.includes(sub.signIdx);

        let statusL2 = "";
        if (sub.isLysis) {
          statusL2 += `<span style="background: #fee2e2; color: #991b1b; border: 1px solid #f87171; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; margin-right: 4px;">SALTO</span>`;
        }
        if (isPeakL2) {
          statusL2 += `<span style="background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px;">PICO</span>`;
        }

        html += `
          <tr onclick="alternarL2Accordion(${i}, ${sIdx}, event)" style="border-bottom: 1px solid #e5d5a1; background-color: ${isL2Expanded ? '#fefcf2' : bgRow}; cursor: pointer;">
            <td style="padding: 8px; text-align: center;">${getSignSVGZR(sub.signIdx, 20)}</td>
            <td style="padding: 8px; font-weight: 600; color: #103b70;">${sub.months} Meses (${sub.days} Dias)</td>
            <td style="padding: 8px; color: #334155;">${formatarDataBR(sub.start)}</td>
            <td style="padding: 8px; color: #334155;">${formatarDataBR(sub.end)}</td>
            <td style="padding: 8px; text-align: center;">${statusL2}</td>
          </tr>
        `;

        // TABELA DO L3 (EXPANDE ABAIXO DA LINHA DO L2 SELECIONADA)
        if (isL2Expanded) {
          const subperiodosL3 = calcularSubperiodosL3(sub.signIdx, sub.start, sub.end);
          html += `
            <tr>
              <td colspan="5" style="padding: 8px 12px; background: #faf8f0; border-bottom: 1px solid #e5d5a1;">
                <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #c59b27; border-radius: 6px; overflow: hidden; font-size: 11px; text-align: center; background: #ffffff;">
                  <thead>
                    <tr style="background-color: #1e293b; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
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
            const bgRowL3 = l3Idx % 2 === 0 ? '#ffffff' : '#fffdf5';
            const isPeakL3 = angularSignsFromFort.includes(subL3.signIdx);

            let statusL3 = "";
            if (subL3.isLysis) {
              statusL3 += `<span style="background: #fee2e2; color: #991b1b; border: 1px solid #f87171; padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 8px; margin-right: 4px;">SALTO</span>`;
            }
            if (isPeakL3) {
              statusL3 += `<span style="background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 8px;">PICO</span>`;
            }

            html += `
              <tr style="border-bottom: 1px solid #e5d5a1; background-color: ${bgRowL3};">
                <td style="padding: 6px; text-align: center;">${getSignSVGZR(subL3.signIdx, 18)}</td>
                <td style="padding: 6px; font-weight: 600; color: #103b70;">${subL3.days} Dias</td>
                <td style="padding: 6px; color: #334155;">${formatarDataBR(subL3.start)}</td>
                <td style="padding: 6px; color: #334155;">${formatarDataBR(subL3.end)}</td>
                <td style="padding: 6px; text-align: center;">${statusL3}</td>
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
        </div>
      `;
    }

    html += `</div>`;
    currentStart = new Date(currentEnd);
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}
