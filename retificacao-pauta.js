/* ==========================================
   RETIFICAÇÃO — A "PAUTA" DE SIGNO DA CIRCUMAMBULAÇÃO (o desenho de direcoes.js, `gerarLinhaSigno`)
   CÓPIA do desenho, com a mesma moldura, régua de 30°, blocos dos termos, raios dos aspectos e marca do nascimento. A diferença: no lugar do
   cursor do "hoje", entra a marca de cada FATO (linha tracejada + número). Mexeu no desenho da pauta em direcoes.js? Atualize aqui também.
   Depende dos ajudantes de desenho de direcoes.js (getSignSVGDir, getIconeTermoSVG, getPlanet3DSVGDir, getItemSVGDir, getAspectSymbolSVGDir).
   ========================================== */

const RZ_PAUTA_BOX = 96, RZ_PAUTA_LINHA = 108, RZ_PAUTA_K = 96 / 110;

/* UMA pauta (um signo) dentro de um <svg> próprio.
   opc: { passagem, ehPrimeira, birthDate, natalDegInSign, raios (rqRaiosAspectos), marcadores: [{ n, d }], comTexto (idade e data junto à marca) } */
function rzPautaSvg(opc) {
  const { passagem, ehPrimeira, birthDate, natalDegInSign, raios } = opc;
  const marcadores = opc.marcadores || [];
  const boxHeight = RZ_PAUTA_BOX, k = RZ_PAUTA_K;
  const yOffset = 10;
  let rowHtml = '';

  // Moldura da Pauta: só uma linha fina em cima e outra embaixo, sem os lados, cantos retos.
  rowHtml += `<line x1="10" y1="${yOffset}" x2="910" y2="${yOffset}" stroke="var(--azul-egipcio-claro)" stroke-width="1"/><line x1="10" y1="${yOffset + boxHeight}" x2="910" y2="${yOffset + boxHeight}" stroke="var(--azul-egipcio-claro)" stroke-width="1"/>`;

  // Ícone Monoline do Signo
  rowHtml += `<g transform="translate(18, ${yOffset + Math.round(38 * k)})">${getSignSVGDir(passagem.signIdx, Math.round(34 * k))}</g>`;

  const x0 = 75, x1 = 880;
  const scale = (x1 - x0) / 30;
  const yAspectLine = yOffset + Math.round(32 * k);
  const yBaseline = yOffset + Math.round(55 * k);

  rowHtml += `<line x1="${x0}" y1="${yAspectLine}" x2="${x1}" y2="${yAspectLine}" stroke="var(--azul-egipcio-escuro)" stroke-width="1.0" stroke-dasharray="3,3" opacity="0.6"/>`;
  rowHtml += `<line x1="${x0}" y1="${yBaseline}" x2="${x1}" y2="${yBaseline}" stroke="var(--azul-egipcio-escuro)" stroke-width="1.8"/>`;

  // Dentinhos de todos os 30 graus
  const tickShort = Math.round(4 * k), tickMed = Math.round(6 * k), tickTall = Math.round(8 * k), tickLabelOffset = Math.round(12 * k);
  for (let d = 0; d <= 30; d++) {
    const xDeg = x0 + (d * scale);
    let tickY1 = yBaseline - tickShort, tickY2 = yBaseline + tickShort, strokeW = 1.0, opacity = 0.6;
    if (d % 10 === 0) {
      tickY1 = yBaseline - tickTall; tickY2 = yBaseline + tickTall; strokeW = 1.8; opacity = 1.0;
      rowHtml += `<text x="${xDeg}" y="${yBaseline - tickLabelOffset}" font-size="9" font-weight="700" fill="var(--preto-tinta)" fill-opacity=".75" text-anchor="middle">${d}°</text>`;
    } else if (d % 5 === 0) {
      tickY1 = yBaseline - tickMed; tickY2 = yBaseline + tickMed; strokeW = 1.4; opacity = 0.85;
    }
    rowHtml += `<line x1="${xDeg}" y1="${tickY1}" x2="${xDeg}" y2="${tickY2}" stroke="var(--azul-egipcio-escuro)" stroke-width="${strokeW}" opacity="${opacity}"/>`;
  }

  // Blocos dos 5 termos completos
  const termHeight = Math.round(26 * k), termLabel1Offset = Math.round(39 * k), termLabel2Offset = Math.round(49 * k);
  passagem.terms.forEach(term => {
    const xStart = x0 + (term.termStartDeg * scale), xEnd = x0 + (term.termEndDeg * scale), wTerm = xEnd - xStart;
    rowHtml += `<rect x="${xStart}" y="${yBaseline + 1}" width="${wTerm}" height="${termHeight}" fill="none" stroke="var(--azul-egipcio-escuro)" stroke-width="1"/>`;
    const xCenter = xStart + (wTerm / 2), termIconTamanhoDir = Math.max(10, termHeight - 6);
    if (typeof getIconeTermoSVG === 'function') {
      rowHtml += getIconeTermoSVG(term.termPlanetId, termIconTamanhoDir, 'var(--ocre)')
        .replace('<svg ', `<svg x="${xCenter - termIconTamanhoDir / 2}" y="${yBaseline + 1 + (termHeight - termIconTamanhoDir) / 2}" `);
    }
    if (term.startYearsOld !== null && term.startDate !== null) {
      rowHtml += `<text x="${xStart + 3}" y="${yBaseline + termLabel1Offset}" font-size="8.5" font-weight="800" fill="var(--azul-egipcio-escuro)" text-anchor="start">${rqIdade(birthDate, term.startDate)}</text>`;
      rowHtml += `<text x="${xStart + 3}" y="${yBaseline + termLabel2Offset}" font-size="7.5" font-weight="500" fill="var(--preto-tinta)" fill-opacity=".75" text-anchor="start">${rqDataBR(term.startDate)}</text>`;
    }
  });

  // Raios dos aspectos
  const raiosDoSigno = raios.filter(r => r.signIdx === passagem.signIdx && !(ehPrimeira && r.degInSign < natalDegInSign)).sort((a, b) => a.degInSign - b.degInSign);
  const LARG_ROTULO = 80, xMinRotulo = 56, xMaxRotulo = 888;
  const posRotulos = raiosDoSigno.map(r => ({ xRay: x0 + (r.degInSign * scale), cx: x0 + (r.degInSign * scale) }));
  posRotulos.forEach((p, i) => { p.cx = Math.max(p.cx, xMinRotulo); if (i > 0) p.cx = Math.max(p.cx, posRotulos[i - 1].cx + LARG_ROTULO); });
  for (let i = posRotulos.length - 1; i >= 0; i--) {
    const teto = (i === posRotulos.length - 1) ? xMaxRotulo : posRotulos[i + 1].cx - LARG_ROTULO;
    posRotulos[i].cx = Math.min(posRotulos[i].cx, teto);
  }
  raiosDoSigno.forEach((r, idxRaio) => {
    const { xRay, cx } = posRotulos[idxRaio];
    const yTop = yAspectLine;
    rowHtml += `<line x1="${xRay}" y1="${yTop - Math.round(10 * k)}" x2="${xRay}" y2="${yBaseline - Math.round(4 * k)}" stroke="var(--azul-egipcio-escuro)" stroke-width="0.8" opacity="0.7"/>`;
    if (Math.abs(cx - xRay) > 0.5) {
      const xFim = cx > xRay ? cx - 14 : cx + 19;
      rowHtml += `<line x1="${xRay}" y1="${yTop}" x2="${xFim}" y2="${yTop}" stroke="var(--azul-egipcio-escuro)" stroke-width="0.8" opacity="0.7"/>`;
    }
    rowHtml += `<text x="${cx}" y="${yTop - Math.round(21 * k)}" font-size="7.5" font-weight="800" fill="var(--azul-egipcio-escuro)" text-anchor="middle">${r.idadeTxt}</text>`;
    rowHtml += `<text x="${cx}" y="${yTop - Math.round(13 * k)}" font-size="7" font-weight="600" fill="var(--preto-tinta)" fill-opacity=".75" text-anchor="middle">${r.exactDate}</text>`;
    const aspectSVG = getAspectSymbolSVGDir(r.aspectType);
    const isPlanetaReal = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(r.planetId);
    const iconSVG = isPlanetaReal ? getPlanet3DSVGDir(r.planetId) : getItemSVGDir(r.planetId === 'Syz' ? 'Sizígia' : r.planetId);
    const escalaIcone = isPlanetaReal ? ((r.planetId === 'Saturn') ? 0.95 : 0.75) : 1;
    rowHtml += `<g transform="translate(${cx - 13}, ${yTop - 7})">${aspectSVG}</g>`;
    rowHtml += `<g transform="translate(${cx + 1}, ${yTop - 9}) scale(${escalaIcone})">${iconSVG}</g>`;
  });

  // Marca da posição natal inicial (só na primeira pauta)
  let ocupadoNatal = null;
  if (ehPrimeira) {
    const xNatal = x0 + (natalDegInSign * scale);
    const natalTop = yOffset + Math.round(10 * k), natalBottom = yOffset + boxHeight - Math.round(6 * k);
    rowHtml += `<line x1="${xNatal}" y1="${natalTop}" x2="${xNatal}" y2="${natalBottom}" stroke="var(--terracota)" stroke-width="2"/>`;
    const termoDaMarca = passagem.terms.find(t => natalDegInSign >= t.termStartDeg && natalDegInSign < t.termEndDeg);
    let ancoraNatal = 'start', xTextoNatal = xNatal + 3;
    if (termoDaMarca) {
      const xIcone = x0 + ((termoDaMarca.termStartDeg + termoDaMarca.termEndDeg) / 2) * scale;
      const meiaIcone = Math.max(10, termHeight - 6) / 2 + 2;
      if (xTextoNatal < xIcone + meiaIcone && xTextoNatal + 50 > xIcone - meiaIcone) { ancoraNatal = 'end'; xTextoNatal = xNatal - 3; }
    }
    ocupadoNatal = ancoraNatal === 'start' ? [xTextoNatal, xTextoNatal + 50] : [xTextoNatal - 50, xTextoNatal];
    rowHtml += `<text x="${xTextoNatal}" y="${yBaseline + Math.round(11 * k)}" font-size="8" font-weight="900" fill="var(--terracota)" text-anchor="${ancoraNatal}">0 anos</text>`;
    rowHtml += `<text x="${xTextoNatal}" y="${yBaseline + Math.round(21 * k)}" font-size="7" font-weight="700" fill="var(--terracota)" text-anchor="${ancoraNatal}">${rqDataBR(birthDate)}</text>`;
  }

  // Marca de cada FATO (no lugar do cursor do "hoje"): linha tracejada, número no meio da régua e, com `comTexto`, idade e data
  marcadores.forEach(m => {
    passagem.terms.forEach(term => {
      if (!(term.startDate && term.endDate && m.d >= term.startDate && m.d < term.endDate)) return;
      const frac = Math.max(0, Math.min(1, (m.d.getTime() - term.startDate.getTime()) / (term.endDate.getTime() - term.startDate.getTime())));
      const xM = x0 + ((term.termStartDeg + frac * (term.termEndDeg - term.termStartDeg)) * scale);
      const top = yOffset + Math.round(10 * k), bottom = yOffset + boxHeight - Math.round(6 * k);
      // o tracejado não passa por dentro do círculo (competiria com o número): fica só acima e abaixo dele
      const cyM = yBaseline - 6.5, rM = 10.5;
      rowHtml += `<line x1="${xM}" y1="${top}" x2="${xM}" y2="${cyM - rM}" stroke="var(--azul-egipcio-claro)" stroke-width="1.5" stroke-dasharray="3,3"/>`;
      rowHtml += `<line x1="${xM}" y1="${cyM + rM}" x2="${xM}" y2="${bottom}" stroke="var(--azul-egipcio-claro)" stroke-width="1.5" stroke-dasharray="3,3"/>`;
      rowHtml += `<circle cx="${xM}" cy="${yBaseline - 6.5}" r="10.5" fill="none" stroke="var(--ocre)" stroke-width="2"/>`;
      rowHtml += `<text x="${xM}" y="${yBaseline - 1.5}" font-size="14" font-weight="800" fill="var(--terracota)" text-anchor="middle">${m.n}</text>`;   // o número fica EM CIMA da régua (como escrito à mão); o círculo desce um pouco abaixo da linha
      if (opc.comTexto) {
        const LARG_TEXTO = 80, meiaIconeTermo = Math.max(10, termHeight - 6) / 2 + 2;
        const ocupados = passagem.terms.map(t => { const xc = x0 + ((t.termStartDeg + t.termEndDeg) / 2) * scale; return [xc - meiaIconeTermo, xc + meiaIconeTermo]; });
        if (ocupadoNatal) ocupados.push(ocupadoNatal);
        const bate = (ini, fim) => ocupados.some(([a, b]) => ini < b && fim > a);
        const iniDir = xM + 13, iniEsq = xM - 13 - LARG_TEXTO;
        const dirLivre = (iniDir + LARG_TEXTO <= 905) && !bate(iniDir, iniDir + LARG_TEXTO);
        const esqLivre = (iniEsq >= 14) && !bate(iniEsq, iniEsq + LARG_TEXTO);
        const ladoDir = dirLivre || !esqLivre;
        const xT = ladoDir ? iniDir : iniEsq + LARG_TEXTO, anc = ladoDir ? 'start' : 'end';
        rowHtml += `<text x="${xT}" y="${yBaseline + Math.round(11 * k)}" font-size="8" font-weight="900" fill="var(--azul-egipcio-escuro)" text-anchor="${anc}">${rqIdade(birthDate, m.d)}</text>`;
        rowHtml += `<text x="${xT}" y="${yBaseline + Math.round(21 * k)}" font-size="7" font-weight="700" fill="var(--azul-egipcio-escuro)" text-anchor="${anc}">${rqDataBR(m.d)}</text>`;
      }
    });
  });

  return `<svg viewBox="0 0 920 ${20 + RZ_PAUTA_LINHA}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block;">${rowHtml}</svg>`;
}

/* A pauta do signo em que cai UMA data (a "linha do signo" daquele fato), com a marca do fato. null se nenhuma passagem cobre a data. */
function rzPautaDoFato(ctx, chave, d, n) {
  if (typeof rzPautaSvg !== 'function' || typeof getSignSVGDir !== 'function') return null;
  const tabela = ctx.circ(chave), passagens = rqPassagens(tabela);
  const i = passagens.findIndex(p => p.terms.some(t => t.startDate && t.endDate && d >= t.startDate && d < t.endDate));
  if (i < 0) return null;
  return rzPautaSvg({ passagem: passagens[i], ehPrimeira: i === 0, birthDate: ctx.nasc, natalDegInSign: ctx.pontos[chave] !== undefined ? ctx.pontos[chave] % 30 : ctx.asc % 30, raios: ctx.raios(chave), marcadores: [{ n, d }], comTexto: true });
}

/* As pautas do primeiro ao último fato (uma lista de <svg>), cada uma com o número dos fatos que caem nela. fatos: [{ n, d }] */
function rzPautasDosFatos(ctx, chave, fatos) {
  if (typeof rzPautaSvg !== 'function' || typeof getSignSVGDir !== 'function') return [];
  const passagens = rqPassagens(ctx.circ(chave));
  const onde = fatos.map(f => ({ f, i: passagens.findIndex(p => p.terms.some(t => t.startDate && t.endDate && f.d >= t.startDate && f.d < t.endDate)) })).filter(x => x.i >= 0);
  if (!onde.length) return [];
  const de = Math.min.apply(null, onde.map(x => x.i)), ate = Math.max.apply(null, onde.map(x => x.i));
  const natal = ctx.pontos[chave] !== undefined ? ctx.pontos[chave] % 30 : ctx.asc % 30;
  const out = [];
  for (let i = de; i <= ate; i++) {
    out.push(rzPautaSvg({ passagem: passagens[i], ehPrimeira: i === 0, birthDate: ctx.nasc, natalDegInSign: natal, raios: ctx.raios(chave), marcadores: onde.filter(x => x.i === i).map(x => x.f), comTexto: false }));
  }
  return out;
}
