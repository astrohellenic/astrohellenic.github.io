/* Caneta laser: com o botão ligado (barra de cima, ao lado da engrenagem), a caneta (Apple Pencil) ou o mouse riscam por cima de
   qualquer tela do software, e o risco some sozinho alguns segundos depois. O DEDO continua funcionando normal (rolar, tocar):
   só a caneta e o mouse riscam. A barra de cima nunca é riscada (para trocar de ferramenta e desligar o laser).
   Nada é salvo: é só para apontar e mostrar durante um atendimento ou uma live. Esc também desliga. */
(function () {
  var DURA = 6000, SOME = 1200;          /* quanto tempo o risco fica inteiro depois de solto, e quanto leva para sumir */
  var COR = '#E2231A', MIOLO = '#FFB3A6';
  var ligado = false, lona = null, g = null, dpr = 1, riscos = [], atual = null, rodando = false, ultimoRisco = 0;

  function botao() { return document.getElementById('btn-laser'); }
  function foraDoRisco(alvo) { return !!(alvo && alvo.closest && alvo.closest('#top-bar')); }

  function criarLona() {
    if (lona) return;
    lona = document.createElement('canvas');
    lona.setAttribute('aria-hidden', 'true');
    lona.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;height:100dvh;z-index:2147483000;pointer-events:none';
    document.body.appendChild(lona);
    g = lona.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
  }
  function medir() {
    if (!lona) return;
    dpr = Math.max(1, window.devicePixelRatio || 1);
    lona.width = Math.round(window.innerWidth * dpr); lona.height = Math.round(window.innerHeight * dpr);
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
    g.clearRect(0, 0, window.innerWidth, window.innerHeight);
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
  function ponto(e) { return [e.clientX + window.scrollX, e.clientY + window.scrollY]; }

  function desce(e) {
    if (!risca(e) || foraDoRisco(e.target)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
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
    var b = botao(); if (b) { b.classList.toggle('ativo', ligado); b.setAttribute('aria-pressed', ligado ? 'true' : 'false'); }
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
