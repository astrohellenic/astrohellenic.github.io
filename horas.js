/* ==========================================
   MÓDULO DE CÁLCULO E EXIBIÇÃO DAS HORAS
   ========================================== */

function iniciarModuloHoras() {
  const container = document.getElementById("mandala-container");
  if (!container) return;

  // Definições Vetoriais 3D dos 7 Planetas (Extraídos do mandala.js)
  const PLANET_3D_SVGS = {
    Sun: `
      <g>
        <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25" filter="blur(2px)"/>
        <circle cx="50" cy="50" r="42" fill="url(#gradSun)" filter="url(#planetDropShadow)"/>
        <ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/>
        <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">☉</text>
      </g>
    `,
    Moon: `
      <g>
        <circle cx="50" cy="50" r="42" fill="url(#gradMoon)" filter="url(#planetDropShadow)"/>
        <circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/>
        <circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/>
        <circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/>
        <circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/>
        <ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/>
        <path d="M 40,24 C 62,24 72,36 72,50 C 72,64 62,76 40,76 C 54,69 60,59 60,50 C 60,41 54,31 40,24 Z" 
              fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" filter="url(#glyphShadow)"/>
      </g>
    `,
    Mercury: `
      <g>
        <circle cx="50" cy="50" r="42" fill="url(#gradMercury)" filter="url(#planetDropShadow)"/>
        <ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/>
        <circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/>
        <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">☿</text>
      </g>
    `,
    Venus: `
      <g>
        <circle cx="50" cy="50" r="42" fill="url(#gradVenus)" filter="url(#planetDropShadow)"/>
        <ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/>
        <circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/>
        <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♀</text>
      </g>
    `,
    Mars: `
      <g>
        <circle cx="50" cy="50" r="42" fill="url(#gradMars)" filter="url(#planetDropShadow)"/>
        <ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/>
        <ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/>
        <circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/>
        <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♂</text>
      </g>
    `,
    Jupiter: `
      <g>
        <circle cx="50" cy="50" r="42" fill="url(#gradJupiter)" filter="url(#planetDropShadow)"/>
        <g clip-path="url(#jupiterClip)" opacity="0.45">
          <rect x="0" y="24" width="100" height="6" fill="#8c531b" />
          <rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" />
          <rect x="0" y="49" width="100" height="11" fill="#783d19" />
          <rect x="0" y="64" width="100" height="6" fill="#8c531b" />
          <rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" />
        </g>
        <ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/>
        <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♃</text>
      </g>
    `,
    Saturn: `
      <g>
        <g transform="rotate(-22 50 50)">
          <ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#gradRings)" stroke-width="5.5" opacity="0.95" />
          <ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/>
        </g>
        <circle cx="50" cy="50" r="36" fill="url(#gradSaturn)" filter="url(#planetDropShadow)"/>
        <g transform="rotate(-22 50 50)">
          <path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#gradRings)" stroke-width="5.5" />
          <path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/>
        </g>
        <ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/>
        <text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♄</text>
      </g>
    `
  };

  // Função auxiliar para gerar a tag SVG embutida
  function getPlanet3DSVG(planetId) {
  const planetSVGs = {
    Sun: `<svg width="34" height="34" viewBox="0 0 100 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineSun" cx="35%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="25%" stop-color="#fde047" />
          <stop offset="60%" stop-color="#f59e0b" />
          <stop offset="88%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#92400e" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25"/>
      <circle cx="50" cy="50" r="42" fill="url(#inlineSun)"/>
      <ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☉</text>
    </svg>`,

    Moon: `<svg width="34" height="34" viewBox="0 0 100 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineMoon" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#e2e8f0" />
          <stop offset="65%" stop-color="#94a3b8" />
          <stop offset="90%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1e293b" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineMoon)"/>
      <circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/>
      <circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/>
      <circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/>
      <circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/>
      <ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☽</text>
    </svg>`,

    Mercury: `<svg width="34" height="34" viewBox="0 0 100 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineMerc" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="28%" stop-color="#d97706" />
          <stop offset="65%" stop-color="#92400e" />
          <stop offset="92%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#270e02" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineMerc)"/>
      <ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/>
      <circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">☿</text>
    </svg>`,

    Venus: `<svg width="34" height="34" viewBox="0 0 100 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineVen" cx="34%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#fef3c7" />
          <stop offset="65%" stop-color="#f59e0b" />
          <stop offset="90%" stop-color="#b45309" />
          <stop offset="100%" stop-color="#78350f" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineVen)"/>
      <ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/>
      <circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♀</text>
    </svg>`,

    Mars: `<svg width="34" height="34" viewBox="0 0 100 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineMars" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fca5a5" />
          <stop offset="25%" stop-color="#ef4444" />
          <stop offset="60%" stop-color="#b91c1c" />
          <stop offset="88%" stop-color="#7f1d1d" />
          <stop offset="100%" stop-color="#450a0a" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineMars)"/>
      <ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/>
      <ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/>
      <circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♂</text>
    </svg>`,

    Jupiter: `<svg width="34" height="34" viewBox="0 0 100 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineJup" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="30%" stop-color="#fef3c7" />
          <stop offset="58%" stop-color="#d4a373" />
          <stop offset="82%" stop-color="#a97142" />
          <stop offset="100%" stop-color="#6f4518" />
        </radialGradient>
        <clipPath id="clipJup">
          <circle cx="50" cy="50" r="42" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#inlineJup)"/>
      <g clip-path="url(#clipJup)" opacity="0.45">
        <rect x="0" y="24" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" />
        <rect x="0" y="49" width="100" height="11" fill="#783d19" />
        <rect x="0" y="64" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" />
      </g>
      <ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♃</text>
    </svg>`,

    Saturn: `<svg width="38" height="34" viewBox="-15 0 130 100" style="vertical-align: middle; display: inline-block;">
      <defs>
        <radialGradient id="inlineSat" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="35%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#ca8a04" />
          <stop offset="92%" stop-color="#854d0e" />
          <stop offset="100%" stop-color="#422006" />
        </radialGradient>
        <linearGradient id="inlineRings" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" />
          <stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" />
          <stop offset="85%" stop-color="#64748b" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#334155" stop-opacity="0.95" />
        </linearGradient>
      </defs>
      <g transform="rotate(-22 50 50)">
        <ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#inlineRings)" stroke-width="5.5" opacity="0.95" />
        <ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/>
      </g>
      <circle cx="50" cy="50" r="36" fill="url(#inlineSat)"/>
      <g transform="rotate(-22 50 50)">
        <path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#inlineRings)" stroke-width="5.5" />
        <path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/>
      </g>
      <ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/>
      <text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle">♄</text>
    </svg>`
  };
  return planetSVGs[planetId] || '';
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
    container.innerHTML = `<p style="color: #dc2626; text-align: center;">Erro ao calcular o horário solar.</p>`;
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

  let html = `
    <!-- Definições Globais dos Gradientes e Filtros dos Planetas 3D -->
    <svg style="display: none; position: absolute; width: 0; height: 0;" aria-hidden="true">
      <defs>
        <filter id="glyphShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.85" />
        </filter>
        <filter id="planetDropShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.25" />
        </filter>
        <radialGradient id="gradSun" cx="35%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#fffbeb" /><stop offset="25%" stop-color="#fde047" /><stop offset="60%" stop-color="#f59e0b" /><stop offset="88%" stop-color="#d97706" /><stop offset="100%" stop-color="#92400e" />
        </radialGradient>
        <radialGradient id="gradMoon" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#e2e8f0" /><stop offset="65%" stop-color="#94a3b8" /><stop offset="90%" stop-color="#475569" /><stop offset="100%" stop-color="#1e293b" />
        </radialGradient>
        <radialGradient id="gradMercury" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef08a" /><stop offset="28%" stop-color="#d97706" /><stop offset="65%" stop-color="#92400e" /><stop offset="92%" stop-color="#451a03" /><stop offset="100%" stop-color="#270e02" />
        </radialGradient>
        <radialGradient id="gradVenus" cx="34%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#ffffff" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="65%" stop-color="#f59e0b" /><stop offset="90%" stop-color="#b45309" /><stop offset="100%" stop-color="#78350f" />
        </radialGradient>
        <radialGradient id="gradMars" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fca5a5" /><stop offset="25%" stop-color="#ef4444" /><stop offset="60%" stop-color="#b91c1c" /><stop offset="88%" stop-color="#7f1d1d" /><stop offset="100%" stop-color="#450a0a" />
        </radialGradient>
        <radialGradient id="gradJupiter" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fffbeb" /><stop offset="30%" stop-color="#fef3c7" /><stop offset="58%" stop-color="#d4a373" /><stop offset="82%" stop-color="#a97142" /><stop offset="100%" stop-color="#6f4518" />
        </radialGradient>
        <radialGradient id="gradSaturn" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#fef9c3" /><stop offset="35%" stop-color="#fde047" /><stop offset="70%" stop-color="#ca8a04" /><stop offset="92%" stop-color="#854d0e" /><stop offset="100%" stop-color="#422006" />
        </radialGradient>
        <linearGradient id="gradRings" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" /><stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" /><stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" /><stop offset="85%" stop-color="#64748b" stop-opacity="0.9" /><stop offset="100%" stop-color="#334155" stop-opacity="0.95" />
        </linearGradient>
        <clipPath id="jupiterClip">
          <circle cx="50" cy="50" r="42" />
        </clipPath>
      </defs>
    </svg>

    <div style="background: #fffdf5; border-radius: 12px; padding: 16px; max-width: 640px; margin: 20px auto;">
  <div style="background: #ffffff; border: 2px solid #c59b27; border-radius: 10px; padding: 20px; font-family: 'Montserrat', sans-serif; color: var(--text-dark);">
      <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 700; color: var(--text-dark); margin-top: 0; margin-bottom: 8px; text-align: center;">Horas Planetárias</h3>
      <p style="font-size: 12px; opacity: 0.75; text-align: center; margin-bottom: 20px;">
        Localidade: <strong>${localNome}</strong> • Nascer do Sol: <strong>${formatarHoraMinutoSegundo(sunrise)}</strong> • Pôr do Sol: <strong>${formatarHoraMinutoSegundo(sunset)}</strong>
      </p>
  `;

  if (horaAtual) {
    html += `
      <div style="background: var(--bg-main); border: 2px solid #103B70; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; font-weight: 700;">Hora Planetária Ativa</span>
        <div style="font-size: 30px; font-weight: 800; color: var(--text-dark); margin: 6px 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${getPlanet3DSVG(horaAtual.planet.id, 42)}
        </div>
        <div style="font-size: 13px; opacity: 0.8; font-weight: 500;">
          ${horaAtual.period === 'diurna' ? '☀️' : '🌙'} ${horaAtual.index}ª hora • ${formatarHoraMinutoSegundo(horaAtual.start)} às ${formatarHoraMinutoSegundo(horaAtual.end)}
        </div>
      </div>
    `;
  }

  html += `
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr style="border-bottom: 2px solid #c59b27; text-align: left; color: var(--text-dark);">
          <th style="padding: 10px 8px;"></th>
          <th style="padding: 10px 8px;">Período</th>
          <th style="padding: 10px 8px;">Regente</th>
          <th style="padding: 10px 8px;">Início</th>
          <th style="padding: 10px 8px;">Término</th>
        </tr>
      </thead>
      <tbody>
  `;

  hoursSchedule.forEach(item => {
    const bgRow = item.isCurrent ? "background-color: var(--bg-main); font-weight: 700;" : "";
    html += `
      <tr style="border-bottom: 1px solid #103B70; ${bgRow}">
        <td style="padding: 10px 8px;">${item.index}ª</td>
        <td style="padding: 10px 8px;">${item.period === 'diurna' ? '☀️' : '🌙'}</td>
        <td style="padding: 10px 8px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          ${getPlanet3DSVG(item.planet.id)}
        </td>
        <td style="padding: 10px 8px;">${formatarHoraMinutoSegundo(item.start)}</td>
        <td style="padding: 10px 8px;">${formatarHoraMinutoSegundo(item.end)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </div>
  </div>
  `;

  container.innerHTML = html;
}
