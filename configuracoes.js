/* ==========================================
   PÁGINA DE CONFIGURAÇÕES — página inteira (módulo "configuracoes")
   Antes as configurações viviam no menu lateral, estreito (320px), uma tela por vez. Agora são uma página
   própria, que ocupa a área principal como as ferramentas: botão na barra superior (data-modulo-key=
   "configuracoes", com posição escolhida em Aparência), navegação por seções à esquerda (no celular vira
   uma fileira de abas no topo) e cartões que se reorganizam sozinhos conforme a largura.

   Pra acrescentar uma configuração nova: ou entra num cartão de uma seção existente, ou vira uma seção nova
   em CONFIG_SECOES (id, título, ícone, descrição, html() e, se precisar buscar dados, depois()). O estilo
   fica em configuracoes.css (classes .cfg-*, com o Tema Céu junto). Nada aqui depende de mapa aberto.

   O que continua em supabase.js: o que o resto do software usa fora desta página (carregar tema/estilo dos
   planetas/ordem dos botões depois do login, salvarAparencia etc.). Aqui ficam as telas e os salvamentos
   que só existem pra elas.
   ========================================== */

const CONFIG_SECOES = [
  { id: 'aparencia', titulo: 'Aparência', icone: 'fa-palette',
    descricao: 'Como o software é exibido neste aparelho: tema, ícones dos planetas e a barra superior.',
    html: () => htmlCfgAparencia() },
  { id: 'relatorios', titulo: 'Relatórios', icone: 'fa-file-lines',
    descricao: 'Seus dados de contato e o logo que aparecem nos relatórios gerados.',
    html: () => htmlCfgRelatorios(), depois: () => carregarConfiguracoesRelatorio() },
  { id: 'servicos', titulo: 'Serviços', icone: 'fa-hand-holding-heart',
    descricao: 'Os serviços que você oferece, com área, valor e duração. Daqui saem os modelos de relatório, a agenda e o financeiro.',
    html: () => htmlCfgServicos(), depois: () => carregarServicos() },
  { id: 'captacao', titulo: 'Captação de Clientes', icone: 'fa-user-plus',
    descricao: 'O formulário externo de coleta de dados dos seus clientes.',
    html: () => htmlCfgCaptacao(), depois: () => carregarConfiguracoesCaptacao() },
  { id: 'agenda', titulo: 'Agenda', icone: 'fa-calendar-days',
    descricao: 'Os dias e horários que você atende e quais pastas de clientes entram no agendamento.',
    html: () => '<div id="cfgAgendaConteudo" class="cfg-grid"><div class="cfg-carregando">Carregando...</div></div>',
    depois: () => carregarConfiguracoesAgenda() },
  { id: 'seguranca', titulo: 'Segurança e Conta', icone: 'fa-shield-halved',
    descricao: 'Sua conta, a senha e a sessão neste aparelho.',
    html: () => htmlCfgSeguranca(), depois: () => carregarEmailContaConfiguracoes() }
];

/* Seção aberta. Só vale enquanto a página não é recarregada (é "onde eu estava", não preferência). */
window.configSecaoAtiva = window.configSecaoAtiva || 'aparencia';

/* Abre a página de Configurações (opcionalmente já numa seção). Usado também pelos avisos de outras telas
   ("configure em Configurações → Agenda"). */
function abrirConfiguracoes(secao) {
  if (secao && CONFIG_SECOES.some(s => s.id === secao)) window.configSecaoAtiva = secao;
  if (typeof abrirModuloTecnica === 'function') abrirModuloTecnica('configuracoes');
}
window.abrirConfiguracoes = abrirConfiguracoes;

/* PONTO DE ENTRADA DO MÓDULO — chamado por abrirModuloTecnica('configuracoes') (supabase.js) */
function iniciarModuloConfiguracoes() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  const navHtml = CONFIG_SECOES.map(s => `
    <button type="button" class="cfg-nav-item" data-secao="${s.id}" onclick="mostrarSecaoConfiguracoes('${s.id}')">
      <i class="fa-solid ${s.icone}"></i><span>${s.titulo}</span>
    </button>`).join('');

  container.innerHTML = `
    <div id="configuracoes-container">
      <div class="cfg-cabecalho">
        <h2>Configurações</h2>
      </div>
      <div class="cfg-layout">
        <nav id="cfgNav" class="cfg-nav" aria-label="Seções das configurações">${navHtml}</nav>
        <section id="cfgConteudo" class="cfg-conteudo"></section>
      </div>
    </div>
  `;
  mostrarSecaoConfiguracoes(window.configSecaoAtiva);
}

/* Mostra uma seção (só o conteúdo é refeito — a navegação fica como está) */
function mostrarSecaoConfiguracoes(id) {
  const secao = CONFIG_SECOES.find(s => s.id === id) || CONFIG_SECOES[0];
  window.configSecaoAtiva = secao.id;
  const conteudo = document.getElementById('cfgConteudo');
  if (!conteudo) return;

  document.querySelectorAll('#cfgNav .cfg-nav-item').forEach(b => b.classList.toggle('ativa', b.dataset.secao === secao.id));
  conteudo.innerHTML = `
    <h3 class="cfg-secao-titulo">${secao.titulo}</h3>
    <p class="cfg-secao-desc">${secao.descricao}</p>
    ${secao.html()}
  `;
  if (secao.depois) {
    try { Promise.resolve(secao.depois()).catch(e => console.error('Erro ao carregar a seção ' + secao.id + ':', e)); }
    catch (e) { console.error('Erro ao carregar a seção ' + secao.id + ':', e); }
  }
}

/* Redesenha a seção aberta mantendo a rolagem (chamado depois de salvar algo que muda o que a tela mostra:
   tema, ícones, ordem dos botões). Não faz nada se a página de Configurações não está na tela. */
function atualizarTelaConfiguracoes() {
  if (window.moduloTecnicoAtivo !== 'configuracoes' || !document.getElementById('cfgConteudo')) return;
  const y = window.scrollY;
  mostrarSecaoConfiguracoes(window.configSecaoAtiva);
  window.scrollTo(0, y);
}
window.atualizarTelaConfiguracoes = atualizarTelaConfiguracoes;

/* ==========================================
   SEÇÃO: APARÊNCIA
   Tema (Céu/Claro/Escuro/Automático) e ordem dos botões: ver salvarAparencia, moverBotaoTopo etc. em supabase.js.
   ========================================== */
function htmlCfgAparencia() {
  const estiloAtual = window.estiloPlanetas || 'simples';
  const estiloMandalaEscolhido = (typeof estiloMandalaAtual === 'function') ? estiloMandalaAtual(window.temaMandala === 'ceu') : 'frances'; // sem escolha salva: o padrão de sempre do tema
  let modo = 'auto';
  try { modo = localStorage.getItem('astro_modo_cor') || 'auto'; } catch (e) {}
  // Uma escolha só: o Céu vence os outros; Claro/Escuro/Automático só valem fora dele.
  const escolha = window.temaMandala === 'ceu' ? 'ceu' : modo;

  const opcao = (acao, ativa, iconeHtml, titulo, desc) => `
    <button type="button" class="cfg-opcao${ativa ? ' ativa' : ''}" onclick="${acao}">
      <span class="cfg-opcao-corpo">
        ${iconeHtml}
        <span><span class="cfg-opcao-nome">${titulo}</span><span class="cfg-opcao-desc">${desc}</span></span>
      </span>
      ${ativa ? '<i class="fa-solid fa-circle-check cfg-opcao-check"></i>' : ''}
    </button>`;
  const fa = (classe) => `<i class="fa-solid ${classe} cfg-opcao-icone"></i>`;

  const ordem = completarOrdemBotoesTopo(window.ordemBotoesTopo);
  const itensOrdem = ordem.map((chave, idx) => `
    <div class="cfg-ordem-item">
      <span class="cfg-ordem-nome"><span class="cfg-ordem-pos">${idx + 1}</span>${escapeHtml(ROTULOS_BOTOES_TOPO[chave] || chave)}</span>
      <span class="cfg-ordem-setas">
        <button type="button" class="cfg-seta" onclick="moverBotaoTopo('${chave}', -1)" ${idx === 0 ? 'disabled' : ''} title="Mover para o começo da barra"><i class="fa-solid fa-chevron-left"></i></button>
        <button type="button" class="cfg-seta" onclick="moverBotaoTopo('${chave}', 1)" ${idx === ordem.length - 1 ? 'disabled' : ''} title="Mover para o fim da barra"><i class="fa-solid fa-chevron-right"></i></button>
      </span>
    </div>`).join('');

  return `
    <div class="cfg-grid">
      <div class="cfg-card cfg-card-largo">
        <h4 class="cfg-card-titulo">Tema</h4>
        <p class="cfg-card-desc">Uma escolha só: ao escolher uma opção, as outras ficam desmarcadas. O <strong>Automático</strong> acompanha o aparelho (claro quando o aparelho está claro, escuro quando está escuro) e nunca escolhe o Céu. Fica salvo neste aparelho — cada aparelho ou navegador tem o seu.</p>
        <div class="cfg-opcoes">
          ${opcao("salvarAparencia('ceu')", escolha === 'ceu', fa('fa-star'), 'Céu', 'Papiro e tinta sobre o céu')}
          ${opcao("salvarAparencia('claro')", escolha === 'claro', fa('fa-sun'), 'Claro', 'Sempre com fundo claro, não importa o aparelho')}
          ${opcao("salvarAparencia('escuro')", escolha === 'escuro', fa('fa-moon'), 'Escuro', 'Sempre com fundo escuro, não importa o aparelho')}
          ${opcao("salvarAparencia('auto')", escolha === 'auto', fa('fa-circle-half-stroke'), 'Automático', 'Acompanha o tema claro/escuro configurado neste aparelho')}
        </div>
      </div>

      <div class="cfg-card cfg-card-largo">
        <h4 class="cfg-card-titulo">Ícones dos planetas</h4>
        <p class="cfg-card-desc">Como os 7 planetas clássicos aparecem em toda a ferramenta (mandala, horas planetárias, tabela técnica, decênios, profecção e direções). <strong>Vale só para os temas Claro, Escuro e Automático.</strong> No tema Céu essa escolha não se aplica: o Céu tem os seus próprios ícones, que só existem nele. Sua escolha fica guardada e volta quando você sair do Céu.</p>
        <div class="cfg-opcoes">
          ${opcao("salvarEstiloPlanetas('simples')", estiloAtual === 'simples', '<span class="cfg-opcao-icone cfg-opcao-glifo">☉</span>', 'Planetas ícones simples', 'Glifos planetários, iguais aos usados nos termos egípcios')}
          ${opcao("salvarEstiloPlanetas('esferico')", estiloAtual === 'esferico', fa('fa-circle-dot'), 'Planetas ícones esféricos', 'Ilustrações 3D com gradiente para cada planeta')}
        </div>
      </div>

      <div class="cfg-card cfg-card-largo">
        <h4 class="cfg-card-titulo">Estilo da mandala</h4>
        <p class="cfg-card-desc">Só o <strong>formato</strong> do desenho — onde cada coisa fica. As cores e os ícones não mudam: seguem o tema (Céu, Claro, Escuro, papiro).</p>
        <div class="cfg-opcoes">
          ${opcao("salvarEstiloMandala('astrohellenic_reto')", estiloMandalaEscolhido === 'astrohellenic_reto', fa('fa-bullseye'), 'Estilo Astro Hellenic', 'Faixa do zodíaco com os planetas dentro, linhas retas')}
          ${opcao("salvarEstiloMandala('comum')", estiloMandalaEscolhido === 'comum', fa('fa-bullseye'), 'Estilo comum', 'Signos e casas por dentro, planetas na eclíptica, régua de graus com termos e dodecatemória por fora')}
          ${opcao("salvarEstiloMandala('astrohellenic')", estiloMandalaEscolhido === 'astrohellenic', fa('fa-bullseye'), 'Estilo Astro Hellenic Tracejado', 'O mesmo desenho, com divisas e eixos tracejados')}
          ${opcao("salvarEstiloMandala('frances')", estiloMandalaEscolhido === 'frances', fa('fa-chart-pie'), 'Estilo francês', 'O desenho clássico: signos num anel por dentro, planetas por fora')}
        </div>
      </div>

      <div class="cfg-card cfg-card-largo">
        <h4 class="cfg-card-titulo">Barra superior</h4>
        <p class="cfg-card-desc">A ordem dos botões de ferramenta, na mesma ordem em que aparecem na barra (da esquerda para a direita). Use as setas para mover cada um — o botão de <strong>Configurações</strong> também: coloque onde for mais fácil de achar. No celular a barra rola de lado.</p>
        <div class="cfg-ordem">${itensOrdem}</div>
        <div class="cfg-acoes">
          <button type="button" class="cfg-btn" onclick="salvarOrdemBotoesTopo(ORDEM_BOTOES_TOPO_PADRAO)">Restaurar ordem padrão</button>
        </div>
      </div>
    </div>`;
}

/* ==========================================
   SEÇÃO: RELATÓRIOS (perfil do astrólogo nos relatórios)
   Os modelos de relatório ficam na própria tela do Relatório.
   ========================================== */
function htmlCfgRelatorios() {
  return `
    <div class="cfg-grid">
      <div class="cfg-card cfg-card-largo">
        <h4 class="cfg-card-titulo">Seu perfil nos relatórios</h4>
        <p class="cfg-card-desc">Logo e dados de contato que aparecem nos relatórios gerados — podem ser diferentes do logo usado na Captação de Clientes.</p>
        <div class="cfg-duas-colunas">
          <div>
            <div id="relCfgLogoPreviewContainer" class="cfg-logo-preview" style="display: none;">
              <img id="relCfgLogoPreview" src="" alt="Prévia do logo">
            </div>
            <input type="file" id="relCfgLogoFile" accept="image/*" onchange="fazerUploadLogoRelatorio(this)" style="display: none;">
            <button type="button" class="cfg-btn cfg-btn-tracejado cfg-btn-bloco" onclick="document.getElementById('relCfgLogoFile').click()">
              <i class="fa-solid fa-upload"></i> <span id="relCfgBtnUploadText">Selecionar Logo do Relatório</span>
            </button>
            <input type="hidden" id="relCfgLogoUrl">
          </div>
          <div class="cfg-campos">
            <div class="cfg-campo-largo">
              <label class="cfg-rotulo" for="relCfgNome">Seu nome / marca</label>
              <input type="text" id="relCfgNome" class="modal-input" placeholder="Ex: Cassio Farias - Astrólogo">
            </div>
            <div>
              <label class="cfg-rotulo" for="relCfgTelefone">Telefone / WhatsApp</label>
              <input type="text" id="relCfgTelefone" class="modal-input" placeholder="Ex: 11970404508">
            </div>
            <div>
              <label class="cfg-rotulo" for="relCfgEmail">E-mail</label>
              <input type="email" id="relCfgEmail" class="modal-input" placeholder="Ex: contato@email.com">
            </div>
          </div>
        </div>
        <div class="cfg-acoes">
          <button type="button" class="cfg-btn cfg-btn-primario" onclick="salvarPerfilRelatorio()">Salvar perfil</button>
        </div>
      </div>

      <div class="cfg-card cfg-card-largo">
        <p class="cfg-card-desc" style="margin: 0;">Os modelos de relatório (quais textos e ferramentas entram, e a edição de cada um) ficam na própria tela do <strong>Relatório</strong>, junto de onde você escolhe qual usar — assim tem mais espaço de tela pra editar os textos.</p>
      </div>
    </div>`;
}

/* ==========================================
   SEÇÃO: CAPTAÇÃO DE CLIENTES (formulário externo + serviços oferecidos)
   ========================================== */
function htmlCfgCaptacao() {
  return `
    <div class="cfg-grid">
      <div class="cfg-card">
        <h4 class="cfg-card-titulo">Formulário externo</h4>
        <p class="cfg-card-desc">Configure o formulário externo de coleta de dados dos seus clientes.</p>

        <label class="cfg-rotulo">Logotipo do formulário</label>
        <div id="logoPreviewContainer" class="cfg-logo-preview" style="display: none;">
          <img id="cfgLogoPreview" src="" alt="Prévia do logo">
        </div>
        <input type="file" id="cfgLogoFile" accept="image/*" onchange="fazerUploadLogo(this)" style="display: none;">
        <button type="button" class="cfg-btn cfg-btn-tracejado cfg-btn-bloco" onclick="document.getElementById('cfgLogoFile').click()">
          <i class="fa-solid fa-upload"></i> <span id="btnUploadText">Selecionar Imagem do Logo</span>
        </button>
        <input type="hidden" id="cfgLogoUrl">

        <div class="cfg-campos cfg-campos-topo">
          <div class="cfg-campo-largo">
            <label class="cfg-rotulo" for="cfgPublicFormUrl">Seu link exclusivo do formulário</label>
            <div class="cfg-linha-campo">
              <input type="text" id="cfgPublicFormUrl" class="modal-input" readonly>
              <button type="button" class="cfg-btn" onclick="copiarLinkFormulario()">Copiar</button>
            </div>
          </div>
          <div class="cfg-campo-largo">
            <label class="cfg-rotulo" for="cfgPublicFormSinastriaUrl">Link do formulário da Sinastria (capta os dois mapas)</label>
            <div class="cfg-linha-campo">
              <input type="text" id="cfgPublicFormSinastriaUrl" class="modal-input" readonly>
              <button type="button" class="cfg-btn" onclick="copiarLinkFormulario('cfgPublicFormSinastriaUrl')">Copiar</button>
            </div>
          </div>
          <div class="cfg-campo-largo">
            <label class="cfg-rotulo" for="cfgWebhookUrl">URL do webhook (integração)</label>
            <input type="url" id="cfgWebhookUrl" class="modal-input" placeholder="https://hook.make.com/...">
          </div>
          <div class="cfg-campo-largo">
            <label class="cfg-rotulo" for="cfgRedirectUrl">Link de redirecionamento</label>
            <input type="url" id="cfgRedirectUrl" class="modal-input" placeholder="https://wa.me/55...">
          </div>
        </div>

        <label class="cfg-checkbox">
          <input type="checkbox" id="cfgFormTemaCeu"> Aplicar o Tema Céu no formulário
        </label>
        <p class="cfg-card-desc">Ao aplicar o Tema Céu, o formulário que o cliente vê fica com papiro e céu estrelado ao fundo. Desmarcado, ele continua claro, como hoje.</p>

        <div class="cfg-acoes">
          <button type="button" class="cfg-btn" onclick="testarPaginaAgendar()">Testar a página de agendar (sem gravar nada)</button>
          <button type="button" class="cfg-btn cfg-btn-primario" onclick="salvarConfiguracoesCaptacao()">Salvar configurações</button>
        </div>
      </div>

    </div>`;
}

/* ==========================================
   SEÇÃO: SERVIÇOS (cartão com a lista; as funções ficam mais abaixo, em "CADASTRO DE SERVIÇOS")
   ========================================== */
function htmlCfgServicos() {
  return `
    <div class="cfg-grid">
      <div class="cfg-card cfg-card-largo">
        <div class="cfg-card-cabecalho">
          <h4 class="cfg-card-titulo">Serviços oferecidos</h4>
          <button type="button" class="cfg-btn cfg-btn-pequeno" onclick="abrirFormServico()">+ Serviço</button>
        </div>
        <p class="cfg-card-desc">Cadastre cada serviço com nome, área, valor e duração. Cada serviço vira também um modelo de relatório (Relatório → Modelos, onde você edita o conteúdo), aparece na Agenda (a duração define o tamanho do horário) e no Financeiro (área e valor já vêm preenchidos).</p>
        <div id="servicosListContainer" class="cfg-lista">
          <div class="cfg-carregando">Carregando serviços...</div>
        </div>
      </div>
    </div>`;
}

/* ==========================================
   SEÇÃO: AGENDA (disponibilidade + pastas visíveis)
   Fica aqui, separado da ferramenta Agenda em si (agendamento.js), que mostra só o formulário de novo
   agendamento e a lista dos já marcados — essas duas coisas são "configura uma vez e não mexe mais".
   AGENDA_DIAS_SEMANA vem de agendamento.js, já carregado na mesma página.
   ========================================== */

/* CARREGA DISPONIBILIDADE + PASTAS VISÍVEIS E RENDERIZA OS DOIS CARTÕES */
async function carregarConfiguracoesAgenda() {
  const container = document.getElementById('cfgAgendaConteudo');
  if (!container) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { container.innerHTML = `<div class="cfg-card cfg-card-largo">Sessão não identificada.</div>`; return; }

    const [dispRes, configRes] = await Promise.all([
      supabaseClient.from('agenda_disponibilidade').select('*').eq('user_id', user.id).order('dia_semana', { ascending: true }),
      supabaseClient.from('configuracoes').select('agenda_duracao_padrao_minutos, agenda_intervalo_minutos, agenda_pastas_visiveis').eq('user_id', user.id).maybeSingle()
    ]);

    if (dispRes.error) {
      container.innerHTML = `
        <div class="cfg-card cfg-card-largo">
          As tabelas de agenda ainda não existem no Supabase deste projeto. Rode o SQL de configuração (ver agendamento.js) e recarregue a página.
        </div>`;
      return;
    }

    const disponibilidade = dispRes.data || [];
    const duracaoPadrao = (!configRes.error && configRes.data && configRes.data.agenda_duracao_padrao_minutos) || 60;
    const intervaloPadrao = (!configRes.error && configRes.data && configRes.data.agenda_intervalo_minutos) || 0;
    const pastasVisiveis = (!configRes.error && configRes.data && Array.isArray(configRes.data.agenda_pastas_visiveis))
      ? configRes.data.agenda_pastas_visiveis
      : null;

    const blocoDias = AGENDA_DIAS_SEMANA.map((nomeDia, idx) => {
      const regra = disponibilidade.find(r => r.dia_semana === idx);
      return `
        <div class="cfg-dia">
          <input type="checkbox" id="agDia${idx}" ${regra ? 'checked' : ''} onchange="document.getElementById('agHoraBloco${idx}').style.display = this.checked ? 'flex' : 'none';">
          <label for="agDia${idx}" class="cfg-dia-nome">${nomeDia}</label>
          <div id="agHoraBloco${idx}" class="cfg-dia-horas" style="display: ${regra ? 'flex' : 'none'};">
            <input type="time" id="agInicio${idx}" class="modal-input" value="${regra ? regra.hora_inicio.slice(0, 5) : '09:00'}">
            <span>até</span>
            <input type="time" id="agFim${idx}" class="modal-input" value="${regra ? regra.hora_fim.slice(0, 5) : '18:00'}">
          </div>
        </div>`;
    }).join('');

    const pastasParaExibir = (typeof customFolders !== 'undefined' && Array.isArray(customFolders)) ? customFolders : [];
    const blocoPastas = pastasParaExibir.length
      ? pastasParaExibir.map(pasta => {
          const marcada = !pastasVisiveis || pastasVisiveis.includes(pasta);
          return `
            <label class="cfg-checkbox cfg-pasta">
              <input type="checkbox" class="agPastaCheckbox" value="${escapeHtml(pasta)}" ${marcada ? 'checked' : ''}>
              ${escapeHtml(pasta)}
            </label>`;
        }).join('')
      : '<div class="cfg-card-desc">Nenhuma pasta encontrada.</div>';

    container.innerHTML = `
      <div class="cfg-card cfg-card-largo">
        <h4 class="cfg-card-titulo">Sua disponibilidade</h4>
        <p class="cfg-card-desc">Marque os dias que você atende e o horário de cada um. Usado para calcular os horários livres na ferramenta Agenda.</p>
        <div class="cfg-dias">${blocoDias}</div>
        <div class="cfg-campos cfg-campos-topo">
          <div>
            <label class="cfg-rotulo" for="agDuracaoPadrao">Duração de cada atendimento (min)</label>
            <input type="number" id="agDuracaoPadrao" class="modal-input" min="5" step="5" value="${duracaoPadrao}">
          </div>
          <div>
            <label class="cfg-rotulo" for="agIntervaloPadrao">Intervalo entre atendimentos (min)</label>
            <input type="number" id="agIntervaloPadrao" class="modal-input" min="0" step="5" value="${intervaloPadrao}">
          </div>
        </div>
        <div class="cfg-acoes">
          <button type="button" class="cfg-btn cfg-btn-primario" onclick="salvarDisponibilidadeAgenda()">Salvar disponibilidade</button>
        </div>
      </div>

      <div class="cfg-card">
        <h4 class="cfg-card-titulo">Pastas visíveis no agendamento</h4>
        <p class="cfg-card-desc">Marque só as pastas que têm clientes de verdade — desmarque as que usa para teste etc. Sem marcar nada, mostra clientes de todas as pastas.</p>
        <div class="cfg-pastas">${blocoPastas}</div>
        <div class="cfg-acoes">
          <button type="button" class="cfg-btn cfg-btn-primario" onclick="salvarPastasVisiveisAgenda()">Salvar pastas visíveis</button>
        </div>
      </div>`;
  } catch (e) {
    console.error('Erro ao carregar configurações de agenda:', e);
    container.innerHTML = `<div class="cfg-card cfg-card-largo">Erro de conexão ao carregar.</div>`;
  }
}

/* ==========================================
   SEÇÃO: SEGURANÇA E CONTA
   ========================================== */
function htmlCfgSeguranca() {
  let manterLogado = false;
  try { manterLogado = localStorage.getItem('astro_keep_logged') === 'true'; } catch (e) {}
  return `
    <div class="cfg-grid">
      <div class="cfg-card">
        <h4 class="cfg-card-titulo">Conta conectada</h4>
        <div id="cfgEmailConta" class="cfg-conta-email">Carregando...</div>
        <label class="cfg-linha" for="keepLoggedToggle">
          <span>Manter-se logado neste aparelho</span>
          <input type="checkbox" id="keepLoggedToggle" ${manterLogado ? 'checked' : ''} onchange="alternarManterLogado(this.checked)">
        </label>
      </div>

      <div class="cfg-card">
        <h4 class="cfg-card-titulo">Alterar senha</h4>
        <p class="cfg-card-desc">Use pelo menos 6 caracteres.</p>
        <input type="password" id="cfgNewPassword" class="modal-input" placeholder="Nova senha" autocomplete="new-password">
        <div class="cfg-acoes">
          <button type="button" class="cfg-btn cfg-btn-primario" onclick="trocarSenhaUsuario()">Atualizar senha</button>
        </div>
      </div>

      <div class="cfg-card">
        <h4 class="cfg-card-titulo">Sessão</h4>
        <p class="cfg-card-desc">Sai da conta neste aparelho e volta para a tela de login.</p>
        <button type="button" class="cfg-btn cfg-btn-perigo" onclick="fazerLogout()"><i class="fa-solid fa-right-from-bracket"></i> Sair da conta</button>
      </div>
    </div>`;
}

async function carregarEmailContaConfiguracoes() {
  const el = document.getElementById('cfgEmailConta');
  if (!el) return;
  let email = 'Sessão não identificada';
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    email = (user && user.email) ? user.email : 'Usuário desconectado';
  } catch (e) {}
  const alvo = document.getElementById('cfgEmailConta'); // a seção pode ter mudado enquanto buscava
  if (alvo) alvo.textContent = email;
}

/* ------------------------------------------
   RELATÓRIOS — carregar e salvar o perfil (logo no bucket "logos", arquivo separado do logo da Captação)
   ------------------------------------------ */

/* CARREGA O PERFIL NA TELA DE CONFIGURAÇÕES > RELATÓRIOS */
async function carregarConfiguracoesRelatorio() {
  try {
    const perfil = await carregarPerfilRelatorio();
    if (document.getElementById('relCfgNome')) document.getElementById('relCfgNome').value = perfil.nome;
    if (document.getElementById('relCfgTelefone')) document.getElementById('relCfgTelefone').value = perfil.telefone;
    if (document.getElementById('relCfgEmail')) document.getElementById('relCfgEmail').value = perfil.email;
    if (perfil.logo_url) {
      document.getElementById('relCfgLogoUrl').value = perfil.logo_url;
      const previewImg = document.getElementById('relCfgLogoPreview');
      const previewContainer = document.getElementById('relCfgLogoPreviewContainer');
      if (previewImg && previewContainer) {
        previewImg.src = perfil.logo_url;
        previewContainer.style.display = 'block';
      }
      const btnText = document.getElementById('relCfgBtnUploadText');
      if (btnText) btnText.innerText = 'Alterar Logo do Relatório';
    }
  } catch (e) {
    console.error("Erro ao carregar perfil de relatório:", e);
  }
}

/* PROCESSA O UPLOAD DO LOGO USADO NOS RELATÓRIOS (bucket 'logos', arquivo
   separado do logo da Captação de Clientes) */
async function fazerUploadLogoRelatorio(inputElement) {
  const file = inputElement.files[0];
  if (!file) return;

  const btnText = document.getElementById('relCfgBtnUploadText');
  if (btnText) btnText.innerText = "Enviando imagem...";

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      alert("Sessão não encontrada.");
      if (btnText) btnText.innerText = "Selecionar Logo do Relatório";
      return;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-logo-relatorio.${fileExt}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Erro ao enviar imagem: " + uploadError.message);
      if (btnText) btnText.innerText = "Selecionar Logo do Relatório";
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('logos')
      .getPublicUrl(filePath);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    document.getElementById('relCfgLogoUrl').value = publicUrl;

    const previewImg = document.getElementById('relCfgLogoPreview');
    const previewContainer = document.getElementById('relCfgLogoPreviewContainer');
    if (previewImg && previewContainer) {
      previewImg.src = publicUrl;
      previewContainer.style.display = 'block';
    }

    if (btnText) btnText.innerText = "Alterar Logo do Relatório";
  } catch (e) {
    alert("Erro ao processar arquivo de imagem.");
    if (btnText) btnText.innerText = "Selecionar Logo do Relatório";
  }
}

/* SALVA O PERFIL DE RELATÓRIO (nome/telefone/e-mail/logo) NO SUPABASE */
async function salvarPerfilRelatorio() {
  const nome = document.getElementById('relCfgNome').value.trim();
  const telefone = document.getElementById('relCfgTelefone').value.trim();
  const email = document.getElementById('relCfgEmail').value.trim();
  const logoUrl = document.getElementById('relCfgLogoUrl').value.trim();

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('relatorio_perfil')
      .upsert({ user_id: user.id, nome, telefone, email, logo_url: logoUrl, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (!error) {
      alert("Perfil de relatório salvo com sucesso!");
    } else {
      alert("Erro ao salvar perfil: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar perfil.");
  }
}

/* ------------------------------------------
   CAPTAÇÃO DE CLIENTES — carregar/salvar o formulário externo
   ------------------------------------------ */

/* CARREGA AS CONFIGURAÇÕES DE CAPTAÇÃO DO SUPABASE E EXIBE PREVIEW */
async function carregarConfiguracoesCaptacao() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      if (document.getElementById('cfgLogoUrl')) {
        const logoUrlAntiCache = data.logo_url ? `${data.logo_url.split('?')[0]}?t=${Date.now()}` : '';
document.getElementById('cfgLogoUrl').value = logoUrlAntiCache;
const publicLink = `https://astrohellenic.github.io/formulario.html?u=${user.id}`;
if (document.getElementById('cfgPublicFormUrl')) {
  document.getElementById('cfgPublicFormUrl').value = publicLink;
}
if (document.getElementById('cfgPublicFormSinastriaUrl')) {
  document.getElementById('cfgPublicFormSinastriaUrl').value = publicLink + '&servico=sinastria';
}        
        // Atualiza a prévia do logo e o texto do botão se houver URL salva
        if (data.logo_url) {
          const previewImg = document.getElementById('cfgLogoPreview');
          const previewContainer = document.getElementById('logoPreviewContainer');
          const btnText = document.getElementById('btnUploadText');
          if (previewImg && previewContainer) {
            previewImg.src = logoUrlAntiCache;
            previewContainer.style.display = 'block';
          }
          if (btnText) btnText.innerText = 'Alterar Imagem do Logo';
        }
      }
      if (document.getElementById('cfgWebhookUrl')) document.getElementById('cfgWebhookUrl').value = data.webhook_url || '';
      if (document.getElementById('cfgRedirectUrl')) document.getElementById('cfgRedirectUrl').value = data.redirect_url || '';
      if (document.getElementById('cfgFormTemaCeu')) document.getElementById('cfgFormTemaCeu').checked = data.formulario_tema === 'ceu';
    }
  } catch (e) {
    console.error("Erro ao carregar configurações de captação:", e);
  }
}

/* PROCESSA O UPLOAD DIRETO DA IMAGEM PARA O BUCKET 'LOGOS' */
async function fazerUploadLogo(inputElement) {
  const file = inputElement.files[0];
  if (!file) return;

  const btnText = document.getElementById('btnUploadText');
  if (btnText) btnText.innerText = "Enviando imagem...";

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      alert("Sessão não encontrada.");
      if (btnText) btnText.innerText = "Selecionar Imagem do Logo";
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-logo.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload do arquivo para o bucket 'logos' no Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Erro ao enviar imagem: " + uploadError.message);
      if (btnText) btnText.innerText = "Selecionar Imagem do Logo";
      return;
    }

    // Pega a URL pública gerada pelo Supabase
    const { data: publicUrlData } = supabaseClient.storage
      .from('logos')
      .getPublicUrl(filePath);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    // Atualiza o campo oculto e a interface com a prévia
    document.getElementById('cfgLogoUrl').value = publicUrl;
    
    const previewImg = document.getElementById('cfgLogoPreview');
    const previewContainer = document.getElementById('logoPreviewContainer');
    if (previewImg && previewContainer) {
      previewImg.src = publicUrl;
      previewContainer.style.display = 'block';
    }

    if (btnText) btnText.innerText = "Alterar Imagem do Logo";

  } catch (e) {
    alert("Erro ao processar arquivo de imagem.");
    if (btnText) btnText.innerText = "Selecionar Imagem do Logo";
  }
}

/* COPIA O LINK DO FORMULÁRIO PARA A ÁREA DE TRANSFERÊNCIA */
function copiarLinkFormulario(idCampo) {
  const input = document.getElementById(idCampo || 'cfgPublicFormUrl');
  if (!input || !input.value) return;
  
  navigator.clipboard.writeText(input.value).then(() => {
    alert('Link copiado com sucesso!');
  }).catch(() => {
    input.select();
    document.execCommand('copy');
    alert('Link copiado com sucesso!');
  });
}

/* ABRE A PÁGINA DE AGENDAR EM MODO TESTE (usa um dos seus mapas só pra identificar; nada é gravado) */
async function testarPaginaAgendar() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }
    const { data, error } = await supabaseClient.from('mapas').select('id').eq('user_id', user.id).limit(1);
    if (error || !data || !data.length) { alert("Cadastre ao menos um mapa para testar."); return; }
    window.open(`https://astrohellenic.com/agendar.html?u=${encodeURIComponent(user.id)}&c=${encodeURIComponent(data[0].id)}&teste=1`, '_blank');
  } catch (e) {
    alert("Erro ao abrir o teste.");
  }
}

/* SALVA AS CONFIGURAÇÕES DE CAPTAÇÃO NO SUPABASE */
async function salvarConfiguracoesCaptacao() {
  const logoUrl = document.getElementById('cfgLogoUrl').value.trim();
  const webhookUrl = document.getElementById('cfgWebhookUrl').value.trim();
  const redirectUrl = document.getElementById('cfgRedirectUrl').value.trim();
  const formularioTema = document.getElementById('cfgFormTemaCeu') && document.getElementById('cfgFormTemaCeu').checked ? 'ceu' : 'claro';

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({
        user_id: user.id,
        logo_url: logoUrl,
        webhook_url: webhookUrl,
        redirect_url: redirectUrl,
        formulario_tema: formularioTema
      }, { onConflict: 'user_id' });

    if (!error) {
      alert("Configurações salvas com sucesso!");
    } else {
      alert("Erro ao salvar configurações: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar configurações.");
  }
}

/* ------------------------------------------
   SERVIÇOS — cadastro (seção "Serviços")
   ------------------------------------------ */

/* ==========================================
   CADASTRO DE SERVIÇOS
   Reaproveita a MESMA tabela que o módulo de Relatório usa pra "Modelo de
   Relatório" (relatorio_presets) — um serviço cadastrado aqui é, no banco, o
   mesmo registro que aparece como modelo em Relatório > Modelos. A tela do
   Relatório (relatorio.js) não é tocada por nada disso: aqui só criamos/
   editamos/apagamos nome, área, valor e duração; o conteúdo (blocos) continua
   sendo editado só lá.

   Colunas de relatorio_presets que esta tela usa além das de sempre:
     valor numeric(12,2), duracao_minutos integer, area_id uuid -> areas(id)
   Quem consome: Financeiro (área e valor ao escolher o serviço numa entrada)
   e Agenda (duração do horário). */

let cachedServicos = [];

/* CARREGA OS SERVIÇOS (=PRESETS DE RELATÓRIO) DO ASTRÓLOGO LOGADO E RENDERIZA A LISTA */
async function carregarServicos() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    let res = await supabaseClient
      .from('relatorio_presets')
      .select('id, nome, valor, duracao_minutos, area_id, tem_modelo')
      .eq('user_id', user.id)
      .order('nome', { ascending: true });
    // coluna tem_modelo ainda não criada: tenta sem ela
    if (res.error) {
      res = await supabaseClient.from('relatorio_presets').select('id, nome, valor, duracao_minutos, area_id').eq('user_id', user.id).order('nome', { ascending: true });
    }
    // colunas novas ainda não criadas no Supabase: cai pra lista só com nome (não quebra a tela)
    if (res.error) {
      res = await supabaseClient.from('relatorio_presets').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true });
    }
    cachedServicos = (!res.error && Array.isArray(res.data)) ? res.data : [];
  } catch (e) {
    console.error("Erro ao carregar serviços:", e);
    cachedServicos = [];
  }

  // nomes das áreas (cadastradas no Financeiro) pra mostrar na lista
  cachedAreasServicos = [];
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
      const ar = await supabaseClient.from('areas').select('id, nome').eq('user_id', user.id).order('ordem', { ascending: true }).order('nome', { ascending: true });
      if (!ar.error && Array.isArray(ar.data)) cachedAreasServicos = ar.data;
    }
  } catch (e) { /* sem áreas: a lista só não mostra o nome delas */ }

  renderServicosList();
}
let cachedAreasServicos = [];

/* RENDERIZA A LISTA DE SERVIÇOS CADASTRADOS */
function renderServicosList() {
  const container = document.getElementById('servicosListContainer');
  if (!container) return;

  if (!cachedServicos || cachedServicos.length === 0) {
    container.innerHTML = `<div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">Nenhum serviço cadastrado ainda.</div>`;
    return;
  }

  const nomeArea = id => { const a = cachedAreasServicos.find(x => x.id === id); return a ? a.nome : ''; };
  container.innerHTML = cachedServicos.map(servico => {
    const detalhe = [
      nomeArea(servico.area_id),
      (servico.valor !== null && servico.valor !== undefined) ? Number(servico.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
      servico.duracao_minutos ? servico.duracao_minutos + ' min' : ''
    ].filter(Boolean).join(' · ');
    return `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card);">
      <div style="min-width: 0;">
        <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(servico.nome)}</div>
        ${detalhe ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${escapeHtml(detalhe)}</div>` : ''}
        ${servico.tem_modelo === false ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Sem modelo de relatório · <a href="#" onclick="criarModeloDoServico('${servico.id}'); return false;" style="color: var(--primary-blue); font-weight: 700;">Criar modelo</a></div>` : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 12px; margin-left: 8px;">
        <i class="fa-solid fa-pen" onclick="abrirFormServico('${servico.id}')" title="Editar serviço" style="color: var(--primary-blue); cursor: pointer;"></i>
        <i class="fa-solid fa-trash" onclick="apagarServico('${servico.id}', '${escapeHtml(servico.nome).replace(/'/g, "\\'")}')" title="Apagar serviço" style="color: var(--danger); cursor: pointer;"></i>
      </div>
    </div>`;
  }).join('');
}

/* JANELA DE NOVO SERVIÇO / EDIÇÃO (nome, área, valor, duração) */
function abrirFormServico(id) {
  const sv = id ? cachedServicos.find(x => x.id === id) : null;
  if (id && !sv) return;
  const fechar = () => { const o = document.getElementById('servicoFormOverlay'); if (o) o.remove(); };
  fechar();

  const opcoesArea = '<option value="">Sem área</option>' +
    cachedAreasServicos.map(a => `<option value="${a.id}" ${sv && sv.area_id === a.id ? 'selected' : ''}>${escapeHtml(a.nome)}</option>`).join('');
  const lbl = 'font-size: 11px; font-weight: 600; margin-top: 10px; display: block;';
  const overlay = document.createElement('div');
  overlay.id = 'servicoFormOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999999; padding: 16px; box-sizing: border-box;';
  overlay.innerHTML = `
    <div class="modal-box" style="width: 400px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">
      <div style="font-size: 14px; font-weight: 800;">${sv ? 'Editar serviço' : 'Novo serviço'}</div>
      <label style="${lbl}">Nome</label>
      <input type="text" id="svNome" class="modal-input" placeholder="Ex.: Mapa Natal Clássico" value="${sv ? escapeHtml(sv.nome) : ''}" autocomplete="off">
      <label style="${lbl}">Área</label>
      <select id="svArea" class="modal-select">${opcoesArea}</select>
      <label style="${lbl}">Valor (R$)</label>
      <input type="text" id="svValor" class="modal-input" inputmode="decimal" placeholder="275,00" value="${sv && sv.valor !== null && sv.valor !== undefined ? String(sv.valor).replace('.', ',') : ''}" autocomplete="off">
      <label style="${lbl}">Duração (minutos)</label>
      <input type="text" id="svDuracao" class="modal-input" inputmode="numeric" placeholder="60" value="${sv && sv.duracao_minutos ? sv.duracao_minutos : ''}" autocomplete="off">
      ${sv ? '' : `<label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 12px; font-weight: 600; cursor: pointer;"><input type="checkbox" id="svComModelo" checked style="width: 18px; height: 18px;"> Este serviço tem relatório (cria o modelo de relatório)</label>`}
      <div class="modal-actions" style="margin-top: 16px;">
        <button type="button" class="btn-secondary" id="svCancelar">Cancelar</button>
        <button type="button" class="btn-primary" id="svSalvar">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#svCancelar').onclick = fechar;
  overlay.querySelector('#svSalvar').onclick = async () => { if (await salvarServico(id || null)) fechar(); };
  if (!sv) setTimeout(() => { try { overlay.querySelector('#svNome').focus(); } catch (x) {} }, 30);
}

/* SALVA (CRIA OU ATUALIZA) UM SERVIÇO. Um serviço novo nasce com os blocos padrão (mesma semente de um modelo
   novo em Relatório > Modelos), pra já ser utilizável como modelo. */
async function salvarServico(id) {
  const nome = document.getElementById('svNome').value.trim();
  if (!nome) { alert("Informe o nome do serviço."); return false; }

  const txtValor = document.getElementById('svValor').value.replace(/[R$\s]/g, '');
  let valor = null;
  if (txtValor) {
    const t = txtValor.includes(',') ? txtValor.replace(/\./g, '').replace(',', '.') : txtValor;
    valor = parseFloat(t);
    if (!isFinite(valor) || valor < 0) { alert("Valor inválido (ex.: 275,00)."); return false; }
    valor = Math.round(valor * 100) / 100;
  }
  const txtDur = document.getElementById('svDuracao').value.trim();
  let duracao = null;
  if (txtDur) {
    duracao = parseInt(txtDur, 10);
    if (!(duracao > 0)) { alert("Duração inválida (em minutos, ex.: 60)."); return false; }
  }
  const campos = { nome, valor, duracao_minutos: duracao, area_id: document.getElementById('svArea').value || null };

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return false; }

    let error;
    if (id) {
      ({ error } = await supabaseClient.from('relatorio_presets').update({ ...campos, updated_at: new Date().toISOString() }).eq('id', id));
    } else {
      const comModelo = !document.getElementById('svComModelo') || document.getElementById('svComModelo').checked;
      const blocosPadrao = (typeof RELATORIO_BLOCOS_PADRAO !== 'undefined') ? RELATORIO_BLOCOS_PADRAO : [];
      ({ error } = await supabaseClient.from('relatorio_presets').insert(comModelo
        ? { user_id: user.id, blocos: blocosPadrao, ...campos }
        : { user_id: user.id, blocos: [], tem_modelo: false, ...campos }));
    }
    if (error) { alert("Erro ao salvar o serviço: " + error.message); return false; }
    await carregarServicos();
    return true;
  } catch (e) {
    alert("Erro de conexão ao salvar o serviço.");
    return false;
  }
}

/* DEVOLVE O MODELO DE RELATÓRIO A UM SERVIÇO QUE ESTAVA SEM (conteúdo padrão, editável em Relatório → Modelos) */
async function criarModeloDoServico(id) {
  try {
    const blocosPadrao = (typeof RELATORIO_BLOCOS_PADRAO !== 'undefined') ? RELATORIO_BLOCOS_PADRAO : [];
    const { error } = await supabaseClient.from('relatorio_presets').update({ tem_modelo: true, blocos: blocosPadrao, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert("Erro ao criar o modelo: " + error.message); return; }
    await carregarServicos();
  } catch (e) {
    alert("Erro de conexão ao criar o modelo.");
  }
}

/* APAGA UM SERVIÇO (COM CONFIRMAÇÃO) — remove a linha de relatorio_presets,
   então some também da lista de modelos em Relatório */
async function apagarServico(id, nome) {
  if (!await astroConfirm(`Tem certeza que deseja apagar o serviço "${nome}"?\n\nIsso também vai apagar o modelo de relatório vinculado a ele (o mesmo usado em Relatório → Modelos). Essa ação não pode ser desfeita.`)) return;

  try {
    const { error } = await supabaseClient.from('relatorio_presets').delete().eq('id', id);
    if (!error) {
      await carregarServicos();
    } else {
      alert("Erro ao apagar serviço: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao apagar serviço.");
  }
}

/* ------------------------------------------
   AGENDA — salvar disponibilidade e pastas visíveis
   ------------------------------------------ */

/* SALVA A DISPONIBILIDADE (substitui todas as regras do usuário pelas
   marcadas agora) + a duração/intervalo padrão (na tabela configuracoes) */
async function salvarDisponibilidadeAgenda() {
  const novasRegras = [];
  for (let dia = 0; dia <= 6; dia++) {
    const checkbox = document.getElementById(`agDia${dia}`);
    if (!checkbox || !checkbox.checked) continue;
    const inicio = document.getElementById(`agInicio${dia}`).value;
    const fim = document.getElementById(`agFim${dia}`).value;
    if (!inicio || !fim) continue;
    if (inicio >= fim) { alert(`No dia ${AGENDA_DIAS_SEMANA[dia]}, o horário final precisa ser depois do inicial.`); return; }
    novasRegras.push({ dia_semana: dia, hora_inicio: inicio, hora_fim: fim });
  }

  const duracaoPadrao = parseInt(document.getElementById('agDuracaoPadrao').value, 10) || 60;
  const intervaloPadrao = parseInt(document.getElementById('agIntervaloPadrao').value, 10) || 0;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error: erroDelete } = await supabaseClient.from('agenda_disponibilidade').delete().eq('user_id', user.id);
    if (erroDelete) { alert("Erro ao salvar disponibilidade: " + erroDelete.message); return; }

    if (novasRegras.length) {
      const { error: erroInsert } = await supabaseClient
        .from('agenda_disponibilidade')
        .insert(novasRegras.map(r => ({ ...r, user_id: user.id })));
      if (erroInsert) { alert("Erro ao salvar disponibilidade: " + erroInsert.message); return; }
    }

    const { error: erroConfig } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, agenda_duracao_padrao_minutos: duracaoPadrao, agenda_intervalo_minutos: intervaloPadrao }, { onConflict: 'user_id' });
    if (erroConfig) { alert("Erro ao salvar duração/intervalo: " + erroConfig.message); return; }

    alert("Disponibilidade salva com sucesso!");
    await carregarConfiguracoesAgenda();
  } catch (e) {
    alert("Erro de conexão ao salvar disponibilidade.");
  }
}

/* SALVA QUAIS PASTAS ENTRAM NO SELETOR DE CLIENTE DO NOVO AGENDAMENTO.
   Antes de salvar pela primeira vez (coluna ainda null), mostra clientes
   de TODAS as pastas — ver o "null = todas" em iniciarModuloAgenda. Depois
   de salvar, vale exatamente o que ficou marcado (inclusive nenhuma, se
   for esse o caso). */
async function salvarPastasVisiveisAgenda() {
  const marcadas = Array.from(document.querySelectorAll('.agPastaCheckbox:checked')).map(c => c.value);

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, agenda_pastas_visiveis: marcadas }, { onConflict: 'user_id' });

    if (error) { alert("Erro ao salvar pastas visíveis: " + error.message); return; }

    alert("Pastas visíveis salvas com sucesso!");
    await carregarConfiguracoesAgenda();
  } catch (e) {
    alert("Erro de conexão ao salvar pastas visíveis.");
  }
}

/* ------------------------------------------
   SEGURANÇA E CONTA — manter logado, senha e sair
   ------------------------------------------ */

function alternarManterLogado(status) {
  localStorage.setItem('astro_keep_logged', status);
}

async function trocarSenhaUsuario() {
  const newPass = document.getElementById('cfgNewPassword').value.trim();
  if (!newPass || newPass.length < 6) {
    alert("A nova senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.updateUser({ password: newPass });
    if (!error) {
      alert("Senha alterada com sucesso!");
      document.getElementById('cfgNewPassword').value = '';
    } else {
      alert("Erro ao alterar senha: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao alterar senha.");
  }
}

async function fazerLogout() {
  try { localStorage.removeItem('astro_ultimo_perfil'); } catch (e) {}
  try { localStorage.removeItem('astro_ultimo_modulo'); } catch (e) {}
  try {
    await supabaseClient.auth.signOut();
    location.reload();
  } catch (e) {
    location.reload();
  }
}
