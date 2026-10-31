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


/* ---------- Duração da vida: Paulo de Alexandria, Introdução, cap. 36 "Sobre o domínio" (oikodespoteia) ----------
   Só a duração (sem o destruidor / anareta: ver a nota no rodapé da ferramenta). Regra lida com o astrólogo, parágrafo por parágrafo:
   1. Lugares de negócio (dealing places): só dizem se o SOL ou a LUA servem de ponto de partida (se estão neles). Dia: Horóscopo, Meio do Céu e Bom
      Espírito (casas 1, 10, 11) e, em signo masculino, o Descendente e o signo que se põe sobre ele (a casa 7). Noite: os 4 ângulos, Boa Fortuna (5),
      Bom Espírito (11) e a pós-ascensão do Horóscopo (2). Casas por signos inteiros.
   2. Candidatos a oikodespotes (kurios). Pelo Sol (dia): senhor do termo, da exaltação e da triplicidade (o primeiro, pela seita); o regente do signo
      NÃO entra (o kratōr "não é o regente absoluto"). Pela Lua (noite): senhor do termo e o regente do signo (oikodektōr), mais, "do modo exposto acima",
      exaltação e triplicidade. Se a luz não está num lugar de negócio: o mesmo vale para a sizígia pré-natal (termo, triplicidade, regente do signo);
      depois os Lotes da Fortuna e do Espírito (triplicidade, signo, termo); por fim o senhor do Horóscopo. DA SIZÍGIA EM DIANTE (no lugar das luzes)
      o candidato tem que estar num lugar de negócio e configurado com o ponto de onde saiu (conjunção ou aspecto, em signos inteiros, sem direção).
   3. Quem fica com o domínio: "mais contas e no pivô, em nascer matutino, no próprio trono (exaltação), sobretudo se olha a luz da seita". Leitura
      do astrólogo: soma tudo (contas de dignidade no ponto + pivô + matutino + trono + olha a luz da seita) e vence quem tem mais.
   4. Anos. Bem situado (nem cadente nem sob os raios do Sol): anos maiores (Saturno 57, Júpiter 79, Marte 66, Vênus 82, Mercúrio 76; Sol 120, Lua 108).
      Cadente ou sob os raios: anos menores "da menor recorrência" (N anos, N meses, N dias e N horas). Se o Sol ou a Lua têm relação com o senhor,
      o Sol dá 120 e a Lua 108 (leitura provisória: TROCA os anos do senhor).
   5. Quem testemunha o senhor (conjunção ou aspecto de signos inteiros, sem direção; o senhor é um dos cinco planetas): Vênus +8, Mercúrio +20,
      Júpiter +12; Saturno +30 e Marte +15 se em casa (domicílio), e tiram os mesmos anos se fora de casa. Benéficos (Vênus e Júpiter) cadentes ou
      sob os raios do Sol não valem. "Subtrativo em números" ainda não é calculado. */
const FV_ANOS_MAIORES = { Sun: 120, Moon: 108, Saturn: 57, Jupiter: 79, Mars: 66, Venus: 82, Mercury: 76 };
const FV_TESTEMUNHAS = { Venus: 8, Mercury: 20, Jupiter: 12, Saturn: 30, Mars: 15 };    // anos que cada um acrescenta (Saturno e Marte tiram, se fora de casa)
const FV_PONTO_NOME = { luz: 'Luz', sizigia: 'Sizígia pré-natal', fortuna: 'Lote da Fortuna', espirito: 'Lote do Espírito', asc: 'Senhor do Horóscopo' };
const FV_LUGAR_SE_POE = 7;                                                               // o signo que se põe sobre o Descendente é a casa 7
const FV_FIGURAS = { 0: 'conjunção', 2: 'sextil', 3: 'quadratura', 4: 'trígono', 6: 'oposição' };

function fvSenhorDoTermo(absGraus) {
  if (typeof EGYPTIAN_TERMS === 'undefined') return null;
  const s = Math.floor(absGraus / 30) % 12, g = absGraus - s * 30;
  const faixa = (EGYPTIAN_TERMS[s] || []).find(t => g < t.deg);
  return faixa ? (FV_SIMBOLO_ID[faixa.p] || null) : null;
}
function fvSenhorDaExaltacao(signo) {
  return Object.keys(FV_EXALTACAO).find(id => FV_EXALTACAO[id] === signo) || null;
}
// "N anos, N meses, N dias e N horas" no calendário egípcio (mês de 30 dias, ano de 360): total em anos
function fvMenorRecorrencia(n) { return n + n / 12 + n / 360 + n / 8640; }

function fvCalcularDuracao(entrada) {
  const d = entrada.dados;
  if (!d || !d.Ascendente || !d.Sol || !d.Lua) return null;
  const norm = a => ((a % 360) + 360) % 360;
  const ids = Object.keys(FV_PLANETAS);
  const abs = {};
  for (const id of ids) { const o = d[FV_PLANETAS[id].chave]; if (!o) return null; abs[id] = norm(o.grau_absoluto); }
  const ascAbs = norm(d.Ascendente.grau_absoluto);
  const isDia = ((abs.Sun - ascAbs + 360) % 360) >= 180;
  const signoDe = a => Math.floor(norm(a) / 30) % 12;
  const signoAsc = signoDe(ascAbs);
  const casaDe = a => ((signoDe(a) - signoAsc + 12) % 12) + 1;
  const signoDaCasa = c => (signoAsc + c - 1) % 12;
  const masculino = s => s % 2 === 0;                                   // fogo e ar
  const distAng = (a, b) => { const x = Math.abs(norm(a) - norm(b)); return Math.min(x, 360 - x); };

  // lugares de negócio
  const lugaresInfo = [];
  const poe = (nome, casa, soMasculino) => {
    const masc = masculino(signoDaCasa(casa));
    lugaresInfo.push({ casa, nome, entra: soMasculino ? masc : true, nota: soMasculino ? (masc ? 'signo masculino' : 'signo feminino: fica de fora') : '' });
  };
  if (isDia) {
    poe('Horóscopo', 1); poe('Meio do Céu', 10); poe('Bom Espírito', 11);
    poe('Descendente e o signo que se põe sobre ele', FV_LUGAR_SE_POE, true);
  } else {
    poe('Horóscopo', 1); poe('Imum Céu', 4); poe('Descendente', 7); poe('Meio do Céu', 10);
    poe('Boa Fortuna', 5); poe('Bom Espírito', 11); poe('pós-ascensão do Horóscopo', 2);
  }
  const lugares = Array.from(new Set(lugaresInfo.filter(l => l.entra).map(l => l.casa))).sort((x, y) => x - y);
  const emLugar = a => lugares.includes(casaDe(a));
  const cadente = a => fvCondicaoCasa(casaDe(a)) === 'cadente';
  const sobRaios = id => id !== 'Sun' && distAng(abs[id], abs.Sun) < 15;
  const bemSituado = id => !cadente(abs[id]) && !sobRaios(id);          // casa boa: nem cadente nem sob os raios
  const configurados = (sA, sB) => { const x = (sB - sA + 12) % 12, y = (sA - sB + 12) % 12; return [0, 2, 3, 4, 6].includes(Math.min(x, y)); };
  const nomeFigura = (sA, sB) => FV_FIGURAS[Math.min((sB - sA + 12) % 12, (sA - sB + 12) % 12)] || '';
  const luzSeita = isDia ? 'Sun' : 'Moon', outraLuz = isDia ? 'Moon' : 'Sun';
  const primeiroDaTriplicidade = s => FV_TRIPLICIDADE[FV_ELEMENTOS[s % 4]][isDia ? 'dia' : 'noite'][0];

  // pontos de partida, na ordem do texto
  const fontes = [];
  [luzSeita, outraLuz].forEach(id => { if (emLugar(abs[id])) fontes.push({ tipo: 'luz', id, abs: abs[id] }); });
  if (d.Sizigia && d.Sizigia.grau_absoluto !== undefined) fontes.push({ tipo: 'sizigia', abs: norm(d.Sizigia.grau_absoluto) });
  const fortunaAbs = norm(isDia ? ascAbs + abs.Moon - abs.Sun : ascAbs + abs.Sun - abs.Moon);
  const espiritoAbs = norm(isDia ? ascAbs + abs.Sun - abs.Moon : ascAbs + abs.Moon - abs.Sun);
  fontes.push({ tipo: 'fortuna', abs: fortunaAbs }, { tipo: 'espirito', abs: espiritoAbs });
  fontes.push({ tipo: 'asc', abs: ascAbs });

  // de cada ponto saem os candidatos e as "contas" (quantos papéis cada um tem ali)
  const candidatosDe = (f) => {
    const votos = {};
    const dar = (id, motivo) => { if (id) (votos[id] = votos[id] || []).push(motivo); };
    const s = signoDe(f.abs);
    if (f.tipo === 'asc') { dar(FV_DOMICILIO[s], 'domicílio'); return votos; }
    dar(fvSenhorDoTermo(f.abs), 'termo');
    dar(primeiroDaTriplicidade(s), 'triplicidade');
    if (f.tipo === 'luz') {
      dar(fvSenhorDaExaltacao(s), 'exaltação');
      if (f.id === 'Moon') dar(FV_DOMICILIO[s], 'regente do signo');      // de dia o regente do signo NÃO entra; pela Lua entra
    } else {
      dar(FV_DOMICILIO[s], 'regente do signo');                          // sizígia e Lotes: termo, triplicidade e signo
    }
    return votos;
  };
  // marcas do texto: pivô, nascer matutino, próprio trono, olha a luz da seita
  const marcas = (id) => {
    const m = [];
    if (fvCondicaoCasa(casaDe(abs[id])) === 'angular') m.push('no pivô');
    if (id !== 'Sun' && ((abs.Sun - abs[id] + 360) % 360) < 180) m.push('nascer matutino');
    if (FV_EXALTACAO[id] === signoDe(abs[id])) m.push('no próprio trono');
    if (id !== luzSeita && configurados(signoDe(abs[id]), signoDe(abs[luzSeita]))) m.push('olha a luz da seita');
    return m;
  };

  // avalia os pontos de partida em ordem, até achar um candidato que valha
  const avaliacao = [];
  let escolhido = null, semConfirmacao = false;
  for (const f of fontes) {
    const votos = candidatosDe(f);
    const exigeFiltro = f.tipo !== 'luz';                                // da sizígia em diante: no lugar das luzes, tem que estar num lugar de negócio e configurado
    const cands = Object.keys(votos).map(id => {
      const lugar = emLugar(abs[id]);
      const config = f.tipo === 'asc' ? true : configurados(signoDe(f.abs), signoDe(abs[id]));
      const mc = marcas(id);
      return { id, votos: votos[id], casa: casaDe(abs[id]), signo: signoDe(abs[id]), lugar, config, figuraNome: f.tipo === 'asc' ? '' : nomeFigura(signoDe(f.abs), signoDe(abs[id])),
        valido: exigeFiltro ? (lugar && config) : true, marcas: mc, pontos: votos[id].length + mc.length };
    });
    const validos = cands.filter(c => c.valido).sort((x, y) => (y.pontos - x.pontos) || (y.votos.length - x.votos.length));
    avaliacao.push({ fonte: f, exigeFiltro, candidatos: cands, escolhido: validos.length ? validos[0].id : null });
    if (validos.length) {
      const top = validos[0];
      escolhido = { fonte: f, id: top.id, votos: top.votos, marcas: top.marcas, pontos: top.pontos, empate: validos.slice(1).filter(c => c.pontos === top.pontos && c.votos.length === top.votos.length).map(c => c.id) };
      break;
    }
  }
  if (!escolhido) {                                                     // ninguém passou no filtro: fica o mais votado do primeiro ponto
    const f = fontes[0], votos = candidatosDe(f);
    const ordem = Object.keys(votos).sort((a, b) => votos[b].length - votos[a].length);
    if (!ordem.length) return null;
    escolhido = { fonte: f, id: ordem[0], votos: votos[ordem[0]], marcas: marcas(ordem[0]), pontos: votos[ordem[0]].length + marcas(ordem[0]).length, empate: [] };
    semConfirmacao = true;
  }
  const R = escolhido.id;

  // anos-base
  const bem = bemSituado(R);
  let base = bem
    ? { tipo: 'maiores', anos: FV_ANOS_MAIORES[R], motivo: 'bem situado (casa boa, fora dos raios do Sol)' }
    : { tipo: 'menores', n: FV_PLANETAS[R].anosMenores, anos: fvMenorRecorrencia(FV_PLANETAS[R].anosMenores),
        motivo: cadente(abs[R]) ? 'cadente' : 'sob os raios do Sol' };
  // Sol ou Lua em relação com o senhor: dá os anos deles em vez dos anos do senhor (leitura provisória)
  let trocaLuz = null;
  if (R !== 'Sun' && R !== 'Moon') {
    const rel = [luzSeita, outraLuz].filter(l => configurados(signoDe(abs[l]), signoDe(abs[R])));
    if (rel.length) { const l = rel[0]; trocaLuz = { id: l, figura: nomeFigura(signoDe(abs[l]), signoDe(abs[R])) }; base = { tipo: 'luz', anos: FV_ANOS_MAIORES[l], luz: l, motivo: `${FV_PLANETAS[l].nome} em relação com o senhor (${trocaLuz.figura}): dá os anos dela` }; }
  }

  // testemunhas (só quando o senhor é um dos cinco planetas): conjunção ou aspecto, sem direção
  const testemunhas = [];
  if (R !== 'Sun' && R !== 'Moon') {
    Object.keys(FV_TESTEMUNHAS).filter(t => t !== R).forEach(t => {
      if (!configurados(signoDe(abs[t]), signoDe(abs[R]))) return;
      const anos = FV_TESTEMUNHAS[t];
      const benefico = t === 'Venus' || t === 'Jupiter';
      const bemT = bemSituado(t);
      let efeito = anos, motivo = 'acrescenta';
      if (benefico && !bemT) { efeito = 0; motivo = (cadente(abs[t]) ? 'benéfico cadente' : 'benéfico sob os raios do Sol') + ': sem serventia'; }
      else if (t === 'Saturn' || t === 'Mars') {
        if (FV_DOMICILIO[signoDe(abs[t])] === t) motivo = 'em casa: acrescenta';
        else { efeito = -anos; motivo = 'fora de casa: tira'; }
      }
      testemunhas.push({ id: t, efeito, motivo, figura: nomeFigura(signoDe(abs[t]), signoDe(abs[R])), casa: casaDe(abs[t]), bem: bemT });
    });
  }
  const somaTest = testemunhas.reduce((a, t) => a + t.efeito, 0);
  const total = Math.max(0, base.anos + somaTest);
  let semTroca = null;                                                   // o que daria sem a troca pelos anos do Sol ou da Lua (pra comparar)
  if (trocaLuz) { const anosSenhor = bem ? FV_ANOS_MAIORES[R] : fvMenorRecorrencia(FV_PLANETAS[R].anosMenores); semTroca = { anosSenhor, total: Math.max(0, anosSenhor + somaTest) }; }
  const nasc = entrada.nascimento ? new Date(entrada.nascimento) : null;
  return {
    isDia, lugares, lugaresInfo, avaliacao, fonte: escolhido.fonte,
    senhor: { id: R, signo: signoDe(abs[R]), casa: casaDe(abs[R]), grau: Math.floor(norm(abs[R]) % 30), votos: escolhido.votos, marcas: escolhido.marcas, pontos: escolhido.pontos, bem },
    empate: escolhido.empate, semConfirmacao, base, trocaLuz, semTroca, testemunhas, total,
    data: nasc ? new Date(nasc.getTime() + total * 365.25 * 86400000) : null, nascimento: nasc,
    fonteSigno: signoDe(escolhido.fonte.abs), fonteCasa: casaDe(escolhido.fonte.abs), fonteGrau: Math.floor(norm(escolhido.fonte.abs) % 30)
  };
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
  module.exports = { fvCalcularDuracao, fvTemposAscensao, fvDignidades, fvCalcularFases, fvIdadeDoEvento, fvFaseDoEvento, fvDistanciaTroca, fvAnosMesesDias, FV_SIGNOS };
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


/* Bloco "Duração da vida" (Paulo, cap. 36): resultado em cima; embaixo a parte dos cálculos, toda à vista (pontos de partida, candidatos, contas,
   lugares de negócio e quem testemunha), pra decidir cada escolha do texto. */
function fvIconePonto(f, tam) {
  return f.tipo === 'luz' ? fvPlaneta(f.id, tam)
    : f.tipo === 'sizigia' ? fvSizigia(tam)
    : f.tipo === 'fortuna' ? ((typeof getLotIconSVG === 'function') ? getLotIconSVG('fortune', tam) : '')
    : f.tipo === 'espirito' ? ((typeof getLotIconSVG === 'function') ? getLotIconSVG('spirit', tam) : '') : '';
}
function fvBlocoDuracao(r) {
  if (!r) return '<div class="texto-apagado" style="font-size:12px;">Sem dados suficientes para a duração da vida.</div>';
  const S = r.senhor;
  const sim = (v, textoSim, textoNao) => v ? `<strong>${textoSim}</strong>` : `<span style="color:var(--terracota);">${textoNao}</span>`;

  const resultado = `
    <div style="font-size:15px; margin:6px 0 10px;"><strong>${fvFmtAnos(r.total)}</strong>${r.data ? ` <span class="texto-apagado" style="font-size:12px;">· até ${fvFmtData(r.data)}</span>` : ''}</div>
    <div class="cartao">
      <span class="rotulo">Senhor da vida (oikodespotes)</span>
      <div style="${FV_LINHA} font-size:13px; flex-wrap:wrap; margin-top:3px;">${fvPlaneta(S.id, 26)} <span>em</span> ${fvSigno(S.signo, 22)} <span>${S.grau}° · casa ${S.casa} · <strong>${fvCondicaoCasa(S.casa)}</strong></span></div>
      <div style="margin-top:10px;"><span class="rotulo">Anos do senhor</span></div>
      <div style="font-size:13px; margin:3px 0 10px; line-height:1.8;">${r.base.tipo === 'maiores'
        ? `<strong>${r.base.anos} anos</strong> <span class="texto-apagado">(anos maiores: ${r.base.motivo})</span>`
        : r.base.tipo === 'luz'
        ? `<strong>${r.base.anos} anos</strong> <span class="texto-apagado">(${r.base.motivo}; leitura provisória)</span>`
        : `<strong>${fvFmtAnos(r.base.anos)}</strong> <span class="texto-apagado">(anos menores, ${r.base.n} anos, ${r.base.n} meses, ${r.base.n} dias e ${r.base.n} horas: ${r.base.motivo})</span>`}</div>
      ${r.semTroca ? `<div class="texto-apagado" style="font-size:11.5px; margin:-4px 0 10px;">Sem essa troca: o senhor daria ${fvFmtAnos(r.semTroca.anosSenhor)} e o total seria ${fvFmtAnos(r.semTroca.total)}.</div>` : ''}
      <span class="rotulo">Quem testemunha o senhor</span>
      <div style="margin-top:3px;">${r.testemunhas.length ? r.testemunhas.map(t => `
        <div style="${FV_LINHA} flex-wrap:wrap; font-size:13px; padding:3px 0;">${fvPlaneta(t.id, 22)}
          <strong style="color:${t.efeito < 0 ? 'var(--terracota)' : 'inherit'};">${t.efeito > 0 ? '+' : (t.efeito < 0 ? '−' : '')}${Math.abs(t.efeito)} anos</strong>
          <span class="texto-apagado" style="font-size:11.5px;">${t.figura}, casa ${t.casa}: ${t.motivo}</span>
        </div>`).join('') : `<div class="texto-apagado" style="font-size:12px;">Ninguém${(S.id === 'Sun' || S.id === 'Moon') ? ' (o senhor é uma das luzes: valem só os anos dela)' : ''}.</div>`}</div>
    </div>`;

  // ---- cálculos ----
  const lugares = `
    <div class="cartao" style="margin-top:10px;">
      <span class="rotulo">Lugares de negócio (${r.isDia ? 'nascimento diurno' : 'nascimento noturno'})</span>
      <div style="font-size:12.5px; line-height:1.9; margin-top:3px;">${r.lugaresInfo.map(l => `
        <div>${l.entra ? '<strong>casa ' + l.casa + '</strong>' : '<span class="texto-apagado">casa ' + l.casa + '</span>'} · ${l.nome}${l.nota ? ` <span class="texto-apagado">(${l.nota})</span>` : ''}</div>`).join('')}</div>
      <div class="texto-apagado" style="font-size:11.5px; margin-top:6px;">O "signo que se põe sobre o Descendente" é o da casa ${FV_LUGAR_SE_POE}: o que está acima do horizonte descendo sobre ele.</div>
    </div>`;
  const pontos = r.avaliacao.map(av => {
    const f = av.fonte;
    const cabeca = `<div style="${FV_LINHA} font-size:13px; flex-wrap:wrap;">${fvIconePonto(f, 22)} <strong>${f.tipo === 'luz' ? '' : FV_PONTO_NOME[f.tipo]}</strong> <span>em</span> ${fvSigno(Math.floor(f.abs / 30) % 12, 20)} <span>${Math.floor(f.abs % 30)}°</span></div>`;
    const linhas = av.candidatos.map(c => `
      <div style="padding:5px 0; border-top:var(--contorno-fino) solid var(--azul-egipcio-claro); font-size:12.5px; line-height:1.8;">
        <span style="${FV_LINHA}">${fvPlaneta(c.id, 22)} <span>casa ${c.casa}</span></span>
        <span class="texto-apagado">· contas: ${c.votos.join(', ')} (${c.votos.length})</span><br>
        <span>marcas: ${c.marcas.length ? c.marcas.join(' · ') : '<span class="texto-apagado">nenhuma</span>'} (${c.marcas.length}) · <strong>total ${c.pontos}</strong></span>
        ${av.exigeFiltro ? `<br><span>em lugar de negócio: ${sim(c.lugar, 'sim', 'não')} · configurado com o ponto: ${f.tipo === 'asc' ? '<span class="texto-apagado">não se pede</span>' : sim(c.config, 'sim (' + c.figuraNome + ')', 'não')} · ${c.valido ? '<strong>vale</strong>' : '<span style="color:var(--terracota);">não vale</span>'}</span>` : ''}
        ${av.escolhido === c.id ? '<br><strong style="color:var(--terracota);">← escolhido</strong>' : ''}
      </div>`).join('');
    return `<div class="cartao" style="margin-top:10px;"><span class="rotulo">Ponto de partida ${r.avaliacao.indexOf(av) + 1}${av.exigeFiltro ? '' : ' · a luz está num lugar de negócio: os candidatos não passam por filtro'}</span><div style="margin:3px 0 6px;">${cabeca}</div>${linhas || '<div class="texto-apagado" style="font-size:12px;">Sem candidatos.</div>'}${av.escolhido ? '' : '<div class="texto-apagado" style="font-size:11.5px; margin-top:6px;">Nenhum valeu: o texto manda passar ao próximo ponto.</div>'}</div>`;
  }).join('');
  const notas = [];
  if (r.semConfirmacao) notas.push('Nenhum candidato passou no filtro do texto (em lugar de negócio e configurado com o ponto); ficou o mais votado do primeiro ponto.');
  if (r.empate.length) notas.push('Empate com ' + r.empate.map(id => FV_PLANETAS[id].nome).join(', ') + ': o texto não desempata.');
  const regras = `<div class="texto-apagado" style="font-size:11.5px; margin-top:10px; line-height:1.6;">
      Regras aplicadas: o vencedor é quem soma mais entre as contas de dignidade no ponto e as marcas do texto (no pivô, nascer matutino, no próprio trono, olha a luz da seita). Casa boa = nem cadente nem sob os raios do Sol (menos de 15°). Testemunhar = conjunção (mesmo signo) ou aspecto de signos inteiros (sextil, quadratura, trígono, oposição), sem direção. Saturno e Marte somam se estão em casa (domicílio) e tiram se estão fora. Vênus e Júpiter cadentes ou sob os raios não contam. Sol ou Lua em relação com o senhor: dão os anos deles em vez dos anos do senhor (leitura provisória). "Subtrativo em números" não é calculado.</div>`;
  return `${resultado}
    <h4 class="titulo-secao" style="margin-top:18px;">Cálculos</h4>
    ${lugares}${pontos}
    ${notas.map(n => `<div class="texto-apagado" style="font-size:11.5px; margin-top:8px;">${n}</div>`).join('')}${regras}`;
}

/* Rodapé: o que Paulo diz sobre o anareta (o destruidor), pra olhar na Circumambulação. Caps. 34 e 35 da Introdução (tradução de Schmidt/Hand). */
function fvNotaAnareta() {
  return `
    <div class="texto-apagado" style="font-size:11.5px; line-height:1.65;">
      <strong>Sobre o anareta (o destruidor), segundo Paulo.</strong> Nos capítulos 34 e 35 da Introdução ele não usa a palavra "anareta": trata do mesmo assunto como <em>crises</em> (as "perigosas e que trazem a morte"), e é aí que se olha na Circumambulação. Esta ferramenta calcula só a duração.
      <br><br><strong>Cap. 34, sobre as crises.</strong> As crises mortais e perigosas nascem do encontro, por circumambulação, do Sol e da Lua (e às vezes do Horóscopo) com os raios dos maléficos, por conjunção ou pelo lado triangular, diametral, quadrado ou hexagonal.
      O lado triangular, em qualquer direção, dá segurança. O hexagonal e o quadrado à direita não fazem mal. O quadrado à esquerda é mais perigoso que os outros. O hexagonal ou o quadrado à esquerda, o diametral e o contato por conjunção são destrutivos, fatais e perigosos, sendo o hexagonal à esquerda o mais fácil de suportar.
      O encontro das luzes com os nodos, por conjunção ou oposição, também vale. Em nascimento diurno é perigoso o contato da circumambulação do Sol com Marte; em nascimento noturno, o da circumambulação da Lua com Saturno, que é uma crise assustadora. O contato de uma luz com um nodo é perigoso de dia ou de noite. O contato do Sol com a Lua, e da Lua com o Sol, traz perigo de morte de dia ou de noite.
      Os encontros com os astros líderes da seita significam crises passageiras, sem perigo.
      <br><br><strong>Como se conta.</strong> Parte-se do grau em que o Sol, a Lua ou o Horóscopo estão no nascimento, até que encontrem um astro à frente, em qualquer figura, ou até que se complete o intervalo de signo a signo (pelos tempos de ascensão). Se encontram um maléfico no mesmo signo antes do fim do intervalo, o perigo vem mais depressa. Se o intervalo acaba antes de encontrarem um astro à frente na descrição figural do intervalo, ele produz a causa da crise.
      Exemplo de Paulo: Sol a 15° de Escorpião, Marte a 23° de Leão, Lua a 6° de Sagitário, Horóscopo a 21° de Escorpião. Em Alexandria, Escorpião sobe em 35 anos, distribuídos pelos 30 graus de Escorpião e pelo signo de mesma ascensão (Leão): 14 meses por grau. Do Sol até Marte são 8 graus: 8 × 14 = 112 meses, 9 anos e 4 meses; o Sol em quadrado à esquerda de Marte mostra uma crise que traz a morte. O intervalo de 17 anos e 6 meses, de Escorpião a Sagitário, mostra outra crise perigosa. O Sol toca a Lua aos 23 anos e 10 meses de Sagitário.
      Hermes Trismegisto: as crises que vêm com o nascimento nem sempre causam doença. Algumas causam misérias, ataques de piratas, perdas, naufrágios, processos ou longas estadas longe de casa. As crises feitas pelos astros fora da própria seita contribuem para doenças, perigos e misérias; as feitas pelas penalidades da seita também multiplicam essas coisas.
      <br><br><strong>Cap. 35, o laço da Lua.</strong> A Lua está "em laço" quando cai a menos de 5° dos raios solares, a caminho da conjunção, em qualquer figura; o mesmo vale para as figuras da lua cheia, para os dois quadrados do Sol e para os dois hexágonos (o trígono parece não entrar; é nota do tradutor). O laço se desfaz quando ela passa pelo grau do Sol por circumambulação. Se a dissolução encontra um maléfico, é causa de muita má sorte; se encontra um estacionário ou "subtrativo em números", traz loucuras, restrições, deteriorações e doenças crônicas, às vezes lesões difíceis de tratar e às vezes tira a vida.
      A dissolução é ainda mais grave quando a Lua, ao se soltar da conjunção, encontra Marte, e ao se soltar da lua cheia, encontra Saturno. Os laços dos primeiro e segundo quartos agem mais, para ajuda se vão a benéficos e para estorvo se vão a maléficos. Por fim: a circumambulação pelas luzes, quando Saturno, Marte ou o Sol fazem contato por quadrado à esquerda, produz uma crise perigosa, pela relação do lançamento de raios, como julgaram os sábios egípcios.
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
  const duracao = fvCalcularDuracao({ dados: currentCalculatedData, nascimento: rMat.nascimento });

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
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('cima')">Só a metade de cima (regentes da triplicidade)</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('baixo')">Só a metade de baixo (duração da vida)</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('leituras')">Trocas na barra, luminar da seita e sizígia</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('eventos')">Só os eventos de vida</div>
              <div class="item-menu" onclick="capturarFasesVidaParaRelatorio('ascensao')">Só os tempos de ascensão</div>
            </div>
          </div>
        </div></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        ${(typeof montarCabecalhoMandalaImagemHTML === 'function') ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}

        <div id="fasesVidaResultsArea">
        <div id="fvMetadeCima">
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

        <hr class="divisa">
        <div id="fvParteDuracao">
        <h3 class="titulo-secao">Duração da vida</h3>
        <div class="texto-apagado" style="font-size:11.5px;">Paulo de Alexandria, Introdução, capítulo 36 (oikodespoteia). Só a duração, sem o destruidor.</div>
        ${duracao && duracao.data ? barraTempo(rMat.nascimento, duracao.data, 'margin: 12px 0 4px;', 11, 'anosCivis', rMat.hoje) : ''}
        ${fvBlocoDuracao(duracao)}
        </div>

        </div>
        <div style="margin-top:18px;">${fvNotaAnareta()}</div>
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
  cima: { id: 'fvMetadeCima', nome: 'Fases da Vida: regentes da triplicidade (metade de cima)' },
  baixo: { id: 'fvParteDuracao', nome: 'Fases da Vida: duração da vida (metade de baixo)' },
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
