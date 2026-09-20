/* ==========================================
   MÓDULO DE LIBERAÇÃO ZODIACAL (APHESIS)
   ========================================== */

let selectedZRPhase = "fortune"; // Fortuna como lote padrão inicial
let expandedL1Index = null; // Detectado automaticamente com base no momento atual
let expandedL2Key = null; // Guarda a chave do L2 expandido (ex: "0_2")
let expandedL3Key = null; // Guarda a chave do L3 expandido (ex: "0_2_1")

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

/* Embrulha um SVG "solto" (string) numa <img src="data:image/svg+xml,...">
   em vez de deixar o <svg> direto no HTML. O html2canvas (usado pelo
   botão "Adicionar ao Relatório") tem bugs conhecidos com SVG inline
   dentro de tabelas aninhadas (some inteiro, sem nem dar erro) e com
   viewBox de origem negativa como "-12 -12 24 24" (ícone sai cortado) —
   os dois casos exatos dos ícones desta tela (signo dentro das tabelas
   L2/L3/L4, e o selo redondo do lote ativo). Como <img> vira só um
   desenho já pronto (o navegador rasteriza o SVG antes, fora do
   html2canvas), esses dois bugs somem. Precisa do "xmlns" — sem ele o
   SVG isolado numa data URI não é XML válido e não carrega como imagem
   (inline direto no HTML não precisa, mas isolado como recurso precisa). */
function svgComoImagemZR(svgInterno, largura, altura, viewBox) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="${viewBox}">${svgInterno}</svg>`;
  return `<img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="${largura}" height="${altura}" style="display: block; margin: 0 auto;" alt="">`;
}

function getSignSVGZR(signIndex, size = 22) {
  if (signIndex < 0 || signIndex > 11) return '';
  const interno = `<g style="color: ${SIGN_COLORS_ZR[signIndex]};">${MONOLINE_ZODIAC_SVGS_ZR[signIndex]}</g>`;
  return svgComoImagemZR(interno, size, size, '0 0 64 64');
}

function getLotIconSVG(lotKey) {
  // As duas telas que usam esse ícone (o menu de lotes e o botão "Lote
  // Ativo") sempre pintam com essa mesma cor — por isso dá pra gravar a
  // cor direto no SVG (teria que ser assim de qualquer jeito: uma <img>
  // isolada não herda "currentColor" de fora, precisa vir com a cor já
  // dentro dela).
  const cor = '#103b70';
  let interno;
  if (lotKey === 'fortune') {
    interno = `<circle cx="0" cy="0" r="10" fill="none" stroke="${cor}" stroke-width="1.8"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="${cor}" stroke-width="1.8"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="${cor}" stroke-width="1.8"/>`;
  } else if (lotKey === 'spirit') {
    interno = `<text x="0" y="9" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="${cor}" text-anchor="middle">Φ</text>`;
  } else {
    const lotConfig = {
      venus:   { sym: '♀', y: 2, size: 15 },
      mercury: { sym: '☿', y: 4, size: 15 },
      mars:    { sym: '♂', y: 2, size: 15 },
      jupiter: { sym: '♃', y: 4, size: 15 },
      saturn:  { sym: '♄', y: 4, size: 15 }
    };
    const cfg = lotConfig[lotKey] || { sym: '', y: 0, size: 10 };
    interno = `<circle cx="0" cy="0" r="10" fill="none" stroke="${cor}" stroke-width="1.8"/><text x="0" y="${cfg.y}" font-size="${cfg.size}" font-weight="bold" fill="${cor}" text-anchor="middle">${cfg.sym}</text>`;
  }
  return svgComoImagemZR(interno, 22, 22, '-12 -12 24 24');
}

/* ==========================================
   MINI MANDALA NATAL NO TOPO DA LIBERAÇÃO ZODIACAL
   ==========================================
   Cópia de gerarMandalaSVG (profeccao.js), que por sua vez é cópia fiel
   de renderMandala() em mandala.js: mesmos anéis/hastes/ticks dourados,
   aspectos, dodecatemoria, termos egípcios, lotes herméticos e planetas
   em SVG 3D com sombra e mancha de combustão, só sem a faixa de céu/
   espaço sideral (não cabe numa miniatura). Reaproveita direto os
   globais já carregados por mandala.js antes deste arquivo (PLANETS_DEF,
   EGYPTIAN_TERMS, MONOLINE_ZODIAC_SVGS, ELEMENT_SIGN_COLORS,
   SIGN_ELEMENTS, eclToScreenAngle, polarToCart, formatDegMin,
   calculateSevenLots, aplicarEmpilhamentoRadial, aplicarDesvioLateralLotes)
   — não os redeclara aqui. Só os defs/planetas em SVG 3D
   (construirDefsPlanetasZR/fragmentoPlaneta3DZR) precisam de cópia
   própria, porque em profeccao.js eles só existem dentro do IIFE do
   módulo, sem versão global reaproveitável, e usam IDs de gradiente/
   filtro sufixados por instância (não podem colidir com os mesmos IDs
   fixos usados pela mandala principal em mandala.js). */

let wheelInstanceCounterZR = 0;

/* Regente de cada signo (mesma ordem/fonte de SIGNS em profeccao.js) —
   só usado se algum dia opcoes.profectedSignIdx for passado, para
   desenhar a coroa sobre o regente do signo profectado do ano. */
const SIGNS_RULERS_ZR = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

function construirDefsPlanetasZR(sufixo) {
  return `
      <filter id="glyphShadow_${sufixo}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.85" />
      </filter>
      <filter id="planetDropShadow_${sufixo}" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.25" />
      </filter>
      <radialGradient id="gradSun_${sufixo}" cx="35%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#fffbeb" /><stop offset="25%" stop-color="#fde047" /><stop offset="60%" stop-color="#f59e0b" /><stop offset="88%" stop-color="#d97706" /><stop offset="100%" stop-color="#92400e" />
      </radialGradient>
      <radialGradient id="gradMoon_${sufixo}" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#e2e8f0" /><stop offset="65%" stop-color="#94a3b8" /><stop offset="90%" stop-color="#475569" /><stop offset="100%" stop-color="#1e293b" />
      </radialGradient>
      <radialGradient id="gradMercury_${sufixo}" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef08a" /><stop offset="28%" stop-color="#d97706" /><stop offset="65%" stop-color="#92400e" /><stop offset="92%" stop-color="#451a03" /><stop offset="100%" stop-color="#270e02" />
      </radialGradient>
      <radialGradient id="gradVenus_${sufixo}" cx="34%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="65%" stop-color="#f59e0b" /><stop offset="90%" stop-color="#b45309" /><stop offset="100%" stop-color="#78350f" />
      </radialGradient>
      <radialGradient id="gradMars_${sufixo}" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fca5a5" /><stop offset="25%" stop-color="#ef4444" /><stop offset="60%" stop-color="#b91c1c" /><stop offset="88%" stop-color="#7f1d1d" /><stop offset="100%" stop-color="#450a0a" />
      </radialGradient>
      <radialGradient id="gradJupiter_${sufixo}" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fffbeb" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="58%" stop-color="#d4a373" /><stop offset="82%" stop-color="#a97142" /><stop offset="100%" stop-color="#6f4518" />
      </radialGradient>
      <radialGradient id="gradSaturn_${sufixo}" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef9c3" /><stop offset="35%" stop-color="#fde047" /><stop offset="70%" stop-color="#ca8a04" /><stop offset="92%" stop-color="#854d0e" /><stop offset="100%" stop-color="#422006" />
      </radialGradient>
      <linearGradient id="gradRings_${sufixo}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" /><stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" /><stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" /><stop offset="85%" stop-color="#64748b" stop-opacity="0.9" /><stop offset="100%" stop-color="#334155" stop-opacity="0.95" />
      </linearGradient>
      <clipPath id="jupiterClip_${sufixo}"><circle cx="50" cy="50" r="42" /></clipPath>
      <radialGradient id="combustionGlow_${sufixo}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.9" /><stop offset="30%" stop-color="#fde68a" stop-opacity="0.75" /><stop offset="53%" stop-color="#f59e0b" stop-opacity="0.45" /><stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </radialGradient>
  `;
}

function fragmentoPlaneta3DZR(planetId, sufixo) {
  if (typeof estiloPlanetasEsferico === 'function' && !estiloPlanetasEsferico() && typeof getPlanetSimpleFragment === 'function') {
    return getPlanetSimpleFragment(planetId);
  }
  const frags = {
    Sun: `<g>
        <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25" filter="blur(2px)"/>
        <circle cx="50" cy="50" r="42" fill="url(#gradSun_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/>
        <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow_${sufixo})">☉</text>
    </g>`,
    Moon: `<g>
        <circle cx="50" cy="50" r="42" fill="url(#gradMoon_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/>
        <circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/>
        <circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/>
        <circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/>
        <ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/>
        <path d="M 40,24 C 62,24 72,36 72,50 C 72,64 62,76 40,76 C 54,69 60,59 60,50 C 60,41 54,31 40,24 Z" fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" filter="url(#glyphShadow_${sufixo})"/>
    </g>`,
    Mercury: `<g>
        <circle cx="50" cy="50" r="42" fill="url(#gradMercury_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/>
        <circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/>
        <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow_${sufixo})">☿</text>
    </g>`,
    Venus: `<g>
        <circle cx="50" cy="50" r="42" fill="url(#gradVenus_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/>
        <circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/>
        <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow_${sufixo})">♀</text>
    </g>`,
    Mars: `<g>
        <circle cx="50" cy="50" r="42" fill="url(#gradMars_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/>
        <ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/>
        <circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/>
        <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow_${sufixo})">♂</text>
    </g>`,
    Jupiter: `<g>
        <circle cx="50" cy="50" r="42" fill="url(#gradJupiter_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <g clip-path="url(#jupiterClip_${sufixo})" opacity="0.45">
            <rect x="0" y="24" width="100" height="6" fill="#8c531b" />
            <rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" />
            <rect x="0" y="49" width="100" height="11" fill="#783d19" />
            <rect x="0" y="64" width="100" height="6" fill="#8c531b" />
            <rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" />
        </g>
        <ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/>
        <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow_${sufixo})">♃</text>
    </g>`,
    Saturn: `<g>
        <g transform="rotate(-22 50 50)">
            <ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#gradRings_${sufixo})" stroke-width="5.5" opacity="0.95" />
            <ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/>
        </g>
        <circle cx="50" cy="50" r="36" fill="url(#gradSaturn_${sufixo})" filter="url(#planetDropShadow_${sufixo})"/>
        <g transform="rotate(-22 50 50)">
            <path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#gradRings_${sufixo})" stroke-width="5.5" />
            <path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/>
        </g>
        <ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/>
        <text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow_${sufixo})">♄</text>
    </g>`
  };
  return frags[planetId] || '';
}

/* Gera a mandala natal completa em SVG — cópia fiel de gerarMandalaSVG
   (profeccao.js). Aceita as mesmas opções de destaque (profectedSignIdx,
   highlightAscSignIdx, highlightMesAbertoSignIdx) para poder, num passo
   futuro, destacar os signos abertos na árvore da Liberação Zodiacal —
   por ora chamada sem nenhuma delas, só para exibir o mapa natal puro. */
function gerarMandalaNatalZR(dados, opcoes = {}) {
  if (!dados || !dados.Ascendente) {
    return `<div style="padding: 40px 10px; text-align: center; color: #94a3b8; font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`;
  }

  const profectedSignIdx = (opcoes.profectedSignIdx !== undefined) ? opcoes.profectedSignIdx : null;
  const highlightAscSignIdx = (opcoes.highlightAscSignIdx !== undefined) ? opcoes.highlightAscSignIdx : null;
  const highlightMesAbertoSignIdx = (opcoes.highlightMesAbertoSignIdx !== undefined) ? opcoes.highlightMesAbertoSignIdx : null;
  /* Chave do lote (fortune/spirit/venus/...) a colocar na Casa 1 do
     desenho, no lugar do Ascendente — mesma lógica de rotação de
     alternarRotacaoCasa1/selectedHouse1Lot em mandala.js, só que aqui
     não tem opção "ASC": a Liberação sempre gira em torno de um lote. */
  const loteCasa1 = (opcoes.loteCasa1 !== undefined) ? opcoes.loteCasa1 : null;

  const goldColor = "#c59b27";
  const sufixo = `zr${wheelInstanceCounterZR++}`;

  const ascAbs = dados.Ascendente.grau_absoluto;
  const mcAbs = dados.MC ? dados.MC.grau_absoluto : (ascAbs + 270) % 360;
  const nodeAbs = dados.Nodo_Norte ? dados.Nodo_Norte.grau_absoluto : 0;
  const syzAbs = dados.Sizigia ? dados.Sizigia.grau_absoluto : 0;

  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = dados[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0, retro: item ? Boolean(item.retro) : false, lat: item ? (item.lat || 0) : 0 };
  });

  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  const lotes = calculateSevenLots(ascAbs, isDay, pObj);

  let house1RefAbs = ascAbs;
  if (loteCasa1) {
    const targetLot = lotes.find(l => l.key === loteCasa1);
    if (targetLot) house1RefAbs = targetLot.deg;
  }

  const outerRingItems = [];
  PLANETS_DEF.forEach(p => {
    outerRingItems.push({
      type: "planet", id: p.id, deg: pObj[p.id].abs, retro: pObj[p.id].retro,
      eclLat: pObj[p.id].lat, aScreen: eclToScreenAngle(pObj[p.id].abs, house1RefAbs)
    });
  });
  if (nodeAbs > 0) {
    outerRingItems.push({ type: "node", label: "☊", deg: nodeAbs, color: "#000000", aScreen: eclToScreenAngle(nodeAbs, house1RefAbs) });
    outerRingItems.push({ type: "node", label: "☋", deg: (nodeAbs + 180) % 360, color: "#000000", aScreen: eclToScreenAngle((nodeAbs + 180) % 360, house1RefAbs) });
  }
  if (syzAbs > 0) {
    outerRingItems.push({ type: "syzygy", label: "SIZ", deg: syzAbs, color: "#000000", aScreen: eclToScreenAngle(syzAbs, house1RefAbs) });
  }
  lotes.forEach(lot => {
    outerRingItems.push({ type: "lot", label: lot.label, lotType: lot.type, sym: lot.sym, deg: lot.deg, color: goldColor, aScreen: eclToScreenAngle(lot.deg, house1RefAbs) });
  });

  aplicarEmpilhamentoRadial(outerRingItems, 7.5);
  aplicarDesvioLateralLotes(outerRingItems, 6);

  const latPxPerGrau = 12;
  const pR = 390;
  const R = { Aspects: 110, SignSector: 215, Dodec: 238, Termos: 262 };
  const R_OuterLine = 399;

  const degToPxPR = (2 * Math.PI * pR) / 360;
  const rSobRaiosGlow = degToPxPR * 15;
  let maxRaioItens = pR + rSobRaiosGlow;
  outerRingItems.forEach(item => {
    if (item.type === 'lot') return;
    const base = item.type === 'planet' ? pR + (item.eclLat * latPxPerGrau) : pR;
    const raio = base + (item.rOffset || 0);
    if (raio > maxRaioItens) maxRaioItens = raio;
  });
  const R_canvas = Math.max(maxRaioItens + 50, R_OuterLine + 40);
  const cx = R_canvas, cy = R_canvas;
  const canvasSize = R_canvas * 2;

  let svg = `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; margin: 0 auto;">
      <defs>${construirDefsPlanetasZR(sufixo)}</defs>
      <rect width="${canvasSize}" height="${canvasSize}" fill="#ffffff"/>`;

  function desenharFatiaDestaque(signIdx, cor) {
    if (signIdx === null || signIdx === undefined) return '';
    const angInicial = eclToScreenAngle(signIdx * 30, house1RefAbs);
    const passos = 15;
    let d = `M ${cx} ${cy} `;
    for (let s = 0; s <= passos; s++) {
      const p = polarToCart(cx, cy, R_OuterLine, angInicial - (30 * s / passos));
      d += `L ${p.x} ${p.y} `;
    }
    d += 'Z';
    return `<path d="${d}" fill="${cor}"/>`;
  }

  svg += desenharFatiaDestaque(highlightMesAbertoSignIdx, "rgba(224, 231, 255, 0.6)");
  svg += desenharFatiaDestaque(profectedSignIdx, "rgba(163, 230, 53, 0.4)");
  svg += desenharFatiaDestaque(highlightAscSignIdx, "rgba(254, 240, 138, 0.5)");

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Aspects}" fill="#ffffff" stroke="${goldColor}" stroke-width="2"/>`;

  const occupiedSigns = new Set();
  PLANETS_DEF.forEach(p => { occupiedSigns.add(Math.floor(pObj[p.id].abs / 30)); });
  const occupiedArray = Array.from(occupiedSigns);
  for (let i = 0; i < occupiedArray.length; i++) {
    for (let j = i + 1; j < occupiedArray.length; j++) {
      let diff = Math.abs(occupiedArray[i] - occupiedArray[j]);
      if (diff > 6) diff = 12 - diff;
      let col = null;
      if (diff === 6) col = "#881337";
      else if (diff === 4) col = "#1d4ed8";
      else if (diff === 3) col = "#e84118";
      else if (diff === 2) col = "#0ea5e9";
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

  const rEixoInterno = R.SignSector - 12;
  const eixosInternos = [
    { label: "ASC", deg: ascAbs, color: "#000000" },
    { label: "DSC", deg: (ascAbs + 180) % 360, color: "#000000" },
    { label: "MC", deg: mcAbs, color: "#000000" },
    { label: "IC", deg: (mcAbs + 180) % 360, color: "#000000" }
  ];
  eixosInternos.forEach(eixo => {
    const aScreen = eclToScreenAngle(eixo.deg, house1RefAbs);
    const pPos = polarToCart(cx, cy, rEixoInterno, aScreen);
    svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="${eixo.color}" stroke-width="1.8"/>
        <text x="0" y="3.5" font-size="9" font-weight="900" fill="${eixo.color}" text-anchor="middle">${eixo.label}</text>
        <text x="0" y="18" font-size="8" font-weight="bold" fill="#0f172a" text-anchor="middle" stroke="#ffffff" stroke-width="3" paint-order="stroke fill">${formatDegMin(eixo.deg)}</text>
    </g>`;
  });

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
      svg += `<text x="${pTerm.x}" y="${pTerm.y + 4}" font-size="10" font-weight="bold" fill="${goldColor}" text-anchor="middle">${term.p}</text>`;
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

  function desenharFaixaDestaque(signIdx, cor, rInterno, rExterno) {
    if (signIdx === null || signIdx === undefined) return '';
    const angInicial = eclToScreenAngle(signIdx * 30, house1RefAbs);
    const passos = 15;
    const pontosFora = [];
    for (let s = 0; s <= passos; s++) pontosFora.push(polarToCart(cx, cy, rExterno, angInicial - (30 * s / passos)));
    const pontosDentro = [];
    for (let s = passos; s >= 0; s--) pontosDentro.push(polarToCart(cx, cy, rInterno, angInicial - (30 * s / passos)));
    const pontos = pontosFora.concat(pontosDentro);
    const d = pontos.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return `<path d="${d}" fill="${cor}"/>`;
  }

  svg += desenharFaixaDestaque(highlightMesAbertoSignIdx, "#6366f1", R_OuterLine + 4, R_OuterLine + 12);
  svg += desenharFaixaDestaque(profectedSignIdx, "#65a30d", R_OuterLine + 14, R_OuterLine + 22);
  svg += desenharFaixaDestaque(highlightAscSignIdx, "#eab308", R_OuterLine + 24, R_OuterLine + 32);

  const sunItem = outerRingItems.find(it => it.type === 'planet' && it.id === 'Sun');
  if (sunItem) {
    const sunGlowPos = polarToCart(cx, cy, pR, sunItem.aScreen);
    svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaiosGlow}" fill="#ffffff"/>`;
    svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaiosGlow}" fill="url(#combustionGlow_${sufixo})"/>`;
  }

  outerRingItems.forEach(item => {
    if (item.type === 'planet') return;
    const raioEfetivo = (item.type === 'lot' ? 276 : pR) + (item.rOffset || 0);
    const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
    const p2 = polarToCart(cx, cy, (item.type === 'lot' ? raioEfetivo - 12 : raioEfetivo - 19), item.aShift);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${item.color}" stroke-width="1.2"/>`;

    const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
    if (item.type === "node") {
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
        svg += `<circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#103b70" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#103b70" stroke-width="1.5"/>`;
      } else if (item.lotType === "spirit") {
        svg += `<text x="0" y="5" font-size="34" font-weight="400" font-family="'Montserrat', sans-serif" fill="#103b70" text-anchor="middle" stroke="#ffffff" stroke-width="2" paint-order="stroke fill">Φ</text>`;
      } else {
        svg += `<circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">${item.sym}</text>`;
      }
      svg += `<text x="0" y="17" font-size="8" font-weight="bold" fill="#000000" text-anchor="middle" stroke="#ffffff" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text></g>`;
    }
  });

  const ORDEM_CALDAICA = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  outerRingItems
    .filter(item => item.type === 'planet')
    .sort((a, b) => ORDEM_CALDAICA.indexOf(a.id) - ORDEM_CALDAICA.indexOf(b.id))
    .forEach(item => {
      const raioEfetivo = pR + (item.eclLat * latPxPerGrau) + (item.rOffset || 0);
      const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
      const p2 = polarToCart(cx, cy, raioEfetivo - 19, item.aShift);
      svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#94a3b8" stroke-width="1.2"/>`;

      const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
      const planetSvgContent = fragmentoPlaneta3DZR(item.id, sufixo);
      let retroSymbol = item.retro ? `<tspan fill="#dc2626" font-weight="900"> ℞</tspan>` : '';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
          <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
          <text x="0" y="27" font-size="10.5" font-weight="800" fill="#0f172a" text-anchor="middle" stroke="#ffffff" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
      </g>`;
    });

  if (profectedSignIdx !== null && SIGNS_RULERS_ZR[profectedSignIdx]) {
    const rulerId = SIGNS_RULERS_ZR[profectedSignIdx];
    const rulerItem = outerRingItems.find(it => it.type === 'planet' && it.id === rulerId);
    if (rulerItem) {
      const raioEfetivo = pR + (rulerItem.eclLat * latPxPerGrau) + (rulerItem.rOffset || 0);
      const pCoroa = polarToCart(cx, cy, raioEfetivo, rulerItem.aShift);
      svg += `<g transform="translate(${pCoroa.x}, ${pCoroa.y - 17})">
          <path d="M -9,5 L -9,-2 L -4.5,2.5 L 0,-7 L 4.5,2.5 L 9,-2 L 9,5 Z" fill="#f5c518" stroke="#a8790a" stroke-width="0.9" stroke-linejoin="round"/>
          <circle cx="0" cy="-7" r="1.6" fill="#dc2626"/>
          <circle cx="-9" cy="-2" r="1.3" fill="#dc2626"/>
          <circle cx="9" cy="-2" r="1.3" fill="#dc2626"/>
      </g>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

function iniciarModuloLiberacao() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  renderLiberacaoUI();
}

function alternarLoteLiberacao(lotKey) {
  selectedZRPhase = lotKey;
  expandedL1Index = null;
  expandedL2Key = null;
  expandedL3Key = null;
  renderLiberacaoUI();
}

function alternarL1Accordion(index) {
  expandedL1Index = (expandedL1Index === index) ? null : index;
  expandedL2Key = null;
  expandedL3Key = null;
  renderLiberacaoUI();
}

function alternarL2Accordion(l1Idx, l2Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}`;
  expandedL2Key = (expandedL2Key === key) ? null : key;
  expandedL3Key = null;
  renderLiberacaoUI();
}

function alternarL3Accordion(l1Idx, l2Idx, l3Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}_${l3Idx}`;
  expandedL3Key = (expandedL3Key === key) ? null : key;
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

// FORMATAÇÃO COM DATA E HORÁRIO EMPILHADOS PARA L3 E L4
function formatarDataHoraBR(data) {
  if (!data) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  const hh = String(data.getHours()).padStart(2, '0');
  const mm = String(data.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${a}<br><span style="font-size: 9px; opacity: 0.8; font-weight: 500;">${hh}:${mm}h</span>`;
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

// CÁLCULO DOS SUBPERÍODOS DO L3 (Cada unidade do signo = 2.5 dias)
function calcularSubperiodosL3(l2SignIdx, l2Start, l2End) {
  const subperiodos = [];
  let currSign = l2SignIdx;
  let currStart = new Date(l2Start);
  let count = 0;

  while (currStart < l2End) {
    if (count === 12) {
      currSign = (l2SignIdx + 6) % 12; // Salto (Lysis)
    }

    const yearsVal = ZR_SIGN_YEARS[currSign];
    const totalDaysL3 = yearsVal * 2.5;
    let currEnd = new Date(currStart.getTime() + totalDaysL3 * 24 * 60 * 60 * 1000);

    let isClamped = false;
    if (currEnd > l2End) {
      currEnd = new Date(l2End);
      isClamped = true;
    }

    subperiodos.push({
      signIdx: currSign,
      days: totalDaysL3,
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

// CÁLCULO DOS SUBPERÍODOS DO L4 (Cada unidade do signo = 5 horas)
function calcularSubperiodosL4(l3SignIdx, l3Start, l3End) {
  const subperiodos = [];
  let currSign = l3SignIdx;
  let currStart = new Date(l3Start);
  let count = 0;

  while (currStart < l3End) {
    if (count === 12) {
      currSign = (l3SignIdx + 6) % 12; // Salto (Lysis)
    }

    const yearsVal = ZR_SIGN_YEARS[currSign];
    const totalHoursL4 = yearsVal * 5;
    let currEnd = new Date(currStart.getTime() + totalHoursL4 * 60 * 60 * 1000);

    let isClamped = false;
    if (currEnd > l3End) {
      currEnd = new Date(l3End);
      isClamped = true;
    }

    subperiodos.push({
      signIdx: currSign,
      hours: totalHoursL4,
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
  const signoEspirito = Math.floor(lotes.find(l => l.key === "spirit").deg / 30);
  let startSignIdx;
  if (selectedZRPhase === "spirit" && signoEspirito === fortSignIdx) {
    // Valens, Anthology IV.V: quando Espírito e Fortuna caem no mesmo signo
    // (Lua Nova/Cheia exata), a contagem de L1 do Espírito começa no signo seguinte.
    startSignIdx = (signoEspirito + 1) % 12;
  } else {
    startSignIdx = Math.floor(activeLotObj.deg / 30);
  }

  // DETECÇÃO AUTOMÁTICA DO L1 ATIVO SE NENHUM ESTIVER EXPANDIDO MANUALMENTE
  const hoje = new Date();
  if (expandedL1Index === null) {
    let checkStart = new Date(currentMoment);
    for (let i = 0; i < 12; i++) {
      const currSign = (startSignIdx + i) % 12;
      const durationYears = ZR_SIGN_YEARS[currSign];
      const checkEnd = calcularDataFimZR(checkStart, durationYears);

      if (hoje >= checkStart && hoje < checkEnd) {
        expandedL1Index = i;
        break;
      }
      checkStart = new Date(checkEnd);
    }
    if (expandedL1Index === null) expandedL1Index = 0; // Fallback
  }

  // DETECÇÃO AUTOMÁTICA DO L2/L3 ATIVOS (mesmo princípio do L1: já abre no
  // subperíodo do momento atual, em cascata, sem precisar clicar).
  if (expandedL2Key === null || expandedL3Key === null) {
    let l1Start = new Date(currentMoment);
    let l1Sign = startSignIdx;
    let l1Years = ZR_SIGN_YEARS[l1Sign];
    for (let i = 0; i <= expandedL1Index; i++) {
      const currSign = (startSignIdx + i) % 12;
      const durationYears = ZR_SIGN_YEARS[currSign];
      const currentEnd = calcularDataFimZR(l1Start, durationYears);
      if (i === expandedL1Index) {
        l1Sign = currSign;
        l1Years = durationYears;
      } else {
        l1Start = new Date(currentEnd);
      }
    }

    const subperiodosL2Auto = calcularSubperiodosL2(l1Sign, l1Start, l1Years);

    if (expandedL2Key === null) {
      const idxL2 = subperiodosL2Auto.findIndex(sub => hoje >= sub.start && hoje < sub.end);
      if (idxL2 !== -1) expandedL2Key = `${expandedL1Index}_${idxL2}`;
    }

    if (expandedL2Key !== null && expandedL3Key === null) {
      const [l1IdxKey, l2IdxKey] = expandedL2Key.split('_').map(Number);
      if (l1IdxKey === expandedL1Index) {
        const l2Sub = subperiodosL2Auto[l2IdxKey];
        if (l2Sub) {
          const subperiodosL3Auto = calcularSubperiodosL3(l2Sub.signIdx, l2Sub.start, l2Sub.end);
          const idxL3 = subperiodosL3Auto.findIndex(sub => hoje >= sub.start && hoje < sub.end);
          if (idxL3 !== -1) expandedL3Key = `${l1IdxKey}_${l2IdxKey}_${idxL3}`;
        }
      }
    }
  }

  const lotesInfo = [
    { key: "fortune" },
    { key: "spirit" },
    { key: "venus" },
    { key: "mercury" },
    { key: "mars" },
    { key: "jupiter" },
    { key: "saturn" }
  ];

  const loteLabelsZR = {
    fortune: "Lote da Fortuna", spirit: "Lote do Espírito", venus: "Lote de Eros",
    mercury: "Lote da Necessidade", mars: "Lote da Audácia", jupiter: "Lote da Vitória", saturn: "Lote de Némesis"
  };

  /* CABEÇALHO COM OS MESMOS DADOS DO MAPA (mesma fonte que a mandala usa) */
  const headerTitle = currentCustomCode ? `${currentCustomCode} ${currentSubjectName}` : currentSubjectName;
  const diasSemanaZRLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diaSemanaFormatted = diasSemanaZRLabels[currentMoment.getDay()];
  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
  const anoH = currentMoment.getFullYear();
  const mesH = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const diaH = String(currentMoment.getDate()).padStart(2, '0');
  const horaH = String(currentMoment.getHours()).padStart(2, '0');
  const minH = String(currentMoment.getMinutes()).padStart(2, '0');

  const loteMenuRowsHTML = lotesInfo.map(l => {
    const label = loteLabelsZR[l.key] || l.key;
    return `<div onclick="alternarLoteLiberacao('${l.key}')" title="${escapeHtml(label)}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center; color: #103b70;">${getLotIconSVG(l.key)}</div>`;
  }).join('');

  let html = `
    <div style="width: 100%;">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px; padding: 0 20px;">
        <button onclick="capturarTelaParaRelatorio('liberacao_' + selectedZRPhase, 'liberacao-container', 'Liberação Zodiacal — ' + (typeof RELATORIO_LOT_NOMES !== 'undefined' ? RELATORIO_LOT_NOMES[selectedZRPhase] : selectedZRPhase))" title="Adiciona esta tela, exatamente do jeito que está agora (para o lote ativo), como um bloco no Relatório" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif;">
          <i class="fa-solid fa-file-circle-plus"></i> Adicionar ao Relatório
        </button>
      </div>
    <div class="lib-outer" id="liberacao-container" style="width: 100%; min-height: 100%; padding: 20px; background-color: #fffdf5; font-family: 'Montserrat', sans-serif;">

      <h3 class="lib-titulo" style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; margin-top: 0; margin-bottom: 10px; text-align: center; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">
        Liberação Zodiacal
      </h3>

      <!-- CABEÇALHO PADRÃO: mesmo contorno/fundo do cabeçalho da mandala (creme #fffdf5, borda dourada #c59b27), 2 linhas à esquerda + seletor do lote ativo à direita (mesma caixa/menu com rolagem e ícones já usada em Decênios e Circumambulações) -->
      <div class="lib-cabecalho" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; background: #fffdf5; border: 2px solid #c59b27; border-radius: 10px; padding: 10px 16px;">
        <div>
          <div style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 15px; color: #103b70;">${escapeHtml(headerTitle)}</div>
          <div style="font-size: 11.5px; color: #475569; font-weight: 500; margin-top: 2px;">${diaSemanaFormatted} • ${diaH}/${mesH}/${anoH} às ${horaH}:${minH} (${fusoFormatted}) • ${escapeHtml(currentGeo.city)}</div>
        </div>
        <div style="position: relative; flex-shrink: 0;">
          <button type="button" onclick="const menu=document.getElementById('liberacaoLoteMenu'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: 38px; height: 38px; border-radius: 6px; background: #fffdf5; color: #103b70; border: 1px solid #c59b27; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Lote Ativo">
            ${getLotIconSVG(selectedZRPhase)}
          </button>
          <div id="liberacaoLoteMenu" style="display: none; position: absolute; top: 42px; right: 0; background: #fffdf5; border: 1px solid #c59b27; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 40px; max-height: 220px; overflow-y: auto; box-sizing: border-box;">
            ${loteMenuRowsHTML}
          </div>
        </div>
      </div>

      <div style="width: 100%; margin: 0 0 20px; background: #fffdf7; border: 1.5px solid #c59b27; border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); box-sizing: border-box;">
        <div style="text-align: center; font-family: 'Cinzel', serif; font-size: 12px; color: #103b70; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Mapa Natal — Casa 1: ${escapeHtml(loteLabelsZR[selectedZRPhase] || selectedZRPhase)}</div>
        ${gerarMandalaNatalZR(currentCalculatedData, { loteCasa1: selectedZRPhase })}
      </div>
  `;

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
        <div onclick="alternarL1Accordion(${i})" style="padding: 12px 16px; background: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none; border-bottom: ${isExpanded ? '1px solid #1e5fa4' : 'none'};">
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
        <div style="padding: 10px; background: #ffffff;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #1e5fa4; border-radius: 6px; overflow: hidden; font-size: 12px; text-align: center; background: #ffffff;">
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
          <tr onclick="alternarL2Accordion(${i}, ${sIdx}, event)" style="border-bottom: 1px solid #1e5fa4; background-color: ${isL2Expanded ? '#fefcf2' : bgRow}; cursor: pointer;">
            <td style="padding: 8px; text-align: center;">${getSignSVGZR(sub.signIdx, 20)}</td>
            <td style="padding: 8px; font-weight: 600; color: #103b70;">${sub.months} Meses (${sub.days} Dias)</td>
            <td style="padding: 8px; color: #334155;">${formatarDataBR(sub.start)}</td>
            <td style="padding: 8px; color: #334155;">${formatarDataBR(sub.end)}</td>
            <td style="padding: 8px; text-align: center;">${statusL2}</td>
          </tr>
        `;

        if (isL2Expanded) {
          const subperiodosL3 = calcularSubperiodosL3(sub.signIdx, sub.start, sub.end);
          html += `
            <tr>
              <td colspan="5" style="padding: 8px 12px; background: #faf8f0; border-bottom: 1px solid #e5d5a1;">
                <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #103b70; border-radius: 6px; overflow: hidden; font-size: 11px; text-align: center; background: #ffffff;">
                  <thead>
                    <tr style="background-color: #103b70; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
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
            const isL3Expanded = (expandedL3Key === `${i}_${sIdx}_${l3Idx}`);
            const bgRowL3 = l3Idx % 2 === 0 ? '#ffffff' : '#f0f4f9';
            const isPeakL3 = angularSignsFromFort.includes(subL3.signIdx);

            let statusL3 = "";
            if (subL3.isLysis) {
              statusL3 += `<span style="background: #fee2e2; color: #991b1b; border: 1px solid #f87171; padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 8px; margin-right: 4px;">SALTO</span>`;
            }
            if (isPeakL3) {
              statusL3 += `<span style="background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 8px;">PICO</span>`;
            }

            html += `
              <tr onclick="alternarL3Accordion(${i}, ${sIdx}, ${l3Idx}, event)" style="border-bottom: 1px solid #cbd5e1; background-color: ${isL3Expanded ? '#e0e7ff' : bgRowL3}; cursor: pointer;">
                <td style="padding: 6px; text-align: center;">${getSignSVGZR(subL3.signIdx, 18)}</td>
                <td style="padding: 6px; font-weight: 600; color: #103b70;">${subL3.days} Dias</td>
                <td style="padding: 6px; color: #334155; line-height: 1.2;">${formatarDataHoraBR(subL3.start)}</td>
                <td style="padding: 6px; color: #334155; line-height: 1.2;">${formatarDataHoraBR(subL3.end)}</td>
                <td style="padding: 6px; text-align: center;">${statusL3}</td>
              </tr>
            `;

            if (isL3Expanded) {
              const subperiodosL4 = calcularSubperiodosL4(subL3.signIdx, subL3.start, subL3.end);
              html += `
                <tr>
                  <td colspan="5" style="padding: 6px 10px; background: #transparent; border-bottom: 1px solid #cbd5e1;">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #94a3b8; border-radius: 6px; overflow: hidden; font-size: 10px; text-align: center; background: #ffffff;">
                      <thead>
                        <tr style="background-color: #475569; color: #ffffff; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 8px; letter-spacing: 0.5px;">
                          <th style="padding: 5px;">L4 Subperíodo</th>
                          <th style="padding: 5px;">Duração</th>
                          <th style="padding: 5px;">Início</th>
                          <th style="padding: 5px;">Término</th>
                          <th style="padding: 5px;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
              `;

              subperiodosL4.forEach((subL4, l4Idx) => {
                const bgRowL4 = l4Idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                const isPeakL4 = angularSignsFromFort.includes(subL4.signIdx);

                let statusL4 = "";
                if (subL4.isLysis) {
                  statusL4 += `<span style="background: #fee2e2; color: #991b1b; border: 1px solid #f87171; padding: 1px 4px; border-radius: 3px; font-weight: 700; font-size: 7px; margin-right: 3px;">SALTO</span>`;
                }
                if (isPeakL4) {
                  statusL4 += `<span style="background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 1px 4px; border-radius: 3px; font-weight: 700; font-size: 7px;">PICO</span>`;
                }

                html += `
                  <tr style="border-bottom: 1px solid #cbd5e1; background-color: ${bgRowL4};">
                    <td style="padding: 5px; text-align: center;">${getSignSVGZR(subL4.signIdx, 16)}</td>
                    <td style="padding: 5px; font-weight: 600; color: #103b70;">${subL4.hours} Horas</td>
                    <td style="padding: 5px; color: #334155; line-height: 1.2;">${formatarDataHoraBR(subL4.start)}</td>
                    <td style="padding: 5px; color: #334155; line-height: 1.2;">${formatarDataHoraBR(subL4.end)}</td>
                    <td style="padding: 5px; text-align: center;">${statusL4}</td>
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
  encolherTabelasLZRVisiveis(container);
}

/* ENCOLHE TABELAS LARGAS DEMAIS (L2/L3/L4) PARA CABEREM NA TELA (SEM CORTE),
   EM VEZ DE FICAREM TRAVADAS/CORTADAS EM TELAS ESTREITAS — mesma técnica
   usada nos Decênios e no Painel Técnico. Como essas tabelas usam
   width:100% para preencher o cartão no desktop, primeiro mede a largura
   "natural" sem essa restrição: se já coubesse do jeito de sempre, não
   mexe em nada (zero mudança visual em telas largas). */
function encolherTabelaLZR(table) {
  if (!table || table.dataset.zrScaled === '1') return;
  const parent = table.parentElement;
  if (!parent) return;

  const parentStyles = getComputedStyle(parent);
  const availableWidth = parent.clientWidth
    - parseFloat(parentStyles.paddingLeft || 0)
    - parseFloat(parentStyles.paddingRight || 0);
  if (availableWidth <= 0) return;

  const larguraOriginal = table.style.width;
  table.style.width = 'auto';
  const naturalWidth = table.offsetWidth;

  if (naturalWidth <= availableWidth) {
    table.style.width = larguraOriginal;
    return;
  }

  const naturalHeight = table.offsetHeight;
  const escala = availableWidth / naturalWidth;
  const scaledHeight = naturalHeight * escala;

  const outerScroll = document.createElement('div');
  outerScroll.style.textAlign = 'center';
  const scaleBox = document.createElement('div');
  scaleBox.style.display = 'inline-block';
  scaleBox.style.width = (naturalWidth * escala) + 'px';
  scaleBox.style.height = scaledHeight + 'px';

  table.parentNode.insertBefore(outerScroll, table);
  outerScroll.appendChild(scaleBox);
  scaleBox.appendChild(table);

  table.style.transformOrigin = 'top left';
  table.style.transform = `scale(${escala})`;
  table.dataset.zrScaled = '1';
  // Contorna uma peculiaridade do navegador: um contêiner ao redor de uma
  // <table> transformada pode calcular a própria altura com base no
  // tamanho ANTES da escala, sobrando um espaço vazio grande abaixo dela.
  outerScroll.style.height = scaledHeight + 'px';
}

function encolherTabelasLZRVisiveis(root) {
  if (!root) return;
  root.querySelectorAll('table:not([data-zr-scaled="1"])').forEach(t => {
    if (t.offsetParent !== null) encolherTabelaLZR(t);
  });
}
