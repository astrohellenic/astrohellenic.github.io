/* ==========================================
   MÓDULO DE REVOLUÇÃO SOLAR (SELETOR FLUTUANTE)
   ========================================== */

let anoAlvoRS = new Date().getFullYear();

/* EXTRAI DIA, MÊS E ANO INDEPENDENTE DO FORMATO */
function extrairPartesDataRS(dataStr) {
  if (!dataStr) return { dia: '01', mes: '01', ano: 1990 };
  if (dataStr.includes('-')) {
    const p = dataStr.split('-');
    if (p[0].length === 4) return { dia: String(p[2]).padStart(2, '0'), mes: String(p[1]).padStart(2, '0'), ano: parseInt(p[0]) || 1990 };
    return { dia: String(p[0]).padStart(2, '0'), mes: String(p[1]).padStart(2, '0'), ano: parseInt(p[2]) || 1990 };
  }
  if (dataStr.includes('/')) {
    const p = dataStr.split('/');
    return { dia: String(p[0]).padStart(2, '0'), mes: String(p[1]).padStart(2, '0'), ano: parseInt(p[2]) || 1990 };
  }
  return { dia: '01', mes: '01', ano: 1990 };
}

/* ABRE OU FECHA A JANELA FLUTUANTE DO SOLZINHO */
window.toggleJanelaRS = function(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('dropdown-rs-container');
  if (!dropdown) return;

  const estaAberto = dropdown.style.display === 'block';
  dropdown.style.display = estaAberto ? 'none' : 'block';

  if (!estaAberto) {
    atualizarJanelaRS();
  }
};

/* MOSTRA OU ESCONDE A LISTA DE ANOS */
window.toggleListaAnosRS = function() {
  const lista = document.getElementById('rs-lista-anos');
  const icon = document.getElementById('rs-chevron-icon');
  if (!lista) return;

  const aberta = lista.style.display === 'block';
  lista.style.display = aberta ? 'none' : 'block';
  if (icon) icon.className = aberta ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down';
};

/* PREENCHE OS DADOS E A LISTA DE ANOS NA JANELA */
function atualizarJanelaRS() {
  let cliente = typeof currentPerfilSelecionado !== 'undefined' && currentPerfilSelecionado ? currentPerfilSelecionado : null;

  // Se não tem Supabase, monta com os dados do mapa atual na tela (inclusive "Agora")
  if (!cliente && typeof currentSubjectName !== 'undefined' && currentSubjectName) {
    const dataRef = (typeof currentMoment !== 'undefined') ? currentMoment : new Date();
    const diaStr = String(dataRef.getDate()).padStart(2, '0');
    const mesStr = String(dataRef.getMonth() + 1).padStart(2, '0');
    const anoStr = dataRef.getFullYear();

    cliente = {
      nome: currentSubjectName,
      dataNascimento: `${diaStr}/${mesStr}/${anoStr}`
    };
  }

  const nomeEl = document.getElementById('rs-nome-cliente');
  const labelAno = document.getElementById('rs-ano-atual-label');
  const listaDiv = document.getElementById('rs-lista-anos');

  if (!cliente) {
    if (nomeEl) nomeEl.innerText = "Nenhum mapa selecionado";
    if (labelAno) labelAno.innerText = "Abra um mapa primeiro";
    if (listaDiv) listaDiv.innerHTML = "";
    return;
  }

  const dataInfo = extrairPartesDataRS(cliente.dataNascimento);
  const anoNasc = dataInfo.ano;
  const idadeAtual = anoAlvoRS - anoNasc;

  if (nomeEl) nomeEl.innerText = cliente.nome || "Cliente";
  if (labelAno) labelAno.innerText = `${anoAlvoRS}, ${idadeAtual} anos`;

  // Gera até 120 anos
  if (listaDiv) {
    let htmlLista = '';

    for (let a = anoNasc; a <= anoNasc + 120; a++) {
      const idade = a - anoNasc;
      const selecionado = a === anoAlvoRS;
      const bg = selecionado ? '#f1f5f9' : '#ffffff';
      const check = selecionado ? '<i class="fa-solid fa-check" style="color: #103b70;"></i>' : '';

      htmlLista += `
        <div onclick="selecionarAnoRS(${a})" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: ${bg}; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">
          <span><strong>${a}</strong>, ${idade} anos</span>
          ${check}
        </div>
      `;
    }
    listaDiv.innerHTML = htmlLista;
  }
}

/* AO CLICAR EM UM ANO, EXECUTA O CÁLCULO E RECONSTRÓI A MANDALA */
window.selecionarAnoRS = function(ano) {
  anoAlvoRS = ano;
  toggleListaAnosRS();
  atualizarJanelaRS();

  const cliente = typeof currentPerfilSelecionado !== 'undefined' ? currentPerfilSelecionado : null;
  window.executarCalculoRS(cliente, anoAlvoRS);
};

/* BUSCA OS DADOS DA RS NA API E ATUALIZA A MANDALA PRINCIPAL */
window.executarCalculoRS = async function(perfilCliente, ano) {
  const anoCalculo = ano || anoAlvoRS;

  // Garante a extração de dados do perfil ou das variáveis globais do mapa ativo
  let dataStr = perfilCliente ? perfilCliente.dataNascimento : "";
  let hora = perfilCliente ? perfilCliente.horaNascimento : "";
  let lat = perfilCliente ? perfilCliente.latitude : null;
  let lon = perfilCliente ? perfilCliente.longitude : null;
  let fuso = perfilCliente ? perfilCliente.fuso : null;

  if (!dataStr && typeof currentMoment !== 'undefined') {
    const diaStr = String(currentMoment.getDate()).padStart(2, '0');
    const mesStr = String(currentMoment.getMonth() + 1).padStart(2, '0');
    dataStr = `${diaStr}/${mesStr}/${currentMoment.getFullYear()}`;
    hora = String(currentMoment.getHours()).padStart(2, '0') + ":" + String(currentMoment.getMinutes()).padStart(2, '0');
  }

  if (lat === null && typeof currentGeo !== 'undefined') {
    lat = currentGeo.lat;
    lon = currentGeo.lon;
    fuso = currentGeo.fuso !== undefined ? currentGeo.fuso : -3;
  }

  // Valores padrão se ainda faltar algo
  const dataInfo = extrairPartesDataRS(dataStr);
  if (!hora) hora = "12:00";
  if (!lat) lat = -23.5505;
  if (!lon) lon = -46.6333;
  if (fuso === null) fuso = -3;

  try {
    const urlSolar = `https://motor-astrologia.vercel.app/api/index?data=${anoCalculo}-${dataInfo.mes}-${dataInfo.dia}&hora=${hora}&lat=${lat}&lon=${lon}&fuso=${fuso}`;
    
    console.log("Chamando API da Revolução Solar:", urlSolar);

    const resSolar = await fetch(urlSolar);
    if (!resSolar.ok) throw new Error("Erro na API Solar");
    const dadosSolar = await resSolar.json();

    // Desenha direto na mandala principal da tela
    if (typeof window.desenharMapaPrincipal === 'function') {
      window.desenharMapaPrincipal(dadosSolar);
    } else if (typeof window.renderizarMapa === 'function') {
      window.renderizarMapa(dadosSolar);
    } else if (typeof window.desenharMandala === 'function') {
      window.desenharMandala(dadosSolar);
    }

    // Fecha a janela
    const dropdown = document.getElementById('dropdown-rs-container');
    if (dropdown) dropdown.style.display = 'none';

  } catch (err) {
    console.error("Erro ao calcular a RS:", err);
  }
};

/* FECHA A JANELA SE CLICAR FORA DELA */
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('dropdown-rs-container');
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target) && !e.target.closest('button[onclick*="toggleJanelaRS"]')) {
      dropdown.style.display = 'none';
    }
  }
});
