/* ==========================================
   ONDE ESTOU HOJE — módulo puro (sem tela), prefixo `oe`
   Dado UM mapa (data, hora, local), diz em que ponto o tempo de hoje está em cada técnica:
   Circumambulação pelo Ascendente (termo e aspecto), Liberação Zodiacal de Fortuna/Espírito/Eros (níveis 1 a 4),
   Decênios (níveis 1 a 3) e Profecção (ano, mês e passo de 60 horas).

   Quem usa: o Hellenic Daily (hoje o caderno do astrólogo, no Falando de Astrologia, que carrega este arquivo do site do Astro Hellenic).
   Circumambulação e Liberação vêm de `retificacao-calculos.js` (precisa estar carregado antes, funções `rq*`; em Node, é requerido
   aqui). Decênios, Profecção e o fuso estão aqui porque nas ferramentas só existem presos à tela: SE MEXER na regra de
   `decenios.js` ou `profeccao.js`, conferir aqui também (`node onde-estou.conferir.js`).
   ========================================== */

const OE_MOTOR = 'https://motor-astrologia.vercel.app/api';
const OE_SIGNOS_INDEX = { Aries: 0, Touro: 1, Gemeos: 2, Cancer: 3, Leao: 4, Virgem: 5, Libra: 6, Escorpiao: 7, Sagitario: 8, Capricornio: 9, Aquario: 10, Peixes: 11 };
const OE_DIA_MS = 86400000;

/* Decênios (decenios.js): PLANETS_DECENIOS */
const OE_PLANETAS_DEC = [
  { id: 'Sun', minorYears: 19, days: 570 }, { id: 'Moon', minorYears: 25, days: 750 }, { id: 'Mercury', minorYears: 20, days: 600 },
  { id: 'Venus', minorYears: 8, days: 240 }, { id: 'Mars', minorYears: 15, days: 450 }, { id: 'Jupiter', minorYears: 12, days: 360 }, { id: 'Saturn', minorYears: 30, days: 900 }
];
/* Profecção (profeccao.js): MONTH_MS e DAILY_STEP_MS */
const OE_MES_MS = (30 + (10.5 / 24)) * OE_DIA_MS;
const OE_PASSO_MS = 2.5 * OE_DIA_MS;

if (typeof module !== 'undefined' && module.exports && typeof rqCircumambulacao === 'undefined') {
  const rq = require('./retificacao-calculos.js');
  Object.keys(rq).forEach(k => { global[k] = rq[k]; });
}

/* ---------- fuso do mapa na data de nascimento (mandala.js: calcularFusoPreciso). Precisa do `tz-lookup.js` carregado. ---------- */
function oeOffsetMinutosNaData(zonaIana, ano, mes, dia, hora, minuto) {
  const formatador = new Intl.DateTimeFormat('en-US', { timeZone: zonaIana, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const deslocamentoPara = (instanteUTC) => {
    const m = {};
    formatador.formatToParts(new Date(instanteUTC)).forEach(p => { if (p.type !== 'literal') m[p.type] = parseInt(p.value, 10); });
    if (m.hour === 24) m.hour = 0;
    return (Date.UTC(m.year, m.month - 1, m.day, m.hour, m.minute, m.second) - instanteUTC) / 60000;
  };
  const chuteUTC = Date.UTC(ano, mes - 1, dia, hora, minuto, 0);
  const primeiro = deslocamentoPara(chuteUTC);
  return deslocamentoPara(chuteUTC - primeiro * 60000);
}
function oeFuso(lat, lon, ano, mes, dia, hora, minuto) {
  try {
    if (typeof tzlookup !== 'function') throw new Error('sem tz-lookup');
    const off = oeOffsetMinutosNaData(tzlookup(lat, lon), ano, mes, dia, hora, minuto);
    if (isNaN(off)) throw new Error('offset inválido');
    return off / 60;
  } catch (e) { return Math.round(lon / 15); }
}

/* ---------- o mapa pelo motor de astrologia (mandala.js: executarCalculoInterno) ---------- */
async function oeBuscarMapa(nasc, fetchFn) {
  const f = fetchFn || fetch;
  const p2 = (n) => String(n).padStart(2, '0');
  const url = `${OE_MOTOR}/index?data=${nasc.ano}-${p2(nasc.mes)}-${p2(nasc.dia)}&hora=${p2(nasc.hora)}:${p2(nasc.min)}&fuso=${nasc.fuso}&lat=${nasc.lat}&lon=${nasc.lon}`;
  const res = await f(url);
  if (!res.ok) throw new Error('motor ' + res.status);
  const j = await res.json(), pl = j.planetas || {}, asc = j.ascendente || {};
  const g = (x) => (x ? Number(x.grau_absoluto) : 0);
  return {
    asc: ((OE_SIGNOS_INDEX[asc.signo] || 0) * 30) + (parseFloat(asc.grau) || 0),
    Sun: g(pl.Sol), Moon: g(pl.Lua), Mercury: g(pl.Mercurio), Venus: g(pl.Venus), Mars: g(pl.Marte), Jupiter: g(pl.Jupiter), Saturn: g(pl.Saturno)
  };
}

/* ---------- lotes (mandala.js: calculateSevenLots, só os três pedidos) ---------- */
function oeLotes(m) {
  const dia = ((m.Sun - m.asc + 360) % 360) >= 180;
  const n = (x) => (x + 36000) % 360;
  const fort = n(dia ? (m.asc + m.Moon - m.Sun) : (m.asc + m.Sun - m.Moon));
  const esp = n(dia ? (m.asc + m.Sun - m.Moon) : (m.asc + m.Moon - m.Sun));
  const eros = n(dia ? (m.asc + m.Venus - esp) : (m.asc + esp - m.Venus));
  return { dia, fortune: fort, spirit: esp, venus: eros };
}

/* ---------- Circumambulação pelo Ascendente ---------- */
function oeCircumambulacao(m, nascDate, lat, agora) {
  const tabela = rqCircumambulacao(m.asc, nascDate, lat);
  const linha = rqLinhaCircumambulacao(tabela, agora);
  const termo = linha ? { signIdx: linha.signIdx, planetId: linha.termPlanetId, ate: linha.endDate } : null;
  /* o aspecto: o raio (aktinobolia) mais recente que o ponto já passou, contado em anos de ascensão desde o Ascendente */
  const raios = rqRaiosAspectos({ Sun: m.Sun, Moon: m.Moon, Mercury: m.Mercury, Venus: m.Venus, Mars: m.Mars, Jupiter: m.Jupiter, Saturn: m.Saturn }, m.asc, nascDate, lat);
  let atual = null;
  raios.forEach(r => {
    const data = new Date(nascDate.getTime() + Number(r.yearsOld) * 365.25 * OE_DIA_MS);
    if (data <= agora && (!atual || data > atual.data)) atual = { planetId: r.planetId, tipo: r.aspectType, signIdx: r.signIdx, degInSign: r.degInSign, data };
  });
  return { termo, aspecto: atual };
}

/* ---------- Liberação Zodiacal de um lote ---------- */
function oeLiberacao(grauLote, grauFortuna, ehEspirito, nascDate, agora) {
  const signoLote = Math.floor(grauLote / 30), signoFort = Math.floor(grauFortuna / 30);
  /* liberacao.js (Valens IV.V): Espírito no mesmo signo da Fortuna começa no signo seguinte */
  const inicio = (ehEspirito && signoLote === signoFort) ? (signoLote + 1) % 12 : signoLote;
  const r = rqLiberacaoEm(inicio, nascDate, agora);
  if (!r) return null;
  return ['l1', 'l2', 'l3', 'l4'].map((k, i) => (r[k] ? { nivel: i + 1, signIdx: r[k].signIdx, ate: r[k].end, lysis: !!r[k].isLysis } : null));
}

/* ---------- Decênios (decenios.js: calcularDeceniosAutomatico; a luz da seita começa) ---------- */
function oeDecenios(m, nascDate, agora) {
  const luz = ((m.Sun - m.asc + 360) % 360) >= 180 ? 'Sun' : 'Moon';
  const cart = OE_PLANETAS_DEC.map((p, i) => ({ ...p, absDeg: m[p.id], originalIndex: i }));
  const ini = cart.find(p => p.id === luz).absDeg;
  const ordem = [...cart].sort((a, b) => {
    const da = (a.absDeg - ini + 360) % 360, db = (b.absDeg - ini + 360) % 360;
    if (Math.abs(da - db) < 0.00001) return a.originalIndex - b.originalIndex;
    return da - db;
  });
  let ponteiro = new Date(nascDate);
  for (let i = 0; i < 10; i++) {
    const p1 = ordem[i % 7], ini1 = new Date(ponteiro), fim1 = new Date(ini1.getTime() + 3870 * OE_DIA_MS);
    if (agora >= ini1 && agora < fim1) {
      const idx1 = ordem.findIndex(p => p.id === p1.id);
      let p = new Date(ini1);
      for (let k = 0; k < 7; k++) {
        const p2 = ordem[(idx1 + k) % 7], ini2 = new Date(p), fim2 = new Date(ini2.getTime() + p2.days * OE_DIA_MS);
        if (agora >= ini2 && agora < fim2) {
          const idx2 = ordem.findIndex(x => x.id === p2.id);
          let q = new Date(ini2);
          for (let j = 0; j < 7; j++) {
            const p3 = ordem[(idx2 + j) % 7], ini3 = new Date(q), fim3 = new Date(ini3.getTime() + (p3.minorYears / 129) * p2.days * OE_DIA_MS);
            if (agora >= ini3 && agora < fim3) return [{ nivel: 1, planetId: p1.id, ate: fim1 }, { nivel: 2, planetId: p2.id, ate: fim2 }, { nivel: 3, planetId: p3.id, ate: fim3 }];
            q = fim3;
          }
          return [{ nivel: 1, planetId: p1.id, ate: fim1 }, { nivel: 2, planetId: p2.id, ate: fim2 }];
        }
        p = fim2;
      }
    }
    ponteiro = fim1;
  }
  return null;
}

/* ---------- Profecção (profeccao.js: iniciarModuloProfeccao). O mês começa na Revolução Solar do ano profectado. ---------- */
async function oeInicioRevolucaoSolar(nasc, anoAlvo, fetchFn) {
  const f = fetchFn || fetch, p2 = (n) => String(n).padStart(2, '0');
  const url = `${OE_MOTOR}/revolucao?data=${nasc.ano}-${p2(nasc.mes)}-${p2(nasc.dia)}&hora=${p2(nasc.hora)}:${p2(nasc.min)}&lat=${nasc.lat}&lon=${nasc.lon}&fuso=${nasc.fuso}&ano=${anoAlvo}`;
  const res = await f(url);
  if (!res.ok) return null;
  const j = await res.json(), me = j.momento_exato || {};
  let anoR = anoAlvo, mesR = nasc.mes - 1, diaR = nasc.dia, horaR = 12, minR = 0;
  if (me.data_utc && me.data_utc.includes('-')) { const d = me.data_utc.split('-'); anoR = parseInt(d[0]) || anoAlvo; mesR = (parseInt(d[1]) || 1) - 1; diaR = parseInt(d[2]) || nasc.dia; }
  if (me.hora_local && me.hora_local.includes(':')) { const h = me.hora_local.split(':'); horaR = parseInt(h[0]) || 0; minR = parseInt(h[1]) || 0; }
  return new Date(anoR, mesR, diaR, horaR, minR).getTime();
}
async function oeProfeccao(m, nasc, nascDate, agora, fetchFn) {
  let idade = agora.getFullYear() - nascDate.getFullYear();
  const dm = agora.getMonth() - nascDate.getMonth();
  if (dm < 0 || (dm === 0 && agora.getDate() < nascDate.getDate())) idade--;
  if (idade < 0) idade = 0;
  const signoAno = (Math.floor(m.asc / 30) + (idade % 12)) % 12;
  const anoAlvo = nascDate.getFullYear() + idade;
  let inicio = null;
  try { inicio = await oeInicioRevolucaoSolar(nasc, anoAlvo, fetchFn); } catch (e) { inicio = null; }
  if (!inicio) inicio = new Date(anoAlvo, nascDate.getMonth(), nascDate.getDate(), nascDate.getHours(), nascDate.getMinutes()).getTime();
  const t = agora.getTime();
  const mes = Math.floor((t - inicio) / OE_MES_MS);
  if (mes < 0 || mes > 11) return { idade, ano: { signIdx: signoAno }, mes: null, passo: null };
  const signoMes = (signoAno + mes) % 12, iniMes = inicio + mes * OE_MES_MS;
  const passo = Math.min(11, Math.floor((t - iniMes) / OE_PASSO_MS));
  return { idade, ano: { signIdx: signoAno }, mes: { num: mes + 1, signIdx: signoMes }, passo: { num: passo + 1, signIdx: (signoMes + passo) % 12 } };
}

/* ---------- tudo junto ----------
   nasc: { ano, mes, dia, hora, min, lat, lon, fuso? } (fuso ausente = o do lugar na data de nascimento). agora: Date (padrão: hoje). */
async function ondeEstouHoje(nasc, agora, fetchFn) {
  agora = agora || new Date();
  const n = { ...nasc };
  if (n.fuso === undefined || n.fuso === null) n.fuso = oeFuso(n.lat, n.lon, n.ano, n.mes, n.dia, n.hora, n.min);
  const nascDate = new Date(n.ano, n.mes - 1, n.dia, n.hora, n.min);
  const m = await oeBuscarMapa(n, fetchFn);
  const lotes = oeLotes(m);
  return {
    seita: lotes.dia ? 'diurno' : 'noturno',
    circumambulacao: oeCircumambulacao(m, nascDate, n.lat, agora),
    liberacao: {
      fortune: oeLiberacao(lotes.fortune, lotes.fortune, false, nascDate, agora),
      spirit: oeLiberacao(lotes.spirit, lotes.fortune, true, nascDate, agora),
      venus: oeLiberacao(lotes.venus, lotes.fortune, false, nascDate, agora)
    },
    decenios: oeDecenios(m, nascDate, agora),
    profeccao: await oeProfeccao(m, n, nascDate, agora, fetchFn)
  };
}

if (typeof window !== 'undefined') window.ondeEstouHoje = ondeEstouHoje;
if (typeof module !== 'undefined' && module.exports) module.exports = { ondeEstouHoje, oeBuscarMapa, oeLotes, oeCircumambulacao, oeLiberacao, oeDecenios, oeProfeccao, oeFuso };
