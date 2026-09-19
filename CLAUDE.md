# Notas para trabalhar neste repositório

Anotações de coisas não óbvias descobertas na prática, pra não repetir o
mesmo problema (ou o mesmo diagnóstico) da próxima vez.

## Regra de ouro: não trocar 10 coisas boas por 1 coisa resolvida

Pedido pra resolver UM problema específico não é autorização pra mexer
em ferramentas/arquivos que não foram citados, nem pra aceitar que a
correção quebre algo que já funcionava. Se a única solução encontrada
pra um bug troca esse bug por outro (ou estraga algo que estava bom em
outro lugar), **isso não é uma solução** — é hora de parar e avisar o
astrólogo, não de publicar a troca. "Resolver o problema" significa sair
com aquele problema a menos e **nada** a mais quebrado, mesmo que isso
signifique deixar o problema original em aberto por enquanto.

Regras específicas que vieram de sessões onde isso foi ignorado (dia
18-19/09/2026, ver a seção de `touch-action` abaixo pro caso concreto):

- **Não mexer em arquivo/ferramenta que não foi mencionado no pedido**,
  mesmo que pareça ter "o mesmo problema" por semelhança de código. Se
  achar que outro lugar tem o mesmo bug, avisar e perguntar antes, não
  corrigir de bandeja junto.
- **Não publicar (`git push`) na `main` sem o astrólogo pedir
  explicitamente** cada vez — não vale um "pode colocar" de uma vez
  virar autorização permanente pras próximas mudanças da sessão.
- Testar e errar em CSS de gesto de toque (`touch-action`, zoom por
  transform etc.) **custa caro**: cada tentativa consome uma rodada
  inteira de "publica → ele testa no aparelho dele → volta com o
  resultado", que é lento e gasta a cota dele. Antes de propor uma
  correção nessa área, ler primeiro se já existe alguma nota aqui sobre
  o mesmo elemento/padrão.

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

## `touch-action` nos wrappers `overflow-x: auto` das tabelas largas (Matriz de Visibilidade, Painel Técnico, Profecção Mensal) — PROBLEMA AINDA ABERTO, várias tentativas já fracassaram

Essas tabelas (`matrizOuterScroll`/`painelPrincipalOuterScroll` em
`tabelaTecnica.js`, `profMensalOuterScroll` em `profeccao.js`) são mais
largas que a tela, então: (1) o wrapper tem `overflow-x: auto;
overflow-y: hidden` pra rolar só na horizontal, e (2) a tabela em si
tem um auto-encolhimento em JS (`encolherTabelaParaCaber`/equivalente)
que aplica `transform: scale(...)` calculado a partir da largura
disponível, pra abrir já "caber na tela" em vez de gigante e cortada —
e, como a escala reduz tudo proporcionalmente (é texto/vetor), o
usuário consegue ler os detalhes de novo dando zoom com o dedo.

**Estado atual (19/09/2026), de propósito voltado pro original:** SEM
nenhum `touch-action` nesses wrappers — Tabela Técnica sem nada,
Profecção Mensal com `touch-action: pan-y` (que já existia antes de
qualquer uma das tentativas abaixo). Isso significa que **o bug
original relatado continua sem correção**: tocar na tabela e arrastar
pra rolar a página verticalmente pode não funcionar (fica ambíguo entre
rolar a página e rolar o wrapper, que tem `overflow-x:auto` mesmo sendo
`overflow-y:hidden`; o iOS às vezes escolhe a segunda opção e não rola
nada). Foi deixado assim **de propósito**, a pedido do astrólogo, depois
que as tentativas abaixo pioraram a situação em vez de melhorar.

**Requisito inegociável pra qualquer correção futura aqui:** essas
tabelas TÊM que continuar dando pra ampliar com pinça-pra-zoom (celular,
tela pequena, texto pequeno demais sem isso) E TÊM que abrir já
encolhidas/legíveis (o auto-encolhimento acima) E a rolagem da página
tocando na tabela precisa funcionar. As três coisas ao mesmo tempo,
sempre — não é aceitável resolver uma sacrificando outra. Se não achar
uma solução que mantenha as três, **não publicar nada** — melhor deixar
o bug de rolagem em aberto (estado atual) do que trocar por outro.

Tentativas já feitas nessa mesma sessão, todas descartadas — **não
repetir nenhuma delas**:

- **`touch-action: manipulation`** (= pan-x + pan-y + pinch-zoom):
  resolve a rolagem da página E mantém o pinça, mas faz a tabela
  "dançar" — o tamanho/posição pula sozinho ao tocar. Teoria inicial
  (não totalmente confirmada) era que seria só com dois dedos/pinça,
  mas o astrólogo confirmou que acontece **com um dedo só**, arrastando
  a tabela pra um lado ou pro outro. Causa provável: o auto-encolhimento
  usa `transform` (só pintura, não layout), então o JS precisa fixar a
  altura do wrapper à mão (calculada a partir da escala) — isso conflita
  com o gesto nativo do navegador de alguma forma ainda não totalmente
  entendida.
- **`touch-action: pan-x pan-y`** (sem `pinch-zoom`): tentativa de tirar
  só o pinça achando que ele era a causa da dança. Piorou — dançou
  igual ou pior, inclusive na Profecção Mensal (que nunca tinha dançado
  antes de qualquer uma dessas tentativas). **Nunca tirar o pinça como
  "solução" pra dança — não resolve, e além disso pinça é obrigatório
  no app.**
- **Trocar `transform: scale` por `zoom`** no auto-encolhimento (só na
  Tabela Técnica, tentativa de eliminar a necessidade de fixar altura à
  mão): distorceu a tabela (ficou retangular/esticada em vez de
  proporcional) e descasou o tamanho entre Matriz e Painel (que antes
  saíam do mesmo tamanho visual). Também descartado.

**Se for mexer nisso de novo:** a via mais provável de dar certo é
implementar o pinça-zoom à mão em JS (capturar os dois toques com
`touchstart`/`touchmove` e ajustar o próprio `transform: scale`, em vez
de depender de `touch-action` + gesto nativo do navegador) — assim dá
pra controlar os três requisitos ao mesmo tempo sem depender do
comportamento ambíguo do navegador. É trabalho de verdade (não é só
trocar uma linha de CSS), então antes de tentar qualquer coisa: avisar
o astrólogo que vai ser uma mudança maior, pedir autorização, e **testar
uma coisa de cada vez**, confirmando com ele a cada passo antes de
publicar — não emendar três tentativas diferentes numa sessão só.
