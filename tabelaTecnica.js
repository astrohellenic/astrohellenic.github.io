/* ==========================================
   PAINEL TÉCNICO: POSIÇÕES E ASPECTOS (CORRIGIDO)
   ========================================== */

function renderPainelTecnico(dataCalculada, containerId = "painel-tecnico-container") {
  const container = document.getElementById(containerId);
  if (!container || !dataCalculada) return;

  // Lista local de signos para evitar dependência de constantes externas
  const NOMBRES_SIGNOS = [
    "Áries", "Touro", "Gêmeos", "Câncer",
    "Leão", "Virgem", "Libra", "Escorpião",
    "Sagitário", "Capricórnio", "Aquário", "Peixes"
  ];

  // Matriz local de Termos Egípcios
  const TERMOS_LOCAL = [
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
    [{ p: "♄", deg: 7 }, { p: "☿", deg: 13 }, { p: "♀", deg: 20 }, { p: "♃", deg: 25 }, { p: "♂", deg: 30 }],
    [{ p: "♀", deg: 12 }, { p: "♃", deg: 16 }, { p: "☿", deg: 19 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }]
  ];

  const ascAbs = dataCalculada.Ascendente ? dataCalculada.Ascendente.grau_absoluto : 0;
  const solAbs = dataCalculada.Sol ? dataCalculada.Sol.grau_absoluto : 0;
  const isDay = (((solAbs - ascAbs + 360) % 360) >= 180);

  const pObj = {
    Sun: { abs: solAbs },
    Moon: { abs: dataCalculada.Lua ? dataCalculada.Lua.grau_absoluto : 0 },
    Mercury: { abs: dataCalculada.Mercúrio ? dataCalculada.Mercúrio.grau_absoluto : 0 },
    Venus: { abs: dataCalculada.Vênus ? dataCalculada.Vênus.grau_absoluto : 0 },
    Mars: { abs: dataCalculada.Marte ? dataCalculada.Marte.grau_absoluto : 0 },
    Jupiter: { abs: dataCalculada.Júpiter ? dataCalculada.Júpiter.grau_absoluto : 0 },
    Saturn: { abs: dataCalculada.Saturno ? dataCalculada.Saturno.grau_absoluto : 0 }
  };

  let lotesCalculados = [];
  if (typeof calculateSevenLots === 'function') {
    lotesCalculados = calculateSevenLots(ascAbs, isDay, pObj);
  }

  const elementos = [
    { id: "Sun", nome: "Sol", tipo: "planet", sym: "☉", color: "#d97706", deg: pObj.Sun.abs, retro: false },
    { id: "Moon", nome: "Lua", tipo: "planet", sym: "☽", color: "#475569", deg: pObj.Moon.abs, retro: false },
    { id: "Mercury", nome: "Mercúrio", tipo: "planet", sym: "☿", color: "#92400e", deg: pObj.Mercury.abs, retro: Boolean(dataCalculada.Mercúrio?.retro) },
    { id: "Venus", nome: "Vênus", tipo: "planet", sym: "♀", color: "#b45309", deg: pObj.Venus.abs, retro: Boolean(dataCalculada.Vênus?.retro) },
    { id: "Mars", nome: "Marte", tipo: "planet", sym: "♂", color: "#b91c1c", deg: pObj.Mars.abs, retro: Boolean(dataCalculada.Marte?.retro) },
    { id: "Jupiter", nome: "Júpiter", tipo: "planet", sym: "♃", color: "#a97142", deg: pObj.Jupiter.abs, retro: Boolean(dataCalculada.Jupiter?.retro) },
    { id: "Saturn", nome: "Saturno", tipo: "planet", sym: "♄", color: "#422006", deg: pObj.Saturn.abs, retro: Boolean(dataCalculada.Saturno?.retro) },
    { id: "NodeN", nome: "Nodo Norte", tipo: "node", sym: "☊", color: "#000000", deg: dataCalculada.Nodo_Norte ? dataCalculada.Nodo_Norte.grau_absoluto : 0 },
    { id: "Syzygy", nome: "Sizígia", tipo: "syzygy", sym: "SIZ", color: "#000000", deg: dataCalculada.Sizigia ? dataCalculada.Sizigia.grau_absoluto : 0 }
  ];

  lotesCalculados.forEach(l => {
    elementos.push({ id: l.key, nome: l.label, tipo: "lot", lotType: l.type, sym: l.sym, color: "#c59b27", deg: l.deg });
  });

  let html = `
  <div style="max-width: 960px; margin: 40px auto; font-family: 'Montserrat', sans-serif; color: #0f172a; padding: 0 10px;">
    <h3 style="font-family: 'Cinzel', serif; color: #103b70; font-size: 18px; font-weight: 700; margin-bottom: 12px; border-bottom: 2px solid #c59b27; padding-bottom: 4px;">
      Posicionamentos e Micro-domínios
    </h3>
    <div style="overflow-x: auto; margin-bottom: 30px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; color: #475569; font-weight: 700;">
            <th style="padding: 10px;">Astro / Ponto</th>
            <th style="padding: 10px;">Signo e Grau</th>
            <th style="padding: 10px;">Termo Egípcio</th>
            <th style="padding: 10px;">Dodecatemória</th>
          </tr>
        </thead>
        <tbody>`;

  elementos.forEach(el => {
    const degVal = (isNaN(el.deg) || el.deg === undefined) ? 0 : el.deg;
    const signIdx = Math.floor(degVal / 30) % 12;
    const degInSign = degVal % 30;
    const signName = NOMBRES_SIGNOS[signIdx] || "Desconhecido";

    let termoRegente = "-";
    const termosDoSigno = TERMOS_LOCAL[signIdx] || [];
    for (let t of termosDoSigno) {
      if (degInSign < t.deg) {
        termoRegente = `Termo de ${t.p}`;
        break;
      }
    }

    const dodecAbs = (degVal * 12) % 360;
    const dodecSignIdx = Math.floor(dodecAbs / 30) % 12;
    const dodecSignName = NOMBRES_SIGNOS[dodecSignIdx] || "Desconhecido";

    const formatDeg = typeof formatDegMin === 'function' ? formatDegMin(degVal) : `${Math.floor(degInSign)}°`;
    const formatDodec = typeof formatDegMin === 'function' ? formatDegMin(dodecAbs) : `${Math.floor(dodecAbs % 30)}°`;
    const retroTag = el.retro ? `<span style="color: #dc2626; font-weight: 800; margin-left: 4px;">℞</span>` : "";

    html += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 700;">
          <span style="color: ${el.color}; font-size: 16px; margin-right: 6px;">${getSimboloExibicao(el)}</span>
          <span>${el.nome}</span>
        </td>
        <td style="padding: 10px;">${signName} ${formatDeg}${retroTag}</td>
        <td style="padding: 10px; font-weight: 600; color: #b45309;">${termoRegente}</td>
        <td style="padding: 10px;">${dodecSignName} ${formatDodec}</td>
      </tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>

    <h3 style="font-family: 'Cinzel', serif; color: #103b70; font-size: 18px; font-weight: 700; margin-bottom: 12px; border-bottom: 2px solid #c59b27; padding-bottom: 4px;">
      Matriz de Visibilidade (*Theoria*)
    </h3>
    <div style="overflow-x: auto;">
      <table style="border-collapse: collapse; text-align: center; font-size: 11px; margin: 0 auto;">
        <thead>
          <tr>
            <th style="padding: 6px; background: #f8fafc; border: 1px solid #cbd5e1;"></th>`;

  elementos.forEach(el => {
    html += `<th style="padding: 6px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 14px; color: ${el.color};" title="${el.nome}">${getSimboloExibicao(el)}</th>`;
  });

  html += `</tr>
        </thead>
        <tbody>`;

  elementos.forEach((elLinha, i) => {
    html += `<tr>
      <td style="padding: 6px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: 700; font-size: 14px; color: ${elLinha.color};" title="${elLinha.nome}">
        ${getSimboloExibicao(elLinha)}
      </td>`;

    elementos.forEach((elColuna, j) => {
      if (i === j) {
        html += `<td style="padding: 6px; background: #e2e8f0; border: 1px solid #cbd5e1;">-</td>`;
      } else {
        const degA = isNaN(elLinha.deg) ? 0 : elLinha.deg;
        const degB = isNaN(elColuna.deg) ? 0 : elColuna.deg;
        const signA = Math.floor(degA / 30) % 12;
        const signB = Math.floor(degB / 30) % 12;
        let dist = Math.abs(signA - signB);
        if (dist > 6) dist = 12 - dist;

        let aspectSymbol = "";
        let aspectColor = "";

        if (dist === 0) { aspectSymbol = "☌"; aspectColor = "#000000"; }
        else if (dist === 2) { aspectSymbol = "⚹"; aspectColor = "#2563eb"; }
        else if (dist === 3) { aspectSymbol = "□"; aspectColor = "#dc2626"; }
        else if (dist === 4) { aspectSymbol = "△"; aspectColor = "#0b2545"; }
        else if (dist === 6) { aspectSymbol = "☍"; aspectColor = "#8b0000"; }

        html += `<td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 14px; font-weight: bold; color: ${aspectColor};">
          ${aspectSymbol}
        </td>`;
      }
    });

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  </div>`;

  container.innerHTML = html;
}

function getSimboloExibicao(el) {
  if (el.tipo === "lot") {
    if (el.lotType === "fortune") return "⊗";
    if (el.lotType === "spirit") return "Φ";
    return el.sym || "⊗";
  }
  return el.sym || "•";
}
