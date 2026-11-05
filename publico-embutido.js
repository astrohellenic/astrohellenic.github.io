/* Páginas públicas abertas DENTRO de outra página (o Seu espaço do site do astrólogo): avisa a altura de si mesma, pra a moldura de fora
   não precisar de rolagem dupla. Fora de moldura não faz nada. (O visual sem fundo/sem logo vem do tema "Embutido" em Configurações → Captação.) */
(function () {
  if (window.parent === window) return;
  var ultima = 0, pendente = false;
  /* altura = até onde vai o conteúdo de verdade (fim do último elemento), não só a caixa do body: assim cresce e encolhe junto com o que aparece */
  function medir() {
    var h = Math.ceil(document.body.getBoundingClientRect().height); /* do corpo, não do html: o html nunca fica menor que o quadro e a altura não encolheria */
    var fim = 0, filhos = document.body.children;
    for (var i = 0; i < filhos.length; i++) {
      var f = filhos[i], pos = getComputedStyle(f).position;
      if (/^(SCRIPT|STYLE|LINK)$/.test(f.tagName) || pos === 'fixed') continue;
      var r = f.getBoundingClientRect();
      if (r.height > 0) fim = Math.max(fim, r.bottom + window.pageYOffset);
    }
    return Math.max(h, Math.ceil(fim));
  }
  function avisar() {
    pendente = false;
    var h = medir();
    if (Math.abs(h - ultima) < 2) return;
    ultima = h;
    window.parent.postMessage({ tipo: 'astrohellenic-altura', altura: h }, '*');
  }
  function agendar() { if (pendente) return; pendente = true; (window.requestAnimationFrame || setTimeout)(avisar); }
  window.addEventListener('load', avisar);
  window.addEventListener('resize', avisar);
  if (window.ResizeObserver) new ResizeObserver(agendar).observe(document.body);
  /* o que entra ou muda dentro da página (um fato novo, uma mensagem) também avisa, mesmo sem a caixa do body mudar */
  if (window.MutationObserver) new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
  setInterval(avisar, 700); /* rede de segurança: se algum aviso falhar, em instantes a altura se acerta sozinha */
})();
