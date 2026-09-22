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

## Regra de ouro 2: nada de `localStorage` pra estado que devia estar no Supabase

Esse software tem Supabase pra guardar estado — **qualquer preferência ou
configuração do astrólogo tem que ser salva lá, não em `localStorage`**,
mesmo que pareça "só um detalhezinho de interface". `localStorage` é por
navegador/aparelho: o que é salvo ali num Chrome do computador não
aparece no Safari do celular, nem em outro navegador — é exatamente esse
tipo de sumiço inexplicável ("configurei e não ficou salvo") que confunde
o astrólogo quando ele testa em mais de um lugar.

Caso concreto (20/09/2026): a ordenação da lista de clientes (campo +
direção) foi corrigida uma primeira vez salvando em
`localStorage.setItem('astro_sort_field'/'astro_sort_direction', ...)`
— resolvia o sintoma testado na hora (a ordem sumia ao recarregar a
página), mas continuava sumindo ao trocar de navegador, porque nunca
tinha ido pro Supabase. Teve que ser corrigido de novo, dessa vez
salvando em `configuracoes.ordenacao_clientes_campo`/
`ordenacao_clientes_direcao` (mesmo padrão de `tema_mandala` e
`estilo_planetas`, carregado após o login em `carregarOrdenacaoClientes`
e salvo em `salvarOrdenacaoClientes`).

**Antes de usar `localStorage` pra qualquer coisa nova, perguntar: "isso
é uma preferência do astrólogo, ou é só estado de navegação da aba
atual?"** Preferência (ordenação, tema, filtros salvos, qualquer
configuração) → Supabase, sempre. `localStorage` só serve pra coisa que
é mesmo específica daquele navegador/aparelho por natureza — e mesmo
assim, na dúvida, perguntar antes em vez de assumir.

Usos de `localStorage` que já existem no código, revisados com o
astrólogo em 20/09/2026 — ele confirmou que esses são "estado de
navegação da aba", diferente de preferência, e devem **continuar em
`localStorage`** (não migrar pro Supabase):
- `astro_keep_logged` — se o "manter conectado" fica marcado (checkbox
  de login).
- `astro_ultimo_modulo` — qual ferramenta (Mandala, Relatório etc.)
  estava aberta, pra voltar nela ao recarregar.
- `astro_ultimo_perfil` — qual mapa/cliente estava aberto.
- `relatorioUltimoPreset` — qual modelo de relatório foi usado por
  último.

Ou seja, a régua não é "localStorage é sempre errado" — é "preferência/
configuração consciente do astrólogo (algo que ele foi lá e escolheu,
esperando que valha em qualquer lugar que ele use o site) vai pro
Supabase; estado de 'onde eu estava' pra retomar a navegação na mesma
aba/aparelho pode continuar local".

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

## `touch-action` nos wrappers `overflow-x: auto` das tabelas largas (Matriz de Visibilidade, Painel Técnico, Profecção Mensal)

**Atualização (19/09/2026, à noite) — `pan-y` sozinho NÃO é suficiente:**
a nota abaixo (do mesmo dia, mais cedo) tratava `touch-action: pan-y`
como solução definitiva porque resolvia a dança — só que criou um
problema novo, que o astrólogo só notou ao testar de verdade: com
`pan-y`, o navegador para de reconhecer pinça-pra-zoom **em cima do
próprio wrapper** (só funciona encostando fora dele, tipo no cabeçalho,
e depois é preciso procurar o trecho específico da tabela rolando —
inviável quando o que se quer ver é um ponto específico e pequeno no
meio da tabela). Sem-dançar E com-pinça-na-própria-tabela ao mesmo
tempo **não é possível só com CSS/touch-action nativo** — as duas
coisas usam o mesmo mecanismo do navegador, que ou captura o gesto de
duas pontas (dança, porque briga com o `transform:scale` do
auto-encolhimento) ou não captura nada (sem dança, mas sem pinça na
tabela também).

**Solução de verdade, implementada em `tabelaTecnica.js` dentro de
`renderPainelTecnico`:** manter `touch-action: pan-y` nos wrappers (pra
rolagem vertical da página continuar normal) e implementar o
pinça-pra-zoom **à mão em JS** (função `ativarPinchZoomTabela`,
`touchstart`/`touchmove`/`touchend` com `e.preventDefault()`), em vez
de depender do gesto nativo do navegador pra isso. Como o `touch-action`
nunca deixa o navegador participar, não tem mais briga nenhuma com o
`transform:scale` — o próprio `transform:scale` do auto-encolhimento
(a variável de escala) é ajustado diretamente pelo nosso código a cada
`touchmove` de dois dedos, com o ponto entre os dedos mantido fixo na
tela (rolando `outerScroll.scrollLeft` e a página via `window.scrollBy`
pra compensar). Também implementa arrastar com um dedo só na horizontal
(pra navegar depois de já ter dado zoom), só ativado quando o gesto é
claramente mais horizontal que vertical, pra não brigar com a rolagem
vertical normal da página.

Isso resolve as três exigências ao mesmo tempo: abre encolhida (auto-
encolhimento intacto), não dança (touch-action nativo nunca entra em
ação), e dá pra ampliar tocando em qualquer lugar da própria tabela
(pinça implementado à mão). Só foi feito na Tabela Técnica até agora —
a Profecção Mensal continua só com `pan-y` puro (sem pinça na própria
tabela), porque não foi pedido mexer nela.

### Histórico (texto original de mais cedo no mesmo dia, mantido por contexto)

Essas tabelas (`matrizOuterScroll`/`painelPrincipalOuterScroll` em
`tabelaTecnica.js`, `profMensalOuterScroll` em `profeccao.js`) são mais
largas que a tela, então: (1) o wrapper tem `overflow-x: auto;
overflow-y: hidden` pra rolar só na horizontal, e (2) a tabela em si
tem um auto-encolhimento em JS (`encolherTabelaParaCaber`/equivalente)
que aplica `transform: scale(...)` calculado a partir da largura
disponível, pra abrir já "caber na tela" em vez de gigante e cortada —
e, como a escala reduz tudo proporcionalmente (é texto/vetor), o
usuário consegue ler os detalhes de novo dando zoom com o dedo.

**A configuração correta, já confirmada pelo astrólogo, é
`touch-action: pan-y` nesses três wrappers — nada mais, nada menos.**
Foi resolvida de fato pela primeira vez no commit `ec8bdd9` (manhã de
17/09/2026): "Os contêineres de rolagem horizontal das tabelas...
capturavam parte do gesto de pinça como rolagem interna, fazendo as
tabelas escorregarem de lado enquanto o usuário tentava ampliar/reduzir
a página com os dedos. touch-action: pan-y restringe esses contêineres
à rolagem vertical, deixando o pinch-zoom da página passar livremente."
Restringir o wrapper a **só** `pan-y` faz o gesto de pinça (e até um
arrasto lateral de um dedo só) **não ser capturado por ele de jeito
nenhum**, escapando pra ser tratado no nível da página — é isso que
impede a tabela de "escorregar"/"dançar" de lado. A rolagem vertical da
página continua funcionando tocando na tabela (o `pan-y` permite, e
como o wrapper tem `overflow-y:hidden` — nada pra rolar internamente —
o gesto sobe pro ancestral, a página).

**Erro que já aconteceu uma vez, não repetir:** no mesmo dia
(17/09/2026, à tarde), tentando resolver uma queixa *diferente*
("pinça bloqueado"), um commit posterior (`72cdb58`) **removeu esse
`touch-action` por completo** da Tabela Técnica, sem perceber que
reabria a dança que `ec8bdd9` já tinha corrigido de manhã. Isso ficou
sem ninguém notar por um bom tempo (a Profecção Mensal nunca perdeu o
`pan-y` dela, só a Tabela Técnica ficou sem) até o astrólogo reportar
de novo "a tabela dançando" numa sessão seguinte (18-19/09/2026) — e aí
teve uma sessão inteira de tentativas erradas (`manipulation`, `pan-x
pan-y`, trocar `transform` por `zoom`) até alguém finalmente comparar
com o histórico de commits e achar que `ec8bdd9` já tinha resolvido
isso da forma mais simples possível. **Antes de investigar esse bug do
zero, sempre conferir primeiro se já não tem a resposta no `git log`
do arquivo** (`git log -p -- tabelaTecnica.js`) — economiza uma sessão
inteira de tentativa e erro.

Variações tentadas e descartadas nessa sessão de retrabalho (não
repetir nenhuma):

- **`touch-action: manipulation`** (pan-x + pan-y + pinch-zoom): volta
  a deixar o wrapper capturar parte do gesto de pinça/arrasto lateral
  como se fosse rolagem própria — exatamente o que `ec8bdd9` identificou
  como causa da dança. Reproduz o bug.
- **`touch-action: pan-x pan-y`** (sem `pinch-zoom`): mesma coisa, ainda
  pior — com um wrapper que aceita pan-x, ele ativamente tenta rolar a
  si mesmo horizontalmente a cada arrasto, mesmo de um dedo só.
- **Trocar `transform: scale` por `zoom`** no auto-encolhimento (só na
  Tabela Técnica): distorceu a tabela (ficou retangular/esticada em vez
  de proporcional) e descasou o tamanho entre Matriz e Painel. Não
  precisa disso — `pan-y` sozinho já resolve sem tocar no
  auto-encolhimento.

**Conclusão prática:** `touch-action: pan-y` (nada mais) nos três
wrappers, ponto final. Não precisa de pinça implementado à mão em JS,
não precisa trocar `transform` por `zoom` — o problema nunca foi o
auto-encolhimento, era só essa uma linha de `touch-action`.

## Fuso horário do mapa nunca vinha do fuso político real — só de uma fórmula de longitude (19/09/2026)

Até essa sessão, `calcularFusoPorLongitude(lon)` (`mandala.js`) era a
**única** forma de determinar o fuso de um mapa: `Math.round(lon / 15)`,
uma fatia matemática de 15° em 15°. Isso funciona "por acaso" pra quem
nasce perto do meridiano de referência do próprio fuso (São
Paulo/Brasília, perto de -45°), mas erra silenciosamente pra qualquer
lugar mais afastado dele que ainda está no mesmo fuso político — por
exemplo, o Rio Grande do Sul inteiro (perto de -54°) cai fora da faixa
de -45°±7,5° e a fórmula devolve -4 em vez do -3 correto. Foi assim que
uma cliente nascida em São Luiz Gonzaga, RS apareceu com Ascendente em
Câncer em vez de Gêmeos — o erro de 1h no fuso desloca o Ascendente o
suficiente pra trocar de signo.

Também importa: o campo `fuso` **nunca foi salvo no banco** (tabela
`mapas`, nem na criação em `salvarNovoMapaAutomaticamente` nem na edição
em `salvarEdicaoMapaModal`, ambos só gravam `latitude`/`longitude`), e o
formulário público (`formulario.html`) também nunca grava fuso. Ou seja,
`calcularFusoPorLongitude` não era um fallback raro — era o caminho
**sempre** percorrido, pra todo mapa salvo, toda vez que ele é reaberto.

**Correção:** nova função `calcularFusoPreciso(lat, lon, ano, mes, dia,
hora, minuto)` em `mandala.js`, usada nos pontos onde o fuso é
realmente determinado (`aplicarDadosDoPerfilNoMapa`,
`confirmarNovoMapaModal`, `carregarCeuDoMomento`):

1. Acha o fuso IANA real do ponto (ex.: `America/Sao_Paulo`,
   `America/Manaus`) com a biblioteca `tz-lookup.js`, vendorizada na
   raiz do repo (pacote npm `tz-lookup`, licença CC0, ~73KB, dados do
   [timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder)).
   Isso já resolve o fuso certo em qualquer país do mundo, não só no
   Brasil — sem precisar de nenhuma API externa em tempo de execução
   (a biblioteca é só dados+função, roda 100% no navegador do
   astrólogo/cliente).
2. Com o fuso IANA em mãos, usa o `Intl.DateTimeFormat` **nativo do
   navegador** (que já carrega o histórico completo de cada fuso) pra
   achar o deslocamento de UTC certo **na data de nascimento**, não no
   de hoje — importante porque o Brasil teve horário de verão até 2019
   (e a maioria dos países que usa tem seu próprio histórico). É por
   isso que a correção não podia ser só "tabela de fuso fixo por
   estado": duas pessoas nascidas no mesmo lugar em datas diferentes
   podem ter deslocamentos de UTC diferentes.
3. Nunca lança erro — qualquer falha (biblioteca não carregada, `Intl`
   indisponível, coordenada inválida) cai de volta pro
   `calcularFusoPorLongitude` de sempre, que continua existindo como
   último recurso. Os outros lugares do código que só usam
   `calcularFusoPorLongitude` como fallback de emergência (em
   `direcoes.js`, `liberacao.js`, `lotes-calculadora.js`,
   `tabelaTecnica.js` e em dois pontos do próprio `mandala.js`) foram
   **deixados como estavam** — na prática nunca mais deviam ser
   acionados, já que `currentGeo.fuso` agora sempre nasce correto; não
   havia necessidade de tocar nesses arquivos.

Testado manualmente (fora do navegador, via Node, simulando `Intl` e a
biblioteca) contra vários casos: São Luiz Gonzaga/RS em 28/03/1992 dá
-3 (confirmado pelo astrólogo); Manaus dá -4; Nova York alterna -5/-4
entre inverno e verão (horário de verão americano); Lisboa alterna
0/+1; coordenada inválida cai no fallback sem travar.

## Gerador de PDF do Relatório (`baixarRelatorioPDF`, `relatorio.js`) — o mecanismo em si é frágil demais, não adianta remendar de novo (22/09/2026)

**Não tentar mais remendos pontuais nisso — a correção de verdade é
trocar o gerador de PDF inteiro por um backend rodando Chrome
headless (`page.pdf()`), não existe ainda. Enquanto isso não for
feito, o astrólogo confirmou que vai continuar convivendo com esse
bug, de propósito, em vez de gastar mais tentativas nele.**

**O sintoma**: ao baixar o PDF, a página do Painel Técnico de
Natividades (um bloco "capturado" — a imagem que a própria ferramenta
tirou, ver `RELATORIO_FERRAMENTAS_DISPONIVEIS`) saía bagunçada — às
vezes virando uma página extra quase em branco logo depois dela
(descasando a numeração do Índice pra sempre dali em diante), às
vezes — pelo relato mais recente do astrólogo — a própria imagem do
Painel Técnico aparecendo **"atrás" de outras páginas** na Prévia
depois de tentar baixar o PDF e voltar pra editar, com tudo
desorganizado até ele editar/ajustar as coisas de novo pra "voltar pro
lugar".

**O que foi tentado nessa sessão (não resolveu)**: fizemos
`.rel-page-captura` nunca entrar no caminho de fatiamento em várias
folhas (`baixarRelatorioPDF`), só desenhando a imagem inteira e
deixando o limite físico da página do PDF cortar qualquer sobra —
testado isoladamente (CSS sozinho, `html2canvas` de verdade contra
várias proporções de imagem, e `jsPDF` de verdade desenhando uma
imagem maior que a folha) e tudo bateu certo nesses testes isolados.
Mesmo assim, o astrólogo testou no site publicado e confirmou que o
problema **continua idêntico** — o mecanismo de fundo é mais frágil
(ou tem mais peças interagindo) do que qualquer teste isolado
conseguiu reproduzir até agora.

**Por que não vale a pena continuar tentando remendar isso**: o
gerador de PDF de hoje (`baixarRelatorioPDF`) funciona tirando uma
"foto" (`html2canvas`) de cada `.rel-page` já renderizada na tela e
colando essas fotos, uma por uma, em folhas A4 dentro de um PDF
(`jsPDF`) — ver o comentário grande logo antes da função pra entender
por que foi feito assim (fugir do motor de impressão nativo do
navegador, que paginava diferente em cada aparelho). Isso significa
que cada página do PDF final é só uma imagem rasterizada, nunca texto
de verdade — e, por ser um mecanismo de "print de tela" reagindo a
medidas de altura em milímetros/pixels calculadas em cima de
`aspect-ratio`/flexbox, está sujeito a um monte de jeitos diferentes
de dar errado (arredondamento, timing de carregamento de imagem,
diferença entre o que a tela mostra e o que o `html2canvas` mede) —
já tentamos consertar essa classe de bug pelo menos duas vezes agora
(a página extra em branco, e agora essa bagunça na Prévia) sem
resolver de vez, o que é sinal de que o problema é estrutural, não um
bug pontual pra caçar e remendar.

**A correção de verdade, já combinada com o astrólogo em conversa
anterior** (ver também a pesquisa sobre o Delphic Oracle, que usa um
motor de relatório de verdade, não captura de tela): trocar
`baixarRelatorioPDF` inteiro por um backend que roda Chrome headless,
renderiza a MESMA página HTML que a Prévia já mostra, e usa a função
nativa do Chrome de exportar aquilo pra PDF (`page.pdf()`) — isso dá
texto de verdade (selecionável, nítido em qualquer zoom) e paginação
sempre consistente, sem depender de fatiar imagem nenhuma. Isso exige
infraestrutura nova (um servidor rodando navegador) que este site
(hoje só front-end estático + Supabase) ainda não tem — projeto à
parte, não uma correção de código local.

**Enquanto isso não existir**: não vale a pena gastar mais rodadas
testando variações de `html2canvas`/`jsPDF` pra esse bug específico —
já foi tentado, testado isoladamente com sucesso, e mesmo assim não
resolveu no site publicado. Próxima sessão que for mexer nisso: ou já
vem pra implementar o Chrome headless de verdade, ou pergunta antes de
tentar mais um remendo pontual no mecanismo de captura de tela atual.
