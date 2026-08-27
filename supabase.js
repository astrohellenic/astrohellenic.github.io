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

/* CARREGA AS PASTAS EM ORDEM ALFABÉTICA DO SUPABASE */
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
    console.error("Erro ao carregar pastas do banco:", e);
  }
  renderMenuSelecionarMapa();
}

function renderMenuSelecionarMapa() {
  const container = document.getElementById('foldersBarContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="menu-item-btn" onclick="abrirNavegacaoPastas()" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">
      <div><i class="fa-solid fa-folder-open" style="margin-right: 8px; color: #0284c7;"></i> Selecionar Mapa</div>
      <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #94a3b8;"></i>
    </div>
  `;
  document.getElementById('clientsListContainer').innerHTML = '';
}

/* EXIBE AS PASTAS EM ORDEM ALFABÉTICA */
function abrirNavegacaoPastas() {
  const container = document.getElementById('clientsListContainer');
  if (!container) return;

  let html = `
    <div style="padding: 8px 12px; background: #f8fafc; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
      <span>PASTAS</span>
      <button onclick="criarNovaPasta()" style="background: none; border: none; color: #0284c7; cursor: pointer; font-size: 11px; font-weight: bold;">+ Nova Pasta</button>
    </div>
  `;

  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  pastasOrdenadas.forEach(pasta => {
    html += `
      <div class="folder-row-item" onclick="abrirConteudoPasta('${pasta}')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-folder" style="color: #cbd5e1;"></i>
          <span style="font-size: 13px; font-weight: 500; color: #334155;">${escapeHtml(pasta)}</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: #cbd5e1;"></i>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* CARREGA OS MAPAS DA PASTA EM ORDEM ALFABÉTICA */
async function abrirConteudoPasta(nomePasta) {
  activeFolder = nomePasta;
  const container = document.getElementById('clientsListContainer');
  if (!container) return;

  container.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando mapas...</div>`;

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

      let html = `
        <div style="padding: 8px 12px; background: #f8fafc; font-size: 12px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-chevron-left" onclick="abrirNavegacaoPastas()" style="cursor: pointer; padding: 4px; color: #0284c7;" title="Voltar para pastas"></i>
          <span>${escapeHtml(nomePasta)}</span>
        </div>
      `;

      if (cachedFolderData.length === 0) {
        html += `<div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">Nenhum mapa nesta pasta.</div>`;
      } else {
        cachedFolderData.forEach((item, index) => {
          const cod = item.codigo ? `${item.codigo} - ` : '';
          const dataStr = item.dataNascimento || "Data n/i";
          const cidStr = item.cidade || "Local n/i";
          html += `
            <div class="client-card-item" id="card-item-${index}" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; cursor: pointer;" onclick="selecionarRegistro(${index})">
                <div class="client-name" style="font-size: 13px; font-weight: 600; color: #1e293b;">${cod}${escapeHtml(item.nome || 'Sem Nome')}</div>
                <div class="client-meta" style="font-size: 11px; color: #64748b;">${escapeHtml(dataStr)} • ${escapeHtml(cidStr)}</div>
              </div>
              <div class="card-actions" style="display: flex; gap: 8px;">
                <button type="button" class="action-record-btn edit-btn" onclick="abrirModalEdicao(event, ${index})" title="Editar" style="background: none; border: none; color: #64748b; cursor: pointer;"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="action-record-btn delete-btn" onclick="deletarRegistroUnico(event, ${item.id})" title="Apagar" style="background: none; border: none; color: #ef4444; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          `;
        });
      }

      container.innerHTML = html;
    }
  } catch (err) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: #ef4444;">Erro ao carregar mapas.</div>`;
  }
}

/* CRIA PASTA NO SUPABASE */
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
        alert("Erro ao criar pasta no banco: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão ao criar pasta.");
    }
  }
}

/* EDITA PASTA NO SUPABASE */
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
    alert("Erro ao renomear pasta no banco de dados.");
  }
}

/* DELETA PASTA E MAPAS DO SUPABASE */
async function apagarPasta(event, pastaParaDeletar) {
  event.stopPropagation();

  if (customFolders.length <= 1) {
    alert("Você precisa manter pelo menos uma pasta.");
    return;
  }

  if (confirm(`Deseja remover a pasta "${pastaParaDeletar}"?\n\nOs mapas salvos nela no banco de dados também serão apagados.`)) {
    try {
      await _supabase.from('mapas').delete().eq('pasta', pastaParaDeletar);
      await _supabase.from('pastas').delete().eq('nome', pastaParaDeletar);
      
      customFolders = customFolders.filter(p => p !== pastaParaDeletar);

      if (activeFolder === pastaParaDeletar) {
        activeFolder = customFolders[0];
      }

      abrirNavegacaoPastas();
    } catch (e) {
      alert("Erro ao apagar pasta do banco de dados.");
    }
  }
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
      abrirConteudoPasta(activeFolder);
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
      abrirConteudoPasta(activeFolder);
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
      abrirConteudoPasta(activeFolder);
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
      if (activeFolder === pastaAlvo) {
        abrirConteudoPasta(pastaAlvo);
      }
    } else {
      alert("Erro ao salvar no banco: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar o mapa.");
  }
}
