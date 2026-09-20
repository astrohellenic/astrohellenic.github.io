/* ==========================================
   MÓDULO DE DECÊNIOS HELENÍSTICOS (AUTOMAÇÃO)
   ========================================== */

const ZODIACO_DECENIOS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const PLANETS_DECENIOS = [
  { id: 'Sun', name: 'Sol', minorYears: 19, days: 570 },
  { id: 'Moon', name: 'Lua', minorYears: 25, days: 750 },
  { id: 'Mercury', name: 'Mercúrio', minorYears: 20, days: 600 },
  { id: 'Venus', name: 'Vênus', minorYears: 8, days: 240 },
  { id: 'Mars', name: 'Marte', minorYears: 15, days: 450 },
  { id: 'Jupiter', name: 'Júpiter', minorYears: 12, days: 360 },
  { id: 'Saturn', name: 'Saturno', minorYears: 30, days: 900 }
];

const SIGN_ELEMENTS_DEC = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
const ELEMENT_SIGN_COLORS_DEC = { fire: "var(--element-fogo)", earth: "var(--element-terra)", air: "var(--element-ar)", water: "var(--element-agua)" };

const MONOLINE_ZODIAC_SVGS_DEC = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,52V12c0,0,0-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" stroke-miterlimit="10" points="52,53 57,58 52,63 "></polyline>`,
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

let decIconUidCounter = 0;
function getPlanet3DSVG(planetId, size = 34) {
  if (typeof estiloPlanetasEsferico === 'function' && !estiloPlanetasEsferico()) {
    return getPlanetSimpleSVG(planetId, size);
  }
  // Cada ícone precisa de um id de gradiente/clipPath ÚNICO: como as tabelas
  // de Decênios repetem o mesmo planeta dezenas/centenas de vezes na mesma
  // página, ids fixos e repetidos faziam o navegador falhar em resolver
  // alguns gradientes (círculos aparecendo sem preenchimento/desconfigurados).
  const uid = 'dec' + (decIconUidCounter++) + '_';
  const planetSVGs = {
    Sun: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Sun" cx="35%" cy="32%" r="68%"><stop offset="0%" stop-color="#fffbeb" /><stop offset="25%" stop-color="#fde047" /><stop offset="60%" stop-color="#f59e0b" /><stop offset="88%" stop-color="#d97706" /><stop offset="100%" stop-color="#92400e" /></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25"/><circle cx="50" cy="50" r="42" fill="url(#${uid}Sun)"/><ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/><text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☉</text>
    </svg>`,
    Moon: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Moon" cx="32%" cy="28%" r="70%"><stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#e2e8f0" /><stop offset="65%" stop-color="#94a3b8" /><stop offset="90%" stop-color="#475569" /><stop offset="100%" stop-color="#1e293b" /></radialGradient></defs>
      <circle cx="50" cy="50" r="42" fill="url(#${uid}Moon)"/><circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/><circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/><circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/><circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/><ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/><text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☽</text>
    </svg>`,
    Mercury: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Merc" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fef08a" /><stop offset="28%" stop-color="#d97706" /><stop offset="65%" stop-color="#92400e" /><stop offset="92%" stop-color="#451a03" /><stop offset="100%" stop-color="#270e02" /></radialGradient></defs>
      <circle cx="50" cy="50" r="42" fill="url(#${uid}Merc)"/><ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/><circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/><text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☿</text>
    </svg>`,
    Venus: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Ven" cx="34%" cy="30%" r="68%"><stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="65%" stop-color="#f59e0b" /><stop offset="90%" stop-color="#b45309" /><stop offset="100%" stop-color="#78350f" /></radialGradient></defs>
      <circle cx="50" cy="50" r="42" fill="url(#${uid}Ven)"/><ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/><circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/><text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♀</text>
    </svg>`,
    Mars: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Mars" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fca5a5" /><stop offset="25%" stop-color="#ef4444" /><stop offset="60%" stop-color="#b91c1c" /><stop offset="88%" stop-color="#7f1d1d" /><stop offset="100%" stop-color="#450a0a" /></radialGradient></defs>
      <circle cx="50" cy="50" r="42" fill="url(#${uid}Mars)"/><ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/><ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/><circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/><text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♂</text>
    </svg>`,
    Jupiter: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Jup" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fffbeb" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="58%" stop-color="#d4a373" /><stop offset="82%" stop-color="#a97142" /><stop offset="100%" stop-color="#6f4518" /></radialGradient><clipPath id="${uid}ClipJup"><circle cx="50" cy="50" r="42" /></clipPath></defs>
      <circle cx="50" cy="50" r="42" fill="url(#${uid}Jup)"/><g clip-path="url(#${uid}ClipJup)" opacity="0.45"><rect x="0" y="24" width="100" height="6" fill="#8c531b" /><rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" /><rect x="0" y="49" width="100" height="11" fill="#783d19" /><rect x="0" y="64" width="100" height="6" fill="#8c531b" /><rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" /></g><ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/><text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♃</text>
    </svg>`,
    Saturn: `<svg width="${Math.round(size * 1.11)}" height="${size}" viewBox="-15 0 130 100" style="display: inline-block; vertical-align: middle;">
      <defs><radialGradient id="${uid}Sat" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fef9c3" /><stop offset="35%" stop-color="#fde047" /><stop offset="70%" stop-color="#ca8a04" /><stop offset="92%" stop-color="#854d0e" /><stop offset="100%" stop-color="#422006" /></radialGradient><linearGradient id="${uid}Rings" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" /><stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" /><stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" /><stop offset="85%" stop-color="#64748b" stop-opacity="0.9" /><stop offset="100%" stop-color="#334155" stop-opacity="0.95" /></linearGradient></defs>
      <g transform="rotate(-22 50 50)"><ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#${uid}Rings)" stroke-width="5.5" opacity="0.95" /><ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/></g><circle cx="50" cy="50" r="36" fill="url(#${uid}Sat)"/><g transform="rotate(-22 50 50)"><path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#${uid}Rings)" stroke-width="5.5" /><path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/></g><ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/><text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♄</text>
    </svg>`
  };
  return planetSVGs[planetId] || '';
}

let overrideStartPlanet = null;
let expandedL3KeyDec = null; // Guarda a chave do L3 (regência diária) expandido, ex.: "0_2" ou "active_1"

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS */
function iniciarModuloDecenios() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar os Decênios.</div>`;
    return;
  }

  renderDeceniosUI(container);
}

function renderDeceniosUI(container) {
  const data = currentCalculatedData;
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const sunAbs = data.Sol ? data.Sol.grau_absoluto : 0;
  const moonAbs = data.Lua ? data.Lua.grau_absoluto : 0;

  // DETECTA A SEITA AUTOMATICAMENTE
  const isDay = ((sunAbs - ascAbs + 360) % 360) >= 180;
  const detectedStartPlanet = isDay ? 'Sun' : 'Moon';
  const startPlanetKey = overrideStartPlanet || detectedStartPlanet;

  // AVISO: LUZ (DA SEITA) EM CASA NÃO-OPERANTE — sempre com base na luz
  // detectada automaticamente pela seita, não no override manual do usuário
  const luzAbs = isDay ? sunAbs : moonAbs;
  const signoASC = Math.floor(ascAbs / 30);
  const signoLuz = Math.floor(luzAbs / 30);
  const casaLuz = ((signoLuz - signoASC + 12) % 12) + 1;
  const CASAS_NAO_OPERANTES_DEC = [2, 6, 8, 12];
  const luzEmCasaNaoOperante = CASAS_NAO_OPERANTES_DEC.includes(casaLuz);
  const nomeLuzDec = isDay ? 'Sol' : 'Lua';

  // PROCESSA O CÁLCULO INSTANTANEAMENTE
  const result = calcularDeceniosAutomatico(startPlanetKey);

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : currentSubjectName;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: flex-end; padding: 12px 20px 0;">
        <button onclick="capturarTelaParaRelatorio('decenios', 'decenios-container', 'Decênios Helenísticos')" title="Adiciona esta tela, exatamente do jeito que está agora, como um bloco no Relatório" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif;">
          <i class="fa-solid fa-file-circle-plus"></i> Adicionar ao Relatório
        </button>
      </div>
    <div id="decenios-container" style="width: 100%; flex: 1; overflow-y: auto; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">

      <!-- CABEÇALHO PADRONIZADO (ESTILO PROFECÇÃO) -->
      <div style="background: var(--bg-card); padding: 16px 20px; border-radius: 14px; border: 1.5px solid var(--gold-primary); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: var(--primary-blue); margin: 0; text-transform: uppercase;">${escapeHtml(headerTitle)}</h2>
          <div style="font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">
            ${dia}/${mes}/${ano} às ${hora}:${min} • ${escapeHtml(currentGeo.city || "Local n/i")} •
            <strong style="color: var(--badge-text);">${isDay ? 'Natividade Diurna' : 'Natividade Noturna'}</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          ${luzEmCasaNaoOperante ? `
            <div title="${nomeLuzDec} em casa não-operante (casa ${casaLuz}) — considere selecionar outro planeta manualmente" style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; cursor: help;">
              <svg width="22" height="22" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 2 L23 21 H1 Z" fill="var(--badge-bg)" stroke="var(--badge-text)" stroke-width="1.5" stroke-linejoin="round"/>
                <rect x="11" y="9" width="2" height="6" rx="1" fill="var(--badge-text)"/>
                <rect x="11" y="16.5" width="2" height="2" rx="1" fill="var(--badge-text)"/>
              </svg>
            </div>
          ` : ''}
          <div style="position: relative; display: inline-block;">
            <button type="button" onclick="const menu=document.getElementById('decStartPlanetMenu'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: 38px; height: 38px; background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Planeta Inicial">
              ${getPlanet3DSVG(startPlanetKey, 26)}
            </button>
            <div id="decStartPlanetMenu" style="display: none; position: absolute; top: 42px; right: 0; background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 38px; box-sizing: border-box;">
              <div onclick="alternarSeitaManual('Sun')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Sun', 24)}</div>
              <div onclick="alternarSeitaManual('Moon')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Moon', 24)}</div>
              <div onclick="alternarSeitaManual('Mercury')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Mercury', 24)}</div>
              <div onclick="alternarSeitaManual('Venus')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Venus', 24)}</div>
              <div onclick="alternarSeitaManual('Mars')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Mars', 24)}</div>
              <div onclick="alternarSeitaManual('Jupiter')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Jupiter', 24)}</div>
              <div onclick="alternarSeitaManual('Saturn')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Saturn', 24)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- EXIBIÇÃO DOS RESULTADOS DOS DECÊNIOS -->
      <div id="decennialsResultsArea">
        ${renderizarResultadosHTML(result)}
      </div>

    </div>
    </div>
  `;

  encolherTabelasDecVisiveis(container);
}

/* ENCOLHE TABELAS LARGAS DEMAIS PARA CABEREM NA TELA (SEM CORTE), EM VEZ DE
   FICAREM TRAVADAS/CORTADAS EM TELAS ESTREITAS — mesma técnica usada no
   Painel Técnico. Em telas largas, onde as tabelas já cabem, não faz nada. */
function encolherTabelaLargaDec(tableEl) {
  if (!tableEl || tableEl.dataset.autoScaledDec === '1') return;
  const parent = tableEl.parentElement;
  if (!parent) return;

  const parentStyles = getComputedStyle(parent);
  const availableWidth = parent.clientWidth
    - parseFloat(parentStyles.paddingLeft || 0)
    - parseFloat(parentStyles.paddingRight || 0);
  const naturalWidth = tableEl.offsetWidth;
  if (!availableWidth || !naturalWidth || naturalWidth <= availableWidth) return;

  const naturalHeight = tableEl.offsetHeight;
  const escala = availableWidth / naturalWidth;
  const scaledHeight = naturalHeight * escala;

  const outerScroll = document.createElement('div');
  outerScroll.style.overflow = 'hidden';
  outerScroll.style.textAlign = 'center';
  const scaleBox = document.createElement('div');
  scaleBox.style.display = 'inline-block';

  parent.insertBefore(outerScroll, tableEl);
  outerScroll.appendChild(scaleBox);
  scaleBox.appendChild(tableEl);

  tableEl.style.transformOrigin = 'top left';
  tableEl.style.transform = `scale(${escala})`;
  tableEl.dataset.autoScaledDec = '1';

  scaleBox.style.width = (naturalWidth * escala) + 'px';
  scaleBox.style.height = scaledHeight + 'px';
  // Contorna uma peculiaridade do navegador: um contêiner com overflow ao
  // redor de uma <table> transformada calcula a própria altura com base no
  // tamanho ANTES da escala, sobrando espaço vazio — por isso também
  // fixamos a altura dele aqui.
  outerScroll.style.height = scaledHeight + 'px';
}

function encolherTabelasDecVisiveis(root) {
  if (!root) return;
  root.querySelectorAll('table:not([data-auto-scaled-dec="1"])').forEach(t => {
    if (t.offsetParent !== null) encolherTabelaLargaDec(t);
  });
}

/* Quando uma tabela já encolhida (ver encolherTabelaLargaDec) tem uma linha
   interna aberta/fechada (ex.: o accordion do L3), sua altura real muda,
   mas o wrapper que a envolve ficou com a altura fixa medida antes disso —
   sem este ajuste, o conteúdo novo fica cortado (só é visível no celular,
   que é onde a tabela chega a ser encolhida). */
function ajustarAlturaWrapperEscaladoDec(elDentroDaTabela) {
  const tableEl = elDentroDaTabela && elDentroDaTabela.closest
    ? elDentroDaTabela.closest('table[data-auto-scaled-dec="1"]')
    : null;
  if (!tableEl) return;

  const scaleBox = tableEl.parentElement;
  const outerScroll = scaleBox && scaleBox.parentElement;
  if (!scaleBox || !outerScroll) return;

  const match = /scale\(([^)]+)\)/.exec(tableEl.style.transform);
  const escala = match ? parseFloat(match[1]) : 1;
  const scaledHeight = tableEl.offsetHeight * escala;

  scaleBox.style.height = scaledHeight + 'px';
  outerScroll.style.height = scaledHeight + 'px';
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

  return { activeL1, activeL2, timelineL1, sortedPlanets };
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

// FORMATAÇÃO COM DATA E HORÁRIO EMPILHADOS PARA O L3 (REGÊNCIA DIÁRIA)
function formatDateHoraDec(date) {
  if (!date) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}<br><span style="font-size: 9px; opacity: 0.8; font-weight: 500;">${hh}:${mm}h</span>`;
}

function formatDiasDec(dias) {
  const rounded = Math.round(dias * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

// CÁLCULO DOS SUBPERÍODOS DO L3 (REGÊNCIA DIÁRIA) - mesma lógica recursiva do L1→L2, aplicada mais uma vez
// Dentro do bloco de L2 do planeta P (l2Days dias), subdivide entre os 7 planetas na ordem zodiacal
// da carta, começando por P: diasDeQ = (minorYears de Q / 129) * l2Days (Valens, sem arredondar)
function calcularSubperiodosL3Dec(l2Planet, l2Start, l2Days, sortedPlanets) {
  const l2IndexInSorted = sortedPlanets.findIndex(p => p.id === l2Planet.id);
  const l3PlanetSequence = [];
  for (let k = 0; k < 7; k++) {
    l3PlanetSequence.push(sortedPlanets[(l2IndexInSorted + k) % 7]);
  }

  const subperiodos = [];
  let pointer = new Date(l2Start);

  l3PlanetSequence.forEach(planet => {
    const dias = (planet.minorYears / 129) * l2Days;
    const start = new Date(pointer);
    const end = new Date(start.getTime() + dias * 24 * 60 * 60 * 1000);

    subperiodos.push({
      planet,
      days: dias,
      startDate: start,
      endDate: end
    });

    pointer = new Date(end);
  });

  return subperiodos;
}

function alternarL3AccordionDec(l1Idx, l2Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}`;
  const previousKey = expandedL3KeyDec;

  if (previousKey && previousKey !== key) {
    const prevSubRow = document.getElementById(`dec_l3_row_${previousKey}`);
    const prevMainRow = document.getElementById(`dec_l2_row_${previousKey}`);
    if (prevSubRow) prevSubRow.style.display = 'none';
    if (prevMainRow) prevMainRow.style.backgroundColor = prevMainRow.dataset.bgDefault || '';
    ajustarAlturaWrapperEscaladoDec(prevMainRow);
  }

  const subRow = document.getElementById(`dec_l3_row_${key}`);
  const mainRow = document.getElementById(`dec_l2_row_${key}`);
  if (!subRow || !mainRow) return;

  const willOpen = previousKey !== key;
  expandedL3KeyDec = willOpen ? key : null;

  subRow.style.display = willOpen ? 'table-row' : 'none';
  mainRow.style.backgroundColor = willOpen ? 'var(--bg-selected)' : (mainRow.dataset.bgDefault || '');

  if (willOpen) encolherTabelasDecVisiveis(subRow);
  ajustarAlturaWrapperEscaladoDec(mainRow);
}

// ABRE/FECHA O DETALHE DE UM L1 NA LINHA DO TEMPO (COM A TABELA DE L2 DENTRO)
function alternarDetalhesL1Dec(idx) {
  const el = document.getElementById(`dec_l1_details_${idx}`);
  if (!el) return;
  const willOpen = el.style.display === 'none';
  el.style.display = willOpen ? 'block' : 'none';
  if (willOpen) encolherTabelasDecVisiveis(el);
}

// RENDERIZA A SUB-TABELA DO L3 (ABERTA DENTRO DA CÉLULA COLSPAN DA LINHA DE L2)
function renderL3SubTableDec(l2Obj, sortedPlanets) {
  const subperiodosL3 = calcularSubperiodosL3Dec(l2Obj.planet, l2Obj.startDate, l2Obj.days, sortedPlanets);

  return `
    <div style="padding: 8px 12px; background: var(--bg-hover);">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid var(--primary-blue); border-radius: 6px; overflow: hidden; font-size: 11px; text-align: center; background: var(--bg-card);">
        <thead>
          <tr style="background-color: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
            <th style="padding: 6px;">L3 (Regência Diária)</th>
            <th style="padding: 6px; text-align: left;">Duração</th>
            <th style="padding: 6px; text-align: left;">Início</th>
            <th style="padding: 6px; text-align: left;">Término</th>
          </tr>
        </thead>
        <tbody>
          ${subperiodosL3.map((sub3, i3) => {
            const bgRow = i3 % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)';
            return `
              <tr style="border-bottom: 1px solid var(--table-border-soft); background-color: ${bgRow};">
                <td style="padding: 6px; text-align: center;">${getPlanet3DSVG(sub3.planet.id, 26)}</td>
                <td style="padding: 6px; text-align: left; font-weight: 600; color: var(--primary-blue);">${formatDiasDec(sub3.days)} Dias</td>
                <td style="padding: 6px; text-align: left; color: var(--text-muted-3);">${formatDateHoraDec(sub3.startDate)}</td>
                <td style="padding: 6px; text-align: left; color: var(--text-muted-3);">${formatDateHoraDec(sub3.endDate)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderizarResultadosHTML(res) {
  const { activeL1, activeL2, timelineL1, sortedPlanets } = res;
  if (!activeL1 || !activeL2) {
    return `<div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: 10px; text-align: center; color: var(--text-muted); font-size: 13px;">A idade atual do nativo está fora da janela dos 10 primeiros ciclos de Decênios.</div>`;
  }

  const formatMin = m => String(m || 0).padStart(2, '0');

  return `
    <!-- PERÍODO ATIVO -->
    <div style="background: linear-gradient(145deg, var(--bg-card) 0%, var(--bg-hover) 100%); border: 2px solid var(--table-border); border-radius: 14px; padding: 18px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(29, 95, 168, 0.08);">
      <div style="border-bottom: 1px solid var(--info-border); padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%; display: inline-block;"></span>
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: var(--primary-blue); font-weight: 800; margin: 0; text-transform: uppercase;">Período Ativo</h3>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 14px;">
        <!-- L1 -->
        <div style="flex: 1; min-width: 260px; background: var(--bg-card); border: 1px solid var(--badge-border); border-radius: 10px; padding: 14px;">
          <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: var(--badge-text); text-transform: uppercase;">L1 - Regente da Era</span>
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${getPlanet3DSVG(activeL1.planet.id, 42)}
              <div>
                <div style="font-size: 11px; color: var(--text-muted); margin: 0;">em ${getSignSvgHtmlDec(activeL1.planet.signIdx, 18)} ${activeL1.planet.degree}°${formatMin(activeL1.planet.minute)}'</div>
              </div>
            </div>
            <span style="background: var(--badge-bg); border: 1px solid var(--badge-border); border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--badge-text);">129 Meses</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted-2); border-top: 1px solid var(--table-border-soft); padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do L1:</span><strong>${formatDateDec(activeL1.startDate)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Término do L1:</span><strong>${formatDateDec(activeL1.endDate)}</strong></div>
          </div>
        </div>

        <!-- L2 -->
        <div style="flex: 1; min-width: 260px; background: var(--bg-card); border: 1px solid var(--info-border); border-radius: 10px; padding: 14px;">
          <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: var(--table-border); text-transform: uppercase;">L2 - Executor do Momento</span>
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${getPlanet3DSVG(activeL2.planet.id, 42)}
              <div>
                <div style="font-size: 11px; color: var(--text-muted); margin: 0;">em ${getSignSvgHtmlDec(activeL2.planet.signIdx, 18)} ${activeL2.planet.degree}°${formatMin(activeL2.planet.minute)}'</div>
              </div>
            </div>
            <span style="background: var(--info-bg); border: 1px solid var(--info-border); border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--info-text);">${activeL2.months} Meses</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted-2); border-top: 1px solid var(--table-border-soft); padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do L2:</span><strong>${formatDateDec(activeL2.startDate)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Término do L2:</span><strong>${formatDateDec(activeL2.endDate)}</strong></div>
          </div>
        </div>
      </div>

      <!-- TABELA DA ERA ATIVA -->
      <div style="background: var(--bg-card); border: 1px solid var(--gold-primary); border-radius: 10px; overflow: hidden; margin-top: 14px;">
        <div style="padding: 10px 14px; background: var(--bg-main); border-bottom: 1px solid var(--badge-border); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getPlanet3DSVG(activeL1.planet.id, 28)}
            <strong style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--primary-blue);">L1 ATIVO</strong>
          </div>
          <span style="font-size: 11px; color: var(--text-muted-2);"><strong>${formatDateDec(activeL1.startDate)} a ${formatDateDec(activeL1.endDate)}</strong></span>
        </div>
        <div style="padding: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
            <thead>
              <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                <th style="padding: 10px 12px; text-align: center;">L2 (Subperíodo)</th>
                <th style="padding: 10px 12px; text-align: left;">Duração</th>
                <th style="padding: 10px 12px; text-align: left;">Início</th>
                <th style="padding: 10px 12px; text-align: left;">Término</th>
              </tr>
            </thead>
            <tbody>
              ${activeL1.subperiods.map((sub, sIdx) => {
                const keyL3 = `active_${sIdx}`;
                const defaultBg = sub.isActive ? 'var(--bg-selected)' : 'transparent';
                const borderLeft = sub.isActive ? 'border-left: 4px solid var(--gold-primary);' : '';
                return `
                  <tr id="dec_l2_row_${keyL3}" data-bg-default="${defaultBg}" onclick="alternarL3AccordionDec('active', ${sIdx}, event)" style="border-bottom: 1px solid var(--table-border-soft); background-color: ${defaultBg}; ${borderLeft} cursor: pointer;">
                    <td style="padding: 10px 12px; text-align: center;">${getPlanet3DSVG(sub.planet.id, 32)}</td>
                    <td style="padding: 10px 12px;">${sub.months} Meses (${sub.days} dias)</td>
                    <td style="padding: 10px 12px;">${formatDateDec(sub.startDate)}</td>
                    <td style="padding: 10px 12px;">${formatDateDec(sub.endDate)}</td>
                  </tr>
                  <tr id="dec_l3_row_${keyL3}" style="display: none;">
                    <td colspan="4" style="padding: 0; border-bottom: 1px solid var(--table-border-soft);">
                      ${renderL3SubTableDec(sub, sortedPlanets)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CRONOGRAMA DA LINHA DO TEMPO -->
    <div style="background: linear-gradient(145deg, var(--bg-card) 0%, var(--bg-hover) 100%); border: 2px solid var(--gold-primary); border-radius: 14px; padding: 18px;">
      <div style="border-bottom: 1px solid var(--badge-border); padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: var(--primary-blue); font-weight: 800; margin: 0; text-transform: uppercase;">Linha do Tempo dos Decênios</h3>
        <span style="font-size: 11px; color: var(--text-muted);">Calendário Egípcio = 360 Dias/Ano</span>
      </div>

      <div>
        ${timelineL1.map((l1, idx) => `
          <div style="background: var(--bg-card); border: 1px solid ${l1.isActive ? 'var(--gold-primary)' : 'var(--table-border-soft)'}; border-radius: 10px; margin-bottom: 8px; overflow: hidden;">
            <div style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="alternarDetalhesL1Dec(${idx})">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${getPlanet3DSVG(l1.planet.id, 32)}
                <div>
                  <strong style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--primary-blue);">L1</strong>
                  <div style="font-size: 11px; color: var(--text-muted);">em ${getSignSvgHtmlDec(l1.planet.signIdx, 15)} ${l1.planet.degree}°${formatMin(l1.planet.minute)}' • 129 Meses</div>
                </div>
              </div>
              <strong style="font-size: 11px; color: var(--text-muted-2);">${formatDateDec(l1.startDate)} a ${formatDateDec(l1.endDate)}</strong>
            </div>

            <div id="dec_l1_details_${idx}" style="display: none; border-top: 1px solid var(--table-border-soft); padding: 10px; background: var(--bg-main);">
              <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                <thead>
                  <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                    <th style="padding: 8px 10px; text-align: center;">L2 (Subperíodo)</th>
                    <th style="padding: 8px 10px; text-align: left;">Duração</th>
                    <th style="padding: 8px 10px; text-align: left;">Início</th>
                    <th style="padding: 8px 10px; text-align: left;">Término</th>
                  </tr>
                </thead>
                <tbody>
                  ${l1.subperiods.map((l2, l2Idx) => {
                    const keyL3 = `${idx}_${l2Idx}`;
                    const defaultBg = l2.isActive ? 'var(--bg-selected)' : 'transparent';
                    const borderLeft = l2.isActive ? 'border-left: 4px solid var(--gold-primary);' : '';
                    return `
                      <tr id="dec_l2_row_${keyL3}" data-bg-default="${defaultBg}" onclick="alternarL3AccordionDec(${idx}, ${l2Idx}, event)" style="border-bottom: 1px solid var(--table-border-soft); background-color: ${defaultBg}; ${borderLeft} cursor: pointer;">
                        <td style="padding: 8px 10px; text-align: center;">${getPlanet3DSVG(l2.planet.id, 28)}</td>
                        <td style="padding: 8px 10px;">${l2.months} Meses (${l2.days} dias)</td>
                        <td style="padding: 8px 10px;">${formatDateDec(l2.startDate)}</td>
                        <td style="padding: 8px 10px;">${formatDateDec(l2.endDate)}</td>
                      </tr>
                      <tr id="dec_l3_row_${keyL3}" style="display: none;">
                        <td colspan="4" style="padding: 0; border-bottom: 1px solid var(--table-border-soft);">
                          ${renderL3SubTableDec(l2, sortedPlanets)}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
