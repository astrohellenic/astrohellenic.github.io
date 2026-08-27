/* ==========================================
   MÓDULO DE DECÊNIOS HELENÍSTICOS
   ========================================== */

const ZODIACO_DECENIOS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const PLANETS_DECENIOS = [
  { id: 'sun', name: 'Sol', minorYears: 19, days: 570 },
  { id: 'moon', name: 'Lua', minorYears: 25, days: 750 },
  { id: 'mercury', name: 'Mercúrio', minorYears: 20, days: 600 },
  { id: 'venus', name: 'Vênus', minorYears: 8, days: 240 },
  { id: 'mars', name: 'Marte', minorYears: 15, days: 450 },
  { id: 'jupiter', name: 'Júpiter', minorYears: 12, days: 360 },
  { id: 'saturn', name: 'Saturno', minorYears: 30, days: 900 }
];

const SIGN_ELEMENTS_DEC = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
const ELEMENT_SIGN_COLORS_DEC = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

function getPlanetSymbolDec(planetId) {
  const codePoints = {
    sun: 0x2609,     // ☉
    moon: 0x263D,    // ☽
    mercury: 0x263F, // ☿
    venus: 0x2640,   // ♀
    mars: 0x2642,    // ♂
    jupiter: 0x2643, // ♃
    saturn: 0x2644   // ♄
  };
  return String.fromCodePoint(codePoints[planetId] || 0x2609);
}

const MONOLINE_ZODIAC_SVGS_DEC = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" stroke-miterlimit="10" points="52,53 57,58 52,63 "></polyline>`,
  `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="1" y1="28" x2="36" y2="63"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
  `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="7" y1="32" x2="57" y2="32"></line>`
];

function getSignSvgHtmlDec(signIdx, size = 18) {
  const elem = SIGN_ELEMENTS_DEC[signIdx];
  const color = ELEMENT_SIGN_COLORS_DEC[elem];
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; overflow: visible; display: inline-block; vertical-align: middle; flex-shrink: 0; margin: 0 2px;" title="${ZODIACO_DECENIOS[signIdx]}">${MONOLINE_ZODIAC_SVGS_DEC[signIdx]}</svg>`;
}

let decState = {
  birthDate: "",
  birthTime: "",
  startPlanet: "sun",
  planets: {
    sun: { sign: 0, deg: 0, min: 0 },
    moon: { sign: 0, deg: 0, min: 0 },
    mercury: { sign: 0, deg: 0, min: 0 },
    venus: { sign: 0, deg: 0, min: 0 },
    mars: { sign: 0, deg: 0, min: 0 },
    jupiter: { sign: 0, deg: 0, min: 0 },
    saturn: { sign: 0, deg: 0, min: 0 }
  },
  calculatedResult: null
};

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS */
function iniciarModuloDecenios() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  renderDeceniosUI(container);
}

function renderDeceniosUI(container) {
  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">
      
      <!-- CABEÇALHO -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); text-transform: uppercase; margin: 0;">Calculadora de Decênios</h2>
          <span style="font-size: 11px; color: #64748b; font-weight: 500;">Liberação dos Períodos de Vida e Cronocracias (Vettius Valens)</span>
        </div>
      </div>

      <!-- FORMULÁRIO DE ENTRADA -->
      <div style="background: #ffffff; border: 2px solid #d4af37; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.15);">
        <form id="decennialsModuleForm" onsubmit="event.preventDefault(); executarCalculoDecenios();">
          
          <div style="display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <label style="font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; display: block; margin-bottom: 6px;">Data de Nascimento *</label>
              <input type="date" id="decBirthDate" value="${decState.birthDate}" required style="width: 100%; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 13px; outline: none; background: #fff;">
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; display: block; margin-bottom: 6px;">Hora de Nascimento *</label>
              <input type="time" id="decBirthTime" value="${decState.birthTime}" required style="width: 100%; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 13px; outline: none; background: #fff;">
            </div>
          </div>

          <!-- PLANETAS -->
          <div style="margin-bottom: 16px;">
            <label style="font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; display: block; margin-bottom: 10px;">Posição dos 7 Planetas Clássicos:</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 12px;">
              ${PLANETS_DECENIOS.map(p => `
                <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                  <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue); display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">${getPlanetSymbolDec(p.id)}</span>
                    <span>${p.name}</span>
                  </div>
                  <select id="decSign_${p.id}" style="width: 100%; height: 36px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; padding: 0 8px; background: #fff;">
                    ${ZODIACO_DECENIOS.map((s, sIdx) => `<option value="${sIdx}" ${decState.planets[p.id].sign === sIdx ? 'selected' : ''}>${s}</option>`).join('')}
                  </select>
                  <div style="display: flex; gap: 4px;">
                    <input type="number" id="decDeg_${p.id}" min="0" max="29" value="${decState.planets[p.id].deg}" placeholder="0°" style="width: 50%; height: 34px; text-align: center; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 12px;">
                    <input type="number" id="decMin_${p.id}" min="0" max="59" value="${decState.planets[p.id].min}" placeholder="0'" style="width: 50%; height: 34px; text-align: center; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 12px;">
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- LUMINAR DA SEITA -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 10px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px;">
            <div>
              <label style="font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; display: block; margin-bottom: 2px;">Luminar da Seita / Planeta Inicial *</label>
              <span style="font-size: 11px; color: #64748b;">Sol (Diurno) ou Lua (Noturno)</span>
            </div>
            <select id="decStartPlanet" style="width: 180px; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-weight: 700; color: var(--primary-blue); padding: 0 12px; background: #fff;">
              <option value="sun" ${decState.startPlanet === 'sun' ? 'selected' : ''}>☉ Sol (Diurno)</option>
              <option value="moon" ${decState.startPlanet === 'moon' ? 'selected' : ''}>☽ Lua (Noturno)</option>
            </select>
          </div>

          <div style="text-align: center;">
            <button type="submit" style="background: linear-gradient(180deg, #2b70c4 0%, #1d5fa8 50%, #12437b 100%); color: #fff; font-family: 'Cinzel', serif; font-weight: 800; font-size: 14px; text-transform: uppercase; border: none; border-radius: 10px; padding: 14px 28px; cursor: pointer; box-shadow: 0 4px 14px rgba(29, 95, 168, 0.3);">
              <i class="fa-solid fa-calculator"></i> Calcular Decênios
            </button>
          </div>

        </form>
      </div>

      <!-- RESULTADOS -->
      <div id="decennialsResultsArea" style="display: ${decState.calculatedResult ? 'block' : 'none'};">
        ${decState.calculatedResult ? renderizarResultadosHTML(decState.calculatedResult) : ''}
      </div>

    </div>
  `;
}

function executarCalculoDecenios() {
  decState.birthDate = document.getElementById('decBirthDate').value;
  decState.birthTime = document.getElementById('decBirthTime').value;
  decState.startPlanet = document.getElementById('decStartPlanet').value;

  PLANETS_DECENIOS.forEach(p => {
    decState.planets[p.id] = {
      sign: parseInt(document.getElementById(`decSign_${p.id}`).value) || 0,
      deg: parseInt(document.getElementById(`decDeg_${p.id}`).value) || 0,
      min: parseInt(document.getElementById(`decMin_${p.id}`).value) || 0
    };
  });

  const birthDateTime = new Date(`${decState.birthDate}T${decState.birthTime}:00`);

  const planetChart = PLANETS_DECENIOS.map((p, originalIndex) => {
    const dataP = decState.planets[p.id];
    const absDeg = dataP.sign * 30 + dataP.deg + (dataP.min / 60);
    return { ...p, signIdx: dataP.sign, degree: dataP.deg, minute: dataP.min, absDeg, originalIndex };
  });

  const startPlanet = planetChart.find(p => p.id === decState.startPlanet);
  const startAbsDeg = startPlanet ? startPlanet.absDeg : 0;

  const sortedPlanets = [...planetChart].sort((a, b) => {
    const distA = (a.absDeg - startAbsDeg + 360) % 360;
    const distB = (b.absDeg - startAbsDeg + 360) % 360;
    if (Math.abs(distA - distB) < 0.00001) return a.originalIndex - b.originalIndex;
    return distA - distB;
  });

  const today = new Date();
  let currentPointer = new Date(birthDateTime);
  const timelineL1 = [];
  let activeL1 = null;
  let activeL2 = null;

  for (let i = 0; i < 10; i++) {
    const l1Planet = sortedPlanets[i % 7];
    const l1Start = new Date(currentPointer);
    const l1End = addDaysDec(l1Start, 3870);

    const l1IndexInSorted = sortedPlanets.findIndex(p => p.id === l1Planet.id);
    const l2PlanetSequence = [];
    for (let k = 0; k < 7; k++) {
      l2PlanetSequence.push(sortedPlanets[(l1IndexInSorted + k) % 7]);
    }

    let l2Pointer = new Date(l1Start);
    const l2Subperiods = [];

    l2PlanetSequence.forEach(l2Planet => {
      const l2Start = new Date(l2Pointer);
      const l2Days = l2Planet.days;
      const l2End = addDaysDec(l2Start, l2Days);
      const isL2Active = (today >= l2Start && today < l2End);

      const l2Obj = {
        planet: l2Planet,
        startDate: l2Start,
        endDate: l2End,
        days: l2Days,
        months: l2Planet.minorYears,
        isActive: isL2Active
      };

      l2Subperiods.push(l2Obj);
      if (isL2Active) activeL2 = l2Obj;
      l2Pointer = new Date(l2End);
    });

    const isL1Active = (today >= l1Start && today < l1End);
    const l1Obj = {
      cycleNumber: i + 1,
      planet: l1Planet,
      startDate: l1Start,
      endDate: l1End,
      subperiods: l2Subperiods,
      isActive: isL1Active
    };

    timelineL1.push(l1Obj);
    if (isL1Active) activeL1 = l1Obj;
    currentPointer = new Date(l1End);
  }

  decState.calculatedResult = { activeL1, activeL2, timelineL1 };
  
  const resultsArea = document.getElementById('decennialsResultsArea');
  if (resultsArea) {
    resultsArea.style.display = 'block';
    resultsArea.innerHTML = renderizarResultadosHTML(decState.calculatedResult);
  }
}

function addDaysDec(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateDec(date) {
  if (!date) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function renderizarResultadosHTML(res) {
  const { activeL1, activeL2, timelineL1 } = res;
  if (!activeL1 || !activeL2) return '<div style="text-align:center; padding:20px; color:#64748b;">Nenhum período ativo encontrado.</div>';

  const formatMin = m => String(m || 0).padStart(2, '0');

  return `
    <!-- PERÍODO ATIVO -->
    <div style="background: linear-gradient(145deg, #ffffff 0%, #f4f8ff 100%); border: 2px solid #1d5fa8; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
      <div style="border-bottom: 1px solid #bfdbfe; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%; display: inline-block;"></span>
        <h3 style="font-family: 'Cinzel', serif; font-size: 16px; color: #103b70; font-weight: 800; margin: 0; text-transform: uppercase;">Período Ativo</h3>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 14px;">
        <!-- L1 -->
        <div style="flex: 1; min-width: 260px; background: #ffffff; border: 1px solid #fde047; border-radius: 10px; padding: 14px;">
          <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase;">Nível 1 (L1) - Regente da Era</span>
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px; color: #d4af37; font-weight: bold; line-height: 1;">${getPlanetSymbolDec(activeL1.planet.id)}</span>
              <div>
                <h4 style="font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; margin: 0;">${activeL1.planet.name}</h4>
                <div style="font-size: 11px; color: #64748b; margin: 0;">em ${getSignSvgHtmlDec(activeL1.planet.signIdx, 18)} <strong>${ZODIACO_DECENIOS[activeL1.planet.signIdx]}</strong> (${activeL1.planet.degree}°${formatMin(activeL1.planet.minute)}')</div>
              </div>
            </div>
            <span style="background: #fefce8; border: 1px solid #fde047; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #854d0e;">129 Meses</span>
          </div>
          <div style="font-size: 11px; color: #475569; border-top: 1px solid #f1f5f9; paddingTop: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do L1:</span><strong>${formatDateDec(activeL1.startDate)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Término do L1:</span><strong>${formatDateDec(activeL1.endDate)}</strong></div>
          </div>
        </div>

        <!-- L2 -->
        <div style="flex: 1; min-width: 260px; background: #ffffff; border: 1px solid #93c5fd; border-radius: 10px; padding: 14px;">
          <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: #1d5fa8; text-transform: uppercase;">Nível 2 (L2) - Executor do Momento</span>
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px; color: #1d5fa8; font-weight: bold; line-height: 1;">${getPlanetSymbolDec(activeL2.planet.id)}</span>
              <div>
                <h4 style="font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; margin: 0;">${activeL2.planet.name}</h4>
                <div style="font-size: 11px; color: #64748b; margin: 0;">em ${getSignSvgHtmlDec(activeL2.planet.signIdx, 18)} <strong>${ZODIACO_DECENIOS[activeL2.planet.signIdx]}</strong> (${activeL2.planet.degree}°${formatMin(activeL2.planet.minute)}')</div>
              </div>
            </div>
            <span style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #1e40af;">${activeL2.months} Meses</span>
          </div>
          <div style="font-size: 11px; color: #475569; border-top: 1px solid #f1f5f9; paddingTop: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do L2:</span><strong>${formatDateDec(activeL2.startDate)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Término do L2:</span><strong>${formatDateDec(activeL2.endDate)}</strong></div>
          </div>
        </div>
      </div>

      <!-- TABELA DA ERA ATIVA -->
      <div style="background: #ffffff; border: 1px solid #d4af37; border-radius: 10px; overflow: hidden; margin-top: 14px;">
        <div style="padding: 10px 14px; background: #fffdf5; border-bottom: 1px solid #fef08a; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px; color: #103b70; font-weight: bold;">${getPlanetSymbolDec(activeL1.planet.id)}</span>
            <strong style="font-family: 'Cinzel', serif; font-size: 13px; color: #0f172a;">L1: ${activeL1.planet.name.toUpperCase()}</strong>
          </div>
          <span style="font-size: 11px; color: #475569;"><strong>${formatDateDec(activeL1.startDate)} a ${formatDateDec(activeL1.endDate)}</strong></span>
        </div>
        <div style="padding: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
            <thead>
              <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                <th style="padding: 10px 12px; text-align: left;">L2</th>
                <th style="padding: 10px 12px; text-align: left;">Duração</th>
                <th style="padding: 10px 12px; text-align: left;">Início</th>
                <th style="padding: 10px 12px; text-align: left;">Término</th>
              </tr>
            </thead>
            <tbody>
              ${activeL1.subperiods.map(sub => `
                <tr style="border-bottom: 1px solid #e2e8f0; ${sub.isActive ? 'background: #fffbf0; border-left: 4px solid #d4af37;' : ''}">
                  <td style="padding: 10px 12px;"><strong>${getPlanetSymbolDec(sub.planet.id)} ${sub.planet.name}</strong></td>
                  <td style="padding: 10px 12px;">${sub.months} Meses (${sub.days}d)</td>
                  <td style="padding: 10px 12px;">${formatDateDec(sub.startDate)}</td>
                  <td style="padding: 10px 12px;">${formatDateDec(sub.endDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CRONOGRAMA DA LINHA DO TEMPO -->
    <div style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #d4af37; border-radius: 14px; padding: 18px;">
      <div style="border-bottom: 1px solid #fef08a; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 16px; color: #1e293b; font-weight: 800; margin: 0; text-transform: uppercase;">Linha do Tempo dos Decênios</h3>
        <span style="font-size: 11px; color: #64748b;">Calendário Egípcio = 360 Dias/Ano</span>
      </div>

      <div>
        ${timelineL1.map((l1, idx) => `
          <div style="background: #ffffff; border: 1px solid ${l1.isActive ? '#d4af37' : '#e2e8f0'}; border-radius: 10px; margin-bottom: 8px; overflow: hidden;">
            <div style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="document.getElementById('dec_l1_details_${idx}').style.display = document.getElementById('dec_l1_details_${idx}').style.display === 'none' ? 'block' : 'none'">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 22px; color: #103b70; font-weight: bold;">${getPlanetSymbolDec(l1.planet.id)}</span>
                <div>
                  <strong style="font-family: 'Cinzel', serif; font-size: 13px; color: #0f172a;">L1: ${l1.planet.name.toUpperCase()}</strong>
                  <div style="font-size: 11px; color: #64748b;">em ${getSignSvgHtmlDec(l1.planet.signIdx, 15)} ${ZODIACO_DECENIOS[l1.planet.signIdx]} (${l1.planet.degree}°${formatMin(l1.planet.minute)}') • 129 Meses</div>
                </div>
              </div>
              <strong style="font-size: 11px; color: #475569;">${formatDateDec(l1.startDate)} a ${formatDateDec(l1.endDate)}</strong>
            </div>

            <div id="dec_l1_details_${idx}" style="display: none; border-top: 1px solid #e2e8f0; padding: 10px; background: #f8fafc;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                <thead>
                  <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                    <th style="padding: 8px 10px; text-align: left;">L2</th>
                    <th style="padding: 8px 10px; text-align: left;">Duração</th>
                    <th style="padding: 8px 10px; text-align: left;">Início</th>
                    <th style="padding: 8px 10px; text-align: left;">Término</th>
                  </tr>
                </thead>
                <tbody>
                  ${l1.subperiods.map(l2 => `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${l2.isActive ? 'background: #fffbf0; border-left: 4px solid #d4af37;' : ''}">
                      <td style="padding: 8px 10px;"><strong>${getPlanetSymbolDec(l2.planet.id)} ${l2.planet.name}</strong></td>
                      <td style="padding: 8px 10px;">${l2.months} Meses (${l2.days}d)</td>
                      <td style="padding: 8px 10px;">${formatDateDec(l2.startDate)}</td>
                      <td style="padding: 8px 10px;">${formatDateDec(l2.endDate)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
