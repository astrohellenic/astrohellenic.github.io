/* Páginas públicas abertas DENTRO de outra página (o Seu espaço do site do astrólogo): sem fundo próprio (a página de fora aparece)
   e avisa a altura de si mesma, pra a moldura de fora não precisar de rolagem dupla. Fora de moldura não faz nada. */
(function () {
  if (window.parent === window) return;
  document.documentElement.classList.add('embutido');
  var ultima = 0;
  function avisar() {
    var h = Math.ceil(document.documentElement.scrollHeight);
    if (Math.abs(h - ultima) < 2) return;
    ultima = h;
    window.parent.postMessage({ tipo: 'astrohellenic-altura', altura: h }, '*');
  }
  window.addEventListener('load', avisar);
  window.addEventListener('resize', avisar);
  if (window.ResizeObserver) new ResizeObserver(avisar).observe(document.documentElement);
  else setInterval(avisar, 500);
})();
