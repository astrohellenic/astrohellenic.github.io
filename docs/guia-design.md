# Guia de design do Astro Hellenic

Rascunho para aprovação. **Nada disto foi aplicado ao software.**

## 1. A ideia em uma frase

O software tem **regras de forma** (iguais em todos os temas) e **cores** (cada tema escolhe as suas).
Forma é onde as coisas ficam e como são desenhadas. Cor é só a tinta.

**Regra para decidir:** se uma coisa existe num tema e não existe em outro (como a sombra), ela é **do tema**. Só é global o que é igual em todos.

Quando uma regra de forma muda, todos os temas mudam juntos.
Quando um tema muda de cor, só ele muda.

## 1b. Os dois azuis do software (decidido)

Só existem **dois azuis**, os dois azuis egípcios. Nenhum outro azul entra no software.

- **Azul egípcio claro (código 1F5FA3):** é a cor de tudo que é **pintado**: divisas, logo, e o que for colorido. É o mesmo azul do Falando de Astrologia.
- **Azul egípcio escuro, mais arroxeado (código 1034A6):** é a cor de tudo que **não é pintado**: linhas, texto em azul, mandala.
- **Preto de tinta (código 1A1410):** é o único preto/texto escuro do software, em todo o Céu. Decidido.
- **Ocre (código B5852F):** é o dourado do papiro e do modo claro. No modo escuro continua o dourado de antes (código D9AE3F). Decidido.
- **Terracota (para títulos e destaques):** no papiro e no modo claro é o código A03E25. No modo escuro é um pouco mais claro, o código CF6044. Decidido.
- **Mandala:** no papiro e no modo claro usa o azul egípcio escuro (código 1034A6). **Ícones dos termos:** sempre ocre (B5852F); no modo escuro, o dourado de antes (D9AE3F). Decidido.
- O "azul clássico" antigo (103B70) e o azul-tinta do Céu (1D3A66) **serão descartados** quando a organização estiver pronta.

**As cinco cores de época do software (decidido):** azul egípcio escuro arroxeado, azul egípcio claro, preto de tinta, ocre e terracota.

**Verde do WhatsApp (decidido):** papiro e claro 4A7C59 (o mesmo do Falando de Astrologia). No escuro, 5FA073.

**Cores dos elementos (decidido):** (papiro e claro / escuro)

- Fogo (realgar), o laranja: papiro e claro D0610F / escuro F28A33
- Terra: marrom 6B4A2B / AE7C4E
- Ar: cinza-azulado 6B7780 / A3ADB5
- Água: azul egípcio claro 1F5FA3 / 4A8DD4

**Mancha de combustão do Sol (decidido):** de 0 a 8 graus é o ocre (no escuro, o dourado de antes); de 8 a 15 graus é o laranja do fogo (o laranja de cada modo, o mesmo dos signos de fogo). No papiro é mais opaca; no claro e no escuro mantém o degradê de antes.

**Mandala no céu (decidido):** as cores que o céu já usa hoje nos ícones e na mandala ficam EXATAMENTE como estão e entram na lista (temas.css, seção "Mandala no céu"). Só os signos (cores dos elementos) e os ícones dos termos (ocre) usam as mesmas cores do papiro e do modo claro.

**Regra do padrão (decidida):** cada cor tem um nome e um valor por modo. Onde o software usar "o laranja", usa o laranja daquele modo, sempre o mesmo valor, em qualquer tela. Ninguém decide cor por tela.

**Regra das cores (decidida):** o papiro e o modo claro usam **as mesmas cores**. O modo escuro usa a **mesma cor adaptada**, um pouco mais clara para aparecer no fundo escuro. As cores de época não saem de nenhum tema padrão (claro e escuro).

- Azul egípcio escuro: papiro e claro 1034A6, escuro **5F80E7**.
- Ocre: papiro e claro B5852F, escuro D9AE3F (o dourado de antes).
- Terracota: papiro e claro A03E25, escuro CF6044.
- Preto de tinta: papiro e claro 1A1410 / escuro E2E8F0 (o cinza claro que o software já usa). Decidido.
- Azul egípcio claro: papiro e claro 1F5FA3, escuro **4A8DD4**.

## 2. Os temas

| | Claro | Escuro | Céu (papiro) |
|---|---|---|---|
| Painel por baixo | creme `#fffdf5` | `#1c1917` | folha de papiro |
| Cartão | `#ffffff` | `#262220` | sem fundo (o papiro aparece) |
| Linha / divisa (a mesma cor da moldura que ela substitui) | dourado | dourado | azul egípcio claro |
| Título | azul `#103b70` | azul-claro | terracota `#a03e25` |
| Ícone | dourado | dourado | azul-tinta `#1d3a66` |

Um tema novo só precisa preencher essa tabela.

## 3. Regras de forma (valem para TODOS os temas)

1. **Painel por baixo.** Toda ferramenta ocupa um painel, que é a cor de fundo do tema (no Céu, o papiro).
2. **Divisa dupla.** Partes da ferramenta são separadas por uma linha dupla fina.
   - Uma no topo, uma no fim do cabeçalho, uma entre cada bloco e uma no final.
   - **Sem moldura em volta da ferramenta.**
   - Tabelas mantêm as próprias linhas, sem uma caixa em volta.
3. **Cabeçalho global.** O cabeçalho é um só para o software inteiro (já existe em `mandala.js`). Ele abre e fecha com a divisa dupla.
4. **Cartões menores** (selos, cartões de L1/L2, linhas da linha do tempo) têm **só uma linha fina em cima e uma embaixo, sem os lados** (decidido). Sem cantos, nunca borda de 2px.
5. **Ícones sempre monoline** (só traço, sem preenchimento). Quem cria um ícone novo segue isso.
6. **Botões** são só o ícone sobre o painel, sem moldura própria.

6b. **Cor das linhas:** todas as linhas (divisas duplas, linhas dos cartões menores, linhas das tabelas) são **sempre da mesma cor da divisa dupla** (azul egípcio claro). Decidido.

## 3b. Regras de texto (decididas)

1. **Parênteses só quando repete a mesma coisa com outras palavras.** Exemplo certo: "19 meses (570 dias)". Se for continuação, usa traço. Nada de explicação solta entre parênteses (ex.: sem "(Regência Diária)").
2. **Níveis escritos por extenso:** "Nível 1", "Nível 2", "Nível 3". Nunca "L1", "L2", "L3" (L vem do inglês).
3. **Cabeçalho de tabela (a barra de cima com Nível, Duração, Início, Término):** ainda a definir.

## 3c. Grades quadriculadas e aspectos (decididos)

- **Tabela quadriculada** (ex.: Matriz de Visibilidade), em que o conteúdo depende de estar dentro dos quadradinhos: as linhas dos lados **ficam** (diferente das outras tabelas), mas os **cantos são sempre retos**. Linhas na cor das divisas (azul egípcio claro), células sem preenchimento.
- **Borda quebrada do papiro** sempre fica **por fora** das linhas duplas, nunca por dentro.
- **Cores dos aspectos, iguais em todos os temas:** conjunção = preto de tinta, sextil = azul egípcio claro, trígono = azul egípcio escuro, quadratura = terracota, oposição = laranja do fogo (variáveis `--aspect-*` em `temas.css`).

## 4. O que é só de um tema (não vira regra global)

- **Céu:** borda quebrada do papiro e textura do papel (fibras, luz e sombra).
- **Cores** de cada tema (tabela da seção 2).
- **Sombra** dos cartões e janelas: cada tema decide se tem e como é. Hoje o Céu não tem, o claro e o escuro têm.

## 5. Como o código deve ficar

- **`temas.css`** (novo): a lista de cores de cada tema. É o único lugar que tem cor.
  Aproveita os nomes que já existem (`--bg-main`, `--bg-card`, `--gold-primary`...) e acrescenta só estes:
  `--divisa-cor` (= `--gold-primary` de cada tema, a mesma cor da moldura antiga), `--divisa-espessura`, `--icone-cor`, `--sombra` (cada tema define a sua; no Céu é `none`).
- **`componentes.css`** (novo): as regras de forma da seção 3. Nenhuma cor aparece aqui, só as variáveis.
- **`papiro.css`** (já existe): fica só com o que é do papiro (textura e borda quebrada).
- **Ferramentas** (`decenios.js` etc.): usam as classes (`.painel`, `.divisa`, `.cartao`). Elas **não escrevem** contorno, sombra nem cor direto.
- **Guia para sessões futuras:** as regras da seção 6 entram no `CLAUDE.md`.

## 6. Regras de ouro para quem for programar (inclusive eu)

1. Cor nova entra em `temas.css`, nunca dentro de uma ferramenta.
2. Forma nova entra em `componentes.css`, nunca copiada de outra ferramenta.
3. Ícone novo é monoline.
4. Mexeu num `.js`, `.css` ou imagem com `?v=` no `index.html`? Atualiza o número no mesmo commit.
5. Publicar só quando o astrólogo pedir.
6. Se uma mudança resolve uma coisa e estraga outra, para e avisa.

## 7. Plano de migração (uma ferramenta por vez)

1. Criar `temas.css` e `componentes.css`, sem mudar nada na tela.
2. Migrar o **cabeçalho** (já é global).
3. Migrar os **Decênios**, comparando antes e depois nos três temas.
4. Seguir pelas outras ferramentas, uma por vez, cada uma aprovada por você.
5. No fim, o Céu fica com **um bloco só** em vez dos 22 de hoje.

## 8. Pendências para você decidir

