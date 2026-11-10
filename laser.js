/* Caneta laser: com o botão ligado (pequeno, na beira direita da tela; só aparece em aparelho com caneta), a caneta (Apple Pencil) ou o mouse riscam por cima de
   qualquer tela do software, e o risco some sozinho alguns segundos depois. O DEDO continua funcionando normal (rolar, tocar):
   só a caneta e o mouse riscam. A barra de cima nunca é riscada (para trocar de ferramenta e desligar o laser).
   Nada é salvo: é só para apontar e mostrar durante um atendimento ou uma live. Esc também desliga. */
(function () {
  var DURA = 6000, SOME = 1200;          /* quanto tempo o risco fica inteiro depois de solto, e quanto leva para sumir */
  var COR = '#E2231A', MIOLO = '#FFB3A6';
  var ligado = false, lona = null, g = null, dpr = 1, riscos = [], atual = null, rodando = false, ultimoRisco = 0;

  function botao() { return document.getElementById('btn-laser'); }
  function foraDoRisco(alvo) { return !!(alvo && alvo.closest && alvo.closest('#top-bar, #btn-laser')); }

  /* O botão NÃO fica na barra de ferramentas (não é uma ferramenta que se abre: é usado por cima delas) e só existe em aparelho com CANETA:
     aparece, pequeno, na beira direita da tela, na primeira vez que a caneta (Apple Pencil) encosta ou passa perto da tela, e o aparelho
     lembra disso (é coisa do aparelho: celular sem caneta nunca mostra nada). */
  var CHAVE = 'astro_tem_caneta';
  function criarBotao() {
    if (botao() || !document.body) return;
    var b = document.createElement('button');
    b.id = 'btn-laser'; b.type = 'button'; b.title = 'Caneta laser'; b.setAttribute('aria-label', 'Caneta laser'); b.setAttribute('aria-pressed', 'false');
    b.style.cssText = 'position:fixed;right:calc(28px + env(safe-area-inset-right));top:50%;transform:translateY(-50%);z-index:2147483001;width:40px;height:40px;padding:0;margin:0;border:0;background:transparent;color:var(--ocre,#B5852F);cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.8;-webkit-tap-highlight-color:transparent;touch-action:manipulation';
    b.innerHTML = '<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M26,46 L50,22 L42,14 L18,38 Z"/><line x1="18" y1="38" x2="26" y2="46"/><path d="M18,38 L12,52 L26,46"/><line x1="6" y1="40" x2="3" y2="38"/><line x1="24" y1="58" x2="26" y2="61"/><line x1="7" y1="57" x2="4" y2="60"/></svg>';
    b.addEventListener('click', function () { ligar(!ligado); });
    document.body.appendChild(b);
  }
  function viuCaneta(e) {
    if (e.pointerType !== 'pen' || botao()) return;
    try { localStorage.setItem(CHAVE, '1'); } catch (x) { /* sem armazenamento */ }
    criarBotao();
  }
  document.addEventListener('pointerdown', viuCaneta, true);
  document.addEventListener('pointermove', viuCaneta, true);
  var jaTem = false; try { jaTem = localStorage.getItem(CHAVE) === '1'; } catch (x) { /* sem armazenamento */ }
  if (jaTem) { if (document.body) criarBotao(); else document.addEventListener('DOMContentLoaded', criarBotao); }

  function criarLona() {
    if (lona) return;
    lona = document.createElement('canvas');
    lona.setAttribute('aria-hidden', 'true');
    lona.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483000;pointer-events:none';
    document.body.appendChild(lona);
    g = lona.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', medir);
  }
  /* A lona é medida pelo retângulo DELA na tela, nunca por window.innerWidth: com o zoom de pinça (ele apresenta os mapas com zoom) o innerWidth
     encolhe e o risco saía fora do lugar. Com zoom a lona ganha mais pontos, para o risco não ficar borrado. */
  var caixa = { left: 0, top: 0, width: 1, height: 1 };
  function medir() {
    if (!lona) return;
    caixa = lona.getBoundingClientRect();
    var zoom = (window.visualViewport && window.visualViewport.scale) || 1;
    dpr = Math.max(1, window.devicePixelRatio || 1) * Math.min(4, Math.max(1, zoom));
    dpr = Math.min(dpr, Math.sqrt(16e6 / Math.max(1, caixa.width * caixa.height)));
    var w = Math.max(1, Math.round(caixa.width * dpr)), h = Math.max(1, Math.round(caixa.height * dpr));
    if (lona.width !== w || lona.height !== h) { lona.width = w; lona.height = h; }
  }

  function tracar(r, largura, cor, brilho) {
    var p = r.p, sx = window.scrollX, sy = window.scrollY;
    g.lineWidth = largura; g.strokeStyle = cor; g.fillStyle = cor; g.shadowColor = COR; g.shadowBlur = brilho;
    g.beginPath();
    if (p.length === 1) { g.arc(p[0][0] - sx, p[0][1] - sy, largura / 2, 0, 7); g.fill(); return; }
    g.moveTo(p[0][0] - sx, p[0][1] - sy);
    for (var i = 1; i < p.length - 1; i++) { /* curva suave passando pelo meio de cada par de pontos */
      var mx = (p[i][0] + p[i + 1][0]) / 2 - sx, my = (p[i][1] + p[i + 1][1]) / 2 - sy;
      g.quadraticCurveTo(p[i][0] - sx, p[i][1] - sy, mx, my);
    }
    g.lineTo(p[p.length - 1][0] - sx, p[p.length - 1][1] - sy);
    g.stroke();
  }
  function quadro() {
    var agora = Date.now();
    riscos = riscos.filter(function (r) { return !r.fim || agora - r.fim < DURA + SOME; });
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, caixa.width, caixa.height);
    g.lineCap = 'round'; g.lineJoin = 'round';
    riscos.forEach(function (r) {
      var idade = r.fim ? agora - r.fim : 0;
      g.globalAlpha = idade <= DURA ? 1 : Math.max(0, 1 - (idade - DURA) / SOME);
      tracar(r, 5, COR, 10);
      tracar(r, 1.6, MIOLO, 0);
    });
    g.globalAlpha = 1; g.shadowBlur = 0;
    if (riscos.length) requestAnimationFrame(quadro); else rodando = false;
  }
  function animar() { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } }

  function risca(e) { return ligado && (e.pointerType === 'pen' || e.pointerType === 'mouse'); }
  function ponto(e) { return [e.clientX - caixa.left + window.scrollX, e.clientY - caixa.top + window.scrollY]; }

  function desce(e) {
    if (!risca(e) || foraDoRisco(e.target)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    medir();
    atual = { id: e.pointerId, p: [ponto(e)], fim: 0 };
    riscos.push(atual); animar();
  }
  function move(e) {
    if (!atual || e.pointerId !== atual.id) return;
    e.preventDefault(); e.stopPropagation();
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
    evs.forEach(function (ev) {
      var p = ponto(ev), u = atual.p[atual.p.length - 1];
      if (Math.abs(p[0] - u[0]) + Math.abs(p[1] - u[1]) >= 1.5) atual.p.push(p);
    });
  }
  function sobe(e) {
    if (!atual || e.pointerId !== atual.id) return;
    e.preventDefault(); e.stopPropagation();
    atual.fim = Date.now(); ultimoRisco = atual.fim; atual = null;
  }

  /* a caneta não pode rolar a tela nem "tocar" no que está embaixo enquanto risca (o dedo pode) */
  function toqueDeCaneta(e) {
    if (!ligado || foraDoRisco(e.target)) return;
    var t = e.changedTouches;
    for (var i = 0; i < t.length; i++) if (t[i].touchType === 'stylus') { if (e.cancelable) e.preventDefault(); e.stopPropagation(); return; }
  }
  /* o mouse também não clica nem seleciona texto no que está embaixo do risco */
  function mouseEmbaixo(e) {
    if (!ligado || foraDoRisco(e.target)) return;
    if (e.type === 'click' ? (Date.now() - ultimoRisco < 500) : (atual || e.type === 'mousedown')) { e.preventDefault(); e.stopPropagation(); }
  }

  function ligar(sim) {
    ligado = !!sim;
    if (ligado) criarLona();
    var b = botao(); if (b) { b.style.color = ligado ? 'var(--terracota,#A03E25)' : 'var(--ocre,#B5852F)'; b.style.opacity = ligado ? '1' : '.8'; b.setAttribute('aria-pressed', ligado ? 'true' : 'false'); }
    document.documentElement.style.cursor = ligado ? 'crosshair' : '';
  }
  window.alternarCanetaLaser = function () { ligar(!ligado); };

  var captura = { capture: true, passive: false };
  document.addEventListener('pointerdown', desce, captura);
  document.addEventListener('pointermove', move, captura);
  document.addEventListener('pointerup', sobe, captura);
  document.addEventListener('pointercancel', sobe, captura);
  ['touchstart', 'touchmove', 'touchend'].forEach(function (n) { document.addEventListener(n, toqueDeCaneta, captura); });
  ['mousedown', 'mouseup', 'click'].forEach(function (n) { document.addEventListener(n, mouseEmbaixo, captura); });
  document.addEventListener('keydown', function (e) { if (ligado && e.key === 'Escape') ligar(false); });
})();
