/* ==========================================
   RETIFICAÇÃO — CONCLUSÃO, ANEXOS E O RELATÓRIO EM SI (páginas A4 + PDF)
   Depende de retificacao-sizigia.js (estado e telas "rz...") e de retificacao-calculos.js.
   O relatório sai pelo MESMO caminho do Relatório: folhas `.rel-page` dentro de `.rel-viewer`, divididas por
   dividirPaginasLongasEmFolhas e numeradas por numerarPaginasIndice (relatorio.js); o PDF é o do Chrome headless
   (baixarRelatorioPDF → api/gerar-pdf.js). Capa: a definir (ainda não existe).
   ========================================== */

/* ---------- Conclusão e anexos (tela da ferramenta, seção 7) ---------- */
/* Telas que o astrólogo trouxe de outras ferramentas com "Adicionar ao Relatório" (capturas do cliente em tela), para anexar ao relatório */
function rzCapturasDisponiveis() {
  if (typeof RELATORIO_FERRAMENTAS_DISPONIVEIS === 'undefined' || typeof capturasDaFerramenta !== 'function') return [];
  const lista = [];
  Object.keys(RELATORIO_FERRAMENTAS_DISPONIVEIS).forEach(id => {
    const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[id];
    if (!info || !info.capturada || id === 'retificacaoSizigia') return;
    (capturasDaFerramenta(id) || []).forEach((c, i) => { if (c && c.dataUrl) lista.push({ chave: id + '|' + i, id, indice: i, titulo: info.tituloIndice || info.label, dataUrl: c.dataUrl }); });
  });
  return lista;
}

function rzMontarConclusaoAnexos() {
  const caps = rzCapturasDisponiveis();
  const itens = caps.map(c => `
    <label style="display:flex; align-items:center; gap:10px; padding:6px 0; cursor:pointer; border-top: var(--contorno-fino) solid var(--azul-egipcio-claro);">
      <input type="checkbox" ${rzAnexos.includes(c.chave) ? 'checked' : ''} onchange="rzAnexoMarcar('${c.chave}', this.checked)">
      <img src="${c.dataUrl}" alt="" style="width:64px; height:64px; object-fit:contain; flex:none;">
      <span style="font-size:13px;">${escapeHtml(c.titulo)}${caps.filter(x => x.id === c.id).length > 1 ? ` <span class="texto-apagado">(${c.indice + 1}ª)</span>` : ''}</span>
    </label>`).join('');
  return `
    <div class="rotulo">Conclusão</div>
    <textarea placeholder="Escreva a conclusão do relatório" oninput="rzConclusao = this.value" style="margin:6px 0 12px;">${escapeHtml(rzConclusao)}</textarea>
    <div class="rotulo">Anexos</div>
    <div class="texto-apagado rz-fonte" style="margin:4px 0 6px;">Marque as telas de outras ferramentas que entram no relatório, depois da conclusão. Elas aparecem aqui quando você usa "Adicionar ao Relatório" na ferramenta, com o cliente aberto.</div>
    ${itens || '<div class="texto-apagado rz-fonte">Nenhuma tela foi adicionada ainda.</div>'}
    <div style="margin-top:14px;"><button type="button" class="btn-primary" id="rzBtnGerarRelatorio" onclick="rzGerarRelatorio()">Gerar relatório</button></div>`;
}
function rzAnexoMarcar(chave, marcado) { rzAnexos = rzAnexos.filter(c => c !== chave); if (marcado) rzAnexos.push(chave); }
if (typeof window !== 'undefined') Object.assign(window, { rzAnexoMarcar });

/* ---------- Relatório: páginas ---------- */
const RZ_REL_CSS = `
  .rel-viewer.rz-rel { --terracota: #A03E25; --azul-egipcio-claro: #1F5FA3; --azul-egipcio-escuro: #103b70; --contorno-fino: 1px; }
  .rz-rel .com-nome { display: inline-flex; align-items: center; gap: 4px; vertical-align: middle; }
  .rz-rel .nome-glifo { font-size: 11px; }
  .rz-rel .rz-tabela, .rz-rel table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin: 0 0 10px 0; color: #1e293b; }
  .rz-rel th, .rz-rel td { border: 1px solid #1F5FA3; padding: 4px 7px; text-align: left; vertical-align: middle; background: transparent; }
  .rz-rel th { color: #103b70; font-weight: 700; }
  .rz-rel .rz-sub { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 700; color: #A03E25; margin: 4px 0 6px; }
  .rz-rel .rz-sub-grande { font-size: 15px; margin: 14px 0 8px; }
  .rz-rel .rz-nota { font-size: 11px; line-height: 1.6; color: #64748b; margin-bottom: 10px; }
  .rz-rel .texto-apagado { color: #64748b; }
  .rz-rel .rz-escolhido { color: #A03E25; font-weight: 700; }
  .rz-rel .rz-num { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 4px; box-sizing: border-box; border: 2px solid #1F5FA3; border-radius: 10px; font-size: 11px; font-weight: 700; }
  .rz-rel .rz-fato-rel { padding: 8px 0; border-top: 1px solid #1F5FA3; break-inside: avoid; }
  .rz-rel .rz-linha-tecnica { font-size: 11.5px; line-height: 1.7; display: flex; flex-wrap: wrap; align-items: center; gap: 3px 8px; margin-top: 3px; }
  .rz-rel .rz-texto { font-size: 12.5px; line-height: 1.7; color: #1e293b; margin: 4px 0; white-space: pre-wrap; }
  .rz-rel .rz-cab-svg { margin-bottom: 14px; }
`;

/* Uma tabela longa em pedaços de no máximo `max` linhas (cada pedaço repete o cabeçalho), pra caber nas folhas. `html` = <table>...</table> com <tr> numa linha só. */
function rzRelFatiarTabela(html, max) {
  const linhas = html.match(/<tr[\s>][\s\S]*?<\/tr>/g);
  if (!linhas || linhas.length <= max + 1) return [html];
  const cab = linhas[0], corpo = linhas.slice(1), partes = [];
  for (let i = 0; i < corpo.length; i += max) partes.push(`<table class="tabela-epoca">${cab}${corpo.slice(i, i + max).join('')}</table>`);
  return partes;   // lista: cada pedaço é um filho próprio da página, então pode ir pra folhas diferentes
}
/* As tabelas da seção 5 vêm da tela (<details> com resumo): no relatório viram subtítulo + tabela */
function rzRelTabelaDaTela(htmlTela) {
  if (!htmlTela) return [];
  const m = htmlTela.match(/<summary>([\s\S]*?)<\/summary>/);
  const tab = (htmlTela.match(/<table[\s\S]*?<\/table>/) || [''])[0];
  return rzRelJunto(`<div class="rz-sub">${m ? m[1] : ''}</div>`, rzRelFatiarTabela(tab, 16));
}
/* subtítulo + primeiro pedaço da tabela num filho só (a quebra de folha nunca deixa o título sozinho); os outros pedaços seguem como filhos próprios. Devolve lista. */
function rzRelJunto(subHtml, pedacos) { return [`<div>${subHtml}${pedacos[0] || ''}</div>`].concat(pedacos.slice(1)); }

function rzRelSecao(titulo, filhos, classeExtra) {
  const itens = (Array.isArray(filhos) ? filhos : [filhos]).filter(Boolean);
  return `<section class="rel-page${classeExtra ? ' ' + classeExtra : ''}" data-pg="rz-${escapeHtml(titulo)}"><div class="rel-h1">${escapeHtml(titulo)}</div><div class="rel-corpo">${itens.map(h => /^\s*<(p|div|table)[\s>]/.test(h) ? h : `<div>${h}</div>`).join('')}</div></section>`;
}

function rzRelMontarPaginas() {
  const r = rzUltimo, e = r.entrada, fuso = e.fuso, sel = rzFinalSel;
  const ctx = rzContextoFatos(r);
  const cand = r.candidatos[sel.idx];
  const msFinal = rzMsFinal(r, sel);
  const hFinal = rzFmtHora(msFinal, fuso).slice(0, 5);
  const nome = (typeof currentSubjectName !== 'undefined' && currentSubjectName) ? currentSubjectName : '';
  const tr = (a, b) => `<tr><th style="width:38%;">${a}</th><td>${b}</td></tr>`;
  const nomeRegra = { ptolomeu: 'Ptolomeu e Hefestião', valens: 'Valens' };
  const s = r.sizigia;
  const paginas = [], fluxo = [];   // fluxo: seções 1 a 5 correm juntas (a divisão em folhas é automática); o resto tem página própria
  const secao = (titulo, filhos) => { fluxo.push(`<div class="rz-sub rz-sub-grande">${titulo}</div>`); filhos.forEach(f => Array.isArray(f) ? fluxo.push(...f) : fluxo.push(f)); };

  // 1. Dados de entrada (com o cabeçalho global, no horário retificado)
  const cab = rzMapaFinalSvg && rzMapaFinalSvg.cabecalho ? `<div class="rz-cab-svg">${rzMapaFinalSvg.cabecalho}</div>` : '';
  fluxo.push(cab);
  secao('1. Dados de entrada', [
    `<p>Esta retificação parte do horário informado${nome ? ' por ' + escapeHtml(nome) : ''}.</p>`,
    `<table>${tr('Nome', escapeHtml(nome) || '—')}${tr('Data de nascimento', `${rzP2(e.dia)}/${rzP2(e.mes)}/${e.ano}`)}${tr('Cidade', escapeHtml(e.cidade || '—'))}${tr('Horário original', `${rzP2(e.hora)}:${rzP2(e.min)}`)}${tr('Origem do horário', escapeHtml(rzOrigemHorario) || '—')}</table>`
  ]);

  // 2. Sizígia
  secao('2. A sizígia pré-natal', [
    `<p>A sizígia é a última Lua Nova ou Lua Cheia antes do nascimento. É dela que a técnica parte para achar o grau do Ascendente.</p>`,
    `<table>${tr('Tipo', escapeHtml(s.tipo))}${tr('Data e hora', rzFmtHora(s.ms, fuso, true))}${tr('Ponto no zodíaco', rzPosHtml(s.lon, 18))}${tr('Luminar usado', s.luminar === 'Lua' ? 'Lua' : 'Sol')}</table>`,
    `<p>Na Lua Nova, o ponto é o grau da conjunção do Sol e da Lua. Na Lua Cheia, é o lugar da luz que está acima da Terra no instante da oposição.</p>`
  ]);

  // 3. O cálculo: votos e todos os candidatos (Ptolomeu e Hefestião, e Valens)
  const sim = (b) => b ? '✓' : '·';
  const votos = `<table class="tabela-epoca"><tr><th>Planeta</th><th>Posição</th><th>Triplicidade</th><th>Domicílio</th><th>Exaltação</th><th>Termo</th><th>Aspecto</th><th>Votos</th></tr>${r.contagem.linhas.map(l => `<tr class="${r.contagem.vencedores.includes(l.id) ? 'rz-escolhido' : ''}"><td>${rzPlanetaHtml(l.id, 18)}</td><td>${rzPosHtml(l.lon, 16)}</td><td>${sim(l.vias.triplicidade)}</td><td>${sim(l.vias.domicilio)}</td><td>${sim(l.vias.exaltacao)}</td><td>${sim(l.vias.termo)}</td><td>${rzAspectoHtml(l.vias.aspecto, l.lon, s.lon)}</td><td><strong>${l.vias.total}</strong></td></tr>`).join('')}</table>`;
  const candTab = `<table class="tabela-epoca"><tr><th>Método</th><th>Planeta</th><th>Grau</th><th>Ângulo</th><th>Horário</th></tr>${r.candidatos.map(c => `<tr class="${c === cand ? 'rz-escolhido' : ''}"><td>${nomeRegra[c.regra]}</td><td>${rzPlanetaHtml(c.id, 18)}</td><td>${rzPosHtml(c.lon, 16)}</td><td>${rzAnguloHtml(c.tipo, 20)}</td><td>${c.horario ? rzFmtHora(c.horario.ms, fuso).slice(0, 5) : '—'}</td></tr>`).join('')}</table>`;
  secao('3. O cálculo', [
    `<p>O planeta que mais domina o ponto da sizígia decide o grau do Ascendente. Quem reúne mais votos entre os modos de dominância vence. O grau e os minutos do planeta, lidos de 0 a 30, viram o grau e os minutos do Ascendente. Isso é o Animodar de Ptolomeu, descrito no Tetrabiblos III.2.</p>`,
    rzRelJunto(`<div class="rz-sub">Contagem de votos</div><div class="rz-nota">Ponto da sizígia em ${rzPosHtml(s.lon, 14)}. Um voto por dignidade que o planeta tem nesse ponto, mais um se aspecta o ponto.</div>`, rzRelFatiarTabela(votos, 12)),
    rzRelJunto(`<div class="rz-sub">Horários encontrados</div>`, rzRelFatiarTabela(candTab, 12))
  ]);

  // 4. Horário retificado
  const dif = Math.round((msFinal - (Date.UTC(e.ano, e.mes - 1, e.dia, e.hora, e.min, 0) - fuso * 3600000)) / 60000);
  secao('4. Horário retificado', [
    `<p>Com o grau do Ascendente fixado, o horário sai das ascensões do lugar, na base de cerca de 4 minutos por grau.</p>`,
    `<table>${tr('Horário retificado', `<strong class="rz-escolhido">${hFinal}</strong>`)}${tr('Diferença para o horário original', dif === 0 ? 'o mesmo horário' : `${dif > 0 ? 'mais' : 'menos'} ${Math.abs(dif)} minutos`)}${tr('Escolhido entre os candidatos', `${rzPlanetaHtml(cand.id, 18)} ${nomeRegra[cand.regra]}${rzFinalSel.ajusteMin ? ` <span class="texto-apagado">(ajuste fino de ${rzFinalSel.ajusteMin > 0 ? '+' : '−'}${Math.abs(rzFinalSel.ajusteMin)} min)</span>` : ''}`)}${tr('Ascendente', rzPosHtml(ctx.asc, 18))}${tr('Meio do Céu', rzPosHtml(rzAngulos(msFinal, e.lat, e.lon).mc, 18))}</table>`
  ]);

  // 5. Fatos da vida × técnicas
  const ordenados = rzFatos.slice().filter(f => f.data || f.texto).sort((a, b) => (a.data || '9999') < (b.data || '9999') ? -1 : (a.data || '9999') > (b.data || '9999') ? 1 : a.id - b.id);
  const numero = {}; ordenados.forEach((f, i) => { numero[f.id] = i + 1; });
  const rotConf = { sim: 'Sim', parte: 'Em parte', nao: 'Não' };
  const cartoes = ordenados.map(f => {
    const d = f.data ? rzDataDoFato(f) : null;
    const antes = d && d < ctx.nasc;
    const linhas = (!d || antes) ? '' : f.tecnicas.map(t => `<div class="rz-linha-tecnica">${rzLinhaTecnica(ctx, t, d)}</div>`).join('');
    return `<div class="rz-fato-rel"><div><span class="rz-num">${numero[f.id]}</span> <strong>${d ? rzDataBR(d) : 'sem data'}</strong>${d && !antes ? ` <span class="texto-apagado">${rqIdade(ctx.nasc, d)}</span>` : ''}</div>${f.texto ? `<div class="rz-texto">${escapeHtml(f.texto)}</div>` : ''}${antes ? '<div class="texto-apagado">Data anterior ao nascimento.</div>' : ''}${linhas}<div class="texto-apagado" style="font-size:11.5px; margin-top:3px;">Confirma: <strong>${f.conf ? rotConf[f.conf] : '—'}</strong></div></div>`;
  });
  const grupos = new Map();
  ordenados.forEach(f => { if (!f.data) return; f.tecnicas.forEach(t => { const k = t.tipo + '|' + t.chave; if (!grupos.has(k)) grupos.set(k, { t, fatos: [] }); const g = grupos.get(k); if (!g.fatos.some(x => x.n === numero[f.id])) g.fatos.push({ n: numero[f.id], d: rzDataDoFato(f) }); }); });
  const tabelasTecnicas = Array.from(grupos.values()).sort((x, y) => (x.t.tipo === y.t.tipo ? 0 : x.t.tipo === 'circ' ? -1 : 1))
    .flatMap(g => rzRelTabelaDaTela(g.t.tipo === 'circ' ? rzMontarTabelaCirc(ctx, g.t.chave, g.fatos) : rzMontarTabelaZR(ctx, g.t.chave, g.fatos)));
  const nSim = ordenados.filter(f => f.conf === 'sim').length, nParte = ordenados.filter(f => f.conf === 'parte').length, nNao = ordenados.filter(f => f.conf === 'nao').length;
  const resumo = ordenados.some(f => f.conf)
    ? `<p>O horário ${hFinal} é confirmado por <strong>${nSim}</strong> de ${ordenados.length} ${ordenados.length === 1 ? 'fato' : 'fatos'}${nParte ? `, em parte por ${nParte}` : ''}${nNao ? ` e não é confirmado por ${nNao}` : ''}.</p>` : '';
  secao('5. Confirmação pelos fatos', [
    `<p>O horário calculado foi comparado com os fatos datados da vida${nome ? ' de ' + escapeHtml(nome) : ''}, pelas técnicas indicadas em cada fato. Cada linha mostra o que a técnica indica para a data.</p>`,
    ...cartoes,
    ...tabelasTecnicas,
    resumo
  ]);
  paginas.unshift(rzRelSecao('Relatório de retificação', fluxo));

  // 6. Mapa final
  paginas.push(`<section class="rel-page rel-page-mapa" data-pg="rz-mapa"><div class="rel-h1">6. O mapa final</div>${rzMapaFinalSvg ? `<img class="rel-img-mandala" src="${rzMapaFinalSvg.url}" alt="Mapa com o horário retificado">` : ''}</section>`);

  // 7. Conclusão
  const paragrafos = rzConclusao.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`);
  if (paragrafos.length) paginas.push(rzRelSecao('7. Conclusão', paragrafos));

  // 8. Anexos: telas trazidas de outras ferramentas
  const caps = rzCapturasDisponiveis().filter(c => rzAnexos.includes(c.chave));
  caps.forEach((c, i) => {
    paginas.push(`<section class="rel-page rel-page-captura" data-pg="rz-anexo-${i}"><div class="rel-titulo-captura">${escapeHtml(c.titulo)}</div><div class="rel-captura-corpo"><img class="rel-img-captura" src="${c.dataUrl}" alt="${escapeHtml(c.titulo)}"></div></section>`);
  });

  // O método em palavras simples
  paginas.push(rzRelSecao('O método em palavras simples', [
    `<p>O horário de nascimento nem sempre é exato, e um erro de poucos minutos já muda o grau do Ascendente. Esta retificação usa um método descrito por Ptolomeu no século II, no Tetrabiblos, e usado na prática por Hefestião de Tebas, que o achou satisfatório em quase todos os casos. O método parte da Lua Nova ou Lua Cheia anterior ao nascimento e, a partir dela, acha o grau do Ascendente. Depois, o horário calculado é conferido com os fatos datados da sua vida, e só fica o horário que eles confirmam.</p>`
  ]));
  return paginas.join('');
}

/* ---------- Relatório: abrir, voltar, baixar ---------- */
async function rzGerarRelatorio() {
  if (!rzUltimo || !rzFinalSel) { alert('Escolha o horário na seção 4 primeiro.'); return; }
  if (typeof injetarEstilosRelatorio !== 'function' || typeof dividirPaginasLongasEmFolhas !== 'function') { alert('O módulo de Relatório não está carregado.'); return; }
  const botao = document.getElementById('rzBtnGerarRelatorio');
  if (botao) { botao.disabled = true; botao.textContent = 'Montando...'; }
  try {
    // a mandala e o cabeçalho do horário retificado entram no relatório: se ainda não foram gerados (ou o horário mudou), gera agora
    if (!rzMapaFinalSvg || rzMapaFinalSvg.ms !== rzMsFinal(rzUltimo, rzFinalSel)) { rzMapaFinalSvg = null; await rzGerarMandalaFinal(); }
    if (!rzMapaFinalSvg) { alert('Não foi possível gerar a mandala no horário final.'); return; }
    injetarEstilosRelatorio();
    const estilos = document.getElementById('relatorio-estilos');
    if (estilos && !estilos.dataset.rzRel) { estilos.textContent += RZ_REL_CSS; estilos.dataset.rzRel = '1'; }   // o CSS do relatório de retificação viaja junto no PDF
    window.relatorioPresetAtual = { nome: 'Retificação pela sizígia' };
    const container = document.getElementById('mandala-container');
    container.innerHTML = `
      <div class="rel-toolbar no-print" id="relToolbarFixa">
        <button type="button" class="botao-texto" onclick="rzVoltarDoRelatorio()">${menuIcone('voltar', 16)} Voltar</button>
        <button type="button" id="relBtnBaixarPdf" class="botao-texto" onclick="baixarRelatorioPDF()">${menuIcone('baixarArquivo', 16)} Baixar PDF</button>
      </div>
      <div id="relToolbarEspacador" class="no-print"></div>
      <div class="rel-viewer rz-rel">${rzRelMontarPaginas()}</div>`;
    container.scrollTop = 0;
    window.scrollTo(0, 0);
    dividirPaginasLongasEmFolhas(container);
    numerarPaginasIndice(container);
    ajustarEspacadoresBarraFixaRelatorio();
  } catch (err) {
    console.error('Erro ao montar o relatório de retificação:', err);
    alert('Não foi possível montar o relatório: ' + (err.message || err));
    if (botao) { botao.disabled = false; botao.textContent = 'Gerar relatório'; }
  }
}
function rzVoltarDoRelatorio() { iniciarModuloRetificacaoSizigia(); }
if (typeof window !== 'undefined') Object.assign(window, { rzGerarRelatorio, rzVoltarDoRelatorio });
