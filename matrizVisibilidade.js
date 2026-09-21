/* ==========================================
   MATRIZ DE VISIBILIDADE (THEORIA) — arquivo próprio
   ==========================================
   Antes vivia dentro de tabelaTecnica.js, junto com o Painel Técnico
   (tabela grande com Ponto/Signo/Grau/Latitude/Termo/Dodecatemória). A
   pedido do astrólogo, foi separada num arquivo próprio (ele não gostava
   das duas coisas misturadas) e, aproveitando a separação, reconstruída
   em SVG puro (antes era uma <table> HTML) — a mesma aparência de sempre,
   só que renderizada como um único <svg>, célula por célula.

   Existia só dentro do Painel Técnico; depois passou a existir SÓ no
   lugar da Mandala (toggleMatrizVisibilidadeNaMandala, mais abaixo) —
   o astrólogo pediu pra tirar do Painel Técnico de vez, porque ter a
   Matriz em dois lugares diferentes (cada um com sua própria versão)
   virou fonte de confusão e retrabalho. Hoje só existe
   `renderMatrizVisibilidadeResponsivaHTML(data)`: sem caixinha própria,
   sem cálculo de tamanho em JS, sem bloquear o zoom nativo — encolhe só
   com CSS (como a imagem da Mandala) e deixa o pinça nativo do navegador
   fazer o resto (ver o comentário grande antes dessa função).

   Ícones dos planetas (getPlanet3DSVG) e dos itens/lotes/ângulos
   (getItemSVG) continuam definidos em tabelaTecnica.js e são só
   reaproveitados aqui como funções globais — não foram duplicados, pra
   não correr o risco de alguém atualizar o desenho de um ícone só numa
   das duas cópias no futuro. O mesmo vale pro cabeçalho (nome/dia/data/
   hora/fuso/cidade + regentes do Dia/Hora): `montarCabecalhoMandalaHTML`
   também mora em tabelaTecnica.js, cópia idêntica do que a própria
   Mandala mostra — o astrólogo foi claro que esse cabeçalho tem que ser
   padrão em todo canto que o mostra, nunca uma versão parecida criada à
   parte, e ter uma função só evita exatamente esse risco. */

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
   metade de cima com o glifo do aspecto quando existe um aspecto maior).
   "estiloExtra" (opcional) é colado no final do style= do <svg> raiz —
   usado só pela versão responsiva (mais abaixo) pra encolher via CSS puro
   sem mexer em nada do que o Painel Técnico já espera daqui. */
function montarSVGMatrizVisibilidade(colunas, posicoes, estiloExtra) {
  const N = colunas.length;
  const C = MATRIZ_CELULA_TAM;
  const total = (N + 1) * C;

  let svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" style="display: block; font-family: 'Montserrat', sans-serif;${estiloExtra || ''}">`;
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

/* As colunas/linhas da Matriz (cada ponto/planeta/lote/ângulo) e a
   posição absoluta (0-360°) de cada um — cálculo único, compartilhado
   pelas duas formas de mostrar a Matriz abaixo. Igual ao que existia
   direto dentro do renderMatrizVisibilidadeHTML antigo, só que extraído
   pra função própria pra não duplicar quando a versão responsiva
   apareceu. */
function calcularDadosMatrizVisibilidade(data) {
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

  return { colunas, posicoes };
}

/* ÚNICA forma de mostrar a Matriz hoje — só no lugar da Mandala
   (toggleMatrizVisibilidadeNaMandala, mais abaixo). Antes existia
   também uma versão embutida no Painel Técnico, com uma caixinha própria
   (matrizOuterScroll/matrizScaleBox/matrizVisibilidadeWrapper) de
   tamanho calculado em JS que bloqueava o zoom nativo do navegador
   (touch-action: pan-y) de propósito, pra rodar um zoom "por conta
   própria" só ali dentro — isso vinha desde a época em que a Matriz era
   uma <table> HTML, que não encolhe sozinha só com CSS (como uma imagem
   encolhe). Era exatamente essa caixinha (com fundo próprio, sempre do
   mesmo tamanho) que fazia o conteúdo ampliado ficar escondido atrás de
   uma margem ao redor dela quando o astrólogo dava zoom — reportado
   várias vezes, nunca resolvido, porque nunca era essa caixinha que
   mudava, só a tabela por dentro dela. Removida de vez do Painel
   Técnico (a pedido do astrólogo, pra não ter a Matriz duplicada em
   dois lugares diferentes) — agora só existe esta versão, que se
   comporta exatamente como a imagem da Mandala (mandalaImg, mandala.js):
   nenhuma caixinha, nenhum cálculo — só max-width/height por CSS
   (encolhe se não couber, nunca estica além do tamanho natural) e o
   zoom nativo da PÁGINA (pinça do navegador, já liberado no <meta
   viewport> deste site, ver o comentário de "[onclick] { touch-action:
   manipulation }" no index.html) cuidando de ampliar e rolar — do jeito
   que já funciona em todo canto deste app fora daqui. Sem competir com
   o zoom nativo, não tem "dança" nem margem escondendo nada: o que sai
   da vista, sai rolando a PÁGINA de verdade, não ficando preso atrás de
   uma caixa.

   `montarCabecalhoMandalaHTML` (o cabeçalho colado embaixo da grade)
   mora em tabelaTecnica.js, não aqui — é a MESMA função que o Painel
   Técnico também usa, cópia idêntica do cabeçalho de verdade da
   Mandala; ver o comentário dela lá pra entender por quê. */
function renderMatrizVisibilidadeResponsivaHTML(data) {
  const { colunas, posicoes } = calcularDadosMatrizVisibilidade(data);
  const svgMatriz = montarSVGMatrizVisibilidade(
    colunas,
    posicoes,
    ' display: inline-block; max-width: 100%; height: auto; border: 2px solid var(--table-border); border-radius: 12px; overflow: hidden;'
  );

  return `
    <h3 style="text-align: center; font-family: 'Cinzel', serif; color: var(--primary-blue); font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; font-weight: 800;">Matriz de Visibilidade (Theoria)</h3>
    <div id="matrizVisibilidadeResponsivaRoot" style="text-align: center;">
      ${svgMatriz}
    </div>
    ${montarCabecalhoMandalaHTML(data)}
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
   separada, pergunta direto pro DOM (existe #matrizVisibilidadeResponsivaRoot
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
  const jaMostrandoMatriz = !!document.getElementById('matrizVisibilidadeResponsivaRoot');

  if (jaMostrandoMatriz) {
    if (botao) botao.classList.remove('matriz-visibilidade-ativa');
    if (typeof renderMandala === 'function') renderMandala();
  } else {
    if (botao) botao.classList.add('matriz-visibilidade-ativa');
    container.innerHTML = `
      <div style="width: 100%; box-sizing: border-box; padding: 70px 16px 24px 16px;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
          <button onclick="capturarMatrizVisibilidadeMandalaParaRelatorio()" title="Adiciona esta tela como um bloco no Relatório" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif;">
            <i class="fa-solid fa-file-circle-plus"></i> Adicionar ao Relatório
          </button>
        </div>
        <div id="matrizVisibilidadeMandalaContainer">
          ${renderMatrizVisibilidadeResponsivaHTML(currentCalculatedData)}
        </div>
      </div>
    `;
  }
}
window.toggleMatrizVisibilidadeNaMandala = toggleMatrizVisibilidadeNaMandala;

/* Captura a Matriz de Visibilidade (só quando está no lugar da Mandala)
   pro Relatório, com html2canvas — igual ao padrão já usado em
   capturarPainelTecnicoParaRelatorio (tabelaTecnica.js) e
   capturarMandalaAtualParaRelatorio (mandala.js). Mais simples que a do
   Painel Técnico: aquela precisa desfazer/refazer um transform:scale
   antes/depois de capturar (bug conhecido do html2canvas com
   overflow:auto + transform:scale juntos) — aqui não existe transform
   nenhum pra desfazer (ver renderMatrizVisibilidadeResponsivaHTML), só
   captura direto. */
async function capturarMatrizVisibilidadeMandalaParaRelatorio() {
  const elemento = document.getElementById('matrizVisibilidadeMandalaContainer');
  if (!elemento) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }

  try {
    const modoEscuroCaptura = document.documentElement.classList.contains('tema-escuro');
    const canvas = await html2canvas(elemento, { backgroundColor: modoEscuroCaptura ? '#1c1917' : '#fffdf5', scale: 2, useCORS: true });
    const total = adicionarCapturaRelatorio('matriz_visibilidade_mandala', canvas.toDataURL('image/png'));
    alert(`"Matriz de Visibilidade" foi adicionada ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar Matriz de Visibilidade ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarMatrizVisibilidadeMandalaParaRelatorio = capturarMatrizVisibilidadeMandalaParaRelatorio;
