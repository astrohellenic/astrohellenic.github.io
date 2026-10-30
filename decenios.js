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
const ELEMENT_SIGN_COLORS_DEC = ELEMENTO_SIGNO_EPOCA; // paleta de época (temas.css): iguais em todos os temas

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
/* NAVEGAÇÃO EM CAMADAS (igual à Liberação Zodiacal): decNivel1 (0-9) e decNivel2 (0-6) guardam o caminho escolhido.
   Sem nada escolhido, a tela mostra a lista do Nível 1; escolhido o 1, a lista do 2; escolhido o 2, a lista do 3. */
let decNivel1 = null;
let decNivel2 = null;
let dataBuscaDec = null; // data escolhida na busca ("Ir para a data"); null = hoje
let buscaPendenteDec = false; // a busca (ou o botão Hoje) pede pra árvore abrir até o período da data, no próximo desenho

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS */
function iniciarModuloDecenios() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar os Decênios.</div>`;
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

  if (buscaPendenteDec) {
    buscaPendenteDec = false;
    const d = dataBuscaDec ? new Date(dataBuscaDec) : new Date();
    decNivel1 = result.timelineL1.findIndex(l1 => d >= l1.startDate && d < l1.endDate);
    decNivel2 = decNivel1 === -1 ? -1 : result.timelineL1[decNivel1].subperiods.findIndex(l2 => d >= l2.startDate && d < l2.endDate);
    if (decNivel1 === -1) decNivel1 = null;
    if (decNivel2 === -1) decNivel2 = null;
  }

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const headerTitle = currentSubjectName;


  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
      <div id="decenios-container" class="painel" style="width: 100%; flex: 1; overflow-y: auto; font-family: 'Montserrat', sans-serif;">

      <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Decênios Helenísticos</h3><div class="acoes-ferramenta">
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
      </div></div>

      <!-- CABEÇALHO PADRÃO (o mesmo de todas as ferramentas). O seletor do planeta inicial fica na barra de botões acima. -->
      ${montarCabecalhoMandalaImagemHTML(data, null, { tintaSobreFolha: true })}

      <!-- Busca por data: fora do #decennialsResultsArea, não sai na imagem da galeria nem do relatório. -->
      ${buscaPorDataHTML({ id: 'decenioBuscaData', data: dataBuscaDec, fnIr: 'irParaDataDecenios' })}

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
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : fundoPainelClaro()); // Tema Céu: imagem sem fundo
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

function alternarSeitaManual(val) {
  overrideStartPlanet = val;
  decNivel1 = null;
  decNivel2 = null;
  buscaPendenteDec = !!dataBuscaDec;
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

/* Busca por data: abre até o período que contém a data (Nível 1 e 2). Vazio = volta pra hoje. */
function irParaDataDecenios(valor) {
  dataBuscaDec = dataDoCampoBusca(valor);
  buscaPendenteDec = true;
  iniciarModuloDecenios();
}
window.irParaDataDecenios = irParaDataDecenios;

/* Volta à lista do nível n (cabeçalho do nível: rótulo ou "Ver a lista"): limpa a escolha dele e dos de baixo. */
function irParaListaDec(n) {
  if (n <= 1) decNivel1 = null;
  decNivel2 = null;
  iniciarModuloDecenios();
}
window.irParaListaDec = irParaListaDec;

function irParaNivel1Dec(idx) {
  if (idx < 0 || idx > 9) return;
  decNivel1 = idx;
  decNivel2 = null;
  iniciarModuloDecenios();
}
window.irParaNivel1Dec = irParaNivel1Dec;

function irParaNivel2Dec(idx) {
  if (decNivel1 === null || idx < 0 || idx > 6) return;
  decNivel2 = idx;
  iniciarModuloDecenios();
}
window.irParaNivel2Dec = irParaNivel2Dec;

const UNIDADE_NIVEL_DEC = { 1: 'meses', 2: 'meses', 3: 'dias' };

function renderizarResultadosHTML(res) {
  const { timelineL1, sortedPlanets } = res;
  // "hoje" aqui é o momento que a árvore marca: hoje, ou a data escolhida na busca
  const hoje = dataBuscaDec ? new Date(dataBuscaDec) : new Date();
  const formatMin = m => String(m || 0).padStart(2, '0');

  const l1Lista = timelineL1;
  const l2Lista = decNivel1 !== null ? l1Lista[decNivel1].subperiods : null;
  const l3Lista = (l2Lista && decNivel2 !== null)
    ? calcularSubperiodosL3Dec(l2Lista[decNivel2].planet, l2Lista[decNivel2].startDate, l2Lista[decNivel2].days, sortedPlanets)
    : null;

  const tamLetra = { 1: 12, 2: 12, 3: 11 };
  const duracao = (n, x) => n === 1 ? '129 meses' : n === 2 ? `${x.months} meses (${x.days} dias)` : `<strong>${formatDiasDec(x.days)}</strong> dias`;
  const dataDec = (n, d) => n === 3 ? formatDateHoraDec(d) : formatDateDec(d);

  const tabelaNivel = (n, lista, fnIr) => {
    const linhas = lista.map((x, i) => {
      const ativa = (hoje >= x.startDate && hoje < x.endDate) ? ' ativa' : '';
      // Nível 1: a posição do planeta no mapa (signo e grau), bem pequena embaixo do planeta
      const posicao = n === 1
        ? `<div class="texto-apagado linha-glifo" style="font-size: 10px; justify-content: center; flex-wrap: nowrap; white-space: nowrap; gap: 3px;">${getSignSvgHtmlDec(x.planet.signIdx, 13)} ${x.planet.degree}°${formatMin(x.planet.minute)}'</div>`
        : '';
      return `<tr class="${fnIr ? 'clicavel' : ''}${ativa}"${fnIr ? ` onclick="${fnIr}(${i})"` : ''}>
        <td class="centro">${planetaComNome(x.planet.id, 26 - n * 2)}${posicao}</td>
        <td>${duracao(n, x)}</td>
        <td style="line-height: 1.2;">${dataDec(n, x.startDate)}</td>
        <td style="line-height: 1.2;">${dataDec(n, x.endDate)}</td>
      </tr>${linhaBarraTempo(x.startDate, x.endDate, UNIDADE_NIVEL_DEC[n], 4)}`;
    }).join('');
    return `<div class="envolve-tabela" style="padding: 0 0 10px;"><table class="tabela-epoca" style="font-size: ${tamLetra[n]}px;">
      <thead><tr><th class="centro">Nível ${n}</th><th>Duração</th><th>Início</th><th>Término</th></tr></thead>
      <tbody>${linhas}</tbody></table></div>`;
  };

  const navNivel = (n, lista, idx, fnIr) => cabecalhoNivelTempo({
    id: 'decenios', n, lista, idx, fnIr, fnLista: 'irParaListaDec', unidade: UNIDADE_NIVEL_DEC[n],
    inicio: x => x.startDate, fim: x => x.endDate,
    glifo: (y, tam) => planetaComNome(y.planet.id, tam),
    fmtData: formatDateDec
  });

  let html;
  if (decNivel1 === null) {
    html = tabelaNivel(1, l1Lista, 'irParaNivel1Dec');
  } else {
    html = navNivel(1, l1Lista, decNivel1, 'irParaNivel1Dec');
    if (decNivel2 === null) html += tabelaNivel(2, l2Lista, 'irParaNivel2Dec');
    else html += navNivel(2, l2Lista, decNivel2, 'irParaNivel2Dec') + tabelaNivel(3, l3Lista, null);
  }
  return html + `<hr class="divisa">`;
}
