/* ==========================================
   ACHADOR DE HORÁRIO PELA SIZÍGIA PRÉ-NATAL (retificação pelos antigos)
   Fontes: Ptolomeu, Tetrabiblos III.2; Hefestião, Apotelesmatika II.2; Valens, Antologias I.5 e I.9.
   Zodíaco tropical, signos inteiros, termos egípcios (sem termos medievais).

   Não entram, de propósito: os métodos aproximados do Ascendente sem hora (Hefestião II.1 e II.2, Anúbio — o tradutor avisa que o
   texto pode estar corrompido e todos os nascidos no mesmo dia dariam o mesmo Ascendente) e o cálculo da concepção (quase circular,
   não distingue horários).

   Divisão do arquivo:
   1) cálculo (sem tela, roda em Node: ver module.exports no fim)
        - dignidades e contagem das vias (Ptolomeu/Hefestião) e regra de Valens I.5;
        - Ascendente e Meio do Céu em qualquer instante (fórmula própria: tempo sideral + nutação), busca do instante em que cada um
          chega a um grau, Fortuna e a hora em que ela muda de signo;
        - rzCalcular(): junta tudo; as posições dos planetas vêm do motor (Swiss Ephemeris, motor-astrologia.vercel.app), injetado.
   2) tela (iniciarModuloRetificacaoSizigia)
   ========================================== */

const RZ_SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

/* chave do motor (planetas.<chave>) de cada planeta */
const RZ_PLANETAS = {
  Sun:     { nome: 'Sol',      motor: 'Sol' },
  Moon:    { nome: 'Lua',      motor: 'Lua' },
  Mercury: { nome: 'Mercúrio', motor: 'Mercurio' },
  Venus:   { nome: 'Vênus',    motor: 'Venus' },
  Mars:    { nome: 'Marte',    motor: 'Marte' },
  Jupiter: { nome: 'Júpiter',  motor: 'Jupiter' },
  Saturn:  { nome: 'Saturno',  motor: 'Saturno' }
};
const RZ_ORDEM = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/* Senhor do signo (domicílio) */
const RZ_DOMICILIO = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
/* Signo de exaltação de cada planeta */
const RZ_EXALTACAO = { Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6 };
/* Os três senhores de cada trígono (tabela de Doroteu — A CONFIRMAR). Índice = signo % 4: fogo, terra, ar, água. Qualquer dos três conta. */
const RZ_TRIPLICIDADE = [
  ['Sun', 'Jupiter', 'Saturn'],
  ['Venus', 'Moon', 'Mars'],
  ['Saturn', 'Mercury', 'Jupiter'],
  ['Venus', 'Mars', 'Moon']
];
const RZ_ELEMENTO = ['fogo', 'terra', 'ar', 'água'];
/* Aspectos por signos inteiros: distância em signos → nome */
const RZ_ASPECTOS = { 0: 'conjunção', 2: 'sextil', 3: 'quadratura', 4: 'trígono', 6: 'oposição' };
const RZ_SIMBOLO_TERMO = { '♃': 'Jupiter', '♀': 'Venus', '☿': 'Mercury', '♂': 'Mars', '♄': 'Saturn' };

/* ---------- posições na eclíptica ---------- */
function rzNorm360(x) { return ((x % 360) + 360) % 360; }
function rzSignoDe(lon) { return Math.floor(rzNorm360(lon) / 30) % 12; }
function rzDistAng(a, b) { const d = Math.abs(rzNorm360(a) - rzNorm360(b)); return d > 180 ? 360 - d : d; }

/* "7°57′ Capricórnio" a partir de uma longitude. Os minutos são arredondados; 59,6′ vira o grau seguinte (e 29°59,6′ vira o signo seguinte). */
function rzFmtPos(lon, comSigno) {
  let total = Math.round(rzNorm360(lon) * 60);        // arco-minutos
  if (total >= 21600) total -= 21600;
  const signo = Math.floor(total / 1800);
  const resto = total - signo * 1800;
  const g = Math.floor(resto / 60), m = resto % 60;
  return `${g}°${String(m).padStart(2, '0')}′` + (comSigno === false ? '' : ' ' + RZ_SIGNOS[signo]);
}
/* grau do signo e minutos, sem signo ("7°57′") */
function rzFmtGrau(grauNoSigno) { return rzFmtPos(grauNoSigno, false); }

/* ---------- termos egípcios (lidos da tabela do site, mandala.js: uma só definição) ---------- */
function rzTermoSenhor(lon) {
  const s = rzSignoDe(lon);
  const g = rzNorm360(lon) - s * 30;
  const tab = (typeof EGYPTIAN_TERMS !== 'undefined') ? EGYPTIAN_TERMS : null;
  if (!tab || !tab[s]) throw new Error('Tabela de termos egípcios não carregada');
  const faixa = tab[s].find(t => g < t.deg) || tab[s][tab[s].length - 1];
  return RZ_SIMBOLO_TERMO[faixa.p];
}

/* ---------- Ptolomeu/Hefestião: contagem das cinco vias ----------
   Cada planeta ganha 1 ponto por via que o liga ao ponto: triplicidade (qualquer dos 3 senhores do trígono), domicílio, exaltação,
   termo egípcio e aspecto por signos (conjunção, sextil, quadratura, trígono, oposição). */
function rzVias(id, lonPlaneta, lonPonto) {
  const sPonto = rzSignoDe(lonPonto), sPlan = rzSignoDe(lonPlaneta);
  const aspecto = RZ_ASPECTOS[Math.min((sPlan - sPonto + 12) % 12, (sPonto - sPlan + 12) % 12)] || null;
  const vias = {
    triplicidade: RZ_TRIPLICIDADE[sPonto % 4].includes(id),
    domicilio: RZ_DOMICILIO[sPonto] === id,
    exaltacao: RZ_EXALTACAO[id] === sPonto,
    termo: rzTermoSenhor(lonPonto) === id,
    aspecto
  };
  vias.total = (vias.triplicidade ? 1 : 0) + (vias.domicilio ? 1 : 0) + (vias.exaltacao ? 1 : 0) + (vias.termo ? 1 : 0) + (aspecto ? 1 : 0);
  return vias;
}

/* posicoes: { Sun: lon, Moon: lon, ... } → { linhas: [{id, lon, vias}], vencedores: [ids] } (empate: todos os empatados) */
function rzContagem(posicoes, lonPonto) {
  const linhas = RZ_ORDEM.filter(id => posicoes[id] !== undefined).map(id => ({ id, lon: posicoes[id], vias: rzVias(id, posicoes[id], lonPonto) }));
  const max = Math.max.apply(null, linhas.map(l => l.vias.total));
  return { linhas, max, vencedores: linhas.filter(l => l.vias.total === max).map(l => l.id) };
}

/* Valens I.5: o senhor do termo e o senhor do signo do ponto */
function rzValens(lonPonto) {
  return { termo: rzTermoSenhor(lonPonto), signo: RZ_DOMICILIO[rzSignoDe(lonPonto)] };
}

/* ---------- Ascendente e Meio do Céu em qualquer instante ----------
   Tempo sideral aparente (média + nutação) e obliquidade verdadeira; nutação em longitude e obliquidade pela série IAU 1980
   (20 maiores termos, erro abaixo de 0,05″). Conferido contra o Swiss Ephemeris (swe.houses) em centenas de casos. */
const RZ_NUTACAO = [ // D, M, M', F, Ω,  Δψ (0,0001″), Δψ·T, Δε (0,0001″), Δε·T
  [0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9], [-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1], [0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5],
  [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5], [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1], [0, 0, 1, 0, 0, 712, 0.1, -7, 0],
  [-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6], [0, 0, 0, 2, 1, -386, -0.4, 200, 0], [0, 0, 1, 2, 2, -301, 0, 129, -0.1],
  [-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3], [-2, 0, 1, 0, 0, -158, 0, 0, 0], [-2, 0, 0, 2, 1, 129, 0.1, -70, 0],
  [0, 0, -1, 2, 2, 123, 0, -53, 0], [2, 0, 0, 0, 0, 63, 0, 0, 0], [0, 0, 1, 0, 1, 63, 0.1, -33, 0],
  [2, 0, -1, 2, 2, -59, 0, 26, 0], [0, 0, -1, 0, 1, -58, -0.1, 32, 0], [0, 0, 1, 2, 1, -51, 0, 27, 0],
  [-2, 0, 2, 0, 0, 48, 0, 0, 0], [0, 0, -2, 2, 1, 46, 0, -24, 0]
];
function rzJD(ms) { return ms / 86400000 + 2440587.5; }

function rzNutacao(jd) {
  const T = (jd - 2451545.0) / 36525, rad = Math.PI / 180;
  const D = 297.85036 + 445267.111480 * T - 0.0019142 * T * T + T * T * T / 189474;
  const M = 357.52772 + 35999.050340 * T - 0.0001603 * T * T - T * T * T / 300000;
  const Mp = 134.96298 + 477198.867398 * T + 0.0086972 * T * T + T * T * T / 56250;
  const F = 93.27191 + 483202.017538 * T - 0.0036825 * T * T + T * T * T / 327270;
  const Om = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  let dpsi = 0, deps = 0;
  for (const t of RZ_NUTACAO) {
    const arg = (t[0] * D + t[1] * M + t[2] * Mp + t[3] * F + t[4] * Om) * rad;
    dpsi += (t[5] + t[6] * T) * Math.sin(arg);
    deps += (t[7] + t[8] * T) * Math.cos(arg);
  }
  const epsMedia = 23 + 26 / 60 + 21.448 / 3600 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  return { dpsi: dpsi * 0.0001 / 3600, eps: epsMedia + deps * 0.0001 / 3600 };   // graus; eps = obliquidade verdadeira
}

/* { asc, mc } em graus (0–360) no instante ms (UT, ms desde 1970), latitude e longitude LESTE em graus */
function rzAngulos(ms, lat, lon) {
  const jd = rzJD(ms), T = (jd - 2451545.0) / 36525, rad = Math.PI / 180;
  const nut = rzNutacao(jd);
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  const ramc = rzNorm360(gmst + nut.dpsi * Math.cos(nut.eps * rad) + lon) * rad;
  const eps = nut.eps * rad;
  const mc = rzNorm360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / rad);
  let asc = rzNorm360(Math.atan2(-Math.cos(ramc), Math.sin(eps) * Math.tan(lat * rad) + Math.cos(eps) * Math.sin(ramc)) / rad);
  if (rzNorm360(asc - mc) > 180) asc = rzNorm360(asc + 180);      // o Ascendente fica de 0° a 180° à frente do Meio do Céu
  return { asc, mc };
}

/* Instantes em [deMs, ateMs] em que o Ascendente ('asc') ou o Meio do Céu ('mc') chega ao GRAU `grau` (0 ≤ grau < 30) de QUALQUER signo.
   Devolve [{ ms, signo }] em ordem. Os dois sobem sempre no mesmo sentido, então basta ver o "grau no signo" passar de baixo pra cima. */
function rzCruzamentos(tipo, grau, deMs, ateMs, lat, lon, passoMs) {
  const passo = passoMs || 30000;
  const f = (ms) => { const a = rzAngulos(ms, lat, lon)[tipo]; return { a, d: (((a % 30) - grau + 15) % 30 + 30) % 30 - 15 }; };
  const saida = [];
  let t0 = deMs, p = f(t0);
  for (let t1 = deMs + passo; t1 <= ateMs + passo; t1 += passo) {
    const c = f(t1);
    if (p.d < 0 && c.d >= 0 && c.d - p.d < 15) {
      let a = t0, b = t1;
      for (let i = 0; i < 40; i++) { const m = (a + b) / 2; const fm = f(m); if (fm.d < 0 && fm.d - p.d < 15) a = m; else b = m; }
      const ms = (a + b) / 2;
      if (ms >= deMs && ms <= ateMs) saida.push({ ms, signo: rzSignoDe(f(ms).a) });
    }
    t0 = t1; p = c;
  }
  return saida;
}

/* ---------- Sol e Lua entre as amostras do motor (para a Fortuna) ----------
   O motor devolve 0,01° por consulta: ajusta-se um polinômio (mínimos quadrados) às amostras em vez de ligá-las ponto a ponto. */
function rzAjustePoli(amostras, grau) {
  const xs = amostras.map(a => a.t), t0 = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
  const h = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2 || 1;
  const ys = []; let ant = amostras[0].lon, off = 0;
  amostras.forEach(a => { let d = a.lon - ant; if (d > 180) off -= 360; else if (d < -180) off += 360; ys.push(a.lon + off); ant = a.lon; });
  const n = grau + 1, A = [];
  for (let i = 0; i < n; i++) A.push(new Array(n + 1).fill(0));
  amostras.forEach((a, k) => {
    const x = (a.t - t0) / h;
    for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += Math.pow(x, i + j); A[i][n] += Math.pow(x, i) * ys[k]; }
  });
  for (let i = 0; i < n; i++) {                               // eliminação de Gauss com pivô
    let mx = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[mx][i])) mx = r;
    [A[i], A[mx]] = [A[mx], A[i]];
    for (let r = i + 1; r < n; r++) { const k = A[r][i] / A[i][i]; for (let c = i; c <= n; c++) A[r][c] -= k * A[i][c]; }
  }
  const c = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * c[j]; c[i] = s / A[i][i]; }
  return (ms) => { const x = (ms - t0) / h; let y = 0; for (let i = n - 1; i >= 0; i--) y = y * x + c[i]; return rzNorm360(y); };
}

/* ---------- Fortuna ---------- */
/* Fortuna num instante: dia (Sol acima do horizonte) = Asc + Lua − Sol; noite = Asc + Sol − Lua. sol/lua: funções ms → longitude. */
function rzFortunaEm(ms, lat, lon, sol, lua) {
  const { asc } = rzAngulos(ms, lat, lon);
  const s = sol(ms), l = lua(ms);
  const diurno = rzNorm360(s - asc) >= 180;                 // Sol entre o Descendente e o Ascendente, passando pelo Meio do Céu = acima do horizonte
  return { lon: rzNorm360(diurno ? asc + l - s : asc + s - l), diurno };
}

/* Quando a Fortuna entrou no signo em que está em ms e quando sai dele (procura até `maxMs` pra cada lado; null se não achar) */
function rzFortunaTroca(ms, lat, lon, sol, lua, maxMs) {
  const limite = maxMs || 6 * 3600000, passo = 20000;
  const signo0 = rzSignoDe(rzFortunaEm(ms, lat, lon, sol, lua).lon);
  const ache = (dir) => {
    for (let dt = passo; dt <= limite; dt += passo) {
      const t = ms + dir * dt;
      if (rzSignoDe(rzFortunaEm(t, lat, lon, sol, lua).lon) !== signo0) {
        let a = ms + dir * (dt - passo), b = t;                // a: ainda no signo; b: já fora
        for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (rzSignoDe(rzFortunaEm(m, lat, lon, sol, lua).lon) === signo0) a = m; else b = m; }
        return (a + b) / 2;
      }
    }
    return null;
  };
  return { entra: ache(-1), sai: ache(1) };
}

/* ---------- Motor (Swiss Ephemeris, motor-astrologia) ---------- */
const RZ_MOTOR_URL = 'https://motor-astrologia.vercel.app';

/* Pergunta ao motor o céu num instante UT (ms). A API recebe data e HH:MM com fuso 0, então a consulta é sempre em UT, arredondada ao minuto.
   Devolve uma função async (ms) → JSON do motor (com cache por minuto). fetchFn: padrão `fetch`. */
function rzMotorHttp(lat, lon, base, fetchFn) {
  const cache = new Map();
  const f = fetchFn || ((typeof fetch === 'function') ? fetch.bind(globalThis) : null);
  return function consultar(ms) {
    const min = Math.round(ms / 60000);
    if (cache.has(min)) return cache.get(min);
    const d = new Date(min * 60000);
    const p2 = (n) => String(n).padStart(2, '0');
    const url = `${base || RZ_MOTOR_URL}/api/index?data=${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}&hora=${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}&fuso=0&lat=${lat}&lon=${lon}`;
    const prom = f(url).then(r => { if (!r.ok) throw new Error('Motor de astrologia indisponível (' + r.status + ')'); return r.json(); })
      .then(j => { if (!j || j.sucesso === false) throw new Error((j && j.erro) || 'Erro no motor de astrologia'); return j; });
    prom.catch(() => cache.delete(min));
    cache.set(min, prom);
    return prom;
  };
}

/* ---------- Cálculo completo ----------
   Parte SEMPRE de um mapa salvo, com o horário dele (aproximado): a sizígia, a posição dos planetas, o Ascendente e o Meio do Céu
   aproximados e o signo que sobe saem desse horário. O resultado é o horário em que o Ascendente (ou o Meio do Céu, pela regra de
   Ptolomeu e Hefestião) chega ao grau do planeta, buscado no signo que sobe no horário do mapa.
   entrada: { ano, mes, dia, hora, min (data e hora LOCAIS do mapa), lat, lon (lon leste +), fuso (horas, ex.: -3) }
   motor: async (ms UT) → JSON do motor (rzMotorHttp). Devolve o resultado com tudo que a tela mostra. */
async function rzCalcular(entrada, motor) {
  const { ano, mes, dia, hora, min, lat, lon, fuso } = entrada;
  const tMs = Date.UTC(ano, mes - 1, dia, hora, min, 0) - fuso * 3600000;
  const avisos = [];
  if (Math.abs(lat) > 66) avisos.push('Latitude acima do círculo polar: o Ascendente pode não subir em ordem; confira os horários.');

  // 1) última sizígia antes do nascimento, e o céu no horário do mapa
  const jT = await motor(tMs);
  const sT = jT.sizigia;
  if (!sT || sT.jd_ut === undefined) throw new Error('O motor não devolveu a sizígia');
  const sizMs = (sT.jd_ut - 2440587.5) * 86400000;

  // 2) ponto da sizígia. Lua nova: a conjunção, sem escolha. Lua cheia: o luminar que está ACIMA do horizonte no instante da sizígia, no local de
  //    nascimento (Ptolomeu III.2: "a das duas que está acima da Terra"); há sempre um só, porque estão opostos. Lua acima = lugar da Lua;
  //    Lua abaixo = lugar do Sol (grau oposto). O horizonte do mapa natal não entra nessa escolha.
  const angT = rzAngulos(tMs, lat, lon);
  const sizAng = rzAngulos(sizMs, lat, lon);
  const luaNaSizigia = rzNorm360(sT.grau_absoluto);
  const nova = sT.tipo === 'Lua Nova';
  let luminar = 'Lua', pontoLon = luaNaSizigia;
  const luaAcima = rzNorm360(luaNaSizigia - sizAng.asc) >= 180;
  if (!nova && !luaAcima) { luminar = 'Sol'; pontoLon = rzNorm360(luaNaSizigia + 180); }
  const sizigia = { tipo: sT.tipo, ms: sizMs, luminar, lon: pontoLon, luaLon: luaNaSizigia, luaAcima, valensNoLugarDaLua: !nova ? luaNaSizigia : null };

  // 3) posição dos planetas no horário do mapa
  const posicoes = {}, retro = {};
  RZ_ORDEM.forEach(id => { const o = jT.planetas[RZ_PLANETAS[id].motor]; posicoes[id] = rzNorm360(o.grau_absoluto); retro[id] = !!o.retrogrado; });

  // 4) candidatos pelas duas regras
  const contagem = rzContagem(posicoes, pontoLon);
  const valens = rzValens(pontoLon);

  // 5) o planeta define só o GRAU (grau e minutos). O signo é o mais próximo do horário informado (= do Ascendente presumido, em ascensões):
  //    calcula-se o horário em que o grau sobe (ou culmina) em CADA um dos 12 signos e escolhe-se o que cai mais perto do horário do mapa.
  const quando = (tipo, grau) => {
    const todos = rzCruzamentos(tipo, grau, tMs - 12 * 3600000, tMs + 12 * 3600000, lat, lon);   // 24 h: cada signo aparece ao menos uma vez
    const porSigno = new Map();
    todos.forEach(c => { const ant = porSigno.get(c.signo); if (!ant || Math.abs(c.ms - tMs) < Math.abs(ant.ms - tMs)) porSigno.set(c.signo, c); });
    const lista = Array.from(porSigno.values()).sort((x, y) => x.ms - y.ms);
    const escolhido = lista.slice().sort((x, y) => Math.abs(x.ms - tMs) - Math.abs(y.ms - tMs))[0] || null;
    return { escolhido, lista };
  };
  const candidatos = [];
  const regras = [{ regra: 'ptolomeu', ids: contagem.vencedores }, { regra: 'valens', ids: [valens.termo, valens.signo] }];
  regras.forEach(q => {
    const vistos = new Set();
    q.ids.forEach(id => {
      if (vistos.has(id)) return; vistos.add(id);
      const lonPl = posicoes[id], grau = lonPl % 30;
      // Ptolomeu/Hefestião: planeta perto do Meio do Céu (pela posição no zodíaco) = o grau dele vale pro Meio do Céu; senão, pro Ascendente. Valens: só o Ascendente
      const distAsc = rzDistAng(lonPl, angT.asc), distMc = rzDistAng(lonPl, angT.mc);
      const tipo = (q.regra === 'ptolomeu' && distMc < distAsc) ? 'mc' : 'asc';
      const c = quando(tipo, grau);
      candidatos.push({ regra: q.regra, id, lon: lonPl, retro: retro[id], grau, distAsc, distMc, tipo, horario: c.escolhido ? { ms: c.escolhido.ms, signo: c.escolhido.signo } : null, signos: c.lista });
    });
  });

  // detalhes de cada horário: Asc, MC, Fortuna e quando a Fortuna muda de signo (Sol e Lua ajustados às amostras do motor)
  const lista = candidatos.filter(c => c.horario);
  let solFn = null, luaFn = null;      // curvas do Sol e da Lua ajustadas às amostras do motor (a Fortuna de qualquer horário perto dos candidatos)
  if (lista.length) {
    const todosMs = lista.map(c => c.horario.ms);
    const de = Math.min.apply(null, todosMs) - 7 * 3600000, ate = Math.max.apply(null, todosMs) + 7 * 3600000;
    const passo = Math.max(90 * 60000, (ate - de) / 24);
    const tempos = []; for (let t = de; t <= ate + 1; t += passo) tempos.push(Math.round(t / 60000) * 60000);
    const js = await Promise.all(tempos.map(t => motor(t)));
    const serie = (chave) => rzAjustePoli(tempos.map((t, i) => ({ t, lon: js[i].planetas[chave].grau_absoluto })), 3);
    const sol = serie('Sol'), lua = serie('Lua');
    solFn = sol; luaFn = lua;
    lista.forEach(c => {
      const h = c.horario, a = rzAngulos(h.ms, lat, lon), f = rzFortunaEm(h.ms, lat, lon, sol, lua);
      h.asc = a.asc; h.mc = a.mc; h.fortuna = f.lon; h.diurno = f.diurno;
      h.fortunaTroca = rzFortunaTroca(h.ms, lat, lon, sol, lua);
      const cerca = (g) => rzCruzamentos(c.tipo, g % 30, h.ms - 40 * 60000, h.ms + 40 * 60000, lat, lon).filter(x => x.signo === h.signo || g === Math.floor(c.grau) + 1)[0];
      const i0 = cerca(Math.floor(c.grau)), i1 = cerca(Math.floor(c.grau) + 1);
      h.faixaGrauInteiro = (i0 && i1) ? { de: i0.ms, ate: i1.ms } : null;
    });
  }

  return { entrada, tMs, avisos, sizigia, posicoes, retro, contagem, valens, angulosT: angT, candidatos, sol: solFn, lua: luaFn };
}

/* "10:45:14" no fuso dado (comSegundos) a partir de ms UT; com data se comData */
function rzFmtHora(ms, fuso, comData) {
  const d = new Date(Math.round(ms / 1000) * 1000 + fuso * 3600000);
  const p2 = (n) => String(n).padStart(2, '0');
  const h = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;
  return comData ? `${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${h}` : h;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { rzAngulos, rzNutacao, rzCruzamentos, rzAjustePoli, rzFortunaEm, rzFortunaTroca, rzVias, rzContagem, rzValens, rzTermoSenhor,
    rzCalcular, rzMotorHttp, rzFmtPos, rzFmtHora, rzSignoDe, RZ_SIGNOS };
}


/* ==========================================
   TELA — sem formulário: calcula sozinha a partir do mapa que está em tela (a Mandala)
   ========================================== */
let rzUltimo = null;              // último resultado calculado
let rzFinalSel = null;            // horário final do relatório: { idx (em rzUltimo.candidatos), ajusteMin (ajuste fino, em minutos) }
let rzOrigemHorario = '';         // 'origem do horário' (texto do astrólogo; ainda não é salvo)

function rzP2(n) { return String(n).padStart(2, '0'); }

/* Ícone do planeta / do signo no padrão do software: sempre o ícone; o nome ao lado só com os rótulos ligados. */
function rzPlanetaHtml(id, tam) {
  return (typeof planetaComNome === 'function') ? planetaComNome(id, tam || 20) : RZ_PLANETAS[id].nome;
}
function rzSignoHtml(idx, tam) {
  if (typeof signoComNome === 'function' && typeof getSignSvgHtmlDec === 'function') return signoComNome(getSignSvgHtmlDec(idx, tam || 20), idx);
  return RZ_SIGNOS[idx];
}
/* "7°57′" + ícone do signo, a partir de uma longitude */
function rzPosHtml(lon, tam) {
  const txt = rzFmtPos(lon);
  const grau = txt.slice(0, txt.indexOf('′') + 1);
  const signo = RZ_SIGNOS.indexOf(txt.slice(grau.length + 1));
  return `<span style="display:inline-flex; align-items:center; gap:4px; vertical-align:middle; white-space:nowrap;">${grau}${rzSignoHtml(signo, tam)}</span>`;
}
function rzAnguloHtml(tipo, tam) {
  const chave = tipo === 'asc' ? 'ASC' : 'MC';
  return (typeof getAnguloCirculoSVG === 'function') ? `<span title="${tipo === 'asc' ? 'Ascendente' : 'Meio do Céu'}" style="display:inline-flex; vertical-align:middle;">${getAnguloCirculoSVG(chave, tam || 24)}</span>` : (tipo === 'asc' ? 'Asc' : 'MC');
}
function rzFortunaHtml(tam) {
  const ico = (typeof getIconeSVG === 'function') ? getIconeSVG('lote', 'fortune', tam || 22) : '';
  return ico || 'Fortuna';
}
/* Sizígia (lunação pré-natal): ícone próprio; o nome ao lado só com os rótulos ligados */
function rzSizigiaHtml(tam) {
  const ico = (typeof getIconeSVG === 'function') ? getIconeSVG('outro', 'sizigia', tam || 22) : '';
  if (!ico) return 'Sizígia';
  return (window.mostrarRotulosGlifos === false) ? ico : `<span class="com-nome">${ico}<span class="nome-glifo">Sizígia</span></span>`;
}
/* Ícone do aspecto (o mesmo da Matriz de Visibilidade, por signos inteiros); o nome só com os rótulos ligados */
function rzAspectoHtml(nome, lonA, lonB) {
  if (!nome) return '·';
  const ico = (typeof getAspectoMatrizSVG === 'function') ? getAspectoMatrizSVG(rzNorm360(lonA), rzNorm360(lonB)).replace(/width="\d+" height="\d+"/, 'width="20" height="20"') : '';
  if (!ico) return nome;
  return (window.mostrarRotulosGlifos === false) ? ico : `<span class="com-nome">${ico}<span class="nome-glifo">${nome}</span></span>`;
}
/* ℞ de retrógrado: vermelho, junto do PLANETA (logo depois do ícone) (quem fica retrógrado é o planeta) */
function rzRetroHtml(r, id) { return r.retro[id] ? '<span title="Retrógrado" style="color:var(--terracota); font-weight:700; margin-left:4px;">℞</span>' : ''; }
function rzPlanetaRetroHtml(r, id, tam) { return `<span style="display:inline-flex; align-items:center;">${rzPlanetaHtml(id, tam)}${rzRetroHtml(r, id)}</span>`; }

function iniciarModuloRetificacaoSizigia() {
  const container = document.getElementById('mandala-container');
  if (!container) return;
  rzUltimo = null;
  container.innerHTML = `
    <style>
      #rz-container .rz-rolagem { overflow-x: auto; }
      #rz-container table { width: 100%; }
      #rz-container .rz-escolhido { color: var(--terracota); font-weight: 700; }
      #rz-container .rz-fonte { font-size: 11.5px; line-height: 1.55; }
      #rz-container input[type="text"], #rz-container input[type="date"], #rz-container textarea { background: transparent; color: inherit; font: inherit; font-size: 13px; padding: 6px 8px; border: var(--contorno-fino) solid var(--azul-egipcio-claro); border-radius: 4px; -webkit-appearance: none; appearance: none; box-sizing: border-box; }
      #rz-container textarea { width: 100%; min-height: 54px; resize: vertical; }
      #rz-container .rz-fato { padding: 10px 0; border-top: var(--contorno-fino) solid var(--azul-egipcio-claro); }
      #rz-container .rz-linha-tecnica { font-size: 12.5px; line-height: 1.7; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin-top: 4px; }
      #rz-container details > summary { cursor: pointer; font-family: 'Cinzel', serif; font-weight: 700; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--azul-egipcio-escuro); padding: 6px 0; }
    </style>
    <div style="width: 100%; display: flex; flex-direction: column;">
      <div id="rz-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Achador de horário pela sizígia</h3><div class="acoes-ferramenta">
          <button type="button" onclick="salvarRetificacaoSizigiaNaGaleria()" title="Salvar o resultado como imagem na galeria (com título e cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
          </button>
          <button type="button" onclick="capturarRetificacaoSizigiaParaRelatorio()" title="Adicionar ao Relatório (sem cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
          </button>
        </div></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        <div id="rzCabecalho">${(typeof montarCabecalhoMandalaImagemHTML === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}</div>
        <hr class="divisa">
        <div id="rzResultado"></div>
        <hr class="divisa-fim">
      </div>
    </div>`;
  rzExecutar();
}
if (typeof window !== 'undefined') window.iniciarModuloRetificacaoSizigia = iniciarModuloRetificacaoSizigia;

function rzMensagem(texto) { return `<div style="font-size:13px; font-weight:600; text-align:center; padding:16px 0;">${escapeHtml(texto)}</div>`; }

/* lê o mapa em tela → entrada do cálculo (ou { erro }) */
function rzLerMapa() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || typeof currentMapaId === 'undefined' || !currentMapaId) return { erro: 'Abra um mapa salvo no menu lateral.' };
  if (window.mapaTemHorario === false) return { erro: 'O método precisa de um horário aproximado.' };
  const m = currentMoment, g = currentGeo;
  const fuso = (g.fuso !== undefined) ? g.fuso : (typeof calcularFusoPreciso === 'function' ? calcularFusoPreciso(g.lat, g.lon, m.getFullYear(), m.getMonth() + 1, m.getDate(), m.getHours(), m.getMinutes()) : Math.round(g.lon / 15));
  return { ano: m.getFullYear(), mes: m.getMonth() + 1, dia: m.getDate(), hora: m.getHours(), min: m.getMinutes(), lat: g.lat, lon: g.lon, fuso, cidade: g.city || '' };
}

async function rzExecutar() {
  const area = document.getElementById('rzResultado');
  if (!area) return;
  const e = rzLerMapa();
  if (e.erro) { area.innerHTML = rzMensagem(e.erro); return; }
  area.innerHTML = `<div class="texto-apagado" style="font-size:12.5px;">Calculando...</div>`;
  try {
    const r = await rzCalcular(e, rzMotorHttp(e.lat, e.lon));
    rzUltimo = r;
    rzFinalSel = rzSelecaoPadrao(r);
    if (rzMapaFinalSvg) { URL.revokeObjectURL(rzMapaFinalSvg.url); rzMapaFinalSvg = null; }   // outro mapa/cálculo: a mandala gerada não vale mais
    area.innerHTML = rzMontarResultado(r);
  } catch (err) {
    console.error(err);
    area.innerHTML = `<div style="color:var(--terracota); font-weight:700; font-size:13px;">Não foi possível calcular: ${escapeHtml(err.message || String(err))}</div>`;
  }
}
if (typeof window !== 'undefined') window.rzExecutar = rzExecutar;

function rzFmtFuso(f) { const sn = f < 0 ? '−' : '+'; const a = Math.abs(f); const h = Math.floor(a), m = Math.round((a - h) * 60); return `UTC${sn}${h}${m ? ':' + rzP2(m) : ''}`; }

/* ---------- montagem do resultado ---------- */
function rzMontarResultado(r) {
  const fuso = r.entrada.fuso;
  const hora = (ms) => `<strong>${rzFmtHora(ms, fuso)}</strong>`;
  const s = r.sizigia;
  const aviso = r.avisos.map(a => `<div style="color:var(--terracota); font-weight:700; font-size:12.5px; margin-bottom:8px;">${escapeHtml(a)}</div>`).join('');
  // uma linha por candidato: planeta, grau e horário; os detalhes ficam recolhidos
  const linha = (c) => {
    const h = c.horario;
    const cabeca = `<div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px 12px; font-size:14px;">
        ${rzPlanetaRetroHtml(r, c.id, 22)} ${rzPosHtml(c.lon, 18)} <span>→</span> ${h ? `${rzAnguloHtml(c.tipo, 26)} ${hora(h.ms)}` : '<span>sem horário nesse signo</span>'}
      </div>`;
    if (!h) return `<div style="padding:8px 0; border-top: var(--contorno-fino) solid var(--azul-egipcio-claro);">${cabeca}</div>`;
    const item = (ico, html) => `<span style="display:inline-flex; align-items:center; gap:6px;">${ico}${html}</span>`;
    const f = h.fortunaTroca;
    const troca = (f.entra ? `entrou às ${rzFmtHora(f.entra, fuso)}` : 'entrou há mais de 6 h') + ' · ' + (f.sai ? `muda de signo às ${rzFmtHora(f.sai, fuso)}` : 'não muda em 6 h');
    const regraMc = c.regra === 'ptolomeu' ? `<div class="texto-apagado" style="font-size:12px; margin-bottom:6px;">Regra do Meio do Céu: o planeta está em ${rzPosHtml(c.lon, 16)}, o ${rzAnguloHtml('asc', 22)} aproximado em ${rzPosHtml(r.angulosT.asc, 16)} e o ${rzAnguloHtml('mc', 22)} aproximado em ${rzPosHtml(r.angulosT.mc, 16)}. Está mais perto do ${rzAnguloHtml(c.tipo, 22)}.</div>` : '';
    return `<div style="padding:8px 0; border-top: var(--contorno-fino) solid var(--azul-egipcio-claro);">
      ${cabeca}
      <details style="margin-top:2px;"><summary>ver detalhes</summary>
        ${regraMc}
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px 18px; font-size:13px;">
          ${item(rzAnguloHtml('asc', 24), rzPosHtml(h.asc, 18))}
          ${item(rzAnguloHtml('mc', 24), rzPosHtml(h.mc, 18))}
          ${item(rzFortunaHtml(22), rzPosHtml(h.fortuna, 18) + ` <small>${h.diurno ? 'de dia' : 'de noite'}</small>`)}
        </div>
        <div class="texto-apagado" style="font-size:11.5px; margin-top:6px;">Horário em que o grau chega em cada signo, o escolhido é o mais perto do horário do mapa:</div>
        <div style="display:flex; flex-wrap:wrap; gap:4px 16px; font-size:12.5px; margin-top:2px;">
          ${c.signos.map(x => `<span class="${x.signo === h.signo ? 'rz-escolhido' : ''}" style="display:inline-flex; align-items:center; gap:4px;">${rzSignoHtml(x.signo, 16)} ${rzFmtHora(x.ms, fuso)}${x.signo === h.signo ? ' escolhido' : ''}</span>`).join('')}
        </div>
        ${h.faixaGrauInteiro ? `<div class="texto-apagado" style="font-size:11.5px; margin-top:4px;">grau inteiro ${Math.floor(c.grau)}°: ${rzFmtHora(h.faixaGrauInteiro.de, fuso)} → ${rzFmtHora(h.faixaGrauInteiro.ate, fuso)}</div>` : ''}
        <div class="texto-apagado" style="font-size:11.5px; margin-top:4px;">${rzFortunaHtml(16)} ${troca}</div>
      </details>
    </div>`;
  };
  const doRegra = (regra) => r.candidatos.filter(c => c.regra === regra).map(linha).join('');

  const blocoHorarios = `
    <h3 class="titulo-secao">Horários encontrados</h3>
    <div class="cartao" style="margin-bottom:14px;">
      <div class="rotulo">Ptolomeu e Hefestião</div>
      <div class="texto-apagado rz-fonte" style="margin:4px 0 6px;">Fonte: Ptolomeu, Tetrabiblos III.2; Hefestião, Apotelesmatika II.2.</div>
      ${doRegra('ptolomeu')}
    </div>
    <div class="cartao">
      <div class="rotulo">Valens</div>
      <div class="texto-apagado rz-fonte" style="margin:4px 0 6px;">Fonte: Valens, Antologias I.5. Valem o senhor do termo e o senhor do signo do ponto da sizígia.</div>
      ${doRegra('valens')}
    </div>`;

  const blocoSizigia = `
    <hr class="divisa">
    <h3 class="titulo-secao">Última sizígia antes do nascimento</h3>
    <div class="cartao" style="font-size:13px; line-height:1.9;">
      <div>${rzSizigiaHtml(24)} · <strong>${s.tipo}</strong> em ${rzFmtHora(s.ms, fuso, true)}</div>
      <div>Luminar usado: ${rzPlanetaHtml(s.luminar === 'Lua' ? 'Moon' : 'Sun', 22)} ${s.tipo === 'Lua Nova' ? '(conjunção: Sol e Lua no mesmo grau)' : (s.luaAcima ? '(a Lua estava acima do horizonte na sizígia)' : '(a Lua estava abaixo do horizonte na sizígia, então vale o Sol, no grau oposto ao da Lua)')}</div>
      <div>Ponto da sizígia: <strong>${rzPosHtml(s.lon)}</strong></div>
      ${s.valensNoLugarDaLua !== null ? `<div class="texto-apagado" style="font-size:11.5px;">Nos exemplos de Valens (Antologias I.9) a lua cheia é sempre marcada no lugar da Lua: ${rzPosHtml(s.valensNoLugarDaLua, 16)}.</div>` : ''}
      <div class="texto-apagado rz-fonte">Fonte: Ptolomeu, Tetrabiblos III.2; Valens, Antologias I.9.</div>
    </div>`;

  const tabela = `
    <div class="rz-rolagem"><table class="tabela-epoca">
      <tr><th>Planeta</th><th>Posição</th><th class="centro">Triplicidade</th><th class="centro">Domicílio</th><th class="centro">Exaltação</th><th class="centro">Termo</th><th>Aspecto</th><th class="centro">Votos</th></tr>
      ${r.contagem.linhas.map(l => {
        const venc = r.contagem.vencedores.includes(l.id);
        const x = (b) => b ? '✓' : '·';
        return `<tr class="${venc ? 'rz-escolhido' : ''}"><td>${rzPlanetaRetroHtml(r, l.id)}</td><td>${rzPosHtml(l.lon, 18)}</td><td class="centro">${x(l.vias.triplicidade)}</td><td class="centro">${x(l.vias.domicilio)}</td><td class="centro">${x(l.vias.exaltacao)}</td><td class="centro">${x(l.vias.termo)}</td><td>${rzAspectoHtml(l.vias.aspecto, l.lon, s.lon)}</td><td class="centro"><strong>${l.vias.total}</strong></td></tr>`;
      }).join('')}
    </table></div>`;
  const blocoVotos = `
    <hr class="divisa">
    <details open>
      <summary>Contagem de votos</summary>
      <div class="texto-apagado rz-fonte" style="margin-bottom:8px;">Fonte: Ptolomeu, Tetrabiblos III.2; Hefestião, Apotelesmatika II.2. O ponto da sizígia está em ${rzPosHtml(s.lon, 16)}. Cada planeta recebe um voto por dignidade que tem nesse ponto: triplicidade, domicílio, exaltação e termo. Na triplicidade vale qualquer dos três senhores, pela tabela de Doroteu. Recebe mais um voto se aspecta o ponto. Ganha quem tem mais votos. No empate valem todos os empatados.</div>
      ${tabela}
      <div style="font-size:13px; margin:8px 0;">${r.contagem.vencedores.length > 1 ? 'Empate entre' : 'Vencedor:'} ${r.contagem.vencedores.map(id => `<span style="display:inline-block; margin-right:8px;">${rzPlanetaRetroHtml(r, id, 20)}</span>`).join('')} (${r.contagem.max} votos).</div>
    </details>`;

  const rodape = `
    <hr class="divisa">
    <div class="texto-apagado rz-fonte">
      <strong>Margem.</strong> Cerca de 4 minutos de tempo por grau: um erro de 1° na posição do astro muda o horário em torno de 4 minutos. O horário vale para o grau e os minutos do planeta, calculado ao segundo; a precisão real do método é a do texto antigo, não a do cálculo.<br>
      <strong>Fontes.</strong> Ptolomeu, <em>Tetrabiblos</em> III.2: candidatos pelos votos das dignidades e do aspecto, grau do planeta como grau do Ascendente, regra do Meio do Céu. Hefestião, <em>Apotelesmatika</em> II.2: repete Ptolomeu, e as frações do grau marcam a hora. Valens, <em>Antologias</em> I.5: senhores do termo e do signo; I.9: exemplos, com a lua cheia no lugar da Lua.<br>
      <strong>Como foi calculado.</strong> Swiss Ephemeris (motor do site), zodíaco tropical, signos inteiros, termos egípcios, a partir do horário do mapa. Ascendente e Meio do Céu por tempo sideral aparente e obliquidade verdadeira, conferidos contra o Swiss Ephemeris. Fortuna: Asc + Lua − Sol de dia, Asc + Sol − Lua de noite, com dia quando o Sol está acima do horizonte pelo grau. Posições do motor com 0,01°, cerca de 1 segundo no horário. Fuso: ${rzFmtFuso(fuso)}.<br>
      <strong>Fora do escopo.</strong> Os métodos aproximados do Ascendente sem hora (Hefestião II.1 e II.2, Anúbio), porque o texto pode estar corrompido e todos os nascidos no mesmo dia dariam o mesmo Ascendente, e o cálculo da concepção, que é quase circular e não distingue horários.
    </div>`;

  // Ordem do relatório-modelo (artefato "Relatório de retificação pela sizígia"); nada que a ferramenta já mostrava foi retirado
  const tit = (n, t) => `<h3 class="titulo-secao" style="margin-top:18px;">${n}. ${t}</h3>`;
  const sem = (h) => h.replace('<hr class="divisa">', '').replace(/<h3 class="titulo-secao">[^<]*<\/h3>/, '');
  return aviso
    + tit(1, 'Dados de entrada') + rzMontarDadosEntrada(r)
    + '<hr class="divisa">' + tit(2, 'A sizígia pré-natal') + sem(blocoSizigia)
    + '<hr class="divisa">' + tit(3, 'O cálculo') + blocoVotos.replace('<hr class="divisa">', '') + blocoHorarios
    + '<hr class="divisa">' + tit(4, 'Horário retificado') + '<div id="rzFinal">' + rzMontarHorarioFinal(r) + '</div>'
    + '<hr class="divisa">' + tit(5, 'Confirmação pelos fatos da vida') + '<div id="rzFatos">' + rzMontarFatos(r) + '</div>'
    + '<hr class="divisa">' + tit(6, 'O mapa final') + rzMontarMapaFinal(r)
    + rodape;
}

/* ---------- Seção 1: dados de entrada (tudo vem do mapa em tela, menos a origem do horário) ---------- */
function rzMontarDadosEntrada(r) {
  const e = r.entrada;
  const nome = (typeof currentSubjectName !== 'undefined' && currentSubjectName) ? currentSubjectName : '';
  const linha = (rot, val) => `<tr><td><strong>${rot}</strong></td><td>${val}</td></tr>`;
  return `<div class="rz-rolagem"><table class="tabela-epoca">
    ${linha('Nome', escapeHtml(nome) || '—')}
    ${linha('Data de nascimento', `${rzP2(e.dia)}/${rzP2(e.mes)}/${e.ano}`)}
    ${linha('Cidade', escapeHtml(e.cidade || '—'))}
    ${linha('Horário original', `${rzP2(e.hora)}:${rzP2(e.min)} <span class="texto-apagado">(${rzFmtFuso(e.fuso)})</span>`)}
    ${linha('Origem do horário', `<input type="text" id="rzOrigemHorario" value="${escapeHtml(rzOrigemHorario)}" placeholder="certidão, memória da família, hospital que arredondou..." oninput="rzOrigemHorario = this.value" style="width:100%;">`)}
  </table></div>`;
}

/* ---------- Seção 4: horário final = um candidato + ajuste fino ---------- */
function rzSelecaoPadrao(r) {
  const comHorario = (c) => c.horario;
  let idx = r.candidatos.findIndex(c => c.regra === 'ptolomeu' && comHorario(c));
  if (idx < 0) idx = r.candidatos.findIndex(comHorario);
  return idx < 0 ? null : { idx, ajusteMin: 0 };
}
/* Horário final = o do candidato arredondado ao minuto + o ajuste fino em minutos (o software trabalha em hora e minuto, sem segundos) */
function rzMsFinal(r, sel) { return Math.round(r.candidatos[sel.idx].horario.ms / 60000) * 60000 + sel.ajusteMin * 60000; }

function rzMontarHorarioFinal(r) {
  const sel = rzFinalSel;
  if (!sel) return `<div class="texto-apagado" style="font-size:12.5px;">Nenhum candidato com horário nesse mapa.</div>`;
  const fuso = r.entrada.fuso, e = r.entrada;
  const nomeRegra = { ptolomeu: 'Ptolomeu e Hefestião', valens: 'Valens' };
  const opcoes = r.candidatos.map((c, i) => c.horario ? `
    <label style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:13px; cursor:pointer;">
      <input type="radio" name="rzCand" ${i === sel.idx ? 'checked' : ''} onchange="rzEscolherCandidato(${i})">
      ${rzPlanetaRetroHtml(r, c.id, 20)} <span class="texto-apagado">${nomeRegra[c.regra]}</span> ${rzAnguloHtml(c.tipo, 22)} <strong>${rzFmtHora(c.horario.ms, fuso)}</strong>
    </label>` : '').join('');
  const ms = rzMsFinal(r, sel);
  const a = rzAngulos(ms, e.lat, e.lon);
  const orig = Date.UTC(e.ano, e.mes - 1, e.dia, e.hora, e.min, 0) - fuso * 3600000;
  const dif = Math.round((ms - orig) / 60000);
  const difTxt = dif === 0 ? 'o mesmo horário' : `${dif > 0 ? 'mais' : 'menos'} ${Math.abs(dif)} min`;
  const bt = (rot, min) => `<button type="button" class="btn-secondary" onclick="rzAjustar(${min})" style="padding:4px 10px; font-size:12px;">${rot}</button>`;
  const aj = sel.ajusteMin;
  return `
    <div class="texto-apagado rz-fonte" style="margin-bottom:6px;">Escolha o candidato que os fatos da vida sustentam. O método dá um horário aproximado: o ajuste fino, em minutos, é feito abaixo.</div>
    <div class="cartao" style="margin-bottom:10px;">${opcoes}</div>
    <div class="cartao">
      <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:8px;">
        ${bt('−5 min', -5)} ${bt('−1 min', -1)} ${bt('+1 min', 1)} ${bt('+5 min', 5)} ${aj ? bt('zerar ajuste', -aj) : ''}
        <span class="texto-apagado" style="font-size:12px;">ajuste: ${aj === 0 ? 'nenhum' : (aj > 0 ? '+' : '−') + Math.abs(aj) + ' min'}</span>
      </div>
      <div class="rz-rolagem"><table class="tabela-epoca">
        <tr><td><strong>Horário retificado</strong></td><td><strong class="rz-escolhido">${rzFmtHora(ms, fuso).slice(0, 5)}</strong></td></tr>
        <tr><td><strong>Diferença para o horário original</strong></td><td>${difTxt}</td></tr>
        <tr><td><strong>${rzAnguloHtml('asc', 22)} Ascendente</strong></td><td>${rzPosHtml(a.asc, 18)}</td></tr>
        <tr><td><strong>${rzAnguloHtml('mc', 22)} Meio do Céu</strong></td><td>${rzPosHtml(a.mc, 18)}</td></tr>
      </table></div>
    </div>`;
}
function rzRedesenharFinal() {
  const el = document.getElementById('rzFinal'); if (el && rzUltimo) el.innerHTML = rzMontarHorarioFinal(rzUltimo);
  const m = document.getElementById('rzMapaFinal'); if (m && rzUltimo) m.innerHTML = rzMontarMapaFinalCorpo(rzUltimo, true);   // o horário mudou: a mandala gerada ficou velha
  rzRedesenharFatos();
}
function rzEscolherCandidato(i) { if (!rzUltimo || !rzUltimo.candidatos[i] || !rzUltimo.candidatos[i].horario) return; rzFinalSel = { idx: i, ajusteMin: 0 }; rzRedesenharFinal(); }
function rzAjustar(min) { if (!rzFinalSel) return; rzFinalSel.ajusteMin += min; rzRedesenharFinal(); }
if (typeof window !== 'undefined') { window.rzEscolherCandidato = rzEscolherCandidato; window.rzAjustar = rzAjustar; }

/* ---------- Seção 5: fatos da vida × Circumambulação e Liberação, no horário final em teste ----------
   Os fatos (data + o que aconteceu) vêm do cliente (formulário, ainda a fazer) ou são digitados aqui. Para cada um, a ferramenta mostra a linha da
   Circumambulação (a partir do Ascendente do horário em teste) e os níveis da Liberação (pela Fortuna do horário em teste) que cobrem a data.
   O cálculo é COPIADO de direcoes.js/liberacao.js (retificacao-calculos.js). Mudou o horário final → tudo se recalcula. */
let rzFatos = [{ id: 1, data: '', texto: '', conf: '' }];   // ainda não é salvo
let rzFatoSeq = 1;
let rzAfetaCirc = 'ASC';          // ponto de partida da Circumambulação: ASC, Sun, Moon, seita (luminar da seita), Syz ou um dos 7 lotes
let rzDiurnoAtual = true;         // o horário em teste é diurno? (decide o luminar da seita)
let rzLoteZR = 'fortune';         // lote de partida da Liberação (os mesmos 7 lotes da ferramenta)
const RZ_LOTES = ['fortune', 'spirit', 'venus', 'mercury', 'mars', 'jupiter', 'saturn'];
const RZ_LOTE_ICONE = { fortune: 'fortune', spirit: 'spirit', venus: 'eros', mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis' };
const RZ_LOTE_NOME = { fortune: 'Fortuna', spirit: 'Espírito', venus: 'Eros', mercury: 'Necessidade', mars: 'Coragem', jupiter: 'Vitória', saturn: 'Nêmesis' };
const RZ_AFETA_NOME = Object.assign({ ASC: 'Ascendente', Sun: 'Sol', Moon: 'Lua', seita: 'Luminar da seita', Syz: 'Sizígia' }, RZ_LOTE_NOME);

/* ícone de um ponto de partida (afeta): ângulo, luminar, sizígia ou lote */
function rzIconeAfeta(chave, tam) {
  if (chave === 'ASC') return rzAnguloHtml('asc', tam);
  if (chave === 'seita') chave = rzDiurnoAtual ? 'Sun' : 'Moon';       // o luminar da seita: Sol de dia, Lua de noite
  if (chave === 'Sun') return rzPlanetaHtml('Sun', tam);
  if (chave === 'Moon') return rzPlanetaHtml('Moon', tam);
  if (chave === 'Syz') return rzSizigiaHtml(tam);
  if (RZ_LOTE_ICONE[chave] && typeof getIconeSVG === 'function') return getIconeSVG('lote', RZ_LOTE_ICONE[chave], tam) || RZ_LOTE_NOME[chave];
  return RZ_AFETA_NOME[chave] || chave;
}

function rzDataBR(d) { return `${rzP2(d.getDate())}/${rzP2(d.getMonth() + 1)}/${d.getFullYear()}`; }
/* relógio local do mapa (no fuso dele) a partir de ms UT, como Date comum (mesmo jeito que a Mandala guarda o momento) */
function rzRelogioLocal(ms, fuso) { const d = new Date(ms + fuso * 3600000); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()); }

/* tudo o que depende do horário em teste: Ascendente, Fortuna e as tabelas, calculadas uma vez por desenho */
function rzContextoFatos(r) {
  if (!rzFinalSel || typeof rqCircumambulacao !== 'function' || typeof calculateSevenLots !== 'function') return null;
  const e = r.entrada, ms = rzMsFinal(r, rzFinalSel);
  const asc = rzAngulos(ms, e.lat, e.lon).asc;
  const cand = r.candidatos[rzFinalSel.idx];
  const nasc = rzRelogioLocal(ms, e.fuso);
  // Sol e Lua no horário em teste (a Lua anda ~0,5° por hora); os demais planetas ficam como no horário do mapa (minutos não os movem)
  const sol = r.sol ? rzNorm360(r.sol(ms)) : r.posicoes.Sun, lua = r.lua ? rzNorm360(r.lua(ms)) : r.posicoes.Moon;
  const po = {}; RZ_ORDEM.forEach(id => { po[id] = { abs: r.posicoes[id] }; });
  po.Sun = { abs: sol }; po.Moon = { abs: lua };
  const diurno = rzNorm360(sol - asc) >= 180;
  rzDiurnoAtual = diurno;
  const pontos = { ASC: asc, Sun: sol, Moon: lua, seita: diurno ? sol : lua, Syz: r.sizigia.luaLon };
  calculateSevenLots(asc, diurno, po).forEach(l => { pontos[l.key] = l.deg; });
  if (cand.horario && !(r.sol && r.lua)) pontos.fortune = cand.horario.fortuna;
  // Liberação: o L1 começa no signo do lote; no Espírito, se cai no mesmo signo da Fortuna, começa no signo seguinte (Valens IV.V, como liberacao.js)
  let signoZR = rzSignoDe(pontos[rzLoteZR]);
  if (rzLoteZR === 'spirit' && signoZR === rzSignoDe(pontos.fortune)) signoZR = (signoZR + 1) % 12;
  const partida = pontos[rzAfetaCirc] !== undefined ? pontos[rzAfetaCirc] : asc;
  return { nasc, asc, pontos, diurno, partida, fortuna: pontos.fortune, circ: rqCircumambulacao(partida, nasc, e.lat), signoZR };
}

function rzLinhasDoFato(ctx, dataStr) {
  const partes = dataStr.split('-').map(Number);
  const d = new Date(partes[0], partes[1] - 1, partes[2], 12, 0);
  if (d < ctx.nasc) return `<div class="rz-linha-tecnica texto-apagado">Data anterior ao nascimento.</div>`;
  const idade = rqIdade(ctx.nasc, d);
  const lc = rqLinhaCircumambulacao(ctx.circ, d);
  const circ = lc
    ? `${rzIconeAfeta(rzAfetaCirc, 18)} <strong>Circumambulação</strong> ${rzSignoHtml(lc.signIdx, 18)} ${lc.termStartDeg}°–${lc.termEndDeg}° <span class="texto-apagado">termo de</span> ${rzPlanetaHtml(lc.termPlanetId, 18)} <span class="texto-apagado">de ${rzDataBR(lc.startDate)} a ${rzDataBR(lc.endDate)}</span>`
    : `${rzIconeAfeta(rzAfetaCirc, 18)} <strong>Circumambulação</strong> <span class="texto-apagado">nenhum período cobre essa data</span>`;
  const z = rqLiberacaoEm(ctx.signoZR, ctx.nasc, d);
  const niv = (n, x) => x ? `<span class="texto-apagado">nível ${n}</span> ${rzSignoHtml(x.signIdx, 18)} <span class="texto-apagado">${rzDataBR(x.start)} a ${rzDataBR(x.end)}</span>` : '';
  const lib = z
    ? `${rzIconeAfeta(rzLoteZR, 18)} <strong>Liberação</strong> ${niv(1, z.l1)} ${z.l2 ? '→ ' + niv(2, z.l2) : ''} ${z.l3 ? '→ ' + niv(3, z.l3) : ''}`
    : `${rzIconeAfeta(rzLoteZR, 18)} <strong>Liberação</strong> <span class="texto-apagado">nenhum período cobre essa data</span>`;
  return `${idade ? `<div class="texto-apagado" style="font-size:11.5px;">${idade}</div>` : ''}<div class="rz-linha-tecnica">${circ}</div><div class="rz-linha-tecnica">${lib}</div>`;
}

function rzMontarFatos(r) {
  const ctx = rzContextoFatos(r);
  if (!ctx) return `<div class="texto-apagado rz-fonte">Escolha um horário na seção 4.</div>`;
  const ordenados = rzFatos.slice().sort((a, b) => (a.data || '9999') < (b.data || '9999') ? -1 : (a.data || '9999') > (b.data || '9999') ? 1 : a.id - b.id);
  const btnConf = (f, v, rot) => `<button type="button" class="btn-secondary" onclick="rzFatoConf(${f.id}, '${v}')" style="padding:3px 10px; font-size:12px; background:transparent; border:${f.conf === v ? 3 : 1}px solid var(--azul-egipcio-claro);">${rot}</button>`;
  const linhas = ordenados.map(f => `
    <div class="rz-fato">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:6px;">
        <input type="date" value="${f.data}" onchange="rzFatoData(${f.id}, this.value)" title="Data do fato">
        <button type="button" class="botao-icone" onclick="rzFatoRemover(${f.id})" title="Remover este fato" style="margin-left:auto;"><svg class="icone" viewBox="0 0 64 64"><line x1="14" y1="14" x2="50" y2="50"/><line x1="50" y1="14" x2="14" y2="50"/></svg></button>
      </div>
      <textarea placeholder="O que aconteceu nessa data" oninput="rzFatoTexto(${f.id}, this.value)">${escapeHtml(f.texto)}</textarea>
      ${f.data ? rzLinhasDoFato(ctx, f.data) : '<div class="texto-apagado rz-fonte">Preencha a data para ver as linhas.</div>'}
      <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:6px;"><span class="texto-apagado" style="font-size:12px;">Confirma?</span> ${btnConf(f, 'sim', 'Sim')} ${btnConf(f, 'parte', 'Em parte')} ${btnConf(f, 'nao', 'Não')}</div>
    </div>`).join('');
  const n = (v) => rzFatos.filter(f => f.conf === v).length;
  const resumo = rzFatos.some(f => f.conf)
    ? `<div style="font-size:13px; margin-top:8px;"><strong>${n('sim')}</strong> sim · <strong>${n('parte')}</strong> em parte · <strong>${n('nao')}</strong> não, de ${rzFatos.length} ${rzFatos.length === 1 ? 'fato' : 'fatos'} neste horário.</div>` : '';
  const escolha = (chave, atual, fn) => `<button type="button" class="btn-secondary" onclick="${fn}('${chave}')" title="${RZ_AFETA_NOME[chave]}" style="display:inline-flex; align-items:center; gap:5px; padding:3px 8px; font-size:12px; background:transparent; border:${chave === atual ? 3 : 1}px solid var(--azul-egipcio-claro);">${rzIconeAfeta(chave, 18)}${chave === 'seita' ? `<span>Luminar da seita (${ctx.diurno ? 'Sol' : 'Lua'})</span>` : ''}</button>`;
  const afetas = ['ASC', 'Sun', 'Moon', 'seita', 'Syz'].concat(RZ_LOTES);
  return `
    <div class="texto-apagado rz-fonte" style="margin-bottom:6px;">Cada fato mostra as linhas do horário em teste. Os fatos aparecem em ordem de data. Ajuste o horário na seção 4 e tudo se recalcula.</div>
    <div class="cartao" style="margin-bottom:8px;">
      <div class="rotulo">Circumambulação parte de</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin:6px 0;">${afetas.map(k => escolha(k, rzAfetaCirc, 'rzEscolherAfeta')).join('')}</div>
      <div class="texto-apagado rz-fonte">${RZ_AFETA_NOME[rzAfetaCirc]} em ${rzPosHtml(ctx.partida, 16)}</div>
      <div class="rotulo" style="margin-top:10px;">Liberação zodiacal pelo lote</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin:6px 0;">${RZ_LOTES.map(k => escolha(k, rzLoteZR, 'rzEscolherLoteZR')).join('')}</div>
      <div class="texto-apagado rz-fonte">${RZ_LOTE_NOME[rzLoteZR]} em ${rzPosHtml(ctx.pontos[rzLoteZR], 16)}</div>
    </div>
    ${linhas}
    <div style="margin-top:8px;"><button type="button" class="btn-secondary" onclick="rzFatoNovo()">+ Adicionar fato</button></div>
    ${resumo}`;
}
function rzRedesenharFatos() { const el = document.getElementById('rzFatos'); if (el && rzUltimo) el.innerHTML = rzMontarFatos(rzUltimo); }
function rzEscolherAfeta(k) { rzAfetaCirc = k; rzRedesenharFatos(); }
function rzEscolherLoteZR(k) { rzLoteZR = k; rzRedesenharFatos(); }
function rzFatoPorId(id) { return rzFatos.find(f => f.id === id); }
function rzFatoNovo() { rzFatos.push({ id: ++rzFatoSeq, data: '', texto: '', conf: '' }); rzRedesenharFatos(); }
function rzFatoRemover(id) { rzFatos = rzFatos.filter(f => f.id !== id); if (!rzFatos.length) rzFatos.push({ id: ++rzFatoSeq, data: '', texto: '', conf: '' }); rzRedesenharFatos(); }
function rzFatoData(id, v) { const f = rzFatoPorId(id); if (f) { f.data = v; rzRedesenharFatos(); } }
function rzFatoTexto(id, v) { const f = rzFatoPorId(id); if (f) f.texto = v; }
function rzFatoConf(id, v) { const f = rzFatoPorId(id); if (f) { f.conf = (f.conf === v) ? '' : v; rzRedesenharFatos(); } }
if (typeof window !== 'undefined') Object.assign(window, { rzEscolherAfeta, rzEscolherLoteZR, rzFatoNovo, rzFatoRemover, rzFatoData, rzFatoTexto, rzFatoConf });

/* ---------- Seção 6: mandala no horário final ----------
   Não mexe no mapa em tela: guarda o estado global (momento, local, céu, lotes), calcula o céu do horário final (motor, hh:mm), pede o
   desenho à roda central (roda.js) e devolve tudo como estava. A roda e o cabeçalho saem com o horário retificado. */
let rzMapaFinalSvg = null;        // { url, ms } da última mandala gerada
function rzMontarMapaFinal(r) { return `<div id="rzMapaFinal">${rzMontarMapaFinalCorpo(r, false)}</div>`; }
function rzMontarMapaFinalCorpo(r, velha) {
  if (!rzFinalSel) return '';
  if (velha && rzMapaFinalSvg) { URL.revokeObjectURL(rzMapaFinalSvg.url); rzMapaFinalSvg = null; }
  const hhmm = rzFmtHora(rzMsFinal(r, rzFinalSel), r.entrada.fuso).slice(0, 5);
  return `
    <div class="texto-apagado rz-fonte" style="margin-bottom:8px;">Gera a mandala no horário final (${hhmm}). O mapa que está aberto no menu não muda.</div>
    <div style="margin-bottom:8px;"><button type="button" class="btn-secondary" id="rzBtnMandala" onclick="rzGerarMandalaFinal()">Gerar mandala no horário final</button></div>
    <div id="rzMandalaFinal">${rzMapaFinalSvg ? `<img src="${rzMapaFinalSvg.url}" alt="Mandala no horário retificado" style="display:block; width:100%; max-width:760px; margin:0 auto;">` : ''}</div>`;
}

async function rzGerarMandalaFinal() {
  const r = rzUltimo, sel = rzFinalSel;
  const alvo = document.getElementById('rzMandalaFinal'), btn = document.getElementById('rzBtnMandala');
  if (!r || !sel || !alvo) return;
  if (typeof executarCalculo !== 'function' || typeof desenharRodaSVG !== 'function') { alvo.innerHTML = rzMensagem('A mandala não está disponível nesta tela.'); return; }
  if (window.__calculosEmAndamento > 0) { alvo.innerHTML = rzMensagem('Espere o cálculo atual terminar e tente de novo.'); return; }
  const e = r.entrada;
  const minutos = rzMsFinal(r, sel);
  const d = new Date(minutos + e.fuso * 3600000);          // relógio local do mapa, lido em UTC
  const salvo = { dados: currentCalculatedData, momento: currentMoment, geo: currentGeo, lotes: window.currentLotes, capa: window.ceuFundoCapaUltimo };
  if (btn) btn.disabled = true;
  alvo.innerHTML = `<div class="texto-apagado" style="font-size:12.5px;">Gerando...</div>`;
  let svg = null, cabecalho = null;
  try {
    currentMoment = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
    currentGeo = Object.assign({}, currentGeo, { fuso: e.fuso });
    if (!(await executarCalculo({ soCalcular: true }))) throw new Error('o motor não respondeu');
    const papiro = window.temaMandala === 'ceu';
    // 'claro' + sem fundo: o mesmo que a Mandala manda pro Relatório (no Tema Céu, a roda em tinta sobre papiro)
    svg = (papiro ? desenharRodaSVG({ estiloForcado: 'claro', fundoTransparente: true, tintaPapiro: true }) : desenharRodaSVG({ estiloForcado: 'claro', fundoTransparente: true })).svg;
    if (typeof montarCabecalhoMandalaImagemHTML === 'function') cabecalho = montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true });
  } catch (err) {
    console.error('Mandala no horário final:', err);
    alvo.innerHTML = `<div style="color:var(--terracota); font-weight:700; font-size:13px;">Não foi possível gerar a mandala: ${escapeHtml(err.message || String(err))}</div>`;
  } finally {
    currentCalculatedData = salvo.dados; currentMoment = salvo.momento; currentGeo = salvo.geo; window.currentLotes = salvo.lotes; window.ceuFundoCapaUltimo = salvo.capa;
    if (btn) btn.disabled = false;
  }
  if (!svg) return;
  if (rzMapaFinalSvg) URL.revokeObjectURL(rzMapaFinalSvg.url);
  rzMapaFinalSvg = { url: URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })), ms: minutos };
  alvo.innerHTML = `<img src="${rzMapaFinalSvg.url}" alt="Mandala no horário retificado" style="display:block; width:100%; max-width:760px; margin:0 auto;">`;
  const cab = document.getElementById('rzCabecalho');
  if (cab && cabecalho) cab.innerHTML = cabecalho;           // o cabeçalho do topo passa a mostrar o horário retificado
}
if (typeof window !== 'undefined') window.rzGerarMandalaFinal = rzGerarMandalaFinal;

/* ---------- Salvar na galeria e adicionar ao Relatório (mesmo padrão das outras ferramentas) ---------- */
function salvarRetificacaoSizigiaNaGaleria() {
  const area = document.getElementById('rzResultado');
  if (!area || !rzUltimo) { alert('Calcule primeiro.'); return; }
  capturarESalvarNaGaleria(
    () => gerarImagemHtmlComCabecalho(area, { titulo: 'ACHADOR DE HORÁRIO PELA SIZÍGIA', comCabecalho: true, papiro: true }),
    `Astro_Hellenic_Achador_de_Horario_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
if (typeof window !== 'undefined') window.salvarRetificacaoSizigiaNaGaleria = salvarRetificacaoSizigiaNaGaleria;

async function capturarRetificacaoSizigiaParaRelatorio() {
  const area = document.getElementById('rzResultado');
  if (!area || !rzUltimo) { alert('Calcule primeiro.'); return; }
  try {
    const papiro = window.temaMandala === 'ceu';
    const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : fundoPainelClaro()); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('retificacaoSizigia', canvas.toDataURL('image/png'));
    alert(`"Achador de horário pela sizígia" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar o Achador de horário ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
if (typeof window !== 'undefined') window.capturarRetificacaoSizigiaParaRelatorio = capturarRetificacaoSizigiaParaRelatorio;
