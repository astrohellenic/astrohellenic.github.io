/* ==========================================
   FASES DA VIDA PELOS REGENTES DA TRIPLICIDADE (FERRAMENTA DE TESTE)
   Doroteu I.22 e I.10 (estrutura), Valens II.1 e VII.2 (instrumento de tempo).
   A regra exata de qual signo conta é hipótese em teste: por isso os três cálculos (A, B, C) ficam lado a lado.
   As funções de cálculo (topo do arquivo) não mexem na tela: dá pra testar em Node (ver module.exports no fim).
   ========================================== */

const FV_SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const FV_ELEMENTOS = ['fogo', 'terra', 'ar', 'água'];                       // elemento do signo i = FV_ELEMENTOS[i % 4]
const FV_ELEMENTO_ROTULO = { fogo: 'Fogo', terra: 'Terra', ar: 'Ar', 'água': 'Água' };
const FV_OBLIQUIDADE = 23.44;

const FV_PLANETAS = {
  Sun:     { nome: 'Sol',      chave: 'Sol',      anosMenores: 19 },
  Moon:    { nome: 'Lua',      chave: 'Lua',      anosMenores: 25 },
  Mercury: { nome: 'Mercúrio', chave: 'Mercúrio', anosMenores: 20 },
  Venus:   { nome: 'Vênus',    chave: 'Vênus',    anosMenores: 8 },
  Mars:    { nome: 'Marte',    chave: 'Marte',    anosMenores: 15 },
  Jupiter: { nome: 'Júpiter',  chave: 'Júpiter',  anosMenores: 12 },
  Saturn:  { nome: 'Saturno',  chave: 'Saturno',  anosMenores: 30 }
};

/* Regentes da triplicidade (Doroteu): [primeiro, segundo, participante] */
const FV_TRIPLICIDADE = {
  fogo:   { dia: ['Sun', 'Jupiter', 'Saturn'],  noite: ['Jupiter', 'Sun', 'Saturn'] },
  terra:  { dia: ['Venus', 'Moon', 'Mars'],     noite: ['Moon', 'Venus', 'Mars'] },
  ar:     { dia: ['Saturn', 'Mercury', 'Jupiter'], noite: ['Mercury', 'Saturn', 'Jupiter'] },
  'água': { dia: ['Venus', 'Mars', 'Moon'],     noite: ['Mars', 'Venus', 'Moon'] }
};

const FV_DOMICILIO = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const FV_EXALTACAO = { Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6 };   // signo de exaltação
const FV_SIMBOLO_ID = { '☉': 'Sun', '☽': 'Moon', '☿': 'Mercury', '♀': 'Venus', '♂': 'Mars', '♃': 'Jupiter', '♄': 'Saturn' };

/* Tempo de ascensão de cada signo (em anos = graus de ascensão) na latitude dada, por ascensão oblíqua:
   OA(λ) = RA(λ) − AD, AD = asin(tan δ · tan φ). Latitude com sinal (sul = negativa). Devolve { tempos[12], polar }. */
function fvTemposAscensao(latGraus) {
  const rad = Math.PI / 180;
  const eps = FV_OBLIQUIDADE * rad;
  const tanPhi = Math.tan(latGraus * rad);
  let polar = false;
  const oa = (lambdaGraus) => {
    const lam = lambdaGraus * rad;
    let ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    if (ra < 0) ra += 2 * Math.PI;
    if (lambdaGraus >= 360) ra = 2 * Math.PI;                       // 360° = volta completa (atan2 devolveria 0)
    const delta = Math.asin(Math.sin(eps) * Math.sin(lam));
    let x = Math.tan(delta) * tanPhi;
    if (x > 1) { x = 1; polar = true; } else if (x < -1) { x = -1; polar = true; }
    return (ra - Math.asin(x)) / rad;
  };
  const tempos = [];
  for (let i = 0; i < 12; i++) tempos.push(oa((i + 1) * 30) - oa(i * 30));
  return { tempos, polar };
}

/* Seita do planeta: Sol, Júpiter e Saturno são diurnos; Lua, Vênus e Marte, noturnos; Mercúrio é diurno quando oriental
   (nasce antes do Sol, ou seja, está antes dele no zodíaco) e noturno quando ocidental. */
function fvDoDia(idPlaneta, absGraus, sunAbs) {
  if (idPlaneta === 'Mercury') return ((sunAbs - absGraus + 360) % 360) < 180;
  return ['Sun', 'Jupiter', 'Saturn'].includes(idPlaneta);
}

/* Dignidades de um planeta numa posição absoluta (0–360). isDia: seita do mapa (pra triplicidade). */
function fvDignidades(idPlaneta, absGraus, isDia, sunAbs) {
  const s = Math.floor(absGraus / 30) % 12;
  const g = absGraus - s * 30;
  const lista = [];
  if (FV_DOMICILIO[s] === idPlaneta) lista.push('domicílio');
  if (FV_EXALTACAO[idPlaneta] === s) lista.push('exaltação');
  const trip = FV_TRIPLICIDADE[FV_ELEMENTOS[s % 4]][isDia ? 'dia' : 'noite'];
  const posTrip = trip.indexOf(idPlaneta);
  if (posTrip >= 0) lista.push('triplicidade');
  if (fvDoDia(idPlaneta, absGraus, sunAbs) === isDia) lista.push('seita');
  if (typeof EGYPTIAN_TERMS !== 'undefined' && EGYPTIAN_TERMS[s]) {
    const faixa = EGYPTIAN_TERMS[s].find(t => g < t.deg);
    if (faixa && FV_SIMBOLO_ID[faixa.p] === idPlaneta) lista.push('termo');
  }
  const opostoExaltacao = FV_EXALTACAO[idPlaneta] !== undefined && (FV_EXALTACAO[idPlaneta] + 6) % 12 === s;
  if (opostoExaltacao) lista.push('queda');
  return lista;
}

/* Situação da casa em signos inteiros: casas 1, 4, 7, 10 angulares; 2, 5, 8, 11 sucedentes; 3, 6, 9, 12 cadentes (precedem um ângulo). */
function fvCondicaoCasa(casa) { return ['angular', 'sucedente', 'cadente'][(casa - 1) % 3]; }

/* Cálculo completo. entrada: { dados (currentCalculatedData), lat, nascimento (Date), fonte: 'luminar' | 'sizigia', hoje (Date) }.
   Idade da troca: um cálculo só, Valens VII.2. Devolve null se faltar dado. */
function fvCalcularFases(entrada) {
  const d = entrada.dados;
  if (!d || !d.Ascendente || !d.Sol || !d.Lua) return null;
  const ascAbs = d.Ascendente.grau_absoluto;
  const sunAbs = d.Sol.grau_absoluto;
  const moonAbs = d.Lua.grau_absoluto;
  const isDia = ((sunAbs - ascAbs + 360) % 360) >= 180;               // Sol acima do horizonte (casas 7–12)
  const fonte = entrada.fonte === 'sizigia' && d.Sizigia ? 'sizigia' : 'luminar';
  const luminarId = isDia ? 'Sun' : 'Moon';
  const refAbs = fonte === 'sizigia' ? d.Sizigia.grau_absoluto : (isDia ? sunAbs : moonAbs);
  const signoRef = Math.floor(refAbs / 30) % 12;
  const elemento = FV_ELEMENTOS[signoRef % 4];
  const [id1, id2, idPart] = FV_TRIPLICIDADE[elemento][isDia ? 'dia' : 'noite'];
  const signoAsc = Math.floor(ascAbs / 30) % 12;
  const { tempos, polar } = fvTemposAscensao(entrada.lat);

  const descrever = (id) => {
    const abs = d[FV_PLANETAS[id].chave].grau_absoluto;
    const signo = Math.floor(abs / 30) % 12;
    const casa = ((signo - signoAsc + 12) % 12) + 1;
    return {
      id, nome: FV_PLANETAS[id].nome, abs, signo, signoNome: FV_SIGNOS[signo],
      grau: Math.floor(abs % 30), minuto: Math.floor(((abs % 30) % 1) * 60),
      casa, condicaoCasa: fvCondicaoCasa(casa),
      regidoPor: FV_PLANETAS[FV_DOMICILIO[signo]].nome,
      dignidades: fvDignidades(id, abs, isDia, sunAbs)
    };
  };
  const reg1 = descrever(id1), reg2 = descrever(id2), part = descrever(idPart);

  // Idade da troca (Valens VII.2): o maior entre o tempo de ascensão do signo do 1º regente e os anos menores do regente desse signo.
  // Exceção: 1º regente em signo apropriado (tem ali domicílio, exaltação ou triplicidade) vale só o tempo de ascensão.
  const ascensao = tempos[reg1.signo];
  const regenteDoSigno = FV_DOMICILIO[reg1.signo];
  const anosMenores = FV_PLANETAS[regenteDoSigno].anosMenores;
  const dignidadesNoSigno = reg1.dignidades.filter(x => x === 'domicílio' || x === 'exaltação' || x === 'triplicidade');
  const signoApropriado = dignidadesNoSigno.length > 0;
  const idadeTroca = signoApropriado ? ascensao : Math.max(ascensao, anosMenores);
  const maisDias = (anos) => new Date(entrada.nascimento.getTime() + anos * 365.25 * 86400000);
  const idadeHoje = (entrada.hoje.getTime() - entrada.nascimento.getTime()) / (365.25 * 86400000);
  const troca = {
    idade: idadeTroca, data: maisDias(idadeTroca), ascensao, anosMenores, regenteDoSigno, signoApropriado, dignidadesNoSigno,
    soTriplicidade: signoApropriado && dignidadesNoSigno.length === 1 && dignidadesNoSigno[0] === 'triplicidade',
    precedeAngulo: reg1.condicaoCasa === 'cadente'
  };

  // Qualidade das fases (Valens II.1): bem = angular ou sucedente; mal = cadente.
  const bem1 = reg1.condicaoCasa !== 'cadente', bem2 = reg2.condicaoCasa !== 'cadente';
  const qualidade = bem1 && bem2 ? 'bem_bem' : (bem1 ? 'bem_mal' : (bem2 ? 'mal_bem' : 'mal_mal'));
  // Fortuna (só usada quando os dois regentes estão mal): ASC + Lua − Sol de dia; ASC + Sol − Lua de noite.
  const fortunaAbs = (((isDia ? ascAbs + moonAbs - sunAbs : ascAbs + sunAbs - moonAbs) % 360) + 360) % 360;
  const fortunaSigno = Math.floor(fortunaAbs / 30) % 12;
  const fortunaRegente = descrever(FV_DOMICILIO[fortunaSigno]);
  const fortunaCasa = ((fortunaSigno - signoAsc + 12) % 12) + 1;
  const fortuna = { abs: fortunaAbs, signo: fortunaSigno, casa: fortunaCasa, condicaoCasa: fvCondicaoCasa(fortunaCasa), regente: fortunaRegente };

  return { isDia, fonte, luminarId, signoRef, elemento, reg1, reg2, part, tempos, polar, troca, qualidade, fortuna,
    fase: idadeHoje < idadeTroca ? 1 : 2, idadeHoje, hoje: entrada.hoje, nascimento: entrada.nascimento };
}

/* Eventos de vida: idade em anos de cada evento (a data, quando foi digitada, manda) e a fase em que cai. */
function fvIdadeDoEvento(ev, nascimento) {
  if (ev.data) {
    const [a, m, dia] = ev.data.split('-').map(Number);
    return (new Date(a, m - 1, dia).getTime() - nascimento.getTime()) / (365.25 * 86400000);
  }
  return Number(ev.idade) || 0;
}
function fvFaseDoEvento(idade, idadeTroca) { return idade < idadeTroca ? 1 : 2; }

/* Distância do evento até a data da troca, em meses (mês médio de 30,4375 dias): "X meses antes" / "X meses depois". */
function fvDistanciaTroca(dataEvento, dataTroca) {
  const dias = (dataEvento.getTime() - dataTroca.getTime()) / 86400000;
  const total = Math.round(Math.abs(dias) / 30.4375);
  const sentido = dias < 0 ? 'antes' : 'depois';
  if (total === 0) return `menos de 1 mês ${sentido} da troca`;
  const anos = Math.floor(total / 12), meses = total % 12;
  const partes = [];
  if (anos) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  return `${partes.join(' e ')} ${sentido} da troca`;
}
const FV_MARCACOES = { novo: 'começo de algo novo', fim: 'fim de algo antigo' };   // etiqueta do usuário: a ferramenta não interpreta

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fvTemposAscensao, fvDignidades, fvCalcularFases, fvIdadeDoEvento, fvFaseDoEvento, fvDistanciaTroca, fvAnosMesesDias, FV_SIGNOS };
}

/* ==========================================
   TELA
   ========================================== */
/* Eventos de vida do mapa em tela: guardados na coluna mapas.eventos_vida (jsonb) do Supabase, um registro por mapa. */
let fvEventos = [];
let fvEventosMapaId = null;     // mapa a que fvEventos pertence (null = nenhum mapa salvo em tela)
let fvEventosErro = '';

function iniciarModuloFasesVida() {
  const container = document.getElementById('mandala-container');
  if (!container) return;
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para ver as Fases da Vida.</div>`;
    return;
  }
  renderFasesVidaUI(container);
}

function fvReRenderizar() {
  const container = document.getElementById('mandala-container');
  if (container && window.moduloTecnicoAtivo === 'fasesVida') renderFasesVidaUI(container);
}

/* Busca os eventos do mapa em tela (uma vez por mapa) e redesenha quando chegam. */
async function fvCarregarEventos() {
  const mapaId = (typeof currentMapaId !== 'undefined') ? currentMapaId : null;
  if (fvEventosMapaId === mapaId) return;
  fvEventosMapaId = mapaId;
  fvEventos = [];
  fvEventosErro = '';
  if (!mapaId || typeof supabaseClient === 'undefined') return;
  try {
    const { data, error } = await supabaseClient.from('mapas').select('eventos_vida').eq('id', mapaId).maybeSingle();
    if (fvEventosMapaId !== mapaId) return;                         // trocou de mapa no meio
    if (error) { fvEventosErro = 'Não foi possível ler os eventos deste mapa.'; }
    else fvEventos = Array.isArray(data && data.eventos_vida) ? data.eventos_vida : [];
  } catch (e) { fvEventosErro = 'Não foi possível ler os eventos deste mapa.'; }
  fvReRenderizar();
}

async function fvSalvarEventos(novaLista) {
  if (!currentMapaId) { alert('Salve o mapa primeiro: os eventos ficam guardados no mapa do cliente.'); return false; }
  try {
    const { error } = await supabaseClient.from('mapas').update({ eventos_vida: novaLista }).eq('id', currentMapaId);
    if (error) { alert('Erro ao salvar o evento: ' + error.message); return false; }
  } catch (e) { alert('Erro de conexão ao salvar o evento.'); return false; }
  fvEventos = novaLista;
  fvEventosErro = '';
  return true;
}

function fvFmtData(d) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
/* Idade decimal (33,86) dita em anos e meses ("33 anos e 10 meses"): o que vem depois da vírgula é fração de ano, então vira meses. */
function fvFmtAnos(n) {
  let total = Math.round(n * 12);
  const anos = Math.floor(total / 12), meses = total % 12;
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}` + (meses ? ` e ${meses} ${meses === 1 ? 'mês' : 'meses'}` : '');
}
/* Idade entre o nascimento e uma data, em anos e meses de calendário. */
function fvAnosMeses(de, ate) {
  let anos = ate.getFullYear() - de.getFullYear();
  let meses = ate.getMonth() - de.getMonth();
  if (ate.getDate() < de.getDate()) meses -= 1;
  if (meses < 0) { anos -= 1; meses += 12; }
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}` + (meses ? ` e ${meses} ${meses === 1 ? 'mês' : 'meses'}` : '');
}
/* 33,86 anos NÃO é 33 anos e 86 meses: o que vem depois da vírgula é fração de ano (0,86 × 12 = 10,3 meses).
   Aqui a idade é dita em anos, meses e dias de calendário entre o nascimento e a data da troca ("33 anos, 10 meses e 12 dias"). */
function fvAnosMesesDias(de, ate) {
  let anos = ate.getFullYear() - de.getFullYear();
  let meses = ate.getMonth() - de.getMonth();
  let dias = ate.getDate() - de.getDate();
  if (dias < 0) { meses -= 1; dias += new Date(ate.getFullYear(), ate.getMonth(), 0).getDate(); }
  if (meses < 0) { anos -= 1; meses += 12; }
  const partes = [`${anos} ${anos === 1 ? 'ano' : 'anos'}`];
  if (meses) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  if (dias) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
  return partes.length === 1 ? partes[0] : partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1];
}
function fvNum(n, casas) { return n.toFixed(casas).replace('.', ','); }

/* Ícone do planeta / do signo no padrão do software: só o ícone; o nome ao lado só com os rótulos ligados (planetaComNome / signoComNome). */
function fvPlaneta(id, tam) {
  return (typeof planetaComNome === 'function') ? planetaComNome(id, tam || 24) : FV_PLANETAS[id].nome;
}
function fvSizigia(tam) {
  const icone = (typeof getIconeSVG === 'function') ? getIconeSVG('outro', 'sizigia', tam || 24) : '';
  if (!icone) return 'Sizígia';
  return (window.mostrarRotulosGlifos === false) ? icone : `<span class="com-nome">${icone}<span class="nome-glifo">Sizígia</span></span>`;
}
function fvSigno(idx, tam) {
  if (typeof signoComNome === 'function' && typeof getSignSvgHtmlDec === 'function') return signoComNome(getSignSvgHtmlDec(idx, tam || 20), idx);
  return FV_SIGNOS[idx];
}
const FV_LINHA = 'display:inline-flex; align-items:center; gap:6px; vertical-align:middle;';
const FV_PLANETAS_ID = {};
Object.keys(FV_PLANETAS).forEach(id => { FV_PLANETAS_ID[FV_PLANETAS[id].nome] = id; });

/* Situação do planeta: signo, casa, angular/sucedente/cadente e dignidades. */
function fvSituacao(p, tam) {
  const dignidades = p.dignidades.filter(d => d !== 'queda');
  const debilidades = p.dignidades.filter(d => d === 'queda');          // queda é debilidade, nunca dignidade
  const regidoPor = p.dignidades.includes('domicílio') ? '' : `regido por <span style="${FV_LINHA}">${fvPlaneta(FV_PLANETAS_ID[p.regidoPor], 20)}</span>`;
  const linhas = [];
  if (regidoPor) linhas.push(regidoPor);
  if (dignidades.length) linhas.push(`Dignidades: ${dignidades.join(' · ')}`);
  if (debilidades.length) linhas.push(`Debilidade: ${debilidades.join(' · ')}`);
  return `
    <div style="${FV_LINHA} font-size:13px; flex-wrap:wrap;">
      ${fvPlaneta(p.id, tam || 26)} <span>em</span> ${fvSigno(p.signo, 22)} <span>${p.grau}°${String(p.minuto).padStart(2, '0')}'</span>
      <span>· casa ${p.casa} · <strong>${p.condicaoCasa}</strong></span>
    </div>
    ${linhas.length ? `<div class="texto-apagado" style="font-size:11.5px; margin-top:3px; line-height:1.6;">${linhas.join('<br>')}</div>` : ''}`;
}

function fvLinhaPlaneta(papel, p) {
  return `<div style="padding:8px 0;"><span class="rotulo">${papel}</span><div style="margin-top:3px;">${fvSituacao(p)}</div></div>`;
}

/* Rótulo da troca: centrado na marca; se "hoje" está perto, vai pro lado oposto a ele pra a linha preta não passar por cima do texto. */
function fvAncoraRotulo(idadeTroca, hojeIdade) {
  if (Math.abs(idadeTroca - hojeIdade) >= 12) return '-50%';
  return idadeTroca >= hojeIdade ? '0' : '-100%';
}

/* BARRA DE PROGRESSO (uma por leitura): barra única do nascimento até a troca do senhor da triplicidade (enche e muda de cor, sem número)
   e, dali em diante, azul sem fim, avançando com os anos da vida. Escala de 0 a 90 anos, a mesma da barra de trocas. */
function fvBarrasProgresso(leituras) {
  const barras = leituras.map(l => {
    const nasc = l.r.nascimento;
    const fim90 = new Date(nasc.getTime() + 90 * 365.25 * 86400000);
    return `<div style="position:relative; margin:12px 6px 0 58px;">
      <span style="position:absolute; left:-52px; top:-6px; width:48px; display:flex; justify-content:flex-end; gap:2px;">${l.icones || ''}</span>
      ${barraTempoComTroca(nasc, l.r.troca.data, fim90, '', l.r.hoje)}
    </div>`;
  }).join('');
  return `<div id="fvBarrasProgresso">${barras}</div>`;
}

/* Barra de 0 a 90 anos: uma faixa por leitura (fase 1 | fase 2, dividida na troca dela, com legenda), "hoje" e os eventos (número do evento embaixo).
   leituras: [{ rotulo, r }]. Se as duas coincidem vem uma faixa só, com as duas legendas. */
function fvLinhaDoTempo(leituras, eventos, hojeIdade) {
  const MAX = 90;
  const pc = (anos) => Math.max(0, Math.min(100, (anos / MAX) * 100));
  const nFaixas = leituras.length;
  const topoFaixa = (i) => 14 + i * 34;
  const fimFaixas = topoFaixa(nFaixas - 1) + 14;
  const ticksTop = fimFaixas + 8;
  const faixas = leituras.map((l, i) => `
      <div style="position:absolute; left:0; width:${pc(l.r.troca.idade)}%; top:${topoFaixa(i)}px; height:14px; border:1px solid var(--azul-egipcio-claro); box-sizing:border-box;" title="Fase 1"></div>
      <div style="position:absolute; left:${pc(l.r.troca.idade)}%; right:0; top:${topoFaixa(i)}px; height:14px; border:1px solid var(--azul-egipcio-claro); border-left:3px solid var(--terracota); box-sizing:border-box;" title="Fase 2"></div>
      <span style="position:absolute; left:-52px; top:${topoFaixa(i) - 3}px; width:48px; display:flex; justify-content:flex-end; gap:2px;">${l.icones || ''}</span>
      <span style="position:absolute; left:${pc(l.r.troca.idade / 2)}%; top:${topoFaixa(i) - 13}px; transform:translateX(-50%); font-size:9.5px; font-weight:700;">fase 1</span>
      <span style="position:absolute; left:${pc((l.r.troca.idade + MAX) / 2)}%; top:${topoFaixa(i) - 13}px; transform:translateX(-50%); font-size:9.5px; font-weight:700;">fase 2</span>
      <span style="position:absolute; left:${pc(l.r.troca.idade)}%; top:${topoFaixa(i) + 15}px; transform:translateX(${fvAncoraRotulo(l.r.troca.idade, hojeIdade)}); font-size:9.5px; font-weight:700; color:var(--terracota); white-space:nowrap; padding:0 3px;" title="Troca, ${fvAnosMeses(l.r.nascimento, l.r.troca.data)}">troca ${l.rotulo}: ${fvAnosMeses(l.r.nascimento, l.r.troca.data)}</span>`).join('');
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(a =>
    `<span style="position:absolute; left:${pc(a)}%; transform:translateX(-50%); font-size:9.5px; top:${ticksTop + 14}px;">${a}</span>`).join('');
  const marcas = eventos.map((e, i) => `
      <div style="position:absolute; left:${pc(e.idade)}%; top:4px; height:${fimFaixas + 4}px; width:0; border-left:2px solid var(--terracota);" title="${escapeHtml(e.titulo)}, ${fvFmtAnos(e.idade)}"></div>
      <span style="position:absolute; left:${pc(e.idade)}%; top:${ticksTop + (i % 2 ? 44 : 30)}px; transform:translateX(-50%); font-size:10px; font-weight:700; color:var(--terracota); min-width:16px; text-align:center; border:1px solid var(--terracota); box-sizing:border-box; line-height:14px;">${i + 1}</span>`).join('');
  return `
    <div style="position:relative; height:${ticksTop + 66}px; margin:36px 6px 0 58px;">
      ${faixas}
      <div style="position:absolute; left:${pc(hojeIdade)}%; top:4px; height:${fimFaixas + 4}px; width:0; border-left:2px solid var(--preto-tinta);" title="Hoje"></div>
      <span style="position:absolute; left:${pc(hojeIdade)}%; top:-18px; transform:translateX(-50%); font-size:9.5px; font-weight:700;">hoje</span>
      ${marcas}
      ${ticks}
    </div>
    <div class="texto-apagado" style="font-size:11px; margin:2px 6px 0;">Linha preta: hoje. Linhas terracota numeradas: eventos.</div>`;
}

function fvCartaoTroca(r) {
  const t = r.troca;
  const ascensaoSigno = fvSigno(r.reg1.signo, 20);
  const regente = fvPlaneta(t.regenteDoSigno, 20);
  const comparacao = `
    <div style="font-size:13px; line-height:2;">
      <div>Tempo de ascensão de <span style="${FV_LINHA}">${ascensaoSigno}</span>: <strong>${fvFmtAnos(t.ascensao)}</strong></div>
      <div>Anos menores de <span style="${FV_LINHA}">${regente}</span>, regente de <span style="${FV_LINHA}">${ascensaoSigno}</span>: <strong>${t.anosMenores} anos</strong></div>
    </div>`;
  const regra = t.signoApropriado
    ? `<div style="font-size:12px; margin:6px 0;">O primeiro regente está em signo apropriado. Dignidades dele ali, cada uma separada: ${t.dignidadesNoSigno.map(d => `<strong>${d}</strong>`).join(' · ')}.<br>A troca ocorre só no tempo de ascensão do signo.</div>
       ${t.soTriplicidade ? '<div style="font-size:12px; margin:6px 0; color:var(--terracota); font-weight:700;">Só triplicidade: leitura de Schmidt, a confirmar.</div>' : ''}`
    : `<div class="texto-apagado" style="font-size:11.5px; margin:6px 0;">O primeiro regente não está em signo apropriado: a troca ocorre no maior dos dois valores, contado do nascimento.</div>`;
  const aviso = t.precedeAngulo
    ? `<div style="font-size:12px; margin:8px 0; color:var(--terracota); font-weight:700;">Aviso: o primeiro regente precede um ângulo (casa ${r.reg1.casa}, cadente). O texto dá só uma parte desse tempo.</div>` : '';
  return `
    <div class="cartao">
      <div class="cabeca-cartao">
        <span class="nome-nivel">Troca, Valens VII.2</span>
        <span class="selo">${fvAnosMeses(r.nascimento, t.data)}</span>
      </div>
      ${comparacao}
      ${regra}
      <div style="font-size:14px; margin-top:6px;"><strong>Troca em ${fvFmtData(t.data)}</strong>, aos ${fvAnosMesesDias(r.nascimento, t.data)}</div>
      <div class="texto-apagado" style="font-size:11px; margin-bottom:4px;">O segundo regente não entra no cálculo da data.</div>
      ${aviso}
    </div>`;
}

/* Fase 1 e fase 2 em duas linhas curtas (a situação de cada regente já está no cartão dos regentes). */
function fvLinhasFases(r) {
  const t = r.troca;
  const linha = (n, reg, periodo) => `
    <div style="padding:6px 0; border-top:var(--contorno-fino) solid var(--azul-egipcio-claro); font-size:13px; line-height:1.9;">
      <strong>Fase ${n}</strong>${r.fase === n ? ' <span class="selo">hoje</span>' : ''}
      <span style="${FV_LINHA} flex-wrap:wrap;">${fvPlaneta(reg.id, 22)} <span>com</span> ${fvPlaneta(r.part.id, 22)}</span>:
      ${periodo}
    </div>`;
  return `<div class="cartao">
    ${linha(1, r.reg1, `de ${fvFmtData(r.nascimento)} até ${fvFmtData(t.data)}`)}
    ${linha(2, r.reg2, `de ${fvFmtData(t.data)} até o fim da vida`)}
  </div>`;
}

const FV_TEXTOS_QUALIDADE = {
  bem_bem: 'Os dois regentes estão bem, em casa angular ou sucedente: boa fortuna duradoura.',
  bem_mal: 'O primeiro regente está bem e o segundo mal, em casa cadente: cumpre a promessa no começo e depois é rebaixado.',
  mal_bem: 'O primeiro regente está mal, em casa cadente, e o segundo bem: sobe e desce nos primeiros anos; depois é vigoroso, mas instável e ansioso.',
  mal_mal: 'Os dois regentes estão mal, em casa cadente. Olhe a Fortuna e o regente dela.'
};

function fvQualidade(r) {
  const f = r.fortuna;
  const fortunaHtml = r.qualidade === 'mal_mal' ? `
    <div style="margin-top:8px; font-size:13px; line-height:2;">
      <div>Fortuna: <span style="${FV_LINHA}">${fvSigno(f.signo, 22)}</span> · casa ${f.casa} · <strong>${f.condicaoCasa}</strong></div>
      <div>Regente da Fortuna: ${fvSituacao(f.regente)}</div>
    </div>` : '';
  return `
    <div class="cartao">
      <div class="cabeca-cartao"><span class="nome-nivel">Qualidade das fases, Valens II.1</span></div>
      <div style="font-size:13px; line-height:1.5;">${FV_TEXTOS_QUALIDADE[r.qualidade]}</div>
      ${fortunaHtml}
    </div>`;
}

/* ---------- eventos de vida ---------- */

/* leituras: [{ rotulo, r }] — uma por leitura distinta (se as duas coincidem vem só uma). */
function fvEventosOrdenados(nascimento) {
  return fvEventos
    .map(e => Object.assign({}, e, { idade: fvIdadeDoEvento(e, nascimento) }))
    .sort((a, b) => a.idade - b.idade);
}

function fvBlocoEventos(leituras, lista) {
  if (!currentMapaId) return `<div class="texto-apagado" style="font-size:12px;">Salve o mapa para registrar eventos: eles ficam guardados no mapa do cliente.</div>`;
  const nascimento = leituras[0].r.nascimento;
  const dataObj = (e) => new Date(nascimento.getTime() + e.idade * 365.25 * 86400000);
  const linhas = lista.map((e, i) => {
    const d = dataObj(e);
    const distancias = leituras.length === 1
      ? `<div class="janela-linha-det"><strong>fase ${fvFaseDoEvento(e.idade, leituras[0].r.troca.idade)}</strong> · ${fvDistanciaTroca(d, leituras[0].r.troca.data)}</div>`
      : leituras.map(l => `<div class="janela-linha-det">${l.rotulo}: <strong>fase ${fvFaseDoEvento(e.idade, l.r.troca.idade)}</strong> · ${fvDistanciaTroca(d, l.r.troca.data)}</div>`).join('');
    return `
    <div class="janela-linha" style="align-items:flex-start;">
      <div style="min-width:0;">
        <div class="janela-linha-nome"><span style="color:var(--terracota);">${i + 1}.</span> ${escapeHtml(e.titulo)}</div>
        <div class="janela-linha-det">${fvAnosMeses(nascimento, d)}, ${fvFmtData(d)}</div>
        ${distancias}
        ${FV_MARCACOES[e.marcacao] ? `<div class="janela-linha-det">Marcação: ${FV_MARCACOES[e.marcacao]}</div>` : ''}
        ${e.nota ? `<div class="janela-linha-det">${escapeHtml(e.nota)}</div>` : ''}
      </div>
      <span class="janela-linha-acoes fv-nao-captura">
        <button type="button" class="botao-icone" onclick="fvAbrirFormEvento('${e.id}')" title="Editar">${menuIcone('editar', 18)}</button>
        <button type="button" class="botao-icone botao-apagar" onclick="fvApagarEvento('${e.id}')" title="Apagar">${menuIcone('lixeira', 18)}</button>
      </span>
    </div>`;
  }).join('');
  return `
    ${fvEventosErro ? `<div style="font-size:12px; color:var(--terracota); font-weight:700; margin-bottom:6px;">${fvEventosErro}</div>` : ''}
    ${linhas || '<div class="texto-apagado" style="font-size:12px;">Nenhum evento registrado.</div>'}
    <div class="fv-nao-captura" style="margin-top:10px;"><button type="button" class="botao-texto" onclick="fvAbrirFormEvento()">+ Evento</button></div>`;
}

function fvFecharJanelaEvento() {
  const o = document.getElementById('fvEventoOverlay');
  if (o) o.remove();
}

function fvAbrirFormEvento(id) {
  const e = id ? fvEventos.find(x => x.id === id) : null;
  if (id && !e) return;
  let anosInicial = '', mesesInicial = '', dataInicial = '';
  if (e) {
    if (e.data) dataInicial = e.data;
    else { const total = Math.round(e.idade * 12); anosInicial = String(Math.floor(total / 12)); mesesInicial = String(total % 12); }
  }
  fvFecharJanelaEvento();
  const overlay = document.createElement('div');
  overlay.id = 'fvEventoOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="janela" style="width: 400px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="titulo-secao">${e ? 'Editar evento' : 'Novo evento'}</div>
      <label>Idade: anos</label>
      <input type="text" id="fvEvAnos" class="modal-input" inputmode="numeric" placeholder="Ex.: 33" value="${anosInicial}" autocomplete="off">
      <label>Idade: meses</label>
      <input type="text" id="fvEvMeses" class="modal-input" inputmode="numeric" placeholder="Ex.: 10" value="${mesesInicial}" autocomplete="off">
      <label>Ou a data</label>
      <input type="date" id="fvEvData" class="modal-input" value="${dataInicial}" style="width: 100%; box-sizing: border-box; -webkit-appearance: none; appearance: none; min-height: 36px;">
      <label>Título</label>
      <input type="text" id="fvEvTitulo" class="modal-input" maxlength="80" value="${e ? escapeHtml(e.titulo) : ''}" autocomplete="off">
      <label>Marcação (opcional)</label>
      <select id="fvEvMarcacao" class="modal-select">
        <option value="">sem marcação</option>
        <option value="novo" ${e && e.marcacao === 'novo' ? 'selected' : ''}>começo de algo novo</option>
        <option value="fim" ${e && e.marcacao === 'fim' ? 'selected' : ''}>fim de algo antigo</option>
      </select>
      <label>Nota curta</label>
      <input type="text" id="fvEvNota" class="modal-input" maxlength="200" value="${e ? escapeHtml(e.nota || '') : ''}" autocomplete="off">
      <div class="janela-acoes">
        <button type="button" class="botao-texto janela-sec" id="fvEvCancelar">Cancelar</button>
        <button type="button" class="botao-texto" id="fvEvSalvar">Salvar</button>
      </div>
    </div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#fvEvCancelar').onclick = fvFecharJanelaEvento;
  overlay.querySelector('#fvEvSalvar').onclick = () => fvSalvarFormEvento(id || null);
  setTimeout(() => { try { overlay.querySelector(e ? '#fvEvTitulo' : '#fvEvAnos').focus(); } catch (x) {} }, 30);
}
if (typeof window !== "undefined") window.fvAbrirFormEvento = fvAbrirFormEvento;

async function fvSalvarFormEvento(id) {
  const txtAnos = document.getElementById('fvEvAnos').value.trim();
  const txtMeses = document.getElementById('fvEvMeses').value.trim();
  const data = document.getElementById('fvEvData').value;
  const titulo = document.getElementById('fvEvTitulo').value.trim();
  const nota = document.getElementById('fvEvNota').value.trim();
  const marcacao = document.getElementById('fvEvMarcacao').value;
  if (!titulo) { alert('Dê um título ao evento.'); return; }
  const anos = parseInt(txtAnos || '0', 10), meses = parseInt(txtMeses || '0', 10);
  let idade = anos + meses / 12;
  if (!data && (!(txtAnos || txtMeses) || !(anos >= 0) || !(meses >= 0 && meses <= 11))) { alert('Informe a idade em anos e meses (meses de 0 a 11) ou a data do evento.'); return; }
  const nascimento = new Date(currentMoment);
  if (data) idade = fvIdadeDoEvento({ data }, nascimento);
  const novo = { id: id || String(Date.now()), idade: Math.round(idade * 10000) / 10000, titulo, nota };
  if (marcacao) novo.marcacao = marcacao;
  if (data) novo.data = data;                                       // data digitada manda: a idade é sempre recalculada dela
  const lista = id ? fvEventos.map(x => x.id === id ? novo : x) : [...fvEventos, novo];
  if (await fvSalvarEventos(lista)) { fvFecharJanelaEvento(); fvReRenderizar(); }
}

async function fvApagarEvento(id) {
  const e = fvEventos.find(x => x.id === id);
  if (!e) return;
  if (typeof astroConfirm === 'function' && !await astroConfirm(`Apagar o evento "${e.titulo}"?`)) return;
  if (await fvSalvarEventos(fvEventos.filter(x => x.id !== id))) fvReRenderizar();
}
if (typeof window !== "undefined") window.fvApagarEvento = fvApagarEvento;

/* ---------- tela ---------- */

/* Uma leitura completa (uma coluna): título, fonte, regentes, troca, as duas fases e a qualidade (Valens II.1). */
function fvBlocoLeitura(titulo, condicao, explica, fonte, origemHtml, aviso, r) {
  return `
    <div class="fv-coluna" style="min-width:0;">
      <h3 class="titulo-secao">${titulo} — ${condicao} (${explica})</h3>
      <div class="texto-apagado" style="font-size:11.5px; margin-bottom:6px;">${fonte}</div>
      <div style="font-size:13px; line-height:2;">${origemHtml}</div>
      ${aviso ? `<div style="font-size:12px; margin:6px 0; color:var(--terracota); font-weight:700;">${aviso}</div>` : ''}
      <div class="cartao" style="margin-top:8px;">
        <span class="rotulo">Regentes da triplicidade de ${FV_ELEMENTO_ROTULO[r.elemento]}, tabela de Doroteu, ${r.isDia ? 'dia' : 'noite'}</span>
        ${fvLinhaPlaneta('Primeiro regente, fase 1', r.reg1)}
        ${fvLinhaPlaneta('Segundo regente, fase 2', r.reg2)}
        ${fvLinhaPlaneta('Participante, ajuda nas duas fases', r.part)}
      </div>
      <div style="margin-top:14px;">${fvCartaoTroca(r)}</div>
      <div style="margin-top:14px;">${fvLinhasFases(r)}</div>
      <div style="margin-top:14px;">${fvQualidade(r)}</div>
    </div>`;
}

function renderFasesVidaUI(container) {
  fvCarregarEventos();                                              // assíncrono: redesenha quando os eventos chegam
  const lat = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lat !== undefined) ? currentGeo.lat : -23.5505;
  const base = { dados: currentCalculatedData, lat, nascimento: new Date(currentMoment), hoje: new Date() };
  const rMat = fvCalcularFases(Object.assign({ fonte: 'luminar' }, base));
  if (!rMat) {
    container.innerHTML = `<div style="padding: 24px; text-align: center;">Não foi possível calcular: dados do mapa incompletos.</div>`;
    return;
  }
  const temSizigia = !!(currentCalculatedData.Sizigia);
  const rSoc = temSizigia ? fvCalcularFases(Object.assign({ fonte: 'sizigia' }, base)) : null;
  const mesmos = (a, b) => a.reg1.id === b.reg1.id && a.reg2.id === b.reg2.id && a.part.id === b.part.id;
  const coincidem = !!rSoc && mesmos(rMat, rSoc) && Math.abs(rMat.troca.idade - rSoc.troca.idade) < 1e-9;

  // leituras da barra e dos eventos: se coincidem, uma só com as duas legendas
  const icoLum = (typeof getIconeSVG === 'function') ? getIconeSVG('planeta', rMat.luminarId, 20) : '';
  const icoSiz = (typeof getIconeSVG === 'function') ? getIconeSVG('outro', 'sizigia', 20) : '';
  const leituras = coincidem
    ? [{ rotulo: 'material · social', r: rMat, icones: icoLum + icoSiz }]
    : [{ rotulo: 'material', r: rMat, icones: icoLum }].concat(rSoc ? [{ rotulo: 'social', r: rSoc, icones: icoSiz }] : []);
  const lista = fvEventosOrdenados(rMat.nascimento);

  const tabelaAscensao = `
    <table class="tabela-epoca">
      <tr><th>Signo</th><th class="centro">Tempo de ascensão</th></tr>
      ${rMat.tempos.map((t, i) => `<tr><td>${fvSigno(i, 20)}</td><td class="centro">${fvFmtAnos(t)}</td></tr>`).join('')}
      <tr><td><strong>Soma</strong></td><td class="centro"><strong>${fvFmtAnos(rMat.tempos.reduce((a, b) => a + b, 0))}</strong></td></tr>
    </table>`;

  const blocoMat = fvBlocoLeitura('Luminar da seita', 'condição material', 'quanto tem', 'Doroteu I.22. Regentes da triplicidade do signo do luminar da seita, Sol de dia e Lua de noite.',
    `Luminar da seita: <span style="${FV_LINHA}">${fvPlaneta(rMat.luminarId, 24)} ${fvSigno(rMat.signoRef, 22)}</span>`, '', rMat);
  const blocoSoc = rSoc ? fvBlocoLeitura('Sizígia pré-natal', 'condição social', 'quão livre é', 'Doroteu I.10. Regentes da triplicidade do signo da última lua nova ou cheia antes do nascimento, na tabela de dia ou de noite conforme a seita do nascimento.',
    `Sizígia pré-natal: <span style="${FV_LINHA}">${fvSizigia(24)} ${fvSigno(rSoc.signoRef, 22)}</span>`,
    'Aplicação da regra de troca de Valens à sizígia é uma extensão: Doroteu I.10 fala em começo e fim da vida e não dá a data da troca.', rSoc)
    : '<div class="texto-apagado" style="font-size:12px;">Sem a sizígia pré-natal neste mapa: só a leitura do luminar da seita.</div>';
  const faixaCoincide = coincidem
    ? `<div class="cartao" style="margin-top:10px; font-size:13px; font-weight:700; color:var(--terracota);">As duas leituras coincidem: mesmos regentes, mesma data de troca.</div>` : '';

  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column;">
      <div id="fases-vida-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Fases da Vida — Regentes da Triplicidade</h3><div class="acoes-ferramenta">
          <button type="button" onclick="salvarFasesVidaNaGaleria()" title="Salvar as Fases da Vida como imagem na galeria (com título e cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
          </button>
          <div style="position: relative; flex-shrink: 0;">
            <button type="button" onclick="const m=document.getElementById('fvMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório" class="botao-icone">
              <svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
            </button>
            <div id="fvMenuRelatorio" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; min-width: 260px;">
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('inteira')">Ferramenta inteira (sem cabeçalho)</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('leituras')">Trocas na barra, luminar da seita e sizígia</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('eventos')">Só os eventos de vida</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('ascensao')">Só os tempos de ascensão</div>
            </div>
          </div>
        </div></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        ${(typeof montarCabecalhoMandalaImagemHTML === 'function') ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}

        <div id="fasesVidaResultsArea">
        <hr class="divisa">
        <div id="fvParteLeituras">
        <div style="font-size:13px; line-height:2;">
          <div>Seita: <strong>${rMat.isDia ? 'diurna' : 'noturna'}</strong></div>
          <div class="texto-apagado" style="font-size:11.5px;">Latitude usada nos tempos de ascensão: ${fvNum(lat, 2)}°${rMat.polar ? ' — latitude polar: algum signo não nasce/se põe, resultado aproximado.' : ''}</div>
        </div>
        ${faixaCoincide}

        <hr class="divisa">
        <h3 class="titulo-secao">Trocas na barra</h3>
        <div class="texto-apagado" style="font-size:11.5px;">Hoje: ${fvFmtData(rMat.hoje)}, idade ${fvAnosMeses(rMat.nascimento, rMat.hoje)}. A vida tem duas fases; não existe terceira. Escala da barra: 0 a 90 anos.</div>
        ${fvBarrasProgresso(leituras)}
        ${fvLinhaDoTempo(leituras, lista, rMat.idadeHoje)}

        <hr class="divisa">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(380px, 1fr)); gap:24px; align-items:start;">
          ${blocoMat}
          ${blocoSoc}
        </div>

        <hr class="divisa">
        <div class="texto-apagado" style="font-size:11.5px; line-height:1.55;">
          <strong>Fontes.</strong> Doroteu I.22: fortuna do nativo, pelo luminar da seita. Doroteu I.10: livre ou escravo, pela sizígia. Valens II.1 e VII.2: instrumento de tempo.
          Valens VII.2 e VII.3: os efeitos se realizam ao completar os tempos e o regente que sai pode se combinar com o que entra. Valens não define a largura da transição.
          A regra exata de qual signo conta é hipótese em teste. Os tempos de ascensão são calculados por ascensão oblíqua, com obliquidade de 23,44° e 1 grau de ascensão igual a 1 ano.
          As tabelas antigas, como a de Valens com Áries 20, Câncer 33 e Capricórnio 27, são aproximações e ficam de 1 a 3 anos abaixo.
        </div>
        </div>

        <hr class="divisa">
        <div id="fvParteEventos">
        <h3 class="titulo-secao">Eventos de vida</h3>
        ${fvBlocoEventos(leituras, lista)}
        </div>

        <hr class="divisa">
        <div id="fvParteAscensao">
        <h3 class="titulo-secao">Tempos de ascensão</h3>
        <div class="envolve-tabela">${tabelaAscensao}</div>
        </div>

        </div>
        <hr class="divisa-fim">
      </div>
    </div>`;
}

/* O html2canvas desenha a bolinha (radio) do navegador, com fundo branco, ignorando o estilo do papiro (transparente, contorno azul egípcio,
   miolo terracota). Durante a captura as bolinhas são trocadas por um desenho igual ao da tela e os controles de eventos (editar, apagar,
   + Evento) somem; no fim volta tudo como estava. */
function fvPrepararCaptura(area) {
  const trocas = [];
  area.querySelectorAll('input[type="radio"]').forEach(inp => {
    const cs = getComputedStyle(inp);
    const bolinha = document.createElement('span');
    bolinha.style.cssText = `display:inline-block; position:relative; flex:0 0 auto; box-sizing:border-box; width:${inp.offsetWidth || 16}px; height:${inp.offsetHeight || 16}px; border-radius:50%; background:transparent; border:1.5px solid ${cs.borderTopColor};`;
    if (inp.checked) {
      const miolo = document.createElement('span');
      miolo.style.cssText = 'position:absolute; left:3px; top:3px; width:7px; height:7px; border-radius:50%; background:var(--terracota, #A03E25);';
      bolinha.appendChild(miolo);
    }
    inp.replaceWith(bolinha);
    trocas.push({ inp, bolinha });
  });
  const escondidos = [];
  area.querySelectorAll('.fv-nao-captura').forEach(el => { escondidos.push({ el, d: el.style.display }); el.style.display = 'none'; });
  return () => {
    trocas.forEach(t => { if (t.bolinha.parentNode) t.bolinha.replaceWith(t.inp); });
    escondidos.forEach(x => { x.el.style.display = x.d; });
  };
}

/* Botão de galeria: título + cabeçalho padrão + resultados, SÓ AO TOCAR (mesmo padrão dos Decênios). */
function salvarFasesVidaNaGaleria() {
  const area = document.getElementById('fasesVidaResultsArea');
  if (!area) return;
  capturarESalvarNaGaleria(
    async () => {
      const voltar = fvPrepararCaptura(area);
      try { return await gerarImagemHtmlComCabecalho(area, { titulo: 'FASES DA VIDA', comCabecalho: true, papiro: true }); }
      finally { voltar(); }
    },
    `Astro_Hellenic_Fases_da_Vida_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
if (typeof window !== "undefined") window.salvarFasesVidaNaGaleria = salvarFasesVidaNaGaleria;

/* Manda pro Relatório SÓ os resultados (sem título nem cabeçalho), inteiros ou por partes (mesmo menu da Liberação e dos Lotes). */
const FV_PARTES_RELATORIO = {
  inteira: { id: 'fasesVidaResultsArea', nome: 'Fases da Vida' },
  leituras: { id: 'fvParteLeituras', nome: 'Fases da Vida: trocas na barra, luminar da seita e sizígia' },
  eventos: { id: 'fvParteEventos', nome: 'Fases da Vida: eventos de vida' },
  ascensao: { id: 'fvParteAscensao', nome: 'Fases da Vida: tempos de ascensão' }
};
async function capturarFasesVidaParaRelatorio(parte) {
  const menu = document.getElementById('fvMenuRelatorio');
  if (menu) menu.style.display = 'none';
  const def = FV_PARTES_RELATORIO[parte] || FV_PARTES_RELATORIO.inteira;
  const area = document.getElementById(def.id);
  if (!area) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  const raiz = document.getElementById('fasesVidaResultsArea') || area;
  const voltar = fvPrepararCaptura(raiz);
  try {
    const papiro = window.temaMandala === 'ceu';
    const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : fundoPainelClaro()); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('fasesVida', canvas.toDataURL('image/png'));
    alert(`"${def.nome}" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar as Fases da Vida ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  } finally {
    voltar();
  }
}
if (typeof window !== "undefined") window.capturarFasesVidaParaRelatorio = capturarFasesVidaParaRelatorio;
