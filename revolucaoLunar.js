/* ==========================================
   MÓDULO DE REVOLUÇÃO LUNAR (SELETOR FLUTUANTE)
   Mesmo desenho da Revolução Solar (revolucao.js), mas a Lua tem ~13
   retornos por ano: escolhe o ano e depois o retorno, numa lista.
   O mapa é sempre no local de nascimento (a API não aceita outro).
   ========================================== */

let anoAlvoRL = new Date().getFullYear();
let retornoLuaSelecionadoJd = null;   // jd_ut do retorno que está na tela (destaca na lista)
const cacheRetornosLua = {};          // `${chaveNasc}|${ano}` → lista de retornos do ano

const RL_API = 'https://motor-astrologia.vercel.app/api/revolucao_lunar';
const RL_MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function obterContainerRL() {
  return document.getElementById('dropdown-rl-container');
}

/* Dados de nascimento do mapa em tela (mesma ordem de busca da Revolução Solar). */
function obterNascimentoRL() {
  let dataStr = '', hora = '', lat = null, lon = null, fuso = null;

  if (typeof currentPerfilSelecionado !== 'undefined' && currentPerfilSelecionado) {
    dataStr = currentPerfilSelecionado.dataNascimento;
    hora = currentPerfilSelecionado.horaNascimento;
    lat = currentPerfilSelecionado.latitude;
    lon = currentPerfilSelecionado.longitude;
    fuso = currentPerfilSelecionado.fuso;
  }

  if (!dataStr && typeof currentMoment !== 'undefined' && currentMoment) {
    const d = currentMoment;
    dataStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  if ((lat === null || lat === undefined) && typeof currentGeo !== 'undefined' && currentGeo) {
    lat = currentGeo.lat;
    lon = currentGeo.lon;
    fuso = currentGeo.fuso !== undefined ? currentGeo.fuso : -3;
  }

  const info = extrairPartesDataRS(dataStr);
  if (!hora) hora = '12:00';
  if (!lat) lat = -23.5505;
  if (!lon) lon = -46.6333;
  if (fuso === null || fuso === undefined) fuso = -3;

  const dataFormatada = `${info.ano}-${info.mes}-${info.dia}`;
  return { dataFormatada, hora, lat, lon, fuso, anoNasc: info.ano,
           chave: `${dataFormatada}|${hora}|${lat}|${lon}|${fuso}` };
}

window.toggleJanelaRL = function(event) {
  if (event) event.stopPropagation();
  const dropdown = obterContainerRL();
  if (!dropdown) return;

  // só uma janelinha aberta por vez: fecha a da Revolução Solar
  const solar = typeof obterContainerRS === 'function' ? obterContainerRS() : null;
  if (solar) solar.style.display = 'none';

  const estaAberto = dropdown.style.display === 'block';
  dropdown.style.display = estaAberto ? 'none' : 'block';

  if (!estaAberto) {
    atualizarJanelaRL();
    carregarRetornosAnoRL(anoAlvoRL);
  }
};

window.toggleListaAnosRL = function() {
  const lista = document.getElementById('rl-lista-anos');
  const icon = document.getElementById('rl-chevron-icon');
  if (!lista) return;

  const aberta = lista.style.display === 'block';
  lista.style.display = aberta ? 'none' : 'block';
  if (icon) icon.style.transform = aberta ? '' : 'rotate(90deg)';

  if (!aberta) {
    setTimeout(() => {
      const item = lista.querySelector('.ano-item-selecionado');
      if (item) item.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 50);
  }
};

function atualizarJanelaRL() {
  const nomeMapa = typeof currentSubjectName !== 'undefined' && currentSubjectName ? currentSubjectName : 'Mapa Atual';
  const nasc = obterNascimentoRL();
  const idadeAtual = anoAlvoRL - nasc.anoNasc;

  const nomeEl = document.getElementById('rl-nome-cliente');
  const labelAno = document.getElementById('rl-ano-atual-label');
  const listaDiv = document.getElementById('rl-lista-anos');

  if (nomeEl) nomeEl.innerText = nomeMapa;
  if (labelAno) labelAno.innerHTML = `${anoAlvoRL}<span class="idade-ano">, ${idadeAtual} anos</span>`;

  if (listaDiv) {
    let html = '';
    for (let a = nasc.anoNasc; a <= nasc.anoNasc + 120; a++) {
      const sel = a === anoAlvoRL;
      html += `<div class="item-menu${sel ? ' ano-item-selecionado ativa' : ''}" onclick="selecionarAnoRL(${a})"><span><strong>${a}</strong><span class="idade-ano">, ${a - nasc.anoNasc} anos</span></span></div>`;
    }
    listaDiv.innerHTML = html;
  }
}

window.selecionarAnoRL = function(ano) {
  anoAlvoRL = ano;
  toggleListaAnosRL();
  atualizarJanelaRL();
  carregarRetornosAnoRL(ano);
};

async function buscarRetornoLuaRL(nasc, dataInicio) {
  const url = `${RL_API}?data=${nasc.dataFormatada}&hora=${nasc.hora}&lat=${nasc.lat}&lon=${nasc.lon}&fuso=${nasc.fuso}&data_inicio=${dataInicio}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro na API (${res.status})`);
  const json = await res.json();
  if (!json.sucesso) throw new Error(json.erro || 'Erro na API');
  return json;
}

function dataHoraLocalRL(momento) {
  const [a, m, d] = momento.data_local.split('-').map(Number);
  const [h, mi] = momento.hora_local.split(':').map(Number);
  return new Date(a, m - 1, d, h, mi);
}

/* Todos os retornos de um ano. Cada chamada devolve o PRIMEIRO retorno depois da data
   de partida; partindo de 25 em 25 dias (menos que o intervalo, ~27 dias) nenhum retorno
   escapa, e os repetidos são descartados pelo jd_ut. As chamadas vão em paralelo. */
async function retornosDoAnoRL(nasc, ano) {
  const chaveCache = `${nasc.chave}|${ano}`;
  if (cacheRetornosLua[chaveCache]) return cacheRetornosLua[chaveCache];

  const partidas = [];
  for (let k = 0; k <= 14; k++) {
    const d = new Date(Date.UTC(ano, 0, 1 + 25 * k));
    partidas.push(d.toISOString().slice(0, 10));
  }
  const respostas = await Promise.all(partidas.map(p => buscarRetornoLuaRL(nasc, p)));

  const [aN, mN, dN] = nasc.dataFormatada.split('-').map(Number);
  const [hN, miN] = nasc.hora.split(':').map(Number);
  const nascimento = new Date(aN, mN - 1, dN, hN, miN);

  const vistos = new Set();
  const lista = [];
  respostas.forEach(r => {
    const jd = r.momento_exato.jd_ut;
    if (vistos.has(jd)) return;
    vistos.add(jd);
    const quando = dataHoraLocalRL(r.momento_exato);
    if (quando.getFullYear() !== ano || quando < nascimento) return;
    lista.push({ jd, quando, resposta: r });
  });
  lista.sort((x, y) => x.jd - y.jd);

  cacheRetornosLua[chaveCache] = lista;
  return lista;
}

async function carregarRetornosAnoRL(ano) {
  const div = document.getElementById('rl-lista-retornos');
  if (!div) return;
  const nasc = obterNascimentoRL();
  div.innerHTML = '<div class="item-menu cabeca-menu"><span class="rotulo">Buscando retornos de ' + ano + '...</span></div>';

  try {
    const lista = await retornosDoAnoRL(nasc, ano);
    if (ano !== anoAlvoRL) return;   // trocou de ano enquanto buscava
    if (!lista.length) {
      div.innerHTML = '<div class="item-menu cabeca-menu"><span class="rotulo">Nenhum retorno neste ano</span></div>';
      return;
    }
    div.innerHTML = lista.map((r, i) => {
      const q = r.quando;
      const texto = `${String(q.getDate()).padStart(2, '0')} ${RL_MESES[q.getMonth()]}, ${String(q.getHours()).padStart(2, '0')}:${String(q.getMinutes()).padStart(2, '0')}`;
      const sel = r.jd === retornoLuaSelecionadoJd;
      return `<div class="item-menu${sel ? ' ativa' : ''}" onclick="selecionarRetornoRL(${i})"><strong>${texto}</strong></div>`;
    }).join('');
    div.dataset.chave = `${nasc.chave}|${ano}`;
  } catch (err) {
    div.innerHTML = `<div class="item-menu cabeca-menu"><span class="rotulo">Falha ao buscar: ${err.message}</span></div>`;
  }
}

window.selecionarRetornoRL = function(indice) {
  const nasc = obterNascimentoRL();
  const lista = cacheRetornosLua[`${nasc.chave}|${anoAlvoRL}`];
  if (!lista || !lista[indice]) return;
  window.mostrarRevolucaoLunar(lista[indice].resposta);
};

/* Desenha a mandala do retorno (mesmo fluxo da Revolução Solar na tela da Mandala). */
window.mostrarRevolucaoLunar = function(apiJson) {
  const SIGNOS_INDEX = {
    "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
    "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
    "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
  };

  const planetas = apiJson.planetas || {};
  const ascData = apiJson.ascendente || {};
  const mcData = apiJson.meio_ceu || {};
  const sizigiaData = apiJson.sizigia || {};

  function calcularAbsoluto(obj) {
    if (!obj) return 0;
    if (obj.grau_absoluto !== undefined && obj.grau_absoluto !== null && obj.grau_absoluto !== 0) {
      return parseFloat(obj.grau_absoluto);
    }
    const idxSigno = SIGNOS_INDEX[obj.signo] !== undefined ? SIGNOS_INDEX[obj.signo] : 0;
    const grauRel = parseFloat(obj.grau_no_signo !== undefined ? obj.grau_no_signo : (obj.grau || 0));
    return (idxSigno * 30) + grauRel;
  }

  const checkRetro = (p) => !!(p && p.retrogrado !== undefined && p.retrogrado);

  const dadosLunar = {
    Ascendente: { grau_absoluto: calcularAbsoluto(ascData) },
    MC: { grau_absoluto: calcularAbsoluto(mcData) },
    Nodo_Norte: { grau_absoluto: calcularAbsoluto(planetas.NodoNorte), retro: checkRetro(planetas.NodoNorte) },
    Sizigia: { grau_absoluto: sizigiaData.grau_absoluto !== undefined ? parseFloat(sizigiaData.grau_absoluto) : 0 },
    Sol: { grau_absoluto: calcularAbsoluto(planetas.Sol), retro: false },
    Lua: { grau_absoluto: calcularAbsoluto(planetas.Lua), retro: false },
    Mercúrio: { grau_absoluto: calcularAbsoluto(planetas.Mercurio), retro: checkRetro(planetas.Mercurio) },
    Vênus: { grau_absoluto: calcularAbsoluto(planetas.Venus), retro: checkRetro(planetas.Venus) },
    Marte: { grau_absoluto: calcularAbsoluto(planetas.Marte), retro: checkRetro(planetas.Marte) },
    Júpiter: { grau_absoluto: calcularAbsoluto(planetas.Jupiter), retro: checkRetro(planetas.Jupiter) },
    Saturno: { grau_absoluto: calcularAbsoluto(planetas.Saturno), retro: checkRetro(planetas.Saturno) }
  };

  retornoLuaSelecionadoJd = apiJson.momento_exato.jd_ut;
  window.currentMapType = "Revolução Lunar";
  currentMoment = dataHoraLocalRL(apiJson.momento_exato);
  window.currentCalculatedData = dadosLunar;

  if (typeof window.renderMandala === 'function') {
    window.renderMandala(dadosLunar);
  } else if (typeof renderMandala === 'function') {
    renderMandala(dadosLunar);
  }

  const dropdown = obterContainerRL();
  if (dropdown) dropdown.style.display = 'none';
};

/* Fecha ao clicar fora. Em fase de captura porque o botão da Revolução Solar interrompe a
   propagação do clique (stopPropagation) e o ouvinte normal nunca ficaria sabendo. */
document.addEventListener('click', function(e) {
  const dropdown = obterContainerRL();
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target) && !e.target.closest('button[onclick*="toggleJanelaRL"]')) {
      dropdown.style.display = 'none';
    }
  }
}, true);
