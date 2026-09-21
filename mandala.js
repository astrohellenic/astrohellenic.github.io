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

/* DEFINIÇÕES VETORIAIS 3D DOS 7 PLANETAS */
const PLANET_3D_SVGS = {
  Sun: `
    <g>
      <circle cx="50" cy="50" r="46" fill="#f59e0b" opacity="0.25" filter="blur(2px)"/>
      <circle cx="50" cy="50" r="42" fill="url(#gradSun)" filter="url(#planetDropShadow)"/>
      <ellipse cx="38" cy="24" rx="16" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-20 38 24)"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">☉</text>
    </g>
  `,
  Moon: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradMoon)" filter="url(#planetDropShadow)"/>
      <circle cx="34" cy="38" r="7" fill="#334155" opacity="0.22"/>
      <circle cx="62" cy="46" r="10" fill="#334155" opacity="0.18"/>
      <circle cx="42" cy="66" r="8" fill="#1e293b" opacity="0.25"/>
      <circle cx="58" cy="28" r="5" fill="#475569" opacity="0.15"/>
      <ellipse cx="36" cy="22" rx="14" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-25 36 22)"/>
      <path d="M 40,24 C 62,24 72,36 72,50 C 72,64 62,76 40,76 C 54,69 60,59 60,50 C 60,41 54,31 40,24 Z" 
            fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" filter="url(#glyphShadow)"/>
    </g>
  `,
  Mercury: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradMercury)" filter="url(#planetDropShadow)"/>
      <ellipse cx="36" cy="24" rx="15" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-20 36 24)"/>
      <circle cx="68" cy="65" r="18" fill="#1c0a00" opacity="0.3"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">☿</text>
    </g>
  `,
  Venus: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradVenus)" filter="url(#planetDropShadow)"/>
      <ellipse cx="36" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 36 22)"/>
      <circle cx="65" cy="62" r="22" fill="#451a03" opacity="0.25"/>
      <text x="50" y="66" font-size="48" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♀</text>
    </g>
  `,
  Mars: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradMars)" filter="url(#planetDropShadow)"/>
      <ellipse cx="44" cy="12" rx="10" ry="3" fill="#ffffff" opacity="0.45"/>
      <ellipse cx="34" cy="26" rx="14" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-25 34 26)"/>
      <circle cx="68" cy="66" r="22" fill="#2d0505" opacity="0.4"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♂</text>
    </g>
  `,
  Jupiter: `
    <g>
      <circle cx="50" cy="50" r="42" fill="url(#gradJupiter)" filter="url(#planetDropShadow)"/>
      <g clip-path="url(#jupiterClip)" opacity="0.45">
        <rect x="0" y="24" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="36" width="100" height="9" fill="#ffffff" opacity="0.3" />
        <rect x="0" y="49" width="100" height="11" fill="#783d19" />
        <rect x="0" y="64" width="100" height="6" fill="#8c531b" />
        <rect x="0" y="73" width="100" height="7" fill="#ffffff" opacity="0.2" />
      </g>
      <ellipse cx="36" cy="22" rx="15" ry="7" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 22)"/>
      <text x="50" y="66" font-size="46" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♃</text>
    </g>
  `,
  Saturn: `
    <g>
      <g transform="rotate(-22 50 50)">
        <ellipse cx="50" cy="50" rx="64" ry="11" fill="none" stroke="url(#gradRings)" stroke-width="5.5" opacity="0.95" />
        <ellipse cx="50" cy="50" rx="66.5" ry="12.2" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.7"/>
      </g>
      <circle cx="50" cy="50" r="36" fill="url(#gradSaturn)" filter="url(#planetDropShadow)"/>
      <g transform="rotate(-22 50 50)">
        <path d="M -14,50 A 64 11 0 0 0 114,50" fill="none" stroke="url(#gradRings)" stroke-width="5.5" />
        <path d="M -16.5,50 A 66.5 12.2 0 0 0 116.5,50" fill="none" stroke="#64748b" stroke-width="0.7" opacity="0.8"/>
      </g>
      <ellipse cx="38" cy="26" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 26)"/>
      <text x="50" y="65" font-size="44" font-weight="900" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" text-anchor="middle" filter="url(#glyphShadow)">♄</text>
    </g>
  `
};

/* Escolhe entre o ícone esférico 3D e o ícone simples (glifo), conforme a
   configuração de Aparência salva pelo usuário. */
function planetIconFragment(planetId) {
  if (typeof estiloPlanetasEsferico === 'function' && estiloPlanetasEsferico()) {
    return PLANET_3D_SVGS[planetId] || '';
  }
  return (typeof getPlanetSimpleFragment === 'function') ? getPlanetSimpleFragment(planetId) : (PLANET_3D_SVGS[planetId] || '');
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

  try { localStorage.setItem('astro_ultimo_perfil', JSON.stringify(c)); } catch (e) {}

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
  return executarCalculo();
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
  const dataStr = document.getElementById('modalData').value.trim();
  const horaStr = document.getElementById('modalHora').value.trim();

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr || !dataStr.includes('/')) { alert("Informe a data no formato DD/MM/AAAA."); return; }
  if (!horaStr) { alert("Informe o horário."); return; }

  const partesData = dataStr.split('/');
  if (partesData.length !== 3) { alert("Data inválida."); return; }
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

async function executarCalculo() {
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
    renderMandala();
    return true;

  } catch (err) {
    document.getElementById('mandala-container').innerHTML = `<p style="color: #dc2626;">Erro ao calcular posições.</p>`;
    return false;
  }
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

  const syms = {
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄'
  };

  let iconContent = '';
  if (selectedHouse1Lot === 'ASC') {
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.8"/><text x="0" y="3.5" font-size="9" font-weight="900" fill="#000000" text-anchor="middle">ASC</text></svg>`;
  } else if (selectedHouse1Lot === 'fortune') {
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#103b70" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#103b70" stroke-width="1.5"/></svg>`;
  } else if (selectedHouse1Lot === 'spirit') {
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><text x="0" y="5" font-size="18" font-weight="400" font-family="'Montserrat', sans-serif" fill="#103b70" text-anchor="middle" stroke="#ffffff" stroke-width="2" paint-order="stroke fill">Φ</text></svg>`;
  } else {
    const symbol = syms[selectedHouse1Lot] || '';
    iconContent = `<svg width="24" height="24" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">${symbol}</text></svg>`;
  }

    btnContainer.innerHTML = `
    <div style="position: relative; display: inline-block;">
      <button type="button" onclick="const menu=document.getElementById('lotMenuList'); menu.style.display = menu.style.display === 'none' ? 'block' : 'none';" style="width: 32px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Mudar Casa 1 (Lotes)">
        ${iconContent}
      </button>
      <div id="lotMenuList" style="display: none; position: absolute; top: 36px; left: 0; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; z-index: 9999; width: 32px; box-sizing: border-box;">
        <div onclick="alternarRotacaoCasa1('ASC')" style="padding: 6px 0; cursor: pointer; text-align: center; font-size: 11px; font-weight: 800; color: var(--primary-blue);">ASC</div>
        <div onclick="alternarRotacaoCasa1('fortune')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#103b70" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#103b70" stroke-width="1.5"/></svg></div>
        <div onclick="alternarRotacaoCasa1('spirit')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><text x="0" y="5" font-size="26" font-weight="400" font-family="'Montserrat', sans-serif" fill="#103b70" text-anchor="middle" stroke="#ffffff" stroke-width="2" paint-order="stroke fill">Φ</text></svg></div>
        <div onclick="alternarRotacaoCasa1('mercury')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">☿</text></svg></div>
        <div onclick="alternarRotacaoCasa1('venus')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♀</text></svg></div>
        <div onclick="alternarRotacaoCasa1('mars')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♂</text></svg></div>
        <div onclick="alternarRotacaoCasa1('jupiter')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♃</text></svg></div>
        <div onclick="alternarRotacaoCasa1('saturn')" style="padding: 4px 0; cursor: pointer; display: flex; justify-content: center;"><svg width="20" height="20" viewBox="-12 -12 24 24"><circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#103b70" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="#103b70" text-anchor="middle">♄</text></svg></div>
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
  btn.innerHTML = '<i class="fa-solid fa-file-circle-plus" style="color: var(--primary-blue); font-size: 14px;"></i>';
  btn.onclick = capturarMandalaAtualParaRelatorio;
  rotationContainer.after(btn);
}

async function capturarMandalaAtualParaRelatorio() {
  if (!currentCalculatedData) { alert('Nenhum mapa carregado pra adicionar ao relatório.'); return; }
  const dataUrl = await new Promise(resolve => renderMandala(null, resolve));
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
}
window.ajustarZoomMandala = ajustarZoomMandala;

function injetarControleZoomMandala() {
  const overlay = document.getElementById('mandala-controls-overlay');
  if (!overlay || document.getElementById('mandalaZoomContainer')) return;

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
  const relatorioBtn = document.getElementById('mandalaRelatorioBtnContainer');
  if (relatorioBtn) {
    relatorioBtn.after(zoomContainer);
  } else {
    overlay.appendChild(zoomContainer);
  }
}

function renderMandala(dadosNovos, onReady, estiloForcado, fundoTransparente) {
  if (dadosNovos) currentCalculatedData = dadosNovos;
  const container = document.getElementById('mandala-container');
  if (!container || !currentCalculatedData) return;

  /* Modo claro/escuro do MENU/BARRA (Configurações > Aparência, ver
     index.html). Como este SVG vira imagem (Blob -> <img>, ver abaixo),
     variável CSS (var(--x)) NÃO funciona aqui dentro (confirmado com teste
     isolado antes de mexer) — teria que existir dentro do próprio SVG. Por
     isso as cores vêm resolvidas em hexadecimal, no par exato usado em
     :root/:root.tema-escuro (index.html) quando o papel é o mesmo (fundo
     creme, dourado, azul-marinho); e em tons novos, pensados só pra esse
     desenho, quando o papel é diferente (linhas de aspecto, elementos dos
     signos etc. — ver "tinta" logo abaixo).

     "estiloForcado" ('claro'/'escuro', opcional) IGNORA esse menu e decide
     sozinho — usado só pelo módulo de Relatório (ver renderizarMandalasDoPreset
     em relatorio.js) pra desenhar a mandala que vai virar PNG dentro de um
     PDF/imagem exportada, que não pode variar conforme o tema do
     navegador/app está ligado ou não bem na hora em que o astrólogo aperta
     "Gerar Relatório" — isso já causou capa branca com a mandala saindo com
     fundo preto por baixo (o "papel" da mandala seguia o Tema Escuro do
     menu, sem relação nenhuma com a cor da capa escolhida no modelo).
     Sem esse parâmetro (uso normal, a mandala ao vivo na tela), o
     comportamento é o de sempre: segue o Tema Escuro do menu.

     "fundoTransparente" (opcional, também só usado pelo Relatório) tira o
     retângulo de fundo que cobre a imagem inteira (ver o <rect> logo
     depois de "</defs>" mais abaixo) — sem ele, o PNG fica com um
     "quadrado" de cor sólida atrás da mandala que só combinava por
     coincidência com a capa branca "Clássico" (fundoDisco === '#ffffff'
     por acaso igual à cor de fundo da capa); em qualquer outra cor de
     capa (inclusive um "creme" quase branco, ou a variante 'escuro'
     tentando aproximar um fundo escuro qualquer) sobrava uma borda/
     retângulo visivelmente de cor diferente da capa ao redor. Com o
     fundo transparente, a mandala encaixa direto na cor que a própria
     capa já tem (ver --rel-capa-bg em relatorio.js), sem precisar
     acertar cor nenhuma. Não mexe nos círculos internos menores que
     também usam tinta.fundoDisco (mascarando cruzamento de linha atrás
     de ícone de planeta/eixo) — só o retângulo grande de fundo. */
  const modoEscuro = estiloForcado ? (estiloForcado === 'escuro') : document.documentElement.classList.contains('tema-escuro');
  const corCabecalhoPng = {
    fundo: modoEscuro ? '#1c1917' : '#fffdf5',
    borda: modoEscuro ? '#d9ae3f' : '#c59b27',
    titulo: modoEscuro ? '#8ab4e8' : '#103b70',
    dataCidade: modoEscuro ? '#c3cad4' : '#475569',
    zodiaco: modoEscuro ? '#a3aab3' : '#64748b',
    sect: modoEscuro ? '#f0c869' : '#9a6d18',
  };

  /* TINTA DO DISCO EM SI (casas, planetas, graus, eixos, aspectos). No
     Tema Claro é exatamente a paleta de sempre (nada muda). No Tema
     Escuro, o fundo do disco também escurece — o que obriga a inverter o
     "halo": os textos de grau/eixo/casa usam paint-order="stroke fill"
     com um contorno pra continuar legíveis por cima de linhas/glifos
     coloridos atrás deles, não por cima do fundo da página. Contorno
     branco atrás de tinta escura (Tema Claro) vira contorno escuro atrás
     de tinta clara (Tema Escuro) — sem isso, o halo brilha como uma
     mancha branca em volta de cada número no meio do disco escuro. */
  const tinta = modoEscuro ? {
    fundoDisco: '#1c1917',
    dourado: '#d9ae3f',
    douradoCasas: '#e8c667',
    halo: '#1c1917',
    inkForte: '#e8e6df',
    inkPlaneta: '#e8e6df',
    navio: '#8ab4e8',
    linhaConectora: '#6b7280',
    aspectoOposicao: '#fb7185',
    aspectoTrigono: '#60a5fa',
    aspectoQuadratura: '#ff6b4a',
    aspectoSextil: '#38bdf8',
    elementoFogo: '#ff6b4a',
    elementoTerra: '#c9863f',
    elementoAr: '#38bdf8',
    elementoAgua: '#60a5fa',
    dodecatemoriaLinha: 'rgba(217,174,63,0.35)',
  } : {
    fundoDisco: '#ffffff',
    dourado: '#c59b27',
    douradoCasas: '#aa820a',
    halo: '#ffffff',
    inkForte: '#000000',
    inkPlaneta: '#0f172a',
    navio: '#103b70',
    linhaConectora: '#94a3b8',
    aspectoOposicao: '#881337',
    aspectoTrigono: '#1d4ed8',
    aspectoQuadratura: '#e84118',
    aspectoSextil: '#0ea5e9',
    elementoFogo: '#e84118',
    elementoTerra: '#8b4513',
    elementoAr: '#0ea5e9',
    elementoAgua: '#1d4ed8',
    dodecatemoriaLinha: 'rgba(170,130,10,0.3)',
  };

  /* Sombra só das siglas ELEMENT_SIGN_COLORS usada NESTA função — não é o
     mesmo objeto global (const ELEMENT_SIGN_COLORS lá em cima, fora da
     função), que continua intocado porque liberacao.js também lê ele
     direto e ainda não faz parte desta etapa. */
  const ELEMENT_SIGN_COLORS = { fire: tinta.elementoFogo, earth: tinta.elementoTerra, air: tinta.elementoAr, water: tinta.elementoAgua };

  injetarBotaoRotacaoNaBarraSuperior();
  injetarBotaoRelatorioNaBarraSuperior();
  injetarControleZoomMandala();

  const data = currentCalculatedData;
  const ascAbs = data.Ascendente.grau_absoluto;
  const mcAbs = data.MC ? data.MC.grau_absoluto : (ascAbs + 270) % 360;
  const nodeAbs = data.Nodo_Norte ? data.Nodo_Norte.grau_absoluto : 0;
  const syzAbs = data.Sizigia ? data.Sizigia.grau_absoluto : 0;

  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0, symbol: p.symbol, name: p.name, retro: item ? Boolean(item.retro) : false };
  });

  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  const sectText = isDay ? "• Natividade Diurna" : "• Natividade Noturna";

  const lotes = calculateSevenLots(ascAbs, isDay, pObj);
  window.currentLotes = lotes;

  let house1RefAbs = ascAbs;
  if (selectedHouse1Lot !== "ASC") {
    const targetLot = lotes.find(l => l.key === selectedHouse1Lot);
    if (targetLot) house1RefAbs = targetLot.deg;
  }

  const diasSemanaMap = [
    { text: "Dom", sym: "☉" },
    { text: "Seg", sym: "☽" },
    { text: "Ter", sym: "♂" },
    { text: "Qua", sym: "☿" },
    { text: "Qui", sym: "♃" },
    { text: "Sex", sym: "♀" },
    { text: "Sáb", sym: "♄" }
  ];
   
  const dayInfo = diasSemanaMap[currentMoment.getDay()];
  const diaSemanaFormatted = dayInfo.text;

  const fusoVal = (currentGeo && currentGeo.fuso !== undefined) ? currentGeo.fuso : calcularFusoPorLongitude(currentGeo.lon);
  const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const goldColor = tinta.dourado;
  const pR = 390;

  /* UNIFICANDO TODOS OS ITENS DA ÓRBITA EXTERNA (Planetas + Eixos + Nodos + Sizígia + Lotes).
     Precisa vir antes do layout vertical (mais abaixo): o tamanho da faixa
     de céu/espaço depende de o quão longe os planetas acabam sendo
     empurrados (latitude + empilhamento radial). */
  const outerRingItems = [];

  /* 1. Adiciona os 7 Planetas */
    PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    const absDeg = item ? item.grau_absoluto : 0;
    outerRingItems.push({
      type: "planet",
      id: p.id,
      symbol: p.symbol,
      deg: absDeg,
      retro: item ? Boolean(item.retro) : false,
      eclLat: item ? (item.lat || 0) : 0,
      aScreen: eclToScreenAngle(absDeg, house1RefAbs)
    });
  });

  /* 3. Adiciona Nodos */
  if (nodeAbs > 0) {
    outerRingItems.push({ type: "node", label: "☊", deg: nodeAbs, color: tinta.inkForte, aScreen: eclToScreenAngle(nodeAbs, house1RefAbs) });
    outerRingItems.push({ type: "node", label: "☋", deg: (nodeAbs + 180) % 360, color: tinta.inkForte, aScreen: eclToScreenAngle((nodeAbs + 180) % 360, house1RefAbs) });
  }

  /* 4. Adiciona Sizígia */
  if (syzAbs > 0) {
    outerRingItems.push({ type: "syzygy", label: "SIZ", deg: syzAbs, color: tinta.inkForte, aScreen: eclToScreenAngle(syzAbs, house1RefAbs) });
  }

  /* 5. Adiciona os 7 Lotes */
  lotes.forEach(lot => {
    outerRingItems.push({
      type: "lot",
      label: lot.label,
      lotType: lot.type,
      sym: lot.sym,
      deg: lot.deg,
      color: goldColor,
      aScreen: eclToScreenAngle(lot.deg, house1RefAbs)
    });
  });

  /* SEPARA CONJUNÇÕES COLADAS EMPILHANDO POR RAIO, SEM MEXER NO ÂNGULO REAL */
  aplicarEmpilhamentoRadial(outerRingItems, 7.5);

  /* LOTES SE SEPARAM À PARTE, DESVIANDO NO ÂNGULO (SEM MUDAR DE RAIO) */
  aplicarDesvioLateralLotes(outerRingItems, 6);

  const latPxPerGrau = 12;

  /* Raio externo da faixa de céu/espaço: precisa cobrir o ponto mais
     distante que qualquer planeta (ou a mancha de combustão) possa
     alcançar nesse mapa específico, senão o planeta "escapa" do céu. */
  const degToPxPR = (2 * Math.PI * pR) / 360;
  const rSobRaiosGlow = degToPxPR * 15;
  let maxRaioItens = pR + rSobRaiosGlow;
  outerRingItems.forEach(item => {
    if (item.type === 'lot') return; // lotes ficam bem mais perto do centro, nunca definem o máximo
    const base = item.type === 'planet' ? pR + (item.eclLat * latPxPerGrau) : pR;
    const raio = base + (item.rOffset || 0);
    if (raio > maxRaioItens) maxRaioItens = raio;
  });
  const R_Ceu = maxRaioItens + 20; // folga visual (ícone + rótulo de grau)

  /* Tema "Céu" (padrão "Claro" se ainda não carregado, ou se o usuário
     nunca escolheu) — controla só a decoração de céu/espaço sideral. O
     tamanho e o layout do desenho continuam iguais nos dois temas. */
  const temaCeu = (typeof window.temaMandala !== 'undefined' ? window.temaMandala : 'claro') === 'ceu';

  /* Rotação do céu/espaço junto com o botão "casa 1" (ASC ou um lote): o
     ASC-DSC (horizonte real) só fica exatamente horizontal quando a casa 1
     está no próprio ASC. Girando a mesma quantidade que o ASC girou em
     relação a essa referência horizontal, o céu acompanha o horizonte
     verdadeiro em vez de ficar sempre travado na horizontal. */
  const ascScreenAngle = eclToScreenAngle(ascAbs, house1RefAbs);
  const skyRotation = ascScreenAngle - 180;

  /* Espaço extra no topo (e até o cabeçalho) para a faixa de céu/espaço
     (raio R_Ceu) e a mancha de combustão do Sol nunca serem cortadas. */
  const margemVertical = 10;
  const cy = R_Ceu + margemVertical;
  const headerY = cy + R_Ceu + margemVertical;
  const headerH = 75;
  const headerGapBottom = 20;
  /* A largura também precisa acompanhar R_Ceu: sem isso, o céu (que agora
     varia de tamanho por mapa) pode passar dos 480px de raio e ser cortado
     nas laterais pelo próprio SVG, antes mesmo de chegar no navegador —
     nunca menor que 960 (largura original), só cresce quando precisa. */
  const cx = Math.max(480, R_Ceu + margemVertical);
  const width = cx * 2, height = headerY + headerH + headerGapBottom;
  const R = { Aspects: 110, SignSector: 215, Dodec: 238, Termos: 262 };
  const R_OuterLine = 399;

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Sombra projetada do Glifo central -->
      <filter id="glyphShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.85" />
      </filter>

      <!-- Sombra suave da esfera inteira -->
      <filter id="planetDropShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.25" />
      </filter>

      <!-- SOL -->
      <radialGradient id="gradSun" cx="35%" cy="32%" r="68%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="25%" stop-color="#fde047" />
        <stop offset="60%" stop-color="#f59e0b" />
        <stop offset="88%" stop-color="#d97706" />
        <stop offset="100%" stop-color="#92400e" />
      </radialGradient>

      <!-- LUA -->
      <radialGradient id="gradMoon" cx="32%" cy="28%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="30%" stop-color="#e2e8f0" />
        <stop offset="65%" stop-color="#94a3b8" />
        <stop offset="90%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </radialGradient>

      <!-- MERCÚRIO -->
      <radialGradient id="gradMercury" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="28%" stop-color="#d97706" />
        <stop offset="65%" stop-color="#92400e" />
        <stop offset="92%" stop-color="#451a03" />
        <stop offset="100%" stop-color="#270e02" />
      </radialGradient>

      <!-- VÊNUS -->
      <radialGradient id="gradVenus" cx="34%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="30%" stop-color="#fef3c7" />
        <stop offset="65%" stop-color="#f59e0b" />
        <stop offset="90%" stop-color="#b45309" />
        <stop offset="100%" stop-color="#78350f" />
      </radialGradient>

      <!-- MARTE -->
      <radialGradient id="gradMars" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#fca5a5" />
        <stop offset="25%" stop-color="#ef4444" />
        <stop offset="60%" stop-color="#b91c1c" />
        <stop offset="88%" stop-color="#7f1d1d" />
        <stop offset="100%" stop-color="#450a0a" />
      </radialGradient>

      <!-- JÚPITER -->
      <radialGradient id="gradJupiter" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="30%" stop-color="#fef3c7" />
        <stop offset="58%" stop-color="#d4a373" />
        <stop offset="82%" stop-color="#a97142" />
        <stop offset="100%" stop-color="#6f4518" />
      </radialGradient>

      <!-- SATURNO -->
      <radialGradient id="gradSaturn" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stop-color="#fef9c3" />
        <stop offset="35%" stop-color="#fde047" />
        <stop offset="70%" stop-color="#ca8a04" />
        <stop offset="92%" stop-color="#854d0e" />
        <stop offset="100%" stop-color="#422006" />
      </radialGradient>

      <!-- Anel de Saturno (Prateado / Cinza Metálico) -->
      <linearGradient id="gradRings" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.95" />
        <stop offset="25%" stop-color="#cbd5e1" stop-opacity="0.9" />
        <stop offset="60%" stop-color="#94a3b8" stop-opacity="0.85" />
        <stop offset="85%" stop-color="#64748b" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#334155" stop-opacity="0.95" />
      </linearGradient>

         <!-- Máscara das faixas de Júpiter -->
      <clipPath id="jupiterClip">
        <circle cx="50" cy="50" r="42" />
      </clipPath>

      <!-- BRILHO DE COMBUSTÃO / SOB OS RAIOS (halo ao redor do Sol) -->
      <radialGradient id="combustionGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.9" />
        <stop offset="30%" stop-color="#fde68a" stop-opacity="0.75" />
        <stop offset="53%" stop-color="#f59e0b" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </radialGradient>

      <!-- CÉU (metade do lado do MC/acima do horizonte ASC-DSC) e ESPAÇO
           SIDERAL (metade do lado do IC), na faixa de fora dos termos até
           R_Ceu — raio grande o bastante para sempre cobrir o planeta mais
           distante desse mapa. O primeiro stop fica exatamente na borda
           interna dessa faixa (R.Termos), então tudo que se vê vai do tom
           mais claro, perto do horizonte, ao tom-base, mais saturado, perto
           da borda — uma perspectiva atmosférica simples. Nos últimos 20%
           o céu perde opacidade até ficar transparente, revelando o espaço
           sideral por baixo aos poucos — só na borda externa; a linha do
           horizonte (onde o céu encontra o espaço lateralmente) continua
           nítida, pois ali é o corte reto do próprio path. -->
      ${temaCeu ? `
      <radialGradient id="skyGradDay" cx="${cx}" cy="${cy}" r="${R_Ceu}" gradientUnits="userSpaceOnUse">
        <stop offset="${(R.Termos / R_Ceu * 100).toFixed(2)}%" stop-color="#eafdff" stop-opacity="1" />
        <stop offset="80%" stop-color="#C5F4FF" stop-opacity="1" />
        <stop offset="100%" stop-color="#C5F4FF" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="skyGradNight" cx="${cx}" cy="${cy}" r="${R_Ceu}" gradientUnits="userSpaceOnUse">
        <stop offset="${(R.Termos / R_Ceu * 100).toFixed(2)}%" stop-color="#3c4d7c" stop-opacity="1" />
        <stop offset="80%" stop-color="#273568" stop-opacity="1" />
        <stop offset="100%" stop-color="#273568" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="spaceGrad" cx="${cx}" cy="${cy}" r="${R_Ceu}" gradientUnits="userSpaceOnUse">
        <stop offset="${(R.Termos / R_Ceu * 100).toFixed(2)}%" stop-color="#3a1b66" />
        <stop offset="100%" stop-color="#1A073F" />
      </radialGradient>` : ''}
    </defs>

    <rect width="${width}" height="${height}" fill="${fundoTransparente ? 'transparent' : tinta.fundoDisco}"/>
${temaCeu ? `
    <!-- Espaço sideral: cobre tudo fora do anel dos termos, em qualquer
         direção, até a borda da tela (o "furo" no meio, via fill-rule
         evenodd, é o disco interno — signos, dodecatemoria, termos — que
         continua branco, intocado). Não gira: já cobre as duas metades por
         igual, então a orientação do horizonte não importa para ele. -->
    <path fill-rule="evenodd" d="M 0 0 H ${width} V ${height} H 0 Z
      M ${cx - R.Termos} ${cy} A ${R.Termos} ${R.Termos} 0 0 1 ${cx + R.Termos} ${cy} A ${R.Termos} ${R.Termos} 0 0 1 ${cx - R.Termos} ${cy} Z" fill="url(#spaceGrad)"/>

    <!-- Céu: a faixa entre o anel dos termos e R_Ceu, do lado do MC (acima
         do horizonte ASC-DSC) — desenhado por cima do espaço sideral. Gira
         junto com o botão de "casa 1" (skyRotation), para acompanhar o
         horizonte real quando ele deixa de ser exatamente horizontal. -->
    <g transform="rotate(${skyRotation} ${cx} ${cy})">
      <path d="M ${cx - R.Termos} ${cy} A ${R.Termos} ${R.Termos} 0 0 1 ${cx + R.Termos} ${cy} L ${cx + R_Ceu} ${cy} A ${R_Ceu} ${R_Ceu} 0 0 0 ${cx - R_Ceu} ${cy} Z" fill="url(#${isDay ? 'skyGradDay' : 'skyGradNight'})"/>
    </g>` : ''}`;

  const headerTitle = currentCustomCode ? `${currentCustomCode} ${currentSubjectName}` : currentSubjectName;

  const tipoAtual = (typeof window.currentMapType !== 'undefined' && window.currentMapType) ? window.currentMapType : 'Natal';
  const tipoFormatado = tipoAtual === 'Natal' ? 'Mapa Natal' : `Mapa de ${tipoAtual}`;

  /* CARD DO CABEÇALHO LARGO COM ESPAÇO VAZIO À DIREITA PARA OS BOTÕES */
  svg += `<g id="png-discreet-header">
    <!-- Fundo (creme/escuro conforme o modo) e Borda Dourada Estendidos quase até o fim -->
    <rect x="15" y="${headerY}" width="930" height="75" rx="10" ry="10" fill="${corCabecalhoPng.fundo}" stroke="${corCabecalhoPng.borda}" stroke-width="2" />

    <!-- Textos das 3 Linhas alinhados à esquerda -->
    <text x="30" y="${headerY + 23}" font-family="'Cinzel', serif" font-size="20" font-weight="800" fill="${corCabecalhoPng.titulo}">${escapeHtml(headerTitle)}</text>
    <text x="30" y="${headerY + 41}" font-family="'Montserrat', sans-serif" font-size="12" font-weight="500" fill="${corCabecalhoPng.dataCidade}">${diaSemanaFormatted} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted}) • ${escapeHtml(currentGeo.city)}</text>
        <text x="30" y="${headerY + 57}" font-family="'Montserrat', sans-serif" font-size="11" font-weight="600" fill="${corCabecalhoPng.zodiaco}">Zodíaco Tropical • Signos Inteiros • ${escapeHtml(tipoFormatado)} <tspan fill="${corCabecalhoPng.sect}" font-weight="700">  ${sectText}</tspan></text>
  </g>`;

  const horasInfo = (typeof window.horasPlanetariasAtual !== 'undefined') ? window.horasPlanetariasAtual : null;
  if (horasInfo) {
    if (horasInfo.dayRulerId && PLANET_3D_SVGS[horasInfo.dayRulerId]) {
      svg += `<text x="760" y="${headerY + 41}" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="${corCabecalhoPng.titulo}" text-anchor="start">DIA</text>
      <g transform="translate(800, ${headerY + 35})"><g transform="scale(0.36) translate(-50, -50)">${planetIconFragment(horasInfo.dayRulerId)}</g></g>`;
    }
    if (horasInfo.hourRulerId && PLANET_3D_SVGS[horasInfo.hourRulerId]) {
      svg += `<text x="845" y="${headerY + 41}" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="${corCabecalhoPng.titulo}" text-anchor="start">HORA</text>
      <g transform="translate(915, ${headerY + 35})"><g transform="scale(0.36) translate(-50, -50)">${planetIconFragment(horasInfo.hourRulerId)}</g></g>`;
    }
  }

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Aspects}" fill="${tinta.fundoDisco}" stroke="${goldColor}" stroke-width="2"/>`;

  const occupiedSigns = new Set();
  PLANETS_DEF.forEach(p => { occupiedSigns.add(Math.floor(pObj[p.id].abs / 30)); });
  const occupiedArray = Array.from(occupiedSigns);
  for (let i = 0; i < occupiedArray.length; i++) {
    for (let j = i + 1; j < occupiedArray.length; j++) {
      let diff = Math.abs(occupiedArray[i] - occupiedArray[j]);
      if (diff > 6) diff = 12 - diff;
      let col = null;
      if (diff === 6) col = tinta.aspectoOposicao;      // Oposição (Vinho)
else if (diff === 4) col = tinta.aspectoTrigono; // Trígono (Azul escuro)
else if (diff === 3) col = tinta.aspectoQuadratura; // Quadratura (Vermelho vivo)
else if (diff === 2) col = tinta.aspectoSextil; // Sextil (Azul claro)

      if (col) {
        const pt1 = polarToCart(cx, cy, R.Aspects - 4, eclToScreenAngle(occupiedArray[i] * 30 + 15, house1RefAbs));
        const pt2 = polarToCart(cx, cy, R.Aspects - 4, eclToScreenAngle(occupiedArray[j] * 30 + 15, house1RefAbs));
        svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${col}" stroke-width="1.8" opacity="0.9"/>`;
      }
    }
  }

  svg += `<circle cx="${cx}" cy="${cy}" r="${R.SignSector}" fill="none" stroke="${goldColor}" stroke-width="2"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Dodec}" fill="none" stroke="${goldColor}" stroke-width="1.5"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${R.Termos}" fill="none" stroke="${goldColor}" stroke-width="2"/>`;

  const ascPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(ascAbs, house1RefAbs));
  const dscPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(ascAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${ascPt.x}" y1="${ascPt.y}" x2="${dscPt.x}" y2="${dscPt.y}" stroke="${tinta.inkForte}" stroke-width="2.5"/>`;

  const mcPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(mcAbs, house1RefAbs));
  const icPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(mcAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${mcPt.x}" y1="${mcPt.y}" x2="${icPt.x}" y2="${icPt.y}" stroke="${tinta.inkForte}" stroke-width="2.5"/>`;

     /* DESENHO DOS 4 EIXOS NA PARTE INTERNA (ENCUSTADOS NO ANEL) */
  const rEixoInterno = R.SignSector - 12; // Posiciona as bolinhas encostadas por dentro do anel dos signos (aprox. 203px)

  const eixosInternos = [
    { label: "ASC", deg: ascAbs, color: tinta.inkForte },
    { label: "DSC", deg: (ascAbs + 180) % 360, color: tinta.inkForte },
    { label: "MC",  deg: mcAbs, color: tinta.inkForte },
    { label: "IC",  deg: (mcAbs + 180) % 360, color: tinta.inkForte }
  ];

  eixosInternos.forEach(eixo => {
    const aScreen = eclToScreenAngle(eixo.deg, house1RefAbs);
    const pPos = polarToCart(cx, cy, rEixoInterno, aScreen);

    svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
      <circle cx="0" cy="0" r="10" fill="${tinta.fundoDisco}" stroke="${eixo.color}" stroke-width="1.8"/>
      <text x="0" y="3.5" font-size="9" font-weight="900" fill="${eixo.color}" text-anchor="middle">${eixo.label}</text>
      <text x="0" y="18" font-size="8" font-weight="bold" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(eixo.deg)}</text>
    </g>`;
  });

  for (let i = 0; i < 12; i++) {
    const pt1 = polarToCart(cx, cy, R.Aspects, eclToScreenAngle(i * 30, house1RefAbs));
    const pt2 = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(i * 30, house1RefAbs));
    svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.8"/>`;
  }

  const refSignIdx = Math.floor(house1RefAbs / 30);
  for (let i = 0; i < 12; i++) {
    const aMid = eclToScreenAngle((i * 30) + 15, house1RefAbs);
    const pNum = polarToCart(cx, cy, 122, aMid);
    svg += `<text x="${pNum.x}" y="${pNum.y + 5}" font-family="'Cinzel', serif" font-size="15" font-weight="bold" fill="${tinta.douradoCasas}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="4" paint-order="stroke fill">${((i - refSignIdx + 12) % 12) + 1}</text>`;

    const pSym = polarToCart(cx, cy, 166, aMid);
    svg += `<svg x="${pSym.x - 17}" y="${pSym.y - 17}" width="34" height="34" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[i]]};">${MONOLINE_ZODIAC_SVGS[i]}</svg>`;
  }

  for (let i = 0; i < 12; i++) {
    for (let d = 0; d < 12; d++) {
      const pt1 = polarToCart(cx, cy, R.SignSector, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
      const pt2 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
      svg += `<line x1="${pt1.x}" x2="${pt2.x}" y1="${pt1.y}" y2="${pt2.y}" stroke="${tinta.dodecatemoriaLinha}" stroke-width="0.8"/>`;
      const pDod = polarToCart(cx, cy, (R.SignSector + R.Dodec) / 2, eclToScreenAngle((i * 30) + (d * 2.5) + 1.25, house1RefAbs));
      svg += `<svg x="${pDod.x - 5.5}" y="${pDod.y - 5.5}" width="11" height="11" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[(i + d) % 12]]};">${MONOLINE_ZODIAC_SVGS[(i + d) % 12]}</svg>`;
    }
  }

  for (let s = 0; s < 12; s++) {
    let prev = 0;
    EGYPTIAN_TERMS[s].forEach(term => {
      const pt1 = polarToCart(cx, cy, R.Dodec, eclToScreenAngle((s * 30) + prev, house1RefAbs));
      const pt2 = polarToCart(cx, cy, R.Termos, eclToScreenAngle((s * 30) + prev, house1RefAbs));
      svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.2"/>`;
      const pTerm = polarToCart(cx, cy, (R.Dodec + R.Termos) / 2, eclToScreenAngle((s * 30) + (prev + term.deg) / 2, house1RefAbs));
      svg += `<text x="${pTerm.x}" y="${pTerm.y + 4}" font-size="10" font-weight="bold" fill="${goldColor}" text-anchor="middle">${term.p}</text>`;
      prev = term.deg;
    });
  }

  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 12 : ((deg % 5 === 0) ? 8 : 4);
    const p1 = polarToCart(cx, cy, R.Termos, aScreen);
    const p2 = polarToCart(cx, cy, R.Termos - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.5 : 0.8}"/>`;
  }
   
  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 10 : ((deg % 5 === 0) ? 6 : 3);
    const p1 = polarToCart(cx, cy, R.SignSector, aScreen);
    const p2 = polarToCart(cx, cy, R.SignSector - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.2 : 0.6}"/>`;
  }

    /* 1. CAMADA 1: MANCHA DE COMBUSTÃO (FUNDO DE TUDO) */
  const sunItem = outerRingItems.find(it => it.type === 'planet' && it.id === 'Sun');
  if (sunItem) {
    const degToPx = (2 * Math.PI * pR) / 360;
    const rSobRaios = degToPx * 15;
    const sunGlowPos = polarToCart(cx, cy, pR, sunItem.aScreen);
    svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaios}" fill="url(#combustionGlow)"/>`;
  }

  /* 2. CAMADA 2: PONTOS SEM CORPO FÍSICO (nodos, sizígia, lotes) */
  outerRingItems.forEach(item => {
    if (item.type === 'planet') return;

    const raioEfetivo = (item.type === 'lot' ? 276 : pR) + (item.rOffset || 0);

    const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
    const p2 = polarToCart(cx, cy, (item.type === 'lot' ? raioEfetivo - 12 : raioEfetivo - 19), item.aShift);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${item.color}" stroke-width="1.2"/>`;

    const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);

    if (item.type === "node") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <text x="0" y="5" font-size="24" font-weight="bold" fill="${item.color}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="4" paint-order="stroke fill">${item.label}</text>
        <text x="0" y="19" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "syzygy") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <circle cx="0" cy="0" r="12" fill="${tinta.fundoDisco}" stroke="none"/>
        <circle cx="0" cy="0" r="10" stroke="${item.color}" stroke-width="1.8" fill="none"/>
        <path d="M 0 -10 A 10 10 0 0 1 0 10 Q 3.8 -3.8 -3.8 -10 Z" fill="${item.color}"/>
        <circle cx="0" cy="0" r="2.3" fill="${item.color}"/>
        <text x="0" y="21" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "lot") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">`;
      if (item.lotType === "fortune") {
        svg += `<circle cx="0" cy="0" r="10" fill="${tinta.fundoDisco}" stroke="${tinta.navio}" stroke-width="1.5"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="${tinta.navio}" stroke-width="1.5"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="${tinta.navio}" stroke-width="1.5"/>`;
      } else if (item.lotType === "spirit") {
        svg += `<text x="0" y="5" font-size="34" font-weight="400" font-family="'Montserrat', sans-serif" fill="${tinta.navio}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="2" paint-order="stroke fill">Φ</text>`;
      } else {
        svg += `<circle cx="0" cy="0" r="10" fill="${tinta.fundoDisco}" stroke="${tinta.navio}" stroke-width="1.5"/><text x="0" y="4" font-size="11" font-weight="bold" fill="${tinta.navio}" text-anchor="middle">${item.sym}</text>`;
      }
      svg += `<text x="0" y="17" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text></g>`;
    }
  });

  /* 3. CAMADA 3: OS 7 PLANETAS CLÁSSICOS, NA ORDEM CALDAICA
     (do mais distante da Terra para o mais próximo). Assim, quando um
     planeta está "sob os raios" e por isso sobreposto ao Sol (ou a outro
     planeta), quem fica na frente é sempre o corpo mais próximo da Terra —
     exatamente como no céu real, onde o mais distante fica encoberto. */
  const ORDEM_CALDAICA = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  outerRingItems
    .filter(item => item.type === 'planet')
    .sort((a, b) => ORDEM_CALDAICA.indexOf(a.id) - ORDEM_CALDAICA.indexOf(b.id))
    .forEach(item => {
      const raioEfetivo = pR + (item.eclLat * latPxPerGrau) + (item.rOffset || 0);

      const p1 = polarToCart(cx, cy, R.Termos, item.aScreen);
      const p2 = polarToCart(cx, cy, raioEfetivo - 19, item.aShift);
      svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${tinta.linhaConectora}" stroke-width="1.2"/>`;

      const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);
      const planetSvgContent = planetIconFragment(item.id);
      let retroSymbol = item.retro ? `<tspan fill="#dc2626" font-weight="900"> ℞</tspan>` : '';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        <g transform="scale(0.36) translate(-50, -50)">${planetSvgContent}</g>
        <text x="0" y="27" font-size="10.5" font-weight="800" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3.5" paint-order="stroke fill">${formatDegMin(item.deg)}${retroSymbol}</text>
      </g>`;
    });

  svg += `</svg>`;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(svgBlob);

  const imgLoader = new Image();
  imgLoader.onload = function() {
    const exportScale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * exportScale;
    canvas.height = height * exportScale;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgLoader, 0, 0, canvas.width, canvas.height);

       lastRenderedPngUrl = canvas.toDataURL('image/png');

          container.innerHTML = `
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: visible; position: relative;">
    <img id="mandalaImg" src="${lastRenderedPngUrl}" alt="Mandala Astrológica" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; transform: scale(${(mandalaZoomPercent / 100).toFixed(2)}); transform-origin: top center; transition: transform 120ms ease-out;">
  </div>
`;
     
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

    if (typeof onReady === 'function') onReady(lastRenderedPngUrl);
  };
  imgLoader.src = blobURL;
}

function salvarImagemMandala() {
  if (!lastRenderedPngUrl) return;
  const link = document.createElement('a');
  link.download = `Astro_Hellenic_${currentSubjectName.replace(/\s+/g, '_')}.png`;
  link.href = lastRenderedPngUrl;
  link.click();
}

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
  if (typeof abrirModuloTecnica === 'function') {
    try { abrirModuloTecnica(ultimoModulo); } catch (e) { console.error(e); }
  }

  if (typeof carregarConteudoPastaAtual === 'function') {
    try { carregarConteudoPastaAtual(); } catch(e) { console.error(e); }
  }
};
               
