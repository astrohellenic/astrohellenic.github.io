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

Essa correção **ficou valendo** (não precisa repetir módulo por módulo,
é feita uma vez em `abrirModuloTecnica`) e é útil por si só — mas na
prática, **não bastou** pra destravar o `position: sticky` no celular
(testado em dois navegadores, inclusive aba anônima, pelo astrólogo que
usa o site). Ou tem mais alguma coisa entrando na jogada (algum
comportamento específico de Safari/iOS com sticky dentro de flex, por
exemplo) que não foi totalmente identificada, ou simplesmente
`position: sticky` é frágil demais nesse layout pra confiar.

## Conclusão prática: NÃO use `position: sticky` pra barra sempre-visível — use `position: fixed` + espaçador medido em JS

Depois de duas tentativas com `sticky` (mexendo na rolagem aninhada da
tela e depois no overflow do `#mandala-container`) sem sucesso real no
aparelho do usuário, a solução que funcionou de verdade (barra
Editar/Prévia/Salvar do editor de Relatório, `relatorio.js`,
`renderizarTelaEditorRelatorio`) foi abandonar `sticky` e usar:

1. A barra em si: `position: fixed; top: 0; left: 0; right: 0;` — presa
   direto na tela (viewport), sem depender de qual ancestral "conta"
   como scroll container. Full-width, com um `<div>` interno
   (`max-width` + `margin: 0 auto`) pra centralizar o conteúdo.
2. Como um elemento `fixed` sai do fluxo normal da página, um
   **espaçador** (`<div>` vazio) logo depois dela no HTML reserva o
   mesmo espaço que ela ocupa — senão o conteúdo seguinte nasce
   escondido atrás dela.
3. A altura do espaçador é **medida em JS** (`barra.offsetHeight`), não
   chutada em CSS, porque muda com o tamanho da tela (ex.: a barra pode
   quebrar em duas linhas em aparelhos bem estreitos) — recalculada de
   novo em `resize` (ver `ajustarEspacadorBarraFixaEditor`).

Pra qualquer ferramenta futura que precise de uma barra ou controle
sempre visível durante a rolagem: comece direto por `position: fixed` +
espaçador medido em JS, nesse padrão. Não vale a pena gastar tempo
tentando fazer `position: sticky` funcionar nesse layout de novo.

Histórico: PRs #103, #104 e #106 no repo (#103 e #104 foram as tentativas
com `sticky`, incompletas na prática; #106 trocou pra `position: fixed`,
que resolveu de fato).
