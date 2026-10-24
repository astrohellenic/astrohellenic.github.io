/* Dentro de um quadro (site do astrólogo) o tema só chega depois da resposta do servidor: até lá a página fica invisível e sem fundo,
   pra não piscar o visual de sempre antes do "Embutido". Se o tema não chegar em 1,5 s, aparece do jeito que estiver. */
if (window.parent !== window) {
  document.documentElement.classList.add('carregando-tema');
  setTimeout(function () { document.documentElement.classList.remove('carregando-tema'); }, 1500);
}
/* Tema das páginas públicas (formulario.html e agendar.html): o valor vem de configuracoes.formulario_tema,
   escolhido em Configurações → Captação. 'ceu' | 'claro' | 'sulfite' | 'escuro' | 'auto' (automático = segue o aparelho do cliente).
   Tema novo = um ramo aqui e uma opção em htmlCfgCaptacao (configuracoes.js). Valor desconhecido/vazio = claro. */
function aplicarTemaPublico(valor) {
  const raiz = document.documentElement;
  const escuro = valor === 'escuro' ||
    (valor === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.classList.toggle('tema-escuro', escuro);
  raiz.classList.toggle('tema-sulfite', valor === 'sulfite'); // folha branca e letra de caneta (temas.css)
  document.body.classList.toggle('tema-ceu', valor === 'ceu');
  raiz.classList.remove('carregando-tema');
  raiz.classList.toggle('embutido', valor === 'embutido'); // sem fundo e sem logo: só o que precisa (publico.css); o 'powered by' fica
}
