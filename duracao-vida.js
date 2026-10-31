/* ==========================================
   DURAÇÃO DA VIDA (FERRAMENTA DE TESTE, SÓ ADMIN)
   Paulo de Alexandria, Introdução, capítulo 36 ("Sobre o domínio", oikodespoteia): quem é o senhor da vida e quantos anos ele dá.
   Só a duração; o destruidor (anareta) fica de fora e está anotado no rodapé da ferramenta.
   Usa as constantes e ajudantes da Fases da Vida (fases-vida.js, carregado antes): FV_PLANETAS, FV_TRIPLICIDADE, FV_DOMICILIO, FV_EXALTACAO,
   FV_SIMBOLO_ID, FV_ELEMENTOS, fvCondicaoCasa, fvFmtAnos, fvFmtData, fvPlaneta, fvSigno, fvSizigia, FV_LINHA.
   O cálculo (dvCalcular) não mexe na tela. A barra de tempo vem de camadas-tempo.js.
   ========================================== */

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
      o Sol dá 120 e a Lua 108 e a conta FECHA aí (se os dois, vale o luminar da seita).
   5. Só quando o senhor é um dos cinco planetas e nem o Sol nem a Lua têm relação com ele: quem o testemunha (conjunção ou aspecto de signos inteiros, sem direção): Vênus +8, Mercúrio +20,
      Júpiter +12; Saturno +30 e Marte +15 se em casa (domicílio), e tiram os mesmos anos se fora de casa. Os que só acrescentam (Vênus, Júpiter e Mercúrio) cadentes ou
      sob os raios do Sol não valem. "Subtrativo em números" ainda não é calculado. */
const DV_ANOS_MAIORES = { Sun: 120, Moon: 108, Saturn: 57, Jupiter: 79, Mars: 66, Venus: 82, Mercury: 76 };
const DV_TESTEMUNHAS = { Venus: 8, Mercury: 20, Jupiter: 12, Saturn: 30, Mars: 15 };    // anos que cada um acrescenta (Saturno e Marte tiram, se fora de casa)
const DV_PONTO_NOME = { luz: 'Luz', sizigia: 'Sizígia pré-natal', fortuna: 'Lote da Fortuna', espirito: 'Lote do Espírito', asc: 'Senhor do Horóscopo' };
const DV_LUGAR_SE_POE = 7;                                                               // o signo que se põe sobre o Descendente é a casa 7
const DV_FIGURAS = { 0: 'conjunção', 2: 'sextil', 3: 'quadratura', 4: 'trígono', 6: 'oposição' };

function dvSenhorDoTermo(absGraus) {
  if (typeof EGYPTIAN_TERMS === 'undefined') return null;
  const s = Math.floor(absGraus / 30) % 12, g = absGraus - s * 30;
  const faixa = (EGYPTIAN_TERMS[s] || []).find(t => g < t.deg);
  return faixa ? (FV_SIMBOLO_ID[faixa.p] || null) : null;
}
function dvSenhorDaExaltacao(signo) {
  return Object.keys(FV_EXALTACAO).find(id => FV_EXALTACAO[id] === signo) || null;
}
// "N anos, N meses, N dias e N horas" no calendário egípcio (mês de 30 dias, ano de 360): total em anos
function dvMenorRecorrencia(n) { return n + n / 12 + n / 360 + n / 8640; }

function dvCalcular(entrada) {
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
    poe('Descendente e o signo que se põe sobre ele', DV_LUGAR_SE_POE, true);
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
  const nomeFigura = (sA, sB) => DV_FIGURAS[Math.min((sB - sA + 12) % 12, (sA - sB + 12) % 12)] || '';
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
    dar(dvSenhorDoTermo(f.abs), 'termo');
    dar(primeiroDaTriplicidade(s), 'triplicidade');
    if (f.tipo === 'luz') {
      dar(dvSenhorDaExaltacao(s), 'exaltação');
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
    ? { tipo: 'maiores', anos: DV_ANOS_MAIORES[R], motivo: 'bem situado (casa boa, fora dos raios do Sol)' }
    : { tipo: 'menores', n: FV_PLANETAS[R].anosMenores, anos: dvMenorRecorrencia(FV_PLANETAS[R].anosMenores),
        motivo: cadente(abs[R]) ? 'cadente' : 'sob os raios do Sol' };
  // Sol ou Lua em relação com o senhor: dá os anos deles em vez dos anos do senhor (leitura provisória)
  let trocaLuz = null;
  if (R !== 'Sun' && R !== 'Moon') {
    const rel = [luzSeita, outraLuz].filter(l => configurados(signoDe(abs[l]), signoDe(abs[R])));
    if (rel.length) { const l = rel[0]; trocaLuz = { id: l, figura: nomeFigura(signoDe(abs[l]), signoDe(abs[R])) }; base = { tipo: 'luz', anos: DV_ANOS_MAIORES[l], luz: l, motivo: `${FV_PLANETAS[l].nome} em relação com o senhor (${trocaLuz.figura}): a conta fecha nos anos dele(a)` }; }
  }

  // testemunhas (só quando o senhor é um dos cinco planetas): conjunção ou aspecto, sem direção
  const testemunhas = [];
  if (R !== 'Sun' && R !== 'Moon') {
    Object.keys(DV_TESTEMUNHAS).filter(t => t !== R).forEach(t => {
      if (!configurados(signoDe(abs[t]), signoDe(abs[R]))) return;
      const anos = DV_TESTEMUNHAS[t];
      const benefico = t === 'Venus' || t === 'Jupiter' || t === 'Mercury';      // os que só acrescentam: cadente ou sob os raios não valem
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
  const total = trocaLuz ? base.anos : Math.max(0, base.anos + somaTest);   // Sol ou Lua em relação com o senhor: a conta fecha nos anos deles, sem somar testemunhas
  let semTroca = null;                                                   // o que daria sem a troca pelos anos do Sol ou da Lua (pra comparar)
  if (trocaLuz) { const anosSenhor = bem ? DV_ANOS_MAIORES[R] : dvMenorRecorrencia(FV_PLANETAS[R].anosMenores); semTroca = { anosSenhor, total: Math.max(0, anosSenhor + somaTest) }; }
  const nasc = entrada.nascimento ? new Date(entrada.nascimento) : null;
  return {
    isDia, lugares, lugaresInfo, avaliacao, fonte: escolhido.fonte,
    senhor: { id: R, signo: signoDe(abs[R]), casa: casaDe(abs[R]), grau: Math.floor(norm(abs[R]) % 30), votos: escolhido.votos, marcas: escolhido.marcas, pontos: escolhido.pontos, bem },
    empate: escolhido.empate, semConfirmacao, base, trocaLuz, semTroca, testemunhas, total,
    data: nasc ? new Date(nasc.getTime() + total * 365.25 * 86400000) : null, nascimento: nasc,
    fonteSigno: signoDe(escolhido.fonte.abs), fonteCasa: casaDe(escolhido.fonte.abs), fonteGrau: Math.floor(norm(escolhido.fonte.abs) % 30)
  };
}


/* ---------- Crises no caminho (Paulo, caps. 34 e 35): o que pode interromper a vida antes da duração ----------
   Só o que o texto nomeia (cap. 34, "Sobre as crises"):
   - Quem caminha: o Sol e a Lua, do grau em que nasceram, pela ordem dos signos; o Horóscopo "às vezes", e só com os raios dos maléficos. O tempo vem da
     ascensão oblíqua (a régua de Paulo: o tempo de ascensão de cada signo dividido igualmente pelos 30 graus, dvAnosPorSigno). O contato acontece quando quem
     caminha chega ao ponto do raio do astro (grau do astro + ângulo).
   - Pares que o texto nomeia: de DIA o Sol com Marte ("perigosa"); de NOITE a Lua com Saturno ("crise assustadora"); de dia ou de noite uma luz com um nodo,
     por conjunção ou oposição ("perigosa"); o Sol com a Lua e a Lua com o Sol ("perigosa e traz a morte"). Os outros pares com maléfico (ex.: Sol com
     Saturno de dia) o texto não nomeia: ficam de fora. O Horóscopo entra só com Marte e Saturno.
   - Figuras: trígono, em qualquer lado, dá segurança; sextil e quadratura à DIREITA não fazem mal; quadratura à ESQUERDA é a mais perigosa; sextil à
     esquerda, oposição e conjunção são "destrutivos, fatais e perigosos", e o sextil à esquerda é o mais fácil de suportar. Esquerda e direita pelo exemplo
     de Paulo (Sol em Escorpião encontra, no mesmo grau, Marte em Leão: "quadrado à esquerda"): o raio lançado para a frente do astro (grau + 60 ou + 90) é
     a ESQUERDA; para trás (grau − 60 ou − 90), a DIREITA.
   - "Traz a morte" só onde o texto diz "death-bringing": o Sol com a Lua e a Lua com o Sol (em figura que faz mal) e, no exemplo de Paulo, o Sol (de dia)
     em quadratura à esquerda de Marte. O resto que faz mal é "perigosa".
   - Cap. 35: Saturno, Marte ou o Sol em quadratura à esquerda de uma luz que caminha é crise perigosa, de dia ou de noite (sem separar).
   - Laço da Lua (cap. 35): se a Lua nasce a menos de 5° antes de uma figura do Sol, o laço se desfaz quando ela chega lá ("perigosa").
   Níveis: 2 traz a morte; 1 perigosa; 0 segura. */
const DV_FIGURAS_CRISE = [
  { off: 0,   nome: 'conjunção',             cls: 'forte', nota: 'destrutiva, fatal' },
  { off: 180, nome: 'oposição',              cls: 'forte', nota: 'destrutiva, fatal' },
  { off: 90,  nome: 'quadratura à esquerda', cls: 'esq90', nota: 'a mais perigosa' },
  { off: 60,  nome: 'sextil à esquerda',     cls: 'media', nota: 'o mais fácil de suportar' },
  { off: 270, nome: 'quadratura à direita',  cls: 'segura', nota: 'não faz mal' },
  { off: 300, nome: 'sextil à direita',      cls: 'segura', nota: 'não faz mal' },
  { off: 120, nome: 'trígono',               cls: 'segura', nota: 'dá segurança' },
  { off: 240, nome: 'trígono',               cls: 'segura', nota: 'dá segurança' }
];

/* A régua de Paulo (cap. 34): o tempo de ascensão de cada signo, dividido igualmente pelos 30 graus (Escorpião sobe em 35 anos, então 14 meses por grau).
   Anda do grau a até o grau b, para a frente, passando de signo em signo. */
function dvAnosPorSigno(a, b, lat) {
  const T = fvTemposAscensao(lat).tempos;
  const norm = x => ((x % 360) + 360) % 360;
  let falta = norm(b - a), x = norm(a), anos = 0;
  while (falta > 1e-9) {
    const sinal = Math.floor((x + 1e-9) / 30) % 12, ate = (sinal + 1) * 30;
    const passo = Math.min(ate - x, falta);
    anos += (passo / 30) * T[sinal];
    x = norm(x + passo); falta -= passo;
  }
  return anos;
}

function dvCrises(dados, lat, anosMax) {
  if (!dados || !dados.Ascendente || !dados.Sol || !dados.Lua) return [];
  const norm = a => ((a % 360) + 360) % 360;
  const g = o => (o && o.grau_absoluto !== undefined) ? norm(o.grau_absoluto) : null;
  const pos = { Sun: g(dados.Sol), Moon: g(dados.Lua), Asc: g(dados.Ascendente), Mars: g(dados['Marte']), Saturn: g(dados['Saturno']), NodeN: g(dados.Nodo_Norte) };
  const isDia = ((pos.Sun - pos.Asc + 360) % 360) >= 180;
  const crises = [];
  const somar = (andarilho, alvo, rayAbs, figura, nivel, nota) => {
    const anos = dvAnosPorSigno(pos[andarilho], rayAbs, lat);
    if (anos < 0.03 || anos > anosMax) return;
    crises.push({ andarilho, alvo, anos, figura, nivel, nota: nota || '' });
  };
  // nível de uma figura, conforme o par (ver o comentário lá em cima)
  const nivelDa = (tipoPar, f) => {
    if (f.cls === 'segura') return 0;
    if (tipoPar === 'luzes') return 2;                                   // Sol com Lua: "perigosa e traz a morte"
    if (tipoPar === 'seita') return f.cls === 'esq90' ? 2 : 1;            // exemplo de Paulo: Sol em quadratura à esquerda de Marte, "crise que traz a morte"
    return 1;                                                            // Horóscopo com maléfico
  };
  const caminhar = (w, t, tipoPar, notaPar) => {
    if (pos[t] === null) return;
    DV_FIGURAS_CRISE.forEach(f => {
      const nivel = nivelDa(tipoPar, f);
      const nota = [f.nota, nivel ? notaPar : ''].filter(Boolean).join('; ');
      somar(w, t, norm(pos[t] + f.off), f.nome, nivel, nota);
    });
  };
  // o par da seita: de dia o Sol com Marte; de noite a Lua com Saturno
  if (isDia) caminhar('Sun', 'Mars', 'seita', 'crise perigosa de dia');
  else caminhar('Moon', 'Saturn', 'seita', 'crise assustadora de noite');
  // cap. 35, último parágrafo: Saturno, Marte ou o Sol em quadratura à esquerda de uma luz que caminha é crise perigosa (sem separar dia de noite)
  ['Sun', 'Moon'].forEach(w => ['Mars', 'Saturn'].forEach(t => {
    const jaTem = (isDia && w === 'Sun' && t === 'Mars') || (!isDia && w === 'Moon' && t === 'Saturn');
    if (!jaTem && pos[t] !== null) somar(w, t, norm(pos[t] + 90), 'quadratura à esquerda', 1, 'a mais perigosa; cap. 35');
  }));
  // o Sol com a Lua e a Lua com o Sol
  caminhar('Sun', 'Moon', 'luzes', 'perigosa e traz a morte');
  caminhar('Moon', 'Sun', 'luzes', 'perigo de morte');
  // o Horóscopo, só com os raios dos maléficos
  caminhar('Asc', 'Mars', 'asc', '');
  caminhar('Asc', 'Saturn', 'asc', '');
  // as luzes com os nodos: conjunção ou oposição
  ['Sun', 'Moon'].forEach(w => {
    if (pos.NodeN === null) return;
    somar(w, 'NodeN', pos.NodeN, 'conjunção com o nodo ascendente', 1, '');
    somar(w, 'NodeS', norm(pos.NodeN + 180), 'conjunção com o nodo descendente', 1, '');
  });
  // laço da Lua (cap. 35)
  [0, 60, 90, 120, 180, 240, 270, 300].forEach(off => {
    const ponto = norm(pos.Sun + off), falta = norm(ponto - pos.Moon);
    if (falta > 0 && falta <= 5) somar('Moon', 'Sun', ponto, 'dissolução do laço da Lua', 1, 'o laço se desfaz');
  });
  return crises.sort((a, b) => a.anos - b.anos);
}

/* Duração da vida (Paulo, cap. 36): o resultado numa parte; a parte dos cálculos em outra, toda à vista (pontos de partida, candidatos, contas,
   lugares de negócio e quem testemunha), pra decidir cada escolha do texto. */
function dvIconePonto(f, tam) {
  return f.tipo === 'luz' ? fvPlaneta(f.id, tam)
    : f.tipo === 'sizigia' ? fvSizigia(tam)
    : f.tipo === 'fortuna' ? ((typeof getLotIconSVG === 'function') ? getLotIconSVG('fortune', tam) : '')
    : f.tipo === 'espirito' ? ((typeof getLotIconSVG === 'function') ? getLotIconSVG('spirit', tam) : '') : '';
}
function dvBlocoDuracao(r) {
  if (!r) return { resultado: '<div class="texto-apagado" style="font-size:12px;">Sem dados suficientes para a duração da vida.</div>', calculos: '' };
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
        ? `<strong>${r.base.anos} anos</strong> <span class="texto-apagado">(${r.base.motivo})</span>`
        : `<strong>${fvFmtAnos(r.base.anos)}</strong> <span class="texto-apagado">(anos menores, ${r.base.n} anos, ${r.base.n} meses, ${r.base.n} dias e ${r.base.n} horas: ${r.base.motivo})</span>`}</div>
      ${r.semTroca ? `<div class="texto-apagado" style="font-size:11.5px; margin:-4px 0 10px;">Sem essa relação, o senhor daria ${fvFmtAnos(r.semTroca.anosSenhor)} e, somadas as testemunhas, o total seria ${fvFmtAnos(r.semTroca.total)}.</div>` : ''}
      <span class="rotulo">Quem testemunha o senhor</span>
      <div style="margin-top:3px;">${r.trocaLuz ? '<div class="texto-apagado" style="font-size:12px;">Não se somam: com o Sol ou a Lua em relação com o senhor, a conta já está completa.</div>' : (r.testemunhas.length ? r.testemunhas.map(t => `
        <div style="${FV_LINHA} flex-wrap:wrap; font-size:13px; padding:3px 0;">${fvPlaneta(t.id, 22)}
          <strong style="color:${t.efeito < 0 ? 'var(--terracota)' : 'inherit'};">${t.efeito > 0 ? '+' : (t.efeito < 0 ? '−' : '')}${Math.abs(t.efeito)} anos</strong>
          <span class="texto-apagado" style="font-size:11.5px;">${t.figura}, casa ${t.casa}: ${t.motivo}</span>
        </div>`).join('') : `<div class="texto-apagado" style="font-size:12px;">Ninguém${(S.id === 'Sun' || S.id === 'Moon') ? ' (o senhor é uma das luzes: valem só os anos dela)' : ''}.</div>`)}</div>
    </div>`;

  // ---- cálculos ----
  const lugares = `
    <div class="cartao" style="margin-top:10px;">
      <span class="rotulo">Lugares de negócio (${r.isDia ? 'nascimento diurno' : 'nascimento noturno'})</span>
      <div style="font-size:12.5px; line-height:1.9; margin-top:3px;">${r.lugaresInfo.map(l => `
        <div>${l.entra ? '<strong>casa ' + l.casa + '</strong>' : '<span class="texto-apagado">casa ' + l.casa + '</span>'} · ${l.nome}${l.nota ? ` <span class="texto-apagado">(${l.nota})</span>` : ''}</div>`).join('')}</div>
      <div class="texto-apagado" style="font-size:11.5px; margin-top:6px;">O "signo que se põe sobre o Descendente" é o da casa ${DV_LUGAR_SE_POE}: o que está acima do horizonte descendo sobre ele.</div>
    </div>`;
  const pontos = r.avaliacao.map(av => {
    const f = av.fonte;
    const cabeca = `<div style="${FV_LINHA} font-size:13px; flex-wrap:wrap;">${dvIconePonto(f, 22)} <strong>${f.tipo === 'luz' ? '' : DV_PONTO_NOME[f.tipo]}</strong> <span>em</span> ${fvSigno(Math.floor(f.abs / 30) % 12, 20)} <span>${Math.floor(f.abs % 30)}°</span></div>`;
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
      Regras aplicadas: o vencedor é quem soma mais entre as contas de dignidade no ponto e as marcas do texto (no pivô, nascer matutino, no próprio trono, olha a luz da seita). Casa boa = nem cadente nem sob os raios do Sol (menos de 15°). Testemunhar = conjunção (mesmo signo) ou aspecto de signos inteiros (sextil, quadratura, trígono, oposição), sem direção. Saturno e Marte somam se estão em casa (domicílio) e tiram se estão fora. Vênus, Júpiter e Mercúrio cadentes ou sob os raios não contam. Sol ou Lua em relação com o senhor (se os dois, o luminar da seita): a conta fecha nos anos dele (120 ou 108), sem somar testemunhas; as testemunhas só somam quando o senhor é um dos cinco planetas e nenhuma luz tem relação com ele. "Subtrativo em números" não é calculado.<br><br>Crises, como no capítulo 34: o Sol e a Lua caminham do grau em que nasceram, e o Horóscopo só com os maléficos (pelos tempos de ascensão dos signos, divididos igualmente pelos 30 graus, como no exemplo de Paulo). Os pares que o texto nomeia: de dia o Sol com Marte, de noite a Lua com Saturno, uma luz com um nodo, e o Sol com a Lua. Os outros pares com maléfico o texto não nomeia. Esquerda é o raio lançado para a frente do astro (grau + 60° ou + 90°), como no exemplo de Paulo (Sol em Escorpião e Marte em Leão, quadrado à esquerda); direita é para trás. "Traz a morte" só no Sol com a Lua e no Sol de dia em quadratura à esquerda de Marte (o exemplo de Paulo); o resto que faz mal é "perigosa". Segura: trígono, e sextil e quadratura à direita.</div>`;
  return {
    resultado,
    calculos: `<h3 class="titulo-secao">Cálculos</h3>
    ${lugares}${pontos}
    ${notas.map(n => `<div class="texto-apagado" style="font-size:11.5px; margin-top:8px;">${n}</div>`).join('')}${regras}`
  };
}

/* Rodapé: o que Paulo diz sobre o anareta (o destruidor), pra olhar na Circumambulação. Caps. 34 e 35 da Introdução (tradução de Schmidt/Hand). */
function dvNotaAnareta() {
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


/* Ícones de quem caminha e de quem é encontrado */
function dvIconeAndarilho(k) {
  return k === 'Asc' ? '<span style="font-size:10.5px; font-weight:800; color:var(--terracota);">ASC</span>' : fvPlaneta(k, 20);
}
function dvIconeAlvo(k) {
  if (k === 'NodeN') return (typeof getIconeSVG === 'function') ? getIconeSVG('outro', 'northNode', 20) : '☊';
  if (k === 'NodeS') return (typeof getIconeSVG === 'function') ? getIconeSVG('outro', 'southNode', 20) : '☋';
  return fvPlaneta(k, 20);
}
const DV_NIVEL_TXT = ['segura', 'perigosa', 'traz a morte'];
function dvBolinha(nivel, extra) {
  const tam = nivel === 0 ? 10 : 14, cor = nivel === 0 ? 'var(--azul-egipcio-claro)' : 'var(--terracota)';
  return `<span style="display:inline-block; width:${tam}px; height:${tam}px; border:2px solid ${cor}; box-sizing:border-box; border-radius:50%; background:${nivel === 2 ? cor : 'transparent'}; ${extra || ''}"></span>`;
}
// A barra da duração (porcentagem, cor mudando, x/y anos) com as bolinhas das crises em cima, nas idades em que acontecem
function dvBarraComCrises(r, crises, nascimento, hoje) {
  const total = r.total, idade = Math.max(0, (hoje - nascimento) / (365.25 * 86400000));
  const f = Math.max(0, Math.min(1, idade / total)), cor = corDoTempo(f);
  const pct = f >= 1 ? 100 : Math.floor(f * 100);
  const inteiro = Math.round(total);
  const bolas = crises.map((c, i) => {
    const x = Math.min(100, (c.anos / total) * 100);
    const num = (c.nivel >= 1) ? `<span style="position:absolute; left:${x}%; ${i % 2 ? 'top:calc(100% + 9px)' : 'bottom:calc(100% + 9px)'}; transform:translateX(-50%); font-size:9.5px; font-weight:700; color:var(--terracota);">${Math.floor(c.anos)}</span>` : '';
    return `<div title="${Math.floor(c.anos)} anos" style="position:absolute; left:${x}%; top:50%; transform:translate(-50%,-50%);">${dvBolinha(c.nivel)}</div>${num}`;
  }).join('');
  return `<div style="display:flex; align-items:center; gap:8px; margin:34px 0 36px;">
    <span style="min-width:34px; text-align:right; font-size:11px; font-weight:700; line-height:1; color:${cor};">${pct}%</span>
    <div style="position:relative; flex:1; height:5px; border:1px solid ${cor}; box-sizing:content-box;"><div style="height:100%; width:${(f * 100).toFixed(2)}%; background:${cor};"></div>${bolas}</div>
    <span style="font-size:11px; white-space:nowrap; line-height:1; color:${cor};">${Math.floor(idade)}/${inteiro} anos</span>
  </div>`;
}
function dvListaCrises(crises) {
  if (!crises.length) return '<div class="texto-apagado" style="font-size:12px;">Nenhum contato com maléfico, luz ou nodo dentro da duração.</div>';
  // cada linha quebra em duas no celular (flex-wrap), em vez de cortar
  return crises.map(c => `
    <div style="display:flex; flex-wrap:wrap; gap:4px 10px; align-items:center; padding:7px 0; border-top:var(--contorno-fino) solid var(--azul-egipcio-claro); font-size:12.5px;">
      <span style="display:flex; align-items:center; gap:10px; flex:none;">
        <span style="width:22px; display:flex; justify-content:center;">${dvBolinha(c.nivel)}</span>
        <span style="font-weight:700;">${fvFmtAnos(c.anos)}</span>
      </span>
      <span style="display:flex; align-items:center; gap:8px; flex:none;">${dvIconeAndarilho(c.andarilho)} <span>×</span> ${dvIconeAlvo(c.alvo)}</span>
      <span style="flex:1 1 200px; min-width:0;">${c.figura}${c.nota ? ` <span class="texto-apagado">(${c.nota})</span>` : ''}</span>
      <span style="font-weight:700; white-space:nowrap; margin-left:auto; color:${c.nivel ? 'var(--terracota)' : 'var(--azul-egipcio-claro)'};">${DV_NIVEL_TXT[c.nivel]}</span>
    </div>`).join('');
}

function iniciarModuloDuracaoVida() {
  const container = document.getElementById('mandala-container');
  if (!container) return;
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para ver a Duração da Vida.</div>`;
    return;
  }
  renderDuracaoVidaUI(container);
}

function renderDuracaoVidaUI(container) {
  const nascimento = new Date(currentMoment);
  const hoje = new Date();
  const r = dvCalcular({ dados: currentCalculatedData, nascimento });
  const bloco = dvBlocoDuracao(r);
  const lat = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lat !== undefined) ? currentGeo.lat : -23.5505;
  const crises = r ? dvCrises(currentCalculatedData, lat, r.total) : [];
  const barra = (r && r.data) ? dvBarraComCrises(r, crises, nascimento, hoje) : '';
  const legenda = `<div class="texto-apagado" style="font-size:11.5px;">Os números são as idades. <span style="display:inline-flex; align-items:center; gap:4px;">${dvBolinha(2)} traz a morte</span> · <span style="display:inline-flex; align-items:center; gap:4px;">${dvBolinha(1)} perigosa</span> · <span style="display:inline-flex; align-items:center; gap:4px;">${dvBolinha(0)} segura</span></div>`;
  const svgGaleria = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  const svgRelatorio = '<svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';
  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column;">
      <div id="duracao-vida-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Duração da Vida</h3><div class="acoes-ferramenta">
          <button type="button" onclick="salvarDuracaoVidaNaGaleria()" title="Salvar a Duração da Vida como imagem na galeria (com título e cabeçalho)" class="botao-icone">${svgGaleria}</button>
          <div style="position: relative; flex-shrink: 0;">
            <button type="button" onclick="const m=document.getElementById('dvMenuRelatorio'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Adicionar ao Relatório" class="botao-icone">${svgRelatorio}</button>
            <div id="dvMenuRelatorio" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; min-width: 260px;">
              <div class="item-menu" onclick="capturarDuracaoVidaParaRelatorio('inteira')">Ferramenta inteira (sem cabeçalho)</div>
              <div class="item-menu" onclick="capturarDuracaoVidaParaRelatorio('resultado')">Só o resultado (sem os cálculos)</div>
            </div>
          </div>
        </div></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        ${(typeof montarCabecalhoMandalaImagemHTML === 'function') ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}

        <div id="duracaoVidaResultsArea">
        <hr class="divisa">
        <div id="dvParteResultado">
        <h3 class="titulo-secao">Duração da vida</h3>
        <div class="texto-apagado" style="font-size:11.5px;">Paulo de Alexandria, Introdução, capítulo 36 (oikodespoteia). Só a duração, sem o destruidor.</div>
        ${barra}
        ${bloco.resultado}
        <h3 class="titulo-secao" style="margin-top:20px;">Crises no caminho</h3>
        <div class="texto-apagado" style="font-size:11.5px;">O Sol, a Lua e o Horóscopo caminhando ao mesmo tempo, pelos tempos de ascensão. Paulo, capítulos 34 e 35.</div>
        ${legenda}
        <div style="margin-top:10px;">${dvListaCrises(crises)}</div>
        </div>
        ${bloco.calculos ? `<hr class="divisa"><div id="dvParteCalculos">${bloco.calculos}</div>` : ''}
        </div>
        <div style="margin-top:18px;">${dvNotaAnareta()}</div>
        <hr class="divisa-fim">
      </div>
    </div>`;
}

/* Botão de galeria: título + cabeçalho padrão + resultados, SÓ AO TOCAR (mesmo padrão da Fases da Vida). */
function salvarDuracaoVidaNaGaleria() {
  const area = document.getElementById('duracaoVidaResultsArea');
  if (!area) return;
  capturarESalvarNaGaleria(
    () => gerarImagemHtmlComCabecalho(area, { titulo: 'DURAÇÃO DA VIDA', comCabecalho: true, papiro: true }),
    `Astro_Hellenic_Duracao_da_Vida_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
if (typeof window !== 'undefined') window.salvarDuracaoVidaNaGaleria = salvarDuracaoVidaNaGaleria;

/* Manda pro Relatório SÓ os resultados (sem título nem cabeçalho): a ferramenta inteira ou só o resultado, sem os cálculos. */
const DV_PARTES_RELATORIO = {
  inteira: { id: 'duracaoVidaResultsArea', nome: 'Duração da Vida' },
  resultado: { id: 'dvParteResultado', nome: 'Duração da Vida: resultado' }
};
async function capturarDuracaoVidaParaRelatorio(parte) {
  const menu = document.getElementById('dvMenuRelatorio');
  if (menu) menu.style.display = 'none';
  const def = DV_PARTES_RELATORIO[parte] || DV_PARTES_RELATORIO.inteira;
  const area = document.getElementById(def.id);
  if (!area) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  try {
    const papiro = window.temaMandala === 'ceu';
    const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : fundoPainelClaro());   // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('duracaoVida', canvas.toDataURL('image/png'));
    alert(`"${def.nome}" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar a Duração da Vida ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
if (typeof window !== 'undefined') window.capturarDuracaoVidaParaRelatorio = capturarDuracaoVidaParaRelatorio;
