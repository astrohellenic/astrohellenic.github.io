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
    <textarea placeholder="Escreva a conclusão do relatório" oninput="rzConclusao = this.value; rzMudou()" style="margin:6px 0 12px;">${escapeHtml(rzConclusao)}</textarea>
    <div class="rotulo">Anexos</div>
    <div class="texto-apagado rz-fonte" style="margin:4px 0 6px;">Marque as telas de outras ferramentas que entram no relatório, depois da conclusão. Elas aparecem aqui quando você usa "Adicionar ao Relatório" na ferramenta, com o cliente aberto.</div>
    ${itens || '<div class="texto-apagado rz-fonte">Nenhuma tela foi adicionada ainda.</div>'}
    <div style="margin-top:14px;"><button type="button" class="botao-texto" id="rzBtnGerarRelatorio" onclick="rzGerarRelatorio()">Gerar relatório</button></div>`;
}
function rzAnexoMarcar(chave, marcado) { rzAnexos = rzAnexos.filter(c => c !== chave); if (marcado) rzAnexos.push(chave); rzMudou(); }
if (typeof window !== 'undefined') Object.assign(window, { rzAnexoMarcar });

/* ---------- Relatório: páginas ---------- */
const RZ_REL_CSS = `
  .rel-viewer.rz-rel { --terracota: #A03E25; --azul-egipcio-claro: #1F5FA3; --azul-egipcio-escuro: #1034A6; --preto-tinta: #1a1410; --ocre: #B5852F; --contorno-fino: 1px; }
  .rz-rel .com-nome { display: inline-flex; align-items: center; gap: 4px; vertical-align: middle; }
  .rz-rel .nome-glifo { font-size: 11px; }
  /* tabelas: o mesmo visual de .tabela-epoca do software (componentes.css) — só linhas horizontais, sem fundo, sem linhas verticais */
  .rz-rel table { width: 100%; border-collapse: collapse; border: 0; background: transparent; font-size: 11.5px; margin: 0 0 10px 0; color: #1a1410; }
  .rz-rel th { padding: 7px 10px; text-align: left; font-family: 'Cinzel', serif; font-weight: 800; font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: #1034A6; background: transparent; border: 0; border-bottom: 1px solid #1F5FA3; vertical-align: middle; }
  .rz-rel td { padding: 7px 10px; text-align: left; vertical-align: middle; color: #1a1410; background: transparent; border: 0; border-bottom: 1px solid #1F5FA3; }
  .rz-rel .centro { text-align: center; }
  .rz-rel .rz-sub { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 700; color: #A03E25; margin: 4px 0 6px; }
  .rz-rel .rz-sub-grande { font-size: 15px; margin: 14px 0 8px; }
  .rz-rel .rz-nota { font-size: 11px; line-height: 1.6; color: #1a1410; opacity: .75; margin-bottom: 10px; }
  .rz-rel .texto-apagado { color: #1a1410; opacity: .75; }
  .rz-rel .rz-escolhido { color: #A03E25; font-weight: 700; }
  .rz-rel .rz-num { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 4px; box-sizing: border-box; border: 2px solid #B5852F; color: #A03E25; border-radius: 10px; font-size: 11px; font-weight: 700; }
  .rz-rel .rz-fato-rel { padding: 8px 0; border-top: 1px solid #1F5FA3; break-inside: avoid; }
  .rz-rel .rz-linha-tecnica { font-size: 11.5px; line-height: 1.7; display: flex; flex-wrap: wrap; align-items: center; gap: 3px 8px; margin-top: 3px; }
  .rz-rel .rz-texto { font-size: 12.5px; line-height: 1.7; color: #1a1410; margin: 4px 0; white-space: pre-wrap; }
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

/* Circumambulação no relatório: subtítulo + a 1ª pauta num filho só; cada pauta seguinte é um filho próprio (pode ir pra outra folha) */
function rzRelPautasCirc(ctx, chave, fatos) {
  const svgs = (typeof rzPautasDosFatos === 'function') ? rzPautasDosFatos(ctx, chave, fatos) : [];
  if (!svgs.length) return rzRelTabelaDaTela(rzMontarTabelaCirc(ctx, chave, fatos));
  return rzRelJunto(`<div class="rz-sub">${rzIconeAfeta(chave, 16)} Circumambulação (${RZ_AFETA_NOME[chave]}): onde cada fato cai</div>`, svgs);
}

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
  secao('Dados de entrada', [
    `<p>Esta retificação parte do horário informado${nome ? ' por ' + escapeHtml(nome) : ''}.</p>`,
    `<table>${tr('Nome', escapeHtml(nome) || '—')}${tr('Data de nascimento', `${rzP2(e.dia)}/${rzP2(e.mes)}/${e.ano}`)}${tr('Cidade', escapeHtml(e.cidade || '—'))}${tr('Horário estimado', `${rzP2(e.hora)}:${rzP2(e.min)}`)}${tr('Origem do horário', escapeHtml(rzOrigemHorario) || '—')}</table>`
  ]);

  // 2. Sizígia
  secao('A sizígia pré-natal', [
    `<p>A sizígia é a última Lua Nova ou Lua Cheia antes do nascimento. É dela que a técnica parte para achar o grau do Ascendente.</p>`,
    `<table>${tr('Tipo', escapeHtml(s.tipo))}${tr('Data e hora', rzFmtHora(s.ms, fuso, true))}${tr('Ponto no zodíaco', rzPosHtml(s.lon, 18))}${tr('Luminar usado', s.luminar === 'Lua' ? 'Lua' : 'Sol')}</table>`,
    `<p>Na Lua Nova, o ponto é o grau da conjunção do Sol e da Lua. Na Lua Cheia, é o lugar da luz que está acima da Terra no instante da oposição.</p>`
  ]);

  // 3. O cálculo: votos e todos os candidatos (Ptolomeu e Hefestião, e Valens)
  const sim = (b) => b ? '✓' : '·';
  const votos = `<table class="tabela-epoca"><tr><th>Planeta</th><th>Posição</th><th>Triplicidade</th><th>Domicílio</th><th>Exaltação</th><th>Termo</th><th>Aspecto</th><th>Votos</th></tr>${r.contagem.linhas.map(l => `<tr class="${r.contagem.vencedores.includes(l.id) ? 'rz-escolhido' : ''}"><td>${rzPlanetaHtml(l.id, 18)}</td><td>${rzPosHtml(l.lon, 16)}</td><td>${sim(l.vias.triplicidade)}</td><td>${sim(l.vias.domicilio)}</td><td>${sim(l.vias.exaltacao)}</td><td>${sim(l.vias.termo)}</td><td>${rzAspectoHtml(l.vias.aspecto, l.lon, s.lon)}</td><td><strong>${l.vias.total}</strong></td></tr>`).join('')}</table>`;
  const candTab = `<table class="tabela-epoca"><tr><th>Método</th><th>Planeta</th><th>Votos</th><th>Grau</th><th>Ângulo</th><th>Horário</th></tr>${r.candidatos.map(c => `<tr class="${c === cand ? 'rz-escolhido' : ''}"><td>${nomeRegra[c.regra]}</td><td>${rzPlanetaHtml(c.id, 18)}</td><td>${c.regra === 'ptolomeu' ? r.contagem.max : '—'}</td><td>${rzPosHtml(c.lon, 16)}</td><td>${rzAnguloHtml(c.tipo, 20)}</td><td>${c.horario ? rzFmtHora(c.horario.ms, fuso).slice(0, 5) : '—'}</td></tr>`).join('')}</table>`;
  secao('O cálculo', [
    `<p>O planeta que mais domina o ponto da sizígia decide o grau do Ascendente. Quem reúne mais votos entre os modos de dominância vence. O grau e os minutos do planeta, lidos de 0 a 30, viram o grau e os minutos do Ascendente. Isso é o Animodar de Ptolomeu, descrito no Tetrabiblos III.2.</p>`,
    rzRelJunto(`<div class="rz-sub">Contagem de votos</div><div class="rz-nota">Ponto da sizígia em ${rzPosHtml(s.lon, 14)}. Um voto por dignidade que o planeta tem nesse ponto, mais um se aspecta o ponto.</div>`, rzRelFatiarTabela(votos, 12)),
    rzRelJunto(`<div class="rz-sub">Horários encontrados</div>`, rzRelFatiarTabela(candTab, 12))
  ]);

  // 4. Horário retificado
  const dif = Math.round((msFinal - (Date.UTC(e.ano, e.mes - 1, e.dia, e.hora, e.min, 0) - fuso * 3600000)) / 60000);
  secao('Horário retificado', [
    `<p>Com o grau do Ascendente fixado, o horário sai das ascensões do lugar, na base de cerca de 4 minutos por grau.</p>`,
    `<table>${tr('Horário retificado', `<strong class="rz-escolhido">${hFinal}</strong>`)}${tr('Diferença para o horário estimado', dif === 0 ? 'o mesmo horário' : `${dif > 0 ? 'mais' : 'menos'} ${Math.abs(dif)} minutos`)}${tr('Escolhido entre os candidatos', `${rzPlanetaHtml(cand.id, 18)} ${nomeRegra[cand.regra]}${rzFinalSel.ajusteMin ? ` <span class="texto-apagado">(ajuste fino de ${rzFinalSel.ajusteMin > 0 ? '+' : '−'}${Math.abs(rzFinalSel.ajusteMin)} min)</span>` : ''}`)}${tr('Ascendente', rzPosHtml(ctx.asc, 18))}${tr('Meio do Céu', rzPosHtml(rzAngulos(msFinal, e.lat, e.lon).mc, 18))}</table>`
  ]);

  // 5. Fatos da vida × técnicas
  const ordenados = rzFatos.slice().filter(f => f.data || f.texto).sort((a, b) => (a.data || '9999') < (b.data || '9999') ? -1 : (a.data || '9999') > (b.data || '9999') ? 1 : a.id - b.id);
  const numero = {}; ordenados.forEach((f, i) => { numero[f.id] = i + 1; });
  const rotConf = { sim: 'Sim', parte: 'Em parte', nao: 'Não' };
  const cartoes = ordenados.map(f => {
    const d = f.data ? rzDataDoFato(f) : null;
    const dFim = d ? rzDataFimDoFato(f) : null;
    const antes = d && d < ctx.nasc;
    const linhas = (!d || antes) ? '' : f.tecnicas.map(t => `<div class="rz-linha-tecnica">${rzLinhaTecnica(ctx, t, d, numero[f.id], true, dFim)}</div>`).join('');
    return `<div class="rz-fato-rel"><div><span class="rz-num">${numero[f.id]}</span> <strong>${d ? rzDataBR(d) + (dFim ? ' a ' + rzDataBR(dFim) : '') : 'sem data'}</strong>${d && !antes ? ` <span class="texto-apagado">${rqIdade(ctx.nasc, d)}${dFim ? ' a ' + rqIdade(ctx.nasc, dFim) : ''}</span>` : ''}</div>${f.texto ? `<div class="rz-texto">${escapeHtml(f.texto)}</div>` : ''}${antes ? '<div class="texto-apagado">Data anterior ao nascimento.</div>' : ''}${linhas}<div class="texto-apagado" style="font-size:11.5px; margin-top:3px;">Confirma: <strong>${f.conf ? rotConf[f.conf] : '—'}</strong></div></div>`;
  });
  const grupos = new Map();
  ordenados.forEach(f => { if (!f.data) return; f.tecnicas.forEach(t => { const k = t.tipo + '|' + t.chave; if (!grupos.has(k)) grupos.set(k, { t, fatos: [] }); const g = grupos.get(k); if (!g.fatos.some(x => x.n === numero[f.id])) g.fatos.push(rzMarcadorDoFato(f, numero[f.id])); }); });
  const tabelasTecnicas = Array.from(grupos.values()).sort((x, y) => (x.t.tipo === y.t.tipo ? 0 : x.t.tipo === 'circ' ? -1 : 1))
    .flatMap(g => g.t.tipo === 'circ' ? rzRelPautasCirc(ctx, g.t.chave, g.fatos) : rzRelTabelaDaTela(rzMontarTabelaZR(ctx, g.t.chave, g.fatos)));
  const nSim = ordenados.filter(f => f.conf === 'sim').length, nParte = ordenados.filter(f => f.conf === 'parte').length, nNao = ordenados.filter(f => f.conf === 'nao').length;
  const resumo = ordenados.some(f => f.conf)
    ? `<p>O horário ${hFinal} é confirmado por <strong>${nSim}</strong> de ${ordenados.length} ${ordenados.length === 1 ? 'fato' : 'fatos'}${nParte ? `, em parte por ${nParte}` : ''}${nNao ? ` e não é confirmado por ${nNao}` : ''}.</p>` : '';
  secao('Confirmação pelos fatos da vida', [
    `<p>O horário calculado foi comparado com os fatos datados da vida${nome ? ' de ' + escapeHtml(nome) : ''}, pelas técnicas indicadas em cada fato. Cada linha mostra o que a técnica indica para a data.</p>`,
    ...cartoes,
    resumo,
    ...(tabelasTecnicas.length ? [`<div class="rz-sub rz-sub-grande">Visão geral</div><div class="rz-nota">Todas as linhas da Circumambulação e da Liberação em que os fatos caem, cada uma com o número dos fatos.</div>`, ...tabelasTecnicas] : [])
  ]);
  paginas.unshift(rzRelSecao('Relatório de retificação', fluxo));

  // 6. Mapa final
  paginas.push(`<section class="rel-page rel-page-mapa" data-pg="rz-mapa"><div class="rel-h1">O mapa final</div>${rzMapaFinalSvg ? `<img class="rel-img-mandala" src="${rzMapaFinalSvg.url}" alt="Mapa com o horário retificado">` : ''}</section>`);

  // 7. Conclusão
  const paragrafos = rzConclusao.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`);
  if (paragrafos.length) paginas.push(rzRelSecao('Conclusão', paragrafos));

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

/* ---------- Capa: a do Relatório (relatorio.js), com o estilo do serviço escolhido em Configurações → Relatórios ---------- */
/* { estilo: bloco da capa (estilo do PDF/capa) | null, mandala: 'retificado' | 'estimado' | 'nenhuma' }. Qualquer falha = padrão (segue o tema, mandala retificada). */
async function rzRelConfig() {
  const padrao = { estilo: null, mandala: 'retificado', encerramento: '' };
  try {
    const db = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : null; if (!db) return padrao;
    const { data: { user } } = await db.auth.getUser(); if (!user) return padrao;
    const { data: c } = await db.from('configuracoes').select('retificacao_capa_bloco, retificacao_capa_mandala, retificacao_encerramento').eq('user_id', user.id).maybeSingle();
    if (!c) return padrao;
    const mandala = ['retificado', 'estimado', 'nenhuma'].includes(c.retificacao_capa_mandala) ? c.retificacao_capa_mandala : 'retificado';
    const estilo = (c.retificacao_capa_bloco && typeof c.retificacao_capa_bloco === 'object') ? c.retificacao_capa_bloco : null;
    return { estilo, mandala, encerramento: (c.retificacao_encerramento || '').trim() };
  } catch (e) { console.warn('Configuração do relatório de retificação:', e); return padrao; }
}

/* roda fn() com o céu e o mapa no horário retificado (o mapa aberto no menu não muda: tudo volta como estava) */
async function rzComMapaRetificado(fn) {
  const r = rzUltimo, e = r.entrada, d = new Date(rzMsFinal(r, rzFinalSel) + e.fuso * 3600000);
  const salvo = { dados: currentCalculatedData, momento: currentMoment, geo: currentGeo, lotes: window.currentLotes, capa: window.ceuFundoCapaUltimo, ret: window.currentMapRetificado };
  try {
    currentMoment = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
    currentGeo = Object.assign({}, currentGeo, { fuso: e.fuso });
    if (!(await executarCalculo({ soCalcular: true }))) throw new Error('o motor não respondeu');
    window.currentMapRetificado = true;   // o cabeçalho da mandala leva o rótulo "Retificado"
    return await fn();
  } finally {
    currentCalculatedData = salvo.dados; currentMoment = salvo.momento; currentGeo = salvo.geo; window.currentLotes = salvo.lotes; window.ceuFundoCapaUltimo = salvo.capa; window.currentMapRetificado = salvo.ret;
  }
}

/* A capa (a MESMA do Relatório: Céu, Papiro ou cores, com meandros, logo e rodapé) + a classe do estilo do PDF. Devolve { html, classe } ou null. */
async function rzRelCapa() {
  if (typeof renderizarMandalasDoPreset !== 'function' || typeof montarConteudoRelatorioHtml !== 'function' || typeof carregarPerfilRelatorio !== 'function') return null;
  try {
    const cfg = await rzRelConfig();
    const bc = Object.assign({ id: '__capa__', type: 'capa' }, cfg.estilo || {});
    const capaFonte = cfg.mandala === 'nenhuma' ? 'nenhuma' : 'mandala_natal';
    const blocoCapa = Object.assign({}, bc, { fonte: capaFonte });
    const blocos = [blocoCapa];
    // última página: o texto escrito em Configurações → Relatórios (parágrafos separados por linha em branco); sem texto, o do modelo ou o padrão do Relatório
    if (cfg.encerramento) blocos.push({ type: 'encerramento', corpo: cfg.encerramento.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('') });
    const desenhar = () => renderizarMandalasDoPreset(blocos, capaFonte);
    const imgs = capaFonte === 'nenhuma' ? { png1: null, png2: null, png1Capa: null, png2Capa: null }
      : (cfg.mandala === 'retificado' ? await rzComMapaRetificado(desenhar) : await desenhar());
    const perfil = await carregarPerfilRelatorio();
    const nome = 'Retificação do horário de nascimento';
    const html = montarConteudoRelatorioHtml({ nome, blocos }, perfil, imgs.png1, imgs.png2, null, null, capaFonte, imgs.png1Capa, imgs.png2Capa);
    const m = html.match(/<section class="rel-page rel-capa[\s\S]*?<\/section>/);
    if (!m) return null;
    const fim = html.match(/<section class="rel-page rel-page-encerramento"[\s\S]*?<\/section>/);
    window.relatorioPresetAtual = { nome };
    return { html: m[0], fim: fim ? fim[0] : '', classe: typeof classeTemaPapiroRelatorio === 'function' ? classeTemaPapiroRelatorio(blocos) : '' };
  } catch (err) { console.error('Capa do relatório de retificação:', err); return null; }
}

/* ---------- Relatório: abrir, voltar, baixar ---------- */
async function rzGerarRelatorio() {
  if (!rzUltimo || !rzFinalSel) { alert('Escolha o horário retificado primeiro.'); return; }
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
    const capa = await rzRelCapa();
    const container = document.getElementById('mandala-container');
    container.innerHTML = `
      <div class="rel-toolbar no-print" id="relToolbarFixa">
        <button type="button" class="botao-texto" onclick="rzVoltarDoRelatorio()">${menuIcone('voltar', 16)} Voltar</button>
        <button type="button" id="relBtnBaixarPdf" class="botao-texto" onclick="baixarRelatorioPDF()">${menuIcone('baixarArquivo', 16)} Baixar PDF</button>
      </div>
      <div id="relToolbarEspacador" class="no-print"></div>
      <div class="rel-viewer rz-rel${capa ? capa.classe : (typeof classeTemaPapiroRelatorio === 'function' ? classeTemaPapiroRelatorio([]) : '')}">${capa ? capa.html : ''}${rzRelMontarPaginas()}${capa ? capa.fim : ''}</div>`;
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
