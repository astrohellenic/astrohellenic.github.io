/* ==========================================
   MÓDULO DE DECÊNIOS HELENÍSTICOS (AUTOMAÇÃO)
   ========================================== */

const ZODIACO_DECENIOS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const PLANETS_DECENIOS = [
  { id: 'Sun', name: 'Sol', minorYears: 19, days: 570, symbol: '☉' },
  { id: 'Moon', name: 'Lua', minorYears: 25, days: 750, symbol: '☽' },
  { id: 'Mercury', name: 'Mercúrio', minorYears: 20, days: 600, symbol: '☿' },
  { id: 'Venus', name: 'Vênus', minorYears: 8, days: 240, symbol: '♀' },
  { id: 'Mars', name: 'Marte', minorYears: 15, days: 450, symbol: '♂' },
  { id: 'Jupiter', name: 'Júpiter', minorYears: 12, days: 360, symbol: '♃' },
  { id: 'Saturn', name: 'Saturno', minorYears: 30, days: 900, symbol: '♄' }
];

const SIGN_ELEMENTS_DEC = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
const ELEMENT_SIGN_COLORS_DEC = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

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

let overrideStartPlanet = null;

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS */
function iniciarModuloDecenios() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar os Decênios.</div>`;
    return;
  }

  renderDeceniosUI(container);
}

function renderDeceniosUI(container) {
  const data = currentCalculatedData;
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const sunAbs = data.Sol ? data.Sol.grau_absoluto : 0;

  // DETECTA A SEITA AUTOMATICAMENTE
  const isDay = ((sunAbs - ascAbs + 360) % 360) >= 180;
  const detectedStartPlanet = isDay ? 'Sun' : 'Moon';
  const startPlanetKey = overrideStartPlanet || detectedStartPlanet;

  // PROCESSA O CÁLCULO INSTANTANEAMENTE
  const result = calcularDeceniosAutomatico(startPlanetKey);

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : currentSubjectName;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">
      
      <!-- CABEÇALHO COMPACTO DA FERRAMENTA -->
      <div style="background: #ffffff; padding: 16px 20px; border-radius: 10px; border: 1px solid var(--border-color); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0; text-transform: uppercase;">${escapeHtml(headerTitle)}</h2>
          <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
            ${dia}/${mes}/${ano} às ${hora}:${min} • ${escapeHtml(currentGeo.city || "Local n/i")} • 
            <strong style="color: var(--gold-dark);">${isDay ? 'Natividade Diurna' : 'Natividade Noturna'}</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
          <label style="font-size: 11px; font-weight: 700; color: var(--primary-blue); font-family: 'Cinzel', serif;">Planeta Inicial:</label>
          <select id="decStartPlanetSelect" onchange="alternarSeitaManual(this.value)" style="padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 12px; font-weight: 700; color: #334155; outline: none; background: #ffffff; cursor: pointer;">
            <option value="Sun" ${startPlanetKey === 'Sun' ? 'selected' : ''}>☉ Sol (Diurno)</option>
            <option value="Moon" ${startPlanetKey === 'Moon' ? 'selected' : ''}>☽ Lua (Noturno)</option>
          </select>
        </div>
      </div>

      <!-- EXIBIÇÃO DOS RESULTADOS DOS DECÊNIOS -->
      <div id="decennialsResultsArea">
        ${renderizarResultadosHTML(result)}
      </div>

    </div>
  `;
}

function alternarSeitaManual(val) {
  overrideStartPlanet = val;
  iniciarModuloDecenios();
}

function calcularDeceniosAutomatico(startPlanetId) {
  const data = currentCalculatedData;
  const birthDateTime = new Date(currentMoment);

  const planetKeys = {
    Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio',
    Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno'
  };

  const planetChart = PLANETS_DECENIOS.map((p, originalIndex) => {
    const key = planetKeys[p.id];
    const item = data[key];
    const absDeg = item ? item.grau_absoluto : 0;
    const signIdx = Math.floor(absDeg / 30);
    const degInSign = Math.floor(absDeg % 30);
    const minInSign = Math.round((absDeg % 1) * 60);

    return { ...p, signIdx, degree: degInSign, minute: minInSign, absDeg, originalIndex };
  });

  const startPlanet = planetChart.find(p => p.id === startPlanetId);
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

  return { activeL1, activeL2, timelineL1 };
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
  if (!activeL1 || !activeL2) {
    return `<div style="background: #ffffff; border: 1px solid var(--border-color); padding: 20px; border-radius: 10px; text-align: center; color: #64748b; font-size: 13px;">A idade atual do nativo está fora da janela dos 10 primeiros ciclos de Decênios.</div>`;
  }

  const formatMin = m => String(m || 0).padStart(2, '0');

  return `
    <!-- PERÍODO ATIVO -->
    <div style="background: linear-gradient(145deg, #ffffff 0%, #f4f8ff 100%); border: 2px solid #1d5fa8; border-radius: 14px; padding: 18px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(29, 95, 168, 0.08);">
      <div style="border-bottom: 1px solid #bfdbfe; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%; display: inline-block;"></span>
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #103b70; font-weight: 800; margin: 0; text-transform: uppercase;">Período Ativo</h3>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 14px;">
        <!-- L1 -->
        <div style="flex: 1; min-width: 260px; background: #ffffff; border: 1px solid #fde047; border-radius: 10px; padding: 14px;">
          <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase;">Nível 1 (L1) - Regente da Era</span>
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px; color: #d4af37; font-weight: bold; line-height: 1;">${activeL1.planet.symbol}</span>
              <div>
                <h4 style="font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; margin: 0; color: #1e293b;">${activeL1.planet.name}</h4>
                <div style="font-size: 11px; color: #64748b; margin: 0;">em ${getSignSvgHtmlDec(activeL1.planet.signIdx, 18)} <strong>${ZODIACO_DECENIOS[activeL1.planet.signIdx]}</strong> (${activeL1.planet.degree}°${formatMin(activeL1.planet.minute)}')</div>
              </div>
            </div>
            <span style="background: #fefce8; border: 1px solid #fde047; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #854d0e;">129 Meses</span>
          </div>
          <div style="font-size: 11px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do L1:</span><strong>${formatDateDec(activeL1.startDate)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Término do L1:</span><strong>${formatDateDec(activeL1.endDate)}</strong></div>
          </div>
        </div>

        <!-- L2 -->
        <div style="flex: 1; min-width: 260px; background: #ffffff; border: 1px solid #93c5fd; border-radius: 10px; padding: 14px;">
          <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: #1d5fa8; text-transform: uppercase;">Nível 2 (L2) - Executor do Momento</span>
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px; color: #1d5fa8; font-weight: bold; line-height: 1;">${activeL2.planet.symbol}</span>
              <div>
                <h4 style="font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; margin: 0; color: #1e293b;">${activeL2.planet.name}</h4>
                <div style="font-size: 11px; color: #64748b; margin: 0;">em ${getSignSvgHtmlDec(activeL2.planet.signIdx, 18)} <strong>${ZODIACO_DECENIOS[activeL2.planet.signIdx]}</strong> (${activeL2.planet.degree}°${formatMin(activeL2.planet.minute)}')</div>
              </div>
            </div>
            <span style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #1e40af;">${activeL2.months} Meses</span>
          </div>
          <div style="font-size: 11px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do L2:</span><strong>${formatDateDec(activeL2.startDate)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Término do L2:</span><strong>${formatDateDec(activeL2.endDate)}</strong></div>
          </div>
        </div>
      </div>

      <!-- TABELA DA ERA ATIVA -->
      <div style="background: #ffffff; border: 1px solid #d4af37; border-radius: 10px; overflow: hidden; margin-top: 14px;">
        <div style="padding: 10px 14px; background: #fffdf5; border-bottom: 1px solid #fef08a; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px; color: #103b70; font-weight: bold;">${activeL1.planet.symbol}</span>
            <strong style="font-family: 'Cinzel', serif; font-size: 13px; color: #0f172a;">L1 ATIVO: ${activeL1.planet.name.toUpperCase()}</strong>
          </div>
          <span style="font-size: 11px; color: #475569;"><strong>${formatDateDec(activeL1.startDate)} a ${formatDateDec(activeL1.endDate)}</strong></span>
        </div>
        <div style="padding: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
            <thead>
              <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                <th style="padding: 10px 12px; text-align: left;">L2 (Subperíodo)</th>
                <th style="padding: 10px 12px; text-align: left;">Duração</th>
                <th style="padding: 10px 12px; text-align: left;">Início</th>
                <th style="padding: 10px 12px; text-align: left;">Término</th>
              </tr>
            </thead>
            <tbody>
              ${activeL1.subperiods.map(sub => `
                <tr style="border-bottom: 1px solid #e2e8f0; ${sub.isActive ? 'background: #fffbf0; border-left: 4px solid #d4af37;' : ''}">
                  <td style="padding: 10px 12px;"><strong>${sub.planet.symbol} ${sub.planet.name}</strong></td>
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
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #1e293b; font-weight: 800; margin: 0; text-transform: uppercase;">Linha do Tempo dos Decênios</h3>
        <span style="font-size: 11px; color: #64748b;">Calendário Egípcio = 360 Dias/Ano</span>
      </div>

      <div>
        ${timelineL1.map((l1, idx) => `
          <div style="background: #ffffff; border: 1px solid ${l1.isActive ? '#d4af37' : '#e2e8f0'}; border-radius: 10px; margin-bottom: 8px; overflow: hidden;">
            <div style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="document.getElementById('dec_l1_details_${idx}').style.display = document.getElementById('dec_l1_details_${idx}').style.display === 'none' ? 'block' : 'none'">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 22px; color: #103b70; font-weight: bold;">${l1.planet.symbol}</span>
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
                    <th style="padding: 8px 10px; text-align: left;">L2 (Subperíodo)</th>
                    <th style="padding: 8px 10px; text-align: left;">Duração</th>
                    <th style="padding: 8px 10px; text-align: left;">Início</th>
                    <th style="padding: 8px 10px; text-align: left;">Término</th>
                  </tr>
                </thead>
                <tbody>
                  ${l1.subperiods.map(l2 => `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${l2.isActive ? 'background: #fffbf0; border-left: 4px solid #d4af37;' : ''}">
                      <td style="padding: 8px 10px;"><strong>${l2.planet.symbol} ${l2.planet.name}</strong></td>
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
