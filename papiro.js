/* PAPIRO GLOBAL — lado JS. As cores moram em papiro.css (variáveis --papiro-*); aqui só se LÊ de lá, pra
   imagens salvas (canvas/SVG) saírem com o mesmo papiro da tela. Os valores de reserva abaixo só valem se
   o CSS não carregar — manter iguais aos de papiro.css. */
function papiroCores() {
  const css = (typeof document !== 'undefined' && document.documentElement) ? getComputedStyle(document.documentElement) : null;
  const ler = (nome, reserva) => ((css && css.getPropertyValue(nome)) || '').trim() || reserva;
  const topo = ler('--papiro-topo', '#e6d3a0'), meio = ler('--papiro-meio', '#dcc590'), base = ler('--papiro-base', '#d2b980');
  return { topo, meio, base, chapado: meio };
}
/* <linearGradient> de SVG (vertical) com as cores do papiro */
function papiroGradienteSvg(id) {
  const c = papiroCores();
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.topo}"/><stop offset=".5" stop-color="${c.meio}"/><stop offset="1" stop-color="${c.base}"/></linearGradient>`;
}
/* CanvasGradient vertical com as cores do papiro (0 → altura) */
function papiroGradienteCanvas(ctx, altura) {
  const c = papiroCores(), g = ctx.createLinearGradient(0, 0, 0, altura);
  g.addColorStop(0, c.topo); g.addColorStop(0.5, c.meio); g.addColorStop(1, c.base);
  return g;
}
