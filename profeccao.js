(function() {
    window.profeccaoOffsetAnos = 0;
    window.expandedProfeccaoMes = undefined; // Guarda o índice do mês aberto (0 a 11)

    window.mudarAnoProfeccao = function(delta) {
        window.profeccaoOffsetAnos += delta;
        window.expandedProfeccaoMes = null; // Reseta para recalcular o mês ativo no novo ano
        if (typeof window.iniciarModuloProfeccao === 'function') {
            window.iniciarModuloProfeccao();
        }
    };

    window.alternarMesProfeccao = function(index) {
    window.expandedProfeccaoMes = (window.expandedProfeccaoMes === index) ? -1 : index;
    if (typeof window.iniciarModuloProfeccao === 'function') {
        window.iniciarModuloProfeccao();
    }
};

    const SIGNS = [
        { ruler: "Mars", rulerName: "Marte" },
        { ruler: "Venus", rulerName: "Vênus" },
        { ruler: "Mercury", rulerName: "Mercúrio" },
        { ruler: "Moon", rulerName: "Lua" },
        { ruler: "Sun", rulerName: "Sol" },
        { ruler: "Mercury", rulerName: "Mercúrio" },
        { ruler: "Venus", rulerName: "Vênus" },
        { ruler: "Mars", rulerName: "Marte" },
        { ruler: "Jupiter", rulerName: "Júpiter" },
        { ruler: "Saturn", rulerName: "Saturno" },
        { ruler: "Saturn", rulerName: "Saturno" },
        { ruler: "Jupiter", rulerName: "Júpiter" }
    ];

    const SIGN_ELEMENTS = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
    const ELEMENT_SIGN_COLORS = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

    const MONOLINE_ZODIAC_SVGS = [
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

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const MONTH_MS = (30 + (10.5 / 24)) * MS_PER_DAY;

    function getSignSvgHtml(signIdx, size = 18) {
        const color = ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[signIdx]];
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; display: inline-block; vertical-align: middle;">${MONOLINE_ZODIAC_SVGS[signIdx]}</svg>`;
    }

    function getPlanet3DSVG(planetId, size = 34) {
        if (typeof estiloPlanetasEsferico === 'function' && !estiloPlanetasEsferico()) {
            return getPlanetSimpleSVG(planetId, size);
        }
        const planetSVGs = {
            Sun: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pSun" cx="35%" cy="32%" r="68%"><stop offset="0%" stop-color="#fffbeb" /><stop offset="25%" stop-color="#fde047" /><stop offset="60%" stop-color="#f59e0b" /><stop offset="88%" stop-color="#d97706" /><stop offset="100%" stop-color="#92400e" /></radialGradient></defs>
                <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25"/><circle cx="50" cy="50" r="42" fill="url(#pSun)"/><ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/><text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☉</text>
            </svg>`,
            Moon: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pMoon" cx="32%" cy="28%" r="70%"><stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#e2e8f0" /><stop offset="65%" stop-color="#94a3b8" /><stop offset="90%" stop-color="#475569" /><stop offset="100%" stop-color="#1e293b" /></radialGradient></defs>
                <circle cx="50" cy="50" r="42" fill="url(#pMoon)"/><circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/><circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/><circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/><circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/><ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/><text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☽</text>
            </svg>`,
            Mercury: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pMerc" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fef08a" /><stop offset="28%" stop-color="#d97706" /><stop offset="65%" stop-color="#92400e" /><stop offset="92%" stop-color="#451a03" /><stop offset="100%" stop-color="#270e02" /></radialGradient></defs>
                <circle cx="50" cy="50" r="42" fill="url(#pMerc)"/><ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/><circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/><text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☿</text>
            </svg>`,
            Venus: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pVen" cx="34%" cy="30%" r="68%"><stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="65%" stop-color="#f59e0b" /><stop offset="90%" stop-color="#b45309" /><stop offset="100%" stop-color="#78350f" /></radialGradient></defs>
                <circle cx="50" cy="50" r="42" fill="url(#pVen)"/><ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/><circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/><text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♀</text>
            </svg>`,
            Mars: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pMars" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fca5a5" /><stop offset="25%" stop-color="#ef4444" /><stop offset="60%" stop-color="#b91c1c" /><stop offset="88%" stop-color="#7f1d1d" /><stop offset="100%" stop-color="#450a0a" /></radialGradient></defs>
                <circle cx="50" cy="50" r="42" fill="url(#pMars)"/><ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/><ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/><circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/><text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♂</text>
            </svg>`,
            Jupiter: `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pJup" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fffbeb" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="58%" stop-color="#d4a373" /><stop offset="82%" stop-color="#a97142" /><stop offset="100%" stop-color="#6f4518" /></radialGradient><clipPath id="clipJupP"><circle cx="50" cy="50" r="42" /></clipPath></defs>
                <circle cx="50" cy="50" r="42" fill="url(#pJup)"/><g clip-path="url(#clipJupP)" opacity="0.45"><rect x="0" y="24" width="100" height="6" fill="#8c531b" /><rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" /><rect x="0" y="49" width="100" height="11" fill="#783d19" /><rect x="0" y="64" width="100" height="6" fill="#8c531b" /><rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" /></g><ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/><text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♃</text>
            </svg>`,
            Saturn: `<svg width="${Math.round(size * 1.11)}" height="${size}" viewBox="-15 0 130 100" style="display: inline-block; vertical-align: middle;">
                <defs><radialGradient id="pSat" cx="35%" cy="30%" r="68%"><stop offset="0%" stop-color="#fef9c3" /><stop offset="35%" stop-color="#fde047" /><stop offset="70%" stop-color="#ca8a04" /><stop offset="92%" stop-color="#854d0e" /><stop offset="100%" stop-color="#422006" /></radialGradient><linearGradient id="pRings" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" /><stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" /><stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" /><stop offset="85%" stop-color="#64748b" stop-opacity="0.9" /><stop offset="100%" stop-color="#334155" stop-opacity="0.95" /></linearGradient></defs>
                <g transform="rotate(-22 50 50)"><ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#pRings)" stroke-width="5.5" opacity="0.95" /><ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/></g><circle cx="50" cy="50" r="36" fill="url(#pSat)"/><g transform="rotate(-22 50 50)"><path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#pRings)" stroke-width="5.5" /><path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/></g><ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/><text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♄</text>
            </svg>`
        };
        return planetSVGs[planetId] || '';
    }

    function escapeHtmlProf(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatarData(time) {
        const d = new Date(time);
        if (isNaN(d.getTime())) return "-";
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();
        const hora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return `${diasSemana[d.getDay()]}, ${dia}/${mes}/${ano} às ${hora}:${min}`;
    }

    /* ===== A PARTIR DAQUI: PORTADO DE mandala.js (mesma lógica de desenho,
       mesmos anéis/hastes/ticks dourados, aspectos, dodecatemoria, termos
       egípcios, lotes herméticos, planetas em SVG 3D com sombra e mancha de
       combustão), só sem a faixa de céu/espaço sideral — não cabe numa
       miniatura. Cópia deliberada, para gerar duas mandalas independentes
       (natal e RS) com a MESMA cara da mandala principal. Não toca em
       mandala.js. */

    const PLANETS_DEF = [
        { id: "Sun", key: "Sol" },
        { id: "Moon", key: "Lua" },
        { id: "Mercury", key: "Mercúrio" },
        { id: "Venus", key: "Vênus" },
        { id: "Mars", key: "Marte" },
        { id: "Jupiter", key: "Júpiter" },
        { id: "Saturn", key: "Saturno" }
    ];

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
        [{ p: "☿", deg: 7 }, { p: "♀", deg: 13 }, { p: "♃", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
        [{ p: "♀", deg: 12 }, { p: "♃", deg: 16 }, { p: "☿", deg: 19 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }]
    ];

    function eclToScreenAngle(eclDeg, refAbs) {
        return (180 - (eclDeg - refAbs) + 36000) % 360;
    }

    function polarToCart(cx, cy, r, angleDeg) {
        const rad = angleDeg * Math.PI / 180.0;
        return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
    }

    function formatDegMin(absDeg) {
        const normDeg = (absDeg % 360 + 360) % 360;
        const degInSign = normDeg % 30;
        const degrees = Math.floor(degInSign);
        const minutes = Math.round((degInSign - degrees) * 60);
        const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${degrees}°${minStr}′`;
    }

    function calculateSevenLots(ascAbs, isDay, planetObj) {
        const sun = planetObj.Sun.abs;
        const moon = planetObj.Moon.abs;
        const merc = planetObj.Mercury.abs;
        const ven = planetObj.Venus.abs;
        const mars = planetObj.Mars.abs;
        const jup = planetObj.Jupiter.abs;
        const sat = planetObj.Saturn.abs;

        const fortAbs = ((isDay ? (ascAbs + moon - sun) : (ascAbs + sun - moon)) + 36000) % 360;
        const spirAbs = ((isDay ? (ascAbs + sun - moon) : (ascAbs + moon - sun)) + 36000) % 360;
        const erosAbs = ((isDay ? (ascAbs + ven - spirAbs) : (ascAbs + spirAbs - ven)) + 36000) % 360;
        const necAbs = ((isDay ? (ascAbs + fortAbs - merc) : (ascAbs + merc - fortAbs)) + 36000) % 360;
        const courAbs = ((isDay ? (ascAbs + fortAbs - mars) : (ascAbs + mars - fortAbs)) + 36000) % 360;
        const vicAbs = ((isDay ? (ascAbs + jup - spirAbs) : (ascAbs + spirAbs - jup)) + 36000) % 360;
        const nemAbs = ((isDay ? (ascAbs + fortAbs - sat) : (ascAbs + sat - fortAbs)) + 36000) % 360;

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

    function aplicarEmpilhamentoRadial(items, distMinimaGraus = 6.5, passoRadial = 22) {
        if (!items || items.length === 0) return;
        items.forEach(it => { it.aShift = it.aScreen; it.rOffset = 0; });

        const naEcliptica = items.filter(it => it.type !== 'lot').sort((a, b) => a.aScreen - b.aScreen);
        if (naEcliptica.length === 0) return;

        const grupos = [[naEcliptica[0]]];
        for (let i = 1; i < naEcliptica.length; i++) {
            if (naEcliptica[i].aScreen - naEcliptica[i - 1].aScreen < distMinimaGraus) {
                grupos[grupos.length - 1].push(naEcliptica[i]);
            } else {
                grupos.push([naEcliptica[i]]);
            }
        }

        grupos.forEach(grupo => {
            if (grupo.length <= 1) return;
            const membros = grupo.filter(it => it.id !== 'Sun');
            let camada = 1;
            membros.forEach((item, idx) => {
                const direcao = idx % 2 === 0 ? 1 : -1;
                item.rOffset = direcao * camada * passoRadial;
                if (idx % 2 === 1) camada++;
            });
        });

        const sol = naEcliptica.find(it => it.id === 'Sun');
        if (sol) {
            naEcliptica.forEach(it => {
                let diff = Math.abs(it.deg - sol.deg);
                if (diff > 180) diff = 360 - diff;
                if (diff <= 15) it.rOffset = 0;
            });
        }
    }

    function aplicarDesvioLateralLotes(items, distMinimaGraus = 6) {
        const lotes = items.filter(it => it.type === 'lot').sort((a, b) => a.aScreen - b.aScreen);
        if (lotes.length === 0) return;
        lotes.forEach(it => it.aShift = it.aScreen);

        for (let pass = 0; pass < 12; pass++) {
            for (let i = 0; i < lotes.length - 1; i++) {
                const atual = lotes[i];
                const proximo = lotes[i + 1];
                const diff = proximo.aShift - atual.aShift;
                if (diff < distMinimaGraus) {
                    const overlap = (distMinimaGraus - diff) / 2;
                    atual.aShift -= overlap;
                    proximo.aShift += overlap;
                }
            }
        }
    }

    /* Defs (filtros/gradientes) dos planetas e da mancha de combustão, com IDs
       sufixados por instância — as duas mini-mandalas (RS e natal) coexistem
       na mesma página, então não podem compartilhar os mesmos IDs de SVG. */
    let wheelInstanceCounter = 0;

    function construirDefsPlanetas(sufixo) {
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

    function fragmentoPlaneta3D(planetId, sufixo) {
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

    /* CACHE DOS DADOS COMPLETOS DA REVOLUÇÃO SOLAR, POR ANO-ALVO.
       Evita refazer o fetch toda vez que o usuário troca de mês/passo na tela. */
    const rsFullDataCache = {};

    const SIGNOS_INDEX_RS = {
        "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
        "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
        "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
    };

    function calcularAbsolutoRS(obj) {
        if (!obj) return 0;
        if (obj.grau_absoluto !== undefined && obj.grau_absoluto !== null && obj.grau_absoluto !== 0) {
            return parseFloat(obj.grau_absoluto);
        }
        const idxSigno = SIGNOS_INDEX_RS[obj.signo] !== undefined ? SIGNOS_INDEX_RS[obj.signo] : 0;
        const grauRel = parseFloat(obj.grau_no_signo !== undefined ? obj.grau_no_signo : (obj.grau || 0));
        return (idxSigno * 30) + grauRel;
    }

    function checkRetroRS(pObj) {
        if (!pObj) return false;
        if (pObj.retrogrado !== undefined) return Boolean(pObj.retrogrado);
        if (pObj.velocidade !== undefined) return parseFloat(pObj.velocidade) < 0;
        return false;
    }

    /* BUSCA (COM CACHE) O TIMESTAMP EXATO E O MAPA PLANETÁRIO COMPLETO
       DA REVOLUÇÃO SOLAR DE UM ANO-ALVO, PARA A TABELA DE 60H E PARA A MINI-MANDALA. */
    async function obterDadosCompletosRS(anoAlvo, dataNasc) {
        const lat = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lat) ? currentGeo.lat : -23.5505;
        const lon = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lon) ? currentGeo.lon : -46.6333;
        const fuso = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : -3;

        /* A chave do cache PRECISA incluir os dados de nascimento (não só o
           ano-alvo): sem isso, ao trocar de mapa para uma pessoa cujo ano-alvo
           calculado coincide com um já em cache da pessoa anterior, a
           ferramenta reaproveitava a Revolução Solar errada — misturando
           dados de mapas diferentes ("salada" ao trocar de mapa). */
        const cacheKey = `${anoAlvo}|${dataNasc.getTime()}|${lat}|${lon}|${fuso}`;
        if (rsFullDataCache[cacheKey]) return rsFullDataCache[cacheKey];

        const diaStr = String(dataNasc.getDate()).padStart(2, '0');
        const mesStr = String(dataNasc.getMonth() + 1).padStart(2, '0');
        const dataFormatada = `${dataNasc.getFullYear()}-${mesStr}-${diaStr}`;
        const horaStr = String(dataNasc.getHours()).padStart(2, '0') + ":" + String(dataNasc.getMinutes()).padStart(2, '0');

        const urlSolar = `https://motor-astrologia.vercel.app/api/revolucao?data=${dataFormatada}&hora=${horaStr}&lat=${lat}&lon=${lon}&fuso=${fuso}&ano=${anoAlvo}`;

        const resSolar = await fetch(urlSolar);
        if (!resSolar.ok) return null;
        const apiJson = await resSolar.json();

        const planetas = apiJson.planetas || {};
        const ascData = apiJson.ascendente || {};
        const mcData = apiJson.meio_ceu || {};
        const sizigiaData = apiJson.sizigia || {};

        let horaExataRS = apiJson.momento_exato ? apiJson.momento_exato.hora_local : "";
        let dataExataRS = apiJson.momento_exato ? apiJson.momento_exato.data_utc : "";

        let anoR = anoAlvo, mesR = dataNasc.getMonth(), diaR = dataNasc.getDate(), horaR = 12, minR = 0;

        if (dataExataRS && dataExataRS.includes('-')) {
            const pD = dataExataRS.split('-');
            anoR = parseInt(pD[0]) || anoAlvo;
            mesR = (parseInt(pD[1]) || 1) - 1;
            diaR = parseInt(pD[2]) || dataNasc.getDate();
        }

        if (horaExataRS && horaExataRS.includes(':')) {
            const pH = horaExataRS.split(':');
            horaR = parseInt(pH[0]) || 0;
            minR = parseInt(pH[1]) || 0;
        }

        const resultado = {
            timestamp: new Date(anoR, mesR, diaR, horaR, minR).getTime(),
            dados: {
                Ascendente: { grau_absoluto: calcularAbsolutoRS(ascData) },
                MC: { grau_absoluto: calcularAbsolutoRS(mcData) },
                Nodo_Norte: { grau_absoluto: calcularAbsolutoRS(planetas.NodoNorte), retro: checkRetroRS(planetas.NodoNorte) },
                Sizigia: { grau_absoluto: sizigiaData.grau_absoluto !== undefined ? parseFloat(sizigiaData.grau_absoluto) : 0 },
                Sol: { grau_absoluto: calcularAbsolutoRS(planetas.Sol), retro: false },
                Lua: { grau_absoluto: calcularAbsolutoRS(planetas.Lua), retro: false },
                Mercúrio: { grau_absoluto: calcularAbsolutoRS(planetas.Mercurio), retro: checkRetroRS(planetas.Mercurio) },
                Vênus: { grau_absoluto: calcularAbsolutoRS(planetas.Venus), retro: checkRetroRS(planetas.Venus) },
                Marte: { grau_absoluto: calcularAbsolutoRS(planetas.Marte), retro: checkRetroRS(planetas.Marte) },
                Júpiter: { grau_absoluto: calcularAbsolutoRS(planetas.Jupiter), retro: checkRetroRS(planetas.Jupiter) },
                Saturno: { grau_absoluto: calcularAbsolutoRS(planetas.Saturno), retro: checkRetroRS(planetas.Saturno) }
            }
        };

        rsFullDataCache[cacheKey] = resultado;
        return resultado;
    }

    /* GERA A MANDALA COMPLETA EM SVG — CÓPIA FIEL DO DESENHO DE renderMandala()
       EM mandala.js (aspectos, anel de signos, dodecatemoria, termos egípcios,
       ticks de grau, eixo ASC/DSC/MC/IC, lotes herméticos, planetas em SVG 3D
       com sombra e mancha de combustão), só sem a faixa de céu/espaço sideral. */
    function gerarMandalaSVG(dados, opcoes = {}) {
        if (!dados || !dados.Ascendente) {
            return `<div style="padding: 40px 10px; text-align: center; color: #94a3b8; font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`;
        }

        const profectedSignIdx = (opcoes.profectedSignIdx !== undefined) ? opcoes.profectedSignIdx : null;
        const highlightAscSignIdx = (opcoes.highlightAscSignIdx !== undefined) ? opcoes.highlightAscSignIdx : null;
        const highlightMesAbertoSignIdx = (opcoes.highlightMesAbertoSignIdx !== undefined) ? opcoes.highlightMesAbertoSignIdx : null;

        const goldColor = "#c59b27";
        const sufixo = `w${wheelInstanceCounter++}`;

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
        const house1RefAbs = ascAbs;

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

        let svg = `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 380px; height: auto; display: block; margin: 0 auto;">
            <defs>${construirDefsPlanetas(sufixo)}</defs>
            <rect width="${canvasSize}" height="${canvasSize}" fill="#ffffff"/>`;

        /* DESTAQUE DE SIGNO (fatia inteira, do centro até a borda externa,
           por baixo de todo o resto do desenho) — usado para marcar o signo
           profectado do ano (verde) e, só no mapa natal, o signo onde cai o
           Ascendente da Revolução Solar (amarelo). */
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

        const sunItem = outerRingItems.find(it => it.type === 'planet' && it.id === 'Sun');
        if (sunItem) {
            const sunGlowPos = polarToCart(cx, cy, pR, sunItem.aScreen);
            /* Disco branco opaco por baixo do gradiente: a mancha de combustão é
               parcialmente transparente, então sem isso a fatia verde/amarela do
               signo destacado (desenhada bem atrás) vazaria através dela e sujaria
               o dourado puro da mancha. */
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
                const planetSvgContent = fragmentoPlaneta3D(item.id, sufixo);
                let retroSymbol = item.retro ? `<tspan fill="#dc2626" font-weight="900"> ℞</tspan>` : '';
                svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                    <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
                    <text x="0" y="27" font-size="10.5" font-weight="800" fill="#0f172a" text-anchor="middle" stroke="#ffffff" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
                </g>`;
            });

        /* COROA SOBRE O REGENTE DO SIGNO PROFECTADO DO ANO. */
        if (profectedSignIdx !== null && SIGNS[profectedSignIdx]) {
            const rulerId = SIGNS[profectedSignIdx].ruler;
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

        /* FAIXAS SÓLIDAS NA BORDA EXTERNA — "ETIQUETAS" DE CADA DESTAQUE.
           A fatia transparente lá atrás dá o clima visual, mas quando dois
           destaques caem no mesmo signo a cor de cima acaba disfarçando a
           de baixo. Estas faixas ficam uma do lado da outra, em cores
           sólidas, sem se misturar — dá pra apontar pro cliente exatamente
           quais destaques bateram naquele signo. Desenhadas por último, por
           cima de tudo, pra nunca ficarem encobertas por um planeta que
           tenha sido empurrado além da borda do mapa. */
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

        svg += `</svg>`;
        return svg;
    }

    async function iniciarModuloProfeccao() {
        const container = document.getElementById('mandala-container');
        if (!container) return;

        if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: #dc2626; font-family: sans-serif;">Nenhum mapa carregado no sistema.</div>`;
            return;
        }

        const ascAbs = currentCalculatedData.Ascendente.grau_absoluto;
        const ascIdx = Math.floor(ascAbs / 30);

        let dataNasc = (typeof currentMoment !== 'undefined' && currentMoment instanceof Date) ? currentMoment : new Date();

        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        const m = hoje.getMonth() - dataNasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) idade--;
        if (idade < 0) idade = 0;

        idade += window.profeccaoOffsetAnos;

        const houseNumber = (idade % 12) + 1;
        const profectedSignIdx = (ascIdx + (idade % 12)) % 12;

        const anoAlvoRS = dataNasc.getFullYear() + idade;
        const dadosNatal = currentCalculatedData;
        let rsTimestamp = null;
        let dadosRS = null;

        try {
            const resultadoRS = await obterDadosCompletosRS(anoAlvoRS, dataNasc);
            if (resultadoRS) {
                rsTimestamp = resultadoRS.timestamp;
                dadosRS = resultadoRS.dados;
                window.currentSolarReturnDate = new Date(rsTimestamp);
            }
        } catch (err) {
            console.warn("Falha na busca da Revolução Solar para Profecção:", err);
        }

        const rsAscSignIdx = (dadosRS && dadosRS.Ascendente)
            ? Math.floor((((dadosRS.Ascendente.grau_absoluto % 360) + 360) % 360) / 30)
            : null;

        /* Calendário mensal calculado aqui em cima (antes do HTML das mandalas)
           porque precisamos saber já o signo do mês aberto na tabela, para
           destacá-lo em azul no mapa natal. */
        let baseMonthStart = rsTimestamp;
        if (!baseMonthStart) {
            baseMonthStart = new Date(anoAlvoRS, dataNasc.getMonth(), dataNasc.getDate(), dataNasc.getHours(), dataNasc.getMinutes()).getTime();
        }

        let currentMonthStart = baseMonthStart;
        const monthlyCache = [];

        for (let i = 0; i < 12; i++) {
            const mSignIdx = (profectedSignIdx + i) % 12;
            const nextMonthStart = currentMonthStart + MONTH_MS;
            monthlyCache.push({
                monthNum: i + 1,
                signIdx: mSignIdx,
                start: currentMonthStart,
                end: nextMonthStart
            });
            currentMonthStart = nextMonthStart;
        }

        // DETECTA AUTOMATICAMENTE O MÊS ATUAL CASO NENHUM ESTEJA SELECIONADO MANUALLMENTE
        if (window.expandedProfeccaoMes === undefined) {
            const agora = hoje.getTime();
            const mesAtualIdx = monthlyCache.findIndex(m => agora >= m.start && agora < m.end);
            window.expandedProfeccaoMes = (mesAtualIdx !== -1) ? mesAtualIdx : 0;
        }

        const expandedMonthSignIdx = (window.expandedProfeccaoMes !== -1 && monthlyCache[window.expandedProfeccaoMes])
            ? monthlyCache[window.expandedProfeccaoMes].signIdx
            : null;

        /* CABEÇALHO PADRÃO (mesmas 3 linhas + DIA/HORA do cabeçalho da mandala),
           uma vez para o natal (com nome) e uma vez para a Revolução Solar
           calculada (sem repetir o nome). */
        const headerTitle = (typeof currentCustomCode !== 'undefined' && currentCustomCode)
            ? `${currentCustomCode} ${typeof currentSubjectName !== 'undefined' ? currentSubjectName : ''}`
            : (typeof currentSubjectName !== 'undefined' ? currentSubjectName : '');

        const diasSemanaProf = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const cidadeAtual = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.city) ? currentGeo.city : 'Local n/i';

        const fusoNatalVal = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : -3;
        const fusoNatalFormatted = `UTC${fusoNatalVal >= 0 ? '+' + fusoNatalVal : fusoNatalVal}`;
        const diaSemanaNatal = diasSemanaProf[dataNasc.getDay()];
        const anoNatalFmt = dataNasc.getFullYear();
        const mesNatalFmt = String(dataNasc.getMonth() + 1).padStart(2, '0');
        const diaNatalFmt = String(dataNasc.getDate()).padStart(2, '0');
        const horaNatalFmt = String(dataNasc.getHours()).padStart(2, '0');
        const minNatalFmt = String(dataNasc.getMinutes()).padStart(2, '0');
        const isDayNatal = ((dadosNatal.Sol.grau_absoluto - dadosNatal.Ascendente.grau_absoluto + 360) % 360) >= 180;
        const sectNatalText = isDayNatal ? 'Natividade Diurna' : 'Natividade Noturna';

        const horasInfo = (typeof window.horasPlanetariasAtual !== 'undefined') ? window.horasPlanetariasAtual : null;
        const diaHoraHTML = horasInfo ? `
            <div style="display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
                ${horasInfo.dayRulerId ? `
                <div style="text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #103b70;">DIA</div>
                    ${getPlanet3DSVG(horasInfo.dayRulerId, 28)}
                </div>` : ''}
                ${horasInfo.hourRulerId ? `
                <div style="text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #103b70;">HORA</div>
                    ${getPlanet3DSVG(horasInfo.hourRulerId, 28)}
                </div>` : ''}
            </div>` : '';

        let linhaRSHTML = '';
        if (dadosRS && rsTimestamp) {
            const rsMoment = new Date(rsTimestamp);
            const fusoRSVal = fusoNatalVal;
            const fusoRSFormatted = `UTC${fusoRSVal >= 0 ? '+' + fusoRSVal : fusoRSVal}`;
            const diaSemanaRS = diasSemanaProf[rsMoment.getDay()];
            const anoRSFmt = rsMoment.getFullYear();
            const mesRSFmt = String(rsMoment.getMonth() + 1).padStart(2, '0');
            const diaRSFmt = String(rsMoment.getDate()).padStart(2, '0');
            const horaRSFmt = String(rsMoment.getHours()).padStart(2, '0');
            const minRSFmt = String(rsMoment.getMinutes()).padStart(2, '0');
            const isDayRS = ((dadosRS.Sol.grau_absoluto - dadosRS.Ascendente.grau_absoluto + 360) % 360) >= 180;
            const sectRSText = isDayRS ? 'Natividade Diurna' : 'Natividade Noturna';

            linhaRSHTML = `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2d9c2;">
                <div style="font-size: 12px; color: #475569; font-weight: 500;">${diaSemanaRS} • ${diaRSFmt}/${mesRSFmt}/${anoRSFmt} às ${horaRSFmt}:${minRSFmt} (${fusoRSFormatted}) • ${escapeHtmlProf(cidadeAtual)}</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">Zodíaco Tropical • Signos Inteiros • Mapa de Revolução Solar <span style="color: #9a6d18; font-weight: 700;">• ${sectRSText}</span></div>
            </div>`;
        }

        let html = `
    <div id="profeccao-container" 
         oncontextmenu="event.preventDefault(); salvarModuloEmPNG('profeccao-container', 'profeccao-anual'); return false;" 
         style="width: 100%; padding: 20px; background-color: var(--bg-main, #fffdf5); font-family: 'Montserrat', sans-serif;">

        <div style="text-align: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 6px;">
                <button onclick="mudarAnoProfeccao(-1)" style="background: #ffffff; border: 1px solid #c59b27; color: #103b70; border-radius: 6px; width: 32px; height: 32px; font-weight: bold; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">&lt;</button>

                <h2 style="font-family: 'Cinzel', serif; color: #103b70; margin: 0; font-size: 18px; text-transform: uppercase;">Profecção Anual ${idade} - Anos</h2>

                <button onclick="mudarAnoProfeccao(1)" style="background: #ffffff; border: 1px solid #c59b27; color: #103b70; border-radius: 6px; width: 32px; height: 32px; font-weight: bold; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">&gt;</button>
            </div>

            <div style="font-size: 13px; color: #103b70;">
                <strong>Ano Profectado:</strong> Casa ${houseNumber} em ${getSignSvgHtml(profectedSignIdx, 18)} Senhor: ${getPlanet3DSVG(SIGNS[profectedSignIdx].ruler, 26)}
            </div>
        </div>

        <!-- CABEÇALHO PADRÃO (estilo mandala): dados do natal em cima (nome, data/hora/local, zodíaco/signos/tipo de mapa + seita, e regentes do dia/hora à direita), dados da Revolução Solar calculada embaixo. -->
        <div style="background: #fffdf5; border: 2px solid #c59b27; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                <div>
                    <div style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70;">${escapeHtmlProf(headerTitle)}</div>
                    <div style="font-size: 12px; color: #475569; font-weight: 500; margin-top: 2px;">${diaSemanaNatal} • ${diaNatalFmt}/${mesNatalFmt}/${anoNatalFmt} às ${horaNatalFmt}:${minNatalFmt} (${fusoNatalFormatted}) • ${escapeHtmlProf(cidadeAtual)}</div>
                    <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">Zodíaco Tropical • Signos Inteiros • Mapa Natal <span style="color: #9a6d18; font-weight: 700;">• ${sectNatalText}</span></div>
                </div>
                ${diaHoraHTML}
            </div>
            ${linhaRSHTML}
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 18px; margin-bottom: 20px;">
            <div style="flex: 1 1 280px; max-width: 380px; background: #fffdf7; border: 1.5px solid #c59b27; border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="text-align: center; font-family: 'Cinzel', serif; font-size: 12px; color: #103b70; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Revolução Solar ${anoAlvoRS}</div>
                ${gerarMandalaSVG(dadosRS, { profectedSignIdx })}
            </div>
            <div style="flex: 1 1 280px; max-width: 380px; background: #fffdf7; border: 1.5px solid #c59b27; border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="text-align: center; font-family: 'Cinzel', serif; font-size: 12px; color: #103b70; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Mapa Natal</div>
                ${gerarMandalaSVG(dadosNatal, { profectedSignIdx, highlightAscSignIdx: rsAscSignIdx, highlightMesAbertoSignIdx: expandedMonthSignIdx })}
            </div>
        </div>

        <div style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #c59b27; border-radius: 14px; padding: 18px; box-shadow: 0 4px 16px rgba(197, 155, 39, 0.08);">
            <div style="border-bottom: 1px solid #e2d9c2; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
                <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #103b70; font-weight: 800; margin: 0; text-transform: uppercase;">Profecção Mensal - 30 dias 10 horas 30 minutos</h3>
            </div>

            <div style="background: #ffffff; border: 1px solid #c59b27; border-radius: 10px; overflow: hidden; margin-top: 10px;">
                <table style="width: 100%; border-collapse: collapse; background: #ffffff; font-size: 13px;">
                    <thead>
                        <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                            <th style="padding: 10px 12px; text-align: center;">Mês</th>
                            <th style="padding: 10px 12px; text-align: center;">Signo</th>
                            <th style="padding: 10px 12px; text-align: center;">Regente</th>
                            <th style="padding: 10px 12px; text-align: left;">Início do Período</th>
                        </tr>
                    </thead>
                    <tbody>
`;

        monthlyCache.forEach((m, i) => {
            const mSign = SIGNS[m.signIdx];
            const isExpanded = (window.expandedProfeccaoMes === i);
            const bgRow = isExpanded ? '#e0e7ff' : (i % 2 === 0 ? '#ffffff' : '#fffdf5');

            html += `
                <tr onclick="alternarMesProfeccao(${i})" style="border-bottom: 1px solid #e2d9c2; background-color: ${bgRow}; cursor: pointer; user-select: none;">
                    <td style="padding: 10px 12px; text-align: center;"><strong>Mês ${m.monthNum}</strong></td>
                    <td style="padding: 10px 12px; text-align: center;">${getSignSvgHtml(m.signIdx, 20)}</td>
                    <td style="padding: 10px 12px; text-align: center;">${getPlanet3DSVG(mSign.ruler, 30)}</td>
                    <td style="padding: 10px 12px; text-align: left;">${formatarData(m.start)}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div></div>`;
        container.innerHTML = html;
    }

    window.iniciarModuloProfeccao = iniciarModuloProfeccao;
})();
