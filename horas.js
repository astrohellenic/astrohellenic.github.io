/* ==========================================
   MÓDULO DE CÁLCULO E EXIBIÇÃO DAS HORAS
   ========================================== */

function iniciarModuloHoras(containerIdAlvo) {
  const container = document.getElementById(containerIdAlvo || "mandala-container");
  if (!container) return;

  /* Icone do planeta pronto pra tabela/card - delega pro bloco central
     novo em planetIcons.js, que ja resolve sozinho simples/esferico e ja
     da um sufixo unico de ID a cada chamada (nao precisa mais do
     horasIconUidCounter manual que existia aqui, so pra isso). */
  function getPlanet3DSVG(planetId, size) {
    return (typeof getIconeSVG === 'function') ? getIconeSVG('planeta', planetId, size || 34) : '';
  }

  // Ordem Caldaica descendente
  const CHALDEAN_ORDER_PLANETS = [
    { id: "Saturn", name: "Saturno" },
    { id: "Jupiter", name: "Júpiter" },
    { id: "Mars", name: "Marte" },
    { id: "Sun", name: "Sol" },
    { id: "Venus", name: "Vênus" },
    { id: "Mercury", name: "Mercúrio" },
    { id: "Moon", name: "Lua" }
  ];

  const DAY_RULERS_MAP = {
    0: "Sun",
    1: "Moon",
    2: "Mars",
    3: "Mercury",
    4: "Jupiter",
    5: "Venus",
    6: "Saturn"
  };

  function calcularNascerPorDoSol(dateObj, lat, lon, fuso) {
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

    return {
      sunrise: calculateEventTime(true),
      sunset: calculateEventTime(false)
    };
  }

  function formatarHoraMinutoSegundo(date) {
    if (!date) return "--:--";
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  const lat = (typeof currentGeo !== 'undefined' && currentGeo.lat !== undefined) ? currentGeo.lat : -23.5505;
  const lon = (typeof currentGeo !== 'undefined' && currentGeo.lon !== undefined) ? currentGeo.lon : -46.6333;
  const fuso = (typeof currentGeo !== 'undefined' && currentGeo.fuso !== undefined) ? currentGeo.fuso : -3;
  const now = (typeof currentMoment !== 'undefined' && currentMoment) ? new Date(currentMoment) : new Date();

  const sunToday = calcularNascerPorDoSol(now, lat, lon, fuso);

  let astroDate = new Date(now);
  if (sunToday && sunToday.sunrise && now < sunToday.sunrise) {
    astroDate.setDate(astroDate.getDate() - 1);
  }

  const sunAstro = calcularNascerPorDoSol(astroDate, lat, lon, fuso);
  const nextDay = new Date(astroDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const sunNextAstro = calcularNascerPorDoSol(nextDay, lat, lon, fuso);

  const sunrise = sunAstro ? sunAstro.sunrise : null;
  const sunset = sunAstro ? sunAstro.sunset : null;
  const nextSunrise = sunNextAstro ? sunNextAstro.sunrise : null;

  if (!sunrise || !sunset || !nextSunrise) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center;">Erro ao calcular o horário solar.</p>`;
    return;
  }

  const dayOfWeek = astroDate.getDay();
  const firstPlanetId = DAY_RULERS_MAP[dayOfWeek];

  let startIndex = CHALDEAN_ORDER_PLANETS.findIndex(p => p.id === firstPlanetId);

  const dayDurationMs = (sunset - sunrise) / 12;
  const nightDurationMs = (nextSunrise - sunset) / 12;

  const hoursSchedule = [];

  for (let i = 0; i < 12; i++) {
    const start = new Date(sunrise.getTime() + i * dayDurationMs);
    const end = new Date(sunrise.getTime() + (i + 1) * dayDurationMs);
    const planetObj = CHALDEAN_ORDER_PLANETS[(startIndex + i) % 7];
    const isCurrent = (now >= start && now < end);

    hoursSchedule.push({
      index: i + 1,
      period: "diurna",
      planet: planetObj,
      start: start,
      end: end,
      isCurrent: isCurrent
    });
  }

  for (let i = 0; i < 12; i++) {
    const start = new Date(sunset.getTime() + i * nightDurationMs);
    const end = new Date(sunset.getTime() + (i + 1) * nightDurationMs);
    const planetObj = CHALDEAN_ORDER_PLANETS[(startIndex + 12 + i) % 7];
    const isCurrent = (now >= start && now < end);

    hoursSchedule.push({
      index: i + 1,
      period: "noturna",
      planet: planetObj,
      start: start,
      end: end,
      isCurrent: isCurrent
    });
  }

  const horaAtual = hoursSchedule.find(h => h.isCurrent);
  const localNome = (typeof currentGeo !== 'undefined' && currentGeo.city) ? currentGeo.city : "Local Atual";
  window.horasPlanetariasAtual = {
    dayRulerId: firstPlanetId,
    hourRulerId: horaAtual ? horaAtual.planet.id : null
  };

  let html = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: flex-end; padding: 12px 20px 0;">
        <button onclick="capturarTelaParaRelatorio('horas', 'horas-container', 'Horas Planetárias')" title="Adiciona esta tela, exatamente do jeito que está agora, como um bloco no Relatório" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif;">
          <i class="fa-solid fa-file-circle-plus"></i> Adicionar ao Relatório
        </button>
      </div>
    <div id="horas-container" style="width: 100%; flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif; text-align: center; box-sizing: border-box;">
    <style>
      #horas-container, #horas-container * { box-sizing: border-box; }
      #horas-container .horas-card {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        text-align: left;
        background: var(--bg-main);
        border-radius: 12px;
        padding: 16px;
      }
      #horas-container .horas-card-inner {
        background: var(--bg-card);
        border: 2px solid var(--gold-primary);
        border-radius: 10px;
        padding: 20px;
        font-family: 'Montserrat', sans-serif;
        color: var(--text-dark);
      }
      #horas-container .horas-info {
        font-size: 12px;
        opacity: 0.75;
        text-align: center;
        margin-bottom: 20px;
      }
      #horas-container .horas-atual-wrap {
        text-align: center;
        margin-bottom: 20px;
      }
      #horas-container .horas-atual-box {
        display: inline-flex;
        max-width: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-main);
        border: 2px solid var(--table-border);
        border-radius: 10px;
        padding: 20px;
      }
      #horas-container .horas-atual-linha {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: center;
        gap: 32px;
        margin: 0 0 6px 0;
      }
      #horas-container .horas-atual-periodo {
        font-size: 13px;
        opacity: 0.8;
        font-weight: 500;
      }
      #horas-container .horas-table-scroll {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: manipulation;
      }
      #horas-container table {
        border-collapse: collapse;
        font-size: 13px;
        width: 100%;
      }
      #horas-container table th,
      #horas-container table td {
        padding: 10px 8px;
      }
      #horas-container table td[data-col="regente"] {
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      @media (max-width: 480px) {
        #horas-container { padding: 10px; }
        #horas-container .horas-card { padding: 8px; }
        #horas-container .horas-card-inner { padding: 12px; }
        #horas-container .horas-atual-box { padding: 12px; }
        #horas-container .horas-atual-linha { gap: 16px; }
        #horas-container table { font-size: 11px; }
        #horas-container table th, #horas-container table td { padding: 7px 2px; }
        #horas-container table td[data-col="regente"] { font-size: 12px; gap: 4px; }
        #horas-container table svg { width: 22px !important; height: auto !important; }
      }
      @media (max-width: 360px) {
        #horas-container table { font-size: 10px; }
        #horas-container table th, #horas-container table td { padding: 6px 2px; }
        #horas-container table svg { width: 20px !important; }
      }
    </style>
    <!-- [REMOVIDO 28/09/2026] Bloco de <defs> globais (gradSun/gradMoon/...,
         glyphShadow/planetDropShadow, jupiterClip) que só existia pra
         alimentar o PLANET_3D_SVGS logo acima no arquivo - código morto,
         nunca referenciado por getPlanet3DSVG de verdade (ela usa IDs
         com sufixo único por chamada, não esses fixos). Removido junto
         com a limpeza do PLANET_3D_SVGS. -->

    <div class="horas-card">
  <div class="horas-card-inner">
      <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 700; color: var(--text-dark); margin-top: 0; margin-bottom: 8px; text-align: center;">Horas Planetárias</h3>
      <p class="horas-info">
        Localidade: <strong>${localNome}</strong><br>
        Nascer do Sol: <strong>${formatarHoraMinutoSegundo(sunrise)}</strong> • Pôr do Sol: <strong>${formatarHoraMinutoSegundo(sunset)}</strong>
      </p>
  `;

  if (horaAtual) {
    html += `
      <div class="horas-atual-wrap">
        <div class="horas-atual-box">
          <div class="horas-atual-linha">
            <div style="text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Dia</div>
              ${getPlanet3DSVG(firstPlanetId, 100)}
            </div>
            <div style="text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Hora</div>
              ${getPlanet3DSVG(horaAtual.planet.id, 48)}
            </div>
          </div>
          <div class="horas-atual-periodo">
            ${horaAtual.period === 'diurna' ? '☀️' : '🌙'} ${horaAtual.index}ª hora • ${formatarHoraMinutoSegundo(horaAtual.start)} às ${formatarHoraMinutoSegundo(horaAtual.end)}
          </div>
        </div>
      </div>
    `;
  }

  html += `
    <div class="horas-table-scroll">
    <table>
      <thead>
        <tr style="border-bottom: 2px solid var(--gold-primary); text-align: left; color: var(--text-dark);">
          <th></th>
          <th>Período</th>
          <th>Regente</th>
          <th>Início</th>
          <th>Término</th>
        </tr>
      </thead>
      <tbody>
  `;

  hoursSchedule.forEach(item => {
    const bgRow = item.isCurrent ? "background-color: var(--bg-main); font-weight: 700;" : "";
    html += `
      <tr style="border-bottom: 1px solid var(--primary-blue); ${bgRow}">
        <td>${item.index}ª</td>
        <td>${item.period === 'diurna' ? '☀️' : '🌙'}</td>
        <td data-col="regente">
          ${getPlanet3DSVG(item.planet.id)}
        </td>
        <td>${formatarHoraMinutoSegundo(item.start)}</td>
        <td>${formatarHoraMinutoSegundo(item.end)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    </div>
  </div>
  </div>
  </div>
  </div>
  `;

  container.innerHTML = html;
}
