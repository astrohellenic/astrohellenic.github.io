# Notas para trabalhar neste repositório

Anotações de coisas não óbvias descobertas na prática, pra não repetir o
mesmo problema (ou o mesmo diagnóstico) da próxima vez.

## `#mandala-container` e `position: sticky` fora do modo Mandala

`#mandala-container` (o painel principal onde cada módulo desenha sua
tela, em `index.html`) tem `overflow-y` não-visível (`scroll`/`auto`,
dependendo da regra) fixo no CSS. Isso existe só por causa do módulo
Mandala/Mapa Natal: a imagem da mandala usa essa altura como referência
pra encolher e caber na tela (`max-height: 100%`); sem isso ela corta
nas laterais em telas largas.

Em **qualquer outro módulo** (Relatório, Profecção, Tabela Técnica etc.),
a intenção do CSS é a oposta: quem rola é a **página inteira**
(`body`/`html`), não o `#mandala-container` — tem até um comentário
explícito no `index.html` sobre isso (bloco `:not(.modo-mandala)`,
"LIBERA A ROLAGEM GLOBAL DA PÁGINA").

O problema: mesmo fora do modo Mandala, `#mandala-container` continuava
com `overflow-y` não-visível declarado no CSS — e isso **sozinho** já
basta pro navegador tratá-lo como o "ancestral com rolagem" de qualquer
`position: sticky` dentro dele, mesmo que esse container nunca role de
verdade nesse modo (quem rola é a página, um nível acima). Resultado:
qualquer barra sticky ficava grudada dentro de um container "fantasma"
que não acompanha a rolagem real da tela — parecia simplesmente não
funcionar, sem erro nenhum no console.

**Correção** (`supabase.js`, função `abrirModuloTecnica` — o único lugar
que troca de módulo): fora do modo Mandala/Radix, `#mandala-container`
recebe `style.overflowY = 'visible'` via JS (o inline style vence a
regra do CSS, que não usa `!important`); ao reabrir Mandala/Radix, o
estilo inline é limpo (`= ''`) e o container volta a herdar o
`overflow-y` normal do CSS.

**Isso já está corrigido de forma central** — não precisa (nem deve) ser
repetido módulo por módulo. Qualquer `position: sticky` novo dentro de
`#mandala-container`, em qualquer módulo que não seja Mandala/Radix, já
funciona corretamente sem nenhum ajuste extra, porque a correção já
libera a rolagem real da página pra ele. Só reconsiderar esse ponto se:
- um módulo novo precisar de rolagem *interna* própria (like Mandala) em
  vez de rolagem de página — nesse caso ele precisaria entrar na mesma
  condição que hoje só cobre `'mandala'`/`'radix'`;
- ou se a estrutura de `abrirModuloTecnica` mudar de lugar/for
  substituída por outra forma de trocar módulo.

Histórico: PRs #103 e #104 no repo (#103 tratou só metade do problema —
uma rolagem aninhada própria da tela do editor de Relatório; #104 é a
correção de verdade, descrita acima).
