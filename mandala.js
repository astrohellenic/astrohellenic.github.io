/* ==========================================
   MÓDULO DE CÁLCULO E DESENHO DA MANDALA
   ========================================== */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* CÁLCULO APROXIMADO DO FUSO BASEADO NA LONGITUDE (fatia de 15° em 15°) —
   usado só como último recurso, quando calcularFusoPreciso não consegue
   determinar o fuso de verdade (ver função abaixo). NÃO reflete o fuso
   político real: fronteiras de fuso não seguem a longitude (ex.: o Rio
   Grande do Sul inteiro usa o mesmo -3 de São Paulo, mesmo estando bem
   mais a oeste do meridiano de -45°), e por isso essa fórmula errava o
   fuso de qualquer lugar longe o bastante do meridiano de referência do
   seu próprio fuso — foi a causa do Ascendente errado relatado por uma
   cliente nascida em São Luiz Gonzaga, RS (a fórmula dava -4, o certo é
   -3). */
function calcularFusoPorLongitude(lon) {
  if (lon === undefined || lon === null || isNaN(lon)) return -3;
  return Math.round(lon / 15);
}

/* CÁLCULO PRECISO DO FUSO, PRO MUNDO INTEIRO, RESPEITANDO A DATA
   ---------------------------------------------------------------
   Em vez de aproximar por longitude, acha o fuso IANA real do ponto
   geográfico (ex.: "America/Sao_Paulo") usando a biblioteca tz-lookup.js
   (vendorizada localmente em tz-lookup.js — pacote npm "tz-lookup",
   licença CC0, dados de fronteira de fuso do timezone-boundary-builder;
   ver https://github.com/darkskyapp/tz-lookup). Isso já resolve o fuso
   político certo em qualquer país, não só o Brasil.

   Só saber o fuso IANA não basta: o deslocamento de UTC de um mesmo
   lugar muda com a data por causa do horário de verão (o Brasil teve
   horário de verão até 2019; a maioria dos outros países que usa
   tem regras próprias e históricas). offsetMinutosNaData usa o Intl
   nativo do navegador — que já carrega o histórico completo de cada
   fuso — pra achar o deslocamento certo NA data de nascimento
   específica, não no deslocamento de hoje.

   Nunca lança erro: se a biblioteca não tiver carregado ou o Intl
   falhar por qualquer motivo (navegador muito antigo etc.), cai de
   volta pro cálculo por longitude de sempre — nunca deixa de retornar
   um fuso. */
function calcularFusoPreciso(lat, lon, ano, mes, dia, hora, minuto) {
  try {
    if (typeof tzlookup !== 'function') throw new Error('tz-lookup.js não carregado');
    const zonaIana = tzlookup(lat, lon);
    const offsetMin = offsetMinutosNaData(zonaIana, ano, mes, dia, hora, minuto);
    if (isNaN(offsetMin)) throw new Error('offset inválido');
    return offsetMin / 60;
  } catch (e) {
    return calcularFusoPorLongitude(lon);
  }
}

/* Deslocamento de UTC (em minutos) de um fuso IANA num instante local
   específico. Técnica padrão: "chuta" que os números informados (ano,
   mes, dia, hora, minuto) já são um instante UTC, formata esse instante
   no fuso alvo e mede a diferença — isso dá o deslocamento. Repete uma
   segunda vez usando essa primeira estimativa pra refinar o chute
   (cobre os raros casos em cima da própria virada do horário de
   verão). */
function offsetMinutosNaData(zonaIana, ano, mes, dia, hora, minuto) {
  const formatador = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaIana, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  function deslocamentoPara(instanteUTC) {
    const partes = formatador.formatToParts(new Date(instanteUTC));
    const m = {};
    partes.forEach(p => { if (p.type !== 'literal') m[p.type] = parseInt(p.value, 10); });
    if (m.hour === 24) m.hour = 0;
    const comoUTC = Date.UTC(m.year, m.month - 1, m.day, m.hour, m.minute, m.second);
    return (comoUTC - instanteUTC) / 60000;
  }
  const chuteUTC = Date.UTC(ano, mes - 1, dia, hora, minuto, 0);
  const primeiroOffset = deslocamentoPara(chuteUTC);
  return deslocamentoPara(chuteUTC - primeiroOffset * 60000);
}

/* Mede a altura de VERDADE do #top-bar e aplica no espaçador logo depois
   dele (#top-bar-espacador) — só tem efeito quando body.topbar-fixo está
   ativo (fora do modo Mandala/Radix, ver abrirModuloTecnica em
   supabase.js), que é quando o #top-bar vira position:fixed e sai do
   fluxo normal da página. Medida em JS, não um valor fixo no CSS, porque
   a altura muda com o tamanho da tela (ex.: os ícones podem quebrar
   linha em aparelhos bem estreitos). Reage a redimensionamento também. */
function ajustarEspacadorTopBar() {
  const topBar = document.getElementById('top-bar');
  const espacador = document.getElementById('top-bar-espacador');
  if (!topBar || !espacador) return;
  espacador.style.height = document.body.classList.contains('topbar-fixo') ? topBar.offsetHeight + 'px' : '';
  if (typeof ajustarEspacadoresBarraFixaRelatorio === 'function') ajustarEspacadoresBarraFixaRelatorio();
}
window.ajustarEspacadorTopBar = ajustarEspacadorTopBar;

if (!window.topBarResizeHandlerAdicionado) {
  window.topBarResizeHandlerAdicionado = true;
  window.addEventListener('resize', ajustarEspacadorTopBar);
}

let selectedCityGeo = { lat: -23.5505, lon: -46.6333, name: "São Paulo, SP" };
let editSelectedCityGeo = null;

/* PONTO SELECIONADO PARA A CASA 1 ('ASC' OU CHAVE DO LOTE) */
let selectedHouse1Lot = "ASC";

/* VARIÁVEL GLOBAL PARA O TIPO DO MAPA ATIVO NO CABEÇALHO */
window.currentMapType = "Natal";

const SIGNS = [
  { name: "Áries", ruler: "Marte" }, { name: "Touro", ruler: "Vênus" }, { name: "Gêmeos", ruler: "Mercúrio" },
  { name: "Câncer", ruler: "Lua" }, { name: "Leão", ruler: "Sol" }, { name: "Virgem", ruler: "Mercúrio" },
  { name: "Libra", ruler: "Vênus" }, { name: "Escorpião", ruler: "Marte" }, { name: "Sagitário", ruler: "Júpiter" },
  { name: "Capricórnio", ruler: "Saturno" }, { name: "Aquário", ruler: "Saturno" }, { name: "Peixes", ruler: "Júpiter" }
];

const SIGN_ELEMENTS = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];

const MONOLINE_ZODIAC_SVGS = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" stroke-miterlimit="10" points="52,53 57,58 52,63 "></polyline>`,
  `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="1" y1="28" x2="36" y2="63"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
  `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="7" y1="32" x2="57" y2="32"></line>`
];

const ELEMENT_SIGN_COLORS = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

const PLANETS_DEF = [
  { id: "Sun", name: "Sol", symbol: "☉", key: "Sol" },
  { id: "Moon", name: "Lua", symbol: "☽", key: "Lua" },
  { id: "Mercury", name: "Mercúrio", symbol: "☿", key: "Mercúrio" },
  { id: "Venus", name: "Vênus", symbol: "♀", key: "Vênus" },
  { id: "Mars", name: "Marte", symbol: "♂", key: "Marte" },
  { id: "Jupiter", name: "Júpiter", symbol: "♃", key: "Júpiter" },
  { id: "Saturn", name: "Saturno", symbol: "♄", key: "Saturno" }
];

/* Escolhe entre o icone esferico 3D e o icone simples (glifo), conforme a
   configuracao de Aparencia salva pelo usuario - agora delegado pro bloco
   central novo em planetIcons.js (getIconeFragmento), que ja faz essa
   mesma checagem sozinho. */
function planetIconFragment(planetId) {
  return (typeof getIconeFragmento === 'function') ? getIconeFragmento('planeta', planetId) : '';
}

const EGYPTIAN_TERMS = [
  [{ p: "♃", deg: 6 }, { p: "♀", deg: 12 }, { p: "☿", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
  [{ p: "♀", deg: 8 }, { p: "☿", deg: 14 }, { p: "♃", deg: 22 }, { p: "♄", deg: 27 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 6 }, { p: "♃", deg: 12 }, { p: "♀", deg: 17 }, { p: "♂", deg: 24 }, { p: "♄", deg: 30 }],
  [{ p: "♂", deg: 7 }, { p: "♀", deg: 13 }, { p: "☿", deg: 19 }, { p: "♃", deg: 26 }, { p: "♄", deg: 30 }],
  [{ p: "♃", deg: 6 }, { p: "♀", deg: 11 }, { p: "♄", deg: 18 }, { p: "☿", deg: 24 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 7 }, { p: "♀", deg: 17 }, { p: "♃", deg: 21 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }],
  [{ p: "♄", deg: 6 }, { p: "☿", deg: 14 }, { p: "♃", deg: 21 }, { p: "♀", deg: 28 }, { p: "♂", deg: 30 }],
  [{ p: "♂", deg: 7 }, { p: "♀", deg: 11 }, { p: "☿", deg: 19 }, { p: "♃", deg: 24 }, { p: "♄", deg: 30 }],
  [{ p: "♃", deg: 12 }, { p: "♀", deg: 17 }, { p: "☿", deg: 21 }, { p: "♄", deg: 26 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 7 }, { p: "♃", deg: 14 }, { p: "♀", deg: 22 }, { p: "♄", deg: 26 }, { p: "♂", deg: 30 }],
  [{ p: "☿", deg: 7 }, { p: "♀", deg: 13 }, { p: "♃", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
  [{ p: "♀", deg: 12 }, { p: "♃", deg: 16 }, { p: "☿", deg: 19 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }]
];

let currentCalculatedData = null;
let currentMoment = new Date();
let currentGeo = { lat: -23.5505, lon: -46.6333, city: "São Paulo, SP" };
let currentSubjectName = "Agora";
let currentCustomCode = null;
let lastRenderedPngUrl = "";

/* Id (na tabela `mapas`) do mapa atualmente carregado na tela — null
   quando o mapa em tela ainda não foi salvo (ex.: "Céu do Momento").
   Usado pelo módulo de Relatório (relatorio.js) pra saber a qual mapa
   vincular o rascunho do relatório em andamento. */
let currentMapaId = null;

/* Id (na tabela relatorio_rascunhos) do rascunho que está sendo editado
   agora, se algum. Fica null sempre que troca o mapa em tela (mesmo
   cliente pode ter mais de um rascunho — ex.: um de Retificação e outro
   de Mapa Natal — então carregar o mapa de novo não assume qual deles
   continuar; só assume ao abrir um rascunho específico da lista). */
let currentRascunhoId = null;

function formatDegMin(absDeg) {
  const normDeg = (absDeg % 360 + 360) % 360;
  const degInSign = normDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutes = Math.round((degInSign - degrees) * 60);
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${degrees}°${minStr}′`;
}

function eclToScreenAngle(eclDeg, refAbs) {
  return (180 - (eclDeg - refAbs) + 36000) % 360;
}

function polarToCart(cx, cy, r, angleDeg) {
  const rad = angleDeg * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
}

function calculateSevenLots(ascAbs, isDay, planetObj) {
  const sun = planetObj.Sun.abs;
  const moon = planetObj.Moon.abs;
  const merc = planetObj.Mercury.abs;
  const ven = planetObj.Venus.abs;
  const mars = planetObj.Mars.abs;
  const jup = planetObj.Jupiter.abs;
  const sat = planetObj.Saturn.abs;

  const fortAbs = ((isDay ? (ascAbs + moon - sun) : (ascAbs + sun - moon)) + 36000) % 360;
  const spirAbs = ((isDay ? (ascAbs + sun - moon) : (ascAbs + moon - sun)) + 36000) % 360;
  const erosAbs = ((isDay ? (ascAbs + ven - spirAbs) : (ascAbs + spirAbs - ven)) + 36000) % 360;
  const necAbs  = ((isDay ? (ascAbs + fortAbs - merc) : (ascAbs + merc - fortAbs)) + 36000) % 360;
  const courAbs = ((isDay ? (ascAbs + fortAbs - mars) : (ascAbs + mars - fortAbs)) + 36000) % 360;
  const vicAbs  = ((isDay ? (ascAbs + jup - spirAbs) : (ascAbs + spirAbs - jup)) + 36000) % 360;
  const nemAbs  = ((isDay ? (ascAbs + fortAbs - sat) : (ascAbs + sat - fortAbs)) + 36000) % 360;

  return [
    { key: "fortune", label: "FORT", type: "fortune", deg: fortAbs },
    { key: "spirit", label: "ESP", type: "spirit", deg: spirAbs },
    { key: "venus", label: "EROS", type: "venus", sym: "♀", deg: erosAbs },
    { key: "mercury", label: "NEC", type: "mercury", sym: "☿", deg: necAbs },
    { key: "mars", label: "AUD", type: "mars", sym: "♂", deg: courAbs },
    { key: "jupiter", label: "VIT", type: "jupiter", sym: "♃", deg: vicAbs },
    { key: "saturn", label: "NÊM", type: "saturn", sym: "♄", deg: nemAbs }
  ];
}

// Empilhamento radial: separa itens em conjunção sem nunca alterar o ângulo
// (a posição real no zodíaco), apenas a distância deles ao centro. Lotes são
// pontos calculados, fora da eclíptica, com raio próprio bem menor — nunca
// competem por espaço com quem está na órbita dos planetas (planetas, nodos,
// sizígia), nem são movidos por essa lógica.
function aplicarEmpilhamentoRadial(items, distMinimaGraus = 6.5, passoRadial = 22) {
  if (!items || items.length === 0) return;
  items.forEach(it => { it.aShift = it.aScreen; it.rOffset = 0; });

  const naEcliptica = items.filter(it => it.type !== 'lot').sort((a, b) => a.aScreen - b.aScreen);
  if (naEcliptica.length === 0) return;

  // Agrupa vizinhos que estão colados demais (conjunção visual)
  const grupos = [[naEcliptica[0]]];
  for (let i = 1; i < naEcliptica.length; i++) {
    if (naEcliptica[i].aScreen - naEcliptica[i - 1].aScreen < distMinimaGraus) {
      grupos[grupos.length - 1].push(naEcliptica[i]);
    } else {
      grupos.push([naEcliptica[i]]);
    }
  }

  grupos.forEach(grupo => {
    if (grupo.length <= 1) return;
    // O Sol nunca se move. Os demais membros do grupo se afastam dele em
    // camadas, alternando para fora e para dentro do raio que a latitude
    // eclíptica já definiu.
    const membros = grupo.filter(it => it.id !== 'Sun');
    let camada = 1;
    membros.forEach((item, idx) => {
      const direcao = idx % 2 === 0 ? 1 : -1;
      item.rOffset = direcao * camada * passoRadial;
      if (idx % 2 === 1) camada++;
    });
  });

  // Dentro da órbita de combustão (15° do Sol) ninguém se desloca: a
  // sobreposição ali é proposital — representa estar "sob os raios do Sol",
  // sem visibilidade a olho nu. Quem cobre quem é decidido depois pela
  // ordem caldaica de distância à Terra, não pelo deslocamento.
  const sol = naEcliptica.find(it => it.id === 'Sun');
  if (sol) {
    naEcliptica.forEach(it => {
      let diff = Math.abs(it.deg - sol.deg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 15) it.rOffset = 0;
    });
  }
}

// Desvio lateral exclusivo dos lotes: como são pontos calculados (não
// posições reais no céu), podem se afastar no ângulo para não se
// sobreporem, sem o problema de distorcer a leitura da posição de um
// planeta. Fica completamente à parte do empilhamento radial acima —
// nunca muda o raio fixo do lote, só o ângulo em que ele é desenhado.
function aplicarDesvioLateralLotes(items, distMinimaGraus = 6) {
  const lotes = items.filter(it => it.type === 'lot').sort((a, b) => a.aScreen - b.aScreen);
  if (lotes.length === 0) return;
  lotes.forEach(it => it.aShift = it.aScreen);

  for (let pass = 0; pass < 12; pass++) {
    for (let i = 0; i < lotes.length - 1; i++) {
      const atual = lotes[i];
      const proximo = lotes[i + 1];
      const diff = proximo.aShift - atual.aShift;
      if (diff < distMinimaGraus) {
        const overlap = (distMinimaGraus - diff) / 2;
        atual.aShift -= overlap;
        proximo.aShift += overlap;
      }
    }
  }
}

function selecionarRegistro(index) {
  if (typeof cachedFolderData !== 'undefined' && cachedFolderData[index]) {
    aplicarDadosDoPerfilNoMapa(cachedFolderData[index]);
  }
}

function aplicarDadosDoPerfilNoMapa(c) {
  const menuHere = document.getElementById('menu-here-now');
  if (menuHere) menuHere.classList.remove('active');

  try { localStorage.setItem('astro_ultimo_perfil', JSON.stringify(Object.assign({}, c, { manterModulo: undefined }))); } catch (e) {}

  let ano = 2000, mes = 1, dia = 1;
  if (c.dataNascimento && c.dataNascimento.includes('/')) {
    const partes = c.dataNascimento.split('/');
    if (partes.length === 3) {
      dia = parseInt(partes[0]);
      mes = parseInt(partes[1]);
      ano = parseInt(partes[2]);
    }
  }

  let hora = 12, min = 0;
  if (c.horaNascimento && c.horaNascimento.includes(':')) {
    const partesH = c.horaNascimento.split(':');
    if (partesH.length >= 2) {
      hora = parseInt(partesH[0]);
      min = parseInt(partesH[1]);
    }
  }

  const mapaAnteriorId = currentMapaId;

  currentSubjectName = c.nome || "Nativo";
  currentCustomCode = c.codigo || null;
  currentMapaId = c.id || null;
  currentRascunhoId = null;
  window.currentMapType = c.tipo || "Natal";

  // Capturas de tela do Relatório (window.relatorioCapturas) são só do
  // cliente cujo mapa está em tela — trocando de cliente, limpa NA HORA
  // (nunca mostra a captura de outro cliente nem por um instante) e busca
  // em segundo plano o pool de capturas de verdade deste cliente (ver
  // carregarCapturasPooladasDoMapa em relatorio.js), pra continuar
  // podendo reaproveitar o que já foi capturado pra ele antes.
  if (currentMapaId !== mapaAnteriorId) {
    window.relatorioCapturas = {};
    if (currentMapaId && typeof recarregarCapturasDoMapaAtivo === 'function') {
      recarregarCapturasDoMapaAtivo(currentMapaId);
    }
  }
  currentMoment = new Date(ano, mes - 1, dia, hora, min);

  const lat = parseFloat(c.latitude) || -23.5505;
  const lon = parseFloat(c.longitude) || -46.6333;
  const fusoCalc = c.fuso !== undefined ? parseFloat(c.fuso) : calcularFusoPreciso(lat, lon, ano, mes, dia, hora, min);
  const cidade = c.cidade || "Localidade não informada";

  currentGeo = { lat, lon, fuso: fusoCalc, city: cidade };
  // Devolve a Promise de executarCalculo() (resolve true/false) pra quem
  // precisa saber quando o cálculo realmente terminou — ex.: o Relatório
  // reabrindo um rascunho, que só pode montar a prévia depois que os
  // dados do mapa novo estiverem prontos, senão corre o risco de gerar
  // com dados do cliente anterior ainda na tela.
  // c.manterModulo: quem chama (ex.: o Relatório reabrindo um rascunho) quer ficar na ferramenta onde está.
  return executarCalculo(c.manterModulo ? { manterModulo: true } : undefined);
}

function abrirModalNovoMapa() {
  document.getElementById('modalCodigo').value = "";
  document.getElementById('modalNome').value = "";
  document.getElementById('modalData').value = "";
  document.getElementById('modalHora').value = "";
  document.getElementById('modalCidadeInput').value = "";
  document.getElementById('cityResultsList').style.display = "none";
  document.getElementById('modalOverlay').style.display = "flex";
}

function fecharModalNovoMapa() {
  document.getElementById('modalOverlay').style.display = "none";
}

let searchCityTimer = null;
async function pesquisarCidadesAutocomplete(query, containerId, isEdit = false) {
  const listDiv = document.getElementById(containerId);
  if (!query || query.length < 3) {
    listDiv.style.display = "none";
    return;
  }

  clearTimeout(searchCityTimer);
  searchCityTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        let html = '';
        data.forEach(item => {
          const displayName = item.display_name;
          const lat = item.lat;
          const lon = item.lon;
          html += `<div class="city-item" onclick="selecionarCidadeModal('${escapeHtml(displayName)}', ${lat}, ${lon}, '${containerId}', ${isEdit})">${escapeHtml(displayName)}</div>`;
        });
        listDiv.innerHTML = html;
        listDiv.style.display = "block";
      } else {
        listDiv.style.display = "none";
      }
    } catch (e) {
      listDiv.style.display = "none";
    }
  }, 300);
}

function selecionarCidadeModal(nomeFormatado, lat, lon, containerId, isEdit) {
  const fusoCalculado = calcularFusoPorLongitude(parseFloat(lon));
  if (isEdit) {
    editSelectedCityGeo = { lat: parseFloat(lat), lon: parseFloat(lon), fuso: fusoCalculado, name: nomeFormatado };
    document.getElementById('editModalCidadeInput').value = nomeFormatado;
  } else {
    selectedCityGeo = { lat: parseFloat(lat), lon: parseFloat(lon), fuso: fusoCalculado, name: nomeFormatado };
    document.getElementById('modalCidadeInput').value = nomeFormatado;
  }
  document.getElementById(containerId).style.display = "none";
}

function confirmarNovoMapaModal() {
  const codDigitado = document.getElementById('modalCodigo').value.trim();
  const nome = document.getElementById('modalNome').value.trim();
  const dataStr = normalizarDataNascimento(document.getElementById('modalData').value);
  const horaStr = normalizarHoraNascimento(document.getElementById('modalHora').value);

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr) { alert("Data inválida. Use o formato DD/MM/AAAA (ex.: 11/06/1999)."); return; }
  if (horaStr === null) { alert("Horário inválido. Use o formato HH:MM (ex.: 18:28), de 00:00 a 23:59."); return; }
  if (!horaStr) { alert("Informe o horário."); return; }

  const partesData = dataStr.split('/');
  const dia = partesData[0], mes = partesData[1], ano = partesData[2];

  const partesHora = horaStr.split(':');
  const h = partesHora[0] || 12, m = partesHora[1] || 0;

  const fusoReal = calcularFusoPreciso(selectedCityGeo.lat, selectedCityGeo.lon, parseInt(ano), parseInt(mes), parseInt(dia), parseInt(h), parseInt(m));
  const codigoFinal = codDigitado !== "" ? codDigitado : null;
  const cidadeFinal = selectedCityGeo.name;
  const latFinal = selectedCityGeo.lat;
  const lonFinal = selectedCityGeo.lon;

  const mapaAnteriorId = currentMapaId;

  currentSubjectName = nome;
  currentCustomCode = codigoFinal;
  currentMapaId = null; // ainda não tem id — só ganha um depois que salvarNovoMapaAutomaticamente() inserir e devolver a linha
  currentRascunhoId = null;
  window.currentMapType = "Natal";

  // Mesma lógica de isolamento de aplicarDadosDoPerfilNoMapa: um cliente
  // novo nunca começa com as capturas de tela de quem estava carregado
  // antes. Sem pool pra buscar ainda (mapaId só existe depois do insert
  // em salvarNovoMapaAutomaticamente), então só limpa.
  if (mapaAnteriorId) window.relatorioCapturas = {};
  currentMoment = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), parseInt(h), parseInt(m));
  currentGeo = { lat: latFinal, lon: lonFinal, fuso: fusoReal, city: cidadeFinal };

  try {
    localStorage.setItem('astro_ultimo_perfil', JSON.stringify({
      nome, dataNascimento: dataStr, horaNascimento: horaStr, codigo: codigoFinal,
      id: null, tipo: 'Natal', latitude: latFinal, longitude: lonFinal, fuso: fusoReal, cidade: cidadeFinal
    }));
  } catch (e) {}

  fecharModalNovoMapa();
  executarCalculo();

  salvarNovoMapaAutomaticamente({
    nome, dataStr, horaStr, codigo: codigoFinal, cidade: cidadeFinal, lat: latFinal, lon: lonFinal
  });
}

/* SALVA AUTOMATICAMENTE O MAPA RECÉM-CRIADO PELO MODAL "NOVO MAPA ASTRAL", NA PASTA ATIVA */
async function salvarNovoMapaAutomaticamente(dados) {
  if (typeof supabaseClient === 'undefined') return;
  const pastaAlvo = (typeof activeFolder !== 'undefined' && activeFolder) ? activeFolder : "Clientes";

  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const { data: linhaInserida, error } = await supabaseClient
      .from('mapas')
      .insert([{
        pasta: pastaAlvo,
        tipo: 'Natal',
        codigo: dados.codigo,
        nome: dados.nome,
        data_nascimento: dados.dataStr,
        hora_nascimento: dados.horaStr,
        cidade: dados.cidade,
        latitude: dados.lat,
        longitude: dados.lon,
        user_id: userId
      }])
      .select()
      .single();

    if (!error) {
      // só assume o id se o astrólogo ainda estiver olhando pro mesmo
      // nativo (ele pode ter trocado de mapa enquanto isso salvava)
      if (linhaInserida && currentSubjectName === dados.nome && currentCustomCode == dados.codigo) {
        currentMapaId = linhaInserida.id;
        try {
          const perfilSalvo = JSON.parse(localStorage.getItem('astro_ultimo_perfil') || 'null');
          if (perfilSalvo && perfilSalvo.nome === dados.nome && perfilSalvo.codigo == dados.codigo) {
            perfilSalvo.id = linhaInserida.id;
            localStorage.setItem('astro_ultimo_perfil', JSON.stringify(perfilSalvo));
          }
        } catch (e) {}
      }
      if (typeof carregarMapasDoBanco === 'function') carregarMapasDoBanco(pastaAlvo);
    } else {
      alert("O mapa foi carregado na tela, mas houve um erro ao salvá-lo automaticamente: " + error.message);
    }
  } catch (err) {
    alert("O mapa foi carregado na tela, mas houve um erro de conexão ao salvá-lo automaticamente.");
  }
}

async function obterNomeCidade(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    const data = await res.json();
    const addr = data.address || {};
    const cidade = addr.city || addr.town || addr.village || addr.municipality || "Local Localizado";
    const estado = addr.state ? `, ${addr.state}` : "";
    return `${cidade}${estado}`;
  } catch (e) {
    return "São Paulo, SP";
  }
}

function carregarCeuDoMomento() {
  const menuHere = document.getElementById('menu-here-now');
  if (menuHere) menuHere.classList.add('active');
  try { localStorage.removeItem('astro_ultimo_perfil'); } catch (e) {}
  const mapaAnteriorId = currentMapaId;
  currentSubjectName = "Agora";
  currentCustomCode = null;
  currentMapaId = null;
  currentRascunhoId = null;
  // Mesma lógica de isolamento de aplicarDadosDoPerfilNoMapa: "Céu do
  // Momento" não tem cliente nenhum, então nunca deve carregar capturas
  // de quem estava em tela antes.
  if (mapaAnteriorId) window.relatorioCapturas = {};
  window.currentMapType = "Trânsito";
  currentMoment = new Date();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const nomeCidade = await obterNomeCidade(lat, lon);
        const fusoPreciso = calcularFusoPreciso(lat, lon, currentMoment.getFullYear(), currentMoment.getMonth() + 1, currentMoment.getDate(), currentMoment.getHours(), currentMoment.getMinutes());
        currentGeo = { lat, lon, fuso: fusoPreciso, city: nomeCidade };
        executarCalculo();
      },
      () => {
        currentGeo = { lat: -23.5505, lon: -46.6333, fuso: -3, city: "São Paulo, SP" };
        executarCalculo();
      },
      { timeout: 4000 }
    );
  } else {
    currentGeo = { lat: -23.5505, lon: -46.6333, fuso: -3, city: "São Paulo, SP" };
    executarCalculo();
  }
}

function ajustarTempo(direcao) {
  const unit = document.getElementById('stepUnit').value;
  const amount = direcao;

  switch(unit) {
    case 'second': currentMoment.setSeconds(currentMoment.getSeconds() + amount); break;
    case 'minute': currentMoment.setMinutes(currentMoment.getMinutes() + amount); break;
    case 'hour': currentMoment.setHours(currentMoment.getHours() + amount); break;
    case 'day': currentMoment.setDate(currentMoment.getDate() + amount); break;
    case 'month': currentMoment.setMonth(currentMoment.getMonth() + amount); break;
    case 'year': currentMoment.setFullYear(currentMoment.getFullYear() + amount); break;
  }

  executarCalculo();
}

/* PERSISTÊNCIA DA UNIDADE DO STEPPER DE TEMPO DA MANDALA (SEGUNDO/MINUTO/
   HORA/DIA/MÊS/ANO) — sem isso, todo reload volta pro "Dia" fixo no
   <option selected> do HTML, mesmo que o astrólogo estivesse navegando por
   minuto (ex.: numa retificação de mapa). Guarda a última unidade usada e
   restaura em window.onload, antes de qualquer outra coisa mexer no select. */
const STORAGE_KEY_STEP_UNIT = 'astro_ultima_unidade_stepper';

function restaurarUnidadeStepperMandala() {
  const select = document.getElementById('stepUnit');
  if (!select) return;
  try {
    const unidadeSalva = localStorage.getItem(STORAGE_KEY_STEP_UNIT);
    if (unidadeSalva && Array.from(select.options).some(opt => opt.value === unidadeSalva)) {
      select.value = unidadeSalva;
    }
  } catch (e) {}
}

if (!window.stepUnitChangeHandlerAdicionado) {
  window.stepUnitChangeHandlerAdicionado = true;
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'stepUnit') {
      try { localStorage.setItem(STORAGE_KEY_STEP_UNIT, e.target.value); } catch (err) {}
    }
  });
}

/* "opcoes.soCalcular": só preenche currentCalculatedData (busca o céu no motor) e devolve — sem calcular as Horas
   Planetárias, sem desenhar nem trocar de módulo. Usado pela tela de login (gerarMandalaDoMomentoParaLogin). */
/* Conta os cálculos em andamento: a tela de login (gerarMandalaDoMomentoParaLogin) só mexe no estado global
   quando nenhum está rodando, pra não atropelar o cálculo que o carregamento da página faz por baixo. */
window.__calculosEmAndamento = 0;
async function executarCalculo(opcoes) {
  window.__calculosEmAndamento++;
  try { return await executarCalculoInterno(opcoes); }
  finally { window.__calculosEmAndamento--; }
}

async function executarCalculoInterno(opcoes) {
  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const dataStr = `${ano}-${mes}-${dia}`;

  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');
  const horaStr = `${hora}:${min}`;

  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);

  try {
    const urlApi = `https://motor-astrologia.vercel.app/api/index?data=${dataStr}&hora=${horaStr}&fuso=${fusoVal}&lat=${currentGeo.lat}&lon=${currentGeo.lon}`;
    const res = await fetch(urlApi);
    if (!res.ok) throw new Error("Erro na API");

    const apiJson = await res.json();

    const SIGNOS_INDEX = {
      "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
      "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
      "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
    };

    const planetas = apiJson.planetas || {};
    const ascData = apiJson.ascendente || {};
    const mcData = apiJson.meio_ceu || {};
    const sizigiaData = apiJson.sizigia || {};

    const ascAbs = ((SIGNOS_INDEX[ascData.signo] || 0) * 30) + (parseFloat(ascData.grau) || 0);
    const mcAbs = ((SIGNOS_INDEX[mcData.signo] || 0) * 30) + (parseFloat(mcData.grau) || 0);

    const checkRetro = (pObj) => {
      if (!pObj) return false;
      if (pObj.retrogrado !== undefined) return Boolean(pObj.retrogrado);
      if (pObj.velocidade !== undefined) return parseFloat(pObj.velocidade) < 0;
      return false;
    };

    currentCalculatedData = {
      Ascendente: { grau_absoluto: ascAbs },
      MC: { grau_absoluto: mcAbs },
      Nodo_Norte: { grau_absoluto: planetas.NodoNorte ? planetas.NodoNorte.grau_absoluto : 0, retro: checkRetro(planetas.NodoNorte) },
      Sizigia: { grau_absoluto: sizigiaData.grau_absoluto !== undefined ? parseFloat(sizigiaData.grau_absoluto) : 0 },
      Sol: { grau_absoluto: planetas.Sol ? planetas.Sol.grau_absoluto : 0, retro: false, lat: planetas.Sol ? parseFloat(planetas.Sol.latitude) || 0 : 0 },
      Lua: { grau_absoluto: planetas.Lua ? planetas.Lua.grau_absoluto : 0, retro: false, lat: planetas.Lua ? parseFloat(planetas.Lua.latitude) || 0 : 0 },
      Mercúrio: { grau_absoluto: planetas.Mercurio ? planetas.Mercurio.grau_absoluto : 0, retro: checkRetro(planetas.Mercurio), lat: planetas.Mercurio ? parseFloat(planetas.Mercurio.latitude) || 0 : 0 },
      Vênus: { grau_absoluto: planetas.Venus ? planetas.Venus.grau_absoluto : 0, retro: checkRetro(planetas.Venus), lat: planetas.Venus ? parseFloat(planetas.Venus.latitude) || 0 : 0 },
      Marte: { grau_absoluto: planetas.Marte ? planetas.Marte.grau_absoluto : 0, retro: checkRetro(planetas.Marte), lat: planetas.Marte ? parseFloat(planetas.Marte.latitude) || 0 : 0 },
      Júpiter: { grau_absoluto: planetas.Jupiter ? planetas.Jupiter.grau_absoluto : 0, retro: checkRetro(planetas.Jupiter), lat: planetas.Jupiter ? parseFloat(planetas.Jupiter.latitude) || 0 : 0 },
      Saturno: { grau_absoluto: planetas.Saturno ? planetas.Saturno.grau_absoluto : 0, retro: checkRetro(planetas.Saturno), lat: planetas.Saturno ? parseFloat(planetas.Saturno.latitude) || 0 : 0 }
      };

    if (opcoes && opcoes.soCalcular) return true;
    // novo mapa/momento: as telas guardadas das outras ferramentas (ver abrirModuloTecnica) ficaram velhas
    if (typeof descartarModulosGuardados === 'function') descartarModulosGuardados();

    /* Só precisamos que essa chamada calcule window.horasPlanetariasAtual
       (regente do dia/da hora, usado em mais telas) — não que ela apareça
       na tela. Rodando num container escondido em vez do mandala-container,
       evita aquele "flash" de 1 frame das Horas Planetárias toda vez que um
       mapa é calculado. */
    if (typeof iniciarModuloHoras === 'function') {
      let containerOculto = document.getElementById('horas-calculo-oculto');
      if (!containerOculto) {
        containerOculto = document.createElement('div');
        containerOculto.id = 'horas-calculo-oculto';
        containerOculto.style.display = 'none';
        document.body.appendChild(containerOculto);
      }
      iniciarModuloHoras('horas-calculo-oculto');
    }
    /* O mapa acabou de chegar. Três casos, sem nunca deixar a tela num estado que não bate com o módulo ativo:
       1) recarregou a página com outra ferramenta aberta (ex.: Horas): só agora, com os dados em mãos, abre ELA
          (antes ela era desenhada na hora, sem dados, e logo em seguida a Mandala por cima — o "piscar");
       2) escolheu outro cliente/momento enquanto estava numa ferramenta: a tela vira a Mandala, então o módulo
          ativo passa a ser a Mandala de verdade (antes a roda era desenhada por cima, mas o módulo guardado
          continuava sendo o antigo — e era ele que voltava a piscar no próximo recarregamento);
       3) já estava na Mandala: só redesenha. */
    const moduloPendente = window.moduloPendenteRestaurar;
    window.moduloPendenteRestaurar = null;
    const moduloAtivo = window.moduloTecnicoAtivo || 'mandala';
    // Recarregou na página de Configurações (abriu sem esperar o mapa): fica nela. Vale só pra este primeiro
    // cálculo; depois, escolher um cliente na lista lateral volta pra Mandala como sempre.
    const ficaNasConfiguracoes = moduloAtivo === 'configuracoes' && window.configuracoesAbertaNoCarregamento;
    window.configuracoesAbertaNoCarregamento = false;
    if (moduloPendente && typeof abrirModuloTecnica === 'function') {
      abrirModuloTecnica(moduloPendente);
    } else if (ficaNasConfiguracoes) {
      // nada a redesenhar: o mapa já está calculado pra quando uma ferramenta for aberta
    } else if (!(opcoes && opcoes.manterModulo) && moduloAtivo !== 'mandala' && moduloAtivo !== 'radix' && typeof abrirModuloTecnica === 'function') {
      abrirModuloTecnica('mandala');
    } else {
      renderMandala();
    }
    return true;

  } catch (err) {
    window.moduloPendenteRestaurar = null;
    window.configuracoesAbertaNoCarregamento = false;
    // Na página de Configurações o erro do cálculo não deve apagar a tela (ela não depende do mapa).
    if (window.moduloTecnicoAtivo !== 'configuracoes') document.getElementById('mandala-container').innerHTML = `<p style="color: #dc2626;">Erro ao calcular posições.</p>`;
    return false;
  }
}

/* Mesmo de-para de mandala.js's renderMandala (LOTE_ICON_KEY local), mas
   em escopo de módulo porque essa função não está dentro de renderMandala.
   item.lotType vem de calculateSevenLots() como o planeta regente do lote
   ("venus", "mercury"...) pra fortune/spirit, que já tem nome próprio; os
   ícones novos (planetIcons.js) usam o nome do lote em si. */
const LOTE_ICON_KEY_SELETOR = {
  fortune: 'fortune', spirit: 'spirit', venus: 'eros',
  mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis'
};

/* Ordem/rótulos do menu de rotação da Casa 1 — usada tanto pro ícone do
   botão fechado quanto pra lista de opções, pra não duplicar a mesma
   informação duas vezes. */
const OPCOES_ROTACAO_CASA1 = [
  { key: 'ASC', label: 'Ascendente' },
  { key: 'fortune', label: 'Fortuna' },
  { key: 'spirit', label: 'Espírito' },
  { key: 'mercury', label: 'Necessidade' },
  { key: 'venus', label: 'Eros' },
  { key: 'mars', label: 'Audácia' },
  { key: 'jupiter', label: 'Vitória' },
  { key: 'saturn', label: 'Nêmesis' }
];

/* Ícone novo pra cada opção do seletor — vem da mesma função central
   usada em todo o resto do sistema (getIconeSVG/getAnguloCirculoSVG):
   simples ou 3D conforme o toggle do astrólogo, igual em qualquer outro
   lugar. ASC usa o mesmo triângulo com rótulo do ASC/DSC/MC/IC da roda
   (getAnguloCirculoSVG, já usado no Painel Técnico) — antes era só um
   texto "ASC" cru, sem ícone nenhum. */
function getIconeOpcaoRotacaoCasa1(key, tamanho) {
  if (key === 'ASC') {
    return (typeof getAnguloCirculoSVG === 'function') ? getAnguloCirculoSVG('ASC', tamanho) : 'ASC';
  }
  if (typeof getIconeSVG !== 'function') return '';
  return getIconeSVG('lote', LOTE_ICON_KEY_SELETOR[key] || 'fortune', tamanho);
}

/* INJEÇÃO DO BOTÃO DE ROTAÇÃO NA BARRA SUPERIOR */
function injetarBotaoRotacaoNaBarraSuperior() {
  const parentContainer = document.getElementById('mandala-controls-overlay');
  if (!parentContainer) return;

  let btnContainer = document.getElementById('lotRotationBtnContainer');
  if (!btnContainer) {
    btnContainer = document.createElement('div');
    btnContainer.id = 'lotRotationBtnContainer';
    btnContainer.style.cssText = "display: inline-flex; align-items: center; justify-content: center; position: relative; margin-right: 6px;";
    parentContainer.insertBefore(btnContainer, parentContainer.firstChild);
  }

  /* Tamanho do botão/menu proporcional ao time-stepper (o controle de
     avançar/voltar no tempo, mesma barra superior) — antes o botão era
     bem mais estreito (32px) que o stepper, e os ícones novos não
     cabiam direito nesse espaço apertado. */
  const ladoBotao = 44;
  const tamanhoIcone = 28;

  const iconContent = getIconeOpcaoRotacaoCasa1(selectedHouse1Lot, tamanhoIcone);

  const itensMenuHTML = OPCOES_ROTACAO_CASA1.map(opcao => `
        <div onclick="alternarRotacaoCasa1('${opcao.key}')" title="${opcao.label}" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;">${getIconeOpcaoRotacaoCasa1(opcao.key, tamanhoIcone)}</div>`).join('');

    btnContainer.innerHTML = `
    <div style="position: relative; display: inline-block;">
      <button type="button" onclick="const menu=document.getElementById('lotMenuList'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: ${ladoBotao}px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Mudar Casa 1 (Lotes)">
        ${iconContent}
      </button>
      <div id="lotMenuList" style="display: none; position: absolute; top: 36px; left: 0; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: ${ladoBotao}px; box-sizing: border-box;">${itensMenuHTML}
      </div>
    </div>
  `;
}

function alternarRotacaoCasa1(val) {
  selectedHouse1Lot = val;
  renderMandala();
}

/* Botão "Adicionar ao Relatório" da mandala — fica ao lado do botão de
   rotação (mesma barra superior, um container à parte de #mandala-container,
   então nunca aparece na própria imagem gerada). Serve pra mandar pro
   relatório a mandala EXATAMENTE como está na tela agora, com qualquer
   ponto na Casa 1 (ASC, Fortuna, Espírito, ou qualquer dos outros lotes) —
   não só os dois fixos (mandala_natal / mandala_fortuna) que o relatório
   já calculava sozinho. */
function injetarBotaoRelatorioNaBarraSuperior() {
  const rotationContainer = document.getElementById('lotRotationBtnContainer');
  if (!rotationContainer || document.getElementById('mandalaRelatorioBtnContainer')) return;

  const btn = document.createElement('button');
  btn.id = 'mandalaRelatorioBtnContainer';
  btn.type = 'button';
  btn.title = 'Adiciona a mandala ao Relatório, exatamente do jeito que está agora (com a rotação de Casa 1 escolhida)';
  btn.style.cssText = "width: 32px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);";
  /* Só o ícone monoline do Relatório (o mesmo da barra superior do
     site), sem texto — pedido do astrólogo. */
  btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>';
  btn.onclick = capturarMandalaAtualParaRelatorio;
  rotationContainer.after(btn);

  /* Botão "Salvar na galeria" (ícone de imagem), logo depois do do
     Relatório — ver salvarImagemMandala. */
  const btnGaleria = document.createElement('button');
  btnGaleria.id = 'mandalaSalvarImagemBtnContainer';
  btnGaleria.type = 'button';
  btnGaleria.title = 'Salvar a mandala como imagem na galeria';
  btnGaleria.style.cssText = btn.style.cssText;
  btnGaleria.innerHTML = '<svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>';
  btnGaleria.onclick = salvarImagemMandala;
  btn.after(btnGaleria);
}

/* Botão da barra da Mandala (só aparece no Tema Céu, ver #btn-mandala-papiro em index.html): alterna a mandala
   da tela entre o céu e a folha de papiro com a roda em tinta (mais contraste, pra mostrar o texto). Fica no
   modo escolhido até apertar de novo — não volta sozinho. Não é salvo: ao recarregar a página abre no céu. */
function alternarMandalaPapiro() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) return;
  window.mandalaPapiroTela = !window.mandalaPapiroTela;
  const botaoMatriz = document.getElementById('btn-matriz-visibilidade-mandala');
  if (botaoMatriz) botaoMatriz.classList.remove('matriz-visibilidade-ativa'); // se a Matriz estava na tela, o redesenho a substitui
  renderMandala();
}
window.alternarMandalaPapiro = alternarMandalaPapiro;

async function capturarMandalaAtualParaRelatorio() {
  // Com a Matriz de Visibilidade na tela (no lugar da mandala), o botão da
  // barra de cima manda a MATRIZ — não redesenha a mandala por cima dela.
  if (document.getElementById('matrizVisibilidadeResponsivaRoot') && typeof capturarMatrizVisibilidadeMandalaParaRelatorio === 'function') {
    return capturarMatrizVisibilidadeMandalaParaRelatorio();
  }
  if (!currentCalculatedData) { alert('Nenhum mapa carregado pra adicionar ao relatório.'); return; }
  // 'claro' + fundoTransparente: essa captura pode acabar tanto numa página
  // do corpo do relatório (papel branco de sempre) quanto na CAPA (qualquer
  // cor escolhida no modelo, decidida só depois, nem sempre no mesmo
  // instante da captura) — sem fundo nenhum, encaixa nos dois lugares sem
  // sobrar quadrado, e sem depender do Tema Escuro do menu que estava
  // ligado ou não bem na hora em que o astrólogo clicou aqui (mesmo bug do
  // "quadrado" da Mandala Natal/Fortuna, ver renderizarMandalasDoPreset em
  // relatorio.js — só que aqui é capturado uma vez só, então usa sempre a
  // tinta 'claro', a mais segura pro uso mais comum, que é o corpo). */
  /* Tema Céu: a imagem que vai pro relatório segue o que está na tela (botão céu/papiro, ver alternarMandalaPapiro):
     - papiro: roda em tinta SEM fundo, pra aproveitar o papiro que já está na folha do relatório;
     - céu: a mandala COM o céu (um retângulo de céu, "foto" em cima do papiro) — pra mostrar as duas versões.
     Em ambos mantém a rotação de Casa 1 da tela. Depois de capturar, redesenha a mandala normal na tela (o desenho
     da captura troca a imagem da tela por uns instantes). */
  const temaCeuCaptura = typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu';
  const ceuComFundo = temaCeuCaptura && !window.mandalaPapiroTela;
  let dataUrl = await new Promise(resolve => ceuComFundo
    ? renderMandala(null, resolve, 'claro', false, null, null, true, false) // céu inteiro + cabeçalho em papiro (como na tela)
    : temaCeuCaptura
      ? renderMandala(null, resolve, 'claro', true, null, null, false, false, true)
      : renderMandala(null, resolve, 'claro', true));
  // O céu é uma imagem cheia (não tem transparência pra aproveitar) e sai bem grande: reduz já aqui pra não pesar no rascunho.
  if (ceuComFundo && typeof relatorioRedimensionarPngDataUrl === 'function') dataUrl = await relatorioRedimensionarPngDataUrl(dataUrl, 1600);
  if (temaCeuCaptura) renderMandala();
  const total = adicionarCapturaRelatorio('mandala_personalizada', dataUrl);
  alert(`Mandala adicionada ao relatório, do jeito que está na tela agora (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
}
window.capturarMandalaAtualParaRelatorio = capturarMandalaAtualParaRelatorio;

/* ZOOM DA MANDALA (botões +/-) — pra quem está num computador sem
   touchscreen, sem gesto de pinça disponível pra ampliar. Escala só a
   IMAGEM da mandala via CSS transform, sem tocar no zoom do navegador
   (que ampliaria a tela inteira) e sem interferir no pinça do iPad, que
   continua funcionando do mesmo jeito de sempre.
   Fica no #mandala-controls-overlay entre o botão "Adicionar ao
   Relatório" e o stepper de tempo (ver injetarControleZoomMandala). */
const MANDALA_ZOOM_MIN = 50;
const MANDALA_ZOOM_MAX = 200;
const MANDALA_ZOOM_PASSO = 10;
let mandalaZoomPercent = 100;

function ajustarZoomMandala(delta) {
  mandalaZoomPercent = Math.max(MANDALA_ZOOM_MIN, Math.min(MANDALA_ZOOM_MAX, mandalaZoomPercent + delta));
  const img = document.getElementById('mandalaImg');
  if (img) img.style.transform = `scale(${(mandalaZoomPercent / 100).toFixed(2)})`;
  const label = document.getElementById('mandalaZoomLabel');
  if (label) label.textContent = `${mandalaZoomPercent}%`;
  // O fundo do Tema Céu acompanha o zoom (a imagem anima por ~120ms).
  if (typeof alinharFundoCeuTela === 'function') { alinharFundoCeuTela(); setTimeout(alinharFundoCeuTela, 160); }
}
window.ajustarZoomMandala = ajustarZoomMandala;

function injetarControleZoomMandala() {
  const overlay = document.getElementById('mandala-controls-overlay');
  if (!overlay) return;

  const existente = document.getElementById('mandalaZoomContainer');

  /* Esse zoom por botão foi pensado pra quem está num computador sem
     gesto de pinça disponível (ver comentário acima) — no celular já dá
     pra ampliar a mandala com o dedo, então esse controle não faz
     sentido lá: só ocupa espaço e contribuía pro
     #mandala-controls-overlay quebrar em duas linhas à toa (pedido do
     astrólogo, 29/09/2026). Remove se já tinha sido injetado antes de a
     tela ficar estreita (ex.: redimensionar a janela). */
  if (window.innerWidth <= 600) {
    if (existente) existente.remove();
    return;
  }
  if (existente) return;

  const zoomContainer = document.createElement('div');
  zoomContainer.id = 'mandalaZoomContainer';
  zoomContainer.style.cssText = "background: var(--bg-main); border: 1px solid var(--gold-primary); border-radius: 8px; padding: 4px 6px; display: flex; align-items: center; gap: 6px;";
  zoomContainer.innerHTML = `
    <button type="button" onclick="ajustarZoomMandala(-${MANDALA_ZOOM_PASSO})" title="Diminuir zoom da mandala" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--gold-primary); background: var(--bg-card); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--primary-blue); font-size: 15px; font-weight: 700; line-height: 1; padding: 0;">－</button>
    <span id="mandalaZoomLabel" style="min-width: 34px; text-align: center; font-size: 11px; font-weight: 700; color: var(--primary-blue); font-variant-numeric: tabular-nums;">${mandalaZoomPercent}%</span>
    <button type="button" onclick="ajustarZoomMandala(${MANDALA_ZOOM_PASSO})" title="Aumentar zoom da mandala" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--gold-primary); background: var(--bg-card); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--primary-blue); font-size: 15px; font-weight: 700; line-height: 1; padding: 0;">＋</button>
  `;

  // Entre o botão de Relatório e o stepper de tempo — nunca no início da
  // barra (antes do ícone de rotação de Casa 1) nem no fim (depois do
  // stepper), pra não embaralhar a ordem dos controles já existentes.
  const relatorioBtn = document.getElementById('mandalaSalvarImagemBtnContainer') || document.getElementById('mandalaRelatorioBtnContainer');
  if (relatorioBtn) {
    relatorioBtn.after(zoomContainer);
  } else {
    overlay.appendChild(zoomContainer);
  }
}

/* #mandala-actions-overlay (canto esquerdo: salvar, atualizar momento,
   Revolução Solar) precisa ficar abaixo de #mandala-controls-overlay
   (canto direito: seletor de Casa 1, Adicionar ao Relatório, zoom,
   stepper de tempo) só quando a tela é estreita demais pra caberem os
   dois lado a lado na mesma linha (ver @media max-width:600px em
   index.html, onde #mandala-controls-overlay ganha flex-wrap e pode
   virar 1 ou 2 linhas dependendo da largura). Um valor fixo de "top"
   pro empurrão (como um antigo top:56px chutado) só acerta pra UM dos
   dois casos (1 linha OU 2 linhas) — por isso mede a altura de verdade
   do outro container em JS, mesmo padrão já usado no espaçador da
   barra fixa do editor de Relatório (ajustarEspacadorBarraFixaEditor,
   relatorio.js). Chamada de novo em "resize" porque virar o celular
   (ou redimensionar a janela) pode mudar se cabe numa linha só ou não. */
function ajustarPosicaoMandalaActionsOverlay() {
  const controls = document.getElementById('mandala-controls-overlay');
  const actions = document.getElementById('mandala-actions-overlay');
  if (!controls || !actions) return;

  if (window.innerWidth > 600) {
    actions.style.top = '';
    return;
  }

  const gap = 10;
  const alturaControls = controls.offsetHeight;
  actions.style.top = (10 + alturaControls + gap) + 'px';
}

/* Reavalia os dois ajustes de #mandala-controls-overlay que dependem da
   largura da tela (esconder o zoom por botão no celular, empurrar
   #mandala-actions-overlay pra baixo) sempre que a largura pode ter
   mudado — virar o celular ou redimensionar a janela. A ordem importa:
   o zoom precisa entrar/sair ANTES de medir a altura pro empurrão,
   senão a medida fica desatualizada. */
function ajustarControlesMandalaNaLargura() {
  injetarControleZoomMandala();
  ajustarPosicaoMandalaActionsOverlay();
}
window.addEventListener('resize', ajustarControlesMandalaNaLargura);

/* CABEÇALHO PADRÃO — ÚNICA FONTE: é o cabeçalho da Mandala, e todas as
   ferramentas que mostram cabeçalho devem usar ESTE (nunca uma cópia).
   Três peças:
   - coresCabecalhoMandala: as cores (claro/escuro, ou uma cor de fundo
     forçada, usada só na capa do Relatório).
   - montarCabecalhoMandalaGrupoSVG: o desenho em si (um <g> de SVG), que a
     própria Mandala embute dentro do SVG dela.
   - montarCabecalhoMandalaImagemHTML: o mesmo desenho como <img> (SVG
     isolado, igual à Mandala renderiza), pras outras ferramentas. */
function coresCabecalhoMandala(modoEscuro, corCabecalhoForcada) {
  // Tema Céu: o cabeçalho GLOBAL (o mesmo de todas as ferramentas) é o de papiro. Fora do
  // Tema Céu, tudo segue como sempre foi.
  if (typeof window !== 'undefined' && window.temaMandala === 'ceu') return coresCabecalhoPapiro();
  const HEX_RE = /^#[0-9a-fA-F]{6}$/;
  function luminanciaRelativaHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  const cabecalhoValido = HEX_RE.test(corCabecalhoForcada) ? corCabecalhoForcada : null;
  const cabecalhoEscuro = cabecalhoValido ? (luminanciaRelativaHex(cabecalhoValido) < 0.5) : modoEscuro;
  return {
    fundo: cabecalhoValido || (modoEscuro ? '#1c1917' : '#fffdf5'),
    borda: cabecalhoEscuro ? '#d9ae3f' : '#c59b27',
    titulo: cabecalhoEscuro ? '#8ab4e8' : '#103b70',
    dataCidade: cabecalhoEscuro ? '#c3cad4' : '#475569',
    zodiaco: cabecalhoEscuro ? '#a3aab3' : '#64748b',
    sect: cabecalhoEscuro ? '#f0c869' : '#9a6d18',
  };
}

/* CABEÇALHO EM PAPIRO (tema Céu do Relatório) — só PINTURA: mesmas
   posições, tamanhos e textos do cabeçalho de sempre, só troca o fundo
   sólido da caixinha por um papel de papiro (degradês + fibras finas,
   definidos num <defs> dentro do próprio SVG, já que este desenho vira
   imagem isolada e não enxerga CSS da página) e as tintas pro marrom/
   ocre. "papiro: true" é o sinal pra montarCabecalhoMandalaGrupoSVG
   aplicar o papel. Só o Relatório pede isso (ver o 7º parâmetro de
   renderMandala); o cabeçalho das outras ferramentas nunca passa por aqui. */
function coresCabecalhoPapiro() {
  // Convenção dos papiros: título em tinta vermelha (rubrica) e o resto em tinta preta.
  return {
    fundo: 'url(#papiroCabBase)',
    borda: '#1d3a66', // sem uso hoje (o papel não tem contorno), mantido por compatibilidade com o formato das outras paletas
    titulo: '#1d3a66', // usado por quem desenha títulos de ferramenta por fora do cabeçalho (inalterado)
    nome: '#a03e25',   // NOME DO CLIENTE: terracota (rubrica)
    rotulo: '#1a1410', // rótulos DIA/HORA: preto
    dataCidade: '#1a1410',
    zodiaco: '#1a1410',
    sect: '#1a1410',   // "Natividade Diurna/Noturna": preto
    papiro: true,
  };
}

/* CABEÇALHO "TINTA SOBRE A FOLHA" (Tema Céu): mesmas cores de tinta do cabeçalho em papiro, mas SEM
   papel nem recorte — pra ferramentas cuja tela já é uma folha de papiro (o papiro do cabeçalho
   ficaria "papel em cima de papel"). O papiro recortado continua pro cabeçalho que flutua direto
   no céu (capa do Relatório, imagem da Mandala). Quem quer a tinta pede com
   opcoes.tintaSobreFolha em montarCabecalhoMandalaImagemHTML. */
function coresCabecalhoTinta() {
  return Object.assign(coresCabecalhoPapiro(), { fundo: 'none', borda: 'none', papiro: false });
}

/* Borda "rasgada" do papiro: um polígono que ocupa o MESMO retângulo do
   cabeçalho (x=15, largura w, altura h), só que com as bordas irregulares
   — recuo de 0 a ~4px, sempre pra DENTRO, então nada sai da área original
   (o texto começa a 15px da borda; nunca é cortado). Determinístico (mesma
   entrada, mesmo recorte; nunca aleatório de verdade), pra o PNG não mudar
   entre uma geração e outra do mesmo relatório. */
function caminhoBordaPapiro(x, y, w, h) {
  let seed = (Math.round(w) * 73856093) ^ (Math.round(h) * 19349663);
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rec = () => (rnd() * 4).toFixed(1) * 1; // recuo 0..4px
  const pts = [];
  const lado = (x0, y0, x1, y1, passo, normalX, normalY) => {
    const comp = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(comp / passo));
    for (let i = 0; i < n; i++) {
      const t = i / n, r = rec();
      pts.push([x0 + (x1 - x0) * t + normalX * r, y0 + (y1 - y0) * t + normalY * r]);
    }
  };
  lado(x + 6, y, x + w - 6, y, 18, 0, 1);              // topo (recua pra baixo)
  lado(x + w, y + 6, x + w, y + h - 6, 14, -1, 0);     // direita (recua pra esquerda)
  lado(x + w - 6, y + h, x + 6, y + h, 18, 0, -1);     // base (recua pra cima)
  lado(x, y + h - 6, x, y + 6, 14, 1, 0);              // esquerda (recua pra direita)
  return 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') + ' Z';
}

let _papiroCabContador = 0;
function aplicarPapiroNoCabecalhoSVG(svg) {
  const sf = '_' + (_papiroCabContador++);
  const defs = `<defs>
    ${papiroGradienteSvg('papiroCabBase' + sf)}
    <radialGradient id="papiroCabLuz${sf}" cx="0.18" cy="0.2" r="0.6">
      <stop offset="0%" stop-color="#fff4d2" stop-opacity="0.6"/><stop offset="100%" stop-color="#fff4d2" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="papiroCabSombra${sf}" cx="0.9" cy="0.9" r="0.6">
      <stop offset="0%" stop-color="#6e461e" stop-opacity="0.22"/><stop offset="100%" stop-color="#6e461e" stop-opacity="0"/>
    </radialGradient>
    <pattern id="papiroCabFibras${sf}" width="27" height="6" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0.5" x2="27" y2="0.5" stroke="#785528" stroke-opacity="0.07" stroke-width="1"/>
      <line x1="13.5" y1="0" x2="13.5" y2="6" stroke="#966e3c" stroke-opacity="0.05" stroke-width="2"/>
    </pattern>
  </defs>`;
  const m = svg.match(/<rect x="15" y="[\d.\-]+" width="[\d.]+" height="[\d.]+" rx="10" ry="10"[^>]*\/>/);
  if (!m) return svg;
  const attrs = m[0].match(/x="15" y="([\d.\-]+)" width="([\d.]+)" height="([\d.]+)"/);
  // Sem contorno: o papel é só o polígono de borda irregular (o retângulo
  // com stroke original é substituído por ele).
  const d = caminhoBordaPapiro(15, parseFloat(attrs[1]), parseFloat(attrs[2]), parseFloat(attrs[3]));
  const camada = fill => `<path d="${d}" fill="${fill}"/>`;
  const papel = camada(`url(#papiroCabBase${sf})`) + camada(`url(#papiroCabLuz${sf})`) + camada(`url(#papiroCabSombra${sf})`) + camada(`url(#papiroCabFibras${sf})`);
  return defs + svg.replace(m[0], papel);
}

/* "loteCasa1" (chave: fortune/spirit/venus/mercury/mars/jupiter/saturn, ou
   null) — quando a Casa 1 do desenho NÃO é o Ascendente, o cabeçalho avisa
   "Lote tal na Casa 1" (depois de Natividade Diurna/Noturna), pra ninguém
   confundir com um mapa normal. Quem não gira o mapa (Painel Técnico,
   Matriz) nunca passa nada aqui e a linha nunca aparece. */
const ROTULOS_LOTE_CASA1 = {
  fortune: 'Lote da Fortuna', spirit: 'Lote do Espírito', venus: 'Lote de Eros',
  mercury: 'Lote da Necessidade', mars: 'Lote da Audácia', jupiter: 'Lote da Vitória', saturn: 'Lote de Nêmesis'
};
/* opcoes (todas opcionais): { largura (padrão 960; abaixo de 900 usa o
   layout ESTREITO, que quebra as linhas longas em vez de cortar), titulo
   (nome; padrão = cliente atual), momento (Date; padrão = momento atual),
   tipoMapa ('Natal', 'Revolução Solar'...; padrão = tipo atual), horasInfo
   (objeto ou null; padrão = Hora Planetária atual), alturaMinima (pra dois
   cabeçalhos lado a lado ficarem com a mesma altura), geo ({city, fuso, lon};
   padrão = local atual) }.
   Devolve { svg, altura } — o layout LARGO (960) é exatamente o de sempre. */
function medirTextoCabecalho(texto, px, peso) {
  try {
    const ctx = medirTextoCabecalho._ctx || (medirTextoCabecalho._ctx = document.createElement('canvas').getContext('2d'));
    ctx.font = `${peso} ${px}px sans-serif`;
    return ctx.measureText(texto).width;
  } catch (e) {
    return texto.length * px * 0.58;
  }
}

/* Quebra uma sequência de trechos coloridos ({t, cor, peso}) em linhas que caibam
   em maxW, sem cortar palavra. Cada linha é uma lista de trechos. */
function quebrarTrechosCabecalho(trechos, maxW, px) {
  const linhas = [[]];
  let usado = 0;
  const espaco = medirTextoCabecalho(' ', px, 600);
  trechos.forEach(tr => {
    const palavras = tr.t.split(' ').filter(Boolean);
    palavras.forEach(pal => {
      const w = medirTextoCabecalho(pal, px, tr.peso || 600);
      const atual = linhas[linhas.length - 1];
      const precisa = atual.length ? usado + espaco + w : w;
      if (atual.length && precisa > maxW) {
        linhas.push([{ t: pal, cor: tr.cor, peso: tr.peso }]);
        usado = w;
      } else {
        const ultimo = atual[atual.length - 1];
        if (ultimo && ultimo.cor === tr.cor && ultimo.peso === tr.peso) ultimo.t += ' ' + pal;
        else atual.push({ t: (atual.length ? ' ' : '') + pal, cor: tr.cor, peso: tr.peso });
        usado = precisa;
      }
    });
  });
  return linhas;
}

function montarCabecalhoMandalaLayout(data, headerY, cores, loteCasa1, opcoes) {
  opcoes = opcoes || {};
  const largura = opcoes.largura || 960;
  const headerTitle = opcoes.titulo !== undefined ? opcoes.titulo : currentSubjectName;
  const tipoAtual = opcoes.tipoMapa || ((typeof window.currentMapType !== 'undefined' && window.currentMapType) ? window.currentMapType : 'Natal');
  const tipoFormatado = tipoAtual === 'Natal' ? 'Mapa Natal' : `Mapa de ${tipoAtual}`;
  const momento = opcoes.momento || currentMoment;
  const geoCab = opcoes.geo || currentGeo;

  const sunDef = PLANETS_DEF.find(p => p.id === 'Sun');
  const sunItem = data[sunDef ? sunDef.key : 'Sol'];
  const sunAbs = sunItem ? sunItem.grau_absoluto : 0;
  const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
  const isDay = ((sunAbs - ascAbs + 360) % 360) >= 180;
  const sectText = isDay ? "• Natividade Diurna" : "• Natividade Noturna";
  const loteTexto = (loteCasa1 && ROTULOS_LOTE_CASA1[loteCasa1]) ? `• ${ROTULOS_LOTE_CASA1[loteCasa1]} na Casa 1` : '';

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diaSemanaFormatted = diasSemana[momento.getDay()];
  const fusoVal = (geoCab && geoCab.fuso !== undefined) ? geoCab.fuso : calcularFusoPorLongitude(geoCab.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
  const ano = momento.getFullYear();
  const mes = String(momento.getMonth() + 1).padStart(2, '0');
  const dia = String(momento.getDate()).padStart(2, '0');
  const hora = String(momento.getHours()).padStart(2, '0');
  const min = String(momento.getMinutes()).padStart(2, '0');
  const horasInfo = opcoes.horasInfo !== undefined ? opcoes.horasInfo : ((typeof window.horasPlanetariasAtual !== 'undefined') ? window.horasPlanetariasAtual : null);
  const temDia = !!(horasInfo && horasInfo.dayRulerId && PLANETS_DEF.some(p => p.id === horasInfo.dayRulerId));
  const temHora = !!(horasInfo && horasInfo.hourRulerId && PLANETS_DEF.some(p => p.id === horasInfo.hourRulerId));

  let svg, altura;
  if (largura >= 900) {
    /* LAYOUT LARGO (960) — o de sempre, byte a byte. */
    altura = 75;
    svg = `<g id="png-discreet-header">
    <!-- Fundo (creme/escuro conforme o modo) e Borda Dourada Estendidos quase até o fim -->
    <rect x="15" y="${headerY}" width="930" height="75" rx="10" ry="10" fill="${cores.fundo}" stroke="${cores.borda}" stroke-width="2" />

    <!-- Textos das 3 Linhas alinhados à esquerda -->
    <text x="30" y="${headerY + 23}" font-family="'Cinzel', serif" font-size="20" font-weight="800" fill="${cores.nome || cores.titulo}">${escapeHtml(headerTitle)}</text>
    <text x="30" y="${headerY + 41}" font-family="'Montserrat', sans-serif" font-size="12" font-weight="500" fill="${cores.dataCidade}">${diaSemanaFormatted} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted}) • ${escapeHtml(geoCab.city)}</text>
        <text x="30" y="${headerY + 57}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="600" fill="${cores.zodiaco}">Zodíaco Tropical • Signos Inteiros • ${escapeHtml(tipoFormatado)} <tspan fill="${cores.sect}" font-weight="700">  ${sectText}${loteTexto ? `  ${loteTexto}` : ''}</tspan></text>
  </g>`;
    if (horasInfo) {
      /* Rótulo (DIA / HORA) em cima e o planeta embaixo dele, cada um numa
         coluna — desenho único do software inteiro. */
      if (temDia) {
        svg += `<text x="840" y="${headerY + 22}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="700" fill="${cores.rotulo || cores.titulo}" text-anchor="middle">DIA</text>
      <g transform="translate(840, ${headerY + 49})"><g transform="scale(0.36) translate(-50, -50)">${planetIconFragment(horasInfo.dayRulerId)}</g></g>`;
      }
      if (temHora) {
        svg += `<text x="910" y="${headerY + 22}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="700" fill="${cores.rotulo || cores.titulo}" text-anchor="middle">HORA</text>
      <g transform="translate(910, ${headerY + 49})"><g transform="scale(0.36) translate(-50, -50)">${planetIconFragment(horasInfo.hourRulerId)}</g></g>`;
      }
    }
    return { svg, altura };
  }

  /* LAYOUT ESTREITO (ex.: um cabeçalho por mandala, lado a lado): mesmas fontes,
     mesmas cores e mesmos textos — só quebra em mais linhas o que não cabe. */
  const reservaHoras = (temDia || temHora) ? 105 : 0;
  const maxW = largura - 60 - reservaHoras;
  const linhasTitulo = quebrarTrechosCabecalho([{ t: headerTitle, cor: cores.titulo, peso: 800 }], maxW, 20);
  const linhasData = quebrarTrechosCabecalho([{ t: `${diaSemanaFormatted} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted}) • ${geoCab.city}`, cor: cores.dataCidade, peso: 500 }], maxW, 12);
  const trechosZod = [{ t: `Zodíaco Tropical • Signos Inteiros • ${tipoFormatado}`, cor: cores.zodiaco, peso: 600 }, { t: sectText, cor: cores.sect, peso: 700 }];
  if (loteTexto) trechosZod.push({ t: loteTexto, cor: cores.sect, peso: 700 });
  const linhasZod = quebrarTrechosCabecalho(trechosZod, maxW, 11);

  let y = headerY + 23, textos = '';
  linhasTitulo.forEach((ln, i) => {
    if (i > 0) y += 22;
    textos += `<text x="30" y="${y}" font-family="'Cinzel', serif" font-size="20" font-weight="800" fill="${cores.nome || cores.titulo}">${ln.map(tr => escapeHtml(tr.t)).join('')}</text>`;
  });
  y += 18;
  linhasData.forEach((ln, i) => {
    if (i > 0) y += 16;
    textos += `<text x="30" y="${y}" font-family="'Montserrat', sans-serif" font-size="12" font-weight="500" fill="${cores.dataCidade}">${ln.map(tr => escapeHtml(tr.t)).join('')}</text>`;
  });
  y += 17;
  linhasZod.forEach((ln, i) => {
    if (i > 0) y += 15;
    textos += `<text x="30" y="${y}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="600" fill="${cores.zodiaco}">${ln.map(tr => tr.cor === cores.zodiaco ? escapeHtml(tr.t) : `<tspan fill="${tr.cor}" font-weight="700">${escapeHtml(tr.t)}</tspan>`).join('')}</text>`;
  });
  altura = Math.max(75, Math.round(y - headerY + 14), opcoes.alturaMinima || 0);
  svg = `<g id="png-discreet-header"><rect x="15" y="${headerY}" width="${largura - 30}" height="${altura}" rx="10" ry="10" fill="${cores.fundo}" stroke="${cores.borda}" stroke-width="2" />${textos}`;
  if (temDia) {
    svg += `<text x="${largura - 100}" y="${headerY + 22}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="700" fill="${cores.rotulo || cores.titulo}" text-anchor="middle">DIA</text><g transform="translate(${largura - 100}, ${headerY + 49})"><g transform="scale(0.36) translate(-50, -50)">${planetIconFragment(horasInfo.dayRulerId)}</g></g>`;
  }
  if (temHora) {
    svg += `<text x="${largura - 45}" y="${headerY + 22}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="700" fill="${cores.rotulo || cores.titulo}" text-anchor="middle">HORA</text><g transform="translate(${largura - 45}, ${headerY + 49})"><g transform="scale(0.36) translate(-50, -50)">${planetIconFragment(horasInfo.hourRulerId)}</g></g>`;
  }
  svg += '</g>';
  return { svg, altura };
}
window.montarCabecalhoMandalaLayout = montarCabecalhoMandalaLayout;

function montarCabecalhoMandalaGrupoSVG(data, headerY, cores, loteCasa1, opcoes) {
  const svg = montarCabecalhoMandalaLayout(data, headerY, cores, loteCasa1, opcoes).svg;
  return (cores && cores.papiro) ? aplicarPapiroNoCabecalhoSVG(svg) : svg;
}

function montarCabecalhoMandalaImagemHTML(data, idOpcional, opcoes) {
  const modoEscuro = document.documentElement.classList.contains('tema-escuro');
  const tintaSobreFolha = !!(opcoes && opcoes.tintaSobreFolha) && window.temaMandala === 'ceu';
  const cores = tintaSobreFolha ? coresCabecalhoTinta() : coresCabecalhoMandala(modoEscuro, null);
  /* SVG DIRETO na página (não <img>): o Safari do iPad não desenhava certo
     SVG-dentro-de-<img> na captura (saía vazio/cortado). Direto na página
     é o mesmo tipo de desenho da tabela do Painel Técnico, que captura
     certo. As fontes ficam nas famílias genéricas (serif/sans-serif) pra
     ficar IDÊNTICO ao cabeçalho da Mandala, que é desenhado como imagem
     isolada e por isso também não usa Cinzel/Montserrat. */
  const largura = (opcoes && opcoes.largura) || 960;
  const layout = montarCabecalhoMandalaLayout(data, 2, cores, opcoes && opcoes.loteCasa1, opcoes);
  /* Tinta sobre a folha: duas linhas finas de tinta (em cima e embaixo) separam o cabeçalho do resto da folha. */
  const regua = y => `<line x1="15" y1="${y}" x2="${largura - 15}" y2="${y}" stroke="#1a1410" stroke-opacity="0.55" stroke-width="1"/>`;
  const svgCab = tintaSobreFolha ? regua(1) + layout.svg + regua(layout.altura + 3) : layout.svg;
  const grupo = (cores.papiro ? aplicarPapiroNoCabecalhoSVG(svgCab) : svgCab)
    .replace(/'Cinzel', serif/g, 'serif')
    .replace(/'Montserrat', sans-serif/g, 'sans-serif');
  const altura = layout.altura + 4;
  return `<div${idOpcional ? ` id="${idOpcional}"` : ''} style="margin: 0 auto 16px auto; box-sizing: border-box;"><svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" style="display: block; width: 100%; height: auto;">${grupo}</svg></div>`;
}
window.montarCabecalhoMandalaImagemHTML = montarCabecalhoMandalaImagemHTML;

/* Recorta uma captura rente ao conteúdo, com uma margem de ~3 mm desenhada nos 4 lados — pra imagem que vai pro Relatório não
   levar um monte de fundo creme ao redor de uma tabela estreita. "fundo" é a
   cor de fundo usada na captura (hex). Nunca falha: se algo der errado ou não
   achar conteúdo, devolve o canvas original. */
function recortarCanvasAoConteudo(canvas, fundo, margemCssPx) {
  try {
    const margem = Math.round((margemCssPx === undefined ? 11 : margemCssPx) * 2); // escala 2 da captura
    const w = canvas.width, h = canvas.height;
    const dados = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    // "fundo" vazio/null = captura SEM fundo (transparente): conteúdo é tudo que tem alguma opacidade.
    const bgR = fundo ? parseInt(fundo.slice(1, 3), 16) : 0, bgG = fundo ? parseInt(fundo.slice(3, 5), 16) : 0, bgB = fundo ? parseInt(fundo.slice(5, 7), 16) : 0;
    const difere = fundo
      ? (i) => dados[i + 3] > 8 && (Math.abs(dados[i] - bgR) > 10 || Math.abs(dados[i + 1] - bgG) > 10 || Math.abs(dados[i + 2] - bgB) > 10)
      : (i) => dados[i + 3] > 8;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      const linha = y * w * 4;
      for (let x = 0; x < w; x++) {
        if (difere(linha + x * 4)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return canvas;
    // Recorta exatamente o conteúdo e DESENHA a margem em volta (em vez de
    // só "sobrar" da captura original) — assim a margem é a mesma nos 4
    // lados mesmo quando a captura já vinha rente ao conteúdo em cima/embaixo.
    const cw = maxX + 1 - minX, ch = maxY + 1 - minY;
    const innerW = cw + (margem * 2), innerH = ch + (margem * 2);
    // A IMAGEM JÁ NASCE NO TAMANHO QUE CABE NA FOLHA: a área útil da página de
    // captura do Relatório é 190 x 230 mm. Se a imagem for mais alta que essa
    // proporção, ganha laterais TRANSPARENTES até ficar exatamente nela, com o
    // conteúdo centralizado (= encolhido pra caber). Assim ela cabe por
    // construção, em qualquer navegador, sem depender de CSS.
    const PROPORCAO_MAX_ALTURA = 230 / 190;
    const saidaW = (innerH / innerW) > PROPORCAO_MAX_ALTURA ? Math.ceil(innerH / PROPORCAO_MAX_ALTURA) : innerW;
    const saida = document.createElement('canvas');
    saida.width = saidaW;
    saida.height = innerH;
    const ctx = saida.getContext('2d'); // fundo transparente: nada de retângulo creme na folha branca
    ctx.drawImage(canvas, minX, minY, cw, ch, Math.round((saidaW - cw) / 2), margem, cw, ch);
    return saida;
  } catch (e) {
    console.error('Erro ao recortar a captura:', e);
    return canvas;
  }
}
window.recortarCanvasAoConteudo = recortarCanvasAoConteudo;

/* PLANETAS DO TEMA CÉU — como no Stellarium: ponto de luz (branco, brilho
   diferente por planeta) com o glifo AO LADO. Sol = brilho macio com núcleo
   estourado; Lua = disco com a fase. Os glifos são as silhuetas dos ícones
   "simples" do próprio software (planetIcons.js), pintadas de preto de dia
   e de branco à noite. Só pintura/desenho do ponto — a linha conectora e o
   grau continuam os de sempre. */
function misturarHexCeu(c1, c2, t) {
  const a = [1, 3, 5].map(i => parseInt(c1.slice(i, i + 2), 16)), b = [1, 3, 5].map(i => parseInt(c2.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function glifoSilhuetaCeu(id, x, y, tam, cor, halo, larguraHalo) {
  const bruto = (typeof ICONES_SIMPLES_NOVO !== 'undefined' && ICONES_SIMPLES_NOVO.planeta && ICONES_SIMPLES_NOVO.planeta[id]) || '';
  if (!bruto) return '';
  const miolo = bruto.slice(bruto.indexOf('>') + 1, bruto.lastIndexOf('</svg>')).replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/fill="url\(#\w+\)"/g, `fill="${cor}"`);
  const k = tam / 100;
  const pos = `translate(${(x - tam / 2).toFixed(1)} ${(y - tam / 2).toFixed(1)}) scale(${k.toFixed(3)})`;
  // Duas camadas: contorno (halo, atrás) e o glifo por cima, com um traço fino da própria cor
  // pra engrossar as linhas — os glifos simples são bem finos e sumiam no zoom normal.
  return `<g transform="${pos}" stroke="${halo}" stroke-width="${(larguraHalo * 2.2 / k).toFixed(2)}" stroke-linejoin="round">${miolo}</g>`
    + `<g transform="${pos}" stroke="${cor}" stroke-width="${(1.1 / k).toFixed(2)}" stroke-linejoin="round">${miolo}</g>`;
}

/* o = { id, x, y (posição REAL do ponto de luz, nunca desviada), gx, gy (onde
   o glifo fica — só ele desvia, e só lateralmente), dia (0..1), noCeu (true =
   acima do horizonte), elevacao, luaFrac (0..1), luaCrescente, luaInvertida
   (hemisfério Sul) } */
function desenharPlanetaCeuSVG(o) {
  const { id, x, y, gx, gy, dia, noCeu, elevacao } = o;
  const claro = noCeu ? dia : 0;                       // abaixo do horizonte (espaço) = sempre "noite"
  const corGlifo = misturarHexCeu('#ffffff', '#0b0b10', claro);
  const corContorno = (noCeu && claro > 0.5) ? 'rgba(255,255,255,.75)' : 'rgba(11,18,48,.6)';
  const gid = 'plc' + id;
  let corpo = '';
  if (id === 'Sun') {
    const calor = 1 - Math.max(0, Math.min(1, (elevacao - 0.0) / 0.4));
    const c2 = misturarHexCeu('#e4efff', '#ffc896', calor), c3 = misturarHexCeu('#ffffff', '#ffe2c4', calor);
    corpo = `<defs><radialGradient id="${gid}"><stop offset="0%" stop-color="#fff"/><stop offset="9%" stop-color="#fff"/><stop offset="13%" stop-color="${c3}" stop-opacity=".92"/><stop offset="22%" stop-color="${c3}" stop-opacity=".6"/><stop offset="40%" stop-color="${c2}" stop-opacity=".28"/><stop offset="70%" stop-color="${c2}" stop-opacity=".08"/><stop offset="100%" stop-color="${c2}" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${x}" cy="${y}" r="112" fill="url(#${gid})"/>`
      + glifoSilhuetaCeu('Sun', gx, gy, 30, corGlifo, corContorno, 2);
  } else if (id === 'Moon') {
    const r = 13, frac = o.luaFrac, cresc = o.luaCrescente !== o.luaInvertida;
    const luz = cresc ? 1 : -1, rx = r * Math.abs(1 - 2 * frac);
    const sweepOuter = luz > 0 ? 1 : 0, sweepTerm = (frac < 0.5) ? (luz > 0 ? 0 : 1) : (luz > 0 ? 1 : 0);
    let d = '';
    if (frac >= 0.98) d = `M ${x - r} ${y} A ${r} ${r} 0 1 1 ${x + r} ${y} A ${r} ${r} 0 1 1 ${x - r} ${y}`;
    else if (frac > 0.02) d = `M ${x} ${y - r} A ${r} ${r} 0 0 ${sweepOuter} ${x} ${y + r} A ${rx.toFixed(2)} ${r} 0 0 ${sweepTerm} ${x} ${y - r} Z`;
    const esc = misturarHexCeu('#2a3558', '#7a8bb5', claro * 0.9);
    corpo = `<defs><radialGradient id="${gid}"><stop offset="0%" stop-color="#eaf0ff" stop-opacity="${(0.5 - 0.3 * claro).toFixed(2)}"/><stop offset="100%" stop-color="#eaf0ff" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="url(#${gid})"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${esc}" fill-opacity="${(0.9 - 0.35 * claro).toFixed(2)}" stroke="rgba(220,230,255,${(0.35 - 0.1 * claro).toFixed(2)})" stroke-width="1"/>
      ${d ? `<path d="${d}" fill="#fffef2"/>` : ''}`
      + glifoSilhuetaCeu('Moon', gx, gy, 28, corGlifo, corContorno, 2);
  } else {
    const BR = { Mercury: 0.55, Venus: 1, Mars: 0.6, Jupiter: 0.85, Saturn: 0.65 }[id] || 0.6;
    const DV = { Mercury: 0.06, Venus: 0.5, Mars: 0.08, Jupiter: 0.22, Saturn: 0.08 }[id] || 0.1;
    const vis = noCeu ? (1 - claro) + claro * DV : 1;     // de dia, no céu, o brilho quase se apaga
    const core = 3.4 + 3.6 * BR, halo = core * (4.6 - 1.4 * claro);
    corpo = `<defs><radialGradient id="${gid}"><stop offset="0%" stop-color="#fff" stop-opacity="${(0.95 * vis).toFixed(3)}"/><stop offset="30%" stop-color="#fff" stop-opacity="${((0.4 * BR + 0.1) * vis).toFixed(3)}"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${x}" cy="${y}" r="${halo.toFixed(1)}" fill="url(#${gid})"/>
      <circle cx="${x}" cy="${y}" r="${(core * 0.7).toFixed(1)}" fill="#fff" fill-opacity="${Math.min(1, vis * 1.6).toFixed(3)}"/>`
      + glifoSilhuetaCeu(id, gx, gy, 30, corGlifo, corContorno, 2);
  }
  return corpo;
}

/* ÍCONE DOS ÂNGULOS (ASC/DSC/MC/IC) NO TEMA CÉU — mesmo estilo dos nodos e dos lotes: traço
   claro (azul-marinho de dia) dentro de um retículo tracejado, sem brilho. O triângulo vem
   do ícone do software e aponta pro ângulo certo (rotação aScreen - 180). */
function iconeAnguloCeuSVG(aScreen, cor, rotulo, semReticulo) { // semReticulo: o retículo tracejado é do ESTILO da mandala (ver RODA_ESTILOS em roda.js)
  const bruto = (typeof ICONES_SIMPLES_NOVO !== 'undefined' && ICONES_SIMPLES_NOVO.outro && ICONES_SIMPLES_NOVO.outro.angulo) || '';
  const reticulo = semReticulo ? '' : `<circle cx="0" cy="0" r="21" fill="none" stroke="${cor}" stroke-opacity=".75" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  if (!bruto) return reticulo;
  const miolo = bruto.slice(bruto.indexOf('>') + 1, bruto.lastIndexOf('</svg>')).replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/<clipPath[\s\S]*?<\/clipPath>/g, '')
    .replace(/clip-path="[^"]*"/g, '').replace(/stroke-width="[\d.]+"/g, 'stroke-width="5"').replace(/fill="#fff"/g, `fill="${cor}" fill-opacity=".18"`).replace(/stroke="#000"/g, `stroke="${cor}"`);
  return reticulo + `<g transform="scale(0.34) translate(-50, -50) rotate(${(aScreen - 180).toFixed(2)} 50 50)" fill="${cor}" fill-opacity=".16" stroke-linejoin="round">${miolo}</g>`
    + `<text x="0" y="2.8" font-size="7" font-weight="900" fill="${cor}" text-anchor="middle">${rotulo}</text>`;
}

/* PONTOS CALCULADOS NO TEMA CÉU (lotes, nodos, sizígia) — traço fino e claro
   dentro de um retículo tracejado, sem brilho: não são corpos do céu, são
   marcações calculadas sobre ele. Lotes em traço fino (contorno do ícone);
   nodos e sizígia com o preenchimento cheio do ícone. Cor: branco-azulado à
   noite, azul-marinho de dia (acima do horizonte, de dia). */
function iconeCalculadoCeuSVG(categoria, chave, cor, solido, semReticulo) { // semReticulo: o retículo tracejado é do ESTILO da mandala (ver RODA_ESTILOS em roda.js)
  const bruto = (typeof ICONES_SIMPLES_NOVO !== 'undefined' && ICONES_SIMPLES_NOVO[categoria] && ICONES_SIMPLES_NOVO[categoria][chave]) || '';
  const reticulo = semReticulo ? '' : `<circle cx="0" cy="0" r="14" fill="none" stroke="${cor}" stroke-opacity=".75" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  if (!bruto) return reticulo;
  const vb = (bruto.match(/viewBox="0 0 (\d+(?:\.\d+)?) /) || [0, 100])[1];
  const k = 22 / parseFloat(vb);
  let miolo = bruto.slice(bruto.indexOf('>') + 1, bruto.lastIndexOf('</svg>')).replace(/<defs>[\s\S]*?<\/defs>/g, '');
  miolo = miolo.replace(/fill="#fff"/g, 'fill="__n__"').replace(/fill="url\(#\w+\)"/g, solido ? `fill="${cor}"` : 'fill="__n__"')
    .replace(/fill="#000"/g, solido ? `fill="${cor}"` : 'fill="__n__"').replace(/stroke="(?:url\(#\w+\)|#000)"/g, `stroke="${cor}"`).replace(/fill="__n__"/g, 'fill="none"');
  return reticulo + `<g transform="translate(-11 -11) scale(${k.toFixed(4)})" fill="none" stroke="${cor}" stroke-width="${(solido ? 0.4 : 1.2) / k}" stroke-linejoin="round">${miolo}</g>`;
}

/* FUNDO DE TELA DO TEMA CÉU — o céu continua pra fora da imagem da
   mandala (em vez do roxo liso do fundo). É o MESMO desenho da imagem
   (mesmas cores, mesmas estrelas), só num SVG bem maior, usado como
   background do #mandala-container e alinhado ao centro da roda. */
function montarFundoCeuSVG(params, extensao) {
  const c = montarCeuMandalaSVG(Object.assign({}, params, { soHalo: false, extensao }));
  const lado = extensao * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="${params.cx - extensao} ${params.cy - extensao} ${lado} ${lado}"><defs>${c.defs}</defs>${c.corpo}</svg>`;
}

function configurarFundoCeuDaTela(container, params) {
  if (window.fundoCeuTelaUrl) { URL.revokeObjectURL(window.fundoCeuTelaUrl); window.fundoCeuTelaUrl = null; }
  window.fundoCeuTelaParams = null;
  if (!container) return;
  /* O céu é o fundo do PALCO inteiro (#main-stage), não só do container da mandala: assim também
     cobre a moldura de 10px em volta e os lados da barra fixa, em qualquer ferramenta — nada de
     borda branca. O container fica sem fundo próprio. */
  const alvo = document.getElementById('main-stage') || container;
  container.style.backgroundImage = '';
  container.style.backgroundColor = '';
  if (!params) {
    alvo.style.backgroundImage = '';
    alvo.style.backgroundColor = '';
    return;
  }
  const EXT = 1800;
  window.fundoCeuTelaUrl = URL.createObjectURL(new Blob([montarFundoCeuSVG(params, EXT)], { type: 'image/svg+xml;charset=utf-8' }));
  window.fundoCeuTelaParams = { cx: params.cx, cy: params.cy, width: params.width, ext: EXT };
  alvo.style.backgroundImage = `url("${window.fundoCeuTelaUrl}")`;
  alvo.style.backgroundRepeat = 'no-repeat';
  alvo.style.backgroundAttachment = 'scroll';
  alvo.style.backgroundColor = '#070d25';
  alinharFundoCeuTela();
  const img = document.getElementById('mandalaImg');
  if (img && !img.complete) img.addEventListener('load', alinharFundoCeuTela, { once: true });
  if (!container.dataset.ceuScroll) { container.dataset.ceuScroll = '1'; container.addEventListener('scroll', () => alinharFundoCeuTela(), { passive: true }); }
  requestAnimationFrame(alinharFundoCeuTela);
}

/* Posiciona/escala o fundo pra o centro dele coincidir com o centro da roda
   na tela (considera tamanho exibido, zoom e rolagem do container). */
function alinharFundoCeuTela() {
  const p = window.fundoCeuTelaParams;
  const alvo = document.getElementById('main-stage');
  const img = document.getElementById('mandalaImg');
  if (!p || !alvo || !img) return;
  const r = img.getBoundingClientRect(), ar = alvo.getBoundingClientRect();
  if (!r.width) return;
  const escala = r.width / p.width;
  const x = r.left - ar.left - alvo.clientLeft + alvo.scrollLeft;
  const y = r.top - ar.top - alvo.clientTop + alvo.scrollTop;
  alvo.style.backgroundSize = `${(2 * p.ext * escala).toFixed(1)}px ${(2 * p.ext * escala).toFixed(1)}px`;
  alvo.style.backgroundPosition = `${(x + (p.cx - p.ext) * escala).toFixed(1)}px ${(y + (p.cy - p.ext) * escala).toFixed(1)}px`;
}
window.alinharFundoCeuTela = alinharFundoCeuTela;
window.addEventListener('resize', () => alinharFundoCeuTela());

/* FAIXA DO ZODÍACO NA ECLÍPTICA (só Tema Céu) — os signos viram uma faixa em volta
   do raio dos planetas (a eclíptica), de ±9° de largura (a latitude dos planetas já
   desloca o ponto de luz nessa mesma escala, 12 unidades por grau). Cada signo é só
   um contorno TRACEJADO na cor do elemento (sem preenchimento), com um pequeno recuo,
   então entre dois signos ficam dois tracejados paralelos. Glifo do signo = o mesmo de
   sempre (mesmas cores), translúcido. Número da casa (signo inteiro) na borda de dentro.
   Linha da eclíptica com marcas de grau. Só pintura/desenho: sem <mask>. */
function montarBandaZodiacoCeuSVG(o) {
  const { cx, cy, pR, meia, ref, skyRotation, dia, tinta, elemCores, signElem, glifos, rTerra, rAneis, corUnica } = o; // corUnica: fora do Tema Céu não há horizonte/céu, a linha da eclíptica é de uma cor só
  const rIn = pR - meia, rOut = pR + meia, INS = 0.55, RIN = 4;
  const P = (r, a) => polarToCart(cx, cy, r, a);
  const refSignIdx = Math.floor(ref / 30);
  let svg = '';
  for (let i = 0; i < 12; i++) {
    const A = eclToScreenAngle(i * 30, ref), a1 = A - INS, a2 = A - 30 + INS, cor = elemCores[signElem[i]];
    const r1 = rIn + RIN, r2 = rOut - RIN;
    const q1 = P(r2, a1), q2 = P(r2, a2), q3 = P(r1, a2), q4 = P(r1, a1);
    // sem o fecho de baixo (arco na borda de dentro da faixa): o signo fica aberto pra baixo e as
    // divisas seguem até a Terra. Só o arco de fora e as duas laterais.
    svg += `<path d="M${q4.x.toFixed(1)} ${q4.y.toFixed(1)} L${q1.x.toFixed(1)} ${q1.y.toFixed(1)} A${r2} ${r2} 0 0 0 ${q2.x.toFixed(1)} ${q2.y.toFixed(1)} L${q3.x.toFixed(1)} ${q3.y.toFixed(1)}" fill="none" stroke="${cor}" stroke-opacity=".9" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round"/>`;
    // as divisas do signo seguem pra dentro: pausam nos anéis de termos/dodecatemória (de rAneis
    // pra fora) e continuam até encostar na Terra
    [a1, a2].forEach(ang => {
      const i0 = P(rTerra, ang), i1 = P(rAneis, ang);
      svg += `<line x1="${i0.x.toFixed(1)}" y1="${i0.y.toFixed(1)}" x2="${i1.x.toFixed(1)}" y2="${i1.y.toFixed(1)}" stroke="${cor}" stroke-opacity=".9" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    });
    const Am = A - 15, pG = P(rOut - 26, Am), pN = P(rIn + 20, Am);
    svg += `<svg x="${(pG.x - 17).toFixed(1)}" y="${(pG.y - 17).toFixed(1)}" width="34" height="34" viewBox="0 0 64 64" opacity=".72" style="color: ${cor};">${glifos[i]}</svg>`;
    svg += `<text x="${pN.x.toFixed(1)}" y="${(pN.y + 5).toFixed(1)}" font-family="'Cinzel', serif" font-size="13" font-weight="bold" fill="${tinta.douradoCasas}" fill-opacity=".85" text-anchor="middle" stroke="${tinta.halo}" stroke-opacity=".6" stroke-width="3" paint-order="stroke fill">${((i - refSignIdx + 12) % 12) + 1}</text>`;
  }
  // linha da eclíptica + marcas de grau (1°, 5°, 10°), em duas tintas: azul-marinho de dia acima
  // do horizonte, claro à noite e no espaço
  const tintaCima = misturarHexCeu('#e6eeff', '#1d3a66', dia), tintaBaixo = '#e6eeff';
  const marcas = { fina: '', media: '', forte: '' };
  for (let deg = 0; deg < 360; deg++) {
    const a = eclToScreenAngle(deg, ref), len = deg % 10 === 0 ? 12 : (deg % 5 === 0 ? 8 : 4);
    const p1 = P(pR - len / 2, a), p2 = P(pR + len / 2, a);
    const seg = `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    if (deg % 10 === 0) marcas.forte += seg; else if (deg % 5 === 0) marcas.media += seg; else marcas.fina += seg;
  }
  const grupoTinta = (cor, clip) => `<g ${clip ? `clip-path="url(#${clip})" ` : ''}stroke="${cor}" fill="none"><circle cx="${cx}" cy="${cy}" r="${pR}" stroke-opacity=".7" stroke-width="1.3"/><path d="${marcas.fina}" stroke-opacity=".55" stroke-width=".8"/><path d="${marcas.media}" stroke-opacity=".65" stroke-width="1"/><path d="${marcas.forte}" stroke-opacity=".75" stroke-width="1.4"/></g>`;
  svg += corUnica ? grupoTinta(corUnica, null) : (grupoTinta(tintaCima, 'ceuMeiaTela') + grupoTinta(tintaBaixo, 'ceuMeiaTelaBaixo'));
  return svg;
}

/* O CHÃO no miolo (só Tema Céu): janela com céu em cima e terra embaixo das colinas — é onde ficam os
   aspectos. (Mais pra frente é aqui que entra o papiro.) */
function montarTerraCeuSVG(cx, cy, raio, corBorda, dia, skyRotation) {
  // O miolo é uma "janela": acima das colinas do horizonte aparece o próprio céu (nada é
  // desenhado ali), abaixo delas é CHÃO preenchido. O horizonte gira junto com a casa 1
  // (skyRotation), então tudo fica num grupo girado.
  const mix = misturarHexCeu;
  const c1 = mix('#2a221a', '#6e5d47', dia), c2 = mix('#16120d', '#4a3d2d', dia), sil = mix('#0c0a07', '#2b2216', dia);
  const bruma = mix('#5a4f9a', '#cfe6f7', dia);
  const r = raio;
  let colinas = `M${cx - r} ${cy}`;
  const N = 22;
  for (let i = 0; i <= N; i++) {
    const x = cx - r + i * (2 * r / N);
    const h = 4 + 5 * Math.abs(Math.sin(i * 1.7 + 0.6)) + 3 * Math.abs(Math.sin(i * 0.8));
    colinas += ` L${x.toFixed(1)} ${(cy - h).toFixed(1)}`;
  }
  colinas += ` L${cx + r} ${cy} A${r} ${r} 0 0 1 ${cx - r} ${cy} Z`;   // fecha pela metade de baixo do círculo
  return `<defs>
      <radialGradient id="ceuChao" cx="50%" cy="38%" r="75%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></radialGradient>
      <linearGradient id="ceuBruma" x1="0" y1="${cy - 28}" x2="0" y2="${cy}" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${bruma}" stop-opacity="0"/><stop offset="100%" stop-color="${bruma}" stop-opacity="${(0.25 + 0.3 * dia).toFixed(2)}"/></linearGradient>
      <clipPath id="ceuTerraClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    </defs>
    <g transform="rotate(${skyRotation} ${cx} ${cy})">
      <g clip-path="url(#ceuTerraClip)">
        <rect x="${cx - r}" y="${cy - 28}" width="${2 * r}" height="28" fill="url(#ceuBruma)"/>
        <path d="${colinas}" fill="url(#ceuChao)"/>
        <path d="${colinas}" fill="${sil}" fill-opacity=".35"/>
        <path d="M${cx - r} ${cy} L${cx + r} ${cy}" stroke="${bruma}" stroke-opacity=".45" stroke-width="1"/>
      </g>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${corBorda}" stroke-width="2"/>`;
}

/* CÉU DO TEMA CÉU (cores do site falandodeastrologia) — só pintura.
   Acima do horizonte ASC-DSC é TUDO céu, até as bordas da imagem; abaixo é
   o espaço (noite). A cor do céu acompanha a altura do Sol (elevacao, de
   -1 = Sol no IC a +1 = Sol no MC, contínua): noite -> amanhecer/pôr do sol
   (mancha laranja, do lado do Sol: ladoSol +1 = lado do ASC, -1 = lado do
   DSC) -> dia claro ao meio-dia. Estrelas só onde é noite: no espaço (abaixo
   do horizonte) sempre; no céu só quando o Sol está abaixo do horizonte.
   Sem <mask> (não funciona no caminho Blob->img em alguns celulares): só
   gradientes, círculos e transformação de rotação. "soHalo" (capa do
   Relatório): só o halo do céu em volta do disco, sem espaço nem estrelas,
   porque o fundo da capa já é o céu do site (CSS). */
function montarCeuMandalaSVG(o) {
  const { cx, cy, width, height, termos, raioCeu, skyRotation, elevacao, ladoSol, corDisco, soHalo, extensao } = o;
  // Só o fundo da CAPA do Relatório usa estes dois (a roda ali é minúscula perto da folha, então as estrelas
  // precisam de raio maior e de menos unidades de densidade pra ficarem do mesmo tamanho/quantidade visuais).
  const fatorEstrela = o.fatorEstrela || 1, densidadeEstrela = o.densidadeEstrela || 1;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const misturar = (c1, c2, t) => { const a = hex2rgb(c1), b = hex2rgb(c2); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

  const dia = suave(-0.10, 0.50, elevacao);                 // 0 = noite, 1 = dia pleno
  const crepusculo = Math.exp(-Math.pow((elevacao - 0.02) / 0.2, 2)); // pico com o Sol no horizonte
  const noiteEstrelas = 1 - suave(-0.14, 0.06, elevacao);   // estrelas no céu só de noite

  const NOITE = ['#41377a', '#2a3774', '#18285c', '#0f1a45', '#070d25'];
  const DIA = ['#eaf6fc', '#bfe0f5', '#7db8e6', '#3f74bb', '#2b5aa6'];
  const CREP = ['#f0b98d', '#c27f94', '#6a4f93', '#2f3274', '#101a48']; // pêssego -> rosa -> violeta -> índigo (amanhecer/pôr do sol)
  const aCrep = suave(-0.16, 0.0, elevacao); // noite -> crepúsculo
  const aDia = suave(0.0, 0.5, elevacao);    // crepúsculo -> dia
  const pontos = [0, 0.3, 0.55, 0.78, 1];
  const raioTotal = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
  const rIni = termos / raioTotal * 100;
  const alcance = soHalo ? raioCeu : raioTotal;
  const stops = pontos.map((p, i) => {
    const cor = misturar(misturar(NOITE[i], CREP[i], aCrep), DIA[i], aDia);
    const op = soHalo && i === pontos.length - 1 ? 0 : 1;
    return `<stop offset="${(soHalo ? (termos / raioCeu * 100 + p * (100 - termos / raioCeu * 100)) : (rIni + p * (100 - rIni))).toFixed(2)}%" stop-color="${cor}" stop-opacity="${op}"/>`;
  }).join('');
  const corGlow = misturar('#e8702c', '#ffe2a8', dia);
  const forcaGlow = (0.95 * crepusculo * (1 - 0.45 * dia)).toFixed(3);
  const rGlow = raioCeu * 0.95;
  const glowX = cx - ladoSol * (raioCeu * 0.55);

  let defs = `<radialGradient id="ceuEspaco" cx="${cx}" cy="${cy}" r="${raioTotal.toFixed(0)}" gradientUnits="userSpaceOnUse">
        <stop offset="${rIni.toFixed(2)}%" stop-color="#1c2552"/><stop offset="45%" stop-color="#101842"/><stop offset="100%" stop-color="#070d25"/>
      </radialGradient>
      <radialGradient id="ceuAzul" cx="${cx}" cy="${cy}" r="${alcance.toFixed(0)}" gradientUnits="userSpaceOnUse">${stops}</radialGradient>
      <radialGradient id="ceuGlow" cx="${glowX.toFixed(1)}" cy="${cy}" r="${rGlow.toFixed(0)}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${glowX.toFixed(1)} ${cy}) scale(1 0.7) translate(${(-glowX).toFixed(1)} ${-cy})">
        <stop offset="0%" stop-color="${corGlow}" stop-opacity="${forcaGlow}"/><stop offset="40%" stop-color="${corGlow}" stop-opacity="${(forcaGlow * 0.45).toFixed(3)}"/><stop offset="100%" stop-color="${corGlow}" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="ceuMeia"><rect x="${cx - 4000}" y="${cy - 4000}" width="8000" height="4000"/></clipPath>
      <clipPath id="ceuMeiaTela"><rect x="${cx - 4000}" y="${cy - 4000}" width="8000" height="4000" transform="rotate(${skyRotation} ${cx} ${cy})"/></clipPath>
      <clipPath id="ceuMeiaTelaBaixo"><rect x="${cx - 4000}" y="${cy}" width="8000" height="4000" transform="rotate(${skyRotation} ${cx} ${cy})"/></clipPath>`;

  // Estrelas: posições fixas (gerador determinístico, nunca aleatório de verdade).
  let semente = 20260930;
  const rnd = () => { semente = (semente + 0x6D2B79F5) | 0; let t = Math.imul(semente ^ (semente >>> 15), 1 | semente); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const cores = ['#dfe8ff', '#f6e7b4', '#ffffff'];
  let estrelasCeu = '', estrelasEspaco = '';
  const meio = Math.ceil(raioTotal);
  for (let i = 0; i < Math.round(520 * densidadeEstrela); i++) {
    const x = cx - meio + rnd() * meio * 2, y = cy - meio + rnd() * meio * 2;
    const grande = rnd() < 0.16, cor = cores[Math.floor(rnd() * 3)], opac = (0.55 + rnd() * 0.45).toFixed(2), raio = ((grande ? 2.1 : 1.2) * (0.8 + rnd() * 0.5) * fatorEstrela).toFixed(2);
    if (Math.hypot(x - cx, y - cy) < termos + 14) continue;
    const c = `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${raio}" fill="${cor}" fill-opacity="${opac}"/>`;
    if (y < cy) estrelasCeu += c; else estrelasEspaco += c;
  }
  // "extensao" (fundo da tela, ver montarFundoCeuSVG): continua o MESMO céu
  // pra fora da imagem. As 520 estrelas de cima são idênticas às da imagem
  // (mesmo gerador); as extras só caem FORA desse quadrado, pra não haver
  // emenda visível na borda da imagem.
  if (extensao && !soHalo) {
    const total = Math.min(4200, Math.round(520 * Math.pow(extensao / meio, 2) * densidadeEstrela));
    for (let i = 0; i < total; i++) {
      const x = cx - extensao + rnd() * extensao * 2, y = cy - extensao + rnd() * extensao * 2;
      const grande = rnd() < 0.16, cor = cores[Math.floor(rnd() * 3)], opac = (0.55 + rnd() * 0.45).toFixed(2), raio = ((grande ? 2.1 : 1.2) * (0.8 + rnd() * 0.5) * fatorEstrela).toFixed(2);
      if (Math.abs(x - cx) <= meio && Math.abs(y - cy) <= meio) continue;
      const c = `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${raio}" fill="${cor}" fill-opacity="${opac}"/>`;
      if (y < cy) estrelasCeu += c; else estrelasEspaco += c;
    }
  }

  let corpo;
  if (soHalo) {
    corpo = `<!-- Céu só como halo (capa do Relatório): o fundo é o céu do site, via CSS. -->
    <circle cx="${cx}" cy="${cy}" r="${termos}" fill="${corDisco}"/>
    <g transform="rotate(${skyRotation} ${cx} ${cy})"><g clip-path="url(#ceuMeia)"><circle cx="${cx}" cy="${cy}" r="${raioCeu}" fill="url(#ceuAzul)"/></g></g>`;
  } else {
    corpo = `<!-- ESPAÇO (abaixo do horizonte) e CÉU (acima, até as bordas), girando junto com a casa 1. -->
    <rect x="${extensao ? cx - extensao : 0}" y="${extensao ? cy - extensao : 0}" width="${extensao ? extensao * 2 : width}" height="${extensao ? extensao * 2 : height}" fill="url(#ceuEspaco)"/>
    <g transform="rotate(${skyRotation} ${cx} ${cy})">
      ${estrelasEspaco}
      <g clip-path="url(#ceuMeia)">
        <rect x="${cx - 4000}" y="${cy - 4000}" width="8000" height="4000" fill="url(#ceuAzul)"/>
        <rect x="${cx - 4000}" y="${cy - 4000}" width="8000" height="4000" fill="url(#ceuGlow)"/>
        <g opacity="${noiteEstrelas.toFixed(3)}">${estrelasCeu}</g>
      </g>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${termos}" fill="${corDisco}"/>`;
  }
  return { defs, corpo };
}

/* Céu da capa do Relatório como imagem JPEG (2000x2000 px): desenha o SVG do céu num canvas. Preenche
   info.url; nunca rejeita (se algo falhar, usa o SVG embutido como imagem). */
function rasterizarFundoCeuCapa(info) {
  return new Promise(resolve => {
    const comoSvg = () => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(info.svg)));
    try {
      const img = new Image();
      const blobUrl = URL.createObjectURL(new Blob([info.svg], { type: 'image/svg+xml;charset=utf-8' }));
      img.onload = () => {
        try {
          const L = 2000, canvas = document.createElement('canvas');
          canvas.width = L; canvas.height = L;
          canvas.getContext('2d').drawImage(img, 0, 0, L, L);
          info.url = canvas.toDataURL('image/jpeg', 0.82);
        } catch (e) { info.url = comoSvg(); }
        URL.revokeObjectURL(blobUrl);
        resolve();
      };
      img.onerror = () => { info.url = comoSvg(); URL.revokeObjectURL(blobUrl); resolve(); };
      img.src = blobUrl;
    } catch (e) { info.url = comoSvg(); resolve(); }
  });
}

function renderMandala(dadosNovos, onReady, estiloForcado, fundoTransparente, corCabecalhoForcada, corCirculoForcada, papiroCabecalho, espacoTransparente, tintaPapiro) {
  if (dadosNovos) currentCalculatedData = dadosNovos;
  const container = document.getElementById('mandala-container');
  if (!container || !currentCalculatedData) return;

  /* O DESENHO da roda (SVG) mora em roda.js (desenharRodaSVG) — função central de todos os estilos de mandala. Aqui fica só o
     que é da tela: pôr a imagem no container, gerar o PNG, o céu de fundo, o cache. */
  injetarBotaoRotacaoNaBarraSuperior();
  injetarBotaoRelatorioNaBarraSuperior();
  injetarControleZoomMandala();
  ajustarPosicaoMandalaActionsOverlay();
  const roda = desenharRodaSVG({ estiloForcado, fundoTransparente, corCabecalhoForcada, corCirculoForcada, papiroCabecalho, espacoTransparente, tintaPapiro });
  const { svg, width, height, papiroNaTela, ceuParams } = roda;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(svgBlob);

  /* O que aparece NA TELA é o próprio SVG (vetorial — ampliar nunca
     pixeliza), não o PNG. O PNG (lastRenderedPngUrl) continua sendo
     gerado logo abaixo só porque o Relatório (onReady) e o botão "Salvar
     na galeria" (salvarImagemMandala) precisam dele. width/height dobrados
     mantêm o mesmo tamanho natural que o PNG (exportScale 2) tinha antes,
     já que o SVG cru só traz viewBox (sem tamanho próprio, um <img>
     dele não tem dimensão definida). */
  const svgTela = svg.replace('<svg viewBox', `<svg width="${width * 2}" height="${height * 2}" viewBox`);
  const svgTelaUrl = URL.createObjectURL(new Blob([svgTela], { type: 'image/svg+xml;charset=utf-8' }));
  if (window.mandalaSvgTelaUrlAtual) URL.revokeObjectURL(window.mandalaSvgTelaUrlAtual);
  window.mandalaSvgTelaUrlAtual = svgTelaUrl;

  const imgLoader = new Image();
  imgLoader.onload = function() {
    const exportScale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * exportScale;
    canvas.height = height * exportScale;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Mandala no papiro (botão da barra): a imagem salva vai SOBRE o papiro com textura, não transparente
    if (papiroNaTela) papiroTexturaCanvas(ctx, canvas.width, canvas.height, exportScale);
    ctx.drawImage(imgLoader, 0, 0, canvas.width, canvas.height);

       lastRenderedPngUrl = canvas.toDataURL('image/png');

          container.innerHTML = `
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: visible; position: relative;">
    <img id="mandalaImg" src="${svgTelaUrl}" alt="Mandala Astrológica" draggable="false" style="-webkit-touch-callout: none; max-width: 100%; max-height: 100%; object-fit: contain; display: block; transform: scale(${(mandalaZoomPercent / 100).toFixed(2)}); transform-origin: top center; transition: transform 120ms ease-out;">
  </div>
`;
     
    // Só a mandala ao vivo (não as cópias do Relatório, que passam estiloForcado):
    // com o Tema Céu, o céu continua pra fora da imagem; senão limpa o fundo.
    if (!estiloForcado) {
      configurarFundoCeuDaTela(container, ceuParams);
      // Modo papiro: a folha de papiro cobre o palco inteiro por uma classe no body (index.html, "mandala-papiro-tela").
      // O céu continua pintado por baixo (inline) — assim as outras ferramentas e a volta pro céu não perdem nada.
      document.body.classList.toggle('mandala-papiro-tela', papiroNaTela);
      const btnPapiro = document.getElementById('btn-mandala-papiro');
      if (btnPapiro) btnPapiro.classList.toggle('mandala-papiro-ativa', papiroNaTela);
    }

    URL.revokeObjectURL(blobURL);     

           try {
      // Localiza o container da mandala
      const mandalaElem = document.getElementById('mandala-container');
      
      // Procura o container da tabela técnica
      let painelElem = document.getElementById('painel-tecnico-container');
      
      // Se não existir, cria o container LOGO ABAIXO da mandala
            if (!painelElem) {
        painelElem = document.createElement('div');
        painelElem.id = 'painel-tecnico-container';
        if (mandalaElem) {
          mandalaElem.appendChild(painelElem);
        }
      }

      // Garante que a rolagem da página não seja bloqueada por CSS
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";

      if (painelElem) {
        painelElem.innerHTML = '';
      }
    } catch (err) {
      console.error("Erro ao renderizar painel técnico:", err);
    }

    const fundoCapaPendente = window.ceuFundoCapaUltimo && !window.ceuFundoCapaUltimo.url ? window.ceuFundoCapaUltimo : null;
    const concluir = () => { if (typeof onReady === 'function') onReady(lastRenderedPngUrl); };
    if (fundoCapaPendente) rasterizarFundoCeuCapa(fundoCapaPendente).then(concluir); else concluir();
  };
  imgLoader.src = blobURL;
}

/* Botão "Salvar na galeria" da mandala (ícone de imagem, ao lado do
   "Adicionar ao Relatório"). No iPhone/iPad o <a download> NÃO funciona
   mais (aparece "Baixar/Ver" e nada acontece) — o caminho que funciona é
   a folha de compartilhamento nativa (navigator.share com arquivo), que
   tem a opção "Salvar Imagem" (vai pra galeria), o mesmo destino do
   antigo toque longo na imagem. O navigator.share exige ser chamado
   dentro do toque do usuário, por isso o PNG (já pronto em
   lastRenderedPngUrl) vira Blob de forma SÍNCRONA aqui — nada de fetch/
   await antes de share(), senão o iOS considera que o gesto "expirou".
   Sem suporte a compartilhar arquivo (computador), cai no download
   normal, que lá funciona. */
function salvarImagemMandala() {
  // Com a Matriz de Visibilidade na tela, o botão de galeria da barra de cima
  // salva a MATRIZ (com título e cabeçalho), não a imagem da mandala escondida.
  if (document.getElementById('matrizVisibilidadeResponsivaRoot') && typeof salvarMatrizVisibilidadeNaGaleria === 'function') {
    return salvarMatrizVisibilidadeNaGaleria();
  }
  if (!lastRenderedPngUrl) { alert('Nenhuma mandala na tela pra salvar.'); return; }
  salvarPngNaGaleria(lastRenderedPngUrl, `Astro_Hellenic_${(currentSubjectName || 'mandala').replace(/\s+/g, '_')}.png`);
}
window.salvarImagemMandala = salvarImagemMandala;

/* Mesmo mecanismo de salvar (folha de compartilhar / download) pra
   qualquer ferramenta — recebe um PNG já pronto (data URL) e o nome do
   arquivo. Precisa ser chamada direto do toque, sem await antes. */
function salvarPngNaGaleria(pngDataUrl, nome) {
  let arquivo = null;
  try {
    const partes = pngDataUrl.split(',');
    const bin = atob(partes[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    arquivo = new File([bytes], nome, { type: 'image/png' });
  } catch (e) {
    console.error('Erro ao preparar a imagem da mandala:', e);
  }

  if (arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    navigator.share({ files: [arquivo] }).catch(err => {
      if (err && err.name === 'AbortError') return; // fechou a folha de propósito
      // O iPhone/iPad recusa a folha quando passou tempo demais desde o toque
      // (imagem demorou pra gerar): pede um toque novo, agora garantido.
      if (err && err.name === 'NotAllowedError') { mostrarBotaoSalvarImagem(pngDataUrl, nome); return; }
      console.error('Erro ao compartilhar a imagem:', err);
      alert('Não foi possível abrir a folha de salvar a imagem.');
    });
    return;
  }

  const link = document.createElement('a');
  link.download = nome;
  link.href = pngDataUrl;
  link.click();
}
window.salvarPngNaGaleria = salvarPngNaGaleria;

function mostrarBotaoSalvarImagem(pngDataUrl, nome) {
  document.getElementById('salvarImagemOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'salvarImagemOverlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 100000; padding: 20px;';
  overlay.innerHTML = `
    <div style="background: var(--bg-card); border: 1px solid var(--gold-primary); border-radius: 10px; padding: 20px; text-align: center; font-family: 'Montserrat', sans-serif; color: var(--primary-blue); max-width: 280px;">
      <div style="font-weight: 700; margin-bottom: 14px;">Imagem pronta</div>
      <button type="button" id="salvarImagemOk" style="background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 6px; padding: 10px 18px; font-weight: 700; cursor: pointer; width: 100%;">Salvar na galeria</button>
      <div id="salvarImagemFechar" style="margin-top: 12px; font-size: 12px; cursor: pointer; opacity: 0.7;">Fechar</div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('salvarImagemOk').onclick = () => { overlay.remove(); salvarPngNaGaleria(pngDataUrl, nome); };
  document.getElementById('salvarImagemFechar').onclick = () => overlay.remove();
}

/* Captura SÓ QUANDO O BOTÃO É TOCADO (nunca em segundo plano — travava a
   tela): mostra "Gerando imagem…", espera o canvas e abre a folha de salvar.
   "gerarCanvas" é uma função async que devolve o canvas. */
let salvandoImagemEmAndamento = false;
async function capturarESalvarNaGaleria(gerarCanvas, nome) {
  if (salvandoImagemEmAndamento) return;
  salvandoImagemEmAndamento = true;
  const aviso = document.createElement('div');
  aviso.style.cssText = 'position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: #103b70; color: #fcf6ba; border: 1px solid #c59b27; border-radius: 8px; padding: 10px 18px; font: 700 13px Montserrat, sans-serif; z-index: 100000; box-shadow: 0 4px 12px rgba(0,0,0,0.25);';
  aviso.textContent = 'Gerando imagem…';
  document.body.appendChild(aviso);
  let dataUrl = null;
  try {
    /* Tema Céu: toda imagem salva sai SOBRE O PAPIRO COM TEXTURA (luz, sombra e fibras — papiroTexturaCanvas), não só
       com a cor bege. As ferramentas que pintam o papel sozinhas já saem prontas; as que só passavam uma cor chapada
       de fundo (Liberação, Profecção, Sinastria...) são pedidas SEM fundo (o mesmo modo da imagem pro Relatório) e
       aqui o papel vai por baixo. */
    const ceu = window.temaMandala === 'ceu';
    const semFundoAntes = window.__capturaSemFundo;
    if (ceu) window.__capturaSemFundo = true;
    let canvas;
    try { canvas = await gerarCanvas(); } finally { window.__capturaSemFundo = semFundoAntes; }
    if (ceu) {
      const comPapel = document.createElement('canvas');
      comPapel.width = canvas.width; comPapel.height = canvas.height;
      const pctx = comPapel.getContext('2d');
      papiroTexturaCanvas(pctx, comPapel.width, comPapel.height, 2);
      pctx.drawImage(canvas, 0, 0);
      canvas = comPapel;
    }
    dataUrl = canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Erro ao gerar a imagem:', err);
    alert('Não foi possível gerar a imagem.');
  } finally {
    aviso.remove();
    salvandoImagemEmAndamento = false;
  }
  if (dataUrl) salvarPngNaGaleria(dataUrl, nome);
}
window.capturarESalvarNaGaleria = capturarESalvarNaGaleria;

/* SVG (texto) -> canvas, direto pelo navegador (o mesmo caminho que a
   Mandala já usa), sem passar pelo html2canvas — que levava ~7s numa tela
   pesada como a Circumambulação (este leva ~0,2s). "var(--x)" não funciona
   dentro de um SVG usado como imagem, então as variáveis de cor da página
   são trocadas pelo valor real antes. "fundo" (hex) pinta o fundo. */
function resolverVariaveisCssNoSvg(svgStr) {
  const cs = getComputedStyle(document.documentElement);
  return svgStr.replace(/var\((--[a-z0-9-]+)\)/gi, (m, nome) => cs.getPropertyValue(nome).trim() || m);
}
async function rasterizarSvgParaCanvas(svgStr, largura, altura, fundo, escala) {
  const url = URL.createObjectURL(new Blob([resolverVariaveisCssNoSvg(svgStr)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('SVG não carregou')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(largura * escala);
    canvas.height = Math.round(altura * escala);
    const ctx = canvas.getContext('2d');
    if (fundo) {
      ctx.fillStyle = fundo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}
window.rasterizarSvgParaCanvas = rasterizarSvgParaCanvas;
window.resolverVariaveisCssNoSvg = resolverVariaveisCssNoSvg;

/* CAPTURA RÁPIDA DE TELAS COM MUITOS ÍCONES SVG. O html2canvas gasta muito
   tempo clonando cada <svg> da página — numa tela com centenas de ícones
   (Decênios: 641) isso leva 30s+, e não dá pra evitar depois que a cópia
   começa. Então, por um instante (só o tempo da captura), os <svg> da tela
   são trocados por <img> do mesmo tamanho: cada MODELO de ícone (igual,
   ignorando os ids de gradiente, que mudam a cada ícone) vira um PNG
   transparente uma vez só (rasterizarSvgParaCanvas), e os ícones escondidos
   (acordeão fechado) saem de cena. Depois, tudo volta ao que era.
   Devolve { aplicar, limpar }: chamar aplicar() antes do html2canvas e limpar()
   num finally. */
async function prepararSvgsRapidosParaCaptura(elemento) {
  const svgs = Array.from(elemento.querySelectorAll('svg'));
  const normalizar = (html) => html.replace(/(id="|url\(#|href="#)[^")]*/g, '$1X');
  const cache = new Map();   // chave -> dataURL
  const trocas = [];         // { svg, substituto }
  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      trocas.push({ svg, substituto: document.createComment('svg oculto') }); // escondido: não aparece mesmo
      continue;
    }
    const chave = normalizar(svg.outerHTML) + '|' + Math.round(rect.width) + 'x' + Math.round(rect.height);
    if (!cache.has(chave)) {
      try {
        const copia = svg.cloneNode(true);
        copia.setAttribute('width', rect.width);
        copia.setAttribute('height', rect.height);
        if (!copia.getAttribute('xmlns')) copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const canvas = await rasterizarSvgParaCanvas(new XMLSerializer().serializeToString(copia), rect.width, rect.height, null, 2);
        cache.set(chave, canvas.toDataURL('image/png'));
      } catch (e) {
        cache.set(chave, null); // esse modelo fica como <svg> normal (mais lento, mas certo)
      }
    }
    const dataUrl = cache.get(chave);
    if (!dataUrl) continue;
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.cssText = `${svg.getAttribute('style') || ''}; width: ${rect.width}px; height: ${rect.height}px;`;
    trocas.push({ svg, substituto: img });
  }
  const aplicar = () => trocas.forEach(t => t.svg.replaceWith(t.substituto));
  const limpar = () => trocas.forEach(t => { if (t.substituto.parentNode) t.substituto.replaceWith(t.svg); });
  return { aplicar, limpar };
}

/* html2canvas de um elemento HTML, com os <svg> trocados por imagem durante a
   captura (ver prepararSvgsRapidosParaCaptura). "fundo" (hex) pinta o fundo. */
async function html2canvasRapido(elemento, fundo) {
  if (typeof html2canvas !== 'function') throw new Error('html2canvas não carregou');
  const rapido = await prepararSvgsRapidosParaCaptura(elemento);
  try {
    rapido.aplicar();
    return await html2canvas(elemento, {
      backgroundColor: fundo, scale: 2, useCORS: true,
      // O html2canvas copia a PÁGINA INTEIRA antes de recortar o elemento — com
      // mandalas gigantes (milhares de nós) noutro ponto da tela isso levava
      // vários segundos. Desenhos (<svg>) que ficam FORA do trecho capturado
      // são ignorados na cópia: não aparecem na imagem de qualquer jeito.
      ignoreElements: (no) => no.tagName && no.tagName.toLowerCase() === 'svg' && !elemento.contains(no)
    });
  } finally {
    rapido.limpar();
  }
}
window.html2canvasRapido = html2canvasRapido;

/* IMAGEM DE UMA FERRAMENTA QUE É HTML (tabelas etc.): título + cabeçalho padrão
   saem direto do SVG (rápido) e só o conteúdo HTML passa pelo html2canvas.
   opcoes: { titulo (texto ou vazio), comCabecalho (bool), loteCasa1 (opcional) }.
   Devolve o canvas (escala 2), ainda sem recorte. */
async function gerarImagemHtmlComCabecalho(elemento, opcoes) {
  if (typeof html2canvas !== 'function') throw new Error('html2canvas não carregou');
  /* opcoes.papiro (Tema Céu; hoje só os Decênios): a imagem sai como a tela — sobre papiro e em tinta, claro ou
     escuro. O html2canvas lê o DOM com as variáveis de cor da folha, então o corpo já sai certo; o título e o
     cabeçalho são em tinta. Com título/cabeçalho o papel é o degradê do papiro; sem eles, cor chapada
     (cor chapada do papiro) pro recorte automático achar a borda. */
  const papiro = !!(opcoes && opcoes.papiro) && window.temaMandala === 'ceu';
  const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
  const fundoChapado = papiro ? papiroCores().chapado : (modoEscuro ? '#1c1917' : '#fffdf5');
  const comTopo = !!(opcoes.titulo || opcoes.comCabecalho);
  const papelDegrade = papiro && comTopo;
  const fundo = (papelDegrade || papiro) ? null : fundoChapado; // null = transparente (com título/cabeçalho o degradê vai por baixo no fim; sem eles, fica sem fundo nenhum — imagem pro Relatório)
  const corpo = await html2canvasRapido(elemento, fundo);
  if (!comTopo) return corpo;

  const W = Math.max(320, Math.round(elemento.getBoundingClientRect().width));
  const cores = papiro ? coresCabecalhoTinta() : coresCabecalhoMandala(modoEscuro, null);
  let y = 0, partes = '';
  if (opcoes.titulo) {
    partes += `<text x="${W / 2}" y="26" text-anchor="middle" font-family="serif" font-size="20" font-weight="800" letter-spacing="1" fill="${papiro ? '#a03e25' : cores.titulo}">${escapeHtml(opcoes.titulo)}</text>`;
    y += 44;
  }
  if (opcoes.comCabecalho) {
    const k = Math.min(1, W / 960);
    const grupo = montarCabecalhoMandalaGrupoSVG(currentCalculatedData, 2, cores, opcoes.loteCasa1)
      .replace(/'Cinzel', serif/g, 'serif').replace(/'Montserrat', sans-serif/g, 'sans-serif');
    partes += `<g transform="translate(${(W - 960 * k) / 2}, ${y}) scale(${k})">${grupo}</g>`;
    y += (79 * k) + 16;
  }
  const alturaTopo = y;
  const topo = await rasterizarSvgParaCanvas(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${alturaTopo}" viewBox="0 0 ${W} ${alturaTopo}">${partes}</svg>`, W, alturaTopo, fundo, 2);
  const saida = document.createElement('canvas');
  saida.width = Math.max(topo.width, corpo.width);
  saida.height = topo.height + corpo.height;
  const ctx = saida.getContext('2d');
  if (papelDegrade) {
    papiroTexturaCanvas(ctx, saida.width, saida.height, 2);
  } else {
    ctx.fillStyle = fundoChapado;
    ctx.fillRect(0, 0, saida.width, saida.height);
  }
  ctx.drawImage(topo, Math.round((saida.width - topo.width) / 2), 0);
  ctx.drawImage(corpo, Math.round((saida.width - corpo.width) / 2), topo.height);
  return saida;
}
window.gerarImagemHtmlComCabecalho = gerarImagemHtmlComCabecalho;

/* IMAGEM DE UMA FERRAMENTA (Painel Técnico, Matriz...) direto do SVG, sem
   html2canvas (rápido: ~0,2s em vez de vários segundos, e sem travar a tela).
   "svgEl" é o <svg> da ferramenta que está na tela. Com "comCabecalho" sai
   título + cabeçalho padrão + o SVG (imagem pra salvar na galeria); sem, só o
   SVG com a moldura arredondada dele (imagem pro Relatório). Devolve o canvas
   (escala 2), ainda sem recorte. */
async function gerarImagemFerramentaDoSvg(svgEl, opcoes) {
  /* opcoes.papiro (só a Matriz de Visibilidade por enquanto): Tema Céu — a imagem sai como a tela, sobre papiro,
     com as cores de tinta e as variáveis de cor do ESCOPO da ferramenta (a grade usa var(--bg-card) etc.,
     redefinidas só dentro da folha), claro ou escuro. */
  const papiro = !!(opcoes && opcoes.papiro) && window.temaMandala === 'ceu';
  const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
  // Tema Céu, imagem pro Relatório (sem cabeçalho): SEM fundo — só as linhas em tinta, pra encaixar no papiro da folha.
  const fundo = papiro ? ((opcoes && opcoes.comCabecalho) ? papiroCores().chapado : null) : (modoEscuro ? '#1c1917' : '#fffdf5');
  const w = parseFloat(svgEl.getAttribute('width')), h = parseFloat(svgEl.getAttribute('height'));
  const cs = getComputedStyle(svgEl);
  const borda = parseFloat(cs.borderTopWidth) || 0;
  const raio = parseFloat(cs.borderTopLeftRadius) || 0;
  const corBorda = cs.borderTopColor;
  const W = w + (borda * 2), H = h + (borda * 2);
  // Mesmo tamanho que a ferramenta tem NA TELA (o SVG encolhe pra caber) — é
  // o tamanho que sempre coube na página do relatório; nunca "inflar" pro
  // tamanho natural do desenho.
  const larguraTela = svgEl.getBoundingClientRect().width;
  const k = larguraTela > 0 ? larguraTela / W : 1;
  const Wk = W * k, Hk = H * k;
  let internoXml = new XMLSerializer().serializeToString(svgEl);
  if (papiro) internoXml = internoXml.replace(/var\((--[a-z0-9-]+)\)/gi, (m, nome) => cs.getPropertyValue(nome).trim() || m);
  const interno = internoXml
    .replace(/ style="[^"]*"/, ' font-family="sans-serif"')
    .replace('<svg ', `<svg x="${borda}" y="${borda}" `);
  const conteudo = `<defs><clipPath id="molduraFerramenta"><rect x="${borda}" y="${borda}" width="${w}" height="${h}" rx="${raio}" ry="${raio}"/></clipPath></defs>
    <g clip-path="url(#molduraFerramenta)">${interno}</g>
    ${borda ? `<rect x="${borda / 2}" y="${borda / 2}" width="${W - borda}" height="${H - borda}" rx="${raio}" ry="${raio}" fill="none" stroke="${corBorda}" stroke-width="${borda}"/>` : ''}`;

  if (!opcoes.comCabecalho) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wk}" height="${Hk}" viewBox="0 0 ${W} ${H}">${conteudo}</svg>`;
    return rasterizarSvgParaCanvas(svg, Wk, Hk, fundo, 2);
  }

  const cores = papiro ? coresCabecalhoTinta() : coresCabecalhoMandala(modoEscuro, null);
  const largura = Math.max(960, Wk + 40);
  const yTitulo = 34, yCabecalho = 52, yConteudo = 142;
  const altura = yConteudo + Hk + 20;
  const cabecalho = montarCabecalhoMandalaGrupoSVG(currentCalculatedData, yCabecalho, cores)
    .replace(/'Cinzel', serif/g, 'serif').replace(/'Montserrat', sans-serif/g, 'sans-serif');
  const papelFundo = papiro ? papiroTexturaSvg('papiroCaptura', largura, altura) : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}">
    ${papelFundo}
    <text x="${largura / 2}" y="${yTitulo}" text-anchor="middle" font-family="serif" font-size="20" font-weight="800" letter-spacing="1" fill="${papiro ? '#a03e25' : cores.titulo}">${escapeHtml(opcoes.titulo || '')}</text>
    <g transform="translate(${(largura - 960) / 2}, 0)">${cabecalho}</g>
    <g transform="translate(${(largura - Wk) / 2}, ${yConteudo}) scale(${k})">${conteudo}</g>
  </svg>`;
  return rasterizarSvgParaCanvas(svg, largura, altura, fundo, 2);
}
window.gerarImagemFerramentaDoSvg = gerarImagemFerramentaDoSvg;

/* MANDALA DO MOMENTO PARA A TELA DE LOGIN. Ainda não há conta nem mapa: calcula o céu de AGORA (São Paulo como
   lugar padrão, fuso do aparelho) e desenha a roda no Tema Céu, do mesmo jeito da capa do Relatório — a roda
   (PNG transparente) + o céu enorme alinhado ao centro dela. Devolve { png, ceu } ou null se falhar (sem rede
   etc.; a tela de login então fica só com o céu). Não deixa rastro: guarda e devolve o estado global que usa
   (mapa, momento, local, tema...), e redesenha o que havia na tela. */
async function gerarMandalaDoMomentoParaLogin() {
  // espera a página terminar de carregar e o cálculo inicial dela acabar (no máximo ~10 s), pra não atropelar o estado
  if (document.readyState !== 'complete') await new Promise(r => window.addEventListener('load', r, { once: true }));
  for (let i = 0; i < 50 && window.__calculosEmAndamento > 0; i++) await new Promise(r => setTimeout(r, 200));
  if (window.__calculosEmAndamento > 0) return null;
  const salvo = {
    dados: currentCalculatedData, momento: currentMoment, geo: currentGeo, nome: currentSubjectName,
    lotes: window.currentLotes, tema: window.temaMandala, casa1: (typeof selectedHouse1Lot !== 'undefined') ? selectedHouse1Lot : 'ASC',
    capa: window.ceuFundoCapaUltimo
  };
  try {
    const agora = new Date();
    currentMoment = agora;
    currentGeo = { lat: -23.5505, lon: -46.6333, fuso: -agora.getTimezoneOffset() / 60, city: 'São Paulo, SP' };
    currentSubjectName = 'Agora';
    if (!(await executarCalculo({ soCalcular: true }))) return null;
    window.temaMandala = 'ceu';
    selectedHouse1Lot = 'ASC';
    const png = await new Promise(resolve => renderMandala(null, resolve, 'claro', false, null, null, true, true));
    const ceu = window.ceuFundoCapaUltimo ? Object.assign({}, window.ceuFundoCapaUltimo) : null;
    return png && ceu && ceu.url ? { png, ceu } : null;
  } catch (e) {
    console.error('Mandala do momento (login):', e);
    return null;
  } finally {
    currentCalculatedData = salvo.dados; currentMoment = salvo.momento; currentGeo = salvo.geo; currentSubjectName = salvo.nome;
    window.currentLotes = salvo.lotes; window.temaMandala = salvo.tema; selectedHouse1Lot = salvo.casa1; window.ceuFundoCapaUltimo = salvo.capa;
    if (salvo.dados && (typeof mandalaEstaNaTela !== 'function' || mandalaEstaNaTela())) { try { renderMandala(); } catch (e) { /* tela de trás: sem problema */ } }
  }
}
window.gerarMandalaDoMomentoParaLogin = gerarMandalaDoMomentoParaLogin;

window.onload = function() {
  restaurarUnidadeStepperMandala();

  if (typeof carregarPastasSalvas === 'function') {
    try { carregarPastasSalvas(); } catch(e) { console.error(e); }
  }

  /* Retoma o mapa que estava aberto antes de recarregar (ex.: o navegador
     descartou a aba em segundo plano), em vez de sempre voltar pro Céu do
     Momento. */
  let perfilRestaurado = null;
  try {
    const perfilSalvo = localStorage.getItem('astro_ultimo_perfil');
    if (perfilSalvo) perfilRestaurado = JSON.parse(perfilSalvo);
  } catch (e) { console.error(e); }

  if (perfilRestaurado && typeof aplicarDadosDoPerfilNoMapa === 'function') {
    aplicarDadosDoPerfilNoMapa(perfilRestaurado);
  } else {
    carregarCeuDoMomento();
  }

  // Sempre chama abrirModuloTecnica, mesmo quando o último módulo foi a
  // própria Mandala/Radix: é ELA quem põe "modo-mandala" no body (só
  // acontece aqui, nunca no HTML estático) e restaura o overflowY do
  // #mandala-container pro padrão do CSS. Sem isso, a mandala abria sem
  // altura de referência pra encolher (max-height:100% sem efeito) e
  // ficava esparramada/cortada até o astrólogo trocar de ferramenta e
  // voltar — o que é quando abrirModuloTecnica('mandala'/'radix') roda
  // de verdade. Nesse ponto currentCalculatedData ainda não chegou (o
  // fetch acima ainda está em andamento), então o renderMandala() que
  // abrirModuloTecnica dispara não faz nada; o desenho de fato acontece
  // depois, quando executarCalculo() terminar, já com o container no
  // tamanho certo.
  const ultimoModulo = localStorage.getItem('astro_ultimo_modulo') || 'mandala';
  const ultimoEhMandala = (ultimoModulo === 'mandala' || ultimoModulo === 'radix');
  if (typeof abrirModuloTecnica === 'function') {
    try {
      if (ultimoEhMandala) {
        abrirModuloTecnica(ultimoModulo);
      } else if (ultimoModulo === 'configuracoes') {
        /* A página de Configurações não depende de mapa: abre na hora (sem esperar o cálculo) e, quando o mapa
           chegar (executarCalculo), fica onde está em vez de virar a Mandala. */
        window.configuracoesAbertaNoCarregamento = true;
        abrirModuloTecnica('configuracoes');
      } else {
        /* Outra ferramenta estava aberta: ainda não há mapa calculado (o fetch acima está em andamento), então
           desenhá-la agora mostraria a tela dela sem dados por uns instantes e depois a Mandala por cima (o
           "piscar"). Fica só um spinner e a ferramenta abre quando o mapa chegar (ver executarCalculo). */
        window.moduloPendenteRestaurar = ultimoModulo;
        const cAguardo = document.getElementById('mandala-container');
        if (cAguardo) cAguardo.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37;"></i></div>`;
      }
    } catch (e) { console.error(e); }
  }

  if (typeof carregarConteudoPastaAtual === 'function') {
    try { carregarConteudoPastaAtual(); } catch(e) { console.error(e); }
  }
};
               
