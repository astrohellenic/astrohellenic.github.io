/* ==========================================
   PAINEL TÉCNICO: POSIÇÕES E ASPECTOS
   ========================================== */

function renderPainelTecnico(dataCalculada, containerId = "painel-tecnico-container") {
  const container = document.getElementById(containerId);
  if (!container || !dataCalculada) return;

  const ascAbs = dataCalculada.Ascendente.grau_absoluto;
  const isDay = (((dataCalculada.Sol ? dataCalculada.Sol.grau_absoluto : 0) - ascAbs + 360) % 360) >= 180;

  // Reconstrução rápida das posições para os Lotes
  const pObj = {
    Sun: { abs: dataCalculada.Sol ? dataCalculada.Sol.grau_absoluto : 0 },
    Moon: { abs: dataCalculada.Lua ? dataCalculada.Lua.grau_absoluto : 0 },
    Mercury: { abs: dataCalculada.Mercúrio ? dataCalculada.Mercúrio.grau_absoluto : 0 },
    Venus: { abs: dataCalculada.Vênus ? dataCalculada.Vênus.grau_absoluto : 0 },
    Mars: { abs: dataCalculada.Marte ? dataCalculada.Marte.grau_absoluto : 0 },
    Jupiter: { abs: dataCalculada.Júpiter ? dataCalculada.Júpiter.grau_absoluto : 0 },
    Saturn: { abs: dataCalculada.Saturno ? dataCalculada.Saturno.grau_absoluto : 0 }
  };

  const lotesCalculados = calculateSevenLots(ascAbs, isDay, pObj);

  // Lista consolidada de todos os elementos do Painel
  const elementos = [
    { id: "Sun", nome: "Sol", tipo: "planet", deg: pObj.Sun.abs, retro: false },
    { id: "Moon", nome: "Lua", tipo: "planet", deg: pObj.Moon.abs, retro: false },
    { id: "Mercury", nome: "Mercúrio", tipo: "planet", deg: pObj.Mercury.abs, retro: Boolean(dataCalculada.Mercúrio?.retro) },
    { id: "Venus", nome: "Vênus", tipo: "planet", deg: pObj.Venus.abs, retro: Boolean(dataCalculada.Vênus?.retro) },
    { id: "Mars", nome: "Marte", tipo: "planet", deg: pObj.Mars.abs, retro: Boolean(dataCalculada.Marte?.retro) },
    { id: "Jupiter", nome: "Júpiter", tipo: "planet", deg: pObj.Jupiter.abs, retro: Boolean(dataCalculada.Jupiter?.retro) },
    { id: "Saturn", nome: "Saturno", tipo: "planet", deg: pObj.Saturn.abs, retro: Boolean(dataCalculada.Saturno?.retro) },
    { id: "NodeN", nome: "Nodo Norte", tipo: "node", sym: "☊", deg: dataCalculada.Nodo_Norte ? dataCalculada.Nodo_Norte.grau_absoluto : 0 },
    { id: "Syzygy", nome: "Sizígia", tipo: "syzygy", sym: "SIZ", deg: dataCalculada.Sizigia ? dataCalculada.Sizigia.grau_absoluto : 0 }
  ];

  lotesCalculados.forEach(l => {
    elementos.push({ id: l.key, nome: l.label, tipo: "lot", lotType: l.type, sym: l.sym, deg: l.deg });
  });

  // 1. Tabela de Posições Detalhada
  let html = `
  <div style="max-width: 960px; margin: 0 auto; font-family: 'Montserrat', sans-serif; color: #0f172a;">
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
    const signIdx = Math.floor(el.deg / 30);
    const degInSign = el.deg % 30;
    const signName = SIGNS[signIdx].name;

    // Regente do Termo Egípcio
    let termoRegente = "-";
    const termosDoSigno = EGYPTIAN_TERMS[signIdx];
    for (let t of termosDoSigno) {
      if (degInSign < t.deg) {
        termoRegente = `Termo de ${t.p}`;
        break;
      }
    }

    // Cálculo exato da Dodecatemória
    const dodecAbs = (el.deg * 12) % 360;
    const dodecSignIdx = Math.floor(dodecAbs / 30);
    const dodecSignName = SIGNS[dodecSignIdx].name;

    const retroTag = el.retro ? `<span style="color: #dc2626; font-weight: 800; margin-left: 4px;">℞</span>` : "";

    html += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          ${renderIconePonto(el)}
          <span>${el.nome}</span>
        </td>
        <td style="padding: 10px;">${signName} ${formatDegMin(el.deg)}${retroTag}</td>
        <td style="padding: 10px; font-weight: 600; color: #b45309;">${termoRegente}</td>
        <td style="padding: 10px;">${dodecSignName} ${formatDegMin(dodecAbs)}</td>
      </tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>

    <!-- 2. Matriz de Aspectos / Visibilidade por Signo Inteiro -->
    <h3 style="font-family: 'Cinzel', serif; color: #103b70; font-size: 18px; font-weight: 700; margin-bottom: 12px; border-bottom: 2px solid #c59b27; padding-bottom: 4px;">
      Matriz de Visibilidade (*Theoria*)
    </h3>
    <div style="overflow-x: auto;">
      <table style="border-collapse: collapse; text-align: center; font-size: 11px; margin: 0 auto;">
        <thead>
          <tr>
            <th style="padding: 6px; background: #f8fafc; border: 1px solid #cbd5e1;"></th>`;

  elementos.forEach(el => {
    html += `<th style="padding: 6px; background: #f8fafc; border: 1px solid #cbd5e1;" title="${el.nome}">${renderIconePonto(el, 18)}</th>`;
  });

  html += `</tr>
        </thead>
        <tbody>`;

  elementos.forEach((elLinha, i) => {
    html += `<tr>
      <td style="padding: 6px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: 700;" title="${elLinha.nome}">
        ${renderIconePonto(elLinha, 18)}
      </td>`;

    elementos.forEach((elColuna, j) => {
      if (i === j) {
        html += `<td style="padding: 6px; background: #e2e8f0; border: 1px solid #cbd5e1;">-</td>`;
      } else {
        const signA = Math.floor(elLinha.deg / 30);
        const signB = Math.floor(elColuna.deg / 30);
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

// Auxiliar para desenhar os ícones da tabela com o mesmo SVG da mandala
function renderIconePonto(el, size = 22) {
  if (el.tipo === "planet") {
    const svgContent = PLANET_3D_SVGS[el.id] || "";
    return `<div style="width: ${size}px; height: ${size}px; display: inline-block;">
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">${svgContent}</svg>
    </div>`;
  } else if (el.tipo === "lot") {
    if (el.lotType === "fortune") {
      return `<svg width="${size}" height="${size}" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#000000" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#000000" stroke-width="1.5"/></svg>`;
    } else if (el.lotType === "spirit") {
      return `<span style="font-family: 'Montserrat', sans-serif; font-size: ${size - 2}px; font-weight: bold;">Φ</span>`;
    } else {
      return `<svg width="${size}" height="${size}" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">${el.sym}</text></svg>`;
    }
  } else {
    return `<span style="font-size: ${size - 4}px; font-weight: bold;">${el.sym || el.nome}</span>`;
  }
}
