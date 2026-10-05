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
            h += `<div class="item-menu${sel ? ' ano-item-selecionado ativa' : ''}" onclick="selecionarAnoProfeccao(${a})"><span><strong>${a}</strong>, ${a - nasc} anos</span></div>`;
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
    const ELEMENT_SIGN_COLORS = ELEMENTO_SIGNO_EPOCA; // cores do elemento: papiro.js (fonte única)

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
        // Cor do elemento do signo pela paleta de época (fogo laranja, terra marrom, ar cinza, água azul egípcio claro), na versão do modo.
        const pal = paletaEpoca(document.documentElement.classList.contains('tema-escuro') && window.temaMandala !== 'ceu');
        const color = ({ fire: pal.laranja, earth: pal.marrom, air: pal.cinza, water: pal.azulClaro })[SIGN_ELEMENTS[signIdx]];
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
          ${combustaoStopsAuto()}
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

    /* GERA A MANDALA DA PROFECÇÃO EM SVG — desenhada pela RODA CENTRAL (desenharRodaSVG, roda.js), a mesma de todas as
       ferramentas: o estilo (francês / Astro Hellenic) e o desenho em si moram lá. Aqui ficam só as coisas DESTA ferramenta:
       os destaques de signo (fatia, etiqueta em faixa e coroa) e as cores deles, o cartão escuro, os ids de SVG por instância
       (as duas mini-mandalas — RS e natal — coexistem na página) e o planeta 3D. Sem cabeçalho nem céu. */
    function gerarMandalaSVG(dados, opcoes = {}) {
        if (!dados || !dados.Ascendente) {
            return `<div style="padding: 40px 10px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`;
        }

        const profectedSignIdx = (opcoes.profectedSignIdx !== undefined) ? opcoes.profectedSignIdx : null;
        const highlightAscSignIdx = (opcoes.highlightAscSignIdx !== undefined) ? opcoes.highlightAscSignIdx : null;
        const highlightMesAbertoSignIdx = (opcoes.highlightMesAbertoSignIdx !== undefined) ? opcoes.highlightMesAbertoSignIdx : null;

        /* Roda SECUNDÁRIA (desta ferramenta): tinta de época, as cores vêm da roda central. Aqui só as cores dos destaques — uma por NÍVEL,
           iguais em toda mandala (corNivelMandala, roda.js): Nível 1 = signo profectado do ano (verde), Nível 2 = Ascendente da Revolução Solar
           (ocre), Nível 3 = signo profectado do mês (azul egípcio claro). */
        const papiro = typeof window !== 'undefined' && window.temaMandala === 'ceu';
        const palP = paletaEpoca(!papiro && document.documentElement.classList.contains('tema-escuro'));
        const sufixo = `w${wheelInstanceCounter++}`;

        return desenharRodaSVG({
            tintaPapiro: papiro,
            ferramenta: {
                dados,
                fundoDisco: papiro ? 'none' : palP.fundoCreme, // o disco tem a cor do painel por baixo (creme / escuro); no papiro, nenhuma
                abertura: ({ canvasSize, fundoDisco }) => `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; margin: 0 auto;">
            <defs>${construirDefsPlanetas(sufixo)}</defs>
            <rect width="${canvasSize}" height="${canvasSize}" fill="${fundoDisco}"/>`,
                fragmentoPlaneta: (id) => fragmentoPlaneta3D(id, sufixo),
                /* Disco branco opaco por baixo do gradiente: a mancha de combustão é parcialmente transparente, então sem isso a fatia
                   verde/amarela do signo destacado (desenhada bem atrás) vazaria através dela e sujaria o dourado puro da mancha. */
                glowSol: (pos, raio, tinta) => `<circle cx="${pos.x}" cy="${pos.y}" r="${raio}" fill="${tinta.fundoDisco}"/>` +
                    `<circle cx="${pos.x}" cy="${pos.y}" r="${raio}" fill="url(#combustionGlow_${sufixo})"/>`,
                destaques: {
                    // fatias (por baixo de tudo): Nível 3 = mês aberto, Nível 1 = signo profectado, Nível 2 = Ascendente da Revolução Solar
                    fatias: [
                        { signIdx: highlightMesAbertoSignIdx, cor: corNivelMandala(3, 0.40) },
                        { signIdx: profectedSignIdx, cor: corNivelMandala(1, 0.40) },
                        { signIdx: highlightAscSignIdx, cor: corNivelMandala(2, 0.40) }
                    ],
                    /* ETIQUETAS: faixas sólidas na borda externa, uma do lado da outra, sem se misturar — quando dois destaques caem no
                       mesmo signo a fatia de cima disfarça a de baixo; assim dá pra apontar exatamente quais bateram naquele signo. */
                    faixas: [
                        { signIdx: highlightMesAbertoSignIdx, cor: corNivelMandala(3), de: 4, ate: 12 },
                        { signIdx: highlightAscSignIdx, cor: corNivelMandala(2), de: 14, ate: 22 },
                        { signIdx: profectedSignIdx, cor: corNivelMandala(1), de: 24, ate: 32 }
                    ],
                    // coroa sobre o regente do signo profectado do ano
                    coroas: (profectedSignIdx !== null && SIGNS[profectedSignIdx]) ? [{
                        rulerId: SIGNS[profectedSignIdx].ruler,
                        preenchimento: 'none', contorno: palP.terracota, espessura: 1.4, ponto: palP.terracota
                    }] : []
                }
            }
        }).svg;
    }
    window.__gerarMandalaSVGProfeccao = gerarMandalaSVG; // gancho dos testes de comparação do desenho (ver CLAUDE.md)

    async function iniciarModuloProfeccao() {
        const container = document.getElementById('mandala-container');
        if (!container) return;

        if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--terracota); font-family: sans-serif;">Nenhum mapa carregado no sistema.</div>`;
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
                        <div style="font-size: 11px; font-weight: 700; color: var(--azul-egipcio-escuro);">DIA</div>
                        ${getPlanet3DSVG(horasInfo.dayRulerId, 28)}
                    </div>` : ''}
                    ${horasInfo.hourRulerId ? `
                    <div style="text-align: center;">
                        <div style="font-size: 11px; font-weight: 700; color: var(--azul-egipcio-escuro);">HORA</div>
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
        const svgCalendario = '<svg class="icone" viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="44" rx="5"/><line x1="8" y1="26" x2="56" y2="26"/><line x1="20" y1="6" x2="20" y2="18"/><line x1="44" y1="6" x2="44" y2="18"/><circle cx="22" cy="38" r="1.5"/><circle cx="32" cy="38" r="1.5"/><circle cx="42" cy="38" r="1.5"/><circle cx="22" cy="47" r="1.5"/><circle cx="32" cy="47" r="1.5"/></svg>';
        const svgGaleria = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
        const svgRelatorio = '<svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';
        const setaAno = (dir) => `<button type="button" class="botao-icone" onclick="mudarAnoProfeccao(${dir})" title="${dir < 0 ? 'Ano anterior' : 'Próximo ano'}"><svg class="icone" viewBox="0 0 64 64"><polyline points="${dir < 0 ? '40,12 20,32 40,52' : '24,12 44,32 24,52'}"/></svg></button>`;

        let html = `
    <div style="width: 100%;">
    <div id="profeccao-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">

        <div class="cabeca-ferramenta">
            <h2 class="titulo-ferramenta">Profecção Anual ${idade} - Anos</h2>
            <div class="acoes-ferramenta">
                <div style="position: relative; flex-shrink: 0;">
                    <button type="button" class="botao-icone" onclick="toggleJanelaAnoProfeccao(event)" title="Escolher o ano profectado">${svgCalendario}</button>
                    <div id="profeccaoJanelaAno" class="menu-flutuante" style="display: none; position: absolute; top: 42px; right: 0; z-index: 9999; width: 280px; font-family: inherit;">
                        <div class="item-menu cabeca-menu">
                            <span class="rotulo">Mapa Selecionado</span>
                            <div id="profeccaoJanelaNome" class="nome-nivel" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
                        </div>
                        <div class="item-menu cabeca-menu">
                            <span class="rotulo">Ano Profectado</span>
                            <span id="profeccaoJanelaAnoLabel" style="font-weight: 700; font-size: 14px;"></span>
                        </div>
                        <div id="profeccaoListaAnos" style="max-height: 250px; overflow-y: auto;"></div>
                    </div>
                </div>
                <button type="button" class="botao-icone" onclick="salvarProfeccaoNaGaleria()" title="Salvar a Profecção como imagem na galeria (com título e cabeçalhos)">${svgGaleria}</button>
                <div style="position: relative; flex-shrink: 0;">
                    <button type="button" class="botao-icone" onclick="const m=document.getElementById('profeccaoMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório">${svgRelatorio}</button>
                    <div id="profeccaoMenuRelatorio" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; min-width: 220px;">
                        <div class="item-menu" onclick="capturarProfeccaoParaRelatorio('inteira')">Ferramenta inteira (com cabeçalhos)</div>
                        <div class="item-menu" onclick="capturarProfeccaoParaRelatorio('mandalas')">Só as mandalas (com cabeçalhos)</div>
                        <div class="item-menu" onclick="capturarProfeccaoParaRelatorio('tabela')">Só a tabela</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="profeccaoAnoProfectado" class="linha-ano-profectado">
            ${setaAno(-1)}
            <span class="linha-glifo" style="justify-content: center; gap: 6px;"><strong>Ano Profectado:</strong> Casa ${houseNumber} em ${getSignSvgHtml(profectedSignIdx, 18)} Senhor: ${getPlanet3DSVG(SIGNS[profectedSignIdx].ruler, 26)}</span>
            ${setaAno(1)}
        </div>

        <!-- Dois cabeçalhos PADRÃO (função global), cada um acima da sua mandala, lado a lado. -->
        <div id="profeccaoDuasColunas" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 18px; margin-bottom: 20px;">
            <div style="flex: 1 1 0; min-width: 280px;">
                ${cabecalhoRSHTML}
                <div class="cartao" style="padding: 12px 10px;">
                    ${gerarMandalaSVG(dadosRS, { profectedSignIdx })}
                </div>
            </div>
            <div style="flex: 1 1 0; min-width: 280px;">
                ${cabecalhoNatalHTML}
                <div class="cartao" style="padding: 12px 10px;">
                    ${gerarMandalaSVG(dadosNatal, { profectedSignIdx, highlightAscSignIdx: rsAscSignIdx, highlightMesAbertoSignIdx: expandedMonthSignIdx })}
                </div>
            </div>
        </div>

        <hr class="divisa">

        <div id="profeccaoTabelaCard">
            <h3 class="titulo-secao" style="margin-top: 0;">Profecção Mensal - 30 dias 10 horas 30 minutos</h3>

            <div id="profMensalOuterScroll" style="overflow-x: auto; overflow-y: hidden; text-align: center; margin-top: 10px; touch-action: pan-y;">
              <div id="profMensalScaleBox">
              <div id="profMensalWrapper" style="transform-origin: top left;">
                <table id="profMensalTable" class="tabela-epoca">
                    <thead>
                        <tr>
                            <th class="centro">Mês</th>
                            <th class="centro">Signo</th>
                            <th class="centro">Regente</th>
                            <th>Início do Período</th>
                        </tr>
                    </thead>
                    <tbody>
`;

        monthlyCache.forEach((m, i) => {
            const mSign = SIGNS[m.signIdx];
            const isExpanded = (window.expandedProfeccaoMes === i);

            html += `
                <tr class="clicavel${isExpanded ? ' ativa' : ''}" onclick="alternarMesProfeccao(${i})" ${isExpanded ? 'data-mes-ativo="1"' : ''} style="user-select: none;">
                    <td class="centro"><strong>Mês ${m.monthNum}</strong></td>
                    <td class="centro">${getSignSvgHtml(m.signIdx, 20)}</td>
                    <td class="centro">${getPlanet3DSVG(mSign.ruler, 30)}</td>
                    <td>${formatarData(m.start)}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div></div></div><hr class="divisa"></div></div>`;
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
                const bordaEsq = parseFloat(cs.borderLeftWidth) || 0;
                if (bordaEsq > 0) {
                    partes += `<rect x="${rc.left - R.left + borda / 2}" y="${rc.top - R.top + borda / 2}" width="${rc.width - borda}" height="${rc.height - borda}" rx="${raio}" ry="${raio}" fill="${cs.backgroundColor}" stroke="${cs.borderTopColor}" stroke-width="${borda}"/>`;
                } else if (borda > 0) { // cartão do padrão: só a linha de cima e a de baixo
                    partes += `<line x1="${rc.left - R.left}" y1="${rc.top - R.top + borda / 2}" x2="${rc.right - R.left}" y2="${rc.top - R.top + borda / 2}" stroke="${cs.borderTopColor}" stroke-width="${borda}"/><line x1="${rc.left - R.left}" y1="${rc.bottom - R.top - borda / 2}" x2="${rc.right - R.left}" y2="${rc.bottom - R.top - borda / 2}" stroke="${cs.borderBottomColor}" stroke-width="${borda}"/>`;
                }
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
