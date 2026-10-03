/* RODA CENTRAL — o desenho da mandala (SVG), em UM lugar só.
   Cada ESTILO de mandala (francês, Astro Hellenic, e os que vierem) é uma entrada em RODA_ESTILOS; cores e ícones NÃO são do
   estilo — vêm do tema (claro, escuro, papiro, Céu). Chamada por renderMandala (mandala.js), que só cuida da tela/PNG/cache.
   Etapa 1 do plano "função global da mandala": as cópias do desenho na Profecção, Sinastria e Liberação ainda não usam esta função. */

/* Cada estilo é só um conjunto de "botões" de formato lidos por desenharRodaSVG. Estilo novo = entrada nova aqui
   (se precisar de uma geometria que não cabe nesses botões, o código correspondente em desenharRodaSVG ganha um ramo novo). */
const RODA_ESTILOS = {
  frances: {
    nome: 'Estilo francês',
    raios: { Aspects: 110, SignSector: 215, Dodec: 238, Termos: 262 },
    faixaZodiaco: false,          // signos num anel por dentro (números das casas e glifos), divisas em linha cheia até o miolo
    aneisTracejados: false,
    eixosTracejados: false,       // ASC-DSC / MC-IC em traço liso
    reticulosTracejados: false,   // sem tracejado em volta dos ícones calculados (nodos, sizígia, lotes, ângulos)
    raioLotes: 276,               // lotes logo por fora do anel dos termos
    raioDestaque: 399,            // até onde vão as fatias e as etiquetas de destaque de signo das ferramentas (Profecção, Sinastria)
    fioPlanetaDe: 'Termos',       // o fio dos planetas/lotes sai do anel dos termos...
    planetaComDesvio: true        // ...e conjunções coladas são empurradas (aShift/rOffset)
  },
  astrohellenic: {
    nome: 'Estilo Astro Hellenic',
    raios: { Aspects: 110, SignSector: 233, Dodec: 256, Termos: 280 },
    faixaZodiaco: true,           // faixa do zodíaco na eclíptica, com os planetas dentro
    aneisTracejados: true,
    eixosTracejados: true,
    reticulosTracejados: true,    // tracejado em volta dos ícones que não são do céu de verdade (nodos, sizígia, lotes, ângulos) — em qualquer tema
    raioLotes: 190,               // lotes por dentro
    raioDestaque: 498,            // por fora da faixa do zodíaco (pR + 9 graus de latitude)
    fioPlanetaDe: 'Aspects',      // o fio sai do disco do miolo
    planetaComDesvio: false       // planeta sempre na posição real
  }
};
/* "Astro Hellenic" de linhas retas: a MESMA roda do tracejado (a chave 'astrohellenic' ficou sendo a tracejada porque é a que já estava
   salva no Supabase e é o padrão do Céu), só que com todos os traços lisos — anéis, divisas, eixos, retículos e divisas da faixa do zodíaco. */
RODA_ESTILOS.astrohellenic.nome = 'Estilo Astro Hellenic Tracejado';
/* "Invertido" (rascunho): signos num anel único por dentro (linha única, como no francês) e termos + dodecatemória por fora da faixa dos
   planetas (termos mais perto, dodecatemória na borda). Os raios dos anéis de fora e do anel dos signos são deste estilo. */
RODA_ESTILOS.astrohellenic_reto = Object.assign({}, RODA_ESTILOS.astrohellenic, {
  nome: 'Estilo Astro Hellenic',
  aneisTracejados: false,
  eixosTracejados: false,
  retas: true                     // retículos e divisas da faixa do zodíaco também em traço liso
});
RODA_ESTILOS.astrohellenic_invertido = Object.assign({}, RODA_ESTILOS.astrohellenic_reto, {
  nome: 'Estilo Astro Hellenic Invertido',
  invertido: true,
  faixaZodiaco: false,            // sem a faixa dupla na cor do elemento: signos em linha única, como no francês
  signos: { fora: 300, numero: 247, glifo: 281, glifoTam: 30, divisasAte: 498 },  // anel dos signos (de raios.SignSector até 'fora')
  anelTermos: [498, 524],         // termos logo por fora da faixa dos planetas
  anelDodec: [524, 550],          // dodecatemória na borda
  raioDestaque: 568
});

/* Estilo da mandala escolhido em Configurações → Aparência (carregado do Supabase depois do login, ver
   carregarEstiloMandala em supabase.js): 'frances', 'astrohellenic' (tracejado) ou 'astrohellenic_reto'. Sem escolha ainda: o padrão de sempre — a pintura do
   Céu já nasceu no desenho Astro Hellenic; todas as outras (claro, escuro, papiro, tinta do relatório) são no francês. */
function estiloMandalaAtual(naPinturaCeu) {
  if (RODA_ESTILOS[window.estiloMandala]) return window.estiloMandala;
  return naPinturaCeu ? 'astrohellenic' : 'frances';
}

/* Desenha a roda e devolve { svg, width, height, papiroNaTela, ceuParams }. Lê o estado global (mapa aberto, momento, Casa 1...)
   como a renderMandala sempre leu; "o" traz só as opções de pintura de cada chamada (as mesmas de renderMandala). */
function desenharRodaSVG(o) {
  const { estiloForcado, corCabecalhoForcada, corCirculoForcada, papiroCabecalho, espacoTransparente, tintaPapiro } = o;
  let fundoTransparente = o.fundoTransparente;
  /* o.ferramenta: a roda como ela é desenhada DENTRO de uma ferramenta (Profecção, Sinastria, Liberação) — sem cabeçalho nem céu,
     canvas quadrado, no mapa que a ferramenta passa. Campos: dados, abertura({canvasSize,fundoDisco}) (a tag <svg> + defs + fundo, como a
     ferramenta sempre fez), fundoEscuro (cor do cartão no tema escuro), fragmentoPlaneta(id), glowSol(pos, raio, tinta),
     loteCasa1 (chave do lote na Casa 1; sem ela, o Ascendente), folgaCanvas (px além do raio dos destaques; padrão 40), rCanvasMinimo (canvas mínimo,
     pra igualar o tamanho de duas rodas lado a lado; a função devolve rCanvasNatural = o que ESTA roda pediria sozinha),
     destaques { fatias:[{signIdx,cor}], faixas:[{signIdx,cor,de,ate}], coroas:[{rulerId, rotulo?:{texto,cor}, preenchimento, contorno, espessura, ponto}],
     depoisDasFaixas(ctx) (SVG extra da ferramenta, entre as etiquetas e a mancha do Sol; ctx = {cx,cy,house1RefAbs,raioDestaque,lotes,tinta}) }. */
  const ferr = o.ferramenta || null;
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
     acertar cor nenhuma. Também some com o fundo dos círculos internos
     menores (mascaram cruzamento de linha atrás de ícone de planeta/
     eixo, e o círculo grande da área de aspectos no meio do disco) —
     sem isso sobrava um "miolinho" sólido no centro da mandala mesmo
     com o retângulo grande já transparente.

     "corCabecalhoForcada" (opcional, hex "#rrggbb", só pra capa) troca
     só o fundo da caixinha de nome/data/cidade — independente de
     modoEscuro/tinta, porque o astrólogo pode querer uma cor pra essa
     caixinha diferente da paleta clara/escura calculada pro resto do
     disco (ver corCabecalho no bloco "__capa__", relatorio.js). A
     legibilidade do texto/borda dentro dela é decidida pela luminância
     DESSA cor específica, não pelo modoEscuro geral. */
  const modoEscuro = estiloForcado ? (estiloForcado === 'escuro') : document.documentElement.classList.contains('tema-escuro');
  /* "tintaPapiro" (opcional, só as PÁGINAS DO CORPO do Relatório com o Tema Céu): a roda sai "tinta sobre o
     papiro" — sem céu, sem fundo, azul-tinta + terracota + preto (a mesma pintura das rodas secundárias:
     Profecção/Liberação/Sinastria). O céu fica só na capa. Mesmo desenho e mesmos tamanhos da roda clássica. */
  const temaEhCeu = typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu';
  /* "papiroNaTela": a mandala AO VIVO (sem estiloForcado, ou seja, não é uma cópia pro Relatório) desenhada em
     tinta sobre uma folha de papiro, no lugar do céu — escolhido pelo botão da barra da Mandala
     (alternarMandalaPapiro), só no Tema Céu. É o mesmo desenho "tinta sobre papiro" das páginas do Relatório. */
  const papiroNaTela = !ferr && !estiloForcado && !tintaPapiro && temaEhCeu && !!window.mandalaPapiroTela;
  const papiro = (!!tintaPapiro || papiroNaTela) && temaEhCeu;
  const AZ_TINTA = '#1d3a66', TERRACOTA = '#a03e25';
  if (papiro && !ferr) fundoTransparente = true; // (as ferramentas pintam o próprio fundo: tinta.fundoDisco)
  const HEX_RE_MANDALA = /^#[0-9a-fA-F]{6}$/;
  /* "papiroCabecalho" (opcional, só o Relatório com o tema Céu): pinta a
     caixinha de nome/data/cidade como papiro (ver coresCabecalhoPapiro) —
     só cor/textura, o layout do cabeçalho não muda. */
  const corCabecalhoPng = papiro ? coresCabecalhoTinta() : papiroCabecalho ? coresCabecalhoPapiro() : coresCabecalhoMandala(modoEscuro, corCabecalhoForcada);

  /* TINTA DO DISCO EM SI (casas, planetas, graus, eixos, aspectos). No
     Tema Claro é exatamente a paleta de sempre (nada muda). No Tema
     Escuro, o fundo do disco também escurece — o que obriga a inverter o
     "halo": os textos de grau/eixo/casa usam paint-order="stroke fill"
     com um contorno pra continuar legíveis por cima de linhas/glifos
     coloridos atrás deles, não por cima do fundo da página. Contorno
     branco atrás de tinta escura (Tema Claro) vira contorno escuro atrás
     de tinta clara (Tema Escuro) — sem isso, o halo brilha como uma
     mancha branca em volta de cada número no meio do disco escuro. */
  const tinta = papiro ? {
    fundoDisco: 'none', dourado: AZ_TINTA, douradoCasas: TERRACOTA, halo: 'none',
    inkForte: AZ_TINTA, inkPlaneta: '#1a1410', navio: AZ_TINTA, linhaConectora: 'rgba(29,58,102,0.55)',
    aspectoOposicao: TERRACOTA, aspectoTrigono: AZ_TINTA, aspectoQuadratura: TERRACOTA, aspectoSextil: AZ_TINTA,
    elementoFogo: '#a62b1f', elementoTerra: '#6b4a2b', elementoAr: '#17707f', elementoAgua: '#1f3a66',
    dodecatemoriaLinha: 'rgba(29,58,102,0.45)',
  } : modoEscuro ? {
    fundoDisco: (ferr && ferr.fundoEscuro) || '#1c1917',
    dourado: '#d9ae3f',
    douradoCasas: '#e8c667',
    halo: (ferr && ferr.fundoEscuro) || '#1c1917',
    inkForte: '#e8e6df',
    inkPlaneta: '#e8e6df',
    navio: '#8ab4e8',
    linhaConectora: '#6b7280',
    aspectoOposicao: '#fb7185',
    aspectoTrigono: '#60a5fa',
    aspectoQuadratura: '#ff6b4a',
    aspectoSextil: '#38bdf8',
    elementoFogo: '#ff6b4a',
    elementoTerra: '#d99a5c',
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

  /* Usado em todo "fill" que hoje seria tinta.fundoDisco (o retângulo
     grande de fundo E os círculos menores que mascaram cruzamento de
     linha atrás de ícone/eixo/área de aspectos) — com fundoTransparente,
     nenhum deles pinta nada, senão sobrava um "miolinho" sólido no meio
     do disco mesmo com o fundo grande já transparente. Não mexe em
     tinta.halo (o contorno do texto): esse é só uma linha fina, não um
     bloco sólido, então não cria o mesmo problema de "quadrado" visível. */
  const fundoDiscoEfetivo = fundoTransparente ? 'transparent' : tinta.fundoDisco;

  /* Sombra só das siglas ELEMENT_SIGN_COLORS usada NESTA função — não é o
     mesmo objeto global (const ELEMENT_SIGN_COLORS lá em cima, fora da
     função), que continua intocado porque liberacao.js também lê ele
     direto e ainda não faz parte desta etapa. */
  const ELEMENT_SIGN_COLORS = { fire: tinta.elementoFogo, earth: tinta.elementoTerra, air: tinta.elementoAr, water: tinta.elementoAgua };

  const data = ferr ? ferr.dados : currentCalculatedData;
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
  if (!ferr) window.currentLotes = lotes;

  let house1RefAbs = ascAbs;
  const loteCasa1Efetivo = ferr ? (ferr.loteCasa1 || null) : (selectedHouse1Lot !== "ASC" ? selectedHouse1Lot : null);
  if (loteCasa1Efetivo) {
    const targetLot = lotes.find(l => l.key === loteCasa1Efetivo);
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

  /* Tema "Céu" (padrão "Claro" se ainda não carregado, ou se o usuário
     nunca escolheu) — controla só a decoração de céu/espaço sideral. O
     tamanho e o layout do desenho continuam iguais nos dois temas. */
  const temaCeu = !papiro && (typeof window.temaMandala !== 'undefined' ? window.temaMandala : 'claro') === 'ceu';
  /* ESTILO DA MANDALA (Configurações → Aparência): só o FORMATO do desenho — onde cada coisa fica. "astrohellenic" = o
     desenho que nasceu no Tema Céu (anéis maiores, faixa do zodíaco na eclíptica com os planetas dentro, divisas
     tracejadas, lotes por dentro); "frances" = o de sempre. Cores e ícones NÃO dependem disso: seguem o tema
     (temaCeu/papiro/claro/escuro). Por isso há duas bandeiras separadas: temaCeu = pintura/decoração de céu,
     estiloRoda = posição das coisas (cada estilo é uma entrada de RODA_ESTILOS). */
  const estiloRoda = RODA_ESTILOS[estiloMandalaAtual(temaCeu)]; // FORMATO (posição das coisas) — ver RODA_ESTILOS no topo deste arquivo
  const R_Ceu = Math.max(maxRaioItens, estiloRoda.invertido ? estiloRoda.anelDodec[1] : 0) + 20; // folga visual (ícone + rótulo de grau)

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
  const R_OuterLine = 399;
  // Ferramentas (Profecção...): canvas QUADRADO, sem cabeçalho nem céu. A folga acompanha o raio dos destaques do estilo.
  const R_canvasFerrNatural = Math.max(maxRaioItens + 50, Math.max(R_OuterLine, estiloRoda.raioDestaque) + ((ferr && ferr.folgaCanvas) || 40));
  // rCanvasMinimo: duas rodas lado a lado (Sinastria) usam o MESMO canvas (o maior dos dois) pra ficarem do mesmo tamanho na tela.
  const R_canvasFerr = Math.max(R_canvasFerrNatural, (ferr && ferr.rCanvasMinimo) || 0);
  const cy = ferr ? R_canvasFerr : R_Ceu + margemVertical;
  const headerY = cy + R_Ceu + margemVertical;
  const headerH = 75;
  const headerGapBottom = 20;
  /* A largura também precisa acompanhar R_Ceu: sem isso, o céu (que agora
     varia de tamanho por mapa) pode passar dos 480px de raio e ser cortado
     nas laterais pelo próprio SVG, antes mesmo de chegar no navegador —
     nunca menor que 960 (largura original), só cresce quando precisa. */
  const cx = ferr ? R_canvasFerr : Math.max(480, R_Ceu + margemVertical);
  const width = cx * 2, height = ferr ? width : headerY + headerH + headerGapBottom;
  // Tema Céu: os anéis de termos (fora) e dodecatemória (dentro) ficam logo ABAIXO da faixa dos
  // signos (que começa no raio 282); os lotes ficam abaixo deles e a Terra no centro.
  const R = Object.assign({}, estiloRoda.raios);
  // Anéis da dodecatemória e dos termos: nos estilos de sempre ficam logo por fora do SignSector (dodecatemória por dentro, termos por fora);
  // no "invertido" ficam por fora da faixa dos planetas (termos por dentro, dodecatemória na borda).
  const inv = !!estiloRoda.invertido;
  const aDod = inv ? estiloRoda.anelDodec : [R.SignSector, R.Dodec];
  const aTer = inv ? estiloRoda.anelTermos : [R.Dodec, R.Termos];

  /* CÉU DO TEMA CÉU — ver montarCeuMandalaSVG. A posição do Sol (altura
     aproximada acima do horizonte ASC-DSC) decide a cor do céu. */
  const solAngulo = ((pObj.Sun.abs - ascAbs + 360) % 360) * Math.PI / 180;
  const ceuParams = (temaCeu || papiroNaTela) ? { // no modo papiro o céu não aparece, mas segue pintado por baixo da folha
    cx, cy, width, height, termos: R.Aspects, raioCeu: R_Ceu, skyRotation,
    elevacao: -Math.sin(solAngulo), ladoSol: Math.cos(solAngulo),
    corDisco: 'none' // sem disco branco: o miolo é uma janela pro céu (ver montarTerraCeuSVG)
  } : null;
  if (ceuParams) { const t = Math.max(0, Math.min(1, (ceuParams.elevacao + 0.10) / 0.60)); ceuParams.dia = t * t * (3 - 2 * t); }
  // Tema Céu: cor dos pontos calculados conforme dia/noite NO LUGAR onde ele está (acima do
  // horizonte, de dia -> azul-marinho; à noite ou no espaço -> branco-azulado).
  const corCalculadoCeu = (px, py) => {
    const rad = -skyRotation * Math.PI / 180, dx = px - cx, dy = py - cy;
    const yRot = dx * Math.sin(rad) + dy * Math.cos(rad);
    return misturarHexCeu('#dbe6ff', '#1d3a66', (yRot < 0) ? ceuParams.dia : 0);
  };
  const ceuMandala = temaCeu ? montarCeuMandalaSVG(Object.assign({}, ceuParams, { soHalo: !!espacoTransparente })) : { defs: '', corpo: '' };
  /* CAPA do Relatório (espacoTransparente + Tema Céu): além da roda "só com halo", guarda o MESMO céu da tela
     (mesmo Sol, mesma rotação do horizonte, mesmo brilho no lado do Sol), enorme, pra a capa usar de fundo,
     alinhado ao centro da roda (ver relatorio.js, .rel-ceu-fundo). Data URL (não blob): o HTML da capa vai
     inteiro pro gerador de PDF no servidor, que não enxerga blobs do navegador. */
  if (!ferr) window.ceuFundoCapaUltimo = null;
  if (temaCeu && espacoTransparente) {
    const EXT_CAPA = 2800;
    const svgFundo = montarFundoCeuSVG(Object.assign({}, ceuParams, { fatorEstrela: 3, densidadeEstrela: 0.11 }), EXT_CAPA);
    // 'url' é preenchida logo antes do onReady (ver rasterizarFundoCeuCapa): o céu vira uma imagem JPEG comum
    // (e não um SVG enorme), que o Safari/iPad desenha igual ao Chrome — incluindo as estrelas — e que abre
    // rápido no PDF. Se a rasterização falhar, cai no próprio SVG embutido.
    window.ceuFundoCapaUltimo = { svg: svgFundo, url: null, cx, cy, width, height, ext: EXT_CAPA };
  }

  let svg = ferr ? ferr.abertura({ canvasSize: width, fundoDisco: tinta.fundoDisco }) : `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- BRILHO DE COMBUSTÃO / SOB OS RAIOS (halo ao redor do Sol) -->
      <radialGradient id="combustionGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.9" />
        <stop offset="30%" stop-color="#fde68a" stop-opacity="0.75" />
        <stop offset="53%" stop-color="#f59e0b" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </radialGradient>

      ${temaCeu ? ceuMandala.defs : ''}
    </defs>

    <rect width="${width}" height="${height}" fill="${espacoTransparente ? 'transparent' : fundoDiscoEfetivo}"/>
    ${HEX_RE_MANDALA.test(corCirculoForcada) ? `
    <!-- "MEDALHÃO" ATRÁS DA MANDALA (ver corCirculoForcada, só usado pela
         capa do Relatório) — desenhado exatamente em (cx, cy), o MESMO
         centro matemático que toda a roda (casas, signos, aspectos) já
         usa, com raio R_Ceu (já calculado acima grande o bastante pra
         sempre cobrir o planeta/glow mais distante deste mapa, mais uma
         folga de 12%). Faz de propósito ANTES de qualquer elemento da
         roda ("svg +=" só começa depois desta linha), então fica
         garantidamente por trás de tudo. Nunca fica descentralizado da
         roda (diferente de tentar centralizar um círculo por CSS em
         cima da imagem já pronta): não há adivinhação de posição
         nenhuma — é literalmente o centro que o resto do desenho usa.
         Raio = R_Ceu exato (sem folga extra): o SVG não tem margem
         sobrando além dos "margemVertical" (10) já embutidos no cálculo
         de cx/cy logo acima — um raio maior que R_Ceu passaria do
         viewBox e cortaria o círculo nas laterais (o <svg> corta
         conteúdo fora do viewBox por padrão). R_Ceu já é grande o
         bastante pra cobrir até o planeta/glow mais distante do mapa
         (é pra isso que ele foi calculado, mais acima). -->
    <circle cx="${cx}" cy="${cy}" r="${R_Ceu}" fill="${corCirculoForcada}"/>` : ''}
${temaCeu ? ceuMandala.corpo : ''}`;

  const headerTitle = currentSubjectName;

  const tipoAtual = (typeof window.currentMapType !== 'undefined' && window.currentMapType) ? window.currentMapType : 'Natal';
  const tipoFormatado = tipoAtual === 'Natal' ? 'Mapa Natal' : `Mapa de ${tipoAtual}`;

  /* CABEÇALHO (nome, data, local, zodíaco, natividade, Dia/Hora) — o mesmo
     desenho usado por TODAS as ferramentas (ver montarCabecalhoMandalaGrupoSVG). */
  if (!ferr) svg += montarCabecalhoMandalaGrupoSVG(data, headerY, corCabecalhoPng, (typeof selectedHouse1Lot !== 'undefined' && selectedHouse1Lot !== 'ASC') ? selectedHouse1Lot : null);

  /* DESTAQUES DE SIGNO das ferramentas (Profecção, Sinastria): fatia inteira, do centro até raioDestaque do estilo, por baixo de tudo;
     etiquetas em faixa e coroa mais adiante. A ferramenta decide signos e cores; a posição é do estilo. */
  const destaques = (ferr && ferr.destaques) || null;
  const fatiaDestaque = (signIdx, cor) => {
    if (signIdx === null || signIdx === undefined) return '';
    const angInicial = eclToScreenAngle(signIdx * 30, house1RefAbs);
    const passos = 15;
    let d = `M ${cx} ${cy} `;
    for (let s = 0; s <= passos; s++) {
      const p = polarToCart(cx, cy, estiloRoda.raioDestaque, angInicial - (30 * s / passos));
      d += `L ${p.x} ${p.y} `;
    }
    d += 'Z';
    return `<path d="${d}" fill="${cor}"/>`;
  };
  const faixaDestaque = (signIdx, cor, rInterno, rExterno) => {
    if (signIdx === null || signIdx === undefined) return '';
    const angInicial = eclToScreenAngle(signIdx * 30, house1RefAbs);
    const passos = 15;
    const pontosFora = [];
    for (let s = 0; s <= passos; s++) pontosFora.push(polarToCart(cx, cy, rExterno, angInicial - (30 * s / passos)));
    const pontosDentro = [];
    for (let s = passos; s >= 0; s--) pontosDentro.push(polarToCart(cx, cy, rInterno, angInicial - (30 * s / passos)));
    const pontos = pontosFora.concat(pontosDentro);
    const d = pontos.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return `<path d="${d}" fill="${cor}"/>`;
  };
  if (destaques) (destaques.fatias || []).forEach(f => { svg += fatiaDestaque(f.signIdx, f.cor); });

  if (estiloRoda.faixaZodiaco) {
    // Faixa do zodíaco na eclíptica (por trás de tudo). Fora do Tema Céu a linha da eclíptica é de uma cor só.
    svg += montarBandaZodiacoCeuSVG({
      cx, cy, pR, meia: 9 * latPxPerGrau, ref: house1RefAbs, skyRotation, dia: ceuParams ? ceuParams.dia : 1, tinta,
      elemCores: ELEMENT_SIGN_COLORS, signElem: SIGN_ELEMENTS, glifos: MONOLINE_ZODIAC_SVGS,
      rTerra: R.Aspects, rAneis: R.SignSector, corUnica: temaCeu ? null : goldColor,
      corNumero: temaCeu ? corCalculadoCeu : null, reto: !!estiloRoda.retas // números das casas: o mesmo branco/azul-escuro dos ícones calculados
    });
  }
  if (temaCeu) {
    // Tema Céu: a Terra no miolo (decoração de céu — não existe fora dele, lá o miolo é o disco liso de sempre)
    svg += montarTerraCeuSVG(cx, cy, R.Aspects, goldColor, ceuParams.dia, skyRotation);
  } else {
    svg += `<circle cx="${cx}" cy="${cy}" r="${R.Aspects}" fill="${fundoDiscoEfetivo}" stroke="${goldColor}" stroke-width="2"/>`;
  }

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
        if (temaCeu) {
          // sobre o chão escuro e o céu claro: cor mais clara + contorno escuro fininho por baixo
          const corCeu = { [tinta.aspectoOposicao]: '#fb7185', [tinta.aspectoTrigono]: '#60a5fa', [tinta.aspectoQuadratura]: '#ff6b4a', [tinta.aspectoSextil]: '#38bdf8' }[col] || col;
          svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="rgba(8,14,40,.55)" stroke-width="3.8" stroke-linecap="round"/>`;
          svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${corCeu}" stroke-width="1.9" stroke-linecap="round"/>`;
        } else {
        svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${col}" stroke-width="1.8" opacity="0.9"/>`;
        }
      }
    }
  }

  // Tema Céu: as divisas dos termos e da dodecatemória são tracejadas (foram postas ali, não são do céu); os dentinhos ficam sólidos.
  const tracejadoCeu = estiloRoda.aneisTracejados ? ' stroke-dasharray="6 4"' : '';
  const tracejadoFinoCeu = estiloRoda.aneisTracejados ? ' stroke-dasharray="3 3"' : '';
  /* No Céu os tracejados (anéis, divisas da dodecatemória e dos termos) são BRANCOS — o mesmo "branco" dos ícones calculados: branco-azulado
     abaixo do horizonte (noite) e azul-marinho escuro sobre o céu claro de dia (acima do horizonte), pra continuar legível. Cada peça é
     desenhada duas vezes, uma recortada pela metade de cima do horizonte e outra pela de baixo (os mesmos recortes da linha da eclíptica). */
  const tracejadoAdaptativo = temaCeu && (estiloRoda.faixaZodiaco || estiloRoda.invertido); // as duas variantes do Astro Hellenic (tracejada ou reta) usam o branco adaptativo
  const tintaCimaCeu = tracejadoAdaptativo ? misturarHexCeu('#e6eeff', '#1d3a66', ceuParams.dia) : null;
  const emitirTracejado = (fn, corPadrao) => tracejadoAdaptativo
    ? `<g clip-path="url(#ceuMeiaTela)">${fn(tintaCimaCeu)}</g><g clip-path="url(#ceuMeiaTelaBaixo)">${fn('#e6eeff')}</g>`
    : fn(corPadrao);
  svg += emitirTracejado(cor =>
    (inv
      ? [[aTer[1], 1.5], [aDod[1], 2]] // só a linha entre termos e dodecatemória e a da borda; nenhuma outra divide a roda
      : [[R.SignSector, 2], [R.Dodec, 1.5], [R.Termos, 2]]
    ).map(([rr, sw]) => `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${cor}" stroke-width="${sw}"${tracejadoCeu}/>`).join(''), goldColor);

  /* ORDEM DE CAMADAS DA RODA (pedido do astrólogo, 28/09/2026): a
     estrutura da mandala (círculos, raios, dentinhos) sempre por trás
     de tudo; depois as linhas pretas dos eixos ASC/DSC/MC/IC; depois
     todos os ícones por cima. Antes disso a ordem seguia a ordem em
     que cada trecho tinha sido escrito, sem critério — dava pra ver um
     dentinho cortando por cima do triângulo do ASC, por exemplo. Por
     isso os loops que desenhavam linha+ícone juntos (dodecatemória,
     termos) foram separados em duas passadas: uma só de linha aqui,
     outra só de ícone lá embaixo, depois das linhas dos eixos. */

  if (!estiloRoda.faixaZodiaco && !inv) { // com a faixa do zodíaco as divisas dos signos são os tracejados da faixa; no invertido não há divisa nenhuma
  for (let i = 0; i < 12; i++) {
    const pt1 = polarToCart(cx, cy, R.Aspects, eclToScreenAngle(i * 30, house1RefAbs));
    const pt2 = polarToCart(cx, cy, inv ? estiloRoda.signos.divisasAte : R_OuterLine, eclToScreenAngle(i * 30, house1RefAbs));
    svg += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${goldColor}" stroke-width="1.8"/>`;
  }
  }

  svg += emitirTracejado(cor => {
    let out = '';
    for (let i = 0; i < 12; i++) {
      for (let d = 0; d < 12; d++) {
        const pt1 = polarToCart(cx, cy, aDod[0], eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
        const pt2 = polarToCart(cx, cy, aDod[1], eclToScreenAngle((i * 30) + (d * 2.5), house1RefAbs));
        out += `<line x1="${pt1.x}" x2="${pt2.x}" y1="${pt1.y}" y2="${pt2.y}" stroke="${cor}"${tracejadoAdaptativo ? ' stroke-opacity=".75"' : ''} stroke-width="0.8"${tracejadoFinoCeu}/>`;
      }
    }
    return out;
  }, tinta.dodecatemoriaLinha);

  svg += emitirTracejado(cor => {
    let out = '';
    for (let s = 0; s < 12; s++) {
      let prev = 0;
      EGYPTIAN_TERMS[s].forEach(term => {
        const pt1 = polarToCart(cx, cy, aTer[0], eclToScreenAngle((s * 30) + prev, house1RefAbs));
        const pt2 = polarToCart(cx, cy, aTer[1], eclToScreenAngle((s * 30) + prev, house1RefAbs));
        out += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${cor}" stroke-width="1.2"${tracejadoFinoCeu}/>`;
        prev = term.deg;
      });
    }
    return out;
  }, goldColor);

  for (let deg = 0; deg < 360; deg++) {
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 12 : ((deg % 5 === 0) ? 8 : 4);
    const rRegua = inv ? aTer[0] : R.Termos; // invertido: a régua de graus fica na borda de dentro dos termos, dentinhos pra dentro (os fios dos planetas chegam nela)
    const p1 = polarToCart(cx, cy, rRegua, aScreen);
    const p2 = polarToCart(cx, cy, rRegua - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.5 : 0.8}"/>`;
  }

  for (let deg = 0; deg < (inv ? 0 : 360); deg++) { // no invertido só existe a régua dos termos
    const aScreen = eclToScreenAngle(deg, house1RefAbs);
    const tickLen = (deg % 10 === 0) ? 10 : ((deg % 5 === 0) ? 6 : 3);
    const p1 = polarToCart(cx, cy, R.SignSector, aScreen);
    const p2 = polarToCart(cx, cy, R.SignSector - tickLen, aScreen);
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${goldColor}" stroke-width="${deg % 10 === 0 ? 1.2 : 0.6}"/>`;
  }


  const ascPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(ascAbs, house1RefAbs));
  const dscPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(ascAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${ascPt.x}" y1="${ascPt.y}" x2="${dscPt.x}" y2="${dscPt.y}" stroke="${temaCeu ? '#ffffff' : (papiro ? COR_TINTA_OCRE : tinta.inkForte)}" stroke-width="2.5"${estiloRoda.eixosTracejados ? ' stroke-dasharray="9 6"' : ''}/>`; // Tema Céu: branca tracejada (não faz parte do céu, foi "posta" por cima)

  const mcPt = polarToCart(cx, cy, R_OuterLine, eclToScreenAngle(mcAbs, house1RefAbs));
  const icPt = polarToCart(cx, cy, R_OuterLine, (eclToScreenAngle(mcAbs, house1RefAbs) + 180) % 360);
  svg += `<line x1="${mcPt.x}" y1="${mcPt.y}" x2="${icPt.x}" y2="${icPt.y}" stroke="${temaCeu ? '#ffffff' : (papiro ? COR_TINTA_OCRE : tinta.inkForte)}" stroke-width="2.5"${estiloRoda.eixosTracejados ? ' stroke-dasharray="9 6"' : ''}/>`;

  /* A PARTIR DAQUI SÓ ÍCONE — nada de linha/dentinho novo abaixo disso,
     pra manter a estrutura da roda sempre por trás. */

     /* DESENHO DOS 4 EIXOS NA PARTE INTERNA (ENCUSTADOS NO ANEL) */
  const rEixoInterno = R.SignSector - 12; // Posiciona as bolinhas encostadas por dentro do anel dos signos (aprox. 203px)

  const eixosInternos = [
    { label: "ASC", deg: ascAbs, color: papiro ? TERRACOTA : tinta.inkForte },
    { label: "DSC", deg: (ascAbs + 180) % 360, color: papiro ? TERRACOTA : tinta.inkForte },
    { label: "MC",  deg: mcAbs, color: papiro ? TERRACOTA : tinta.inkForte },
    { label: "IC",  deg: (mcAbs + 180) % 360, color: papiro ? TERRACOTA : tinta.inkForte }
  ];

  /* Icone novo: um triangulo so (getIconeFragmento('outro','angulo')),
     desenhado por padrao apontando pra esquerda (180deg) - por isso a
     rotacao aplicada e sempre (aScreen - 180), pra ele apontar pro
     angulo certo de CADA mapa (ASC/DSC nem sempre caem exatamente em
     180/0deg quando a casa 1 usa um Lote como referencia em vez do
     ASC, e MC/IC quase nunca caem exatamente em 270/90deg). */

  /* Retículo tracejado em volta dos ícones calculados (não são corpos do céu): faz parte do ESTILO, em qualquer tema. No Céu os
     ícones já o desenham (iconeCalculadoCeuSVG/iconeAnguloCeuSVG, que recebem semReticulo); nos outros temas desenha-se aqui, na tinta do tema. */
  /* No estilo reto o retículo tracejado vira uma SOMBRA translúcida embaixo do ícone (dois discos leves, sem filtro/blur pra sair igual em PNG e PDF):
     no papiro, o azul-quase-preto da tinta de escrever; nos outros temas, a própria tinta do tema. */
  const sombraIcone = (r, cor) => `<circle cx="0" cy="0" r="${r + 3}" fill="${cor}" fill-opacity=".07"/><circle cx="0" cy="0" r="${r}" fill="${cor}" fill-opacity=".13"/>`;
  const reticuloTinta = (r, cor) => !estiloRoda.reticulosTracejados ? '' : estiloRoda.retas ? sombraIcone(r, papiro ? COR_TINTA_SOMBRA : cor) : `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${cor}" stroke-opacity=".75" stroke-width="1.3" stroke-dasharray="3 4"/>`;
  const semReticuloCeu = estiloRoda.reticulosTracejados ? (estiloRoda.retas ? 'reto' : false) : true; // true = sem retículo; 'reto' = retículo em traço liso

  eixosInternos.forEach(eixo => {
    const aScreen = eclToScreenAngle(eixo.deg, house1RefAbs);
    const pPos = polarToCart(cx, cy, rEixoInterno, aScreen);
    if (temaCeu) {
      // mesmo estilo dos nodos/lotes: triângulo em traço claro dentro de um retículo tracejado
      const cor = corCalculadoCeu(pPos.x, pPos.y);
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">${iconeAnguloCeuSVG(aScreen, cor, eixo.label, semReticuloCeu)}
        <text x="0" y="29" font-size="8" font-weight="bold" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(eixo.deg)}</text>
      </g>`;
      return;
    }
    const anguloFrag = getIconeFragmento('outro', 'angulo', undefined, papiro ? COR_TINTA_OCRE : undefined);
    const anguloFundo = papiro ? '' : getIconeFundoSilhueta('outro', 'angulo', '#fffdf5');

    svg += `<g transform="translate(${pPos.x}, ${pPos.y})">${reticuloTinta(21, papiro ? COR_TINTA_OCRE : tinta.inkForte)}
      <g transform="scale(0.4) translate(-50, -50) rotate(${aScreen - 180} 50 50)">${anguloFundo}${anguloFrag}</g>
      <text x="0" y="3.5" font-size="6.5" font-weight="900" fill="${eixo.color}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="1.8" paint-order="stroke fill">${eixo.label}</text>
      <text x="0" y="24" font-size="8" font-weight="bold" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(eixo.deg)}</text>
    </g>`;
  });

  const refSignIdx = Math.floor(house1RefAbs / 30);
  if (!estiloRoda.faixaZodiaco) { // com a faixa do zodíaco os números e glifos dos signos ficam na faixa
  for (let i = 0; i < 12; i++) {
    const aMid = eclToScreenAngle((i * 30) + 15, house1RefAbs);
    const pNum = polarToCart(cx, cy, inv ? estiloRoda.signos.numero : 122, aMid);
    svg += `<text x="${pNum.x}" y="${pNum.y + 5}" font-family="'Cinzel', serif" font-size="15" font-weight="bold" fill="${temaCeu ? corCalculadoCeu(pNum.x, pNum.y) : tinta.douradoCasas}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="4" paint-order="stroke fill">${((i - refSignIdx + 12) % 12) + 1}</text>`;

    const pSym = polarToCart(cx, cy, inv ? estiloRoda.signos.glifo : 166, aMid);
    const gT = inv ? estiloRoda.signos.glifoTam : 34;
    svg += `<svg x="${pSym.x - gT / 2}" y="${pSym.y - gT / 2}" width="${gT}" height="${gT}" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[i]]};">${MONOLINE_ZODIAC_SVGS[i]}</svg>`;
  }
  }

  for (let i = 0; i < 12; i++) {
    for (let d = 0; d < 12; d++) {
      const pDod = polarToCart(cx, cy, (aDod[0] + aDod[1]) / 2, eclToScreenAngle((i * 30) + (d * 2.5) + 1.25, house1RefAbs));
      svg += `<svg x="${pDod.x - 5.5}" y="${pDod.y - 5.5}" width="11" height="11" viewBox="0 0 64 64" style="color: ${ELEMENT_SIGN_COLORS[SIGN_ELEMENTS[(i + d) % 12]]};">${MONOLINE_ZODIAC_SVGS[(i + d) % 12]}</svg>`;
    }
  }

  /* term.p e so o glifo Unicode ("♃" etc) - de-para pro id do planeta
     que o icone novo dos termos usa. So os 5 regentes de termo egipcio
     (nunca Sol/Lua) entram aqui. */
  const TERMO_PLANET_BY_SYMBOL = { '♃': 'Jupiter', '♀': 'Venus', '☿': 'Mercury', '♂': 'Mars', '♄': 'Saturn' };
  const termoIconTamanho = 18;

  for (let s = 0; s < 12; s++) {
    let prev = 0;
    EGYPTIAN_TERMS[s].forEach(term => {
      const pTerm = polarToCart(cx, cy, (aTer[0] + aTer[1]) / 2, eclToScreenAngle((s * 30) + (prev + term.deg) / 2, house1RefAbs));
      const termoPlanetId = TERMO_PLANET_BY_SYMBOL[term.p];
      // papiro: ícones dos termos em ocre (como os eixos); Céu: o amarelo de sempre
      const termoSvg = getIconeTermoSVG(termoPlanetId, termoIconTamanho, papiro ? COR_TINTA_OCRE : goldColor)
        .replace('<svg ', `<svg x="${pTerm.x - termoIconTamanho / 2}" y="${pTerm.y - termoIconTamanho / 2}" `);
      svg += termoSvg;
      prev = term.deg;
    });
  }

  /* ETIQUETAS: faixas sólidas na borda externa, uma ao lado da outra (de/ate = deslocamento a partir de raioDestaque). */
  if (destaques) (destaques.faixas || []).forEach(f => { svg += faixaDestaque(f.signIdx, f.cor, estiloRoda.raioDestaque + f.de, estiloRoda.raioDestaque + f.ate); });
  if (destaques && destaques.depoisDasFaixas) svg += destaques.depoisDasFaixas({ cx, cy, house1RefAbs, raioDestaque: estiloRoda.raioDestaque, lotes, tinta });

    /* 1. CAMADA 1: MANCHA DE COMBUSTÃO (FUNDO DE TUDO) */
  const sunItem = outerRingItems.find(it => it.type === 'planet' && it.id === 'Sun');
  if (sunItem && !papiro) {
    const degToPx = (2 * Math.PI * pR) / 360;
    const rSobRaios = degToPx * 15;
    const sunGlowPos = polarToCart(cx, cy, pR, sunItem.aScreen);
    if (ferr) svg += ferr.glowSol(sunGlowPos, rSobRaiosGlow, tinta);
    else svg += `<circle cx="${sunGlowPos.x}" cy="${sunGlowPos.y}" r="${rSobRaios}" fill="url(#combustionGlow)"/>`;
  }

  /* item.lotType vem de calculateSevenLots() como o planeta regente do
     lote ("venus", "mercury"...) pra fortune/spirit, que ja tem nome
     proprio. Os icones novos (planetIcons.js) usam o nome do lote em
     si, entao precisa desse de-para. */
  const LOTE_ICON_KEY = {
    fortune: 'fortune', spirit: 'spirit', venus: 'eros',
    mercury: 'necessity', mars: 'courage', jupiter: 'victory', saturn: 'nemesis'
  };

  outerRingItems.forEach(item => {
    if (item.type === 'planet') return;

    const raioEfetivo = (item.type === 'lot' ? estiloRoda.raioLotes : pR) + (item.rOffset || 0);

    const p1 = polarToCart(cx, cy, inv ? aTer[0] : R[estiloRoda.fioPlanetaDe], item.aScreen);
    const p2 = polarToCart(cx, cy, inv ? (item.type === 'lot' ? raioEfetivo + 12 : raioEfetivo + 19) : (item.type === 'lot' ? raioEfetivo - 12 : raioEfetivo - 19), item.aShift); // invertido: o fio vai pra fora, até o dentinho do grau
    svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${item.color}" stroke-width="1.2"/>`;

    const pPos = polarToCart(cx, cy, raioEfetivo, item.aShift);

    /* Fundo clarinho fixo (não muda com o tema) atrás dos ícones simples:
       vários deles (Necessidade/Eros, os nodos, o ângulo) têm partes só
       de contorno, sem preenchimento — sem esse fundo, um traço azul
       escuro fica invisível em cima do disco escuro do tema escuro, ou
       da faixa roxa do tema "Ver Céu" mesmo no tema claro. */
    if (item.type === "node") {
      const nodeKey = (item.label === '☊') ? 'northNode' : 'southNode';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        ${temaCeu ? iconeCalculadoCeuSVG('outro', nodeKey, corCalculadoCeu(pPos.x, pPos.y), true, semReticuloCeu) : `${reticuloTinta(14, tinta.inkForte)}${papiro ? '' : '<circle cx="0" cy="0" r="11" fill="#fffdf5"/>'}
        <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('outro', nodeKey)}</g>`}
        <text x="0" y="19" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "syzygy") {
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        ${temaCeu ? iconeCalculadoCeuSVG('outro', 'sizigia', corCalculadoCeu(pPos.x, pPos.y), true, semReticuloCeu) : `${reticuloTinta(14, tinta.inkForte)}${papiro ? '' : '<circle cx="0" cy="0" r="11" fill="#fffdf5"/>'}
        <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('outro', 'sizigia')}</g>`}
        <text x="0" y="21" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
    } else if (item.type === "lot") {
      const loteKey = LOTE_ICON_KEY[item.lotType] || 'fortune';
      svg += `<g transform="translate(${pPos.x}, ${pPos.y})">
        ${temaCeu ? iconeCalculadoCeuSVG('lote', loteKey, corCalculadoCeu(pPos.x, pPos.y), false, semReticuloCeu) : `${reticuloTinta(14, tinta.inkForte)}${papiro ? '' : '<circle cx="0" cy="0" r="11" fill="#fffdf5"/>'}
        <g transform="scale(0.22) translate(-50, -50)">${getIconeFragmento('lote', loteKey)}</g>`}
        <text x="0" y="17" font-size="8" font-weight="bold" fill="${tinta.inkForte}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3" paint-order="stroke fill">${formatDegMin(item.deg)}</text>
      </g>`;
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
      let retroSymbol = item.retro ? `<tspan fill="${papiro ? TERRACOTA : '#dc2626'}" font-weight="900"> ℞</tspan>` : '';
      const estiloGrau = `font-size="10.5" font-weight="800" fill="${tinta.inkPlaneta}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="3.5" paint-order="stroke fill"`;

      /* POSIÇÃO (formato): no estilo Astro Hellenic o planeta fica sempre na posição real (ângulo da longitude, raio da
         latitude), sem desvio nem empilhamento, e o fio sai do disco do miolo (R.Aspects); no francês ele pode ser
         empurrado (aShift/rOffset, pra conjunções coladas) e o fio sai do anel dos termos (R.Termos). */
      const rPonto = pR + (item.eclLat * latPxPerGrau) + (estiloRoda.planetaComDesvio ? (item.rOffset || 0) : 0);
      const aPonto = estiloRoda.planetaComDesvio ? item.aShift : item.aScreen;
      const pPonto = polarToCart(cx, cy, rPonto, aPonto);
      const recuoFio = temaCeu ? 10 : 19; // o ponto de luz é menor que o ícone
      const p1c = polarToCart(cx, cy, inv ? aTer[0] : R[estiloRoda.fioPlanetaDe], item.aScreen);
      const p2c = polarToCart(cx, cy, inv ? rPonto + recuoFio : rPonto - recuoFio, aPonto);
      if (!inv || rPonto + recuoFio < aTer[0]) svg += `<line x1="${p1c.x}" y1="${p1c.y}" x2="${p2c.x}" y2="${p2c.y}" stroke="${tinta.linhaConectora}" stroke-width="1.2"/>`;

      /* PINTURA (tema): no Céu o planeta é um ponto de luz com o glifo ACIMA e o grau ABAIXO; nos outros temas é o
         ícone do tema (esférico/simples/tinta) com o grau abaixo. */
      if (temaCeu) {
        const pGlifo = { x: pPonto.x, y: pPonto.y - 34 };
        // Acima do horizonte (metade de cima do referencial girado) vale o dia/noite do Sol.
        const rad = -skyRotation * Math.PI / 180, dx = pPonto.x - cx, dy = pPonto.y - cy;
        const yRot = dx * Math.sin(rad) + dy * Math.cos(rad);
        const elong = (((pObj.Moon.abs - pObj.Sun.abs) % 360) + 360) % 360;
        svg += desenharPlanetaCeuSVG({
          id: item.id, x: pPonto.x, y: pPonto.y, gx: pGlifo.x, gy: pGlifo.y,
          dia: ceuParams.dia, noCeu: yRot < 0, elevacao: ceuParams.elevacao,
          luaFrac: (1 - Math.cos(elong * Math.PI / 180)) / 2, luaCrescente: elong < 180,
          luaInvertida: (currentGeo && currentGeo.lat < 0)
        });
        svg += `<text x="${pPonto.x.toFixed(1)}" y="${(pPonto.y + 27).toFixed(1)}" ${estiloGrau}>${formatDegMin(item.deg)}${retroSymbol}</text>`;
        return;
      }

      svg += `<g transform="translate(${pPonto.x}, ${pPonto.y})">
        <g transform="scale(0.36) translate(-50, -50)">${papiro ? getIconeFragmento('planeta', item.id, data) : (ferr ? ferr.fragmentoPlaneta(item.id) : planetIconFragment(item.id))}</g>
        <text x="0" y="27" ${estiloGrau}>${formatDegMin(item.deg)}${retroSymbol}</text>
      </g>`;
    });

  /* COROAS sobre o regente de cada signo destacado (Profecção: uma; Liberação: uma por regente, com o número dos níveis em cima). */
  if (destaques) (destaques.coroas || []).forEach(c => {
    const rulerItem = outerRingItems.find(it => it.type === 'planet' && it.id === c.rulerId);
    if (!rulerItem) return;
    const rCoroa = pR + (rulerItem.eclLat * latPxPerGrau) + (estiloRoda.planetaComDesvio ? (rulerItem.rOffset || 0) : 0);
    const pCoroa = polarToCart(cx, cy, rCoroa, estiloRoda.planetaComDesvio ? rulerItem.aShift : rulerItem.aScreen);
    const rotulo = c.rotulo ? `<text x="0" y="-11" font-size="9" font-weight="900" fill="${c.rotulo.cor}" text-anchor="middle" stroke="${tinta.halo}" stroke-width="2.5" paint-order="stroke fill">${c.rotulo.texto}</text>` : '';
    svg += `<g transform="translate(${pCoroa.x}, ${pCoroa.y - 17})">
                    ${rotulo}<path d="M -9,5 L -9,-2 L -4.5,2.5 L 0,-7 L 4.5,2.5 L 9,-2 L 9,5 Z" fill="${c.preenchimento}" stroke="${c.contorno}" stroke-width="${c.espessura}" stroke-linejoin="round"/>
                    <circle cx="0" cy="-7" r="1.6" fill="${c.ponto}"/>
                    <circle cx="-9" cy="-2" r="1.3" fill="${c.ponto}"/>
                    <circle cx="9" cy="-2" r="1.3" fill="${c.ponto}"/>
                </g>`;
  });

  svg += `</svg>`;
  return { svg, width, height, papiroNaTela, ceuParams, rCanvasNatural: R_canvasFerrNatural };
}
