/* Confere onde-estou.js: roda o módulo com um motor falso e compara Decênios com decenios.js (as ferramentas originais). `node onde-estou.conferir.js` */
const fs = require('fs'), vm = require('vm');
const oe = require('./onde-estou.js');
const agora = new Date(2026, 10, 11, 12, 0);
const fakePl = (g) => ({ grau_absoluto: g });
const motor = async (url) => ({ ok: true, json: async () => url.includes('/revolucao')
  ? { momento_exato: { data_utc: '2026-03-28', hora_local: '10:00' } }
  : { ascendente: { signo: 'Aquario', grau: 12.3 }, planetas: { Sol: fakePl(8.5), Lua: fakePl(130.2), Mercurio: fakePl(2), Venus: fakePl(30.4), Marte: fakePl(215), Jupiter: fakePl(100), Saturno: fakePl(300) } } });
const nasc = { ano: 1990, mes: 3, dia: 28, hora: 10, min: 0, lat: -23.5, lon: -46.6, fuso: -3 };
(async () => {
  const r = await oe.ondeEstouHoje(nasc, agora, motor);
  console.log(JSON.stringify(r, (k, v) => v, 0).slice(0, 1500));
  /* Decênios: o mesmo mapa pela ferramenta original */
  const ctx = { console, window: {}, document: { getElementById: () => null }, currentMoment: new Date(1990, 2, 28, 10, 0), PLANETS_DEF: [], ELEMENTO_SIGNO_EPOCA: {}, Date: class extends Date { constructor(...a) { a.length ? super(...a) : super(agora.getTime()); } } };
  ctx.currentCalculatedData = { Ascendente: { grau_absoluto: 300 + 12.3 }, Sol: { grau_absoluto: 8.5 }, Lua: { grau_absoluto: 130.2 }, Mercúrio: { grau_absoluto: 2 }, Vênus: { grau_absoluto: 30.4 }, Marte: { grau_absoluto: 215 }, Júpiter: { grau_absoluto: 100 }, Saturno: { grau_absoluto: 300 } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('decenios.js', 'utf8').split('\n').slice(0, 371).join('\n').replace(/^const ELEMENT_SIGN_COLORS_DEC.*$/m, '') + '\nthis.res = calcularDeceniosAutomatico("Moon");', ctx);
  const t = ctx.res;
  console.log('ferramenta  :', t.activeL1.planet.id, t.activeL2.planet.id);
  console.log('módulo      :', r.decenios.map(x => x.planetId).join(' '));
})().catch(e => { console.error(e); process.exit(1); });
