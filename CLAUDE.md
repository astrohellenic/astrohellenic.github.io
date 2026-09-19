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

## `touch-action` nos wrappers `overflow-x: auto` das tabelas largas (Matriz de Visibilidade, Painel Técnico, Profecção Mensal)

Essas tabelas (`matrizOuterScroll`/`painelPrincipalOuterScroll` em
`tabelaTecnica.js`, `profMensalOuterScroll` em `profeccao.js`) são mais
largas que a tela, então: (1) o wrapper tem `overflow-x: auto;
overflow-y: hidden` pra rolar só na horizontal, e (2) a tabela em si
tem um auto-encolhimento em JS (`encolherTabelaParaCaber`/equivalente)
que aplica `transform: scale(...)` calculado a partir da largura
disponível, pra abrir já "caber na tela" em vez de gigante e cortada —
e, como a escala reduz tudo proporcionalmente (é texto/vetor), o
usuário consegue ler os detalhes de novo dando zoom com o dedo.

Testado à exaustão (várias sessões, PRs/commits diferentes) tentando
acertar a combinação de `touch-action` nesse wrapper, sem repetir o
mesmo ciclo de novo:

- **Sem nenhum `touch-action`** (deixando o padrão `auto`): no
  aparelho do astrólogo, tocar na tabela e arrastar pra rolar a
  **página** verticalmente trava — o gesto fica ambíguo entre "rolar a
  página" e "rolar este elemento" (que tem `overflow-x:auto`, mesmo
  sendo `overflow-y:hidden`), e o iOS às vezes escolhe a segunda opção
  e não rola nada.
- **`touch-action: manipulation`** (= pan-x + pan-y + pinch-zoom):
  resolve a rolagem da página **e** libera o pinça-pra-zoom nativo —
  mas faz a tabela "dançar" (o tamanho pula sozinho ao tocar/rolar).
  Causa: o auto-encolhimento usa `transform`, que só afeta a pintura,
  não o layout — por isso o JS precisa fixar a altura do wrapper à mão
  (calculada a partir da escala). Com o pinça nativo liberado, o gesto
  de zoom do sistema tenta ampliar esse conteúdo escalado por cima de
  uma altura que não acompanha, e os dois mecanismos de zoom (o nosso
  via `transform`, o do sistema via pinça) brigam pelo mesmo elemento.
  (Trocar o `transform: scale` por `zoom` pra eliminar essa altura
  fixada à mão TAMBÉM não é o caminho: foi tentado e distorceu a
  tabela / descasou o tamanho entre Matriz e Painel — não repetir.)
- **`touch-action: pan-x pan-y`** (sem `pinch-zoom`) — **tentado e
  descartado**: a ideia era que, sem nenhum pinça nativo brigando com a
  altura fixada à mão, a tabela pararia de "dançar". Na prática, piorou:
  com dois dedos na tela e pinça DESLIGADO, o navegador parece
  interpretar os dois toques como dois arrastos concorrentes (um puxando
  a tabela pra um lado, o outro pro outro) — e isso também aparece como
  a tabela "indo pra lá e pra cá". Apareceu inclusive na Profecção
  Mensal, que nunca tinha dançado com `manipulation`. **Pinça-pra-zoom
  não é opcional nesse app — é celular/tela pequena, sem ele não dá pra
  ler a tabela. Não tirar o pinça de novo pra tentar resolver a dança.**

**Conclusão prática (revisada):** `touch-action: manipulation` nos três
wrappers. Resolve a rolagem da página E mantém o pinça, que é
obrigatório. A Matriz de Visibilidade e o Painel Técnico (Tabela
Técnica) ainda podem "dançar" um pouco com esse valor — causa provável:
o auto-encolhimento usa `transform: scale` (só pintura, não layout), e
por isso o JS fixa a altura do wrapper à mão; o pinça nativo tentando
ampliar por cima dessa altura fixa parece ser a causa. Ainda **não
achamos uma correção real pra isso que não troque uma dor de cabeça por
outra** — já foi tentado trocar `transform` por `zoom` (distorceu a
tabela, tamanhos de Matriz e Painel descasaram) e tirar o pinça
(piorou, ver acima). Se for mexer nisso de novo, a via mais provável é
implementar o pinça-zoom à mão em JS (capturar os dois toques e ajustar
o próprio `transform: scale`, em vez de depender do gesto nativo do
navegador) — não repetir as duas tentativas acima.
