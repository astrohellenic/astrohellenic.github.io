/* ==========================================
   MÓDULO DE RELATÓRIO (MAPA NATAL CLÁSSICO EM PDF)
   Monta um relatório multi-página no padrão do relatório manual do
   astrólogo (capa + textos fixos + as duas mandalas do cliente) e usa
   a impressão do navegador ("Salvar como PDF") para exportar — sem
   depender de nenhuma biblioteca nova.
   ========================================== */

const RELATORIO_ASTROLOGO_KEY = 'astro_relatorio_dados_astrologo';

const RELATORIO_LOT_NOMES = {
  fortune: 'Lote da Fortuna',
  spirit: 'Lote do Espírito',
  venus: 'Lote de Eros',
  mercury: 'Lote da Necessidade',
  mars: 'Lote da Audácia',
  jupiter: 'Lote da Vitória',
  saturn: 'Lote da Nêmesis'
};

function carregarDadosAstrologoRelatorio() {
  try {
    const raw = localStorage.getItem(RELATORIO_ASTROLOGO_KEY);
    return raw ? JSON.parse(raw) : { nome: '', telefone: '', email: '' };
  } catch (e) {
    return { nome: '', telefone: '', email: '' };
  }
}

function salvarDadosAstrologoRelatorio(dados) {
  try { localStorage.setItem(RELATORIO_ASTROLOGO_KEY, JSON.stringify(dados)); } catch (e) { /* localStorage indisponível */ }
}

/* FUNÇÃO DE ENTRADA CHAMADA PELO SUPABASE.JS (abrirModuloTecnica) */
function iniciarModuloRelatorio() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para gerar o Relatório.</div>`;
    return;
  }

  renderRelatorioSetup(container);
}

function renderRelatorioSetup(container) {
  const dados = carregarDadosAstrologoRelatorio();
  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');
  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : currentSubjectName;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">

      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">Relatório · Mapa Natal Clássico</h2>
        <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
          ${escapeHtml(headerTitle)} • ${dia}/${mes}/${ano} às ${hora}:${min} • ${escapeHtml(currentGeo.city || "Local n/i")}
        </div>
      </div>

      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid var(--border-color, #e2d9c2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #103b70; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em;">Dados de Contato</div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 14px; line-height: 1.5;">Aparecem na página final do relatório. Ficam salvos neste navegador para os próximos relatórios.</div>

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Seu nome / marca</label>
        <input type="text" id="relAstrNome" class="modal-input" style="margin-bottom: 10px;" value="${escapeHtml(dados.nome || '')}" placeholder="Ex: Cassio Farias - Astrólogo">

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Telefone / WhatsApp</label>
        <input type="text" id="relAstrTelefone" class="modal-input" style="margin-bottom: 10px;" value="${escapeHtml(dados.telefone || '')}" placeholder="Ex: 11970404508">

        <label style="font-size: 11px; font-weight: 600; color: #64748b;">E-mail</label>
        <input type="email" id="relAstrEmail" class="modal-input" style="margin-bottom: 18px;" value="${escapeHtml(dados.email || '')}" placeholder="Ex: contato@email.com">

        <button type="button" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px;" onclick="confirmarGerarRelatorio()">
          <i class="fa-solid fa-file-pdf" style="margin-right: 6px;"></i> Gerar Relatório
        </button>
      </div>

    </div>
  `;
}

function confirmarGerarRelatorio() {
  const dados = {
    nome: (document.getElementById('relAstrNome').value || '').trim(),
    telefone: (document.getElementById('relAstrTelefone').value || '').trim(),
    email: (document.getElementById('relAstrEmail').value || '').trim()
  };
  salvarDadosAstrologoRelatorio(dados);
  gerarRelatorioCompleto(dados);
}

async function gerarRelatorioCompleto(dadosAstrologo) {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37; margin-bottom: 12px; display: block;"></i>Gerando as mandalas do relatório...</div>`;

  // Busca o logotipo salvo pelo astrólogo (Configurações > Captação de Clientes), se houver.
  // Nunca trava a geração do relatório caso a busca falhe.
  let logoUrl = null;
  try {
    const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    if (client) {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const { data } = await client.from('configuracoes').select('logo_url').eq('user_id', user.id).maybeSingle();
        if (data && data.logo_url) logoUrl = data.logo_url;
      }
    }
  } catch (e) { /* segue sem logo */ }

  const lotSalvo = selectedHouse1Lot;
  const ascAbsNatal = currentCalculatedData.Ascendente.grau_absoluto;

  selectedHouse1Lot = 'ASC';
  renderMandala(null, (png1) => {
    const lotesNatal = (window.currentLotes || []).slice();

    selectedHouse1Lot = 'fortune';
    renderMandala(null, (png2) => {
      selectedHouse1Lot = lotSalvo; // restaura o estado da mandala (não é redesenhada agora, só quando o usuário voltar pra ela)

      montarEExibirRelatorio(container, png1, png2, lotesNatal, ascAbsNatal, dadosAstrologo, logoUrl);
    });
  });
}

function voltarConfigRelatorio() {
  const container = document.getElementById('mandala-container');
  if (container) renderRelatorioSetup(container);
}

function montarEExibirRelatorio(container, png1, png2, lotesNatal, ascAbsNatal, dadosAstrologo, logoUrl) {
  const marcaHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo do astrólogo" class="rel-logo-astrologo">`
    : '';

  const rodapeAstrologo = [dadosAstrologo.nome, dadosAstrologo.telefone, dadosAstrologo.email].filter(Boolean);
  const capaClasseCeu = (typeof window.temaMandala !== 'undefined' && window.temaMandala === 'ceu') ? ' rel-capa-ceu' : '';

  const tabelaLotesHtml = renderTabelaLotesRelatorio(lotesNatal, ascAbsNatal);
  const tabelaDodecHtml = renderTabelaDodecatemoriasRelatorio();

  injetarEstilosRelatorio();

  const htmlRelatorio = `
    <div class="rel-toolbar no-print">
      <button type="button" class="btn-secondary" onclick="voltarConfigRelatorio()"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
      <button type="button" class="btn-primary" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir / Salvar em PDF</button>
    </div>

    <div class="rel-viewer">

      <!-- 1. CAPA (nome/data/local não se repetem aqui: já vêm no
           próprio cabeçalho que a mandala desenha dentro da imagem) -->
      <section class="rel-page rel-capa${capaClasseCeu}" data-pg="capa">
        <h1 class="rel-titulo-capa">Mapa Natal<br>Clássico</h1>
        <div class="rel-capa-centro">
          <img class="rel-img-capa" src="${png1}" alt="Mapa Natal">
        </div>
        <div class="rel-marca-rodape">
          ${marcaHtml}
          <div class="rel-powered-by">powered by Astro Hellenic</div>
        </div>
      </section>

      <!-- 2. ÍNDICE -->
      <section class="rel-page" data-pg="indice">
        <div class="rel-h1">Índice</div>
        <ul class="rel-indice">
          <li><span>O que é Mapa Natal</span><span class="rel-num-pagina" data-alvo="o-que-e"></span></li>
          <li><span>Mapa Natal</span><span class="rel-num-pagina" data-alvo="mandala1"></span></li>
          <li><span>Entendendo as Mandalas</span><span class="rel-num-pagina" data-alvo="entendendo"></span></li>
          <li><span>Os Sete Lotes Herméticos</span><span class="rel-num-pagina" data-alvo="sete-lotes"></span></li>
          <li><span>As Dodecatemórias</span><span class="rel-num-pagina" data-alvo="dodecatemorias"></span></li>
          <li><span>Casas a partir do Lote da Fortuna</span><span class="rel-num-pagina" data-alvo="casas-fortuna"></span></li>
        </ul>
      </section>

      <!-- 3. O QUE É MAPA NATAL -->
      <section class="rel-page" data-pg="o-que-e">
        <div class="rel-h1">O que é Mapa Natal</div>
        <div class="rel-corpo">
          <p>O mapa natal é o registro geométrico e astronômico do céu no exato instante e local do nascimento de um indivíduo. Longe de ser um resumo estático de personalidade, ele representa a matriz fundamental de uma vida, funcionando como o projeto arquitetônico que descreve o destino, as potências e os cenários que se desdobrarão ao longo da existência.</p>
          <p>Na perspectiva clássica, o mapa funciona como um espelho do macrocosmo, onde a disposição dos sete astros errantes pelas doze divisões do céu determina a distribuição de responsabilidades e papéis na jornada do nativo. Cada planeta atua como um administrador ou emissário de áreas específicas da vida, e a rede de relações que eles estabelecem entre si desenha as facilidades e os obstáculos fixos que estruturam a realidade material e psicológica do indivíduo.</p>
          <p>Compreender o mapa natal não significa submeter-se a um determinismo cego, mas sim obter o mapeamento exato das regras do jogo da própria vida. Ele revela a engenharia oculta por trás dos acontecimentos e inclinações pessoais, servindo como a ferramenta definitiva para que o indivíduo compreenda seu papel no cosmos, otimize suas virtudes naturais e navegue por seus desafios com clareza e maestria técnica.</p>
        </div>
      </section>

      <!-- 4. MAPA NATAL - MANDALA 1 -->
      <section class="rel-page rel-page-mapa" data-pg="mandala1">
        <div class="rel-h1">Mapa Natal</div>
        <img class="rel-img-mandala" src="${png1}" alt="Mandala 1">
        <div class="rel-legenda-mandala">Mandala 1</div>
      </section>

      <!-- 5. MANDALA 2 (Fortuna na Casa 1) -->
      <section class="rel-page rel-page-mapa" data-pg="mandala2">
        <img class="rel-img-mandala" src="${png2}" alt="Mandala 2">
        <div class="rel-legenda-mandala">Mandala 2</div>
      </section>

      <!-- 6. ENTENDENDO AS MANDALAS -->
      <section class="rel-page" data-pg="entendendo">
        <div class="rel-h1">Entendendo as Mandalas</div>
        <div class="rel-corpo">
          <p>Para facilitar a sua navegação pelo relatório, o seu mapa foi estruturado em duas camadas que se complementam. Veja como ler cada uma delas:</p>
          <p><strong>Mandala 1 (O Mapa Natal Absoluto):</strong> mostra a posição exata dos planetas do setenário tradicional (coloridos), os signos (também coloridos), nodos lunares e lotes (em preto), bem como as casas nativas (contadas a partir do ascendente) no momento exato do nascimento. Na borda externa dos signos estão as marcações das dodecatemórias dentro do respectivo signo — uma espécie de "microscópio" da astrologia clássica: cada signo é subdividido em 12 partes, revelando onde a semente oculta (ou a raiz) de cada planeta está plantada.</p>
          <p><strong>Mandala 2 (As Casas a partir da Fortuna):</strong> o mapa visto com o Lote da Fortuna na casa 1 serve para analisar a vida sob a ótica material. Enquanto as casas nativas focam na jornada geral, as Casas de Fortuna revelam como a sorte, a saúde física, as finanças e o meio ambiente tangível vão se manifestar concretamente na realidade. A disposição das cores funciona como na Mandala 1.</p>
        </div>
      </section>

      <!-- 7. OS SETE LOTES HERMÉTICOS -->
      <section class="rel-page" data-pg="sete-lotes">
        <div class="rel-h1">Os Sete Lotes Herméticos</div>
        <div class="rel-corpo">
          <p>Os Sete Lotes Herméticos constituem um dos sistemas mais refinados de cálculo e subdivisão temática da astrologia clássica. Atribuída à tradição de Hermes, essa metodologia projeta sete pontos matemáticos específicos no mapa natal, onde cada um está geometricamente atrelado a um dos astros do setenário. Eles funcionam como receptáculos das promessas planetárias, isolando e detalhando áreas cruciais da experiência humana para avaliar como o destino e a ação do nativo se desdobrarão em cenários muito específicos da vida material e factual.</p>
          <p>Cada lote atua como uma lente especializada para um assunto fundamental: o Lote da Fortuna (associado à Lua) governa o corpo, a saúde e as circunstâncias materiais; o Lote do Espírito (Sol) direciona a mente, a intenção, a vontade e a carreira; o Lote de Eros (Vênus) revela os desejos, os afetos e as escolhas feitas por prazer; o Lote da Necessidade (Mercúrio) sinaliza as restrições, as disputas e o intelecto sob pressão; o Lote da Audácia (Marte) rege a audácia, os riscos e as tomadas de iniciativa; o Lote da Vitória (Júpiter) aponta para o sucesso, as honras e a gratificação; e o Lote da Nêmesis (Saturno) administra as perdas, os fatores ocultos e as limitações inevitáveis.</p>
          <p>Analisando o conjunto dos sete lotes herméticos — observando em quais casas esses pontos se localizam e como seus respectivos senhores se posicionam no mapa — decodificamos a infraestrutura factual que sustenta os sucessos, as crises, as escolhas e as amarras que o nativo encontrará ao longo de sua jornada.</p>
        </div>
        ${tabelaLotesHtml}
      </section>

      <!-- 8. AS DODECATEMÓRIAS -->
      <section class="rel-page" data-pg="dodecatemorias">
        <div class="rel-h1">As Dodecatemórias</div>
        <div class="rel-corpo">
          <p>As dodecatemórias representam uma das técnicas mais profundas de microsubdivisão zodiacal da astrologia clássica. O termo, de origem grega, refere-se à divisão de cada um dos doze signos de 30° em doze partes menores de exatamente 2,5° cada, projetando uma espécie de "microcosmo zodiacal" dentro de cada signo. Essa técnica permite decodificar uma camada subjacente e íntima do mapa natal, revelando a raiz oculta e as ramificações invisíveis de cada planeta e ponto calculado.</p>
          <p>Na engenharia da astrologia clássica, a dodecatemória funciona como uma lente de altíssima definição. Ao projetar matematicamente a posição exata de um astro para um novo signo com base em seus graus, os antigos astrólogos conseguiam enxergar o que estava operando por baixo da superfície da matriz radical. Ela aponta para a verdadeira inclinação factual de um posicionamento, sendo capaz de confirmar, refinar ou direcionar a força das promessas de um planeta no destino prático do nativo.</p>
          <p>Portanto, a inclusão do mapa de dodecatemórias não serve como um adorno, mas sim como a sintonização fina das diretrizes do indivíduo — indispensável para destrinchar as nuances ocultas da capacidade realizadora, das aptidões e dos cenários exatos de atuação do nativo, trazendo à luz eixos de força que o mapa bruto e primário não evidencia de forma imediata.</p>
        </div>
        ${tabelaDodecHtml}
      </section>

      <!-- 9. CASAS A PARTIR DO LOTE DA FORTUNA -->
      <section class="rel-page" data-pg="casas-fortuna">
        <div class="rel-h1">Casas a partir do Lote da Fortuna</div>
        <div class="rel-corpo">
          <p>A rotação do mapa para posicionar o Lote da Fortuna como a Casa 1 estabelece uma matriz secundária e altamente especializada na astrologia clássica. Esta técnica, fundamentada nos escritos de Vettius Valens, consiste em utilizar o signo onde o lote está localizado como o novo ponto de partida para a contagem das doze casas, criando um sistema de referência voltado estritamente para a dimensão material, física e factual da existência.</p>
          <p>Enquanto a estrutura natal radical descreve a jornada geral da vida, este mapa derivado funciona como um biombo voltado para a engenharia da contingência. Ao reorganizar as casas a partir da Fortuna, os planetas assumem novos papéis e responsabilidades, revelando a arquitetura oculta da subsistência, da prosperidade, do corpo físico e dos eventos fortuitos. É através desta disposição que se mapeiam com precisão os eixos de aquisição, os momentos de ápice e os cenários onde a sorte ou os desafios materiais se manifestarão de forma concreta.</p>
          <p>Portanto, a análise deste mapa com a Fortuna na primeira casa oferece uma leitura focada na realidade prática e nas circunstâncias externas que cruzam o caminho do nativo — indispensável para decodificar como o fluxo da matéria, os recursos e os acasos do destino governarão a vida profissional e a capacidade de sustentação ao longo do tempo.</p>
        </div>
      </section>

      <!-- 10. ENCERRAMENTO -->
      <section class="rel-page rel-page-encerramento">
        <div class="rel-corpo">
          <p>Caso tenha alguma dúvida ou queira complementar seu autoconhecimento através de previsões com técnicas como Revolução Solar ou Liberação Zodiacal, basta entrar em contato.</p>
          <p>Espero ter contribuído para seu autoconhecimento e que você alcance seus objetivos e tenha grande paz interior.</p>
          <p>Namastê 🙏</p>
        </div>
        ${rodapeAstrologo.length ? `
          <div class="rel-rodape-astrologo">
            ${dadosAstrologo.nome ? `<div class="rel-rodape-nome">${escapeHtml(dadosAstrologo.nome)}</div>` : ''}
            ${dadosAstrologo.telefone ? `<div>${escapeHtml(dadosAstrologo.telefone)}</div>` : ''}
            ${dadosAstrologo.email ? `<div>${escapeHtml(dadosAstrologo.email)}</div>` : ''}
          </div>
        ` : ''}
      </section>

    </div>
  `;

  container.innerHTML = htmlRelatorio;
  container.scrollTop = 0;
  numerarPaginasIndice(container);
}

/* Preenche os números de página do Índice medindo a altura real de cada
   seção já renderizada (cada .rel-page ocupa 297mm — uma ou mais páginas
   físicas, se o conteúdo dela transbordar). Não dá pra saber a paginação
   de antemão porque o conteúdo varia por cliente (tabelas maiores/menores
   etc.), então ela é calculada depois de tudo estar na tela. */
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
      .rel-titulo-capa { font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 34px; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 14mm; flex-shrink: 0; }
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

      /* ENCERRAMENTO */
      .rel-page-encerramento { display: flex; flex-direction: column; justify-content: space-between; }
      .rel-rodape-astrologo { border-top: 1.5px solid #c59b27; padding-top: 14px; font-size: 12px; color: #334155; break-inside: avoid; page-break-inside: avoid; }
      .rel-rodape-nome { font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 13px; margin-bottom: 3px; }

      @media print {
        .rel-viewer { background: #ffffff; padding: 0; }
        /* altura fixa (não min-height) do tamanho real de uma folha impressa
           (297mm - as duas margens de 12mm do @page abaixo): sem isso, as
           páginas que distribuem conteúdo do topo ao rodapé com flexbox
           (a capa, o encerramento) encolhem pro tamanho do conteúdo na
           impressão, e o que devia ficar no rodapé sobe pra logo abaixo
           do texto. overflow visível continua deixando o conteúdo mais
           longo (tabelas grandes) transbordar normalmente pra próxima
           página. */
        .rel-page { box-shadow: none; margin: 0; width: auto; height: 273mm; overflow: visible; page-break-after: always; }
        .rel-page:last-child { page-break-after: auto; }
        @page { size: A4; margin: 12mm; }
      }
  `;
  document.head.appendChild(style);
}
