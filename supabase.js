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

/* NÍVEL 1: MENU PRINCIPAL LIMPO (COM RODAPÉ DE CONFIGURAÇÕES) */
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
      <img src="astrohellenic.svg" alt="AstroHellenic" style="max-height: 20px; width: auto;">
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
        <button onclick="abrirNavegacaoConfiguracoes()" title="Configurações" style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--gold-primary); cursor: pointer;">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="32" cy="32" r="16"/>
            <circle cx="32" cy="32" r="6"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(45 32 32)"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(90 32 32)"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(135 32 32)"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(180 32 32)"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(225 32 32)"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(270 32 32)"/>
            <rect x="28" y="6" width="8" height="8" rx="2" fill="currentColor" stroke="none" transform="rotate(315 32 32)"/>
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

/* NÍVEL 2D: TELA PRINCIPAL DE CONFIGURAÇÕES (SUB-MENU) */
function abrirNavegacaoConfiguracoes() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="renderMenuPrincipal()" title="Voltar ao menu" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i> Voltar
      </button>
      <span style="font-size: 12px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">CONFIGURAÇÕES</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; background: var(--bg-sidebar); padding: 8px 0;">
      
      <!-- OPÇÃO: CAPTAÇÃO DE CLIENTES -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.15s ease;" onclick="abrirConfiguracoesCaptacao()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M2,9 L9,9 L16,3 V21 L9,15 L2,15 Z"/><path d="M3,15 V19 H6 V15"/><path d="M19,8 Q22.5,12 19,16"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">Captação de Clientes</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
      </div>

      <!-- OPÇÃO: SEGURANÇA E CONTA -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.15s ease;" onclick="abrirConfiguracoesSeguranca()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M12,2 L4,5 V11 C4,16 8,19.5 12,21 C16,19.5 20,16 20,11 V5 Z"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">Segurança e Conta</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
      </div>

      <!-- OPÇÃO: APARÊNCIA -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.15s ease;" onclick="abrirConfiguracoesAparencia()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M12,3 C6.5,3 2,7 2,12 C2,16 5,19 8.5,19 C10,19 10.3,17.7 9.6,16.8 C8.8,15.8 9.5,14.3 11,14.3 H14.5 C18.6,14.3 22,11.4 22,8.5 C22,5.4 17.5,3 12,3 Z"/><circle cx="7" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="17" cy="9" r="1.3" fill="currentColor" stroke="none"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">Aparência</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
      </div>

      <!-- OPÇÃO: RELATÓRIOS -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.15s ease;" onclick="abrirConfiguracoesRelatorio()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M14,4 H40 L50,14 V60 H14 Z" stroke-linejoin="round"/><path d="M40,4 V14 H50" stroke-linejoin="round"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">Relatórios</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
      </div>

      <!-- OPÇÃO: AGENDA -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.15s ease;" onclick="abrirConfiguracoesAgenda()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><rect x="8" y="12" width="48" height="44" rx="4"/><line x1="8" y1="24" x2="56" y2="24"/><line x1="20" y1="6" x2="20" y2="18"/><line x1="44" y1="6" x2="44" y2="18"/></svg>
          <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">Agenda</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
      </div>

    </div>
  `;
}

/* SUB-TELA: APARÊNCIA (TEMA DA MANDALA) */
function abrirConfiguracoesAparencia() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const temaAtual = window.temaMandala || 'claro';
  const estiloPlanetasAtual = window.estiloPlanetas || 'simples';
  let modoCorAtual = 'auto';
  try { modoCorAtual = localStorage.getItem('astro_modo_cor') || 'auto'; } catch (e) {}
  const ordemBotoesAtual = completarOrdemBotoesTopo(window.ordemBotoesTopo);
  const opcaoStyle = (ativa) => `display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; margin-bottom: 10px; border: 2px solid ${ativa ? 'var(--primary-blue)' : 'var(--border-color)'}; border-radius: 8px; background: var(--bg-card); cursor: pointer;`;
  const botaoSetaStyle = (desabilitado) => `width: 28px; height: 28px; border: 1px solid var(--gold-primary); border-radius: 6px; background: ${desabilitado ? 'var(--bg-disabled)' : 'var(--bg-card)'}; color: ${desabilitado ? 'var(--text-disabled)' : 'var(--primary-blue)'}; cursor: ${desabilitado ? 'default' : 'pointer'}; display: flex; align-items: center; justify-content: center;`;

  const htmlOrdemBotoes = ordemBotoesAtual.map((chave, idx) => {
    const primeiro = idx === 0;
    const ultimo = idx === ordemBotoesAtual.length - 1;
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; margin-bottom: 6px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card);">
        <span style="font-size: 12px; font-weight: 600; color: var(--primary-blue);">${escapeHtml(ROTULOS_BOTOES_TOPO[chave] || chave)}</span>
        <div style="display: flex; gap: 6px;">
          <button onclick="moverBotaoTopo('${chave}', -1)" ${primeiro ? 'disabled' : ''} title="Mover para cima" style="${botaoSetaStyle(primeiro)}"><i class="fa-solid fa-chevron-up"></i></button>
          <button onclick="moverBotaoTopo('${chave}', 1)" ${ultimo ? 'disabled' : ''} title="Mover para baixo" style="${botaoSetaStyle(ultimo)}"><i class="fa-solid fa-chevron-down"></i></button>
        </div>
      </div>
    `;
  }).join('');

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">APARÊNCIA</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--bg-sidebar);">

      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">
        Escolha entre tela clara e escura. É uma preferência <strong>deste navegador/aparelho</strong> —
        não fica salva na sua conta, porque cada aparelho pode ter uma preferência diferente.
        Ainda só o menu lateral (este que você está vendo agora) muda de verdade; as demais telas
        seguem sendo ajustadas aos poucos.
      </div>

      <div onclick="salvarModoCor('claro')" style="${opcaoStyle(modoCorAtual === 'claro')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-sun" style="color: var(--gold-primary);"></i>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Claro</div>
            <div style="font-size: 11px; color: var(--text-muted);">Sempre com fundo claro, não importa o aparelho</div>
          </div>
        </div>
        ${modoCorAtual === 'claro' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div onclick="salvarModoCor('escuro')" style="${opcaoStyle(modoCorAtual === 'escuro')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-moon" style="color: var(--gold-primary);"></i>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Escuro</div>
            <div style="font-size: 11px; color: var(--text-muted);">Sempre com fundo escuro, não importa o aparelho</div>
          </div>
        </div>
        ${modoCorAtual === 'escuro' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div onclick="salvarModoCor('auto')" style="${opcaoStyle(modoCorAtual === 'auto')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-circle-half-stroke" style="color: var(--gold-primary);"></i>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Automático</div>
            <div style="font-size: 11px; color: var(--text-muted);">Acompanha o tema claro/escuro configurado neste aparelho</div>
          </div>
        </div>
        ${modoCorAtual === 'auto' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div style="font-size: 11px; color: var(--text-muted); margin: 20px 0 16px; line-height: 1.4; border-top: 1px solid var(--border-color); padding-top: 16px;">
        Escolha como a mandala é exibida. Essa preferência fica salva na sua conta.
      </div>

      <div onclick="salvarTemaMandala('claro')" style="${opcaoStyle(temaAtual === 'claro')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-sun" style="color: var(--gold-primary);"></i>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Tema Claro</div>
            <div style="font-size: 11px; color: var(--text-muted);">Fundo branco, sem céu nem espaço sideral</div>
          </div>
        </div>
        ${temaAtual === 'claro' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div onclick="salvarTemaMandala('ceu')" style="${opcaoStyle(temaAtual === 'ceu')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-star" style="color: var(--gold-primary);"></i>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Tema Céu</div>
            <div style="font-size: 11px; color: var(--text-muted);">Céu diurno/noturno e espaço sideral ao redor da mandala</div>
          </div>
        </div>
        ${temaAtual === 'ceu' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div style="font-size: 11px; color: var(--text-muted); margin: 20px 0 16px; line-height: 1.4;">
        Escolha como os 7 planetas clássicos aparecem em toda a ferramenta (mandala, horas planetárias, tabela técnica, decênios, profecção e direções).
      </div>

      <div onclick="salvarEstiloPlanetas('simples')" style="${opcaoStyle(estiloPlanetasAtual === 'simples')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px; color: var(--gold-primary); width: 20px; text-align: center;">☉</span>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Planetas Ícones Simples</div>
            <div style="font-size: 11px; color: var(--text-muted);">Glifos planetários, iguais aos usados nos termos egípcios</div>
          </div>
        </div>
        ${estiloPlanetasAtual === 'simples' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div onclick="salvarEstiloPlanetas('esferico')" style="${opcaoStyle(estiloPlanetasAtual === 'esferico')}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-circle-dot" style="color: var(--gold-primary);"></i>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">Planetas Ícones Esféricos</div>
            <div style="font-size: 11px; color: var(--text-muted);">Ilustrações 3D com gradiente para cada planeta</div>
          </div>
        </div>
        ${estiloPlanetasAtual === 'esferico' ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-blue);"></i>' : ''}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0 8px;">
        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">
          Escolha a ordem dos botões de ferramenta na barra superior. Use as setas ▲▼ pra mover cada um.
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        ${htmlOrdemBotoes}
      </div>
      <button onclick="salvarOrdemBotoesTopo(ORDEM_BOTOES_TOPO_PADRAO)" style="width: 100%; background: var(--bg-card); color: var(--primary-blue); border: 1px solid var(--gold-primary); padding: 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
        Restaurar ordem padrão
      </button>

    </div>
  `;
}

/* SUB-TELA: RELATÓRIOS (PERFIL DO ASTRÓLOGO NOS RELATÓRIOS + MODELOS/PRESETS) */
async function abrirConfiguracoesRelatorio() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">RELATÓRIOS</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--bg-sidebar);">

      <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em;">Seu Perfil nos Relatórios</div>
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.4;">
        Logo e dados de contato que aparecem nos relatórios gerados — podem ser diferentes do logo usado na Captação de Clientes.
      </div>

      <div id="relCfgLogoPreviewContainer" style="margin-bottom: 8px; text-align: center; display: none;">
        <img id="relCfgLogoPreview" src="" alt="Preview Logo" style="max-height: 60px; max-width: 100%; border: 1px solid var(--gold-primary); border-radius: 8px; padding: 4px; background: var(--bg-card);">
      </div>
      <input type="file" id="relCfgLogoFile" accept="image/*" onchange="fazerUploadLogoRelatorio(this)" style="display: none;">
      <button onclick="document.getElementById('relCfgLogoFile').click()" style="width: 100%; background: var(--bg-card); color: var(--primary-blue); border: 1px dashed var(--gold-primary); padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
        <i class="fa-solid fa-upload" style="color: var(--gold-primary);"></i> <span id="relCfgBtnUploadText">Selecionar Logo do Relatório</span>
      </button>
      <input type="hidden" id="relCfgLogoUrl">

      <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Seu nome / marca</label>
      <input type="text" id="relCfgNome" class="modal-input" style="margin-bottom: 10px;" placeholder="Ex: Cassio Farias - Astrólogo">

      <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Telefone / WhatsApp</label>
      <input type="text" id="relCfgTelefone" class="modal-input" style="margin-bottom: 10px;" placeholder="Ex: 11970404508">

      <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">E-mail</label>
      <input type="email" id="relCfgEmail" class="modal-input" style="margin-bottom: 16px;" placeholder="Ex: contato@email.com">

      <button onclick="salvarPerfilRelatorio()" style="width: 100%; background: var(--primary-blue); color: var(--bg-sidebar); border: 1px solid var(--gold-primary); padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
        Salvar Perfil
      </button>

      <div style="font-size: 11px; color: var(--text-muted); margin-top: 16px; line-height: 1.4; border-top: 1px solid var(--border-color); padding-top: 14px;">
        Os modelos de relatório (quais textos e ferramentas entram, e a edição de cada um) ficam na própria tela do <strong>Relatório</strong>, junto de onde você escolhe qual usar — assim tem mais espaço de tela pra editar os textos.
      </div>

    </div>
  `;

  await carregarConfiguracoesRelatorio();
}

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

/* SALVA O MODO DE COR (CLARO/ESCURO/AUTOMÁTICO) ESCOLHIDO NA TELA
   APARÊNCIA. É preferência do NAVEGADOR/APARELHO (localStorage), não da
   conta — diferente de tema_mandala/estilo_planetas logo abaixo, que são
   por conta no Supabase. Isso é deliberado: "seguir o tema do aparelho"
   só faz sentido por aparelho, não tem como isso "valer" num aparelho
   diferente. window.aplicarModoCor vem do script inline em index.html
   (roda antes de supabase.js, pra já aplicar o tema certo sem piscar). */
function salvarModoCor(modo) {
  try { localStorage.setItem('astro_modo_cor', modo); } catch (e) {}
  if (typeof window.aplicarModoCor === 'function') window.aplicarModoCor(modo);
  abrirConfiguracoesAparencia();
}

/* CARREGA O TEMA DA MANDALA DO SUPABASE (chamado logo após o login) */
async function carregarTemaMandala(userId) {
  let tema = 'claro';
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('tema_mandala')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && data.tema_mandala) tema = data.tema_mandala;
  } catch (e) {
    console.error("Erro ao carregar tema da mandala:", e);
  }
  window.temaMandala = tema;
  document.body.classList.toggle('tema-ceu', tema === 'ceu');
  // Se a mandala já tinha sido desenhada com o tema padrão antes desse
  // carregamento terminar, refaz o desenho já com o tema certo.
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof renderMandala === 'function') {
    renderMandala();
  }
}

/* SALVA O TEMA DA MANDALA ESCOLHIDO E ATUALIZA A TELA NA HORA */
async function salvarTemaMandala(tema) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, tema_mandala: tema }, { onConflict: 'user_id' });

    if (!error) {
      window.temaMandala = tema;
      document.body.classList.toggle('tema-ceu', tema === 'ceu');
      if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof renderMandala === 'function') {
        renderMandala();
      }
      abrirConfiguracoesAparencia();
    } else {
      alert("Erro ao salvar tema: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar tema.");
  }
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
      abrirConfiguracoesAparencia();
    } else {
      alert("Erro ao salvar estilo dos planetas: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar estilo dos planetas.");
  }
}

/* REDESENHA A FERRAMENTA ATUALMENTE ABERTA (usado ao trocar o estilo dos ícones dos planetas) */
function reRenderizarModuloAtivo() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) return;
  const modulo = window.moduloTecnicoAtivo || 'mandala';
  if (typeof abrirModuloTecnica === 'function') abrirModuloTecnica(modulo);
}

/* ORDEM DOS BOTÕES DA BARRA SUPERIOR (Configurações > Aparência)
   As chaves abaixo são as mesmas do atributo data-modulo-key de cada botão
   dentro de #top-bar .top-bar-controls, em index.html. */
const ORDEM_BOTOES_TOPO_PADRAO = ['relatorio', 'tabelaTecnica', 'mandala', 'sinastria', 'direcoes', 'liberacao', 'decenios', 'profeccao', 'lotes', 'horas', 'isopsefia', 'agenda'];

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
  agenda: 'Agenda'
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
      abrirConfiguracoesAparencia();
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

/* SUB-TELA: CAPTAÇÃO DE CLIENTES COM UPLOAD DIRETO */
async function abrirConfiguracoesCaptacao() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">CAPTAÇÃO DE CLIENTES</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--bg-sidebar);">
      
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">
        Configure o formulário externo de coleta de dados dos seus clientes.
      </div>

      <!-- LOGOTIPO (UPLOAD DIRETO + PREVIEW) -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12px; font-weight: 700; color: var(--primary-blue); display: block; margin-bottom: 4px;">Logotipo do Formulário</label>
        
        <div id="logoPreviewContainer" style="margin-bottom: 8px; text-align: center; display: none;">
          <img id="cfgLogoPreview" src="" alt="Preview Logo" style="max-height: 60px; max-width: 100%; border: 1px solid var(--gold-primary); border-radius: 8px; padding: 4px; background: var(--bg-card);">
        </div>

        <input type="file" id="cfgLogoFile" accept="image/*" onchange="fazerUploadLogo(this)" style="display: none;">
        <button onclick="document.getElementById('cfgLogoFile').click()" style="width: 100%; background: var(--bg-card); color: var(--primary-blue); border: 1px dashed var(--gold-primary); padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-upload" style="color: var(--gold-primary);"></i> <span id="btnUploadText">Selecionar Imagem do Logo</span>
        </button>
        <input type="hidden" id="cfgLogoUrl">
      </div>
      
      <!-- LINK DO FORMULÁRIO PÚBLICO -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12px; font-weight: 700; color: var(--primary-blue); display: block; margin-bottom: 6px;">
          Seu Link Exclusivo do Formulário
        </label>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="cfgPublicFormUrl" readonly style="width: 100%; padding: 8px 12px; border: 1px solid var(--gold-primary); border-radius: 8px; font-size: 12px; background-color: var(--bg-card); color: var(--primary-blue);" />
          <button type="button" onclick="copiarLinkFormulario()" style="padding: 8px 16px; background-color: var(--primary-blue); color: var(--bg-sidebar); border: 1px solid var(--gold-primary); border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
            Copiar
          </button>
        </div>
      </div>

      <!-- WEBHOOK -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12px; font-weight: 700; color: var(--primary-blue); display: block; margin-bottom: 4px;">URL do Webhook (Integração)</label>
        <input type="url" id="cfgWebhookUrl" placeholder="https://hook.make.com/..." style="width: 100%; padding: 8px 10px; border: 1px solid var(--gold-primary); border-radius: 8px; font-size: 12px; background: var(--bg-card); color: var(--primary-blue); box-sizing: border-box;">
      </div>

      <!-- REDIRECIONAMENTO -->
      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; font-weight: 700; color: var(--primary-blue); display: block; margin-bottom: 4px;">Link de Redirecionamento</label>
        <input type="url" id="cfgRedirectUrl" placeholder="https://wa.me/55..." style="width: 100%; padding: 8px 10px; border: 1px solid var(--gold-primary); border-radius: 8px; font-size: 12px; background: var(--bg-card); color: var(--primary-blue); box-sizing: border-box;">
      </div>

      <!-- BOTÃO SALVAR -->
      <button onclick="salvarConfiguracoesCaptacao()" style="width: 100%; background: var(--primary-blue); color: var(--bg-sidebar); border: 1px solid var(--gold-primary); padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
        Salvar Configurações
      </button>

      <!-- SERVIÇOS OFERECIDOS -->
      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <label style="font-size: 12px; font-weight: 700; color: var(--primary-blue);">Serviços Oferecidos</label>
          <button onclick="criarServico()" style="background: var(--bg-card); border: 1px solid var(--gold-primary); color: var(--primary-blue); border-radius: 8px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">+ Serviço</button>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
          Cadastre os nomes dos serviços que você presta. Cada serviço vira também um modelo de relatório disponível em Relatório → Modelos, onde você edita o conteúdo dele.
        </div>
        <div id="servicosListContainer">
          <div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">Carregando serviços...</div>
        </div>
      </div>

    </div>
  `;

  await carregarConfiguracoesCaptacao();
  await carregarServicos();
}

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


/* SALVA AS CONFIGURAÇÕES DE CAPTAÇÃO NO SUPABASE */
async function salvarConfiguracoesCaptacao() {
  const logoUrl = document.getElementById('cfgLogoUrl').value.trim();
  const webhookUrl = document.getElementById('cfgWebhookUrl').value.trim();
  const redirectUrl = document.getElementById('cfgRedirectUrl').value.trim();

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({
        user_id: user.id,
        logo_url: logoUrl,
        webhook_url: webhookUrl,
        redirect_url: redirectUrl
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

/* ==========================================
   CADASTRO DE SERVIÇOS
   Reaproveita a MESMA tabela que o módulo de Relatório usa pra "Modelo de
   Relatório" (relatorio_presets: id, user_id, nome, blocos) — um serviço
   cadastrado aqui é, no banco, o mesmo registro que aparece como modelo
   em Relatório > Modelos. A tela do Relatório (relatorio.js) não é
   tocada por nada disso: aqui só criamos/renomeamos/apagamos pelo nome,
   e o conteúdo (blocos) continua sendo editado só lá.

   Por enquanto só o nome é pedido (sem valor/duração) — o astrólogo
   pediu pra deixar esses campos de fora nesta etapa. */

let cachedServicos = [];

/* CARREGA OS SERVIÇOS (=PRESETS DE RELATÓRIO) DO ASTRÓLOGO LOGADO E RENDERIZA A LISTA */
async function carregarServicos() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data, error } = await supabaseClient
      .from('relatorio_presets')
      .select('id, nome')
      .eq('user_id', user.id)
      .order('nome', { ascending: true });

    cachedServicos = (!error && Array.isArray(data)) ? data : [];
  } catch (e) {
    console.error("Erro ao carregar serviços:", e);
    cachedServicos = [];
  }
  renderServicosList();
}

/* RENDERIZA A LISTA DE SERVIÇOS CADASTRADOS */
function renderServicosList() {
  const container = document.getElementById('servicosListContainer');
  if (!container) return;

  if (!cachedServicos || cachedServicos.length === 0) {
    container.innerHTML = `<div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">Nenhum serviço cadastrado ainda.</div>`;
    return;
  }

  container.innerHTML = cachedServicos.map(servico => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card);">
      <span style="font-size: 12px; font-weight: 700; color: var(--primary-blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(servico.nome)}</span>
      <div style="display: flex; align-items: center; gap: 12px; margin-left: 8px;">
        <i class="fa-solid fa-pen" onclick="editarNomeServico('${servico.id}', '${escapeHtml(servico.nome).replace(/'/g, "\\'")}')" title="Renomear serviço" style="color: var(--primary-blue); cursor: pointer;"></i>
        <i class="fa-solid fa-trash" onclick="apagarServico('${servico.id}', '${escapeHtml(servico.nome).replace(/'/g, "\\'")}')" title="Apagar serviço" style="color: var(--danger); cursor: pointer;"></i>
      </div>
    </div>
  `).join('');
}

/* CRIA UM NOVO SERVIÇO — insere em relatorio_presets com os blocos padrão
   (mesma semente usada ao criar um modelo novo em Relatório > Modelos),
   pra já nascer utilizável como modelo caso o astrólogo abra o Relatório. */
async function criarServico() {
  const nome = prompt("Nome do novo serviço (ex: Mapa Natal Clássico):");
  if (!nome || !nome.trim()) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const blocosPadrao = (typeof RELATORIO_BLOCOS_PADRAO !== 'undefined') ? RELATORIO_BLOCOS_PADRAO : [];
    const { error } = await supabaseClient
      .from('relatorio_presets')
      .insert({ user_id: user.id, nome: nome.trim(), blocos: blocosPadrao });

    if (!error) {
      await carregarServicos();
    } else {
      alert("Erro ao criar serviço: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao criar serviço.");
  }
}

/* RENOMEIA UM SERVIÇO JÁ EXISTENTE (só o nome — o conteúdo do modelo
   continua sendo editado em Relatório > Modelos) */
async function editarNomeServico(id, nomeAtual) {
  const novoNome = prompt("Novo nome do serviço:", nomeAtual);
  if (!novoNome || !novoNome.trim() || novoNome.trim() === nomeAtual) return;

  try {
    const { error } = await supabaseClient
      .from('relatorio_presets')
      .update({ nome: novoNome.trim(), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await carregarServicos();
    } else {
      alert("Erro ao renomear serviço: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao renomear serviço.");
  }
}

/* APAGA UM SERVIÇO (COM CONFIRMAÇÃO) — remove a linha de relatorio_presets,
   então some também da lista de modelos em Relatório */
async function apagarServico(id, nome) {
  if (!confirm(`Tem certeza que deseja apagar o serviço "${nome}"?\n\nIsso também vai apagar o modelo de relatório vinculado a ele (o mesmo usado em Relatório → Modelos). Essa ação não pode ser desfeita.`)) return;

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

/* ==========================================
   SUB-TELA: AGENDA (disponibilidade + pastas visíveis)
   Fica em Configurações, separado da ferramenta Agenda em si
   (agendamento.js), que mostra só o formulário de novo agendamento e a
   lista dos já marcados — essas duas coisas aqui são "configura uma vez
   e não mexe mais", então não poluem a tela de uso do dia a dia.
   AGENDA_DIAS_SEMANA e as caches (agendaDisponibilidadeCache etc.) vêm
   de agendamento.js, já carregado na mesma página.
   ========================================== */
async function abrirConfiguracoesAgenda() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">AGENDA</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--bg-sidebar);">
      <div id="cfgAgendaConteudo" style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">Carregando...</div>
    </div>
  `;

  await carregarConfiguracoesAgenda();
}

/* CARREGA DISPONIBILIDADE + PASTAS VISÍVEIS E RENDERIZA OS DOIS CARDS */
async function carregarConfiguracoesAgenda() {
  const container = document.getElementById('cfgAgendaConteudo');
  if (!container) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { container.innerHTML = `<div>Sessão não identificada.</div>`; return; }

    const [dispRes, configRes] = await Promise.all([
      supabaseClient.from('agenda_disponibilidade').select('*').eq('user_id', user.id).order('dia_semana', { ascending: true }),
      supabaseClient.from('configuracoes').select('agenda_duracao_padrao_minutos, agenda_intervalo_minutos, agenda_pastas_visiveis').eq('user_id', user.id).maybeSingle()
    ]);

    if (dispRes.error) {
      container.innerHTML = `
        <div style="text-align: center; padding: 16px 0;">
          As tabelas de agenda ainda não existem no Supabase deste projeto. Rode o SQL de configuração (ver agendamento.js) e recarregue a página.
        </div>
      `;
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
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
          <input type="checkbox" id="agDia${idx}" ${regra ? 'checked' : ''} onchange="document.getElementById('agHoraBloco${idx}').style.display = this.checked ? 'flex' : 'none';" style="flex-shrink: 0;">
          <label for="agDia${idx}" style="font-size: 11px; font-weight: 600; color: var(--primary-blue); width: 58px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nomeDia}</label>
          <div id="agHoraBloco${idx}" style="display: ${regra ? 'flex' : 'none'}; gap: 3px; align-items: center; min-width: 0;">
            <input type="time" id="agInicio${idx}" class="modal-input" style="width: 78px; padding: 6px 4px; font-size: 12px;" value="${regra ? regra.hora_inicio.slice(0, 5) : '09:00'}">
            <span style="font-size: 10px; color: var(--text-muted); flex-shrink: 0;">até</span>
            <input type="time" id="agFim${idx}" class="modal-input" style="width: 78px; padding: 6px 4px; font-size: 12px;" value="${regra ? regra.hora_fim.slice(0, 5) : '18:00'}">
          </div>
        </div>
      `;
    }).join('');

    const pastasParaExibir = (typeof customFolders !== 'undefined' && Array.isArray(customFolders)) ? customFolders : [];
    const blocoPastas = pastasParaExibir.length
      ? pastasParaExibir.map(pasta => {
          const marcada = !pastasVisiveis || pastasVisiveis.includes(pasta);
          return `
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; color: var(--primary-blue); cursor: pointer;">
              <input type="checkbox" class="agPastaCheckbox" value="${escapeHtml(pasta)}" ${marcada ? 'checked' : ''}>
              ${escapeHtml(pasta)}
            </label>
          `;
        }).join('')
      : '<div style="font-size: 11px; color: var(--text-muted);">Nenhuma pasta encontrada.</div>';

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px;">Sua Disponibilidade</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.4;">
          Marque os dias que você atende e o horário de cada um. Usado pra calcular os horários livres na ferramenta Agenda.
        </div>

        ${blocoDias}

        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <div style="flex: 1;">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Duração de cada atendimento (min)</label>
            <input type="number" id="agDuracaoPadrao" class="modal-input" min="5" step="5" value="${duracaoPadrao}">
          </div>
          <div style="flex: 1;">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Intervalo entre atendimentos (min)</label>
            <input type="number" id="agIntervaloPadrao" class="modal-input" min="0" step="5" value="${intervaloPadrao}">
          </div>
        </div>

        <button onclick="salvarDisponibilidadeAgenda()" style="width: 100%; margin-top: 14px; background: var(--primary-blue); color: var(--bg-sidebar); border: 1px solid var(--gold-primary); padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Salvar Disponibilidade
        </button>
      </div>

      <div style="padding-top: 16px; border-top: 1px solid var(--border-color);">
        <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px;">Pastas Visíveis no Agendamento</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
          Marque só as pastas que têm clientes de verdade — desmarque as que usa pra teste, perguntas etc. Sem marcar nada, mostra clientes de todas as pastas.
        </div>
        ${blocoPastas}
        <button onclick="salvarPastasVisiveisAgenda()" style="width: 100%; margin-top: 8px; background: var(--primary-blue); color: var(--bg-sidebar); border: 1px solid var(--gold-primary); padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Salvar Pastas Visíveis
        </button>
      </div>
    `;
  } catch (e) {
    console.error('Erro ao carregar configurações de agenda:', e);
    container.innerHTML = `<div>Erro de conexão ao carregar.</div>`;
  }
}

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

/* SUB-TELA: SEGURANÇA E CONTA */
async function abrirConfiguracoesSeguranca() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let userEmail = "Carregando...";
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user && user.email) {
      userEmail = user.email;
    } else {
      userEmail = "Usuário Desconectado";
    }
  } catch (e) {
    userEmail = "Sessão não identificada";
  }

  const manterLogado = localStorage.getItem('astro_keep_logged') === 'true';

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: var(--bg-sidebar); border-bottom: 2px solid var(--gold-primary);">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
        <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 800; color: var(--primary-blue); font-family: 'Cinzel', serif; letter-spacing: 0.5px;">SEGURANÇA E CONTA</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--bg-sidebar);">
      
      <!-- USUÁRIO CONECTADO -->
      <div style="margin-bottom: 20px; background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid var(--gold-primary);">
        <div style="font-size: 11px; font-weight: 700; color: var(--gold-primary); text-transform: uppercase; margin-bottom: 4px;">Conta Conectada</div>
        <div style="font-size: 13px; font-weight: 600; color: var(--primary-blue); word-break: break-all;">${escapeHtml(userEmail)}</div>
      </div>

      <!-- OPÇÃO MANTER LOGADO -->
      <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);">Manter-se logado</span>
        <input type="checkbox" id="keepLoggedToggle" ${manterLogado ? 'checked' : ''} onchange="alternarManterLogado(this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-blue);">
      </div>

      <!-- ALTERAR SENHA -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--primary-blue); margin-bottom: 8px;">Alterar Senha</div>
        <input type="password" id="cfgNewPassword" placeholder="Nova senha" style="width: 100%; padding: 8px 10px; border: 1px solid var(--gold-primary); border-radius: 8px; font-size: 13px; margin-bottom: 8px; box-sizing: border-box; background: var(--bg-card); color: var(--primary-blue);">
        <button onclick="trocarSenhaUsuario()" style="width: 100%; background: var(--primary-blue); color: var(--bg-sidebar); border: 1px solid var(--gold-primary); padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Atualizar Senha
        </button>
      </div>

      <!-- LOGOUT (SAIR) -->
      <button onclick="fazerLogout()" style="width: 100%; background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger-border); padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <i class="fa-solid fa-right-from-bracket"></i> Sair da Conta
      </button>

    </div>
  `;
}

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

/* Abrir módulo técnicas */
function abrirModuloTecnica(modulo) {
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
  if (cRadix) {
    cRadix.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37;"></i>
      </div>
    `;
  }

  document.body.classList.toggle('modo-mandala', modulo === 'mandala' || modulo === 'radix');

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
if (modulo === 'mandala' || modulo === 'radix') {
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

  if (confirm(`Deseja realmente apagar os ${selectedMapIds.size} mapas selecionados?`)) {
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
  const nome = prompt("Nome da nova pasta:");
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
  const novoNome = prompt(`Novo nome para a pasta "${pastaAntiga}":`, pastaAntiga);
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

  if (confirm(`Deseja remover a pasta "${pastaParaDeletar}" e todos os mapas gravados nela?`)) {
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
  const dataStr = document.getElementById('editModalData').value.trim();
  const horaStr = document.getElementById('editModalHora').value.trim();

  const whatsappVal = document.getElementById('editModalWhatsapp') ? document.getElementById('editModalWhatsapp').value.trim() : null;
  const emailVal = document.getElementById('editModalEmail') ? document.getElementById('editModalEmail').value.trim() : null;

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr || !dataStr.includes('/')) { alert("Informe a data no formato DD/MM/AAAA."); return; }

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
  if (!confirm("Deseja realmente apagar este mapa?")) return;

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
  const nome = prompt("Nome da nova pasta:");
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

/* COPIA O LINK DO FORMULÁRIO PARA A ÁREA DE TRANSFERÊNCIA */
function copiarLinkFormulario() {
  const input = document.getElementById('cfgPublicFormUrl');
  if (!input || !input.value) return;
  
  navigator.clipboard.writeText(input.value).then(() => {
    alert('Link copiado com sucesso!');
  }).catch(() => {
    input.select();
    document.execCommand('copy');
    alert('Link copiado com sucesso!');
  });
}
