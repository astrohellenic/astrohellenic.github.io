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
  const SIGNS = [
    { name: "Áries", ruler: "Marte" }, { name: "Touro", ruler: "Vênus" }, { name: "Gêmeos", ruler: "Mercúrio" },
    { name: "Câncer", ruler: "Lua" }, { name: "Leão", ruler: "Sol" }, { name: "Virgem", ruler: "Mercúrio" },
    { name: "Libra", ruler: "Vênus" }, { name: "Escorpião", ruler: "Marte" }, { name: "Sagitário", ruler: "Júpiter" },
    { name: "Capricórnio", ruler: "Saturno" }, { name: "Aquário", ruler: "Saturno" }, { name: "Peixes", ruler: "Júpiter" }
  ];

  function gerarSvgMandala(mapData, titulo) {
    if (!mapData || !mapData.Ascendente) {
      return '<p style="color: #dc2626; text-align: center;">Dados insuficientes para ' + titulo + '</p>';
    }

    const width = 480;
    const height = 520;
    const cx = 240;
    const cy = 270;
    const goldColor = "#c59b27";

    let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; max-width: 480px;">';
    svg += '<rect width="' + width + '" height="' + height + '" fill="#ffffff"/>';
    svg += '<text x="240" y="35" font-family="Cinzel, serif" font-size="20" font-weight="800" fill="#103b70" text-anchor="middle">' + titulo + '</text>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="200" fill="none" stroke="#cbd5e1" stroke-width="2"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="160" fill="none" stroke="' + goldColor + '" stroke-width="1.5"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="100" fill="none" stroke="#cbd5e1" stroke-width="1"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="40" fill="#f8fafc" stroke="' + goldColor + '" stroke-width="1"/>';
    svg += '<text x="' + cx + '" y="' + (cy + 5) + '" font-family="Cinzel, serif" font-size="12" fill="#64748b" text-anchor="middle">AstroHellenic</text>';
    svg += '</svg>';

    return svg;
  }

  window.renderizarMandalasDuplasRS = function(containerId, dadosNatal, dadosSolar) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!dadosNatal || !dadosSolar) {
      container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">Aguardando dados dos mapas...</p>';
      return;
    }

    const svgSolar = gerarSvgMandala(dadosSolar, "Revolução Solar");
    const svgNatal = gerarSvgMandala(dadosNatal, "Mapa Natal (Radix)");

    let html = '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: flex-start; width: 100%; margin-top: 20px;">';
    html += '<div style="flex: 1; min-width: 300px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">' + svgNatal + '</div>';
    html += '<div style="flex: 1; min-width: 300px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">' + svgSolar + '</div>';
    html += '</div>';

    container.innerHTML = html;
  };

  window.executarCalculoRS = async function(perfilCliente, anoAlvo) {
    const container = document.getElementById('rs-mandala-container');
    if (container) {
      container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando dados e desenhando mandalas...</p>';
    }

    try {
      let dataPartes = (perfilCliente && perfilCliente.dataNascimento) ? perfilCliente.dataNascimento.split('-') : ['1990', '01', '01'];
      let dia = String(dataPartes[2] || '01').padStart(2, '0');
      let mes = String(dataPartes[1] || '01').padStart(2, '0');
      let anoNasc = dataPartes[0] || '1990';

      let hora = (perfilCliente && perfilCliente.horaNascimento) ? perfilCliente.horaNascimento : "12:00";
      let lat = (perfilCliente && perfilCliente.latitude) ? perfilCliente.latitude : -23.5505;
      let lon = (perfilCliente && perfilCliente.longitude) ? perfilCliente.longitude : -46.6333;
      let fuso = (perfilCliente && perfilCliente.fuso !== undefined) ? perfilCliente.fuso : -3;

      const urlSolar = "https://motor-astrologia.vercel.app/api/index?data=" + anoAlvo + "-" + mes + "-" + dia + "&hora=" + hora + "&lat=" + lat + "&lon=" + lon + "&fuso=" + fuso;
      const resSolar = await fetch(urlSolar);
      if (!resSolar.ok) throw new Error("Erro na API Solar");
      const dadosSolar = await resSolar.json();

      const urlNatal = "https://motor-astrologia.vercel.app/api/index?data=" + anoNasc + "-" + mes + "-" + dia + "&hora=" + hora + "&lat=" + lat + "&lon=" + lon + "&fuso=" + fuso;
      const resNatal = await fetch(urlNatal);
      if (!resNatal.ok) throw new Error("Erro na API Natal");
      const dadosNatal = await resNatal.json();

      const mapSolar = { Ascendente: { grau_absoluto: (dadosSolar.ascendente ? dadosSolar.ascendente.grau_absoluto : 0) } };
      const mapNatal = { Ascendente: { grau_absoluto: (dadosNatal.ascendente ? dadosNatal.ascendente.grau_absoluto : 0) } };

      window.renderizarMandalasDuplasRS('rs-mandala-container', mapNatal, mapSolar);

      if (typeof window.atualizarProfeccaoComDadosRS === 'function') {
        window.atualizarProfeccaoComDadosRS(dadosNatal, dadosSolar, anoAlvo, anoNasc);
      }

    } catch (err) {
      if (container) {
        container.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">Erro ao carregar dados da Revolução Solar.</p>';
      }
    }
  };

