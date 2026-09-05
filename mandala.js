/* ==========================================
   MÓDULO DA TABELA TÉCNICA E MATRIZ DE VISIBILIDADE
   ========================================== */

const MONOLINE_ZODIAC_SVGS_TABELA = [
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

const SIGN_COLORS_TABELA = ["#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8", "#e84118", "#8b4513", "#0ea5e9", "#1d4ed8"];

const EGYPTIAN_TERMS_TABELA = [
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

function getSignSVG(signIndex, size = 20) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${SIGN_COLORS_TABELA[signIndex]}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_TABELA[signIndex]}</svg>`;
}

function getPlanet3DSVG(planetId) {
  const planetSVGs = {
    Sun: `<svg width="34" height="34" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineSun" cx="35%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="25%" stop-color="#fde047" />
          <stop offset="60%" stop-color="#f59e0b" />
          <stop offset="88%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#92400e" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25"/>
      <circle cx="50" cy="50" r="42" fill="url(#inlineSun)"/>
      <ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☉</text>
    </svg>`,

    Moon: `<svg width="34" height="34" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineMoon" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#e2e8f0" />
          <stop offset="65%" stop-color="#94a3b8" />
          <stop offset="90%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1e293b" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineMoon)"/>
      <circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/>
      <circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/>
      <circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/>
      <circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/>
      <ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☽</text>
    </svg>`,

    Mercury: `<svg width="34" height="34" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineMerc" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="28%" stop-color="#d97706" />
          <stop offset="65%" stop-color="#92400e" />
          <stop offset="92%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#270e02" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineMerc)"/>
      <ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/>
      <circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☿</text>
    </svg>`,

    Venus: `<svg width="34" height="34" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineVen" cx="34%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#fef3c7" />
          <stop offset="65%" stop-color="#f59e0b" />
          <stop offset="90%" stop-color="#b45309" />
          <stop offset="100%" stop-color="#78350f" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineVen)"/>
      <ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/>
      <circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♀</text>
    </svg>`,

    Mars: `<svg width="34" height="34" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineMars" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fca5a5" />
          <stop offset="25%" stop-color="#ef4444" />
          <stop offset="60%" stop-color="#b91c1c" />
          <stop offset="88%" stop-color="#7f1d1d" />
          <stop offset="100%" stop-color="#450a0a" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineMars)"/>
      <ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/>
      <ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/>
      <circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♂</text>
    </svg>`,

    Jupiter: `<svg width="34" height="34" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineJup" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="30%" stop-color="#fef3c7" />
          <stop offset="58%" stop-color="#d4a373" />
          <stop offset="82%" stop-color="#a97142" />
          <stop offset="100%" stop-color="#6f4518" />
        </radialGradient>
        <clipPath id="clipJup">
          <circle cx="50" cy="50" r="42" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineJup)"/>
      <g clip-path="url(#clipJup)" opacity="0.45">
        <rect x="0" y="24" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" />
        <rect x="0" y="49" width="100" height="11" fill="#783d19" />
        <rect x="0" y="64" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" />
      </g>
      <ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♃</text>
    </svg>`,

    Saturn: `<svg width="38" height="34" viewBox="-15 0 130 100" style="display: block; margin: 0 auto;">
      <defs>
        <radialGradient id="inlineSat" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="35%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#ca8a04" />
          <stop offset="92%" stop-color="#854d0e" />
          <stop offset="100%" stop-color="#422006" />
        </radialGradient>
        <linearGradient id="inlineRings" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" />
          <stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" />
          <stop offset="85%" stop-color="#64748b" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#334155" stop-opacity="0.95" />
        </linearGradient>
      </defs>
      <g transform="rotate(-22 50 50)">
        <ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#inlineRings)" stroke-width="5.5" opacity="0.95" />
        <ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/>
      </g>
      <circle cx="50" cy="50" r="36" fill="url(#inlineSat)"/>
      <g transform="rotate(-22 50 50)">
        <path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#inlineRings)" stroke-width="5.5" />
        <path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/>
      </g>
      <ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/>
      <text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♄</text>
    </svg>`
  };
  return planetSVGs[planetId] || '';
}

function getItemSVG(key) {
  const itemSVGs = {
    'fortune': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#103b70" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#103b70" stroke-width="1.5"/></svg>`,
    'spirit': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><text x="0" y="5" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="#103b70" text-anchor="middle" stroke="#fffdf5" stroke-width="2" paint-order="stroke fill">Φ</text></svg>`,
    'venus': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♀</text></svg>`,
    'mercury': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">☿</text></svg>`,
    'mars': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♂</text></svg>`,
    'jupiter': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♃</text></svg>`,
    'saturn': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♄</text></svg>`,
    'Nodo Norte': `<span style="font-size: 16px; font-weight: bold; color: #103b70;">☊</span>`,
    'Nodo Sul': `<span style="font-size: 16px; font-weight: bold; color: #103b70;">☋</span>`,
    'Sizígia': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" stroke="#103b70" stroke-width="1.8" fill="none"/><path d="M 0 -10 A 10 10 0 0 1 0 10 Q 3.8 -3.8 -3.8 -10 Z" fill="#103b70"/><circle cx="0" cy="0" r="2.3" fill="#103b70"/></svg>`,
    'ASC': `<span style="font-size: 11px; font-weight: 900; color: #103b70;">ASC</span>`,
    'DSC': `<span style="font-size: 11px; font-weight: 900; color: #103b70;">DSC</span>`,
    'MC': `<span style="font-size: 11px; font-weight: 900; color: #103b70;">MC</span>`,
    'IC': `<span style="font-size: 11px; font-weight: 900; color: #103b70;">IC</span>`
  };
  return itemSVGs[key] || `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
}

function formatDegMinTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return '-';
  const degInSign = absDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutes = Math.round((degInSign - degrees) * 60);
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${degrees}°${minStr}′`;
}

function calcEgyptianTermTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return '-';
  const signIdx = Math.floor(absDeg / 30);
  const degInSign = absDeg % 30;
  const signTerms = EGYPTIAN_TERMS_TABELA[signIdx];
  if (!signTerms) return '-';
  for (let t of signTerms) {
    if (degInSign < t.deg) return t.p;
  }
  return '-';
}

function calcDodecatemoriaTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return { signIdx: -1, degFormatted: '-' };
  const signIdxInicial = Math.floor(absDeg / 30);
  const degInSign = absDeg % 30;
  const projecaoGraus = degInSign * 12;
  const dodecAbs = ((signIdxInicial * 30) + projecaoGraus) % 360;
  return {
    signIdx: Math.floor(dodecAbs / 30),
    degFormatted: formatDegMinTabela(dodecAbs)
  };
}

/* RENDERIZADOR DA MATRIZ DE VISIBILIDADE (THEORIA) */
function renderMatrizVisibilidadeHTML(data) {
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const mcAbs = data.MC ? data.MC.grau_absoluto : (ascAbs + 270) % 360;
  const dscAbs = (ascAbs + 180) % 360;
  const icAbs = (mcAbs + 180) % 360;
  const nodeAbs = data.Nodo_Norte ? data.Nodo_Norte.grau_absoluto : 0;
  const syzAbs = data.Sizigia ? data.Sizigia.grau_absoluto : 0;

  const pObj = {};
  const mapKeys = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };
  ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach(id => {
    const item = data[mapKeys[id]];
    pObj[id] = item ? item.grau_absoluto : 0;
  });

  const isDay = ((pObj.Sun - ascAbs + 360) % 360) >= 180;
  const sun = pObj.Sun, moon = pObj.Moon, merc = pObj.Mercury, ven = pObj.Venus, mars = pObj.Mars, jup = pObj.Jupiter, sat = pObj.Saturn;

  const fortAbs = (isDay ? (ascAbs + moon - sun) : (ascAbs + sun - moon) + 36000) % 360;
  const spirAbs = (isDay ? (ascAbs + sun - moon) : (ascAbs + moon - sun) + 36000) % 360;
  const erosAbs = (isDay ? (ascAbs + ven - spirAbs) : (ascAbs + spirAbs - ven) + 36000) % 360;
  const necAbs = (isDay ? (ascAbs + fortAbs - merc) : (ascAbs + merc - fortAbs) + 36000) % 360;
  const courAbs = (isDay ? (ascAbs + fortAbs - mars) : (ascAbs + mars - fortAbs) + 36000) % 360;
  const vicAbs = (isDay ? (ascAbs + jup - spirAbs) : (ascAbs + spirAbs - jup) + 36000) % 360;
  const nemAbs = (isDay ? (ascAbs + fortAbs - sat) : (ascAbs + sat - fortAbs) + 36000) % 360;

  const colunas = [
    { key: 'Sun', type: 'planet', id: 'Sun' },
    { key: 'Moon', type: 'planet', id: 'Moon' },
    { key: 'Mercury', type: 'planet', id: 'Mercury' },
    { key: 'Venus', type: 'planet', id: 'Venus' },
    { key: 'Mars', type: 'planet', id: 'Mars' },
    { key: 'Jupiter', type: 'planet', id: 'Jupiter' },
    { key: 'Saturn', type: 'planet', id: 'Saturn' },
    { key: 'ASC', type: 'item', name: 'ASC' },
    { key: 'DSC', type: 'item', name: 'DSC' },
    { key: 'MC', type: 'item', name: 'MC' },
    { key: 'IC', type: 'item', name: 'IC' },
    { key: 'NodeN', type: 'item', name: 'Nodo Norte' },
    { key: 'NodeS', type: 'item', name: 'Nodo Sul' },
    { key: 'Syz', type: 'item', name: 'Sizígia' },
    { key: 'FORT', type: 'item', name: 'fortune' },
    { key: 'ESP', type: 'item', name: 'spirit' },
    { key: 'EROS', type: 'item', name: 'venus' },
    { key: 'NEC', type: 'item', name: 'mercury' },
    { key: 'AUD', type: 'item', name: 'mars' },
    { key: 'VIT', type: 'item', name: 'jupiter' },
    { key: 'NÊM', type: 'item', name: 'saturn' }
  ];

  const posicoes = {
    Sun: pObj.Sun, Moon: pObj.Moon, Mercury: pObj.Mercury, Venus: pObj.Venus, Mars: pObj.Mars, Jupiter: pObj.Jupiter, Saturn: pObj.Saturn,
    ASC: ascAbs, DSC: dscAbs, MC: mcAbs, IC: icAbs,
    NodeN: nodeAbs, NodeS: (nodeAbs + 180) % 360, Syz: syzAbs, FORT: fortAbs, ESP: spirAbs, EROS: erosAbs, NEC: necAbs, AUD: courAbs, VIT: vicAbs, NÊM: nemAbs
  };

  function getMatrixIcon(col) {
    if (col.type === 'planet') return getPlanet3DSVG(col.id);
    return getItemSVG(col.name);
  }

  function getAspecto(deg1, deg2) {
    if (deg1 === undefined || deg2 === undefined) return '';
    const s1 = Math.floor(deg1 / 30);
    const s2 = Math.floor(deg2 / 30);
    let diff = Math.abs(s1 - s2);
    if (diff > 6) diff = 12 - diff;

    if (diff === 0) return 'σ';
    if (diff === 2) return '*';
    if (diff === 3) return '☐';
    if (diff === 4) return 'Δ';
    if (diff === 6) return '☍';
    return '';
  }

  let h = `
    <div style="max-width: 960px; margin: 40px auto 20px auto; background: #fffdf5; border: 2px solid #c59b27; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h3 style="text-align: center; font-family: 'Cinzel', serif; color: #103b70; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; font-weight: 800;">Matriz de Visibilidade (Theoria)</h3>
      <div style="overflow-x: auto;">
        <table class="tabela-enxuta" style="font-size: 11px; margin: 0 auto; background: #ffffff;">
          <thead>
            <tr>
              <th style="width: 40px; background-color: #fffdf5;"></th>
  `;

  colunas.forEach(c => {
    h += `<th style="padding: 6px 4px; vertical-align: middle; border: 1px solid #e2d9c2; background-color: #fffdf5;">${getMatrixIcon(c)}</th>`;
  });
  h += `</tr></thead><tbody>`;

  colunas.forEach((row, i) => {
    h += `<tr><td style="font-weight: bold; background: #fffdf5; vertical-align: middle; border: 1px solid #e2d9c2; text-align: center; padding: 6px 4px;">${getMatrixIcon(row)}</td>`;
    colunas.forEach((col, j) => {
      if (j <= i) {
        h += `<td style="background: #f7f5ed; color: #b5aea2; border: 1px solid #e2d9c2;">-</td>`;
      } else {
        const asp = getAspecto(posicoes[row.key], posicoes[col.key]);
        let colorStyle = '#0f172a';
        if (asp === 'σ') colorStyle = '#103b70';
        else if (asp === '☐' || asp === '☍') colorStyle = '#dc2626';
        else if (asp === 'Δ' || asp === '*') colorStyle = '#2563eb';
        h += `<td style="font-weight: bold; color: ${colorStyle}; vertical-align: middle; border: 1px solid #e2d9c2; text-align: center;">${asp}</td>`;
      }
    });
    h += `</tr>`;
  });

  h += `</tbody></table></div></div>`;
  return h;
}

function renderPainelTecnico(data, containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container || !data) return;

    const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
    const mcAbs = data.MC ? data.MC.grau_absoluto : (ascAbs + 270) % 360;
    const nodeAbs = data.Nodo_Norte ? data.Nodo_Norte.grau_absoluto : 0;
    const syzAbs = data.Sizigia ? data.Sizigia.grau_absoluto : 0;

    const pObj = {};
    const mapKeys = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach(id => {
      const item = data[mapKeys[id]];
      pObj[id] = { abs: item ? item.grau_absoluto : 0, retro: item ? Boolean(item.retro) : false };
    });

    const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;

    const sun = pObj.Sun.abs, moon = pObj.Moon.abs, merc = pObj.Mercury.abs, ven = pObj.Venus.abs, mars = pObj.Mars.abs, jup = pObj.Jupiter.abs, sat = pObj.Saturn.abs;
    const fortAbs = (isDay ? (ascAbs + moon - sun) : (ascAbs + sun - moon) + 36000) % 360;
    const spirAbs = (isDay ? (ascAbs + sun - moon) : (ascAbs + moon - sun) + 36000) % 360;
    const erosAbs = (isDay ? (ascAbs + ven - spirAbs) : (ascAbs + spirAbs - ven) + 36000) % 360;
    const necAbs = (isDay ? (ascAbs + fortAbs - merc) : (ascAbs + merc - fortAbs) + 36000) % 360;
    const courAbs = (isDay ? (ascAbs + fortAbs - mars) : (ascAbs + mars - fortAbs) + 36000) % 360;
    const vicAbs = (isDay ? (ascAbs + jup - spirAbs) : (ascAbs + spirAbs - jup) + 36000) % 360;
    const nemAbs = (isDay ? (ascAbs + fortAbs - sat) : (ascAbs + sat - fortAbs) + 36000) % 360;

    const listaElementos = [
      { type: 'planet', pId: 'Sun', abs: pObj.Sun.abs, retro: false },
      { type: 'planet', pId: 'Moon', abs: pObj.Moon.abs, retro: false },
      { type: 'planet', pId: 'Mercury', abs: pObj.Mercury.abs, retro: pObj.Mercury.retro },
      { type: 'planet', pId: 'Venus', abs: pObj.Venus.abs, retro: pObj.Venus.retro },
      { type: 'planet', pId: 'Mars', abs: pObj.Mars.abs, retro: pObj.Mars.retro },
      { type: 'planet', pId: 'Jupiter', abs: pObj.Jupiter.abs, retro: pObj.Jupiter.retro },
      { type: 'planet', pId: 'Saturn', abs: pObj.Saturn.abs, retro: pObj.Saturn.retro },
      { type: 'item', key: 'Nodo Norte', abs: nodeAbs },
      { type: 'item', key: 'Nodo Sul', abs: (nodeAbs + 180) % 360 },
      { type: 'item', key: 'Sizígia', abs: syzAbs },
      { type: 'item', key: 'fortune', abs: fortAbs },
      { type: 'item', key: 'spirit', abs: spirAbs },
      { type: 'item', key: 'venus', abs: erosAbs },
      { type: 'item', key: 'mercury', abs: necAbs },
      { type: 'item', key: 'mars', abs: courAbs },
      { type: 'item', key: 'jupiter', abs: vicAbs },
      { type: 'item', key: 'saturn', abs: nemAbs },
      { type: 'item', key: 'ASC', abs: ascAbs },
      { type: 'item', key: 'DSC', abs: (ascAbs + 180) % 360 },
      { type: 'item', key: 'MC', abs: mcAbs },
      { type: 'item', key: 'IC', abs: (mcAbs + 180) % 360 }
    ];

    let html = `
      <style>
        .tabela-enxuta-wrapper {
          max-width: 960px;
          margin: 30px auto;
          background: #fffdf5;
          border: 2px solid #c59b27;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .tabela-enxuta {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Montserrat', sans-serif;
          background: #ffffff;
          font-size: 12px;
          color: #0f172a;
        }
        .tabela-enxuta th, .tabela-enxuta td {
          border: 1px solid #e2d9c2;
          padding: 8px 10px;
          text-align: center;
          vertical-align: middle;
        }
        .tabela-enxuta th {
          background-color: #fffdf5;
          font-weight: 700;
          color: #103b70;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .col-ponto { width: 16%; }
        .col-signo { width: 12%; }
        .col-grau { width: 20%; font-weight: 600; }
        .col-termo { width: 12%; font-weight: bold; color: #c59b27; font-size: 14px; }
        .col-dodec-signo { width: 12%; }
        .col-dodec-grau { width: 28%; font-weight: 600; }
      </style>

      <div class="tabela-enxuta-wrapper">
        <h3 style="text-align: center; font-family: 'Cinzel', serif; color: #103b70; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; font-weight: 800;">Painel Técnico de Natividades</h3>
        <table class="tabela-enxuta">
          <thead>
            <tr>
              <th rowspan="2" class="col-ponto">Ponto</th>
              <th rowspan="2" class="col-signo">Signo</th>
              <th rowspan="2" class="col-grau">Grau</th>
              <th rowspan="2" class="col-termo">Termo</th>
              <th colspan="2">Dodecatemória</th>
            </tr>
            <tr>
              <th class="col-dodec-signo">Signo</th>
              <th class="col-dodec-grau">Grau</th>
            </tr>
          </thead>
          <tbody>
    `;

    listaElementos.forEach(el => {
      let iconHTML = '';
      let absDeg = el.abs;
      let retroSymbol = el.retro ? `<span style="color: #dc2626; font-weight: 900; margin-left: 2px;">℞</span>` : '';

      if (el.type === 'planet') {
        iconHTML = getPlanet3DSVG(el.pId);
      } else {
        iconHTML = getItemSVG(el.key);
      }

      const signIdx = Math.floor(absDeg / 30);
      const signoSVG = getSignSVG(signIdx, 18);
      const grauFormatted = `${formatDegMinTabela(absDeg)}${retroSymbol}`;
      const termo = calcEgyptianTermTabela(absDeg);

      const dodec = calcDodecatemoriaTabela(absDeg);
      const dodecSignoSVG = getSignSVG(dodec.signIdx, 18);

      html += `
        <tr>
          <td class="col-ponto">${iconHTML}</td>
          <td class="col-signo">${signoSVG}</td>
          <td class="col-grau">${grauFormatted}</td>
          <td class="col-termo">${termo}</td>
          <td class="col-dodec-signo">${dodecSignoSVG}</td>
          <td class="col-dodec-grau">${dodec.degFormatted}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    html += renderMatrizVisibilidadeHTML(data);
    container.innerHTML = html;
  } catch (err) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div style="padding: 15px; color: #dc2626; text-align: center; font-weight: bold; background: #fef2f2; border: 1px solid #fca5a5; margin: 20px auto; max-width: 960px; border-radius: 6px;">Erro no Painel Técnico: ${err.message}</div>`;
    }
  }
}

/* FUNÇÃO DE INICIALIZAÇÃO CHAMADA PELO BOTÃO DA BARRA */
function iniciarModuloTabelaTecnica() {
  if (typeof renderPainelTecnico === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) {
    renderPainelTecnico(currentCalculatedData, 'mandala-container');
  }
}
