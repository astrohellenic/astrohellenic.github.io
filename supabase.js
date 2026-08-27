/* ==========================================
   MÓDULO DE BANCO DE DADOS E NAVEGAÇÃO (SUPABASE)
   ========================================== */

const SUPABASE_URL = "https://ndgjenvddkmztmdixjhc.supabase.co";
const SUPABASE_KEY = "sb_publishable_VTjldgs8Hv1RODaMg7T57Q_ISzbnm5C";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeFolder = "Clientes";
let customFolders = ["Clientes"];
let cachedFolderData = [];
let selectedMapIds = new Set();
let isSelectionMode = false;

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* BUSCA AUTOMÁTICA DE FUSO POR LATITUDE E LONGITUDE */
async function buscarFusoPorCoordenadas(lat, lon, dateObj = new Date()) {
  try {
    const isoDate = dateObj.toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=utc_offset_seconds&start_date=${isoDate}&end_date=${isoDate}&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.utc_offset_seconds !== undefined) {
      return data.utc_offset_seconds / 3600;
    }
  } catch (e) {
    console.error("Erro ao buscar fuso:", e);
  }
  return -3;
}

/* 1. CARREGA AS PASTAS EM ORDEM ALFABÉTICA DO SUPABASE */
async function carregarPastasSalvas() {
  try {
    const { data, error } = await _supabase
      .from('pastas')
      .select('nome')
      .order('nome', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      customFolders = data.map(p => p.nome);
    } else if (data && data.length === 0) {
      await _supabase.from('pastas').insert([{ nome: 'Clientes' }]);
      customFolders = ['Clientes'];
    }
  } catch (e) {
    console.error("Erro ao carregar pastas:", e);
  }
  renderMenuPrincipal();
}

/* NÍVEL 1: MENU PRINCIPAL */
function renderMenuPrincipal() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h1 class="sidebar-title">Astro Hellenic</h1>
    </div>
    <ul class="menu-list">
      <li class="menu-item active" id="menu-here-now" onclick="carregarCeuDoMomento()">
        <span>Agora</span>
        <i class="fa-solid fa-clock"></i>
      </li>
      <li class="menu-item" onclick="abrirModalNovoMapa()">
        <span>Novo Mapa Astral</span>
        <i class="fa-solid fa-user-plus"></i>
      </li>
      <li class="menu-item" onclick="abrirModalImportacaoTexto()">
        <span>Importar Lista em Massa</span>
        <i class="fa-solid fa-file-import"></i>
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
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('revolucao')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-sun" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Revolução Solar</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('decenios')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-hourglass-half" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Decênios</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('liberacao')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-dharmachakra" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Liberação Zodiacal</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloTecnica('direcoes')">
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
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloAuxiliar('katarche')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-circle-question" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Katarche (Perguntas)</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloAuxiliar('horas')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-business-time" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Horas Planetárias</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirModuloAuxiliar('isopsefia')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-calculator" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">Isopsefia</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: #94a3b8;"></i>
      </div>
    </div>
  `;
}

/* CHAMA OS MÓDULOS TÉCNICOS */
function abrirModuloTecnica(modulo) {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (modulo === 'revolucao') {
    if (typeof iniciarModuloRevolucao === 'function') {
      iniciarModuloRevolucao();
    } else {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Revolução Solar pronto para ser estruturado no revolucao.js</div>`;
    }
  } else if (modulo === 'decenios') {
    if (typeof iniciarModuloDecenios === 'function') {
      iniciarModuloDecenios();
    } else {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Decênios aguardando vinculação.</div>`;
    }
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
    if (typeof iniciarModuloIsopsefia === 'function') {
      iniciarModuloIsopsefia();
    } else {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">Módulo de Isopsefia pronto para integração.</div>`;
    }
  }
}

/* NÍVEL 2C: TELA DE PASTAS */
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
  `;

  pastasOrdenadas.forEach(pasta => {
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="abrirConteudoPasta('${pasta}')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-folder" style="color: var(--gold-dark);"></i>
          <span style="font-size: 13px; font-weight: 600; color: #334155;">${escapeHtml(pasta)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;" onclick="event.stopPropagation()">
          <i class="fa-solid fa-pen folder-action-icon" onclick="editarNomePasta(event, '${pasta}')" title="Renomear pasta"></i>
          <i class="fa-solid fa-trash folder-action-icon folder-delete-icon" onclick="apagarPasta(event, '${pasta}')" title="Apagar pasta"></i>
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

/* CARREGA E RENDERIZA MAPAS EM ORDEM ALFABÉTICA */
async function carregarMapasDoBanco(nomePasta) {
  try {
    const { data, error } = await _supabase
      .from('mapas')
      .select('*')
      .eq('pasta', nomePasta)
      .order('nome', { ascending: true });

    if (!error && Array.isArray(data)) {
      cachedFolderData = data.map(item => ({
        id: item.id,
        codigo: (item.codigo && String(item.codigo).trim() !== '') ? item.codigo : null,
        nome: item.nome,
        dataNascimento: item.data_nascimento,
        horaNascimento: item.hora_nascimento,
        cidade: item.cidade,
        latitude: item.latitude,
        longitude: item.longitude
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
    const dataStr = item.dataNascimento || "Data n/i";
    const cidStr = item.cidade || "Local n/i";
    const isChecked = selectedMapIds.has(item.id) ? 'checked' : '';

    html += `
      <div class="client-card-item" id="card-item-${index}">
        ${isSelectionMode ? `<input type="checkbox" class="map-select-cb" value="${item.id}" ${isChecked} onchange="alternarSelecaoMapa(${item.id}, this.checked)" style="margin-right: 10px; cursor: pointer;">` : ''}
        <div style="flex: 1; cursor: pointer;" onclick="${isSelectionMode ? `alternarSelecaoPorCard(${item.id})` : `selecionarRegistro(${index})`}">
          <div class="client-name">${cod}${escapeHtml(item.nome || 'Sem Nome')}</div>
          <div class="client-meta">${escapeHtml(dataStr)} • ${escapeHtml(cidStr)}</div>
        </div>
        ${!isSelectionMode ? `
          <div class="card-actions">
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
      const { error } = await _supabase.from('mapas').delete().in('id', idsArray);

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

/* BUSCA LOCAL DENTRO DA PASTA ATUAL */
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

/* GERENCIAMENTO DE PASTAS NO SUPABASE */
async function criarNovaPasta() {
  const nome = prompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();

  if (!customFolders.includes(limpo)) {
    try {
      const { error } = await _supabase.from('pastas').insert([{ nome: limpo }]);
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
    await _supabase.from('mapas').update({ pasta: nomeLimpo }).eq('pasta', pastaAntiga);
    await _supabase.from('pastas').update({ nome: nomeLimpo }).eq('nome', pastaAntiga);
    
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
      await _supabase.from('mapas').delete().eq('pasta', pastaParaDeletar);
      await _supabase.from('pastas').delete().eq('nome', pastaParaDeletar);
      
      customFolders = customFolders.filter(p => p !== pastaParaDeletar);
      abrirNavegacaoPastas();
    } catch (e) {
      alert("Erro ao apagar pasta.");
    }
  }
}

/* MODAL DE EDIÇÃO E IMPORTAÇÃO */
function abrirModalEdicao(event, index) {
  event.stopPropagation();
  const item = cachedFolderData[index];
  if (!item) return;

  document.getElementById('editModalId').value = item.id;
  document.getElementById('editModalCodigo').value = item.codigo || '';
  document.getElementById('editModalNome').value = item.nome || '';
  document.getElementById('editModalData').value = item.dataNascimento || '';
  document.getElementById('editModalHora').value = item.horaNascimento || '12:00';
  document.getElementById('editModalCidadeInput').value = item.cidade || '';
  
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
  const codDigitado = document.getElementById('editModalCodigo').value.trim();
  const nome = document.getElementById('editModalNome').value.trim();
  const dataStr = document.getElementById('editModalData').value.trim();
  const horaStr = document.getElementById('editModalHora').value.trim();

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr || !dataStr.includes('/')) { alert("Informe a data no formato DD/MM/AAAA."); return; }
  if (!horaStr) { alert("Informe o horário."); return; }

  let lat = editSelectedCityGeo ? editSelectedCityGeo.lat : -23.5505;
  let lon = editSelectedCityGeo ? editSelectedCityGeo.lon : -46.6333;

  try {
    const { error } = await _supabase
      .from('mapas')
      .update({
        codigo: codDigitado !== "" ? codDigitado : null,
        nome: nome,
        data_nascimento: dataStr,
        hora_nascimento: horaStr,
        cidade: editSelectedCityGeo ? editSelectedCityGeo.name : document.getElementById('editModalCidadeInput').value,
        latitude: lat,
        longitude: lon
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
    let horaStr = partes[2] ? partes[2].trim() : "12:00";
    let cidadeStr = partes[3] ? partes[3].trim() : "Brasil";

    registros.push({
      pasta: activeFolder,
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
    const { error } = await _supabase.from('mapas').insert(registros);
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
    const { error } = await _supabase.from('mapas').delete().eq('id', idMapa);
    if (!error) {
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao deletar registro.");
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

async function salvarMapaNaPlanilha() {
  let opcoes = customFolders.map((f, i) => `${i + 1}. ${f}`).join("\n");
  let escolha = prompt(`Escolha o número da pasta para salvar:\n\n${opcoes}`, "1");
  if (!escolha) return;

  let idx = parseInt(escolha, 10) - 1;
  let pastaAlvo = customFolders[idx] || customFolders[0];

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const nomeParaSalvar = (currentSubjectName && currentSubjectName !== "") ? currentSubjectName : "Here & Now";

  try {
    const { data, error } = await _supabase
      .from('mapas')
      .insert([{
        pasta: pastaAlvo,
        codigo: currentCustomCode,
        nome: nomeParaSalvar,
        data_nascimento: `${dia}/${mes}/${ano}`,
        hora_nascimento: `${hora}:${min}`,
        cidade: currentGeo.city,
        latitude: currentGeo.lat,
        longitude: currentGeo.lon
      }]);

    if (!error) {
      alert(`Mapa "${nomeParaSalvar}" salvo com sucesso na pasta "${pastaAlvo}"!`);
    } else {
      alert("Erro ao salvar no banco: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar o mapa.");
  }
}
