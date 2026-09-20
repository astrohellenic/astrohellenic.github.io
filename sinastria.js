(function() {
    /* ===== MÓDULO DE SINASTRIA =====
       Sinastria = duas mandalas lado a lado, pra comparar dois mapas: a da
       DIREITA é sempre o mapa que já estava aberto no #mandala-container
       (o "mapa em tela", vindo de currentCalculatedData/currentMoment/
       currentGeo/currentSubjectName — mandala.js), a da ESQUERDA é um
       segundo mapa escolhido aqui dentro, numa busca própria deste módulo
       (não usa a barra lateral de clientes: selecionar lá troca o mapa
       principal, o que apagaria o mapa da direita).

       ===== BLOCO COPIADO DE profeccao.js (gerarMandalaSVG e tudo que ela
       usa) =====
       Cópia deliberada, não reinventada: é a MESMA lógica de desenho da
       mandala principal (mandala.js) — anéis/hastes dourados, aspectos,
       dodecatemoria, termos egípcios, lotes herméticos, planetas em SVG 3D
       com sombra e mancha de combustão — que profeccao.js já portou pra
       gerar mandalas em miniatura, coexistindo várias na mesma página (por
       isso os IDs de gradiente/filtro em construirDefsPlanetas levam um
       sufixo por instância). Não toca em mandala.js nem em profeccao.js. */

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
       sufixados por instância — as duas mini-mandalas da Sinastria (esquerda
       e direita) coexistem na mesma página, então não podem compartilhar os
       mesmos IDs de SVG. */
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

    /* GERA A MANDALA COMPLETA EM SVG — CÓPIA FIEL de gerarMandalaSVG() de
       profeccao.js (que por sua vez é cópia fiel do desenho de renderMandala()
       em mandala.js), sem alterações na lógica de desenho. As opções de
       destaque (profectedSignIdx etc., usadas na Profecção) não são passadas
       pela Sinastria — ficam null e os trechos correspondentes simplesmente
       não desenham nada. */
    function gerarMandalaSVG(dados, opcoes = {}) {
        if (!dados || !dados.Ascendente) {
            return { svg: `<div style="padding: 40px 10px; text-align: center; color: #94a3b8; font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`, rCanvas: 0 };
        }

        const profectedSignIdx = (opcoes.profectedSignIdx !== undefined) ? opcoes.profectedSignIdx : null;
        const highlightAscSignIdx = (opcoes.highlightAscSignIdx !== undefined) ? opcoes.highlightAscSignIdx : null;
        const highlightMesAbertoSignIdx = (opcoes.highlightMesAbertoSignIdx !== undefined) ? opcoes.highlightMesAbertoSignIdx : null;

        const goldColor = "#c59b27";
        const sufixo = `sw${wheelInstanceCounter++}`;

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
        /* rCanvasNatural é o quanto ESSE mapa (só ele) precisa de margem pra
           caber sem cortar nenhum planeta/lote empilhado. Como os anéis da
           mandala (R.Aspects, pR etc.) são sempre desenhados no mesmo
           tamanho fixo em pixels, quem precisa de mais margem (mapa com mais
           planetas colados, empilhados pra fora) acaba com um viewBox maior
           — e como o SVG sempre ocupa 100% da largura do card, um viewBox
           maior faz a mandala aparecer MENOR na tela. Pra duas mandalas
           lado a lado (Sinastria) ficarem do mesmo tamanho, quem chama esta
           função pode forçar as duas a usarem o mesmo canvas (o maior dos
           dois) via opcoes.rCanvasMinimo — ver gerarMandalasComEscalaIgual. */
        const rCanvasNatural = Math.max(maxRaioItens + 50, R_OuterLine + 40);
        const R_canvas = Math.max(rCanvasNatural, opcoes.rCanvasMinimo || 0);
        const cx = R_canvas, cy = R_canvas;
        const canvasSize = R_canvas * 2;

        let svg = `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; margin: 0 auto;">
            <defs>${construirDefsPlanetas(sufixo)}</defs>
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
        svg += desenharFaixaDestaque(highlightAscSignIdx, "#eab308", R_OuterLine + 14, R_OuterLine + 22);
        svg += desenharFaixaDestaque(profectedSignIdx, "#65a30d", R_OuterLine + 24, R_OuterLine + 32);

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
                const planetSvgContent = fragmentoPlaneta3D(item.id, sufixo);
                let retroSymbol = item.retro ? `<tspan fill="#dc2626" font-weight="900"> ℞</tspan>` : '';
                svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                    <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
                    <text x="0" y="27" font-size="10.5" font-weight="800" fill="#0f172a" text-anchor="middle" stroke="#ffffff" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
                </g>`;
            });

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

        svg += `</svg>`;
        return { svg, rCanvas: rCanvasNatural };
    }

    /* ===== FIM DO BLOCO COPIADO DE profeccao.js ===== */

    /* ===== A PARTIR DAQUI: LÓGICA PRÓPRIA DA SINASTRIA ===== */

    /* Gera as duas mandalas (esquerda/direita) já na MESMA escala visual:
       desenha as duas uma vez pra descobrir de qual delas precisa de mais
       margem (rCanvas natural maior) e, se precisar, redesenha só a menor
       forçando o mesmo canvas da maior — assim as duas ficam do mesmo
       tamanho na tela, nunca cortando planeta nenhuma das duas. */
    function gerarMandalasComEscalaIgual(dadosEsquerda, dadosDireita) {
        const resEsquerda = gerarMandalaSVG(dadosEsquerda, {});
        const resDireita = gerarMandalaSVG(dadosDireita, {});
        const rCanvasFinal = Math.max(resEsquerda.rCanvas, resDireita.rCanvas);

        const svgEsquerda = (resEsquerda.rCanvas < rCanvasFinal)
            ? gerarMandalaSVG(dadosEsquerda, { rCanvasMinimo: rCanvasFinal }).svg
            : resEsquerda.svg;
        const svgDireita = (resDireita.rCanvas < rCanvasFinal)
            ? gerarMandalaSVG(dadosDireita, { rCanvasMinimo: rCanvasFinal }).svg
            : resDireita.svg;

        return { svgEsquerda, svgDireita };
    }

    // Estado só desta aba/sessão (não persiste no Supabase nem no
    // localStorage): é "estado de navegação da ferramenta atual", não uma
    // preferência do astrólogo — some ao trocar de módulo ou recarregar.
    let sinastriaSegundoMapa = null; // { nome, codigo, cidade, moment, geo, dados }
    let sinastriaListaMapas = null;
    let sinastriaCarregandoLista = false;

    function sinastriaLinhaInfo(nome, codigo, momentDate, geo) {
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const fusoVal = (geo && geo.fuso !== undefined) ? geo.fuso : -3;
        const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
        const dia = String(momentDate.getDate()).padStart(2, '0');
        const mes = String(momentDate.getMonth() + 1).padStart(2, '0');
        const ano = momentDate.getFullYear();
        const hora = String(momentDate.getHours()).padStart(2, '0');
        const min = String(momentDate.getMinutes()).padStart(2, '0');
        const diaSemana = diasSemana[momentDate.getDay()];
        const cidade = (geo && geo.city) ? geo.city : 'Local n/i';
        const titulo = codigo ? `${codigo} ${nome}` : nome;
        return `
            <div style="font-family: 'Cinzel', serif; font-size: 15px; font-weight: 800; color: #103b70; margin-bottom: 2px;">${escapeHtml(titulo || 'Sem Nome')}</div>
            <div style="font-size: 11px; color: #475569; font-weight: 500;">${diaSemana} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted})</div>
            <div style="font-size: 11px; color: #64748b;">${escapeHtml(cidade)}</div>
        `;
    }

    /* Calcula os dados astrológicos completos de um mapa salvo (linha da
       tabela "mapas") para desenhar a mini-mandala dele — mesma chamada e
       mesmo formato de retorno de executarCalculo() em mandala.js (cópia
       deliberada da transformação da resposta da API, só generalizada para
       receber data/hora/local de QUALQUER mapa, não só o currentMoment/
       currentGeo do mapa principal). */
    async function sinastriaCalcularDadosMapa(row) {
        let ano = 2000, mes = 1, dia = 1;
        if (row.data_nascimento && row.data_nascimento.includes('/')) {
            const partes = row.data_nascimento.split('/');
            if (partes.length === 3) {
                dia = parseInt(partes[0]);
                mes = parseInt(partes[1]);
                ano = parseInt(partes[2]);
            }
        }

        let hora = 12, min = 0;
        if (row.hora_nascimento && row.hora_nascimento.includes(':')) {
            const partesH = row.hora_nascimento.split(':');
            if (partesH.length >= 2) {
                hora = parseInt(partesH[0]);
                min = parseInt(partesH[1]);
            }
        }

        const lat = parseFloat(row.latitude) || -23.5505;
        const lon = parseFloat(row.longitude) || -46.6333;
        const fuso = (typeof calcularFusoPreciso === 'function')
            ? calcularFusoPreciso(lat, lon, ano, mes, dia, hora, min)
            : ((typeof calcularFusoPorLongitude === 'function') ? calcularFusoPorLongitude(lon) : -3);

        const momentDate = new Date(ano, mes - 1, dia, hora, min);
        const geo = { lat, lon, fuso, city: row.cidade || "Localidade não informada" };

        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const horaStr = `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

        try {
            const urlApi = `https://motor-astrologia.vercel.app/api/index?data=${dataStr}&hora=${horaStr}&fuso=${fuso}&lat=${lat}&lon=${lon}`;
            const res = await fetch(urlApi);
            if (!res.ok) return null;
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

            const checkRetro = (pObjApi) => {
                if (!pObjApi) return false;
                if (pObjApi.retrogrado !== undefined) return Boolean(pObjApi.retrogrado);
                if (pObjApi.velocidade !== undefined) return parseFloat(pObjApi.velocidade) < 0;
                return false;
            };

            const dados = {
                Ascendente: { grau_absoluto: ascAbs },
                MC: { grau_absoluto: mcAbs },
                Nodo_Norte: { grau_absoluto: planetas.NodoNorte ? planetas.NodoNorte.grau_absoluto : 0, retro: checkRetro(planetas.NodoNorte) },
                Sizigia: { grau_absoluto: sizigiaData.grau_absoluto !== undefined ? parseFloat(sizigiaData.grau_absoluto) : 0 },
                Sol: { grau_absoluto: planetas.Sol ? planetas.Sol.grau_absoluto : 0, retro: false, lat: planetas.Sol ? parseFloat(planetas.Sol.latitude) || 0 : 0 },
                Lua: { grau_absoluto: planetas.Lua ? planetas.Lua.grau_absoluto : 0, retro: false, lat: planetas.Lua ? parseFloat(planetas.Lua.latitude) || 0 : 0 },
                Mercúrio: { grau_absoluto: planetas.Mercurio ? planetas.Mercurio.grau_absoluto : 0, retro: checkRetro(planetas.Mercurio), lat: planetas.Mercurio ? parseFloat(planetas.Mercurio.latitude) || 0 : 0 },
                Vênus: { grau_absoluto: planetas.Venus ? planetas.Venus.grau_absoluto : 0, retro: checkRetro(planetas.Venus), lat: planetas.Venus ? parseFloat(planetas.Venus.latitude) || 0 : 0 },
                Marte: { grau_absoluto: planetas.Marte ? planetas.Marte.grau_absoluto : 0, retro: checkRetro(planetas.Marte), lat: planetas.Marte ? parseFloat(planetas.Marte.latitude) || 0 : 0 },
                Júpiter: { grau_absoluto: planetas.Jupiter ? planetas.Jupiter.grau_absoluto : 0, retro: checkRetro(planetas.Jupiter), lat: planetas.Jupiter ? parseFloat(planetas.Jupiter.latitude) || 0 : 0 },
                Saturno: { grau_absoluto: planetas.Saturno ? planetas.Saturno.grau_absoluto : 0, retro: checkRetro(planetas.Saturno), lat: planetas.Saturno ? parseFloat(planetas.Saturno.latitude) || 0 : 0 }
            };

            return { dados, moment: momentDate, geo };
        } catch (err) {
            console.error("Erro ao calcular o segundo mapa da Sinastria:", err);
            return null;
        }
    }

    /* Busca (uma vez por visita ao módulo) todos os mapas salvos, de todas
       as pastas — mesmo padrão de agendamento.js (iniciarModuloAgenda), que
       também precisa de uma lista de clientes sem passar pela navegação por
       pastas da barra lateral. */
    async function sinastriaGarantirListaCarregada() {
        if (sinastriaListaMapas) {
            sinastriaRenderizarListaPicker(sinastriaListaMapas);
            return;
        }
        if (sinastriaCarregandoLista) return;
        sinastriaCarregandoLista = true;

        try {
            const { data, error } = await supabaseClient
                .from('mapas')
                .select('id, nome, codigo, pasta, cidade, data_nascimento, hora_nascimento, latitude, longitude');

            if (!error && Array.isArray(data)) {
                sinastriaListaMapas = data;
                if (typeof compararValoresOrdenacao === 'function') {
                    sinastriaListaMapas.sort((a, b) => compararValoresOrdenacao(a, b, 'nome'));
                }
                sinastriaRenderizarListaPicker(sinastriaListaMapas);
            } else {
                const cont = document.getElementById('sinastriaListaContainer');
                if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #dc2626;">Erro ao carregar a lista de mapas.</div>`;
            }
        } catch (e) {
            console.error("Erro ao carregar mapas para a Sinastria:", e);
            const cont = document.getElementById('sinastriaListaContainer');
            if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #dc2626;">Erro de conexão.</div>`;
        } finally {
            sinastriaCarregandoLista = false;
        }
    }

    function sinastriaRenderizarListaPicker(lista) {
        const cont = document.getElementById('sinastriaListaContainer');
        if (!cont) return;

        if (!lista || lista.length === 0) {
            cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">Nenhum mapa encontrado.</div>`;
            return;
        }

        let html = '';
        lista.forEach(item => {
            const cod = item.codigo ? `${item.codigo} - ` : '';
            const cidStr = item.cidade || 'Local n/i';
            html += `
                <div onclick="sinastriaSelecionarMapa(${item.id})" style="margin: 4px 8px; border: 1px solid #e2d9c2; border-radius: 8px; background: #ffffff; padding: 8px 10px; cursor: pointer;">
                    <div style="color: #103b70; font-weight: 700; font-size: 12px;">${cod}${escapeHtml(item.nome || 'Sem Nome')}</div>
                    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${escapeHtml(cidStr)}</div>
                </div>
            `;
        });
        cont.innerHTML = html;
    }

    window.sinastriaFiltrarLista = function(query) {
        if (!sinastriaListaMapas) return;
        const q = (query || '').toLowerCase().trim();
        const filtrada = !q ? sinastriaListaMapas : sinastriaListaMapas.filter(item => {
            return (item.nome || '').toLowerCase().includes(q)
                || (item.codigo ? String(item.codigo).toLowerCase().includes(q) : false)
                || (item.cidade || '').toLowerCase().includes(q);
        });
        sinastriaRenderizarListaPicker(filtrada);
    };

    window.sinastriaSelecionarMapa = async function(id) {
        if (!sinastriaListaMapas) return;
        const row = sinastriaListaMapas.find(m => m.id === id);
        if (!row) return;

        const cont = document.getElementById('sinastriaListaContainer');
        if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #103b70;"><i class="fa-solid fa-spinner fa-spin" style="color: #c59b27;"></i> Calculando mapa...</div>`;

        const resultado = await sinastriaCalcularDadosMapa(row);
        if (!resultado) {
            if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #dc2626;">Erro ao calcular esse mapa. Toque para tentar de novo.</div>`;
            return;
        }

        sinastriaSegundoMapa = {
            nome: row.nome || 'Sem Nome',
            codigo: row.codigo || null,
            cidade: row.cidade,
            moment: resultado.moment,
            geo: resultado.geo,
            dados: resultado.dados
        };

        const container = document.getElementById('mandala-container');
        if (container) renderSinastriaTela(container);
    };

    window.sinastriaTrocarMapa = function() {
        sinastriaSegundoMapa = null;
        const container = document.getElementById('mandala-container');
        if (container) renderSinastriaTela(container);
    };

    /* Monta a tela inteira: mandala esquerda (segundo mapa, ou o buscador
       quando ainda não escolhido) + mandala direita (o mapa que já estava
       em tela, sem tocar em currentCalculatedData/currentMoment/currentGeo). */
    function renderSinastriaTela(container) {
        const nomeA = (typeof currentSubjectName !== 'undefined') ? currentSubjectName : 'Mapa em tela';
        const codigoA = (typeof currentCustomCode !== 'undefined') ? currentCustomCode : null;
        const momentA = (typeof currentMoment !== 'undefined' && currentMoment instanceof Date) ? currentMoment : new Date();
        const geoA = (typeof currentGeo !== 'undefined' && currentGeo) ? currentGeo : { lat: -23.5505, lon: -46.6333, fuso: -3, city: 'São Paulo, SP' };

        let cardEsquerdaHtml;
        let cardDireitaHtml;

        if (sinastriaSegundoMapa) {
            // As duas mandalas são geradas juntas pra ficarem na MESMA escala
            // visual (ver gerarMandalasComEscalaIgual) — senão quem tem mais
            // planetas colados (precisa de mais margem) aparece menor que a
            // outra, mesmo os dois cartões tendo a mesma largura.
            const { svgEsquerda, svgDireita } = gerarMandalasComEscalaIgual(sinastriaSegundoMapa.dados, currentCalculatedData);

            cardEsquerdaHtml = `
                <div style="flex: 1 1 0; min-width: 280px; background: #ffffff; border: 1.5px solid #c59b27; border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 6px;">
                        <button onclick="sinastriaTrocarMapa()" style="background: #ffffff; border: 1px solid #c59b27; color: #103b70; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif;">
                            <i class="fa-solid fa-arrow-right-arrow-left"></i> Trocar Mapa
                        </button>
                    </div>
                    <div style="text-align: center; margin-bottom: 8px;">
                        ${sinastriaLinhaInfo(sinastriaSegundoMapa.nome, sinastriaSegundoMapa.codigo, sinastriaSegundoMapa.moment, sinastriaSegundoMapa.geo)}
                    </div>
                    ${svgEsquerda}
                </div>
            `;

            cardDireitaHtml = `
                <div style="flex: 1 1 0; min-width: 280px; background: #ffffff; border: 1.5px solid #c59b27; border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    <div style="text-align: center; margin-bottom: 8px;">
                        ${sinastriaLinhaInfo(nomeA, codigoA, momentA, geoA)}
                    </div>
                    ${svgDireita}
                </div>
            `;
        } else {
            cardEsquerdaHtml = `
                <div style="flex: 1 1 0; min-width: 280px; background: #ffffff; border: 1.5px solid #c59b27; border-radius: 14px; padding: 14px 12px; display: flex; flex-direction: column; min-height: 320px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #103b70; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; text-align: center;">Selecione o Segundo Mapa</div>
                    <div class="search-box-container" style="margin-bottom: 10px;">
                        <input type="text" id="sinastriaBuscaInput" class="client-search-input" placeholder="Buscar cliente..." oninput="sinastriaFiltrarLista(this.value)" style="width: 100%; border: 1px solid #c59b27; border-radius: 8px; background: #ffffff; color: #103b70;">
                    </div>
                    <div id="sinastriaListaContainer" class="client-list-container" style="flex: 1; overflow-y: auto; min-height: 220px; max-height: 420px; border: 1px solid #e2d9c2; border-radius: 8px; background: #fffdf5;">
                        <div style="padding: 16px; text-align: center; font-size: 12px; color: #103b70;"><i class="fa-solid fa-spinner fa-spin" style="color: #c59b27;"></i> Carregando mapas...</div>
                    </div>
                </div>
            `;

            cardDireitaHtml = `
                <div style="flex: 1 1 0; min-width: 280px; background: #ffffff; border: 1.5px solid #c59b27; border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    <div style="text-align: center; margin-bottom: 8px;">
                        ${sinastriaLinhaInfo(nomeA, codigoA, momentA, geoA)}
                    </div>
                    ${gerarMandalaSVG(currentCalculatedData, {}).svg}
                </div>
            `;
        }

        container.innerHTML = `
            <div style="width: 100%; padding: 20px; background-color: var(--bg-main, #fffdf5); font-family: 'Montserrat', sans-serif;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <h2 style="font-family: 'Cinzel', serif; color: #103b70; margin: 0; font-size: 18px; text-transform: uppercase;">Sinastria</h2>
                </div>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 18px;">
                    ${cardEsquerdaHtml}
                    ${cardDireitaHtml}
                </div>
            </div>
        `;

        if (!sinastriaSegundoMapa) sinastriaGarantirListaCarregada();
    }

    /* PONTO DE ENTRADA DO MÓDULO — chamado por abrirModuloTecnica('sinastria') (supabase.js) */
    async function iniciarModuloSinastria() {
        const container = document.getElementById('mandala-container');
        if (!container) return;

        if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: #dc2626; font-family: sans-serif;">Nenhum mapa carregado no sistema.</div>`;
            return;
        }

        renderSinastriaTela(container);
    }

    window.iniciarModuloSinastria = iniciarModuloSinastria;
})();
