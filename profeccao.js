(function() {
    const SIGNS = [
        { name: "Áries", ruler: "Marte" },
        { name: "Touro", ruler: "Vênus" },
        { name: "Gêmeos", ruler: "Mercúrio" },
        { name: "Câncer", ruler: "LUA" },
        { name: "Leão", ruler: "SOL" },
        { name: "Virgem", ruler: "Mercúrio" },
        { name: "Libra", ruler: "Vênus" },
        { name: "Escorpião", ruler: "Marte" },
        { name: "Sagitário", ruler: "Júpiter" },
        { name: "Capricórnio", ruler: "Saturno" },
        { name: "Aquário", ruler: "Saturno" },
        { name: "Peixes", ruler: "Júpiter" }
    ];

    const SIGN_ELEMENTS = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];

    const ELEMENT_SIGN_COLORS = {
        fire: "#e84118",
        earth: "#8b4513",
        air: "#0ea5e9",
        water: "#1d4ed8"
    };

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

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const MONTH_MS = (30 + (10.5 / 24)) * MS_PER_DAY;
    const DAILY_STEP_MS = 2.5 * MS_PER_DAY;
    const YEAR_MS = 12 * MONTH_MS;

    let monthlyDataCache = [];

    function getSignSvgHtml(signIdx, size = 18) {
        const elem = SIGN_ELEMENTS[signIdx];
        const color = ELEMENT_SIGN_COLORS[elem];
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; overflow: visible; display: inline-block; vertical-align: middle; flex-shrink: 0;">${MONOLINE_ZODIAC_SVGS[signIdx]}</svg>`;
    }

    function iniciarModuloProfeccao() {
        const container = document.getElementById('mandala-container');
        if (!container) return;

        container.innerHTML = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

        <div id="profections-fullwidth-root" style="width: 100% !important; margin: 0 auto !important; padding: 10px !important;">
            <div class="app-max-container">

                <style>
                    #profections-fullwidth-root {
                        box-sizing: border-box !important;
                        padding: 10px 15px !important;
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                        font-family: 'Montserrat', sans-serif !important;
                    }

                    #profections-fullwidth-root * {
                        box-sizing: border-box !important;
                        -webkit-tap-highlight-color: transparent !important;
                    }

                    #profections-fullwidth-root .app-max-container {
                        max-width: 1100px !important;
                        margin: 0 auto !important;
                    }

                    #profections-fullwidth-root .font-cinzel { font-family: 'Cinzel', serif !important; }
                    #profections-fullwidth-root .font-playfair { font-family: 'Playfair Display', serif !important; }

                    #profections-fullwidth-root .gold-card-frame {
                        background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%) !important;
                        border: 2px solid #d4af37 !important;
                        box-shadow: 0 4px 16px rgba(212, 175, 55, 0.12) !important;
                        border-radius: 14px !important;
                        padding: 22px 24px !important;
                        margin-bottom: 25px !important;
                        width: 100% !important;
                    }

                    #profections-fullwidth-root .royal-blue-card-frame {
                        background: linear-gradient(145deg, #ffffff 0%, #f4f8ff 100%) !important;
                        border: 2px solid #1d5fa8 !important;
                        box-shadow: 0 4px 16px rgba(29, 95, 168, 0.10) !important;
                        border-radius: 14px !important;
                        padding: 22px 24px !important;
                        margin-bottom: 25px !important;
                        width: 100% !important;
                    }

                    #profections-fullwidth-root .blue-title {
                        color: #103b70 !important;
                        font-family: 'Cinzel', serif !important;
                        font-weight: 800 !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.05em !important;
                    }

                    #profections-fullwidth-root input[type="text"],
                    #profections-fullwidth-root input[type="date"],
                    #profections-fullwidth-root input[type="time"],
                    #profections-fullwidth-root input[type="datetime-local"],
                    #profections-fullwidth-root input[type="number"],
                    #profections-fullwidth-root select {
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                        appearance: none !important;
                        width: 100% !important;
                        height: 44px !important;
                        line-height: 42px !important;
                        background-color: #ffffff !important;
                        border: 1.5px solid #cbd5e1 !important;
                        color: #0f172a !important;
                        border-radius: 8px !important;
                        padding: 0 14px !important;
                        font-size: 13.5px !important;
                        font-family: 'Montserrat', sans-serif !important;
                        outline: none !important;
                        display: block !important;
                        margin: 0 !important;
                        box-sizing: border-box !important;
                    }

                    #profections-fullwidth-root select {
                        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23103b70' viewBox='0 0 16 16'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>") !important;
                        background-repeat: no-repeat !important;
                        background-position: right 14px center !important;
                        padding-right: 36px !important;
                    }

                    #profections-fullwidth-root .btn-blue-metallic {
                        background: linear-gradient(180deg, #2b70c4 0%, #1d5fa8 50%, #12437b 100%) !important;
                        color: #ffffff !important;
                        font-family: 'Cinzel', serif !important;
                        font-weight: 800 !important;
                        font-size: 14px !important;
                        letter-spacing: 0.08em !important;
                        text-transform: uppercase !important;
                        border: 1px solid #3b82f6 !important;
                        border-radius: 10px !important;
                        padding: 14px 28px !important;
                        cursor: pointer !important;
                        box-shadow: 0 4px 14px rgba(29, 95, 168, 0.25) !important;
                        transition: all 0.2s ease !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 8px !important;
                        width: 100% !important;
                        max-width: 320px !important;
                    }

                    #profections-fullwidth-root .btn-gold-outline {
                        background: #ffffff !important;
                        color: #9a6d18 !important;
                        border: 1.5px solid #d4af37 !important;
                        font-weight: 700 !important;
                        border-radius: 8px !important;
                        padding: 9px 14px !important;
                        font-size: 12px !important;
                        cursor: pointer !important;
                        transition: all 0.2s ease !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                    }

                    #profections-fullwidth-root table.custom-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin-top: 8px !important;
                        font-size: 13px !important;
                    }

                    #profections-fullwidth-root table.custom-table th {
                        background: #103b70 !important;
                        color: #fcf6ba !important;
                        font-family: 'Cinzel', serif !important;
                        padding: 10px 14px !important;
                        text-align: left !important;
                        font-size: 12px !important;
                    }

                    #profections-fullwidth-root table.custom-table td {
                        padding: 8px 14px !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                    }

                    .daily-month-card {
                        width: 100% !important;
                        margin-bottom: 30px !important;
                        display: block !important;
                    }
                </style>

                <header style="text-align: center !important; margin-bottom: 24px !important;">
                    <h1 class="blue-title" style="font-size: 24px !important; margin: 0 0 6px 0 !important;">
                        Calculadora de Profecções de Valens
                    </h1>
                    <p class="font-playfair" style="font-style: italic !important; color: #64748b !important; font-size: 13px !important; margin: 0 !important;">
                        Modelo Helenístico Trópico &bull; Signos Inteiros &bull; 12 Anos &bull; Anual &bull; Mensal &bull; Diário
                    </p>
                </header>

                <section class="royal-blue-card-frame no-print">
                    <div style="display: flex !important; align-items: center !important; gap: 8px !important; border-bottom: 1px solid #bfdbfe !important; padding-bottom: 10px !important; margin-bottom: 14px !important;">
                        <i class="fa-solid fa-compass" style="color: #1d5fa8 !important; font-size: 18px !important;"></i>
                        <h2 class="blue-title" style="font-size: 15px !important; margin: 0 !important;">
                            As 4 Camadas da Profecção Helenística (Signos Inteiros)
                        </h2>
                    </div>
                    
                    <div style="font-size: 13px !important; color: #334155 !important; line-height: 1.6 !important;">
                        <div style="background-color: #eff6ff !important; border: 1px solid #bfdbfe !important; padding: 14px !important; border-radius: 10px !important; margin-bottom: 16px !important;">
                            <ul style="margin: 0 !important; padding-left: 18px !important; font-size: 12.5px !important; line-height: 1.5 !important;">
                                <li style="margin-bottom: 4px !important;"><strong>1. Grande Ciclo (12 Anos):</strong> Blocos de 12 anos regidos em sequência da Casa 1 até a Casa 12.</li>
                                <li style="margin-bottom: 4px !important;"><strong>2. Profecção Anual:</strong> Avança 1 signo por ano a partir do aniversário (Revolução Solar).</li>
                                <li style="margin-bottom: 4px !important;"><strong>3. Profecção Mensal:</strong> O ano é dividido em 12 meses de <strong>30d 10h 30m</strong> (30,4375 dias).</li>
                                <li><strong>4. Passo Diário (60 Horas):</strong> Cada mês é desdobrado em 12 passos de <strong>60 horas (2,5 dias)</strong>.</li>
                            </ul>
                        </div>

                        <div style="background-color: #fffdf5 !important; border: 1px solid #fef08a !important; padding: 16px !important; border-radius: 10px !important;">
                            <span class="font-cinzel" style="font-size: 11px !important; font-weight: 700 !important; color: #78350f !important; text-transform: uppercase !important; display: block !important; margin-bottom: 8px !important;">
                                Localizador Automático do Grande Ciclo & Ano
                            </span>

                            <div style="display: flex !important; flex-wrap: wrap !important; gap: 12px !important; align-items: flex-end !important;">
                                <div style="flex: 1 1 180px !important;">
                                    <label style="font-size: 11px !important; font-weight: 700 !important; color: #475569 !important; display: block !important; margin-bottom: 4px !important;">Ascendente Natal:</label>
                                    <select id="natal-ascendant" onchange="autoCalculateAnnualProfection(); autoSaveProfileState();">
                                        <option value="" disabled selected>Selecione...</option>
                                        <option value="0">Áries</option>
                                        <option value="1">Touro</option>
                                        <option value="2">Gêmeos</option>
                                        <option value="3">Câncer</option>
                                        <option value="4">Leão</option>
                                        <option value="5">Virgem</option>
                                        <option value="6">Libra</option>
                                        <option value="7">Escorpião</option>
                                        <option value="8">Sagitário</option>
                                        <option value="9">Capricórnio</option>
                                        <option value="10">Aquário</option>
                                        <option value="11">Peixes</option>
                                    </select>
                                </div>

                                <div style="flex: 1 1 140px !important;">
                                    <label style="font-size: 11px !important; font-weight: 700 !important; color: #475569 !important; display: block !important; margin-bottom: 4px !important;">Idade Atual (Anos):</label>
                                    <input type="number" id="lookup-age" min="0" max="120" placeholder="Ex: 34" oninput="autoCalculateAnnualProfection(); autoSaveProfileState();">
                                </div>

                                <div style="flex: 1 1 220px !important;">
                                    <div id="lookup-result" style="background: #fffbf0 !important; border: 1px solid #d4af37 !important; border-radius: 8px !important; padding: 10px 12px !important; font-size: 11px !important; font-weight: 700 !important; color: #78350f !important; text-align: center !important;">
                                        Selecione Ascendente e Idade
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="gold-card-frame no-print">
                    <div style="background-color: #f8fafc !important; border: 1px solid #e2e8f0 !important; padding: 14px 16px !important; border-radius: 10px !important; margin-bottom: 18px !important;">
                        <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 10px !important; flex-wrap: wrap !important; gap: 8px !important;">
                            <span class="font-cinzel" style="font-size: 12px !important; font-weight: 700 !important; color: #103b70 !important; text-transform: uppercase !important; display: flex !important; align-items: center !important; gap: 6px !important;">
                                <i class="fa-solid fa-folder-open" style="color: #d4af37 !important;"></i> Perfis Salvos:
                            </span>
                            <span id="profileStatusMessage" style="font-size: 11px !important; color: #16a34a !important; font-weight: 600 !important;"></span>
                        </div>

                        <div style="display: flex !important; flex-wrap: wrap !important; gap: 10px !important; align-items: center !important;">
                            <div style="flex: 1 1 200px !important;">
                                <select id="savedProfilesSelect" style="font-weight: 600 !important;">
                                    <option value="">-- Selecione um perfil --</option>
                                </select>
                            </div>
                            <button type="button" id="btnLoadProfile" class="btn-gold-outline" style="height: 44px !important; padding: 0 18px !important;">
                                <i class="fa-solid fa-arrow-down-to-bracket"></i> Carregar
                            </button>
                            <button type="button" id="btnDeleteProfile" style="background: #ffffff !important; color: #dc2626 !important; border: 1.5px solid #fca5a5 !important; border-radius: 8px !important; height: 44px !important; padding: 0 14px !important; font-size: 12px !important; font-weight: 700 !important; cursor: pointer !important;">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>

                        <div style="display: flex !important; flex-wrap: wrap !important; gap: 10px !important; margin-top: 12px !important; border-top: 1px dashed #cbd5e1 !important; padding-top: 12px !important;">
                            <div style="flex: 1 1 220px !important;">
                                <input type="text" id="profileNameInput" placeholder="Nome do Perfil">
                            </div>
                            <button type="button" id="btnSaveProfile" class="btn-gold-outline" style="height: 44px !important; padding: 0 18px !important; background: #fffdf5 !important;">
                                <i class="fa-regular fa-floppy-disk"></i> Salvar Perfil
                            </button>
                        </div>
                    </div>

                    <div style="background-color: #fffdf5 !important; border: 1px solid #fef08a !important; padding: 16px !important; border-radius: 10px !important; margin-bottom: 22px !important;">
                        <div style="display: flex !important; flex-wrap: wrap !important; gap: 16px !important;">
                            <div style="flex: 1 1 220px !important;">
                                <label class="font-cinzel" style="font-size: 11px !important; font-weight: 700 !important; color: #78350f !important; text-transform: uppercase !important; display: block !important; margin-bottom: 6px !important;">
                                    Data e Hora da Revolução Solar / Aniversário *
                                </label>
                                <input type="datetime-local" id="rs-datetime">
                            </div>

                            <div style="flex: 1 1 220px !important;">
                                <label class="font-cinzel" style="font-size: 11px !important; font-weight: 700 !important; color: #78350f !important; text-transform: uppercase !important; display: block !important; margin-bottom: 6px !important;">
                                    Signo Anual Profectado *
                                </label>
                                <select id="annual-sign" style="font-weight: 700 !important; color: #103b70 !important;">
                                    <option value="" disabled selected>Selecione o signo...</option>
                                    <option value="0">Áries (Marte)</option>
                                    <option value="1">Touro (Vênus)</option>
                                    <option value="2">Gêmeos (Mercúrio)</option>
                                    <option value="3">Câncer (LUA)</option>
                                    <option value="4">Leão (SOL)</option>
                                    <option value="5">Virgem (Mercúrio)</option>
                                    <option value="6">Libra (Vênus)</option>
                                    <option value="7">Escorpião (Marte)</option>
                                    <option value="8">Sagitário (Júpiter)</option>
                                    <option value="9">Capricórnio (Saturno)</option>
                                    <option value="10">Aquário (Saturno)</option>
                                    <option value="11">Peixes (Júpiter)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center !important;">
                        <button type="button" onclick="calculateProfections(); autoSaveProfileState();" class="btn-blue-metallic">
                            <i class="fa-solid fa-calculator"></i> Calcular Profecção
                        </button>
                    </div>
                </section>

                <div id="resultsContainer" style="display: none !important;">

                    <div style="display: flex !important; flex-wrap: wrap !important; gap: 10px !important; justify-content: flex-end !important; margin-bottom: 24px !important;" class="no-print">
                        <button type="button" onclick="window.print()" class="btn-gold-outline">
                            <i class="fa-solid fa-print" style="color: #1d5fa8 !important;"></i> Imprimir / PDF
                        </button>
                        <button type="button" onclick="exportICS('year')" class="btn-gold-outline" style="background: #fffdf5 !important;">
                            <i class="fa-regular fa-calendar-plus" style="color: #d4af37 !important;"></i> Agenda (Ano Completo)
                        </button>
                        <button type="button" onclick="exportICS('macro')" class="btn-gold-outline">
                            <i class="fa-solid fa-calendar-days" style="color: #1d5fa8 !important;"></i> Agenda (12 Anos)
                        </button>
                        <button type="button" onclick="exportCSV()" class="btn-gold-outline">
                            <i class="fa-solid fa-file-csv" style="color: #16a34a !important;"></i> CSV
                        </button>
                    </div>

                    <div class="print-page-1">
                        <section class="royal-blue-card-frame">
                            <div style="display: flex !important; align-items: center !important; gap: 8px !important; border-bottom: 1px solid #bfdbfe !important; padding-bottom: 6px !important; margin-bottom: 8px !important;">
                                <i class="fa-solid fa-compass" style="color: #1d5fa8 !important; font-size: 15px !important;"></i>
                                <h2 class="blue-title" style="font-size: 14px !important; margin: 0 !important;">
                                    As 4 Camadas da Profecção Helenística (Signos Inteiros)
                                </h2>
                            </div>
                            <ul style="margin: 0 !important; padding-left: 16px !important; font-size: 11px !important; line-height: 1.4 !important;">
                                <li><strong>1. Grande Ciclo (12 Anos):</strong> Blocos de 12 anos regidos em sequência da Casa 1 até a Casa 12.</li>
                                <li><strong>2. Profecção Anual:</strong> Avança 1 signo por ano a partir do aniversário (Revolução Solar).</li>
                                <li><strong>3. Profecção Mensal:</strong> O ano é dividido em 12 meses de <strong>30d 10h 30m</strong> (30,4375 dias).</li>
                                <li><strong>4. Passo Diário (60 Horas):</strong> Cada mês é desdobrado em 12 passos de <strong>60 horas (2,5 dias)</strong>.</li>
                            </ul>
                        </section>

                        <section class="gold-card-frame" style="padding: 10px 16px !important; background: #fffdf5 !important;">
                            <div id="print-macro-annual-summary" style="font-size: 12px !important; font-weight: 700 !important; color: #78350f !important; display: flex !important; justify-content: space-around !important; flex-wrap: wrap !important; gap: 8px !important; text-align: center !important;">
                            </div>
                        </section>

                        <section class="royal-blue-card-frame">
                            <div style="border-bottom: 1px solid #bfdbfe !important; padding-bottom: 6px !important; margin-bottom: 8px !important; display: flex !important; align-items: center !important; justify-content: space-between !important;">
                                <div style="display: flex !important; align-items: center !important; gap: 8px !important;">
                                    <i class="fa-regular fa-calendar-days" style="color: #1d5fa8 !important; font-size: 14px !important;"></i>
                                    <h2 class="blue-title" style="font-size: 14px !important; margin: 0 !important;">
                                        Profecção Mensal
                                    </h2>
                                </div>
                                <span style="font-size: 11px !important; color: #64748b !important; font-weight: 600 !important;">Passo: 30d 10h 30m</span>
                            </div>

                            <div style="overflow-x: auto !important;">
                                <table class="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Mês</th>
                                            <th>Signo</th>
                                            <th>Início do Mês</th>
                                        </tr>
                                    </thead>
                                    <tbody id="monthly-table-body">
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div id="daily-pairs-master-container">
                    </div>
                </div>
            </div>
        </div>`;

        initAppEvents();

        if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && currentCalculatedData.Ascendente) {
            preencherComDadosDoMapa(currentCalculatedData);
        } else {
            autoRestoreLastState();
        }
    }

    function preencherComDadosDoMapa(dadosNatal) {
        const SIGNOS_INDEX = {
            "Aries": 0, "Áries": 0, "Touro": 1, "Gemeos": 2, "Gêmeos": 2,
            "Cancer": 3, "Câncer": 3, "Leao": 4, "Leão": 4, "Virgem": 5,
            "Libra": 6, "Escorpiao": 7, "Escorpião": 7, "Sagitario": 8, "Sagitário": 8,
            "Capricornio": 9, "Capricórnio": 9, "Aquario": 10, "Aquário": 10, "Peixes": 11
        };

        let ascIdx = 0;
        if (dadosNatal.Ascendente) {
            const nomeSigno = dadosNatal.Ascendente.signo;
            if (nomeSigno && SIGNOS_INDEX[nomeSigno] !== undefined) {
                ascIdx = SIGNOS_INDEX[nomeSigno];
            } else if (dadosNatal.Ascendente.grau_absoluto !== undefined) {
                ascIdx = Math.floor(dadosNatal.Ascendente.grau_absoluto / 30);
            }
        }

        let dataNasc = null;
        if (dadosNatal.data_nascimento) {
            dataNasc = new Date(dadosNatal.data_nascimento);
        } else if (dadosNatal.ano && dadosNatal.mes && dadosNatal.dia) {
            const hora = dadosNatal.hora || 12;
            const min = dadosNatal.minuto || 0;
            dataNasc = new Date(dadosNatal.ano, dadosNatal.mes - 1, dadosNatal.dia, hora, min);
        }

        if (!dataNasc || isNaN(dataNasc.getTime())) {
            dataNasc = new Date();
        }

        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        const m = hoje.getMonth() - dataNasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
            idade--;
        }
        if (idade < 0) idade = 0;

        let rsAno = hoje.getFullYear();
        const dataAnivEsteAno = new Date(rsAno, dataNasc.getMonth(), dataNasc.getDate(), dataNasc.getHours(), dataNasc.getMinutes());
        if (hoje < dataAnivEsteAno) {
            rsAno--;
        }

        const rsDate = new Date(rsAno, dataNasc.getMonth(), dataNasc.getDate(), dataNasc.getHours(), dataNasc.getMinutes());
        const pad = (n) => String(n).padStart(2, '0');
        const rsFormatted = `${rsDate.getFullYear()}-${pad(rsDate.getMonth() + 1)}-${pad(rsDate.getDate())}T${pad(rsDate.getHours())}:${pad(rsDate.getMinutes())}`;

        document.getElementById('natal-ascendant').value = ascIdx;
        document.getElementById('lookup-age').value = idade;
        document.getElementById('rs-datetime').value = rsFormatted;

        autoCalculateAnnualProfection();
        calculateProfections();
    }

    function initAppEvents() {
        loadProfilesDropdown();

        const selectProfile = document.getElementById('savedProfilesSelect');
        if (selectProfile) {
            selectProfile.addEventListener('change', function() {
                if (this.value) {
                    document.getElementById('profileNameInput').value = this.value;
                }
            });
        }

        const btnSave = document.getElementById('btnSaveProfile');
        if (btnSave) btnSave.addEventListener('click', saveCurrentProfile);

        const btnLoad = document.getElementById('btnLoadProfile');
        if (btnLoad) btnLoad.addEventListener('click', loadSelectedProfile);

        const btnDel = document.getElementById('btnDeleteProfile');
        if (btnDel) btnDel.addEventListener('click', deleteSelectedProfile);
    }

    function getSavedProfiles() {
        try {
            const p1 = localStorage.getItem('decennials_saved_profiles');
            const p2 = localStorage.getItem('astrology_client_profiles');
            const obj1 = p1 ? JSON.parse(p1) : {};
            const obj2 = p2 ? JSON.parse(p2) : {};
            return { ...obj1, ...obj2 };
        } catch(e) { return {}; }
    }

    function saveProfilesToStorage(profiles) {
        try {
            const json = JSON.stringify(profiles);
            localStorage.setItem('decennials_saved_profiles', json);
            localStorage.setItem('astrology_client_profiles', json);
        } catch(e) {}
    }

    function loadProfilesDropdown() {
        const select = document.getElementById('savedProfilesSelect');
        if (!select) return;
        select.innerHTML = '<option value="">-- Selecione um perfil --</option>';

        const profiles = getSavedProfiles();
        Object.keys(profiles).forEach(function(name) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    function showStatus(msg) {
        const el = document.getElementById('profileStatusMessage');
        if (el) {
            el.textContent = msg;
            setTimeout(function() { el.textContent = ''; }, 3000);
        }
    }

    function saveCurrentProfile() {
        const nameInput = document.getElementById('profileNameInput');
        let name = nameInput.value.trim();

        if (!name) {
            name = document.getElementById('savedProfilesSelect').value;
        }

        if (!name) {
            alert('Por favor, digite ou selecione o nome do perfil para salvar.');
            return;
        }

        const profiles = getSavedProfiles();
        const existing = profiles[name] || {};

        profiles[name] = {
            ...existing,
            natalAscendant: document.getElementById('natal-ascendant').value,
            lookupAge: document.getElementById('lookup-age').value,
            rsDatetime: document.getElementById('rs-datetime').value,
            annualSign: document.getElementById('annual-sign').value
        };

        saveProfilesToStorage(profiles);
        loadProfilesDropdown();
        document.getElementById('savedProfilesSelect').value = name;
        document.getElementById('profileNameInput').value = name;
        showStatus('✔ Perfil salvo!');
    }

    function loadSelectedProfile() {
        const select = document.getElementById('savedProfilesSelect');
        const name = select.value;
        if (!name) {
            alert('Selecione um perfil na lista para carregar.');
            return;
        }

        document.getElementById('profileNameInput').value = name;
        const profiles = getSavedProfiles();
        const data = profiles[name];

        if (data) {
            if (data.lookupAge) document.getElementById('lookup-age').value = data.lookupAge;
            if (data.rsDatetime) document.getElementById('rs-datetime').value = data.rsDatetime;
            if (data.natalAscendant !== undefined && data.natalAscendant !== "") {
                document.getElementById('natal-ascendant').value = data.natalAscendant;
            }

            autoCalculateAnnualProfection();

            if (data.annualSign !== undefined && data.annualSign !== "") {
                document.getElementById('annual-sign').value = data.annualSign;
            }

            if (document.getElementById('rs-datetime').value && document.getElementById('annual-sign').value !== "") {
                calculateProfections();
            }

            showStatus('✔ Dados do perfil carregados!');
        }
    }

    function deleteSelectedProfile() {
        const select = document.getElementById('savedProfilesSelect');
        const name = select.value;
        if (!name) return;

        if (confirm(`Deseja realmente apagar o perfil "${name}"?`)) {
            const profiles = getSavedProfiles();
            delete profiles[name];
            saveProfilesToStorage(profiles);
            loadProfilesDropdown();
            document.getElementById('profileNameInput').value = '';
            showStatus('✔ Perfil removido.');
        }
    }

    function autoSaveProfileState() {
        try {
            const state = {
                natalAscendant: document.getElementById('natal-ascendant').value,
                lookupAge: document.getElementById('lookup-age').value,
                rsDatetime: document.getElementById('rs-datetime').value,
                annualSign: document.getElementById('annual-sign').value
            };
            localStorage.setItem('profections_last_state', JSON.stringify(state));
        } catch(e) {}
    }

    function autoRestoreLastState() {
        try {
            const last = localStorage.getItem('profections_last_state');
            if (last) {
                const state = JSON.parse(last);
                if (state.natalAscendant !== undefined) document.getElementById('natal-ascendant').value = state.natalAscendant;
                if (state.lookupAge) document.getElementById('lookup-age').value = state.lookupAge;
                if (state.rsDatetime) document.getElementById('rs-datetime').value = state.rsDatetime;
                
                autoCalculateAnnualProfection();

                if (state.annualSign !== undefined) document.getElementById('annual-sign').value = state.annualSign;

                if (state.rsDatetime && state.annualSign !== "") {
                    calculateProfections();
                }
            }
        } catch(e) {}
    }

    function autoCalculateAnnualProfection() {
        const ascValue = document.getElementById('natal-ascendant').value;
        const ageInput = document.getElementById('lookup-age').value;
        const resultDiv = document.getElementById('lookup-result');

        if (ascValue === null || ascValue === "" || ageInput === "" || ageInput < 0) {
            resultDiv.textContent = "Selecione Ascendente e Idade";
            return;
        }

        const ascIdx = parseInt(ascValue, 10);
        const age = parseInt(ageInput, 10);

        const grandCycleHouse = Math.floor(age / 12) + 1;
        const grandCycleSignIdx = (ascIdx + (grandCycleHouse - 1)) % 12;
        const grandCycleSign = SIGNS[grandCycleSignIdx];

        const houseNumber = (age % 12) + 1;
        const profectedSignIdx = (ascIdx + (age % 12)) % 12;
        const profectedSign = SIGNS[profectedSignIdx];

        resultDiv.innerHTML = '';
        const d1 = document.createElement('div');
        d1.style.display = "flex";
        d1.style.alignItems = "center";
        d1.style.justifyContent = "center";
        d1.style.gap = "6px";
        d1.innerHTML = 'Ciclo (12a): <strong>Casa ' + grandCycleHouse + ' em ' + getSignSvgHtml(grandCycleSignIdx, 16) + ' ' + grandCycleSign.name + '</strong>';
        
        const d2 = document.createElement('div');
        d2.style.marginTop = '4px';
        d2.style.display = "flex";
        d2.style.alignItems = "center";
        d2.style.justifyContent = "center";
        d2.style.gap = "6px";
        d2.innerHTML = 'Ano (' + age + 'a): <strong>Casa ' + houseNumber + ' em ' + getSignSvgHtml(profectedSignIdx, 16) + ' ' + profectedSign.name + '</strong>';
        
        resultDiv.appendChild(d1);
        resultDiv.appendChild(d2);

        document.getElementById('annual-sign').value = profectedSignIdx;
    }

    function calculateProfections() {
        const datetimeInput = document.getElementById('rs-datetime').value;
        const annualSignValue = document.getElementById('annual-sign').value;

        if (!datetimeInput || annualSignValue === "") {
            alert("Preencha a Data/Hora da Revolução Solar / Aniversário e o Signo Anual.");
            return;
        }

        const startDate = new Date(datetimeInput);
        if (isNaN(startDate.getTime())) return;

        const annualSignIndex = parseInt(annualSignValue, 10);
        monthlyDataCache = [];

        const ascValue = document.getElementById('natal-ascendant').value;
        const ageInput = document.getElementById('lookup-age').value;
        const summaryDiv = document.getElementById('print-macro-annual-summary');
        
        if (ascValue !== "" && ageInput !== "") {
            const ascIdx = parseInt(ascValue, 10);
            const age = parseInt(ageInput, 10);
            const grandCycleHouse = Math.floor(age / 12) + 1;
            const grandCycleSignIdx = (ascIdx + (grandCycleHouse - 1)) % 12;
            const houseNumber = (age % 12) + 1;
            const profectedSignIdx = (ascIdx + (age % 12)) % 12;

            summaryDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:6px;">
                    <span>Grande Ciclo (12a):</span>
                    <strong>Casa ${grandCycleHouse} em ${getSignSvgHtml(grandCycleSignIdx, 16)} ${SIGNS[grandCycleSignIdx].name}</strong>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span>Ano (${age}a):</span>
                    <strong>Casa ${houseNumber} em ${getSignSvgHtml(profectedSignIdx, 16)} ${SIGNS[profectedSignIdx].name}</strong>
                </div>
            `;
        } else {
            summaryDiv.innerHTML = `<div><strong>Profecção Anual em ${getSignSvgHtml(annualSignIndex, 16)} ${SIGNS[annualSignIndex].name}</strong></div>`;
        }

        const monthlyTbody = document.getElementById('monthly-table-body');
        monthlyTbody.innerHTML = '';

        let currentMonthStart = startDate.getTime();

        for (let m = 0; m < 12; m++) {
            const monthEnd = currentMonthStart + MONTH_MS;
            const monthSignIdx = (annualSignIndex + m) % 12;
            const monthSign = SIGNS[monthSignIdx];

            const monthObj = {
                monthNumber: m + 1,
                signIndex: monthSignIdx,
                signName: monthSign.name,
                startTime: currentMonthStart,
                endTime: monthEnd
            };

            monthlyDataCache.push(monthObj);

            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.innerHTML = '<strong>Mês ' + (m + 1) + '</strong>';

            const td2 = document.createElement('td');
            td2.innerHTML = '<div style="display:flex; align-items:center; gap:6px;">' + getSignSvgHtml(monthSignIdx, 18) + ' <strong style="color:#103b70;">' + monthSign.name + '</strong></div>';

            const td3 = document.createElement('td');
            td3.textContent = formatDate(currentMonthStart);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            monthlyTbody.appendChild(tr);

            currentMonthStart = monthEnd;
        }

        const masterDailyContainer = document.getElementById('daily-pairs-master-container');
        masterDailyContainer.innerHTML = '';

        for (let pairIndex = 0; pairIndex < 6; pairIndex++) {
            const m1 = monthlyDataCache[pairIndex * 2];
            const m2 = monthlyDataCache[(pairIndex * 2) + 1];

            const pairPageWrapper = document.createElement('div');
            pairPageWrapper.className = 'print-pair-page';

            pairPageWrapper.appendChild(buildDailyMonthTableCard(m1));
            pairPageWrapper.appendChild(buildDailyMonthTableCard(m2));

            masterDailyContainer.appendChild(pairPageWrapper);
        }

        document.getElementById('resultsContainer').style.display = 'block';
    }

    function buildDailyMonthTableCard(monthData) {
        const card = document.createElement('section');
        card.className = 'gold-card-frame daily-month-card';

        const header = document.createElement('div');
        header.className = 'card-header-box';
        header.style.cssText = 'border-bottom: 1px solid #fef08a; padding-bottom: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;';
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-clock-rotate-left" style="color: #d4af37; font-size: 13px;"></i>
                <h2 class="blue-title" style="font-size: 13px; margin: 0; color: #1e293b;">Profecção Diária (Passos de 60 Horas)</h2>
            </div>
            <span style="background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 2px 10px; font-size: 11px; font-weight: 700; color: #854d0e; display: inline-flex; align-items: center; gap: 5px;">
                Mês ${monthData.monthNumber}: ${getSignSvgHtml(monthData.signIndex, 14)} ${monthData.signName}
            </span>
        `;
        card.appendChild(header);

        const table = document.createElement('table');
        table.className = 'custom-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 18%;">Passo</th>
                    <th style="width: 32%;">Signo</th>
                    <th style="width: 50%;">Início (60h)</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        let currentDailyStart = monthData.startTime;

        for (let d = 0; d < 12; d++) {
            const dailySignIdx = (monthData.signIndex + d) % 12;
            const dailySign = SIGNS[dailySignIdx];

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Passo ${d + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${getSignSvgHtml(dailySignIdx, 16)}
                        <strong>${dailySign.name}</strong>
                    </div>
                </td>
                <td>${formatDate(currentDailyStart)}</td>
            `;
            tbody.appendChild(tr);

            currentDailyStart += DAILY_STEP_MS;
        }

        card.appendChild(table);
        return card;
    }

    function formatDate(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return weekDays[d.getDay()] + ", " + day + "/" + month + "/" + year + " às " + hours + ":" + minutes;
    }

    function formatDateICS(date) {
        const d = new Date(date);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    }

    function exportICS(mode = 'year') {
        const datetimeInput = document.getElementById('rs-datetime').value;
        const annualSignValue = document.getElementById('annual-sign').value;
        if (!datetimeInput || annualSignValue === "") {
            alert("Calcule a profecção antes de exportar.");
            return;
        }

        const baseStartDate = new Date(datetimeInput);
        const baseSignIdx = parseInt(annualSignValue, 10);

        let icsLines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Valens//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
        const baseTimestamp = baseStartDate.getTime();

        if (mode === 'year') {
            const yearStartTimestamp = baseTimestamp;
            const yearEndTimestamp = yearStartTimestamp + YEAR_MS;
            const currentAnnualSign = SIGNS[baseSignIdx];

            icsLines.push("BEGIN:VEVENT");
            icsLines.push(`SUMMARY:PROFECÇÃO ANUAL: ${currentAnnualSign.name}`);
            icsLines.push(`DESCRIPTION:Signo Profectado do Ano em ${currentAnnualSign.name}.`);
            icsLines.push(`DTSTART:${formatDateICS(yearStartTimestamp)}`);
            icsLines.push(`DTEND:${formatDateICS(yearEndTimestamp)}`);
            icsLines.push("END:VEVENT");

            let monthStartTimestamp = yearStartTimestamp;
            for (let m = 0; m < 12; m++) {
                const monthEndTimestamp = monthStartTimestamp + MONTH_MS;
                const monthSignIdx = (baseSignIdx + m) % 12;
                const monthSign = SIGNS[monthSignIdx];

                icsLines.push("BEGIN:VEVENT");
                icsLines.push(`SUMMARY:Profecção Mensal: ${monthSign.name} (Mês ${m + 1})`);
                icsLines.push(`DTSTART:${formatDateICS(monthStartTimestamp)}`);
                icsLines.push(`DTEND:${formatDateICS(monthEndTimestamp)}`);
                icsLines.push("END:VEVENT");

                let dailyStartTimestamp = monthStartTimestamp;
                for (let d = 0; d < 12; d++) {
                    const dailyEndTimestamp = dailyStartTimestamp + DAILY_STEP_MS;
                    const dailySignIdx = (monthSignIdx + d) % 12;
                    const dailySign = SIGNS[dailySignIdx];

                    icsLines.push("BEGIN:VEVENT");
                    icsLines.push(`SUMMARY:Profecção Diária: ${dailySign.name} (Passo ${d + 1}/12 - Mês ${m + 1})`);
                    icsLines.push(`DTSTART:${formatDateICS(dailyStartTimestamp)}`);
                    icsLines.push(`DTEND:${formatDateICS(dailyEndTimestamp)}`);
                    icsLines.push("END:VEVENT");

                    dailyStartTimestamp = dailyEndTimestamp;
                }

                monthStartTimestamp = monthEndTimestamp;
            }
        } else if (mode === 'macro') {
            for (let y = 0; y < 12; y++) {
                const yearStartTimestamp = baseTimestamp + (y * YEAR_MS);
                const yearEndTimestamp = yearStartTimestamp + YEAR_MS;
                const currentAnnualSignIdx = (baseSignIdx + y) % 12;
                const currentAnnualSign = SIGNS[currentAnnualSignIdx];

                icsLines.push("BEGIN:VEVENT");
                icsLines.push(`SUMMARY:PROFECÇÃO ANUAL: ${currentAnnualSign.name} (Ano ${y + 1})`);
                icsLines.push(`DTSTART:${formatDateICS(yearStartTimestamp)}`);
                icsLines.push(`DTEND:${formatDateICS(yearEndTimestamp)}`);
                icsLines.push("END:VEVENT");
            }
        }

        icsLines.push("END:VCALENDAR");

        const blob = new Blob([icsLines.join("\r\n")], { type: 'text/calendar;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = mode === 'year' ? "profeccao_ano_completo.ics" : "profeccao_12_anos.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportCSV() {
        if (monthlyDataCache.length === 0) return;
        let csvLines = ["Mes;Signo_Mensal;Inicio_Mes;Passo_Diario;Signo_Diario;Inicio_Dia"];

        monthlyDataCache.forEach((m) => {
            let currentDailyStart = m.startTime;
            for (let d = 0; d < 12; d++) {
                const dailySignIdx = (m.signIndex + d) % 12;
                const dailySign = SIGNS[dailySignIdx];
                csvLines.push([`Mês ${m.monthNumber}`, m.signName, `"${formatDate(m.startTime)}"`, `Passo ${d + 1}`, dailySign.name, `"${formatDate(currentDailyStart)}"`].join(";"));
                currentDailyStart += DAILY_STEP_MS;
            }
        });

        const blob = new Blob(["\uFEFF" + csvLines.join("\n")], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `profeccao_valens_tabela.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    window.iniciarModuloProfeccao = iniciarModuloProfeccao;
    window.autoCalculateAnnualProfection = autoCalculateAnnualProfection;
    window.calculateProfections = calculateProfections;
    window.exportICS = exportICS;
    window.exportCSV = exportCSV;
    window.autoSaveProfileState = autoSaveProfileState;
})();
