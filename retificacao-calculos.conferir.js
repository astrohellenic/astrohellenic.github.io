/* Conferência da CÓPIA (retificacao-calculos.js) contra as ferramentas originais (direcoes.js e liberacao.js).
   Uso: node retificacao-calculos.conferir.js   → tem que terminar com "TUDO IGUAL". */
const vm = require('vm'), fs = require('fs'), path = require('path');
const rq = require('./retificacao-calculos.js');
const dir = __dirname;
const ctx = { console, window: {}, document: { getElementById: () => null }, currentGeo: { lat: -23.55 }, setTimeout, calculateSevenLots: () => [] };
vm.createContext(ctx);
['direcoes.js', 'liberacao.js'].forEach(f => { try { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }); } catch (e) { console.error('Falha ao carregar ' + f + ': ' + e.message); process.exit(2); } });

let falhas = 0, casos = 0;
const igual = (a, b, onde) => { casos++; if (JSON.stringify(a) !== JSON.stringify(b)) { falhas++; if (falhas < 6) console.error('DIFERENTE em ' + onde + '\n  original: ' + JSON.stringify(a).slice(0, 300) + '\n  cópia:    ' + JSON.stringify(b).slice(0, 300)); } };

// tabela de termos
igual(vm.runInContext('EGYPTIAN_TERMS_DIRECOES.map(s => s.map(t => ({ pId: t.pId, deg: t.deg })))', ctx), rq.RQ_TERMOS, 'termos');
igual(vm.runInContext('ZR_SIGN_YEARS', ctx), rq.RQ_ZR_ANOS, 'anos ZR');

// Circumambulação: latitudes e pontos de partida variados
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 300; i++) {
  const lat = -60 + rnd() * 120, start = rnd() * 360;
  const nasc = new Date(1930 + Math.floor(rnd() * 90), Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28), Math.floor(rnd() * 24), Math.floor(rnd() * 60));
  ctx.currentGeo = { lat };
  ctx.__s = start; ctx.__n = nasc; ctx.__d = {};
  const orig = vm.runInContext('calcular12SignosCircumambulatoria(__s, __n, __d)', ctx);
  igual(orig.map(l => { const c = Object.assign({}, l); delete c.termPlanetSym; return c; }), rq.rqCircumambulacao(start, nasc, lat), 'circumambulação #' + i);   // o símbolo do planeta é só de tela e não foi copiado
}
// Liberação: L2/L3/L4 e o L1 percorrido como em renderLiberacaoUI
for (let i = 0; i < 300; i++) {
  const sign = Math.floor(rnd() * 12), ini = new Date(1930 + Math.floor(rnd() * 90), Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28), Math.floor(rnd() * 24), Math.floor(rnd() * 60));
  ctx.__sign = sign; ctx.__ini = ini;
  const fim = vm.runInContext('calcularDataFimZR(__ini, ZR_SIGN_YEARS[__sign])', ctx);
  igual(fim, rq.rqFimZR(ini, rq.RQ_ZR_ANOS[sign]), 'fim L1 #' + i);
  ctx.__fim = fim; ctx.__anos = rq.RQ_ZR_ANOS[sign];
  const l2 = vm.runInContext('calcularSubperiodosL2(__sign, __ini, __anos)', ctx);
  igual(l2.map(x => ({ signIdx: x.signIdx, start: x.start, end: x.end, isLysis: x.isLysis })), rq.rqSubperiodos(2, sign, ini, fim), 'L2 #' + i);
  const alvo = l2[Math.floor(rnd() * l2.length)];
  ctx.__a = alvo;
  const l3 = vm.runInContext('calcularSubperiodosL3(__a.signIdx, __a.start, __a.end)', ctx);
  igual(l3.map(x => ({ signIdx: x.signIdx, start: x.start, end: x.end, isLysis: x.isLysis })), rq.rqSubperiodos(3, alvo.signIdx, alvo.start, alvo.end), 'L3 #' + i);
  const alvo3 = l3[Math.floor(rnd() * l3.length)];
  ctx.__b = alvo3;
  const l4 = vm.runInContext('calcularSubperiodosL4(__b.signIdx, __b.start, __b.end)', ctx);
  igual(l4.map(x => ({ signIdx: x.signIdx, start: x.start, end: x.end, isLysis: x.isLysis })), rq.rqSubperiodos(4, alvo3.signIdx, alvo3.start, alvo3.end), 'L4 #' + i);
}
// idade
for (let i = 0; i < 200; i++) {
  const de = new Date(1930 + Math.floor(rnd() * 80), Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28));
  const ate = new Date(de.getTime() + rnd() * 80 * 365.25 * 86400000);
  ctx.__de = de; ctx.__ate = ate;
  igual(vm.runInContext('idadeCompactaDir(__de, __ate)', ctx), rq.rqIdade(de, ate), 'idade #' + i);
}
console.log(falhas ? `${falhas} DIFERENÇA(S) em ${casos} comparações` : `TUDO IGUAL (${casos} comparações)`);
process.exit(falhas ? 1 : 0);
