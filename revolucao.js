/* ==========================================
   MÓDULO DE REVOLUÇÃO SOLAR & PROFECÇÕES (VALENS)
   ========================================== */

function iniciarModuloRevolucao() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  // Garante que existe um cliente selecionado
  if (typeof currentPerfilSelecionado === 'undefined' || !currentPerfilSelecionado) {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: #475569;">
        <i class="fa-solid fa-circle-info" style="font-size: 24px; color: #103b70; margin-bottom: 12px;"></i>
        <h3 style="margin: 0 0 8px 0; font-family: 'Cinzel', serif; color: #103b70;">Selecione um Cliente</h3>
        <p style="margin: 0; font-size: 13px;">Abra uma pasta no menu lateral e selecione o mapa natal do cliente.</p>
      </div>
    `;
    return;
  }

  const anoAtual = new Date().getFullYear();
  renderInterfaceRevolucao(container, anoAtual);
}

function renderInterfaceRevolucao(container, anoAlvo) {
  const perfil = currentPerfilSelecionado;
  const partesData = perfil.dataNascimento.split('/');
  const anoNasc = parseInt(partesData[2]);
  const idadeNaRS = anoAlvo - anoNasc;

  let html = `
    <div id="rs-module-root" style="padding: 20px; max-width: 1200px; margin: 0 auto; font-family: 'Montserrat', sans-serif;">
      
      <!-- NAVEGAÇÃO DE ANO DA RS -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 10px; margin-bottom: 20px;">
        <div>
          <span style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 16px;">REVOLUÇÃO SOLAR ${anoAlvo}</span>
          <span style="font-size: 12px; color: #64748b; margin-left: 10px;">(${perfil.nome} — Idade: ${idadeNaRS} anos)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button onclick="mudarAnoRS(${anoAlvo - 1})" class="icon-btn" style="padding: 6px 12px; font-weight: bold; cursor: pointer;">&laquo; Ano Anterior</button>
          <button onclick="mudarAnoRS(${anoAlvo + 1})" class="icon-btn" style="padding: 6px 12px; font-weight: bold; cursor: pointer;">Próximo Ano &raquo;</button>
        </div>
      </div>

      <!-- PAINEL DE CABEÇALHO DA PROFECÇÃO -->
      <div id="painel-profecacao-header" style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #c59b27; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
        <div style="text-align: center; font-size: 13px; color: #78350f;">
          Calculando regentes e Senhor do Ano...
        </div>
      </div>

      <!-- CONTAINER ONDE A MANDALARS.JS RENDERIZA AS DUAS MANDALAS -->
      <div style="margin-bottom: 30px; text-align: center;">
        <div id="rs-mandala-container" style="display: flex; justify-content: center; min-height: 400px; align-items: center;">
          <p style="font-size: 12px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando mandalas...</p>
        </div>
      </div>

      <!-- TABELA DOS 12 MESES PROFECTADOS -->
      <div id="container-tabela-meses" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 30px;">
      </div>

      <!-- PASSOS DIÁRIOS (60 HORAS) -->
      <div id="container-passos-diarios" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px;">
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Chama a mandalaRS.js autônoma para calcular e desenhar tudo
  if (typeof window.executarCalculoRS === 'function') {
    window.executarCalculoRS(perfil, anoAlvo);
  }
}

function mudarAnoRS(novoAno) {
  const container = document.getElementById('mandala-container');
  if (container) renderInterfaceRevolucao(container, novoAno);
}

/* FUNÇÃO QUE A PROFECCAO.JS CHAMA PARA PREENCHER AS TABELAS */
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
