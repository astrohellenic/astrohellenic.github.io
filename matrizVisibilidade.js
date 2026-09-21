/* ==========================================
   MATRIZ DE VISIBILIDADE (THEORIA) — arquivo próprio
   ==========================================
   Antes vivia dentro de tabelaTecnica.js, junto com o Painel Técnico
   (tabela grande com Ponto/Signo/Grau/Latitude/Termo/Dodecatemória). A
   pedido do astrólogo, foi separada num arquivo próprio (ele não gostava
   das duas coisas misturadas) e, aproveitando a separação, reconstruída
   em SVG puro (antes era uma <table> HTML) — a mesma aparência de sempre,
   só que renderizada como um único <svg>, célula por célula.

   Por que isso importa: `renderPainelTecnico` (tabelaTecnica.js) chama
   `renderMatrizVisibilidadeHTML(data)` e cola o HTML retornado dentro do
   Painel Técnico, exatamente como fazia antes — por isso essa função
   PRECISA continuar com esse nome e devolvendo os mesmos três ids
   (matrizOuterScroll / matrizScaleBox / matrizVisibilidadeWrapper), que é
   o que o auto-encolhimento (`encolherTabelaParaCaber`) e o pinça-pra-zoom
   à mão (`ativarPinchZoomTabela`), ambos em tabelaTecnica.js, esperam
   encontrar — nenhum dos dois precisou mudar uma linha: eles só olham
   offsetWidth/offsetHeight do wrapper e aplicam transform:scale nele, o
   que funciona igual esteja lá dentro uma <table> ou um <svg>.

   Ícones dos planetas (getPlanet3DSVG) e dos itens/lotes/ângulos
   (getItemSVG) continuam definidos em tabelaTecnica.js e são só
   reaproveitados aqui como funções globais — não foram duplicados, pra
   não correr o risco de alguém atualizar o desenho de um ícone só numa
   das duas cópias no futuro. */

const MATRIZ_CELULA_TAM = 46;

/* Ícone de cada coluna/linha da matriz. Igual ao getMatrixIcon() que
   existia dentro do renderMatrizVisibilidadeHTML antigo, com uma
   diferença: Nodo Norte/Sul, no getItemSVG original, viravam um <span>
   de HTML solto (texto ☊/☋) — o que nunca apareceria dentro de um <svg>
   puro (teria que ser um <foreignObject>, que era exatamente o tipo de
   complicação que essa reescrita quis evitar). Aqui os dois viram um
   <svg><text> de verdade, na mesma cor (var(--aspect-conjuncao)) e
   tamanho visual equivalente ao <span> original. */
function getMatrizIconeSVG(col) {
  if (col.type === 'planet') return getPlanet3DSVG(col.id);
  if (col.name === 'Nodo Norte' || col.name === 'Nodo Sul') {
    const simbolo = col.name === 'Nodo Norte' ? '☊' : '☋';
    return `<svg width="20" height="20" viewBox="-12 -12 24 24"><text x="0" y="6" font-size="17" font-weight="bold" fill="var(--aspect-conjuncao)" text-anchor="middle">${simbolo}</text></svg>`;
  }
  return getItemSVG(col.name);
}

/* Posiciona um ícone (fragmento "<svg width=... height=... ...>...</svg>")
   centralizado num ponto (cx, cy) do grid, injetando x/y no próprio <svg>
   aninhado — um <svg> dentro de outro <svg> é um elemento de verdade
   (não precisa de <foreignObject>) e aceita x/y pra se posicionar dentro
   das coordenadas do pai. Lê o width/height já declarado no fragmento em
   vez de forçar um tamanho novo, pra manter cada ícone do jeito que
   sempre foi (planetas maiores, itens/ângulos menores — igual na tabela
   antiga, onde cada coluna/linha só ficava larga o suficiente pro maior
   ícone dela). */
function posicionarIconeMatrizSVG(fragmentoSVG, cx, cy) {
  const wMatch = fragmentoSVG.match(/width="([\d.]+)"/);
  const hMatch = fragmentoSVG.match(/height="([\d.]+)"/);
  const w = wMatch ? parseFloat(wMatch[1]) : 24;
  const h = hMatch ? parseFloat(hMatch[1]) : 24;
  const x = cx - w / 2;
  const y = cy - h / 2;
  return fragmentoSVG.replace('<svg ', `<svg x="${x}" y="${y}" `);
}

/* Mesmo cálculo de aspecto (conjunção/sextil/quadratura/trígono/oposição)
   que existia no renderMatrizVisibilidadeHTML antigo — já devolvia um
   fragmento SVG prontinho, então não precisou mudar nada aqui, só migrou
   de arquivo junto com o resto da Matriz. */
function getAspectoMatrizSVG(deg1, deg2) {
  if (deg1 === undefined || deg2 === undefined) return '';
  const s1 = Math.floor(deg1 / 30);
  const s2 = Math.floor(deg2 / 30);
  let diff = Math.abs(s1 - s2);
  if (diff > 6) diff = 12 - diff;

  if (diff === 0) { // Conjunção
    return `<svg width="14" height="14" viewBox="0 0 20 20"><circle cx="8" cy="12" r="5" fill="none" stroke="var(--aspect-conjuncao)" stroke-width="2.2"/><line x1="12" y1="8" x2="18" y2="2" stroke="var(--aspect-conjuncao)" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  if (diff === 2) { // Sextil
    return `<svg width="14" height="14" viewBox="0 0 20 20"><path d="M10 2v16M3 6l14 8M3 14L17 6" stroke="var(--aspect-sextil)" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`;
  }
  if (diff === 3) { // Quadratura
    return `<svg width="14" height="14" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="none" stroke="var(--aspect-quadratura)" stroke-width="2.5"/></svg>`;
  }
  if (diff === 4) { // Trígono
    return `<svg width="14" height="14" viewBox="0 0 20 20"><polygon points="10,2 19,17 1,17" fill="none" stroke="var(--aspect-trigono)" stroke-width="2.5"/></svg>`;
  }
  if (diff === 6) { // Oposição
    return `<svg width="16" height="14" viewBox="0 0 24 20"><circle cx="5" cy="10" r="4" fill="none" stroke="var(--aspect-oposicao)" stroke-width="2.2"/><line x1="9" y1="10" x2="15" y2="10" stroke="var(--aspect-oposicao)" stroke-width="2.2"/><circle cx="19" cy="10" r="4" fill="none" stroke="var(--aspect-oposicao)" stroke-width="2.2"/></svg>`;
  }
  return '';
}

/* Monta o <svg> inteiro da Matriz — um grid de (N+1)x(N+1) células
   quadradas de MATRIZ_CELULA_TAM px: célula (0,0) fica em branco (canto
   vazio, igual à <th> vazia de antes), linha 0 e coluna 0 são os
   cabeçalhos com o ícone de cada ponto, e o resto é a matriz de aspectos
   propriamente dita (metade de baixo cinza com "-", porque é espelhada;
   metade de cima com o glifo do aspecto quando existe um aspecto maior). */
function montarSVGMatrizVisibilidade(colunas, posicoes) {
  const N = colunas.length;
  const C = MATRIZ_CELULA_TAM;
  const total = (N + 1) * C;

  let svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" style="display: block; font-family: 'Montserrat', sans-serif;">`;
  svg += `<rect x="0" y="0" width="${total}" height="${total}" fill="var(--bg-card)"/>`;

  // Canto vazio (linha 0, coluna 0)
  svg += `<rect x="0" y="0" width="${C}" height="${C}" fill="var(--bg-main)" stroke="var(--table-border)" stroke-width="1"/>`;

  // Cabeçalho de colunas (linha 0) e de linhas (coluna 0)
  colunas.forEach((col, k) => {
    const iconeSVG = posicionarIconeMatrizSVG(getMatrizIconeSVG(col), (k + 1) * C + C / 2, C / 2);
    svg += `<rect x="${(k + 1) * C}" y="0" width="${C}" height="${C}" fill="var(--bg-main)" stroke="var(--table-border)" stroke-width="1"/>${iconeSVG}`;

    const iconeSVGLinha = posicionarIconeMatrizSVG(getMatrizIconeSVG(col), C / 2, (k + 1) * C + C / 2);
    svg += `<rect x="0" y="${(k + 1) * C}" width="${C}" height="${C}" fill="var(--bg-main)" stroke="var(--table-border)" stroke-width="1"/>${iconeSVGLinha}`;
  });

  // Corpo da matriz
  colunas.forEach((row, i) => {
    colunas.forEach((col, j) => {
      const x = (j + 1) * C;
      const y = (i + 1) * C;
      const cx = x + C / 2;
      const cy = y + C / 2;

      if (j <= i) {
        svg += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="var(--bg-hover)" stroke="var(--table-border)" stroke-width="1"/>`;
        svg += `<text x="${cx}" y="${cy}" font-size="13" fill="var(--text-disabled)" text-anchor="middle" dominant-baseline="central">-</text>`;
      } else {
        svg += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="var(--bg-card)" stroke="var(--table-border)" stroke-width="1"/>`;
        const asp = getAspectoMatrizSVG(posicoes[row.key], posicoes[col.key]);
        if (asp) svg += posicionarIconeMatrizSVG(asp, cx, cy);
      }
    });
  });

  svg += `</svg>`;
  return svg;
}

/* Ponto de entrada — mesmo nome, mesma assinatura e mesmos ids de sempre
   (ver comentário no topo do arquivo). Calcula as posições de cada ponto
   exatamente como o renderMatrizVisibilidadeHTML antigo calculava. */
function renderMatrizVisibilidadeHTML(data) {
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const mcAbs = data.MC ? data.MC.grau_absoluto : (ascAbs + 270) % 360;
  const dscAbs = (ascAbs + 180) % 360;
  const icAbs = (mcAbs + 180) % 360;
  const nodeAbs = data.Nodo_Norte ? data.Nodo_Norte.grau_absoluto : 0;
  const syzAbs = data.Sizigia ? data.Sizigia.grau_absoluto : 0;

  const pObj = {};
  const mapKeys = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };
  ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach(id => {
    const item = data[mapKeys[id]];
    pObj[id] = item ? item.grau_absoluto : 0;
  });

  function buscarLoteDeg(chave) {
    if (typeof window.currentLotes === 'undefined' || !window.currentLotes) return 0;
    const item = window.currentLotes.find(l => l.key === chave);
    return item ? item.deg : 0;
  }

  const fortAbs = buscarLoteDeg('fortune');
  const spirAbs = buscarLoteDeg('spirit');
  const erosAbs = buscarLoteDeg('venus');
  const necAbs = buscarLoteDeg('mercury');
  const courAbs = buscarLoteDeg('mars');
  const vicAbs = buscarLoteDeg('jupiter');
  const nemAbs = buscarLoteDeg('saturn');

  const colunas = [
    { key: 'Sun', type: 'planet', id: 'Sun' },
    { key: 'Moon', type: 'planet', id: 'Moon' },
    { key: 'Mercury', type: 'planet', id: 'Mercury' },
    { key: 'Venus', type: 'planet', id: 'Venus' },
    { key: 'Mars', type: 'planet', id: 'Mars' },
    { key: 'Jupiter', type: 'planet', id: 'Jupiter' },
    { key: 'Saturn', type: 'planet', id: 'Saturn' },
    { key: 'ASC', type: 'item', name: 'ASC' },
    { key: 'DSC', type: 'item', name: 'DSC' },
    { key: 'MC', type: 'item', name: 'MC' },
    { key: 'IC', type: 'item', name: 'IC' },
    { key: 'NodeN', type: 'item', name: 'Nodo Norte' },
    { key: 'NodeS', type: 'item', name: 'Nodo Sul' },
    { key: 'Syz', type: 'item', name: 'Sizígia' },
    { key: 'FORT', type: 'item', name: 'fortune' },
    { key: 'ESP', type: 'item', name: 'spirit' },
    { key: 'EROS', type: 'item', name: 'venus' },
    { key: 'NEC', type: 'item', name: 'mercury' },
    { key: 'AUD', type: 'item', name: 'mars' },
    { key: 'VIT', type: 'item', name: 'jupiter' },
    { key: 'NÊM', type: 'item', name: 'saturn' }
  ];

  const posicoes = {
    Sun: pObj.Sun, Moon: pObj.Moon, Mercury: pObj.Mercury, Venus: pObj.Venus, Mars: pObj.Mars, Jupiter: pObj.Jupiter, Saturn: pObj.Saturn,
    ASC: ascAbs, DSC: dscAbs, MC: mcAbs, IC: icAbs,
    NodeN: nodeAbs, NodeS: (nodeAbs + 180) % 360, Syz: syzAbs, FORT: fortAbs, ESP: spirAbs, EROS: erosAbs, NEC: necAbs, AUD: courAbs, VIT: vicAbs, NÊM: nemAbs
  };

  const svgMatriz = montarSVGMatrizVisibilidade(colunas, posicoes);

  return `
    <h3 style="text-align: center; font-family: 'Cinzel', serif; color: var(--primary-blue); font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; font-weight: 800;">Matriz de Visibilidade (Theoria)</h3>
    <div id="matrizOuterScroll" style="overflow-x: auto; overflow-y: hidden; text-align: center; touch-action: pan-y;">
      <div id="matrizScaleBox" style="display: inline-block;">
      <div id="matrizVisibilidadeWrapper" style="display: inline-block; border: 2px solid var(--table-border); border-radius: 12px; overflow: hidden; transform-origin: top left;">
        ${svgMatriz}
      </div>
      </div>
    </div>
  `;
}

/* BOTÃO "MATRIZ DE VISIBILIDADE" NA BARRA DE AÇÕES DA MANDALA
   (#mandala-actions-overlay, index.html — o mesmo containerzinho de
   Salvar/Atualizar Momento/Revolução Solar, que só aparece no modo
   Mandala/Radix). Ao tocar, mostra a Matriz no lugar do desenho da
   mandala, dentro do MESMO #mandala-container (sem trocar de módulo/aba
   — o topo continua marcando "Mandala"); ao tocar de novo, volta a
   desenhar a mandala.

   Em vez de guardar um "já está mostrando a Matriz?" numa variável
   separada, pergunta direto pro DOM (existe #matrizVisibilidadeWrapper
   ali dentro agora?) — assim não tem como esse estado ficar
   desincronizado do que está realmente na tela (ex.: se o astrólogo sair
   pra outro módulo e voltar pra Mandala por fora, sem usar este botão;
   abrirModuloTecnica, em supabase.js, já reseta a classe visual do botão
   nesse caso, mas mesmo que não resetasse, o próximo toque aqui ainda
   acertaria sozinho, porque volta a checar o DOM). */
function toggleMatrizVisibilidadeNaMandala() {
  const container = document.getElementById('mandala-container');
  if (!container || typeof currentCalculatedData === 'undefined' || !currentCalculatedData) return;

  const botao = document.getElementById('btn-matriz-visibilidade-mandala');
  const jaMostrandoMatriz = !!document.getElementById('matrizVisibilidadeWrapper');

  if (jaMostrandoMatriz) {
    if (botao) botao.classList.remove('matriz-visibilidade-ativa');
    if (typeof renderMandala === 'function') renderMandala();
  } else {
    if (botao) botao.classList.add('matriz-visibilidade-ativa');
    container.innerHTML = `
      <div id="matrizVisibilidadeNaMandala" style="width: 100%; min-height: 100%; box-sizing: border-box; padding: 70px 16px 24px 16px;">
        ${renderMatrizVisibilidadeHTML(currentCalculatedData)}
      </div>
    `;
    ajustarMatrizVisibilidadeAoTamanhoDaTela();
  }
}
window.toggleMatrizVisibilidadeNaMandala = toggleMatrizVisibilidadeNaMandala;

/* Mesmo encolhimento + pinça-pra-zoom do Painel Técnico (agora funções
   globais em tabelaTecnica.js, ver comentário lá), só que medindo a
   largura disponível a partir do próprio container cheio da tela (não
   tem cabeçalho de Painel Técnico pra sincronizar largura aqui) — e,
   diferente do Painel Técnico, também passando uma ALTURA disponível:
   aqui a Matriz vive dentro da "vidraça" de altura fixa da Mandala
   (#mandala-container, dentro de #mandala-screen/#main-stage travados em
   100dvh — só existem assim pra mandala se auto-encolher, ver CLAUDE.md),
   não numa página que cresce à vontade. Sem avisar essa altura,
   encolherTabelaParaCaber/ativarPinchZoomTabela deixavam o conteúdo
   crescer pra fora da vidraça ao dar zoom, sem nada rolar até lá — era
   a "matriz zoomando só dentro de uma caixinha, coisas somem" reportada
   pelo astrólogo. */
function ajustarMatrizVisibilidadeAoTamanhoDaTela() {
  const raiz = document.getElementById('matrizVisibilidadeNaMandala');
  const container = document.getElementById('mandala-container');
  const outerScroll = document.getElementById('matrizOuterScroll');
  if (!raiz || !container || !outerScroll) return;

  const estilos = getComputedStyle(raiz);
  const availableWidth = raiz.clientWidth
    - parseFloat(estilos.paddingLeft || 0)
    - parseFloat(estilos.paddingRight || 0);

  // Altura que ainda sobra, da posição onde a Matriz começa (abaixo do
  // título) até o fundo visível de #mandala-container — com uma folga de
  // 16px pra não colar no limite exato da vidraça.
  const containerRect = container.getBoundingClientRect();
  const outerScrollRect = outerScroll.getBoundingClientRect();
  const availableHeight = (containerRect.bottom - outerScrollRect.top) - 16;

  const escalaBase = encolherTabelaParaCaber('matrizOuterScroll', 'matrizScaleBox', 'matrizVisibilidadeWrapper', availableWidth, availableHeight);
  ativarPinchZoomTabela('matrizOuterScroll', 'matrizScaleBox', 'matrizVisibilidadeWrapper', escalaBase);
}
