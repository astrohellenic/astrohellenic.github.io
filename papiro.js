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

/* TEXTURA COMPLETA DO PAPIRO pras IMAGENS SALVAS (galeria) — as mesmas camadas de --papiro-fundo (papiro.css): degradê
   vertical + luz no canto de cima à esquerda + sombra no canto de baixo à direita + fibras horizontais e verticais.
   Antes as imagens salvas saíam só com o degradê/cor chapada (sem textura), e ninguém reconhecia o papiro.
   "esc" = quantos pixels da imagem valem 1 px de CSS (as imagens salvas são desenhadas em escala 2). */
const PAPIRO_FIBRA_H = 'rgba(120,85,40,0.07)', PAPIRO_FIBRA_V = 'rgba(150,110,60,0.05)';
function papiroTexturaCanvas(ctx, largura, altura, esc) {
  esc = esc || 1;
  ctx.save();
  ctx.fillStyle = papiroGradienteCanvas(ctx, altura);
  ctx.fillRect(0, 0, largura, altura);
  // fibras verticais (2px a cada 27px) e horizontais (1px a cada 6px)
  ctx.fillStyle = PAPIRO_FIBRA_V;
  for (let x = 0; x < largura; x += 27 * esc) ctx.fillRect(x, 0, 2 * esc, altura);
  ctx.fillStyle = PAPIRO_FIBRA_H;
  for (let y = 0; y < altura; y += 6 * esc) ctx.fillRect(0, y, largura, esc);
  // sombra (90% 96%) e luz (12% 6%): elipses "farthest-corner", como no CSS
  const elipse = (fx, fy, rgba, corte) => {
    const cx = largura * fx, cy = altura * fy;
    const rx = Math.max(cx, largura - cx) * Math.SQRT2, ry = Math.max(cy, altura - cy) * Math.SQRT2;
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, rgba); g.addColorStop(corte, rgba.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = g;
    ctx.fillRect(-cx / rx, -cy / ry, largura / rx, altura / ry);
    ctx.restore();
  };
  elipse(0.90, 0.96, 'rgba(110,70,30,0.22)', 0.45);
  elipse(0.12, 0.06, 'rgba(255,244,210,0.6)', 0.40);
  ctx.restore();
}
/* A mesma textura como pedaço de SVG (<defs> + retângulos) pra imagens montadas em SVG. "id" evita colisão de ids. */
function papiroTexturaSvg(id, largura, altura) {
  const c = papiroCores();
  const elipse = (nome, fx, fy, rgb, a, corte) => {
    const cx = largura * fx, cy = altura * fy;
    const rx = Math.max(cx, largura - cx) * Math.SQRT2, ry = Math.max(cy, altura - cy) * Math.SQRT2;
    return `<radialGradient id="${id}${nome}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx} ${cy}) scale(${rx} ${ry})"><stop offset="0" stop-color="rgb(${rgb})" stop-opacity="${a}"/><stop offset="${corte}" stop-color="rgb(${rgb})" stop-opacity="0"/></radialGradient>`;
  };
  return `<defs>
    <linearGradient id="${id}G" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.topo}"/><stop offset=".5" stop-color="${c.meio}"/><stop offset="1" stop-color="${c.base}"/></linearGradient>
    <pattern id="${id}V" width="27" height="10" patternUnits="userSpaceOnUse"><rect width="2" height="10" fill="rgb(150,110,60)" fill-opacity="0.05"/></pattern>
    <pattern id="${id}H" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="1" fill="rgb(120,85,40)" fill-opacity="0.07"/></pattern>
    ${elipse('S', 0.90, 0.96, '110,70,30', 0.22, 0.45)}${elipse('L', 0.12, 0.06, '255,244,210', 0.6, 0.40)}
  </defs>
  <rect width="${largura}" height="${altura}" fill="url(#${id}G)"/>
  <rect width="${largura}" height="${altura}" fill="url(#${id}V)"/>
  <rect width="${largura}" height="${altura}" fill="url(#${id}H)"/>
  <rect width="${largura}" height="${altura}" fill="url(#${id}S)"/>
  <rect width="${largura}" height="${altura}" fill="url(#${id}L)"/>`;
}

/* PALETA DE ÉPOCA — lado JS. As cores moram em temas.css; aqui só se LÊ de lá (por uma "sonda": um elemento
   invisível com a classe do modo pedido), pra desenhos em SVG/canvas saírem com a mesma cor da tela.
   escuro = false -> papiro e modo claro; true -> modo escuro. Valores de reserva = os de temas.css. */
const __paletaEpocaCache = {};
function paletaEpoca(escuro) {
  const chave = escuro ? 'e' : 'c';
  if (__paletaEpocaCache[chave]) return __paletaEpocaCache[chave];
  const reserva = escuro
    ? { azulEscuro: '#5F80E7', azulClaro: '#4A8DD4', pretoTinta: '#E2E8F0', ocre: '#D9AE3F', terracota: '#CF6044', laranja: '#F28A33', marrom: '#AE7C4E', cinza: '#A3ADB5', verde: '#5FA073', fundoCreme: '#1C1917' }
    : { azulEscuro: '#1034A6', azulClaro: '#1F5FA3', pretoTinta: '#1A1410', ocre: '#B5852F', terracota: '#A03E25', laranja: '#D0610F', marrom: '#6B4A2B', cinza: '#6B7780', verde: '#4A7C59', fundoCreme: '#FFFDF5' };
  if (typeof document === 'undefined' || !document.body) return reserva;
  const sonda = document.createElement('span');
  sonda.className = escuro ? 'paleta-escura' : 'paleta-clara';
  sonda.style.display = 'none';
  document.body.appendChild(sonda);
  const css = getComputedStyle(sonda);
  const ler = (nome, res) => (css.getPropertyValue(nome) || '').trim() || res;
  const r = {
    azulEscuro: ler('--azul-egipcio-escuro', reserva.azulEscuro), azulClaro: ler('--azul-egipcio-claro', reserva.azulClaro),
    pretoTinta: ler('--preto-tinta', reserva.pretoTinta), ocre: ler('--ocre', reserva.ocre), terracota: ler('--terracota', reserva.terracota),
    laranja: ler('--laranja', reserva.laranja), marrom: ler('--marrom', reserva.marrom), cinza: ler('--cinza', reserva.cinza), verde: ler('--verde', reserva.verde), fundoCreme: ler('--fundo-creme', reserva.fundoCreme)
  };
  document.body.removeChild(sonda);
  // só guarda se o CSS realmente carregou (senão tenta de novo na próxima vez)
  if (css.getPropertyValue('--azul-egipcio-claro').trim()) __paletaEpocaCache[chave] = r;
  return r;
}

/* COR DO ELEMENTO DE CADA SIGNO — a ÚNICA fonte: fogo = laranja, terra = marrom, ar = cinza, água = azul egípcio claro (temas.css), na versão do
   modo (claro/escuro). Toda ferramenta que desenha um signo colorido pede a cor AQUI; ninguém guarda lista própria de cores de signo. */
function corElementoSigno(signIdx) {
  const pal = paletaEpoca(document.documentElement.classList.contains('tema-escuro') && window.temaMandala !== 'ceu');
  return [pal.laranja, pal.marrom, pal.cinza, pal.azulClaro][(((signIdx % 12) + 12) % 12) % 4];
}
const ELEMENTO_SIGNO_EPOCA = {
  get fire() { return corElementoSigno(0); }, get earth() { return corElementoSigno(1); },
  get air() { return corElementoSigno(2); }, get water() { return corElementoSigno(3); }
};
window.corElementoSigno = corElementoSigno;
