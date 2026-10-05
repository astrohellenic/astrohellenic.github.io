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
    container.innerHTML = `<p style="color: var(--terracota); text-align: center;">Erro ao calcular o horário solar.</p>`;
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
  window.horasPlanetariasAtual = {
    dayRulerId: firstPlanetId,
    hourRulerId: horaAtual ? horaAtual.planet.id : null
  };

  /* Chamada do mandala.js num container escondido: só precisava calcular
     window.horasPlanetariasAtual (acima). Não monta a tela — assim não existem
     dois #horas-container na página (o escondido e o de verdade). */
  if (containerIdAlvo) return;

  const cabecalhoHorasHTML = (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof montarCabecalhoMandalaImagemHTML === 'function')
    ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, 'horasCabecalho', { largura: 480, tintaSobreFolha: true }) : '';
  const svgGaleriaH = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  const svgRelatorioH = '<svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';

  let html = `
    <div style="width: 100%;">
    <div id="horas-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">

    <!-- Título e, na mesma linha, os botões: galeria e relatório -->
    <div class="cabeca-ferramenta">
      <h3 class="titulo-ferramenta">Horas Planetárias</h3>
      <div class="acoes-ferramenta">
        <button type="button" class="botao-icone" onclick="salvarHorasNaGaleria()" title="Salvar as Horas Planetárias como imagem na galeria (com título e cabeçalho)">${svgGaleriaH}</button>
        <button type="button" class="botao-icone" onclick="capturarHorasParaRelatorio()" title="Adicionar ao Relatório (sem cabeçalho)">${svgRelatorioH}</button>
      </div>
    </div>

    <!-- CABEÇALHO PADRÃO (função global, o mesmo de todas as ferramentas) -->
    <div style="max-width: 480px; margin: 0 auto;">${cabecalhoHorasHTML}</div>

    <div id="horasCardArea" style="max-width: 480px; margin: 0 auto;">
      <p class="horas-info">
        Nascer do Sol: <strong>${formatarHoraMinutoSegundo(sunrise)}</strong> • Pôr do Sol: <strong>${formatarHoraMinutoSegundo(sunset)}</strong>
      </p>
  `;

  if (horaAtual) {
    html += `
      <div class="horas-atual">
        <div class="horas-atual-linha">
          <div style="text-align: center;">
            <div class="rotulo" style="color: var(--preto-tinta); margin-bottom: 6px;">Dia</div>
            ${getPlanet3DSVG(firstPlanetId, 100)}
          </div>
          <div style="text-align: center;">
            <div class="rotulo" style="color: var(--preto-tinta); margin-bottom: 4px;">Hora</div>
            ${getPlanet3DSVG(horaAtual.planet.id, 48)}
          </div>
        </div>
        <div class="horas-atual-periodo">
          ${iconeSolLuaHoras(horaAtual.period, 14)} ${horaAtual.index}ª hora • ${formatarHoraMinutoSegundo(horaAtual.start)} às ${formatarHoraMinutoSegundo(horaAtual.end)}
        </div>
      </div>
      <hr class="divisa">
    `;
  }

  html += `
    <div class="horas-table-scroll">
    <table class="tabela-epoca">
      <thead>
        <tr>
          <th></th>
          <th class="centro">Período</th>
          <th class="horas-regente">Regente</th>
          <th>Início</th>
          <th>Término</th>
        </tr>
      </thead>
      <tbody>
  `;

  hoursSchedule.forEach(item => {
    html += `
      <tr${item.isCurrent ? ' class="ativa aberta"' : ''}>
        <td>${item.index}ª</td>
        <td class="centro">${iconeSolLuaHoras(item.period, 16)}</td>
        <td class="horas-regente">${planetaComNome(item.planet.id, 30)}</td>
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
    <hr class="divisa">
  </div>
  </div>
  `;

  container.innerHTML = html;
}


/* IMAGENS DAS HORAS PLANETÁRIAS. Galeria: título + cabeçalho padrão (no layout
   estreito, o mesmo que está na tela) + o cartão. Relatório: só o cartão.
   Só ao tocar nos botões. */
/* Sol/Lua do período (dia/noite). Fora do Tema Céu continuam os emojis de sempre; no papiro viram um desenho em tinta
   (sol em terracota, lua em azul-tinta) — emoji colorido não combina com nanquim. */
function iconeSolLuaHoras(periodo, tam) {
  if (window.temaMandala !== 'ceu') return periodo === 'diurna' ? '☀️' : '🌙';
  const t = tam || 16;
  const sol = `<svg width="${t}" height="${t}" viewBox="0 0 24 24" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="5" fill="none" stroke="#a03e25" stroke-width="2"/><g stroke="#a03e25" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1.5" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22.5" y2="12"/><line x1="4.6" y1="4.6" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.4" y2="4.6"/></g></svg>`;
  const lua = `<svg width="${t}" height="${t}" viewBox="0 0 24 24" style="vertical-align: middle; display: inline-block;"><path d="M16.5 3.2 A9 9 0 1 0 20.8 15.5 A7.2 7.2 0 0 1 16.5 3.2 Z" fill="none" stroke="#1d3a66" stroke-width="2" stroke-linejoin="round"/></svg>`;
  return periodo === 'diurna' ? sol : lua;
}

/* Tema Céu: as peças da imagem saem SEM fundo (transparentes): no relatório encaixam direto no papiro da folha; na
   galeria o papiro (degradê) é pintado por baixo no fim (ver montarImagemHoras). */
function fundoCapturaHoras() {
  if (window.temaMandala === 'ceu') return null;
  return document.documentElement.classList.contains('tema-escuro') ? '#1c1917' : '#fffdf5';
}

async function montarImagemHoras(comCabecalho) {
  const area = document.getElementById('horasCardArea');
  if (!area) return null;
  const fundo = fundoCapturaHoras();
  const corpo = await html2canvasRapido(area, fundo);
  if (!comCabecalho) return corpo;

  const papiro = window.temaMandala === 'ceu';
  const escuro = !papiro && document.documentElement.classList.contains('tema-escuro');
  const cores = papiro ? coresCabecalhoTinta() : coresCabecalhoMandala(escuro, null);
  const corTituloImg = papiro ? '#a03e25' : cores.titulo;
  const W = 480;
  const pecas = [];
  pecas.push(await rasterizarSvgParaCanvas(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="34" viewBox="0 0 ${W} 34"><text x="${W / 2}" y="26" text-anchor="middle" font-family="serif" font-size="20" font-weight="800" letter-spacing="1" fill="${corTituloImg}">HORAS PLANETÁRIAS</text></svg>`, W, 34, fundo, 2));
  const svgEl = document.querySelector('#horasCabecalho svg');
  if (svgEl) {
    const xml = new XMLSerializer().serializeToString(svgEl);
    const abertura = xml.match(/^<svg[^>]*>/)[0];
    const svgLimpo = abertura.replace(/ style="[^"]*"/, '') + xml.slice(abertura.length);
    const h = parseFloat(svgEl.getAttribute('height'));
    pecas.push(await rasterizarSvgParaCanvas(svgLimpo, W, h, fundo, 2));
  }
  pecas.push(corpo);
  const gap = 24;
  const saida = document.createElement('canvas');
  saida.width = Math.max(...pecas.map(c => c.width));
  saida.height = pecas.reduce((t, c) => t + c.height, 0) + gap * (pecas.length - 1);
  const ctx = saida.getContext('2d');
  if (papiro) {
    papiroTexturaCanvas(ctx, saida.width, saida.height, 2);
  } else if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, saida.width, saida.height); }
  let y = 0;
  pecas.forEach(c => { ctx.drawImage(c, Math.round((saida.width - c.width) / 2), y); y += c.height + gap; });
  return saida;
}

function salvarHorasNaGaleria() {
  capturarESalvarNaGaleria(
    () => montarImagemHoras(true),
    `Astro_Hellenic_Horas_${((typeof currentSubjectName !== 'undefined' && currentSubjectName) || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
window.salvarHorasNaGaleria = salvarHorasNaGaleria;

async function capturarHorasParaRelatorio() {
  window.__capturaSemFundo = true;
  try {
    const bruto = await montarImagemHoras(false);
    if (!bruto) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
    const canvas = recortarCanvasAoConteudo(bruto, fundoCapturaHoras());
    const total = adicionarCapturaRelatorio('horas', canvas.toDataURL('image/png'));
    alert(`"Horas Planetárias" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar as Horas Planetárias ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  } finally {
    window.__capturaSemFundo = false;
  }
}
window.capturarHorasParaRelatorio = capturarHorasParaRelatorio;
