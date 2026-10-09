/* ==========================================
   MÓDULO DE ISOPSEFIA HELENÍSTICA
   ========================================== */

const ZODIACO_ISOPSEFIA = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const SIGN_ELEMENTS_ISO = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];

const MONOLINE_ZODIAC_SVGS_ISO = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,52V12c0,0,0-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" points="52,53 57,58 52,63 "></polyline>`,
  `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="1" y1="28" x2="36" y2="63"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
  `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="7" y1="32" x2="57" y2="32"></line>`
];

function getSignSvgHtmlIso(signIdx, size = 20) {
  if (signIdx < 0 || signIdx > 11) return '-';
  const color = corElementoSigno(signIdx); // cor do elemento: papiro.js (fonte única)
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; display: inline-block; vertical-align: middle;">${MONOLINE_ZODIAC_SVGS_ISO[signIdx]}</svg>`;
}

const MAPA_FONETICO_ISO = {
  'a': { grego: 'α', nome: 'Alpha', valor: 1 },
  'á': { grego: 'α', nome: 'Alpha', valor: 1 },
  'â': { grego: 'α', nome: 'Alpha', valor: 1 },
  'ã': { grego: 'α', nome: 'Alpha', valor: 1 },
  'à': { grego: 'α', nome: 'Alpha', valor: 1 },
  'b': { grego: 'β', nome: 'Beta', valor: 2 },
  'v': { grego: 'β', nome: 'Beta', valor: 2 },
  'g': { grego: 'γ', nome: 'Gamma', valor: 3 },
  'j': { grego: 'γ', nome: 'Gamma', valor: 3 },
  'd': { grego: 'δ', nome: 'Delta', valor: 4 },
  'e': { grego: 'ε', nome: 'Epsilon', valor: 5 },
  'é': { grego: 'ε', nome: 'Epsilon', valor: 5 },
  'ê': { grego: 'ε', nome: 'Epsilon', valor: 5 },
  'z': { grego: 'ζ', nome: 'Zeta', valor: 7 },
  'h': { grego: 'η', nome: 'Eta', valor: 8 },
  'i': { grego: 'ι', nome: 'Iota', valor: 10 },
  'í': { grego: 'ι', nome: 'Iota', valor: 10 },
  'y': { grego: 'ι', nome: 'Iota', valor: 10 },
  'k': { grego: 'κ', nome: 'Kappa', valor: 20 },
  'c': { grego: 'κ', nome: 'Kappa', valor: 20 },
  'q': { grego: 'κ', nome: 'Kappa', valor: 20 },
  'l': { grego: 'λ', nome: 'Lambda', valor: 30 },
  'm': { grego: 'μ', nome: 'Mu', valor: 40 },
  'n': { grego: 'ν', nome: 'Nu', valor: 50 },
  'x': { grego: 'ξ', nome: 'Xi', valor: 60 },
  'o': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'ó': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'ô': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'õ': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'p': { grego: 'π', nome: 'Pi', valor: 80 },
  'r': { grego: 'ρ', nome: 'Rho', valor: 100 },
  's': { grego: 'σ', nome: 'Sigma', valor: 200 },
  'ç': { grego: 'σ', nome: 'Sigma', valor: 200 },
  't': { grego: 'τ', nome: 'Tau', valor: 300 },
  'u': { grego: 'υ', nome: 'Upsilon', valor: 400 },
  'ú': { grego: 'υ', nome: 'Upsilon', valor: 400 },
  'û': { grego: 'υ', nome: 'Upsilon', valor: 400 },
  'f': { grego: 'φ', nome: 'Phi', valor: 500 },
  'w': { grego: 'ω', nome: 'Omega', valor: 800 }
};

const DIGRAMAS_ISO = {
  'th': { grego: 'θ', nome: 'Theta', valor: 9 },
  'ph': { grego: 'φ', nome: 'Phi', valor: 500 },
  'ps': { grego: 'ψ', nome: 'Psi', valor: 700 },
  'ch': { grego: 'χ', nome: 'Chi', valor: 600 }
};

let isoState = {
  activeTab: "planilha",
  rows: [],
  novoTermo: "",
  singleInput: ""
};

function obterAscendenteIdxMandala() {
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && currentCalculatedData.Ascendente) {
    const absDeg = currentCalculatedData.Ascendente.grau_absoluto;
    return Math.floor(absDeg / 30);
  }
  return 0;
}

function calcularIsopsefiaData(texto) {
  if (!texto) return { bruto: 0, resto: 0, grego: '', passos: [], divisaoInteira: 0 };
  const normalizado = texto.toLowerCase();
  const passos = [];
  let i = 0, bruto = 0, stringGrega = '';

  while (i < normalizado.length) {
    const charAtual = normalizado[i];
    const proximoChar = normalizado[i + 1] || '';
    const par = charAtual + proximoChar;

    if (DIGRAMAS_ISO[par]) {
      const match = DIGRAMAS_ISO[par];
      bruto += match.valor;
      stringGrega += match.grego;
      passos.push({ letra: par.toUpperCase(), grego: match.grego, nome: match.nome, valor: match.valor });
      i += 2;
    } else if (MAPA_FONETICO_ISO[charAtual]) {
      const match = MAPA_FONETICO_ISO[charAtual];
      bruto += match.valor;
      stringGrega += match.grego;
      passos.push({ letra: charAtual.toUpperCase(), grego: match.grego, nome: match.nome, valor: match.valor });
      i++;
    } else {
      if (charAtual !== ' ') {
        passos.push({ letra: charAtual.toUpperCase(), grego: '?', nome: 'Desconhecido', valor: 0 });
      }
      i++;
    }
  }

  const divisaoInteira = Math.floor(bruto / 12);
  let resto = bruto % 12;
  if (resto === 0 && bruto > 0) resto = 12;

  return { bruto, resto, grego: stringGrega, passos, divisaoInteira };
}

function obterAtivacaoAstrologica(resto, ascIdx) {
  if (resto === 0) return { casa: '-', signIdx: -1 };
  const indexSigno = (ascIdx + resto - 1) % 12;
  return { casa: resto, signIdx: indexSigno };
}

/* FUNÇÃO CHAMADA PELO SUPABASE.JS AO CLICAR NO MENU */
function iniciarModuloIsopsefia() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--danger); font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar a Isopsefia.</div>`;
    return;
  }

  renderIsopsefiaUI(container);
}

function renderIsopsefiaUI(container) {
  const svgGaleria = '<svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  const svgRelatorio = '<svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';
  const aba = (id, rotulo) => `<button type="button" class="folder-tab-btn${isoState.activeTab === id ? ' active' : ''}" onclick="mudarAbaIsopsefia('${id}')">${rotulo}</button>`;

  container.innerHTML = `
    <div style="width: 100%;">
    <div id="isopsefia-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">

      <div class="cabeca-ferramenta">
        <h3 class="titulo-ferramenta">Isopsefia Helenística</h3>
        <div class="acoes-ferramenta">
          <button type="button" class="botao-icone" onclick="salvarIsopsefiaNaGaleria()" title="Salvar a Isopsefia como imagem na galeria (com título e cabeçalho)">${svgGaleria}</button>
          <button type="button" class="botao-icone" onclick="capturarIsopsefiaParaRelatorio()" title="Adicionar ao Relatório (sem cabeçalho)">${svgRelatorio}</button>
        </div>
      </div>

      <!-- CABEÇALHO PADRÃO (função global, o mesmo de todas as ferramentas) -->
      ${montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true })}

      <div class="iso-abas">
        ${aba('planilha', 'Planilha')}${aba('calculadora', 'Calculadora')}${aba('referencia', 'Referência')}
      </div>

      <hr class="divisa">

      <div id="isoTabContent">
        ${renderConteudoAbaAtual()}
      </div>

      <hr class="divisa">
    </div>
    </div>
  `;

  encolherTabelasIsoVisiveis(container);
}

/* ENCOLHE A TABELA DA PLANILHA QUANDO ELA É LARGA DEMAIS PARA CABER NA TELA
   (EM VEZ DE FICAR CORTADA), MESMA TÉCNICA USADA NOS DECÊNIOS, NO PAINEL
   TÉCNICO, NA PROFECÇÃO MENSAL E NA LIBERAÇÃO ZODIACAL. Como a tabela usa
   width:100% para preencher o cartão no desktop, primeiro mede a largura
   "natural" sem essa restrição: se já coubesse do jeito de sempre, não mexe
   em nada (zero mudança visual em telas largas). */
function encolherTabelaLargaIso(table) {
  if (!table || table.dataset.isoScaled === '1') return;
  const parent = table.parentElement;
  if (!parent) return;

  const parentStyles = getComputedStyle(parent);
  const availableWidth = parent.clientWidth
    - parseFloat(parentStyles.paddingLeft || 0)
    - parseFloat(parentStyles.paddingRight || 0);
  if (availableWidth <= 0) return;

  const larguraOriginal = table.style.width;
  table.style.width = 'auto';
  const naturalWidth = table.offsetWidth;

  if (naturalWidth <= availableWidth) {
    table.style.width = larguraOriginal;
    return;
  }

  const naturalHeight = table.offsetHeight;
  const escala = availableWidth / naturalWidth;
  const scaledHeight = naturalHeight * escala;

  const outerScroll = document.createElement('div');
  outerScroll.style.textAlign = 'center';
  const scaleBox = document.createElement('div');
  scaleBox.style.display = 'inline-block';
  scaleBox.style.width = (naturalWidth * escala) + 'px';
  scaleBox.style.height = scaledHeight + 'px';

  table.parentNode.insertBefore(outerScroll, table);
  outerScroll.appendChild(scaleBox);
  scaleBox.appendChild(table);

  table.style.transformOrigin = 'top left';
  table.style.transform = `scale(${escala})`;
  table.dataset.isoScaled = '1';
  // Contorna uma peculiaridade do navegador: um contêiner ao redor de uma
  // <table> transformada pode calcular a própria altura com base no
  // tamanho ANTES da escala, sobrando um espaço vazio grande abaixo dela.
  outerScroll.style.height = scaledHeight + 'px';
}

function encolherTabelasIsoVisiveis(root) {
  if (!root) return;
  root.querySelectorAll('table:not([data-iso-scaled="1"])').forEach(t => {
    if (t.offsetParent !== null) encolherTabelaLargaIso(t);
  });
}

function renderConteudoAbaAtual() {
  const ascIdx = obterAscendenteIdxMandala();

  if (isoState.activeTab === 'planilha') {
    return `
      <div data-html2canvas-ignore="true" class="iso-linha-adicionar">
        <input type="text" id="isoNovoInput" class="iso-campo" placeholder="Digite o nome..." onkeypress="if(event.key==='Enter') adicionarTermoPlanilha()">
        <button type="button" class="botao-texto" onclick="adicionarTermoPlanilha()">Adicionar</button>
      </div>

      <hr class="divisa">

      <div class="envolve-tabela">
        <table class="tabela-epoca">
          <thead>
            <tr>
              <th>Termo / Nome</th>
              <th>Transliteração Grega</th>
              <th style="text-align: right;">Soma Bruta</th>
              <th class="centro">Fórmula do Resto</th>
              <th class="centro">Topos (Resto)</th>
              <th class="iso-col-glifo">Signo Ativado</th>
              <th class="centro" data-html2canvas-ignore="true">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${isoState.rows.length === 0 ? `
              <tr><td colspan="7" class="centro iso-vazio">Nenhum termo na planilha. Digite acima para começar.</td></tr>
            ` : isoState.rows.map((r, idx) => {
              const calc = calcularIsopsefiaData(r);
              const ativ = obterAtivacaoAstrologica(calc.resto, ascIdx);
              return `
                <tr>
                  <td class="iso-nome">${escapeHtml(r)}</td>
                  <td class="iso-grego">${calc.grego || '-'}</td>
                  <td style="text-align: right; font-weight: 700;">${calc.bruto}</td>
                  <td class="centro iso-mono">${calc.bruto} - (12 × ${calc.divisaoInteira}) = <strong>${calc.resto}</strong></td>
                  <td class="centro">${calc.resto > 0 ? calc.resto + 'º Topos' : '-'}</td>
                  <td class="iso-col-glifo">${signoComNome(getSignSvgHtmlIso(ativ.signIdx, 22), ativ.signIdx)}</td>
                  <td class="centro" data-html2canvas-ignore="true"><button type="button" class="botao-texto" onclick="removerTermoPlanilha(${idx})">Excluir</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (isoState.activeTab === 'calculadora') {
    const calc = calcularIsopsefiaData(isoState.singleInput);
    const ativ = obterAtivacaoAstrologica(calc.resto, ascIdx);
    return `
      <div class="iso-duas-colunas">
        <div class="iso-coluna-larga">
          <div class="rotulo">Digite o nome para decomposição detalhada</div>
          <input type="text" class="iso-campo" value="${escapeHtml(isoState.singleInput)}" oninput="atualizarSingleInput(this.value)" placeholder="Ex: Alexandros">

          <div class="rotulo" style="margin-top: 16px;">Decomposição letra por letra</div>
          ${calc.passos.length === 0 ? '<div class="iso-vazio">Digite um nome para ver a análise.</div>' : calc.passos.map(p => `
            <div class="iso-passo">
              <div><strong>${p.letra}</strong> → <span class="iso-grego">${p.grego}</span> <small>(${p.nome})</small></div>
              <div class="iso-mono"><strong>+ ${p.valor}</strong></div>
            </div>
          `).join('')}
        </div>

        <div class="iso-coluna-estreita">
          <div class="cartao iso-resultado">
            <div class="rotulo">Palavra em grego</div>
            <div class="iso-grego iso-grego-grande">${calc.grego || '-'}</div>
            <div class="iso-soma-resto">
              <div><div class="rotulo">Soma</div><strong>${calc.bruto}</strong></div>
              <div><div class="rotulo">Resto</div><strong class="iso-grego">${calc.resto}</strong></div>
            </div>
          </div>

          <hr class="divisa">

          <div class="iso-passo"><span class="rotulo">Ascendente</span>${signoComNome(getSignSvgHtmlIso(ascIdx, 20), ascIdx)}</div>
          <div class="iso-passo"><span class="rotulo">Topos ativado</span><strong>${calc.resto > 0 ? calc.resto + 'º Topos' : '-'}</strong></div>
          <div class="iso-passo"><span class="rotulo">Signo ativado</span>${signoComNome(getSignSvgHtmlIso(ativ.signIdx, 20), ativ.signIdx)}</div>
        </div>
      </div>
    `;
  }

  if (isoState.activeTab === 'referencia') {
    return `
      <div class="iso-grade-letras">
        ${Object.entries(MAPA_FONETICO_ISO).reduce((acc, [latino, dados]) => {
          if (!acc.find(item => item.grego === dados.grego)) acc.push({ ...dados, latino: latino.toUpperCase() });
          return acc;
        }, []).map(item => `
          <div class="cartao iso-letra">
            <div>
              <strong>${item.latino}</strong>
              <div class="iso-grego">${item.grego}</div>
              <small>${item.nome}</small>
            </div>
            <div class="iso-mono"><strong>${item.valor}</strong></div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/* EVENTOS E INTERAÇÕES DA ISOPSEFIA */
function mudarAbaIsopsefia(aba) {
  isoState.activeTab = aba;
  iniciarModuloIsopsefia();
}

function adicionarTermoPlanilha() {
  const input = document.getElementById('isoNovoInput');
  if (!input || !input.value.trim()) return;
  isoState.rows.push(input.value.trim());
  iniciarModuloIsopsefia();
}

function removerTermoPlanilha(idx) {
  isoState.rows.splice(idx, 1);
  iniciarModuloIsopsefia();
}

function atualizarSingleInput(val) {
  isoState.singleInput = val;
  const content = document.getElementById('isoTabContent');
  if (content) {
    content.innerHTML = renderConteudoAbaAtual();
    encolherTabelasIsoVisiveis(content);
  }
}


/* IMAGENS DA ISOPSEFIA (aba aberta). Galeria: título + cabeçalho padrão + conteúdo.
   Relatório: só o conteúdo. Só ao tocar nos botões. Campos de digitar, "Adicionar"
   e "Excluir" ficam de fora (data-html2canvas-ignore). */
function salvarIsopsefiaNaGaleria() {
  const area = document.getElementById('isoTabContent');
  if (!area) return;
  capturarESalvarNaGaleria(
    () => gerarImagemHtmlComCabecalho(area, { titulo: 'ISOPSEFIA HELENÍSTICA', comCabecalho: true, papiro: true }),
    `Astro_Hellenic_Isopsefia_${((typeof currentSubjectName !== 'undefined' && currentSubjectName) || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
window.salvarIsopsefiaNaGaleria = salvarIsopsefiaNaGaleria;

async function capturarIsopsefiaParaRelatorio() {
  const area = document.getElementById('isoTabContent');
  if (!area) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  try {
    const fundo = window.temaMandala === 'ceu' ? null : (document.documentElement.classList.contains('tema-escuro') ? '#1c1917' : fundoPainelClaro()); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('isopsefia', canvas.toDataURL('image/png'));
    alert(`"Isopsefia" foi adicionada ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar a Isopsefia ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarIsopsefiaParaRelatorio = capturarIsopsefiaParaRelatorio;
