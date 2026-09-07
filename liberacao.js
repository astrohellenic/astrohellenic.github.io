/* ==========================================
   MÓDULO DE LIBERAÇÃO ZODIACAAL (APHESIS)
   ========================================== */

let selectedZRPhase = "spirit"; // Lote padrão inicial: Espírito

const ZR_SIGN_YEARS = [15, 8, 20, 25, 19, 20, 8, 15, 12, 30, 30, 12]; // Áries a Peixes

function iniciarModuloLiberacao() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  renderLiberacaoUI();
}

function alternarLoteLiberacao(lotKey) {
  selectedZRPhase = lotKey;
  renderLiberacaoUI();
}

function calcularDataFimZR(dataInicio, anos) {
  // Padrão helenístico de 360 dias por ano (12 meses de 30 dias)
  const totalDias = anos * 360;
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + totalDias);
  return dataFim;
}

function formatarDataBR(data) {
  if (!data) return "--/--/----";
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  return `${d}/${m}/${a}`;
}

function renderLiberacaoUI() {
  const container = document.getElementById("mandala-container");
  if (!container || !currentCalculatedData) return;

  const data = currentCalculatedData;
  const ascAbs = data.Ascendente.grau_absoluto;

  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0 };
  });

  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  const lotes = calculateSevenLots(ascAbs, isDay, pObj);

  // Lote da Fortuna para cálculo dos Picos (Kentra)
  const fortLot = lotes.find(l => l.key === "fortune");
  const fortSignIdx = Math.floor(fortLot.deg / 30);
  const angularSignsFromFort = [
    fortSignIdx,
    (fortSignIdx + 3) % 12,
    (fortSignIdx + 6) % 12,
    (fortSignIdx + 9) % 12
  ];

  // Identifica o lote selecionado
  const activeLotObj = lotes.find(l => l.key === selectedZRPhase) || lotes[1];
  const startSignIdx = Math.floor(activeLotObj.deg / 30);

  // Botoes dos 7 Lotes Herméticos
  const lotesInfo = [
    { key: "spirit", label: "ESP", sym: "Φ" },
    { key: "fortune", label: "FORT", sym: "⊕" },
    { key: "venus", label: "EROS", sym: "♀" },
    { key: "mercury", label: "NEC", sym: "☿" },
    { key: "mars", label: "AUD", sym: "♂" },
    { key: "jupiter", label: "VIT", sym: "♃" },
    { key: "saturn", label: "NÊM", sym: "♄" }
  ];

  let html = `
    <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; font-family: 'Montserrat', sans-serif; color: var(--text-dark); max-width: 900px; margin: 20px auto;">
      <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 700; color: var(--text-dark); margin-top: 0; margin-bottom: 12px; text-align: center;">Liberação Zodiacal</h3>
      
      <!-- Seletor dos 7 Lotes Herméticos -->
      <div style="display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 20px;">
  `;

  lotesInfo.forEach(l => {
    const isSel = l.key === selectedZRPhase;
    const bg = isSel ? "background: var(--text-dark); color: #ffffff;" : "background: var(--bg-main); color: var(--text-dark);";
    html += `
      <button onclick="alternarLoteLiberacao('${l.key}')" style="${bg} border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 12px; font-weight: 700; font-size: 11px; cursor: pointer;">
        ${l.sym} ${l.label}
      </button>
    `;
  });

  html += `
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-dark);">
            <th style="padding: 8px;">Signo</th>
            <th style="padding: 8px;">Duração</th>
            <th style="padding: 8px;">Início</th>
            <th style="padding: 8px;">Fim</th>
            <th style="padding: 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  let currentStart = new Date(currentMoment);
  let currSign = startSignIdx;
  const initialSignOfLevel = startSignIdx;

  for (let i = 0; i < 12; i++) {
    // Trata o Salto de Sinal (Loosing of the Bond) se atingir o signo oposto
    let isLoosingBond = false;
    if (i > 0 && currSign === (initialSignOfLevel + 6) % 12) {
      currSign = (currSign + 1) % 12;
      isLoosingBond = true;
    }

    const durationYears = ZR_SIGN_YEARS[currSign];
    const currentEnd = calcularDataFimZR(currentStart, durationYears);
    const isPeak = angularSignsFromFort.includes(currSign);

    let statusText = "";
    if (isPeak) statusText += `<span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">PICO</span> `;
    if (isLoosingBond) statusText += `<span style="background: #fecdd3; color: #9f1239; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">SALTO</span>`;

    html += `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 8px; font-weight: 700;">${SIGNS[currSign].name}</td>
        <td style="padding: 8px;">${durationYears}a</td>
        <td style="padding: 8px;">${formatarDataBR(currentStart)}</td>
        <td style="padding: 8px;">${formatarDataBR(currentEnd)}</td>
        <td style="padding: 8px;">${statusText}</td>
      </tr>
    `;

    currentStart = new Date(currentEnd);
    currSign = (currSign + 1) % 12;
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}
