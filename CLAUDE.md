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
- `astro_modo_cor` — modo claro/escuro/automático (aparência do
  aparelho; "seguir o tema do dispositivo" só faz sentido por aparelho).
- `astro_tema_mandala` — Tema Céu ou claro (**desde 03/10/2026**; antes
  era `configuracoes.tema_mandala` no Supabase). Decisão do astrólogo:
  como o Céu hoje cobre o software inteiro, é aparência do aparelho,
  igual ao claro/escuro — e precisa estar no `localStorage` pra abrir já
  no tema certo, lido por um script no `<head>`/início do `<body>` em
  `index.html` antes de qualquer coisa desenhar (se viesse do Supabase,
  o claro/escuro apareceria por trás até a resposta chegar e só então o
  Céu entrava). `carregarTemaMandala` só lê a coluna antiga UMA vez, num
  aparelho que ainda não escolheu (migração). **Não migrar de volta pro
  Supabase por semelhança com a Regra de ouro 2.**
  A tela Aparência tem **uma lista só**: Céu, Claro, Escuro, Automático
  (`salvarAparencia`). O Automático só escolhe entre claro e escuro, nunca
  Céu; escolher Claro/Escuro/Automático desliga o Céu. **O Céu é um tema
  INDEPENDENTE: com ele ligado não existe base clara nem escura por trás**
  (`aplicarModoCor` nunca liga `tema-escuro` enquanto `temaMandala` for
  'ceu'; o modo de cor guardado só volta a valer quando o Céu é desligado).
  Por isso o script do Céu vem ANTES do script do modo de cor no `<head>`.

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
- **Todo commit que edita um arquivo `.js`/`.svg`/`.png` referenciado
  com `?v=` em `index.html` tem que bumpar esse `?v=` NO MESMO commit,
  sem exceção** — esquecer isso faz o astrólogo testar uma versão
  antiga sem ninguém perceber (ele vê "não mudou nada" e acha que a
  correção não pegou, quando na verdade nem chegou no navegador dele).
  Aconteceu duas vezes na sessão de 29/09/2026 só com `relatorio.js`
  (parou de bumpar depois das correções de página em branco/297mm do
  PDF) — antes de dizer "pronto, publiquei" pro astrólogo testar,
  conferir se o arquivo mexido tem uma linha `?v=` em `index.html` e,
  se tiver, se ela foi atualizada joint com essa mudança.

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

## Atualização (29/09/2026): Chrome headless de verdade IMPLEMENTADO — falta só o astrólogo importar o projeto na Vercel

A correção de verdade descrita acima (trocar `html2canvas`+`jsPDF` por
um backend rodando Chrome headless com `page.pdf()`) foi implementada
nessa sessão. Peças novas:

- **`api/gerar-pdf.js`** — função serverless (Vercel, Node, CommonJS)
  que recebe `{ html }` no corpo (POST), abre esse HTML num Chromium
  headless (`puppeteer-core` + `@sparticuz/chromium`) e devolve o PDF
  (`page.pdf()`, com `printBackground: true` — sem isso as cores de
  fundo da capa somem). CORS restrito a `astrohellenic.com`/
  `www.astrohellenic.com`/`astrohellenic.github.io` (lista
  `ORIGENS_PERMITIDAS`), pra ninguém de fora usar esse endpoint às
  custas da conta Vercel do astrólogo.

  **Erro real (29/09/2026), já corrigido — não repetir:** a primeira
  versão publicada travava a versão do `@sparticuz/chromium` em
  `126.0.0` "pra ser conservador" — só que isso quebrou de verdade na
  Vercel (testado só localmente antes de publicar, e o problema NUNCA
  aparece localmente, só lá). Erro visto nos Logs da Vercel: `/tmp/
  chromium: error while loading shared libraries: libnss3.so: cannot
  open shared object file`. Causa raiz: a Vercel roda as funções num
  ambiente chamado "Fluid Compute", parecido com AWS Lambda mas SEM as
  variáveis de ambiente que o Lambda tem — versões do
  `@sparticuz/chromium` **anteriores à 137.0.0** não sabiam detectar
  esse ambiente por outro caminho (variável `VERCEL`) e escolhiam um
  binário do Chromium com bibliotecas incompatíveis. Corrigido
  atualizando pra `@sparticuz/chromium@153.0.0` +
  `puppeteer-core@25.12.0` (par mais recente, testado localmente de
  novo depois da troca). **Pegadinha extra dessa atualização:** a
  partir da v137 o pacote virou ESM por dentro — em CommonJS
  `require('@sparticuz/chromium')` sozinho não expõe mais
  `.executablePath`/`.args` diretamente, precisa pegar `.default`
  (`require('@sparticuz/chromium').default`) — sem isso dá
  `TypeError: chromium.executablePath is not a function`, também só
  detectável testando de verdade (o `require` não avisa nada, só
  quebra na hora de usar).

  **Segundo erro real, logo em seguida (mesma sessão) — também já
  corrigido:** depois de trocar a versão, o teste local (`node` direto)
  passou limpo, mas a Vercel quebrou de novo com um erro DIFERENTE:
  `Error [ERR_REQUIRE_ESM]: require() of ES Module .../@sparticuz/
  chromium/build/index.js ... not supported. Instead change the
  require of index.js ... to a dynamic import()`. Causa: a partir da
  v137 o pacote é um ES Module puro — `require('@sparticuz/chromium')`
  cru só não quebra em Node bem recente (que tolera `require` de ESM
  por baixo dos panos); o Node que a Vercel roda não tolera, e dá esse
  erro na hora. **Por que o teste local não pegou isso:** a versão do
  Node deste ambiente de desenvolvimento é mais nova que a da Vercel —
  o MESMO código passa aqui e quebra lá, então "rodei local e funcionou"
  não prova nada sobre compatibilidade de ESM/CommonJS, só sobre se o
  pacote existe e roda nessa máquina específica. Corrigido carregando o
  pacote com `import()` dinâmico dentro da função (não `require()` no
  topo do arquivo) — isso funciona em qualquer versão de Node de dentro
  de um arquivo CommonJS, então resolve o problema de vez (não é mais
  uma escolha de versão que pode quebrar nas próximas atualizações do
  pacote).

  **Lição pra próxima vez que mexer nisso (as duas rodadas acima
  juntas):** testar local (`node` direto) só prova que o pacote
  instala e a função roda em Linux genérico — NÃO prova compatibilidade
  com o ambiente/versão de Node da Vercel especificamente (os dois bugs
  desta sessão só existiam lá, nunca localmente, por dois motivos
  diferentes: detecção de ambiente Lambda vs. Fluid Compute, e depois
  versão de Node tolerando ou não require de ESM). Sempre que mexer
  nessas duas dependências de novo: usar a versão mais recente de
  ambas, carregar pacotes ESM com `import()` dinâmico (nunca
  `require()` direto) por padrão, e pedir pro astrólogo testar de
  verdade no site publicado antes de considerar resolvido — os Logs da
  função na Vercel (painel do projeto → "Logs", clicar na linha
  vermelha do erro) são o único jeito de ver o erro de verdade quando
  isso acontece de novo, e cada erro visto até agora já veio com a
  causa bem explícita na própria mensagem.

  **Terceiro erro real, mesmo dia, mesma causa — confirma que não era
  só o chromium:** corrigido o `@sparticuz/chromium` com `import()`
  dinâmico, publicado, e a Vercel deu o MESMO `ERR_REQUIRE_ESM` de
  novo — dessa vez apontando pro `puppeteer-core` (`require() of ES
  Module .../puppeteer-core.js ... not supported`), que continuava
  sendo carregado com `require()` normal no topo do arquivo. Corrigido
  juntando os dois num só `carregarDependencias()` que faz `import()`
  dinâmico dos dois (`puppeteer-core` expõe `launch` como export
  nomeado — `const { launch } = await import('puppeteer-core')` — não
  `.default`, diferente do `@sparticuz/chromium`). **Confirma a régua
  geral:** qualquer pacote usado aqui dentro de `api/gerar-pdf.js`
  entra por padrão com `import()` dinâmico dentro da função, nunca
  `require()` no topo do arquivo — não vale a pena nem checar se o
  pacote "ainda é CommonJS" antes, porque isso muda de versão pra
  versão sem aviso.
- **`package.json`/`package-lock.json`/`vercel.json`** — novos, só
  pra essa função (`vercel.json` define memória/tempo máximo da
  função). O site continua 100% estático publicado pelo GitHub Pages
  (`CNAME`) — a Vercel só hospeda esse endpoint, não substitui o GitHub
  Pages.
- **`relatorio.js`, `baixarRelatorioPDF()`** — reescrita: em vez de
  fatiar `.rel-page` em canvas, agora pega o `.rel-viewer` inteiro já
  renderizado na tela (já paginado por `dividirPaginasLongasEmFolhas`,
  já com os números de página certos em `.rel-num-pagina-canto`) +
  o CSS de `#relatorio-estilos` (que já tinha um bloco `@media print`
  pronto, inclusive com os ajustes de `height`/`min-height` da capa já
  feitos numa sessão anterior — ver seção "position: sticky" acima pro
  motivo de esses valores serem tão específicos) e manda isso pro
  `/api/gerar-pdf`. Removida a função `numerarPaginaPdf` (não precisa
  mais desenhar número à parte — o `.rel-num-pagina-canto` já é o
  número de verdade agora). Removido o `<script>` do `jsPDF` do
  `index.html` (não é mais usado em lugar nenhum). **`html2canvas`
  continua no `index.html`** — é usado por VÁRIOS outros módulos
  (Painel Técnico, Matriz, Liberação, Profecção, Sinastria, Lotes) pra
  capturar imagem, nada disso mudou.
- **Constante `RELATORIO_PDF_API_URL`** (topo da função, em
  `relatorio.js`) — hoje aponta pra uma URL de exemplo
  (`SUBSTITUA-PELO-SEU-PROJETO.vercel.app`). **Isso precisa ser trocado
  pela URL real** assim que o astrólogo importar o repositório na
  Vercel (a Vercel mostra essa URL depois do primeiro deploy).

**Por que não precisou de login/token/mudança no Supabase**: o
astrólogo já está logado e com o relatório JÁ renderizado na tela
quando clica em "Baixar PDF" — a função serverless nunca precisa
acessar o Supabase, só recebe o HTML pronto (que o navegador do
astrólogo já tinha) e devolve o PDF. Chegou-se a cogitar (numa
conversa anterior a essa correção) um esquema de link temporário de
impressão ou de credencial de serviço do Supabase — **não foi usado,
e não é necessário**, porque simplifica bastante não ter esse tipo de
autenticação/token novo no meio.

**O que falta pra isso funcionar de verdade** (nenhuma dessas coisas
foi feita ainda, porque exigem acesso que só o astrólogo tem):
1. Importar este repositório na Vercel (conta que o astrólogo já tem).
2. Pegar a URL que a Vercel gerar pro projeto e colocar em
   `RELATORIO_PDF_API_URL` (`relatorio.js`), substituindo o placeholder.
3. Testar de verdade gerando o PDF de um relatório real (com mandala,
   texto longo pra ver a paginação, Painel Técnico capturado) — só
   depois disso dá pra confirmar que resolveu os sintomas descritos
   mais acima (página extra em branco, imagem "atrás" na prévia).

**Atualização (29/09/2026, depois de testar de verdade): os três erros
de deploy acima foram corrigidos e o PDF passou a gerar de verdade —
mas o sintoma histórico da "página extra em branco" (documentado desde
22/09) ainda acontecia, só que agora com causa raiz bem mais simples de
achar (sem captura de tela/canvas no meio, o bug ficou fácil de
localizar direto no CSS): `.rel-page-captura` (a página de uma
ferramenta capturada, ex. Painel Técnico) tinha ficado de fora da
correção que só a `.rel-capa` recebeu (ver comentário
"`.rel-capa { height: 250mm }`" no `@media print` de
`injetarEstilosRelatorio`) — mesmo bug de flexbox descrito naquele
comentário (`min-height` sem `height` fixo não repassa direito pro
`flex: 1` calcular), só que nunca replicado pra essa outra página que
usa o mesmo padrão. Corrigido igualando `.rel-page-captura` à `.rel-capa`
(`height: 250mm` também). Testado localmente gerando PDF de verdade dos
dois jeitos (sem/com a correção) pra confirmar a causa antes de
publicar: sem a correção, uma imagem que ocupa a página inteira sempre
virava 2 páginas no PDF; com a correção, vira 1. Esse era o mesmo
sintoma que sessões anteriores (22/09) tentaram resolver sem sucesso no
mecanismo antigo de captura de tela — a troca pro Chrome headless não
só resolveu a fragilidade geral como tornou ESSE bug específico trivial
de achar (era só CSS, sempre foi).

**Atualização seguinte, mesmo dia — o `250mm` ficou OBSOLETO, não é pra
voltar pra ele:** logo depois da correção acima, o astrólogo reportou
uma faixa branca real sobrando embaixo de CADA página do PDF (bem
visível na capa, de fundo azul — via print). Causa: `.rel-page`/
`.rel-capa`/`.rel-page-captura` usavam `250mm` de altura na impressão
(não os `297mm` cheios da folha) de propósito — 47mm de "folga",
comentada na época como defesa contra a pessoa deixar a caixa de
diálogo de impressão em "Margens: Padrão" em vez de "Nenhuma" (cenário
real quando o PDF saía do "Imprimir" nativo do navegador, ver o
histórico de `baixarRelatorioPDF` mais acima). **Essa defesa não faz
mais sentido**: quem gera o PDF hoje é o Puppeteer (`api/gerar-pdf.js`),
mandando `margin: {top:'0mm', ...}` direto pro Chrome — não existe
caixa de diálogo nenhuma, então não existe "a pessoa esqueceu de mudar
o padrão" pra se defender. Manter os 47mm só virou espaço em branco
puro, sobrando à toa. Corrigido pra `297mm` (a mesma altura que a
prévia em tela já usa) nos três seletores. Testado localmente gerando
PDF de verdade antes de publicar: `297mm` não estoura nem cria página
extra (o `@page {margin:0}` + o `margin:0` do Puppeteer são
determinísticos, não tem "sobra" de navegador real pra temer). **Se
uma sessão futura ver esse `250mm` documentado em algum lugar e pensar
em restaurar "pra segurança"**: não — o motivo de existir já não existe
mais, e restaurar reabre exatamente essa faixa branca.

## O "motor de astrologia" (posições planetárias) mora FORA deste repositório — é normal, não precisa trazer pra cá

`mandala.js` (função que busca o céu do momento, por volta da linha 654)
chama `https://motor-astrologia.vercel.app/api/index?data=...&hora=...
&fuso=...&lat=...&lon=...` — uma API separada que calcula as posições
planetárias de verdade (via Swiss Ephemeris) e devolve só os números
prontos pra Mandala desenhar. O código-fonte dessa API está no
repositório à parte
[`pereiracassio/motor-astrologia`](https://github.com/pereiracassio/motor-astrologia)
— **fora** do repositório do Astro Hellenic, porque foi criado antes
dele existir (o astrólogo não incluiu esse motor quando criou o
repositório do Astro Hellenic depois).

**Isso não é um problema a corrigir** — é o mesmo padrão que
`api/gerar-pdf.js` (ver seção acima) usa: um serviço à parte, hospedado
também na Vercel, que o site chama por HTTP pra fazer um trabalho
específico que o front-end estático sozinho não faz. Juntar os dois
repositórios num só não traria benefício nenhum e só arriscaria quebrar
link/configuração que já funciona — contraria a "regra de ouro" deste
arquivo. Se uma sessão futura precisar mexer na lógica de cálculo
astronômico em si (não só em como a Mandala consome o resultado), é
nesse outro repositório que precisa ir.

**Acesso a esse outro repositório (checado na prática em 29/09/2026):**
`pereiracassio/motor-astrologia` é **público**, então qualquer sessão
deste Claude Code já consegue LER/clonar ele a qualquer momento, só de
pedir — não existe um botão "adicionar repositório" na conversa nem
precisa de autorização prévia do astrólogo pra isso (não é o mesmo caso
do repositório do Astro Hellenic, que é privado e precisa ser
selecionado/conectado na tela do GitHub da conta Claude). Só **editar/
commitar** nesse outro repositório exigiria essa autorização de
verdade — ler não.

## Estado do Tema Céu (02/10/2026)

Resumo de onde parou o trabalho de redesenho visual ("Tema Céu"), pra
retomar numa conversa nova sem depender do histórico da anterior.

**Já na `main`:**
- O cabeçalho global com dois modos (papiro recortado no céu, "tinta
  sobre a folha" nas ferramentas), os botões, as janelas, o menu lateral
  e a logo nova com o favicon.
- O ASC/DSC/MC/IC (triângulo só de contorno azul, letras terracota), a
  Matriz de Visibilidade e a tela e a prévia do Relatório.
- A capa com o céu da própria mandala (JPEG), as barras brancas
  tracejadas na Mandala principal, e a Profecção e a Liberação em folha
  de papiro com roda de tinta.

**Regra de design:** a Mandala principal fica no céu. As rodas
secundárias das ferramentas são tinta sobre papiro, só com azul-tinta
`#1d3a66`, terracota `#a03e25` e preto `#1a1410`, sem outras cores e sem
tracejado em volta dos ícones.

**Pendente, nesta ordem:**
1. **Sinastria.** Ela copia a roda da Profecção, então é só levar o
   mesmo `papiro` de `gerarMandalaSVG` e o CSS da tela.
2. **Relatório.** As páginas de mandala do corpo do PDF devem usar a
   roda de tinta e não o céu. O céu fica só na capa. Isso também some
   com os PNGs pesados de 2 a 7 MB.
3. **Revisão ferramenta por ferramenta.** Direções, Decênios, Horas,
   Isopsefia, Calculadora de Lotes, Agenda, e as telas de configuração
   e edição do Relatório.

**Conferir no deploy:** a capa tem estrelas na prévia do iPad. O PDF
abre mais rápido. Não surge mais folha extra. Se aparecer, o aviso
mostra a página (o site avisa quando o servidor precisa ajustar alguma
página).

**Regras do projeto (reforço):** só publicar na `main` quando o
astrólogo pedir; bumpar o `?v=` de todo arquivo mexido; só pintura, sem
mudar layout; preferência vai pro Supabase e não pro `localStorage`.

## Papiro global (03/10/2026)

O papiro (cores e camadas) agora tem **uma única definição**: `papiro.css`
(variáveis `--papiro-topo/meio/base`, `--papiro-gradiente`, `--papiro-fundo`,
`--papiro-fundo-simples`, `--papiro-botao`), carregado por `index.html`,
`agendar.html` e `formulario.html`. É o mesmo papiro (mais claro, mais
contraste) do site Falando de Astrologia. **Nunca copiar um degradê de papiro
em CSS novo — usar `background: var(--papiro-fundo)`** (folhas grandes) ou
`var(--papiro-fundo-simples)` (botões/janelinhas).

No JS, `papiro.js` expõe `papiroCores()`, `papiroGradienteSvg(id)` e
`papiroGradienteCanvas(ctx, altura)`, que **leem** as variáveis do CSS — as
imagens salvas/capturas saem com o mesmo papiro da tela.

Exceção: o CSS do Relatório (`relatorio.js`) também vai pro PDF, que não tem o
`papiro.css`, então ali as cores entram como valores literais (via
`papiroCores()`), não `var()`. E **o JPEG `papiro-folha.js` é gerado a partir de
`--papiro-fundo`: se as cores mudarem, regerar** (794x1123 px a 1,5x, JPEG
q80, via Chromium headless).

## Página de Configurações (04/10/2026)

As configurações **não ficam mais no menu lateral** (estreito, uma tela por
vez, ~4 cliques até uma opção). Viraram uma **página inteira**, módulo
`configuracoes` (`configuracoes.js` + `configuracoes.css`): botão de engrenagem
na barra superior, como os das ferramentas (`data-modulo-key="configuracoes"`,
posição escolhida em Configurações → Aparência → Barra superior; quem já tinha
ordem salva recebe o botão no fim da barra), navegação de seções à esquerda
(no celular vira uma fileira de abas que rola) e cartões em `grid auto-fit`
que se reorganizam sozinhos. **Ocupa a largura toda** — nada de coluna estreita
no meio da tela com o resto vazio.

- **Seção nova** = uma entrada em `CONFIG_SECOES` (`id`, `titulo`, `icone`,
  `descricao`, `html()` e, se buscar dados, `depois()`); **configuração nova**
  = um cartão dentro de uma seção. Classes `.cfg-*` em `configuracoes.css`,
  que usa as variáveis de cor do software (claro/escuro valem sozinhos) e traz
  o **Tema Céu** no fim do arquivo (papiro, só tinta).
- O que o resto do software usa fora da página (carregar tema/estilo dos
  planetas/ordem dos botões depois do login, `salvarAparencia`,
  `moverBotaoTopo`, `reRenderizarModuloAtivo`...) continua em `supabase.js`;
  as telas e os salvamentos que só existem pra elas moram em
  `configuracoes.js`. Depois de salvar, quem precisa redesenhar a página chama
  `atualizarTelaConfiguracoes()` (mantém a rolagem; só refaz a seção aberta).
- Pra outras telas mandarem o astrólogo pra lá: `abrirConfiguracoes('agenda')`
  (ou `'relatorios'`, `'captacao'`, `'aparencia'`, `'seguranca'`).
- **Não depende de mapa**: ao recarregar nela, abre na hora e **fica nela**
  quando o primeiro mapa chega (`window.configuracoesAbertaNoCarregamento`
  em `mandala.js`); escolher um cliente na lista lateral volta pra Mandala como
  nas outras ferramentas. Erro do cálculo não apaga a página.
- Sem `position: sticky` de propósito (ver a seção sobre `sticky` acima).
- **A ferramenta Agenda ainda usa colunas de 480px** (`max-width: 480px` em
  `agendamento.js`) — o mesmo "estreitinho" que a página de Configurações
  evita; não foi mexida por não ter sido pedida.

## Mandala no céu ou no papiro, e capa Céu ou Papiro (03/10/2026)

- **Botão `#btn-mandala-papiro`** (`index.html`, no `#mandala-actions-overlay`, entre a Matriz de Visibilidade e a
  Revolução Solar): só aparece no Tema Céu (`body.tema-ceu`). `alternarMandalaPapiro` (`mandala.js`) liga/desliga
  `window.mandalaPapiroTela` e redesenha. Fica no modo escolhido até apertar de novo; **não é salvo** (ao recarregar
  abre no céu). Em `renderMandala`, o modo papiro desenha a roda "tinta sobre papiro" (`tintaPapiro`) e a folha de papiro
  cobre o palco por uma classe no body (`mandala-papiro-tela`, em `index.html`); o céu continua pintado por baixo
  (inline), então as outras ferramentas e a volta pro céu não perdem nada. `abrirModuloTecnica` tira a classe ao sair da Mandala.
- **"Adicionar ao Relatório" da Mandala** (`capturarMandalaAtualParaRelatorio`) manda o que está na tela: no papiro, a roda
  em tinta sem fundo; no céu, a mandala com o céu (PNG reduzido a 1600px por `relatorioRedimensionarPngDataUrl`).
- **Capa Céu ou Papiro** por modelo: `blocoCapa.capaPapiro` (checkbox/radio `#relCapaPapiro` no editor, só visível no Tema
  Céu, mas existe sempre pra não perder a escolha salva). Papiro = `rel-capa-papiro` (folha inteira, título terracota); com a
  Mandala Natal/Fortuna usa a roda em tinta (`png1`/`png2`), não a do céu.
- **Como testar sem login/Supabase** (foi assim em 03/10): servir a pasta com `http-server`, abrir `index.html` no
  Chromium (Playwright), stubar `window.supabase`, interceptar o motor de astrologia com JSON falso, setar
  `window.temaMandala='ceu'` + `body.tema-ceu`, `executarCalculo({soCalcular:true})` e chamar `renderMandala()` /
  `renderizarMandalasDoPreset` + `montarConteudoRelatorioHtml`. Dá pra tirar print e gerar PDF (`page.pdf()`).
- **Se o deploy não aparecer:** conferir em Actions se há um "pages build and deployment" pro commit (um push de duas
  refs de uma vez — `main` e a branch — não disparou o Pages em 03/10; empurrar `main` sozinho).

## Imagens salvas no Tema Céu saem sobre o papiro COM textura (03/10/2026)

Antes, toda imagem salva (galeria) em papiro saía só com o degradê ou uma cor bege chapada — sem a textura — e a
mandala no papiro saía transparente. Agora `papiro.js` tem `papiroTexturaCanvas(ctx, w, h, esc)` e
`papiroTexturaSvg(id, w, h)` (degradê + luz + sombra + fibras, as mesmas camadas de `--papiro-fundo`). Usar SEMPRE essas
duas pra pintar papel em imagem salva; **nunca** `papiroGradienteCanvas` + `fillRect` nem `papiroCores().chapado` direto
(sem textura). `capturarESalvarNaGaleria` (`mandala.js`) já resolve as ferramentas que só passavam cor chapada
(Liberação, Profecção, Sinastria...): no Tema Céu pede a imagem SEM fundo (`window.__capturaSemFundo`) e põe o papel por
baixo. A Mandala no papiro (botão da barra) desenha a textura em `lastRenderedPngUrl` (`renderMandala`).

## Eixos ocre nas rodas de papiro e mês ativo da Profecção na imagem salva (03/10/2026)

- **ASC-DSC / MC-IC em ocre (`COR_TINTA_OCRE` = `#B5852F`, `planetIcons.js`)**: nas rodas em tinta sobre papiro, o traço dos dois eixos e o
  triângulo dos 4 ângulos saem ocre (a letra dentro do triângulo continua terracota). Vale nas 4 cópias da roda:
  `renderMandala` (`mandala.js`), `profeccao.js`, `sinastria.js` e `liberacao.js` — **mexeu num, mexe nos quatro**. O triângulo
  usa `getIconeFragmento('outro','angulo', undefined, COR_TINTA_OCRE)` (4º parâmetro = cor forçada, só vale nos ícones de papiro).
  **Triângulo ocre em TODOS os lugares do Tema Céu** (decisão do astrólogo, 03/10): também nas tabelas/direções/botão de rotação (`getAnguloCirculoSVG`, `tabelaTecnica.js`), e na Calculadora de Lotes (`getASCIconSVGLotes`) — sempre triângulo ocre + letras terracota. **A roda do Céu principal (`iconeAnguloCeuSVG`, `mandala.js`) NÃO muda: o ícone do Céu é branco/azul claro e é outra categoria — só os ícones que vão no papiro são ocre. Foi alterada por engano em 03/10 e revertida.**
- **`html2canvas` perde o atributo `style` da cópia que ele pinta**: um seletor CSS `[style*="..."]` NÃO funciona na imagem
  salva (só na tela). Foi por isso que o mês ativo da Profecção Mensal (`tr[style*="e0e7ff"]`) saía sem o destaque. Corrigido com
  `data-mes-ativo` na linha. **Pra qualquer estilo que precisa aparecer em imagem capturada, usar classe/`data-*`, nunca `[style*]`.**
  Outros `[style*=...]` do `index.html` (Decênios, Lotes, Liberação, Isopsefia) podem ter o mesmo problema nas imagens salvas — não
  foram mexidos por não terem sido pedidos.

## Estilo da mandala: Astro Hellenic ou francês — e a RODA CENTRAL `roda.js` (03/10/2026)

Configurações → Aparência → "Estilo da mandala". **Só o FORMATO do desenho** (onde cada coisa fica); cores e ícones seguem o tema.

**O desenho da roda mora em UM lugar: `roda.js`, função `desenharRodaSVG(opcoes)`** (devolve `{ svg, width, height, papiroNaTela, ceuParams }`).
`renderMandala` (`mandala.js`) só cuida da tela/PNG/cache. Cada ESTILO é uma entrada de `RODA_ESTILOS` (topo do `roda.js`):
raios dos anéis, `faixaZodiaco`, `aneisTracejados`, `eixosTracejados`, `raioLotes`, `fioPlanetaDe`, `planetaComDesvio`. **Estilo novo = entrada
nova** (e, se precisar de geometria que não cabe nesses botões, um ramo novo em `desenharRodaSVG`). Mudou o francês ou o Astro Hellenic? É ali.
Duas coisas SEPARADAS dentro da função — **nunca misturar**: `temaCeu` = PINTURA/decoração de céu (céu, Terra no miolo, planetas como pontos
de luz, ícones do Céu, **cor** branca dos eixos); `estiloRoda` = POSIÇÃO/forma (inclusive se os eixos ASC-DSC/MC-IC são tracejados: faz parte do
estilo — liso no francês, tracejado no Astro Hellenic, em qualquer tema). **O mesmo vale pro retículo tracejado em volta dos ícones que não são do céu de verdade (nodos, sizígia, lotes, ângulos): `reticulosTracejados` — só no Astro Hellenic, em qualquer tema; no francês não existe, nem no Céu.**
`estiloMandalaAtual(temaCeu)`: se o astrólogo escolheu (`window.estiloMandala`) vale a escolha em qualquer tema; **sem escolha, o padrão de
sempre**: pintura de Céu = Astro Hellenic, o resto = francês. **Conferência obrigatória ao mexer em `desenharRodaSVG`:** comparar o SVG
antes/depois (byte a byte) nos 5 casos — claro, escuro, tinta de papiro, Céu ao vivo e capa — com o estilo padrão e com cada estilo forçado
(script de teste: ver "Como testar sem login" acima; interceptar `URL.createObjectURL` ou ler `window.mandalaSvgTelaUrlAtual`).
Preferência vai pro Supabase: `configuracoes.estilo_mandala` (já criada), carregada por `carregarEstiloMandala`, salva por `salvarEstiloMandala` (`supabase.js`).
**Plano "função global" (etapas):** 1) roda principal em `roda.js` (feita); 2) **Profecção**, 3) **Liberação** e 4) **Sinastria** (todas feitas em 03/10). **Todas as rodas do software agora saem de `roda.js`** — não existe mais cópia do desenho. **Como uma ferramenta usa a roda central:** passa
`ferramenta: { dados, loteCasa1, folgaCanvas, abertura({canvasSize,fundoDisco}) (a tag `<svg>`+defs+fundo que ela sempre montou), fundoEscuro,
fragmentoPlaneta(id), glowSol(pos, raio, tinta), destaques: { fatias, faixas, coroas, depoisDasFaixas(ctx) } }` + `tintaPapiro: (tema Céu)`; sem cabeçalho nem céu, canvas quadrado. A ferramenta
só decide signos e CORES dos destaques; a posição vem do estilo (`raioDestaque` em `RODA_ESTILOS`). Ver `gerarMandalaSVG` em `profeccao.js` como modelo.
**Conferência da migração da Profecção (03/10):** SVG antes/depois nos 9 casos (claro/escuro/papiro × sem destaque/com os 3 destaques/só mês) =
idêntico salvo espaços em branco e 2 diferenças INVISÍVEIS nos glifos do zodíaco (a cópia antiga tinha uma versão velha de `MONOLINE_ZODIAC_SVGS`:
sem `stroke-miterlimit="10"` e com um ponto de controle em `0` onde o da roda principal tem `0.083`). Isso mostra o risco das cópias: **cada cópia
guarda a sua versão das constantes** (`SIGNS`, `MONOLINE_ZODIAC_SVGS`, `PLANETS_DEF`, `EGYPTIAN_TERMS`, `polarToCart`, `calculateSevenLots`...) — ao migrar
uma ferramenta, comparar essas constantes com as de `mandala.js` antes (o script de comparação está no histórico desta sessão: normalizar
espaços e olhar o primeiro ponto de diferença). Hook de teste: `window.__gerarMandalaSVGProfeccao` (não remover sem atualizar os testes).

**Migração da Liberação (03/10):** a Liberação já reaproveitava as constantes globais de `mandala.js` (só os glifos dos signos da UI, `MONOLINE_ZODIAC_SVGS_ZR`, são
cópia — e nem entram na roda), então o SVG antes/depois nos 12 casos (3 temas × 4 combinações de níveis/saltos/lote) saiu igual salvo espaços em branco. O que é
só da Liberação continua em `liberacao.js`: cores de pico/salto, rótulos PICO/SALTO (`depoisDasFaixas`, posição = `raioDestaque + 23` do estilo) e as coroas com o número do nível.

**Migração da Sinastria (03/10):** `gerarMandalaSVG` (`sinastria.js`) devolve `{ svg, rCanvas }`; `rCanvas` = `rCanvasNatural` da roda central e `opcoes.rCanvasMinimo` → `ferramenta.rCanvasMinimo`
(as duas rodas lado a lado ficam do mesmo tamanho). SVG antes/depois nos 21 casos (3 temas × mapa normal, mapa com planetas colados, canvas mínimo e par com escala igual) =
igual salvo espaços e as 2 diferenças invisíveis de glifo (mesma cópia velha de `MONOLINE_ZODIAC_SVGS` da Profecção). A Sinastria nunca passa destaques de signo (os que a cópia antiga
tinha nunca eram usados), então a migração não os levou.

## Ícones monoline também nos botões da Mandala (03/10/2026)

Os 5 botões do container esquerdo da Mandala (`#mandala-actions-overlay`: salvar, atualizar momento, Matriz, céu/papiro, Revolução Solar) eram ícones
Font Awesome PREENCHIDOS; agora são SVG monoline (grade 64, `stroke="currentColor"` `stroke-width="3"`, pontas/juntas redondas, 22px), como todos os
outros ícones do software (o do céu/papiro é o MESMO desenho do Font Awesome `scroll`, só que contornado em vez de preenchido) — a cor vem do `color` do botão em cada tema (dourado, azul-tinta no Céu, claro quando apertado). **Botão novo nesse container = SVG monoline, nunca `<i class="fa-solid ...">`.**
(Ainda são Font Awesome: os passos de tempo `fa-backward-step`/`fa-forward-step` do canto direito e outros ícones de telas/janelas — não mexidos por não terem sido pedidos.)

## Termos em ocre no papiro; tracejados brancos no Céu (03/10/2026)

Em `roda.js`: (1) na roda em tinta sobre papiro os 60 ícones dos termos saem em `COR_TINTA_OCRE` (como os eixos e os triângulos) — quebra o excesso de azul; no Céu e nos outros
temas continuam na cor de sempre; (2) no Céu com o estilo Astro Hellenic os TRACEJADOS (os 3 anéis, as divisas da dodecatemória e as divisas dos termos) são brancos (`corTracejado`),
pra não se confundirem com o amarelo dos ícones dos termos; os dentinhos (traço cheio) e os ícones dos termos ficam amarelos. Conferido: só essas cores mudam (60 ícones no papiro;
um bloco de tracejados no Céu); Claro, Escuro, capa e francês no Céu saem idênticos.

**Branco adaptativo (03/10/2026, depois):** o "branco" do Céu NÃO é branco chapado — é o mesmo dos ícones calculados: azul-esbranquiçado (`#e6eeff`/`#dbe6ff`) de noite/abaixo do horizonte e azul-tinta
(`#1d3a66`) por cima do céu claro do dia (`ceuParams.dia`). Os tracejados (anéis, dodecatemória, divisas dos termos; `emitirTracejado` em `roda.js`) usam os clips `ceuMeiaTela`/`ceuMeiaTelaBaixo`,
e o número das casas (faixa do zodíaco do Astro Hellenic via `corNumero` em `montarBandaZodiacoCeuSVG`, e o francês no Céu) usa `corCalculadoCeu(x,y)`. Ícones dos termos no Céu continuam amarelos.

## Dois Astro Hellenic: tracejado e reto (03/10/2026)

`RODA_ESTILOS` (`roda.js`) tem 3 estilos: `frances`, `astrohellenic` (**Estilo Astro Hellenic Tracejado** — a chave ficou a antiga porque é a que já está salva no Supabase e o padrão do Céu, então nada
mudou pra quem já usava) e `astrohellenic_reto` (**Estilo Astro Hellenic**, a mesma roda com todo traço liso: anéis, divisas da dodecatemória/termos, eixos, retículos dos ícones calculados e divisas da faixa
do zodíaco). O reto é o tracejado + o botão `retas: true` (e `aneisTracejados`/`eixosTracejados` falsos); `retas` chega às funções de `mandala.js` por `semReticulo === 'reto'` (retículo liso) e `reto` (faixa).
O branco adaptativo do Céu vale pros dois (condição `faixaZodiaco`). Conferido: francês, tracejado e padrão saem idênticos byte a byte nos 5 casos; o reto tem 0 `dasharray`. `estilo_mandala` aceita os 3 valores
(`carregarEstiloMandala`), sem coluna nova. **Atenção ao testar: refazer `/tmp/*.main.js` a partir do `origin/main` atual antes de comparar, senão a base é antiga.**

**Sombra no lugar do retículo (estilo reto, 03/10/2026):** no `astrohellenic_reto` o círculo em volta dos ícones que não são do céu (ângulos, lotes, nodos, sizígia) não é mais um traço: é uma SOMBRA translúcida
embaixo do ícone (dois discos, opacidade .07 e .13, sem filtro/blur pra sair igual em PNG e PDF). No papiro usa `COR_TINTA_SOMBRA` (`#1b2a4a`, azul quase preto da tinta de escrever, `planetIcons.js`); nos outros
temas, a cor do ícone naquele tema (no Céu, a mesma que muda de branco pra azul-tinta). `roda.js` (`sombraIcone`/`reticuloTinta`) e `iconeAnguloCeuSVG`/`iconeCalculadoCeuSVG` (`semReticulo === 'reto'`). O tracejado e o francês não mudaram (byte a byte).

**Rascunho "Estilo comum" (03/10/2026, `comum`):** herda do reto com `faixaZodiaco:false` e `invertido:true`. Desenho (pedido do astrólogo, depois de ver o 1º rascunho): signos num anel por dentro (número + glifo,
`signos.numero/glifo`) **sem nenhuma linha** dividindo signos nem planetas; termos (`anelTermos`) por fora da faixa dos planetas e dodecatemória (`anelDodec`) na borda; **os dentinhos de grau ficam na borda de DENTRO dos termos, apontando
pra dentro**, e **os fios dos planetas/lotes vão pra FORA, até esses dentinhos** (é assim que se vê em que grau cada um encosta). Linhas que existem: miolo (aspectos), divisória termos/dodecatemória e a borda; as linhas radiais da
dodecatemória e dos termos e os eixos ASC-DSC/MC-IC continuam. Pontos calculados (lotes, ângulos) ficam onde estão. `desenharRodaSVG` usa `aDod`/`aTer`/`inv`; nos outros estilos valem os raios de sempre (conferido byte a byte).
`R_Ceu` e `raioDestaque` crescem pros anéis de fora. Ainda é rascunho, só na branch.

**Tamanho do Comum (03/10/2026):** a roda inteira tem EXATAMENTE o mesmo tamanho do Astro Hellenic (SVG com a mesma largura/altura, conferido nos 5 casos). Pra isso os termos (446–472) e a dodecatemória (472–498) entram
dentro do mesmo raio e a eclíptica dos planetas sobe pra `raioPlanetas: 373` (entre os signos, até 300, e os termos). `pRCeu = 390` é o raio de REFERÊNCIA pro tamanho total (`R_Ceu`, canvas das ferramentas) — **todo estilo novo tem que caber
nele**; `pR` é onde os planetas ficam de verdade (`estiloRoda.raioPlanetas`, padrão 390). `temaCeu`/`estiloRoda` agora são definidos antes de `pR`.

**Correção (03/10/2026):** no Comum o que sai são os CÍRCULOS em volta do anel dos signos — as DIVISAS RADIAIS dos signos (as 12 linhas do miolo até a borda de dentro dos termos) FICAM, como no francês. Uma sessão tinha tirado as divisas por ler "linha
dividindo os signos" como se fossem elas; o astrólogo falava dos círculos. **Regra: ele pediu pra MUDAR coisas de posição; só remover o que ele nomear.**

**Dentinho = mesma cor da linha (Comum, 03/10/2026):** a régua de graus faz parte do círculo da borda de dentro dos termos, então usa a MESMA cor dele (no Céu o branco/azul-tinta adaptativo via `emitirTracejado`; `reguaTermos` em `roda.js`).
Só no Comum — os outros estilos mantêm a régua amarela de sempre (conferido byte a byte).

**Estilo comum (chave `comum`, 03/10/2026) — aplicado:** o desenho aprovado é a mandala "comum" dos sites por aí (nome definido pelo astrólogo). Layout final: miolo de aspectos 150; número da casa (176) e glifo grande (216, 42px) logo depois, dentro da cunha entre
as divisas; planetas, nodos e sizígia na eclíptica (`raioPlanetas` 343); ASC/DSC/MC/IC (`raioAngulos` 413) e lotes (`raioLotes` 420) ENCOSTADOS nos dentinhos (régua 7/12/18); termos 446–472 e dodecatemória 472–498; mesmo tamanho total do Astro Hellenic.
Opções em Configurações → Aparência: Astro Hellenic, Astro Hellenic Tracejado, Estilo comum, Estilo francês. `estilo_mandala` aceita `comum`.

**Comum sem sombra (03/10/2026):** o Estilo comum NÃO tem a sombra translúcida embaixo dos ícones calculados (`reticulosTracejados: false` no estilo): só os ícones normais, como no francês. A sombra é do Astro Hellenic (reto).

**Mancha de combustão do Sol no papiro (03/10/2026):** antes `roda.js` só desenhava a mancha fora do papiro (`sunItem && !papiro`), então toda roda de papiro saía sem ela. Agora o papiro tem a SUA mancha, "pintada na folha": lavagem de tinta ocre/terracota translúcida
(`#C98A2B` → `#B5852F` → `#A03E25` → transparente), sem o branco-amarelado do céu, no mesmo raio (`rSobRaiosGlow`) em todos os estilos. Cada mancha leva gradiente de id único (`combustaoPapiro_N`, contador `__combustaoPapiroN`) — a Sinastria desenha duas rodas na mesma
tela. Vale pra qualquer roda em papiro (Mandala, Profecção, Liberação, Sinastria, Relatório, capa). Claro, escuro e Céu não mudaram (byte a byte).
