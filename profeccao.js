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

    /* Janelinha de escolha do ano (mesmo visual da Revolução Solar). Escolher um
       ano define o deslocamento em relação ao ano de hoje e recarrega a ferramenta;
       as setas < > continuam andando a partir dele. */
    window.toggleJanelaAnoProfeccao = function(event) {
        if (event) event.stopPropagation();
        const janela = document.getElementById('profeccaoJanelaAno');
        if (!janela) return;
        const abrir = janela.style.display !== 'block';
        janela.style.display = abrir ? 'block' : 'none';
        if (!abrir) return;
        const nasc = window.profeccaoAnoNasc || 1990;
        const anoSel = nasc + (window.profeccaoIdadeBase || 0) + window.profeccaoOffsetAnos;
        const nome = (typeof currentSubjectName !== 'undefined' && currentSubjectName) ? currentSubjectName : 'Mapa Atual';
        const nomeEl = document.getElementById('profeccaoJanelaNome');
        if (nomeEl) nomeEl.innerText = nome;
        const lbl = document.getElementById('profeccaoJanelaAnoLabel');
        if (lbl) lbl.innerText = `${anoSel}, ${anoSel - nasc} anos`;
        const lista = document.getElementById('profeccaoListaAnos');
        if (!lista) return;
        let h = '';
        for (let a = nasc; a <= nasc + 120; a++) {
            const sel = a === anoSel;
            h += `<div class="${sel ? 'ano-item-selecionado' : ''}" onclick="selecionarAnoProfeccao(${a})" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: ${sel ? 'var(--bg-hover)' : 'var(--bg-card)'}; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-muted-2);"><span><strong>${a}</strong>, ${a - nasc} anos</span>${sel ? '<i class="fa-solid fa-check" style="color: var(--primary-blue);"></i>' : ''}</div>`;
        }
        lista.innerHTML = h;
        setTimeout(() => {
            const it = lista.querySelector('.ano-item-selecionado');
            if (it) it.scrollIntoView({ block: 'center' });
        }, 30);
    };

    window.selecionarAnoProfeccao = function(ano) {
        const nasc = window.profeccaoAnoNasc || 1990;
        window.profeccaoOffsetAnos = (ano - nasc) - (window.profeccaoIdadeBase || 0);
        window.expandedProfeccaoMes = null;
        if (typeof window.iniciarModuloProfeccao === 'function') window.iniciarModuloProfeccao();
    };

    document.addEventListener('click', function(e) {
        const janela = document.getElementById('profeccaoJanelaAno');
        if (janela && janela.style.display === 'block' && !janela.contains(e.target)) janela.style.display = 'none';
    });

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
        // Tema Céu (papiro): glifo de signo em azul-tinta (sem cor por elemento), como os desenhos em tinta.
        const color = (typeof window !== 'undefined' && window.temaMandala === 'ceu') ? ({ fire: '#a62b1f', earth: '#6b4a2b', air: '#17707f', water: '#1f3a66' })[SIGN_ELEMENTS[signIdx]] : ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[signIdx]];
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; display: inline-block; vertical-align: middle;">${MONOLINE_ZODIAC_SVGS[signIdx]}</svg>`;
    }

    function getPlanet3DSVG(planetId, size = 34) {
        return (typeof getIconeSVG === 'function') ? getIconeSVG('planeta', planetId, size || 34) : '';
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

    /* PORTADO DE horas.js: cálculo de nascer/pôr do sol (fórmula pura, sem
       API) e dos regentes de dia/hora planetários — usado para calcular os
       regentes do MOMENTO EXATO DA REVOLUÇÃO SOLAR, já que
       window.horasPlanetariasAtual só guarda os do mapa natal. */
    const CHALDEAN_ORDER_HORAS = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
    const DAY_RULERS_MAP_PROF = { 0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury", 4: "Jupiter", 5: "Venus", 6: "Saturn" };

    function calcularNascerPorDoSolProf(dateObj, lat, lon, fuso) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();

        const N1 = Math.floor(275 * month / 9);
        const N2 = Math.floor((month + 9) / 12);
        const N3 = (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3));
        const N = N1 - (N2 * N3) + day - 30;

        const lngHour = lon / 15;

        function calculateEventTime(isSunrise) {
            const t = isSunrise ? N + ((6 - lngHour) / 24) : N + ((18 - lngHour) / 24);

            const M = (0.985600 * t) - 3.289;
            let L = M + (1.916 * Math.sin(M * Math.PI / 180)) + (0.020 * Math.sin(2 * M * Math.PI / 180)) + 282.634;
            L = (L + 360) % 360;

            let RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI;
            RA = (RA + 360) % 360;

            const Lquadrant = Math.floor(L / 90) * 90;
            const RAquadrant = Math.floor(RA / 90) * 90;
            RA = RA + (Lquadrant - RAquadrant);
            RA = RA / 15;

            const zenith = 90.833;
            const sinDec = 0.39782 * Math.sin(L * Math.PI / 180);
            const cosDec = Math.cos(Math.asin(sinDec));
            const cosH = (Math.cos(zenith * Math.PI / 180) - (sinDec * Math.sin(lat * Math.PI / 180))) / (cosDec * Math.cos(lat * Math.PI / 180));

            if (cosH > 1 || cosH < -1) return null;

            let H = isSunrise ? 360 - (Math.acos(cosH) * 180 / Math.PI) : Math.acos(cosH) * 180 / Math.PI;
            H = H / 15;

            const T = H + RA - (0.06571 * t) - 6.622;
            let UT = T - lngHour;
            UT = (UT + 24) % 24;

            const localTimeHours = UT + fuso;
            const resultDate = new Date(year, month - 1, day, 0, 0, 0);
            resultDate.setMinutes(Math.round(localTimeHours * 60));
            return resultDate;
        }

        return { sunrise: calculateEventTime(true), sunset: calculateEventTime(false) };
    }

    function calcularHorasPlanetariasProf(momento, lat, lon, fuso) {
        const now = new Date(momento);
        const sunToday = calcularNascerPorDoSolProf(now, lat, lon, fuso);

        let astroDate = new Date(now);
        if (sunToday && sunToday.sunrise && now < sunToday.sunrise) {
            astroDate.setDate(astroDate.getDate() - 1);
        }

        const sunAstro = calcularNascerPorDoSolProf(astroDate, lat, lon, fuso);
        const nextDay = new Date(astroDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const sunNextAstro = calcularNascerPorDoSolProf(nextDay, lat, lon, fuso);

        const sunrise = sunAstro ? sunAstro.sunrise : null;
        const sunset = sunAstro ? sunAstro.sunset : null;
        const nextSunrise = sunNextAstro ? sunNextAstro.sunrise : null;

        if (!sunrise || !sunset || !nextSunrise) return null;

        const dayOfWeek = astroDate.getDay();
        const firstPlanetId = DAY_RULERS_MAP_PROF[dayOfWeek];
        const startIndex = CHALDEAN_ORDER_HORAS.indexOf(firstPlanetId);

        const dayDurationMs = (sunset - sunrise) / 12;
        const nightDurationMs = (nextSunrise - sunset) / 12;

        let hourRulerId = null;
        for (let i = 0; i < 12; i++) {
            const start = new Date(sunrise.getTime() + i * dayDurationMs);
            const end = new Date(sunrise.getTime() + (i + 1) * dayDurationMs);
            if (now >= start && now < end) { hourRulerId = CHALDEAN_ORDER_HORAS[(startIndex + i) % 7]; break; }
        }
        if (!hourRulerId) {
            for (let i = 0; i < 12; i++) {
                const start = new Date(sunset.getTime() + i * nightDurationMs);
                const end = new Date(sunset.getTime() + (i + 1) * nightDurationMs);
                if (now >= start && now < end) { hourRulerId = CHALDEAN_ORDER_HORAS[(startIndex + 12 + i) % 7]; break; }
            }
        }

        return { dayRulerId: firstPlanetId, hourRulerId };
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
            <radialGradient id="combustionGlow_${sufixo}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.9" /><stop offset="30%" stop-color="#fde68a" stop-opacity="0.75" /><stop offset="53%" stop-color="#f59e0b" stop-opacity="0.45" /><stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
            </radialGradient>
        `;
    }

    function fragmentoPlaneta3D(planetId, sufixo) {
        return (typeof getIconeFragmento === 'function') ? getIconeFragmento('planeta', planetId) : '';
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
            return `<div style="padding: 40px 10px; text-align: center; color: var(--text-faint); font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`;
        }

        const profectedSignIdx = (opcoes.profectedSignIdx !== undefined) ? opcoes.profectedSignIdx : null;
        const highlightAscSignIdx = (opcoes.highlightAscSignIdx !== undefined) ? opcoes.highlightAscSignIdx : null;
        const highlightMesAbertoSignIdx = (opcoes.highlightMesAbertoSignIdx !== undefined) ? opcoes.highlightMesAbertoSignIdx : null;

        /* Mesma "tinta" clara/escura de mandala.js/liberacao.js (esta função
           segue a mesma arquitetura de renderMandala/gerarMandalaNatalZR) —
           cores resolvidas em hexadecimal porque este SVG acaba virando <img>
           (ver converterProfeccaoMandalasEmImagem logo depois do render),
           então var(--x) não seria enxergado por quem lê o canvas depois.
           ELEMENT_SIGN_COLORS fica sombreado só aqui dentro (a versão do
           módulo, usada por getSignSvgHtml no cabeçalho e na tabela mensal
           fora da imagem, continua intocada).

           fundoDisco/halo (escuro) usam --bg-card (#262220), NÃO --bg-main
           (#1c1917): as duas mandalas (Revolução Solar e Mapa Natal) ficam
           cada uma dentro do seu próprio cartão (ver iniciarModuloProfeccao,
           background: var(--bg-card)) — mesmo cuidado já documentado no
           CLAUDE.md a respeito da Liberação Zodiacal, pra não deixar uma
           margem clara aparecer entre a borda dourada do cartão e o disco
           escuro. */
        const modoEscuro = document.documentElement.classList.contains('tema-escuro');
        /* TEMA CÉU — roda SECUNDÁRIA (desta ferramenta): "tinta sobre o papiro". Sem fundo nem céu; só azul-tinta
           (estrutura, glifos) e terracota (destaques: casas, aspectos duros, planetas da seita, ângulos,
           Profecção). Quem observa o céu é a mandala principal; aqui o astrólogo já está escrevendo no papiro. */
        const papiro = typeof window !== 'undefined' && window.temaMandala === 'ceu';
        const AZ_TINTA = '#1d3a66', TERRACOTA = '#a03e25';
        const tinta = papiro ? {
            fundoDisco: 'none', dourado: AZ_TINTA, douradoCasas: TERRACOTA, halo: 'none',
            inkForte: AZ_TINTA, inkPlaneta: '#1a1410', navio: AZ_TINTA, linhaConectora: 'rgba(29,58,102,0.55)',
            aspectoOposicao: TERRACOTA, aspectoTrigono: AZ_TINTA, aspectoQuadratura: TERRACOTA, aspectoSextil: AZ_TINTA,
            elementoFogo: '#a62b1f', elementoTerra: '#6b4a2b', elementoAr: '#17707f', elementoAgua: '#1f3a66',
            dodecatemoriaLinha: 'rgba(29,58,102,0.45)',
        } : modoEscuro ? {
            fundoDisco: '#262220', dourado: '#d9ae3f', douradoCasas: '#e8c667', halo: '#262220',
            inkForte: '#e8e6df', inkPlaneta: '#e8e6df', navio: '#8ab4e8', linhaConectora: '#6b7280',
            aspectoOposicao: '#fb7185', aspectoTrigono: '#60a5fa', aspectoQuadratura: '#ff6b4a', aspectoSextil: '#38bdf8',
            elementoFogo: '#ff6b4a', elementoTerra: '#d99a5c', elementoAr: '#38bdf8', elementoAgua: '#60a5fa',
            dodecatemoriaLinha: 'rgba(217,174,63,0.35)',
        } : {
            fundoDisco: '#ffffff', dourado: '#c59b27', douradoCasas: '#aa820a', halo: '#ffffff',
            inkForte: '#000000', inkPlaneta: '#0f172a', navio: '#103b70', linhaConectora: '#94a3b8',
            aspectoOposicao: '#881337', aspectoTrigono: '#1d4ed8', aspectoQuadratura: '#e84118', aspectoSextil: '#0ea5e9',
            elementoFogo: '#e84118', elementoTerra: '#8b4513', elementoAr: '#0ea5e9', elementoAgua: '#1d4ed8',
            dodecatemoriaLinha: 'rgba(170,130,10,0.3)',
        };
        const ELEMENT_SIGN_COLORS = { fire: tinta.elementoFogo, earth: tinta.elementoTerra, air: tinta.elementoAr, water: tinta.elementoAgua };

        const goldColor = tinta.dourado;
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
            outerRingItems.push({ type: "node", label: "☊", deg: nodeAbs, color: tinta.inkForte, aScreen: eclToScreenAngle(nodeAbs, house1RefAbs) });
            outerRingItems.push({ type: "node", label: "☋", deg: (nodeAbs + 180) % 360, color: tinta.inkForte, aScreen: eclToScreenAngle((nodeAbs + 180) % 360, house1RefAbs) });
        }
        if (syzAbs > 0) {
            outerRingItems.push({ type: "syzygy", label: "SIZ", deg: syzAbs, color: tinta.inkForte, aScreen: eclToScreenAngle(syzAbs, house1RefAbs) });
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
            <defs>${construirDefsPlanetas(sufixo)}</defs>
            <rect width="${canvasSize}" height="${canvasSize}" fill="${tinta.fundoDisco}"/>`;

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

        svg += desenharFatiaDestaque(highlightMesAbertoSignIdx, papiro ? "rgba(29, 58, 102, 0.14)" : "rgba(224, 231, 255, 0.6)");
        svg += desenharFatiaDestaque(profectedSignIdx, papiro ? "rgba(160, 62, 37, 0.20)" : "rgba(163, 230, 53, 0.4)");
        svg += desenharFatiaDestaque(highlightAscSignIdx, papiro ? "rgba(107, 74, 43, 0.18)" : "rgba(254, 240, 138, 0.5)");

        svg += `<circle cx="${cx}" cy="${cy}" r="${R.Aspects}" fill="${tinta.fundoDisco}" stroke="${goldColor}" stroke-width="2"/>`;

        const occupiedSigns = new Set();
        PLANETS_DEF.forEach(p => { occupiedSigns.add(Math.floor(pObj[p.id].abs / 30)); });
        const occupiedArray = Array.from(occupiedSigns);
        for (let i = 0; i < occupiedArray.length; i++) {
            for (let j = i + 1; j < occupiedArray.length; j++) {
                let diff = Math.abs(occupiedArray[i] - occupiedArray[j]);
                if (diff > 6) diff = 12 - diff;
                let col = null;
                if (diff === 6) col = tinta.aspectoOposicao;
                else if (diff === 4) col = tinta.aspectoTrigono;
                else if (diff === 3) col = tinta.aspectoQuadratura;
                else if (diff === 2) col = tinta.aspectoSextil;
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

        /* ORDEM DE CAMADAS DA RODA (mesmo padrao de mandala.js, 28/09/2026):
           a estrutura da mandala (circulos, raios, dentinhos) sempre por
           tras de tudo; depois as linhas pretas dos eixos ASC/DSC/MC/IC;
           depois todos os icones por cima. Os loops que desenhavam
           linha+icone juntos (dodecatemoria, termos) foram separados em
           duas passadas: uma so de linha aqui, outra so de icone la
           embaixo, depois das linhas dos eixos. */

        for (let i = 0; i < 12; i++) {
            const pt1 = polarToCart(cx, cy, R.Aspects, eclToScreenAngle(i * 30, house1RefAbs));
            const pt2 = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(i * 30, house1RefAbs));
            svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.8"/>`;
        }

        for (let i = 0; i < 12; i++) {
            for (let d = 0; d < 12; d++) {
                const pt1 = polarToCart(cx, cy, R.SignSector, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
                const pt2 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
                svg += `<line x1="${pt1.x}" x2="${pt2.x}" y1="${pt1.y}" y2="${pt2.y}" stroke="${tinta.dodecatemoriaLinha}" stroke-width="0.8"/>`;
            }
        }

        for (let s = 0; s < 12; s++) {
            let prev = 0;
            EGYPTIAN_TERMS[s].forEach(term => {
                const pt1 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((s * 30) + prev, house1RefAbs));
                const pt2 = polarToCart(cx, cy, R.Termos, eclToScreenAngle((s * 30) + prev, house1RefAbs));
                svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.2"/>`;
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

        const ascPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(ascAbs, house1RefAbs));
        const dscPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(ascAbs, house1RefAbs) + 180) % 360);
        svg += `<line x1="${ascPt.x}" y1="${ascPt.y}" x2="${dscPt.x}" y2="${dscPt.y}" stroke="${papiro ? COR_TINTA_OCRE : tinta.inkForte}" stroke-width="2.5"/>`;

        const mcPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(mcAbs, house1RefAbs));
        const icPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(mcAbs, house1RefAbs) + 180) % 360);
        svg += `<line x1="${mcPt.x}" y1="${mcPt.y}" x2="${icPt.x}" y2="${icPt.y}" stroke="${papiro ? COR_TINTA_OCRE : tinta.inkForte}" stroke-width="2.5"/>`;

        /* A PARTIR DAQUI SO ICONE - nada de linha/dentinho novo abaixo
           disso, pra manter a estrutura da roda sempre por tras. */

        const rEixoInterno = R.SignSector - 12;
        const eixosInternos = [
            { label: "ASC", deg: ascAbs, color: papiro ? TERRACOTA : tinta.inkForte },
            { label: "DSC", deg: (ascAbs + 180) % 360, color: papiro ? TERRACOTA : tinta.inkForte },
            { label: "MC", deg: mcAbs, color: papiro ? TERRACOTA : tinta.inkForte },
            { label: "IC", deg: (mcAbs + 180) % 360, color: papiro ? TERRACOTA : tinta.inkForte }
        ];
        eixosInternos.forEach(eixo => {
            const aScreen = eclToScreenAngle(eixo.deg, house1RefAbs);
            const pPos = polarToCart(cx, cy, rEixoInterno, aScreen);
            const anguloFrag = getIconeFragmento('outro', 'angulo', undefined, papiro ? COR_TINTA_OCRE : undefined);
            const anguloFundo = papiro ? '' : getIconeFundoSilhueta('outro', 'angulo', '#fffdf5');
            svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                <g transform="scale(0.4) translate(-50, -50) rotate(${aScreen - 180} 50 50)">${anguloFundo}${anguloFrag}</g>
                <text x="0" y="3.5" font-size="6.5" font-weight="900" fill="${eixo.color}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="1.8" paint-order="stroke fill">${eixo.label}</text>
                <text x="0" y="24" font-size="8" font-weight="bold" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(eixo.deg)}</text>
            </g>`;
        });

        const refSignIdx = Math.floor(house1RefAbs / 30);
        for (let i = 0; i < 12; i++) {
            const aMid = eclToScreenAngle((i * 30) + 15, house1RefAbs);
            const pNum = polarToCart(cx, cy, 122, aMid);
            svg += `<text x="${pNum.x}" y="${pNum.y + 5}" font-family="'Cinzel', serif" font-size="15" font-weight="bold" fill="${tinta.douradoCasas}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="4" paint-order="stroke fill">${((i - refSignIdx + 12) % 12) + 1}</text>`;

            const pSym = polarToCart(cx, cy, 166, aMid);
            svg += `<svg x="${pSym.x - 17}" y="${pSym.y - 17}" width="34" height="34" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[i]]};">${MONOLINE_ZODIAC_SVGS[i]}</svg>`;
        }

        for (let i = 0; i < 12; i++) {
            for (let d = 0; d < 12; d++) {
                const pDod = polarToCart(cx, cy, (R.SignSector + R.Dodec) / 2, eclToScreenAngle((i * 30) + (d * 2.5) + 1.25, house1RefAbs));
                svg += `<svg x="${pDod.x - 5.5}" y="${pDod.y - 5.5}" width="11" height="11" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[(i + d) % 12]]};">${MONOLINE_ZODIAC_SVGS[(i + d) % 12]}</svg>`;
            }
        }

        // term.p e so o glifo Unicode ("♃" etc) - de-para pro id do planeta
        // que o icone novo dos termos usa (mesmo mapa de mandala.js). So os
        // 5 regentes de termo egipcio (nunca Sol/Lua) entram aqui.
        const TERMO_PLANET_BY_SYMBOL = { '♃': 'Jupiter', '♀': 'Venus', '☿': 'Mercury', '♂': 'Mars', '♄': 'Saturn' };
        const termoIconTamanho = 18;

        for (let s = 0; s < 12; s++) {
            let prev = 0;
            EGYPTIAN_TERMS[s].forEach(term => {
                const pTerm = polarToCart(cx, cy, (R.Dodec + R.Termos) / 2, eclToScreenAngle((s * 30) + (prev + term.deg) / 2, house1RefAbs));
                const termoPlanetId = TERMO_PLANET_BY_SYMBOL[term.p];
                svg += getIconeTermoSVG(termoPlanetId, termoIconTamanho, goldColor)
                    .replace('<svg ', `<svg x="${pTerm.x - termoIconTamanho / 2}" y="${pTerm.y - termoIconTamanho / 2}" `);
                prev = term.deg;
            });
        }

        /* FAIXAS SÓLIDAS NA BORDA EXTERNA — "ETIQUETAS" DE CADA DESTAQUE.
           A fatia transparente lá atrás dá o clima visual, mas quando dois
           destaques caem no mesmo signo a cor de cima acaba disfarçando a
           de baixo. Estas faixas ficam uma do lado da outra, em cores
           sólidas, sem se misturar — dá pra apontar pro cliente exatamente
           quais destaques bateram naquele signo. Desenhadas antes dos
           planetas (e da mancha de combustão), pra nunca cobrirem um
           planeta que tenha sido empurrado além da borda do mapa. */
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

        svg += desenharFaixaDestaque(highlightMesAbertoSignIdx, papiro ? AZ_TINTA : "#6366f1", R_OuterLine + 4, R_OuterLine + 12);
        svg += desenharFaixaDestaque(highlightAscSignIdx, papiro ? "#6b4a2b" : "#eab308", R_OuterLine + 14, R_OuterLine + 22);
        svg += desenharFaixaDestaque(profectedSignIdx, papiro ? TERRACOTA : "#65a30d", R_OuterLine + 24, R_OuterLine + 32);

        const sunItem = outerRingItems.find(it => it.type === 'planet' && it.id === 'Sun');
        if (sunItem && !papiro) { // no papiro não há mancha de combustão (é um brilho de céu)
            const sunGlowPos = polarToCart(cx, cy, pR, sunItem.aScreen);
            /* Disco branco opaco por baixo do gradiente: a mancha de combustão é
               parcialmente transparente, então sem isso a fatia verde/amarela do
               signo destacado (desenhada bem atrás) vazaria através dela e sujaria
               o dourado puro da mancha. */
            svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaiosGlow}" fill="${tinta.fundoDisco}"/>`;
            svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaiosGlow}" fill="url(#combustionGlow_${sufixo})"/>`;
        }

        // Pontos calculados (nodos, sizígia, lotes): círculo cremoso por trás do ícone; no papiro não há nada atrás (aqui não existe céu, então não precisa do retículo que diz "isto foi posto por cima do céu").
        const circuloFundoPonto = papiro ? '' : '<circle cx="0" cy="0" r="11" fill="#fffdf5"/>';
        outerRingItems.forEach(item => {
            if (item.type === 'planet') return;
            const raioEfetivo = (item.type === 'lot' ? 276 : pR) + (item.rOffset || 0);
            const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
            const p2 = polarToCart(cx, cy, (item.type === 'lot' ? raioEfetivo - 12 : raioEfetivo - 19), item.aShift);
            svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${item.color}" stroke-width="1.2"/>`;

            const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
            const LOTE_ICON_KEY = {
                fortune: 'fortune', spirit: 'spirit', venus: 'eros',
                mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis'
            };
            if (item.type === "node") {
                const nodeKey = (item.label === '☊') ? 'northNode' : 'southNode';
                svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                    ${circuloFundoPonto}
                    <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('outro', nodeKey)}</g>
                    <text x="0" y="19" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
                </g>`;
            } else if (item.type === "syzygy") {
                svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                    ${circuloFundoPonto}
                    <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('outro', 'sizigia')}</g>
                    <text x="0" y="21" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
                </g>`;
            } else if (item.type === "lot") {
                const loteKey = LOTE_ICON_KEY[item.lotType] || 'fortune';
                svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                    ${circuloFundoPonto}
                    <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('lote', loteKey)}</g>
                    <text x="0" y="17" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
                </g>`;
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
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${tinta.linhaConectora}" stroke-width="1.2"/>`;

                const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
                const planetSvgContent = papiro ? getIconeFragmento('planeta', item.id, dados) : fragmentoPlaneta3D(item.id, sufixo);
                let retroSymbol = item.retro ? `<tspan fill="${papiro ? TERRACOTA : '#dc2626'}" font-weight="900"> ℞</tspan>` : '';
                svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
                    <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
                    <text x="0" y="27" font-size="10.5" font-weight="800" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
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
                    <path d="M -9,5 L -9,-2 L -4.5,2.5 L 0,-7 L 4.5,2.5 L 9,-2 L 9,5 Z" fill="${papiro ? 'none' : '#f5c518'}" stroke="${papiro ? TERRACOTA : '#a8790a'}" stroke-width="${papiro ? 1.4 : 0.9}" stroke-linejoin="round"/>
                    <circle cx="0" cy="-7" r="1.6" fill="${papiro ? TERRACOTA : '#dc2626'}"/>
                    <circle cx="-9" cy="-2" r="1.3" fill="${papiro ? TERRACOTA : '#dc2626'}"/>
                    <circle cx="9" cy="-2" r="1.3" fill="${papiro ? TERRACOTA : '#dc2626'}"/>
                </g>`;
            }
        }

        svg += `</svg>`;
        return svg;
    }

    async function iniciarModuloProfeccao() {
        const container = document.getElementById('mandala-container');
        if (!container) return;

        if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--danger); font-family: sans-serif;">Nenhum mapa carregado no sistema.</div>`;
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

        window.profeccaoIdadeBase = idade;
        window.profeccaoAnoNasc = dataNasc.getFullYear();
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
        const headerTitle = (typeof currentSubjectName !== 'undefined' ? currentSubjectName : '');

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

        const latAtual = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lat !== undefined) ? currentGeo.lat : -23.5505;
        const lonAtual = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lon !== undefined) ? currentGeo.lon : -46.6333;

        function blocoDiaHora(rotulo, horasInfo) {
            if (!horasInfo) return '';
            return `
                <div style="display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
                    ${horasInfo.dayRulerId ? `
                    <div style="text-align: center;">
                        <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">DIA</div>
                        ${getPlanet3DSVG(horasInfo.dayRulerId, 28)}
                    </div>` : ''}
                    ${horasInfo.hourRulerId ? `
                    <div style="text-align: center;">
                        <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">HORA</div>
                        ${getPlanet3DSVG(horasInfo.hourRulerId, 28)}
                    </div>` : ''}
                </div>`;
        }

        /* CABEÇALHO PADRÃO (a função global, mandala.js), um por mandala: o da
           Revolução Solar acima da RS e o do Mapa Natal acima do Natal, cada
           um na largura de uma mandala (layout estreito) e com a mesma altura. */
        const LARGURA_CABECALHO_PROF = 480;
        const modoEscuroCabProf = document.documentElement.classList.contains('tema-escuro');
        const coresCabProf = coresCabecalhoMandala(modoEscuroCabProf, null);
        const rsMomento = (dadosRS && rsTimestamp) ? new Date(rsTimestamp) : null;
        const opcoesCabRS = rsMomento ? {
            largura: LARGURA_CABECALHO_PROF, tipoMapa: 'Revolução Solar', momento: rsMomento,
            horasInfo: calcularHorasPlanetariasProf(rsMomento, latAtual, lonAtual, fusoNatalVal)
        } : null;
        const layoutCabNatal = montarCabecalhoMandalaLayout(dadosNatal, 2, coresCabProf, null, { largura: LARGURA_CABECALHO_PROF });
        const layoutCabRS = opcoesCabRS ? montarCabecalhoMandalaLayout(dadosRS, 2, coresCabProf, null, opcoesCabRS) : null;
        const alturaCabProf = Math.max(layoutCabNatal.altura, layoutCabRS ? layoutCabRS.altura : 0);
        const cabecalhoNatalHTML = montarCabecalhoMandalaImagemHTML(dadosNatal, null, { largura: LARGURA_CABECALHO_PROF, alturaMinima: alturaCabProf, tintaSobreFolha: true });
        const cabecalhoRSHTML = opcoesCabRS ? montarCabecalhoMandalaImagemHTML(dadosRS, null, Object.assign({ alturaMinima: alturaCabProf, tintaSobreFolha: true }, opcoesCabRS)) : '';
        const btnCssProf = "width: 36px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 0; color: var(--primary-blue);";
        const cardMandalaCssProf = "background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);";

        let html = `
    <div style="width: 100%;">
        <div style="display: flex; justify-content: flex-end; align-items: flex-start; gap: 6px; margin-bottom: 8px;">
            <div style="position: relative; flex-shrink: 0;">
                <button type="button" onclick="toggleJanelaAnoProfeccao(event)" title="Escolher o ano profectado" style="${btnCssProf}">
                    <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="48" height="44" rx="5"/><line x1="8" y1="26" x2="56" y2="26"/><line x1="20" y1="6" x2="20" y2="18"/><line x1="44" y1="6" x2="44" y2="18"/><circle cx="22" cy="38" r="1.5"/><circle cx="32" cy="38" r="1.5"/><circle cx="42" cy="38" r="1.5"/><circle cx="22" cy="47" r="1.5"/><circle cx="32" cy="47" r="1.5"/></svg>
                </button>
                <div id="profeccaoJanelaAno" style="display: none; position: absolute; top: 42px; right: 0; z-index: 9999; background: var(--bg-main); border: 1px solid var(--primary-blue); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 280px; font-family: inherit;">
                    <div style="padding: 10px 14px; border-bottom: 1px solid var(--gold-primary); border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <span style="font-size: 10px; text-transform: uppercase; color: var(--gold-primary); font-weight: 700; letter-spacing: 0.5px;">Mapa Selecionado</span>
                        <div id="profeccaoJanelaNome" style="font-weight: 700; font-size: 13px; color: var(--primary-blue); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
                    </div>
                    <div style="padding: 12px 14px;">
                        <span style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; display: block;">Ano Profectado</span>
                        <span id="profeccaoJanelaAnoLabel" style="font-weight: 700; font-size: 14px; color: var(--primary-blue);"></span>
                    </div>
                    <div id="profeccaoListaAnos" style="max-height: 250px; overflow-y: auto; border-top: 1px solid var(--gold-primary); border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;"></div>
                </div>
            </div>
            <button type="button" onclick="salvarProfeccaoNaGaleria()" title="Salvar a Profecção como imagem na galeria (com título e cabeçalhos)" style="${btnCssProf}">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
            </button>
            <div style="position: relative; flex-shrink: 0;">
                <button type="button" onclick="const m=document.getElementById('profeccaoMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório" style="${btnCssProf}">
                    <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
                </button>
                <div id="profeccaoMenuRelatorio" style="display: none; position: absolute; top: 40px; right: 0; background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; min-width: 230px; overflow: hidden;">
                    <div onclick="capturarProfeccaoParaRelatorio('inteira')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary-blue); border-bottom: 1px solid var(--border-color);">Ferramenta inteira (com cabeçalhos)</div>
                    <div onclick="capturarProfeccaoParaRelatorio('mandalas')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary-blue); border-bottom: 1px solid var(--border-color);">Só as mandalas (com cabeçalhos)</div>
                    <div onclick="capturarProfeccaoParaRelatorio('tabela')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary-blue);">Só a tabela</div>
                </div>
            </div>
        </div>
    <div id="profeccao-container"
         style="width: 100%; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">

        <div style="text-align: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 6px;">
                <button onclick="mudarAnoProfeccao(-1)" style="background: var(--bg-main); border: 1px solid #d4af37; color: var(--primary-blue); border-radius: 6px; width: 36px; height: 36px; font-weight: bold; cursor: pointer; font-size: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; padding: 0;">&lt;</button>

                <h2 style="font-family: 'Cinzel', serif; color: var(--primary-blue); margin: 0; font-size: 18px; text-transform: uppercase;">Profecção Anual ${idade} - Anos</h2>

                <button onclick="mudarAnoProfeccao(1)" style="background: var(--bg-main); border: 1px solid #d4af37; color: var(--primary-blue); border-radius: 6px; width: 36px; height: 36px; font-weight: bold; cursor: pointer; font-size: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; padding: 0;">&gt;</button>
            </div>

            <div id="profeccaoAnoProfectado" style="font-size: 13px; color: var(--primary-blue); display: flex; align-items: center; justify-content: center; gap: 5px;">
                <strong>Ano Profectado:</strong> Casa ${houseNumber} em ${getSignSvgHtml(profectedSignIdx, 18)} Senhor: ${getPlanet3DSVG(SIGNS[profectedSignIdx].ruler, 26)}
            </div>
        </div>

        <!-- Dois cabeçalhos PADRÃO (função global), cada um acima da sua mandala, lado a lado. -->
        <div id="profeccaoDuasColunas" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 18px; margin-bottom: 20px;">
            <div style="flex: 1 1 0; min-width: 280px;">
                ${cabecalhoRSHTML}
                <div style="${cardMandalaCssProf}">
                    ${gerarMandalaSVG(dadosRS, { profectedSignIdx })}
                </div>
            </div>
            <div style="flex: 1 1 0; min-width: 280px;">
                ${cabecalhoNatalHTML}
                <div style="${cardMandalaCssProf}">
                    ${gerarMandalaSVG(dadosNatal, { profectedSignIdx, highlightAscSignIdx: rsAscSignIdx, highlightMesAbertoSignIdx: expandedMonthSignIdx })}
                </div>
            </div>
        </div>

        <div id="profeccaoTabelaCard" style="background: var(--bg-card); border: 2px solid var(--gold-primary); border-radius: 14px; padding: 18px; box-shadow: 0 4px 16px rgba(197, 155, 39, 0.08);">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
                <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: var(--primary-blue); font-weight: 800; margin: 0; text-transform: uppercase;">Profecção Mensal - 30 dias 10 horas 30 minutos</h3>
            </div>

            <div id="profMensalOuterScroll" style="overflow-x: auto; overflow-y: hidden; text-align: center; margin-top: 10px; touch-action: pan-y;">
              <div id="profMensalScaleBox">
              <div id="profMensalWrapper" style="background: var(--bg-card); border: 1px solid var(--gold-primary); border-radius: 10px; overflow: hidden; transform-origin: top left;">
                <table id="profMensalTable" style="width: 100%; border-collapse: collapse; background: var(--bg-card); font-size: 13px;">
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
            const bgRow = isExpanded ? '#e0e7ff' : (i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)');

            html += `
                <tr onclick="alternarMesProfeccao(${i})" ${isExpanded ? 'data-mes-ativo="1"' : ''} style="border-bottom: 1px solid var(--border-color); background-color: ${bgRow}; cursor: pointer; user-select: none;">
                    <td style="padding: 10px 12px; text-align: center;"><strong>Mês ${m.monthNum}</strong></td>
                    <td style="padding: 10px 12px; text-align: center;">${getSignSvgHtml(m.signIdx, 20)}</td>
                    <td style="padding: 10px 12px; text-align: center;">${getPlanet3DSVG(mSign.ruler, 30)}</td>
                    <td style="padding: 10px 12px; text-align: left;">${formatarData(m.start)}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div></div></div></div></div>`;
        container.innerHTML = html;

        // Em telas estreitas, em vez de deixar a tabela cortada com rolagem
        // interna, encolhe ela (mantendo a proporção) até caber inteira na
        // largura disponível — mesma técnica usada nos Decênios e no Painel
        // Técnico. Em telas largas, onde a tabela já cabe no espaço de
        // sempre (width: 100%), NADA é alterado: a tabela continua
        // exatamente como sempre foi, ocupando a largura toda do cartão.
        const outerScroll = document.getElementById('profMensalOuterScroll');
        const scaleBox = document.getElementById('profMensalScaleBox');
        const wrapper = document.getElementById('profMensalWrapper');
        const tabelaMensal = document.getElementById('profMensalTable');
        if (outerScroll && scaleBox && wrapper && tabelaMensal && outerScroll.parentElement) {
            // O espaço disponível é o do cartão que envolve a tabela
            // diretamente (não o do "profeccao-container" lá fora, que tem
            // padding próprio somado ao padding do cartão — usar o de fora
            // subestimava o quanto a tabela precisava encolher).
            const parentEl = outerScroll.parentElement;
            const parentStyles = getComputedStyle(parentEl);
            const availableWidth = parentEl.clientWidth
                - parseFloat(parentStyles.paddingLeft || 0)
                - parseFloat(parentStyles.paddingRight || 0);

            // Mede a largura "natural" (sem quebra de linha) da tabela.
            // display:inline-block sozinho não basta: como o wrapper ainda
            // está dentro de contêineres de largura limitada, o navegador
            // encolhe (shrink-to-fit) a caixa até o espaço disponível em vez
            // de revelar o quanto o conteúdo realmente precisaria — fazendo
            // a tabela parecer que "cabe" quando na verdade não cabe.
            // width: max-content ignora essa limitação e força a largura
            // real do conteúdo, mesmo que estoure o contêiner.
            tabelaMensal.style.width = 'auto';
            wrapper.style.width = 'max-content';
            const naturalWidth = wrapper.offsetWidth;
            const naturalHeight = wrapper.offsetHeight;

            if (availableWidth > 0 && naturalWidth > availableWidth) {
                const escala = availableWidth / naturalWidth;
                const scaledHeight = naturalHeight * escala;
                scaleBox.style.display = 'inline-block';
                wrapper.style.display = 'inline-block';
                // width:max-content continua aplicado (não é resetado aqui):
                // se voltasse para vazio, o navegador encolheria a caixa de
                // novo para caber no espaço disponível (mesmo problema do
                // shrink-to-fit acima), e o transform passaria a escalar uma
                // caixa mais estreita que a medida — sobrando um vão vazio à
                // direita da tabela em vez dela preencher o cartão.
                wrapper.style.transform = `scale(${escala})`;
                scaleBox.style.width = (naturalWidth * escala) + 'px';
                scaleBox.style.height = scaledHeight + 'px';
                // Contorna uma peculiaridade do navegador: um contêiner com
                // overflow ao redor de uma <table> transformada calcula a
                // própria altura com base no tamanho ANTES da escala.
                outerScroll.style.height = scaledHeight + 'px';
            } else {
                // Cabe do jeito de sempre: desfaz a medição e devolve tudo
                // ao estado original (nenhuma mudança visual).
                wrapper.style.width = '';
                wrapper.style.display = '';
                wrapper.style.transform = '';
                tabelaMensal.style.width = '100%';
                scaleBox.style.display = '';
                scaleBox.style.width = '';
                scaleBox.style.height = '';
                outerScroll.style.height = '';
            }
        }
    }

    /* IMAGENS DA PROFECÇÃO (galeria e relatório). Título, cabeçalhos e mandalas
       saem direto do SVG (rápido); a tabela mensal e a linha "Ano Profectado" são
       HTML e passam pelo html2canvasRapido. As setas do ano ficam de fora. */
    function fundoCapturaProf() {
        // Tema Céu: a tela é papiro (claro e escuro) — a imagem salva sai sobre papiro, cor chapada pro recorte achar a borda.
        // Imagem pro RELATÓRIO (window.__capturaSemFundo ligado só durante a captura): sem fundo nenhum, só as linhas em tinta.
        if (typeof window !== 'undefined' && window.temaMandala === 'ceu') return window.__capturaSemFundo ? null : papiroCores().chapado;
        return document.documentElement.classList.contains('tema-escuro') ? '#1c1917' : '#fffdf5';
    }

    /* Cabeçalhos + cartões das mandalas, na mesma posição em que estão na tela
       (lado a lado ou empilhados), num SVG só. */
    async function montarTopoProfeccao(idCaixa) {
        const caixa = document.getElementById(idCaixa || 'profeccaoDuasColunas');
        if (!caixa) return null;
        const R = caixa.getBoundingClientRect();
        let partes = '';
        const serializar = (svgEl, rect) => {
            const xml = new XMLSerializer().serializeToString(svgEl);
            const abertura = xml.match(/^<svg[^>]*>/)[0];
            // tira atributos de posição/tamanho/estilo da tag de abertura e põe os desta posição
            const novaAbertura = abertura.replace(/ (style|width|height|x|y)="[^"]*"/g, '')
                .replace('<svg ', `<svg x="${rect.left - R.left}" y="${rect.top - R.top}" width="${rect.width}" height="${rect.height}" `);
            return novaAbertura + xml.slice(abertura.length);
        };
        Array.from(caixa.children).forEach(coluna => {
            const cab = coluna.querySelector(':scope > div > svg');
            if (cab) partes += serializar(cab, cab.getBoundingClientRect());
            const cartao = coluna.querySelector(':scope > div:last-child');
            const roda = cartao && cartao.querySelector('svg');
            if (cartao) {
                const rc = cartao.getBoundingClientRect(), cs = getComputedStyle(cartao);
                const borda = parseFloat(cs.borderTopWidth) || 0, raio = parseFloat(cs.borderTopLeftRadius) || 0;
                partes += `<rect x="${rc.left - R.left + borda / 2}" y="${rc.top - R.top + borda / 2}" width="${rc.width - borda}" height="${rc.height - borda}" rx="${raio}" ry="${raio}" fill="${cs.backgroundColor}" stroke="${cs.borderTopColor}" stroke-width="${borda}"/>`;
            }
            if (roda) partes += serializar(roda, roda.getBoundingClientRect());
        });
        const W = Math.round(R.width), H = Math.round(R.height);
        return rasterizarSvgParaCanvas(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${partes}</svg>`, W, H, fundoCapturaProf(), 2);
    }

    /* opc: { titulo, ano, topo, tabela } (booleanos) */
    async function montarImagemProfeccao(opc) {
        const fundo = fundoCapturaProf();
        const pecas = [];
        if (opc.titulo) {
            const h2 = document.querySelector('#profeccao-container h2');
            const cores = (window.temaMandala === 'ceu') ? coresCabecalhoTinta() : coresCabecalhoMandala(document.documentElement.classList.contains('tema-escuro'), null);
            const W = Math.max(320, Math.round((document.getElementById('profeccaoDuasColunas') || document.getElementById('profeccao-container')).getBoundingClientRect().width));
            pecas.push(await rasterizarSvgParaCanvas(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="34" viewBox="0 0 ${W} 34"><text x="${W / 2}" y="26" text-anchor="middle" font-family="serif" font-size="20" font-weight="800" letter-spacing="1" fill="${cores.titulo}">${escapeHtmlProf(((h2 && h2.textContent) || 'Profecção Anual').trim().toUpperCase())}</text></svg>`, W, 34, fundo, 2));
        }
        if (opc.ano) {
            const el = document.getElementById('profeccaoAnoProfectado');
            if (el) pecas.push(await html2canvasRapido(el, fundo));
        }
        if (opc.topo) {
            const topo = await montarTopoProfeccao();
            if (topo) pecas.push(topo);
        }
        if (opc.tabela) {
            const el = document.getElementById('profeccaoTabelaCard');
            if (el) pecas.push(await html2canvasRapido(el, fundo));
        }
        if (!pecas.length) return null;
        if (pecas.length === 1) return pecas[0];
        const gap = 32; // 16px em escala 2
        const saida = document.createElement('canvas');
        saida.width = Math.max(...pecas.map(c => c.width));
        saida.height = pecas.reduce((h, c) => h + c.height, 0) + gap * (pecas.length - 1);
        const ctx = saida.getContext('2d');
        if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, saida.width, saida.height); }
        let y = 0;
        pecas.forEach(c => { ctx.drawImage(c, Math.round((saida.width - c.width) / 2), y); y += c.height + gap; });
        return saida;
    }

    /* Botão de galeria: título + "Ano Profectado" + cabeçalhos + mandalas + tabela,
       SÓ AO TOCAR (ver capturarESalvarNaGaleria, mandala.js). */
    function salvarProfeccaoNaGaleria() {
        capturarESalvarNaGaleria(
            () => montarImagemProfeccao({ titulo: true, ano: true, topo: true, tabela: true }),
            `Astro_Hellenic_Profeccao_${((typeof currentSubjectName !== 'undefined' && currentSubjectName) || 'mapa').replace(/\s+/g, '_')}.png`
        );
    }
    window.salvarProfeccaoNaGaleria = salvarProfeccaoNaGaleria;

    /* Manda pro Relatório. modo: 'inteira' (Ano Profectado + cabeçalhos/mandalas +
       tabela), 'mandalas' (cabeçalhos + mandalas) ou 'tabela' (só a tabela, sem
       cabeçalho). As mandalas sempre levam os cabeçalhos. */
    async function capturarProfeccaoParaRelatorio(modo) {
        const menu = document.getElementById('profeccaoMenuRelatorio');
        if (menu) menu.style.display = 'none';
        const opc = modo === 'tabela' ? { tabela: true }
            : modo === 'mandalas' ? { topo: true }
            : { ano: true, topo: true, tabela: true };
        window.__capturaSemFundo = true;
        const fundo = fundoCapturaProf();
        try {
            const bruto = await montarImagemProfeccao(opc);
            if (!bruto) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
            const canvas = recortarCanvasAoConteudo(bruto, fundo);
            const total = adicionarCapturaRelatorio('profeccao', canvas.toDataURL('image/png'));
            const oQue = modo === 'tabela' ? 'Tabela' : modo === 'mandalas' ? 'Mandalas' : 'Ferramenta inteira';
            alert(`"Profecção Anual" (${oQue}) foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
        } catch (err) {
            console.error('Erro ao adicionar a Profecção ao relatório:', err);
            alert('Não foi possível adicionar esta tela ao relatório.');
        } finally {
            window.__capturaSemFundo = false;
        }
    }
    window.capturarProfeccaoParaRelatorio = capturarProfeccaoParaRelatorio;

    // Reaproveitados pela Sinastria (mesmo layout de cabeçalho + mandala, lado a lado)
    window.montarTopoDuasMandalas = montarTopoProfeccao;
    window.calcularHorasPlanetariasProf = calcularHorasPlanetariasProf;

    window.iniciarModuloProfeccao = iniciarModuloProfeccao;
})();
