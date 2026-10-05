/* ==========================================
   MÓDULO DA TABELA TÉCNICA E MATRIZ DE VISIBILIDADE
   ========================================== */

const MONOLINE_ZODIAC_SVGS_TABELA = [
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


const EGYPTIAN_TERMS_TABELA = [
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

function getSignSVG(signIndex, size = 20) {
  if (signIndex < 0 || signIndex > 11) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${corElementoSigno(signIndex)}; display: block; margin: 0 auto;">${MONOLINE_ZODIAC_SVGS_TABELA[signIndex]}</svg>`;
}

/* Ícone do planeta pronto pra tabela — delega pro bloco central novo em
   planetIcons.js, que já resolve sozinho simples/esférico (mesma
   checagem usada em toda ferramenta migrada até agora). */
function getPlanet3DSVG(planetId, tamanho = 34) {
  return (typeof getIconeSVG === 'function') ? getIconeSVG('planeta', planetId, tamanho) : '';
}

/* item.lotType/key vem como o planeta regente do lote ("venus",
   "mercury"...) pra fortune/spirit, que já tem nome próprio — mesmo
   de-para já usado em mandala.js pros ícones novos, que usam o nome do
   lote em si. */
const ITEM_LOTE_ICON_KEY = {
  fortune: 'fortune', spirit: 'spirit', venus: 'eros',
  mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis'
};

/* Ícones plotados na tabela (marcadores de lote/nodo/sizígia/ângulo) —
   agora vêm do bloco central novo, e por pedido do astrólogo (28/09/
   2026) passam a respeitar o interruptor simples/esférico igual os
   planetas já respeitavam — antes eram sempre um circulozinho simples,
   nunca esférico, mesmo com o planeta ao lado esférico. */
function getItemSVG(key, tamanho = 20) {
  if (typeof getIconeSVG !== 'function') return `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
  if (ITEM_LOTE_ICON_KEY[key]) return getIconeSVG('lote', ITEM_LOTE_ICON_KEY[key], tamanho);
  if (key === 'Nodo Norte') return getIconeSVG('outro', 'northNode', tamanho);
  if (key === 'Nodo Sul') return getIconeSVG('outro', 'southNode', tamanho);
  if (key === 'Sizígia') return getIconeSVG('outro', 'sizigia', tamanho);
  if (key === 'ASC' || key === 'DSC' || key === 'MC' || key === 'IC') return getAnguloCirculoSVG(key, tamanho + 4);
  return `<span style="font-size: 11px; font-weight: bold;">${key}</span>`;
}

/* ÍCONE DO ASC/DSC/MC/IC: o mesmo triângulo usado na mandala — sem
   girar (aqui é só uma linha de tabela, não tem "ângulo" pra apontar),
   só o rótulo escrito por cima diferencia um do outro. */
function getAnguloCirculoSVG(label, tamanho = 24) {
  if (typeof getIconeFragmento !== 'function') return `<span style="font-size: 11px; font-weight: bold;">${label}</span>`;
  const ceuOcre = typeof temaCeuAtivoNosIcones === 'function' && temaCeuAtivoNosIcones();
  const frag = getIconeFragmento('outro', 'angulo', undefined, ceuOcre ? COR_TINTA_OCRE : undefined);
  /* Tema Céu: triângulo só de contorno OCRE (COR_TINTA_OCRE; antes azul-tinta), SEM preenchimento (o papiro aparece por dentro),
     com as letras escritas em terracota — como foi desenhado com tinta, só duas cores e nada de
     fundo. É ESTA função que desenha ASC/DSC/MC/IC em todas as ferramentas e no botão da Mandala —
     a cor é decidida só aqui, pra nunca ficar diferente de um lugar pro outro. */
  const ceu = typeof temaCeuAtivoNosIcones === 'function' && temaCeuAtivoNosIcones();
  const fundo = ceu ? '' : getIconeFundoSilhueta('outro', 'angulo', (typeof paletaEpoca === 'function' ? Tema.fundoPainel() : '#fffdf5'));
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 100 100" style="display: block; margin: 0 auto;"><g>${fundo}${frag}</g><text x="50" y="58" font-size="16" font-weight="900" fill="${ceu ? '#a03e25' : 'var(--aspect-conjuncao)'}" text-anchor="middle">${label}</text></svg>`;
}

/* NOMES POR EXTENSO DE CADA PONTO, PARA A COLUNA "PONTO" DO PAINEL TÉCNICO */
const NOMES_PONTOS_TABELA = {
  Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno',
  'Nodo Norte': 'Nodo Norte', 'Nodo Sul': 'Nodo Sul', 'Sizígia': 'Sizígia',
  fortune: 'Fortuna', spirit: 'Espírito', venus: 'Eros', mercury: 'Necessidade', mars: 'Coragem', jupiter: 'Vitória', saturn: 'Nêmesis',
  ASC: 'Ascendente', DSC: 'Descendente', MC: 'Meio-Céu', IC: 'Fundo do Céu'
};

function formatDegMinTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return '-';
  const degInSign = absDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutes = Math.round((degInSign - degrees) * 60);
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${degrees}°${minStr}′`;
}

function formatarLatitudeEcliptica(lat) {
  if (lat === undefined || lat === null || isNaN(lat)) return '-';
  if (Math.abs(lat) < 0.001) return '0°00′';
  const absLat = Math.abs(lat);
  const deg = Math.floor(absLat);
  const min = Math.round((absLat - deg) * 60);
  const minStr = min < 10 ? `0${min}` : `${min}`;
  const dir = lat >= 0 ? 'N' : 'S';
  return `${deg}°${minStr}′ ${dir}`;
}

function calcEgyptianTermTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return '-';
  const signIdx = Math.floor(absDeg / 30);
  const degInSign = absDeg % 30;
  const signTerms = EGYPTIAN_TERMS_TABELA[signIdx];
  if (!signTerms) return '-';
  for (let t of signTerms) {
    if (degInSign < t.deg) return t.p;
  }
  return '-';
}

function calcDodecatemoriaTabela(absDeg) {
  if (absDeg === undefined || absDeg === null || isNaN(absDeg)) return { signIdx: -1, degFormatted: '-' };
  const signIdxInicial = Math.floor(absDeg / 30);
  const degInSign = absDeg % 30;
  const projecaoGraus = degInSign * 12;
  const dodecAbs = ((signIdxInicial * 30) + projecaoGraus) % 360;
  return {
    signIdx: Math.floor(dodecAbs / 30),
    degFormatted: formatDegMinTabela(dodecAbs)
  };
}

/* CABEÇALHO: o do Painel Técnico e o da Matriz são o cabeçalho GLOBAL
   (montarCabecalhoMandalaImagemHTML, mandala.js), chamado direto. O id
   "painelTecnicoHeader" é usado logo abaixo pra sincronizar a largura com a tabela. */
/* Mede a largura de um texto renderizado numa fonte específica — usado
   só pra calcular a largura de cada coluna do Painel Principal em SVG
   (montarSVGPainelPrincipal, mais abaixo), que — ao contrário de uma
   <table> HTML — não tem layout automático: cada célula precisa de
   x/width explícitos. Canvas 2D reaproveitado entre chamadas. */
let _canvasMedidaTextoTabela = null;
function medirLarguraTextoTabela(texto, fontSizePx, fontWeight) {
  if (!_canvasMedidaTextoTabela) _canvasMedidaTextoTabela = document.createElement('canvas');
  const ctx = _canvasMedidaTextoTabela.getContext('2d');
  ctx.font = `${fontWeight || 400} ${fontSizePx}px 'Montserrat', sans-serif`;
  return ctx.measureText(texto).width;
}

/* Lê o width/height já declarado num fragmento "<svg width=... height=...
   ...>...</svg>" — mesma extração que posicionarIconeMatrizSVG
   (matrizVisibilidade.js) já faz por dentro; separada aqui porque
   montarSVGPainelPrincipal precisa saber o tamanho do ícone ANTES de
   decidir onde centralizá-lo (pra calcular a largura da coluna). */
function extrairTamanhoIconeSVG(fragmentoSVG) {
  const wMatch = fragmentoSVG.match(/width="([\d.]+)"/);
  const hMatch = fragmentoSVG.match(/height="([\d.]+)"/);
  return { w: wMatch ? parseFloat(wMatch[1]) : 24, h: hMatch ? parseFloat(hMatch[1]) : 24 };
}

/* Ícone da coluna "Ponto" — igual ao getMatrizIconeSVG (matrizVisibilidade.js,
   mesma ideia, campos do objeto diferentes porque a lista de elementos
   do Painel Principal usa outro formato). Nodo Norte/Sul: getItemSVG já
   devolve um <svg> de verdade (getIconeSVG), não mais o <span> de HTML
   solto de antes — cabe direto dentro do <svg> puro sem precisar de
   caso especial (o caso especial antigo aqui, removido em 28/09/2026,
   tinha ficado desatualizado e continuava mostrando o símbolo cru). */
function getIconePontoTabelaSVG(el) {
  if (el.type === 'planet') return getPlanet3DSVG(el.pId);
  return getItemSVG(el.key);
}

/* calcEgyptianTermTabela devolve só o glifo Unicode do regente do termo
   ("♃" etc) — de-para pro id do planeta que o ícone novo dos termos usa
   (mesmo mapa de mandala.js/direcoes.js). Só os 5 regentes de termo
   egípcio entram aqui (nunca Sol/Lua). */
const TERMO_PLANET_BY_SYMBOL_TABELA = { '♃': 'Jupiter', '♀': 'Venus', '☿': 'Mercury', '♂': 'Mars', '♄': 'Saturn' };
function getTermoIconeTabelaSVG(simbolo, tamanho = 20) {
  if (typeof getIconeTermoSVG !== 'function') return `<svg width="${tamanho}" height="${tamanho}"><text x="${tamanho / 2}" y="${tamanho / 2 + 5}" font-size="14" font-weight="700" fill="var(--ocre)" text-anchor="middle">${simbolo}</text></svg>`;
  const planetId = TERMO_PLANET_BY_SYMBOL_TABELA[simbolo];
  return getIconeTermoSVG(planetId, tamanho, 'var(--ocre)'); // Tema Céu (papiro): ícones dos termos sempre em amarelo ocre
}

/* Reconstrói a tabela do Painel Principal (Ponto/Signo/Grau/Latitude/
   Termo/Dodecatemória) em SVG puro — mesmo motivo e mesmo resultado que
   a reescrita da Matriz de Visibilidade: sendo um <svg>, ela encolhe só
   com CSS (max-width/height, como uma imagem) e usa o zoom nativo da
   página, sem precisar de nenhuma caixinha de zoom calculada em JS nem
   de bloquear o touch-action — que era exatamente o que fazia o
   conteúdo ampliado ficar escondido atrás de uma margem ao dar zoom.

   Diferença da Matriz: lá o grid é uniforme (todas as células do mesmo
   tamanho). Aqui as colunas têm conteúdos bem diferentes (ícone+nome,
   signo, grau, latitude, termo, dodecatemória) — como um <svg> não tem
   layout automático de tabela, a largura de cada coluna é medida na
   mão (texto via medirLarguraTextoTabela, ícone via extrairTamanhoIconeSVG)
   e só depois usada pra posicionar tudo, replicando o que uma <table>
   HTML calcularia sozinha. */
function montarSVGPainelPrincipal(listaElementos) {
  const PAD_X = 10, PAD_Y = 8;
  const F_HEADER = { size: 11, weight: 700 };
  const F_PONTO_LABEL = { size: 9, weight: 600 };
  const F_GRAU = { size: 12, weight: 600 };
  const F_LAT = { size: 12, weight: 600 };
  const TERMO_ICONE_TAMANHO = 20;
  const F_DODEC_GRAU = { size: 12, weight: 600 };
  const MARGEM_SEGURANCA = 4; // colchão pra pequenas imprecisões de medida (ex.: fonte ainda carregando)

  const linhas = listaElementos.map(el => {
    const absDeg = el.abs;
    const iconeSVG = getIconePontoTabelaSVG(el);
    const pointName = el.type === 'planet' ? (NOMES_PONTOS_TABELA[el.pId] || el.pId) : (NOMES_PONTOS_TABELA[el.key] || el.key);
    const signoSVG = getSignSVG(Math.floor(absDeg / 30), 18);
    const grauBase = formatDegMinTabela(absDeg);
    const temRetro = Boolean(el.retro);
    const latFormatted = (el.type === 'planet') ? formatarLatitudeEcliptica(el.lat) : '-';
    const termoSimbolo = calcEgyptianTermTabela(absDeg);
    const termoIconeSVG = getTermoIconeTabelaSVG(termoSimbolo, TERMO_ICONE_TAMANHO);
    const dodec = calcDodecatemoriaTabela(absDeg);
    const dodecSignoSVG = getSignSVG(dodec.signIdx, 18);
    // rótulos dos glifos (Configurações → Aparência): o nome por extenso embaixo do glifo, quando ligado
    const signoNome = nomeSigno(Math.floor(absDeg / 30));
    const termoNome = nomePlaneta(TERMO_PLANET_BY_SYMBOL_TABELA[termoSimbolo]);
    const dodecSignoNome = nomeSigno(dodec.signIdx);
    return { iconeSVG, pointName, signoSVG, grauBase, temRetro, latFormatted, termoIconeSVG, dodecSignoSVG, dodecGrauFormatted: dodec.degFormatted, signoNome, termoNome, dodecSignoNome };
  });

  // Largura de cada coluna = o maior entre o rótulo do cabeçalho e o
  // conteúdo de todas as linhas (igual a como uma <table> HTML decide
  // sozinha a largura de cada coluna).
  let wPonto = medirLarguraTextoTabela('PONTO', F_HEADER.size, F_HEADER.weight);
  let wSigno = medirLarguraTextoTabela('SIGNO', F_HEADER.size, F_HEADER.weight);
  let wGrau = medirLarguraTextoTabela('GRAU', F_HEADER.size, F_HEADER.weight);
  let wLat = medirLarguraTextoTabela('LATITUDE', F_HEADER.size, F_HEADER.weight);
  let wTermo = medirLarguraTextoTabela('TERMO', F_HEADER.size, F_HEADER.weight);
  let wDodecSigno = medirLarguraTextoTabela('SIGNO', F_HEADER.size, F_HEADER.weight);
  let wDodecGrau = medirLarguraTextoTabela('GRAU', F_HEADER.size, F_HEADER.weight);

  const alturasLinha = [];
  linhas.forEach(l => {
    const iconeTam = extrairTamanhoIconeSVG(l.iconeSVG);
    wPonto = Math.max(wPonto, iconeTam.w, medirLarguraTextoTabela(l.pointName, F_PONTO_LABEL.size, F_PONTO_LABEL.weight));
    wSigno = Math.max(wSigno, extrairTamanhoIconeSVG(l.signoSVG).w, medirLarguraTextoTabela(l.signoNome, F_PONTO_LABEL.size, F_PONTO_LABEL.weight));
    wGrau = Math.max(wGrau, medirLarguraTextoTabela(l.grauBase + (l.temRetro ? ' ℞' : ''), F_GRAU.size, F_GRAU.weight));
    wLat = Math.max(wLat, medirLarguraTextoTabela(l.latFormatted, F_LAT.size, F_LAT.weight));
    wTermo = Math.max(wTermo, extrairTamanhoIconeSVG(l.termoIconeSVG).w, medirLarguraTextoTabela(l.termoNome, F_PONTO_LABEL.size, F_PONTO_LABEL.weight));
    wDodecSigno = Math.max(wDodecSigno, extrairTamanhoIconeSVG(l.dodecSignoSVG).w, medirLarguraTextoTabela(l.dodecSignoNome, F_PONTO_LABEL.size, F_PONTO_LABEL.weight));
    wDodecGrau = Math.max(wDodecGrau, medirLarguraTextoTabela(l.dodecGrauFormatted, F_DODEC_GRAU.size, F_DODEC_GRAU.weight));

    const alturaLabel = Math.ceil(F_PONTO_LABEL.size * 1.3);
    alturasLinha.push(iconeTam.h + 2 + alturaLabel + PAD_Y * 2);
  });

  wPonto = Math.ceil(wPonto) + PAD_X * 2 + MARGEM_SEGURANCA;
  wSigno = Math.ceil(wSigno) + PAD_X * 2 + MARGEM_SEGURANCA;
  wGrau = Math.ceil(wGrau) + PAD_X * 2 + MARGEM_SEGURANCA;
  wLat = Math.ceil(wLat) + PAD_X * 2 + MARGEM_SEGURANCA;
  wTermo = Math.ceil(wTermo) + PAD_X * 2 + MARGEM_SEGURANCA;
  wDodecSigno = Math.ceil(wDodecSigno) + PAD_X * 2 + MARGEM_SEGURANCA;
  wDodecGrau = Math.ceil(wDodecGrau) + PAD_X * 2 + MARGEM_SEGURANCA;

  const colX = { ponto: 0 };
  colX.signo = colX.ponto + wPonto;
  colX.grau = colX.signo + wSigno;
  colX.lat = colX.grau + wGrau;
  colX.termo = colX.lat + wLat;
  colX.dodecSigno = colX.termo + wTermo;
  colX.dodecGrau = colX.dodecSigno + wDodecSigno;
  const totalW = colX.dodecGrau + wDodecGrau;

  const alturaHeaderLinha = Math.ceil(F_HEADER.size * 1.3) + PAD_Y * 2;
  const headerH = alturaHeaderLinha * 2;

  const rowY = [];
  let y = headerH;
  alturasLinha.forEach(h => { rowY.push(y); y += h; });
  const totalH = y;

  const corBorda = 'var(--azul-egipcio-claro)'; // grade quadriculada: linhas nos lados mantidas, cantos retos, na cor das divisas
  let svg = `<svg width="${totalW + 2}" height="${totalH + 2}" viewBox="0 0 ${totalW + 2} ${totalH + 2}" style="display: inline-block; max-width: 100%; height: auto; font-family: 'Montserrat', sans-serif;"><g transform="translate(1 1)">`;

  // Cabeçalho — Ponto/Signo/Grau/Latitude/Termo ocupam as duas linhas
  // (equivalente ao rowspan="2" de antes); Dodecatemória ocupa as duas
  // colunas da direita na linha 1 (equivalente ao colspan="2"), com
  // Signo/Grau embaixo na linha 2.
  function celulaHeader(x, y, w, h, texto) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${corBorda}" stroke-width="1"/>` +
      `<text x="${x + w / 2}" y="${y + h / 2}" font-size="${F_HEADER.size}" font-weight="${F_HEADER.weight}" letter-spacing="0.5" fill="var(--azul-egipcio-escuro)" text-anchor="middle" dominant-baseline="central">${texto}</text>`;
  }
  svg += celulaHeader(colX.ponto, 0, wPonto, headerH, 'PONTO');
  svg += celulaHeader(colX.signo, 0, wSigno, headerH, 'SIGNO');
  svg += celulaHeader(colX.grau, 0, wGrau, headerH, 'GRAU');
  svg += celulaHeader(colX.lat, 0, wLat, headerH, 'LATITUDE');
  svg += celulaHeader(colX.termo, 0, wTermo, headerH, 'TERMO');
  svg += celulaHeader(colX.dodecSigno, 0, wDodecSigno + wDodecGrau, alturaHeaderLinha, 'DODECATEMÓRIA');
  svg += celulaHeader(colX.dodecSigno, alturaHeaderLinha, wDodecSigno, alturaHeaderLinha, 'SIGNO');
  svg += celulaHeader(colX.dodecGrau, alturaHeaderLinha, wDodecGrau, alturaHeaderLinha, 'GRAU');

  // glifo no centro da célula; com o nome embaixo quando os rótulos estão ligados
  function iconeComRotulo(iconeSVG, nome, x, cy) {
    if (!nome) return posicionarIconeMatrizSVG(iconeSVG, x, cy);
    const tam = extrairTamanhoIconeSVG(iconeSVG);
    return posicionarIconeMatrizSVG(iconeSVG, x, cy - 6) +
      `<text x="${x}" y="${cy - 6 + tam.h / 2 + 9}" font-size="${F_PONTO_LABEL.size}" font-weight="${F_PONTO_LABEL.weight}" fill="var(--preto-tinta)" text-anchor="middle" dominant-baseline="central">${escapeHtml(nome)}</text>`;
  }

  // Corpo
  linhas.forEach((l, i) => {
    const y0 = rowY[i];
    const h = alturasLinha[i];
    const cy = y0 + h / 2;

    function celula(x, w, conteudoSVG) {
      return `<rect x="${x}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${corBorda}" stroke-width="1"/>${conteudoSVG}`;
    }

    // Ponto: ícone em cima, nome embaixo
    const iconeTam = extrairTamanhoIconeSVG(l.iconeSVG);
    const alturaLabel = Math.ceil(F_PONTO_LABEL.size * 1.3);
    const blocoAltura = iconeTam.h + 2 + alturaLabel;
    const topoBloco = cy - blocoAltura / 2;
    const iconePosicionado = posicionarIconeMatrizSVG(l.iconeSVG, colX.ponto + wPonto / 2, topoBloco + iconeTam.h / 2);
    const labelPonto = `<text x="${colX.ponto + wPonto / 2}" y="${topoBloco + iconeTam.h + 2 + alturaLabel / 2}" font-size="${F_PONTO_LABEL.size}" font-weight="${F_PONTO_LABEL.weight}" fill="var(--preto-tinta)" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.pointName)}</text>`;
    svg += celula(colX.ponto, wPonto, iconePosicionado + labelPonto);

    // Signo
    svg += celula(colX.signo, wSigno, iconeComRotulo(l.signoSVG, l.signoNome, colX.signo + wSigno / 2, cy));

    // Grau (com ℞ em vermelho quando retrógrado)
    const textoGrau = l.temRetro
      ? `${escapeHtml(l.grauBase)}<tspan fill="var(--terracota)" font-weight="900"> ℞</tspan>`
      : escapeHtml(l.grauBase);
    svg += celula(colX.grau, wGrau, `<text x="${colX.grau + wGrau / 2}" y="${cy}" font-size="${F_GRAU.size}" font-weight="${F_GRAU.weight}" fill="var(--preto-tinta)" text-anchor="middle" dominant-baseline="central">${textoGrau}</text>`);

    // Latitude
    svg += celula(colX.lat, wLat, `<text x="${colX.lat + wLat / 2}" y="${cy}" font-size="${F_LAT.size}" font-weight="${F_LAT.weight}" fill="var(--preto-tinta)" fill-opacity=".75" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.latFormatted)}</text>`);

    // Termo
    svg += celula(colX.termo, wTermo, iconeComRotulo(l.termoIconeSVG, l.termoNome, colX.termo + wTermo / 2, cy));

    // Dodecatemória — Signo
    svg += celula(colX.dodecSigno, wDodecSigno, iconeComRotulo(l.dodecSignoSVG, l.dodecSignoNome, colX.dodecSigno + wDodecSigno / 2, cy));

    // Dodecatemória — Grau
    svg += celula(colX.dodecGrau, wDodecGrau, `<text x="${colX.dodecGrau + wDodecGrau / 2}" y="${cy}" font-size="${F_DODEC_GRAU.size}" font-weight="${F_DODEC_GRAU.weight}" fill="var(--preto-tinta)" text-anchor="middle" dominant-baseline="central">${escapeHtml(l.dodecGrauFormatted)}</text>`);
  });

  svg += `</g></svg>`;
  return svg;
}

function renderPainelTecnico(data, containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container || !data) return;

    const ascAbs = data.Ascendente ? data.Ascendente.grau_absoluto : 0;
    const mcAbs = data.MC ? data.MC.grau_absoluto : (ascAbs + 270) % 360;
    const nodeAbs = data.Nodo_Norte ? data.Nodo_Norte.grau_absoluto : 0;
    const syzAbs = data.Sizigia ? data.Sizigia.grau_absoluto : 0;

    const pObj = {};
    const mapKeys = { Sun: 'Sol', Moon: 'Lua', Mercury: 'Mercúrio', Venus: 'Vênus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno' };
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach(id => {
      const item = data[mapKeys[id]];
      pObj[id] = {
        abs: item ? item.grau_absoluto : 0,
        retro: item ? Boolean(item.retro) : false,
        lat: item ? (parseFloat(item.lat) || 0) : 0
      };
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

    const listaElementos = [
      { type: 'planet', pId: 'Sun', abs: pObj.Sun.abs, retro: false, lat: pObj.Sun.lat },
      { type: 'planet', pId: 'Moon', abs: pObj.Moon.abs, retro: false, lat: pObj.Moon.lat },
      { type: 'planet', pId: 'Mercury', abs: pObj.Mercury.abs, retro: pObj.Mercury.retro, lat: pObj.Mercury.lat },
      { type: 'planet', pId: 'Venus', abs: pObj.Venus.abs, retro: pObj.Venus.retro, lat: pObj.Venus.lat },
      { type: 'planet', pId: 'Mars', abs: pObj.Mars.abs, retro: pObj.Mars.retro, lat: pObj.Mars.lat },
      { type: 'planet', pId: 'Jupiter', abs: pObj.Jupiter.abs, retro: pObj.Jupiter.retro, lat: pObj.Jupiter.lat },
      { type: 'planet', pId: 'Saturn', abs: pObj.Saturn.abs, retro: pObj.Saturn.retro, lat: pObj.Saturn.lat },
      { type: 'item', key: 'Nodo Norte', abs: nodeAbs },
      { type: 'item', key: 'Nodo Sul', abs: (nodeAbs + 180) % 360 },
      { type: 'item', key: 'Sizígia', abs: syzAbs },
      { type: 'item', key: 'fortune', abs: fortAbs },
      { type: 'item', key: 'spirit', abs: spirAbs },
      { type: 'item', key: 'venus', abs: erosAbs },
      { type: 'item', key: 'mercury', abs: necAbs },
      { type: 'item', key: 'mars', abs: courAbs },
      { type: 'item', key: 'jupiter', abs: vicAbs },
      { type: 'item', key: 'saturn', abs: nemAbs },
      { type: 'item', key: 'ASC', abs: ascAbs },
      { type: 'item', key: 'DSC', abs: (ascAbs + 180) % 360 },
      { type: 'item', key: 'MC', abs: mcAbs },
      { type: 'item', key: 'IC', abs: (mcAbs + 180) % 360 }
    ];

    const btnSalvar = `<button type="button" onclick="salvarPainelTecnicoNaGaleria()" title="Salvar o Painel Técnico como imagem na galeria (com título e cabeçalho)" class="botao-icone">
          <svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
        </button>`;
    const btnRelatorio = `<button type="button" onclick="capturarPainelTecnicoParaRelatorio()" title="Adicionar ao Relatório (só a tabela, sem título nem cabeçalho)" class="botao-icone">
          <svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
        </button>`;

    const html = `
      <div style="width: 100%;">
      <div id="painel-tecnico-container" class="painel painel-tecnico-folha" style="width: 100%; min-height: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Painel Técnico de Natividades</h3><div class="acoes-ferramenta">${btnSalvar}${btnRelatorio}</div></div>

        ${montarCabecalhoMandalaImagemHTML(data, 'painelTecnicoHeader', { tintaSobreFolha: true })}

        <div id="painelPrincipalContainer" style="text-align: center; margin: 12px 0;">
          ${montarSVGPainelPrincipal(listaElementos)}
        </div>
        <hr class="divisa">
      </div>
      </div>
    `;
    container.innerHTML = html;

    // O cabeçalho (o global) fica com a largura exata da grade, no celular e no desktop (ver sincronizarLarguraCabecalhoComGrade, mandala.js).
    sincronizarLarguraCabecalhoComGrade('painelTecnicoHeader', '#painelPrincipalContainer svg');
  } catch (err) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div style="padding: 15px; color: var(--terracota); text-align: center; font-weight: bold; border-top: 1px solid var(--terracota); border-bottom: 1px solid var(--terracota); margin: 20px auto; max-width: 960px; border-radius: 6px;">Erro no Painel Técnico: ${err.message}</div>`;
    }
  }
}

/* Captura o Painel Técnico pro Relatório, com html2canvas — igual ao
   padrão usado em capturarMatrizVisibilidadeMandalaParaRelatorio
   (matrizVisibilidade.js). Antes precisava desfazer/refazer um
   transform:scale antes/depois de capturar (bug conhecido do html2canvas
   com overflow:auto + transform:scale juntos, da caixinha de zoom que a
   tabela tinha) — desde que o Painel Principal virou SVG puro, sem
   caixinha nem transform nenhum (ver montarSVGPainelPrincipal), isso
   deixou de ser necessário: é só capturar direto. */
async function capturarPainelTecnicoParaRelatorio() {
  const svgEl = document.querySelector('#painelPrincipalContainer svg');
  if (!svgEl) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  try {
    // Só a tabela (sem título nem cabeçalho do cliente), direto do SVG (rápido).
    const papiro = Tema.ceu();
    const modoEscuro = !papiro && Tema.modoEscuro();
    const fundo = papiro ? null : Tema.fundoPainel(modoEscuro); // Tema Céu: imagem sem fundo (só as linhas em tinta)
    const canvas = recortarCanvasAoConteudo(await gerarImagemFerramentaDoSvg(svgEl, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('tabela_tecnica', canvas.toDataURL('image/png'));
    alert(`"Painel Técnico de Natividades" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar Painel Técnico ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarPainelTecnicoParaRelatorio = capturarPainelTecnicoParaRelatorio;


/* Botão de galeria: captura título + cabeçalho + tabela SÓ AO TOCAR (ver
   capturarESalvarNaGaleria, mandala.js — igual em todas as ferramentas). */
function salvarPainelTecnicoNaGaleria() {
  const svgEl = document.querySelector('#painelPrincipalContainer svg');
  if (!svgEl) return;
  capturarESalvarNaGaleria(() => gerarImagemFerramentaDoSvg(svgEl, { comCabecalho: true, papiro: true, titulo: 'PAINEL TÉCNICO DE NATIVIDADES' }), `Astro_Hellenic_Painel_Tecnico_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`);
}
window.salvarPainelTecnicoNaGaleria = salvarPainelTecnicoNaGaleria;

/* FUNÇÃO DE INICIALIZAÇÃO CHAMADA PELO BOTÃO DA BARRA */
function iniciarModuloTabelaTecnica() {
  if (typeof renderPainelTecnico === 'function' && typeof currentCalculatedData !== 'undefined' && currentCalculatedData) {
    renderPainelTecnico(currentCalculatedData, 'mandala-container');
  }
}
