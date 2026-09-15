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
  }
};

/* CONJUNTO DE BLOCOS PADRÃO — o relatório "Mapa Natal Clássico" original.
   Serve de modelo pra quando o astrólogo cria um preset novo, e é usado
   pra semear automaticamente o primeiro preset de quem ainda não tem
   nenhum salvo (pra não perder a ferramenta que já existia). */
const RELATORIO_BLOCOS_PADRAO = [
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
  }
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
  { id: 'decenios', type: 'ferramenta' }
]);

/* Guarda em memória (dura só a sessão atual, não persiste) a última
   captura de cada ferramenta "reaproveitada" no relatório (ex.:
   Profecção). É preenchida pelo botão "Adicionar ao Relatório" que
   fica na própria tela de cada ferramenta — o astrólogo deixa a tela
   do jeito que quer mostrar pro cliente e clica no botão; o relatório
   usa exatamente essa imagem, sem reconstruir nada. */
window.relatorioCapturas = window.relatorioCapturas || {};

async function capturarTelaParaRelatorio(toolId, containerId, rotulo) {
  const elemento = document.getElementById(containerId);
  if (!elemento) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  if (typeof html2canvas !== 'function') { alert('Biblioteca de captura de imagem não carregou.'); return; }

  try {
    const canvas = await html2canvas(elemento, { backgroundColor: '#fffdf5', scale: 2, useCORS: true });
    window.relatorioCapturas[toolId] = { dataUrl: canvas.toDataURL('image/png'), capturadoEm: Date.now() };
    alert(`"${rotulo}" foi adicionado ao relatório. Gere o relatório novamente para ver essa página atualizada.`);
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

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS (abrirModuloTecnica) */
async function iniciarModuloRelatorio() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para gerar o Relatório.</div>`;
    return;
  }

  container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Carregando seus modelos de relatório...</div>`;

  const presets = await carregarOuSemearPresetsRelatorio();
  renderRelatorioSetup(container, presets);
}

function renderRelatorioSetup(container, presets) {
  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');
  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : currentSubjectName;

  const opcoesPreset = presets.map((p, idx) => `<option value="${idx}">${escapeHtml(p.nome)}</option>`).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">

      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">Relatório</h2>
        <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          ${escapeHtml(headerTitle)} • ${dia}/${mes}/${ano} às ${hora}:${min} • ${escapeHtml(currentGeo.city || "Local n/i")}
        </div>
      </div>

      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Modelo de Relatório</label>
        <select id="relPresetEscolhido" class="modal-select" style="margin-bottom: 6px;">${opcoesPreset}</select>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 18px; line-height: 1.5;">
          Os textos, o logo e os seus dados de contato ficam configurados em <strong>Configurações → Relatórios</strong>, no menu lateral.
        </div>

        <button type="button" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px;" onclick="confirmarGerarRelatorio()">
          <i class="fa-solid fa-file-pdf" style="margin-right: 6px;"></i> Gerar Relatório
        </button>
      </div>

    </div>
  `;

  window.relatorioPresetsCarregados = presets;
}

function confirmarGerarRelatorio() {
  const idx = parseInt(document.getElementById('relPresetEscolhido').value, 10) || 0;
  const preset = (window.relatorioPresetsCarregados || [])[idx];
  if (!preset) return;
  gerarRelatorioCompleto(preset);
}

async function gerarRelatorioCompleto(preset) {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Gerando o relatório...</div>`;

  const perfil = await carregarPerfilRelatorio();
  const blocos = preset.blocos || [];

  const { lotes: lotesNatal, ascAbs: ascAbsNatal } = calcularLotesRelatorio();
  const { png1, png2 } = await renderizarMandalasDoPreset(blocos);

  montarEExibirRelatorio(container, preset, perfil, png1, png2, lotesNatal, ascAbsNatal);
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
async function renderizarMandalasDoPreset(blocos) {
  const precisaNatal = blocos.some(b => b.type === 'ferramenta' && b.id === 'mandala_natal');
  const precisaFortuna = blocos.some(b => b.type === 'ferramenta' && b.id === 'mandala_fortuna');
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
  const container = document.getElementById('mandala-container');
  if (container && window.relatorioPresetsCarregados) renderRelatorioSetup(container, window.relatorioPresetsCarregados);
}

function montarEExibirRelatorio(container, preset, perfil, png1, png2, lotesNatal, ascAbsNatal) {
  const marcaHtml = perfil.logo_url
    ? `<img src="${perfil.logo_url}" alt="Logo do astrólogo" class="rel-logo-astrologo">`
    : '';
  const rodapeAstrologo = [perfil.nome, perfil.telefone, perfil.email].filter(Boolean);
  const capaClasseCeu = (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu') ? ' rel-capa-ceu' : '';
  const blocos = preset.blocos || [];

  injetarEstilosRelatorio();

  const itensIndice = [];
  const paginasHtml = blocos.map(bloco => renderBlocoRelatorio(bloco, { png1, png2, lotesNatal, ascAbsNatal, itensIndice })).join('');

  const indiceHtml = itensIndice.map(item => `
    <li><span>${escapeHtml(item.titulo)}</span><span class="rel-num-pagina" data-alvo="${item.alvo}"></span></li>
  `).join('');

  const htmlRelatorio = `
    <div class="rel-toolbar no-print">
      <button type="button" class="btn-secondary" onclick="voltarConfigRelatorio()"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
      <button type="button" class="btn-primary" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir / Salvar em PDF</button>
    </div>

    <div class="rel-viewer">

      <!-- CAPA (nome/data/local não se repetem aqui: já vêm no próprio
           cabeçalho que a mandala desenha dentro da imagem, quando ela existe) -->
      <section class="rel-page rel-capa${capaClasseCeu}" data-pg="capa">
        <h1 class="rel-titulo-capa">${escapeHtml(preset.nome)}</h1>
        ${png1 ? `
          <div class="rel-capa-centro">
            <img class="rel-img-capa" src="${png1}" alt="${escapeHtml(preset.nome)}">
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
      <section class="rel-page rel-page-encerramento">
        <div class="rel-corpo">
          <p>Caso tenha alguma dúvida ou queira complementar seu autoconhecimento através de previsões com técnicas como Revolução Solar ou Liberação Zodiacal, basta entrar em contato.</p>
          <p>Espero ter contribuído para seu autoconhecimento e que você alcance seus objetivos e tenha grande paz interior.</p>
          <p>Namastê 🙏</p>
        </div>
        ${rodapeAstrologo.length ? `
          <div class="rel-rodape-astrologo">
            ${perfil.nome ? `<div class="rel-rodape-nome">${escapeHtml(perfil.nome)}</div>` : ''}
            ${perfil.telefone ? `<div>${escapeHtml(perfil.telefone)}</div>` : ''}
            ${perfil.email ? `<div>${escapeHtml(perfil.email)}</div>` : ''}
          </div>
        ` : ''}
      </section>

    </div>
  `;

  container.innerHTML = htmlRelatorio;
  container.scrollTop = 0;
  numerarPaginasIndice(container);
}

/* Renderiza um bloco do preset (texto ou ferramenta) como uma ou mais
   .rel-page, e — quando o bloco entra no índice — registra o item em
   opts.itensIndice pra virar uma linha na página de Índice. */
function renderBlocoRelatorio(bloco, opts) {
  if (bloco.type === 'texto') {
    const paragrafos = (bloco.corpo || '').split(/\n\s*\n/).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    let tabelaExtra = '';
    if (bloco.id === 'sete-lotes') tabelaExtra = renderTabelaLotesRelatorio(opts.lotesNatal, opts.ascAbsNatal);
    if (bloco.id === 'dodecatemorias') tabelaExtra = renderTabelaDodecatemoriasRelatorio();

    opts.itensIndice.push({ titulo: bloco.titulo, alvo: bloco.id });

    return `
      <section class="rel-page" data-pg="${escapeHtml(bloco.id)}">
        <div class="rel-h1">${escapeHtml(bloco.titulo)}</div>
        <div class="rel-corpo">${paragrafos}</div>
        ${tabelaExtra}
      </section>
    `;
  }

  if (bloco.type === 'ferramenta') {
    const info = RELATORIO_FERRAMENTAS_DISPONIVEIS[bloco.id];

    /* Blocos "capturados": não recalculam nada — usam a imagem que o
       astrólogo trouxe da própria tela da ferramenta (botão "Adicionar
       ao Relatório"), exatamente como ficou montada lá, com o layout,
       ícones e realces que a ferramenta original já desenha. */
    if (info && info.capturada) {
      const titulo = (info.tituloIndice || info.label);
      opts.itensIndice.push({ titulo, alvo: bloco.id });
      const captura = window.relatorioCapturas && window.relatorioCapturas[bloco.id];
      if (!captura) {
        return `
          <section class="rel-page" data-pg="${escapeHtml(bloco.id)}">
            <div class="rel-h1">${escapeHtml(titulo)}</div>
            <div class="rel-corpo rel-captura-faltando">
              Nenhuma captura encontrada. Abra ${escapeHtml(info.telaOrigem || 'a ferramenta')}
              com os dados deste cliente, deixe a tela do jeito que quer mostrar e clique em
              "Adicionar ao Relatório" antes de gerar o relatório de novo.
            </div>
          </section>
        `;
      }
      return `
        <section class="rel-page rel-page-captura" data-pg="${escapeHtml(bloco.id)}">
          <img class="rel-img-captura" src="${captura.dataUrl}" alt="${escapeHtml(titulo)}">
        </section>
      `;
    }

    if (bloco.id === 'mandala_natal' && opts.png1) {
      opts.itensIndice.push({ titulo: (info && info.tituloIndice) || 'Mapa Natal', alvo: bloco.id });
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

/* Preenche os números de página do Índice medindo a altura real de cada
   seção já renderizada (cada .rel-page ocupa uma ou mais páginas físicas,
   se o conteúdo dela transbordar). Não dá pra saber a paginação de
   antemão porque o conteúdo varia por cliente/preset, então ela é
   calculada depois de tudo estar na tela. */
function numerarPaginasIndice(container) {
  const paginaAlturaPx = 297 * 96 / 25.4; // 297mm convertidos para px (96dpi, o padrão do CSS)
  const paginas = container.querySelectorAll('.rel-viewer > .rel-page[data-pg]');
  let numeroAtual = 1;
  const numeroPorAlvo = {};

  paginas.forEach(pagina => {
    numeroPorAlvo[pagina.dataset.pg] = numeroAtual;
    const altura = pagina.getBoundingClientRect().height;
    numeroAtual += Math.max(1, Math.round(altura / paginaAlturaPx));
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
      .rel-toolbar { display: flex; justify-content: center; gap: 10px; padding: 12px; position: sticky; top: 0; background: #f1f5f9; z-index: 5; border-bottom: 1px solid #e2d9c2; }
      .rel-toolbar button { display: flex; align-items: center; gap: 6px; }
      .rel-viewer { background: #e5e7eb; padding: 24px 12px; }

      .rel-page {
        width: 210mm;
        max-width: 100%;
        min-height: 297mm;
        margin: 0 auto 24px auto;
        background: #ffffff;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        padding: 18mm 16mm;
        box-sizing: border-box;
        font-family: 'Montserrat', sans-serif;
      }

      .rel-h1 {
        font-family: 'Cinzel', serif; font-size: 19px; font-weight: 800; color: #103b70;
        text-align: center; text-transform: uppercase; letter-spacing: 0.04em;
        border: 1.5px solid #c59b27; border-radius: 8px; padding: 14px; margin-bottom: 26px; background: #fffdf5;
        break-inside: avoid; page-break-inside: avoid;
      }

      .rel-corpo p { font-size: 12.5px; line-height: 1.85; color: #1e293b; text-align: justify; margin-bottom: 14px; }

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
      .rel-img-capa { max-width: 92mm; max-height: 100%; }
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
         ferramenta, sem redesenhar nada ao redor dela. */
      .rel-page-captura { display: flex; align-items: center; justify-content: center; padding: 0; }
      .rel-img-captura { width: 100%; height: auto; display: block; }
      .rel-captura-faltando { color: #b45309; font-size: 13px; }

      /* ENCERRAMENTO */
      .rel-page-encerramento { display: flex; flex-direction: column; justify-content: space-between; }
      .rel-rodape-astrologo { border-top: 1.5px solid #c59b27; padding-top: 14px; font-size: 12px; color: #334155; break-inside: avoid; page-break-inside: avoid; }
      .rel-rodape-nome { font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 13px; margin-bottom: 3px; }

      @media print {
        .rel-viewer { background: #ffffff; padding: 0; }
        /* min-height (NUNCA height fixo) do tamanho real de uma folha
           impressa (297mm - as duas margens de 12mm do @page abaixo): dá
           às páginas que distribuem conteúdo do topo ao rodapé com
           flexbox (a capa, o encerramento) uma altura de referência pra
           empurrar o rodapé pra baixo de verdade — sem isso ele sobe pra
           logo abaixo do texto. Precisa ser min-height e não height: uma
           altura EXATA de 273mm, por um arredondamento de fração de
           pixel entre mm e px, ficava um triz mais alta que a página
           impressa e cada .rel-page acabava "vazando" essa migalha pra
           uma página extra em branco (o relatório saía com o dobro de
           páginas, uma em branco atrás de cada uma com conteúdo).
           min-height nunca cria esse vazamento: o conteúdo mais longo
           (tabelas grandes) continua transbordando normalmente pra
           próxima página quando realmente precisa. */
        .rel-page { box-shadow: none; margin: 0; width: auto; min-height: 273mm; overflow: visible; page-break-after: always; }
        .rel-page:last-child { page-break-after: auto; }

        /* A capa é sempre a 1ª página do documento: tira a margem só
           dela (@page :first), pra o fundo roxo do tema Céu ir até a
           borda do papel em vez de sobrar uma faixa branca ao redor.
           Como essa página perde os 12mm de margem de cada lado, ela
           também precisa da altura cheia (297mm, não 273mm) pra o roxo
           preencher até embaixo — as demais páginas continuam com
           margem normal e 273mm. */
        .rel-capa { min-height: 297mm; }
        @page { size: A4; margin: 12mm; }
        @page :first { margin: 0; }
      }
  `;
  document.head.appendChild(style);
}
