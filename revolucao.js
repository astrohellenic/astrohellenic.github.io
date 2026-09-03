/* ==========================================
   MÓDULO DE REVOLUÇÃO SOLAR (SELETOR FLUTUANTE)
   ========================================== */

let anoAlvoRS = new Date().getFullYear();

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

function obterContainerRS() {
  return document.getElementById('dropdown-rs-container') || 
         document.getElementById('dropdown-rs') || 
         document.querySelector('own-rs-container');
}

window.toggleJanelaRS = function(event) {
  if (event) event.stopPropagation();
  const dropdown = obterContainerRS();
  if (!dropdown) return;

  const estaAberto = dropdown.style.display === 'block';
  dropdown.style.display = estaAberto ? 'none' : 'block';

  if (!estaAberto) {
    atualizarJanelaRS();
  }
};

window.toggleListaAnosRS = function() {
  const lista = document.getElementById('rs-lista-anos');
  const icon = document.getElementById('rs-chevron-icon');
  if (!lista) return;

  const aberta = lista.style.display === 'block';
  lista.style.display = aberta ? 'none' : 'block';
  if (icon) icon.className = aberta ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down';

  if (!aberta) {
    setTimeout(() => {
      const itemSelecionado = lista.querySelector('.ano-item-selecionado');
      if (itemSelecionado) {
        itemSelecionado.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 50);
  }
};

function atualizarJanelaRS() {
  let nomeMapa = typeof currentSubjectName !== 'undefined' && currentSubjectName ? currentSubjectName : "Mapa Atual";
  
  let dataStr = "";
  if (typeof currentPerfilSelecionado !== 'undefined' && currentPerfilSelecionado && currentPerfilSelecionado.dataNascimento) {
    dataStr = currentPerfilSelecionado.dataNascimento;
  } else if (typeof currentMoment !== 'undefined' && currentMoment) {
    const dataRef = currentMoment;
    const diaStr = String(dataRef.getDate()).padStart(2, '0');
    const mesStr = String(dataRef.getMonth() + 1).padStart(2, '0');
    dataStr = `${diaStr}/${mesStr}/${dataRef.getFullYear()}`;
  }

  const nomeEl = document.getElementById('rs-nome-cliente');
  const labelAno = document.getElementById('rs-ano-atual-label');
  const listaDiv = document.getElementById('rs-lista-anos');

  const dataInfo = extrairPartesDataRS(dataStr);
  const anoNasc = dataInfo.ano;
  const idadeAtual = anoAlvoRS - anoNasc;

  if (nomeEl) nomeEl.innerText = nomeMapa;
  if (labelAno) labelAno.innerText = `${anoAlvoRS}, ${idadeAtual} anos`;

  if (listaDiv) {
    let htmlLista = '';

    for (let a = anoNasc; a <= anoNasc + 120; a++) {
      const idade = a - anoNasc;
      const selecionado = a === anoAlvoRS;
      const bg = selecionado ? '#f1f5f9' : '#ffffff';
      const classeSel = selecionado ? 'ano-item-selecionado' : '';
      const check = selecionado ? '<i class="fa-solid fa-check" style="color: #103b70;"></i>' : '';

      htmlLista += `
        <div class="${classeSel}" onclick="selecionarAnoRS(${a})" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: ${bg}; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">
          <span><strong>${a}</strong>, ${idade} anos</span>
          ${check}
        </div>
      `;
    }
    listaDiv.innerHTML = htmlLista;
  }
}

window.selecionarAnoRS = function(ano) {
  anoAlvoRS = ano;
  toggleListaAnosRS();
  atualizarJanelaRS();

  window.executarCalculoRS(null, anoAlvoRS);
};

/* FORMATADOR RS PARA O MOTOR DA MANDALA */
function normalizarDadosRS(dados) {
  if (!dados) return dados;

  const inicioSigno = {
    'Aries': 0, 'Touro': 30, 'Gemeos': 60, 'Cancer': 90,
    'Leao': 120, 'Virgem': 150, 'Libra': 180, 'Escorpiao': 210,
    'Sagitario': 240, 'Capricornio': 270, 'Aquario': 300, 'Peixes': 330
  };

  function obterGrauAbsoluto(obj) {
    if (!obj) return 0;
    if (obj.grau_absoluto !== undefined && obj.grau_absoluto !== null) return obj.grau_absoluto;
    const base = inicioSigno[obj.signo] !== undefined ? inicioSigno[obj.signo] : 0;
    const grauRelativo = obj.grau !== undefined ? obj.grau : (obj.grau_no_signo || 0);
    return base + grauRelativo;
  }

  const normalizado = { ...dados };

  // 1. ÂNGULOS
  if (dados.ascendente) {
    normalizado.Ascendente = {
      grau_absoluto: obterGrauAbsoluto(dados.ascendente),
      signo: dados.ascendente.signo || ''
    };
  }

  if (dados.meio_ceu) {
    normalizado.MC = {
      grau_absoluto: obterGrauAbsoluto(dados.meio_ceu),
      signo: dados.meio_ceu.signo || ''
    };
  }

  // 2. PLANETAS SETENÁRIOS
  if (dados.planetas) {
    const mapaSetenario = {
      'Sol': 'Sol',
      'Lua': 'Lua',
      'Mercurio': 'Mercurio',
      'Venus': 'Venus',
      'Marte': 'Marte',
      'Jupiter': 'Jupiter',
      'Saturno': 'Saturno'
    };

    Object.keys(dados.planetas).forEach(chave => {
      if (mapaSetenario[chave]) {
        const p = dados.planetas[chave];
        const gAbs = p.grau_absoluto !== undefined ? p.grau_absoluto : obterGrauAbsoluto(p);
        const gSigno = p.grau_no_signo !== undefined ? p.grau_no_signo : (p.grau !== undefined ? p.grau : 0);

        normalizado[mapaSetenario[chave]] = {
          grau_absoluto: gAbs,
          grau_no_signo: gSigno,
          signo: p.signo || '',
          retrogrado: Boolean(p.retrogrado)
        };
      }
    });
  }

  // 3. NODO NORTE E SIZÍGIA
  if (dados.planetas && dados.planetas.NodoNorte) {
    const nodo = dados.planetas.NodoNorte;
    normalizado.Nodo_Norte = {
      grau_absoluto: obterGrauAbsoluto(nodo),
      signo: nodo.signo || ''
    };
  }

  if (dados.sizigia) {
    normalizado.Sizigia = {
      grau_absoluto: obterGrauAbsoluto(dados.sizigia),
      signo: dados.sizigia.signo || '',
      tipo: dados.sizigia.tipo || ''
    };
  }

  return normalizado;
}

window.executarCalculoRS = async function(perfilCliente, ano) {
  const anoCalculo = ano || anoAlvoRS;

  let dataStr = "";
  let hora = "";
  let lat = null;
  let lon = null;
  let fuso = null;

  if (perfilCliente) {
    dataStr = perfilCliente.dataNascimento;
    hora = perfilCliente.horaNascimento;
    lat = perfilCliente.latitude;
    lon = perfilCliente.longitude;
    fuso = perfilCliente.fuso;
  }

  if (!dataStr && typeof currentPerfilSelecionado !== 'undefined' && currentPerfilSelecionado) {
    dataStr = currentPerfilSelecionado.dataNascimento;
    hora = currentPerfilSelecionado.horaNascimento;
    lat = currentPerfilSelecionado.latitude;
    lon = currentPerfilSelecionado.longitude;
    fuso = currentPerfilSelecionado.fuso;
  }

  if (!dataStr && typeof currentMoment !== 'undefined' && currentMoment) {
    const dataRef = currentMoment;
    const diaStr = String(dataRef.getDate()).padStart(2, '0');
    const mesStr = String(dataRef.getMonth() + 1).padStart(2, '0');
    dataStr = `${diaStr}/${mesStr}/${dataRef.getFullYear()}`;
    hora = String(dataRef.getHours()).padStart(2, '0') + ":" + String(dataRef.getMinutes()).padStart(2, '0');
  }

  if ((lat === null || lat === undefined) && typeof currentGeo !== 'undefined' && currentGeo) {
    lat = currentGeo.lat;
    lon = currentGeo.lon;
    fuso = currentGeo.fuso !== undefined ? currentGeo.fuso : -3;
  }

  const dataInfo = extrairPartesDataRS(dataStr);
  const dataFormatada = `${dataInfo.ano}-${dataInfo.mes}-${dataInfo.dia}`;

  if (!hora) hora = "12:00";
  if (!lat) lat = -23.5505;
  if (!lon) lon = -46.6333;
  if (fuso === null || fuso === undefined) fuso = -3;

  const urlSolar = `https://motor-astrologia.vercel.app/api/revolucao?data=${dataFormatada}&hora=${hora}&lat=${lat}&lon=${lon}&fuso=${fuso}&ano=${anoCalculo}`;

  try {
    const resSolar = await fetch(urlSolar);
    if (!resSolar.ok) {
      alert(`Erro na API (${resSolar.status})\nURL: ${urlSolar}`);
      return;
    }
    
    const dadosBrutos = await resSolar.json();

    const dadosSolar = normalizarDadosRS(dadosBrutos);

    window.currentCalculatedData = dadosSolar;

    if (typeof window.renderMandala === 'function') {
      window.renderMandala(dadosSolar);
    } else if (typeof renderMandala === 'function') {
      renderMandala(dadosSolar);
    }

    const dropdown = obterContainerRS();
    if (dropdown) dropdown.style.display = 'none';

  } catch (err) {
    alert(`Falha no calculo RS: ${err.message}`);
  }
};

document.addEventListener('click', function(e) {
  const dropdown = obterContainerRS();
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target) && !e.target.closest('button[onclick*="toggleJanelaRS"]')) {
      dropdown.style.display = 'none';
    }
  }
});
