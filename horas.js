/* ==========================================
   MÓDULO DE CÁLCULO DE HORAS PLANETÁRIAS
   ========================================== */

/**
 * Ordem Caldaica descendente das regências das horas
 */
const CHALDEAN_ORDER_PLANETS = [
  { id: "Saturn", name: "Saturno", symbol: "♄" },
  { id: "Jupiter", name: "Júpiter", symbol: "♃" },
  { id: "Mars", name: "Marte", symbol: "♂" },
  { id: "Sun", name: "Sol", symbol: "☉" },
  { id: "Venus", name: "Vênus", symbol: "♀" },
  { id: "Mercury", name: "Mercúrio", symbol: "☿" },
  { id: "Moon", name: "Lua", symbol: "☽" }
];

/**
 * Regente da 1ª hora diurna conforme o Dia da Semana (0 = Domingo)
 */
const DAY_RULERS_MAP = {
  0: "Sun",      // Domingo -> Sol
  1: "Moon",     // Segunda-feira -> Lua
  2: "Mars",     // Terça-feira -> Marte
  3: "Mercury",  // Quarta-feira -> Mercúrio
  4: "Jupiter",  // Quinta-feira -> Júpiter
  5: "Venus",    // Sexta-feira -> Vênus
  6: "Saturn"    // Sábado -> Saturno
};

/**
 * Algoritmo astronômico de precisão para calcular o Pôr e Nascer do Sol
 * com base na latitude, longitude, fuso e data fornecidos.
 */
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

    const zenith = 90.833; // Zenite padrão para nascer/pôr do Sol
    const sinDec = 0.39782 * Math.sin(L * Math.PI / 180);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(zenith * Math.PI / 180) - (sinDec * Math.sin(lat * Math.PI / 180))) / (cosDec * Math.cos(lat * Math.PI / 180));

    if (cosH > 1 || cosH < -1) return null; // Sol da meia-noite ou noite polar

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

/**
 * Função principal que gera as 24 Horas Planetárias a partir do estado atual da aplicação
 */
function calcularHorasPlanetariasDoMomento() {
  // Puxa os dados globais definidos no script principal
  const lat = (currentGeo && currentGeo.lat !== undefined) ? currentGeo.lat : -23.5505;
  const lon = (currentGeo && currentGeo.lon !== undefined) ? currentGeo.lon : -46.6333;
  const fuso = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(lon);
  const now = currentMoment ? new Date(currentMoment) : new Date();

  // 1. Calcula o Nascer e Pôr do Sol do Dia Atual
  const sunToday = calcularNascerPorDoSol(now, lat, lon, fuso);

  // 2. Determina se a data informada cai antes do nascer do Sol de hoje
  // (Caso positivo, astrologicamente ainda estamos no dia astrológico anterior)
  let astroDate = new Date(now);
  if (now < sunToday.sunrise) {
    astroDate.setDate(astroDate.getDate() - 1);
  }

  // 3. Obtém o Nascer/Pôr do Sol do Dia Astrológico Ativo e do Dia Seguinte
  const sunAstro = calcularNascerPorDoSol(astroDate, lat, lon, fuso);
  const nextDay = new Date(astroDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const sunNextAstro = calcularNascerPorDoSol(nextDay, lat, lon, fuso);

  const sunrise = sunAstro.sunrise;
  const sunset = sunAstro.sunset;
  const nextSunrise = sunNextAstro.sunrise;

  // 4. Identifica o Dia da Semana Astrológico (começa no Nascer do Sol)
  const dayOfWeek = astroDate.getDay();
  const firstPlanetId = DAY_RULERS_MAP[dayOfWeek];

  let startIndex = CHALDEAN_ORDER_PLANETS.findIndex(p => p.id === firstPlanetId);

  // 5. Calcula as durações exatas das horas diurnas e noturnas
  const dayDurationMs = (sunset - sunrise) / 12;
  const nightDurationMs = (nextSunrise - sunset) / 12;

  const hoursSchedule = [];

  // 12 Horas Diurnas
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

  // 12 Horas Noturnas
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

  return {
    location: currentGeo ? currentGeo.city : "Local Atual",
    sunrise: sunrise,
    sunset: sunset,
    nextSunrise: nextSunrise,
    schedule: hoursSchedule
  };
}

/**
 * Função Auxiliar para formatar horários no padrão HH:MM:SS
 */
function formatarHoraMinutoSegundo(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Renderiza o Painel de Horas Planetárias na interface HTML
 */
function renderizarPainelHorasPlanetarias(containerId = "painel-horas-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dados = calcularHorasPlanetariasDoMomento();
  const horaAtual = dados.schedule.find(h => h.isCurrent);

  let html = `
    <div style="background: #fffdf5; border: 1px solid #c59b27; border-radius: 10px; padding: 16px; font-family: 'Montserrat', sans-serif; color: #0f172a; max-width: 600px; margin: 10px auto;">
      <h3 style="font-family: 'Cinzel', serif; color: #103b70; margin-top: 0; margin-bottom: 8px; text-align: center;">Horas Planetárias</h3>
      <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 16px;">
        Localidade: <strong>${escapeHtml(dados.location)}</strong> • Nascer do Sol: <strong>${formatarHoraMinutoSegundo(dados.sunrise)}</strong> • Pôr do Sol: <strong>${formatarHoraMinutoSegundo(dados.sunset)}</strong>
      </p>
  `;

  if (horaAtual) {
    html += `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 16px;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #b45309; font-weight: 700;">Hora Planetária Ativa</span>
        <div style="font-size: 28px; font-weight: 800; color: #103b70; margin: 4px 0;">
          ${horaAtual.planet.symbol} ${horaAtual.planet.name}
        </div>
        <div style="font-size: 12px; color: #475569;">
          ${horaAtual.period === 'diurna' ? '☀️ Diurna' : '🌙 Noturna'} (${horaAtual.index}ª hora) • ${formatarHoraMinutoSegundo(horaAtual.start)} às ${formatarHoraMinutoSegundo(horaAtual.end)}
        </div>
      </div>
    `;
  }

  html += `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="border-bottom: 2px solid #c59b27; text-align: left; color: #103b70;">
          <th style="padding: 6px;">#</th>
          <th style="padding: 6px;">Período</th>
          <th style="padding: 6px;">Regente</th>
          <th style="padding: 6px;">Início</th>
          <th style="padding: 6px;">Término</th>
        </tr>
      </thead>
      <tbody>
  `;

  dados.schedule.forEach(item => {
    const bgRow = item.isCurrent ? "background-color: #fef9c3; font-weight: bold;" : "";
    html += `
      <tr style="border-bottom: 1px solid #e2e8f0; ${bgRow}">
        <td style="padding: 6px;">${item.index}</td>
        <td style="padding: 6px;">${item.period === 'diurna' ? '☀️ Dia' : '🌙 Noite'}</td>
        <td style="padding: 6px; font-size: 14px;"><strong>${item.planet.symbol}</strong> ${item.planet.name}</td>
        <td style="padding: 6px;">${formatarHoraMinutoSegundo(item.start)}</td>
        <td style="padding: 6px;">${formatarHoraMinutoSegundo(item.end)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </div>
  `;

  container.innerHTML = html;
}

