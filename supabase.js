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

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h1 class="sidebar-title">Astro Hellenic</h1>
    </div>
    <div style="flex: 1; overflow-y: auto;">
      <ul class="menu-list">
        <li class="menu-item active" id="menu-here-now" onclick="carregarCeuDoMomento(); fecharSidebar();">
          <span>Agora</span>
          <i class="fa-solid fa-clock"></i>
        </li>
        <li class="menu-item" onclick="abrirModalNovoMapa(); fecharSidebar();">
          <span>Novo Mapa</span>
          <i class="fa-solid fa-user-plus"></i>
        </li>
        <li class="menu-item" onclick="abrirNavegacaoPastas()" style="border-top: 1px solid var(--border-color); margin-top: 4px;">
          <span>Selecionar Mapa</span>
          <i class="fa-solid fa-chevron-right"></i>
        </li>
        <li class="menu-item" onclick="abrirNavegacaoTecnicasTempo()">
          <span>Técnicas de Tempo</span>
          <i class="fa-solid fa-chevron-right"></i>
        </li>
        <li class="menu-item" onclick="abrirNavegacaoFerramentasAuxiliares()">
          <span>Ferramentas Auxiliares</span>
          <i class="fa-solid fa-chevron-right"></i>
        </li>
      </ul>
    </div>
    
    <!-- RODAPÉ FIXO: CONFIGURAÇÕES -->
    <div style="padding: 16px; border-top: 2px solid var(--border-color); background: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="abrirNavegacaoConfiguracoes()">
      <span style="font-size: 14px; font-weight: 700; color: #1e293b;">Configurações</span>
      <i class="fa-solid fa-gear" style="font-size: 16px; color: #64748b;"></i>
    </div>
  `;
}

/* NÍVEL 2A: TELA DE TÉCNICAS DE TEMPO */
function abrirNavegacaoTecnicasTempo() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="renderMenuPrincipal()" title="Voltar ao menu">
        <i class="fa-solid fa-chevron-left"></i> Voltar
      </button>
      <span style="font-size: 12px; font-weight: 700; color: var(--primary-blue);">TÉCNICAS DE TEMPO</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('revolucao'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-sun" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Revolução Solar</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('decenios'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-hourglass-half" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Decênios</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('liberacao'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-dharmachakra" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Liberação Zodiacal</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('direcoes'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-compass" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Direções Primárias</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>
    </div>
  `;
}

/* NÍVEL 2B: TELA DE FERRAMENTAS AUXILIARES */
function abrirNavegacaoFerramentasAuxiliares() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="renderMenuPrincipal()" title="Voltar ao menu">
        <i class="fa-solid fa-chevron-left"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">FERRAMENTAS AUXILIARES</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloAuxiliar('katarche'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-circle-question" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Katarche (Perguntas)</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloAuxiliar('horas'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-business-time" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Horas Planetárias</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloAuxiliar('isopsefia'); fecharSidebar();">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-calculator" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Isopsefia</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>
    </div>
  `;
}

/* NÍVEL 2D: TELA PRINCIPAL DE CONFIGURAÇÕES (SUB-MENU) */
function abrirNavegacaoConfiguracoes() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="renderMenuPrincipal()" title="Voltar ao menu">
        <i class="fa-solid fa-chevron-left"></i> Voltar
      </button>
      <span style="font-size: 12px; font-weight: 700; color: var(--primary-blue);">CONFIGURAÇÕES</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto;">
      
      <!-- OPÇÃO: CAPTAÇÃO DE CLIENTES -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirConfiguracoesCaptacao()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-bullhorn" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Captação de Clientes</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <!-- OPÇÃO: SEGURANÇA E CONTA -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirConfiguracoesSeguranca()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-shield-halved" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Segurança e Conta</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

    </div>
  `;
}

/* SUB-TELA: CAPTAÇÃO DE CLIENTES COM UPLOAD DIRETO */
async function abrirConfiguracoesCaptacao() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar">
        <i class="fa-solid fa-chevron-left"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">CAPTAÇÃO DE CLIENTES</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px;">
      
      <div style="font-size: 11px; color: #64748b; margin-bottom: 16px; line-height: 1.4;">
        Configure o formulário externo de coleta de dados dos seus clientes.
      </div>

      <!-- LOGOTIPO (UPLOAD DIRETO + PREVIEW) -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">Logotipo do Formulário</label>
        
        <div id="logoPreviewContainer" style="margin-bottom: 8px; text-align: center; display: none;">
          <img id="cfgLogoPreview" src="" alt="Preview Logo" style="max-height: 60px; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px;">
        </div>

        <input type="file" id="cfgLogoFile" accept="image/*" onchange="fazerUploadLogo(this)" style="display: none;">
        <button onclick="document.getElementById('cfgLogoFile').click()" style="width: 100%; background: #f1f5f9; color: #334155; border: 1px dashed #cbd5e1; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-upload"></i> <span id="btnUploadText">Selecionar Imagem do Logo</span>
        </button>
        <input type="hidden" id="cfgLogoUrl">
      </div>
      
      <!-- LINK DO FORMULÁRIO PÚBLICO -->
<div style="margin-bottom: 16px;">
  <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
    Seu Link Exclusivo do Formulário
  </label>
  <div style="display: flex; gap: 8px;">
    <input type="text" id="cfgPublicFormUrl" readonly style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; background-color: #f8fafc; color: #475569;" />
    <button type="button" onclick="copiarLinkFormulario()" style="padding: 8px 16px; background-color: var(--primary-blue, #1e3a8a); color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; whitespace: nowrap;">
      Copiar
    </button>
  </div>
</div>

      <!-- WEBHOOK -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">URL do Webhook (Integração)</label>
        <input type="url" id="cfgWebhookUrl" placeholder="https://hook.make.com/..." style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; box-sizing: border-box;">
      </div>

      <!-- REDIRECIONAMENTO -->
      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">Link de Redirecionamento</label>
        <input type="url" id="cfgRedirectUrl" placeholder="https://wa.me/55..." style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; box-sizing: border-box;">
      </div>

      <!-- BOTÃO SALVAR -->
      <button onclick="salvarConfiguracoesCaptacao()" style="width: 100%; background: #103b70; color: #ffffff; border: none; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
        Salvar Configurações
      </button>

    </div>
  `;

  await carregarConfiguracoesCaptacao();
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
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="abrirNavegacaoConfiguracoes()" title="Voltar">
        <i class="fa-solid fa-chevron-left"></i> Voltar
      </button>
      <span style="font-size: 11px; font-weight: 700; color: var(--primary-blue);">SEGURANÇA E CONTA</span>
      <div style="width: 24px;"></div>
    </div>
    <div style="flex: 1; overflow-y: auto; padding: 16px;">
      
      <!-- USUÁRIO CONECTADO -->
      <div style="margin-bottom: 20px; background: #f1f5f9; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Conta Conectada</div>
        <div style="font-size: 13px; font-weight: 600; color: #0f172a; word-break: break-all;">${escapeHtml(userEmail)}</div>
      </div>

      <!-- OPCÃO MANTER LOGADO -->
      <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <span style="font-size: 13px; font-weight: 600; color: #334155;">Manter-se logado</span>
        <input type="checkbox" id="keepLoggedToggle" ${manterLogado ? 'checked' : ''} onchange="alternarManterLogado(this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
      </div>

      <!-- ALTERAR SENHA -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">Alterar Senha</div>
        <input type="password" id="cfgNewPassword" placeholder="Nova senha" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 8px; box-sizing: border-box;">
        <button onclick="trocarSenhaUsuario()" style="width: 100%; background: #103b70; color: #ffffff; border: none; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
          Atualizar Senha
        </button>
      </div>

      <!-- LOGOUT (SAIR) -->
      <button onclick="fazerLogout()" style="width: 100%; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
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
  try {
    await supabaseClient.auth.signOut();
    location.reload();
  } catch (e) {
    location.reload();
  }
}

/* CHAMA OS MÓDULOS TÉCNICOS */
function abrirModuloTecnica(modulo) {
  const container = document.getElementById('mandala-container');
  if (!container) return;

    if (modulo === 'revolucao') {
    if (typeof window.renderizarRevolucaoSolar === 'function') {
      window.renderizarRevolucaoSolar(container);
    } else if (typeof iniciarModuloRevolucao === 'function') {
      iniciarModuloRevolucao();
    }
 } else if (modulo === 'decenios') {
   if (typeof iniciarModuloDecenios === 'function') iniciarModuloDecenios();
    else container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Decênios aguardando vinculação.</div>`;
  } else if (modulo === 'liberacao') {
    container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Liberação Zodiacal (Em breve)</div>`;
  } else if (modulo === 'direcoes') {
    container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Direções Primárias (Em breve)</div>`;
  }
}

/* CHAMA OS MÓDULOS AUXILIARES */
function abrirModuloAuxiliar(modulo) {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (modulo === 'katarche') {
    container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Katarche / Perguntas (Em breve)</div>`;
  } else if (modulo === 'horas') {
    container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Horas Planetárias (Em breve)</div>`;
  } else if (modulo === 'isopsefia') {
    if (typeof iniciarModuloIsopsefia === 'function') iniciarModuloIsopsefia();
    else container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Isopsefia.</div>`;
  }
}

/* NÍVEL 2C: TELA DE PASTAS COM "IMPORTAR EM MASSA" NO TOPO */
function abrirNavegacaoPastas() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  let html = `
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="renderMenuPrincipal()" title="Voltar ao menu">
        <i class="fa-solid fa-chevron-left"></i> Voltar
      </button>
      <span style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">PASTAS</span>
      <button class="add-folder-btn" onclick="criarNovaPasta()">+ Pasta</button>
    </div>
    <div style="flex: 1; overflow-y: auto;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 2px solid var(--border-color); background: #f1f5f9; cursor: pointer;" onclick="abrirModalImportacaoTexto()">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-file-import" style="color: #103b70;"></i>
          <span style="font-size: 13px; font-weight: 700; color: #103b70;">Importar Lista em Massa</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #103b70;"></i>
      </div>
  `;

  pastasOrdenadas.forEach(pasta => {
    const pastaAttrEscapada = escapeHtml(pasta).replace(/'/g, "&#39;");

    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirConteudoPasta('${pastaAttrEscapada}')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-folder" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">${escapeHtml(pasta)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;" onclick="event.stopPropagation()">
          <i class="fa-solid fa-pen folder-action-icon" onclick="editarNomePasta(event, '${pastaAttrEscapada}')" title="Renomear pasta"></i>
          <i class="fa-solid fa-trash folder-action-icon folder-delete-icon" onclick="apagarPasta(event, '${pastaAttrEscapada}')" title="Apagar pasta"></i>
          <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8; margin-left: 4px;"></i>
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
    <div class="sidebar-header" style="background: #f8fafc;">
      <button class="icon-btn" onclick="abrirNavegacaoPastas()" title="Voltar às pastas">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <span style="font-size: 13px; font-weight: 700; color: var(--primary-blue);">${escapeHtml(nomePasta)}</span>
      <button class="icon-btn" id="trashModeBtn" onclick="alternarModoSelecao()" title="Selecionar para apagar" style="color: #dc2626;">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <div style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); background: #ffffff;">
      <div class="search-box-container" style="margin-bottom: 0;">
        <input type="text" id="filterClientsInput" class="client-search-input" placeholder="Buscar nesta pasta..." oninput="executarBuscaLocal(this.value)">
      </div>
    </div>

    <div id="selectionActionBar" style="display: none; padding: 8px 12px; background: #fee2e2; border-bottom: 1px solid #fca5a5; justify-content: space-between; align-items: center;">
      <label style="font-size: 11px; font-weight: 700; color: #991b1b; display: flex; align-items: center; gap: 6px; cursor: pointer;">
        <input type="checkbox" id="selectAllCheckbox" onchange="marcarTodosMapas(this.checked)"> Selecionar Todos
      </label>
      <button onclick="confirmarExclusaoSelecionados()" style="background: #dc2626; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">
        Apagar (<span id="selectedCount">0</span>)
      </button>
    </div>

    <div id="clientsListContainer" class="client-list-container" style="border: none; border-radius: 0;">
      <div style="padding: 16px; text-align: center; font-size: 12px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando mapas...</div>
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
      data.sort((a, b) => {
        const codA = parseInt(a.codigo, 10);
        const codB = parseInt(b.codigo, 10);

        const temCodA = !isNaN(codA);
        const temCodB = !isNaN(codB);

        if (temCodA && temCodB) return codA - codB;
        if (temCodA) return -1;
        if (temCodB) return 1;

        return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
      });

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
      renderListaMapas(cachedFolderData);
    }
  } catch (err) {
    console.error("Erro ao carregar mapas:", err);
  }
}

function renderListaMapas(lista) {
  const container = document.getElementById('clientsListContainer');
  if (!container) return;

  if (!lista || lista.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">Nenhum mapa encontrado.</div>`;
    return;
  }

  let html = '';
  lista.forEach((item, index) => {
    const cod = item.codigo ? `${item.codigo} - ` : '';
    const tipoStr = item.tipo ? ` ${item.tipo}` : '';
    const dataStr = item.dataNascimento || "Data n/i";
    const cidStr = item.cidade || "Local n/i";
    const isChecked = selectedMapIds.has(item.id) ? 'checked' : '';

    // Trata o número do WhatsApp para o link direto
    const numWhats = item.whatsapp ? item.whatsapp.replace(/\D/g, '') : '';
    const linkWhats = numWhats ? (numWhats.length <= 11 ? `55${numWhats}` : numWhats) : '';

    html += `
      <div class="client-card-item" id="card-item-${index}">
        ${isSelectionMode ? `<input type="checkbox" class="map-select-cb" value="${item.id}" ${isChecked} onchange="alternarSelecaoMapa(${item.id}, this.checked)" style="margin-right: 10px; cursor: pointer;">` : ''}
        <div style="flex: 1; cursor: pointer;" onclick="${isSelectionMode ? `alternarSelecaoPorCard(${item.id})` : `selecionarRegistro(${index}); fecharSidebar();`}">
          <div class="client-name">${cod}${escapeHtml(item.nome || 'Sem Nome')}<span style="font-size: 10px; font-weight: 600; color: #64748b; margin-left: 4px;">${escapeHtml(tipoStr)}</span></div>
          <div class="client-meta">${escapeHtml(dataStr)} • ${escapeHtml(cidStr)}</div>
        </div>
        ${!isSelectionMode ? `
          <div class="card-actions" style="display: flex; gap: 6px; align-items: center;">
            ${linkWhats ? `
              <button type="button" class="action-record-btn" onclick="event.stopPropagation(); window.open('https://wa.me/${linkWhats}', '_blank')" title="Abrir WhatsApp" style="color: #25d366;">
                <i class="fa-brands fa-whatsapp"></i>
              </button>
            ` : ''}
            ${item.email ? `
              <button type="button" class="action-record-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${escapeHtml(item.email)}'); alert('E-mail copiado!');" title="Copiar E-mail" style="color: #0284c7;">
                <i class="fa-solid fa-envelope"></i>
              </button>
            ` : ''}
            <button type="button" class="action-record-btn edit-btn" onclick="abrirModalEdicao(event, ${index})" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="action-record-btn delete-btn" onclick="deletarRegistroUnico(event, ${item.id})" title="Apagar">
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
    <div style="background: #ffffff; width: 90%; max-width: 420px; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin:0; font-size: 16px; font-weight: 800; color: #103b70; font-family: 'Cinzel', serif;">Salvar Mapa Atual</h3>
        <button onclick="document.getElementById('modalSaveCurrentMap').style.display='none'" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">&times;</button>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: #64748b;">Salvar na Pasta</label>
          <span onclick="criarPastaDiretoNoModalSalvamento()" style="font-size: 11px; font-weight: 700; color: var(--primary-blue); cursor: pointer; text-decoration: underline;">+ Criar Nova Pasta</span>
        </div>
        <select id="saveMapFolderSelect" class="modal-select">${optionsPastas}</select>
      </div>

      <div>
        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Tipo de Mapa</label>
        <select id="saveMapTipoSelect" class="modal-select">
          <option value="Trânsito" selected>Trânsito</option>
          <option value="Pergunta">Pergunta</option>
          <option value="Evento">Evento</option>
          <option value="Eleição">Eleição</option>
          <option value="Natal">Natal</option>
        </select>
      </div>

      <div>
        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Nome Completo / Título da Pergunta</label>
        <input type="text" id="saveMapNameInput" class="modal-input" value="${escapeHtml(nomePadrao)}">
      </div>

      <div style="display: flex; gap: 8px;">
        <div style="flex: 1;">
          <label style="font-size: 11px; font-weight: 600; color: #64748b;">Data</label>
          <input type="text" id="saveMapDataInput" class="modal-input" value="${dia}/${mes}/${ano}">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 11px; font-weight: 600; color: #64748b;">Horário</label>
          <input type="text" id="saveMapHoraInput" class="modal-input" value="${hora}:${min}">
        </div>
      </div>

      <div>
        <label style="font-size: 11px; font-weight: 600; color: #64748b;">Local</label>
        <input type="text" id="saveMapCidadeInput" class="modal-input" value="${escapeHtml(currentGeo.city)}">
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="document.getElementById('modalSaveCurrentMap').style.display='none'">Cancelar</button>
        <button type="button" class="btn-primary" onclick="executarSalvarMapaAtual()">Salvar Registro</button>
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
