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

/* PREENCHE OS DADOS DO CLIENTE E A LISTA DE ANOS NA JANELA */
function atualizarJanelaRS() {
  const cliente = typeof currentPerfilSelecionado !== 'undefined' && currentPerfilSelecionado ? currentPerfilSelecionado : null;
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

  if (listaDiv) {
    let htmlLista = '';

    for (let a = anoNasc; a <= anoNasc + 90; a++) {
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

/* AO CLICAR EM UM ANO, BUSCA NA API E ATUALIZA A MANDALA */
window.selecionarAnoRS = function(ano) {
  anoAlvoRS = ano;
  toggleListaAnosRS();
  atualizarJanelaRS();

  const cliente = typeof currentPerfilSelecionado !== 'undefined' ? currentPerfilSelecionado : null;
  window.executarCalculoRS(cliente, anoAlvoRS);
};

/* BUSCA OS DADOS DA RS NA API E ATUALIZA A MANDALA PRINCIPAL */
window.executarCalculoRS = async function(perfilCliente, ano) {
  const cliente = perfilCliente || (typeof currentPerfilSelecionado !== 'undefined' ? currentPerfilSelecionado : null);
  if (!cliente) return;

  const anoCalculo = ano || anoAlvoRS;
  const dataInfo = extrairPartesDataRS(cliente.dataNascimento);

  let hora = cliente.horaNascimento || "12:00";
  let lat = cliente.latitude || -23.5505;
  let lon = cliente.longitude || -46.6333;
  let fuso = cliente.fuso !== undefined ? cliente.fuso : -3;

  try {
    const urlSolar = `https://motor-astrologia.vercel.app/api/index?data=${anoCalculo}-${dataInfo.mes}-${dataInfo.dia}&hora=${hora}&lat=${lat}&lon=${lon}&fuso=${fuso}`;
    const resSolar = await fetch(urlSolar);
    if (!resSolar.ok) throw new Error("Erro na API Solar");
    const dadosSolar = await resSolar.json();

    // Desenha direto na mandala principal que já está aberta na tela
    if (typeof window.desenharMapaPrincipal === 'function') {
      window.desenharMapaPrincipal(dadosSolar);
    } else if (typeof window.renderizarMapa === 'function') {
      window.renderizarMapa(dadosSolar);
    } else if (typeof window.desenharMandala === 'function') {
      window.desenharMandala(dadosSolar);
    }

    // Fecha a janelinha flutuante
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
