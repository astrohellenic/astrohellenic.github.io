/* ==========================================
   MÓDULO DE BANCO DE DADOS E NAVEGAÇÃO (SUPABASE)
   ========================================== */

const SUPABASE_URL = "https://ndgjenvddkmztmdixjhc.supabase.co";
const SUPABASE_KEY = "sb_publishable_VTjldgs8Hv1RODaMg7T57Q_ISzbnm5C";
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
var supabaseClient = window.supabaseClient;

let activeFolder = "Clientes";
let customFolders = ["Clientes"];
let cachedFolderData = [];
let selectedMapIds = new Set();
let isSelectionMode = false;
// Valor-padrão até carregarOrdenacaoClientes (chamada após o login, junto
// de carregarTemaMandala/carregarEstiloPlanetas) trazer o que está salvo
// na CONTA do astrólogo — usa a tabela configuracoes, não localStorage,
// porque precisa valer em qualquer navegador/aparelho que ele usar, não
// só no que fez a mudança.
let currentSortField = 'codigo';
let currentSortDirection = 'asc';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* BUSCA AUTOMÁTICA DE FUSO POR LONGITUDE */
function calcularFusoPorLongitude(lon) {
  if (lon === undefined || lon === null || isNaN(lon)) return -3;
  return Math.round(lon / 15);
}

/* 1. CARREGA AS PASTAS EM ORDEM ALFABÉTICA DO SUPABASE */
async function carregarPastasSalvas() {
  try {
    const { data, error } = await supabaseClient
      .from('pastas')
      .select('nome')
      .order('nome', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      customFolders = data.map(p => p.nome);
    } else if (data && data.length === 0) {
      let userId = null;
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;

      await supabaseClient.from('pastas').insert([{ nome: 'Clientes', user_id: userId }]);
      customFolders = ['Clientes'];
    }
  } catch (e) {
    console.error("Erro ao carregar pastas:", e);
  }
  renderMenuPrincipal();

  /* PREENCHE O SELECT DE PASTAS DO NOVO MAPA AUTOMATICAMENTE */
  const selectPastaModal = document.getElementById('modalPasta');
  if (selectPastaModal && Array.isArray(customFolders)) {
    const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    selectPastaModal.innerHTML = pastasOrdenadas.map(p => 
      `<option value="${escapeHtml(p)}" ${p === activeFolder ? 'selected' : ''}>${escapeHtml(p)}</option>`
    ).join('');
  }
}

/* NÍVEL 1: MENU PRINCIPAL LIMPO (clientes e pastas — as configurações ficam na página própria, botão da barra superior) */
function renderMenuPrincipal() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  let htmlPastas = '';
  pastasOrdenadas.forEach(pasta => {
    htmlPastas += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-sidebar);">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; cursor: pointer;" onclick="abrirConteudoPasta('${pasta}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M4,7 A2,2 0 0 1 6,5 H10 L12,7.5 H19 A2,2 0 0 1 21,9.5 V17 A2,2 0 0 1 19,19 H6 A2,2 0 0 1 4,17 Z"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">${escapeHtml(pasta)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;" onclick="event.stopPropagation()">
          <i class="fa-solid fa-pen folder-action-icon" onclick="editarNomePasta(event, '${pasta}')" title="Renomear pasta" style="color: var(--primary-blue); cursor: pointer;"></i>
          <i class="fa-solid fa-trash folder-action-icon folder-delete-icon" onclick="apagarPasta(event, '${pasta}')" title="Apagar pasta" style="color: var(--danger); cursor: pointer;"></i>
        </div>
      </div>
    `;
  });

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <img class="logo-claro" src="astrohellenic.svg?v=20261008" alt="AstroHellenic" style="max-height: 38px; width: auto;"><img class="logo-escuro" src="astrohellenic-escuro.svg?v=20261008" alt="AstroHellenic" style="max-height: 38px; width: auto;">
    </div>
    <div style="flex: 1; overflow-y: auto; background: var(--bg-sidebar);">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-sidebar);">
        <button onclick="abrirModalNovoMapa()" title="Novo Mapa Astral" style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--gold-primary); cursor: pointer;">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="26" cy="16" r="9"/>
            <path d="M10,54 C10,38 17,32 26,32 C35,32 42,38 42,54"/>
            <line x1="50" y1="30" x2="50" y2="46"/>
            <line x1="42" y1="38" x2="58" y2="38"/>
          </svg>
        </button>
        <button onclick="abrirModalImportacaoTexto()" title="Importar Lista em Massa" style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--gold-primary); cursor: pointer;">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10,38 V54 A4,4 0 0 0 14,58 H50 A4,4 0 0 0 54,54 V38"/>
            <polyline points="10,38 24,38 28,46 36,46 40,38 54,38"/>
            <line x1="32" y1="6" x2="32" y2="36"/>
            <polyline points="20,24 32,36 44,24"/>
          </svg>
        </button>
      </div>

      <div style="padding: 8px 16px; border-top: 1px solid var(--border-color); background: var(--bg-sidebar); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">Pastas</span>
        <button class="add-folder-btn" onclick="criarNovaPasta()" style="background: var(--bg-card); border: 1px solid var(--gold-primary); color: var(--primary-blue); border-radius: 8px; padding: 4px 8px; font-weight: 700; cursor: pointer;">+ Pasta</button>
      </div>
      ${htmlPastas}
    </div>
  `;
}

/* TEMA CÉU (claro/céu): preferência do APARELHO, no localStorage (chave astro_tema_mandala) — igual ao modo de
   cor claro/escuro. O Céu hoje cobre o software inteiro, então é aparência, não dado da conta; e assim o
   index.html já abre no tema certo, sem piscar o claro/escuro por trás (ver o script no <head>/<body>).
   Não migrar de volta pro Supabase por semelhança com a Regra de ouro 2 — decisão do astrólogo (03/10/2026). */
function lerTemaMandalaLocal() {
  try {
    const t = localStorage.getItem('astro_tema_mandala');
    return (t === 'ceu' || t === 'claro') ? t : null;
  } catch (e) { return null; }
}

function aplicarTemaMandala(tema) {
  window.temaMandala = tema;
  if (typeof window.aplicarModoCor === 'function') { // o Céu não tem base escura: reaplica o modo com o tema já definido
    let modo = 'auto'; try { modo = localStorage.getItem('astro_modo_cor') || 'auto'; } catch (e) {}
    window.aplicarModoCor(modo);
  }
  document.body.classList.toggle('tema-ceu', tema === 'ceu');
  // Se a mandala já tinha sido desenhada com outro tema, refaz o desenho já com o tema certo.
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof renderMandala === 'function') {
    if (mandalaEstaNaTela()) renderMandala();
    else reRenderizarModuloAtivo(); // outra ferramenta aberta: refaz ELA com o tema novo (se ainda esperando o mapa, não faz nada)
  }
}

/* CHAMADO LOGO APÓS O LOGIN. Se este aparelho já tem o tema guardado, não há nada a fazer (já foi aplicado na
   abertura). Só num aparelho que ainda não escolheu: lê UMA VEZ o que estava salvo na conta (tema_mandala, de
   antes dessa mudança), guarda no aparelho e aplica — quem já usava o Céu não perde a escolha. */
async function carregarTemaMandala(userId) {
  if (lerTemaMandalaLocal()) return;
  let tema = 'claro';
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('tema_mandala')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && data.tema_mandala) tema = data.tema_mandala;
  } catch (e) {
    console.error("Erro ao ler o tema da mandala da conta:", e);
  }
  try { localStorage.setItem('astro_tema_mandala', tema); } catch (e) {}
  aplicarTemaMandala(tema);
}

/* SALVA A APARÊNCIA ESCOLHIDA NA TELA APARÊNCIA: 'ceu' | 'claro' | 'escuro' | 'auto'. Uma escolha só, tudo no
   APARELHO (localStorage), não na conta: o modo de cor (astro_modo_cor: claro/escuro/auto — "seguir o tema do
   aparelho" só faz sentido por aparelho) e o Tema Céu (astro_tema_mandala: ceu/claro).
   - 'ceu': liga o Céu, que é um tema INDEPENDENTE — sem base clara nem escura por trás (aplicarModoCor desliga o
     "tema-escuro" enquanto o Céu estiver ligado). O modo de cor guardado não é apagado, só deixa de valer.
   - 'claro' / 'escuro' / 'auto': desliga o Céu e aplica o modo — o automático só escolhe entre claro e escuro, nunca Céu.
   window.aplicarModoCor vem do script inline em index.html (roda antes de supabase.js). */
function salvarAparencia(escolha) {
  const tema = escolha === 'ceu' ? 'ceu' : 'claro';
  try { localStorage.setItem('astro_tema_mandala', tema); } catch (e) {}
  window.temaMandala = tema; // antes do aplicarModoCor: ele consulta se o Céu está ligado
  let modo = escolha;
  if (tema === 'ceu') { modo = 'auto'; try { modo = localStorage.getItem('astro_modo_cor') || 'auto'; } catch (e) {} }
  else { try { localStorage.setItem('astro_modo_cor', escolha); } catch (e) {} }
  if (typeof window.aplicarModoCor === 'function') window.aplicarModoCor(modo);
  document.body.classList.toggle('tema-ceu', tema === 'ceu');
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof renderMandala === 'function') {
    if (mandalaEstaNaTela()) renderMandala();
  }
  if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
}

/* CARREGA O ESTILO DOS ÍCONES DOS PLANETAS DO SUPABASE (chamado logo após o login) */
async function carregarEstiloPlanetas(userId) {
  let estilo = 'simples';
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('estilo_planetas')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && data.estilo_planetas) estilo = data.estilo_planetas;
  } catch (e) {
    console.error("Erro ao carregar estilo dos planetas:", e);
  }
  window.estiloPlanetas = estilo;
  reRenderizarModuloAtivo();
}

/* SALVA O ESTILO DOS ÍCONES DOS PLANETAS ESCOLHIDO E ATUALIZA A TELA NA HORA */
async function salvarEstiloPlanetas(estilo) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, estilo_planetas: estilo }, { onConflict: 'user_id' });

    if (!error) {
      window.estiloPlanetas = estilo;
      reRenderizarModuloAtivo();
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else {
      alert("Erro ao salvar estilo dos planetas: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar estilo dos planetas.");
  }
}

/* ESTILO DA MANDALA (Astro Hellenic / francês) — preferência do astrólogo, guardada no Supabase (configuracoes.estilo_mandala),
   não no aparelho. Só o FORMATO do desenho (ver estiloMandalaAtual em mandala.js); cores e ícones seguem o tema.
   Sem escolha salva (ou coluna ainda não criada), vale o padrão de sempre de cada tema. */
async function carregarEstiloMandala(userId) {
  let estilo = null;
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('estilo_mandala')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && (data.estilo_mandala === 'astrohellenic' || data.estilo_mandala === 'astrohellenic_reto' || data.estilo_mandala === 'comum' || data.estilo_mandala === 'frances')) estilo = data.estilo_mandala;
  } catch (e) {
    console.error("Erro ao carregar o estilo da mandala:", e);
  }
  if (estilo && estilo !== window.estiloMandala) {
    window.estiloMandala = estilo;
    reRenderizarModuloAtivo();
  }
}

async function salvarEstiloMandala(estilo) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, estilo_mandala: estilo }, { onConflict: 'user_id' });

    if (!error) {
      window.estiloMandala = estilo;
      reRenderizarModuloAtivo();
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else if (/estilo_mandala/i.test(error.message || '')) {
      alert("Falta criar a coluna do estilo da mandala no banco. No Supabase, abra o SQL Editor e rode:\n\nalter table configuracoes add column estilo_mandala text;\n\nDepois escolha o estilo de novo.");
    } else {
      alert("Erro ao salvar o estilo da mandala: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar o estilo da mandala.");
  }
}

/* RÓTULOS DOS GLIFOS (nome do planeta ao lado do ícone) — preferência do astrólogo, guardada no Supabase (configuracoes.mostrar_rotulos_glifos),
   não no aparelho. Sem valor salvo (ou coluna ainda não criada), os nomes aparecem (padrão). Ver planetaComNome em planetIcons.js. */
async function carregarMostrarRotulosGlifos(userId) {
  let valor = true;
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('mostrar_rotulos_glifos')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && typeof data.mostrar_rotulos_glifos === 'boolean') valor = data.mostrar_rotulos_glifos;
  } catch (e) {
    console.error("Erro ao carregar a preferência dos rótulos dos glifos:", e);
  }
  if (valor !== window.mostrarRotulosGlifos) {
    window.mostrarRotulosGlifos = valor;
    reRenderizarModuloAtivo();
  }
}

async function salvarMostrarRotulosGlifos(valor) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, mostrar_rotulos_glifos: valor }, { onConflict: 'user_id' });

    if (!error) {
      window.mostrarRotulosGlifos = valor;
      reRenderizarModuloAtivo();
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else if (/mostrar_rotulos_glifos/i.test(error.message || '')) {
      alert("Falta criar a coluna dos rótulos dos glifos no banco. No Supabase, abra o SQL Editor e rode:\n\nalter table configuracoes add column mostrar_rotulos_glifos boolean default true;\n\nDepois escolha de novo.");
    } else {
      alert("Erro ao salvar a preferência dos rótulos dos glifos: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar a preferência dos rótulos dos glifos.");
  }
}

/* REDESENHA A FERRAMENTA ATUALMENTE ABERTA (usado ao trocar o estilo dos ícones dos planetas) */
function reRenderizarModuloAtivo() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) return;
  // Recarregou a página com outra ferramenta aberta e o mapa ainda está chegando (ver window.onload em
  // mandala.js): moduloTecnicoAtivo ainda é undefined, e cair no 'mandala' aqui sobrescrevia a ferramenta
  // guardada (astro_ultimo_modulo) e cancelava a restauração. A ferramenta pendente já abre com o estilo certo.
  if (window.moduloPendenteRestaurar) return;
  descartarModulosGuardados(); // o estilo mudou: as telas guardadas das outras ferramentas ficariam com o antigo
  const modulo = window.moduloTecnicoAtivo || 'mandala';
  if (modulo === 'configuracoes') { atualizarTelaConfiguracoes(); return; } // a página de Configurações não depende do estilo dos ícones
  if (typeof abrirModuloTecnica === 'function') abrirModuloTecnica(modulo, true);
}

/* ORDEM DOS BOTÕES DA BARRA SUPERIOR (Configurações > Aparência)
   As chaves abaixo são as mesmas do atributo data-modulo-key de cada botão
   dentro de #top-bar .top-bar-controls, em index.html. */
const ORDEM_BOTOES_TOPO_PADRAO = ['relatorio', 'tabelaTecnica', 'mandala', 'sinastria', 'direcoes', 'liberacao', 'decenios', 'profeccao', 'lotes', 'horas', 'isopsefia', 'agenda', 'configuracoes', 'financeiro'];

const ROTULOS_BOTOES_TOPO = {
  relatorio: 'Relatório',
  tabelaTecnica: 'Tabela Técnica',
  mandala: 'Natal',
  sinastria: 'Sinastria',
  direcoes: 'Direções Primárias',
  liberacao: 'Liberação Zodiacal',
  decenios: 'Decênios',
  profeccao: 'Profecção',
  lotes: 'Calculadora de Lotes',
  horas: 'Horas Planetárias',
  isopsefia: 'Isopsefia',
  agenda: 'Agenda',
  configuracoes: 'Configurações',
  financeiro: 'Financeiro'
};

/* Completa uma ordem salva com chaves novas que não existiam quando ela foi
   salva (ex.: um botão adicionado à barra depois), colocando-as no fim, e
   descarta chaves que não existem mais. */
function completarOrdemBotoesTopo(ordem) {
  const base = Array.isArray(ordem) ? ordem.filter(chave => ORDEM_BOTOES_TOPO_PADRAO.includes(chave)) : [];
  ORDEM_BOTOES_TOPO_PADRAO.forEach(chave => {
    if (!base.includes(chave)) base.push(chave);
  });
  return base;
}

/* Reordena de verdade os botões dentro de #top-bar .top-bar-controls,
   movendo os elementos já existentes (appendChild move, não clona — os
   onclick continuam funcionando normalmente). */
function aplicarOrdemBotoesTopo(ordem) {
  const container = document.querySelector('#top-bar .top-bar-controls');
  if (!container) return;
  completarOrdemBotoesTopo(ordem).forEach(chave => {
    const btn = container.querySelector(`[data-modulo-key="${chave}"]`);
    if (btn) container.appendChild(btn);
  });
}

/* CARREGA A ORDEM DOS BOTÕES DA BARRA SUPERIOR DO SUPABASE (chamado logo após o login) */
async function carregarOrdemBotoesTopo(userId) {
  let ordem = ORDEM_BOTOES_TOPO_PADRAO;
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('ordem_botoes_topo')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && Array.isArray(data.ordem_botoes_topo) && data.ordem_botoes_topo.length > 0) {
      ordem = data.ordem_botoes_topo;
    }
  } catch (e) {
    console.error("Erro ao carregar ordem dos botões da barra superior:", e);
  }
  window.ordemBotoesTopo = completarOrdemBotoesTopo(ordem);
  aplicarOrdemBotoesTopo(window.ordemBotoesTopo);
}

/* SALVA A ORDEM DOS BOTÕES DA BARRA SUPERIOR ESCOLHIDA E ATUALIZA A TELA NA HORA */
async function salvarOrdemBotoesTopo(novaOrdem) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, ordem_botoes_topo: novaOrdem }, { onConflict: 'user_id' });

    if (!error) {
      window.ordemBotoesTopo = novaOrdem;
      aplicarOrdemBotoesTopo(novaOrdem);
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else {
      alert("Erro ao salvar ordem dos botões: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar ordem dos botões.");
  }
}

/* USADO PELAS SETAS ▲▼ DA TELA DE APARÊNCIA: troca a posição de uma chave
   com a vizinha (direcao: -1 sobe, +1 desce) e salva. */
function moverBotaoTopo(chave, direcao) {
  const ordemAtual = completarOrdemBotoesTopo(window.ordemBotoesTopo);
  const i = ordemAtual.indexOf(chave);
  const j = i + direcao;
  if (i === -1 || j < 0 || j >= ordemAtual.length) return;
  [ordemAtual[i], ordemAtual[j]] = [ordemAtual[j], ordemAtual[i]];
  salvarOrdemBotoesTopo(ordemAtual);
}



/* Ferramentas que ficam "guardadas" ao trocar pra outra (a tela, com tudo o que foi digitado/escolhido/rolado,
   é só tirada do #mandala-container e recolocada na volta, em vez de ser reconstruída do zero). Ficam de fora a
   Mandala/Radix (estado global, redesenhada de qualquer jeito), as Horas (dependem do relógio) e a Agenda
   (dados podem mudar por fora, ex.: novos agendamentos). */
const MODULOS_GUARDAVEIS = ['relatorio', 'tabelaTecnica', 'profeccao', 'decenios', 'isopsefia', 'liberacao', 'direcoes', 'lotes', 'sinastria'];
window.modulosGuardados = window.modulosGuardados || {};

/* Esquece as telas guardadas — chamada sempre que o que elas mostram deixa de valer (outro mapa/momento
   calculado em executarCalculo, ou mudança de estilo em reRenderizarModuloAtivo). */
function descartarModulosGuardados() { window.modulosGuardados = {}; }
window.descartarModulosGuardados = descartarModulosGuardados;

/* A Mandala é mesmo o que está (ou vai estar) na tela? Falso quando outra ferramenta está aberta ou esperando o
   mapa chegar (recarregou a página com ela aberta). Quem redesenha a mandala "por baixo dos panos" (carregar o
   tema, voltar do login...) TEM que perguntar isso antes: renderMandala() escreve direto no #mandala-container,
   então chamá-la com outra ferramenta aberta joga a mandala por cima dela — gigante, sem a classe modo-mandala e
   sem os botões da Mandala, até apertar o ícone da Mandala de novo. */
function mandalaEstaNaTela() {
  if (window.moduloPendenteRestaurar) return false;
  const m = window.moduloTecnicoAtivo;
  return !m || m === 'mandala' || m === 'radix';
}
window.mandalaEstaNaTela = mandalaEstaNaTela;

/* Abrir módulo técnicas */
function abrirModuloTecnica(modulo, forcar) {
  // Clicar UMA vez no ícone da ferramenta que JÁ está aberta (e é guardável) não faz nada: antes reconstruía a
  // tela do zero e perdia o que estava ali. DUPLO clique (dois cliques em até 450 ms, com a ferramenta já aberta
  // desde o primeiro) reinicia de propósito. Contado aqui e não no evento "dblclick" pra funcionar também no
  // toque. "forcar" é pra quem quer redesenhar sem perguntar (reRenderizarModuloAtivo).
  if (!forcar) {
    const agora = Date.now();
    const ultimo = window.ultimoCliqueIcone;
    let jaAberta = false;
    if (modulo === window.moduloTecnicoAtivo && MODULOS_GUARDAVEIS.includes(modulo)) {
      const c = document.getElementById('mandala-container');
      if (c && c.childNodes.length && !c.querySelector('[data-spinner-troca]')) {
        jaAberta = true;
        const duplo = ultimo && ultimo.modulo === modulo && ultimo.jaAberta && (agora - ultimo.t) < 450;
        window.ultimoCliqueIcone = duplo ? null : { modulo, t: agora, jaAberta: true };
        if (!duplo) return;
      }
    }
    if (!jaAberta) window.ultimoCliqueIcone = { modulo, t: agora, jaAberta: false };
  }
  window.moduloPendenteRestaurar = null; // qualquer navegação explícita cancela a ferramenta que aguardava o mapa carregar
  const moduloAnterior = window.moduloTecnicoAtivo;
  window.moduloTecnicoAtivo = modulo;
  try { localStorage.setItem('astro_ultimo_modulo', modulo); } catch (e) {}
  const cRadix = document.getElementById('mandala-container');
  const cRev = document.getElementById('revolucao-container');
  const cOverlay = document.getElementById('mandala-controls-overlay');
  const cActionsOverlay = document.getElementById('mandala-actions-overlay');
   
  if (cRadix) cRadix.style.display = 'none';
  if (cRev) cRev.style.display = 'none';
  if (cOverlay) cOverlay.style.display = 'none';
  if (cActionsOverlay) cActionsOverlay.style.display = 'none';

  // #mandala-container está prestes a ser reconstruído do zero pro módulo
  // "modulo" (seja qual for), então a Matriz de Visibilidade nunca
  // continua ali dentro depois disso — zera a aparência "apertada" do
  // botão que a mostra (matrizVisibilidade.js), senão ele ficava marcado
  // como ativo mesmo depois de trocar de ferramenta e voltar pra Mandala.
  const btnMatrizMandala = document.getElementById('btn-matriz-visibilidade-mandala');
  if (btnMatrizMandala) btnMatrizMandala.classList.remove('matriz-visibilidade-ativa');

  // Esvazia #mandala-container ANTES de trocar as classes/CSS do modo —
  // ele é reaproveitado por quase todos os módulos (Mandala, Tabela
  // Técnica, Profecção, Relatório etc.), então sem isso o HTML do módulo
  // ANTERIOR ficava ali dentro por um instante (só escondido via
  // display:none) até o novo módulo terminar de reconstruir o próprio
  // conteúdo. Módulos com uma etapa assíncrona no meio (a mandala, que
  // gera a imagem via SVG->Image->Canvas antes de substituir o innerHTML
  // — ver renderMandala) dão tempo do navegador pintar esse conteúdo
  // antigo já sob as classes/CSS do modo NOVO (ex.: texto de relatório
  // espremido no layout de altura travada do modo-mandala), um flash
  // feio e quebrado entre uma ferramenta e outra. Um spinner neutro aqui
  // garante que, quando o container reaparecer, nunca mostre restos de
  // outro módulo — o próprio init do módulo novo substitui isso em
  // seguida pelo conteúdo de verdade (ou por um loading próprio dele).
  // Guarda a tela da ferramenta que está saindo (só se ela já terminou de montar — se ainda mostra o spinner
  // de carregamento, não há nada de útil pra guardar) e pega a da que está entrando, se houver.
  let telaRestaurada = null;
  if (cRadix) {
    if (moduloAnterior && moduloAnterior !== modulo && MODULOS_GUARDAVEIS.includes(moduloAnterior)
        && cRadix.childNodes.length && !cRadix.querySelector('[data-spinner-troca]')) {
      const frag = document.createDocumentFragment();
      while (cRadix.firstChild) frag.appendChild(cRadix.firstChild);
      window.modulosGuardados[moduloAnterior] = { frag, scrollY: window.scrollY, scrollTop: cRadix.scrollTop };
    }
    if (MODULOS_GUARDAVEIS.includes(modulo) && moduloAnterior !== modulo && window.modulosGuardados[modulo]) {
      telaRestaurada = window.modulosGuardados[modulo];
      delete window.modulosGuardados[modulo];
    }
  }

  if (cRadix && telaRestaurada) {
    cRadix.innerHTML = '';
    cRadix.appendChild(telaRestaurada.frag);
  } else if (cRadix) {
    cRadix.innerHTML = `
      <div data-spinner-troca style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37;"></i>
      </div>
    `;
  }

  document.body.classList.toggle('modo-mandala', modulo === 'mandala' || modulo === 'radix');
  if (modulo !== 'mandala') document.body.classList.remove('mandala-papiro-tela'); // a folha de papiro é só da tela da Mandala (renderMandala liga de novo ao voltar)

  // #mandala-container tem "overflow-y: scroll" fixo no CSS (precisa disso
  // só no modo Mandala/Radix, pra imagem da mandala ter uma altura de
  // referência pra encolher — ver o comentário de ":not(.modo-mandala)"
  // no index.html). Fora desse modo é a PÁGINA (body/html) que rola de
  // verdade; mas só ter "overflow-y: scroll" já basta pro navegador tratar
  // #mandala-container como o "ancestral com rolagem" de qualquer
  // position:sticky lá dentro (ex.: a barra do editor de Relatório) —
  // mesmo ele nunca rolando de fato nesse modo, o que fazia a barra
  // grudar num lugar que não acompanha a rolagem real da tela. Corrige
  // aqui, no único lugar que troca de módulo, pra nunca vazar de um
  // módulo pro outro (a mandala continua recebendo "scroll" de volta).
  if (cRadix) cRadix.style.overflowY = (modulo === 'mandala' || modulo === 'radix') ? '' : 'visible';

  // Fora do modo Mandala/Radix, o #top-bar (ícones das ferramentas) vira
  // position:fixed (ver body.topbar-fixo no index.html) — assim o
  // astrólogo pode trocar de ferramenta a qualquer momento, mesmo rolado
  // bem fundo numa tela longa (ex.: editando um Relatório), sem precisar
  // sair da tela atual só pra enxergar os ícones. No modo Mandala ele
  // continua no fluxo normal, de propósito (ver o comentário da regra
  // CSS "body.topbar-fixo #top-bar").
  document.body.classList.toggle('topbar-fixo', !(modulo === 'mandala' || modulo === 'radix'));
  if (typeof ajustarEspacadorTopBar === 'function') ajustarEspacadorTopBar();

// 1. MANDALA / MAPA NATAL (Globinho)
if (telaRestaurada) {
  if (cRadix) cRadix.style.display = 'block';
  requestAnimationFrame(() => {
    if (cRadix) cRadix.scrollTop = telaRestaurada.scrollTop;
    window.scrollTo(0, telaRestaurada.scrollY);
  });
  } else if (modulo === 'mandala' || modulo === 'radix') {
  if (cRadix) cRadix.style.display = 'block';
  if (cOverlay) cOverlay.style.display = 'flex';
  if (cActionsOverlay) cActionsOverlay.style.display = 'flex';
  if (typeof renderMandala === 'function') renderMandala();
  }
  // 2. TABELA TÉCNICA
    else if (modulo === 'tabelaTecnica') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloTabelaTecnica === 'function') iniciarModuloTabelaTecnica();
  }  
  // 3. REVOLUÇÃO SOLAR (Solzinho)
  else if (modulo === 'revolucao') {
    if (cRev) cRev.style.display = 'block';
      if (typeof iniciarModuloRevolucao === 'function') iniciarModuloRevolucao();
    } 
  // 4. PROFECÇÃO (Setinha)
  else if (modulo === 'profeccao') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloProfeccao === 'function') iniciarModuloProfeccao();
  } 
  // 5. DECÊNIOS (Ampulheta)
  else if (modulo === 'decenios') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloDecenios === 'function') iniciarModuloDecenios();
  } 
  // 6. ISOPSEFIA (Calculadora)
  else if (modulo === 'isopsefia') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloIsopsefia === 'function') iniciarModuloIsopsefia();
  }
  // 7. LIBERAÇÃO ZODIACAL
  else if (modulo === 'liberacao') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloLiberacao === 'function') iniciarModuloLiberacao();
  }
  // 8. DIREÇÕES PRIMÁRIAS
  else if (modulo === 'direcoes') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloDirecoes === 'function') iniciarModuloDirecoes();
  }
  // 8B. CALCULADORA DE LOTES
  else if (modulo === 'lotes') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloLotes === 'function') iniciarModuloLotes();
  }
  // 9. HORAS PLANETÁRIAS
  else if (modulo === 'horas') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloHoras === 'function') iniciarModuloHoras();
  }
  // 10. RELATÓRIO (Mapa Natal Clássico em PDF)
  else if (modulo === 'relatorio') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloRelatorio === 'function') iniciarModuloRelatorio();
  }
  // 11. AGENDA (disponibilidade + agendamentos — ainda sem Google Agenda)
  else if (modulo === 'agenda') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloAgenda === 'function') iniciarModuloAgenda();
  }
  // 13. CONFIGURAÇÕES (página inteira, configuracoes.js — não depende de mapa aberto)
  else if (modulo === 'configuracoes') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloConfiguracoes === 'function') iniciarModuloConfiguracoes();
  }
  // 13B. FINANCEIRO (entradas mensais)
  else if (modulo === 'financeiro') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloFinanceiro === 'function') iniciarModuloFinanceiro();
  }
  // 12. SINASTRIA (mandala dupla: mapa em tela + segundo mapa escolhido)
  else if (modulo === 'sinastria') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloSinastria === 'function') iniciarModuloSinastria();
  }
}

/* NÍVEL 2C: TELA DE PASTAS COM "IMPORTAR EM MASSA" NO TOPO */
function abrirNavegacaoPastas() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  let html = `
     <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <span style="font-size: 13px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">PASTAS</span>
      <button class="add-folder-btn" onclick="criarNovaPasta()" style="background: var(--bg-card); border: 1px solid var(--gold-primary); color: var(--primary-blue); border-radius: 8px; padding: 4px 10px; font-weight: 700; cursor: pointer;">+ Pasta</button>
    </div>
    <div style="flex: 1; overflow-y: auto; background: var(--bg-sidebar); padding: 4px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; margin: 4px 8px; border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); cursor: pointer;" onclick="abrirModalImportacaoTexto()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-file-import" style="color: var(--gold-primary);"></i>
          <span style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Importar Lista em Massa</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
      </div>
  `;

  pastasOrdenadas.forEach(pasta => {
    const pastaAttrEscapada = escapeHtml(pasta).replace(/'/g, "&#39;");

    html += `
       <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.15s ease;" onclick="abrirConteudoPasta('${pastaAttrEscapada}')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M4,7 A2,2 0 0 1 6,5 H10 L12,7.5 H19 A2,2 0 0 1 21,9.5 V17 A2,2 0 0 1 19,19 H6 A2,2 0 0 1 4,17 Z"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">${escapeHtml(pasta)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;" onclick="event.stopPropagation()">
          <i class="fa-solid fa-pen folder-action-icon" onclick="editarNomePasta(event, '${pastaAttrEscapada}')" title="Renomear pasta" style="color: var(--primary-blue); cursor: pointer;"></i>
          <i class="fa-solid fa-trash folder-action-icon folder-delete-icon" onclick="apagarPasta(event, '${pastaAttrEscapada}')" title="Apagar pasta" style="color: var(--danger); cursor: pointer;"></i>
          <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary); margin-left: 4px;"></i>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  sidebar.innerHTML = html;
}

/* NÍVEL 3C: TELA DE MAPAS DA PASTA */
async function abrirConteudoPasta(nomePasta) {
  activeFolder = nomePasta;
  selectedMapIds.clear();
  isSelectionMode = false;

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

    sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="renderMenuPrincipal()" title="Voltar às pastas" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i>
      </button>
      <span style="font-size: 13px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">${escapeHtml(nomePasta)}</span>
      <button class="icon-btn" id="trashModeBtn" onclick="alternarModoSelecao()" title="Selecionar para apagar" style="color: var(--danger); border: 1px solid var(--danger-border); border-radius: 8px; background: var(--danger-bg); padding: 4px 8px; cursor: pointer;">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <div style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); background: var(--bg-sidebar);">
      <div class="search-box-container" style="margin-bottom: 8px;">
        <input type="text" id="filterClientsInput" class="client-search-input" placeholder="Buscar nesta pasta..." oninput="executarBuscaLocal(this.value)" style="flex: 1; min-width: 0; border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); color: var(--primary-blue);">
      </div>
      <div class="search-box-container" style="margin-bottom: 0;">
        <select id="sortFieldSelect" class="modal-select" onchange="aplicarOrdenacaoLista(this.value)" title="Ordenar por" style="width: auto; flex: 1; min-width: 0; border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); color: var(--primary-blue); font-size: 11px; padding: 8px 6px;">
          <option value="codigo" ${currentSortField === 'codigo' ? 'selected' : ''}>Código</option>
          <option value="nome" ${currentSortField === 'nome' ? 'selected' : ''}>Nome</option>
          <option value="cidade" ${currentSortField === 'cidade' ? 'selected' : ''}>Cidade</option>
          <option value="tipo" ${currentSortField === 'tipo' ? 'selected' : ''}>Tipo</option>
        </select>
        <button type="button" id="sortDirectionBtn" class="icon-btn" onclick="alternarDirecaoOrdenacao()" title="${currentSortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}" style="border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 0 12px; cursor: pointer; flex: 0 0 auto;">
          <i class="fa-solid ${currentSortDirection === 'asc' ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-wide-short'}" style="color: var(--gold-primary);"></i>
        </button>
      </div>
    </div>

    <div id="selectionActionBar" style="display: none; padding: 8px 12px; background: var(--danger-bg); border-bottom: 1px solid var(--danger-border); justify-content: space-between; align-items: center; margin: 4px 8px; border-radius: 8px;">
      <label style="font-size: 11px; font-weight: 700; color: var(--danger-text); display: flex; align-items: center; gap: 6px; cursor: pointer;">
        <input type="checkbox" id="selectAllCheckbox" onchange="marcarTodosMapas(this.checked)" style="accent-color: var(--danger);"> Selecionar Todos
      </label>
      <button onclick="confirmarExclusaoSelecionados()" style="background: var(--danger); color: #fff; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
        Apagar (<span id="selectedCount">0</span>)
      </button>
    </div>

    <div id="clientsListContainer" class="client-list-container" style="border: none; border-radius: 0; background: var(--bg-sidebar);">
      <div style="padding: 16px; text-align: center; font-size: 12px; color: var(--primary-blue);"><i class="fa-solid fa-spinner fa-spin" style="color: var(--gold-primary);"></i> Carregando mapas...</div>
    </div>
  `;

  await carregarMapasDoBanco(nomePasta);
}

/* CARREGA MAPAS E ORDENA PRIORIZANDO O CÓDIGO NUMÉRICO */
async function carregarMapasDoBanco(nomePasta) {
  try {
    const { data, error } = await supabaseClient
      .from('mapas')
      .select('*')
      .eq('pasta', nomePasta);

    if (!error && Array.isArray(data)) {
      cachedFolderData = data.map(item => ({
        id: item.id,
        pasta: item.pasta || activeFolder,
        codigo: (item.codigo && String(item.codigo).trim() !== '') ? item.codigo : null,
        nome: item.nome,
        tipo: item.tipo || 'Natal',
        dataNascimento: item.data_nascimento,
        horaNascimento: item.hora_nascimento,
        cidade: item.cidade,
        latitude: item.latitude,
        longitude: item.longitude,
        whatsapp: item.whatsapp || null,
        email: item.email || null
      }));
      ordenarCachedFolderData();
      renderListaMapas(cachedFolderData);
    }
  } catch (err) {
    console.error("Erro ao carregar mapas:", err);
  }
}

/* ORDENAÇÃO DA LISTA DE CLIENTES (campo + direção escolhidos pelo usuário) */
function compararValoresOrdenacao(a, b, campo) {
  if (campo === 'codigo') {
    const codA = parseInt(a.codigo, 10);
    const codB = parseInt(b.codigo, 10);

    const temCodA = !isNaN(codA);
    const temCodB = !isNaN(codB);

    if (temCodA && temCodB) return codA - codB;
    if (temCodA) return -1;
    if (temCodB) return 1;

    return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
  }

  if (campo === 'cidade') return (a.cidade || '').localeCompare(b.cidade || '', 'pt-BR');
  if (campo === 'tipo') return (a.tipo || '').localeCompare(b.tipo || '', 'pt-BR');

  // 'nome' e qualquer outro caso caem no padrão alfabético por nome
  return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
}

function ordenarCachedFolderData() {
  cachedFolderData.sort((a, b) => {
    const resultado = compararValoresOrdenacao(a, b, currentSortField);
    return currentSortDirection === 'desc' ? -resultado : resultado;
  });
}

function reordenarERenderizar() {
  ordenarCachedFolderData();
  const inputEl = document.getElementById('filterClientsInput');
  executarBuscaLocal(inputEl ? inputEl.value : '');
}

/* CARREGA A ORDENAÇÃO SALVA NA CONTA (chamado logo após o login, igual
   carregarTemaMandala/carregarEstiloPlanetas) */
async function carregarOrdenacaoClientes(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('ordenacao_clientes_campo, ordenacao_clientes_direcao')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data) {
      if (data.ordenacao_clientes_campo) currentSortField = data.ordenacao_clientes_campo;
      if (data.ordenacao_clientes_direcao) currentSortDirection = data.ordenacao_clientes_direcao;
    }
  } catch (e) {
    console.error("Erro ao carregar ordenação de clientes:", e);
  }
}

/* SALVA A ORDENAÇÃO ESCOLHIDA NA CONTA — dispara em segundo plano (sem
   travar a reordenação, que já acontece na hora, localmente) */
async function salvarOrdenacaoClientes() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, ordenacao_clientes_campo: currentSortField, ordenacao_clientes_direcao: currentSortDirection }, { onConflict: 'user_id' });
  } catch (e) {
    console.error("Erro ao salvar ordenação de clientes:", e);
  }
}

function aplicarOrdenacaoLista(campo) {
  currentSortField = campo;
  reordenarERenderizar();
  salvarOrdenacaoClientes();
}

function alternarDirecaoOrdenacao() {
  currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';

  const btn = document.getElementById('sortDirectionBtn');
  if (btn) {
    btn.title = currentSortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente';
    btn.innerHTML = `<i class="fa-solid ${currentSortDirection === 'asc' ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-wide-short'}" style="color: #c59b27;"></i>`;
  }

  reordenarERenderizar();
  salvarOrdenacaoClientes();
}

function renderListaMapas(lista) {
  const container = document.getElementById('clientsListContainer');
  if (!container) return;

  if (!lista || lista.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--text-faint);">Nenhum mapa encontrado.</div>`;
    return;
  }

  let html = '';
  lista.forEach((item, index) => {
    const cod = item.codigo ? `${item.codigo} - ` : '';
    const tipoStr = item.tipo ? ` ${item.tipo}` : '';
    const dataStr = item.dataNascimento || "Data n/i";
    const horaStr = item.horaNascimento || "";
    const dataHoraStr = horaStr ? `${dataStr} às ${horaStr}` : dataStr;
    const cidStr = item.cidade || "Local n/i";
    const isChecked = selectedMapIds.has(item.id) ? 'checked' : '';

 // Trata o número do WhatsApp para o link direto
    const numWhats = item.whatsapp ? item.whatsapp.replace(/\D/g, '') : '';
    const linkWhats = numWhats ? (numWhats.length <= 11 ? `55${numWhats}` : numWhats) : '';

    html += `
      <div class="client-card-item" id="card-item-${index}" style="margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); padding: 10px 12px; transition: all 0.15s ease;">
        ${isSelectionMode ? `<input type="checkbox" class="map-select-cb" value="${item.id}" ${isChecked} onchange="alternarSelecaoMapa(${item.id}, this.checked)" style="margin-right: 10px; cursor: pointer; accent-color: var(--primary-blue);">` : ''}
        <div style="flex: 1; cursor: pointer;" onclick="${isSelectionMode ? `alternarSelecaoPorCard(${item.id})` : `selecionarRegistro(${index}); fecharSidebar();`}">
          <div class="client-name" style="color: var(--primary-blue); font-weight: 700; font-size: 12px;">${cod}${escapeHtml(item.nome || 'Sem Nome')}<span style="font-size: 10px; font-weight: 600; color: var(--gold-primary); margin-left: 6px;">${escapeHtml(tipoStr)}</span></div>
          <div class="client-meta" style="color: var(--text-muted); font-size: 10px; margin-top: 2px;">${escapeHtml(dataHoraStr)} • ${escapeHtml(cidStr)}</div>
        </div>
        ${!isSelectionMode ? `
          <div class="card-actions" style="display: flex; gap: 6px; align-items: center;">
            ${linkWhats ? `
              <button type="button" class="action-record-btn" onclick="event.stopPropagation(); window.open('https://wa.me/${linkWhats}', '_blank')" title="Abrir WhatsApp" style="color: #25d366; background: transparent; border: none; cursor: pointer;">
                <i class="fa-brands fa-whatsapp"></i>
              </button>
            ` : ''}
            ${item.email ? `
              <button type="button" class="action-record-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${escapeHtml(item.email)}'); alert('E-mail copiado!');" title="Copiar E-mail" style="color: var(--gold-primary); background: transparent; border: none; cursor: pointer;">
                <i class="fa-solid fa-envelope"></i>
              </button>
            ` : ''}
            <button type="button" class="action-record-btn edit-btn" onclick="abrirModalEdicao(event, ${index})" title="Editar" style="color: var(--primary-blue); background: transparent; border: none; cursor: pointer;">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="action-record-btn delete-btn" onclick="deletarRegistroUnico(event, ${item.id})" title="Apagar" style="color: var(--danger); background: transparent; border: none; cursor: pointer;">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

/* MODO DE SELEÇÃO MÚLTIPLA E EXCLUSÃO */
function alternarModoSelecao() {
  isSelectionMode = !isSelectionMode;
  selectedMapIds.clear();
  
  const bar = document.getElementById('selectionActionBar');
  if (bar) bar.style.display = isSelectionMode ? 'flex' : 'none';
  
  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.innerText = '0';

  renderListaMapas(cachedFolderData);
}

function alternarSelecaoMapa(id, isChecked) {
  if (isChecked) selectedMapIds.add(id);
  else selectedMapIds.delete(id);

  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.innerText = selectedMapIds.size;
}

function alternarSelecaoPorCard(id) {
  const isChecked = selectedMapIds.has(id);
  alternarSelecaoMapa(id, !isChecked);
  renderListaMapas(cachedFolderData);
}

function marcarTodosMapas(checked) {
  selectedMapIds.clear();
  if (checked) {
    cachedFolderData.forEach(item => selectedMapIds.add(item.id));
  }
  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.innerText = selectedMapIds.size;

  renderListaMapas(cachedFolderData);
}

async function confirmarExclusaoSelecionados() {
  if (selectedMapIds.size === 0) {
    alert("Nenhum mapa selecionado.");
    return;
  }

  if (await astroConfirm(`Deseja realmente apagar os ${selectedMapIds.size} mapas selecionados?`)) {
    try {
      const idsArray = Array.from(selectedMapIds);
      const { error } = await supabaseClient.from('mapas').delete().in('id', idsArray);

      if (!error) {
        alert("Mapas apagados com sucesso!");
        alternarModoSelecao();
        carregarMapasDoBanco(activeFolder);
      } else {
        alert("Erro ao apagar mapas: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão ao apagar.");
    }
  }
}

function executarBuscaLocal(termo) {
  const q = termo.toLowerCase().trim();
  if (!q) {
    renderListaMapas(cachedFolderData);
    return;
  }
  const filtrados = cachedFolderData.filter(item => 
    (item.nome && item.nome.toLowerCase().includes(q)) || 
    (item.codigo && String(item.codigo).toLowerCase().includes(q)) ||
    (item.cidade && item.cidade.toLowerCase().includes(q))
  );
  renderListaMapas(filtrados);
}

async function criarNovaPasta() {
  const nome = await astroPrompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();

  if (!customFolders.includes(limpo)) {
    try {
      let userId = null;
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;

      const { error } = await supabaseClient.from('pastas').insert([{ nome: limpo, user_id: userId }]);
      if (!error) {
        customFolders.push(limpo);
        abrirNavegacaoPastas();
      } else {
        alert("Erro ao criar pasta: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  }
}

async function editarNomePasta(event, pastaAntiga) {
  event.stopPropagation();
  const novoNome = await astroPrompt(`Novo nome para a pasta "${pastaAntiga}":`, pastaAntiga);
  if (!novoNome || !novoNome.trim() || novoNome.trim() === pastaAntiga) return;
  
  const nomeLimpo = novoNome.trim();

  try {
    await supabaseClient.from('mapas').update({ pasta: nomeLimpo }).eq('pasta', pastaAntiga);
    await supabaseClient.from('pastas').update({ nome: nomeLimpo }).eq('nome', pastaAntiga);
    
    const index = customFolders.indexOf(pastaAntiga);
    if (index !== -1) {
      customFolders[index] = nomeLimpo;
      if (activeFolder === pastaAntiga) activeFolder = nomeLimpo;
      abrirNavegacaoPastas();
    }
  } catch (e) {
    alert("Erro ao renomear pasta.");
  }
}

async function apagarPasta(event, pastaParaDeletar) {
  event.stopPropagation();

  if (customFolders.length <= 1) {
    alert("Você precisa manter pelo menos uma pasta.");
    return;
  }

  if (await astroConfirm(`Deseja remover a pasta "${pastaParaDeletar}" e todos os mapas gravados nela?`)) {
    try {
      await supabaseClient.from('mapas').delete().eq('pasta', pastaParaDeletar);
      await supabaseClient.from('pastas').delete().eq('nome', pastaParaDeletar);
      
      customFolders = customFolders.filter(p => p !== pastaParaDeletar);
      abrirNavegacaoPastas();
    } catch (e) {
      alert("Erro ao apagar pasta.");
    }
  }
}

/* MODAL DE EDIÇÃO E IMPORTAÇÃO DE MAPAS */
function abrirModalEdicao(event, index) {
  event.stopPropagation();
  const item = cachedFolderData[index];
  if (!item) return;

  document.getElementById('editModalId').value = item.id;
  const selectPasta = document.getElementById('editModalPasta');
  if (selectPasta) {
    const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    selectPasta.innerHTML = pastasOrdenadas.map(p => 
      `<option value="${escapeHtml(p)}" ${p === (item.pasta || activeFolder) ? 'selected' : ''}>${escapeHtml(p)}</option>`
    ).join('');
  }

  document.getElementById('editModalTipoMapa').value = item.tipo || 'Natal';
  document.getElementById('editModalCodigo').value = item.codigo || '';
  document.getElementById('editModalNome').value = item.nome || '';
  document.getElementById('editModalData').value = item.dataNascimento || '';
  document.getElementById('editModalHora').value = item.horaNascimento || '';
  document.getElementById('editModalCidadeInput').value = item.cidade || '';
  document.getElementById('editModalWhatsapp').value = item.whatsapp || '';
  document.getElementById('editModalEmail').value = item.email || '';

  editSelectedCityGeo = {
    lat: parseFloat(item.latitude) || -23.5505,
    lon: parseFloat(item.longitude) || -46.6333,
    name: item.cidade || 'São Paulo, SP'
  };

  document.getElementById('editCityResultsList').style.display = 'none';
  document.getElementById('modalEditOverlay').style.display = 'flex';
}

function fecharModalEdicao() {
  document.getElementById('modalEditOverlay').style.display = 'none';
}

async function salvarEdicaoMapaModal() {
  const idMapa = document.getElementById('editModalId').value;
  const pastaVal = document.getElementById('editModalPasta') ? document.getElementById('editModalPasta').value : activeFolder;
  const tipo = document.getElementById('editModalTipoMapa').value;
  const codDigitado = document.getElementById('editModalCodigo').value.trim();
  const nome = document.getElementById('editModalNome').value.trim();
  const dataStr = normalizarDataNascimento(document.getElementById('editModalData').value);
  const horaStr = normalizarHoraNascimento(document.getElementById('editModalHora').value);

  const whatsappVal = document.getElementById('editModalWhatsapp') ? document.getElementById('editModalWhatsapp').value.trim() : null;
  const emailVal = document.getElementById('editModalEmail') ? document.getElementById('editModalEmail').value.trim() : null;

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr) { alert("Data inválida. Use o formato DD/MM/AAAA (ex.: 11/06/1999)."); return; }
  if (horaStr === null) { alert("Horário inválido. Use o formato HH:MM (ex.: 18:28), de 00:00 a 23:59."); return; }

  let lat = editSelectedCityGeo ? editSelectedCityGeo.lat : -23.5505;
  let lon = editSelectedCityGeo ? editSelectedCityGeo.lon : -46.6333;

  try {
    const { error } = await supabaseClient
      .from('mapas')
      .update({
        pasta: pastaVal,
        tipo: tipo,
        codigo: codDigitado !== "" ? codDigitado : null,
        nome: nome,
        data_nascimento: dataStr,
        hora_nascimento: horaStr,
        cidade: editSelectedCityGeo ? editSelectedCityGeo.name : document.getElementById('editModalCidadeInput').value,
        latitude: lat,
        longitude: lon,
        whatsapp: whatsappVal || null,
        email: emailVal || null
      })
      .eq('id', idMapa);

    if (!error) {
      fecharModalEdicao();
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao atualizar: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão.");
  }
}

function abrirModalImportacaoTexto() {
  document.getElementById('importTextArea').value = "";
  document.getElementById('modalImportOverlay').style.display = "flex";
}

function fecharModalImportacaoTexto() {
  document.getElementById('modalImportOverlay').style.display = "none";
}

async function processarImportacaoTextoEmMassa() {
  const rawText = document.getElementById('importTextArea').value.trim();
  if (!rawText) { alert("Cole o texto com a lista de clientes."); return; }

  const linhas = rawText.split('\n');
  const registros = [];

  linhas.forEach(linha => {
    let l = linha.trim();
    if (!l) return;

    let partes = l.split(/[,;\t]/);
    let nomeBruto = partes[0] ? partes[0].trim() : "Sem Nome";
    let codigo = null;
    let nome = nomeBruto;

    let matchCod = nomeBruto.match(/^(\d+)\s*[-_]?\s*(.+)$/);
    if (matchCod) {
      codigo = matchCod[1];
      nome = matchCod[2].trim();
    }

    let dataStr = partes[1] ? partes[1].trim() : "01/01/2000";
    let horaStr = partes[2] ? partes[2].trim() : "";
    let cidadeStr = partes[3] ? partes[3].trim() : "Brasil";

    registros.push({
      pasta: activeFolder,
      tipo: 'Natal',
      codigo: codigo,
      nome: nome,
      data_nascimento: dataStr,
      hora_nascimento: horaStr,
      cidade: cidadeStr,
      latitude: -23.5505,
      longitude: -46.6333
    });
  });

  if (registros.length === 0) { alert("Nenhum registro legível encontrado."); return; }

  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const registrosComUser = registros.map(r => ({ ...r, user_id: userId }));

    const { error } = await supabaseClient.from('mapas').insert(registrosComUser);
    if (!error) {
      alert(`Sucesso! ${registros.length} clientes importados para a pasta "${activeFolder}".`);
      fecharModalImportacaoTexto();
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao salvar importação: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

async function deletarRegistroUnico(event, idMapa) {
  event.stopPropagation();
  if (!await astroConfirm("Deseja realmente apagar este mapa?")) return;

  try {
    const { error } = await supabaseClient.from('mapas').delete().eq('id', idMapa);
    if (!error) {
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao deletar registro.");
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

/* SALVAR MAPA DA BARRA SUPERIOR (COM OPÇÃO DE CRIAR PASTA DIRETAMENTE) */
function salvarMapaNaPlanilha() {
  if (!customFolders || customFolders.length === 0) {
    customFolders = ["Clientes"];
  }

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const nomePadrao = (currentSubjectName && currentSubjectName !== "") ? currentSubjectName : "Céu do Momento";

  renderizarModalSalvamentoComOpcaoPasta(nomePadrao, dia, mes, ano, hora, min);
}

function renderizarModalSalvamentoComOpcaoPasta(nomePadrao, dia, mes, ano, hora, min) {
  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  let optionsPastas = '';
  pastasOrdenadas.forEach(p => {
    optionsPastas += `<option value="${escapeHtml(p)}" ${p === activeFolder ? 'selected' : ''}>${escapeHtml(p)}</option>`;
  });

  let modal = document.getElementById('modalSaveCurrentMap');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalSaveCurrentMap';
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999;";
    document.body.appendChild(modal);
  }

    modal.innerHTML = `
    <div style="background: #fffdf5; width: 90%; max-width: 420px; border-radius: 12px; border: 2px solid #c59b27; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2d9c2; padding-bottom: 8px;">
        <h3 style="margin:0; font-size: 16px; font-weight: 800; color: #103b70; font-family: 'Cinzel', serif;">Salvar Mapa Atual</h3>
        <button onclick="document.getElementById('modalSaveCurrentMap').style.display='none'" style="background: none; border: none; font-size: 20px; color: #c59b27; cursor: pointer; font-weight: bold;">&times;</button>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <label style="font-size: 11px; font-weight: 700; color: #103b70;">Salvar na Pasta</label>
          <span onclick="criarPastaDiretoNoModalSalvamento()" style="font-size: 11px; font-weight: 700; color: #c59b27; cursor: pointer; text-decoration: underline;">+ Criar Nova Pasta</span>
        </div>
        <select id="saveMapFolderSelect" class="modal-select" style="width: 100%; padding: 8px 10px; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; background: #ffffff; color: #103b70;">${optionsPastas}</select>
      </div>

      <div>
        <label style="font-size: 11px; font-weight: 700; color: #103b70; display: block; margin-bottom: 4px;">Tipo de Mapa</label>
        <select id="saveMapTipoSelect" class="modal-select" style="width: 100%; padding: 8px 10px; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; background: #ffffff; color: #103b70;">
          <option value="Trânsito" selected>Trânsito</option>
          <option value="Pergunta">Pergunta</option>
          <option value="Evento">Evento</option>
          <option value="Eleição">Eleição</option>
          <option value="Natal">Natal</option>
          <option value="Revolução Solar">Revolução Solar</option>
        </select>
      </div>

      <div>
        <label style="font-size: 11px; font-weight: 700; color: #103b70; display: block; margin-bottom: 4px;">Nome Completo / Título da Pergunta</label>
        <input type="text" id="saveMapNameInput" class="modal-input" value="${escapeHtml(nomePadrao)}" style="width: 100%; padding: 8px 10px; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; background: #ffffff; color: #103b70; box-sizing: border-box;">
      </div>

      <div style="display: flex; gap: 8px;">
        <div style="flex: 1;">
          <label style="font-size: 11px; font-weight: 700; color: #103b70; display: block; margin-bottom: 4px;">Data</label>
          <input type="text" id="saveMapDataInput" class="modal-input" value="${dia}/${mes}/${ano}" style="width: 100%; padding: 8px 10px; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; background: #ffffff; color: #103b70; box-sizing: border-box;">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 11px; font-weight: 700; color: #103b70; display: block; margin-bottom: 4px;">Horário</label>
          <input type="text" id="saveMapHoraInput" class="modal-input" value="${hora}:${min}" style="width: 100%; padding: 8px 10px; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; background: #ffffff; color: #103b70; box-sizing: border-box;">
        </div>
      </div>

      <div>
        <label style="font-size: 11px; font-weight: 700; color: #103b70; display: block; margin-bottom: 4px;">Local</label>
        <input type="text" id="saveMapCidadeInput" class="modal-input" value="${escapeHtml(currentGeo.city)}" style="width: 100%; padding: 8px 10px; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; background: #ffffff; color: #103b70; box-sizing: border-box;">
      </div>

      <div class="modal-actions" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;">
        <button type="button" class="btn-secondary" onclick="document.getElementById('modalSaveCurrentMap').style.display='none'" style="padding: 8px 16px; background: #ffffff; color: #103b70; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Cancelar</button>
        <button type="button" class="btn-primary" onclick="executarSalvarMapaAtual()" style="padding: 8px 16px; background: #103b70; color: #fffdf5; border: 1px solid #c59b27; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Salvar Registro</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

async function criarPastaDiretoNoModalSalvamento() {
  const nome = await astroPrompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();

  if (!customFolders.includes(limpo)) {
    try {
      let userId = null;
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;

      const { error } = await supabaseClient.from('pastas').insert([{ nome: limpo, user_id: userId }]);
      if (!error) {
        customFolders.push(limpo);
        activeFolder = limpo;
        
        const ano = currentMoment.getFullYear();
        const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
        const dia = String(currentMoment.getDate()).padStart(2, '0');
        const hora = String(currentMoment.getHours()).padStart(2, '0');
        const min = String(currentMoment.getMinutes()).padStart(2, '0');
        const nomeAtual = document.getElementById('saveMapNameInput')?.value || "Céu do Momento";
        
        renderizarModalSalvamentoComOpcaoPasta(nomeAtual, dia, mes, ano, hora, min);
      } else {
        alert("Erro ao criar pasta: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  } else {
    alert("Essa pasta já existe.");
  }
}

async function executarSalvarMapaAtual() {
  const pastaAlvo = document.getElementById('saveMapFolderSelect').value;
  const tipo = document.getElementById('saveMapTipoSelect').value;
  const nome = document.getElementById('saveMapNameInput').value.trim();
  const dataStr = document.getElementById('saveMapDataInput').value.trim();
  const horaStr = document.getElementById('saveMapHoraInput').value.trim();
  const cidStr = document.getElementById('saveMapCidadeInput').value.trim();

  if (!nome) { alert("Informe o nome do mapa."); return; }

  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const { error } = await supabaseClient
      .from('mapas')
      .insert([{
        pasta: pastaAlvo,
        tipo: tipo,
        codigo: currentCustomCode || null,
        nome: nome,
        data_nascimento: dataStr,
        hora_nascimento: horaStr,
        cidade: cidStr,
        latitude: currentGeo.lat,
        longitude: currentGeo.lon,
        user_id: userId
      }]);

    if (!error) {
      alert(`Mapa "${nome}" salvo como [${tipo}] com sucesso na pasta "${pastaAlvo}"!`);
      document.getElementById('modalSaveCurrentMap').style.display = 'none';
    } else {
      alert("Erro ao salvar no banco: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar o mapa.");
  }
}

/* FUNÇÃO EXCLUSIVA PARA SALVAR MAPA GERADO PELA REVOLUÇÃO SOLAR */
async function salvarRevolucaoSolarNoBanco(pastaAlvo, dadosRS) {
  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const { error } = await supabaseClient
      .from('mapas')
      .insert([{
        pasta: pastaAlvo || activeFolder,
        tipo: 'Revolução Solar',
        codigo: dadosRS.codigo || null,
        nome: `${dadosRS.nome} - RS ${dadosRS.anoRS}`,
        data_nascimento: dadosRS.dataRS,
        hora_nascimento: dadosRS.horaRS,
        cidade: dadosRS.cidade,
        latitude: dadosRS.lat,
        longitude: dadosRS.lon,
        user_id: userId
      }]);

    if (!error) {
      alert(`Revolução Solar de ${dadosRS.anoRS} salva com sucesso na pasta "${pastaAlvo || activeFolder}"!`);
    } else {
      alert("Erro ao salvar Revolução Solar: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar Revolução Solar.");
  }
}
