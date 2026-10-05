/* TEMA — A ÚNICA FONTE do "qual tema está ligado agora?" e do "como é cada tema".
   Nenhuma ferramenta pergunta mais diretamente se a página está em escuro (classe tema-escuro) ou no Céu (window.temaMandala):
   todas perguntam aqui. Assim, criar um tema novo é (1) o bloco de cores em temas.css, (2) UMA linha em TEMAS abaixo — o resto
   (mandalas, ícones, Relatório, PDF, janelas, formulários) lê as cores do tema por Tema.paleta(). Ver "Como criar um tema novo"
   no CLAUDE.md.

   TEMAS — cada tema se descreve por:
     nome    texto que aparece em Configurações → Aparência
     escuro  true = fundo escuro (as ferramentas usam as variantes "pra fundo escuro": halos, fundos de imagem etc.)
     papel   true = o tema é folha de papel (Céu): imagens salvas saem sobre o papiro, mandala vira roda de tinta etc.
     paleta  nome da paleta em temas.css (classe .paleta-<nome>) que as ferramentas leem; vários temas podem dividir a mesma
     icone   ícone monoline (supabase.js, MENU_ICONES) da opção em Aparência
     desc    frase da opção em Aparência */
const TEMAS = {
  ceu:    { nome: 'Céu',    escuro: false, papel: true,  paleta: 'claro',  icone: 'estrela',    desc: 'Papiro e tinta sobre o céu' },
  claro:  { nome: 'Claro',  escuro: false, papel: false, paleta: 'claro',  icone: 'sol',        desc: 'Sempre com fundo claro, não importa o aparelho' },
  escuro: { nome: 'Escuro', escuro: true,  papel: false, paleta: 'escuro', icone: 'lua',        desc: 'Sempre com fundo escuro, não importa o aparelho' }
};

const Tema = {
  /* O tema ligado agora: 'ceu' | 'escuro' | 'claro' (| qualquer chave nova de TEMAS). O Céu vence os outros (é independente deles). */
  id() {
    if (window.temaMandala === 'ceu') return 'ceu';
    const cls = document.documentElement.classList;
    for (const k in TEMAS) if (k !== 'claro' && k !== 'ceu' && cls.contains('tema-' + k)) return k;
    return 'claro';
  },
  def(id) { return TEMAS[id || this.id()] || TEMAS.claro; },
  /* O Céu está ligado? (mesmo que window.temaMandala === 'ceu' de antes) */
  ceu() { return window.temaMandala === 'ceu'; },
  /* Tema de papel (folha de papiro)? Hoje só o Céu. */
  papel() { return this.def().papel; },
  /* Fundo escuro de verdade: falso no Céu (ele tem o céu, não uma base escura). */
  escuro() { return !this.ceu() && this.def().escuro; },
  /* Só a classe do <html> (modo claro/escuro guardado), sem olhar o Céu — para quem desenha a roda de um estilo fixo. */
  modoEscuro() { return document.documentElement.classList.contains('tema-escuro'); },
  /* Cor do painel por baixo (fundo das imagens salvas fora do Céu): a do modo guardado. */
  fundoPainel() { return this.modoEscuro() ? '#1c1917' : '#fffdf5'; },
  /* Cores do tema ligado (a paleta de temas.css): { azulEscuro, azulClaro, pretoTinta, ocre, terracota, laranja, marrom, cinza, verde, fundoCreme }.
     No Céu e no claro é a paleta clara; no escuro, a escura. "papelSobre" = true força a paleta de tinta sobre papel (clara). */
  paleta(papelSobre) {
    const d = papelSobre ? TEMAS.claro : this.def();
    return paletaEpoca(d.paleta);
  }
};
window.TEMAS = TEMAS;
window.Tema = Tema;
