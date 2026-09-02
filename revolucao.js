/* ==========================================
   MÓDULO DE REVOLUÇÃO SOLAR & PROFECÇÕES (VALENS)
   ========================================== */

let clienteAtivoRS = null;
let anoAlvoRS = new Date().getFullYear();

/* INICIALIZAÇÃO DO MÓDULO AO ABRIR A ABA */
function iniciarModuloRevolucao() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  // 1. Tenta pegar do perfil selecionado no Supabase
  if (typeof currentPerfilSelecionado !== 'undefined' && currentPerfilSelecionado) {
    clienteAtivoRS = currentPerfilSelecionado;
  } 
  // 2. Se não existir, monta o perfil com o mapa que JÁ ESTÁ aberto na tela principal
  else if (typeof currentSubjectName !== 'undefined' && currentSubjectName && currentSubjectName !== "Agora") {
    const dataRef = (typeof currentMoment !== 'undefined') ? currentMoment : new Date();
    const diaStr = String(dataRef.getDate()).padStart(2, '0');
    const mesStr = String(dataRef.getMonth() + 1).padStart(2, '0');
    const anoStr = dataRef.getFullYear();
    const horaStr = String(dataRef.getHours()).padStart(2, '0') + ":" + String(dataRef.getMinutes()).padStart(2, '0');

    clienteAtivoRS = {
      nome: currentSubjectName,
      dataNascimento: diaStr + "/" + mesStr + "/" + anoStr,
      horaNascimento: horaStr,
      latitude: (typeof currentGeo !== 'undefined' && currentGeo.lat) ? currentGeo.lat : -23.5505,
      longitude: (typeof currentGeo !== 'undefined' && currentGeo.lon) ? currentGeo.lon : -46.6333,
      fuso: (typeof currentGeo !== 'undefined' && currentGeo.fuso !== undefined) ? currentGeo.fuso : -3
    };
  }

  // Se mesmo assim não houver nada aberto no sistema inteiro, aí sim pede para abrir um cliente
  if (!clienteAtivoRS) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #475569;">
        <i class="fa-solid fa-folder-open" style="font-size: 32px; color: #103b70; margin-bottom: 12px;"></i>
        <h3 style="margin: 0 0 8px 0; font-family: 'Cinzel', serif; color: #103b70;">Selecione um Mapa</h3>
        <p style="margin: 0; font-size: 13px;">Abra o menu lateral (≡) e clique no cliente desejado para carregar a Revolução Solar.</p>
      </div>
    `;
    return;
  }

  renderInterfaceRevolucao(container);
}

/* CARREGA A ESTRUTURA DA TELA DE RS */
function renderInterfaceRevolucao(container) {
  if (!clienteAtivoRS) return;

  const partesData = clienteAtivoRS.dataNascimento.split('/');
  const anoNasc = parseInt(partesData[2]) || 1990;
  const idadeNaRS = anoAlvoRS - anoNasc;

  let html = `
    <div id="rs-module-root" style="padding: 20px; max-width: 1200px; margin: 0 auto; font-family: 'Montserrat', sans-serif;">
      
      <!-- CONTROLE DE ANO E NOME DO CLIENTE -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 10px; margin-bottom: 20px;">
        <div>
          <span style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 16px;">REVOLUÇÃO SOLAR ${anoAlvoRS}</span>
          <span style="font-size: 13px; color: #64748b; margin-left: 10px; font-weight: 600;">(${clienteAtivoRS.nome || 'Cliente'} — ${idadeNaRS} anos)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button onclick="mudarAnoRS(${anoAlvoRS - 1})" class="icon-btn" style="padding: 6px 12px; font-weight: bold; cursor: pointer;">&laquo; Ano Anterior</button>
          <button onclick="mudarAnoRS(${anoAlvoRS + 1})" class="icon-btn" style="padding: 6px 12px; font-weight: bold; cursor: pointer;">Próximo Ano &raquo;</button>
        </div>
      </div>

      <!-- CABEÇALHO DA PROFECÇÃO -->
      <div id="painel-profecacao-header" style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #c59b27; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
        <div style="text-align: center; font-size: 13px; color: #78350f;">
          Calculando regentes e Senhor do Ano...
        </div>
      </div>

      <!-- ÁREA ONDE A MANDALARS.JS DESENHA OS MAPAS -->
      <div style="margin-bottom: 30px; text-align: center;">
        <div id="rs-mandala-container" style="display: flex; justify-content: center; min-height: 400px; align-items: center;">
          <p style="font-size: 12px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando dados e desenhando mandalas...</p>
        </div>
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Dispara a busca independente na API através da mandalaRS.js
  if (typeof window.executarCalculoRS === 'function') {
    window.executarCalculoRS(clienteAtivoRS, anoAlvoRS);
  }
}

/* TROCA O ANO DA REVOLUÇÃO SOLAR */
function mudarAnoRS(novoAno) {
  anoAlvoRS = novoAno;
  const container = document.getElementById('mandala-container');
  if (container) renderInterfaceRevolucao(container);
}

/* RECEPTOR GLOBAL: DISPARADO QUANDO QUALQUER CLIENTE É CLICADO NO MENU LATERAL */
window.carregarClienteNaRS = function(perfilCliente) {
  clienteAtivoRS = perfilCliente;
  const container = document.getElementById('mandala-container');
  
  // Se a aba da RS estiver visível na tela, atualiza imediatamente
  if (container) {
    renderInterfaceRevolucao(container);
  }
};

/* RECEBE DADOS DA PROFECCAO.JS PARA EXIBIR NO CABEÇALHO */
window.renderizarTabelaProfeccao = function(profAnual, dadosSolar) {
  const headerDiv = document.getElementById('painel-profecacao-header');
  if (headerDiv && profAnual) {
    headerDiv.innerHTML = `
      <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 12px; text-align: center; font-size: 13px; color: #78350f;">
        <div>Grande Ciclo (12a): <strong>Casa ${profAnual.grandeCiclo.casa} em ${profAnual.grandeCiclo.signoNome} (${profAnual.grandeCiclo.regente})</strong></div>
        <div>Ano (${profAnual.idade}a): <strong>Casa ${profAnual.anoProfectado.casa} em ${profAnual.anoProfectado.signoNome} — Senhor do Ano: ${profAnual.anoProfectado.regente}</strong></div>
      </div>
    `;
  }
};
