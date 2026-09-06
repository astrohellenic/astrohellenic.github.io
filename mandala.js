/* ==========================================
   MÓDULO DE CÁLCULO E DESENHO DA MANDALA
   ========================================== */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* CÁLCULO EXATO DO FUSO BASEADO NA LONGITUDE */
function calcularFusoPorLongitude(lon) {
  if (lon === undefined || lon === null || isNaN(lon)) return -3;
  return Math.round(lon / 15);
}

let selectedCityGeo = { lat: -23.5505, lon: -46.6333, name: "São Paulo, SP" };
let editSelectedCityGeo = null;

/* PONTO SELECIONADO PARA A CASA 1 ('ASC' OU CHAVE DO LOTE) */
let selectedHouse1Lot = "ASC";

/* VARIÁVEL GLOBAL PARA O TIPO DO MAPA ATIVO NO CABEÇALHO */
window.currentMapType = "Natal";

const SIGNS = [
  { name: "Áries", ruler: "Marte" }, { name: "Touro", ruler: "Vênus" }, { name: "Gêmeos", ruler: "Mercúrio" },
  { name: "Câncer", ruler: "Lua" }, { name: "Leão", ruler: "Sol" }, { name: "Virgem", ruler: "Mercúrio" },
  { name: "Libra", ruler: "Vênus" }, { name: "Escorpião", ruler: "Marte" }, { name: "Sagitário", ruler: "Júpiter" },
  { name: "Capricórnio", ruler: "Saturno" }, { name: "Aquário", ruler: "Saturno" }, { name: "Peixes", ruler: "Júpiter" }
];

const SIGN_ELEMENTS = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];

const MONOLINE_ZODIAC_SVGS = [
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

const ELEMENT_SIGN_COLORS = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

const PLANETS_DEF = [
  { id: "Sun", name: "Sol", symbol: "☉", key: "Sol" },
  { id: "Moon", name: "Lua", symbol: "☽", key: "Lua" },
  { id: "Mercury", name: "Mercúrio", symbol: "☿", key: "Mercúrio" },
  { id: "Venus", name: "Vênus", symbol: "♀", key: "Vênus" },
  { id: "Mars", name: "Marte", symbol: "♂", key: "Marte" },
  { id: "Jupiter", name: "Júpiter", symbol: "♃", key: "Júpiter" },
  { id: "Saturn", name: "Saturno", symbol: "♄", key: "Saturno" }
];

/* DEFINIÇÕES VETORIAIS 3D DOS 7 PLANETAS */
const PLANET_3D_SVGS = {
  Sun: `
    <g>
      <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25" filter="blur(2px)"/>
      <circle cx="50" cy="50" r="42" fill="url(#gradSun)" filter="url(#planetDropShadow)"/>
      <ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">☉</text>
    </g>
  `,
  Moon: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradMoon)" filter="url(#planetDropShadow)"/>
      <circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/>
      <circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/>
      <circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/>
      <circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/>
      <ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/>
      <path d="M 40,24 C 62,24 72,36 72,50 C 72,64 62,76 40,76 C 54,69 60,59 60,50 C 60,41 54,31 40,24 Z" 
            fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" filter="url(#glyphShadow)"/>
    </g>
  `,
  Mercury: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradMercury)" filter="url(#planetDropShadow)"/>
      <ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/>
      <circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">☿</text>
    </g>
  `,
  Venus: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradVenus)" filter="url(#planetDropShadow)"/>
      <ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/>
      <circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♀</text>
    </g>
  `,
  Mars: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradMars)" filter="url(#planetDropShadow)"/>
      <ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/>
      <ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/>
      <circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♂</text>
    </g>
  `,
  Jupiter: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradJupiter)" filter="url(#planetDropShadow)"/>
      <g clip-path="url(#jupiterClip)" opacity="0.45">
        <rect x="0" y="24" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" />
        <rect x="0" y="49" width="100" height="11" fill="#783d19" />
        <rect x="0" y="64" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" />
      </g>
      <ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♃</text>
    </g>
  `,
  Saturn: `
    <g>
      <g transform="rotate(-22 50 50)">
        <ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#gradRings)" stroke-width="5.5" opacity="0.95" />
        <ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/>
      </g>
      <circle cx="50" cy="50" r="36" fill="url(#gradSaturn)" filter="url(#planetDropShadow)"/>
      <g transform="rotate(-22 50 50)">
        <path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#gradRings)" stroke-width="5.5" />
        <path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/>
      </g>
      <ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/>
      <text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♄</text>
    </g>
  `
};

const EGYPTIAN_TERMS = [
  [{ p: "♃", deg: 6 }, { p: "♀", deg: 12 }, { p: "☿", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
  [{ p: "♀", deg: 8 }, { p: "☿", deg: 14 }, { p: "♃", deg: 22 }, { p: "♄", deg: 27 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 6 }, { p: "♃", deg: 12 }, { p: "♀", deg: 17 }, { p: "♂", deg: 24 }, { p: "♄", deg: 30 }],
  [{ p: "♂", deg: 7 }, { p: "♀", deg: 13 }, { p: "☿", deg: 19 }, { p: "♃", deg: 26 }, { p: "♄", deg: 30 }],
  [{ p: "♃", deg: 6 }, { p: "♀", deg: 11 }, { p: "♄", deg: 18 }, { p: "☿", deg: 24 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 7 }, { p: "♀", deg: 17 }, { p: "♃", deg: 21 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }],
  [{ p: "♄", deg: 6 }, { p: "☿", deg: 14 }, { p: "♃", deg: 21 }, { p: "♀", deg: 28 }, { p: "♂", deg: 30 }],
  [{ p: "♂", deg: 7 }, { p: "♀", deg: 11 }, { p: "☿", deg: 19 }, { p: "♃", deg: 24 }, { p: "♄", deg: 30 }],
  [{ p: "♃", deg: 12 }, { p: "♀", deg: 17 }, { p: "☿", deg: 21 }, { p: "♄", deg: 26 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 7 }, { p: "♃", deg: 14 }, { p: "♀", deg: 22 }, { p: "♄", deg: 26 }, { p: "♂", deg: 30 }],
  [{ p: "♄", deg: 7 }, { p: "☿", deg: 13 }, { p: "♀", deg: 20 }, { p: "♃", deg: 25 }, { p: "♂", deg: 30 }],
  [{ p: "♀", deg: 12 }, { p: "♃", deg: 16 }, { p: "☿", deg: 19 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }]
];

let currentCalculatedData = null;
let currentMoment = new Date();
let currentGeo = { lat: -23.5505, lon: -46.6333, city: "São Paulo, SP" };
let currentSubjectName = "Agora";
let currentCustomCode = null;
let lastRenderedPngUrl = "";

function formatDegMin(absDeg) {
  const degInSign = absDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutes = Math.round((degInSign - degrees) * 60);
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${degrees}°${minStr}′`;
}

function eclToScreenAngle(eclDeg, refAbs) {
  return (180 - (eclDeg - refAbs) + 36000) % 360;
}

function polarToCart(cx, cy, r, angleDeg) {
  const rad = angleDeg * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
}

function calculateSevenLots(ascAbs, isDay, planetObj) {
  const sun = planetObj.Sun.abs;
  const moon = planetObj.Moon.abs;
  const merc = planetObj.Mercury.abs;
  const ven = planetObj.Venus.abs;
  const mars = planetObj.Mars.abs;
  const jup = planetObj.Jupiter.abs;
  const sat = planetObj.Saturn.abs;

  const fortAbs = (isDay ? (ascAbs + moon - sun) : (ascAbs + sun - moon) + 36000) % 360;
  const spirAbs = (isDay ? (ascAbs + sun - moon) : (ascAbs + moon - sun) + 36000) % 360;
  const erosAbs = (isDay ? (ascAbs + ven - spirAbs) : (ascAbs + spirAbs - ven) + 36000) % 360;
  const necAbs = (isDay ? (ascAbs + fortAbs - merc) : (ascAbs + merc - fortAbs) + 36000) % 360;
  const courAbs = (isDay ? (ascAbs + fortAbs - mars) : (ascAbs + mars - fortAbs) + 36000) % 360;
  const vicAbs = (isDay ? (ascAbs + jup - spirAbs) : (ascAbs + spirAbs - jup) + 36000) % 360;
  const nemAbs = (isDay ? (ascAbs + fortAbs - sat) : (ascAbs + sat - fortAbs) + 36000) % 360;

  return [
    { key: "fortune", label: "FORT", type: "fortune", deg: fortAbs },
    { key: "spirit", label: "ESP", type: "spirit", deg: spirAbs },
    { key: "venus", label: "EROS", type: "venus", sym: "♀", deg: erosAbs },
    { key: "mercury", label: "NEC", type: "mercury", sym: "☿", deg: necAbs },
    { key: "mars", label: "AUD", type: "mars", sym: "♂", deg: courAbs },
    { key: "jupiter", label: "VIT", type: "jupiter", sym: "♃", deg: vicAbs },
    { key: "saturn", label: "NÊM", type: "saturn", sym: "♄", deg: nemAbs }
  ];
}

function aplicarDesvioLateralArco(items, distMinimaGraus = 6.5) {
  if (!items || items.length === 0) return;
  items.sort((a, b) => a.aScreen - b.aScreen);
  items.forEach(it => it.aShift = it.aScreen);

  for (let pass = 0; pass < 12; pass++) {
    for (let i = 0; i < items.length - 1; i++) {
      let atual = items[i];
      let proximo = items[i + 1];
      let diff = proximo.aShift - atual.aShift;
      if (diff < distMinimaGraus) {
        let overlap = (distMinimaGraus - diff) / 2;
        atual.aShift -= overlap;
        proximo.aShift += overlap;
      }
    }
  }
}

function selecionarRegistro(index) {
  if (typeof cachedFolderData !== 'undefined' && cachedFolderData[index]) {
    aplicarDadosDoPerfilNoMapa(cachedFolderData[index]);
  }
}

function aplicarDadosDoPerfilNoMapa(c) {
  const menuHere = document.getElementById('menu-here-now');
  if (menuHere) menuHere.classList.remove('active');

  let ano = 2000, mes = 1, dia = 1;
  if (c.dataNascimento && c.dataNascimento.includes('/')) {
    const partes = c.dataNascimento.split('/');
    if (partes.length === 3) {
      dia = parseInt(partes[0]);
      mes = parseInt(partes[1]);
      ano = parseInt(partes[2]);
    }
  }

  let hora = 12, min = 0;
  if (c.horaNascimento && c.horaNascimento.includes(':')) {
    const partesH = c.horaNascimento.split(':');
    if (partesH.length >= 2) {
      hora = parseInt(partesH[0]);
      min = parseInt(partesH[1]);
    }
  }

  currentSubjectName = c.nome || "Nativo";
  currentCustomCode = c.codigo || null;
  window.currentMapType = c.tipo || "Natal";
  currentMoment = new Date(ano, mes - 1, dia, hora, min);

  const lat = parseFloat(c.latitude) || -23.5505;
  const lon = parseFloat(c.longitude) || -46.6333;
  const fusoCalc = c.fuso !== undefined ? parseFloat(c.fuso) : calcularFusoPorLongitude(lon);
  const cidade = c.cidade || "Localidade não informada";

  currentGeo = { lat, lon, fuso: fusoCalc, city: cidade };
  executarCalculo();
}

function abrirModalNovoMapa() {
  document.getElementById('modalCodigo').value = "";
  document.getElementById('modalNome').value = "";
  document.getElementById('modalData').value = "";
  document.getElementById('modalHora').value = "";
  document.getElementById('modalCidadeInput').value = "";
  document.getElementById('cityResultsList').style.display = "none";
  document.getElementById('modalOverlay').style.display = "flex";
}

function fecharModalNovoMapa() {
  document.getElementById('modalOverlay').style.display = "none";
}

let searchCityTimer = null;
async function pesquisarCidadesAutocomplete(query, containerId, isEdit = false) {
  const listDiv = document.getElementById(containerId);
  if (!query || query.length < 3) {
    listDiv.style.display = "none";
    return;
  }

  clearTimeout(searchCityTimer);
  searchCityTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        let html = '';
        data.forEach(item => {
          const displayName = item.display_name;
          const lat = item.lat;
          const lon = item.lon;
          html += `<div class="city-item" onclick="selecionarCidadeModal('${escapeHtml(displayName)}', ${lat}, ${lon}, '${containerId}', ${isEdit})">${escapeHtml(displayName)}</div>`;
        });
        listDiv.innerHTML = html;
        listDiv.style.display = "block";
      } else {
        listDiv.style.display = "none";
      }
    } catch (e) {
      listDiv.style.display = "none";
    }
  }, 300);
}

function selecionarCidadeModal(nomeFormatado, lat, lon, containerId, isEdit) {
  const fusoCalculado = calcularFusoPorLongitude(parseFloat(lon));
  if (isEdit) {
    editSelectedCityGeo = { lat: parseFloat(lat), lon: parseFloat(lon), fuso: fusoCalculado, name: nomeFormatado };
    document.getElementById('editModalCidadeInput').value = nomeFormatado;
  } else {
    selectedCityGeo = { lat: parseFloat(lat), lon: parseFloat(lon), fuso: fusoCalculado, name: nomeFormatado };
    document.getElementById('modalCidadeInput').value = nomeFormatado;
  }
  document.getElementById(containerId).style.display = "none";
}

function confirmarNovoMapaModal() {
  const codDigitado = document.getElementById('modalCodigo').value.trim();
  const nome = document.getElementById('modalNome').value.trim();
  const dataStr = document.getElementById('modalData').value.trim();
  const horaStr = document.getElementById('modalHora').value.trim();

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr || !dataStr.includes('/')) { alert("Informe a data no formato DD/MM/AAAA."); return; }
  if (!horaStr) { alert("Informe o horário."); return; }

  const partesData = dataStr.split('/');
  if (partesData.length !== 3) { alert("Data inválida."); return; }
  const dia = partesData[0], mes = partesData[1], ano = partesData[2];

  const partesHora = horaStr.split(':');
  const h = partesHora[0] || 12, m = partesHora[1] || 0;

  const fusoReal = selectedCityGeo.fuso !== undefined ? selectedCityGeo.fuso : calcularFusoPorLongitude(selectedCityGeo.lon);

  currentSubjectName = nome;
  currentCustomCode = codDigitado !== "" ? codDigitado : null;
  window.currentMapType = "Natal";
  currentMoment = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), parseInt(h), parseInt(m));
  currentGeo = { lat: selectedCityGeo.lat, lon: selectedCityGeo.lon, fuso: fusoReal, city: selectedCityGeo.name };

  fecharModalNovoMapa();
  executarCalculo();
}

async function obterNomeCidade(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    const data = await res.json();
    const addr = data.address || {};
    const cidade = addr.city || addr.town || addr.village || addr.municipality || "Local Localizado";
    const estado = addr.state ? `, ${addr.state}` : "";
    return `${cidade}${estado}`;
  } catch (e) {
    return "São Paulo, SP";
  }
}

function carregarCeuDoMomento() {
  const menuHere = document.getElementById('menu-here-now');
  if (menuHere) menuHere.classList.add('active');
  currentSubjectName = "Agora";
  currentCustomCode = null;
  window.currentMapType = "Trânsito";
  currentMoment = new Date();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const nomeCidade = await obterNomeCidade(lat, lon);
        currentGeo = { lat, lon, fuso: calcularFusoPorLongitude(lon), city: nomeCidade };
        executarCalculo();
      },
      () => {
        currentGeo = { lat: -23.5505, lon: -46.6333, fuso: -3, city: "São Paulo, SP" };
        executarCalculo();
      },
      { timeout: 4000 }
    );
  } else {
    currentGeo = { lat: -23.5505, lon: -46.6333, fuso: -3, city: "São Paulo, SP" };
    executarCalculo();
  }
}

function ajustarTempo(direcao) {
  const unitEl = document.getElementById('stepUnit');
  const unit = unitEl ? unitEl.value : 'day';

  switch(unit) {
    case 'second': currentMoment.setSeconds(currentMoment.getSeconds() + amount); break;
    case 'minute': currentMoment.setMinutes(currentMoment.getMinutes() + amount); break;
    case 'hour': currentMoment.setHours(currentMoment.getHours() + amount); break;
    case 'day': currentMoment.setDate(currentMoment.getDate() + amount); break;
    case 'month': currentMoment.setMonth(currentMoment.getMonth() + amount); break;
    case 'year': currentMoment.setFullYear(currentMoment.getFullYear() + amount); break;
  }

  executarCalculo();
}

async function executarCalculo() {
  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const dataStr = `${ano}-${mes}-${dia}`;

  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');
  const horaStr = `${hora}:${min}`;

  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);

  try {
    const urlApi = `https://motor-astrologia.vercel.app/api/index?data=${dataStr}&hora=${horaStr}&fuso=${fusoVal}&lat=${currentGeo.lat}&lon=${currentGeo.lon}`;
    const res = await fetch(urlApi);
    if (!res.ok) throw new Error("Erro na API");

    const apiJson = await res.json();

    const SIGNOS_INDEX = {
      "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
      "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
      "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
    };

    const planetas = apiJson.planetas || {};
    const ascData = apiJson.ascendente || {};
    const mcData = apiJson.meio_ceu || {};
    const sizigiaData = apiJson.sizigia || {};

    const ascAbs = ((SIGNOS_INDEX[ascData.signo] || 0) * 30) + (parseFloat(ascData.grau) || 0);
    const mcAbs = ((SIGNOS_INDEX[mcData.signo] || 0) * 30) + (parseFloat(mcData.grau) || 0);

    const checkRetro = (pObj) => {
      if (!pObj) return false;
      if (pObj.retrogrado !== undefined) return Boolean(pObj.retrogrado);
      if (pObj.velocidade !== undefined) return parseFloat(pObj.velocidade) < 0;
      return false;
    };

    currentCalculatedData = {
      Ascendente: { grau_absoluto: ascAbs },
      MC: { grau_absoluto: mcAbs },
      Nodo_Norte: { grau_absoluto: planetas.NodoNorte ? planetas.NodoNorte.grau_absoluto : 0, retro: checkRetro(planetas.NodoNorte) },
      Sizigia: { grau_absoluto: sizigiaData.grau_absoluto !== undefined ? parseFloat(sizigiaData.grau_absoluto) : 0 },
      Sol: { grau_absoluto: planetas.Sol ? planetas.Sol.grau_absoluto : 0, retro: false },
      Lua: { grau_absoluto: planetas.Lua ? planetas.Lua.grau_absoluto : 0, retro: false },
      Mercúrio: { grau_absoluto: planetas.Mercurio ? planetas.Mercurio.grau_absoluto : 0, retro: checkRetro(planetas.Mercurio) },
      Vênus: { grau_absoluto: planetas.Venus ? planetas.Venus.grau_absoluto : 0, retro: checkRetro(planetas.Venus) },
      Marte: { grau_absoluto: planetas.Marte ? planetas.Marte.grau_absoluto : 0, retro: checkRetro(planetas.Marte) },
      Júpiter: { grau_absoluto: planetas.Jupiter ? planetas.Jupiter.grau_absoluto : 0, retro: checkRetro(planetas.Jupiter) },
      Saturno: { grau_absoluto: planetas.Saturno ? planetas.Saturno.grau_absoluto : 0, retro: checkRetro(planetas.Saturno) }
    };

    renderMandala();

  } catch (err) {
    document.getElementById('mandala-container').innerHTML = `<p style="color: #dc2626;">Erro ao calcular posições.</p>`;
  }
}

/* Injetar botão no cabeçalio */
function injetarBotaoRotacaoNaBarraSuperior() {
    const parentContainer = document.querySelector('.nav-bar') || document.querySelector('.top-bar') || document.getElementById('mandala-container');
  if (!parentContainer || document.getElementById('wrapper-botoes-topo')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'wrapper-botoes-topo';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '8px';

  wrapper.innerHTML = `
    <!-- BOTÃO DO ASC / LOTES (PARA DENTRO) -->
    <button class="icon-btn" id="btn-rotacao-asc" onclick="rotacionarCasasASC()" title="Rotacionar por ASC/Lote">
      <i class="fa-solid fa-arrows-rotate"></i>
    </button>

    <!-- STEPPER (NO CANTO MAIS EXTERNO À DIREITA) -->
    <div class="time-stepper">
      <button class="icon-btn" onclick="ajustarTempo(-1)"><i class="fa-solid fa-backward-step"></i></button>
      <select id="stepUnit" class="time-select">
        <option value="second">Segundo</option>
        <option value="minute">Minuto</option>
        <option value="hour">Hora</option>
        <option value="day" selected>Dia</option>
        <option value="month">Mês</option>
        <option value="year">Ano</option>
      </select>
      <button class="icon-btn" onclick="ajustarTempo(1)"><i class="fa-solid fa-forward-step"></i></button>
    </div>
  `;

  parentContainer.appendChild(wrapper);
}

  const syms = {
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄'
  };

  let iconContent = '';
  if (selectedHouse1Lot === 'ASC') {
    iconContent = `<span style="font-size: 11px; font-weight: 800; color: #103b70;">ASC</span>`;
  } else if (selectedHouse1Lot === 'fortune') {
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#000000" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#000000" stroke-width="1.5"/></svg>`;
  } else if (selectedHouse1Lot === 'spirit') {
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><text x="0" y="5" font-size="18" font-weight="400" font-family="'Montserrat', sans-serif" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="2" paint-order="stroke fill">Φ</text></svg>`;
  } else {
    const symbol = syms[selectedHouse1Lot] || '';
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">${symbol}</text></svg>`;
  }

    btnContainer.innerHTML = `
    <div style="position: relative; display: inline-block;">
      <button type="button" onclick="const menu=document.getElementById('lotMenuList'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: 32px; height: 32px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Mudar Casa 1 (Lotes)">
        ${iconContent}
      </button>
      <div id="lotMenuList" style="display: none; position: absolute; top: 36px; left: 0; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 32px; box-sizing: border-box;">
        <div onclick="alternarRotacaoCasa1('ASC')" style="padding: 6px 0; cursor: pointer; text-align: center; font-size: 11px; font-weight: 800; color: #103b70;">ASC</div>
        <div onclick="alternarRotacaoCasa1('fortune')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#000000" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#000000" stroke-width="1.5"/></svg></div>
        <div onclick="alternarRotacaoCasa1('spirit')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><text x="0" y="5" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="2" paint-order="stroke fill">Φ</text></svg></div>
        <div onclick="alternarRotacaoCasa1('mercury')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">☿</text></svg></div>
        <div onclick="alternarRotacaoCasa1('venus')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">♀</text></svg></div>
        <div onclick="alternarRotacaoCasa1('mars')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">♂</text></svg></div>
        <div onclick="alternarRotacaoCasa1('jupiter')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">♃</text></svg></div>
        <div onclick="alternarRotacaoCasa1('saturn')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">♄</text></svg></div>
      </div>
    </div>
  `;
}

function alternarRotacaoCasa1(val) {
  selectedHouse1Lot = val;
  renderMandala();
}

function renderMandala(dadosNovos) {
  injetarBotaoRotacaoNaBarraSuperior();

  if (dadosNovos) currentCalculatedData = dadosNovos;
  const container = document.getElementById('mandala-container');
  if (!container || !currentCalculatedData) return;

  const data = currentCalculatedData;
  const ascAbs = data.Ascendente.grau_absoluto;
  const mcAbs = data.MC ? data.MC.grau_absoluto : (ascAbs + 270) % 360;
  const nodeAbs = data.Nodo_Norte ? data.Nodo_Norte.grau_absoluto : 0;
  const syzAbs = data.Sizigia ? data.Sizigia.grau_absoluto : 0;

  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0, symbol: p.symbol, name: p.name, retro: item ? Boolean(item.retro) : false };
  });

  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  const sectText = isDay ? "• Natividade Diurna" : "• Natividade Noturna";

  const lotes = calculateSevenLots(ascAbs, isDay, pObj);

  let house1RefAbs = ascAbs;
  if (selectedHouse1Lot !== "ASC") {
    const targetLot = lotes.find(l => l.key === selectedHouse1Lot);
    if (targetLot) house1RefAbs = targetLot.deg;
  }

  const diasSemanaMap = [
    { text: "Dom", sym: "☉" },
    { text: "Seg", sym: "☽" },
    { text: "Ter", sym: "♂" },
    { text: "Qua", sym: "☿" },
    { text: "Qui", sym: "♃" },
    { text: "Sex", sym: "♀" },
    { text: "Sáb", sym: "♄" }
  ];
  const dayInfo = diasSemanaMap[currentMoment.getDay()];
  const diaSemanaFormatted = `${dayInfo.text} ${dayInfo.sym}`;

  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const width = 960, height = 960, cx = 480, cy = 440;
  const R = { Aspects: 110, SignSector: 215, Dodec: 238, Termos: 262 };
  const R_OuterLine = 399;
  const goldColor = "#c59b27";

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Sombra projetada do Glifo central -->
      <filter id="glyphShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.85" />
      </filter>

      <!-- Sombra suave da esfera inteira -->
      <filter id="planetDropShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.25" />
      </filter>

      <!-- SOL -->
      <radialGradient id="gradSun" cx="35%" cy="32%" r="68%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="25%" stop-color="#fde047" />
        <stop offset="60%" stop-color="#f59e0b" />
        <stop offset="88%" stop-color="#d97706" />
        <stop offset="100%" stop-color="#92400e" />
      </radialGradient>

      <!-- LUA -->
      <radialGradient id="gradMoon" cx="32%" cy="28%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="30%" stop-color="#e2e8f0" />
        <stop offset="65%" stop-color="#94a3b8" />
        <stop offset="90%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </radialGradient>

      <!-- MERCÚRIO -->
      <radialGradient id="gradMercury" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="28%" stop-color="#d97706" />
        <stop offset="65%" stop-color="#92400e" />
        <stop offset="92%" stop-color="#451a03" />
        <stop offset="100%" stop-color="#270e02" />
      </radialGradient>

      <!-- VÊNUS -->
      <radialGradient id="gradVenus" cx="34%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="30%" stop-color="#fef3c7" />
        <stop offset="65%" stop-color="#f59e0b" />
        <stop offset="90%" stop-color="#b45309" />
        <stop offset="100%" stop-color="#78350f" />
      </radialGradient>

      <!-- MARTE -->
      <radialGradient id="gradMars" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#fca5a5" />
        <stop offset="25%" stop-color="#ef4444" />
        <stop offset="60%" stop-color="#b91c1c" />
        <stop offset="88%" stop-color="#7f1d1d" />
        <stop offset="100%" stop-color="#450a0a" />
      </radialGradient>

      <!-- JÚPITER -->
      <radialGradient id="gradJupiter" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="30%" stop-color="#fef3c7" />
        <stop offset="58%" stop-color="#d4a373" />
        <stop offset="82%" stop-color="#a97142" />
        <stop offset="100%" stop-color="#6f4518" />
      </radialGradient>

      <!-- SATURNO -->
      <radialGradient id="gradSaturn" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#fef9c3" />
        <stop offset="35%" stop-color="#fde047" />
        <stop offset="70%" stop-color="#ca8a04" />
        <stop offset="92%" stop-color="#854d0e" />
        <stop offset="100%" stop-color="#422006" />
      </radialGradient>

      <!-- Anel de Saturno (Prateado / Cinza Metálico) -->
      <linearGradient id="gradRings" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" />
        <stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" />
        <stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" />
        <stop offset="85%" stop-color="#64748b" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#334155" stop-opacity="0.95" />
      </linearGradient>

      <!-- Máscara das faixas de Júpiter -->
      <clipPath id="jupiterClip">
        <circle cx="50" cy="50" r="42" />
      </clipPath>
    </defs>

    <rect width="${width}" height="${height}" fill="#ffffff"/>`;

  const headerTitle = currentCustomCode ? `${currentCustomCode} ${currentSubjectName}` : currentSubjectName;

  const tipoAtual = (typeof window.currentMapType !== 'undefined' && window.currentMapType) ? window.currentMapType : 'Natal';
  const tipoFormatado = tipoAtual === 'Natal' ? 'Mapa Natal' : `Mapa de ${tipoAtual}`;

  /* CARD DO CABEÇALHO LARGO COM ESPAÇO VAZIO À DIREITA PARA OS BOTÕES */
  svg += `<g id="png-discreet-header">
    <!-- Fundo Creme e Borda Dourada Estendidos quase até o fim -->
    <rect x="15" y="865" width="930" height="75" rx="10" ry="10" fill="#fffdf5" stroke="#c59b27" stroke-width="2" />
    
    <!-- Textos das 3 Linhas alinhados à esquerda -->
    <text x="30" y="888" font-family="'Cinzel', serif" font-size="20" font-weight="800" fill="#103b70">${escapeHtml(headerTitle)}</text>
    <text x="30" y="906" font-family="'Montserrat', sans-serif" font-size="12" font-weight="500" fill="#475569">${diaSemanaFormatted} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted}) • ${escapeHtml(currentGeo.city)}</text>
    <text x="30" y="922" font-family="'Montserrat', sans-serif" font-size="11" font-weight="600" fill="#64748b">Zodíaco Tropical • Signos Inteiros • ${escapeHtml(tipoFormatado)} <tspan fill="#9a6d18" font-weight="700">  ${sectText}</tspan></text>
  </g>`;

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Aspects}" fill="#ffffff" stroke="${goldColor}" stroke-width="2"/>`;

  const occupiedSigns = new Set();
  PLANETS_DEF.forEach(p => { occupiedSigns.add(Math.floor(pObj[p.id].abs / 30)); });
  const occupiedArray = Array.from(occupiedSigns);
  for (let i = 0; i < occupiedArray.length; i++) {
    for (let j = i + 1; j < occupiedArray.length; j++) {
      let diff = Math.abs(occupiedArray[i] - occupiedArray[j]);
      if (diff > 6) diff = 12 - diff;
      let col = null;
      if (diff === 6) col = "#8b0000";
      else if (diff === 4) col = "#0b2545";
      else if (diff === 3) col = "#dc2626";
      else if (diff === 2) col = "#2563eb";

      if (col) {
        const pt1 = polarToCart(cx, cy, R.Aspects - 4, eclToScreenAngle(occupiedArray[i] * 30 + 15, house1RefAbs));
        const pt2 = polarToCart(cx, cy, R.Aspects - 4, eclToScreenAngle(occupiedArray[j] * 30 + 15, house1RefAbs));
        svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${col}" stroke-width="1.8" opacity="0.9"/>`;
      }
    }
  }

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.SignSector}" fill="none" stroke="${goldColor}" stroke-width="2"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Dodec}" fill="none" stroke="${goldColor}" stroke-width="1.5"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Termos}" fill="none" stroke="${goldColor}" stroke-width="2"/>`;

  const ascPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(ascAbs, house1RefAbs));
  const dscPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(ascAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${ascPt.x}" y1="${ascPt.y}" x2="${dscPt.x}" y2="${dscPt.y}" stroke="#000000" stroke-width="2.5"/>`;

  const mcPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(mcAbs, house1RefAbs));
  const icPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(mcAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${mcPt.x}" y1="${mcPt.y}" x2="${icPt.x}" y2="${icPt.y}" stroke="#000000" stroke-width="2.5"/>`;

  for (let i = 0; i < 12; i++) {
    const pt1 = polarToCart(cx, cy, R.Aspects, eclToScreenAngle(i * 30, house1RefAbs));
    const pt2 = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(i * 30, house1RefAbs));
    svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.8"/>`;
  }

  const refSignIdx = Math.floor(house1RefAbs / 30);
  for (let i = 0; i < 12; i++) {
    const aMid = eclToScreenAngle((i * 30) + 15, house1RefAbs);
    const pNum = polarToCart(cx, cy, 122, aMid);
    svg += `<text x="${pNum.x}" y="${pNum.y + 5}" font-family="'Cinzel', serif" font-size="15" font-weight="bold" fill="#aa820a" text-anchor="middle" stroke="#ffffff" stroke-width="4" paint-order="stroke fill">${((i - refSignIdx + 12) % 12) + 1}</text>`;

    const pSym = polarToCart(cx, cy, 166, aMid);
    svg += `<svg x="${pSym.x - 17}" y="${pSym.y - 17}" width="34" height="34" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[i]]};">${MONOLINE_ZODIAC_SVGS[i]}</svg>`;
  }

  for (let i = 0; i < 12; i++) {
    for (let d = 0; d < 12; d++) {
      const pt1 = polarToCart(cx, cy, R.SignSector, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
      const pt2 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
      svg += `<line x1="${pt1.x}" x2="${pt2.x}" y1="${pt1.y}" y2="${pt2.y}" stroke="rgba(170,130,10,0.3)" stroke-width="0.8"/>`;
      const pDod = polarToCart(cx, cy, (R.SignSector + R.Dodec) / 2, eclToScreenAngle((i * 30) + (d * 2.5) + 1.25, house1RefAbs));
      svg += `<svg x="${pDod.x - 5.5}" y="${pDod.y - 5.5}" width="11" height="11" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[(i + d) % 12]]};">${MONOLINE_ZODIAC_SVGS[(i + d) % 12]}</svg>`;
    }
  }

  for (let s = 0; s < 12; s++) {
    let prev = 0;
    EGYPTIAN_TERMS[s].forEach(term => {
      const pt1 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((s * 30) + prev, house1RefAbs));
      const pt2 = polarToCart(cx, cy, R.Termos, eclToScreenAngle((s * 30) + prev, house1RefAbs));
      svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.2"/>`;
      const pTerm = polarToCart(cx, cy, (R.Dodec + R.Termos) / 2, eclToScreenAngle((s * 30) + (prev + term.deg) / 2, house1RefAbs));
      svg += `<text x="${pTerm.x}" y="${pTerm.y + 4}" font-size="10" font-weight="bold" fill="#c59b27" text-anchor="middle">${term.p}</text>`;
      prev = term.deg;
    });
  }

  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 12 : ((deg % 5 === 0) ? 8 : 4);
    const p1 = polarToCart(cx, cy, R.Termos, aScreen);
    const p2 = polarToCart(cx, cy, R.Termos - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.5 : 0.8}"/>`;
  }
   
  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 10 : ((deg % 5 === 0) ? 6 : 3);
    const p1 = polarToCart(cx, cy, R.SignSector, aScreen);
    const p2 = polarToCart(cx, cy, R.SignSector - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.2 : 0.6}"/>`;
  }

  /* UNIFICANDO TODOS OS ITENS DA ÓRBITA EXTERNA (Planetas + Eixos + Nodos + Sizígia + Lotes) */
  const outerRingItems = [];

  /* 1. Adiciona os 7 Planetas */
  PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    const absDeg = item ? item.grau_absoluto : 0;
    outerRingItems.push({
      type: "planet",
      id: p.id,
      symbol: p.symbol,
      deg: absDeg,
      retro: item ? Boolean(item.retro) : false,
      aScreen: eclToScreenAngle(absDeg, house1RefAbs)
    });
  });

  /* 2. Adiciona os Ângulos */
  outerRingItems.push({ type: "axis", label: "ASC", deg: ascAbs, color: "#000000", aScreen: eclToScreenAngle(ascAbs, house1RefAbs) });
  outerRingItems.push({ type: "axis", label: "DSC", deg: (ascAbs + 180) % 360, color: "#000000", aScreen: eclToScreenAngle((ascAbs + 180) % 360, house1RefAbs) });
  outerRingItems.push({ type: "axis", label: "MC", deg: mcAbs, color: "#000000", aScreen: eclToScreenAngle(mcAbs, house1RefAbs) });
  outerRingItems.push({ type: "axis", label: "IC", deg: (mcAbs + 180) % 360, color: "#000000", aScreen: eclToScreenAngle((mcAbs + 180) % 360, house1RefAbs) });

  /* 3. Adiciona Nodos */
  if (nodeAbs > 0) {
    outerRingItems.push({ type: "node", label: "☊", deg: nodeAbs, color: "#000000", aScreen: eclToScreenAngle(nodeAbs, house1RefAbs) });
    outerRingItems.push({ type: "node", label: "☋", deg: (nodeAbs + 180) % 360, color: "#000000", aScreen: eclToScreenAngle((nodeAbs + 180) % 360, house1RefAbs) });
  }

  /* 4. Adiciona Sizígia */
  if (syzAbs > 0) {
    outerRingItems.push({ type: "syzygy", label: "SIZ", deg: syzAbs, color: "#000000", aScreen: eclToScreenAngle(syzAbs, house1RefAbs) });
  }

  /* 5. Adiciona os 7 Lotes */
  lotes.forEach(lot => {
    outerRingItems.push({
      type: "lot",
      label: lot.label,
      lotType: lot.type,
      sym: lot.sym,
      deg: lot.deg,
      color: goldColor,
      aScreen: eclToScreenAngle(lot.deg, house1RefAbs)
    });
  });

  /* APLICA O DESVIO LATERAL GLOBAL PARA EVITAR QUALQUER SOBREPOSIÇÃO NA BORDA */
  aplicarDesvioLateralArco(outerRingItems, 7.5);

  const pR = 300;

  /* RENDERIZAÇÃO DE TODOS OS ITENS NA ÓRBITA EXTERNA */
  outerRingItems.forEach(item => {
    const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
    const p2 = polarToCart(cx, cy, pR - 19, item.aShift);
    const lineColor = item.type === 'planet' ? "#94a3b8" : item.color;
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${lineColor}" stroke-width="1.2"/>`;

    const pPos = polarToCart(cx, cy, pR, item.aShift);

    if (item.type === "planet") {
      const planetSvgContent = PLANET_3D_SVGS[item.id] || '';
      let retroSymbol = item.retro ? `<tspan fill="#dc2626" font-weight="900"> ℞</tspan>` : '';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
        <text x="0" y="27" font-size="10.5" font-weight="800" fill="#0f172a" text-anchor="middle" stroke="#ffffff" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
      </g>`;
    } else if (item.type === "axis") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="${item.color}" stroke-width="1.8"/>
        <text x="0" y="3.5" font-size="9" font-weight="900" fill="${item.color}" text-anchor="middle">${item.label}</text>
        <text x="0" y="19" font-size="8" font-weight="bold" fill="#0f172a" text-anchor="middle" stroke="#ffffff" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "node") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <text x="0" y="5" font-size="24" font-weight="bold" fill="${item.color}" text-anchor="middle" stroke="#ffffff" stroke-width="4" paint-order="stroke fill">${item.label}</text>
        <text x="0" y="19" font-size="8" font-weight="bold" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "syzygy") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="none"/>
        <circle cx="0" cy="0" r="10" stroke="${item.color}" stroke-width="1.8" fill="none"/>
        <path d="M 0 -10 A 10 10 0 0 1 0 10 Q 3.8 -3.8 -3.8 -10 Z" fill="${item.color}"/>
        <circle cx="0" cy="0" r="2.3" fill="${item.color}"/>
        <text x="0" y="21" font-size="8" font-weight="bold" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "lot") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">`;
      if (item.lotType === "fortune") {
        svg += `<circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#000000" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#000000" stroke-width="1.5"/>`;
      } else if (item.lotType === "spirit") {
        svg += `<text x="0" y="5" font-size="34" font-weight="400" font-family="'Montserrat', sans-serif" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="2" paint-order="stroke fill">Φ</text>`;
      } else {
        svg += `<circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">${item.sym}</text>`;
      }
      svg += `<text x="0" y="17" font-size="8" font-weight="bold" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text></g>`;
    }
  });

  svg += `</svg>`;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(svgBlob);

  const imgLoader = new Image();
  imgLoader.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1920, 1920);
ctx.drawImage(imgLoader, 0, 0, 1920, 1920);

       lastRenderedPngUrl = canvas.toDataURL('image/png');

     container.innerHTML = `
  <div style="width: 100%; height: calc(100vh - 70px); display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; position: relative;">
    <img src="${lastRenderedPngUrl}" alt="Mandala Astrológica" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;">
  </div>
`;
     
    URL.revokeObjectURL(blobURL);     

           try {
      // Localiza o container da mandala
      const mandalaElem = document.getElementById('mandala-container');
      
      // Procura o container da tabela técnica
      let painelElem = document.getElementById('painel-tecnico-container');
      
      // Se não existir, cria o container LOGO ABAIXO da mandala
            if (!painelElem) {
        painelElem = document.createElement('div');
        painelElem.id = 'painel-tecnico-container';
        if (mandalaElem) {
          mandalaElem.appendChild(painelElem);
        }
      }

      // Garante que a rolagem da página não seja bloqueada por CSS
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";

      if (painelElem) {
        painelElem.innerHTML = '';
      }
    } catch (err) {
      console.error("Erro ao renderizar painel técnico:", err);
    }
  };
  imgLoader.src = blobURL;
}

function salvarImagemMandala() {
  if (!lastRenderedPngUrl) return;
  const link = document.createElement('a');
  link.download = `Astro_Hellenic_${currentSubjectName.replace(/\s+/g, '_')}.png`;
  link.href = lastRenderedPngUrl;
  link.click();
}

window.onload = function() {
  if (typeof carregarPastasSalvas === 'function') {
    try { carregarPastasSalvas(); } catch(e) { console.error(e); }
  }
  carregarCeuDoMomento();
  if (typeof carregarConteudoPastaAtual === 'function') {
    try { carregarConteudoPastaAtual(); } catch(e) { console.error(e); }
  }
};

/* CONTROLE DE ALTERNÂNCIA (MANDALA / TABELA TÉCNICA) */
window.currentViewMode = "mandala";

function alternarVisaoMapaTabela() {
  const containerMandala = document.getElementById('mandala-container');
  const containerTabela = document.getElementById('painel-tecnico-container');
  const btn = document.getElementById('btnToggleVisao');

  if (window.currentViewMode === "mandala") {
    window.currentViewMode = "tabela";
    
    // Esconde a mandala
    if (containerMandala) containerMandala.style.display = "none";
    
    // Exibe a tabela e força a renderização
    if (containerTabela) {
      containerTabela.style.display = "block";
      if (typeof renderPainelTecnico === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) {
        renderPainelTecnico(currentCalculatedData, 'painel-tecnico-container');
      }
    }
    
    // Altera o ícone do botão para a Mandala (sem texto)
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-chart-pie"></i>`;
      btn.title = "Alternar para Mandala";
    }

  } else {
    window.currentViewMode = "mandala";
    
    // Esconde a tabela e exibe a mandala
    if (containerTabela) containerTabela.style.display = "none";
    if (containerMandala) containerMandala.style.display = "block";
    
    // Altera o ícone do botão para a Tabela (sem texto)
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-table-list"></i>`;
      btn.title = "Alternar para Tabela Técnica";
    }
  }
}
