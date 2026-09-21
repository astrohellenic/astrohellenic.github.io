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

const SIGN_COLORS_TABELA = ["var(--element-fogo)", "var(--element-terra)", "var(--element-ar)", "var(--element-agua)", "var(--element-fogo)", "var(--element-terra)", "var(--element-ar)", "var(--element-agua)", "var(--element-fogo)", "var(--element-terra)", "var(--element-ar)", "var(--element-agua)"];

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
  [{ p: "☿", deg: 7 }, { p: "♀", deg: 13 }, { p: "♃", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
  [{ p: "♀", deg: 12 }, { p: "♃", deg: 16 }, { p: "☿", deg: 19 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }]
];

function getSignSVG(signIndex, size = 20) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${SIGN_COLORS_TABELA[signIndex]}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_TABELA[signIndex]}</svg>`;
}

function getPlanet3DSVG(planetId) {
  if (typeof estiloPlanetasEsferico === 'function' && !estiloPlanetasEsferico()) {
    return getPlanetSimpleSVG(planetId, 34);
  }
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

/* Ícones plotados na tabela (marcadores de lote/nodo/sizígia/ângulo) — ao
   contrário dos ícones de controle fixos (barra superior etc.), estes ficam
   sentados em cima de células que agora mudam de cor com o tema, então
   precisam da mesma tinta clara/escura do disco da Mandala (mesmo padrão:
   fundo do círculo e traço/texto via var(--...), funciona aqui porque este
   HTML entra direto no DOM, sem virar imagem como a Mandala). */
function getItemSVG(key) {
  const itemSVGs = {
    'fortune': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--primary-blue)" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="var(--primary-blue)" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="var(--primary-blue)" stroke-width="1.5"/></svg>`,
    'spirit': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><text x="0" y="5" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="var(--primary-blue)" text-anchor="middle" stroke="var(--bg-card)" stroke-width="2" paint-order="stroke fill">Φ</text></svg>`,
    'venus': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--primary-blue)" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="var(--primary-blue)" text-anchor="middle">♀</text></svg>`,
    'mercury': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--primary-blue)" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="var(--primary-blue)" text-anchor="middle">☿</text></svg>`,
    'mars': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--primary-blue)" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="var(--primary-blue)" text-anchor="middle">♂</text></svg>`,
    'jupiter': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--primary-blue)" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="var(--primary-blue)" text-anchor="middle">♃</text></svg>`,
    'saturn': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--primary-blue)" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="var(--primary-blue)" text-anchor="middle">♄</text></svg>`,
    'Nodo Norte': `<span style="font-size: 16px; font-weight: bold; color: var(--aspect-conjuncao);">☊</span>`,
    'Nodo Sul': `<span style="font-size: 16px; font-weight: bold; color: var(--aspect-conjuncao);">☋</span>`,
    'Sizígia': `<svg width="20" height="20" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" stroke="var(--aspect-conjuncao)" stroke-width="1.8" fill="none"/><path d="M 0 -10 A 10 10 0 0 1 0 10 Q 3.8 -3.8 -3.8 -10 Z" fill="var(--aspect-conjuncao)"/><circle cx="0" cy="0" r="2.3" fill="var(--aspect-conjuncao)"/></svg>`,
    'ASC': getAnguloCirculoSVG('ASC'),
    'DSC': getAnguloCirculoSVG('DSC'),
    'MC': getAnguloCirculoSVG('MC'),
    'IC': getAnguloCirculoSVG('IC')
  };
  return itemSVGs[key] || `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
}

/* ÍCONE DO ASC/DSC/MC/IC: mesmo círculo usado para esses pontos na mandala
   (fundo/contorno seguem o tema, ver comentário acima de getItemSVG). */
function getAnguloCirculoSVG(label) {
  return `<svg width="24" height="24" viewBox="-12 -12 24 24" style="display: block; margin: 0 auto;"><circle cx="0" cy="0" r="10" fill="var(--bg-card)" stroke="var(--aspect-conjuncao)" stroke-width="1.8"/><text x="0" y="3.5" font-size="9" font-weight="900" fill="var(--aspect-conjuncao)" text-anchor="middle">${label}</text></svg>`;
}

/* NOMES POR EXTENSO DE CADA PONTO, PARA A COLUNA "PONTO" DO PAINEL TÉCNICO */
const NOMES_PONTOS_TABELA = {
  Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno',
  'Nodo Norte': 'Nodo Norte', 'Nodo Sul': 'Nodo Sul', 'Sizígia': 'Sizígia',
  fortune: 'Fortuna', spirit: 'Espírito', venus: 'Eros', mercury: 'Necessidade', mars: 'Audácia', jupiter: 'Vitória', saturn: 'Némesis',
  ASC: 'Ascendente', DSC: 'Descendente', MC: 'Meio-Céu', IC: 'Fundo do Céu'
};

function formatDegMinTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return '-';
  const degInSign = absDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutes = Math.round((degInSign - degrees) * 60);
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${degrees}°${minStr}′`;
}

function formatarLatitudeEcliptica(lat) {
  if (lat === undefined || lat === null || isNaN(lat)) return '-';
  if (Math.abs(lat) < 0.001) return '0°00′';
  const absLat = Math.abs(lat);
  const deg = Math.floor(absLat);
  const min = Math.round((absLat - deg) * 60);
  const minStr = min < 10 ? `0${min}` : `${min}`;
  const dir = lat >= 0 ? 'N' : 'S';
  return `${deg}°${minStr}′ ${dir}`;
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

/* CABEÇALHO — cópia do conteúdo exato do cabeçalho desenhado dentro da
   PRÓPRIA MANDALA (mandala.js, dentro de renderMandala, bloco
   `<g id="png-discreet-header">`): nome, dia/data/hora/fuso, cidade, e a
   terceira linha com "Zodíaco Tropical • Signos Inteiros • <tipo do
   mapa> • Natividade Diurna/Noturna". Função de nível global (moveu de
   matrizVisibilidade.js pra cá) porque agora é usada tanto pelo Painel
   Técnico (aqui embaixo, em renderPainelTecnico) quanto pela Matriz de
   Visibilidade quando ela aparece no lugar da Mandala
   (matrizVisibilidade.js) — o pedido do astrólogo foi que esse cabeçalho
   fosse padrão, idêntico, em todo canto que mostra essa informação, não
   uma versão parecida por fora criada à parte em cada lugar (foi
   exatamente isso que deu errado numa tentativa anterior).
   "idOpcional" só existe pra manter o id "painelTecnicoHeader" de sempre
   aqui no Painel Técnico (usado logo abaixo pra sincronizar a largura
   com a tabela) — na Matriz não precisa de id nenhum. */
function montarCabecalhoMandalaHTML(data, idOpcional) {
  const headerTitle = currentCustomCode ? `${currentCustomCode} ${currentSubjectName}` : currentSubjectName;

  const diasSemanaLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diaSemanaFormatted = diasSemanaLabels[currentMoment.getDay()];
  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  // Mesmo cálculo de isDay/sectText de renderMandala (mandala.js).
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const sunAbs = data.Sol ? data.Sol.grau_absoluto : 0;
  const isDay = ((sunAbs - ascAbs + 360) % 360) >= 180;
  const sectText = isDay ? "Natividade Diurna" : "Natividade Noturna";

  const tipoAtual = (typeof window.currentMapType !== 'undefined' && window.currentMapType) ? window.currentMapType : 'Natal';
  const tipoFormatado = tipoAtual === 'Natal' ? 'Mapa Natal' : `Mapa de ${tipoAtual}`;

  const horasInfo = (typeof window.horasPlanetariasAtual !== 'undefined') ? window.horasPlanetariasAtual : null;

  return `
    <div${idOpcional ? ` id="${idOpcional}"` : ''} style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 auto 16px auto; background: var(--bg-main); border: 2px solid var(--gold-primary); border-radius: 10px; padding: 10px 16px; box-sizing: border-box;">
      <div>
        <div style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 15px; color: var(--primary-blue);">${escapeHtml(headerTitle)}</div>
        <div style="font-size: 11.5px; color: var(--text-muted-2); font-weight: 500; margin-top: 2px;">${diaSemanaFormatted} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted}) • ${escapeHtml(currentGeo.city)}</div>
        <div style="font-size: 10.5px; color: var(--text-muted-2); font-weight: 600; margin-top: 2px;">Zodíaco Tropical • Signos Inteiros • ${escapeHtml(tipoFormatado)}  <span style="color: var(--primary-blue); font-weight: 700;">• ${sectText}</span></div>
      </div>
      ${horasInfo ? `
      <div style="display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
        <div style="text-align: center;">
          <div style="font-size: 10px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">Dia</div>
          ${getPlanet3DSVG(horasInfo.dayRulerId)}
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">Hora</div>
          ${getPlanet3DSVG(horasInfo.hourRulerId)}
        </div>
      </div>` : ''}
    </div>
  `;
}

/* Mede a largura de um texto renderizado numa fonte específica — usado
   só pra calcular a largura de cada coluna do Painel Principal em SVG
   (montarSVGPainelPrincipal, mais abaixo), que — ao contrário de uma
   <table> HTML — não tem layout automático: cada célula precisa de
   x/width explícitos. Canvas 2D reaproveitado entre chamadas. */
let _canvasMedidaTextoTabela = null;
function medirLarguraTextoTabela(texto, fontSizePx, fontWeight) {
  if (!_canvasMedidaTextoTabela) _canvasMedidaTextoTabela = document.createElement('canvas');
  const ctx = _canvasMedidaTextoTabela.getContext('2d');
  ctx.font = `${fontWeight || 400} ${fontSizePx}px 'Montserrat', sans-serif`;
  return ctx.measureText(texto).width;
}

/* Lê o width/height já declarado num fragmento "<svg width=... height=...
   ...>...</svg>" — mesma extração que posicionarIconeMatrizSVG
   (matrizVisibilidade.js) já faz por dentro; separada aqui porque
   montarSVGPainelPrincipal precisa saber o tamanho do ícone ANTES de
   decidir onde centralizá-lo (pra calcular a largura da coluna). */
function extrairTamanhoIconeSVG(fragmentoSVG) {
  const wMatch = fragmentoSVG.match(/width="([\d.]+)"/);
  const hMatch = fragmentoSVG.match(/height="([\d.]+)"/);
  return { w: wMatch ? parseFloat(wMatch[1]) : 24, h: hMatch ? parseFloat(hMatch[1]) : 24 };
}

/* Ícone da coluna "Ponto" — igual ao getMatrizIconeSVG (matrizVisibilidade.js,
   mesma ideia, campos do objeto diferentes porque a lista de elementos
   do Painel Principal usa outro formato): Nodo Norte/Sul, no getItemSVG
   original, viram um <span> de HTML solto, que não existe dentro de um
   <svg> puro — aqui viram <svg><text> de verdade, mesma cor/símbolo. */
function getIconePontoTabelaSVG(el) {
  if (el.type === 'planet') return getPlanet3DSVG(el.pId);
  if (el.key === 'Nodo Norte' || el.key === 'Nodo Sul') {
    const simbolo = el.key === 'Nodo Norte' ? '☊' : '☋';
    return `<svg width="20" height="20" viewBox="-12 -12 24 24"><text x="0" y="6" font-size="17" font-weight="bold" fill="var(--aspect-conjuncao)" text-anchor="middle">${simbolo}</text></svg>`;
  }
  return getItemSVG(el.key);
}

/* Reconstrói a tabela do Painel Principal (Ponto/Signo/Grau/Latitude/
   Termo/Dodecatemória) em SVG puro — mesmo motivo e mesmo resultado que
   a reescrita da Matriz de Visibilidade: sendo um <svg>, ela encolhe só
   com CSS (max-width/height, como uma imagem) e usa o zoom nativo da
   página, sem precisar de nenhuma caixinha de zoom calculada em JS nem
   de bloquear o touch-action — que era exatamente o que fazia o
   conteúdo ampliado ficar escondido atrás de uma margem ao dar zoom.

   Diferença da Matriz: lá o grid é uniforme (todas as células do mesmo
   tamanho). Aqui as colunas têm conteúdos bem diferentes (ícone+nome,
   signo, grau, latitude, termo, dodecatemória) — como um <svg> não tem
   layout automático de tabela, a largura de cada coluna é medida na
   mão (texto via medirLarguraTextoTabela, ícone via extrairTamanhoIconeSVG)
   e só depois usada pra posicionar tudo, replicando o que uma <table>
   HTML calcularia sozinha. */
function montarSVGPainelPrincipal(listaElementos) {
  const PAD_X = 10, PAD_Y = 8;
  const F_HEADER = { size: 11, weight: 700 };
  const F_PONTO_LABEL = { size: 9, weight: 600 };
  const F_GRAU = { size: 12, weight: 600 };
  const F_LAT = { size: 12, weight: 600 };
  const F_TERMO = { size: 14, weight: 700 };
  const F_DODEC_GRAU = { size: 12, weight: 600 };
  const MARGEM_SEGURANCA = 4; // colchão pra pequenas imprecisões de medida (ex.: fonte ainda carregando)

  const linhas = listaElementos.map(el => {
    const absDeg = el.abs;
    const iconeSVG = getIconePontoTabelaSVG(el);
    const pointName = el.type === 'planet' ? (NOMES_PONTOS_TABELA[el.pId] || el.pId) : (NOMES_PONTOS_TABELA[el.key] || el.key);
    const signoSVG = getSignSVG(Math.floor(absDeg / 30), 18);
    const grauBase = formatDegMinTabela(absDeg);
    const temRetro = Boolean(el.retro);
    const latFormatted = (el.type === 'planet') ? formatarLatitudeEcliptica(el.lat) : '-';
    const termo = calcEgyptianTermTabela(absDeg);
    const dodec = calcDodecatemoriaTabela(absDeg);
    const dodecSignoSVG = getSignSVG(dodec.signIdx, 18);
    return { iconeSVG, pointName, signoSVG, grauBase, temRetro, latFormatted, termo, dodecSignoSVG, dodecGrauFormatted: dodec.degFormatted };
  });

  // Largura de cada coluna = o maior entre o rótulo do cabeçalho e o
  // conteúdo de todas as linhas (igual a como uma <table> HTML decide
  // sozinha a largura de cada coluna).
  let wPonto = medirLarguraTextoTabela('PONTO', F_HEADER.size, F_HEADER.weight);
  let wSigno = medirLarguraTextoTabela('SIGNO', F_HEADER.size, F_HEADER.weight);
  let wGrau = medirLarguraTextoTabela('GRAU', F_HEADER.size, F_HEADER.weight);
  let wLat = medirLarguraTextoTabela('LATITUDE', F_HEADER.size, F_HEADER.weight);
  let wTermo = medirLarguraTextoTabela('TERMO', F_HEADER.size, F_HEADER.weight);
  let wDodecSigno = medirLarguraTextoTabela('SIGNO', F_HEADER.size, F_HEADER.weight);
  let wDodecGrau = medirLarguraTextoTabela('GRAU', F_HEADER.size, F_HEADER.weight);

  const alturasLinha = [];
  linhas.forEach(l => {
    const iconeTam = extrairTamanhoIconeSVG(l.iconeSVG);
    wPonto = Math.max(wPonto, iconeTam.w, medirLarguraTextoTabela(l.pointName, F_PONTO_LABEL.size, F_PONTO_LABEL.weight));
    wSigno = Math.max(wSigno, extrairTamanhoIconeSVG(l.signoSVG).w);
    wGrau = Math.max(wGrau, medirLarguraTextoTabela(l.grauBase + (l.temRetro ? ' ℞' : ''), F_GRAU.size, F_GRAU.weight));
    wLat = Math.max(wLat, medirLarguraTextoTabela(l.latFormatted, F_LAT.size, F_LAT.weight));
    wTermo = Math.max(wTermo, medirLarguraTextoTabela(l.termo, F_TERMO.size, F_TERMO.weight));
    wDodecSigno = Math.max(wDodecSigno, extrairTamanhoIconeSVG(l.dodecSignoSVG).w);
    wDodecGrau = Math.max(wDodecGrau, medirLarguraTextoTabela(l.dodecGrauFormatted, F_DODEC_GRAU.size, F_DODEC_GRAU.weight));

    const alturaLabel = Math.ceil(F_PONTO_LABEL.size * 1.3);
    alturasLinha.push(iconeTam.h + 2 + alturaLabel + PAD_Y * 2);
  });

  wPonto = Math.ceil(wPonto) + PAD_X * 2 + MARGEM_SEGURANCA;
  wSigno = Math.ceil(wSigno) + PAD_X * 2 + MARGEM_SEGURANCA;
  wGrau = Math.ceil(wGrau) + PAD_X * 2 + MARGEM_SEGURANCA;
  wLat = Math.ceil(wLat) + PAD_X * 2 + MARGEM_SEGURANCA;
  wTermo = Math.ceil(wTermo) + PAD_X * 2 + MARGEM_SEGURANCA;
  wDodecSigno = Math.ceil(wDodecSigno) + PAD_X * 2 + MARGEM_SEGURANCA;
  wDodecGrau = Math.ceil(wDodecGrau) + PAD_X * 2 + MARGEM_SEGURANCA;

  const colX = { ponto: 0 };
  colX.signo = colX.ponto + wPonto;
  colX.grau = colX.signo + wSigno;
  colX.lat = colX.grau + wGrau;
  colX.termo = colX.lat + wLat;
  colX.dodecSigno = colX.termo + wTermo;
  colX.dodecGrau = colX.dodecSigno + wDodecSigno;
  const totalW = colX.dodecGrau + wDodecGrau;

  const alturaHeaderLinha = Math.ceil(F_HEADER.size * 1.3) + PAD_Y * 2;
  const headerH = alturaHeaderLinha * 2;

  const rowY = [];
  let y = headerH;
  alturasLinha.forEach(h => { rowY.push(y); y += h; });
  const totalH = y;

  const corBorda = 'var(--table-border)';
  let svg = `<svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="display: inline-block; max-width: 100%; height: auto; font-family: 'Montserrat', sans-serif; border: 2px solid ${corBorda}; border-radius: 12px; overflow: hidden;">`;
  svg += `<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="var(--bg-card)"/>`;

  // Cabeçalho — Ponto/Signo/Grau/Latitude/Termo ocupam as duas linhas
  // (equivalente ao rowspan="2" de antes); Dodecatemória ocupa as duas
  // colunas da direita na linha 1 (equivalente ao colspan="2"), com
  // Signo/Grau embaixo na linha 2.
  function celulaHeader(x, y, w, h, texto) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--bg-main)" stroke="${corBorda}" stroke-width="1"/>` +
      `<text x="${x + w / 2}" y="${y + h / 2}" font-size="${F_HEADER.size}" font-weight="${F_HEADER.weight}" letter-spacing="0.5" fill="var(--primary-blue)" text-anchor="middle" dominant-baseline="central">${texto}</text>`;
  }
  svg += celulaHeader(colX.ponto, 0, wPonto, headerH, 'PONTO');
  svg += celulaHeader(colX.signo, 0, wSigno, headerH, 'SIGNO');
  svg += celulaHeader(colX.grau, 0, wGrau, headerH, 'GRAU');
  svg += celulaHeader(colX.lat, 0, wLat, headerH, 'LATITUDE');
  svg += celulaHeader(colX.termo, 0, wTermo, headerH, 'TERMO');
  svg += celulaHeader(colX.dodecSigno, 0, wDodecSigno + wDodecGrau, alturaHeaderLinha, 'DODECATEMÓRIA');
  svg += celulaHeader(colX.dodecSigno, alturaHeaderLinha, wDodecSigno, alturaHeaderLinha, 'SIGNO');
  svg += celulaHeader(colX.dodecGrau, alturaHeaderLinha, wDodecGrau, alturaHeaderLinha, 'GRAU');

  // Corpo
  linhas.forEach((l, i) => {
    const y0 = rowY[i];
    const h = alturasLinha[i];
    const cy = y0 + h / 2;

    function celula(x, w, conteudoSVG) {
      return `<rect x="${x}" y="${y0}" width="${w}" height="${h}" fill="var(--bg-card)" stroke="${corBorda}" stroke-width="1"/>${conteudoSVG}`;
    }

    // Ponto: ícone em cima, nome embaixo
    const iconeTam = extrairTamanhoIconeSVG(l.iconeSVG);
    const alturaLabel = Math.ceil(F_PONTO_LABEL.size * 1.3);
    const blocoAltura = iconeTam.h + 2 + alturaLabel;
    const topoBloco = cy - blocoAltura / 2;
    const iconePosicionado = posicionarIconeMatrizSVG(l.iconeSVG, colX.ponto + wPonto / 2, topoBloco + iconeTam.h / 2);
    const labelPonto = `<text x="${colX.ponto + wPonto / 2}" y="${topoBloco + iconeTam.h + 2 + alturaLabel / 2}" font-size="${F_PONTO_LABEL.size}" font-weight="${F_PONTO_LABEL.weight}" fill="var(--primary-blue)" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.pointName)}</text>`;
    svg += celula(colX.ponto, wPonto, iconePosicionado + labelPonto);

    // Signo
    svg += celula(colX.signo, wSigno, posicionarIconeMatrizSVG(l.signoSVG, colX.signo + wSigno / 2, cy));

    // Grau (com ℞ em vermelho quando retrógrado)
    const textoGrau = l.temRetro
      ? `${escapeHtml(l.grauBase)}<tspan fill="var(--danger)" font-weight="900"> ℞</tspan>`
      : escapeHtml(l.grauBase);
    svg += celula(colX.grau, wGrau, `<text x="${colX.grau + wGrau / 2}" y="${cy}" font-size="${F_GRAU.size}" font-weight="${F_GRAU.weight}" fill="var(--text-dark)" text-anchor="middle" dominant-baseline="central">${textoGrau}</text>`);

    // Latitude
    svg += celula(colX.lat, wLat, `<text x="${colX.lat + wLat / 2}" y="${cy}" font-size="${F_LAT.size}" font-weight="${F_LAT.weight}" fill="var(--text-muted-2)" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.latFormatted)}</text>`);

    // Termo
    svg += celula(colX.termo, wTermo, `<text x="${colX.termo + wTermo / 2}" y="${cy}" font-size="${F_TERMO.size}" font-weight="${F_TERMO.weight}" fill="var(--gold-primary)" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.termo)}</text>`);

    // Dodecatemória — Signo
    svg += celula(colX.dodecSigno, wDodecSigno, posicionarIconeMatrizSVG(l.dodecSignoSVG, colX.dodecSigno + wDodecSigno / 2, cy));

    // Dodecatemória — Grau
    svg += celula(colX.dodecGrau, wDodecGrau, `<text x="${colX.dodecGrau + wDodecGrau / 2}" y="${cy}" font-size="${F_DODEC_GRAU.size}" font-weight="${F_DODEC_GRAU.weight}" fill="var(--text-dark)" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.dodecGrauFormatted)}</text>`);
  });

  svg += `</svg>`;
  return svg;
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
      pObj[id] = {
        abs: item ? item.grau_absoluto : 0,
        retro: item ? Boolean(item.retro) : false,
        lat: item ? (parseFloat(item.lat) || 0) : 0
      };
    });

        function buscarLoteDeg(chave) {
      if (typeof window.currentLotes === 'undefined' || !window.currentLotes) return 0;
      const item = window.currentLotes.find(l => l.key === chave);
      return item ? item.deg : 0;
    }

    const fortAbs = buscarLoteDeg('fortune');
    const spirAbs = buscarLoteDeg('spirit');
    const erosAbs = buscarLoteDeg('venus');
    const necAbs = buscarLoteDeg('mercury');
    const courAbs = buscarLoteDeg('mars');
    const vicAbs = buscarLoteDeg('jupiter');
    const nemAbs = buscarLoteDeg('saturn');

    const listaElementos = [
      { type: 'planet', pId: 'Sun', abs: pObj.Sun.abs, retro: false, lat: pObj.Sun.lat },
      { type: 'planet', pId: 'Moon', abs: pObj.Moon.abs, retro: false, lat: pObj.Moon.lat },
      { type: 'planet', pId: 'Mercury', abs: pObj.Mercury.abs, retro: pObj.Mercury.retro, lat: pObj.Mercury.lat },
      { type: 'planet', pId: 'Venus', abs: pObj.Venus.abs, retro: pObj.Venus.retro, lat: pObj.Venus.lat },
      { type: 'planet', pId: 'Mars', abs: pObj.Mars.abs, retro: pObj.Mars.retro, lat: pObj.Mars.lat },
      { type: 'planet', pId: 'Jupiter', abs: pObj.Jupiter.abs, retro: pObj.Jupiter.retro, lat: pObj.Jupiter.lat },
      { type: 'planet', pId: 'Saturn', abs: pObj.Saturn.abs, retro: pObj.Saturn.retro, lat: pObj.Saturn.lat },
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
      <div style="width: 100%;">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px; padding: 0 20px;">
        <button onclick="capturarPainelTecnicoParaRelatorio()" title="Adiciona esta tela como um bloco no Relatório (a captura sai em tamanho natural, sem o zoom que você deu na tela, pra sair nítida no PDF)" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif;">
          <i class="fa-solid fa-file-circle-plus"></i> Adicionar ao Relatório
        </button>
      </div>
      <div id="painel-tecnico-container" style="width: 100%; min-height: 100%; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">
      <h3 style="text-align: center; font-family: 'Cinzel', serif; color: var(--primary-blue); font-size: 18px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Painel Técnico de Natividades</h3>

      ${montarCabecalhoMandalaHTML(data, 'painelTecnicoHeader')}
    `;

    html += `
      <div id="painelPrincipalContainer" style="text-align: center; margin: 24px 0;">
        ${montarSVGPainelPrincipal(listaElementos)}
      </div>
    `;

    html += `</div></div>`;
    container.innerHTML = html;

    const headerEl = document.getElementById('painelTecnicoHeader');
    const painelEl = document.querySelector('#painelPrincipalContainer svg');

    // Em telas estreitas a tabela rola dentro do próprio contêiner e sua
    // largura "natural" (offsetWidth) pode ultrapassar o espaço realmente
    // visível na tela; sem esse limite o cabeçalho ficaria largo demais e a
    // página inteira passaria a rolar na horizontal. Descontamos o padding do
    // contêiner pai porque clientWidth inclui o padding, e um filho com esse
    // valor "cru" como largura acaba ultrapassando a área de conteúdo real.
    let availableWidth = Infinity;
    if (headerEl && headerEl.parentElement) {
      const parentStyles = getComputedStyle(headerEl.parentElement);
      availableWidth = headerEl.parentElement.clientWidth
        - parseFloat(parentStyles.paddingLeft || 0)
        - parseFloat(parentStyles.paddingRight || 0);
    }

    if (headerEl && painelEl) {
      headerEl.style.width = 'fit-content';
      const naturalWidth = headerEl.offsetWidth;
      // painelEl é o <svg> raiz da tabela — offsetWidth é propriedade de
      // HTMLElement, não existe em SVGElement (fica undefined), por isso
      // mede com getBoundingClientRect() aqui, que funciona pros dois.
      const painelWidth = painelEl.getBoundingClientRect().width;
      const finalWidth = Math.min(Math.max(naturalWidth, painelWidth), availableWidth);
      if (finalWidth > 0) headerEl.style.width = finalWidth + 'px';
    }
  } catch (err) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div style="padding: 15px; color: var(--danger); text-align: center; font-weight: bold; background: var(--danger-bg); border: 1px solid var(--danger-border); margin: 20px auto; max-width: 960px; border-radius: 6px;">Erro no Painel Técnico: ${err.message}</div>`;
    }
  }
}

/* Captura o Painel Técnico pro Relatório, com html2canvas — igual ao
   padrão usado em capturarMatrizVisibilidadeMandalaParaRelatorio
   (matrizVisibilidade.js). Antes precisava desfazer/refazer um
   transform:scale antes/depois de capturar (bug conhecido do html2canvas
   com overflow:auto + transform:scale juntos, da caixinha de zoom que a
   tabela tinha) — desde que o Painel Principal virou SVG puro, sem
   caixinha nem transform nenhum (ver montarSVGPainelPrincipal), isso
   deixou de ser necessário: é só capturar direto. */
async function capturarPainelTecnicoParaRelatorio() {
  const elemento = document.getElementById('painel-tecnico-container');
  if (!elemento) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }

  try {
    // Fallback só pra eventuais áreas transparentes na captura — o fundo de
    // verdade do container já é var(--bg-main) (inline), então acompanha o
    // modo atual em vez de cravar sempre o creme do Tema Claro.
    const modoEscuroCaptura = document.documentElement.classList.contains('tema-escuro');
    const canvas = await html2canvas(elemento, { backgroundColor: modoEscuroCaptura ? '#1c1917' : '#fffdf5', scale: 2, useCORS: true });
    const total = adicionarCapturaRelatorio('tabela_tecnica', canvas.toDataURL('image/png'));
    alert(`"Painel Técnico de Natividades" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar Painel Técnico ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarPainelTecnicoParaRelatorio = capturarPainelTecnicoParaRelatorio;

/* FUNÇÃO DE INICIALIZAÇÃO CHAMADA PELO BOTÃO DA BARRA */
function iniciarModuloTabelaTecnica() {
  if (typeof renderPainelTecnico === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) {
    renderPainelTecnico(currentCalculatedData, 'mandala-container');
  }
}
