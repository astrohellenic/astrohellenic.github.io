/* ==========================================
   MÓDULO DE RELATÓRIO (RELATÓRIOS EM PDF, POR PRESETS)
   Monta um relatório multi-página a partir de um preset salvo pelo
   astrólogo (capa + blocos de texto editáveis + mandalas do cliente) e
   usa a impressão do navegador ("Salvar como PDF") para exportar — sem
   depender de nenhuma biblioteca nova.

   Os presets (nome, textos, quais blocos entram) e o perfil do
   astrólogo (logo, nome, contato) ficam salvos no Supabase, nas tabelas
   relatorio_presets e relatorio_perfil — editáveis em
   Configurações > Relatórios (página configuracoes.js).
   ========================================== */

const RELATORIO_LOT_NOMES = {
  fortune: 'Lote da Fortuna',
  spirit: 'Lote do Espírito',
  venus: 'Lote de Eros',
  mercury: 'Lote da Necessidade',
  mars: 'Lote da Audácia',
  jupiter: 'Lote da Vitória',
  saturn: 'Lote da Nêmesis'
};

/* NOMES E DESCRIÇÕES DOS TIPOS DE BLOCO "FERRAMENTA" DISPONÍVEIS HOJE.
   Cada novo tipo (decênios, revolução solar, liberação zodiacal...) entra
   aqui quando a ferramenta correspondente for adaptada pra virar um bloco
   de relatório. */
const RELATORIO_FERRAMENTAS_DISPONIVEIS = {
  mandala_natal: { label: 'Mandala Natal (casas do Ascendente)', tituloIndice: 'Mapa Natal' },
  mandala_fortuna: { label: 'Mandala com a Fortuna na Casa 1', tituloIndice: null },
  profeccao: {
    label: 'Profecção Anual (a tela que você deixou pronta na ferramenta)',
    tituloIndice: 'Profecção Anual',
    capturada: true,
    telaOrigem: 'Ferramentas > Profecção'
  },
  circumambulacao: {
    label: 'Circumambulação pelos Termos (a tela que você deixou pronta na ferramenta)',
    tituloIndice: 'Circumambulação pelos Termos',
    capturada: true,
    telaOrigem: 'Ferramentas > Direções Primárias'
  },
  mandala_personalizada: {
    label: 'Mandala Personalizada (a rotação de Casa 1 que você deixou na tela — Espírito, outro lote etc.)',
    tituloIndice: 'Mandala Personalizada',
    capturada: true,
    telaOrigem: 'a tela principal da Mandala'
  },
  tabela_tecnica: {
    label: 'Painel Técnico de Natividades (a tela que você deixou pronta na ferramenta)',
    tituloIndice: 'Painel Técnico de Natividades',
    capturada: true,
    telaOrigem: 'Ferramentas > Tabela Técnica'
  },
  matriz_visibilidade_mandala: {
    label: 'Matriz de Visibilidade (a que você deixou aberta no lugar da Mandala)',
    tituloIndice: 'Matriz de Visibilidade (Theoria)',
    capturada: true,
    telaOrigem: 'a tela principal da Mandala (botão de Matriz de Visibilidade)'
  },
  decenios: {
    label: 'Decênios Helenísticos (a tela que você deixou pronta na ferramenta)',
    tituloIndice: 'Decênios Helenísticos',
    capturada: true,
    telaOrigem: 'Ferramentas > Decênios'
  },
  horas: {
    label: 'Horas Planetárias (a tela que você deixou pronta na ferramenta)',
    tituloIndice: 'Horas Planetárias',
    capturada: true,
    telaOrigem: 'Ferramentas > Horas Planetárias'
  },
  isopsefia: {
    label: 'Isopsefia (a aba que você deixou aberta na ferramenta)',
    tituloIndice: 'Isopsefia',
    capturada: true,
    telaOrigem: 'Ferramentas > Isopsefia'
  },
  lotes_calculados: {
    label: 'Lotes Selecionados (os quadrinhos que você marcar na Calculadora de Lotes — pré-calculados e os que você salvar)',
    tituloIndice: 'Lotes Selecionados',
    capturada: true,
    // "Lotes Selecionados" é só o nome interno da ferramenta (aparece no
    // Índice, pra navegação) — não faz sentido nenhum pro cliente, que só
    // vai ver os quadrinhos dos lotes em si. Diferente de "Mapa Natal" ou
    // "Profecção Anual" (títulos que fazem sentido como cabeçalho de
    // página pro cliente ler), este esconde o <div class="rel-titulo-captura">
    // que renderBlocoRelatorio bota por padrão acima de toda captura.
    ocultarTituloNaPagina: true,
    telaOrigem: 'Ferramentas > Calculadora de Lotes'
  },
  sinastria: {
    label: 'Sinastria (as duas mandalas lado a lado, exatamente como você deixou na tela)',
    tituloIndice: 'Sinastria',
    capturada: true,
    telaOrigem: 'Ferramentas > Sinastria'
  }
};

/* LIBERAÇÃO ZODIACAL entra como 7 blocos independentes, um por lote — a
   ferramenta mostra uma tabela diferente pra cada lote ativo, e o
   astrólogo costuma precisar levar vários lotes (Fortuna, Espírito, Eros
   etc.) pro mesmo relatório, sem um substituir o outro. Cada captura fica
   guardada sob sua própria chave (liberacao_<lote>), então funciona só
   reaproveitando o mecanismo genérico de bloco "capturado" já existente —
   nenhuma mudança em renderBlocoRelatorio ou no editor de modelo. */
const RELATORIO_LOTES_ORDEM = ['fortune', 'spirit', 'venus', 'mercury', 'mars', 'jupiter', 'saturn'];
RELATORIO_LOTES_ORDEM.forEach(loteKey => {
  RELATORIO_FERRAMENTAS_DISPONIVEIS['liberacao_' + loteKey] = {
    label: `Liberação Zodiacal — ${RELATORIO_LOT_NOMES[loteKey]} (a tela que você deixou pronta na ferramenta)`,
    tituloIndice: `Liberação Zodiacal — ${RELATORIO_LOT_NOMES[loteKey]}`,
    capturada: true,
    telaOrigem: 'Ferramentas > Liberação Zodiacal'
  };
});

/* Texto de encerramento PADRÃO — só serve de ponto de partida pra quem
   ainda não personalizou o dele (ver o bloco "__encerramento__" logo
   abaixo, e o fallback em montarConteudoRelatorioHtml pra relatórios
   salvos antes desse bloco existir). */
const RELATORIO_ENCERRAMENTO_PADRAO = '<p>Caso tenha alguma dúvida ou queira complementar seu autoconhecimento através de previsões com técnicas como Revolução Solar ou Liberação Zodiacal, basta entrar em contato.</p><p>Espero ter contribuído para seu autoconhecimento e que você alcance seus objetivos e tenha grande paz interior.</p><p>Namastê 🙏</p>';

/* CONJUNTO DE BLOCOS PADRÃO — o relatório "Mapa Natal Clássico" original.
   Serve de modelo pra quando o astrólogo cria um preset novo, e é usado
   pra semear automaticamente o primeiro preset de quem ainda não tem
   nenhum salvo (pra não perder a ferramenta que já existia). */
const RELATORIO_BLOCOS_PADRAO = [
  /* Bloco invisível (não aparece na lista reordenável do editor — tem
     seu próprio seletor no topo) que guarda qual mandala vai na capa.
     Fica dentro de "blocos" pra não precisar de nenhuma coluna nova no
     Supabase: já é um jsonb existente. Ver obterCapaFonte(). */
  { id: '__capa__', type: 'capa', fonte: 'mandala_natal' },
  {
    id: 'o-que-e', type: 'texto', titulo: 'O que é Mapa Natal',
    corpo: 'O mapa natal é o registro geométrico e astronômico do céu no exato instante e local do nascimento de um indivíduo. Longe de ser um resumo estático de personalidade, ele representa a matriz fundamental de uma vida, funcionando como o projeto arquitetônico que descreve o destino, as potências e os cenários que se desdobrarão ao longo da existência.\n\nNa perspectiva clássica, o mapa funciona como um espelho do macrocosmo, onde a disposição dos sete astros errantes pelas doze divisões do céu determina a distribuição de responsabilidades e papéis na jornada do nativo. Cada planeta atua como um administrador ou emissário de áreas específicas da vida, e a rede de relações que eles estabelecem entre si desenha as facilidades e os obstáculos fixos que estruturam a realidade material e psicológica do indivíduo.\n\nCompreender o mapa natal não significa submeter-se a um determinismo cego, mas sim obter o mapeamento exato das regras do jogo da própria vida. Ele revela a engenharia oculta por trás dos acontecimentos e inclinações pessoais, servindo como a ferramenta definitiva para que o indivíduo compreenda seu papel no cosmos, otimize suas virtudes naturais e navegue por seus desafios com clareza e maestria técnica.'
  },
  { id: 'mandala_natal', type: 'ferramenta' },
  { id: 'mandala_fortuna', type: 'ferramenta' },
  {
    id: 'entendendo-mandalas', type: 'texto', titulo: 'Entendendo as Mandalas',
    corpo: 'Para facilitar a sua navegação pelo relatório, o seu mapa foi estruturado em duas camadas que se complementam. Veja como ler cada uma delas:\n\nMandala 1 (O Mapa Natal Absoluto): mostra a posição exata dos planetas do setenário tradicional (coloridos), os signos (também coloridos), nodos lunares e lotes (em preto), bem como as casas nativas (contadas a partir do ascendente) no momento exato do nascimento. Na borda externa dos signos estão as marcações das dodecatemórias dentro do respectivo signo — uma espécie de "microscópio" da astrologia clássica: cada signo é subdividido em 12 partes, revelando onde a semente oculta (ou a raiz) de cada planeta está plantada.\n\nMandala 2 (As Casas a partir da Fortuna): o mapa visto com o Lote da Fortuna na casa 1 serve para analisar a vida sob a ótica material. Enquanto as casas nativas focam na jornada geral, as Casas de Fortuna revelam como a sorte, a saúde física, as finanças e o meio ambiente tangível vão se manifestar concretamente na realidade. A disposição das cores funciona como na Mandala 1.'
  },
  {
    id: 'sete-lotes', type: 'texto', titulo: 'Os Sete Lotes Herméticos',
    corpo: 'Os Sete Lotes Herméticos constituem um dos sistemas mais refinados de cálculo e subdivisão temática da astrologia clássica. Atribuída à tradição de Hermes, essa metodologia projeta sete pontos matemáticos específicos no mapa natal, onde cada um está geometricamente atrelado a um dos astros do setenário. Eles funcionam como receptáculos das promessas planetárias, isolando e detalhando áreas cruciais da experiência humana para avaliar como o destino e a ação do nativo se desdobrarão em cenários muito específicos da vida material e factual.\n\nCada lote atua como uma lente especializada para um assunto fundamental: o Lote da Fortuna (associado à Lua) governa o corpo, a saúde e as circunstâncias materiais; o Lote do Espírito (Sol) direciona a mente, a intenção, a vontade e a carreira; o Lote de Eros (Vênus) revela os desejos, os afetos e as escolhas feitas por prazer; o Lote da Necessidade (Mercúrio) sinaliza as restrições, as disputas e o intelecto sob pressão; o Lote da Audácia (Marte) rege a audácia, os riscos e as tomadas de iniciativa; o Lote da Vitória (Júpiter) aponta para o sucesso, as honras e a gratificação; e o Lote da Nêmesis (Saturno) administra as perdas, os fatores ocultos e as limitações inevitáveis.\n\nAnalisando o conjunto dos sete lotes herméticos — observando em quais casas esses pontos se localizam e como seus respectivos senhores se posicionam no mapa — decodificamos a infraestrutura factual que sustenta os sucessos, as crises, as escolhas e as amarras que o nativo encontrará ao longo de sua jornada.'
  },
  {
    id: 'dodecatemorias', type: 'texto', titulo: 'As Dodecatemórias',
    corpo: 'As dodecatemórias representam uma das técnicas mais profundas de microsubdivisão zodiacal da astrologia clássica. O termo, de origem grega, refere-se à divisão de cada um dos doze signos de 30° em doze partes menores de exatamente 2,5° cada, projetando uma espécie de "microcosmo zodiacal" dentro de cada signo. Essa técnica permite decodificar uma camada subjacente e íntima do mapa natal, revelando a raiz oculta e as ramificações invisíveis de cada planeta e ponto calculado.\n\nNa engenharia da astrologia clássica, a dodecatemória funciona como uma lente de altíssima definição. Ao projetar matematicamente a posição exata de um astro para um novo signo com base em seus graus, os antigos astrólogos conseguiam enxergar o que estava operando por baixo da superfície da matriz radical. Ela aponta para a verdadeira inclinação factual de um posicionamento, sendo capaz de confirmar, refinar ou direcionar a força das promessas de um planeta no destino prático do nativo.\n\nPortanto, a inclusão do mapa de dodecatemórias não serve como um adorno, mas sim como a sintonização fina das diretrizes do indivíduo — indispensável para destrinchar as nuances ocultas da capacidade realizadora, das aptidões e dos cenários exatos de atuação do nativo, trazendo à luz eixos de força que o mapa bruto e primário não evidencia de forma imediata.'
  },
  {
    id: 'casas-fortuna', type: 'texto', titulo: 'Casas a partir do Lote da Fortuna',
    corpo: 'A rotação do mapa para posicionar o Lote da Fortuna como a Casa 1 estabelece uma matriz secundária e altamente especializada na astrologia clássica. Esta técnica, fundamentada nos escritos de Vettius Valens, consiste em utilizar o signo onde o lote está localizado como o novo ponto de partida para a contagem das doze casas, criando um sistema de referência voltado estritamente para a dimensão material, física e factual da existência.\n\nEnquanto a estrutura natal radical descreve a jornada geral da vida, este mapa derivado funciona como um biombo voltado para a engenharia da contingência. Ao reorganizar as casas a partir da Fortuna, os planetas assumem novos papéis e responsabilidades, revelando a arquitetura oculta da subsistência, da prosperidade, do corpo físico e dos eventos fortuitos. É através desta disposição que se mapeiam com precisão os eixos de aquisição, os momentos de ápice e os cenários onde a sorte ou os desafios materiais se manifestarão de forma concreta.\n\nPortanto, a análise deste mapa com a Fortuna na primeira casa oferece uma leitura focada na realidade prática e nas circunstâncias externas que cruzam o caminho do nativo — indispensável para decodificar como o fluxo da matéria, os recursos e os acasos do destino governarão a vida profissional e a capacidade de sustentação ao longo do tempo.'
  },
  /* Bloco invisível na lista reordenável (tem seu próprio campo, fixo no
     fim do editor — ver relatorioEncerramentoHtml) que guarda o texto de
     encerramento do relatório: sempre a última página, junto com o
     rodapé de contato (nome/telefone/e-mail, esses sim vindos do perfil
     em Configurações). Fica dentro de "blocos" pelo mesmo motivo do
     "__capa__": não precisa de coluna nova no Supabase. */
  { id: '__encerramento__', type: 'encerramento', corpo: RELATORIO_ENCERRAMENTO_PADRAO }
];

/* CATÁLOGO COMPLETO DE BLOCOS QUE O EDITOR DE MODELO OFERECE — diferente
   de RELATORIO_BLOCOS_PADRAO (que é só a semente do preset "Mapa Natal
   Clássico"). Ferramentas novas (Profecção, e as próximas) entram aqui
   mesmo sem fazer parte do preset padrão — assim aparecem como opção pra
   qualquer modelo, desmarcadas até o astrólogo escolher incluí-las. */
const RELATORIO_CATALOGO_BLOCOS = RELATORIO_BLOCOS_PADRAO.concat([
  { id: 'profeccao', type: 'ferramenta' },
  { id: 'circumambulacao', type: 'ferramenta' },
  { id: 'mandala_personalizada', type: 'ferramenta' },
  { id: 'tabela_tecnica', type: 'ferramenta' },
  { id: 'matriz_visibilidade_mandala', type: 'ferramenta' },
  { id: 'decenios', type: 'ferramenta' },
  ...RELATORIO_LOTES_ORDEM.map(loteKey => ({ id: 'liberacao_' + loteKey, type: 'ferramenta' })),
  { id: 'horas', type: 'ferramenta' },
  { id: 'isopsefia', type: 'ferramenta' },
  { id: 'lotes_calculados', type: 'ferramenta' },
  { id: 'sinastria', type: 'ferramenta' }
]);

/* Guarda em memória (dura só a sessão atual, não persiste) as capturas
   de cada ferramenta "reaproveitada" no relatório (ex.: Profecção). É
   preenchida pelo botão "Adicionar ao Relatório" que fica na própria
   tela de cada ferramenta — o astrólogo deixa a tela do jeito que quer
   mostrar pro cliente e clica no botão; o relatório usa exatamente essa
   imagem, sem reconstruir nada.

   Cada ferramenta guarda uma LISTA de capturas (não uma só): o
   astrólogo pode clicar em "Adicionar ao Relatório" quantas vezes
   quiser pra mesma ferramenta — ex. Isopsefia com nomes diferentes, ou
   Circumambulação em anos diferentes — e cada clique acrescenta uma
   página nova no relatório, sem apagar as anteriores. */
window.relatorioCapturas = window.relatorioCapturas || {};

/* Lê as capturas de uma ferramenta já sempre como lista — normaliza o
   formato antigo (um objeto {dataUrl, capturadoEm} só, sem array) que
   pode vir de um rascunho salvo antes desta mudança. */
function capturasDaFerramenta(toolId) {
  const valor = (window.relatorioCapturas || {})[toolId];
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}
window.capturasDaFerramenta = capturasDaFerramenta;

/* Acrescenta uma nova captura à lista da ferramenta (nunca substitui as
   que já estavam lá) — usada tanto pelo fluxo genérico abaixo quanto
   pelos botões próprios da Mandala e da Calculadora de Lotes. */
function adicionarCapturaRelatorio(toolId, dataUrl) {
  window.relatorioCapturas = window.relatorioCapturas || {};
  const atuais = capturasDaFerramenta(toolId);
  atuais.push({ dataUrl, capturadoEm: Date.now() });
  window.relatorioCapturas[toolId] = atuais;
  // GRAVA de verdade a captura recém-tirada (sobe pro Storage e atualiza
  // a coluna `capturas` do rascunho) — sem isso ela ficava só como
  // data URL na memória da aba, e uma captura usada numa posição que já
  // existia no relatório (ex.: a 1ª de uma ferramenta, index 0) nunca
  // disparava o autosave de blocos (nada mudou nos blocos em si), então
  // nunca era salva de verdade: sumia pra sempre no próximo recarregar
  // da página, sem jeito nenhum de trazer de volta (a imagem original só
  // existe nessa data URL, que se perde com a aba).
  agendarPersistenciaCapturasRelatorio();
  return atuais.length;
}
window.adicionarCapturaRelatorio = adicionarCapturaRelatorio;

/* Sobe pro Storage qualquer captura ainda só em memória (data URL) e
   grava o pool resultante na coluna `capturas` do rascunho atual — a
   mesma lógica de persistirCapturasRelatorio usada por
   salvarRascunhoRelatorio, só que disparável a qualquer momento (não só
   quando o relatório inteiro é gerado), pra nenhuma captura nova ficar
   deixada só na memória até a próxima vez que a página recarregar. */
let relatorioPersistirCapturasTimeout = null;
function agendarPersistenciaCapturasRelatorio() {
  clearTimeout(relatorioPersistirCapturasTimeout);
  relatorioPersistirCapturasTimeout = setTimeout(persistirCapturasNoRascunhoAtual, 1200);
}

async function persistirCapturasNoRascunhoAtual() {
  if (typeof currentRascunhoId === 'undefined' || !currentRascunhoId) return;
  if (typeof currentMapaId === 'undefined' || !currentMapaId) return;
  const client = relatorioSupabaseClient();
  if (!client) return;
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const capturasPersistidas = await persistirCapturasRelatorio(client, user.id, currentMapaId);
    window.relatorioCapturas = capturasPersistidas;
    const { error } = await client
      .from('relatorio_rascunhos')
      .update({ capturas: capturasPersistidas, updated_at: new Date().toISOString() })
      .eq('id', currentRascunhoId)
      .eq('user_id', user.id);
    if (!error) {
      const cache = window.relatorioRascunhoEmEdicao;
      if (cache && cache.id === currentRascunhoId) cache.capturas = capturasPersistidas;
    }
  } catch (e) {
    console.error('Erro ao persistir capturas do relatório:', e);
  }
}
window.persistirCapturasNoRascunhoAtual = persistirCapturasNoRascunhoAtual;

/* Remove TODAS as capturas já adicionadas de uma ferramenta (usado pelo
   ícone de lixeira no editor de modelo, pra desfazer uma captura feita
   por engano sem precisar recarregar a página). */
function limparCapturasRelatorio(toolId) {
  if (window.relatorioCapturas) delete window.relatorioCapturas[toolId];
}
window.limparCapturasRelatorio = limparCapturasRelatorio;

/* Lê, dos blocos do preset, qual mandala foi escolhida pro astrólogo pra
   capa (ver o bloco invisível "__capa__" em RELATORIO_BLOCOS_PADRAO) —
   'mandala_natal' é o padrão pra presets salvos antes dessa opção
   existir, já que era o único comportamento possível até então. */
function obterCapaFonte(blocos) {
  const blocoCapa = (blocos || []).find(b => b.type === 'capa');
  return (blocoCapa && blocoCapa.fonte) || 'mandala_natal';
}

/* PALETAS DE CORES DA CAPA — combinações prontas (fundo + cor do
   título) que o astrólogo escolhe por MODELO de relatório, guardadas no
   mesmo bloco invisível "__capa__" que já guarda a fonte da mandala (ver
   acima) — sem coluna nova no Supabase, é o mesmo jsonb de sempre.
   'classico' é o padrão pra presets salvos antes dessa opção existir:
   fundo branco + título azul, exatamente o único visual que existia até
   então fora do Tema Céu. 'custom' não tem cor fixa aqui — usa
   corFundo/corTitulo salvos no próprio bloco (ver resolverCoresCapaRelatorio). */
const RELATORIO_PALETAS_CAPA = [
  { id: 'classico', nome: 'Clássico', corFundo: '#ffffff', corTitulo: '#103b70', corCabecalho: '#fffdf5', corBorda: '#103b70' },
  { id: 'azul_profundo', nome: 'Azul Profundo', corFundo: '#0b1f3f', corTitulo: '#d4af37', corCabecalho: '#0f2a52', corBorda: '#d4af37' },
  { id: 'esmeralda', nome: 'Verde Esmeralda', corFundo: '#0b3d2e', corTitulo: '#f2e6c9', corCabecalho: '#0f4a37', corBorda: '#f2e6c9' },
  { id: 'bordo', nome: 'Bordô', corFundo: '#3f0b17', corTitulo: '#e8c9a3', corCabecalho: '#4a0f1e', corBorda: '#e8c9a3' },
  { id: 'dourado_suave', nome: 'Dourado Suave', corFundo: '#f7f1e3', corTitulo: '#8a5a12', corCabecalho: '#fffaf0', corBorda: '#8a5a12' },
  { id: 'grafite', nome: 'Grafite', corFundo: '#1c1c1c', corTitulo: '#c9a227', corCabecalho: '#242424', corBorda: '#c9a227' }
];
const RELATORIO_PALETA_CAPA_PADRAO = 'classico';
const RELATORIO_HEX_RE = /^#[0-9a-fA-F]{6}$/;

/* TAMANHOS DE TÍTULO DA CAPA — em px, o mesmo valor que hoje está
   fixo em ".rel-titulo-capa" (30px) vira o padrão "medio". */
const RELATORIO_TAMANHOS_TITULO_CAPA = { pequeno: 22, medio: 30, grande: 38, 'extra-grande': 46 };
const RELATORIO_TAMANHO_TITULO_PADRAO = 'medio';

/* Lê, do bloco "__capa__", a paleta escolhida pra ESTE modelo — cai no
   'classico' pra quem salvou antes dessa opção existir. */
function obterPaletaCapaId(blocos) {
  const blocoCapa = (blocos || []).find(b => b.type === 'capa');
  return (blocoCapa && blocoCapa.paletaId) || RELATORIO_PALETA_CAPA_PADRAO;
}

/* Resolve as duas cores de fato usadas na capa a partir do bloco
   "__capa__" inteiro: paleta pronta (busca em RELATORIO_PALETAS_CAPA) ou
   'custom' (usa corFundo/corTitulo salvos no próprio bloco). Nunca
   devolve nada fora do formato "#rrggbb" — protege contra um valor
   corrompido/antigo no banco virar CSS inválido ou injetado. O Tema Céu
   NÃO entra aqui: ele é aplicado depois, por CSS com especificidade
   maior (ver .rel-capa-ceu), sempre por cima da paleta do preset. */
function resolverCoresCapaRelatorio(blocoCapa) {
  blocoCapa = blocoCapa || {};
  // "temBorda"/"temCirculo" são independentes da paleta escolhida
  // (built-in ou 'custom') — o astrólogo liga/desliga cada um pra
  // qualquer uma das duas, não são opções "a mais" só da Personalizada.
  const temBorda = blocoCapa.temBorda === true;
  const temCirculo = blocoCapa.temCirculo === true;
  const tamanhoTituloId = RELATORIO_TAMANHOS_TITULO_CAPA[blocoCapa.tamanhoTitulo] ? blocoCapa.tamanhoTitulo : RELATORIO_TAMANHO_TITULO_PADRAO;
  const tamanhoTituloPx = RELATORIO_TAMANHOS_TITULO_CAPA[tamanhoTituloId];
  if (blocoCapa.paletaId === 'custom') {
    return {
      corFundo: RELATORIO_HEX_RE.test(blocoCapa.corFundo) ? blocoCapa.corFundo : '#ffffff',
      corTitulo: RELATORIO_HEX_RE.test(blocoCapa.corTitulo) ? blocoCapa.corTitulo : '#103b70',
      corCabecalho: RELATORIO_HEX_RE.test(blocoCapa.corCabecalho) ? blocoCapa.corCabecalho : '#fffdf5',
      corBorda: RELATORIO_HEX_RE.test(blocoCapa.corBorda) ? blocoCapa.corBorda : '#c59b27',
      corCirculo: RELATORIO_HEX_RE.test(blocoCapa.corCirculo) ? blocoCapa.corCirculo : '#fffdf5',
      temBorda, temCirculo, tamanhoTituloId, tamanhoTituloPx
    };
  }
  const paleta = RELATORIO_PALETAS_CAPA.find(p => p.id === blocoCapa.paletaId) || RELATORIO_PALETAS_CAPA[0];
  // O círculo não tem cor própria no catálogo de paletas prontas — reusa
  // "corCabecalho" (já pensada pra ficar bem em cima do fundo daquela
  // paleta), pelo mesmo motivo que a borda reusa "corTitulo": combinar
  // sem precisar de mais um campo por paleta.
  return {
    corFundo: paleta.corFundo, corTitulo: paleta.corTitulo, corCabecalho: paleta.corCabecalho,
    corBorda: paleta.corBorda, corCirculo: paleta.corCabecalho,
    temBorda, temCirculo, tamanhoTituloId, tamanhoTituloPx
  };
}

/* Luminância aproximada (0 = preto, 1 = branco) de uma cor "#rrggbb" —
   só pra decidir se um fundo é "claro" ou "escuro" o bastante pra
   escolher a variante certa da mandala (ver estiloMandalaParaCapa logo
   abaixo). Fórmula perceptual simples (pesos de luminância de vídeo,
   sem correção de gama) — não precisa de mais precisão que essa pra
   decidir um "ou/ou" entre duas variantes de desenho. */
function luminanciaRelativaHex(hex) {
  if (!RELATORIO_HEX_RE.test(hex)) return 1;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/* Decide se a mandala usada NA CAPA (não nas páginas do corpo, que
   continuam sempre "claro" — ver renderizarMandalasDoPreset) deve sair
   na variante clara ou escura do desenho (ver renderMandala/tinta em
   mandala.js) — nunca do Tema Escuro do menu (Configurações >
   Aparência): essa é a causa do bug "capa branca com quadrado preto da
   mandala atrás" quando o astrólogo gera o relatório com o menu em modo
   escuro, já que antes a mandala sempre seguia esse tema do menu, sem
   relação nenhuma com a cor da capa.

   A cor usada pro cálculo de contraste NÃO é sempre "corFundo": é a cor
   que fica de fato ATRÁS dos números/linhas da mandala na hora de
   imprimir — normalmente é a cor de fundo da capa (corFundo), mas com o
   "círculo atrás da mandala" ligado (ver renderizarMandalasDoPreset/
   corCirculoForcada em mandala.js), quem fica atrás da mandala não é
   mais o fundo da capa, é o próprio círculo (ele é desenhado maior que
   a mandala, cobrindo tudo atrás dela) — calcular pelo corFundo nesse
   caso dava tinta clara numa capa escura com círculo branco (ou o
   oposto), ilegível, reportado pelo astrólogo ("dá certo com o azul do
   fundo, mas não dá certo com o branco que eu coloquei" no círculo).
   Sem círculo, nada muda: continua calculando pelo corFundo de sempre,
   porque aí sim é ele quem fica atrás da mandala.

   Fundo/círculo claro (ex.: branco) -> mandala clara, pra "chamar o
   branco" e não sobrar quadrado nenhum visível; fundo/círculo escuro
   (ex.: Grafite) -> mandala escura, pra fundir em vez de destacar um
   quadrado claro por cima do escuro.

   O Tema Céu é a ÚNICA exceção: quando ativo, SEMPRE força "claro" aqui
   (ignorando a paleta do modelo) — é o mesmo "disco claro dentro do céu
   estrelado" que já funciona hoje nesse tema, e nada nessa mudança pode
   mexer nisso (ver a nota de "Regra de ouro" no CLAUDE.md). */
function estiloMandalaParaCapa(blocoCapa) {
  if (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu') return 'claro';
  const cores = resolverCoresCapaRelatorio(blocoCapa);
  const corDeFundoDaMandala = cores.temCirculo ? cores.corCirculo : cores.corFundo;
  return luminanciaRelativaHex(corDeFundoDaMandala) < 0.5 ? 'escuro' : 'claro';
}

/* Lê, dos blocos do preset/rascunho, o texto de encerramento (ver o
   bloco invisível "__encerramento__" em RELATORIO_BLOCOS_PADRAO) — cai
   no texto padrão pra quem salvou o relatório antes desse bloco existir
   (mantém exatamente o que já saía impresso, só que agora editável). */
function obterEncerramento(blocos) {
  const bloco = (blocos || []).find(b => b.type === 'encerramento');
  return (bloco && bloco.corpo) || RELATORIO_ENCERRAMENTO_PADRAO;
}

/* Resolve a fonte escolhida pra imagem de fato usada na capa: as duas
   mandalas calculadas na hora (png1/png2, iguais às usadas nas páginas
   próprias delas) ou a última captura salva da Mandala Personalizada —
   sem imagem nenhuma quando o astrólogo escolhe "nenhuma" ou a fonte
   escolhida ainda não tem imagem disponível.

   png1Capa/png2Capa (opcionais) são a variante "escura" da mesma
   mandala, desenhada só quando a cor da capa pede (ver
   estiloMandalaParaCapa/renderizarMandalasDoPreset) — sempre preferida
   aqui quando existe, porque é a que combina com o fundo escolhido no
   modelo; png1/png2 (sempre "claro") continuam sendo as mesmas usadas
   nas páginas do corpo, que nunca mudam de estilo. */
function imagemCapaRelatorio(capaFonte, png1, png2, png1Capa, png2Capa) {
  if (capaFonte === 'mandala_fortuna') return png2Capa || png2 || null;
  // Mandala Personalizada, Profecção, Sinastria e cada Lote da
  // Liberação Zodiacal: nenhuma delas é calculada na hora (como
  // natal/fortuna são) — todas usam a ÚLTIMA captura já feita na
  // própria ferramenta ("Adicionar ao Relatório"), o mesmo pool que os
  // blocos "ferramenta" do corpo do relatório usam. A imagem já sai
  // com cabeçalho/legenda prontos de lá — nada a desenhar de novo aqui.
  if (capaFonte === 'mandala_personalizada' || capaFonte === 'profeccao' || capaFonte === 'sinastria' || (capaFonte || '').indexOf('liberacao_') === 0) {
    const capturas = capturasDaFerramenta(capaFonte);
    return capturas.length ? capturas[capturas.length - 1].dataUrl : null;
  }
  if (capaFonte === 'nenhuma') return null;
  return png1Capa || png1 || null; // 'mandala_natal', o padrão
}

async function capturarTelaParaRelatorio(toolId, containerId, rotulo) {
  const elemento = document.getElementById(containerId);
  if (!elemento) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }

  try {
    // Fallback só pra eventuais áreas transparentes na captura — o fundo de
    // verdade de cada ferramenta já vem do próprio elemento (var(--bg-main)
    // nas que já têm tema escuro); acompanha o modo atual em vez de cravar
    // sempre o creme do Tema Claro.
    const modoEscuroCaptura = document.documentElement.classList.contains('tema-escuro');
    const canvas = await html2canvas(elemento, { backgroundColor: window.temaMandala === 'ceu' ? null : (modoEscuroCaptura ? '#1c1917' : '#fffdf5'), scale: 2, useCORS: true }); // Tema Céu: sem fundo (encaixa no papiro da folha)
    const total = adicionarCapturaRelatorio(toolId, canvas.toDataURL('image/png'));
    alert(`"${rotulo}" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar tela ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  }
}
window.capturarTelaParaRelatorio = capturarTelaParaRelatorio;

function relatorioSupabaseClient() {
  return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
}

/* CARREGA O PERFIL DE RELATÓRIO (logo, nome, telefone, e-mail) — nunca
   lança erro: na ausência de sessão/tabela, devolve campos vazios. */
async function carregarPerfilRelatorio() {
  const vazio = { nome: '', telefone: '', email: '', logo_url: '' };
  try {
    const client = relatorioSupabaseClient();
    if (!client) return vazio;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return vazio;
    const { data, error } = await client.from('relatorio_perfil').select('*').eq('user_id', user.id).maybeSingle();
    if (error || !data) return vazio;
    return { nome: data.nome || '', telefone: data.telefone || '', email: data.email || '', logo_url: data.logo_url || '' };
  } catch (e) {
    return vazio;
  }
}

/* CARREGA OS PRESETS SALVOS DO USUÁRIO. Se ainda não existir nenhum,
   semeia automaticamente o preset padrão (Mapa Natal Clássico) — assim
   quem já usava o relatório antes dos presets não perde a ferramenta. */
async function carregarOuSemearPresetsRelatorio() {
  const client = relatorioSupabaseClient();
  if (!client) return [{ id: null, nome: 'Mapa Natal Clássico', blocos: RELATORIO_BLOCOS_PADRAO }];

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return [{ id: null, nome: 'Mapa Natal Clássico', blocos: RELATORIO_BLOCOS_PADRAO }];

    const { data, error } = await client.from('relatorio_presets').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (!error && data && data.length) {
      // serviço sem modelo (tem_modelo = false, ver "Remover modelo") não aparece aqui; pode sobrar lista vazia
      return data.filter(p => p.tem_modelo !== false);
    }

    // Ainda sem presets (ou tabela indisponível): tenta criar o padrão pro usuário;
    // se não conseguir salvar, ainda assim devolve um preset "em memória" pra o
    // relatório continuar funcionando nesta sessão.
    const { data: novo, error: erroInsert } = await client
      .from('relatorio_presets')
      .insert({ user_id: user.id, nome: 'Mapa Natal Clássico', blocos: RELATORIO_BLOCOS_PADRAO })
      .select()
      .maybeSingle();

    if (!erroInsert && novo) return [novo];
    return [{ id: null, nome: 'Mapa Natal Clássico', blocos: RELATORIO_BLOCOS_PADRAO }];
  } catch (e) {
    return [{ id: null, nome: 'Mapa Natal Clássico', blocos: RELATORIO_BLOCOS_PADRAO }];
  }
}

/* ==========================================
   RASCUNHOS DE RELATÓRIO
   Um cliente (mapa) pode ter vários rascunhos ao mesmo tempo (tabela
   relatorio_rascunhos) — ex.: um rascunho de "Retificação de Mapa
   Natal" e, separado, um de "Mapa Natal" pro mesmo cliente. Cada
   rascunho é salvo sozinho toda vez que o astrólogo gera a prévia —
   sem precisar de nenhum botão "Salvar" — atualizando sempre a MESMA
   linha (currentRascunhoId) enquanto ele continua editando o mesmo
   rascunho; carregar um mapa do zero (não a partir da lista de
   rascunhos) sempre começa um rascunho novo pra esse cliente. Guarda
   os blocos usados e as capturas de tela das outras ferramentas,
   subindo as que ainda só existem como data URL na memória pro Storage
   (bucket relatorio-capturas), pra não perder nada ao recarregar a
   página ou fechar o navegador. */

/* Lista leve (sem blocos/capturas) de todos os rascunhos do usuário,
   pra mostrar na tela de configuração do relatório — pode ter mais de
   um rascunho por mapa. Nome (cliente) vem exatamente como está salvo
   no nativo; título (tipo de relatório, ex. "Mapa Natal") vem do nome
   do modelo usado pra criar aquele rascunho. Ordenados por cliente em
   ordem alfabética — mas com números comparados numericamente (10
   depois de 2, não antes), por isso o "numeric: true" — e dentro do
   mesmo cliente, por título. */
async function listarRascunhosRelatorio() {
  const client = relatorioSupabaseClient();
  if (!client) return [];
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];
    const { data, error } = await client
      .from('relatorio_rascunhos')
      .select('id, mapa_id, nome, titulo, updated_at')
      .eq('user_id', user.id);
    if (error || !data) return [];
    return data.sort((a, b) => {
      const porNome = (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { numeric: true });
      if (porNome !== 0) return porNome;
      return (a.titulo || '').localeCompare(b.titulo || '', 'pt-BR', { numeric: true });
    });
  } catch (e) {
    return [];
  }
}

/* Carrega um rascunho específico pelo seu id (não pelo mapa — o mesmo
   mapa pode ter mais de um rascunho). */
async function carregarRascunhoPorId(rascunhoId) {
  const client = relatorioSupabaseClient();
  if (!client || !rascunhoId) return null;
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    const { data, error } = await client
      .from('relatorio_rascunhos')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', rascunhoId)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/* Sobe pro Storage qualquer captura ainda "solta" na memória como data
   URL, devolvendo o mesmo mapa de capturas (agora sempre listas) já só
   com URLs permanentes (as que já vieram de um rascunho anterior — já
   são URL — ficam como estão). Se o upload de uma captura falhar,
   mantém o data URL dela: assim o rascunho salva mesmo assim, só que
   essa captura em particular não sobrevive a um recarregamento de
   página. O nome do arquivo inclui a posição dela na lista, já que
   agora cada ferramenta pode ter várias. */
async function persistirCapturasRelatorio(client, userId, mapaId) {
  const capturasAtuais = window.relatorioCapturas || {};
  const resultado = {};

  for (const toolId of Object.keys(capturasAtuais)) {
    const lista = capturasDaFerramenta(toolId);
    if (!lista.length) continue;

    const listaPersistida = [];
    for (let idx = 0; idx < lista.length; idx++) {
      const captura = lista[idx];
      if (!captura || !captura.dataUrl) continue;

      if (!captura.dataUrl.startsWith('data:')) {
        listaPersistida.push(captura); // já é uma URL permanente
        continue;
      }

      try {
        const resposta = await fetch(captura.dataUrl);
        const blob = await resposta.blob();
        const caminho = `${userId}-${mapaId}-${toolId}-${idx}.png`;
        const { error } = await client.storage.from('relatorio-capturas').upload(caminho, blob, { upsert: true, contentType: 'image/png' });
        if (error) { listaPersistida.push(captura); continue; }
        const { data: pub } = client.storage.from('relatorio-capturas').getPublicUrl(caminho);
        listaPersistida.push({ dataUrl: pub.publicUrl, capturadoEm: captura.capturadoEm });
      } catch (e) {
        listaPersistida.push(captura);
      }
    }
    resultado[toolId] = listaPersistida;
  }

  return resultado;
}

/* Lê, direto do banco, o "pool" de capturas de um cliente (mapa) —
   união das capturas salvas em TODOS os rascunhos daquele mapa_id,
   deduplicada por dataUrl (uma mesma URL permanente do Storage não
   aparece duas vezes mesmo se estiver salva em mais de um rascunho).
   É assim que a mesma captura feita numa ferramenta fica disponível pra
   qualquer relatório daquele cliente (Retificação, Mapa Natal etc.) sem
   precisar refazer a captura — mas nunca aparece pra outro cliente,
   porque a busca é sempre filtrada por mapa_id. Sem tabela nova: só
   agrega o que cada rascunho já guarda na própria coluna `capturas`. */
async function carregarCapturasPooladasDoMapa(mapaId) {
  const vazio = {};
  const client = relatorioSupabaseClient();
  if (!client || !mapaId) return vazio;
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return vazio;

    const { data, error } = await client
      .from('relatorio_rascunhos')
      .select('capturas')
      .eq('user_id', user.id)
      .eq('mapa_id', mapaId);
    if (error || !data) return vazio;

    const pool = {};
    const vistosPorFerramenta = {};
    data.forEach(row => {
      const capturasRow = row.capturas || {};
      Object.keys(capturasRow).forEach(toolId => {
        const lista = Array.isArray(capturasRow[toolId]) ? capturasRow[toolId] : [capturasRow[toolId]];
        pool[toolId] = pool[toolId] || [];
        vistosPorFerramenta[toolId] = vistosPorFerramenta[toolId] || new Set();
        lista.forEach(captura => {
          if (!captura || !captura.dataUrl || vistosPorFerramenta[toolId].has(captura.dataUrl)) return;
          vistosPorFerramenta[toolId].add(captura.dataUrl);
          pool[toolId].push(captura);
        });
      });
    });
    Object.keys(pool).forEach(toolId => {
      pool[toolId].sort((a, b) => (a.capturadoEm || 0) - (b.capturadoEm || 0));
    });
    return pool;
  } catch (e) {
    return vazio;
  }
}
window.carregarCapturasPooladasDoMapa = carregarCapturasPooladasDoMapa;

/* Chamada sempre que o mapa em tela muda (ver aplicarDadosDoPerfilNoMapa,
   em mandala.js) — repõe window.relatorioCapturas com o pool de VERDADE
   desse cliente, assim que a busca no banco terminar. Só aplica o
   resultado se o astrólogo continuar no mesmo mapa quando a busca
   voltar (senão ele já trocou de cliente de novo nesse meio-tempo, e
   aplicar aqui "roubaria" a captura de quem está na tela agora). */
async function recarregarCapturasDoMapaAtivo(mapaId) {
  const pool = await carregarCapturasPooladasDoMapa(mapaId);
  if (typeof currentMapaId !== 'undefined' && currentMapaId === mapaId) {
    window.relatorioCapturas = pool;
  }
}
window.recarregarCapturasDoMapaAtivo = recarregarCapturasDoMapaAtivo;

/* Salva o rascunho do mapa atualmente carregado — chamada
   automaticamente ao final de gerarRelatorioCompleto, sem bloquear a
   prévia (roda em segundo plano). Não faz nada se o mapa em tela ainda
   não foi salvo (currentMapaId null — ex.: "Céu do Momento"), já que
   não haveria a quem vincular o rascunho.
   Se já existe um rascunho sendo editado (currentRascunhoId), atualiza
   essa mesma linha. Senão, cria um rascunho NOVO — é assim que dois
   rascunhos do mesmo cliente convivem (ex.: um de Retificação e,
   depois, um de Mapa Natal): cada vez que ela carrega o mapa do zero
   (não a partir da lista "Relatórios em Andamento") e gera uma prévia,
   começa um rascunho próprio, sem mexer nos que já existiam. */
async function salvarRascunhoRelatorio(preset) {
  const client = relatorioSupabaseClient();
  if (!client || typeof currentMapaId === 'undefined' || !currentMapaId) return;
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const mapaAoSalvar = currentMapaId;
    const capturasPersistidas = await persistirCapturasRelatorio(client, user.id, mapaAoSalvar);
    window.relatorioCapturas = capturasPersistidas;

    const nomeCliente = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : currentSubjectName;

    const dadosRascunho = {
      user_id: user.id,
      mapa_id: mapaAoSalvar,
      nome: nomeCliente,
      titulo: preset.nome || null,
      blocos: preset.blocos || [],
      capturas: capturasPersistidas,
      updated_at: new Date().toISOString()
    };

    if (currentRascunhoId) {
      await client.from('relatorio_rascunhos').update(dadosRascunho).eq('id', currentRascunhoId).eq('user_id', user.id);
    } else {
      const { data: novo, error } = await client.from('relatorio_rascunhos').insert(dadosRascunho).select().maybeSingle();
      // só assume o rascunho recém-criado se ela continua no mesmo mapa
      // (evita "roubar" o id se ela já trocou de cliente enquanto isso salvava)
      if (!error && novo && currentMapaId === mapaAoSalvar) currentRascunhoId = novo.id;
    }
  } catch (e) {
    console.error('Erro ao salvar rascunho do relatório:', e);
  }
}

/* Abre um rascunho existente pelo id dele (não pelo mapa — o mesmo
   cliente pode ter mais de um): troca o mapa ativo pro dono do
   rascunho (reaproveitando aplicarDadosDoPerfilNoMapa, a mesma função
   que a lista de mapas salvos usa) e já gera a prévia com os blocos e
   capturas salvos, pra continuar exatamente de onde parou. */
async function abrirRascunhoRelatorio(rascunhoId) {
  const client = relatorioSupabaseClient();
  const container = document.getElementById('mandala-container');
  if (!client || !container) return;

  container.innerHTML = `<div class="menu-vazio" style="padding: 60px;">Abrindo o rascunho...</div>`;

  try {
    const rascunho = await carregarRascunhoPorId(rascunhoId);
    if (!rascunho) { alert('Não foi possível carregar este rascunho.'); iniciarModuloRelatorio(); return; }

    const { data: mapaRow, error: erroMapa } = await client.from('mapas').select('*').eq('id', rascunho.mapa_id).maybeSingle();
    if (erroMapa || !mapaRow) { alert('Não foi possível carregar o mapa deste rascunho.'); iniciarModuloRelatorio(); return; }

    if (typeof aplicarDadosDoPerfilNoMapa === 'function') {
      // Espera o cálculo do mapa terminar de verdade antes de seguir: ele
      // busca os dados numa API externa (não é instantâneo), e se a gente
      // não esperasse, gerarRelatorioCompleto ia rodar antes do cálculo
      // acabar. Nesse meio-tempo o próprio cálculo, ao terminar, redesenha
      // a mandala normal dentro deste mesmo container — sobrescrevendo o
      // relatório que a gente tinha acabado de montar (era exatamente o
      // "volta pra tela da mandala" depois de abrir o rascunho).
      const calculoOk = await aplicarDadosDoPerfilNoMapa({
        id: mapaRow.id,
        nome: mapaRow.nome,
        codigo: mapaRow.codigo,
        tipo: mapaRow.tipo,
        dataNascimento: mapaRow.data_nascimento,
        horaNascimento: mapaRow.hora_nascimento,
        cidade: mapaRow.cidade,
        latitude: mapaRow.latitude,
        longitude: mapaRow.longitude,
        manterModulo: true // continua no Relatório (senão a Mandala e os botões dela voltam por cima)
      });
      if (calculoOk === false) { alert('Não foi possível calcular o mapa deste rascunho (erro de conexão). Tente de novo.'); iniciarModuloRelatorio(); return; }
    }
    // aplicarDadosDoPerfilNoMapa zera currentRascunhoId (mapa novo em
    // tela) — agora que sabemos que é justamente ESTE rascunho, reafirma.
    currentRascunhoId = rascunho.id;

    // Pool de capturas do CLIENTE (mapa_id), não só as desse rascunho —
    // assim uma captura feita enquanto editava outro relatório dela (ex.:
    // Mapa Natal) já aparece disponível aqui também (ex.: Retificação).
    // Captura feita antes de abrir o rascunho (ex.: na Mandala, com o mapa
    // recém-carregado, quando currentRascunhoId ainda era null e por isso
    // nunca subiu pro Storage) só existe em memória como data URL — trocar
    // o pool inteiro pelo do banco jogava essa captura fora (sumia do
    // seletor de imagens). Junta as duas coisas em vez de substituir; as
    // que ainda são data URL sobem no próximo salvamento normal.
    const poolDoBanco = await carregarCapturasPooladasDoMapa(rascunho.mapa_id);
    Object.keys(window.relatorioCapturas || {}).forEach(toolId => {
      capturasDaFerramenta(toolId).forEach(captura => {
        if (!captura || !captura.dataUrl || !String(captura.dataUrl).startsWith('data:')) return;
        poolDoBanco[toolId] = poolDoBanco[toolId] || [];
        poolDoBanco[toolId].push(captura);
      });
    });
    window.relatorioCapturas = poolDoBanco;
    // Guardado pra abrirEditorRascunhoRelatorio reaproveitar sem refazer a
    // consulta ao banco quando o astrólogo clicar em "Editar" a seguir.
    window.relatorioRascunhoEmEdicao = rascunho;
    await gerarRelatorioCompleto({ nome: rascunho.titulo || rascunho.nome, blocos: rascunho.blocos || [] });
  } catch (e) {
    alert('Erro de conexão ao abrir o rascunho.');
  }
}
window.abrirRascunhoRelatorio = abrirRascunhoRelatorio;

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS (abrirModuloTecnica) */
async function iniciarModuloRelatorio() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div class="menu-vazio">Carregue um mapa de cliente no menu lateral para gerar o Relatório.</div>`;
    return;
  }

  // RETOMAR DE ONDE PAROU — o astrólogo pode ter só ido dar uma olhada em
  // outra ferramenta (Mandala, Profecção etc.) pra decidir o que escrever,
  // sem trocar de cliente. Nesse caso volta direto pro relatório que
  // estava aberto, em vez de reiniciar do zero (escolher modelo/cliente de
  // novo) — o relatório só "fecha" de verdade quando o astrólogo clica em
  // "Voltar" (ver voltarConfigRelatorio/voltarDoEditorRascunho, que zeram
  // currentRascunhoId/relatorioEditorAlvoAtual de propósito).
  const mesmoCliente = typeof currentMapaId !== 'undefined' && currentMapaId;
  const alvoEditor = window.relatorioEditorAlvoAtual;
  const cacheRascunho = window.relatorioRascunhoEmEdicao;
  if (mesmoCliente && alvoEditor && alvoEditor.tipo === 'rascunho' && cacheRascunho
      && cacheRascunho.id === alvoEditor.id && cacheRascunho.mapa_id === currentMapaId) {
    const abaParaRetomar = window.relatorioAbaEditorAtiva;
    // Não zera mais o cache pra "reler do banco": gravarBlocosNoRascunho
    // (usada tanto pelo autosave quanto pelo "Salvar Agora" manual) já
    // mantém window.relatorioRascunhoEmEdicao em dia com o que foi salvo,
    // então reler aqui só repetia pela rede dados que já tínhamos na mão —
    // era esse fetch, não o cálculo em si, que fazia "Abrindo o
    // relatório..." demorar (e parecer perigoso) toda vez que o astrólogo
    // só ia dar uma olhada noutra ferramenta e voltava.
    await abrirEditorRascunhoRelatorio(alvoEditor.id, { retomando: true });
    if (abaParaRetomar === 'previa') mudarAbaEditorModelo('previa');
    return;
  }
  if (mesmoCliente && !alvoEditor && typeof currentRascunhoId !== 'undefined' && currentRascunhoId) {
    await abrirRascunhoRelatorio(currentRascunhoId);
    return;
  }

  container.innerHTML = `<div class="menu-vazio" style="padding: 60px;">Carregando seus modelos de relatório...</div>`;

  const [presets, rascunhos] = await Promise.all([
    carregarOuSemearPresetsRelatorio(),
    listarRascunhosRelatorio()
  ]);
  renderRelatorioSetup(container, presets, rascunhos);
}

function renderRelatorioSetup(container, presets, rascunhos) {
  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');
  const headerTitle = currentSubjectName; // só o nome: o código do cliente não aparece mais no cabeçalho

  // Pré-seleciona o último modelo que o astrólogo escolheu (guardado no
  // navegador) em vez de sempre voltar pro primeiro da lista — sem isso,
  // quem trabalha com "Retificação de Mapa Natal" o dia todo tinha que
  // trocar o seletor toda vez que voltava nessa tela.
  const indicePresetPadrao = indicePresetLembrado(presets);
  const opcoesPreset = !presets.length ? '<option value="">Nenhum modelo — toque em + Novo</option>' : presets.map((p, idx) => `<option value="${idx}" ${idx === indicePresetPadrao ? 'selected' : ''}>${escapeHtml(p.nome)}</option>`).join('');
  const listaModelosHTML = renderizarListaModelosRelatorioHTML(presets);

  // Agrupa os rascunhos por cliente (nome) — o mesmo cliente pode ter
  // mais de um em andamento (ex.: Retificação e, separado, Mapa Natal).
  const gruposRascunhos = [];
  (rascunhos || []).forEach(r => {
    let grupo = gruposRascunhos.find(g => g.nome === r.nome);
    if (!grupo) { grupo = { nome: r.nome, itens: [] }; gruposRascunhos.push(grupo); }
    grupo.itens.push(r);
  });

  const listaRascunhosHTML = gruposRascunhos.length ? `
    <div class="re-bloco">
      <div class="titulo-secao">Relatórios em Andamento</div>
      ${gruposRascunhos.map(g => `
        <div class="re-grupo">
          <div class="re-cliente rel-setup-cliente">${escapeHtml(g.nome)}</div>
          ${g.itens.map(r => `
            <div class="re-item rel-setup-rascunho${r.id === currentRascunhoId ? ' atual' : ''}" onclick="abrirRascunhoRelatorio('${r.id}')">
              <span class="re-item-nome">${escapeHtml(r.titulo || 'Rascunho sem título')}</span>
              <div class="re-item-acoes">
                <button type="button" class="botao-icone botao-apagar" data-rascunho-id="${r.id}" data-rascunho-rotulo="${escapeHtml(g.nome + ' — ' + (r.titulo || 'Rascunho sem título'))}" title="Excluir este relatório" onclick="event.stopPropagation(); excluirRascunhoRelatorio(this.dataset.rascunhoId, this.dataset.rascunhoRotulo)">${menuIcone('lixeira', 18)}</button>
                <span class="botao-icone" style="width: 20px;">${menuIcone('avancar', 18)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    <hr class="divisa">
  ` : '';

  container.innerHTML = `
    <div class="rel-setup-tela painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">

      <div class="cabeca-ferramenta">
        <h3 class="titulo-ferramenta">Relatório</h3>
      </div>

      <!-- CABEÇALHO PADRÃO (função global, o mesmo de todas as ferramentas — assim também vira papiro no Tema Céu).
           Sem código do cliente: só o nome, igual às outras ferramentas. -->
      ${(typeof montarCabecalhoMandalaImagemHTML === 'function' && currentCalculatedData)
        ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true })
        : `<div class="re-ajuda">${escapeHtml(headerTitle)}</div>`}

      <div class="re-coluna">
        ${listaRascunhosHTML}

        <div class="re-bloco">
          <label class="rotulo re-rotulo">Modelo de Relatório</label>
          <select id="relPresetEscolhido" class="modal-select">${opcoesPreset}</select>
          <div class="re-ajuda">
            O logo e os seus dados de contato ficam configurados em <a href="#" onclick="abrirConfiguracoes('relatorios'); return false;">Configurações → Relatórios</a> (botão de engrenagem na barra superior).
          </div>
          <div class="re-acoes">
            <button type="button" class="botao-texto" onclick="confirmarGerarRelatorio()">Gerar Relatório</button>
          </div>
        </div>

        <hr class="divisa">

        <div class="re-bloco">
          <div class="re-bloco-topo">
            <div class="titulo-secao" style="margin: 0;">Modelos de Relatório</div>
            <button type="button" class="botao-texto" onclick="criarNovoPresetRelatorio()">+ Novo</button>
          </div>
          <div class="re-ajuda">
            Cada modelo escolhe quais textos e ferramentas entram no relatório, e com que conteúdo.
          </div>
          <div id="relListaModelos">${listaModelosHTML}</div>
        </div>

        <hr class="divisa">
      </div>

    </div>
  `;

  window.relatorioPresetsCarregados = presets;
}

function renderizarListaModelosRelatorioHTML(presets) {
  return presets.map((p, idx) => `
    <div class="re-item re-item-simples">
      <span class="re-item-nome">${escapeHtml(p.nome)}</span>
      <div class="re-item-acoes">
        <button type="button" class="botao-icone" style="color: var(--cinza);" onclick="abrirEditorPresetRelatorio(${idx})" title="Editar">${menuIcone('editar', 18)}</button>
        <button type="button" class="botao-icone botao-apagar" onclick="excluirPresetRelatorio(${idx})" title="Remover modelo (o serviço continua)">${menuIcone('lixeira', 18)}</button>
      </div>
    </div>
  `).join('');
}

/* CRIA UM NOVO MODELO DE RELATÓRIO A PARTIR DO CONJUNTO DE BLOCOS PADRÃO
   (o astrólogo edita os textos e escolhe o que entra depois, no editor) */
async function criarNovoPresetRelatorio() {
  const nome = await astroPrompt("Nome do novo modelo de relatório (ex: Revolução Solar):");
  if (!nome || !nome.trim()) return;

  const client = relatorioSupabaseClient();
  if (!client) return;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    // Serviço que já existe sem modelo (Configurações → Serviços) com esse mesmo nome: devolve o modelo a ele
    // em vez de criar um serviço duplicado.
    const { data: semModelo } = await client.from('relatorio_presets').select('id, nome').eq('user_id', user.id).eq('tem_modelo', false);
    const existente = (semModelo || []).find(s => (s.nome || '').trim().toLowerCase() === nome.trim().toLowerCase());

    const { error } = existente
      ? await client.from('relatorio_presets').update({ tem_modelo: true, blocos: RELATORIO_BLOCOS_PADRAO, updated_at: new Date().toISOString() }).eq('id', existente.id)
      : await client.from('relatorio_presets').insert({ user_id: user.id, nome: nome.trim(), blocos: RELATORIO_BLOCOS_PADRAO });

    if (error) { alert("Erro ao criar modelo: " + error.message); return; }
    iniciarModuloRelatorio();
  } catch (e) {
    alert("Erro de conexão ao criar modelo.");
  }
}
window.criarNovoPresetRelatorio = criarNovoPresetRelatorio;

async function excluirPresetRelatorio(idx) {
  const preset = (window.relatorioPresetsCarregados || [])[idx];
  if (!preset || !preset.id) return;
  if (!await astroConfirm(`Remover o modelo "${preset.nome}"?\n\nO serviço continua cadastrado em Configurações → Serviços; só o modelo de relatório dele é removido (dá pra criar de novo depois). Os relatórios que você já criou não mudam.`)) return;

  const client = relatorioSupabaseClient();
  if (!client) return;

  try {
    // NÃO apaga a linha: ela também é o serviço. Só tira o modelo (tem_modelo = false).
    const { error } = await client.from('relatorio_presets').update({ tem_modelo: false, blocos: [], updated_at: new Date().toISOString() }).eq('id', preset.id);
    if (error) { alert("Erro ao remover o modelo: " + error.message); return; }
    iniciarModuloRelatorio();
  } catch (e) {
    alert("Erro de conexão ao excluir modelo.");
  }
}
window.excluirPresetRelatorio = excluirPresetRelatorio;

/* Exclui um RASCUNHO (o relatório de UM cliente específico, listado em
   "Relatórios em Andamento") — nunca mexe em relatorio_presets, só
   nessa linha específica de relatorio_rascunhos. */
async function excluirRascunhoRelatorio(rascunhoId, rotulo) {
  if (!rascunhoId) return;
  if (!await astroConfirm(`Excluir o relatório "${rotulo}"? Essa ação não pode ser desfeita.`)) return;

  const client = relatorioSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('relatorio_rascunhos').delete().eq('id', rascunhoId);
    if (error) { alert("Erro ao excluir: " + error.message); return; }

    // Se o relatório excluído era o que estava aberto/em edição, zera o
    // estado — senão o "retomar de onde parou" (ver iniciarModuloRelatorio)
    // tentaria reabrir um rascunho que não existe mais.
    if (typeof currentRascunhoId !== 'undefined' && currentRascunhoId === rascunhoId) currentRascunhoId = null;
    if (window.relatorioEditorAlvoAtual && window.relatorioEditorAlvoAtual.tipo === 'rascunho' && window.relatorioEditorAlvoAtual.id === rascunhoId) {
      window.relatorioEditorAlvoAtual = null;
    }
    if (window.relatorioRascunhoEmEdicao && window.relatorioRascunhoEmEdicao.id === rascunhoId) {
      window.relatorioRascunhoEmEdicao = null;
    }

    iniciarModuloRelatorio();
  } catch (e) {
    alert("Erro de conexão ao excluir relatório.");
  }
}
window.excluirRascunhoRelatorio = excluirRascunhoRelatorio;

/* EDITOR DE UM MODELO: cada bloco (do catálogo ou personalizado) vira uma
   linha reordenável — checkbox pra incluir/excluir, título e corpo
   editáveis pros blocos de texto, e setas ▲▼ pra mover a linha dentro do
   container. A ordem salva é lida direto da ordem das linhas no DOM, então
   dá pra intercalar textos, mandalas e capturas de ferramenta à vontade.
   Renderiza na tela principal (não mais na sidebar) pra sobrar bem mais
   espaço pra digitar os textos. */
function relatorioLinhaEditorHtml({ id, tipo, custom, rotulo, titulo, corpo, formato, ferramentaId, capturaIndex, rotuloIndice, bibliotecaId }) {
  const setas = `
    <div class="re-setas">
      <button type="button" class="botao-icone" onclick="moverBlocoEditor(this, -1)" title="Mover para cima">${menuIcone('cima', 16)}</button>
      <button type="button" class="botao-icone" onclick="moverBlocoEditor(this, 1)" title="Mover para baixo">${menuIcone('baixo', 16)}</button>
    </div>
  `;

  if (tipo === 'ferramenta') {
    // Ferramentas "capturadas" (Profecção, Isopsefia, Liberação Zodiacal
    // etc.) podem entrar MAIS DE UMA VEZ no mesmo modelo, cada uma numa
    // posição diferente. "ferramentaId" é a ferramenta de verdade (pra
    // achar o rótulo e as capturas); "id" é único por LINHA. A primeira
    // instância de cada ferramenta usa ferramentaId === id; a partir da
    // segunda, o botão "+" cria uma linha nova com um id próprio.
    const idFerramenta = ferramentaId || id;
    const idx = typeof capturaIndex === 'number' ? capturaIndex : 0;
    const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[idFerramenta];

    let extrasCapturada = '';
    if (info && info.capturada) {
      const totalCapturas = capturasDaFerramenta(idFerramenta).length;
      const temImagemNestaLinha = idx < totalCapturas;
      const rotuloBadge = temImagemNestaLinha
        ? `usa a imagem ${idx + 1}${totalCapturas > 1 ? ' de ' + totalCapturas : ''}`
        : 'sem captura pra esta posição';
      const rotuloEscapado = escapeHtml(info.label).replace(/'/g, '&#39;');
      extrasCapturada = `
        <span class="re-etiqueta${temImagemNestaLinha ? '' : ' falta'}">${rotuloBadge}</span>
        <button type="button" class="botao-icone" title="Adicionar mais uma página desta ferramenta em outro lugar do relatório" onclick="adicionarInstanciaFerramentaEditor('${idFerramenta}', '${rotuloEscapado}')">${menuIcone('mais', 18)}</button>
      `;
    }

    // Nome que aparece no Índice pra ESTA posição — editável, porque com
    // a mesma ferramenta podendo entrar várias vezes o nome padrão repete
    // no Índice e não dá pra saber qual é qual.
    const tituloIndicePadrao = (info && (info.tituloIndice || info.label)) || rotulo;
    const rotuloIndiceAtual = rotuloIndice || tituloIndicePadrao;

    return `
      <div class="rel-editor-linha re-linha" data-bloco-id="${id}" data-bloco-tipo="ferramenta" data-ferramenta-id="${idFerramenta}" data-captura-index="${idx}">
        <div class="re-linha-topo">
          ${setas}
          <input type="checkbox" data-bloco-check="${id}" checked>
          <span class="re-linha-nome">${escapeHtml(rotulo)}</span>
          ${extrasCapturada}
          <button type="button" class="botao-icone botao-apagar" title="Remover esta página" onclick="removerBlocoEditor(this, '${id}')">${menuIcone('lixeira', 18)}</button>
        </div>
        <div class="re-linha-indice">
          <label class="rotulo re-rotulo">Nome no Índice</label>
          <input type="text" data-bloco-titulo-indice="${id}" class="modal-input" value="${escapeHtml(rotuloIndiceAtual)}">
        </div>
      </div>
    `;
  }

  const rotuloLinha = custom ? 'Bloco personalizado' : escapeHtml(rotulo);

  // O <textarea> antigo virou um "mount" vazio: o Quill de verdade só pode
  // ser criado depois que esse HTML já estiver no DOM (ver
  // inicializarQuillsPendentes). Por isso o conteúdo inicial fica
  // registrado aqui num mapa global em vez de ir direto pro HTML.
  window.relatorioQuillPendentes = window.relatorioQuillPendentes || {};
  window.relatorioQuillPendentes[id] = { corpo: corpo || '', formato: formato || 'texto' };

  return `
    <div class="rel-editor-linha re-linha" data-bloco-id="${id}" data-bloco-tipo="texto" data-custom="${custom ? '1' : '0'}"${bibliotecaId ? ` data-biblioteca-id="${bibliotecaId}"` : ''}>
      <div class="re-linha-topo">
        ${setas}
        <input type="checkbox" data-bloco-check="${id}" checked onchange="this.closest('.rel-editor-linha').querySelector('.rel-editor-campos').style.display = this.checked ? 'block' : 'none'">
        <span class="re-linha-nome${custom ? ' custom' : ''}">${rotuloLinha}</span>
        <button type="button" class="botao-icone" title="Salvar na biblioteca (fica na lista &quot;Meus blocos&quot; pra usar em outros relatórios)" onclick="salvarBlocoNaBiblioteca('${id}')">${menuIcone('marcador', 18)}</button>
        <button type="button" class="botao-icone botao-apagar" title="Remover este bloco" onclick="removerBlocoEditor(this, '${id}')">${menuIcone('lixeira', 18)}</button>
      </div>
      <div class="rel-editor-campos re-linha-campos">
        <input type="text" data-bloco-titulo="${id}" class="modal-input" value="${escapeHtml(titulo || '')}" placeholder="${custom ? 'Título do bloco' : ''}">
        <div id="quill-mount-${id}" class="rel-quill-mount"></div>
      </div>
    </div>
  `;
}

/* Roda fn() e, se a página tiver rolado sozinha por causa disso (efeito
   colateral do navegador tentando manter um cursor/foco visível dentro
   de um <div contenteditable>, ver evitarRolagemAoFormatar logo abaixo),
   devolve a rolagem pra onde estava — sempre um quadro (rAF) depois,
   porque é só aí que essa rolagem automática já aconteceu de verdade
   (ela não é síncrona com fn()). */
function executarSemMoverRolagem(fn) {
  const scrollXAntes = window.scrollX, scrollYAntes = window.scrollY;
  fn();
  requestAnimationFrame(() => {
    if (window.scrollX !== scrollXAntes || window.scrollY !== scrollYAntes) {
      window.scrollTo(scrollXAntes, scrollYAntes);
    }
  });
}

/* Aplicar uma formatação pela barra (negrito, Título, alinhar ao centro
   etc.) faz o Quill mexer no foco/seleção do <div contenteditable> por
   baixo dos panos — e, META DO NAVEGADOR (não do Quill, não deste site):
   sempre que o foco/cursor de um contenteditable muda, ele tenta manter
   esse ponto visível na tela, rolando a página sozinho. Num bloco de
   texto comprido (o "Word-like" de um bloco só), isso jogava a rolagem
   pro topo do bloco a cada formatação aplicada — mesmo estando editando
   a última linha. Captura a rolagem ANTES de qualquer mousedown na
   barra (fase de captura: roda antes do próprio Quill decidir o que
   fazer com o clique) e devolve depois, cobrindo QUALQUER controle da
   barra (não só um botão específico). */
function evitarRolagemAoFormatar(quill) {
  const toolbarModule = quill.getModule('toolbar');
  const toolbar = toolbarModule ? toolbarModule.container : null;
  if (!toolbar) return;
  toolbar.addEventListener('mousedown', () => {
    executarSemMoverRolagem(() => {});
  }, true);
}

/* Cria de fato os editores Quill pra cada linha de texto pendente (ver
   comentário acima) — chamar sempre depois de qualquer trecho de HTML que
   use relatorioLinhaEditorHtml pra um bloco de texto ter entrado no DOM.
   Cada bloco vira, a partir do primeiro salvamento por aqui, HTML rico
   (formato:'rich') — texto puro antigo (sem "formato") é convertido pra
   parágrafos na entrada, mas só é reescrito no Supabase quando o modelo
   for salvo de novo, então nenhum preset intocado muda de formato sozinho. */
function inicializarQuillsPendentes() {
  configurarQuillUmaVez();
  const pendentes = window.relatorioQuillPendentes || {};
  window.relatorioQuillInstancias = window.relatorioQuillInstancias || {};

  Object.keys(pendentes).forEach(id => {
    const mount = document.getElementById('quill-mount-' + id);
    if (!mount || typeof Quill !== 'function') return;

    const quill = new Quill(mount, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            // "Tipo de Texto" (Normal/Título/Subtítulo) — rótulos em PT
            // via CSS (ver .ql-picker.ql-header em
            // injetarEstilosEditorRelatorio). "Título" (<h2>) e
            // "Subtítulo" (<h3>) viram, cada um, sua PRÓPRIA linha no
            // Índice (ver marcarTitulosInternosComId), apontando pra ele
            // mesmo — não pro bloco inteiro. É o que permite um único
            // bloco de texto ("Word-like", vários "capítulos"/
            // "subcapítulos" internos) preencher o Índice sozinho, sem
            // precisar de um bloco por capítulo. Parágrafo "Normal"
            // nunca entra no Índice.
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ color: [] }],
            [{ size: ['12px', false, '18px', '26px'] }],
            [{ align: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['image']
          ],
          // Substitui o handler padrão do botão de imagem (que abriria um
          // seletor de arquivo do computador) — aqui a imagem sempre vem
          // de uma captura já feita numa ferramenta (ex.: um lote
          // específico marcado na Calculadora de Lotes), nunca de upload
          // novo, então o botão abre esse seletor em vez disso.
          handlers: { image: () => abrirSeletorImagemCapturaQuill(quill) }
        }
      }
    });

    // dangerouslyPasteHTML deixa o cursor no FIM do texto colado — e o
    // navegador, sozinho, rola a página pra manter o cursor visível.
    // Com o texto salvo sendo bem comprido (o "Word-like" de bloco
    // único), isso abria a tela do editor já lá embaixo, no meio do
    // texto, em vez de no topo do formulário — sem relação nenhuma com
    // o que o astrólogo queria ver primeiro. executarSemMoverRolagem
    // (definida logo abaixo) desfaz essa rolagem indesejada.
    const { corpo, formato } = pendentes[id];
    executarSemMoverRolagem(() => {
      if (formato === 'rich') {
        quill.clipboard.dangerouslyPasteHTML(corpo || '');
      } else if (corpo) {
        // Mesma regra de parágrafo que o relatório final sempre usou pra
        // texto puro (linha em branco separa parágrafos) — pra a prévia no
        // Quill começar igual ao que já está publicado, sem surpresa.
        const paragrafos = corpo.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
        quill.clipboard.dangerouslyPasteHTML(paragrafos.map(p => `<p>${escapeHtml(p)}</p>`).join(''));
      }
    });
    window.relatorioQuillInstancias[id] = quill;
    criarOverlayQuebraPaginaQuill(id, quill);
    ativarBarraFlutuanteQuill(id, quill);
    evitarRolagemAoFormatar(quill);
  });

  window.relatorioQuillPendentes = {};
}
window.inicializarQuillsPendentes = inicializarQuillsPendentes;

/* ===== INDICADOR DE QUEBRA DE PÁGINA AO VIVO, DENTRO DO PRÓPRIO QUILL =====
   Antes disso, a única forma de saber onde o texto ia quebrar de página
   era trocar pra aba "Prévia" e gerar o relatório inteiro de novo — sem
   isso, a caixa do Quill cresce "lisa", sem fim de folha nenhum visível,
   e o astrólogo não tinha como decidir o que reescrever/reorganizar pra
   a quebra cair num lugar melhor.

   Reaproveita a MESMA conta de dividirPaginasLongasEmFolhas (orçamento de
   altura de uma folha A4, medido com a fonte/largura de verdade do
   relatório — nunca a da caixa do Quill, que usa outra fonte/line-height
   só pra ficar confortável de editar), só que sem mover nada: mede um
   clone oculto do texto atual e devolve depois de qual parágrafo a
   página muda. Como a quebra só acontece em fronteira de parágrafo (a
   conta original nunca corta um <p> ao meio), o ÍNDICE do parágrafo é a
   mesma coisa nos dois lugares mesmo a largura/fonte sendo diferentes —
   só a ALTURA de cada parágrafo (calculada contra a fonte/largura reais)
   depende da folha de verdade; a POSIÇÃO da linha-guia na tela usa a
   posição desse mesmo parágrafo dentro da caixa visível do Quill. */

/* Cria (uma vez só, reaproveitado por todo bloco de texto) o clone oculto
   que serve de "régua": mesmas classes .rel-page/.rel-h1/.rel-corpo do
   relatório de verdade (injetadas pelo <style> deste módulo), então
   qualquer mudança de fonte/padding/margem no relatório real já vale
   aqui também, sem precisar duplicar nenhum valor. */
function medidorPaginaRelatorio() {
  // injetarEstilosRelatorio() é quem define .rel-page/.rel-h1/.rel-corpo
  // (as classes que este medidor reaproveita) — só que ela só tinha sido
  // chamada, até agora, na hora de montar a Prévia/PDF. Quem abria a aba
  // "Editar" e nunca tinha visitado a Prévia NESSA sessão via um medidor
  // sem CSS nenhum aplicado (nem largura de folha, nem padding, nem
  // fonte/line-height do texto) — o cálculo rodava sem erro, só que
  // contra métricas erradas, então o orçamento de altura de uma folha
  // saía errado (sem o padding real subtraído, o "espaço disponível"
  // parecia bem maior do que uma folha de verdade tem), e a linha de
  // quebra podia demorar bem mais que o esperado pra aparecer — ou nunca
  // aparecer com pouco texto. injetarEstilosRelatorio() já é blindada
  // contra injetar duas vezes (guarda por id), então chamar aqui de novo
  // não tem custo nenhum quando ela já rodou por outro caminho.
  injetarEstilosRelatorio();

  let el = document.getElementById('relMedidorPaginaOculto');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'relMedidorPaginaOculto';
  // width:210mm aqui (não 0): .rel-page usa "max-width:100%", que resolve
  // contra a largura DESTE pai — com o pai a 0px, a folha inteira also
  // colapsava pra 0px de largura, e a função desistia sempre achando que
  // não tinha como medir (retornava [] sem nunca desenhar nenhuma linha,
  // em qualquer navegador/cache).
  el.style.cssText = 'position: fixed; top: 0; left: -99999px; width: 210mm; overflow: visible;';
  el.innerHTML = `
    <section class="rel-page" style="margin: 0;">
      <div class="rel-h1" id="relMedidorH1"></div>
      <div class="rel-corpo" id="relMedidorCorpo"></div>
    </section>
  `;
  document.body.appendChild(el);
  return el;
}

/* Devolve os índices (0-based, entre os filhos de primeiro nível do
   corpo) que COMEÇAM uma nova página. temBlocoH1 diferencia um bloco de
   texto comum (sempre tem a caixa .rel-h1, mesmo com título vazio — ela
   ocupa altura só pela borda/padding) do bloco de Encerramento (nunca
   tem .rel-h1 nenhum, ver montarConteudoRelatorioHtml) — sem essa
   distinção, um texto de título vazio contaria como "sem título", o que
   subestimaria a altura já gasta na primeira página. */
function calcularQuebrasDePaginaTexto(corpoHtml, tituloTexto, temBlocoH1) {
  const medidor = medidorPaginaRelatorio();
  const paginaEl = medidor.querySelector('.rel-page');
  const h1El = medidor.querySelector('#relMedidorH1');
  const corpoEl = medidor.querySelector('#relMedidorCorpo');

  h1El.style.display = temBlocoH1 ? '' : 'none';
  h1El.textContent = tituloTexto || '';
  corpoEl.innerHTML = corpoHtml || '';

  // Mesmo truque de dividirPaginasLongasEmFolhas: o orçamento de altura
  // vem da LARGURA (estável) vezes a proporção A4 fixa (297/210) — nunca
  // da altura renderizada da própria folha, que aqui cresceria sem
  // limite junto com o conteúdo (é um clone fora da tela, sem quebra
  // nenhuma até este cálculo terminar).
  const larguraAtual = paginaEl.getBoundingClientRect().width;
  if (!larguraAtual) return [];
  const alturaFolhaPx = larguraAtual * (297 / 210);
  const estiloPagina = getComputedStyle(paginaEl);
  const orcamentoPx = alturaFolhaPx - parseFloat(estiloPagina.paddingTop) - parseFloat(estiloPagina.paddingBottom);

  let alturaUsada = temBlocoH1 ? h1El.getBoundingClientRect().height + 26 : 0; // 26px = margin-bottom do .rel-h1
  const indicesDeQuebra = [];
  Array.from(corpoEl.children).forEach((filho, idx) => {
    const alturaFilho = filho.getBoundingClientRect().height + parseFloat(getComputedStyle(filho).marginBottom || 0);
    if (alturaUsada > 0 && alturaUsada + alturaFilho > orcamentoPx) {
      indicesDeQuebra.push(idx);
      alturaUsada = 0;
    }
    alturaUsada += alturaFilho;
  });
  return indicesDeQuebra;
}

/* Pluga o overlay num Quill recém-criado: recalcula (com debounce, pra
   não medir a cada tecla) a cada mudança de texto, a cada mudança no
   campo "Título" ao lado (ele entra no orçamento da primeira página) e
   ao redimensionar a janela (a largura da caixa muda a posição das
   linhas, mesmo a quebra em si não mudando de parágrafo). O overlay
   nunca é filho de quill.root (isso vazaria pro HTML salvo do bloco) —
   é um <div> à parte, irmão de .ql-editor dentro de .ql-container
   (que o tema "snow" do Quill já deixa position:relative). */
function criarOverlayQuebraPaginaQuill(id, quill) {
  // quill.container É o próprio <div id="quill-mount-...">, com as
  // classes ql-container/ql-snow ACRESCENTADAS pelo Quill nele mesmo —
  // o Quill nunca cria um wrapper novo com .ql-container como filho
  // (esse era o bug: document.getElementById(...).querySelector('.ql-container')
  // nunca achava nada, porque .ql-container não é filho do mount, É o
  // mount; a busca sempre voltava null e a função desistia em silêncio,
  // sem erro nenhum aparecer no console). Usar a propriedade oficial do
  // Quill em vez de adivinhar a estrutura do DOM evita esse tipo de
  // suposição errada de novo.
  const container = quill.container;
  if (!container) return;

  const overlay = document.createElement('div');
  overlay.className = 'rel-quebra-pagina-overlay';
  container.appendChild(overlay);

  // __encerramento__ nunca tem .rel-h1 (ver montarConteudoRelatorioHtml);
  // os outros blocos de texto têm, mas só desenham a caixa de verdade
  // quando o título não está em branco (ver renderBlocoRelatorio) — por
  // isso "tem .rel-h1 agora" depende do CONTEÚDO atual do campo, não é
  // fixo por tipo de bloco, e precisa ser reavaliado a cada recálculo.
  const podeTerH1 = id !== '__encerramento__';
  const tituloInput = podeTerH1 ? document.querySelector(`[data-bloco-titulo="${id}"]`) : null;

  function recalcular() {
    if (!document.body.contains(container)) return; // bloco removido da tela nesse meio tempo
    const tituloTexto = tituloInput ? tituloInput.value : '';
    const temBlocoH1 = podeTerH1 && Boolean(tituloTexto.trim());
    const indices = calcularQuebrasDePaginaTexto(quill.root.innerHTML, tituloTexto, temBlocoH1);
    const containerRect = container.getBoundingClientRect();
    overlay.innerHTML = indices.map((idx, n) => {
      const filho = quill.root.children[idx];
      if (!filho) return '';
      const top = filho.getBoundingClientRect().top - containerRect.top;
      return `<div class="rel-quebra-pagina-linha" style="top: ${top}px;"><span>Página ${n + 2} começa aqui</span></div>`;
    }).join('');
  }

  let timeoutRecalculo = null;
  const agendarRecalculo = () => { clearTimeout(timeoutRecalculo); timeoutRecalculo = setTimeout(recalcular, 500); };

  quill.on('text-change', agendarRecalculo);
  if (tituloInput) tituloInput.addEventListener('input', agendarRecalculo);
  window.addEventListener('resize', agendarRecalculo);

  recalcular();
}

/* Barra de formatação do Quill "flutua" (fixa, logo abaixo da barra
   Editar/Prévia/Salvar) enquanto o astrólogo está digitando NESTE bloco
   — sem isso, num bloco de texto comprido, rolar até o meio do texto
   escondia a barra de formatação lá em cima, obrigando a rolar tudo de
   volta só pra negritar uma palavra.

   TENTATIVA ANTERIOR (revertida): só position:fixed, sem tirar a barra
   do lugar onde nasceu — parecia certa, mas o clique nela ia parar no
   texto por trás. Causa: #mandala-container (onde a tela do relatório
   inteira é montada) tem "position:relative; z-index:1" — isso cria um
   CONTEXTO DE EMPILHAMENTO. position:fixed escapa do FLUXO/rolagem de
   qualquer ancestral, mas NÃO escapa do empilhamento: um z-index alto
   (mesmo 999999) só vale DENTRO do contexto do ancestral mais próximo
   que criou um — se outro elemento da página, fora de
   #mandala-container, tiver um z-index maior que o de
   #mandala-container (bem comum: menu, sidebar, algum overlay), esse
   elemento pinta por cima da barra inteira, e o clique vai pra ele (ou
   pro que estiver visualmente por baixo dele), nunca pro botão da
   barra — sem erro nenhum, sem aviso, só "não clica".

   CORREÇÃO: enquanto flutua, a barra é MOVIDA DE VERDADE pra
   document.body (document.body.appendChild) — sai fisicamente de
   dentro de #mandala-container, então nenhum z-index/contexto de
   empilhamento dele (ou de qualquer ancestral) consegue mais prender
   ela atrás de nada. Ao perder o foco, volta pro lugar exato de onde
   saiu (logo antes do espaçador). NUNCA usa position:sticky — ver a
   nota no CLAUDE.md deste repositório sobre sticky não ser confiável
   nesse layout.

   Só a barra do bloco com FOCO flutua (Quill dispara 'selection-change'
   com range=null ao perder o foco, e com um range de verdade ao
   ganhar) — clicar nos próprios botões da barra não conta como perder
   o foco, o Quill já trata isso sozinho. */
function ativarBarraFlutuanteQuill(id, quill) {
  const toolbarModule = quill.getModule('toolbar');
  const toolbar = toolbarModule ? toolbarModule.container : null;
  if (!toolbar) return;
  const container = quill.container; // só pra medir a largura/posição horizontal certa

  const espacador = document.createElement('div');
  espacador.className = 'rel-quill-toolbar-espacador';
  toolbar.after(espacador);

  // Onde a barra nasceu de verdade — pra devolver EXATAMENTE ali (logo
  // antes do espaçador) quando ela parar de flutuar. Sem guardar isso,
  // depois de mover pra document.body não teria como saber voltar pro
  // lugar certo no meio da lista de blocos.
  const paiOriginal = toolbar.parentElement;

  function posicionar() {
    const tabsFixa = document.getElementById('relEditorTabsFixa');
    const topo = tabsFixa ? tabsFixa.getBoundingClientRect().bottom : 0;
    const rectContainer = container.getBoundingClientRect();
    toolbar.style.top = topo + 'px';
    toolbar.style.left = rectContainer.left + 'px';
    toolbar.style.width = rectContainer.width + 'px';
  }

  function flutuar() {
    if (toolbar.classList.contains('rel-quill-toolbar-flutuante')) { posicionar(); return; }
    espacador.style.height = toolbar.offsetHeight + 'px';
    espacador.style.display = 'block';
    document.body.appendChild(toolbar); // escapa de vez do empilhamento de #mandala-container
    toolbar.classList.add('rel-quill-toolbar-flutuante');
    posicionar();
    registrarBarraFlutuanteAtiva(toolbar, paiOriginal, espacador);
  }

  function pousar() {
    if (!toolbar.classList.contains('rel-quill-toolbar-flutuante')) return;
    toolbar.classList.remove('rel-quill-toolbar-flutuante');
    toolbar.style.top = '';
    toolbar.style.left = '';
    toolbar.style.width = '';
    espacador.style.display = 'none';
    paiOriginal.insertBefore(toolbar, espacador);
    desregistrarBarraFlutuanteAtiva(toolbar);
  }

  quill.on('selection-change', range => {
    if (range) { flutuar(); return; }
    // Perder a seleção (range=null) nem sempre quer dizer que o
    // astrólogo saiu do bloco de texto: clicar no ÍCONE de um seletor
    // da própria barra (Tipo de Texto, Cor) pra ABRIR o menu dele
    // TAMBÉM reporta seleção nula aqui — diferente dos botões simples
    // (negrito, itálico), que preservam a seleção sozinhos, os
    // "pickers" do Quill não. Sem essa checagem, a barra voltava pro
    // lugar de origem bem na hora de abrir o menu — some da tela e
    // ainda perde o texto selecionado, impossível de escolher "Título"
    // depois de selecionar algo. Só pousa de vez quando não tem NENHUM
    // menu desses aberto na barra.
    if (toolbar.querySelector('.ql-expanded')) return;
    pousar();
  });

  window.addEventListener('resize', () => {
    if (toolbar.classList.contains('rel-quill-toolbar-flutuante')) posicionar();
  });
}

/* Registro de toda barra do Quill atualmente flutuando (movida pra
   document.body, ver flutuar() acima) — existe só pra
   observadorDeTrocaDeModulo (logo abaixo) saber quais barras existem e
   limpar as que ficaram órfãs. */
window.relatorioBarrasFlutuantesAtivas = window.relatorioBarrasFlutuantesAtivas || [];
function registrarBarraFlutuanteAtiva(toolbar, paiOriginal, espacador) {
  window.relatorioBarrasFlutuantesAtivas.push({ toolbar, paiOriginal, espacador });
}
function desregistrarBarraFlutuanteAtiva(toolbar) {
  window.relatorioBarrasFlutuantesAtivas = window.relatorioBarrasFlutuantesAtivas.filter(item => item.toolbar !== toolbar);
}

/* BUG REAL: a barra flutuante escapa DE PROPÓSITO de #mandala-container
   (document.body.appendChild em flutuar(), acima) — pra nunca mais
   ficar presa atrás de nada por causa do z-index dele (ver o comentário
   bem maior em ativarBarraFlutuanteQuill). Só que, exatamente por
   morar fora dali, ela também escapa do "apagão": trocar de ferramenta
   (abrirModuloTecnica) substitui o conteúdo INTEIRO de
   #mandala-container de uma vez (container.innerHTML = ...), sem passar
   por nenhum evento de blur/seleção do Quill — o bloco de texto (e o
   "pai de origem" da barra) são destruídos, mas a barra em si, já fora
   dali, sobrevive: fica presa na tela pra sempre, "fantasma", porque
   nunca mais existe um clique fora que dispare pousar().

   Correção: um ÚNICO observador (nunca um por bloco — encolheria a
   lista de novo a cada Quill criado) vigia #mandala-container inteiro;
   toda vez que o conteúdo dele muda, confere cada barra registrada
   (registrarBarraFlutuanteAtiva) — se o "pai de origem" dela não está
   mais no documento (foi apagado numa troca de módulo), a barra é
   removida de vez da tela, em vez de tentar devolver ela pra um lugar
   que não existe mais. */
if (!window.relatorioObservadorTrocaModuloAtivo) {
  window.relatorioObservadorTrocaModuloAtivo = true;
  const observador = new MutationObserver(() => {
    window.relatorioBarrasFlutuantesAtivas = window.relatorioBarrasFlutuantesAtivas.filter(item => {
      if (document.body.contains(item.paiOriginal)) return true; // ainda tem pra onde voltar, mantém
      item.toolbar.remove();
      item.espacador.remove();
      return false;
    });
  });
  const iniciarObservador = () => {
    const alvo = document.getElementById('mandala-container');
    if (alvo) observador.observe(alvo, { childList: true, subtree: true });
  };
  if (document.getElementById('mandala-container')) iniciarObservador();
  else document.addEventListener('DOMContentLoaded', iniciarObservador);
}

/* Botão "imagem" da barra do Quill: em vez de pedir upload de arquivo,
   deixa escolher entre as capturas já feitas em alguma ferramenta (ex.:
   um lote específico marcado e enviado pela Calculadora de Lotes) e
   insere a escolhida ALI DENTRO do parágrafo, no lugar do cursor — pra
   quem citou um lote específico no meio do texto não precisar reservar
   uma página inteira só pra imagem dele (a página cheia continua
   existindo, via "Adicionar a este Relatório" > ferramenta, pra quando
   fizer sentido levar vários lotes juntos). Reaproveita inteiramente o
   mesmo pool de capturas (window.relatorioCapturas) já usado pelos
   blocos "ferramenta" — nenhuma captura nova, só uma segunda forma de
   usar a que já existe. */
function abrirSeletorImagemCapturaQuill(quill) {
  document.getElementById('relSeletorImagemOverlay')?.remove();

  const capturas = window.relatorioCapturas || {};
  const idsComCaptura = Object.keys(capturas).filter(id => capturasDaFerramenta(id).length);

  if (!idsComCaptura.length) {
    alert('Nenhuma captura disponível ainda. Abra a ferramenta desejada (ex.: Calculadora de Lotes), deixe pronta a tela que quer usar e clique em "Adicionar ao Relatório" — depois volte aqui pra inserir a imagem.');
    return;
  }

  const gruposHtml = idsComCaptura.map(toolId => {
    const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[toolId];
    const rotulo = (info && (info.tituloIndice || info.label)) || toolId;
    const itensHtml = capturasDaFerramenta(toolId).map((captura, idx) => `
      <div class="rel-seletor-imagem-item" data-url="${escapeHtml(captura.dataUrl)}" title="${escapeHtml(rotulo)} — imagem ${idx + 1}">
        <img src="${captura.dataUrl}" alt="">
      </div>
    `).join('');
    return `
      <div>
        <div class="rel-seletor-imagem-grupo-titulo">${escapeHtml(rotulo)}</div>
        <div class="rel-seletor-imagem-grid">${itensHtml}</div>
      </div>
    `;
  }).join('');

  const overlay = document.createElement('div');
  overlay.id = 'relSeletorImagemOverlay';
  overlay.innerHTML = `
    <div class="rel-seletor-imagem-box">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="modal-title">Inserir imagem de uma captura</span>
        <button type="button" class="botao-icone" id="relSeletorImagemFechar" title="Fechar">${menuIcone('fechar', 18)}</button>
      </div>
      <div class="rel-seletor-imagem-lista">${gruposHtml}</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const fechar = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });
  document.getElementById('relSeletorImagemFechar').addEventListener('click', fechar);

  overlay.querySelectorAll('.rel-seletor-imagem-item').forEach(item => {
    item.addEventListener('click', () => {
      const range = quill.getSelection(true) || { index: quill.getLength() };
      quill.insertEmbed(range.index, 'image', item.dataset.url, 'user');
      quill.setSelection(range.index + 1, 0, 'user');
      fechar();
      agendarAutoSalvarRelatorio();
    });
  });
}
window.abrirSeletorImagemCapturaQuill = abrirSeletorImagemCapturaQuill;

/* Registra, uma única vez por carregamento da página, o tamanho de fonte
   do Quill como atributo de ESTILO em vez de CLASSE — assim o HTML
   exportado (quill.root.innerHTML) já sai com "font-size" inline dentro
   do próprio texto, funcionando em qualquer lugar que a gente cole esse
   HTML (prévia, relatório final, captura pro PDF via html2canvas), sem
   precisar do CSS do Quill carregado ali. Sem isso, o tamanho escolhido
   só apareceria dentro do editor (que tem a classe .ql-editor), nunca no
   relatório de verdade — testado antes de confiar nisso (ver sessão de
   validação com Playwright). */
function configurarQuillUmaVez() {
  if (window.relatorioQuillConfigurado || typeof Quill !== 'function') return;
  const SizeStyle = Quill.import('attributors/style/size');
  SizeStyle.whitelist = ['12px', '18px', '26px'];
  Quill.register(SizeStyle, true);
  window.relatorioQuillConfigurado = true;
}

/* Remove a linha (texto personalizado, texto do catálogo ou ferramenta) e
   também o Quill dela, se tinha — sem isso o editor ficaria "vivo" em
   memória apontando pra um elemento que não existe mais no DOM.

   Quando o que saiu era um item do CATÁLOGO (não personalizado) e essa
   era a última linha dele na tela, ele volta a aparecer na lista
   "Adicionar" — assim um item incluído só pra testar (ou por engano)
   pode ser removido de verdade, sem precisar salvar/reabrir e sem ficar
   só desmarcado, ocupando espaço à toa. */
function removerBlocoEditor(iconEl, id) {
  const linha = iconEl.closest('.rel-editor-linha');
  if (!linha) return;
  const tipo = linha.dataset.blocoTipo;
  const ehCustom = linha.dataset.custom === '1';
  const idFerramenta = linha.dataset.ferramentaId;

  linha.remove();
  if (window.relatorioQuillInstancias) delete window.relatorioQuillInstancias[id];
  agendarAutoSalvarRelatorio();

  if (ehCustom) return; // bloco personalizado não pertence a nenhum catálogo pra voltar

  const idCatalogo = tipo === 'ferramenta' ? idFerramenta : id;
  const seletorRestantes = tipo === 'ferramenta'
    ? `#relEditorOrdenavel [data-ferramenta-id="${idCatalogo}"]`
    : `#relEditorOrdenavel [data-bloco-id="${idCatalogo}"]`;
  const aindaEmUso = document.querySelector(seletorRestantes);
  if (!aindaEmUso) restaurarItemNaListaAdicionar(idCatalogo);
}
window.removerBlocoEditor = removerBlocoEditor;

/* Devolve pra lista "Adicionar" um item do catálogo que acabou de sair da
   lista reordenável (ver removerBlocoEditor) — reaproveita o mesmo HTML
   de quando o editor é aberto do zero (relatorioItemCatalogoHtml), pra
   nunca ficar divergente do que apareceria numa reabertura normal. */
function restaurarItemNaListaAdicionar(id) {
  const lista = document.getElementById('relAdicionarLista');
  if (!lista || lista.querySelector(`[data-adicionar-id="${id}"]`)) return;
  const padrao = RELATORIO_CATALOGO_BLOCOS.find(b => b.id === id);
  if (!padrao) return;
  lista.insertAdjacentHTML('beforeend', relatorioItemCatalogoHtml(padrao));
  relatorioAtualizarVisibilidadeAdicionar();
}

/* Mostra/esconde a seção "Adicionar" inteira conforme ela tem ou não
   algum item pra oferecer — evita ficar com o título "Adicionar..." e a
   explicação em cima de uma lista vazia. */
function relatorioAtualizarVisibilidadeAdicionar() {
  const secao = document.getElementById('relAdicionarSecao');
  const lista = document.getElementById('relAdicionarLista');
  if (!secao || !lista) return;
  secao.style.display = lista.children.length ? '' : 'none';
}

/* HTML de UM item clicável da lista "Adicionar" — usado tanto na
   primeira renderização do editor quanto quando um item volta pra essa
   lista depois de removido (ver restaurarItemNaListaAdicionar). */
function relatorioItemCatalogoHtml(padrao) {
  const rotulo = padrao.type === 'ferramenta' ? (RELATORIO_FERRAMENTAS_DISPONIVEIS[padrao.id] || {}).label : padrao.titulo;
  return `
    <div class="re-item re-add" data-adicionar-id="${padrao.id}" onclick="adicionarItemCatalogoAoEditor('${padrao.id}', '${padrao.type}')">
      <span class="re-item-nome">+ ${escapeHtml(rotulo || padrao.id)}</span>
    </div>
  `;
}

/* Move a linha (que contém o botão clicado) uma posição pra cima (-1) ou
   pra baixo (1) dentro do container reordenável — troca de posição no DOM
   mesmo, sem nenhuma biblioteca de drag-and-drop. */
function moverBlocoEditor(btn, direcao) {
  const linha = btn.closest('.rel-editor-linha');
  if (!linha) return;
  const alvo = direcao < 0 ? linha.previousElementSibling : linha.nextElementSibling;
  if (!alvo || !alvo.classList.contains('rel-editor-linha')) return;
  if (direcao < 0) linha.parentElement.insertBefore(linha, alvo);
  else linha.parentElement.insertBefore(alvo, linha);
  agendarAutoSalvarRelatorio();
}
window.moverBlocoEditor = moverBlocoEditor;

/* Apaga de uma vez todas as imagens já acumuladas de uma ferramenta
   "capturada" (ex.: se o astrólogo clicou "Adicionar ao Relatório" por
   engano, ou quer recomeçar do zero pra esse cliente) — atualiza o
   badge da própria linha sem precisar recarregar o editor inteiro. */
async function limparCapturasEditor(toolId, iconEl) {
  const total = capturasDaFerramenta(toolId).length;
  const msg = total > 1
    ? `Apagar as ${total} imagens já adicionadas desta ferramenta?`
    : 'Apagar a imagem já adicionada desta ferramenta?';
  if (!await astroConfirm(msg)) return;
  limparCapturasRelatorio(toolId);
  const linha = iconEl.closest('.rel-editor-linha');
  const badge = linha && linha.querySelector('[data-badge-capturas]');
  if (badge) { badge.textContent = 'sem captura'; badge.style.color = 'var(--gold-dark)'; badge.style.background = 'var(--warning-bg)'; }
  iconEl.remove();
}
window.limparCapturasEditor = limparCapturasEditor;

/* Acha o próximo índice de captura ainda vazio pra uma ferramenta —
   nunca um que já tem imagem de verdade (mesmo que nenhuma linha na
   tela esteja usando ele) e nunca um que outra linha já esteja
   "reservando" (ex.: clicou em "+" duas vezes seguidas antes de tirar
   a próxima captura). É o maior entre: quantas capturas já existem de
   verdade pra essa ferramenta (capturasDaFerramenta) e um a mais que o
   maior índice já usado por alguma linha na tela agora. */
function relatorioProximoIndiceVazio(container, ferramentaId) {
  let maiorIndiceEmUso = -1;
  container.querySelectorAll(`[data-ferramenta-id="${ferramentaId}"]`).forEach(linha => {
    const idx = parseInt(linha.dataset.capturaIndex, 10) || 0;
    if (idx > maiorIndiceEmUso) maiorIndiceEmUso = idx;
  });
  return Math.max(capturasDaFerramenta(ferramentaId).length, maiorIndiceEmUso + 1);
}

/* Acrescenta mais uma linha da MESMA ferramenta capturada (Profecção,
   Isopsefia etc.) no fim da lista reordenável — pra usar em outra
   posição do relatório, com outro texto ao redor, mostrando OUTRA
   captura ainda vazia (nunca repete uma imagem que já está em uso por
   outra linha — ver relatorioProximoIndiceVazio) — pronta pra ele ir
   tirar a foto nova da ferramenta e ela cair direto aqui. */
function adicionarInstanciaFerramentaEditor(ferramentaId, rotulo) {
  const container = document.getElementById('relEditorOrdenavel');
  if (!container) return;
  const proximoIndice = relatorioProximoIndiceVazio(container, ferramentaId);
  const novoId = ferramentaId + '__' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  container.insertAdjacentHTML('beforeend', relatorioLinhaEditorHtml({
    id: novoId, tipo: 'ferramenta', rotulo, ferramentaId, capturaIndex: proximoIndice
  }));
  agendarAutoSalvarRelatorio();
}
window.adicionarInstanciaFerramentaEditor = adicionarInstanciaFerramentaEditor;

/* Acrescenta ao vivo, no fim da lista reordenável, um item do catálogo
   (a seção "Adicionar" mais embaixo) — sem precisar salvar e reabrir o
   editor pra ele aparecer: clicou, já entra pronto pra editar e mover
   com as setas.

   Ferramentas "capturadas" (Profecção, Circumambulação etc.) aceitam
   mais de uma linha no mesmo relatório — clicar de novo nelas, mesmo já
   em uso, funciona igual ao "+" que já existe em cada linha (mostra a
   PRÓXIMA captura vazia, nunca repete uma que já está em uso) — por
   isso elas NUNCA somem da lista "Adicionar" (ver o filtro em
   linhasParaAdicionar). As demais (texto, ou as mandalas calculadas na
   hora) só entram uma vez: aí sim o item some da lista depois de usado. */
function adicionarItemCatalogoAoEditor(id, tipo) {
  const container = document.getElementById('relEditorOrdenavel');
  if (!container) return;

  const padrao = RELATORIO_CATALOGO_BLOCOS.find(b => b.id === id);
  if (!padrao) return;

  if (tipo === 'ferramenta') {
    const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[id];
    const rotulo = info ? info.label : id;
    const jaEmUso = !!container.querySelector(`[data-ferramenta-id="${id}"]`);
    if (info && info.capturada && jaEmUso) {
      adicionarInstanciaFerramentaEditor(id, rotulo); // mesma lógica do "+" de cada linha — não mexe na lista "Adicionar"
      return;
    }
    container.insertAdjacentHTML('beforeend', relatorioLinhaEditorHtml({ id, tipo: 'ferramenta', rotulo }));
  } else {
    container.insertAdjacentHTML('beforeend', relatorioLinhaEditorHtml({ id, tipo: 'texto', custom: false, rotulo: padrao.titulo, titulo: padrao.titulo, corpo: padrao.corpo }));
    inicializarQuillsPendentes();
  }

  const itemCatalogo = document.querySelector(`[data-adicionar-id="${id}"]`);
  if (itemCatalogo) itemCatalogo.remove();
  relatorioAtualizarVisibilidadeAdicionar();
  agendarAutoSalvarRelatorio();
}
window.adicionarItemCatalogoAoEditor = adicionarItemCatalogoAoEditor;

/* Acrescenta um bloco de texto personalizado em branco no fim da lista
   reordenável — dá pra mover ele com as setas assim que for criado. Vazio
   ainda não entra em nenhum salvamento (ver lerBlocosDoEditor), só
   depois que o astrólogo escrever algo nele. */
function adicionarBlocoCustomizadoEditor() {
  const container = document.getElementById('relEditorOrdenavel');
  if (!container) return;
  const novoId = 'custom-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  container.insertAdjacentHTML('beforeend', relatorioLinhaEditorHtml({ id: novoId, tipo: 'texto', custom: true, titulo: '', corpo: '' }));
  inicializarQuillsPendentes();
}
window.adicionarBlocoCustomizadoEditor = adicionarBlocoCustomizadoEditor;

/* ==========================================
   BIBLIOTECA DE BLOCOS ("Meus blocos")
   Blocos de texto que o astrólogo guarda pra reusar em qualquer relatório
   ou modelo — tabela relatorio_blocos_salvos no Supabase (id, user_id,
   titulo, corpo, formato), então vale em qualquer aparelho. Usar um bloco
   num relatório põe uma CÓPIA independente (o bloco continua na biblioteca;
   editar/apagar aqui nunca mexe em relatório já feito).
   ========================================== */
window.relatorioBiblioteca = window.relatorioBiblioteca || [];

async function relatorioBibliotecaUserId(client) {
  const { data: { user } } = await client.auth.getUser();
  return user ? user.id : null;
}

async function carregarBibliotecaRelatorio() {
  const client = relatorioSupabaseClient();
  if (!client) return window.relatorioBiblioteca;
  try {
    const userId = await relatorioBibliotecaUserId(client);
    if (!userId) return window.relatorioBiblioteca;
    const { data, error } = await client.from('relatorio_blocos_salvos').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (!error && data) window.relatorioBiblioteca = data;
    else if (error) console.error('Erro ao carregar a biblioteca de blocos:', error);
  } catch (e) {
    console.error('Erro ao carregar a biblioteca de blocos:', e);
  }
  return window.relatorioBiblioteca;
}

function renderizarBibliotecaNoEditor() {
  const lista = document.getElementById('relBibliotecaLista');
  if (!lista) return;
  const itens = window.relatorioBiblioteca || [];
  if (!itens.length) {
    lista.innerHTML = `<div class="menu-vazio" style="text-align: left; padding: 8px 0;">Nenhum bloco guardado ainda. Escreva um bloco de texto e toque no marcador <span class="re-inline-icone">${menuIcone('marcador', 14)}</span> dele pra guardar aqui.</div>`;
    return;
  }
  lista.innerHTML = itens.map(item => `
    <div class="re-item re-add">
      <span class="re-item-nome" onclick="adicionarItemBibliotecaAoEditor('${item.id}')" style="flex: 1;">+ ${escapeHtml(item.titulo || 'Sem título')}</span>
      <div class="re-item-acoes">
        <button type="button" class="botao-icone" style="color: var(--cinza);" title="Editar este bloco guardado" onclick="editarItemDaBiblioteca('${item.id}')">${menuIcone('editar', 18)}</button>
        <button type="button" class="botao-icone botao-apagar" title="Apagar da biblioteca (não mexe em relatórios já feitos)" onclick="apagarItemDaBiblioteca('${item.id}')">${menuIcone('lixeira', 18)}</button>
      </div>
    </div>
  `).join('');
}

function relatorioAvisoCurto(texto, duracaoMs) {
  const aviso = document.createElement('div');
  aviso.className = 'menu-flutuante re-aviso-curto';
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), duracaoMs || 2200);
}

/* Coloca uma CÓPIA do bloco guardado no fim do relatório. */
function adicionarItemBibliotecaAoEditor(idItem) {
  const container = document.getElementById('relEditorOrdenavel');
  const item = (window.relatorioBiblioteca || []).find(b => b.id === idItem);
  if (!container || !item) return;
  const novoId = 'custom-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  container.insertAdjacentHTML('beforeend', relatorioLinhaEditorHtml({
    id: novoId, tipo: 'texto', custom: true, titulo: item.titulo, corpo: item.corpo, formato: item.formato || 'rich', bibliotecaId: item.id
  }));
  inicializarQuillsPendentes();
  agendarAutoSalvarRelatorio();
  relatorioAvisoCurto('Bloco colocado no fim do relatório');
}
window.adicionarItemBibliotecaAoEditor = adicionarItemBibliotecaAoEditor;

/* Guarda na biblioteca o título + texto que estão agora num bloco do
   relatório. Se o bloco veio da biblioteca, pergunta se atualiza aquele
   item ou guarda como um novo. */
async function salvarBlocoNaBiblioteca(idLinha) {
  const linha = document.querySelector(`#relEditorOrdenavel .rel-editor-linha[data-bloco-id="${idLinha}"]`);
  const client = relatorioSupabaseClient();
  if (!linha || !client) return;
  const tituloInput = linha.querySelector(`[data-bloco-titulo="${idLinha}"]`);
  const titulo = (tituloInput && tituloInput.value.trim()) || '';
  const quill = (window.relatorioQuillInstancias || {})[idLinha];
  const corpo = quill ? quill.root.innerHTML : '';
  if (!titulo && (!quill || !quill.getText().trim())) { alert('Escreva um título ou um texto no bloco antes de guardar.'); return; }

  try {
    const userId = await relatorioBibliotecaUserId(client);
    if (!userId) { alert('Sessão expirada. Entre de novo.'); return; }
    const origemId = linha.dataset.bibliotecaId;
    const origem = origemId && (window.relatorioBiblioteca || []).find(b => b.id === origemId);
    if (origem && await astroConfirm(`Este bloco veio de "${origem.titulo || 'Sem título'}". OK = atualizar o bloco guardado. Cancelar = guardar como um novo.`)) {
      const { error } = await client.from('relatorio_blocos_salvos').update({ titulo, corpo, formato: 'rich' }).eq('id', origem.id).eq('user_id', userId);
      if (error) throw error;
      origem.titulo = titulo; origem.corpo = corpo; origem.formato = 'rich';
    } else {
      const { data, error } = await client.from('relatorio_blocos_salvos').insert({ user_id: userId, titulo, corpo, formato: 'rich' }).select().maybeSingle();
      if (error) throw error;
      if (data) { window.relatorioBiblioteca.push(data); linha.dataset.bibliotecaId = data.id; }
    }
    renderizarBibliotecaNoEditor();
    relatorioAvisoCurto('Guardado em "Meus blocos"');
  } catch (e) {
    console.error('Erro ao guardar o bloco na biblioteca:', e);
    alert('Não foi possível guardar o bloco na biblioteca.');
  }
}
window.salvarBlocoNaBiblioteca = salvarBlocoNaBiblioteca;

async function apagarItemDaBiblioteca(idItem) {
  const item = (window.relatorioBiblioteca || []).find(b => b.id === idItem);
  const client = relatorioSupabaseClient();
  if (!item || !client) return;
  if (!await astroConfirm(`Apagar "${item.titulo || 'Sem título'}" da biblioteca? Relatórios que já usam esse texto não mudam.`)) return;
  try {
    const userId = await relatorioBibliotecaUserId(client);
    const { error } = await client.from('relatorio_blocos_salvos').delete().eq('id', idItem).eq('user_id', userId);
    if (error) throw error;
    window.relatorioBiblioteca = window.relatorioBiblioteca.filter(b => b.id !== idItem);
    renderizarBibliotecaNoEditor();
  } catch (e) {
    console.error('Erro ao apagar o bloco da biblioteca:', e);
    alert('Não foi possível apagar o bloco da biblioteca.');
  }
}
window.apagarItemDaBiblioteca = apagarItemDaBiblioteca;

/* Edita um bloco guardado (título + texto, no mesmo editor dos blocos). */
function editarItemDaBiblioteca(idItem) {
  const item = (window.relatorioBiblioteca || []).find(b => b.id === idItem);
  if (!item) return;
  document.getElementById('relBibliotecaEditorOverlay')?.remove();
  const idQuill = 'biblioteca-edicao';
  window.relatorioQuillPendentes = window.relatorioQuillPendentes || {};
  window.relatorioQuillPendentes[idQuill] = { corpo: item.corpo || '', formato: item.formato || 'rich' };

  const overlay = document.createElement('div');
  overlay.id = 'relBibliotecaEditorOverlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: flex-start; justify-content: center; z-index: 1900; padding: 20px; overflow-y: auto;';
  overlay.innerHTML = `
    <div style="background: var(--bg-card); width: 100%; max-width: 720px; border-radius: 8px; padding: 20px; margin-top: 60px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; margin-bottom: 12px;">Editar bloco guardado</div>
      <input type="text" id="relBibliotecaEdicaoTitulo" class="modal-input" value="${escapeHtml(item.titulo || '')}" placeholder="Título do bloco" style="margin-bottom: 8px; font-size: 13px;">
      <div id="quill-mount-${idQuill}" class="rel-quill-mount"></div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px;">
        <button type="button" id="relBibliotecaEdicaoCancelar" class="btn-secondary">Cancelar</button>
        <button type="button" id="relBibliotecaEdicaoSalvar" class="btn-primary">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  inicializarQuillsPendentes();

  const fechar = () => {
    overlay.remove();
    if (window.relatorioQuillInstancias) delete window.relatorioQuillInstancias[idQuill];
    if (window.relatorioQuillPendentes) delete window.relatorioQuillPendentes[idQuill];
  };
  document.getElementById('relBibliotecaEdicaoCancelar').onclick = fechar;
  document.getElementById('relBibliotecaEdicaoSalvar').onclick = async () => {
    const client = relatorioSupabaseClient();
    const titulo = document.getElementById('relBibliotecaEdicaoTitulo').value.trim();
    const quill = (window.relatorioQuillInstancias || {})[idQuill];
    const corpo = quill ? quill.root.innerHTML : item.corpo;
    try {
      const userId = await relatorioBibliotecaUserId(client);
      const { error } = await client.from('relatorio_blocos_salvos').update({ titulo, corpo, formato: 'rich' }).eq('id', item.id).eq('user_id', userId);
      if (error) throw error;
      item.titulo = titulo; item.corpo = corpo; item.formato = 'rich';
      renderizarBibliotecaNoEditor();
      fechar();
    } catch (e) {
      console.error('Erro ao salvar o bloco da biblioteca:', e);
      alert('Não foi possível salvar as mudanças do bloco.');
    }
  };
}
window.editarItemDaBiblioteca = editarItemDaBiblioteca;

/* CSS só da TELA de edição do modelo (abas Editar/Prévia, moldura do
   Quill, aviso da prévia) — injetado uma única vez, separado do CSS do
   relatório em si (injetarEstilosRelatorio), que é usado tanto aqui
   (dentro da aba Prévia) quanto na geração final. */
function injetarEstilosEditorRelatorio() {
  if (document.getElementById('relatorio-editor-estilos')) return;
  const style = document.createElement('style');
  style.id = 'relatorio-editor-estilos';
  style.textContent = `
      /* .rel-quill-mount (barra de ferramentas + área de texto do Quill) e
         .rel-seletor-imagem-item (miniatura de captura) ficam de propósito
         sempre claros, mesmo no Tema Escuro: são o "papel" do relatório —
         o texto ali dentro é exatamente o que vira PDF/imagem pro cliente
         (ver injetarEstilosRelatorio/montarConteudoRelatorioHtml, sempre
         brancos), então não fazem sentido escurecer só na tela de edição. */
      /* Rótulos em português do seletor "Tipo de Texto" (ver o grupo
         [{header:[2,3,false]}] na barra do Quill, inicializarQuillsPendentes)
         — o Quill só sabe rotular em inglês ("Heading 2"/"Normal") sozinho;
         a troca de texto é feita via ::before, técnica padrão dele (o
         <span> real fica vazio, só o CSS desenha o texto). */
      .rel-quill-mount .ql-picker.ql-header .ql-picker-label::before,
      .rel-quill-mount .ql-picker.ql-header .ql-picker-item::before { content: 'Normal'; }
      .rel-quill-mount .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
      .rel-quill-mount .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: 'Título'; }
      .rel-quill-mount .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
      .rel-quill-mount .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: 'Subtítulo'; }
      .rel-quill-mount .ql-picker.ql-header { width: 110px; }

      .rel-quill-mount .ql-toolbar.ql-snow { border-radius: 0; background: #fffdf5; }
      .rel-quill-mount .ql-container.ql-snow { border-radius: 0; font-family: 'Montserrat', sans-serif; }
      .rel-quill-mount .ql-editor { min-height: 180px; font-size: 12.5px; line-height: 1.6; }
      .rel-quill-mount .ql-editor img { max-width: 100%; height: auto; }

      /* Linha de "aqui quebra a página" sobreposta ao Quill (ver
         criarOverlayQuebraPaginaQuill) — nunca é conteúdo de verdade
         (fica por CIMA do texto, pointer-events:none, num container à
         parte de quill.root), só um guia visual calculado contra o
         medidor oculto (calcularQuebrasDePaginaTexto), que usa a fonte/
         largura da folha de VERDADE (.rel-page/.rel-h1/.rel-corpo), bem
         diferente da fonte da própria caixa do Quill (line-height 1.6
         aqui vs. 1.85 no relatório final) — por isso nunca dá pra medir
         direto na caixa visível, só usar o índice do parágrafo que essa
         medição encontrar. */
      .rel-quebra-pagina-overlay { position: absolute; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; z-index: 5; }
      .rel-quebra-pagina-linha { position: absolute; left: 8px; right: 8px; border-top: 2px dashed #c59b27; }
      .rel-quebra-pagina-linha span { position: absolute; top: -9px; right: 0; background: #fffdf5; border: 1px solid #c59b27; border-radius: 4px; padding: 1px 6px; font-size: 9.5px; font-weight: 700; color: #9a6d18; white-space: nowrap; }

      /* Barra do Quill flutuante (ver ativarBarraFlutuanteQuill) — enquanto
         flutua, ela é MOVIDA pra document.body (não só position:fixed),
         pra escapar do contexto de empilhamento de #mandala-container
         (z-index próprio) — por isso o seletor aqui não precisa (e não
         pode) depender de nenhum ancestral: quando a classe está
         presente, o elemento já não mora mais dentro de nenhum deles.
         .rel-quill-toolbar-espacador reserva, no lugar de origem, o
         espaço que ela deixa vazio ao sair do fluxo. */
      .rel-quill-toolbar-espacador { display: none; }
      .ql-toolbar.rel-quill-toolbar-flutuante { position: fixed; z-index: 999999; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

  `;
  document.head.appendChild(style);
}

/* Mede a altura de VERDADE de cada barra fixa do módulo de Relatório
   (a do editor — Editar/Prévia/Salvar — e a do relatório final — Voltar/
   Editar/Baixar PDF) e aplica essa altura no espaçador logo abaixo de
   cada uma — como as duas são position:fixed (fora do fluxo normal da
   página, ver o comentário em ".rel-editor-tabs"/".rel-toolbar"), sem
   esse espaçador o conteúdo seguinte ficaria escondido atrás delas.
   Medida em JS, não um valor fixo no CSS, porque a altura muda com o
   tamanho da tela (ex.: quebra pra duas linhas em aparelhos bem
   estreitos). Só uma das duas existe por vez (telas diferentes), então
   é seguro chamar sempre pelas duas — a que não existe agora é ignorada.

   Também empurra as duas pra baixo do #top-bar (agora fixo também fora
   do modo Mandala — ver body.topbar-fixo no index.html), com 10px de
   respiro, pra nunca cobrir os ícones das ferramentas. */
function ajustarEspacadoresBarraFixaRelatorio() {
  const topBar = document.getElementById('top-bar');
  const offsetTopoBarra = topBar ? Math.max(0, topBar.getBoundingClientRect().bottom) + 10 : 0;

  [['relEditorTabsFixa', 'relEditorEspacadorBarra'], ['relToolbarFixa', 'relToolbarEspacador']].forEach(([idBarra, idEspacador]) => {
    const barra = document.getElementById(idBarra);
    const espacador = document.getElementById(idEspacador);
    if (!barra || !espacador) return;
    barra.style.top = offsetTopoBarra + 'px';
    espacador.style.height = barra.offsetHeight + 'px';
  });
}
window.ajustarEspacadoresBarraFixaRelatorio = ajustarEspacadoresBarraFixaRelatorio;

if (!window.relatorioResizeBarraHandlerAdicionado) {
  window.relatorioResizeBarraHandlerAdicionado = true;
  window.addEventListener('resize', ajustarEspacadoresBarraFixaRelatorio);
}

/* Guarda continuamente até onde a Prévia do editor foi rolada — só
   enquanto ela está de fato visível na tela (senão ficaria registrando
   também a rolagem de qualquer outra tela do site). Restaurado ao
   reabrir a Prévia (ver o requestAnimationFrame logo depois de
   "painelPrevia.innerHTML = opcoes.previaProntaHtml", mais acima). */
if (!window.relatorioScrollPreviaHandlerAdicionado) {
  window.relatorioScrollPreviaHandlerAdicionado = true;
  window.addEventListener('scroll', () => {
    const painelPrevia = document.getElementById('relEditorPreviaPane');
    if (painelPrevia && painelPrevia.style.display !== 'none') {
      window.relatorioPreviaScrollY = window.scrollY;
    }
  }, { passive: true });
}

/* Editor de MODELO (genérico, compartilhado por todos os clientes) —
   grava em relatorio_presets. Usado pela lista "Modelos de Relatório". */
function abrirEditorPresetRelatorio(idx, opcoes) {
  const preset = (window.relatorioPresetsCarregados || [])[idx];
  if (!preset) return;
  if (!opcoes || (!opcoes.blocosOverride && !opcoes.retomando)) {
    window.relatorioPreviaScrollY = 0; // abertura nova de verdade — não reconstrução nem retomada
    window.relatorioAbaEditorAtiva = 'editar';
  }
  window.relatorioEditorAlvoAtual = { tipo: 'preset', idx };
  renderizarTelaEditorRelatorio(preset, opcoes, {
    tituloTela: 'Editar Modelo',
    labelNome: 'Nome do Modelo',
    labelAdicionar: 'Adicionar ao Modelo',
    rotuloSalvar: 'Salvar Modelo',
    aoVoltarJs: 'iniciarModuloRelatorio()',
    avisoAutosave: '' // modelo genérico: sem autosave, de propósito — precisa do clique em "Salvar Modelo"
  });
}
window.abrirEditorPresetRelatorio = abrirEditorPresetRelatorio;

/* Editor do RELATÓRIO DE UM CLIENTE ESPECÍFICO (um rascunho) — grava em
   relatorio_rascunhos, nunca em relatorio_presets: editar aqui nunca
   muda o modelo genérico nem o relatório de nenhum outro cliente. Busca
   o rascunho completo (com blocos) só na primeira vez; a reconstrução
   pós-prévia reaproveita o que já foi buscado (ver window.
   relatorioRascunhoEmEdicao, preenchido também por abrirRascunhoRelatorio). */
async function abrirEditorRascunhoRelatorio(rascunhoId, opcoes) {
  opcoes = opcoes || {};
  let rascunho = window.relatorioRascunhoEmEdicao;
  if (!rascunho || rascunho.id !== rascunhoId) {
    const container = document.getElementById('mandala-container');
    if (container) container.innerHTML = `<div class="menu-vazio" style="padding: 60px;">Abrindo o relatório...</div>`;
    rascunho = await carregarRascunhoPorId(rascunhoId);
    if (!rascunho) { alert('Não foi possível carregar este relatório.'); iniciarModuloRelatorio(); return; }
    window.relatorioRascunhoEmEdicao = rascunho;
  }

  window.relatorioEditorAlvoAtual = { tipo: 'rascunho', id: rascunhoId };
  if (!opcoes.blocosOverride && !opcoes.retomando) {
    window.relatorioPreviaScrollY = 0; // abertura nova de verdade — não reconstrução nem retomada
    window.relatorioAbaEditorAtiva = 'editar';
  }
  const objetoEditavel = { nome: rascunho.titulo || rascunho.nome, blocos: rascunho.blocos || [] };
  renderizarTelaEditorRelatorio(objetoEditavel, opcoes, {
    tituloTela: `Editar Relatório de ${rascunho.nome}`,
    labelNome: 'Título deste Relatório',
    labelAdicionar: 'Adicionar a este Relatório',
    rotuloSalvar: 'Salvar Agora',
    aoVoltarJs: `voltarDoEditorRascunho('${rascunhoId}')`,
    avisoAutosave: menuIcone('checkCirculo', 16) + ' Suas alterações são salvas automaticamente — o botão "Salvar Agora" é só pra forçar na hora, se quiser.'
  });
}
window.abrirEditorRascunhoRelatorio = abrirEditorRascunhoRelatorio;

/* Botão "Voltar" do editor de um rascunho — antes de sair de fato, força
   qualquer autosave ainda pendente (debounce) a gravar AGORA, senão as
   últimas mudanças (dentro da janela curta do debounce) se perderiam ao
   trocar de tela. */
async function voltarDoEditorRascunho(rascunhoId) {
  if (relatorioAutoSalvarTimeout) {
    clearTimeout(relatorioAutoSalvarTimeout);
    relatorioAutoSalvarTimeout = null;
    await autoSalvarRascunhoAtual();
  }
  abrirRascunhoRelatorio(rascunhoId);
}
window.voltarDoEditorRascunho = voltarDoEditorRascunho;

/* Reabre o editor no alvo (preset ou rascunho) que está em edição agora
   — usada pela reconstrução pós-prévia e por qualquer outro fluxo que
   precise voltar pro editor sem saber, de antemão, qual dos dois tipos
   está aberto. */
function reabrirEditorRelatorioAtual(opcoes) {
  const alvo = window.relatorioEditorAlvoAtual;
  if (!alvo) return;
  if (alvo.tipo === 'preset') abrirEditorPresetRelatorio(alvo.idx, opcoes);
  else abrirEditorRascunhoRelatorio(alvo.id, opcoes);
}

/* "opcoes" (opcional) é usada SÓ pela reconstrução pós-prévia (ver
   atualizarPreviaEditorModelo): reabre a tela do editor não a partir do
   que estava salvo, mas com o que estava em edição na hora — texto,
   ordenação, nome, capa — pra nada que o astrólogo digitou se perder.
   Precisa disso porque desenhar a mandala pra "fotografar" o PNG da
   prévia usa #mandala-container como área de trabalho (ver
   renderizarMandalasDoPreset/renderMandala em mandala.js), o mesmo
   container onde a tela inteira do editor está montada — ou seja, gerar
   a prévia apaga a tela por baixo dos panos, e só dá pra devolver a
   experiência de "não saiu da tela" reconstruindo tudo de novo depois.

   "objetoEditavel" é sempre {nome, blocos} — tanto faz se veio de um
   preset ou do rascunho de um cliente; quem sabe onde salvar de volta é
   só salvarEdicaoRelatorioAtual, olhando window.relatorioEditorAlvoAtual. */
function renderizarTelaEditorRelatorio(objetoEditavel, opcoes, config) {
  opcoes = opcoes || {};

  const container = document.getElementById('mandala-container');
  if (!container) return;

  const catalogoPorId = {};
  RELATORIO_CATALOGO_BLOCOS.forEach(b => { catalogoPorId[b.id] = b; });

  const blocosAtuais = opcoes.blocosOverride || objetoEditavel.blocos || [];
  const nomeAtual = opcoes.nomeOverride != null ? opcoes.nomeOverride : objetoEditavel.nome;
  const capaFonteAtual = opcoes.capaFonteOverride || obterCapaFonte(objetoEditavel.blocos);
  const blocoCapaAtual = (objetoEditavel.blocos || []).find(b => b.type === 'capa') || {};
  const paletaCapaAtual = opcoes.paletaCapaOverride || obterPaletaCapaId(objetoEditavel.blocos);
  const corFundoCapaAtual = opcoes.corFundoCapaOverride || blocoCapaAtual.corFundo;
  const corTituloCapaAtual = opcoes.corTituloCapaOverride || blocoCapaAtual.corTitulo;
  const corCabecalhoCapaAtual = opcoes.corCabecalhoCapaOverride || blocoCapaAtual.corCabecalho;
  const corBordaCapaAtual = opcoes.corBordaCapaOverride || blocoCapaAtual.corBorda;
  const temBordaCapaAtual = opcoes.temBordaCapaOverride != null ? opcoes.temBordaCapaOverride : (blocoCapaAtual.temBorda === true);
  const capaPapiroAtual = opcoes.capaPapiroOverride != null ? opcoes.capaPapiroOverride : (blocoCapaAtual.capaPapiro === true);
  const corCirculoCapaAtual = opcoes.corCirculoCapaOverride || blocoCapaAtual.corCirculo;
  const temCirculoCapaAtual = opcoes.temCirculoCapaOverride != null ? opcoes.temCirculoCapaOverride : (blocoCapaAtual.temCirculo === true);
  const tamanhoTituloCapaAtual = opcoes.tamanhoTituloCapaOverride || blocoCapaAtual.tamanhoTitulo;
  const encerramentoAtual = opcoes.encerramentoOverride != null ? opcoes.encerramentoOverride : obterEncerramento(objetoEditavel.blocos);
  const mapaBlocosAtuais = {};
  blocosAtuais.forEach(b => { mapaBlocosAtuais[b.id] = b; });

  // Linhas na ordem JÁ SALVA (do modelo ou do relatório do cliente,
  // tanto faz) — catálogo e personalizados misturados, exatamente como
  // o astrólogo deixou da última vez. "__capa__" e "__encerramento__"
  // têm campo próprio, fixo (relatorioCapaSeletorHtml/relatorioEncerramentoHtml),
  // não entram nessa lista reordenável.
  const linhasOrdenadas = blocosAtuais.filter(bloco => bloco.type !== 'capa' && bloco.type !== 'encerramento').map(bloco => {
    if (bloco.type === 'ferramenta') {
      const idFerramenta = bloco.ferramentaId || bloco.id;
      const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[idFerramenta];
      return relatorioLinhaEditorHtml({
        id: bloco.id, tipo: 'ferramenta', rotulo: info ? info.label : idFerramenta,
        ferramentaId: bloco.ferramentaId, capturaIndex: bloco.capturaIndex, rotuloIndice: bloco.rotuloIndice
      });
    }
    const padrao = catalogoPorId[bloco.id];
    const custom = !padrao;
    return relatorioLinhaEditorHtml({
      id: bloco.id, tipo: 'texto', custom,
      rotulo: custom ? '' : padrao.titulo,
      titulo: bloco.titulo, corpo: bloco.corpo, formato: bloco.formato
    });
  }).join('');

  // Itens do catálogo — clicar já acrescenta a linha de verdade no fim da
  // lista de cima (ver adicionarItemCatalogoAoEditor), pronta pra editar e
  // mover com as setas, sem precisar salvar e reabrir pra ela aparecer.
  // Ferramentas "capturadas" (Profecção, Circumambulação etc.) aceitam
  // mais de uma linha no relatório, então continuam aqui mesmo depois de
  // já usadas — as demais (texto, mandalas calculadas na hora) somem
  // depois de usadas, porque só entram uma vez.
  const linhasParaAdicionar = RELATORIO_CATALOGO_BLOCOS
    .filter(padrao => {
      if (padrao.type === 'capa' || padrao.type === 'encerramento') return false;
      const info = padrao.type === 'ferramenta' ? RELATORIO_FERRAMENTAS_DISPONIVEIS[padrao.id] : null;
      const repetivel = info && info.capturada;
      return repetivel || !mapaBlocosAtuais[padrao.id];
    })
    .map(relatorioItemCatalogoHtml)
    .join('');

  injetarEstilosEditorRelatorio();

  container.innerHTML = `
    <div class="rel-editor-tela painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">

      <div class="rel-editor-tabs" id="relEditorTabsFixa">
        <button type="button" class="botao-icone rel-editor-btn-voltar-fixo" onclick="${config.aoVoltarJs}" title="Voltar">${menuIcone('voltar', 22)}</button>
        <div class="rel-editor-tabs-conteudo">
          <div class="rel-editor-tabs-grupo">
            <button type="button" id="relAbaEditarBtn" class="folder-tab-btn rel-editor-tab ativa" onclick="mudarAbaEditorModelo('editar')">Editar</button>
            <button type="button" id="relAbaPreviaBtn" class="folder-tab-btn rel-editor-tab" onclick="mudarAbaEditorModelo('previa')">${menuIcone('olho', 16)} Prévia</button>
          </div>
          <button type="button" class="botao-texto rel-editor-btn-salvar" onclick="salvarEdicaoRelatorioAtual()">${menuIcone('salvar', 16)} ${escapeHtml(config.rotuloSalvar)}</button>
        </div>
      </div>
      <!-- Como a barra acima é position:fixed (fora do fluxo normal), este
           espaçador reserva o mesmo espaço que ela ocupa, senão o início do
           formulário/prévia ficaria escondido atrás dela. Altura real
           medida e aplicada logo abaixo, em JS (ajustarEspacadorBarraFixaEditor). -->
      <div id="relEditorEspacadorBarra"></div>

      <div class="cabeca-ferramenta">
        <h3 class="titulo-ferramenta">${escapeHtml(config.tituloTela)}</h3>
      </div>

      <div id="relEditorFormPane">
        <div class="re-coluna">
          <div class="re-bloco">
            <label class="rotulo re-rotulo">${escapeHtml(config.labelNome)}</label>
            <input type="text" id="relEditorNome" class="modal-input" value="${escapeHtml(nomeAtual)}">
            ${config.avisoAutosave ? `<div class="re-nota">${config.avisoAutosave}</div>` : ''}
          </div>

          <hr class="divisa">

          ${relatorioCapaSeletorHtml(capaFonteAtual)}
          ${relatorioPaletaCapaHtml(paletaCapaAtual, corFundoCapaAtual, corTituloCapaAtual, corCabecalhoCapaAtual, corBordaCapaAtual, temBordaCapaAtual, corCirculoCapaAtual, temCirculoCapaAtual, tamanhoTituloCapaAtual)}
          ${relatorioCapaPapiroHtml(capaPapiroAtual)}

          <div class="re-bloco">
            <div class="titulo-secao">Ordem do relatório</div>
            <div class="re-ajuda">
              Use as setas pra reordenar — dá pra intercalar textos, mandalas e capturas de ferramenta do jeito que quiser — e desmarque pra tirar um bloco sem perder o texto dele. A qualquer momento, clique em "Prévia" ali em cima pra ver como está ficando.
            </div>
            <div id="relEditorOrdenavel">${linhasOrdenadas}</div>
          </div>

          <hr class="divisa">

          <div id="relAdicionarSecao" class="re-bloco" style="${linhasParaAdicionar ? '' : 'display: none;'}">
            <div class="titulo-secao">${escapeHtml(config.labelAdicionar)}</div>
            <div class="re-ajuda">
              Clique pra incluir — entra na hora no fim da lista de cima, já pronto pra editar, aí é só usar as setas pra colocar no lugar certo.
            </div>
            <div id="relAdicionarLista">${linhasParaAdicionar}</div>
            <hr class="divisa">
          </div>

          <div id="relBibliotecaSecao" class="re-bloco">
            <div class="titulo-secao">Meus blocos</div>
            <div class="re-ajuda">
              Blocos de texto que você guardou (pelo marcador em cada bloco de texto). Clique pra colocar uma cópia no relatório; eles continuam aqui pra usar em outros.
            </div>
            <div id="relBibliotecaLista"><div class="menu-vazio" style="text-align: left; padding: 8px 0;">Carregando...</div></div>
          </div>

          <hr class="divisa">

          <div class="re-bloco">
            <div class="re-bloco-topo">
              <div class="titulo-secao" style="margin: 0;">Bloco Personalizado Novo</div>
              <button type="button" class="botao-texto" onclick="adicionarBlocoCustomizadoEditor()">+ Adicionar</button>
            </div>
            <div class="re-ajuda">
              Cria um texto novo já no fim da lista de cima — dá pra mover ele com as setas assim que criar.
            </div>
          </div>

          <hr class="divisa">

          ${relatorioEncerramentoHtml(encerramentoAtual)}

          <hr class="divisa">
        </div>
      </div>

      <div id="relEditorPreviaPane" style="display: none;"></div>

    </div>
  `;
  inicializarQuillsPendentes();
  atualizarPreviewCapaEditor();
  ajustarEspacadoresBarraFixaRelatorio();
  carregarBibliotecaRelatorio().then(renderizarBibliotecaNoEditor);

  // Reconstrução pós-prévia: a prévia já veio pronta (foi gerada ANTES da
  // mandala apagar a tela) — só exibe, direto na aba Prévia, sem gerar de
  // novo (senão a mandala apagaria a tela outra vez, num ciclo sem fim).
  if (opcoes.previaProntaHtml) {
    const painelEditar = document.getElementById('relEditorFormPane');
    const painelPrevia = document.getElementById('relEditorPreviaPane');
    const abaEditarBtn = document.getElementById('relAbaEditarBtn');
    const abaPreviaBtn = document.getElementById('relAbaPreviaBtn');
    if (painelEditar) painelEditar.style.display = 'none';
    if (painelPrevia) {
      painelPrevia.style.display = 'block';
      painelPrevia.innerHTML = opcoes.previaProntaHtml;
      dividirPaginasLongasEmFolhas(painelPrevia);
      numerarPaginasIndice(painelPrevia);
    }
    if (abaEditarBtn) abaEditarBtn.classList.remove('ativa');
    if (abaPreviaBtn) abaPreviaBtn.classList.add('ativa');

    // Volta a Prévia pro ponto exato de onde o astrólogo parou da última
    // vez que rolou ela (ver o listener de "scroll" mais abaixo) — sem
    // isso, cada vez que voltava aqui (ex.: depois de editar um texto)
    // a tela recomeçava do topo, obrigando a rolar de novo um relatório
    // que pode ter dezenas de páginas.
    restaurarScrollPreviaQuandoImagensCarregarem(painelPrevia, window.relatorioPreviaScrollY || 0);
  }
}

/* Reaplica scrollTo(0, targetY) quadro a quadro por uma janela curta —
   em vez de esperar (com Promise.all) TODAS as <img> da Prévia
   carregarem antes de rolar uma única vez. As capturas de ferramenta já
   persistidas são URL do Storage (não mais data URL), então "esperar
   carregar" passa a depender de rede de verdade: num relatório longo
   (dezenas de páginas, várias capturas), se UMA imagem estiver fora da
   tela e o navegador atrasar/adiar essa requisição (comum em Safari/
   iPad pra imagens longe da viewport), o Promise.all nunca resolvia — a
   rolagem ficava pra sempre esperando, e por fora parecia que "sempre
   volta pro topo e não sai mais de lá".
   Reaplicar o scroll em todo frame, por alguns segundos, se corrige por
   conta própria conforme cada imagem individual termina de carregar e
   estica a página — SEM desistir só porque a página "já está no máximo
   que dá pra rolar agora": logo no início, antes de qualquer imagem
   carregar, esse máximo é bem menor que o final (a imagem ainda não
   reservou altura nenhuma), e parar aí de novo seria o MESMO bug, só
   que na posição errada em vez do topo. Só desiste mesmo depois do
   tempo máximo — aceitando, nesse caso, o que der pra rolar até então. */
function restaurarScrollPreviaQuandoImagensCarregarem(painel, targetY) {
  if (!targetY) { window.scrollTo(0, 0); return; }

  const inicio = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const DURACAO_MAX_MS = 4000;

  function tentar() {
    window.scrollTo(0, targetY);

    const chegouNoAlvo = Math.abs(window.scrollY - targetY) < 2;
    const agora = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    if (chegouNoAlvo || (agora - inicio) > DURACAO_MAX_MS) return;
    requestAnimationFrame(tentar);
  }
  requestAnimationFrame(tentar);
}

/* SELETOR "MANDALA DA CAPA" — fica separado da lista reordenável de
   blocos porque não é uma página do relatório, é só metadado de qual
   imagem (calculada na hora ou capturada) entra na capa. Independente
   de a mandala escolhida também estar marcada como página própria mais
   abaixo — dá pra usar a Fortuna só na capa, por exemplo. */
function relatorioCapaSeletorHtml(capaFonteAtual) {
  const opcoes = [
    { valor: 'mandala_natal', label: 'Mandala Natal (casas do Ascendente)' },
    { valor: 'mandala_fortuna', label: 'Mandala com a Fortuna na Casa 1' },
    { valor: 'mandala_personalizada', label: 'Mandala Personalizada (a última capturada na tela da Mandala)' },
    { valor: 'profeccao', label: 'Mandala da Profecção (a última capturada na ferramenta)' },
    { valor: 'sinastria', label: 'Mandala da Sinastria (a última capturada na ferramenta)' },
    // Liberação Zodiacal não tem uma captura só — cada Lote (Fortuna,
    // Espírito etc.) é capturado à parte na ferramenta, então vira uma
    // opção própria aqui, uma por lote.
    ...RELATORIO_LOTES_ORDEM.map(loteKey => ({
      valor: 'liberacao_' + loteKey,
      label: `Mandala da Liberação Zodiacal — ${RELATORIO_LOT_NOMES[loteKey]} (a última capturada na ferramenta)`
    })),
    { valor: 'nenhuma', label: 'Nenhuma imagem — só o título' }
  ];
  const opcoesHtml = opcoes.map(o => `<option value="${o.valor}" ${o.valor === capaFonteAtual ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('');

  return `
    <div class="re-bloco">
      <div class="titulo-secao">Mandala da Capa</div>
      <div class="re-ajuda">
        Escolhe qual imagem aparece na capa deste modelo — pra você nunca ficar no escuro sobre o que vai ser gerado.
      </div>
      <select id="relCapaFonte" class="modal-select" onchange="atualizarPreviewCapaEditor()">${opcoesHtml}</select>
      <div id="relCapaPreviewWrap" class="re-previa-capa"></div>
    </div>
    <hr class="divisa">
  `;
}

/* CORES DA CAPA — paleta pronta (clique num quadrinho) ou personalizada
   (dois seletores de cor), por MODELO de relatório, guardada junto com a
   "Mandala da Capa" no mesmo bloco invisível "__capa__" (ver
   RELATORIO_PALETAS_CAPA/resolverCoresCapaRelatorio). O hidden
   #relCapaPaletaId guarda a escolha atual — lido por
   lerBlocosComCapaDoEditor/atualizarPreviaEditorModelo junto dos dois
   color pickers, que só valem quando a paleta é 'custom'.

   window.temaMandala já foi carregado antes da tela do editor abrir (ver
   carregarTemaMandala, chamado logo após o login) — dá pra avisar aqui,
   sem esperar nada, que o Tema Céu (quando ativo) sempre vence essa
   escolha na hora de gerar o relatório de verdade. */
/* Escolha da capa no Tema Céu: "Céu" (como sempre) ou "Papiro" (folha de papiro inteira, título em terracota, roda em
   tinta — igual às capas da Profecção/Liberação/Sinastria). Só aparece no Tema Céu, mas o checkbox existe sempre
   (escondido fora dele) pra uma escolha já salva no modelo não se perder ao editar em outro tema. */
function relatorioCapaPapiroHtml(capaPapiroAtual) {
  const ceu = typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu';
  return `
    <div class="re-bloco"${ceu ? '' : ' style="display: none;"'}>
      <div class="titulo-secao">Capa no Tema Céu</div>
      <div class="re-opcoes-linha">
        <label class="re-opcao-radio">
          <input type="radio" name="relCapaEstiloCeu" value="ceu" ${capaPapiroAtual ? '' : 'checked'}> Capa Céu
        </label>
        <label class="re-opcao-radio">
          <input type="radio" name="relCapaEstiloCeu" value="papiro" id="relCapaPapiro" ${capaPapiroAtual ? 'checked' : ''}> Capa Papiro (tinta sobre papiro)
        </label>
      </div>
    </div>
    <hr class="divisa"${ceu ? '' : ' style="display: none;"'}>`;
}

function relatorioPaletaCapaHtml(paletaIdAtual, corFundoCustomAtual, corTituloCustomAtual, corCabecalhoCustomAtual, corBordaCustomAtual, temBordaAtual, corCirculoCustomAtual, temCirculoAtual, tamanhoTituloAtual) {
  const ehCustom = paletaIdAtual === 'custom';
  const fundoCustom = RELATORIO_HEX_RE.test(corFundoCustomAtual) ? corFundoCustomAtual : '#ffffff';
  const tituloCustom = RELATORIO_HEX_RE.test(corTituloCustomAtual) ? corTituloCustomAtual : '#103b70';
  const cabecalhoCustom = RELATORIO_HEX_RE.test(corCabecalhoCustomAtual) ? corCabecalhoCustomAtual : '#fffdf5';
  const bordaCustom = RELATORIO_HEX_RE.test(corBordaCustomAtual) ? corBordaCustomAtual : '#c59b27';
  const circuloCustom = RELATORIO_HEX_RE.test(corCirculoCustomAtual) ? corCirculoCustomAtual : '#fffdf5';
  const temBorda = temBordaAtual === true;
  const temCirculo = temCirculoAtual === true;
  const tamanhoTitulo = RELATORIO_TAMANHOS_TITULO_CAPA[tamanhoTituloAtual] ? tamanhoTituloAtual : RELATORIO_TAMANHO_TITULO_PADRAO;

  const swatchesHtml = RELATORIO_PALETAS_CAPA.map(p => {
    const ativa = !ehCustom && p.id === paletaIdAtual;
    return `
      <div class="rel-capa-swatch${ativa ? ' ativa' : ''}" data-paleta-id="${p.id}" onclick="selecionarPaletaCapaEditor('${p.id}')" title="${escapeHtml(p.nome)}">
        <div class="rel-capa-swatch-cor" style="background: ${p.corFundo};">
          <span style="color: ${p.corTitulo};">Aa</span>
        </div>
        <div class="rel-capa-swatch-nome">${escapeHtml(p.nome)}</div>
        ${ativa ? `<span class="rel-capa-swatch-check">${menuIcone('checkCirculo', 16)}</span>` : ''}
      </div>
    `;
  }).join('');

  const avisoCeu = (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu')
    ? `<div class="re-nota">${menuIcone('info', 16)} O Tema Céu está ativo na sua conta — enquanto ele estiver ligado, a capa sai sempre roxa com título dourado, e a cor escolhida aqui fica guardada mas não aparece. Desligue o Tema Céu em Configurações pra ver essa paleta valendo.</div>`
    : `<div class="re-nota">Se o Tema Céu (Configurações → Aparência) estiver ativo, a capa sai sempre roxa com título dourado, independente da cor escolhida aqui.</div>`;

  return `
    <div class="re-bloco">
      <div class="titulo-secao">Cores da Capa</div>
      <div class="re-ajuda">
        Escolhe a combinação de cor de fundo + título deste modelo. Fica salva junto com o modelo — cada serviço/relatório pode ter a sua.
      </div>
      <input type="hidden" id="relCapaPaletaId" value="${escapeHtml(paletaIdAtual)}">
      <div class="rel-capa-swatches">
        ${swatchesHtml}
        <div class="rel-capa-swatch${ehCustom ? ' ativa' : ''}" data-paleta-id="custom" onclick="selecionarPaletaCapaEditor('custom')" title="Personalizada">
          <div class="rel-capa-swatch-cor rel-capa-swatch-custom-icone">${menuIcone('aparencia', 22)}</div>
          <div class="rel-capa-swatch-nome">Personalizada</div>
          ${ehCustom ? `<span class="rel-capa-swatch-check">${menuIcone('checkCirculo', 16)}</span>` : ''}
        </div>
      </div>
      <div id="relCapaCustomWrap" class="re-cores-custom" style="${ehCustom ? '' : 'display: none;'}">
        <div>
          <label class="rotulo re-rotulo">Fundo</label>
          <input type="color" id="relCapaCorFundo" value="${fundoCustom}" class="re-cor">
        </div>
        <div>
          <label class="rotulo re-rotulo">Título</label>
          <input type="color" id="relCapaCorTitulo" value="${tituloCustom}" class="re-cor">
        </div>
        <div>
          <label class="rotulo re-rotulo">Cabeçalho</label>
          <input type="color" id="relCapaCorCabecalho" value="${cabecalhoCustom}" class="re-cor">
        </div>
        <div id="relCapaCorBordaWrap" style="${temBorda ? '' : 'display: none;'}">
          <label class="rotulo re-rotulo">Borda</label>
          <input type="color" id="relCapaCorBorda" value="${bordaCustom}" class="re-cor">
        </div>
        <div id="relCapaCorCirculoWrap" style="${temCirculo ? '' : 'display: none;'}">
          <label class="rotulo re-rotulo">Círculo</label>
          <input type="color" id="relCapaCorCirculo" value="${circuloCustom}" class="re-cor">
        </div>
      </div>
      <div class="re-ajuda">
        "Cabeçalho" é a cor de fundo da caixinha de nome/data/cidade que aparece dentro da imagem da mandala, na capa.
      </div>

      <!-- BORDA (MOLDURA): pinta a página inteira da capa com uma cor e
           coloca o conteúdo (título + mandala + rodapé) num retângulo
           menor, com a cor de fundo normal, encolhido pra dentro — a cor
           de fora sobra como uma moldura ao redor. Nas paletas prontas
           usa a mesma cor do título; na Personalizada, o astrólogo escolhe
           a cor da borda à parte (ver #relCapaCorBordaWrap acima). -->
      <div class="re-linha-check">
        <input type="checkbox" id="relCapaTemBorda" ${temBorda ? 'checked' : ''} onchange="alternarBordaCapaEditor(this.checked)">
        <label for="relCapaTemBorda">Capa com borda (moldura ao redor)</label>
      </div>
      <div class="re-ajuda">
        Nas paletas prontas, a borda sai na mesma cor do título. Na Personalizada, dá pra escolher a cor da borda à parte, acima.
      </div>

      <!-- CÍRCULO ATRÁS DA MANDALA: um disco colorido desenhado DENTRO do
           próprio SVG da mandala (ver corCirculoForcada em renderMandala,
           mandala.js), exatamente no centro matemático que a roda inteira
           já usa. Nas paletas prontas usa a mesma cor do Cabeçalho; na
           Personalizada, cor à parte (ver #relCapaCorCirculoWrap acima). -->
      <div class="re-linha-check">
        <input type="checkbox" id="relCapaTemCirculo" ${temCirculo ? 'checked' : ''} onchange="alternarCirculoCapaEditor(this.checked)">
        <label for="relCapaTemCirculo">Círculo colorido atrás da mandala</label>
      </div>
      <div class="re-ajuda">
        Nas paletas prontas, o círculo sai na mesma cor do Cabeçalho. Na Personalizada, dá pra escolher a cor do círculo à parte, acima.
      </div>
      ${avisoCeu}
    </div>

    <hr class="divisa">

    <div class="re-bloco">
      <div class="titulo-secao">Tamanho do Título</div>
      <div class="re-ajuda">
        Controla só o tamanho do título na capa deste modelo — o resto do relatório não muda.
      </div>
      <select id="relCapaTamanhoTitulo" class="modal-select">
        <option value="pequeno" ${tamanhoTitulo === 'pequeno' ? 'selected' : ''}>Pequeno</option>
        <option value="medio" ${tamanhoTitulo === 'medio' ? 'selected' : ''}>Médio (padrão)</option>
        <option value="grande" ${tamanhoTitulo === 'grande' ? 'selected' : ''}>Grande</option>
        <option value="extra-grande" ${tamanhoTitulo === 'extra-grande' ? 'selected' : ''}>Extra Grande</option>
      </select>
    </div>

    <hr class="divisa">
  `;
}

/* Clique num quadrinho de paleta (ou em "Personalizada"): grava a escolha
   no hidden, alterna qual quadrinho aparece marcado e mostra/esconde os
   dois seletores de cor — sem reconstruir a tela inteira. Dispara o
   autosave igual às outras ações por clique do editor (mover/remover
   bloco), já que clique em <div> não passa pelo listener global de
   "change" (esse só ouve elementos de formulário de verdade). */
function selecionarPaletaCapaEditor(paletaId) {
  const hidden = document.getElementById('relCapaPaletaId');
  if (hidden) hidden.value = paletaId;

  document.querySelectorAll('.rel-capa-swatch').forEach(el => {
    const ativa = el.dataset.paletaId === paletaId;
    el.classList.toggle('ativa', ativa);
    const check = el.querySelector('.rel-capa-swatch-check');
    if (ativa && !check) el.insertAdjacentHTML('beforeend', `<span class="rel-capa-swatch-check">${menuIcone('checkCirculo', 16)}</span>`);
    if (!ativa && check) check.remove();
  });

  const customWrap = document.getElementById('relCapaCustomWrap');
  if (customWrap) customWrap.style.display = paletaId === 'custom' ? 'flex' : 'none';

  agendarAutoSalvarRelatorio();
}
window.selecionarPaletaCapaEditor = selecionarPaletaCapaEditor;

/* Liga/desliga a moldura da capa (checkbox #relCapaTemBorda) — só
   mostra/esconde o color picker da cor da borda (só existe pra
   Personalizada; nas paletas prontas a borda usa a cor do título
   sozinha, sem campo novo). O autosave dispara pelo listener global de
   "change" do formulário (ver mais abaixo), já que checkbox é elemento
   de formulário de verdade — diferente dos quadrinhos de paleta, que
   são <div> e por isso chamam agendarAutoSalvarRelatorio() na mão. */
function alternarBordaCapaEditor(ligada) {
  const wrap = document.getElementById('relCapaCorBordaWrap');
  if (wrap) wrap.style.display = ligada ? 'block' : 'none';
}
window.alternarBordaCapaEditor = alternarBordaCapaEditor;

/* Mesma ideia de alternarBordaCapaEditor, pro checkbox do círculo atrás
   da mandala. */
function alternarCirculoCapaEditor(ligada) {
  const wrap = document.getElementById('relCapaCorCirculoWrap');
  if (wrap) wrap.style.display = ligada ? 'block' : 'none';
}
window.alternarCirculoCapaEditor = alternarCirculoCapaEditor;

/* TEXTO DE ENCERRAMENTO — igual à capa, fica separado da lista
   reordenável porque não é uma página do meio do relatório: é sempre a
   ÚLTIMA, fixa, junto com o rodapé de contato (esse sim vem do perfil
   em Configurações > Relatórios, não daqui). Reaproveita o mesmo
   mecanismo de Quill "pendente" dos blocos de texto comuns (ver
   relatorioLinhaEditorHtml/inicializarQuillsPendentes), só que com um id
   fixo em vez de um por bloco. */
function relatorioEncerramentoHtml(corpoAtual) {
  window.relatorioQuillPendentes = window.relatorioQuillPendentes || {};
  window.relatorioQuillPendentes['__encerramento__'] = { corpo: corpoAtual || '', formato: 'rich' };

  return `
    <div class="re-bloco">
      <div class="titulo-secao">Texto de Encerramento</div>
      <div class="re-ajuda">
        Aparece sempre na ÚLTIMA página do relatório, junto com seu nome/telefone/e-mail (esses vêm de Configurações → Relatórios).
      </div>
      <div id="quill-mount-__encerramento__" class="rel-quill-mount"></div>
    </div>
  `;
}

/* Atualiza a explicação/miniatura abaixo do seletor de capa conforme a
   opção escolhida. Só a Mandala Personalizada tem uma miniatura de
   verdade (é uma captura de tela já pronta, salva em memória) — as
   outras duas são recalculadas no momento de gerar o relatório, a
   partir do mapa do cliente carregado, então só descrevemos o que vai
   sair (aliás, sai igual à própria página delas, se estiver marcada). */
function atualizarPreviewCapaEditor() {
  const select = document.getElementById('relCapaFonte');
  const wrap = document.getElementById('relCapaPreviewWrap');
  if (!select || !wrap) return;
  const valor = select.value;

  // Mandala Personalizada, Profecção, Sinastria e cada Lote da
  // Liberação Zodiacal: todas vêm de uma captura já feita na própria
  // ferramenta, não de um cálculo aqui — mesmo pool de
  // window.relatorioCapturas usado pelos blocos "ferramenta" do corpo
  // do relatório (ver imagemCapaRelatorio).
  const dicaOndeCapturar = {
    mandala_personalizada: 'Abra a Mandala, deixe a rotação de Casa 1 do jeito que quer mostrar e clique no botão de "Adicionar ao Relatório" ao lado da rotação',
    profeccao: 'Abra Ferramentas > Profecção, deixe a tela do jeito que quer mostrar e clique em "Adicionar ao Relatório"',
    sinastria: 'Abra Ferramentas > Sinastria, escolha o segundo mapa e clique em "Adicionar ao Relatório"'
  };
  RELATORIO_LOTES_ORDEM.forEach(loteKey => {
    dicaOndeCapturar['liberacao_' + loteKey] = `Abra Ferramentas > Liberação Zodiacal, escolha o Lote ${RELATORIO_LOT_NOMES[loteKey]} e clique em "Adicionar ao Relatório"`;
  });
  if (dicaOndeCapturar[valor]) {
    const capturas = capturasDaFerramenta(valor);
    if (capturas.length) {
      const ultima = capturas[capturas.length - 1];
      wrap.innerHTML = `
        <div class="re-ajuda">${capturas.length > 1 ? `Vai a mais recente das ${capturas.length} capturadas:` : 'Prévia da captura:'}</div>
        <img src="${ultima.dataUrl}" class="re-miniatura">
      `;
    } else {
      wrap.innerHTML = `<div class="re-nota">Nenhuma imagem capturada ainda pra essa opção. ${dicaOndeCapturar[valor]} — depois volte aqui.</div>`;
    }
    return;
  }

  if (valor === 'nenhuma') {
    wrap.innerHTML = `<div class="re-ajuda">A capa vai mostrar só o título do relatório, sem nenhuma imagem.</div>`;
    return;
  }

  const nomePagina = valor === 'mandala_natal' ? 'Mapa Natal' : 'Mandala com a Fortuna';
  wrap.innerHTML = `<div class="re-ajuda">Calculada na hora, a partir dos dados do cliente carregado — sai igual à própria página "${nomePagina}" deste relatório (se ela estiver marcada como página aqui embaixo).</div>`;
}
window.atualizarPreviewCapaEditor = atualizarPreviewCapaEditor;

/* Lê o estado ATUAL do formulário do editor (linhas reordenáveis, cada
   Quill, e o catálogo marcado pra adicionar) e devolve a lista de blocos
   — SEM tocar no Supabase. Usada tanto por salvarEdicaoRelatorioAtual
   (que ainda acrescenta o bloco de capa e grava de verdade) quanto pela
   prévia sob demanda (atualizarPreviaEditorModelo), que precisa
   exatamente do mesmo resultado sem persistir nada. A ordem devolvida é
   a ordem das linhas dentro de #relEditorOrdenavel no momento da
   chamada, então reflete qualquer reordenação feita com ▲▼. */
function lerBlocosDoEditor() {
  const catalogoPorId = {};
  RELATORIO_CATALOGO_BLOCOS.forEach(b => { catalogoPorId[b.id] = b; });

  const blocos = [];

  document.querySelectorAll('#relEditorOrdenavel .rel-editor-linha').forEach(linha => {
    const id = linha.dataset.blocoId;
    const tipo = linha.dataset.blocoTipo;
    const checkbox = linha.querySelector(`[data-bloco-check="${id}"]`);
    if (!checkbox || !checkbox.checked) return;

    if (tipo === 'ferramenta') {
      const bloco = { id, type: 'ferramenta' };
      // Só grava ferramentaId/capturaIndex quando essa linha é uma
      // instância EXTRA (a partir da segunda) — a primeira instância de
      // cada ferramenta continua salva exatamente como sempre foi
      // ({id, type:'ferramenta'}), sem esses campos a mais.
      const idFerramenta = linha.dataset.ferramentaId;
      const idxCaptura = parseInt(linha.dataset.capturaIndex, 10) || 0;
      if (idFerramenta && idFerramenta !== id) bloco.ferramentaId = idFerramenta;
      if (idxCaptura > 0) bloco.capturaIndex = idxCaptura;
      const inputRotuloIndice = linha.querySelector(`[data-bloco-titulo-indice="${id}"]`);
      const rotuloIndice = inputRotuloIndice && inputRotuloIndice.value.trim();
      if (rotuloIndice) bloco.rotuloIndice = rotuloIndice;
      blocos.push(bloco);
      return;
    }

    const padrao = catalogoPorId[id];
    const custom = linha.dataset.custom === '1';
    const tituloInput = linha.querySelector(`[data-bloco-titulo="${id}"]`);
    const titulo = (tituloInput && tituloInput.value.trim()) || (custom ? '' : padrao.titulo);
    const quill = (window.relatorioQuillInstancias || {})[id];
    const corpoHtml = quill ? quill.root.innerHTML : '';
    const corpoVazio = quill ? !quill.getText().trim() : true;
    if (custom && !titulo && corpoVazio) return; // personalizado em branco, nunca preenchido — ignora
    blocos.push({ id, type: 'texto', titulo: titulo || 'Sem título', corpo: corpoHtml, formato: 'rich' });
  });

  return blocos;
}

/* Lê os blocos do editor já com os campos fixos incluídos (capa e texto
   de encerramento) — usada tanto pelo salvamento manual quanto pelo
   autosave do rascunho, pra nunca duas implementações divergirem de
   como isso é montado. */
function lerBlocosComCapaDoEditor() {
  const blocos = lerBlocosDoEditor();
  if (!blocos.length) return blocos;
  const capaFonteSelect = document.getElementById('relCapaFonte');
  const blocoCapa = { id: '__capa__', type: 'capa', fonte: capaFonteSelect ? capaFonteSelect.value : 'mandala_natal' };
  const paletaIdSelect = document.getElementById('relCapaPaletaId');
  blocoCapa.paletaId = paletaIdSelect ? paletaIdSelect.value : RELATORIO_PALETA_CAPA_PADRAO;
  if (blocoCapa.paletaId === 'custom') {
    const corFundoInput = document.getElementById('relCapaCorFundo');
    const corTituloInput = document.getElementById('relCapaCorTitulo');
    const corCabecalhoInput = document.getElementById('relCapaCorCabecalho');
    const corBordaInput = document.getElementById('relCapaCorBorda');
    const corCirculoInput = document.getElementById('relCapaCorCirculo');
    blocoCapa.corFundo = corFundoInput ? corFundoInput.value : '#ffffff';
    blocoCapa.corTitulo = corTituloInput ? corTituloInput.value : '#103b70';
    blocoCapa.corCabecalho = corCabecalhoInput ? corCabecalhoInput.value : '#fffdf5';
    blocoCapa.corBorda = corBordaInput ? corBordaInput.value : '#c59b27';
    blocoCapa.corCirculo = corCirculoInput ? corCirculoInput.value : '#fffdf5';
  }
  const temBordaInput = document.getElementById('relCapaTemBorda');
  blocoCapa.temBorda = temBordaInput ? temBordaInput.checked : false;
  const capaPapiroInput = document.getElementById('relCapaPapiro');
  blocoCapa.capaPapiro = capaPapiroInput ? capaPapiroInput.checked : false;
  const temCirculoInput = document.getElementById('relCapaTemCirculo');
  blocoCapa.temCirculo = temCirculoInput ? temCirculoInput.checked : false;
  const tamanhoTituloSelect = document.getElementById('relCapaTamanhoTitulo');
  blocoCapa.tamanhoTitulo = tamanhoTituloSelect ? tamanhoTituloSelect.value : RELATORIO_TAMANHO_TITULO_PADRAO;
  blocos.push(blocoCapa);
  const quillEncerramento = (window.relatorioQuillInstancias || {})['__encerramento__'];
  blocos.push({ id: '__encerramento__', type: 'encerramento', corpo: quillEncerramento ? quillEncerramento.root.innerHTML : RELATORIO_ENCERRAMENTO_PADRAO });
  return blocos;
}

/* Grava título+blocos direto num rascunho (relatório de um cliente) —
   usada tanto pelo clique manual em "Salvar" quanto pelo autosave.
   Devolve true/false (sucesso), sem mostrar alerta — quem chama decide
   como avisar (ou não) o astrólogo. */
async function gravarBlocosNoRascunho(rascunhoId, nome, blocos) {
  const client = relatorioSupabaseClient();
  if (!client) return false;
  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return false;
    // Aproveita toda gravação de blocos (autosave ou "Salvar Agora") pra
    // também subir pro Storage qualquer captura ainda só em memória —
    // reforça agendarPersistenciaCapturasRelatorio (ver adicionarCapturaRelatorio)
    // pros casos em que a captura nova só passa a valer por causa de um
    // bloco/instância que mudou junto (ex.: "+" numa ferramenta pra usar
    // a próxima captura vazia).
    const capturasPersistidas = typeof currentMapaId !== 'undefined' && currentMapaId
      ? await persistirCapturasRelatorio(client, user.id, currentMapaId)
      : (window.relatorioCapturas || {});
    window.relatorioCapturas = capturasPersistidas;
    const { error } = await client
      .from('relatorio_rascunhos')
      .update({ titulo: nome, blocos, capturas: capturasPersistidas, updated_at: new Date().toISOString() })
      .eq('id', rascunhoId)
      .eq('user_id', user.id);
    if (!error) {
      // Mantém o cache em memória (window.relatorioRascunhoEmEdicao) em dia
      // com o que acabou de ser gravado — sem isso, voltar pra este
      // rascunho depois de dar uma olhada noutra ferramenta forçava reler
      // do banco de novo (ver iniciarModuloRelatorio), um vaivém de rede só
      // pra reconseguir dados que já estavam aqui na mão.
      const cache = window.relatorioRascunhoEmEdicao;
      if (cache && cache.id === rascunhoId) {
        cache.titulo = nome;
        cache.blocos = blocos;
        cache.capturas = capturasPersistidas;
      }
    }
    return !error;
  } catch (e) {
    return false;
  }
}

/* AUTOSAVE do relatório de um cliente (nunca de um modelo genérico —
   editar um modelo continua exigindo o clique manual em "Salvar
   Modelo", de propósito, já que é uma ação mais rara e que vale a pena
   confirmar antes de gravar por cima do modelo compartilhado).

   Disparada (ver os listeners de "input"/"change" mais abaixo, e as
   chamadas diretas em mover/remover/adicionar bloco) sempre que algo
   muda no editor — mas só GRAVA de verdade depois de uma pausa curta
   sem novas mudanças (debounce), pra não salvar a cada letra digitada. */
let relatorioAutoSalvarTimeout = null;
function agendarAutoSalvarRelatorio() {
  const alvo = window.relatorioEditorAlvoAtual;
  if (!alvo || alvo.tipo !== 'rascunho') return;
  clearTimeout(relatorioAutoSalvarTimeout);
  relatorioAutoSalvarTimeout = setTimeout(autoSalvarRascunhoAtual, 1200);
}
window.agendarAutoSalvarRelatorio = agendarAutoSalvarRelatorio;

/* Faz a gravação de verdade do autosave — sem fechar a tela nem mostrar
   alerta de erro (autosave é silencioso; se falhar, a próxima mudança
   agenda uma nova tentativa sozinha). Só mostra uma confirmação sutil
   no botão de salvar quando dá certo. */
async function autoSalvarRascunhoAtual() {
  const alvo = window.relatorioEditorAlvoAtual;
  if (!alvo || alvo.tipo !== 'rascunho') return;
  if (!document.getElementById('relEditorOrdenavel')) return; // saiu da tela no meio do debounce

  const nomeInput = document.getElementById('relEditorNome');
  const nome = nomeInput && nomeInput.value.trim();
  if (!nome) return;

  const blocos = lerBlocosComCapaDoEditor();
  if (blocos.length <= 1) return; // só o bloco de capa, nada de conteúdo ainda

  const ok = await gravarBlocosNoRascunho(alvo.id, nome, blocos);
  if (ok) mostrarIndicadorSalvoRelatorio();
}
window.autoSalvarRascunhoAtual = autoSalvarRascunhoAtual;

/* Confirmação visual rápida e discreta no próprio botão de salvar — só
   pra dar segurança de que salvou, sem interromper o astrólogo com
   nenhum alerta. */
function mostrarIndicadorSalvoRelatorio() {
  const btn = document.querySelector('.rel-editor-btn-salvar');
  if (!btn) return;
  if (!btn.dataset.rotuloOriginal) btn.dataset.rotuloOriginal = btn.innerHTML;
  btn.innerHTML = menuIcone('check', 16) + ' Salvo';
  clearTimeout(window.relatorioIndicadorSalvoTimeout);
  window.relatorioIndicadorSalvoTimeout = setTimeout(() => {
    if (btn.dataset.rotuloOriginal) btn.innerHTML = btn.dataset.rotuloOriginal;
  }, 1500);
}

/* Delegados uma única vez (nunca por render do editor, pra não empilhar
   listener repetido toda vez que a tela é reconstruída) — cobrem
   digitação nos textos/Quill/nome/título, checkboxes de incluir/excluir
   bloco e o seletor de capa. Reordenar, adicionar e remover bloco (ações
   por clique de botão, sem evento de input/change) chamam
   agendarAutoSalvarRelatorio() direto onde acontecem. */
if (!window.relatorioAutoSalvarListenersAdicionados) {
  window.relatorioAutoSalvarListenersAdicionados = true;
  document.addEventListener('input', (e) => {
    if (e.target.closest && e.target.closest('#relEditorFormPane')) agendarAutoSalvarRelatorio();
  });
  document.addEventListener('change', (e) => {
    if (e.target.closest && e.target.closest('#relEditorFormPane')) agendarAutoSalvarRelatorio();
  });
}

/* MONTA OS BLOCOS A PARTIR DO QUE FOI MARCADO/EDITADO NO EDITOR E SALVA —
   em relatorio_presets se o alvo é um modelo genérico (fecha a tela e
   volta pra lista de modelos ao terminar); no rascunho de um cliente, o
   autosave já vem gravando sozinho o tempo todo, então aqui só força
   salvar AGORA (útil antes de fechar o navegador, por exemplo) e mostra
   a confirmação — sem fechar nem navegar pra lugar nenhum. */
async function salvarEdicaoRelatorioAtual() {
  const alvo = window.relatorioEditorAlvoAtual;
  if (!alvo) return;

  const nome = document.getElementById('relEditorNome').value.trim();
  if (!nome) { alert("Informe um nome."); return; }

  if (alvo.tipo === 'rascunho') {
    const blocos = lerBlocosComCapaDoEditor();
    if (blocos.length <= 1) { alert("Marque ou crie pelo menos um item pra entrar no relatório."); return; }
    const ok = await gravarBlocosNoRascunho(alvo.id, nome, blocos);
    if (!ok) { alert("Erro ao salvar o relatório. Tente de novo."); return; }
    clearTimeout(relatorioAutoSalvarTimeout);
    mostrarIndicadorSalvoRelatorio();
    return;
  }

  const novosBlocos = lerBlocosComCapaDoEditor();
  if (novosBlocos.length <= 1) { alert("Marque ou crie pelo menos um item pra entrar no relatório."); return; }

  const client = relatorioSupabaseClient();
  if (!client) return;

  const preset = (window.relatorioPresetsCarregados || [])[alvo.idx];
  if (!preset) return;
  try {
    if (preset.id) {
      const { error } = await client
        .from('relatorio_presets')
        .update({ nome, blocos: novosBlocos, updated_at: new Date().toISOString() })
        .eq('id', preset.id);
      if (error) { alert("Erro ao salvar modelo: " + error.message); return; }
    } else {
      // Preset "em memória" (sem id — a tabela pode não ter existido na hora
      // que ele foi semeado): tenta criar de verdade agora que está salvando.
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        await client.from('relatorio_presets').insert({ user_id: user.id, nome, blocos: novosBlocos });
      }
    }
    iniciarModuloRelatorio();
  } catch (e) {
    alert("Erro de conexão ao salvar modelo.");
  }
}
window.salvarEdicaoRelatorioAtual = salvarEdicaoRelatorioAtual;

/* PRÉVIA AO VIVO DO MODELO (sob demanda, ao clicar na aba "Prévia") —
   gera o relatório a partir do que está NA TELA agora (lerBlocosDoEditor),
   nunca do que está salvo no Supabase, reaproveitando exatamente a mesma
   renderização do relatório final (montarConteudoRelatorioHtml +
   renderBlocoRelatorio) pra garantir que o que aparece aqui é idêntico ao
   que sairia no PDF. Não fica se atualizando sozinha a cada tecla —
   regenera de novo toda vez que a aba é aberta, o que já elimina o ciclo
   salvar → voltar → gerar → olhar → voltar de antes, sem o custo/risco de
   recalcular mandalas a cada letra digitada.

   CUIDADO: quando o modelo usa (ou a capa usa) a Mandala Natal/Fortuna,
   renderizarMandalasDoPreset desenha a mandala de VERDADE dentro de
   #mandala-container pra conseguir "fotografar" o PNG (ver renderMandala
   em mandala.js) — e esse é o MESMO container onde a tela inteira deste
   editor está montada. Ou seja, gerar a prévia apaga a tela do editor por
   baixo dos panos (é assim que "some" e parece "voltar pra tela inicial",
   mostrando a mandala ao vivo por cima de tudo). Por isso lemos TUDO que
   precisamos do formulário ANTES dessa chamada, e reconstruímos a tela
   inteira depois (reabrirEditorRelatorioAtual com as opções de override),
   já com a prévia pronta — sem gerar de novo, senão a mandala apagaria a
   tela outra vez. */
async function atualizarPreviaEditorModelo() {
  const pane = document.getElementById('relEditorPreviaPane');
  if (!pane) return;

  pane.innerHTML = `<div class="menu-vazio" style="padding: 60px;">Gerando a prévia...</div>`;

  const nomeCampo = (document.getElementById('relEditorNome').value || '').trim();
  const capaFonteSelect = document.getElementById('relCapaFonte');
  const capaFonte = capaFonteSelect ? capaFonteSelect.value : 'mandala_natal';
  const paletaIdSelect = document.getElementById('relCapaPaletaId');
  const paletaCapa = paletaIdSelect ? paletaIdSelect.value : RELATORIO_PALETA_CAPA_PADRAO;
  const corFundoInput = document.getElementById('relCapaCorFundo');
  const corTituloInput = document.getElementById('relCapaCorTitulo');
  const corCabecalhoInput = document.getElementById('relCapaCorCabecalho');
  const corBordaInput = document.getElementById('relCapaCorBorda');
  const temBordaInput = document.getElementById('relCapaTemBorda');
  const corCirculoInput = document.getElementById('relCapaCorCirculo');
  const temCirculoInput = document.getElementById('relCapaTemCirculo');
  const tamanhoTituloSelect = document.getElementById('relCapaTamanhoTitulo');
  const corFundoCapa = corFundoInput ? corFundoInput.value : null;
  const corTituloCapa = corTituloInput ? corTituloInput.value : null;
  const corCabecalhoCapa = corCabecalhoInput ? corCabecalhoInput.value : null;
  const corBordaCapa = corBordaInput ? corBordaInput.value : null;
  const temBordaCapa = temBordaInput ? temBordaInput.checked : false;
  const capaPapiroInputPrevia = document.getElementById('relCapaPapiro');
  const capaPapiroCapa = capaPapiroInputPrevia ? capaPapiroInputPrevia.checked : false;
  const corCirculoCapa = corCirculoInput ? corCirculoInput.value : null;
  const temCirculoCapa = temCirculoInput ? temCirculoInput.checked : false;
  const tamanhoTituloCapa = tamanhoTituloSelect ? tamanhoTituloSelect.value : RELATORIO_TAMANHO_TITULO_PADRAO;
  const quillEncerramento = (window.relatorioQuillInstancias || {})['__encerramento__'];
  const encerramentoCorpo = quillEncerramento ? quillEncerramento.root.innerHTML : RELATORIO_ENCERRAMENTO_PADRAO;

  const blocosCorpo = lerBlocosDoEditor();
  if (!blocosCorpo.length) {
    pane.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 600;">Marque ou crie pelo menos um item na aba "Editar" pra ver a prévia.</div>`;
    return;
  }
  const blocoCapaPreview = { id: '__capa__', type: 'capa', fonte: capaFonte, paletaId: paletaCapa, temBorda: temBordaCapa, capaPapiro: capaPapiroCapa, temCirculo: temCirculoCapa, tamanhoTitulo: tamanhoTituloCapa };
  if (paletaCapa === 'custom') {
    blocoCapaPreview.corFundo = corFundoCapa;
    blocoCapaPreview.corTitulo = corTituloCapa;
    blocoCapaPreview.corCabecalho = corCabecalhoCapa;
    blocoCapaPreview.corBorda = corBordaCapa;
    blocoCapaPreview.corCirculo = corCirculoCapa;
  }
  const blocosComCapa = blocosCorpo.concat([
    blocoCapaPreview,
    { id: '__encerramento__', type: 'encerramento', corpo: encerramentoCorpo }
  ]);
  const presetPreview = { nome: nomeCampo || 'Modelo sem nome', blocos: blocosComCapa };

  const perfil = await carregarPerfilRelatorio();
  const { lotes: lotesNatal, ascAbs: ascAbsNatal } = calcularLotesRelatorio();
  const { png1, png2, png1Capa, png2Capa } = await renderizarMandalasDoPreset(blocosComCapa, capaFonte);

  injetarEstilosRelatorio();
  const conteudoHtml = montarConteudoRelatorioHtml(presetPreview, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte, png1Capa, png2Capa);
  const previaProntaHtml = `
    <div class="rel-previa-aviso no-print">
      ${menuIcone('info', 16)} Prévia gerada a partir do que está na tela agora — nada foi salvo ainda. Clique em "Salvar" ali em cima quando estiver satisfeito.
    </div>
    <div class="rel-viewer${classeTemaPapiroRelatorio()}">${conteudoHtml}</div>
  `;

  reabrirEditorRelatorioAtual({
    blocosOverride: blocosCorpo,
    nomeOverride: nomeCampo,
    capaFonteOverride: capaFonte,
    paletaCapaOverride: paletaCapa,
    corFundoCapaOverride: corFundoCapa,
    corTituloCapaOverride: corTituloCapa,
    corCabecalhoCapaOverride: corCabecalhoCapa,
    corBordaCapaOverride: corBordaCapa,
    temBordaCapaOverride: temBordaCapa,
    capaPapiroOverride: capaPapiroCapa,
    corCirculoCapaOverride: corCirculoCapa,
    temCirculoCapaOverride: temCirculoCapa,
    tamanhoTituloCapaOverride: tamanhoTituloCapa,
    encerramentoOverride: encerramentoCorpo,
    previaProntaHtml
  });
}
window.atualizarPreviaEditorModelo = atualizarPreviaEditorModelo;

/* Alterna entre a aba "Editar" (formulário) e "Prévia" (renderização sob
   demanda, sem sair da tela nem salvar). Quando vai pra "previa", delega
   pra atualizarPreviaEditorModelo — que pode reconstruir a tela inteira
   (ver o comentário lá em cima), então não dá pra só trocar o display
   aqui como se fazia antes. Voltar pra "editar" continua sendo uma troca
   simples: o painel do formulário já está montado no DOM. */
function mudarAbaEditorModelo(aba) {
  window.relatorioAbaEditorAtiva = aba; // lembrada pra retomar na mesma aba (ver iniciarModuloRelatorio)
  if (aba === 'previa') {
    atualizarPreviaEditorModelo();
    return;
  }

  const painelEditar = document.getElementById('relEditorFormPane');
  const painelPrevia = document.getElementById('relEditorPreviaPane');
  const abaEditarBtn = document.getElementById('relAbaEditarBtn');
  const abaPreviaBtn = document.getElementById('relAbaPreviaBtn');
  if (!painelEditar || !painelPrevia) return;

  painelEditar.style.display = 'block';
  painelPrevia.style.display = 'none';
  if (abaEditarBtn) abaEditarBtn.classList.add('ativa');
  if (abaPreviaBtn) abaPreviaBtn.classList.remove('ativa');
}
window.mudarAbaEditorModelo = mudarAbaEditorModelo;

/* Chave estável pra "lembrar" um preset entre sessões: usa o id (o caso
   normal, já salvo no Supabase) e cai pro nome quando ainda não tem id
   (o preset "em memória" que carregarOuSemearPresetsRelatorio devolve
   quando a tabela ainda não existe/não respondeu). */
function relatorioChavePreset(preset) {
  return preset.id != null ? `id:${preset.id}` : `nome:${preset.nome}`;
}

/* Índice, na lista de presets carregada agora, do último modelo que o
   astrólogo escolheu (guardado no navegador, por localStorage — não
   precisa de coluna nova no Supabase, e nem faz sentido ser por conta,
   já que é só uma conveniência de "continuar de onde parei" no aparelho
   que ele está usando). Sem nada guardado ainda, ou se o modelo lembrado
   não existir mais, cai no primeiro da lista — o comportamento de antes. */
function indicePresetLembrado(presets) {
  let chaveLembrada = null;
  try { chaveLembrada = localStorage.getItem('relatorioUltimoPreset'); } catch (e) { /* ignora */ }
  if (!chaveLembrada) return 0;
  const idx = presets.findIndex(p => relatorioChavePreset(p) === chaveLembrada);
  return idx >= 0 ? idx : 0;
}

function confirmarGerarRelatorio() {
  const idx = parseInt(document.getElementById('relPresetEscolhido').value, 10) || 0;
  const preset = (window.relatorioPresetsCarregados || [])[idx];
  if (!preset) return;
  try { localStorage.setItem('relatorioUltimoPreset', relatorioChavePreset(preset)); } catch (e) { /* ignora */ }
  gerarRelatorioCompleto(preset);
}

async function gerarRelatorioCompleto(preset) {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  container.innerHTML = `<div class="menu-vazio" style="padding: 60px;">Gerando o relatório...</div>`;

  const perfil = await carregarPerfilRelatorio();
  const blocos = preset.blocos || [];
  const capaFonte = obterCapaFonte(blocos);

  const { lotes: lotesNatal, ascAbs: ascAbsNatal } = calcularLotesRelatorio();
  const { png1, png2, png1Capa, png2Capa } = await renderizarMandalasDoPreset(blocos, capaFonte);

  montarEExibirRelatorio(container, preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte, png1Capa, png2Capa);

  // A prévia já está na tela nesse ponto — o que vem a seguir só decide
  // se o botão "Editar" aparece, nunca atrasa o que o astrólogo já está
  // vendo. Espera terminar (em vez de "atirar e esquecer") porque só
  // depois disso currentRascunhoId existe de verdade pra um rascunho
  // recém-criado.
  await salvarRascunhoRelatorio(preset);
  adicionarBotaoEditarNaToolbarRelatorio();
}

/* Acrescenta o botão "Editar" na barra do relatório já em tela — só
   depois de confirmar que este mapa tem, de fato, um rascunho salvo pra
   editar (currentRascunhoId). Sem isso (ex.: "Céu do Momento", que não
   tem cliente salvo pra vincular um rascunho) não tem o que abrir no
   editor, então o botão nem aparece. */
function adicionarBotaoEditarNaToolbarRelatorio() {
  const toolbar = document.querySelector('.rel-toolbar');
  if (!toolbar || !currentRascunhoId || document.getElementById('relBtnEditarRascunho')) return;
  const botaoVoltar = toolbar.querySelector('button');
  const html = `<button type="button" id="relBtnEditarRascunho" class="botao-texto" onclick="abrirEditorRascunhoRelatorio('${currentRascunhoId}')">${menuIcone('editar', 16)} Editar</button>`;
  if (botaoVoltar) botaoVoltar.insertAdjacentHTML('afterend', html);
  else toolbar.insertAdjacentHTML('afterbegin', html);
}

/* Calcula os 7 lotes diretamente dos dados já carregados, sem precisar
   desenhar nenhuma mandala — assim a tabela de Lotes funciona mesmo se o
   preset não incluir nenhum bloco de mandala. */
function calcularLotesRelatorio() {
  const data = currentCalculatedData;
  const ascAbs = data.Ascendente.grau_absoluto;
  const pObj = {};
  PLANETS_DEF.forEach(p => {
    const item = data[p.key];
    pObj[p.id] = { abs: item ? item.grau_absoluto : 0 };
  });
  const isDay = ((pObj.Sun.abs - ascAbs + 360) % 360) >= 180;
  return { lotes: calculateSevenLots(ascAbs, isDay, pObj), ascAbs };
}

/* Desenha só as mandalas que o preset realmente usa (pode ser nenhuma,
   uma, ou as duas), restaurando a rotação da Casa 1 ao final.

   As duas ('claro', forçado — ver renderMandala/estiloForcado em
   mandala.js) nunca mudam de estilo com o Tema Escuro do MENU do
   astrólogo: são as mesmas usadas nas páginas do corpo do relatório
   (Mapa Natal/Mandala com a Fortuna), que ficam sobre o papel branco de
   sempre — não fazia sentido essas páginas mudarem de aparência só
   porque o astrólogo, sem querer, gerou o relatório com o menu do site
   em modo escuro.

   Quando a MESMA mandala também é a fonte da capa (capaFonte), desenha
   uma SEGUNDA cópia, só pra capa, com o fundo REMOVIDO (ver
   fundoTransparente em renderMandala) — nunca reaproveita a de 'claro'
   de cima pra capa: aquela tem um retângulo de fundo sólido (branco),
   que só por acaso combinava com a capa "Clássico"; qualquer outra cor
   de capa (até um creme quase branco) sobrava com uma borda vazando por
   trás, exatamente o "quadrado" que o astrólogo via na imagem. Sem
   fundo nenhum, a mandala encaixa direto na cor que a própria capa já
   tem, pintada por CSS (--rel-capa-bg), sem precisar "adivinhar"
   cor nenhuma pro desenho. estiloMandalaParaCapa ainda decide só a
   TINTA (números, linhas, halo) — clara ou escura — pra continuar
   legível em cima do fundo escolhido. A caixinha de nome/data/cidade
   dentro da própria imagem (corCabecalhoPng em mandala.js) é a única
   parte que NÃO fica transparente — ela usa a cor "Cabeçalho" salva no
   modelo (resolverCoresCapaRelatorio), passada como 5º argumento de
   renderMandala.

   Exceção: com o Tema Céu ativo, a capa não usa cópia nenhuma "sem
   fundo" — o CSS da capa já força roxo/dourado por cima de qualquer
   paleta do modelo (ver montarConteudoRelatorioHtml), então a mandala
   continua sendo a mesma cópia 'claro' de sempre, com o disco claro
   "flutuando" dentro do céu estrelado — o visual de sempre desse tema,
   que já funciona e não deve mudar aqui. */
/* Céu da capa (Tema Céu): o MESMO céu da mandala, guardado na hora de desenhar a roda da capa. Chaves:
   'mandala_natal' / 'mandala_fortuna'. Só existe quando a capa usa uma dessas duas mandalas. */
let relatorioCeuFundoCapa = {};

async function renderizarMandalasDoPreset(blocos, capaFonte) {
  // Calcula cada mandala se ela tiver página própria marcada no preset OU
  // se for a fonte escolhida pra capa (as duas coisas são independentes:
  // dá pra usar a Fortuna só na capa sem incluir a página dela no corpo).
  const precisaNatal = blocos.some(b => b.type === 'ferramenta' && b.id === 'mandala_natal') || capaFonte === 'mandala_natal';
  const precisaFortuna = blocos.some(b => b.type === 'ferramenta' && b.id === 'mandala_fortuna') || capaFonte === 'mandala_fortuna';
  const lotSalvo = selectedHouse1Lot;
  let png1 = null, png2 = null, png1Capa = null, png2Capa = null;
  relatorioCeuFundoCapa = {};

  const blocoCapa = (blocos || []).find(b => b.type === 'capa');
  const estiloCapa = estiloMandalaParaCapa(blocoCapa);
  const coresCapaParaMandala = resolverCoresCapaRelatorio(blocoCapa);
  const corCabecalhoCapa = coresCapaParaMandala.corCabecalho;
  const temaCeuAtivo = typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu';
  const precisaCapaSeparada = (capaFonte === 'mandala_natal' || capaFonte === 'mandala_fortuna');
  // O "círculo atrás da mandala" (medalhão) é desenhado DENTRO do SVG,
  // no mesmo centro matemático (cx/cy) que a roda inteira já usa (ver
  // corCirculoForcada em renderMandala/mandala.js) — nunca por CSS em
  // cima da imagem pronta, que não tem como saber onde a roda de fato
  // fica dentro da imagem (ela nunca é o centro geométrico do PNG: sobra
  // espaço embaixo pra caixinha de nome/data/cidade). Só entra quando o
  // astrólogo ligou o checkbox (temCirculo), fora do Tema Céu.
  const corCirculoCapa = (!temaCeuAtivo && coresCapaParaMandala.temCirculo) ? coresCapaParaMandala.corCirculo : null;

  if (precisaNatal) {
    selectedHouse1Lot = 'ASC';
    png1 = await new Promise(resolve => renderMandala(null, resolve, 'claro', false, null, null, temaCeuAtivo, false, temaCeuAtivo)); // Céu: roda de tinta sobre o papiro (o céu fica só na capa)
    if (precisaCapaSeparada && capaFonte === 'mandala_natal') {
      png1Capa = await new Promise(resolve => temaCeuAtivo
        ? renderMandala(null, resolve, 'claro', false, null, null, true, true) // Céu: sem o retângulo roxo (o céu da capa vem de relatorioCeuFundoCapa) e cabeçalho em papiro
        : renderMandala(null, resolve, estiloCapa, true, corCabecalhoCapa, corCirculoCapa));
      if (temaCeuAtivo) relatorioCeuFundoCapa.mandala_natal = window.ceuFundoCapaUltimo;
    }
  }
  if (precisaFortuna) {
    selectedHouse1Lot = 'fortune';
    png2 = await new Promise(resolve => renderMandala(null, resolve, 'claro', false, null, null, temaCeuAtivo, false, temaCeuAtivo));
    if (precisaCapaSeparada && capaFonte === 'mandala_fortuna') {
      png2Capa = await new Promise(resolve => temaCeuAtivo
        ? renderMandala(null, resolve, 'claro', false, null, null, true, true) // Céu: sem o retângulo roxo (o céu da capa vem de relatorioCeuFundoCapa) e cabeçalho em papiro
        : renderMandala(null, resolve, estiloCapa, true, corCabecalhoCapa, corCirculoCapa));
      if (temaCeuAtivo) relatorioCeuFundoCapa.mandala_fortuna = window.ceuFundoCapaUltimo;
    }
  }
  selectedHouse1Lot = lotSalvo; // não redesenha agora — só quando o usuário voltar pra mandala

  return { png1, png2, png1Capa, png2Capa };
}

function voltarConfigRelatorio() {
  // Zera qual rascunho estava em edição: sem isso, escolher outro modelo
  // no seletor e clicar "Gerar Relatório" de novo ia ATUALIZAR o mesmo
  // rascunho de antes (ex.: transformar o de "Retificação de Mapa" no de
  // "Mapa Natal Clássico") em vez de começar um relatório novo e
  // separado pro mesmo cliente. Só quando o astrólogo abre um rascunho
  // específico pela lista (abrirRascunhoRelatorio) é que currentRascunhoId
  // volta a apontar pra ele.
  currentRascunhoId = null;
  window.relatorioEditorAlvoAtual = null;
  // Recarrega do zero (modelos + rascunhos) em vez de reusar o que já
  // estava em memória — garante que a lista de rascunhos apareça
  // atualizada com o que acabou de ser gerado.
  iniciarModuloRelatorio();
}

/* TEMA "CÉU + PAPIRO" do relatório: vale quando o Tema Céu da Mandala
   está ativo (window.temaMandala, que já vem do Supabase). Devolve a
   classe que vai no .rel-viewer — o CSS correspondente (ver
   ".rel-tema-papiro" em injetarEstilosRelatorio) é SÓ pintura. */
function classeTemaPapiroRelatorio() {
  return (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu') ? ' rel-tema-papiro' : '';
}

/* Monta o conteúdo de dentro de ".rel-viewer" (capa + índice + páginas +
   encerramento) a partir de um preset (salvo ou "em memória", tanto faz)
   — extraída de montarEExibirRelatorio pra ser reaproveitada também pela
   prévia sob demanda do editor de modelo (atualizarPreviaEditorModelo),
   garantindo que as duas usam exatamente a mesma renderização. */
function montarConteudoRelatorioHtml(preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte, png1Capa, png2Capa) {
  const marcaHtml = perfil.logo_url
    ? `<img src="${perfil.logo_url}" alt="Logo do astrólogo" class="rel-logo-astrologo">`
    : '';
  const rodapeAstrologo = [perfil.nome, perfil.telefone, perfil.email].filter(Boolean);
  const capaClasseCeu = (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu') ? ' rel-capa-ceu' : '';
  // Paleta de cor escolhida PARA ESTE MODELO (ver RELATORIO_PALETAS_CAPA) —
  // aplicada via custom properties CSS, sempre calculada mesmo com o Tema
  // Céu ativo: a regra ".rel-capa.rel-capa-ceu" tem especificidade maior
  // que ".rel-capa" (que só lê essas variáveis), então o Céu vence sem
  // precisar de nenhum "if" aqui — é só CSS puro decidindo por cima.
  const blocoCapaCores = (preset.blocos || []).find(b => b.type === 'capa');
  const coresCapa = resolverCoresCapaRelatorio(blocoCapaCores);
  // Borda (moldura): só entra fora do Tema Céu — com ele ativo, o CSS já
  // força roxo/dourado por cima de qualquer paleta/borda do modelo (ver
  // .rel-capa-ceu), então a moldura nunca teria efeito visível mesmo
  // marcada, e só complicaria a estrutura à toa.
  const temaCeuAtivoCapa = capaClasseCeu !== '';
  const capaComBorda = coresCapa.temBorda && !temaCeuAtivoCapa;
  const capaClasseBorda = capaComBorda ? ' rel-capa-com-borda' : '';
  // O tamanho do título é só tipografia (não é cor nem tema), então
  // continua valendo mesmo com o Tema Céu ativo. O "círculo atrás da
  // mandala" NÃO entra aqui como CSS — ele é desenhado DENTRO do PNG da
  // mandala (ver corCirculoCapa em renderizarMandalasDoPreset), porque
  // só quem sabe onde o centro de verdade da roda fica dentro da imagem
  // é o próprio desenho da mandala (nunca é o centro geométrico do PNG —
  // sobra espaço embaixo pra caixinha de nome/data/cidade).
  const estiloCapaCores = ` style="--rel-capa-bg: ${coresCapa.corFundo}; --rel-capa-titulo: ${coresCapa.corTitulo}; --rel-capa-titulo-tamanho: ${coresCapa.tamanhoTituloPx}px;${capaComBorda ? ` --rel-capa-borda: ${coresCapa.corBorda};` : ''}"`;
  // "__capa__" e "__encerramento__" só guardam metadado/texto fixo (a
  // escolha da mandala da capa, o texto de fechamento) — não são páginas
  // do corpo do relatório, então nunca entram no map abaixo.
  const blocos = (preset.blocos || []).filter(b => b.type !== 'capa' && b.type !== 'encerramento');
  /* Capa Papiro escolhida no modelo (só vale no Tema Céu): folha de papiro inteira, título em terracota. Com a Mandala
     Natal/Fortuna na capa, a imagem é a roda em tinta (a mesma das páginas do corpo, png1/png2) e não a roda com céu. */
  const blocoCapaModelo = (preset.blocos || []).find(b => b.type === 'capa') || {};
  const capaPapiroEscolhida = capaClasseCeu !== '' && blocoCapaModelo.capaPapiro === true;
  let imgCapa = imagemCapaRelatorio(capaFonte, png1, png2, png1Capa, png2Capa);
  if (capaPapiroEscolhida && (capaFonte === 'mandala_fortuna' ? png2 : (capaFonte === 'mandala_natal' || !capaFonte) ? png1 : null)) {
    imgCapa = capaFonte === 'mandala_fortuna' ? png2 : png1;
  }
  /* Tema Céu + capa com a roda da própria mandala: o céu de fundo é o da mandala (ver relatorioCeuFundoCapa).
     A imagem da roda vai dentro de um invólucro do tamanho exato dela; o céu enorme é posicionado em
     porcentagens desse invólucro (alinhado ao centro da roda) e recortado pela folha da capa. */
  const ceuFundoCapa = (capaClasseCeu && !capaPapiroEscolhida && imgCapa && ((capaFonte === 'mandala_fortuna' && imgCapa === png2Capa) || (capaFonte !== 'mandala_fortuna' && imgCapa === png1Capa)))
    ? relatorioCeuFundoCapa[capaFonte === 'mandala_fortuna' ? 'mandala_fortuna' : 'mandala_natal'] : null;
  const imgCeuFundoHtml = ceuFundoCapa
    ? `<img class="rel-ceu-fundo" alt="" src="${ceuFundoCapa.url}" style="left: ${((ceuFundoCapa.cx - ceuFundoCapa.ext) / ceuFundoCapa.width * 100).toFixed(3)}%; top: ${((ceuFundoCapa.cy - ceuFundoCapa.ext) / ceuFundoCapa.height * 100).toFixed(3)}%; width: ${(ceuFundoCapa.ext * 2 / ceuFundoCapa.width * 100).toFixed(3)}%; height: ${(ceuFundoCapa.ext * 2 / ceuFundoCapa.height * 100).toFixed(3)}%;">`
    : '';
  /* Tema Céu + capa com uma imagem CAPTURADA numa ferramenta (Mandala Personalizada, Profecção, Sinastria,
     Liberação Zodiacal): essas imagens são em tinta sobre o papiro (sem céu), então a capa inteira vira folha de
     papiro (e não o céu escuro, onde a tinta sumiria) e a imagem ocupa a largura da folha. As capas de Mapa Natal
     e Fortuna (Mandala Natal/Fortuna do modelo) continuam com o céu. */
  const capaPapiro = capaClasseCeu !== '' && (capaPapiroEscolhida || (!!imgCapa && (capaFonte === 'mandala_personalizada' || capaFonte === 'profeccao' || capaFonte === 'sinastria' || (capaFonte || '').indexOf('liberacao_') === 0)));
  const blocoEncerramento = (preset.blocos || []).find(b => b.type === 'encerramento');
  const corpoEncerramento = (blocoEncerramento && blocoEncerramento.corpo) || RELATORIO_ENCERRAMENTO_PADRAO;

  const itensIndice = [];
  const paginasHtml = blocos.map(bloco => renderBlocoRelatorio(bloco, { png1, png2, lotesNatal, ascAbsNatal, itensIndice })).join('');

  const indiceHtml = itensIndice.map(item => `
    <li><span>${escapeHtml(item.titulo)}</span><span class="rel-num-pagina" data-alvo="${item.alvo}"></span></li>
  `).join('');

  return `
    <!-- CAPA (nome/data/local não se repetem aqui: já vêm no próprio
         cabeçalho que a mandala desenha dentro da imagem, quando ela existe) -->
    <section class="rel-page rel-capa${capaPapiro ? ' rel-capa-papiro' : capaClasseCeu}${ceuFundoCapa ? ' rel-capa-ceu-fundo' : ''}${capaClasseBorda}" data-pg="capa"${estiloCapaCores}>
      ${capaComBorda ? '<div class="rel-capa-moldura">' : ''}
      <h1 class="rel-titulo-capa">${escapeHtml(preset.nome)}</h1>
      ${imgCapa ? `
        <div class="rel-capa-centro">
          ${ceuFundoCapa ? `<div class="rel-capa-roda">${imgCeuFundoHtml}<img class="rel-img-capa" src="${imgCapa}" alt="${escapeHtml(preset.nome)}"></div>` : `<img class="rel-img-capa" src="${imgCapa}" alt="${escapeHtml(preset.nome)}">`}
        </div>
      ` : '<div class="rel-capa-centro"></div>'}
      <div class="rel-marca-rodape">
        ${marcaHtml}
        <div class="rel-powered-by">powered by Astro Hellenic</div>
      </div>
      ${capaComBorda ? '</div>' : ''}
    </section>

    <!-- ÍNDICE -->
    <section class="rel-page" data-pg="indice">
      <div class="rel-h1">Índice</div>
      <ul class="rel-indice">${indiceHtml}</ul>
    </section>

    ${paginasHtml}

    <!-- ENCERRAMENTO -->
    <section class="rel-page rel-page-encerramento" data-pg="encerramento">
      <div class="rel-corpo">${corpoEncerramento}</div>
      ${rodapeAstrologo.length ? `
        <div class="rel-rodape-astrologo">
          ${perfil.nome ? `<div class="rel-rodape-nome">${escapeHtml(perfil.nome)}</div>` : ''}
          ${perfil.telefone ? `<div>${escapeHtml(perfil.telefone)}</div>` : ''}
          ${perfil.email ? `<div>${escapeHtml(perfil.email)}</div>` : ''}
        </div>
      ` : ''}
    </section>
  `;
}

function montarEExibirRelatorio(container, preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte, png1Capa, png2Capa) {
  injetarEstilosRelatorio();

  // Guardado num global pra "Baixar PDF" (chamada só pelo onclick do botão
  // abaixo, sem parâmetro) saber o nome do modelo pro nome do arquivo.
  window.relatorioPresetAtual = preset;

  const conteudoHtml = montarConteudoRelatorioHtml(preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte, png1Capa, png2Capa);

  const htmlRelatorio = `
    <div class="rel-toolbar no-print" id="relToolbarFixa">
      <button type="button" class="botao-texto" onclick="voltarConfigRelatorio()">${menuIcone('voltar', 16)} Voltar</button>
      <button type="button" id="relBtnBaixarPdf" class="botao-texto" onclick="baixarRelatorioPDF()">${menuIcone('baixarArquivo', 16)} Baixar PDF</button>
    </div>
    <div id="relToolbarEspacador" class="no-print"></div>

    <div class="rel-viewer${classeTemaPapiroRelatorio()}">
      ${conteudoHtml}
    </div>
  `;

  container.innerHTML = htmlRelatorio;
  container.scrollTop = 0;
  window.scrollTo(0, 0); // fora do modo Mandala quem rola de verdade é a página, não o container
  dividirPaginasLongasEmFolhas(container);
  numerarPaginasIndice(container);
  ajustarEspacadoresBarraFixaRelatorio();
}

/* Monta o nome do arquivo baixado a partir do nome do modelo + o cliente
   carregado no momento — sem caracteres que travariam a hora de salvar
   o arquivo (ex.: "/" no meio de "Retificação/Mapa"). */
function nomeArquivoRelatorioPDF(preset) {
  const cliente = (typeof currentCustomCode !== 'undefined' && currentCustomCode)
    ? `${currentCustomCode} - ${currentSubjectName}`
    : (typeof currentSubjectName !== 'undefined' ? currentSubjectName : '');
  const bruto = cliente ? `${cliente} - ${preset.nome}` : (preset.nome || 'Relatorio');
  return bruto.replace(/[\\/:*?"<>|]/g, '-') + '.pdf';
}

/* GERA O PDF NUM CHROME HEADLESS DE VERDADE, rodando num serviço à
   parte (função serverless na Vercel, ver /api/gerar-pdf.js) — não é
   mais captura de tela (html2canvas+jsPDF). O motor de impressão
   nativo do navegador já tinha sido tentado antes desse mecanismo de
   captura e foi abandonado (ver CLAUDE.md) porque cada aparelho quem
   imprimia era o PRÓPRIO navegador do astrólogo/cliente — Safari/iPad
   em especial calculava a página errado. Aqui é diferente: é sempre o
   MESMO Chromium, rodando no servidor, nunca no aparelho de quem
   baixa — elimina exatamente essa inconsistência entre aparelhos.

   O que é enviado pro servidor é a MESMA prévia que já está certa na
   tela: o .rel-viewer inteiro (já paginado em folhas por
   dividirPaginasLongasEmFolhas, com os números de página já escritos
   em cada .rel-num-pagina-canto) mais o CSS de impressão que já existe
   (injetarEstilosRelatorio, incluindo o bloco @media print). O servidor
   só carrega esse HTML autônomo e usa a função nativa do Chrome de
   exportar pra PDF (page.pdf()) — texto de verdade, sem cortar nem
   fatiar imagem nenhuma. */
const RELATORIO_PDF_API_URL = 'https://astrohellenicgithubio.vercel.app/api/gerar-pdf';

/* A Vercel recusa corpo de requisição maior que ~4,5 MB ANTES de a função rodar — e essa recusa vem sem os cabeçalhos
   de CORS, então o navegador só mostra "Load failed" (Safari) / "Failed to fetch" (Chrome), sem dizer o motivo. Um
   relatório com várias capturas grandes (imagens em alta resolução embutidas no HTML) passa fácil disso. Por isso,
   antes de enviar, as imagens PNG grandes são redimensionadas (continuam PNG, com transparência) até o corpo caber;
   na folha A4 (190 mm de largura útil) 1500 px já dão ~200 dpi, nitidez de sobra. */
const RELATORIO_PDF_LIMITE_BYTES = 4.0 * 1024 * 1024;

function relatorioRedimensionarPngDataUrl(dataUrl, ladoMax) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const maior = Math.max(img.naturalWidth, img.naturalHeight);
      if (!maior || maior <= ladoMax) { resolve(dataUrl); return; }
      const k = ladoMax / maior;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try { resolve(canvas.toDataURL('image/png')); } catch (e) { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* Redimensiona, na cópia que vai pro servidor (nunca na tela), as imagens PNG embutidas até o corpo caber no limite. */
async function relatorioMontarCorpoPdfDentroDoLimite(montarHtml, raiz) {
  const pngs = Array.from(raiz.querySelectorAll('img')).filter(i => /^data:image\/png/i.test(i.getAttribute('src') || ''));
  let corpo = JSON.stringify({ html: montarHtml() });
  for (const ladoMax of [2400, 1800, 1400, 1100, 900]) {
    if (corpo.length <= RELATORIO_PDF_LIMITE_BYTES) break;
    for (const img of pngs) img.setAttribute('src', await relatorioRedimensionarPngDataUrl(img.getAttribute('src'), ladoMax));
    corpo = JSON.stringify({ html: montarHtml() });
  }
  return corpo;
}

async function baixarRelatorioPDF() {
  const viewer = document.querySelector('.rel-viewer');
  if (!viewer) return;
  if (viewer.dataset.gerandoPdf === '1') return;

  const botao = document.getElementById('relBtnBaixarPdf');
  const rotuloOriginal = botao ? botao.innerHTML : '';
  if (botao) { botao.disabled = true; botao.innerHTML = 'Gerando PDF...'; }
  viewer.dataset.gerandoPdf = '1';
  // aba nova pro PDF: tem que abrir AGORA, no toque (depois do await o navegador bloquearia)
  const abaPdf = window.astroAbaPdf ? window.astroAbaPdf.abrir() : null;

  try {
    const estilos = document.getElementById('relatorio-estilos');

    /* O Chrome headless que gera o PDF (api/gerar-pdf.js) recalcula o
       layout do zero, do jeito dele — e "flex: 1" + "object-fit" dentro
       de uma página com altura fixa (297mm) não dá o MESMO resultado lá
       que dá aqui na prévia, mesmo sendo o mesmo Chromium por baixo (a
       prévia já está certa, é comprovado; foi só medir o PDF de verdade
       — 29/09/2026 — que uma imagem de ferramenta capturada acabou
       crescendo mais que a página mesmo com "overflow: hidden", e o
       número da página foi parar sozinho numa folha extra). Em vez de
       confiar que os dois motores de layout vão concordar, mede-se o
       tamanho de VERDADE que cada imagem já está ocupando AQUI, na tela
       (onde já está garantidamente certo), converte pra milímetros, e
       fixa esse valor exato como "width"/"height" inline na cópia que
       vai pro PDF — "flex: none" trava esse tamanho contra qualquer
       "flex: 1"/"object-fit" tentando recalcular de novo lá do outro
       lado. O Chrome do PDF não decide mais nada sobre o tamanho da
       imagem, só desenha o número que a prévia já mediu. */
    const viewerParaPdf = viewer.cloneNode(true);
    const paginaReferencia = viewer.querySelector('.rel-page');
    const pxPorMm = paginaReferencia ? paginaReferencia.getBoundingClientRect().width / 210 : 0;
    if (pxPorMm > 0) {
      const imagensOriginais = viewer.querySelectorAll('.rel-img-captura, .rel-img-mandala');
      const imagensCopia = viewerParaPdf.querySelectorAll('.rel-img-captura, .rel-img-mandala');
      imagensOriginais.forEach((imgOriginal, i) => {
        const rect = imgOriginal.getBoundingClientRect();
        if (!rect.width || !rect.height) return; // imagem ainda não carregou/mediu — deixa o CSS de sempre resolver
        const imgCopia = imagensCopia[i];
        if (!imgCopia) return;
        const larguraMm = (rect.width / pxPorMm).toFixed(2);
        const alturaMm = (rect.height / pxPorMm).toFixed(2);
        imgCopia.style.cssText += `flex: none; width: ${larguraMm}mm; height: ${alturaMm}mm; max-width: ${larguraMm}mm; max-height: ${alturaMm}mm;`;
      });
    }

    const montarHtml = () => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Montserrat', sans-serif; }</style>
<style>${estilos ? estilos.textContent : ''}</style>
</head>
<body>${viewerParaPdf.outerHTML}</body>
</html>`;

    const corpo = await relatorioMontarCorpoPdfDentroDoLimite(montarHtml, viewerParaPdf);
    const tamanhoMB = (corpo.length / 1024 / 1024).toFixed(2);
    console.log('[PDF] Tamanho do corpo enviado:', tamanhoMB, 'MB');

    let resposta;
    try {
      resposta = await fetch(RELATORIO_PDF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: corpo
      });
    } catch (errRede) {
      // "Load failed"/"Failed to fetch": a conexão caiu sem resposta (rede, ou corpo grande demais pra Vercel).
      throw new Error(`a conexão com o servidor de PDF caiu (relatório com ${tamanhoMB} MB). Tente de novo; se repetir, me avise com este número.`);
    }
    if (!resposta.ok) {
      // Tenta ler o motivo que o servidor mandou (nosso próprio erro em
      // JSON, ou a página de erro genérica da Vercel) — sem isso, toda
      // falha vira o mesmo alerta genérico e ninguém descobre o motivo
      // sem ir direto nos logs da Vercel.
      let detalhe = '';
      try { detalhe = (await resposta.text()).slice(0, 300); } catch (_) {}
      throw new Error(`Servidor de PDF respondeu ${resposta.status}${detalhe ? ': ' + detalhe : ''}`);
    }

    // Diagnóstico do servidor: se ele precisou ajustar alguma folha pra não criar página extra, avisa (e registra no console).
    try {
      const ajustes = JSON.parse(decodeURIComponent(resposta.headers.get('X-PDF-Ajustes') || '[]'));
      if (ajustes.length) {
        console.log('[PDF] Folhas ajustadas pelo servidor:', ajustes);
        relatorioAvisoCurto('PDF: ajustei ' + ajustes.length + ' página(s) pra não criar folha extra (págs. ' + ajustes.map(a => a.pagina).join(', ') + ')', 8000);
      }
    } catch (_) { /* cabeçalho ausente ou ilegível: segue sem aviso */ }
    // Diagnóstico: se o PDF saiu com MAIS páginas que folhas no relatório, mostra quantas e quais folhas passaram de uma A4.
    try {
      const diag = JSON.parse(decodeURIComponent(resposta.headers.get('X-PDF-Diag') || 'null'));
      if (diag && diag.folhas && diag.paginasPdf > diag.folhas.total) {
        console.log('[PDF] Diagnóstico:', diag);
        const altas = (diag.folhas.altas || []).map(f => 'folha ' + f.pagina + ' (' + (f.classe || 'texto') + ', ' + f.altura + 'mm)').join('; ');
        relatorioAvisoCurto('PDF com ' + diag.paginasPdf + ' páginas para ' + diag.folhas.total + ' folhas' + (altas ? ' — altas: ' + altas : '') + (diag.corte ? ' — corrigido folha por folha' : ''), 25000);
      }
    } catch (_) { /* sem diagnóstico: segue */ }
    const blobPdf = await resposta.blob();
    window.astroAbaPdf.mostrar(abaPdf, blobPdf, nomeArquivoRelatorioPDF(window.relatorioPresetAtual || {}));
  } catch (err) {
    if (window.astroAbaPdf) window.astroAbaPdf.fechar(abaPdf);
    console.error('Erro ao gerar o PDF do relatório:', err);
    alert('Não foi possível gerar o PDF: ' + err.message);
  } finally {
    delete viewer.dataset.gerandoPdf;
    if (botao) { botao.disabled = false; botao.innerHTML = rotuloOriginal; }
  }
}
window.baixarRelatorioPDF = baixarRelatorioPDF;

/* Acha os <h2> dentro do HTML rico de um bloco de texto ("Título" no
   seletor "Tipo de Texto" da barra do Quill — ver inicializarQuillsPendentes)
   e dá um id próprio, único, pra cada um — registrando também uma linha
   nova em itensIndice, apontando pra esse id (não pro bloco inteiro).
   numerarPaginasIndice depois acha, pra cada id desses, EM QUAL PÁGINA
   ele fisicamente caiu (o que só se sabe depois de
   dividirPaginasLongasEmFolhas rodar, já que um bloco de texto comprido
   vira várias páginas). Sem isso, um único bloco de texto grande — o
   "Word-like" que o astrólogo pediu, pra não ficar com 10 blocos
   separados só pra aparecer no Índice — nunca teria como preencher o
   Índice com mais de UMA linha (a do próprio bloco). */
function marcarTitulosInternosComId(corpoHtml, blocoId, itensIndice) {
  if (!corpoHtml || (corpoHtml.indexOf('<h2') === -1 && corpoHtml.indexOf('<h3') === -1)) return corpoHtml;
  const temp = document.createElement('div');
  temp.innerHTML = corpoHtml;
  let contador = 0;
  // 'h2, h3' devolve os elementos na ordem em que aparecem no texto
  // (não agrupados por tag) — Título e Subtítulo intercalados entram no
  // Índice na mesma ordem em que o astrólogo escreveu.
  temp.querySelectorAll('h2, h3').forEach(elTitulo => {
    contador++;
    const id = `rel-titulo-int-${blocoId}-${contador}`;
    elTitulo.id = id;
    const texto = elTitulo.textContent.trim();
    if (texto) itensIndice.push({ titulo: texto, alvo: id });
  });
  return temp.innerHTML;
}

/* Renderiza um bloco do preset (texto ou ferramenta) como uma ou mais
   .rel-page, e — quando o bloco entra no índice — registra o item em
   opts.itensIndice pra virar uma linha na página de Índice. */
function renderBlocoRelatorio(bloco, opts) {
  if (bloco.type === 'texto') {
    // formato "rich": o corpo já É o HTML (negrito/cor/tamanho/lista,
    // vindo do Quill no editor) — cola direto, sem escapar nem re-quebrar
    // em parágrafos. Sem "formato" (todo preset salvo antes desta versão):
    // continua exatamente como sempre foi, texto puro com linha em branco
    // separando parágrafo.
    const corpoHtml = bloco.formato === 'rich'
      ? (bloco.corpo || '')
      : (bloco.corpo || '').split(/\n\s*\n/).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    let tabelaExtra = '';
    if (bloco.id === 'sete-lotes') tabelaExtra = renderTabelaLotesRelatorio(opts.lotesNatal, opts.ascAbsNatal);
    if (bloco.id === 'dodecatemorias') tabelaExtra = renderTabelaDodecatemoriasRelatorio();

    // Título do BLOCO (o campo fixo lá em cima do Quill, no editor) só
    // entra no Índice — e só desenha a caixa .rel-h1 — quando não está em
    // branco. Um bloco de texto único e grande ("Word-like", vários
    // "capítulos" internos via <h2>, ver logo abaixo) não precisa de um
    // título de bloco nenhum: sem isso, sobrava uma caixa vazia (só
    // borda/fundo, sem texto) no topo da primeira página dele.
    const temTituloProprio = Boolean((bloco.titulo || '').trim());
    if (temTituloProprio) opts.itensIndice.push({ titulo: bloco.titulo, alvo: bloco.id });

    // Cada <h2> dentro do texto (o astrólogo escolhe "Título" no seletor
    // "Tipo de Texto" da barra do Quill) ganha um id próprio e vira sua
    // PRÓPRIA linha no Índice — apontando pra ele mesmo, não pro bloco
    // inteiro. "Normal" (parágrafo comum) e imagem nunca entram aqui.
    const corpoComIdsHtml = marcarTitulosInternosComId(corpoHtml, bloco.id, opts.itensIndice);

    return `
      <section class="rel-page" data-pg="${escapeHtml(bloco.id)}">
        ${temTituloProprio ? `<div class="rel-h1">${escapeHtml(bloco.titulo)}</div>` : ''}
        <div class="rel-corpo">${corpoComIdsHtml}</div>
        ${tabelaExtra}
      </section>
    `;
  }

  if (bloco.type === 'ferramenta') {
    const idFerramenta = bloco.ferramentaId || bloco.id;
    const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[idFerramenta];

    /* Blocos "capturados": não recalculam nada — usam a imagem que o
       astrólogo trouxe da própria tela da ferramenta (botão "Adicionar
       ao Relatório"), exatamente como ficou montada lá, com o layout,
       ícones e realces que a ferramenta original já desenha. Cada bloco
       é UMA posição no relatório e usa UMA captura específica (a de
       índice bloco.capturaIndex) — o mesmo id de ferramenta pode
       aparecer em várias posições do preset, cada uma com sua própria
       captura e seu próprio texto ao redor. */
    if (info && info.capturada) {
      // rotuloIndice: nome que o astrólogo escreveu pra ESTA posição, no
      // campo "Nome no Índice" do editor — sem ele, cai no nome padrão
      // (sempre igual pra ferramenta, o que confunde quando a mesma
      // ferramenta entra em mais de um lugar do relatório).
      const titulo = bloco.rotuloIndice || (info.tituloIndice || info.label);
      opts.itensIndice.push({ titulo, alvo: bloco.id });
      const capturas = capturasDaFerramenta(idFerramenta);
      const idxCaptura = typeof bloco.capturaIndex === 'number' ? bloco.capturaIndex : 0;
      const captura = capturas[idxCaptura];
      if (!captura) {
        return `
          <section class="rel-page" data-pg="${escapeHtml(bloco.id)}">
            <div class="rel-h1">${escapeHtml(titulo)}</div>
            <div class="rel-corpo rel-captura-faltando">
              Nenhuma captura encontrada${capturas.length ? ' pra esta posição' : ''}. Abra ${escapeHtml(info.telaOrigem || 'a ferramenta')}
              com os dados deste cliente, deixe a tela do jeito que quer mostrar e clique em
              "Adicionar ao Relatório" antes de gerar o relatório de novo.
            </div>
          </section>
        `;
      }
      const tituloNaPaginaHtml = info.ocultarTituloNaPagina ? '' : `<div class="rel-titulo-captura">${escapeHtml(titulo)}</div>`;
      return `
        <section class="rel-page rel-page-captura" data-pg="${escapeHtml(bloco.id)}">
          ${tituloNaPaginaHtml}
          <div class="rel-captura-corpo">
            <img class="rel-img-captura" src="${captura.dataUrl}" alt="${escapeHtml(titulo)}">
          </div>
        </section>
      `;
    }

    if (bloco.id === 'mandala_natal' && opts.png1) {
      opts.itensIndice.push({ titulo: bloco.rotuloIndice || (info && info.tituloIndice) || 'Mapa Natal', alvo: bloco.id });
      return `
        <section class="rel-page rel-page-mapa" data-pg="${escapeHtml(bloco.id)}">
          <div class="rel-h1">Mapa Natal</div>
          <img class="rel-img-mandala" src="${opts.png1}" alt="Mandala 1">
          <div class="rel-legenda-mandala">Mandala 1</div>
        </section>
      `;
    }
    if (bloco.id === 'mandala_fortuna' && opts.png2) {
      return `
        <section class="rel-page rel-page-mapa" data-pg="${escapeHtml(bloco.id)}">
          <img class="rel-img-mandala" src="${opts.png2}" alt="Mandala 2">
          <div class="rel-legenda-mandala">Mandala 2</div>
        </section>
      `;
    }
  }

  return '';
}

/* QUEBRA DE PÁGINA DE VERDADE: um bloco de texto (.rel-corpo) OU o
   Índice (.rel-indice, uma lista à parte — não é um ".rel-corpo", por
   isso precisa ser considerado à parte aqui) mais alto que uma folha A4
   crescia numa .rel-page só, cada vez mais alta — sem nenhuma quebra
   visível, então na tela parecia "uma caixa gigante" e só virava várias
   folhas na hora de gerar o PDF, fatiando a IMAGEM já fotografada dessa
   caixa (ver baixarRelatorioPDF). Essa fatia era cega ao conteúdo
   (cortava no meio de qualquer altura, linha do índice inclusa) e não
   aparecia na prévia em tela — um relatório de muitas páginas (índice
   comprido) saía com o índice cortado ao meio de qualquer jeito no PDF,
   mesmo com a prévia em tela parecendo caber tudo numa página só.
   Agora, depois que o conteúdo está montado na tela (preciso do layout
   de verdade pra medir a altura de cada parágrafo/linha), caminha pelos
   filhos de CADA .rel-corpo/.rel-indice e, assim que a soma passaria do
   espaço de uma folha, cria uma NOVA .rel-page (mesma classe, mesmo
   estilo) logo depois e continua ali — movendo os elementos de
   verdade, não copiando. O resultado: cada .rel-page passa a ser mesmo
   UMA folha, na tela e no PDF (que nem precisa mais fatiar imagem
   nessas páginas). */
function dividirPaginasLongasEmFolhas(container) {
  const paginas = Array.from(container.querySelectorAll('.rel-viewer > .rel-page'));

  paginas.forEach(pagina => {
    const corpo = pagina.querySelector(':scope > .rel-corpo');
    const indice = pagina.querySelector(':scope > .rel-indice');
    const blocoConteudo = corpo || indice;
    if (!blocoConteudo || !blocoConteudo.children.length) return; // só divide bloco de texto corrido ou o índice

    const classeConteudo = corpo ? 'rel-corpo' : 'rel-indice';
    const tagConteudo = corpo ? 'div' : 'ul';

    // Orçamento de altura de UMA folha, no tamanho em que a página está
    // sendo exibida agora (a mesma proporção A4 que o CSS já aplica na
    // tela via aspect-ratio) — nunca um valor fixo em px, porque o
    // tamanho real varia com a largura da tela/painel.
    const larguraAtual = pagina.getBoundingClientRect().width;
    const alturaFolhaPx = larguraAtual * (297 / 210);
    const estilo = getComputedStyle(pagina);
    const orcamentoConteudoPx = alturaFolhaPx - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom);

    const h1Original = pagina.querySelector(':scope > .rel-h1');
    const tabelaExtra = pagina.querySelector(':scope > .rel-tabela-wrap');

    let paginaAtual = pagina;
    let corpoAtual = blocoConteudo;
    let alturaUsada = h1Original ? h1Original.getBoundingClientRect().height + 26 : 0; // 26px = margin-bottom do .rel-h1

    Array.from(blocoConteudo.children).forEach(filho => {
      // getBoundingClientRect() nunca inclui a margem do próprio elemento
      // (só a caixa de borda) — sem somar o margin-bottom aqui, cada
      // parágrafo/linha era subcontado por ele, e a folha acabava
      // passando do orçamento por várias vezes essa margem (perceptível
      // já com umas 20 linhas: 20 × 14px ≈ 280px de sobra, quase 1/4 de
      // folha).
      const alturaFilho = filho.getBoundingClientRect().height + parseFloat(getComputedStyle(filho).marginBottom || 0);
      if (alturaUsada > 0 && alturaUsada + alturaFilho > orcamentoConteudoPx && corpoAtual.children.length > 0) {
        const novaPagina = document.createElement('section');
        novaPagina.className = pagina.className;
        const novoCorpo = document.createElement(tagConteudo);
        novoCorpo.className = classeConteudo;
        novaPagina.appendChild(novoCorpo);
        paginaAtual.after(novaPagina);
        paginaAtual = novaPagina;
        corpoAtual = novoCorpo;
        alturaUsada = 0;
      }
      corpoAtual.appendChild(filho); // move o elemento de verdade — nunca clona
      alturaUsada += alturaFilho;
    });

    // Tabela extra (Sete Lotes/Dodecatemorias) é sempre o fecho do
    // bloco — se o texto acabou empurrando ela pra outra folha, segue
    // pra a folha onde o conteúdo realmente terminou.
    if (tabelaExtra && paginaAtual !== pagina) paginaAtual.appendChild(tabelaExtra);
  });
}

/* Preenche os números de página do Índice — chamada depois de
   dividirPaginasLongasEmFolhas, quando cada .rel-page já é, de verdade,
   uma folha física só (não precisa mais estimar quantas folhas um bloco
   comprido ocupa: ele já foi dividido em páginas separadas). */
function numerarPaginasIndice(container) {
  const paginas = container.querySelectorAll('.rel-viewer > .rel-page');
  let numeroAtual = 1;
  const numeroPorAlvo = {};

  paginas.forEach(pagina => {
    if (pagina.dataset.pg) numeroPorAlvo[pagina.dataset.pg] = numeroAtual;

    // "Títulos" internos (ver marcarTitulosInternosComId) que caíram
    // FISICAMENTE dentro desta página — só dá pra saber isso agora,
    // depois que dividirPaginasLongasEmFolhas já moveu cada <h2> pra
    // página de verdade em que ele ficou (um bloco de texto comprido
    // pode ter títulos internos espalhados por várias páginas dele).
    pagina.querySelectorAll('[id^="rel-titulo-int-"]').forEach(elTitulo => {
      numeroPorAlvo[elTitulo.id] = numeroAtual;
    });

    // Número no canto inferior direito da PRÓPRIA página (não só no
    // Índice) — pra aparecer tanto na prévia em tela quanto pra quem só
    // olhar aqui sem baixar o PDF. É esse MESMO elemento que aparece no
    // PDF baixado (baixarRelatorioPDF manda o .rel-viewer como está, sem
    // esconder nada) — não tem número desenhado à parte.
    let selo = pagina.querySelector(':scope > .rel-num-pagina-canto');
    if (!selo) {
      selo = document.createElement('div');
      selo.className = 'rel-num-pagina-canto';
      pagina.appendChild(selo);
    }
    selo.textContent = numeroAtual;
    numeroAtual += 1;
  });

  container.querySelectorAll('.rel-num-pagina[data-alvo]').forEach(span => {
    const numero = numeroPorAlvo[span.dataset.alvo];
    if (numero) span.textContent = numero;
  });
}

/* Célula no padrão da Tabela Técnica: ícone em cima, rótulo pequeno embaixo. */
function relatorioCelulaIconeRotulo(iconHTML, rotulo) {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
      ${iconHTML}
      <span style="font-size: 9px; font-weight: 600; color: #103b70; line-height: 1.1; text-align: center;">${escapeHtml(rotulo)}</span>
    </div>
  `;
}

function renderTabelaLotesRelatorio(lotesNatal, ascAbsNatal) {
  if (!lotesNatal || !lotesNatal.length) return '';
  if (typeof casaDoGrauLotes !== 'function' || typeof SIGN_NAMES_LOTES === 'undefined') return '';
  if (typeof getSignSVG !== 'function' || typeof getItemSVG !== 'function') return '';

  const ordemPadrao = ['fortune', 'spirit', 'venus', 'mercury', 'mars', 'jupiter', 'saturn'];
  const linhas = ordemPadrao.map(key => {
    const lot = lotesNatal.find(l => l.key === key);
    if (!lot) return '';
    const signIdx = Math.floor(((lot.deg % 360) + 360) % 360 / 30);
    const casa = casaDoGrauLotes(lot.deg, ascAbsNatal);
    // getItemSVG é o ícone próprio dos lotes (círculo azul), o mesmo usado
    // na Tabela Técnica e independente do estilo de ícone dos planetas.
    return `
      <tr>
        <td class="col-ponto">${relatorioCelulaIconeRotulo(getItemSVG(key), RELATORIO_LOT_NOMES[key] || key)}</td>
        <td class="col-signo">${relatorioCelulaIconeRotulo(getSignSVG(signIdx, 18), SIGN_NAMES_LOTES[signIdx])}</td>
        <td class="col-grau">${formatDegMin(lot.deg)}</td>
        <td>Casa ${casa}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="rel-tabela-wrap">
      <div class="rel-tabela-caixa">
        <table class="tabela-enxuta">
          <thead><tr><th>Lote</th><th>Signo</th><th>Grau</th><th>Casa Nativa</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTabelaDodecatemoriasRelatorio() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) return '';
  if (typeof calcDodecatemoriaTabela !== 'function' || typeof PLANETS_DEF === 'undefined' || typeof SIGNS === 'undefined') return '';
  if (typeof getSignSVG !== 'function' || typeof getPlanet3DSVG !== 'function') return '';

  const data = currentCalculatedData;
  const linhas = PLANETS_DEF.map(p => {
    const item = data[p.key];
    if (!item) return '';
    const absDeg = item.grau_absoluto;
    const signIdxNatal = Math.floor(((absDeg % 360) + 360) % 360 / 30);
    const dodec = calcDodecatemoriaTabela(absDeg);
    return `
      <tr>
        <td class="col-ponto">${relatorioCelulaIconeRotulo(getPlanet3DSVG(p.id, 30), p.name)}</td>
        <td class="col-signo">${relatorioCelulaIconeRotulo(getSignSVG(signIdxNatal, 18), SIGNS[signIdxNatal].name)}</td>
        <td class="col-signo">${dodec.signIdx >= 0 ? relatorioCelulaIconeRotulo(getSignSVG(dodec.signIdx, 18), SIGNS[dodec.signIdx].name) : '-'}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="rel-tabela-wrap">
      <div class="rel-tabela-caixa">
        <table class="tabela-enxuta">
          <thead><tr><th>Planeta</th><th>Signo Natal</th><th>Dodecatemória</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* Injeta o CSS do relatório uma única vez no <head> (não dentro do
   #mandala-container: esse container é substituído inteiro a cada
   navegação — voltar pra Config e gerar de novo apagaria um <style>
   que estivesse ali dentro). */
function injetarEstilosRelatorio() {
  if (document.getElementById('relatorio-estilos')) return;
  const style = document.createElement('style');
  style.id = 'relatorio-estilos';
    /* Fundo de papiro das folhas: UMA imagem (papiro-folha.js) em vez de várias camadas de gradiente — no PDF as
     camadas deixavam a abertura lenta nos aparelhos (página branca por vários segundos). Sem o arquivo,
     cai nas camadas de gradiente de sempre. */
  /* Cores vêm do papiro global (papiro.css/papiro.js) — aqui valores literais, não var(), porque este CSS
     também vai pro PDF (HTML mandado pro servidor), que não tem o papiro.css. */
  const papiroCoresRel = papiroCores();
  const papiroFolhaBg = (typeof window !== 'undefined' && window.PAPIRO_FOLHA_JPG)
    ? `url("${window.PAPIRO_FOLHA_JPG}") center / 100% 100% no-repeat, ${papiroCoresRel.meio}`
    : `radial-gradient(ellipse at 12% 6%, rgba(255,244,210,0.6) 0%, transparent 40%),
          radial-gradient(ellipse at 90% 96%, rgba(110,70,30,0.22) 0%, transparent 45%),
          repeating-linear-gradient(0deg, rgba(120,85,40,0.07) 0px, rgba(120,85,40,0.07) 1px, transparent 1px, transparent 6px),
          repeating-linear-gradient(90deg, rgba(150,110,60,0.05) 0px, rgba(150,110,60,0.05) 2px, transparent 2px, transparent 27px),
          linear-gradient(180deg, ${papiroCoresRel.topo} 0%, ${papiroCoresRel.meio} 50%, ${papiroCoresRel.base} 100%)`;
  style.textContent = `
      /* .rel-viewer é só a "mesa" cinza atrás das folhas — as folhas em si
         (.rel-page e tudo dentro dela, mais abaixo) ficam de propósito
         sempre brancas/creme, porque são exatamente o que vira PDF/imagem
         pro cliente (mesmo motivo do .rel-quill-mount lá em cima). */
      .rel-viewer { background: var(--viewer-bg); padding: 24px 12px; }

      .rel-page {
        position: relative;
        width: 210mm;
        max-width: 100%;
        margin: 0 auto 24px auto;
        background: #ffffff;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        padding: 18mm 16mm;
        box-sizing: border-box;
        font-family: 'Montserrat', sans-serif;
      }

      /* Número da página, canto inferior direito — mesma posição e cor
         do número escrito de verdade em cada folha do PDF baixado (ver
         numerarPaginaPdf em baixarRelatorioPDF). Escondido durante a
         captura de tela de cada página pro PDF, senão ficaria em dobro
         (o da imagem capturada + o que o jsPDF escreve por cima). */
      .rel-num-pagina-canto { position: absolute; right: 10mm; bottom: 8mm; font-size: 10px; font-weight: 700; color: #9a6d18; font-family: 'Montserrat', sans-serif; }

      /* Altura mínima proporcional à largura (razão A4: 210x297mm), só
         na PRÉVIA em tela — trancada num "@media screen" (nunca dentro
         da regra base, nem tentando "desligar" com aspect-ratio:auto
         dentro do @media print) porque motor de impressão do
         Safari/iPad já mostrou não recalcular esse valor do jeito
         esperado durante a paginação, e essa mistura foi o que causava
         a capa inteira transbordar pra uma segunda página quase em
         branco. Assim a impressão nunca vê aspect-ratio: só a prévia em
         tela usa (min-height fixo em mm sozinho fazia a página ficar
         mais estreita e comprida que uma A4 de verdade em painéis mais
         estreitos que 210mm — ver histórico do PR que introduziu isso). */
      @media screen {
        .rel-page { aspect-ratio: 210 / 297; }
      }

      .rel-h1 {
        font-family: 'Cinzel', serif; font-size: 19px; font-weight: 800; color: #103b70;
        text-align: center; text-transform: uppercase; letter-spacing: 0.04em;
        border: 1.5px solid #c59b27; border-radius: 8px; padding: 14px; margin-bottom: 26px; background: #fffdf5;
        break-inside: avoid; page-break-inside: avoid;
      }

      .rel-corpo p { font-size: 12.5px; line-height: 1.85; color: #1e293b; text-align: justify; margin-bottom: 14px; }
      .rel-corpo img { max-width: 100%; height: auto; display: block; margin: 4px auto 14px; border-radius: 8px; }

      /* Alinhamento (ver [{align:[]}] na barra do Quill) — o Quill marca
         o próprio parágrafo/título/item de lista com uma destas classes;
         sem essa regra aqui, .rel-corpo p (acima) sempre ganhava com
         text-align:justify fixo, e as outras opções da barra pareciam
         "travadas"/sem efeito nenhum no relatório final (mesmo mudando
         na tela do Quill). Mais específico (2 classes) que ".rel-corpo p"
         (1 classe + 1 tag), então sobrescreve sem precisar de !important. */
      .rel-corpo .ql-align-left { text-align: left; }
      .rel-corpo .ql-align-center { text-align: center; }
      .rel-corpo .ql-align-right { text-align: right; }
      .rel-corpo .ql-align-justify { text-align: justify; }

      /* "Título"/"Subtítulo" internos (ver [{header:[2,3,false]}] na
         barra do Quill) — mais discretos que .rel-h1 (que é a caixa
         grande, com borda e fundo, do topo de CADA bloco): são
         subtítulos dentro do texto corrido, pra dividir um bloco só de
         texto em "capítulos"/"subcapítulos" sem precisar de blocos
         separados. Cada um vira uma linha própria no Índice (ver
         marcarTitulosInternosComId/numerarPaginasIndice). */
      /* Mesma cara de caixa do .rel-h1 (contorno dourado, fundo, canto
         arredondado, padding) — só um pouco menor, pra ainda dar pra
         diferenciar do título do bloco (.rel-h1, o único por página). */
      .rel-corpo h2 {
        font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: #103b70;
        text-align: center; text-transform: uppercase; letter-spacing: 0.03em;
        border: 1.5px solid #c59b27; border-radius: 8px; padding: 10px; margin: 22px 0 16px; background: #fffdf5;
        break-inside: avoid; page-break-inside: avoid; break-after: avoid; page-break-after: avoid;
      }
      .rel-corpo h3 { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #9a6d18; margin: 18px 0 8px; break-after: avoid; page-break-after: avoid; }
      .rel-corpo h2:first-child, .rel-corpo h3:first-child { margin-top: 0; }

      /* Listas do texto rico (Quill) dentro de um bloco de texto — o
         resto da formatação (negrito, itálico, sublinhado, cor, tamanho)
         já vem com tag/estilo inline suficiente sozinha, sem precisar de
         CSS extra aqui. */
      .rel-corpo ul, .rel-corpo ol { font-size: 12.5px; line-height: 1.85; color: #1e293b; margin: 0 0 14px; padding-left: 22px; }
      .rel-corpo li { margin-bottom: 4px; }

      .rel-indice { list-style: none; padding: 0; margin: 0; }
      .rel-indice li { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-size: 13px; font-weight: 600; color: #103b70; padding: 10px 4px; border-bottom: 1px solid #e2d9c2; }
      .rel-num-pagina { font-weight: 700; color: #9a6d18; }

      /* TABELAS: mesmo padrão visual (cores, bordas, ícones, contorno
         arredondado) da Tabela Técnica (classe .tabela-enxuta e o wrapper
         com border-radius, definidos também em tabelaTecnica.js) —
         repetido aqui porque o CSS daquele módulo só existe enquanto ele
         está aberto, e some do documento quando se troca de ferramenta.
         O contorno arredondado tem que ficar num DIV por fora da table:
         border-radius não tem efeito numa table com border-collapse. */
      .rel-tabela-wrap { margin-top: 18px; text-align: center; }
      .rel-tabela-caixa { display: inline-block; text-align: left; border: 2px solid #1e5fa4; border-radius: 12px; overflow: hidden; }
      .tabela-enxuta { border-collapse: collapse; font-family: 'Montserrat', sans-serif; background: #ffffff; font-size: 12px; color: #0f172a; }
      .tabela-enxuta th, .tabela-enxuta td { border: 1px solid #1e5fa4; padding: 8px 10px; text-align: center; vertical-align: middle; }
      .tabela-enxuta th { background-color: #fffdf5; font-weight: 700; color: #103b70; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
      .tabela-enxuta tr { break-inside: avoid; page-break-inside: avoid; }

      /* CAPA: título fixo no topo, mandala centralizada no espaço que
         sobra, e a marca do astrólogo + "powered by" fixas no rodapé —
         por isso a página inteira (não só o conteúdo) precisa virar um
         flex column de cima a baixo. */
      .rel-capa { display: flex; flex-direction: column; align-items: center; text-align: center; background: var(--rel-capa-bg, #ffffff); }
      /* BORDA (MOLDURA) DA CAPA — ver relatorioPaletaCapaHtml/montarConteudoRelatorioHtml.
         Faixa FINA (5mm) de propósito — nada a ver com o padding normal
         da página (18mm/16mm, ver ".rel-page" na regra base): a primeira
         versão reaproveitava esse padding grande como largura da moldura
         e saiu enorme/desproporcional (reportado pelo astrólogo). A cor
         da borda pinta essa faixa fina (".rel-capa-com-borda" some com o
         padding de sempre e usa um "padding" próprio, bem menor); o
         retângulo de dentro (".rel-capa-moldura") recebe de volta o
         mesmo respiro de sempre (18mm/16mm) pro título/mandala/rodapé
         não mudarem de posição, só que agora dentro de um cartão com
         cantos arredondados, com a cor da borda sobrando só naquela
         faixa fina ao redor.

         ".rel-capa-moldura" usa "flex: 1" (não "height: 100%") de
         propósito — é o mesmo "flex: 1" que ".rel-capa-centro" já usa
         duas linhas abaixo, e existe um motivo bem específico pra isso
         (ver o comentário de ".rel-capa { height: 250mm }" no @media
         print, mais abaixo): o motor de impressão do Safari/iPad já
         demonstrou não repassar direito uma altura definida por
         porcentagem ("height: 100%") pra dentro de um flexbox — foi
         exatamente isso que fez a capa vazar pra uma segunda página
         quase em branco quando a borda usava "height: 100%" aqui. */
      .rel-capa.rel-capa-com-borda { background: var(--rel-capa-borda, var(--rel-capa-bg, #ffffff)); padding: 5mm; }
      .rel-capa-moldura { width: 100%; flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; text-align: center; background: var(--rel-capa-bg, #ffffff); border-radius: 8px; box-sizing: border-box; padding: 18mm 16mm; }
      .rel-titulo-capa { font-family: 'Cinzel', serif; font-weight: 800; color: var(--rel-capa-titulo, #103b70); font-size: var(--rel-capa-titulo-tamanho, 30px); line-height: 1.25; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 14mm; flex-shrink: 0; }
      .rel-capa-centro { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 0; }
      /* max-height em mm fixo, não em porcentagem: "100%" dependia da
         altura do pai (.rel-capa-centro, dentro do flexbox da capa) ser
         "definida" pro navegador — no motor de impressão do Safari/iPad
         isso não resolvia direito e a porcentagem virava "sem limite",
         deixando a mandala esticar (achatada) até o tamanho que o
         max-width permitisse. Um valor fixo nunca depende disso. */
      .rel-img-capa { max-width: 78mm; max-height: 140mm; }
      .rel-marca-rodape { flex-shrink: 0; margin-top: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; break-inside: avoid; page-break-inside: avoid; }
      .rel-logo-astrologo { max-height: 46px; max-width: 220px; object-fit: contain; }
      .rel-powered-by { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }

      /* CAPA com o tema "Céu": fundo roxo (a mesma cor de fundo que a
         mandala usa nesse tema) e o título em dourado em vez de azul.
         Só a capa muda — as páginas da Mandala 1/2 continuam iguais. */
      /* Céu do site (falandodeastrologia, home.css): degradê azul-noite -> roxo,
         mancha laranja só no pé e estrelas — só fundo (pintura). As estrelas
         são um SVG de uma camada só, repetido na horizontal (repeat-x), que só
         ocupa o alto da folha e some pra baixo, como no site. */
      .rel-capa.rel-capa-ceu {
        background:
          url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='760' height='900'><circle cx='124' cy='199' r='0.88' fill='%23dfe8ff' fill-opacity='0.79'/><circle cx='83' cy='463' r='0.85' fill='%23ffffff' fill-opacity='0.65'/><circle cx='77' cy='141' r='0.80' fill='%23dfe8ff' fill-opacity='0.82'/><circle cx='322' cy='75' r='0.94' fill='%23dfe8ff' fill-opacity='0.86'/><circle cx='471' cy='530' r='0.85' fill='%23dfe8ff' fill-opacity='0.61'/><circle cx='302' cy='333' r='0.99' fill='%23dfe8ff' fill-opacity='0.72'/><circle cx='111' cy='323' r='0.80' fill='%23ffffff' fill-opacity='0.72'/><circle cx='238' cy='90' r='0.94' fill='%23dfe8ff' fill-opacity='0.85'/><circle cx='428' cy='82' r='0.72' fill='%23dfe8ff' fill-opacity='0.86'/><circle cx='61' cy='318' r='0.67' fill='%23dfe8ff' fill-opacity='0.73'/><circle cx='399' cy='291' r='0.92' fill='%23f6e7b4' fill-opacity='0.74'/><circle cx='342' cy='338' r='0.75' fill='%23dfe8ff' fill-opacity='0.71'/><circle cx='191' cy='398' r='0.85' fill='%23ffffff' fill-opacity='0.68'/><circle cx='263' cy='290' r='0.81' fill='%23ffffff' fill-opacity='0.74'/><circle cx='100' cy='547' r='0.80' fill='%23f6e7b4' fill-opacity='0.60'/><circle cx='368' cy='108' r='0.66' fill='%23ffffff' fill-opacity='0.84'/><circle cx='418' cy='68' r='0.93' fill='%23f6e7b4' fill-opacity='0.86'/><circle cx='268' cy='208' r='0.82' fill='%23f6e7b4' fill-opacity='0.79'/><circle cx='83' cy='64' r='0.74' fill='%23ffffff' fill-opacity='0.87'/><circle cx='59' cy='380' r='0.90' fill='%23ffffff' fill-opacity='0.69'/><circle cx='507' cy='334' r='0.81' fill='%23ffffff' fill-opacity='0.72'/><circle cx='498' cy='232' r='0.66' fill='%23f6e7b4' fill-opacity='0.77'/><circle cx='456' cy='216' r='0.82' fill='%23dfe8ff' fill-opacity='0.78'/><circle cx='109' cy='435' r='0.74' fill='%23f6e7b4' fill-opacity='0.66'/><circle cx='374' cy='514' r='0.71' fill='%23f6e7b4' fill-opacity='0.62'/><circle cx='653' cy='319' r='0.94' fill='%23ffffff' fill-opacity='0.72'/><circle cx='315' cy='175' r='0.78' fill='%23f6e7b4' fill-opacity='0.80'/><circle cx='124' cy='536' r='0.71' fill='%23dfe8ff' fill-opacity='0.61'/><circle cx='24' cy='377' r='0.94' fill='%23dfe8ff' fill-opacity='0.69'/><circle cx='18' cy='167' r='0.80' fill='%23f6e7b4' fill-opacity='0.81'/><circle cx='245' cy='351' r='0.69' fill='%23ffffff' fill-opacity='0.71'/><circle cx='488' cy='532' r='0.91' fill='%23f6e7b4' fill-opacity='0.61'/><circle cx='578' cy='505' r='0.96' fill='%23ffffff' fill-opacity='0.62'/><circle cx='303' cy='235' r='0.69' fill='%23ffffff' fill-opacity='0.77'/><circle cx='153' cy='240' r='0.99' fill='%23f6e7b4' fill-opacity='0.77'/><circle cx='261' cy='113' r='0.67' fill='%23dfe8ff' fill-opacity='0.84'/><circle cx='403' cy='328' r='0.98' fill='%23ffffff' fill-opacity='0.72'/><circle cx='646' cy='41' r='0.86' fill='%23dfe8ff' fill-opacity='0.88'/><circle cx='705' cy='364' r='0.86' fill='%23f6e7b4' fill-opacity='0.70'/><circle cx='628' cy='92' r='1.00' fill='%23f6e7b4' fill-opacity='0.85'/><circle cx='240' cy='282' r='0.70' fill='%23ffffff' fill-opacity='0.74'/><circle cx='206' cy='209' r='0.94' fill='%23dfe8ff' fill-opacity='0.79'/><circle cx='163' cy='301' r='0.98' fill='%23f6e7b4' fill-opacity='0.73'/><circle cx='407' cy='105' r='0.66' fill='%23ffffff' fill-opacity='0.84'/><circle cx='479' cy='185' r='0.68' fill='%23f6e7b4' fill-opacity='0.80'/><circle cx='671' cy='302' r='0.77' fill='%23dfe8ff' fill-opacity='0.73'/><circle cx='578' cy='310' r='0.77' fill='%23dfe8ff' fill-opacity='0.73'/><circle cx='584' cy='353' r='0.92' fill='%23dfe8ff' fill-opacity='0.71'/><circle cx='606' cy='404' r='1.53' fill='%23fff6d0' fill-opacity='0.80'/><circle cx='371' cy='121' r='1.53' fill='%23fff6d0' fill-opacity='0.94'/><circle cx='356' cy='397' r='1.29' fill='%23ffffff' fill-opacity='0.80'/><circle cx='692' cy='236' r='1.64' fill='%23ffffff' fill-opacity='0.88'/><circle cx='89' cy='65' r='1.41' fill='%23ffffff' fill-opacity='0.97'/><circle cx='466' cy='123' r='1.61' fill='%23fff6d0' fill-opacity='0.94'/><circle cx='487' cy='251' r='1.56' fill='%23fff6d0' fill-opacity='0.87'/><circle cx='102' cy='418' r='1.37' fill='%23fff6d0' fill-opacity='0.79'/><circle cx='144' cy='251' r='1.56' fill='%23ffffff' fill-opacity='0.87'/><circle cx='698' cy='68' r='1.52' fill='%23ffffff' fill-opacity='0.97'/><circle cx='699' cy='215' r='1.53' fill='%23fff6d0' fill-opacity='0.89'/><circle cx='35' cy='492' r='1.47' fill='%23ffffff' fill-opacity='0.75'/></svg>") 0 0 / 760px 900px repeat-x,
          radial-gradient(ellipse 90% 380px at 50% 100%, rgba(232,112,44,0.55) 0%, rgba(196,84,52,0.28) 40%, transparent 100%),
          linear-gradient(to top, #3a2f5e 0%, #23305f 14%, #15214a 40%, #0d1738 70%, #070d25 100%);
      }
      .rel-capa.rel-capa-ceu .rel-titulo-capa { color: #B5852F; }
      /* CAPA EM PAPIRO (Tema Céu + imagem capturada: Personalizada/Profecção/Sinastria/Liberação): mesma folha de
         papiro das outras páginas, título em terracota, resto em tinta. A imagem ocupa a largura da folha (em vez
         dos 78mm da capa de céu), com folga de altura de sobra pra título e rodapé. */
      .rel-capa.rel-capa-papiro { background: ${papiroFolhaBg}; outline: 1.2mm double #1a1410; outline-offset: -5mm; }
      .rel-capa.rel-capa-papiro .rel-titulo-capa { color: #a03e25; }
      .rel-capa.rel-capa-papiro .rel-powered-by { color: #1a1410; }
      .rel-capa.rel-capa-papiro .rel-img-capa { max-width: 172mm; max-height: 150mm; }
      /* Capa com o céu DA MANDALA (mesmo Sol/horizonte/brilho da roda): o fundo antigo (degradê com mancha laranja
         fixa no pé) sai; o céu é um SVG enorme atrás da roda, recortado pela folha. z-index negativo dentro da
         própria capa (isolation) = fica atrás do título, da roda e do rodapé. */
      .rel-capa.rel-capa-ceu.rel-capa-ceu-fundo { background: #070d25; isolation: isolate; overflow: hidden; }
      .rel-capa.rel-capa-ceu-fundo .rel-img-capa { max-width: 150mm; max-height: 160mm; }
      .rel-capa-roda { position: relative; display: inline-block; line-height: 0; }
      .rel-ceu-fundo { position: absolute; max-width: none; max-height: none; z-index: -1; pointer-events: none; }

      /* PÁGINAS DAS MANDALAS — .rel-img-mandala só tinha limite de LARGURA
         (max-width: 175mm), nunca de altura. Pra maioria das mandalas
         (formato ~quadrado) isso nunca dava problema, mas uma mandala
         proporcionalmente mais alta que larga estica pra baixo sem limite
         nenhum e não cabe na folha — empurra o .rel-num-pagina-canto pra
         fora da página e cria uma página extra quase em branco, mesmo
         sintoma de .rel-capa/.rel-page-captura (ver comentários no
         @media print), só que essa página tinha ficado de fora porque
         até 29/09/2026 nunca tinha reproduzido na prática. Corrigido com
         o mesmo padrão: "flex: 1" + "min-height: 0" na própria <img>
         (aqui não existe uma div .rel-captura-corpo por fora dela pra
         carregar isso, então vai direto na tag) faz a imagem dividir o
         espaço vertical da página com o título/legenda em vez de crescer
         livre, e "object-fit: contain" encolhe ela proporcionalmente
         pra caber no espaço que sobrar (nunca esmagada/distorcida). */
      .rel-page-mapa { display: flex; flex-direction: column; align-items: center; }
      .rel-img-mandala { width: 100%; max-width: 175mm; margin-top: 10px; flex: 1; min-height: 0; object-fit: contain; }
      .rel-legenda-mandala { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 12px; }

      /* BLOCOS "CAPTURADOS" DE OUTRAS FERRAMENTAS (ex.: Profecção) — a
         página existe só pra emoldurar a imagem trazida da tela real da
         ferramenta, sem redesenhar nada ao redor dela. O título (o mesmo
         nome que aparece no Índice) fica em cima da imagem, só a escrita
         mesmo — sem a caixa com fundo creme e contorno do ".rel-h1" dos
         blocos de texto — pra identificar a imagem sem competir com ela. */
      .rel-page-captura { display: flex; flex-direction: column; padding: 14mm 10mm; }
      .rel-titulo-captura {
        font-family: 'Cinzel', serif; font-size: 17px; font-weight: 800; color: #103b70;
        text-align: center; text-transform: uppercase; letter-spacing: 0.04em;
        margin-bottom: 14px; flex-shrink: 0;
      }
      /* ATUALIZAÇÃO (29/09/2026): a versão anterior dava "max-height:100%"
         pra .rel-img-captura, uma PORCENTAGEM calculada em cima da altura
         de .rel-captura-corpo — que por sua vez só existe porque ELA
         TAMBÉM é "flex: 1" (duas camadas de flexbox empilhadas). Isso é
         exatamente o mesmo risco já documentado no comentário de
         ".rel-capa { height: 250mm }" mais abaixo (motor de impressão que
         não repassa direito uma altura "calculada" por flexbox pra uma
         porcentagem de dentro dela resolver) — só que essa página tinha
         ficado de fora daquela lição na hora de escrever o código.
         Sintoma: imagem alta empurrando .rel-num-pagina-canto pra outra
         página, criando uma página extra quase em branco — mesmo defeito
         de sempre, com aparência de "cabe" porque o corte só falha às
         vezes, não sempre.

         Corrigido eliminando a porcentagem por completo: .rel-img-captura
         agora é ELA MESMA "flex: 1" (o mesmo padrão de .rel-img-mandala,
         ver comentário dela em "PÁGINAS DAS MANDALAS") — sem nenhuma
         conta de porcentagem em cima de altura calculada, o próprio motor
         de flexbox distribui o espaço entre título e imagem direto, e
         "object-fit: contain" encolhe a imagem proporcionalmente pra
         caber no espaço que sobrar (nunca esmagada/cortada).

         ATUALIZAÇÃO (29/09/2026, mais tarde) — essa promessa ("nunca
         esmagada/cortada") era FALSA na prática: "align-items: center"
         faz o item flex NÃO esticar no eixo cruzado (altura, já que
         .rel-captura-corpo é "display:flex" sem flex-direction, ou
         seja, row) — sem esticar, a <img> nunca ganha uma altura
         PRÓPRIA independente da proporção dela; ela só cresce conforme
         a largura (100%) dividida pela proporção natural da imagem.
         "object-fit: contain" não tem efeito nenhum nessa conta, porque
         só funciona quando a caixa JÁ tem um tamanho independente pra
         conter o conteúdo — aqui não tinha.

         Medido de verdade (Chromium headless, a mesma versão da Vercel):
         o espaço útil dentro de .rel-captura-corpo é 190mm de largura
         por 260mm de altura. Uma captura real de ferramenta (Painel
         Técnico, 1920x2854px, extraída de um PDF quebrado de verdade)
         calculava 282,4mm de altura nessa largura — 22,4mm A MAIS do
         que cabe, sempre, silenciosamente (só descoberto medindo, não
         aparecia como "esmagado" nem como erro nenhum).

         Correção: "align-items: stretch" (em vez de "center") faz a
         <img> (que já é "flex:1; min-height:0") esticar pra ocupar a
         altura REAL calculada por flexbox de .rel-captura-corpo — um
         valor de verdade, não uma % arriscada em cima de altura
         calculada (aquele risco já documentado no comentário de
         ".rel-capa { height: 250mm }" mais abaixo não se aplica aqui,
         porque não é porcentagem: é o próprio motor de flexbox
         decidindo o tamanho da caixa, e a imagem SÓ estica até esse
         tamanho, nunca além). Com uma altura de verdade pra conter,
         "object-fit: contain" finalmente funciona: encolhe a imagem
         proporcionalmente pra caber nos dois eixos, sem cortar nada.

         "max-height: 230mm" (em vez de deixar ir até os 260mm que de
         fato cabem) é uma folga proposital de 30mm — não porque a conta
         de 260mm esteja errada, mas porque já foi visto nesse mesmo
         mecanismo de impressão (ver histórico de ".rel-page-captura"
         mais abaixo) sobrar fração de milímetro por arredondamento/
         timing em casos que pareciam corretos no papel. Com 30mm de
         sobra, mesmo esse tipo de erro pequeno nunca chega perto do
         limite físico da página de novo. */
      .rel-captura-corpo { flex: 1; min-height: 0; max-height: 230mm; display: flex; align-items: stretch; justify-content: center; overflow: hidden; }
      /* ATUALIZAÇÃO (30/09/2026): a imagem tem altura EXPLÍCITA (230mm), em vez
         de depender do flexbox esticar ela ("flex: 1" + stretch). No Safari do
         iPad o stretch de <img> dentro de flex não funciona: a imagem tomava a
         altura natural (proporção da captura) — uma tabela recortada, estreita
         e alta, ficava bem mais alta que a folha e era cortada pelo
         "overflow: hidden" (aparecia fora da página na Prévia). Com altura fixa
         + object-fit: contain, qualquer proporção é encolhida pra caber, igual
         em qualquer navegador (o Chromium já se comportava assim). */
      .rel-img-captura { flex: none; width: 100%; height: 230mm; object-fit: contain; display: block; }
      .rel-captura-faltando { color: #b45309; font-size: 13px; }

      /* ENCERRAMENTO */
      .rel-page-encerramento { display: flex; flex-direction: column; justify-content: space-between; }
      .rel-rodape-astrologo { border-top: 1.5px solid #c59b27; padding-top: 14px; font-size: 12px; color: #334155; break-inside: avoid; page-break-inside: avoid; }
      .rel-rodape-nome { font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 13px; margin-bottom: 3px; }

      /* TEMA "CÉU + PAPIRO" (.rel-tema-papiro no .rel-viewer, ver
         classeTemaPapiroRelatorio) — SÓ PINTURA nas folhas do corpo
         (tudo menos a capa, que continua sendo a do Céu). Regra de ouro
         desta seção: nenhuma propriedade de layout aqui (nada de
         width/height/margin/padding/border/flex/fonte) — o histórico
         deste relatório (páginas extras em branco, capturas maiores que
         a folha) mostra que qualquer mudança de tamanho reabre bugs de
         paginação. Cor, fundo e contorno (outline, que não ocupa espaço)
         são seguros: não mudam o tamanho de nada.
         Fundo de papiro em camadas (luz no canto, sombra no canto
         oposto, fibras finas). Moldura dupla via outline com offset
         negativo (desenha por dentro da folha, sem ocupar espaço). */
      .rel-tema-papiro .rel-page:not(.rel-capa) {
        background: ${papiroFolhaBg};
        outline: 1.2mm double #1a1410;
        outline-offset: -5mm;
      }
      /* Paleta tirada de papiros reais (referências do astrólogo): tinta
         PRETA no texto, vermelho-tijolo só em filetes/molduras e detalhes
         pequenos, azul-tinta (dos desenhos do canvas do papiro) em tabelas.
         Títulos: texto preto; caixa com filete vermelho-tijolo (a borda que
         já existe, só recolorida) mais um fio preto por FORA via outline
         (não ocupa espaço) — o "filete duplo" dos papiros egípcios. */
      .rel-tema-papiro .rel-corpo p, .rel-tema-papiro .rel-corpo ul, .rel-tema-papiro .rel-corpo ol { color: #1a1410; }
      /* Só os recursos de ESCRITA do papiro: tinta preta, terracota (rubrica) e azul-tinta, traços e filetes —
         nada de caixas/células com um tom de fundo próprio por cima do papel (por isso transparent). */
      .rel-tema-papiro .rel-h1, .rel-tema-papiro .rel-corpo h2 { color: #1a1410; border-color: #a03e25; background: transparent; outline: 1px solid #1a1410; outline-offset: 2px; }
      .rel-tema-papiro .rel-corpo h3, .rel-tema-papiro .rel-num-pagina, .rel-tema-papiro .rel-num-pagina-canto { color: #a03e25; }
      .rel-tema-papiro .rel-titulo-captura, .rel-tema-papiro .rel-rodape-nome { color: #1a1410; }
      .rel-tema-papiro .rel-legenda-mandala { color: #2a2118; }
      .rel-tema-papiro .rel-indice li { color: #1a1410; border-bottom-color: rgba(26,20,16,0.4); }
      .rel-tema-papiro .rel-rodape-astrologo { border-top-color: #a03e25; color: #1a1410; }
      .rel-tema-papiro .rel-tabela-caixa { border-color: #1d3a66; }
      .rel-tema-papiro .tabela-enxuta { background: transparent; color: #1a1410; }
      .rel-tema-papiro .tabela-enxuta th, .rel-tema-papiro .tabela-enxuta td { border-color: #1d3a66; }
      .rel-tema-papiro .tabela-enxuta th { background-color: transparent; color: #1d3a66; }
      .rel-tema-papiro .rel-captura-faltando { color: #a03e25; }

      /* TEMA CÉU — a "mesa" atrás das folhas é o próprio céu do site (não o cinza da prévia comum). SÓ PINTURA. */
      body.tema-ceu .rel-viewer { background: transparent; }
      @media print {
        .rel-viewer { background: #ffffff; padding: 0; }

        /* A CAUSA da borda branca ao redor de TODA página impressa
           (não só a capa) era o "@page { margin: 12mm }" logo abaixo:
           essa margem é reservada pelo PRÓPRIO exportador de PDF, por
           fora de qualquer coisa que a gente desenha — nenhuma cor de
           fundo, imagem ou conteúdo consegue entrar ali, não importa o
           que a gente mude dentro de .rel-page. Por isso reduzir a
           mandala, ajustar o min-height etc. nunca resolvia: a borda
           não vinha do TAMANHO do conteúdo, vinha dessa margem fixa do
           @page, imposta por fora do conteúdo. Tirando essa margem
           (= 0), o conteúdo passa a poder ocupar a folha inteira de
           verdade — a capa (com cor de fundo) fica de sangria plena, sem
           nenhuma borda branca. O espaçamento de leitura das páginas de
           texto continua existindo, só que agora vem só do padding do
           próprio .rel-page (18mm/16mm, declarado no início do arquivo)
           — uma margem só, não duas empilhadas. */
        @page { size: A4; margin: 0; }

        /* min-height (NUNCA height fixo) do tamanho real de uma folha
           impressa: 297mm cheios, a mesma altura que a prévia em tela já
           usa (".rel-page { aspect-ratio: 210/297 }", @media screen,
           logo acima).

           ATUALIZAÇÃO (29/09/2026) — esse valor já foi 250mm (47mm de
           "folga" proposital), de uma época em que o PDF saía do
           "Imprimir" de verdade do navegador: ali fazia sentido, porque
           o navegador só respeita "@page { margin: 0 }" se a PESSOA
           deixar a caixa de diálogo em "Margens: Nenhuma" — no padrão
           ("Margens: Padrão", o mais comum), o navegador aplica a
           margem dele por cima sem avisar, "roubando" espaço da página
           sem o CSS saber, e essa folga era a defesa contra isso.
           Motivo de ter deixado de fazer sentido: agora quem gera o PDF
           é o Puppeteer (api/gerar-pdf.js), que manda
           margin: {top:'0mm', ...} direto pro Chrome, sem caixa de
           diálogo nenhuma no meio — não existe mais "a pessoa esqueceu
           de mudar o padrão" pra se defender. Resultado de manter em
           250mm com esse motivo já resolvido: a folga virava uma faixa
           branca real, visível, sobrando embaixo de toda página (mais
           óbvio na capa, com fundo colorido) — exatamente o problema
           que essa folga foi criada pra evitar, só que auto-infligido.
           Esse valor precisa ser o MESMO em toda .rel-page, capa
           incluída: testando, misturar valores diferentes entre páginas
           (ou mudar esse número sem também levar em conta o @page
           acima) foi o que causou perda de conteúdo em relatórios
           longos numa rodada anterior — qualquer ajuste futuro aqui
           precisa ser testado gerando um PDF de verdade com várias
           páginas, não só olhando o CSS. */
        .rel-page { box-shadow: none; margin: 0; width: auto; min-height: 297mm; overflow: visible; page-break-after: always; }
        .rel-page:last-child { page-break-after: auto; }

        /* A capa é o único .rel-page com "height" fixo (não só
           min-height) na impressão — pode ser, porque o conteúdo dela
           nunca é texto livre que precisa de mais espaço (é sempre
           título + uma imagem + rodapé fixo), diferente das páginas de
           texto/tabela. Isso importa especialmente aqui: o layout da
           capa depende de flexbox (a área do meio com "flex: 1" pra
           centralizar a mandala) pra se distribuir dentro da altura da
           página, e motor de impressão que só recebe um "min-height"
           (sem "height") às vezes não repassa uma altura definida pro
           flexbox calcular o "flex: 1" — foi isso que causava a capa
           inteira transbordar pra uma segunda página quase em branco.

           .rel-page-captura (a página de uma ferramenta capturada —
           Painel Técnico etc., ver RELATORIO_FERRAMENTAS_DISPONIVEIS)
           é EXATAMENTE o mesmo caso: também nunca é texto livre (é uma
           imagem só, via .rel-captura-corpo com "flex: 1" pra
           centralizar), mas tinha ficado de fora dessa correção na
           época — só a capa tinha sido ajustada. Resultado (29/09/2026,
           já testado gerando PDF de verdade pelo Chrome headless):
           imagem que ocupava certinho a página inteira na prévia virava
           2 páginas no PDF baixado (uma quase em branco logo depois),
           mesmo sintoma da capa antes da correção — mesma causa, mesma
           correção.

           .rel-page-mapa (a página só com a Mandala 1/Mandala 2, sem
           captura nenhuma) entra na mesma lista pelo mesmo motivo: a
           partir de 29/09/2026 .rel-img-mandala também usa "flex: 1"
           (ver comentário dela, logo acima) pra nunca crescer mais alta
           que a página cabe — só que isso também depende da página em
           volta ter uma altura de verdade, não só "min-height".

           "overflow: hidden" (ATUALIZAÇÃO 29/09/2026, mais tarde no
           mesmo dia) — faltava isso aqui. ".rel-page" (regra base, logo
           acima) usa "overflow: visible" DE PROPÓSITO, pra texto longo
           conseguir crescer e fluir pra folhas seguintes. Só que essas
           três páginas aqui NUNCA deviam crescer — o conteúdo delas é
           sempre "encolhido pra caber" (flex:1 + object-fit/min-height),
           nunca "cresce a página pro conteúdo caber". O problema de
           herdar "overflow: visible" mesmo assim: se sobrar QUALQUER
           diferença mínima entre o que o CSS calcula e o que o motor de
           impressão desenha de verdade (arredondamento de sub-pixel,
           métrica de fonte um pouco diferente, um título que quebra em
           mais uma linha do que o esperado) — mesmo um resto de menos de
           1mm — "overflow: visible" deixa esse resto vazar pra fora da
           página em vez de cortar, e isso sozinho já basta pra empurrar
           .rel-num-pagina-canto pra fora e criar a folha extra quase em
           branco, INDEPENDENTE de o "flex:1"/"object-fit" da imagem
           estarem funcionando direito (podem estar funcionando 99,9%
           perfeitos e ainda sobrar aquele 0,1% que cria a folha extra).
           "overflow: hidden" aqui garante que, mesmo que sobre uma
           fração de milímetro por qualquer motivo não previsto, ela é
           cortada (dificilmente perceptível) em vez de virar folha
           extra — rede de segurança de verdade, não só "encolher
           direito e torcer".

           ATUALIZAÇÃO (29/09/2026, mais tarde ainda) — "overflow: hidden"
           sozinho NÃO bastou (confirmado abrindo o PDF de verdade): o
           astrólogo continuava vendo o número de página sozinho numa
           folha extra, mesmo com a imagem parecendo caber perfeita. A
           explicação: "overflow" e a PAGINAÇÃO de impressão são dois
           mecanismos DIFERENTES do navegador — "overflow: hidden" só
           decide o que é DESENHADO (esconde o que passa da caixa), mas
           não decide se a caixa é "fatiada" em mais de uma folha física
           quando o conteúdo dela não cabe. Quem decide isso é
           "break-inside"/"page-break-inside" (o MESMO usado em ".rel-h1"
           e nas linhas da tabela técnica, mais acima neste arquivo, pra
           impedir um título ou uma linha de quebrar ao meio entre duas
           páginas) — sem "avoid" aqui, o motor de paginação continuava
           livre pra abrir uma segunda folha física pro que sobrasse,
           por menor que fosse, mesmo com esse sobra depois escondida
           visualmente pelo "overflow: hidden". Com "break-inside: avoid"
           também, a caixa passa a ser tratada como uma unidade que não
           pode ser fatiada em duas folhas de jeito nenhum — junto com a
           altura fixa (297mm) e o "overflow: hidden", fecha os três
           mecanismos que juntos garantem: nunca mais que uma folha,
           nunca conteúdo cortado ao meio, nunca vazamento visível. */
        .rel-capa, .rel-page-captura, .rel-page-mapa { height: 297mm; min-height: 297mm; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
      }
  `;
  document.head.appendChild(style);
}
