/* ==========================================
   CATARCHÉ (astrologia dos começos) — FERRAMENTA DE TESTE, versão 1
   Fonte: o estudo "Astrologia catárquica nos autores helenísticos" (Doroteu V, Hefestião III, Balchus, Olimpiodoro, Paulo).
   A ferramenta NÃO prevê: mostra o que o texto antigo diz sobre o que o mapa tem, com autor e capítulo.

   Regras gerais: casas por signos inteiros, zodíaco tropical; conjunção e aspecto por SIGNO (mesmo signo = junto), sem grau e sem orbe.
   Só a luz da Lua (crescendo/diminuindo em luz) conta por grau exato, porque é distância e não aspecto (Hefestião III.38).
   Doroteu chegou por tradução árabe: onde diverge de Hefestião (grego), vale Hefestião.
   Não entram, de propósito: mansões lunares, mapa radical, considerações antes do julgamento, astrologia horária como ramo.

   Divisão do arquivo:
   1) cálculo (sem tela, roda em Node: ver module.exports no fim) — ctCalcular() devolve uma lista de indicadores;
      cada indicador tem linhas { tem, leitura, fonte }. Os textos moram em CT_TEXTOS (trocar a redação não mexe no cálculo).
      Nos textos, {P:Moon} e {S:3} viram ícone de planeta / de signo na tela e nome em texto puro.
   2) tela (iniciarModuloCatarche)

   Fica pra versão 2: senhores do dia e da hora (Balchus, Olimpiodoro), planeta sem testemunho (Hefestião III.7), tempo pela Lua no
   sétimo dia e pela Fortuna (Balchus), e as corrupções que pedem posição em grau (fim do signo, de 15° de Libra a 15° de Escorpião,
   Lua lenta). Também fica pra depois "lugar" e "limite" na comparação do tribunal (pedem grau).
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

/* Assuntos: o quadro "Uso em consulta" do estudo (capítulo de Hefestião III e de Doroteu V a abrir) */
const CT_ASSUNTOS = [
  { id: 'geral',      nome: 'Escolher o momento em geral', hef: 'III.1, III.2',    dor: 'V.1 a V.5' },
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
  { id: 'tribunal',   nome: 'Tribunal',                    hef: 'III.37, III.38',  dor: 'V.33' },
  { id: 'prisao',     nome: 'Prisão',                      hef: 'III.40',          dor: 'V.27' },
  { id: 'perdida',    nome: 'Coisa perdida ou roubada',    hef: 'III.42 a III.46', dor: 'V.35' },
  { id: 'fugitivo',   nome: 'Fugitivo',                    hef: 'III.47',          dor: 'V.36' }
];

/* Textos (leituras e fontes). Onde o estudo dá o texto, vai como está; nada aqui é interpretação nova. */
const CT_TEXTOS = {
  fonteRetoObliquo: 'Doroteu V.2, Hefestião III.1',
  reto: 'Se não estiver prejudicado, a coisa se cumpre sem impedimento.',
  obliquoSemBenefico: 'Sem testemunho de benéfico: coisa difícil e demorada.',
  obliquoComBenefico: 'Há testemunho de benéfico: não vale a indicação de coisa difícil e demorada.',
  fonteGrupo: 'Doroteu V.3 e V.4',
  grupo: {
    tropical:  'Atividade curta: a ação pode parar antes de acabar e precisar ser refeita.',
    bicorporeo: 'Complicação: surge uma condição extra a resolver antes do fim.',
    solido:    'Estabilidade: são os que Doroteu manda subir no começo.'
  },
  fonteGrupoTribunal: 'Hefestião III.37',
  grupoTribunal: {
    tropical:  'No tribunal: a coisa não chega ao fim.',
    bicorporeo: 'No tribunal: quem iniciou muda de ideia.',
    solido:    'No tribunal: há demora, e quem persegue o caso não cede.'
  },
  fonteLuz: 'Hefestião III.38',
  fonteLuaSol: 'Doroteu V',
  luaComSol: 'Lua no mesmo signo do Sol: fica escondida pela luz dele. Favorece ações secretas.',
  luaComSolCrescendo: ' Sobretudo agora, que já está crescendo em luz, saindo dos raios.',
  luaOpostaSol: 'Lua no signo oposto ao do Sol: indica brigas.',
  fonteSenhor: 'Doroteu, citado em Hefestião III.2',
  senhorIntro: 'O começo pertence à Lua e a realização ao senhor do signo dela.',
  senhorBemMal: 'Lua em ângulo e senhor dela cadente: a coisa começa bem e termina improdutiva.',
  senhorMalBem: 'Lua cadente e senhor dela em ângulo: a coisa começa mal e termina produtiva.',
  fonteCorrupcao: 'Doroteu V (V.5), Hefestião III.1',
  corrupcao: 'Lua corrompida. Doroteu manda não começar nada com a Lua corrompida.',
  remedio: 'Se a coisa não pode esperar, Júpiter ou Vênus no Horóscopo ou no Meio-do-Céu ajudam.',
  fonteNodos: 'Doroteu V, Hefestião III',
  nodosComeco: 'Corrupção da Lua por eclipse: Doroteu manda não começar nada com a Lua corrompida. Evitar começar.',
  fonteTribunal: 'Hefestião III.37 e III.38',
  tribunalPapel: { 1: 'quem acusa', 10: 'o juiz', 7: 'o acusado', 4: 'o resultado' },
  tribunalMC:  { ben: 'Benéfico no Meio-do-Céu: juiz justo.',     mal: 'Maléfico no Meio-do-Céu: juiz injusto.' },
  tribunalOcaso: { ben: 'Benéfico no ocaso: vitória do acusado.' },
  tribunalSub: { ben: 'Benéfico no lugar subterrâneo: sentença justa.', mal: 'Maléfico no lugar subterrâneo: sentença injusta.' },
  tribunalCrescendo:  'Lua crescendo em luz: a Lua faz o papel de quem persegue e o Sol o de quem é acusado.',
  tribunalDiminuindo: 'Lua diminuindo em luz: o Sol faz o papel de quem persegue e a Lua o de quem é acusado.',
  tribunalVence: 'Vence quem estiver mais bem colocado em lugar, limite, testemunho de benéficos e hemisfério acima da Terra.'
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

function ctPlanetasNoSigno(pos, signo, ids) { return ids.filter(id => ctSignoDe(pos[id]) === signo); }

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
   Hefestião (reto de Câncer a Sagitário) e no sul inverte sozinho. Comparar com 30° dava 8 retos em São Paulo (lat. −23,55°), que o texto não tem.
   Só no equador exato (os dois tempos iguais) não há o que comparar: vale a lista do norte. `tempos` = ctTemposAscensao(). */
function ctSignoReto(lat, signo, tempos) {
  const dif = tempos[signo] - tempos[(signo + 6) % 12];
  if (Math.abs(dif) < 1e-9) return signo >= 3 && signo <= 8;
  return dif > 0;
}

/* 'tropical' (cardinais), 'solido' (fixos) ou 'bicorporeo' */
function ctGrupoDoSigno(signo) { return ['tropical', 'solido', 'bicorporeo'][signo % 3]; }
const CT_GRUPO_NOME = { tropical: 'tropical', solido: 'sólido', bicorporeo: 'bicorpóreo' };

/* luz da Lua, por grau exato: elongação = Lua − Sol (0 a 360); de 0 a 180 cresce em luz, de 180 a 360 diminui. Sempre uma das duas. */
function ctLuzDaLua(lonSol, lonLua) {
  const e = ctNorm360(lonLua - lonSol);
  return { elongacao: e, crescendo: e < 180 };
}

/* duodécima parte (dodecatemória): começo do signo + 12 × o grau dentro do signo */
function ctDuodecima(lon) { return ctNorm360(Math.floor(ctNorm360(lon) / 30) * 30 + (ctNorm360(lon) % 30) * 12); }

const CT_P = (id) => `{P:${id}}`;
const CT_S = (idx) => `{S:${idx}}`;
const CT_LISTA_P = (ids) => ids.length ? ids.map(CT_P).join(' ') : 'nenhum';

/* ---------- o cálculo ----------
   m = { asc (longitude do Ascendente), pos: { Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn }, nodo (nodo norte), lat }
   opcoes = { assunto (id de CT_ASSUNTOS), tipo ('comeco' | 'pergunta'), oa (função de ascensão oblíqua) } */
function ctCalcular(m, opcoes) {
  const assunto = CT_ASSUNTOS.find(a => a.id === opcoes.assunto) || CT_ASSUNTOS[0];
  const comeco = opcoes.tipo !== 'pergunta';
  const tribunal = assunto.id === 'tribunal';
  const pos = m.pos;
  const sAsc = ctSignoDe(m.asc);
  const casaDe = (lon) => ctCasaDoSigno(ctSignoDe(lon), sAsc);
  const signoDaCasa = (c) => (sAsc + c - 1) % 12;
  const indicadores = [];

  /* 1. signo do Horóscopo, reto ou oblíquo */
  {
    const tempos = ctTemposAscensao(m.lat, opcoes.oa);
    const reto = ctSignoReto(m.lat, sAsc, tempos);
    const testem = ctTestemunhas(pos, sAsc, CT_BENEFICOS);
    const tem = `Horóscopo em ${CT_S(sAsc)}, signo ${reto ? 'reto' : 'oblíquo'} (sobe em ${tempos[sAsc].toFixed(1).replace('.', ',')}° de ascensão, contra ${tempos[(sAsc + 6) % 12].toFixed(1).replace('.', ',')}° do signo oposto, na latitude do mapa).`;
    let leitura;
    if (reto) leitura = CT_TEXTOS.reto;
    else if (!testem.length) leitura = CT_TEXTOS.obliquoSemBenefico;
    else leitura = CT_TEXTOS.obliquoComBenefico;
    const linhas = [{ tem, leitura, fonte: CT_TEXTOS.fonteRetoObliquo }];
    if (!reto) linhas.push({ tem: `Benéficos que testemunham o Horóscopo: ${testem.length ? testem.map(t => `${CT_P(t.id)} ${t.como}`).join(', ') : 'nenhum'}.`, leitura: null, fonte: CT_TEXTOS.fonteRetoObliquo });
    indicadores.push({ id: 'horoscopo', titulo: 'Signo do Horóscopo: reto ou oblíquo', linhas, extra: { tempos, reto } });
  }

  /* 2. grupo do signo do Horóscopo */
  {
    const g = ctGrupoDoSigno(sAsc);
    const linhas = [{ tem: `Horóscopo em ${CT_S(sAsc)}, signo ${CT_GRUPO_NOME[g]}.`, leitura: CT_TEXTOS.grupo[g], fonte: CT_TEXTOS.fonteGrupo }];
    if (tribunal) linhas.push({ tem: `Assunto tribunal, Horóscopo ${CT_GRUPO_NOME[g]}.`, leitura: CT_TEXTOS.grupoTribunal[g], fonte: CT_TEXTOS.fonteGrupoTribunal });
    indicadores.push({ id: 'grupo', titulo: 'Grupo do signo do Horóscopo', linhas });
  }

  /* 3. Lua */
  const sLua = ctSignoDe(pos.Moon), sSol = ctSignoDe(pos.Sun);
  const luz = ctLuzDaLua(pos.Sun, pos.Moon);
  {
    // a) luz da Lua (grau exato) e corrupção menor (por signo)
    const linhas = [{ tem: `Lua em ${CT_S(sLua)} e Sol em ${CT_S(sSol)}: a Lua está ${luz.crescendo ? 'crescendo' : 'diminuindo'} em luz.`, leitura: null, fonte: CT_TEXTOS.fonteLuz }];
    const dist = ctDistSignos(sLua, sSol);
    if (dist === 0) linhas.push({ tem: `Lua no mesmo signo do Sol (${CT_S(sSol)}).`, leitura: CT_TEXTOS.luaComSol + (luz.crescendo ? CT_TEXTOS.luaComSolCrescendo : ''), fonte: CT_TEXTOS.fonteLuaSol, ativo: true });
    else if (dist === 6) linhas.push({ tem: `Lua no signo oposto ao do Sol (${CT_S(sLua)} e ${CT_S(sSol)}).`, leitura: CT_TEXTOS.luaOpostaSol, fonte: CT_TEXTOS.fonteLuaSol, ativo: true });
    else linhas.push({ tem: 'Lua nem no mesmo signo nem no signo oposto ao do Sol.', leitura: null, fonte: CT_TEXTOS.fonteLuaSol });
    indicadores.push({ id: 'luz', titulo: 'Luz da Lua', linhas, extra: { elongacao: luz.elongacao, crescendo: luz.crescendo } });
  }
  {
    // b) senhor do signo da Lua
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
    indicadores.push({ id: 'senhor', titulo: 'Senhor do signo da Lua', linhas: [{ tem, leitura, fonte: CT_TEXTOS.fonteSenhor, ativo }] });
  }
  {
    // c) corrupções da Lua, por signo
    const linhas = [];
    const dodSigno = ctSignoDe(ctDuodecima(pos.Moon));
    const malDod = ctPlanetasNoSigno(pos, dodSigno, CT_MALEFICOS);
    linhas.push({ tem: `Duodécima parte da Lua em ${CT_S(dodSigno)}; ocupam esse signo: ${CT_LISTA_P(malDod)}.`, leitura: malDod.length ? CT_TEXTOS.corrupcao : null, fonte: CT_TEXTOS.fonteCorrupcao, ativo: malDod.length > 0 });
    const malLua = [];
    CT_MALEFICOS.forEach(id => { const d = ctDistSignos(sLua, ctSignoDe(pos[id])); if ([0, 3, 6].includes(d)) malLua.push(`${CT_P(id)} ${CT_ASPECTO_POR_DIST[d]}`); });
    linhas.push({ tem: `Maléficos com a Lua (junto, quadratura ou oposição): ${malLua.length ? malLua.join(', ') : 'nenhum'}.`, leitura: malLua.length ? CT_TEXTOS.corrupcao : null, fonte: CT_TEXTOS.fonteCorrupcao, ativo: malLua.length > 0 });
    const cLua = ctCasaDoSigno(sLua, sAsc);
    const c9 = cLua === 9 && ctGrupoDoSigno(sLua) === 'bicorporeo';
    linhas.push({ tem: `Lua na casa ${cLua}, em ${CT_S(sLua)}${c9 ? ' (casa 9 em signo bicorpóreo)' : ''}.`, leitura: c9 ? CT_TEXTOS.corrupcao : null, fonte: CT_TEXTOS.fonteCorrupcao, ativo: c9 });
    if (linhas.some(l => l.ativo)) {
      const sMC = signoDaCasa(10);
      const rem = [];
      CT_BENEFICOS.forEach(id => { const s = ctSignoDe(pos[id]); if (s === sAsc) rem.push(`${CT_P(id)} no Horóscopo`); if (s === sMC) rem.push(`${CT_P(id)} no Meio-do-Céu`); });
      linhas.push({ tem: `Remédio no mapa: ${rem.length ? rem.join(', ') : 'nenhum (Júpiter e Vênus fora do Horóscopo e do Meio-do-Céu)'}.`, leitura: CT_TEXTOS.remedio, fonte: CT_TEXTOS.fonteCorrupcao });
    }
    indicadores.push({ id: 'corrupcoes', titulo: 'Corrupções da Lua', linhas });
  }
  {
    // d) nodos (corrupção por eclipse)
    const sN = ctSignoDe(m.nodo), sS = (sN + 6) % 12, sX = (sN + 9) % 12; // descendente = oposto; limite sul extremo = 90° depois do descendente
    let onde = null;
    if (sLua === sN) onde = 'sobre o nodo ascendente';
    else if (sLua === sS) onde = 'sobre o nodo descendente';
    else if (sLua === sX) onde = 'no limite sul extremo (90° depois do nodo descendente)';
    let linha;
    if (comeco) linha = { tem: onde ? `Lua ${onde}, em ${CT_S(sLua)}.` : `Lua fora dos nodos e do limite sul extremo (nodo ascendente em ${CT_S(sN)}, descendente em ${CT_S(sS)}).`, leitura: onde ? CT_TEXTOS.nodosComeco : null, fonte: CT_TEXTOS.fonteNodos, ativo: !!onde };
    else linha = { tem: onde ? 'Lua nos nodos (corrupção)' : 'Lua fora dos nodos.', leitura: null, fonte: CT_TEXTOS.fonteNodos, ativo: !!onde };
    indicadores.push({ id: 'nodos', titulo: 'Nodos', linhas: [linha] });
  }

  /* 4. ângulos */
  {
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
      const ficha = (id) => {
        const s = ctSignoDe(pos[id]), c = ctCasaDoSigno(s, sAsc);
        const t = ctTestemunhas(pos, s, CT_BENEFICOS).filter(x => x.id !== id);
        return `${CT_P(id)} em ${CT_S(s)}, casa ${c}, ${c >= 7 ? 'acima' : 'abaixo'} da Terra, benéficos que testemunham: ${t.length ? t.map(x => `${CT_P(x.id)} ${x.como}`).join(', ') : 'nenhum'}`;
      };
      linhas.push({ tem: `Comparação. ${ficha('Sun')}. ${ficha('Moon')}.`, leitura: CT_TEXTOS.tribunalVence, fonte: CT_TEXTOS.fonteTribunal, nota: 'Lugar e limite pedem grau e não entram na versão 1; a ferramenta não decide quem vence.' });
    }
    indicadores.push({ id: 'angulos', titulo: tribunal ? 'Ângulos no tribunal' : 'Ângulos', linhas });
  }

  /* 5. assunto e capítulo */
  indicadores.push({ id: 'capitulo', titulo: 'Assunto e capítulo', linhas: [{ tem: `${assunto.nome}: abrir Hefestião III, ${assunto.hef}, e Doroteu V, ${assunto.dor}.`, leitura: null, fonte: 'Estudo, quadro "Uso em consulta"' }] });

  return { assunto, tipo: comeco ? 'comeco' : 'pergunta', casas: Array.from({ length: 12 }, (_, i) => signoDaCasa(i + 1)), indicadores };
}

/* texto puro dos marcadores {P:Moon} e {S:3} (Node e testes) */
function ctTextoPuro(s) {
  return String(s == null ? '' : s)
    .replace(/\{P:(\w+)\}/g, (_, id) => (CT_PLANETAS[id] ? CT_PLANETAS[id].nome : id))
    .replace(/\{S:(\d+)\}/g, (_, i) => CT_SIGNOS[+i]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ctSignoReto, ctCalcular, ctTextoPuro, ctLuzDaLua, ctDuodecima, ctTemposAscensao, ctGrupoDoSigno, ctDistSignos, ctCasaDoSigno, ctTestemunhas, CT_ASSUNTOS, CT_TEXTOS };
}

/* ==========================================
   TELA — calcula sozinha a partir do mapa salvo que está em tela (a Mandala); só escolhe assunto e tipo
   ========================================== */
let ctEscolha = { assunto: 'geral', tipo: 'comeco' };

function ctMarcadoresHtml(s) {
  const cru = escapeHtml(String(s == null ? '' : s));
  return cru
    .replace(/\{P:(\w+)\}/g, (_, id) => (typeof planetaComNome === 'function') ? planetaComNome(id, 20) : ctTextoPuro(`{P:${id}}`))
    .replace(/\{S:(\d+)\}/g, (_, i) => (typeof signoComNome === 'function' && typeof getSignSvgHtmlDec === 'function')
      ? signoComNome(getSignSvgHtmlDec(+i, 20), +i) : CT_SIGNOS[+i]);
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

function ctMontarIndicador(ind) {
  const linhas = ind.linhas.map(l => `
    <div class="ct-linha${l.ativo ? ' ct-ativo' : ''}">
      <div class="ct-tem">${ctMarcadoresHtml(l.tem)}</div>
      ${l.leitura ? `<div class="ct-leitura">${ctMarcadoresHtml(l.leitura)}</div>` : ''}
      ${l.nota ? `<div class="ct-nota">${escapeHtml(l.nota)}</div>` : ''}
      ${l.fonte ? `<div class="ct-fonte">Fonte: ${escapeHtml(l.fonte)}</div>` : ''}
    </div>`).join('');
  return `<div class="ct-indicador"><div class="ct-titulo">${escapeHtml(ind.titulo)}</div>${linhas}</div>`;
}

function ctExecutar() {
  const area = document.getElementById('ctResultado');
  if (!area) return;
  const e = ctLerMapa();
  if (e.erro) { area.innerHTML = ctMensagem(e.erro); return; }
  try {
    const r = ctCalcular(e, { assunto: ctEscolha.assunto, tipo: ctEscolha.tipo, oa: calcularAscensaoObliqua });
    area.innerHTML = r.indicadores.map(ctMontarIndicador).join('');
  } catch (err) {
    console.error(err);
    area.innerHTML = `<div style="color:var(--terracota); font-weight:700; font-size:13px;">Não foi possível calcular: ${escapeHtml(err.message || String(err))}</div>`;
  }
}
if (typeof window !== 'undefined') window.ctExecutar = ctExecutar;

function ctEscolher(campo, valor) { ctEscolha[campo] = valor; ctExecutar(); }
if (typeof window !== 'undefined') window.ctEscolher = ctEscolher;

function iniciarModuloCatarche() {
  const container = document.getElementById('mandala-container');
  if (!container) return;
  const opcoesAssunto = CT_ASSUNTOS.map(a => `<option value="${a.id}"${a.id === ctEscolha.assunto ? ' selected' : ''}>${escapeHtml(a.nome)}</option>`).join('');
  container.innerHTML = `
    <style>
      #ct-container .ct-controles { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 8px; }
      #ct-container .ct-controles label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; flex: 1 1 220px; }
      #ct-container .ct-controles .menu-select { width: 100%; font-size: 13px; }
      #ct-container .ct-indicador { background: transparent; border: 1px solid var(--azul-egipcio-claro); padding: 10px 14px; margin: 0 0 12px; }
      #ct-container .ct-titulo { font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--terracota); margin-bottom: 6px; }
      #ct-container .ct-linha { padding: 6px 0; font-size: 13px; line-height: 1.55; }
      #ct-container .ct-linha + .ct-linha { border-top: 1px solid var(--azul-egipcio-claro); }
      #ct-container .ct-tem { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 6px; color: var(--preto-tinta); }
      #ct-container .ct-leitura { margin-top: 3px; font-weight: 700; color: var(--preto-tinta); }
      #ct-container .ct-ativo .ct-leitura { color: var(--terracota); }
      #ct-container .ct-nota { margin-top: 3px; font-size: 11.5px; opacity: .75; font-style: italic; }
      #ct-container .ct-fonte { margin-top: 3px; font-size: 11.5px; opacity: .75; }
    </style>
    <div style="width: 100%; display: flex; flex-direction: column;">
      <div id="ct-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Catarché</h3></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        ${(typeof montarCabecalhoMandalaImagemHTML === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}
        <hr class="divisa">
        <div class="ct-controles">
          <label>Assunto
            <select id="ctAssunto" class="menu-select" onchange="ctEscolher('assunto', this.value)">${opcoesAssunto}</select>
          </label>
          <label>Tipo do mapa
            <select id="ctTipo" class="menu-select" onchange="ctEscolher('tipo', this.value)">
              <option value="comeco"${ctEscolha.tipo === 'comeco' ? ' selected' : ''}>Começo (obra, evento ou data a escolher)</option>
              <option value="pergunta"${ctEscolha.tipo === 'pergunta' ? ' selected' : ''}>Pergunta</option>
            </select>
          </label>
        </div>
        <div class="texto-apagado" style="font-size:11.5px; line-height:1.55; margin-bottom:10px;">A ferramenta não prevê: mostra o que o texto antigo diz sobre o que o mapa tem. Casas por signos inteiros; conjunção e aspecto por signo.</div>
        <div id="ctResultado"></div>
        <hr class="divisa-fim">
      </div>
    </div>`;
  ctExecutar();
}
if (typeof window !== 'undefined') window.iniciarModuloCatarche = iniciarModuloCatarche;
