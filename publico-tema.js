/* Tema das páginas públicas (formulario.html e agendar.html): o valor vem de configuracoes.formulario_tema,
   escolhido em Configurações → Captação. 'ceu' | 'claro' | 'escuro' | 'auto' (automático = segue o aparelho do cliente).
   Tema novo = um ramo aqui e uma opção em htmlCfgCaptacao (configuracoes.js). Valor desconhecido/vazio = claro. */
function aplicarTemaPublico(valor) {
  const raiz = document.documentElement;
  const escuro = valor === 'escuro' ||
    (valor === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.classList.toggle('tema-escuro', escuro);
  document.body.classList.toggle('tema-ceu', valor === 'ceu');
}
