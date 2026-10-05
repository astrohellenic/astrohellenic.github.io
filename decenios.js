/* ==========================================
   MÓDULO DE DECÊNIOS HELENÍSTICOS (AUTOMAÇÃO)
   ========================================== */

const ZODIACO_DECENIOS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const PLANETS_DECENIOS = [
  { id: 'Sun', name: 'Sol', minorYears: 19, days: 570 },
  { id: 'Moon', name: 'Lua', minorYears: 25, days: 750 },
  { id: 'Mercury', name: 'Mercúrio', minorYears: 20, days: 600 },
  { id: 'Venus', name: 'Vênus', minorYears: 8, days: 240 },
  { id: 'Mars', name: 'Marte', minorYears: 15, days: 450 },
  { id: 'Jupiter', name: 'Júpiter', minorYears: 12, days: 360 },
  { id: 'Saturn', name: 'Saturno', minorYears: 30, days: 900 }
];

const SIGN_ELEMENTS_DEC = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
const ELEMENT_SIGN_COLORS_DEC = { fire: "var(--laranja)", earth: "var(--marrom)", air: "var(--cinza)", water: "var(--azul-egipcio-claro)" }; // paleta de época (temas.css): iguais em todos os temas

const MONOLINE_ZODIAC_SVGS_DEC = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,52V12c0,0,0-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" stroke-miterlimit="10" points="52,53 57,58 52,63 "></polyline>`,
  `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="1" y1="28" x2="36" y2="63"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
  `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="7" y1="32" x2="57" y2="32"></line>`
];

function getSignSvgHtmlDec(signIdx, size = 18) {
  const elem = SIGN_ELEMENTS_DEC[signIdx];
  const color = ELEMENT_SIGN_COLORS_DEC[elem];
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; overflow: visible; display: inline-block; vertical-align: middle; flex-shrink: 0; margin: 0 2px;" title="${ZODIACO_DECENIOS[signIdx]}">${MONOLINE_ZODIAC_SVGS_DEC[signIdx]}</svg>`;
}

function getPlanet3DSVG(planetId, size = 34) {
  return (typeof getIconeSVG === 'function') ? getIconeSVG('planeta', planetId, size || 34) : '';
}

let overrideStartPlanet = null;
let expandedL3KeyDec = null; // Guarda a chave do L3 (regência diária) expandido, ex.: "0_2" ou "active_1"

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS */
function iniciarModuloDecenios() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar os Decênios.</div>`;
    return;
  }

  renderDeceniosUI(container);
}

function renderDeceniosUI(container) {
  const data = currentCalculatedData;
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const sunAbs = data.Sol ? data.Sol.grau_absoluto : 0;
  const moonAbs = data.Lua ? data.Lua.grau_absoluto : 0;

  // DETECTA A SEITA AUTOMATICAMENTE
  const isDay = ((sunAbs - ascAbs + 360) % 360) >= 180;
  const detectedStartPlanet = isDay ? 'Sun' : 'Moon';
  const startPlanetKey = overrideStartPlanet || detectedStartPlanet;

  // AVISO: LUZ (DA SEITA) EM CASA NÃO-OPERANTE — sempre com base na luz
  // detectada automaticamente pela seita, não no override manual do usuário
  const luzAbs = isDay ? sunAbs : moonAbs;
  const signoASC = Math.floor(ascAbs / 30);
  const signoLuz = Math.floor(luzAbs / 30);
  const casaLuz = ((signoLuz - signoASC + 12) % 12) + 1;
  const CASAS_NAO_OPERANTES_DEC = [2, 6, 8, 12];
  const luzEmCasaNaoOperante = CASAS_NAO_OPERANTES_DEC.includes(casaLuz);
  const nomeLuzDec = isDay ? 'Sol' : 'Lua';

  // PROCESSA O CÁLCULO INSTANTANEAMENTE
  const result = calcularDeceniosAutomatico(startPlanetKey);

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const headerTitle = currentSubjectName;


  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: flex-end; align-items: flex-start; gap: 6px; padding: 12px 20px 0;">
        ${luzEmCasaNaoOperante ? `
          <div class="aviso-icone" title="${nomeLuzDec} em casa não-operante (casa ${casaLuz}) - considere selecionar outro planeta manualmente">
            <svg class="icone" viewBox="0 0 64 64" style="width: 22px; height: 22px;"><path d="M32 8 L58 54 H6 Z"/><line x1="32" y1="26" x2="32" y2="40"/><line x1="32" y1="47" x2="32" y2="47.5"/></svg>
          </div>
        ` : ''}
        <div style="position: relative; display: inline-block;">
          <button type="button" onclick="const menu=document.getElementById('decStartPlanetMenu'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" class="botao-icone" title="Planeta Inicial">
            ${getPlanet3DSVG(startPlanetKey, 26)}
          </button>
          <div id="decStartPlanetMenu" class="menu-flutuante" style="display: none; position: absolute; top: 40px; right: 0; z-index: 9999; width: 38px; box-sizing: border-box;">
            <div onclick="alternarSeitaManual('Sun')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Sun', 24)}</div>
            <div onclick="alternarSeitaManual('Moon')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Moon', 24)}</div>
            <div onclick="alternarSeitaManual('Mercury')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Mercury', 24)}</div>
            <div onclick="alternarSeitaManual('Venus')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Venus', 24)}</div>
            <div onclick="alternarSeitaManual('Mars')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Mars', 24)}</div>
            <div onclick="alternarSeitaManual('Jupiter')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Jupiter', 24)}</div>
            <div onclick="alternarSeitaManual('Saturn')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getPlanet3DSVG('Saturn', 24)}</div>
          </div>
        </div>
        <button type="button" onclick="salvarDeceniosNaGaleria()" title="Salvar os Decênios como imagem na galeria (com título e cabeçalho)" class="botao-icone">
          <svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
        </button>
        <button type="button" onclick="capturarDeceniosParaRelatorio()" title="Adicionar ao Relatório (sem cabeçalho)" class="botao-icone">
          <svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
        </button>
      </div>
    <div id="decenios-container" class="painel" style="width: 100%; flex: 1; overflow-y: auto; font-family: 'Montserrat', sans-serif;">

      <h3 class="titulo-ferramenta">Decênios Helenísticos</h3>

      <!-- CABEÇALHO PADRÃO (o mesmo de todas as ferramentas). O seletor do planeta inicial fica na barra de botões acima. -->
      ${montarCabecalhoMandalaImagemHTML(data, null, { tintaSobreFolha: true })}

      <!-- EXIBIÇÃO DOS RESULTADOS DOS DECÊNIOS -->
      <div id="decennialsResultsArea">
        ${renderizarResultadosHTML(result)}
      </div>

    </div>
    </div>
  `;

  encolherTabelasDecVisiveis(container);
}

/* Botão de galeria: título + cabeçalho padrão + resultados, SÓ AO TOCAR (ver
   capturarESalvarNaGaleria e gerarImagemHtmlComCabecalho, mandala.js). */
function salvarDeceniosNaGaleria() {
  const area = document.getElementById('decennialsResultsArea');
  if (!area) return;
  capturarESalvarNaGaleria(
    () => gerarImagemHtmlComCabecalho(area, { titulo: 'DECÊNIOS HELENÍSTICOS', comCabecalho: true, papiro: true }),
    `Astro_Hellenic_Decenios_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
window.salvarDeceniosNaGaleria = salvarDeceniosNaGaleria;

/* Manda pro Relatório SÓ os resultados (sem título nem cabeçalho). */
async function capturarDeceniosParaRelatorio() {
  const area = document.getElementById('decennialsResultsArea');
  if (!area) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  try {
    const papiro = window.temaMandala === 'ceu';
    const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : '#fffdf5'); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('decenios', canvas.toDataURL('image/png'));
    alert(`"Decênios Helenísticos" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar os Decênios ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarDeceniosParaRelatorio = capturarDeceniosParaRelatorio;

/* ENCOLHE TABELAS LARGAS DEMAIS PARA CABEREM NA TELA (SEM CORTE), EM VEZ DE
   FICAREM TRAVADAS/CORTADAS EM TELAS ESTREITAS — mesma técnica usada no
   Painel Técnico. Em telas largas, onde as tabelas já cabem, não faz nada. */
function encolherTabelaLargaDec(tableEl) {
  if (!tableEl || tableEl.dataset.autoScaledDec === '1') return;
  const parent = tableEl.parentElement;
  if (!parent) return;

  const parentStyles = getComputedStyle(parent);
  const availableWidth = parent.clientWidth
    - parseFloat(parentStyles.paddingLeft || 0)
    - parseFloat(parentStyles.paddingRight || 0);
  const naturalWidth = tableEl.offsetWidth;
  if (!availableWidth || !naturalWidth || naturalWidth <= availableWidth) return;

  const naturalHeight = tableEl.offsetHeight;
  const escala = availableWidth / naturalWidth;
  const scaledHeight = naturalHeight * escala;

  const outerScroll = document.createElement('div');
  outerScroll.style.overflow = 'hidden';
  outerScroll.style.textAlign = 'center';
  const scaleBox = document.createElement('div');
  scaleBox.style.display = 'inline-block';

  parent.insertBefore(outerScroll, tableEl);
  outerScroll.appendChild(scaleBox);
  scaleBox.appendChild(tableEl);

  tableEl.style.transformOrigin = 'top left';
  tableEl.style.transform = `scale(${escala})`;
  tableEl.dataset.autoScaledDec = '1';

  scaleBox.style.width = (naturalWidth * escala) + 'px';
  scaleBox.style.height = scaledHeight + 'px';
  // Contorna uma peculiaridade do navegador: um contêiner com overflow ao
  // redor de uma <table> transformada calcula a própria altura com base no
  // tamanho ANTES da escala, sobrando espaço vazio — por isso também
  // fixamos a altura dele aqui.
  outerScroll.style.height = scaledHeight + 'px';
}

function encolherTabelasDecVisiveis(root) {
  if (!root) return;
  root.querySelectorAll('table:not([data-auto-scaled-dec="1"])').forEach(t => {
    if (t.offsetParent !== null) encolherTabelaLargaDec(t);
  });
}

/* Quando uma tabela já encolhida (ver encolherTabelaLargaDec) tem uma linha
   interna aberta/fechada (ex.: o accordion do L3), sua altura real muda,
   mas o wrapper que a envolve ficou com a altura fixa medida antes disso —
   sem este ajuste, o conteúdo novo fica cortado (só é visível no celular,
   que é onde a tabela chega a ser encolhida). */
function ajustarAlturaWrapperEscaladoDec(elDentroDaTabela) {
  const tableEl = elDentroDaTabela && elDentroDaTabela.closest
    ? elDentroDaTabela.closest('table[data-auto-scaled-dec="1"]')
    : null;
  if (!tableEl) return;

  const scaleBox = tableEl.parentElement;
  const outerScroll = scaleBox && scaleBox.parentElement;
  if (!scaleBox || !outerScroll) return;

  const match = /scale\(([^)]+)\)/.exec(tableEl.style.transform);
  const escala = match ? parseFloat(match[1]) : 1;
  const scaledHeight = tableEl.offsetHeight * escala;

  scaleBox.style.height = scaledHeight + 'px';
  outerScroll.style.height = scaledHeight + 'px';
}

function alternarSeitaManual(val) {
  overrideStartPlanet = val;
  iniciarModuloDecenios();
}

function calcularDeceniosAutomatico(startPlanetId) {
  const data = currentCalculatedData;
  const birthDateTime = new Date(currentMoment);

  const planetKeys = {
    Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio',
    Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno'
  };

  const planetChart = PLANETS_DECENIOS.map((p, originalIndex) => {
    const key = planetKeys[p.id];
    const item = data[key];
    const absDeg = item ? item.grau_absoluto : 0;
    const signIdx = Math.floor(absDeg / 30);
    const degInSign = Math.floor(absDeg % 30);
    const minInSign = Math.round((absDeg % 1) * 60);

    return { ...p, signIdx, degree: degInSign, minute: minInSign, absDeg, originalIndex };
  });

  const startPlanet = planetChart.find(p => p.id === startPlanetId);
  const startAbsDeg = startPlanet ? startPlanet.absDeg : 0;

  const sortedPlanets = [...planetChart].sort((a, b) => {
    const distA = (a.absDeg - startAbsDeg + 360) % 360;
    const distB = (b.absDeg - startAbsDeg + 360) % 360;
    if (Math.abs(distA - distB) < 0.00001) return a.originalIndex - b.originalIndex;
    return distA - distB;
  });

  const today = new Date();
  let currentPointer = new Date(birthDateTime);
  const timelineL1 = [];
  let activeL1 = null;
  let activeL2 = null;

  for (let i = 0; i < 10; i++) {
    const l1Planet = sortedPlanets[i % 7];
    const l1Start = new Date(currentPointer);
    const l1End = addDaysDec(l1Start, 3870);

    const l1IndexInSorted = sortedPlanets.findIndex(p => p.id === l1Planet.id);
    const l2PlanetSequence = [];
    for (let k = 0; k < 7; k++) {
      l2PlanetSequence.push(sortedPlanets[(l1IndexInSorted + k) % 7]);
    }

    let l2Pointer = new Date(l1Start);
    const l2Subperiods = [];

    l2PlanetSequence.forEach(l2Planet => {
      const l2Start = new Date(l2Pointer);
      const l2Days = l2Planet.days;
      const l2End = addDaysDec(l2Start, l2Days);
      const isL2Active = (today >= l2Start && today < l2End);

      const l2Obj = {
        planet: l2Planet,
        startDate: l2Start,
        endDate: l2End,
        days: l2Days,
        months: l2Planet.minorYears,
        isActive: isL2Active
      };

      l2Subperiods.push(l2Obj);
      if (isL2Active) activeL2 = l2Obj;
      l2Pointer = new Date(l2End);
    });

    const isL1Active = (today >= l1Start && today < l1End);
    const l1Obj = {
      cycleNumber: i + 1,
      planet: l1Planet,
      startDate: l1Start,
      endDate: l1End,
      subperiods: l2Subperiods,
      isActive: isL1Active
    };

    timelineL1.push(l1Obj);
    if (isL1Active) activeL1 = l1Obj;
    currentPointer = new Date(l1End);
  }

  return { activeL1, activeL2, timelineL1, sortedPlanets };
}

function addDaysDec(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateDec(date) {
  if (!date) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// FORMATAÇÃO COM DATA E HORÁRIO EMPILHADOS PARA O L3 (REGÊNCIA DIÁRIA)
function formatDateHoraDec(date) {
  if (!date) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}<br><span style="font-size: 9px; opacity: 0.8; font-weight: 500;">${hh}:${mm}h</span>`;
}

function formatDiasDec(dias) {
  const rounded = Math.round(dias * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

// CÁLCULO DOS SUBPERÍODOS DO L3 (REGÊNCIA DIÁRIA) - mesma lógica recursiva do L1→L2, aplicada mais uma vez
// Dentro do bloco de L2 do planeta P (l2Days dias), subdivide entre os 7 planetas na ordem zodiacal
// da carta, começando por P: diasDeQ = (minorYears de Q / 129) * l2Days (Valens, sem arredondar)
function calcularSubperiodosL3Dec(l2Planet, l2Start, l2Days, sortedPlanets) {
  const l2IndexInSorted = sortedPlanets.findIndex(p => p.id === l2Planet.id);
  const l3PlanetSequence = [];
  for (let k = 0; k < 7; k++) {
    l3PlanetSequence.push(sortedPlanets[(l2IndexInSorted + k) % 7]);
  }

  const subperiodos = [];
  let pointer = new Date(l2Start);

  l3PlanetSequence.forEach(planet => {
    const dias = (planet.minorYears / 129) * l2Days;
    const start = new Date(pointer);
    const end = new Date(start.getTime() + dias * 24 * 60 * 60 * 1000);

    subperiodos.push({
      planet,
      days: dias,
      startDate: start,
      endDate: end
    });

    pointer = new Date(end);
  });

  return subperiodos;
}

function alternarL3AccordionDec(l1Idx, l2Idx, event) {
  if (event) event.stopPropagation();
  const key = `${l1Idx}_${l2Idx}`;
  const previousKey = expandedL3KeyDec;

  if (previousKey && previousKey !== key) {
    const prevSubRow = document.getElementById(`dec_l3_row_${previousKey}`);
    const prevMainRow = document.getElementById(`dec_l2_row_${previousKey}`);
    if (prevSubRow) prevSubRow.style.display = 'none';
    if (prevMainRow) prevMainRow.classList.remove('aberta');
    ajustarAlturaWrapperEscaladoDec(prevMainRow);
  }

  const subRow = document.getElementById(`dec_l3_row_${key}`);
  const mainRow = document.getElementById(`dec_l2_row_${key}`);
  if (!subRow || !mainRow) return;

  const willOpen = previousKey !== key;
  expandedL3KeyDec = willOpen ? key : null;

  subRow.style.display = willOpen ? 'table-row' : 'none';
  mainRow.classList.toggle('aberta', willOpen);

  if (willOpen) encolherTabelasDecVisiveis(subRow);
  ajustarAlturaWrapperEscaladoDec(mainRow);
}

// ABRE/FECHA O DETALHE DE UM L1 NA LINHA DO TEMPO (COM A TABELA DE L2 DENTRO)
function alternarDetalhesL1Dec(idx) {
  const el = document.getElementById(`dec_l1_details_${idx}`);
  if (!el) return;
  const willOpen = el.style.display === 'none';
  el.style.display = willOpen ? 'block' : 'none';
  if (willOpen) encolherTabelasDecVisiveis(el);
}

// RENDERIZA A SUB-TABELA DO NÍVEL 3 (ABERTA DENTRO DA CÉLULA COLSPAN DA LINHA DO NÍVEL 2)
function renderL3SubTableDec(l2Obj, sortedPlanets) {
  const subperiodosL3 = calcularSubperiodosL3Dec(l2Obj.planet, l2Obj.startDate, l2Obj.days, sortedPlanets);

  return `
    <table class="tabela-epoca">
      <thead>
        <tr><th class="centro">Nível 3</th><th>Duração</th><th>Início</th><th>Término</th></tr>
      </thead>
      <tbody>
        ${subperiodosL3.map(sub3 => `
          <tr>
            <td class="centro">${planetaComNome(sub3.planet.id, 26)}</td>
            <td><strong>${formatDiasDec(sub3.days)}</strong> dias</td>
            <td>${formatDateHoraDec(sub3.startDate)}</td>
            <td>${formatDateHoraDec(sub3.endDate)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// LINHAS DO NÍVEL 2 (cada uma com a linha escondida do Nível 3 logo abaixo). argsClique = argumentos de alternarL3AccordionDec.
function linhasNivel2Dec(subperiodos, prefixoChave, argsClique, tamIcone, sortedPlanets) {
  return subperiodos.map((sub, i) => {
    const chave = `${prefixoChave}_${i}`;
    return `
      <tr id="dec_l2_row_${chave}" class="clicavel${sub.isActive ? ' ativa' : ''}" onclick="alternarL3AccordionDec(${argsClique(i)}, event)">
        <td class="centro">${planetaComNome(sub.planet.id, tamIcone)}</td>
        <td>${sub.months} meses (${sub.days} dias)</td>
        <td>${formatDateDec(sub.startDate)}</td>
        <td>${formatDateDec(sub.endDate)}</td>
      </tr>
      <tr id="dec_l3_row_${chave}" style="display: none;">
        <td colspan="4" class="encaixe">
          ${renderL3SubTableDec(sub, sortedPlanets)}
        </td>
      </tr>
    `;
  }).join('');
}

function renderizarResultadosHTML(res) {
  const { activeL1, activeL2, timelineL1, sortedPlanets } = res;
  if (!activeL1 || !activeL2) {
    return `<div class="cartao texto-apagado" style="text-align: center; font-size: 13px;">A idade atual do nativo está fora da janela dos 10 primeiros ciclos de Decênios.</div>`;
  }

  const formatMin = m => String(m || 0).padStart(2, '0');
  const cabecaNivel2 = `<tr><th class="centro">Nível 2</th><th>Duração</th><th>Início</th><th>Término</th></tr>`;

  // Cartão pequeno do Nível 1 / Nível 2 do período ativo
  const cartaoNivel = (rotulo, nomeCurto, item, meses) => `
    <div class="cartao">
      <span class="rotulo">${rotulo}</span>
      <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${getPlanet3DSVG(item.planet.id, 42)}
          <div class="texto-apagado linha-glifo" style="font-size: 11px;">${nomePlaneta(item.planet.id) ? nomePlaneta(item.planet.id) + ' em' : 'em'} ${signoComNome(getSignSvgHtmlDec(item.planet.signIdx, 18), item.planet.signIdx)} ${item.planet.degree}°${formatMin(item.planet.minute)}'</div>
        </div>
        <span class="selo">${meses} meses</span>
      </div>
      <div class="linha-info">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Início do ${nomeCurto}:</span><strong>${formatDateDec(item.startDate)}</strong></div>
        <div style="display: flex; justify-content: space-between;"><span>Término do ${nomeCurto}:</span><strong>${formatDateDec(item.endDate)}</strong></div>
      </div>
    </div>
  `;

  return `
    <!-- PERÍODO ATIVO -->
    <div>
      <h3 class="titulo-secao">Período ativo</h3>

      <div class="grade-cartoes">
        ${cartaoNivel('Nível 1 - Regente da Era', 'Nível 1', activeL1, 129)}
        ${cartaoNivel('Nível 2 - Executor do Momento', 'Nível 2', activeL2, activeL2.months)}
      </div>

      <!-- TABELA DA ERA ATIVA -->
      <div class="cartao" style="margin-top: 14px;">
        <div class="cabeca-cartao">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getPlanet3DSVG(activeL1.planet.id, 28)}
            <span class="nome-nivel">Nível 1 ativo</span>
          </div>
          <strong class="texto-apagado" style="font-size: 11px;">${formatDateDec(activeL1.startDate)} a ${formatDateDec(activeL1.endDate)}</strong>
        </div>
        <div class="envolve-tabela">
          <table class="tabela-epoca">
            <thead>${cabecaNivel2}</thead>
            <tbody>
              ${linhasNivel2Dec(activeL1.subperiods, 'active', i => `'active', ${i}`, 32, sortedPlanets)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <hr class="divisa">

    <!-- CRONOGRAMA DA LINHA DO TEMPO -->
    <div>
      <div class="cabeca-cartao">
        <h3 class="titulo-secao" style="margin: 0;">Linha do tempo dos decênios</h3>
        <span class="texto-apagado" style="font-size: 11px;">Calendário egípcio: 360 dias por ano</span>
      </div>

      <div>
        ${timelineL1.map((l1, idx) => `
          <div class="cartao${l1.isActive ? ' ativo' : ''}" style="margin-bottom: 8px; padding: 0;">
            <div style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="alternarDetalhesL1Dec(${idx})">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${getPlanet3DSVG(l1.planet.id, 32)}
                <div>
                  <span class="nome-nivel">Nível 1${nomePlaneta(l1.planet.id) ? ' - ' + nomePlaneta(l1.planet.id) : ''}</span>
                  <div class="texto-apagado linha-glifo" style="font-size: 11px;">em ${signoComNome(getSignSvgHtmlDec(l1.planet.signIdx, 15), l1.planet.signIdx)} ${l1.planet.degree}°${formatMin(l1.planet.minute)}' - 129 meses</div>
                </div>
              </div>
              <strong class="texto-apagado" style="font-size: 11px;">${formatDateDec(l1.startDate)} a ${formatDateDec(l1.endDate)}</strong>
            </div>

            <div id="dec_l1_details_${idx}" style="display: none; padding: 0 12px 10px;">
              <table class="tabela-epoca">
                <thead>${cabecaNivel2}</thead>
                <tbody>
                  ${linhasNivel2Dec(l1.subperiods, String(idx), i => `${idx}, ${i}`, 28, sortedPlanets)}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <hr class="divisa">
  `;
}
