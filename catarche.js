/* ==========================================
   CATARCHÉ (astrologia dos começos) — FERRAMENTA DE TESTE
   Fontes: Doroteu, Carmen Astrologicum V (V.2 a V.5 e V.33); Hefestião, Apotelesmatika III (III.1, III.2, III.37, III.38); Valens, Antologias I.2.
   A ferramenta NÃO prevê: mostra o que o texto antigo diz sobre o que o mapa tem, com autor e capítulo. Onde o texto não dá resposta,
   a ferramenta não decide (nada de pontuação ou desempate inventado). Onde Doroteu (via árabe) e Hefestião (grego) divergem, vale Hefestião.

   Regras gerais: casas por signos inteiros, zodíaco tropical; conjunção e aspecto por SIGNO (mesmo signo = junto), sem grau e sem orbe.
   Só a luz da Lua (crescendo/diminuindo em luz) conta por grau exato, porque é distância e não aspecto (Hefestião III.38).
   Não entram, de propósito: mansões lunares, mapa radical, considerações antes do julgamento, astrologia horária como ramo.

   Divisão do arquivo:
   1) cálculo (sem tela, roda em Node: ver module.exports no fim) — ctCalcular() devolve uma lista de indicadores. Cada indicador tem
      etiqueta (a favor / contra / neutro / sem lado), uma leitura do texto, a fonte e linhas { tem, leitura, fonte }.
      Os textos moram em CT_TEXTOS (trocar a redação não mexe no cálculo). Nos textos, {P:Moon} e {S:3} viram ícone de planeta / de signo
      na tela e nome em texto puro; {L1} e {L2} são os nomes dos dois lados da disputa.
   2) tela (iniciarModuloCatarche)

   Fica pra versão 2: senhores do dia e da hora (Balchus, Olimpiodoro), planeta sem testemunho (Hefestião III.7), tempo pela Lua no
   sétimo dia e pela Fortuna (Balchus), as corrupções que pedem posição em grau (fim do signo, de 15° de Libra a 15° de Escorpião,
   Lua lenta) e, na Disputa (Doroteu V.33), as regras que pedem planeta oriental, dignidades ou a Fortuna no 4º e no 10º.
   ========================================== */

const CT_SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

const CT_PLANETAS = {
  Sun:     { nome: 'Sol',      chave: 'Sol' },
  Moon:    { nome: 'Lua',      chave: 'Lua' },
  Mercury: { nome: 'Mercúrio', chave: 'Mercúrio' },
  Venus:   { nome: 'Vênus',    chave: 'Vênus' },
  Mars:    { nome: 'Marte',    chave: 'Marte' },
  Jupiter: { nome: 'Júpiter',  chave: 'Júpiter' },
  Saturn:  { nome: 'Saturno',  chave: 'Saturno' }
};
const CT_BENEFICOS = ['Jupiter', 'Venus'];
const CT_MALEFICOS = ['Mars', 'Saturn'];
/* Senhor do signo (domicílio) */
const CT_DOMICILIO = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
/* símbolo do planeta na tabela de termos do site (mandala.js: EGYPTIAN_TERMS) → id */
const CT_SIMBOLO_TERMO = { '♃': 'Jupiter', '♀': 'Venus', '☿': 'Mercury', '♂': 'Mars', '♄': 'Saturn' };

/* Assuntos: o quadro "Uso em consulta" do estudo (capítulo de Hefestião III e de Doroteu V a abrir). `soComeco`: só faz sentido para quem vai começar algo. */
const CT_ASSUNTOS = [
  { id: 'geral',      nome: 'Escolher o momento em geral', hef: 'III.1, III.2',    dor: 'V.1 a V.5', soComeco: true },
  { id: 'casamento',  nome: 'Casamento',                   hef: 'III.9',           dor: 'V.16' },
  { id: 'viagem',     nome: 'Viagem e volta',              hef: 'III.30',          dor: 'V.21, V.22, V.25 (pôr um navio na água)' },
  { id: 'navio',      nome: 'Navio',                       hef: 'III.17',          dor: 'V.23' },
  { id: 'compra',     nome: 'Compra e venda',              hef: 'III.16',          dor: 'V.9, V.10, V.11, V.43' },
  { id: 'construir',  nome: 'Construir e fundar',          hef: 'III.7',           dor: 'V.6' },
  { id: 'divida',     nome: 'Dívida',                      hef: 'III.28',          dor: 'V.20' },
  { id: 'cartas',     nome: 'Cartas',                      hef: 'III.27',          dor: 'V.15' },
  { id: 'favor',      nome: 'Pedir um favor',              hef: 'III.25',          dor: 'V.14' },
  { id: 'doenca',     nome: 'Doença',                      hef: 'III.31',          dor: 'V.29, V.31' },
  { id: 'cirurgia',   nome: 'Cirurgia',                    hef: 'III.32',          dor: 'V.39, V.40' },
  { id: 'tribunal',   nome: 'Tribunal (disputa, vitória e derrota)', hef: 'III.37, III.38', dor: 'V.33' },
  { id: 'prisao',     nome: 'Prisão',                      hef: 'III.40',          dor: 'V.27' },
  { id: 'perdida',    nome: 'Coisa perdida ou roubada',    hef: 'III.42 a III.46', dor: 'V.35' },
  { id: 'fugitivo',   nome: 'Fugitivo',                    hef: 'III.47',          dor: 'V.36' }
];

/* Textos (leituras e fontes). Tudo vem dos autores; nada aqui é interpretação nova. */
const CT_TEXTOS = {
  avisoTribunal: 'Hefestião trata de tribunal; aplicar a outra disputa (como uma eleição) é uma extensão.',
  // 1. Horóscopo: reto ou oblíquo (Doroteu V.2; Hefestião III.1, que vale onde diverge)
  fonteRetoObliquo: 'Doroteu V.2, Hefestião III.1',
  retoLivre: 'Reto sem prejuízo: a coisa se cumpre sem impedimento.',
  retoPrejudicado: 'Reto com maléfico no signo ou em aspecto: andamento lento, com miséria e infortúnio.',
  obliquoSemBenefico: 'Oblíquo sem testemunho de benéfico: coisa difícil e demorada.',
  obliquoComBenefico: 'Oblíquo com benéfico no signo ou em aspecto: ajuda a levar a ação a bom termo.',
  retoObliquoMisto: 'Benéficos e maléficos no signo ou em aspecto: resultado misto, bom e ruim.',
  // 2. grupo do signo do Horóscopo (Doroteu V.3 e V.4; os quatro cardeais são tropicais)
  fonteGrupo: 'Doroteu V.3 e V.4',
  grupo: {
    tropical:   'Tropical: atividade curta, a ação pode parar antes de acabar e precisar ser refeita.',
    bicorporeo: 'Bicorpóreo: complicação, surge uma condição extra a resolver antes do fim.',
    solido:     'Sólido: estabilidade, são os que Doroteu manda subir no começo.'
  },
  fonteGrupoTribunal: 'Hefestião III.37, Doroteu V.33',
  grupoTribunal: {
    tropical:   'Tropical: a coisa não chega ao fim.',
    bicorporeo: 'Bicorpóreo: quem iniciou muda de ideia.',
    solido:     'Sólido: há demora, e quem persegue o caso não cede.'
  },
  grupoDisputa: {
    tropical:   'Tropical: a coisa não chega ao fim.',
    bicorporeo: 'Bicorpóreo: {L1} muda de ideia.',
    solido:     'Sólido: há demora, e {L1} não cede.'
  },
  // 3. Lua
  fonteLuz: 'Hefestião III.38',
  fonteLuaSol: 'Doroteu V.5',
  luaComSol: 'Lua no mesmo signo do Sol: fica escondida pela luz dele. Favorece ações secretas.',
  luaComSolCrescendo: ' Sobretudo agora, que já está crescendo em luz, saindo dos raios.',
  luaOpostaSol: 'Lua no signo oposto ao do Sol: indica brigas.',
  luaOpostaSolDisputa: 'Lua no signo oposto ao do Sol: sinal de brigas, e o mais novo dos dois vence.',
  fonteSenhor: 'Doroteu V.5, citado em Hefestião III.2',
  senhorIntro: 'O começo pertence à Lua e a realização ao senhor do signo dela.',
  senhorBemMal: 'Lua em ângulo e senhor dela cadente: a coisa começa bem e termina improdutiva.',
  senhorMalBem: 'Lua cadente e senhor dela em ângulo: a coisa começa mal e termina produtiva.',
  fonteCorrupcao: 'Doroteu V.5, Hefestião III.1',
  corrupcao: 'Lua corrompida. Doroteu manda não começar nada com a Lua corrompida.',
  corrupcaoPergunta: 'Lua corrompida.',
  corrupcaoDisputa: 'Lua corrompida: pesa contra {Lx}, o lado que a Lua representa.',
  remedio: 'Se a coisa não pode esperar, Júpiter ou Vênus no Horóscopo ou no Meio-do-Céu ajudam.',
  fonteNodos: 'Doroteu V.5, Hefestião III.1',
  nodosComeco: 'Corrupção da Lua por eclipse: Doroteu manda não começar nada com a Lua corrompida. Evitar começar.',
  // 4. ângulos (Hefestião III.37 e III.38; Doroteu V.33)
  fonteTribunal: 'Hefestião III.37 e III.38',
  fonteDisputa: 'Hefestião III.37, Doroteu V.33',
  tribunalPapel: { 1: 'quem acusa', 10: 'o juiz', 7: 'o acusado', 4: 'o resultado' },
  tribunalMC:  { ben: 'Benéfico no Meio-do-Céu: juiz justo.',     mal: 'Maléfico no Meio-do-Céu: juiz injusto.' },
  tribunalOcaso: { ben: 'Benéfico no ocaso: vitória do acusado.' },
  tribunalSub: { ben: 'Benéfico no lugar subterrâneo: sentença justa.', mal: 'Maléfico no lugar subterrâneo: sentença injusta.' },
  tribunalCrescendo:  'Lua crescendo em luz: a Lua faz o papel de quem persegue e o Sol o de quem é acusado.',
  tribunalDiminuindo: 'Lua diminuindo em luz: o Sol faz o papel de quem persegue e a Lua o de quem é acusado.',
  tribunalVence: 'Vence quem estiver mais bem colocado em lugar, limite, testemunho de benéficos e hemisfério acima da Terra.',
  // Disputa (tribunal + pergunta)
  mcJusto: 'Benéfico no Meio-do-Céu: juiz justo.',
  mcInjusto: 'Maléfico no Meio-do-Céu: juiz injusto.',
  mcSegundoJuiz: 'Maléfico no Meio-do-Céu ou em aspecto com ele: a briga não termina e vai a um segundo juiz.',
  ocasoVitoria: 'Benéfico no ocaso: vitória de {L2}.',
  ocasoMiseria: 'Maléfico no ocaso ou em aspecto com ele: miséria e infortúnio para {L2}.',
  subInjusta: 'Maléfico no lugar subterrâneo: sentença injusta contra {L2}.',
  subJusta: 'Benéfico no lugar subterrâneo: sentença justa.',
  luzCrescendo: 'A Lua, crescendo em luz, faz o papel de quem persegue: {L1}. O Sol faz o do outro: {L2}.',
  luzDiminuindo: 'A Lua, diminuindo em luz, faz o papel do outro: {L2}. O Sol faz o de quem persegue: {L1}.',
  fonteComparacao: 'Hefestião III.38, Doroteu V.33',
  comparacaoNota: 'O texto não dá peso a cada fator: a ferramenta mostra os fatos e não decide quem vence.',
  aspectoMaisPerto: 'Quem tem o aspecto mais próximo do Ascendente é o mais forte, e dele é o êxito.',
  marteHoroscopo: 'Marte no Horóscopo ou em aspecto com ele: vergonha e aflição para {L1}, que começou a briga.',
  saturnoHoroscopo: 'Saturno no Horóscopo ou em aspecto com ele: miséria para {L1} por causa da briga.',
  fonteV33: 'Doroteu V.33',
  fortunaLado1: 'Fortuna no Horóscopo ou no 2º signo: o êxito é de {L1}.',
  fortunaLado2: 'Fortuna no 7º ou no 8º signo: o êxito é de {L2}.',
  juizLado1: 'O juiz ajuda {L1} e fica do lado dele.',
  juizLado2: 'A simpatia e a ajuda do juiz são para {L2}.',
  oposicaoSolLua: 'Lua em oposição ao Sol: sinal de brigas, e o mais novo dos dois vence.'
};

/* ---------- geometria básica por signos inteiros ---------- */
function ctNorm360(x) { return ((x % 360) + 360) % 360; }
function ctSignoDe(lon) { return Math.floor(ctNorm360(lon) / 30) % 12; }
/* casa (1 a 12) de um signo, com o signo do Ascendente como casa 1 */
function ctCasaDoSigno(signo, signoAsc) { return ((signo - signoAsc + 12) % 12) + 1; }
function ctTipoCasa(casa) { return [1, 4, 7, 10].includes(casa) ? 'angular' : ([3, 6, 9, 12].includes(casa) ? 'cadente' : 'sucedente'); }
/* distância em signos entre dois signos (0 a 6) */
function ctDistSignos(a, b) { const d = ((a - b) % 12 + 12) % 12; return Math.min(d, 12 - d); }
/* só conjunção (0), sextil (2), quadratura (3), trígono (4) e oposição (6) são aspecto; 1 e 5 são aversão */
const CT_ASPECTO_POR_DIST = { 0: 'junto', 2: 'em sextil', 3: 'em quadratura', 4: 'em trígono', 6: 'em oposição' };
/* o signo `a` está junto ou em aspecto com o signo `b` */
function ctJuntoOuAspecto(a, b) { return !!CT_ASPECTO_POR_DIST[ctDistSignos(a, b)]; }
/* só aspecto (sem estar junto) */
function ctSoAspecto(a, b) { const d = ctDistSignos(a, b); return d !== 0 && !!CT_ASPECTO_POR_DIST[d]; }

function ctPlanetasNoSigno(pos, signo, ids) { return ids.filter(id => ctSignoDe(pos[id]) === signo); }
/* quem de `ids` está junto ou em aspecto com o signo */
function ctComAspecto(pos, signo, ids) { return ids.filter(id => ctJuntoOuAspecto(ctSignoDe(pos[id]), signo)); }

/* quem de `ids` testemunha o signo (junto ou em aspecto, por signo): [{ id, como }] */
function ctTestemunhas(pos, signo, ids) {
  const lista = [];
  ids.forEach(id => { const d = ctDistSignos(ctSignoDe(pos[id]), signo); if (CT_ASPECTO_POR_DIST[d]) lista.push({ id, como: CT_ASPECTO_POR_DIST[d] }); });
  return lista;
}

/* tempo de ascensão de cada signo na latitude (em graus de ascensão), por ascensão oblíqua exata.
   `oa(lonEclipticaGraus, latGraus)` = calcularAscensaoObliqua (direcoes.js), injetada. */
function ctTemposAscensao(lat, oa) {
  const tempos = [];
  for (let s = 0; s < 12; s++) tempos.push(ctNorm360(oa(30 * (s + 1), lat) - oa(30 * s, lat)));
  return tempos;
}

/* Reto (de ascensão longa) ou oblíquo (Doroteu V.2, Hefestião III.1): ascensão exata na latitude do mapa, SEM comparar com 30°.
   Cada signo é comparado com o signo oposto (Áries x Libra, Touro x Escorpião, Gêmeos x Sagitário, Câncer x Capricórnio, Leão x Aquário,
   Virgem x Peixes): o que leva mais tempo para nascer é reto e o outro é oblíquo. Dá sempre seis e seis. No norte bate com a lista de
   Doroteu (reto de Câncer a Sagitário) e no sul inverte sozinho. Só no equador exato (os dois tempos iguais) não há o que comparar:
   vale a lista do norte. `tempos` = ctTemposAscensao(). */
function ctSignoReto(lat, signo, tempos) {
  const dif = tempos[signo] - tempos[(signo + 6) % 12];
  if (Math.abs(dif) < 1e-9) return signo >= 3 && signo <= 8;
  return dif > 0;
}

/* 'tropical' (os quatro cardeais: Áries, Câncer, Libra, Capricórnio), 'solido' (fixos) ou 'bicorporeo' */
function ctGrupoDoSigno(signo) { return ['tropical', 'solido', 'bicorporeo'][signo % 3]; }
const CT_GRUPO_NOME = { tropical: 'tropical', solido: 'sólido', bicorporeo: 'bicorpóreo' };

/* luz da Lua, por grau exato: elongação = Lua − Sol (0 a 360); de 0 a 180 cresce em luz, de 180 a 360 diminui. Sempre uma das duas. */
function ctLuzDaLua(lonSol, lonLua) {
  const e = ctNorm360(lonLua - lonSol);
  return { elongacao: e, crescendo: e < 180 };
}

/* duodécima parte (dodecatemória): começo do signo + 12 × o grau dentro do signo */
function ctDuodecima(lon) { return ctNorm360(Math.floor(ctNorm360(lon) / 30) * 30 + (ctNorm360(lon) % 30) * 12); }

/* senhor do termo egípcio onde a longitude cai (tabela do site, injetada); null se não houver tabela */
function ctTermoSenhor(lon, tabela) {
  if (!tabela) return null;
  const s = ctSignoDe(lon);
  const g = ctNorm360(lon) - s * 30;
  if (!tabela[s]) return null;
  const faixa = tabela[s].find(t => g < t.deg) || tabela[s][tabela[s].length - 1];
  return CT_SIMBOLO_TERMO[faixa.p] || null;
}

/* Fortuna: de dia Asc + Lua − Sol, de noite Asc + Sol − Lua (dia = Sol acima do horizonte, o mesmo critério do cabeçalho do mapa) */
function ctFortuna(asc, sol, lua) {
  const dia = ctNorm360(sol - asc) >= 180;
  return { dia, lon: ctNorm360(dia ? asc + lua - sol : asc + sol - lua) };
}

const CT_P = (id) => `{P:${id}}`;
const CT_S = (idx) => `{S:${idx}}`;
const CT_LISTA_P = (ids) => ids.length ? ids.map(CT_P).join(' ') : 'nenhum';

const CT_FAVOR = 'favor', CT_CONTRA = 'contra', CT_NEUTRO = 'neutro', CT_SEMLADO = 'semlado';
const ctEt = (t, lado) => ({ t, lado: lado || null });

/* o quanto a etiqueta pende para o lado 1 (disputa) ou a favor (resto): +1, 0 ou −1; serve só para achar "sinais mistos" */
function ctInclinacao(et, disputa) {
  if (et.t === CT_FAVOR) return disputa ? (et.lado === 1 ? 1 : -1) : 1;
  if (et.t === CT_CONTRA) return disputa ? (et.lado === 1 ? -1 : 1) : -1;
  return 0;
}

/* ---------- o cálculo ----------
   m = { asc (longitude do Ascendente), pos: { Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn }, nodo (nodo norte), lat }
   opcoes = { assunto (id de CT_ASSUNTOS), tipo ('comeco' | 'pergunta'), oa (função de ascensão oblíqua), termos (EGYPTIAN_TERMS),
              lado1, lado2 (nomes dos lados da disputa) } */
function ctCalcular(m, opcoes) {
  const assunto = CT_ASSUNTOS.find(a => a.id === opcoes.assunto) || CT_ASSUNTOS[0];
  const comeco = opcoes.tipo !== 'pergunta';
  const tribunal = assunto.id === 'tribunal';
  const disputa = tribunal && !comeco;                       // Disputa = tribunal lido como pergunta: dois lados
  const nomes = { L1: (opcoes.lado1 || '').trim() || 'Lado 1', L2: (opcoes.lado2 || '').trim() || 'Lado 2' };
  const pos = m.pos;
  const sAsc = ctSignoDe(m.asc);
  const signoDaCasa = (c) => (sAsc + c - 1) % 12;
  const sMC = signoDaCasa(10), s7 = signoDaCasa(7), s4 = signoDaCasa(4);
  const sLua = ctSignoDe(pos.Moon), sSol = ctSignoDe(pos.Sun);
  const luz = ctLuzDaLua(pos.Sun, pos.Moon);
  const ladoLua = luz.crescendo ? 1 : 2;                      // crescendo em luz, a Lua faz o papel de quem persegue (lado 1)
  const indicadores = [];
  const add = (id, titulo, ponto, etiqueta, linhas, extra) => {
    const l1 = linhas.find(l => l.leitura);
    indicadores.push({ id, titulo, ponto, etiqueta, leitura: l1 ? l1.leitura : null, linhas, extra: extra || null });
  };

  /* ---- Horóscopo: reto ou oblíquo ---- */
  const tempos = ctTemposAscensao(m.lat, opcoes.oa);
  const reto = ctSignoReto(m.lat, sAsc, tempos);
  const benHor = ctComAspecto(pos, sAsc, CT_BENEFICOS), malHor = ctComAspecto(pos, sAsc, CT_MALEFICOS);
  const addRetoObliquo = () => {
    const tem = `Horóscopo em ${CT_S(sAsc)}, signo ${reto ? 'reto' : 'oblíquo'} (sobe em ${tempos[sAsc].toFixed(1).replace('.', ',')}° de ascensão, contra ${tempos[(sAsc + 6) % 12].toFixed(1).replace('.', ',')}° do signo oposto, na latitude do mapa).`;
    let leitura, et;
    if (benHor.length && malHor.length) { leitura = CT_TEXTOS.retoObliquoMisto; et = ctEt(CT_NEUTRO); }
    else if (reto) { if (malHor.length) { leitura = CT_TEXTOS.retoPrejudicado; et = ctEt(CT_CONTRA, disputa ? 1 : null); } else { leitura = CT_TEXTOS.retoLivre; et = ctEt(CT_FAVOR, disputa ? 1 : null); } }
    else { if (benHor.length) { leitura = CT_TEXTOS.obliquoComBenefico; et = ctEt(CT_FAVOR, disputa ? 1 : null); } else { leitura = CT_TEXTOS.obliquoSemBenefico; et = ctEt(CT_CONTRA, disputa ? 1 : null); } }
    const linhas = [{ tem, leitura, fonte: CT_TEXTOS.fonteRetoObliquo, ativo: et.t === CT_CONTRA }];
    linhas.push({ tem: `Benéficos no signo ou em aspecto com ele: ${benHor.length ? benHor.map(id => `${CT_P(id)} ${CT_ASPECTO_POR_DIST[ctDistSignos(ctSignoDe(pos[id]), sAsc)]}`).join(', ') : 'nenhum'}. Maléficos: ${malHor.length ? malHor.map(id => `${CT_P(id)} ${CT_ASPECTO_POR_DIST[ctDistSignos(ctSignoDe(pos[id]), sAsc)]}`).join(', ') : 'nenhum'}.`, leitura: null, fonte: CT_TEXTOS.fonteRetoObliquo });
    add('horoscopo', disputa ? 'Horóscopo: reto ou oblíquo' : 'Signo do Horóscopo: reto ou oblíquo', 'horoscopo', et, linhas, { tempos, reto });
  };
  const addGrupo = () => {
    const g = ctGrupoDoSigno(sAsc);
    let linhas, et;
    if (disputa) {
      linhas = [{ tem: `Horóscopo em ${CT_S(sAsc)}, signo ${CT_GRUPO_NOME[g]}.`, leitura: CT_TEXTOS.grupoDisputa[g], fonte: CT_TEXTOS.fonteGrupoTribunal }];
      et = g === 'bicorporeo' ? ctEt(CT_CONTRA, 1) : ctEt(CT_NEUTRO);
    } else {
      linhas = [{ tem: `Horóscopo em ${CT_S(sAsc)}, signo ${CT_GRUPO_NOME[g]}.`, leitura: CT_TEXTOS.grupo[g], fonte: CT_TEXTOS.fonteGrupo }];
      if (tribunal) linhas.push({ tem: `Assunto tribunal, Horóscopo ${CT_GRUPO_NOME[g]}.`, leitura: CT_TEXTOS.grupoTribunal[g], fonte: CT_TEXTOS.fonteGrupoTribunal });
      et = g === 'solido' ? ctEt(CT_FAVOR) : ctEt(CT_CONTRA);
    }
    add('grupo', disputa ? 'Horóscopo: tipo do signo' : 'Grupo do signo do Horóscopo', 'horoscopo', et, linhas);
  };

  /* ---- Lua ---- */
  const dLuaSol = ctDistSignos(sLua, sSol);
  const addLuz = () => {
    const linhas = [{ tem: `Lua em ${CT_S(sLua)} e Sol em ${CT_S(sSol)}: a Lua está ${luz.crescendo ? 'crescendo' : 'diminuindo'} em luz.`, leitura: null, fonte: CT_TEXTOS.fonteLuz }];
    let et = ctEt(CT_NEUTRO);
    if (dLuaSol === 0) linhas.push({ tem: `Lua no mesmo signo do Sol (${CT_S(sSol)}).`, leitura: CT_TEXTOS.luaComSol + (luz.crescendo ? CT_TEXTOS.luaComSolCrescendo : ''), fonte: CT_TEXTOS.fonteLuaSol, ativo: true });
    else if (dLuaSol === 6) { linhas.push({ tem: `Lua no signo oposto ao do Sol (${CT_S(sLua)} e ${CT_S(sSol)}).`, leitura: CT_TEXTOS.luaOpostaSol, fonte: CT_TEXTOS.fonteLuaSol, ativo: true }); et = ctEt(CT_CONTRA); }
    else linhas.push({ tem: 'Lua nem no mesmo signo nem no signo oposto ao do Sol.', leitura: null, fonte: CT_TEXTOS.fonteLuaSol });
    add('luz', 'Luz da Lua', 'lua', et, linhas, { elongacao: luz.elongacao, crescendo: luz.crescendo });
  };
  const addSenhor = () => {
    const senhor = CT_DOMICILIO[sLua];
    const sSen = ctSignoDe(pos[senhor]);
    const cLua = ctCasaDoSigno(sLua, sAsc), cSen = ctCasaDoSigno(sSen, sAsc);
    const tLua = ctTipoCasa(cLua), tSen = ctTipoCasa(cSen);
    let leitura = CT_TEXTOS.senhorIntro, ativo = false;
    if (senhor !== 'Moon') {
      if (tLua === 'angular' && tSen === 'cadente') { leitura = CT_TEXTOS.senhorBemMal; ativo = true; }
      else if (tLua === 'cadente' && tSen === 'angular') { leitura = CT_TEXTOS.senhorMalBem; ativo = true; }
    }
    const tem = senhor === 'Moon'
      ? `Lua em ${CT_S(sLua)} (casa ${cLua}, ${tLua}); o senhor do signo é a própria Lua.`
      : `Lua em ${CT_S(sLua)} (casa ${cLua}, ${tLua}); senhor ${CT_P(senhor)} em ${CT_S(sSen)} (casa ${cSen}, ${tSen}).`;
    add('senhor', 'Senhor do signo da Lua', 'lua', ctEt(CT_NEUTRO), [{ tem, leitura, fonte: CT_TEXTOS.fonteSenhor, ativo }]);
  };
  /* corrupções da Lua, por signo: devolve as linhas e se alguma está ativa */
  const corrupcoes = () => {
    const linhas = [];
    const dodSigno = ctSignoDe(ctDuodecima(pos.Moon));
    const malDod = ctPlanetasNoSigno(pos, dodSigno, CT_MALEFICOS);
    linhas.push({ tem: `Duodécima parte da Lua em ${CT_S(dodSigno)}; ocupam esse signo: ${CT_LISTA_P(malDod)}.`, ativo: malDod.length > 0 });
    const malLua = [];
    CT_MALEFICOS.forEach(id => { const d = ctDistSignos(sLua, ctSignoDe(pos[id])); if ([0, 3, 6].includes(d)) malLua.push(`${CT_P(id)} ${CT_ASPECTO_POR_DIST[d]}`); });
    linhas.push({ tem: `Maléficos com a Lua (junto, quadratura ou oposição): ${malLua.length ? malLua.join(', ') : 'nenhum'}.`, ativo: malLua.length > 0 });
    const cLua = ctCasaDoSigno(sLua, sAsc);
    const c9 = cLua === 9 && ctGrupoDoSigno(sLua) === 'bicorporeo';
    linhas.push({ tem: `Lua na casa ${cLua}, em ${CT_S(sLua)}${c9 ? ' (casa 9 em signo bicorpóreo)' : ''}.`, ativo: c9 });
    return linhas;
  };
  const nodosDaLua = () => {
    const sN = ctSignoDe(m.nodo), sS = (sN + 6) % 12, sX = (sN + 9) % 12; // descendente = oposto; limite sul extremo = 90° depois do descendente
    let onde = null;
    if (sLua === sN) onde = 'sobre o nodo ascendente';
    else if (sLua === sS) onde = 'sobre o nodo descendente';
    else if (sLua === sX) onde = 'no limite sul extremo (90° depois do nodo descendente)';
    return { onde, sN, sS };
  };
  const addCorrupcoes = () => {
    const linhas = corrupcoes();
    const textoAtivo = comeco ? CT_TEXTOS.corrupcao : CT_TEXTOS.corrupcaoPergunta;
    linhas.forEach(l => { l.leitura = l.ativo ? textoAtivo : null; l.fonte = CT_TEXTOS.fonteCorrupcao; });
    const ativa = linhas.some(l => l.ativo);
    if (comeco && ativa) {
      const rem = [];
      CT_BENEFICOS.forEach(id => { const s = ctSignoDe(pos[id]); if (s === sAsc) rem.push(`${CT_P(id)} no Horóscopo`); if (s === sMC) rem.push(`${CT_P(id)} no Meio-do-Céu`); });
      linhas.push({ tem: `Remédio no mapa: ${rem.length ? rem.join(', ') : 'nenhum (Júpiter e Vênus fora do Horóscopo e do Meio-do-Céu)'}.`, leitura: CT_TEXTOS.remedio, fonte: CT_TEXTOS.fonteCorrupcao });
    }
    add('corrupcoes', 'Corrupções da Lua', 'lua', ativa ? ctEt(CT_CONTRA) : ctEt(CT_NEUTRO), linhas);
  };
  const addNodos = () => {
    const { onde, sN, sS } = nodosDaLua();
    let linha;
    if (comeco) linha = { tem: onde ? `Lua ${onde}, em ${CT_S(sLua)}.` : `Lua fora dos nodos e do limite sul extremo (nodo ascendente em ${CT_S(sN)}, descendente em ${CT_S(sS)}).`, leitura: onde ? CT_TEXTOS.nodosComeco : null, fonte: CT_TEXTOS.fonteNodos, ativo: !!onde };
    else linha = { tem: onde ? 'Lua nos nodos (corrupção)' : 'Lua fora dos nodos.', leitura: null, fonte: CT_TEXTOS.fonteNodos, ativo: !!onde };
    add('nodos', 'Nodos', 'lua', onde ? ctEt(CT_CONTRA) : ctEt(CT_NEUTRO), [linha]);
  };

  /* ---- ângulos (fora da Disputa) ---- */
  const addAngulos = () => {
    const ordem = [1, 10, 7, 4]; // Horóscopo, Meio-do-Céu, ocaso, subterrâneo
    const nome = { 1: 'Horóscopo', 10: 'Meio-do-Céu', 7: 'Ocaso', 4: 'Lugar subterrâneo' };
    const linhas = [];
    ordem.forEach(c => {
      const s = signoDaCasa(c);
      const ben = ctPlanetasNoSigno(pos, s, CT_BENEFICOS), mal = ctPlanetasNoSigno(pos, s, CT_MALEFICOS);
      let tem = `${nome[c]} (casa ${c}, ${CT_S(s)}): benéficos ${CT_LISTA_P(ben)}; maléficos ${CT_LISTA_P(mal)}.`;
      let leitura = null;
      if (tribunal) {
        tem = `${nome[c]}, ${CT_TEXTOS.tribunalPapel[c]} (casa ${c}, ${CT_S(s)}): benéficos ${CT_LISTA_P(ben)}; maléficos ${CT_LISTA_P(mal)}.`;
        const t = c === 10 ? CT_TEXTOS.tribunalMC : (c === 7 ? CT_TEXTOS.tribunalOcaso : (c === 4 ? CT_TEXTOS.tribunalSub : {}));
        const partes = [];
        if (ben.length && t.ben) partes.push(t.ben);
        if (mal.length && t.mal) partes.push(t.mal);
        leitura = partes.length ? partes.join(' ') : null;
      }
      linhas.push({ tem, leitura, fonte: tribunal ? CT_TEXTOS.fonteTribunal : null, ativo: !!leitura });
    });
    if (tribunal) {
      linhas.push({ tem: `Lua ${luz.crescendo ? 'crescendo' : 'diminuindo'} em luz.`, leitura: luz.crescendo ? CT_TEXTOS.tribunalCrescendo : CT_TEXTOS.tribunalDiminuindo, fonte: CT_TEXTOS.fonteTribunal });
      linhas.push({ tem: `Comparação. ${ctFichaLuminar(pos, 'Sun', sAsc, opcoes.termos)}. ${ctFichaLuminar(pos, 'Moon', sAsc, opcoes.termos)}.`, leitura: CT_TEXTOS.tribunalVence, fonte: CT_TEXTOS.fonteTribunal, nota: CT_TEXTOS.comparacaoNota });
    }
    add('angulos', tribunal ? 'Ângulos no tribunal' : 'Ângulos', 'angulos', tribunal ? ctEt(CT_SEMLADO) : ctEt(CT_NEUTRO), linhas);
  };

  /* ---- capítulo ---- */
  const addCapitulo = () => add('capitulo', 'Assunto e capítulo', 'capitulo', ctEt(CT_SEMLADO), [{ tem: `${assunto.nome}: abrir Hefestião III, ${assunto.hef}, e Doroteu V, ${assunto.dor}.`, leitura: null, fonte: 'Estudo, quadro "Uso em consulta"' }]);

  if (disputa) {
    /* ===== DISPUTA: tribunal lido como pergunta. Lado 1 = Horóscopo (quem acusa ou inicia); lado 2 = ocaso (o outro). ===== */
    addGrupo();
    addRetoObliquo();
    // 2. Meio-do-Céu = o juiz
    {
      const ben = ctPlanetasNoSigno(pos, sMC, CT_BENEFICOS), mal = ctPlanetasNoSigno(pos, sMC, CT_MALEFICOS);
      const malAsp = ctComAspecto(pos, sMC, CT_MALEFICOS);
      const linhas = [{ tem: `Meio-do-Céu, o juiz (casa 10, ${CT_S(sMC)}): benéficos ${CT_LISTA_P(ben)}; maléficos ${CT_LISTA_P(mal)}.`, leitura: [ben.length ? CT_TEXTOS.mcJusto : '', mal.length ? CT_TEXTOS.mcInjusto : ''].filter(Boolean).join(' ') || null, fonte: CT_TEXTOS.fonteDisputa, ativo: !!(ben.length || mal.length) }];
      if (malAsp.length) linhas.push({ tem: `Maléficos no Meio-do-Céu ou em aspecto com ele: ${malAsp.map(id => `${CT_P(id)} ${CT_ASPECTO_POR_DIST[ctDistSignos(ctSignoDe(pos[id]), sMC)]}`).join(', ')}.`, leitura: CT_TEXTOS.mcSegundoJuiz, fonte: CT_TEXTOS.fonteV33, ativo: true });
      add('mc', 'Meio-do-Céu: o juiz', 'mc', ctEt(CT_SEMLADO), linhas);
    }
    // 3. ocaso = lado 2
    {
      const ben = ctPlanetasNoSigno(pos, s7, CT_BENEFICOS), mal = ctComAspecto(pos, s7, CT_MALEFICOS);
      const linhas = [{ tem: `Ocaso, ${CT_TEXTOS.tribunalPapel[7]} = {L2} (casa 7, ${CT_S(s7)}): benéficos ${CT_LISTA_P(ben)}.`, leitura: ben.length ? CT_TEXTOS.ocasoVitoria : null, fonte: CT_TEXTOS.fonteDisputa, ativo: ben.length > 0 }];
      linhas.push({ tem: `Maléficos no ocaso ou em aspecto com ele: ${mal.length ? mal.map(id => `${CT_P(id)} ${CT_ASPECTO_POR_DIST[ctDistSignos(ctSignoDe(pos[id]), s7)]}`).join(', ') : 'nenhum'}.`, leitura: mal.length ? CT_TEXTOS.ocasoMiseria : null, fonte: CT_TEXTOS.fonteV33, ativo: mal.length > 0 });
      let et = ctEt(CT_NEUTRO);
      if (ben.length && !mal.length) et = ctEt(CT_FAVOR, 2); else if (mal.length && !ben.length) et = ctEt(CT_CONTRA, 2);
      add('ocaso', 'Ocaso: {L2}', 'ocaso', et, linhas);
    }
    // 4. subterrâneo = resultado
    {
      const ben = ctPlanetasNoSigno(pos, s4, CT_BENEFICOS), mal = ctPlanetasNoSigno(pos, s4, CT_MALEFICOS);
      const leitura = [mal.length ? CT_TEXTOS.subInjusta : '', ben.length ? CT_TEXTOS.subJusta : ''].filter(Boolean).join(' ') || null;
      add('subterraneo', 'Lugar subterrâneo: o resultado', 'subterraneo', mal.length ? ctEt(CT_CONTRA, 2) : ctEt(CT_SEMLADO),
        [{ tem: `Lugar subterrâneo, o resultado (casa 4, ${CT_S(s4)}): benéficos ${CT_LISTA_P(ben)}; maléficos ${CT_LISTA_P(mal)}.`, leitura, fonte: CT_TEXTOS.fonteDisputa, ativo: !!leitura }]);
    }
    // 5. luz da Lua: quem é quem
    add('luz', 'Luz da Lua: quem é quem', 'lua', ctEt(CT_SEMLADO), [{
      tem: `Lua em ${CT_S(sLua)} e Sol em ${CT_S(sSol)}: a Lua está ${luz.crescendo ? 'crescendo' : 'diminuindo'} em luz. ${CT_P('Moon')} = {L${ladoLua}}; ${CT_P('Sun')} = {L${3 - ladoLua}}.`,
      leitura: luz.crescendo ? CT_TEXTOS.luzCrescendo : CT_TEXTOS.luzDiminuindo, fonte: CT_TEXTOS.fonteComparacao, ativo: false }], { crescendo: luz.crescendo, elongacao: luz.elongacao });
    // 6. comparação Lua x Sol: só os fatos que o texto nomeia
    {
      const linhas = [
        { tem: ctFichaLuminar(pos, 'Sun', sAsc, opcoes.termos) + '.', leitura: null, fonte: CT_TEXTOS.fonteComparacao },
        { tem: ctFichaLuminar(pos, 'Moon', sAsc, opcoes.termos) + '.', leitura: CT_TEXTOS.tribunalVence, fonte: CT_TEXTOS.fonteComparacao, nota: CT_TEXTOS.comparacaoNota }
      ];
      // Doroteu V.33: quem tem o aspecto mais próximo do Ascendente é o mais forte. Por signo, o mais próximo é o que está junto (mesmo signo do Ascendente).
      const solJunto = sSol === sAsc, luaJunta = sLua === sAsc;
      let et = ctEt(CT_SEMLADO);
      if (solJunto !== luaJunta) {
        const quem = luaJunta ? 'Moon' : 'Sun';
        const lado = quem === 'Moon' ? ladoLua : 3 - ladoLua;
        linhas.push({ tem: `${CT_P(quem)} está no signo do Ascendente (junto), o aspecto mais próximo; o outro não.`, leitura: CT_TEXTOS.aspectoMaisPerto, fonte: CT_TEXTOS.fonteV33, ativo: true });
        et = ctEt(CT_FAVOR, lado);
      }
      add('comparacao', 'Lua e Sol: quem está mais bem colocado', 'lua', et, linhas);
    }
    // 7. Lua corrompida: pesa contra o lado que a Lua representa
    {
      const linhas = corrupcoes();
      linhas.forEach(l => { l.fonte = CT_TEXTOS.fonteCorrupcao; });
      const { onde } = nodosDaLua();
      linhas.push({ tem: onde ? 'Lua nos nodos (corrupção)' : 'Lua fora dos nodos.', fonte: CT_TEXTOS.fonteNodos, ativo: !!onde });
      linhas.push({ tem: dLuaSol === 0 ? `Lua no mesmo signo do Sol (${CT_S(sSol)}), sob os raios.` : 'Lua fora do signo do Sol.', fonte: CT_TEXTOS.fonteLuaSol, ativo: dLuaSol === 0 });
      linhas.forEach(l => { l.leitura = l.ativo ? CT_TEXTOS.corrupcaoDisputa : null; });
      const ativa = linhas.some(l => l.ativo);
      add('corrupcoes', 'Lua corrompida', 'lua', ativa ? ctEt(CT_CONTRA, ladoLua) : ctEt(CT_NEUTRO), linhas, { ladoLua });
    }
    if (dLuaSol === 6) add('oposicao', 'Lua em oposição ao Sol', 'lua', ctEt(CT_SEMLADO), [{ tem: `Lua no signo oposto ao do Sol (${CT_S(sLua)} e ${CT_S(sSol)}).`, leitura: CT_TEXTOS.oposicaoSolLua, fonte: CT_TEXTOS.fonteLuaSol, ativo: true }]);
    // Doroteu V.33: o que o texto acrescenta e dá pra ler por signo
    {
      const marte = malHor.includes('Mars'), saturno = malHor.includes('Saturn');
      if (marte || saturno) {
        const linhas = [];
        if (marte) linhas.push({ tem: `${CT_P('Mars')} ${CT_ASPECTO_POR_DIST[ctDistSignos(ctSignoDe(pos.Mars), sAsc)]} ao Horóscopo.`, leitura: CT_TEXTOS.marteHoroscopo, fonte: CT_TEXTOS.fonteV33, ativo: true });
        if (saturno) linhas.push({ tem: `${CT_P('Saturn')} ${CT_ASPECTO_POR_DIST[ctDistSignos(ctSignoDe(pos.Saturn), sAsc)]} ao Horóscopo.`, leitura: CT_TEXTOS.saturnoHoroscopo, fonte: CT_TEXTOS.fonteV33, ativo: true });
        add('marteSaturno', 'Marte e Saturno no Horóscopo', 'horoscopo', ctEt(CT_CONTRA, 1), linhas);
      }
      const f = ctFortuna(m.asc, pos.Sun, pos.Moon);
      const sF = ctSignoDe(f.lon), cF = ctCasaDoSigno(sF, sAsc);
      const l1 = cF === 1 || cF === 2, l2 = cF === 7 || cF === 8;
      add('fortuna', 'Fortuna', 'fortuna', l1 ? ctEt(CT_FAVOR, 1) : (l2 ? ctEt(CT_FAVOR, 2) : ctEt(CT_NEUTRO)),
        [{ tem: `Fortuna em ${CT_S(sF)} (casa ${cF}), mapa ${f.dia ? 'diurno' : 'noturno'}.`, leitura: l1 ? CT_TEXTOS.fortunaLado1 : (l2 ? CT_TEXTOS.fortunaLado2 : null), fonte: CT_TEXTOS.fonteV33, ativo: l1 || l2 }]);
      // o juiz ajuda quem busca (senhor do MC junto ao senhor do Horóscopo, ou no Horóscopo, ou em aspecto com ele ou com o senhor dele); o mesmo com o senhor do ocaso: ajuda o réu
      const juiz = (sCasa) => {
        const lc = CT_DOMICILIO[sCasa], lm = CT_DOMICILIO[sMC];
        const slc = ctSignoDe(pos[lc]), slm = ctSignoDe(pos[lm]);
        if (lc === lm) return false;
        return slm === slc || slm === sCasa || ctSoAspecto(slm, sCasa) || ctSoAspecto(slm, slc);
      };
      const j1 = juiz(sAsc), j2 = juiz(s7);
      if (j1 || j2) add('juiz', 'O juiz e os lados', 'mc', j1 && j2 ? ctEt(CT_NEUTRO) : ctEt(CT_FAVOR, j1 ? 1 : 2), [
        ...(j1 ? [{ tem: `Senhor do Meio-do-Céu (${CT_P(CT_DOMICILIO[sMC])}) com o senhor do Horóscopo (${CT_P(CT_DOMICILIO[sAsc])}).`, leitura: CT_TEXTOS.juizLado1, fonte: CT_TEXTOS.fonteV33, ativo: true }] : []),
        ...(j2 ? [{ tem: `Senhor do Meio-do-Céu (${CT_P(CT_DOMICILIO[sMC])}) com o senhor do ocaso (${CT_P(CT_DOMICILIO[s7])}).`, leitura: CT_TEXTOS.juizLado2, fonte: CT_TEXTOS.fonteV33, ativo: true }] : [])]);
    }
    addCapitulo();
  } else {
    /* ===== COMEÇO (qualquer assunto) e PERGUNTA dos outros assuntos ===== */
    addRetoObliquo();
    addGrupo();
    addLuz();
    addSenhor();
    addCorrupcoes();
    addNodos();
    addAngulos();
    addCapitulo();
  }

  /* sinais mistos: dois indicadores do mesmo ponto que apontam em sentidos contrários */
  const porPonto = {};
  indicadores.forEach(i => { (porPonto[i.ponto] = porPonto[i.ponto] || []).push(i); });
  Object.keys(porPonto).forEach(p => {
    const grupo = porPonto[p];
    const pos1 = grupo.filter(i => ctInclinacao(i.etiqueta, disputa) > 0), neg = grupo.filter(i => ctInclinacao(i.etiqueta, disputa) < 0);
    if (pos1.length && neg.length) grupo.forEach(i => { const incl = ctInclinacao(i.etiqueta, disputa); if (incl) i.mistos = (incl > 0 ? neg : pos1).map(o => o.titulo); });
  });
  // o próprio Horóscopo com benéficos e maléficos juntos (Doroteu V.2) também é sinal misto
  indicadores.forEach(i => { if (i.id === 'horoscopo' && benHor.length && malHor.length) i.mistos = i.mistos || ['benéficos e maléficos no mesmo signo ou em aspecto']; });

  return { assunto, tipo: comeco ? 'comeco' : 'pergunta', disputa, nomes, aviso: tribunal ? CT_TEXTOS.avisoTribunal : null, ladoLua,
    casas: Array.from({ length: 12 }, (_, i) => signoDaCasa(i + 1)), indicadores, resumo: ctResumo(indicadores, disputa) };
}

/* ficha de um luminar na comparação do tribunal: onde está, hemisfério, termo e benéficos que testemunham (os fatos que o texto nomeia) */
function ctFichaLuminar(pos, id, sAsc, termos) {
  const s = ctSignoDe(pos[id]), c = ctCasaDoSigno(s, sAsc);
  const t = ctTestemunhas(pos, s, CT_BENEFICOS).filter(x => x.id !== id);
  const termo = ctTermoSenhor(pos[id], termos);
  return `${CT_P(id)} em ${CT_S(s)}, casa ${c}, ${c >= 7 ? 'acima' : 'abaixo'} da Terra${termo ? `, no termo de ${CT_P(termo)}` : ''}, benéficos que testemunham: ${t.length ? t.map(x => `${CT_P(x.id)} ${x.como}`).join(', ') : 'nenhum'}`;
}

/* a leitura de 3 linhas do topo, sem veredito: o que pesa a favor de cada lado, o que pesa contra, o que está neutro */
function ctResumo(inds, disputa) {
  const lista = (arr) => arr.length ? arr.map(i => i.titulo).join('; ') : 'nada';
  const de = (t, lado) => inds.filter(i => i.etiqueta.t === t && (lado === undefined || i.etiqueta.lado === lado));
  const neutros = inds.filter(i => i.etiqueta.t === CT_NEUTRO || i.etiqueta.t === CT_SEMLADO).filter(i => i.id !== 'capitulo');
  if (disputa) return [
    `A favor de {L1}: ${lista(de(CT_FAVOR, 1))}. A favor de {L2}: ${lista(de(CT_FAVOR, 2))}.`,
    `Contra {L1}: ${lista(de(CT_CONTRA, 1))}. Contra {L2}: ${lista(de(CT_CONTRA, 2))}.`,
    `Neutro: ${lista(neutros)}.`
  ];
  return [`A favor: ${lista(de(CT_FAVOR))}.`, `Contra: ${lista(de(CT_CONTRA))}.`, `Neutro: ${lista(neutros)}.`];
}

/* nome da etiqueta, com o nome do lado quando é Disputa */
function ctRotuloEtiqueta(et, disputa) {
  if (et.t === CT_NEUTRO) return 'neutro';
  if (et.t === CT_SEMLADO) return 'sem lado';
  if (et.t === CT_FAVOR) return disputa ? `a favor de {L${et.lado}}` : 'a favor';
  return disputa ? `contra {L${et.lado}}` : 'contra';
}

/* texto puro dos marcadores {P:Moon}, {S:3}, {L1}, {L2} e {Lx} (Node e testes); `nomes` = { L1, L2 }, `ladoLua` para {Lx} */
function ctTextoPuro(s, nomes, ladoLua) {
  const n = nomes || { L1: 'Lado 1', L2: 'Lado 2' };
  return String(s == null ? '' : s)
    .replace(/\{P:(\w+)\}/g, (_, id) => (CT_PLANETAS[id] ? CT_PLANETAS[id].nome : id))
    .replace(/\{S:(\d+)\}/g, (_, i) => CT_SIGNOS[+i])
    .replace(/\{Lx\}/g, () => n['L' + (ladoLua || 1)])
    .replace(/\{L([12])\}/g, (_, k) => n['L' + k]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ctSignoReto, ctCalcular, ctTextoPuro, ctLuzDaLua, ctDuodecima, ctTemposAscensao, ctGrupoDoSigno, ctDistSignos, ctCasaDoSigno, ctTestemunhas, ctTermoSenhor, ctFortuna, ctRotuloEtiqueta, CT_ASSUNTOS, CT_TEXTOS };
}

/* ==========================================
   TELA — calcula sozinha a partir do mapa salvo que está em tela (a Mandala); só escolhe assunto e tipo
   ========================================== */
let ctEscolha = { assunto: 'geral', tipo: 'comeco', lado1: '', lado2: '' };

function ctMarcadoresHtml(s, nomes, ladoLua) {
  const cru = escapeHtml(String(s == null ? '' : s));
  const n = nomes || { L1: 'Lado 1', L2: 'Lado 2' };
  const caixa = (html) => `<span style="display:inline-flex; align-items:center; vertical-align:middle;">${html}</span>`;
  return cru
    .replace(/\{P:(\w+)\}/g, (_, id) => (typeof planetaComNome === 'function') ? caixa(planetaComNome(id, 20)) : ctTextoPuro(`{P:${id}}`))
    .replace(/\{S:(\d+)\}/g, (_, i) => (typeof signoComNome === 'function' && typeof getSignSvgHtmlDec === 'function')
      ? caixa(signoComNome(getSignSvgHtmlDec(+i, 20), +i)) : CT_SIGNOS[+i])
    .replace(/\{Lx\}/g, () => `<strong>${escapeHtml(n['L' + (ladoLua || 1)])}</strong>`)
    .replace(/\{L([12])\}/g, (_, k) => `<strong>${escapeHtml(n['L' + k])}</strong>`);
}

function ctMensagem(texto) { return `<div style="font-size:13px; font-weight:600; text-align:center; padding:16px 0;">${escapeHtml(texto)}</div>`; }

/* lê o mapa em tela → entrada do cálculo (ou { erro }) */
function ctLerMapa() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || typeof currentMapaId === 'undefined' || !currentMapaId) return { erro: 'Abra um mapa salvo no menu lateral.' };
  if (window.mapaTemHorario === false) return { erro: 'A catarché precisa do horário do mapa (o Ascendente define as casas).' };
  const d = currentCalculatedData, pos = {};
  Object.keys(CT_PLANETAS).forEach(id => { pos[id] = d[CT_PLANETAS[id].chave] ? d[CT_PLANETAS[id].chave].grau_absoluto : 0; });
  return { asc: d.Ascendente.grau_absoluto, pos, nodo: d.Nodo_Norte ? d.Nodo_Norte.grau_absoluto : 0, lat: currentGeo.lat };
}

/* Visual igual ao das outras ferramentas (componentes.css): título de seção em terracota, itens em .cartao (só linha fina em cima e embaixo),
   .divisa (linha dupla) entre os blocos, fonte em .texto-apagado. Nada de caixa com lados e nada de cor de fundo própria. */
function ctMontarIndicador(ind, r) {
  const n = r.nomes, M = (s) => ctMarcadoresHtml(s, n, r.ladoLua);
  const fontes = [...new Set(ind.linhas.map(l => l.fonte).filter(Boolean))];
  const corpo = ind.linhas.map((l, i) => `
      <div${i ? ' class="linha-info"' : ''} style="font-size:13px; line-height:1.7;${i ? ' margin-top:8px;' : ''}">
        <div>${M(l.tem)}</div>
        ${l.leitura ? `<div style="margin-top:4px; font-weight:700;${l.ativo ? ' color:var(--terracota);' : ''}">${M(l.leitura)}</div>` : ''}
        ${l.nota ? `<div class="texto-apagado" style="font-size:11.5px; margin-top:4px;">${escapeHtml(l.nota)}</div>` : ''}
      </div>`).join('');
  const mistos = ind.mistos ? `<div style="margin-top:8px; font-size:12.5px; font-weight:700; color:var(--terracota);">Sinais mistos: ${escapeHtml(ind.mistos.join('; '))} aponta${ind.mistos.length > 1 ? 'm' : ''} no sentido contrário.</div>` : '';
  const et = ctRotuloEtiqueta(ind.etiqueta, r.disputa);
  const corEt = ind.etiqueta.t === CT_CONTRA ? 'var(--terracota)' : 'var(--azul-egipcio-escuro)';
  return `
    <details class="ct-linha" style="border-top: var(--contorno-fino) solid var(--azul-egipcio-claro); padding: 6px 0;">
      <summary style="cursor:pointer; font-size:13px; line-height:1.6;">
        <span class="selo" style="color:${corEt};">${M(et)}</span>
        <strong>${M(ind.titulo)}</strong>${ind.mistos ? ' <span class="selo" style="color:var(--terracota);">sinais mistos</span>' : ''}${ind.leitura ? ` <span class="texto-apagado">${M(ind.leitura)}</span>` : ''}
      </summary>
      <div class="cartao" style="margin-top:6px;">${corpo}${mistos}
        ${fontes.length ? `<div class="texto-apagado" style="font-size:11.5px; margin-top:8px;">Fonte: ${fontes.map(escapeHtml).join('; ')}</div>` : ''}
      </div>
    </details>`;
}

function ctMontarResultado(r) {
  const M = (s) => ctMarcadoresHtml(s, r.nomes, r.ladoLua);
  const aviso = r.aviso ? `<div class="texto-apagado" style="font-size:12px; margin-bottom:10px;">${escapeHtml(r.aviso)}</div>` : '';
  return `${aviso}
    <h3 class="titulo-secao">Leitura</h3>
    <div class="cartao" style="font-size:13px; line-height:1.8;">${r.resumo.map(l => `<div>${M(l)}</div>`).join('')}</div>
    <hr class="divisa">
    <details open>
      <summary class="rotulo" style="cursor:pointer; margin-bottom:6px;">Indicadores</summary>
      ${r.indicadores.map(i => ctMontarIndicador(i, r)).join('')}
      <div style="border-top: var(--contorno-fino) solid var(--azul-egipcio-claro);"></div>
    </details>`;
}

let ctUltimo = null;              // último resultado calculado

function ctExecutar() {
  const area = document.getElementById('ctResultado');
  if (!area) return;
  ctUltimo = null;
  const e = ctLerMapa();
  if (e.erro) { area.innerHTML = ctMensagem(e.erro); return; }
  try {
    const r = ctCalcular(e, { assunto: ctEscolha.assunto, tipo: ctEscolha.tipo, lado1: ctEscolha.lado1, lado2: ctEscolha.lado2,
      oa: calcularAscensaoObliqua, termos: (typeof EGYPTIAN_TERMS !== 'undefined') ? EGYPTIAN_TERMS : null });
    ctUltimo = r;
    area.innerHTML = ctMontarResultado(r);
  } catch (err) {
    console.error(err);
    area.innerHTML = `<div style="color:var(--terracota); font-weight:700; font-size:13px;">Não foi possível calcular: ${escapeHtml(err.message || String(err))}</div>`;
  }
}
if (typeof window !== 'undefined') window.ctExecutar = ctExecutar;

/* a lista de assuntos muda com o tipo: "Escolher o momento em geral" só existe para quem vai começar algo; os nomes dos lados só na Disputa */
function ctAtualizarControles() {
  const sel = document.getElementById('ctAssunto');
  if (sel) {
    const lista = CT_ASSUNTOS.filter(a => ctEscolha.tipo === 'comeco' || !a.soComeco);
    if (!lista.some(a => a.id === ctEscolha.assunto)) ctEscolha.assunto = lista[0].id;
    sel.innerHTML = lista.map(a => `<option value="${a.id}"${a.id === ctEscolha.assunto ? ' selected' : ''}>${escapeHtml(a.nome)}</option>`).join('');
  }
  const lados = document.getElementById('ctLados');
  if (lados) lados.style.display = (ctEscolha.assunto === 'tribunal' && ctEscolha.tipo === 'pergunta') ? 'flex' : 'none';
}
function ctEscolher(campo, valor) { ctEscolha[campo] = valor; ctAtualizarControles(); ctExecutar(); }
if (typeof window !== 'undefined') window.ctEscolher = ctEscolher;
function ctNomeLado(n, valor) { ctEscolha['lado' + n] = valor; ctExecutar(); }
if (typeof window !== 'undefined') window.ctNomeLado = ctNomeLado;

function iniciarModuloCatarche() {
  const container = document.getElementById('mandala-container');
  if (!container) return;
  ctUltimo = null;
  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column;">
      <div id="ct-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Catarché</h3><div class="acoes-ferramenta">
          <button type="button" onclick="salvarCatarcheNaGaleria()" title="Salvar o resultado como imagem na galeria (com título e cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
          </button>
          <button type="button" onclick="capturarCatarcheParaRelatorio()" title="Adicionar ao Relatório (sem cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
          </button>
        </div></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        ${(typeof montarCabecalhoMandalaImagemHTML === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}
        <hr class="divisa">
        <div class="grade-cartoes" style="margin-bottom:10px;">
          <div style="flex:1; min-width:220px;"><div class="rotulo" style="margin-bottom:4px;">Assunto</div>
            <select id="ctAssunto" class="menu-select" style="width:100%; font-size:13px;" onchange="ctEscolher('assunto', this.value)"></select></div>
          <div style="flex:1; min-width:220px;"><div class="rotulo" style="margin-bottom:4px;">Tipo do mapa</div>
            <select id="ctTipo" class="menu-select" style="width:100%; font-size:13px;" onchange="ctEscolher('tipo', this.value)">
              <option value="comeco"${ctEscolha.tipo === 'comeco' ? ' selected' : ''}>Início (obra, evento ou data a escolher)</option>
              <option value="pergunta"${ctEscolha.tipo === 'pergunta' ? ' selected' : ''}>Pergunta</option>
            </select></div>
        </div>
        <div id="ctLados" class="grade-cartoes" style="margin-bottom:10px; display:none;">
          <div style="flex:1; min-width:220px;"><div class="rotulo" style="margin-bottom:4px;">Lado 1 (o Horóscopo: quem acusa ou inicia)</div>
            <input type="text" id="ctLado1" class="client-search-input" style="font-size:13px;" placeholder="Lado 1" maxlength="40" value="${escapeHtml(ctEscolha.lado1)}" oninput="ctNomeLado(1, this.value)" autocomplete="off"></div>
          <div style="flex:1; min-width:220px;"><div class="rotulo" style="margin-bottom:4px;">Lado 2 (o ocaso: o outro)</div>
            <input type="text" id="ctLado2" class="client-search-input" style="font-size:13px;" placeholder="Lado 2" maxlength="40" value="${escapeHtml(ctEscolha.lado2)}" oninput="ctNomeLado(2, this.value)" autocomplete="off"></div>
        </div>
        <div class="texto-apagado" style="font-size:11.5px; line-height:1.6;">A ferramenta não prevê: mostra o que o texto antigo diz sobre o que o mapa tem. Casas por signos inteiros; conjunção e aspecto por signo.</div>
        <hr class="divisa">
        <div id="ctResultado"></div>
        <hr class="divisa-fim">
      </div>
    </div>`;
  ctAtualizarControles();
  ctExecutar();
}
if (typeof window !== 'undefined') window.iniciarModuloCatarche = iniciarModuloCatarche;

/* ---------- Salvar na galeria e adicionar ao Relatório (mesmo padrão das outras ferramentas) ---------- */
/* os indicadores ficam recolhidos na tela; na imagem saem todos abertos */
async function ctComTudoAberto(area, fn) {
  const abertos = [...area.querySelectorAll('details')].map(d => [d, d.open]);
  abertos.forEach(([d]) => { d.open = true; });
  try { return await fn(); } finally { abertos.forEach(([d, o]) => { d.open = o; }); }
}

function salvarCatarcheNaGaleria() {
  const area = document.getElementById('ctResultado');
  if (!area || !ctUltimo) { alert('Abra um mapa salvo primeiro.'); return; }
  capturarESalvarNaGaleria(
    () => ctComTudoAberto(area, () => gerarImagemHtmlComCabecalho(area, { titulo: 'CATARCHÉ', comCabecalho: true, papiro: true })),
    `Astro_Hellenic_Catarche_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
if (typeof window !== 'undefined') window.salvarCatarcheNaGaleria = salvarCatarcheNaGaleria;

async function capturarCatarcheParaRelatorio() {
  const area = document.getElementById('ctResultado');
  if (!area || !ctUltimo) { alert('Abra um mapa salvo primeiro.'); return; }
  try {
    const papiro = window.temaMandala === 'ceu';
    const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : fundoPainelClaro()); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await ctComTudoAberto(area, () => gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true })), fundo);
    const total = adicionarCapturaRelatorio('catarche', canvas.toDataURL('image/png'));
    alert(`"Catarché" foi adicionada ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar a Catarché ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
if (typeof window !== 'undefined') window.capturarCatarcheParaRelatorio = capturarCatarcheParaRelatorio;
