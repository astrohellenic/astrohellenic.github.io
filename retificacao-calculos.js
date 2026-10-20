/* ==========================================
   RETIFICAÇÃO — CÁLCULOS COPIADOS DA CIRCUMAMBULAÇÃO (direcoes.js) E DA LIBERAÇÃO ZODIACAL (liberacao.js)
   Só contas, sem tela. Prefixo `rq`. Serve para a seção "Confirmação pelos fatos da vida" da retificação rodar essas duas
   técnicas para um horário de teste, sem mexer no mapa em tela e sem tocar nas ferramentas originais.

   É UMA CÓPIA (decisão do astrólogo, 20/10/2026). Mexeu no cálculo de direcoes.js ou liberacao.js? Atualize aqui também.
   Conferência: rodar `node retificacao-calculos.conferir.js`, que carrega as ferramentas originais e compara os resultados.
   ========================================== */

/* ---------- Circumambulação (direcoes.js) ---------- */
const RQ_OBLIQUIDADE = 23.4367;   // OBLIQUIDADE_ECLIPTICA_GRAUS

/* Termos egípcios de Valens, na forma que direcoes.js usa: por signo, [{ pId, deg (fim do termo) }] */
const RQ_TERMOS = [
  [{ pId: "Jupiter", deg: 6 }, { pId: "Venus", deg: 12 }, { pId: "Mercury", deg: 20 }, { pId: "Mars", deg: 25 }, { pId: "Saturn", deg: 30 }],
  [{ pId: "Venus", deg: 8 }, { pId: "Mercury", deg: 14 }, { pId: "Jupiter", deg: 22 }, { pId: "Saturn", deg: 27 }, { pId: "Mars", deg: 30 }],
  [{ pId: "Mercury", deg: 6 }, { pId: "Jupiter", deg: 12 }, { pId: "Venus", deg: 17 }, { pId: "Mars", deg: 24 }, { pId: "Saturn", deg: 30 }],
  [{ pId: "Mars", deg: 7 }, { pId: "Venus", deg: 13 }, { pId: "Mercury", deg: 19 }, { pId: "Jupiter", deg: 26 }, { pId: "Saturn", deg: 30 }],
  [{ pId: "Jupiter", deg: 6 }, { pId: "Venus", deg: 11 }, { pId: "Saturn", deg: 18 }, { pId: "Mercury", deg: 24 }, { pId: "Mars", deg: 30 }],
  [{ pId: "Mercury", deg: 7 }, { pId: "Venus", deg: 17 }, { pId: "Jupiter", deg: 21 }, { pId: "Mars", deg: 28 }, { pId: "Saturn", deg: 30 }],
  [{ pId: "Saturn", deg: 6 }, { pId: "Mercury", deg: 14 }, { pId: "Jupiter", deg: 21 }, { pId: "Venus", deg: 28 }, { pId: "Mars", deg: 30 }],
  [{ pId: "Mars", deg: 7 }, { pId: "Venus", deg: 11 }, { pId: "Mercury", deg: 19 }, { pId: "Jupiter", deg: 24 }, { pId: "Saturn", deg: 30 }],
  [{ pId: "Jupiter", deg: 12 }, { pId: "Venus", deg: 17 }, { pId: "Mercury", deg: 21 }, { pId: "Saturn", deg: 26 }, { pId: "Mars", deg: 30 }],
  [{ pId: "Mercury", deg: 7 }, { pId: "Jupiter", deg: 14 }, { pId: "Venus", deg: 22 }, { pId: "Saturn", deg: 26 }, { pId: "Mars", deg: 30 }],
  [{ pId: "Mercury", deg: 7 }, { pId: "Venus", deg: 13 }, { pId: "Jupiter", deg: 20 }, { pId: "Mars", deg: 25 }, { pId: "Saturn", deg: 30 }],
  [{ pId: "Venus", deg: 12 }, { pId: "Jupiter", deg: 16 }, { pId: "Mercury", deg: 19 }, { pId: "Mars", deg: 28 }, { pId: "Saturn", deg: 30 }]
];

function rqRad(g) { return (g * Math.PI) / 180; }
function rqGraus(r) { return (r * 180) / Math.PI; }
function rqNorm(g) { return ((g % 360) + 360) % 360; }

function rqDeclinacao(lon) {
  return rqGraus(Math.asin(Math.sin(rqRad(RQ_OBLIQUIDADE)) * Math.sin(rqRad(lon))));
}
function rqAscensaoReta(lon) {
  const eps = rqRad(RQ_OBLIQUIDADE), lam = rqRad(lon);
  return rqNorm(rqGraus(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam))));
}
function rqDiferencaAscensional(decl, lat) {
  let produto = Math.tan(rqRad(decl)) * Math.tan(rqRad(lat));
  produto = Math.max(-1, Math.min(1, produto));
  return rqGraus(Math.asin(produto));
}
function rqAscensaoObliqua(lon, lat) {
  return rqNorm(rqAscensaoReta(lon) - rqDiferencaAscensional(rqDeclinacao(lon), lat));
}
/* anos (1° de ascensão = 1 ano) entre dois graus absolutos, sempre para frente */
function rqTempoAscensional(grauInicioAbs, grauFimAbs, lat) {
  let anos = rqAscensaoObliqua(grauFimAbs, lat) - rqAscensaoObliqua(grauInicioAbs, lat);
  if (anos < 0) anos += 360;
  return anos;
}

/* Os 12 signos pelos termos, a partir de um ponto (graus absolutos). Igual a calcular12SignosCircumambulatoria; a latitude entra como parâmetro. */
function rqCircumambulacao(startAbsDeg, birthDate, lat) {
  const tabela = [];
  let currDate = new Date(birthDate);
  let totalYearsAccum = 0;
  const startSignIdx = Math.floor(startAbsDeg / 30);
  const startDegInSign = startAbsDeg % 30;
  for (let sOffset = 0; sOffset < 12; sOffset++) {
    const signIdx = (startSignIdx + sOffset) % 12;
    const signBaseAbsDeg = signIdx * 30;
    let prevTermDeg = 0;
    RQ_TERMOS[signIdx].forEach((t) => {
      const termStartDeg = prevTermDeg;
      const termEndDeg = t.deg;
      prevTermDeg = t.deg;
      let startDate = null, endDate = null, startYearsOld = null, endYearsOld = null;
      if (sOffset > 0 || termEndDeg > startDegInSign) {
        const effStart = (sOffset === 0 && termStartDeg < startDegInSign) ? startDegInSign : termStartDeg;
        const years = rqTempoAscensional(signBaseAbsDeg + effStart, signBaseAbsDeg + termEndDeg, lat);
        startDate = new Date(currDate);
        endDate = new Date(currDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
        if (sOffset > 0 || termStartDeg >= startDegInSign) startYearsOld = totalYearsAccum.toFixed(1);
        endYearsOld = (totalYearsAccum + years).toFixed(1);
        totalYearsAccum += years;
        currDate = new Date(endDate);
      }
      tabela.push({ signIdx, termStartDeg, termEndDeg, termPlanetId: t.pId, startYearsOld, endYearsOld, startDate, endDate });
    });
  }
  return tabela;
}

/* Agrupa as linhas da tabela em "passagens": cada passagem é um signo com os seus termos (a pauta de signo da ferramenta). Igual ao signPassages de direcoes.js. */
function rqPassagens(tabela) {
  const lista = []; let atual = null;
  tabela.forEach(row => {
    if (!atual || atual.signIdx !== row.signIdx) { atual = { signIdx: row.signIdx, terms: [] }; lista.push(atual); }
    atual.terms.push(row);
  });
  return lista;
}

function rqDataBR(d) {
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

/* Raios dos aspectos (aktinobolia): cada planeta, em conjunção/sextil/quadratura/trígono/oposição ao ponto de partida, vira uma data.
   Igual a calcularRaiosAspectos de direcoes.js. planetas: { Sun: grau absoluto, Moon: ..., Mercury, Venus, Mars, Jupiter, Saturn } */
function rqRaiosAspectos(planetas, startAbsDeg, birthDate, lat) {
  const aspectDefs = [
    { offset: 0, type: 'conj' }, { offset: 60, type: 'sex' }, { offset: 90, type: 'squ' }, { offset: 120, type: 'tri' },
    { offset: 180, type: 'opp' }, { offset: 240, type: 'tri' }, { offset: 270, type: 'squ' }, { offset: 300, type: 'sex' }
  ];
  const raios = [];
  ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach(pId => {
    if (planetas[pId] === undefined) return;
    aspectDefs.forEach(asp => {
      const rayAbsDeg = (planetas[pId] + asp.offset) % 360;
      const accumulatedYears = rqTempoAscensional(startAbsDeg, rayAbsDeg, lat);
      const rayDate = new Date(birthDate.getTime() + (accumulatedYears * 365.25 * 24 * 60 * 60 * 1000));
      raios.push({
        rayAbsDeg, signIdx: Math.floor(rayAbsDeg / 30), degInSign: rayAbsDeg % 30, planetId: pId, aspectType: asp.type,
        yearsOld: accumulatedYears.toFixed(1), idadeTxt: rqIdade(birthDate, rayDate), exactDate: rqDataBR(rayDate)
      });
    });
  });
  return raios;
}

/* A linha da Circumambulação que cobre uma data (ou null se a data é antes do ponto de partida ou depois dos 12 signos) */
function rqLinhaCircumambulacao(tabela, data) {
  return tabela.find(l => l.startDate && l.endDate && data >= l.startDate && data < l.endDate) || null;
}

/* ---------- Liberação Zodiacal (liberacao.js) ---------- */
const RQ_ZR_ANOS = [15, 8, 20, 25, 19, 20, 8, 15, 12, 27, 30, 12];   // ZR_SIGN_YEARS

function rqFimZR(dataInicio, anos) {          // calcularDataFimZR: anos de 360 dias
  const fim = new Date(dataInicio);
  fim.setDate(fim.getDate() + anos * 360);
  return fim;
}

/* L2 (meses de 30 dias), L3 (2,5 dias por unidade), L4 (5 horas por unidade). Mesma regra dos três: percorre os signos a partir do
   do período pai, e depois de 12 salta para o signo oposto (Lysis). */
function rqSubperiodos(nivel, paiSignIdx, paiInicio, paiFim) {
  const lista = [];
  let sign = paiSignIdx, ini = new Date(paiInicio), n = 0;
  while (ini < paiFim) {
    if (n === 12) sign = (paiSignIdx + 6) % 12;
    const u = RQ_ZR_ANOS[sign];
    const msUnidade = nivel === 2 ? u * 30 * 86400000 : nivel === 3 ? u * 2.5 * 86400000 : u * 5 * 3600000;
    let fim = new Date(ini.getTime() + msUnidade), cortou = false;
    if (fim > paiFim) { fim = new Date(paiFim); cortou = true; }
    lista.push({ signIdx: sign, start: new Date(ini), end: new Date(fim), isLysis: n === 12 });
    if (cortou) break;
    ini = new Date(fim);
    sign = (sign + 1) % 12;
    n++;
  }
  return lista;
}

/* Os níveis da Liberação que cobrem uma data, a partir do signo do lote: { l1, l2, l3, l4 } (cada um { signIdx, start, end, isLysis? }) ou null.
   O L1 começa no nascimento; no Espírito, quando Espírito e Fortuna caem no mesmo signo, começa no signo seguinte (liberacao.js, Valens IV.V). */
function rqLiberacaoEm(startSignIdx, birthDate, data) {
  let ini = new Date(birthDate);
  for (let i = 0; i < 12; i++) {
    const sign = (startSignIdx + i) % 12;
    const anos = RQ_ZR_ANOS[sign];
    const fim = rqFimZR(ini, anos);
    if (data >= ini && data < fim) {
      const r = { l1: { signIdx: sign, start: new Date(ini), end: fim } };
      const l2 = rqSubperiodos(2, sign, ini, fim).find(x => data >= x.start && data < x.end);
      if (l2) {
        r.l2 = l2;
        const l3 = rqSubperiodos(3, l2.signIdx, l2.start, l2.end).find(x => data >= x.start && data < x.end);
        if (l3) {
          r.l3 = l3;
          const l4 = rqSubperiodos(4, l3.signIdx, l3.start, l3.end).find(x => data >= x.start && data < x.end);
          if (l4) r.l4 = l4;
        }
      }
      return r;
    }
    ini = new Date(fim);
  }
  return null;
}

/* Idade em anos e meses de calendário, por extenso: "33 anos e 10 meses" (idadeCompactaDir, direcoes.js) */
function rqIdade(de, ate) {
  let anos = ate.getFullYear() - de.getFullYear();
  let meses = ate.getMonth() - de.getMonth();
  if (ate.getDate() < de.getDate()) meses -= 1;
  if (meses < 0) { anos -= 1; meses += 12; }
  if (anos < 0) return '';
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}` + (meses ? ` e ${meses} ${meses === 1 ? 'mês' : 'meses'}` : '');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { rqPassagens, rqRaiosAspectos, rqDataBR, rqCircumambulacao, rqLinhaCircumambulacao, rqLiberacaoEm, rqSubperiodos, rqFimZR, rqTempoAscensional, rqIdade, RQ_TERMOS, RQ_ZR_ANOS };
}
