/* ==========================================
   MÓDULO DE BANCO DE DADOS (SUPABASE)
   ========================================== */

const SUPABASE_URL = "https://ndgjenvddkmztmdixjhc.supabase.co";
const SUPABASE_KEY = "sb_publishable_VTjldgs8Hv1RODaMg7T57Q_ISzbnm5C";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeFolder = "Clientes";
let customFolders = ["Clientes"];
let cachedFolderData = [];

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function carregarPastasSalvas() {
  try {
    const saved = localStorage.getItem('astro_custom_folders');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) customFolders = parsed;
    }
  } catch (e) {}
  renderBarraDePastas();
}

function salvarPastasStorage() {
  try {
    localStorage.setItem('astro_custom_folders', JSON.stringify(customFolders));
  } catch (e) {}
}

function criarNovaPasta() {
  const nome = prompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();
  if (!customFolders.includes(limpo)) {
    customFolders.push(limpo);
    salvarPastasStorage();
    renderBarraDePastas();
    selecionarPasta(limpo);
  } else {
    selecionarPasta(limpo);
  }
}

async function editarNomePasta(event, pastaAntiga) {
  event.stopPropagation();
  const novoNome = prompt(`Novo nome para a pasta "${pastaAntiga}":`, pastaAntiga);
  if (!novoNome || !novoNome.trim() || novoNome.trim() === pastaAntiga) return;
  
  const nomeLimpo = novoNome.trim();

  try {
    await _supabase.from('mapas').update({ pasta: nomeLimpo }).eq('pasta', pastaAntiga);
    
    const index = customFolders.indexOf(pastaAntiga);
    if (index !== -1) {
      customFolders[index] = nomeLimpo;
      salvarPastasStorage();
      if (activeFolder === pastaAntiga) activeFolder = nomeLimpo;
      renderBarraDePastas();
      carregarConteudoPastaAtual();
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

  if (confirm(`Deseja remover a pasta "${pastaParaDeletar}"?\n\nOs mapas salvos nela no banco de dados também serão apagados.`)) {
    try {
      await _supabase.from('mapas').delete().eq('pasta', pastaParaDeletar);
      
      customFolders = customFolders.filter(p => p !== pastaParaDeletar);
      salvarPastasStorage();

      if (activeFolder === pastaParaDeletar) {
        activeFolder = customFolders[0];
      }

      renderBarraDePastas();
      carregarConteudoPastaAtual();
    } catch (e) {
      alert("Erro ao apagar pasta do banco de dados.");
    }
  }
}

function renderBarraDePastas() {
  const container = document.getElementById('foldersBarContainer');
  if (!container) return;
  let html = '';
  customFolders.forEach(pasta => {
    const activeClass = pasta === activeFolder ? 'active' : '';
    html += `
      <div class="folder-tab-btn ${activeClass}" id="folder-tab-${pasta}" onclick="selecionarPasta('${pasta}')" ondblclick="editarNomePasta(event, '${pasta}')">
        <i class="fa-solid fa-folder"></i> 
        <span>${escapeHtml(pasta)}</span>
        <i class="fa-solid fa-pen folder-action-icon" onclick="editarNomePasta(event, '${pasta}')" title="Editar nome da pasta"></i>
        <i class="fa-solid fa-xmark folder-action-icon folder-delete-icon" onclick="apagarPasta(event, '${pasta}')" title="Apagar pasta"></i>
      </div>
    `;
  });
  html += `
    <button type="button" onclick="criarNovaPasta()" class="add-folder-btn" title="Criar Nova Pasta">
        <i class="fa-solid fa-plus"></i> Pasta
    </button>
  `;
  container.innerHTML = html;
}

function selecionarPasta(pasta) {
  activeFolder = pasta;
  renderBarraDePastas();
  carregarConteudoPastaAtual();
}

async function carregarConteudoPastaAtual() {
  const container = document.getElementById('clientsListContainer');
  const statusEl = document.getElementById('searchStatusFeedback');
  if (!container) return;
  container.innerHTML = `<div style="padding: 12px; font-size: 11px; color: #64748b; text-align: center;"><i class="fa-solid fa-spinner fa-spin" style="margin-right: 4px;"></i> Carregando...</div>`;
  if (statusEl) statusEl.innerText = '';

  try {
    const { data, error } = await _supabase
      .from('mapas')
      .select('*')
      .eq('pasta', activeFolder)
      .order('id', { ascending: true });

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
      renderListaPasta(cachedFolderData);
    } else {
      container.innerHTML = `<div style="padding: 12px; font-size: 11px; color: #64748b; text-align: center;">Pasta vazia.</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div style="padding: 12px; font-size: 11px; color: #64748b; text-align: center;">Erro ao carregar dados.</div>`;
  }
}

function renderListaPasta(lista) {
  const container = document.getElementById('clientsListContainer');
  if (!container) return;
  if (!lista || lista.length === 0) {
    container.innerHTML = `<div style="padding: 12px; font-size: 11px; color: #64748b; text-align: center;">Nenhum registro.</div>`;
    return;
  }

  let html = '';
  lista.forEach((item, index) => {
    const cod = item.codigo ? `${item.codigo} ` : '';
    const dataStr = item.dataNascimento || "Data n/i";
    const cidStr = item.cidade || "Local n/i";
    html += `
      <div class="client-card-item" id="card-item-${index}">
        <div style="flex: 1; cursor: pointer;" onclick="selecionarRegistro(${index})">
          <div class="client-name">${cod}${escapeHtml(item.nome || 'Sem Nome')}</div>
          <div class="client-meta">${escapeHtml(dataStr)} • ${escapeHtml(cidStr)}</div>
        </div>
        <div class="card-actions">
          <button type="button" class="action-record-btn edit-btn" onclick="abrirModalEdicao(event, ${index})" title="Editar este mapa">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="action-record-btn delete-btn" onclick="deletarRegistroUnico(event, ${item.id})" title="Apagar este mapa">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

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

  try {
    const { error } = await _supabase
      .from('mapas')
      .update({
        codigo: codDigitado !== "" ? codDigitado : null,
        nome: nome,
        data_nascimento: dataStr,
        hora_nascimento: horaStr,
        cidade: editSelectedCityGeo ? editSelectedCityGeo.name : document.getElementById('editModalCidadeInput').value,
        latitude: editSelectedCityGeo ? editSelectedCityGeo.lat : -23.5505,
        longitude: editSelectedCityGeo ? editSelectedCityGeo.lon : -46.6333
      })
      .eq('id', idMapa);

    if (!error) {
      fecharModalEdicao();
      carregarConteudoPastaAtual();
    } else {
      alert("Erro ao atualizar o mapa: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao atualizar.");
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
      carregarConteudoPastaAtual();
    } else {
      alert("Erro ao salvar importação: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar.");
  }
}

async function deletarRegistroUnico(event, idMapa) {
  event.stopPropagation();
  if (!confirm("Deseja realmente apagar este mapa?")) return;

  try {
    const { error } = await _supabase.from('mapas').delete().eq('id', idMapa);
    if (!error) {
      carregarConteudoPastaAtual();
    } else {
      alert("Erro ao deletar registro.");
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

async function limparPastaAtualSupabase() {
  if (!confirm(`ATENÇÃO: Deseja apagar TODOS os mapas da pasta "${activeFolder}"? Esta ação é definitiva.`)) return;

  try {
    const { error } = await _supabase.from('mapas').delete().eq('pasta', activeFolder);
    if (!error) {
      alert(`Pasta "${activeFolder}" limpa com sucesso!`);
      carregarConteudoPastaAtual();
    } else {
      alert("Erro ao limpar a pasta.");
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

function executarBuscaLocalOuRemota(termo) {
  const q = termo.toLowerCase().trim();
  if (!q) {
    renderListaPasta(cachedFolderData);
    return;
  }
  if (cachedFolderData.length > 0) {
    const filtrados = cachedFolderData.filter(item => 
      (item.nome && item.nome.toLowerCase().includes(q)) || 
      (item.codigo && String(item.codigo).toLowerCase().includes(q)) ||
      (item.cidade && item.cidade.toLowerCase().includes(q))
    );
    renderListaPasta(filtrados);
  }
}

async function buscarDiretoPorCodigoOuNome() {
  const query = document.getElementById('filterClientsInput').value.trim();
  const statusEl = document.getElementById('searchStatusFeedback');

  if (!query) return;

  if (statusEl) {
    statusEl.style.color = "#0284c7";
    statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
  }

  try {
    const { data, error } = await _supabase
      .from('mapas')
      .select('*')
      .or(`nome.ilike.%${query}%,codigo.ilike.%${query}%`)
      .limit(1);

    if (!error && data && data.length > 0) {
      const c = {
        codigo: data[0].codigo || null,
        nome: data[0].nome,
        dataNascimento: data[0].data_nascimento,
        horaNascimento: data[0].hora_nascimento,
        cidade: data[0].cidade,
        latitude: data[0].latitude,
        longitude: data[0].longitude
      };
      aplicarDadosDoPerfilNoMapa(c);
      if (statusEl) {
        statusEl.style.color = "#16a34a";
        statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(c.nome)}`;
      }
    } else {
      if (statusEl) {
        statusEl.style.color = "#dc2626";
        statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Não localizado`;
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.style.color = "#dc2626";
      statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Erro de conexão`;
    }
  }
}

async function salvarMapaNaPlanilha() {
  if (!currentSubjectName || currentSubjectName === "Céu do Momento") {
    alert("Gere um Mapa Natal antes de salvar.");
    return;
  }

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

  try {
    const { data, error } = await _supabase
      .from('mapas')
      .insert([{
        pasta: pastaAlvo,
        codigo: currentCustomCode,
        nome: currentSubjectName,
        data_nascimento: `${dia}/${mes}/${ano}`,
        hora_nascimento: `${hora}:${min}`,
        cidade: currentGeo.city,
        latitude: currentGeo.lat,
        longitude: currentGeo.lon
      }]);

    if (!error) {
      alert(`Mapa salvo com sucesso na pasta "${pastaAlvo}"!`);
      if (activeFolder === pastaAlvo) {
        carregarConteudoPastaAtual();
      }
    } else {
      alert("Erro ao salvar no banco: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar o mapa.");
  }
}
