/* Páginas públicas abertas DENTRO de outra página (o Seu espaço do site do astrólogo): avisa a altura de si mesma, pra a moldura de fora
   não precisar de rolagem dupla. Fora de moldura não faz nada. (O visual sem fundo/sem logo vem do tema "Embutido" em Configurações → Captação.) */
(function () {
  if (window.parent === window) return;
  var ultima = 0;
  function avisar() {
    var h = Math.ceil(document.body.getBoundingClientRect().height); /* do corpo, não do html: o html nunca fica menor que o quadro e a altura não encolheria */
    if (Math.abs(h - ultima) < 2) return;
    ultima = h;
    window.parent.postMessage({ tipo: 'astrohellenic-altura', altura: h }, '*');
  }
  window.addEventListener('load', avisar);
  window.addEventListener('resize', avisar);
  if (window.ResizeObserver) new ResizeObserver(avisar).observe(document.body);
  else setInterval(avisar, 500);
})();
