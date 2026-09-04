(function() {
    window.profeccaoOffsetAnos = 0;

    window.mudarAnoProfeccao = function(delta) {
        window.profeccaoOffsetAnos += delta;
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
    const DAILY_STEP_MS = 2.5 * MS_PER_DAY;

    function getSignSvgHtml(signIdx, size = 18) {
        const color = ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[signIdx]];
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; display: inline-block; vertical-align: middle;">${MONOLINE_ZODIAC_SVGS[signIdx]}</svg>`;
    }

    function getPlanet3DSVG(planetId, size = 34) {
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

    function obterTimestampRevolucaoSolar() {
        if (typeof window.currentSolarReturnDate !== 'undefined' && window.currentSolarReturnDate) {
            const rsCalculada = new Date(window.currentSolarReturnDate);
            if (!isNaN(rsCalculada.getTime())) return rsCalculada.getTime();
        }
        if (typeof window.dadosSolar !== 'undefined' && window.dadosSolar && window.dadosSolar.dataHora) {
            const rsCalculada = new Date(window.dadosSolar.dataHora);
            if (!isNaN(rsCalculada.getTime())) return rsCalculada.getTime();
        }
        return null;
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

        const grandCycleHouse = Math.floor(idade / 12) + 1;
        const grandCycleSignIdx = (ascIdx + (grandCycleHouse - 1)) % 12;

        const houseNumber = (idade % 12) + 1;
        const profectedSignIdx = (ascIdx + (idade % 12)) % 12;

        // BUSCA AUTOMÁTICA DA REVOLUÇÃO SOLAR CASO NÃO EXISTA
        let rsTimestamp = obterTimestampRevolucaoSolar();
        const anoAlvoRS = dataNasc.getFullYear() + idade;

        if (!rsTimestamp || (new Date(rsTimestamp).getFullYear() !== anoAlvoRS && new Date(rsTimestamp).getFullYear() !== anoAlvoRS + 1)) {
            try {
                const diaStr = String(dataNasc.getDate()).padStart(2, '0');
                const mesStr = String(dataNasc.getMonth() + 1).padStart(2, '0');
                const dataFormatada = `${dataNasc.getFullYear()}-${mesStr}-${diaStr}`;
                const horaStr = String(dataNasc.getHours()).padStart(2, '0') + ":" + String(dataNasc.getMinutes()).padStart(2, '0');
                
                const lat = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lat) ? currentGeo.lat : -23.5505;
                const lon = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lon) ? currentGeo.lon : -46.6333;
                const fuso = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : -3;

                const urlSolar = `https://motor-astrologia.vercel.app/api/revolucao?data=${dataFormatada}&hora=${horaStr}&lat=${lat}&lon=${lon}&fuso=${fuso}&ano=${anoAlvoRS}`;
                
                const resSolar = await fetch(urlSolar);
                if (resSolar.ok) {
                    const apiJson = await resSolar.json();
                    let horaExataRS = apiJson.momento_exato ? apiJson.momento_exato.hora_local : "";
                    let dataExataRS = apiJson.momento_exato ? apiJson.momento_exato.data_utc : "";

                    let anoR = anoAlvoRS, mesR = dataNasc.getMonth(), diaR = dataNasc.getDate(), horaR = 12, minR = 0;

                    if (dataExataRS && dataExataRS.includes('-')) {
                        const pD = dataExataRS.split('-');
                        anoR = parseInt(pD[0]) || anoAlvoRS;
                        mesR = (parseInt(pD[1]) || 1) - 1;
                        diaR = parseInt(pD[2]) || dataNasc.getDate();
                    }

                    if (horaExataRS && horaExataRS.includes(':')) {
                        const pH = horaExataRS.split(':');
                        horaR = parseInt(pH[0]) || 0;
                        minR = parseInt(pH[1]) || 0;
                    }

                    window.currentSolarReturnDate = new Date(anoR, mesR, diaR, horaR, minR);
                    rsTimestamp = window.currentSolarReturnDate.getTime();
                }
            } catch (err) {
                console.warn("Falha na busca automática da RS para Profecção:", err);
            }
        }

        let html = `
            <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">
                
                <div style="background: #fffdf5; border: 1.5px solid #d4af37; border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <button onclick="mudarAnoProfeccao(-1)" style="background: #ffffff; border: 1px solid #d4af37; color: #103b70; border-radius: 6px; width: 32px; height: 32px; font-weight: bold; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">&lt;</button>
                        
                        <h2 style="font-family: 'Cinzel', serif; color: #103b70; margin: 0; font-size: 18px; text-transform: uppercase;">Profecção Anual (${idade} Anos)</h2>
                        
                        <button onclick="mudarAnoProfeccao(1)" style="background: #ffffff; border: 1px solid #d4af37; color: #103b70; border-radius: 6px; width: 32px; height: 32px; font-weight: bold; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">&gt;</button>
                    </div>

                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; font-size: 13px; align-items: center;">
                        <div><strong>Grande Ciclo de 12 anos:</strong> Casa ${grandCycleHouse} em ${getSignSvgHtml(grandCycleSignIdx, 18)}</div>
                        <div><strong>Ano Profectado:</strong> Casa ${houseNumber} em ${getSignSvgHtml(profectedSignIdx, 18)} Senhor: ${getPlanet3DSVG(SIGNS[profectedSignIdx].ruler, 26)}</div>
                    </div>
                </div>

                <div style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #d4af37; border-radius: 14px; padding: 18px; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.08);">
                    <div style="border-bottom: 1px solid #fef08a; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
                        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #103b70; font-weight: 800; margin: 0; text-transform: uppercase;">Profecção Mensal (30d 10h 30m)</h3>
                    </div>

                    <div style="background: #ffffff; border: 1px solid #d4af37; border-radius: 10px; overflow: hidden; margin-top: 10px;">
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

        let baseMonthStart = rsTimestamp;
        if (!baseMonthStart) {
            let rsAno = hoje.getFullYear();
            const dataAnivEsteAno = new Date(rsAno, dataNasc.getMonth(), dataNasc.getDate(), dataNasc.getHours(), dataNasc.getMinutes());
            if (hoje < dataAnivEsteAno) rsAno--;
            baseMonthStart = new Date(rsAno, dataNasc.getMonth(), dataNasc.getDate(), dataNasc.getHours(), dataNasc.getMinutes()).getTime();
        }

        let currentMonthStart = baseMonthStart;
        const monthlyCache = [];

        for (let i = 0; i < 12; i++) {
            const mSignIdx = (profectedSignIdx + i) % 12;
            const mSign = SIGNS[mSignIdx];
            monthlyCache.push({ monthNum: i + 1, signIdx: mSignIdx, start: currentMonthStart });

            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 12px; text-align: center;"><strong>Mês ${i + 1}</strong></td>
                    <td style="padding: 10px 12px; text-align: center;">${getSignSvgHtml(mSignIdx, 20)}</td>
                    <td style="padding: 10px 12px; text-align: center;">${getPlanet3DSVG(mSign.ruler, 30)}</td>
                    <td style="padding: 10px 12px; text-align: left;">${formatarData(currentMonthStart)}</td>
                </tr>
            `;
            currentMonthStart += MONTH_MS;
        }

        html += `</tbody></table></div></div>`;

        html += `
            <div style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #d4af37; border-radius: 14px; padding: 18px; margin-top: 25px; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.08);">
                <div style="border-bottom: 1px solid #fef08a; padding-bottom: 8px; margin-bottom: 14px;">
                    <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #103b70; font-weight: 800; margin: 0; text-transform: uppercase;">Passos Diários (60 Horas)</h3>
                </div>
        `;

        monthlyCache.forEach(m => {
            html += `
                <details style="margin-bottom: 8px; border: 1px solid #d4af37; border-radius: 8px; padding: 10px; background: #ffffff;">
                    <summary style="font-weight: bold; cursor: pointer; color: #103b70; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                        Mês ${m.monthNum}: ${getSignSvgHtml(m.signIdx, 18)} <span>(${formatarData(m.start)})</span>
                    </summary>
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-top: 8px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                            <thead>
                                <tr style="background: #f1f5f9; color: #103b70;">
                                    <th style="padding: 8px; text-align: center;">Passo</th>
                                    <th style="padding: 8px; text-align: center;">Signo</th>
                                    <th style="padding: 8px; text-align: left;">Início (60h)</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            let dailyStart = m.start;
            for (let d = 0; d < 12; d++) {
                const dSignIdx = (m.signIdx + d) % 12;
                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 6px; text-align: center;">Passo ${d + 1}</td>
                        <td style="padding: 6px; text-align: center;">${getSignSvgHtml(dSignIdx, 16)}</td>
                        <td style="padding: 6px; text-align: left;">${formatarData(dailyStart)}</td>
                    </tr>
                `;
                dailyStart += DAILY_STEP_MS;
            }
            html += `</tbody></table></div></details>`;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }

    window.iniciarModuloProfeccao = iniciarModuloProfeccao;
})();
