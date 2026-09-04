(function() {
    const SIGNS = [
        { ruler: "Marte" },
        { ruler: "Vênus" },
        { ruler: "Mercúrio" },
        { ruler: "Lua" },
        { ruler: "Sol" },
        { ruler: "Mercúrio" },
        { ruler: "Vênus" },
        { ruler: "Marte" },
        { ruler: "Júpiter" },
        { ruler: "Saturno" },
        { ruler: "Saturno" },
        { ruler: "Júpiter" }
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
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" points="52,53 57,58 52,63 "></polyline>`,
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

    function iniciarModuloProfeccao() {
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

        const grandCycleHouse = Math.floor(idade / 12) + 1;
        const grandCycleSignIdx = (ascIdx + (grandCycleHouse - 1)) % 12;

        const houseNumber = (idade % 12) + 1;
        const profectedSignIdx = (ascIdx + (idade % 12)) % 12;

        const rsTimestamp = obterTimestampRevolucaoSolar();

        let html = `
            <div style="max-width: 900px; margin: 0 auto; font-family: 'Montserrat', sans-serif; color: #0f172a; padding: 15px;">
                
                <div style="background: #fffdf5; border: 1.5px solid #d4af37; border-radius: 10px; padding: 16px; margin-bottom: 20px; text-align: center;">
                    <h2 style="font-family: 'Cinzel', serif; color: #103b70; margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase;">Profecção Anual (${idade} Anos)</h2>
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; font-size: 13px;">
                        <div><strong>Grande Ciclo (12a):</strong> Casa ${grandCycleHouse} em ${getSignSvgHtml(grandCycleSignIdx, 18)}</div>
                        <div><strong>Ano Profectado:</strong> Casa ${houseNumber} em ${getSignSvgHtml(profectedSignIdx, 18)} (Senhor: ${SIGNS[profectedSignIdx].ruler})</div>
                    </div>
                </div>

                <h3 style="font-family: 'Cinzel', serif; color: #103b70; font-size: 15px; text-transform: uppercase; margin-bottom: 10px;">Profecção Mensal (30d 10h 30m)</h3>
                <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #cbd5e1; font-size: 13px; margin-bottom: 25px;">
                    <thead>
                        <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
                            <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Mês</th>
                            <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Signo</th>
                            <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Regente</th>
                            <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Início do Período</th>
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
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;"><strong>Mês ${i + 1}</strong></td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${getSignSvgHtml(mSignIdx, 20)}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #1d5fa8; font-weight: bold;">${mSign.ruler}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${formatarData(currentMonthStart)}</td>
                </tr>
            `;
            currentMonthStart += MONTH_MS;
        }

        html += `</tbody></table>`;

        html += `<h3 style="font-family: 'Cinzel', serif; color: #103b70; font-size: 15px; text-transform: uppercase; margin-bottom: 10px;">Passos Diários (60 Horas)</h3>`;

        if (!rsTimestamp) {
            html += `
                <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 14px; text-align: center; color: #991b1b; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
                    Calcule a Revolução Solar do ano profectado para obter os dados do passo diário.
                </div>
            `;
        } else {
            monthlyCache.forEach(m => {
                html += `
                    <details style="margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
                        <summary style="font-weight: bold; cursor: pointer; color: #103b70; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                            Mês ${m.monthNum}: ${getSignSvgHtml(m.signIdx, 18)} <span>(${formatarData(m.start)})</span>
                        </summary>
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; background: #ffffff;">
                            <thead>
                                <tr style="background: #f1f5f9; color: #103b70;">
                                    <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">Passo</th>
                                    <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">Signo</th>
                                    <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">Início (60h)</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                let dailyStart = m.start;
                for (let d = 0; d < 12; d++) {
                    const dSignIdx = (m.signIdx + d) % 12;
                    html += `
                        <tr>
                            <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">Passo ${d + 1}</td>
                            <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">${getSignSvgHtml(dSignIdx, 16)}</td>
                            <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">${formatarData(dailyStart)}</td>
                        </tr>
                    `;
                    dailyStart += DAILY_STEP_MS;
                }
                html += `</tbody></table></details>`;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    window.iniciarModuloProfeccao = iniciarModuloProfeccao;
})();
