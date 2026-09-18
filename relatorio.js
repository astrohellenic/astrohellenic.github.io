/* ==========================================
   MÓDULO DE RELATÓRIO (RELATÓRIOS EM PDF, POR PRESETS)
   Monta um relatório multi-página a partir de um preset salvo pelo
   astrólogo (capa + blocos de texto editáveis + mandalas do cliente) e
   usa a impressão do navegador ("Salvar como PDF") para exportar — sem
   depender de nenhuma biblioteca nova.

   Os presets (nome, textos, quais blocos entram) e o perfil do
   astrólogo (logo, nome, contato) ficam salvos no Supabase, nas tabelas
   relatorio_presets e relatorio_perfil — editáveis em
   Configurações > Relatórios (telas em supabase.js).
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
    telaOrigem: 'Ferramentas > Calculadora de Lotes'
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
  { id: 'decenios', type: 'ferramenta' },
  ...RELATORIO_LOTES_ORDEM.map(loteKey => ({ id: 'liberacao_' + loteKey, type: 'ferramenta' })),
  { id: 'horas', type: 'ferramenta' },
  { id: 'isopsefia', type: 'ferramenta' },
  { id: 'lotes_calculados', type: 'ferramenta' }
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
   escolhida ainda não tem imagem disponível. */
function imagemCapaRelatorio(capaFonte, png1, png2) {
  if (capaFonte === 'mandala_fortuna') return png2 || null;
  if (capaFonte === 'mandala_personalizada') {
    const capturas = capturasDaFerramenta('mandala_personalizada');
    return capturas.length ? capturas[capturas.length - 1].dataUrl : null;
  }
  if (capaFonte === 'nenhuma') return null;
  return png1 || null; // 'mandala_natal', o padrão
}

async function capturarTelaParaRelatorio(toolId, containerId, rotulo) {
  const elemento = document.getElementById(containerId);
  if (!elemento) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }

  try {
    const canvas = await html2canvas(elemento, { backgroundColor: '#fffdf5', scale: 2, useCORS: true });
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
    if (!error && data && data.length) return data;

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

  container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Abrindo o rascunho...</div>`;

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
        longitude: mapaRow.longitude
      });
      if (calculoOk === false) { alert('Não foi possível calcular o mapa deste rascunho (erro de conexão). Tente de novo.'); iniciarModuloRelatorio(); return; }
    }
    // aplicarDadosDoPerfilNoMapa zera currentRascunhoId (mapa novo em
    // tela) — agora que sabemos que é justamente ESTE rascunho, reafirma.
    currentRascunhoId = rascunho.id;

    // Pool de capturas do CLIENTE (mapa_id), não só as desse rascunho —
    // assim uma captura feita enquanto editava outro relatório dela (ex.:
    // Mapa Natal) já aparece disponível aqui também (ex.: Retificação).
    window.relatorioCapturas = await carregarCapturasPooladasDoMapa(rascunho.mapa_id);
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
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para gerar o Relatório.</div>`;
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

  container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Carregando seus modelos de relatório...</div>`;

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
  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : currentSubjectName;

  // Pré-seleciona o último modelo que o astrólogo escolheu (guardado no
  // navegador) em vez de sempre voltar pro primeiro da lista — sem isso,
  // quem trabalha com "Retificação de Mapa Natal" o dia todo tinha que
  // trocar o seletor toda vez que voltava nessa tela.
  const indicePresetPadrao = indicePresetLembrado(presets);
  const opcoesPreset = presets.map((p, idx) => `<option value="${idx}" ${idx === indicePresetPadrao ? 'selected' : ''}>${escapeHtml(p.nome)}</option>`).join('');
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
    <div style="max-width: 480px; margin: 0 auto 20px auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
      <label style="font-size: 11px; font-weight: 600; color: #64748b; display: block; margin-bottom: 10px;">Relatórios em Andamento</label>
      ${gruposRascunhos.map(g => `
        <div style="margin-bottom: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: #103b70; margin-bottom: 4px;">${escapeHtml(g.nome)}</div>
          ${g.itens.map(r => `
            <div onclick="abrirRascunhoRelatorio('${r.id}')" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; margin-left: 10px; border: 1px solid #e2d9c2; border-radius: 8px; margin-bottom: 6px; cursor: pointer; background: ${r.id === currentRascunhoId ? '#fffdf5' : '#ffffff'};">
              <span style="font-size: 12px; color: #475569;">${escapeHtml(r.titulo || 'Rascunho sem título')}</span>
              <i class="fa-solid fa-chevron-right" style="color: #c59b27; font-size: 11px;"></i>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">

      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">Relatório</h2>
        <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          ${escapeHtml(headerTitle)} • ${dia}/${mes}/${ano} às ${hora}:${min} • ${escapeHtml(currentGeo.city || "Local n/i")}
        </div>
      </div>

      ${listaRascunhosHTML}

      <div style="max-width: 480px; margin: 0 auto 20px auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Modelo de Relatório</label>
        <select id="relPresetEscolhido" class="modal-select" style="margin-bottom: 6px;">${opcoesPreset}</select>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 18px; line-height: 1.5;">
          O logo e os seus dados de contato ficam configurados em <strong>Configurações → Relatórios</strong>, no menu lateral. O relatório do mapa atual é salvo automaticamente como rascunho sempre que você gera a prévia.
        </div>

        <button type="button" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px;" onclick="confirmarGerarRelatorio()">
          <i class="fa-solid fa-file-pdf" style="margin-right: 6px;"></i> Gerar Relatório
        </button>
      </div>

      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em;">Modelos de Relatório</div>
          <button onclick="criarNovoPresetRelatorio()" style="font-size: 11px; font-weight: 700; color: #103b70; padding: 6px 10px; border: 1px solid #c59b27; border-radius: 6px; background: #ffffff; cursor: pointer;">+ Novo</button>
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 10px; line-height: 1.4;">
          Cada modelo escolhe quais textos e ferramentas entram no relatório, e com que conteúdo.
        </div>
        <div id="relListaModelos">${listaModelosHTML}</div>
      </div>

    </div>
  `;

  window.relatorioPresetsCarregados = presets;
}

function renderizarListaModelosRelatorioHTML(presets) {
  return presets.map((p, idx) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid #e2d9c2; border-radius: 8px; background: #ffffff; margin-bottom: 6px;">
      <span style="font-size: 12px; font-weight: 700; color: #103b70;">${escapeHtml(p.nome)}</span>
      <div style="display: flex; gap: 12px;">
        <i class="fa-solid fa-pen" style="color: #103b70; cursor: pointer; font-size: 12px;" onclick="abrirEditorPresetRelatorio(${idx})" title="Editar"></i>
        ${presets.length > 1 ? `<i class="fa-solid fa-trash" style="color: #dc2626; cursor: pointer; font-size: 12px;" onclick="excluirPresetRelatorio(${idx})" title="Excluir"></i>` : ''}
      </div>
    </div>
  `).join('');
}

/* CRIA UM NOVO MODELO DE RELATÓRIO A PARTIR DO CONJUNTO DE BLOCOS PADRÃO
   (o astrólogo edita os textos e escolhe o que entra depois, no editor) */
async function criarNovoPresetRelatorio() {
  const nome = prompt("Nome do novo modelo de relatório (ex: Revolução Solar):");
  if (!nome || !nome.trim()) return;

  const client = relatorioSupabaseClient();
  if (!client) return;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await client
      .from('relatorio_presets')
      .insert({ user_id: user.id, nome: nome.trim(), blocos: RELATORIO_BLOCOS_PADRAO });

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
  if (!confirm(`Excluir o modelo "${preset.nome}"? Essa ação não pode ser desfeita.`)) return;

  const client = relatorioSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('relatorio_presets').delete().eq('id', preset.id);
    if (error) { alert("Erro ao excluir: " + error.message); return; }
    iniciarModuloRelatorio();
  } catch (e) {
    alert("Erro de conexão ao excluir modelo.");
  }
}
window.excluirPresetRelatorio = excluirPresetRelatorio;

/* EDITOR DE UM MODELO: cada bloco (do catálogo ou personalizado) vira uma
   linha reordenável — checkbox pra incluir/excluir, título e corpo
   editáveis pros blocos de texto, e setas ▲▼ pra mover a linha dentro do
   container. A ordem salva é lida direto da ordem das linhas no DOM, então
   dá pra intercalar textos, mandalas e capturas de ferramenta à vontade.
   Renderiza na tela principal (não mais na sidebar) pra sobrar bem mais
   espaço pra digitar os textos. */
function relatorioLinhaEditorHtml({ id, tipo, custom, rotulo, titulo, corpo, formato, ferramentaId, capturaIndex, rotuloIndice }) {
  const setaCss = 'width: 26px; height: 20px; border: 1px solid #c59b27; background: #ffffff; color: #103b70; border-radius: 4px; font-size: 10px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;';
  const setas = `
    <div style="display: flex; flex-direction: column; gap: 3px; flex-shrink: 0;">
      <button type="button" onclick="moverBlocoEditor(this, -1)" title="Mover para cima" style="${setaCss}">▲</button>
      <button type="button" onclick="moverBlocoEditor(this, 1)" title="Mover para baixo" style="${setaCss}">▼</button>
    </div>
  `;

  if (tipo === 'ferramenta') {
    // Ferramentas "capturadas" (Profecção, Isopsefia, Liberação Zodiacal
    // etc.) podem entrar MAIS DE UMA VEZ no mesmo modelo, cada uma numa
    // posição diferente — ex.: uma Profecção logo no início (comentada
    // ali) e outra Profecção bem mais pra frente (comentada com outro
    // texto). "ferramentaId" é a ferramenta de verdade (pra achar o
    // rótulo e as capturas); "id" é único por LINHA (pra não colidir no
    // editor quando há mais de uma). A primeira instância de cada
    // ferramenta usa ferramentaId === id (igual sempre foi); a partir da
    // segunda, o botão "+" abaixo cria uma linha nova com um id próprio.
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
        <span style="font-size: 11px; font-weight: 700; color: ${temImagemNestaLinha ? '#103b70' : '#b45309'}; background: ${temImagemNestaLinha ? '#f1f5f9' : '#fffbeb'}; border-radius: 10px; padding: 2px 8px; flex-shrink: 0; white-space: nowrap;">
          ${rotuloBadge}
        </span>
        <i class="fa-solid fa-plus" style="color: #103b70; cursor: pointer; font-size: 12px; flex-shrink: 0;" title="Adicionar mais uma página desta ferramenta em outro lugar do relatório" onclick="adicionarInstanciaFerramentaEditor('${idFerramenta}', '${rotuloEscapado}')"></i>
      `;
    }

    // Nome que aparece no Índice pra ESTA posição — editável, porque com
    // a mesma ferramenta podendo entrar várias vezes (ver o "+" acima),
    // o nome padrão (sempre o mesmo, ex. "Mandala Personalizada") repete
    // no Índice e não dá pra saber qual é qual. Pré-preenchido com o
    // nome padrão, mas o astrólogo pode reescrever pra algo específico
    // dessa posição (ex. "Mandala com a Fortuna em Casa 1").
    const tituloIndicePadrao = (info && (info.tituloIndice || info.label)) || rotulo;
    const rotuloIndiceAtual = rotuloIndice || tituloIndicePadrao;

    return `
      <div class="rel-editor-linha" data-bloco-id="${id}" data-bloco-tipo="ferramenta" data-ferramenta-id="${idFerramenta}" data-captura-index="${idx}" style="border: 1px solid #e2d9c2; border-radius: 8px; background: #ffffff; margin-bottom: 8px; padding: 12px 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${setas}
          <input type="checkbox" data-bloco-check="${id}" checked>
          <span style="flex: 1; font-size: 13px; font-weight: 600; color: #103b70;">${escapeHtml(rotulo)}</span>
          ${extrasCapturada}
          <i class="fa-solid fa-trash" style="color: #dc2626; cursor: pointer; font-size: 13px; flex-shrink: 0;" title="Remover esta página" onclick="removerBlocoEditor(this, '${id}')"></i>
        </div>
        <div style="margin-top: 8px; padding-left: 36px;">
          <label style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Nome no Índice</label>
          <input type="text" data-bloco-titulo-indice="${id}" class="modal-input" value="${escapeHtml(rotuloIndiceAtual)}" style="font-size: 12.5px; padding: 6px 8px; margin-top: 2px;">
        </div>
      </div>
    `;
  }

  const rotuloLinha = custom ? 'Bloco personalizado' : escapeHtml(rotulo);

  // O <textarea> antigo virou um "mount" vazio: o Quill de verdade só pode
  // ser criado depois que esse HTML já estiver no DOM (ver
  // inicializarQuillsPendentes, chamada logo depois de qualquer innerHTML/
  // insertAdjacentHTML que use esta função). Por isso o conteúdo inicial
  // fica registrado aqui num mapa global em vez de ir direto pro HTML —
  // texto rico teria que escapar pra caber num atributo, o que é frágil;
  // um mapa em memória evita isso de vez.
  window.relatorioQuillPendentes = window.relatorioQuillPendentes || {};
  window.relatorioQuillPendentes[id] = { corpo: corpo || '', formato: formato || 'texto' };

  return `
    <div class="rel-editor-linha" data-bloco-id="${id}" data-bloco-tipo="texto" data-custom="${custom ? '1' : '0'}" style="border: 1px solid #e2d9c2; border-radius: 8px; background: #ffffff; margin-bottom: 8px; overflow: hidden;">
      <div style="display: flex; align-items: center; gap: 10px; padding: 12px 14px;">
        ${setas}
        <input type="checkbox" data-bloco-check="${id}" checked onchange="this.closest('.rel-editor-linha').querySelector('.rel-editor-campos').style.display = this.checked ? 'block' : 'none'">
        <span style="flex: 1; font-size: ${custom ? '11px' : '13px'}; font-weight: 700; color: ${custom ? '#9a6d18' : '#103b70'}; ${custom ? 'text-transform: uppercase; letter-spacing: 0.03em;' : ''}">${rotuloLinha}</span>
        <i class="fa-solid fa-trash" style="color: #dc2626; cursor: pointer; font-size: 13px;" title="Remover este bloco" onclick="removerBlocoEditor(this, '${id}')"></i>
      </div>
      <div class="rel-editor-campos" style="padding: 0 14px 14px;">
        <input type="text" data-bloco-titulo="${id}" class="modal-input" value="${escapeHtml(titulo || '')}" placeholder="${custom ? 'Título do bloco' : ''}" style="margin-bottom: 8px; font-size: 13px;">
        <div id="quill-mount-${id}" class="rel-quill-mount"></div>
      </div>
    </div>
  `;
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
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ color: [] }],
          [{ size: ['12px', false, '18px', '26px'] }],
          [{ list: 'ordered' }, { list: 'bullet' }]
        ]
      }
    });

    const { corpo, formato } = pendentes[id];
    if (formato === 'rich') {
      quill.clipboard.dangerouslyPasteHTML(corpo || '');
    } else if (corpo) {
      // Mesma regra de parágrafo que o relatório final sempre usou pra
      // texto puro (linha em branco separa parágrafos) — pra a prévia no
      // Quill começar igual ao que já está publicado, sem surpresa.
      const paragrafos = corpo.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
      quill.clipboard.dangerouslyPasteHTML(paragrafos.map(p => `<p>${escapeHtml(p)}</p>`).join(''));
    }
    window.relatorioQuillInstancias[id] = quill;
  });

  window.relatorioQuillPendentes = {};
}
window.inicializarQuillsPendentes = inicializarQuillsPendentes;

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
    <div data-adicionar-id="${padrao.id}" onclick="adicionarItemCatalogoAoEditor('${padrao.id}', '${padrao.type}')" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px dashed #c59b27; border-radius: 8px; background: #fffdf5; margin-bottom: 8px; cursor: pointer;">
      <span style="font-size: 13px; font-weight: 600; color: #103b70;">+ ${escapeHtml(rotulo || padrao.id)}</span>
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
function limparCapturasEditor(toolId, iconEl) {
  const total = capturasDaFerramenta(toolId).length;
  const msg = total > 1
    ? `Apagar as ${total} imagens já adicionadas desta ferramenta?`
    : 'Apagar a imagem já adicionada desta ferramenta?';
  if (!confirm(msg)) return;
  limparCapturasRelatorio(toolId);
  const linha = iconEl.closest('.rel-editor-linha');
  const badge = linha && linha.querySelector('[data-badge-capturas]');
  if (badge) { badge.textContent = 'sem captura'; badge.style.color = '#b45309'; badge.style.background = '#fffbeb'; }
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

/* CSS só da TELA de edição do modelo (abas Editar/Prévia, moldura do
   Quill, aviso da prévia) — injetado uma única vez, separado do CSS do
   relatório em si (injetarEstilosRelatorio), que é usado tanto aqui
   (dentro da aba Prévia) quanto na geração final. */
function injetarEstilosEditorRelatorio() {
  if (document.getElementById('relatorio-editor-estilos')) return;
  const style = document.createElement('style');
  style.id = 'relatorio-editor-estilos';
  style.textContent = `
      /* Travada no topo com position:fixed (não mais sticky) — presa direto
         na tela, sem depender de qual elemento é "o ancestral com scroll"
         (isso variava demais entre navegador/aparelho e nunca ficou 100%
         confiável). Como um elemento fixed sai do fluxo normal da página,
         #relEditorEspacadorBarra logo abaixo dela (ver renderizarTelaEditorRelatorio)
         reserva o mesmo espaço que ela ocupa, pra nada ficar escondido
         atrás — a altura exata é medida e aplicada em JS (ver
         ajustarEspacadorBarraFixaEditor), já que ela muda com o tamanho
         da tela. */
      .rel-editor-tabs { position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: center; gap: 12px; border-bottom: 1px solid #e2d9c2; background: var(--bg-main, #f8fafc); padding: 10px 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
      .rel-editor-tabs-conteudo { width: 100%; max-width: 720px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .rel-editor-tabs-grupo { display: flex; gap: 4px; }
      .rel-editor-tab { padding: 10px 18px; font-size: 12.5px; font-weight: 700; cursor: pointer; background: none; border: none; border-bottom: 3px solid transparent; color: #64748b; }
      .rel-editor-tab.ativa { color: #103b70; border-bottom-color: #103b70; }
      .rel-editor-btn-salvar { background: #103b70; color: #fffdf5; border: 1px solid #c59b27; padding: 9px 16px; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0; }

      .rel-quill-mount .ql-toolbar.ql-snow { border-color: #e2d9c2; border-radius: 6px 6px 0 0; background: #fffdf5; }
      .rel-quill-mount .ql-container.ql-snow { border-color: #e2d9c2; border-radius: 0 0 6px 6px; font-family: 'Montserrat', sans-serif; }
      .rel-quill-mount .ql-editor { min-height: 180px; font-size: 12.5px; line-height: 1.6; }

      .rel-previa-aviso { max-width: 720px; margin: 0 auto 16px auto; background: #fffbeb; border: 1px solid #d4af37; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #9a6d18; font-weight: 600; }
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
    if (container) container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Abrindo o relatório...</div>`;
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
    avisoAutosave: '<i class="fa-solid fa-circle-check"></i> Suas alterações são salvas automaticamente — o botão "Salvar Agora" é só pra forçar na hora, se quiser.'
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
    <div style="width: 100%; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">

      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <button type="button" onclick="${config.aoVoltarJs}" style="color: #103b70; border: 1px solid #c59b27; border-radius: 8px; background: #ffffff; padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 700;">
          <i class="fa-solid fa-chevron-left" style="color: #c59b27;"></i> Voltar
        </button>
        <h2 style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">${escapeHtml(config.tituloTela)}</h2>
        <div style="width: 76px;"></div>
      </div>

      <div class="rel-editor-tabs" id="relEditorTabsFixa">
        <div class="rel-editor-tabs-conteudo">
          <div class="rel-editor-tabs-grupo">
            <button type="button" id="relAbaEditarBtn" class="rel-editor-tab ativa" onclick="mudarAbaEditorModelo('editar')">Editar</button>
            <button type="button" id="relAbaPreviaBtn" class="rel-editor-tab" onclick="mudarAbaEditorModelo('previa')">
              <i class="fa-solid fa-eye"></i> Prévia
            </button>
          </div>
          <button type="button" class="rel-editor-btn-salvar" onclick="salvarEdicaoRelatorioAtual()">
            <i class="fa-solid fa-floppy-disk"></i> ${escapeHtml(config.rotuloSalvar)}
          </button>
        </div>
      </div>
      <!-- Como a barra acima é position:fixed (fora do fluxo normal), este
           espaçador reserva o mesmo espaço que ela ocupa, senão o início do
           formulário/prévia ficaria escondido atrás dela. Altura real
           medida e aplicada logo abaixo, em JS (ajustarEspacadorBarraFixaEditor). -->
      <div id="relEditorEspacadorBarra"></div>

      <div id="relEditorFormPane">
        <div style="max-width: 720px; margin: 0 auto;">
          <label style="font-size: 11px; font-weight: 600; color: #64748b;">${escapeHtml(config.labelNome)}</label>
          <input type="text" id="relEditorNome" class="modal-input" value="${escapeHtml(nomeAtual)}" style="margin-bottom: 18px; font-size: 13px;">

          ${config.avisoAutosave ? `<div style="font-size: 11.5px; color: #166534; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 8px 12px; margin-bottom: 18px;">${config.avisoAutosave}</div>` : ''}

          ${relatorioCapaSeletorHtml(capaFonteAtual)}

          <div style="font-size: 12px; color: #64748b; margin-bottom: 14px; line-height: 1.5;">
            Esta é a ordem do relatório. Use as setas ▲▼ pra reordenar — dá pra intercalar textos, mandalas e capturas de ferramenta do jeito que quiser — e desmarque pra tirar um bloco sem perder o texto dele. A qualquer momento, clique em "Prévia" ali em cima pra ver o resultado sem sair daqui e sem salvar.
          </div>

          <div id="relEditorOrdenavel">${linhasOrdenadas}</div>

          <div id="relAdicionarSecao" style="${linhasParaAdicionar ? '' : 'display: none;'}">
            <div style="font-size: 13px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em; margin: 20px 0 10px;">${escapeHtml(config.labelAdicionar)}</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; line-height: 1.5;">
              Clique pra incluir — entra na hora no fim da lista de cima, já pronto pra editar, aí é só usar as setas pra colocar no lugar certo.
            </div>
            <div id="relAdicionarLista">${linhasParaAdicionar}</div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0 10px;">
            <div style="font-size: 13px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em;">Bloco Personalizado Novo</div>
            <button onclick="adicionarBlocoCustomizadoEditor()" style="font-size: 12px; font-weight: 700; color: #103b70; padding: 8px 12px; border: 1px solid #c59b27; border-radius: 6px; background: #ffffff; cursor: pointer;">+ Adicionar</button>
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; line-height: 1.5;">
            Cria um texto novo já no fim da lista de cima — dá pra mover ele com as setas assim que criar.
          </div>

          ${relatorioEncerramentoHtml(encerramentoAtual)}
        </div>
      </div>

      <div id="relEditorPreviaPane" style="display: none;"></div>

    </div>
  `;
  inicializarQuillsPendentes();
  atualizarPreviewCapaEditor();
  ajustarEspacadoresBarraFixaRelatorio();

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
    { valor: 'nenhuma', label: 'Nenhuma imagem — só o título' }
  ];
  const opcoesHtml = opcoes.map(o => `<option value="${o.valor}" ${o.valor === capaFonteAtual ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('');

  return `
    <div style="background: #fffdf5; border: 1.5px solid #d4af37; border-radius: 10px; padding: 14px 16px; margin-bottom: 18px;">
      <label style="font-size: 11px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em;">Mandala da Capa</label>
      <div style="font-size: 11.5px; color: #64748b; margin: 4px 0 8px; line-height: 1.5;">
        Escolhe qual imagem aparece na capa deste modelo — pra você nunca ficar no escuro sobre o que vai ser gerado.
      </div>
      <select id="relCapaFonte" class="modal-select" onchange="atualizarPreviewCapaEditor()">${opcoesHtml}</select>
      <div id="relCapaPreviewWrap" style="margin-top: 10px;"></div>
    </div>
  `;
}

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
    <div style="margin: 24px 0 10px;">
      <div style="font-size: 13px; font-weight: 700; color: #103b70; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 6px;">Texto de Encerramento</div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 10px; line-height: 1.5;">
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

  if (valor === 'mandala_personalizada') {
    const capturas = capturasDaFerramenta('mandala_personalizada');
    if (capturas.length) {
      const ultima = capturas[capturas.length - 1];
      wrap.innerHTML = `
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${capturas.length > 1 ? `Vai a mais recente das ${capturas.length} capturadas:` : 'Prévia da captura:'}</div>
        <img src="${ultima.dataUrl}" style="max-width: 160px; max-height: 160px; border: 1px solid #e2d9c2; border-radius: 8px; display: block;">
      `;
    } else {
      wrap.innerHTML = `<div style="font-size: 11.5px; color: #b45309;">Nenhuma imagem capturada ainda pra essa opção. Abra a Mandala, deixe a rotação de Casa 1 do jeito que quer mostrar e clique no botão de "Adicionar ao Relatório" ao lado da rotação — depois volte aqui.</div>`;
    }
    return;
  }

  if (valor === 'nenhuma') {
    wrap.innerHTML = `<div style="font-size: 11.5px; color: #64748b;">A capa vai mostrar só o título do relatório, sem nenhuma imagem.</div>`;
    return;
  }

  const nomePagina = valor === 'mandala_natal' ? 'Mapa Natal' : 'Mandala com a Fortuna';
  wrap.innerHTML = `<div style="font-size: 11.5px; color: #64748b;">Calculada na hora, a partir dos dados do cliente carregado — sai igual à própria página "${nomePagina}" deste relatório (se ela estiver marcada como página aqui embaixo).</div>`;
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
  blocos.push({ id: '__capa__', type: 'capa', fonte: capaFonteSelect ? capaFonteSelect.value : 'mandala_natal' });
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
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo';
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

  pane.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Gerando a prévia...</div>`;

  const nomeCampo = (document.getElementById('relEditorNome').value || '').trim();
  const capaFonteSelect = document.getElementById('relCapaFonte');
  const capaFonte = capaFonteSelect ? capaFonteSelect.value : 'mandala_natal';
  const quillEncerramento = (window.relatorioQuillInstancias || {})['__encerramento__'];
  const encerramentoCorpo = quillEncerramento ? quillEncerramento.root.innerHTML : RELATORIO_ENCERRAMENTO_PADRAO;

  const blocosCorpo = lerBlocosDoEditor();
  if (!blocosCorpo.length) {
    pane.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Marque ou crie pelo menos um item na aba "Editar" pra ver a prévia.</div>`;
    return;
  }
  const blocosComCapa = blocosCorpo.concat([
    { id: '__capa__', type: 'capa', fonte: capaFonte },
    { id: '__encerramento__', type: 'encerramento', corpo: encerramentoCorpo }
  ]);
  const presetPreview = { nome: nomeCampo || 'Modelo sem nome', blocos: blocosComCapa };

  const perfil = await carregarPerfilRelatorio();
  const { lotes: lotesNatal, ascAbs: ascAbsNatal } = calcularLotesRelatorio();
  const { png1, png2 } = await renderizarMandalasDoPreset(blocosComCapa, capaFonte);

  injetarEstilosRelatorio();
  const conteudoHtml = montarConteudoRelatorioHtml(presetPreview, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte);
  const previaProntaHtml = `
    <div class="rel-previa-aviso no-print">
      <i class="fa-solid fa-circle-info"></i> Prévia gerada a partir do que está na tela agora — nada foi salvo ainda. Clique em "Salvar" ali em cima quando estiver satisfeito.
    </div>
    <div class="rel-viewer">${conteudoHtml}</div>
  `;

  reabrirEditorRelatorioAtual({
    blocosOverride: blocosCorpo,
    nomeOverride: nomeCampo,
    capaFonteOverride: capaFonte,
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

  container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Gerando o relatório...</div>`;

  const perfil = await carregarPerfilRelatorio();
  const blocos = preset.blocos || [];
  const capaFonte = obterCapaFonte(blocos);

  const { lotes: lotesNatal, ascAbs: ascAbsNatal } = calcularLotesRelatorio();
  const { png1, png2 } = await renderizarMandalasDoPreset(blocos, capaFonte);

  montarEExibirRelatorio(container, preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte);

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
  const html = `<button type="button" id="relBtnEditarRascunho" class="btn-secondary" onclick="abrirEditorRascunhoRelatorio('${currentRascunhoId}')"><i class="fa-solid fa-pen"></i> Editar</button>`;
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
   uma, ou as duas), restaurando a rotação da Casa 1 ao final. */
async function renderizarMandalasDoPreset(blocos, capaFonte) {
  // Calcula cada mandala se ela tiver página própria marcada no preset OU
  // se for a fonte escolhida pra capa (as duas coisas são independentes:
  // dá pra usar a Fortuna só na capa sem incluir a página dela no corpo).
  const precisaNatal = blocos.some(b => b.type === 'ferramenta' && b.id === 'mandala_natal') || capaFonte === 'mandala_natal';
  const precisaFortuna = blocos.some(b => b.type === 'ferramenta' && b.id === 'mandala_fortuna') || capaFonte === 'mandala_fortuna';
  const lotSalvo = selectedHouse1Lot;
  let png1 = null, png2 = null;

  if (precisaNatal) {
    selectedHouse1Lot = 'ASC';
    png1 = await new Promise(resolve => renderMandala(null, resolve));
  }
  if (precisaFortuna) {
    selectedHouse1Lot = 'fortune';
    png2 = await new Promise(resolve => renderMandala(null, resolve));
  }
  selectedHouse1Lot = lotSalvo; // não redesenha agora — só quando o usuário voltar pra mandala

  return { png1, png2 };
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

/* Monta o conteúdo de dentro de ".rel-viewer" (capa + índice + páginas +
   encerramento) a partir de um preset (salvo ou "em memória", tanto faz)
   — extraída de montarEExibirRelatorio pra ser reaproveitada também pela
   prévia sob demanda do editor de modelo (atualizarPreviaEditorModelo),
   garantindo que as duas usam exatamente a mesma renderização. */
function montarConteudoRelatorioHtml(preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte) {
  const marcaHtml = perfil.logo_url
    ? `<img src="${perfil.logo_url}" alt="Logo do astrólogo" class="rel-logo-astrologo">`
    : '';
  const rodapeAstrologo = [perfil.nome, perfil.telefone, perfil.email].filter(Boolean);
  const capaClasseCeu = (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu') ? ' rel-capa-ceu' : '';
  // "__capa__" e "__encerramento__" só guardam metadado/texto fixo (a
  // escolha da mandala da capa, o texto de fechamento) — não são páginas
  // do corpo do relatório, então nunca entram no map abaixo.
  const blocos = (preset.blocos || []).filter(b => b.type !== 'capa' && b.type !== 'encerramento');
  const imgCapa = imagemCapaRelatorio(capaFonte, png1, png2);
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
    <section class="rel-page rel-capa${capaClasseCeu}" data-pg="capa">
      <h1 class="rel-titulo-capa">${escapeHtml(preset.nome)}</h1>
      ${imgCapa ? `
        <div class="rel-capa-centro">
          <img class="rel-img-capa" src="${imgCapa}" alt="${escapeHtml(preset.nome)}">
        </div>
      ` : '<div class="rel-capa-centro"></div>'}
      <div class="rel-marca-rodape">
        ${marcaHtml}
        <div class="rel-powered-by">powered by Astro Hellenic</div>
      </div>
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

function montarEExibirRelatorio(container, preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte) {
  injetarEstilosRelatorio();

  // Guardado num global pra "Baixar PDF" (chamada só pelo onclick do botão
  // abaixo, sem parâmetro) saber o nome do modelo pro nome do arquivo.
  window.relatorioPresetAtual = preset;

  const conteudoHtml = montarConteudoRelatorioHtml(preset, perfil, png1, png2, lotesNatal, ascAbsNatal, capaFonte);

  const htmlRelatorio = `
    <div class="rel-toolbar no-print" id="relToolbarFixa">
      <button type="button" class="btn-secondary" onclick="voltarConfigRelatorio()"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
      <button type="button" id="relBtnBaixarPdf" class="btn-primary" onclick="baixarRelatorioPDF()"><i class="fa-solid fa-file-arrow-down"></i> Baixar PDF</button>
    </div>
    <div id="relToolbarEspacador" class="no-print"></div>

    <div class="rel-viewer">
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

/* Escreve o número da página no canto inferior direito, direto no PDF
   (não é uma captura de tela — é texto de verdade, desenhado pelo
   próprio jsPDF em cima da imagem já colada) — assim funciona certinho
   mesmo nas páginas que vieram de um bloco fatiado (um texto bem
   comprido que ocupou mais de uma folha), onde cada fatia physicamente
   é uma página своя e precisa do seu próprio número. Sem isso, o Índice
   apontava pra números que não apareciam em lugar nenhum do PDF. */
function numerarPaginaPdf(pdf, numero, larguraMm, alturaMm) {
  pdf.setFontSize(9);
  pdf.setTextColor(154, 109, 24); // mesmo tom dourado do número no Índice em tela
  pdf.text(String(numero), larguraMm - 12, alturaMm - 10, { align: 'right' });
}

/* GERA O PDF DIRETO EM CÓDIGO — sem passar pelo "Imprimir" do navegador.
   Foi trocado por isso porque cada navegador/aparelho (Chrome, Safari,
   iPad) tem seu próprio motor de impressão, com seus próprios
   cabeçalhos/rodapés forçados, margens e jeito de calcular página —
   nenhum CSS consegue controlar isso por completo, e por isso o
   relatório vinha saindo diferente (e quebrado) dependendo de onde era
   gerado. Aqui a gente tira uma "foto" (html2canvas) de cada .rel-page
   já pronta na tela — a prévia sempre esteve certa, só a impressão que
   não — e cola essas fotos, uma por uma, em folhas A4 de verdade dentro
   de um arquivo PDF (jsPDF). Sem depender de navegador nenhum pra
   paginar, o resultado é idêntico em qualquer aparelho. */
async function baixarRelatorioPDF() {
  const viewer = document.querySelector('.rel-viewer');
  if (!viewer) return;
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou. Recarregue a página e tente de novo.'); return; }
  if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') { alert('Biblioteca de geração de PDF não carregou. Recarregue a página e tente de novo.'); return; }

  const paginas = Array.from(viewer.querySelectorAll(':scope > .rel-page'));
  if (!paginas.length) return;

  const botao = document.getElementById('relBtnBaixarPdf');
  const rotuloOriginal = botao ? botao.innerHTML : '';
  if (botao) botao.disabled = true;

  const MM_A4_LARGURA = 210;
  const MM_A4_ALTURA = 297;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let paginasPdfGeradas = 0;

    for (let i = 0; i < paginas.length; i++) {
      const pagina = paginas[i];
      if (botao) botao.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gerando página ${i + 1} de ${paginas.length}...`;

      // Tira a sombra e a margem que só existem pra separar as páginas
      // na prévia em tela — numa folha de PDF de verdade não fazem
      // sentido — e o selo de número em tela (o número de verdade quem
      // escreve é o jsPDF, depois, direto na página; se a captura
      // incluísse o selo também, o número saía em dobro). Devolve tudo
      // como estava depois de capturar.
      const boxShadowOriginal = pagina.style.boxShadow;
      const margemOriginal = pagina.style.margin;
      const seloNumero = pagina.querySelector(':scope > .rel-num-pagina-canto');
      pagina.style.boxShadow = 'none';
      pagina.style.margin = '0';
      if (seloNumero) seloNumero.style.display = 'none';

      // Um texto personalizado bem comprido faz essa página crescer bem
      // mais alta que uma folha A4 (de propósito — ver comentário
      // abaixo, que depois fatia isso em várias folhas). Só que
      // html2canvas cria UM canvas do tamanho da página inteira ANTES de
      // fatiar, e em "scale: 2" isso pode passar do limite de área de
      // canvas que Safari/iPad aceita (por volta de 4096px num dos
      // lados, dependendo do aparelho) — quando passa, o navegador não
      // avisa nada, só devolve um canvas em branco/cortado a partir daí,
      // e é isso que fazia o texto que não cabia numa folha só
      // "simplesmente não aparecer" em vez de virar a página seguinte.
      // Reduz a escala só quando a página é alta o suficiente pra
      // esbarrar nesse limite — páginas normais (a grande maioria)
      // continuam em scale:2, nítidas como sempre.
      const LIMITE_DIMENSAO_CANVAS_PX = 4000;
      const larguraNaturalPx = pagina.scrollWidth;
      const alturaNaturalPx = pagina.scrollHeight;
      let escalaCaptura = 2;
      if (larguraNaturalPx * escalaCaptura > LIMITE_DIMENSAO_CANVAS_PX || alturaNaturalPx * escalaCaptura > LIMITE_DIMENSAO_CANVAS_PX) {
        escalaCaptura = Math.max(1, Math.min(
          LIMITE_DIMENSAO_CANVAS_PX / larguraNaturalPx,
          LIMITE_DIMENSAO_CANVAS_PX / alturaNaturalPx
        ));
      }

      const canvas = await html2canvas(pagina, { scale: escalaCaptura, useCORS: true, backgroundColor: '#ffffff' });
      pagina.style.boxShadow = boxShadowOriginal;
      pagina.style.margin = margemOriginal;
      if (seloNumero) seloNumero.style.display = '';

      // Praticamente todo bloco cabe exatamente numa folha (a prévia em
      // tela já é do tamanho A4). Mas um texto personalizado bem comprido
      // pode passar de uma página — em vez de espremer tudo numa folha só
      // (o que distorceria o conteúdo), fatia a imagem em pedaços de uma
      // folha cada, sem espremer nada.
      const pxPorMm = canvas.width / MM_A4_LARGURA;
      const alturaEquivalenteMm = canvas.height / pxPorMm;

      if (alturaEquivalenteMm <= MM_A4_ALTURA + 2) { // +2mm de tolerância de arredondamento — cabe numa folha só
        if (paginasPdfGeradas > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, MM_A4_LARGURA, alturaEquivalenteMm, undefined, 'FAST');
        paginasPdfGeradas++;
        numerarPaginaPdf(pdf, paginasPdfGeradas, MM_A4_LARGURA, MM_A4_ALTURA);
      } else {
        const alturaFatiaPx = Math.round(MM_A4_ALTURA * pxPorMm);
        let offsetPx = 0;
        while (offsetPx < canvas.height) {
          const alturaDestaFatiaPx = Math.min(alturaFatiaPx, canvas.height - offsetPx);

          const fatia = document.createElement('canvas');
          fatia.width = canvas.width;
          fatia.height = alturaDestaFatiaPx;
          fatia.getContext('2d').drawImage(canvas, 0, offsetPx, canvas.width, alturaDestaFatiaPx, 0, 0, canvas.width, alturaDestaFatiaPx);

          if (paginasPdfGeradas > 0) pdf.addPage();
          const alturaFatiaMm = alturaDestaFatiaPx / pxPorMm;
          pdf.addImage(fatia.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, MM_A4_LARGURA, alturaFatiaMm, undefined, 'FAST');
          paginasPdfGeradas++;
          numerarPaginaPdf(pdf, paginasPdfGeradas, MM_A4_LARGURA, MM_A4_ALTURA);
          offsetPx += alturaDestaFatiaPx;
        }
      }
    }

    pdf.save(nomeArquivoRelatorioPDF(window.relatorioPresetAtual || {}));
  } catch (err) {
    console.error('Erro ao gerar o PDF do relatório:', err);
    alert('Não foi possível gerar o PDF. Tente novamente.');
  } finally {
    if (botao) { botao.disabled = false; botao.innerHTML = rotuloOriginal; }
  }
}
window.baixarRelatorioPDF = baixarRelatorioPDF;

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

    opts.itensIndice.push({ titulo: bloco.titulo, alvo: bloco.id });

    return `
      <section class="rel-page" data-pg="${escapeHtml(bloco.id)}">
        <div class="rel-h1">${escapeHtml(bloco.titulo)}</div>
        <div class="rel-corpo">${corpoHtml}</div>
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
      return `
        <section class="rel-page rel-page-captura" data-pg="${escapeHtml(bloco.id)}">
          <div class="rel-titulo-captura">${escapeHtml(titulo)}</div>
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

    // Número no canto inferior direito da PRÓPRIA página (não só no
    // Índice) — pra aparecer tanto na prévia em tela quanto pra quem só
    // olhar aqui sem baixar o PDF. O número de verdade em cada folha do
    // PDF baixado é escrito à parte, direto pelo jsPDF (ver
    // numerarPaginaPdf) — escondido durante a captura de cada página
    // (baixarRelatorioPDF), senão ficaria duplicado no PDF.
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
  style.textContent = `
      /* position:fixed, não sticky — ver a nota em CLAUDE.md sobre por que
         sticky não é confiável nesse layout (mesmo motivo da barra do
         editor, .rel-editor-tabs). #relToolbarEspacador logo depois dela
         no HTML reserva o espaço que ela ocupa. */
      .rel-toolbar { display: flex; justify-content: center; gap: 10px; padding: 12px; position: fixed; top: 0; left: 0; right: 0; background: #f1f5f9; z-index: 50; border-bottom: 1px solid #e2d9c2; }
      .rel-toolbar button { display: flex; align-items: center; gap: 6px; }
      .rel-viewer { background: #e5e7eb; padding: 24px 12px; }

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
      .rel-capa { display: flex; flex-direction: column; align-items: center; text-align: center; }
      .rel-titulo-capa { font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 30px; line-height: 1.25; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 14mm; flex-shrink: 0; }
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
      .rel-capa.rel-capa-ceu { background: #1A073F; }
      .rel-capa.rel-capa-ceu .rel-titulo-capa { color: #d4af37; }

      /* PÁGINAS DAS MANDALAS */
      .rel-page-mapa { display: flex; flex-direction: column; align-items: center; }
      .rel-img-mandala { width: 100%; max-width: 175mm; margin-top: 10px; }
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
      /* flex:1 + min-height:0 é o que permite essa área encolher dentro da
         coluna (senão a imagem empurraria a página pra além do tamanho A4)
         — dentro dela, centraliza a imagem nos dois eixos preservando a
         proporção original, seja a captura larga ou alta. */
      .rel-captura-corpo { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .rel-img-captura { max-width: 100%; max-height: 100%; width: auto; height: auto; display: block; margin: 0 auto; }
      .rel-captura-faltando { color: #b45309; font-size: 13px; }

      /* ENCERRAMENTO */
      .rel-page-encerramento { display: flex; flex-direction: column; justify-content: space-between; }
      .rel-rodape-astrologo { border-top: 1.5px solid #c59b27; padding-top: 14px; font-size: 12px; color: #334155; break-inside: avoid; page-break-inside: avoid; }
      .rel-rodape-nome { font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 13px; margin-bottom: 3px; }

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
           impressa, com folga bem maior que antes (250mm dos 297mm
           disponíveis — 47mm de sobra, não só os ~30mm de antes).
           Motivo do aumento da folga: o navegador só respeita o
           "@page { margin: 0 }" logo acima quando a própria caixa de
           diálogo de impressão está com "Margens: Nenhuma" e "Escala:
           100%" — se a pessoa deixar em "Padrão" (o mais comum), o
           navegador aplica a margem dele por cima, sem avisar, e
           "rouba" espaço da página sem o CSS saber. Essa folga extra é
           a defesa contra isso. Esse valor precisa ser o MESMO em toda
           .rel-page, capa incluída: testando, misturar valores
           diferentes entre páginas (ou mudar esse número sem também
           levar em conta o @page acima) foi o que causou perda de
           conteúdo em relatórios longos numa rodada anterior — qualquer
           ajuste futuro aqui precisa ser testado gerando um PDF de
           verdade com várias páginas, não só olhando o CSS. */
        .rel-page { box-shadow: none; margin: 0; width: auto; min-height: 250mm; overflow: visible; page-break-after: always; }
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
           inteira transbordar pra uma segunda página quase em branco. */
        .rel-capa { height: 250mm; min-height: 250mm; }
      }
  `;
  document.head.appendChild(style);
}
