/* ==========================================
   MÓDULO DE ISOPSEFIA HELENÍSTICA
   ========================================== */

const ZODIACO_ISOPSEFIA = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const SIGN_ELEMENTS_ISO = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
const ELEMENT_SIGN_COLORS_ISO = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

const MONOLINE_ZODIAC_SVGS_ISO = [
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="43" y1="12" x2="43" y2="52"></line>`,
  `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="55" x2="64" y2="55"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,52V12c0,0,0-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" points="52,53 57,58 52,63 "></polyline>`,
  `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="1" y1="28" x2="36" y2="63"></line>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
  `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
  `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="7" y1="32" x2="57" y2="32"></line>`
];

function getSignSvgHtmlIso(signIdx, size = 20) {
  if (signIdx < 0 || signIdx > 11) return '-';
  const color = ELEMENT_SIGN_COLORS_ISO[SIGN_ELEMENTS_ISO[signIdx]];
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="color: ${color}; display: inline-block; vertical-align: middle;">${MONOLINE_ZODIAC_SVGS_ISO[signIdx]}</svg>`;
}

const MAPA_FONETICO_ISO = {
  'a': { grego: 'α', nome: 'Alpha', valor: 1 },
  'á': { grego: 'α', nome: 'Alpha', valor: 1 },
  'â': { grego: 'α', nome: 'Alpha', valor: 1 },
  'ã': { grego: 'α', nome: 'Alpha', valor: 1 },
  'à': { grego: 'α', nome: 'Alpha', valor: 1 },
  'b': { grego: 'β', nome: 'Beta', valor: 2 },
  'v': { grego: 'β', nome: 'Beta', valor: 2 },
  'g': { grego: 'γ', nome: 'Gamma', valor: 3 },
  'j': { grego: 'γ', nome: 'Gamma', valor: 3 },
  'd': { grego: 'δ', nome: 'Delta', valor: 4 },
  'e': { grego: 'ε', nome: 'Epsilon', valor: 5 },
  'é': { grego: 'ε', nome: 'Epsilon', valor: 5 },
  'ê': { grego: 'ε', nome: 'Epsilon', valor: 5 },
  'z': { grego: 'ζ', nome: 'Zeta', valor: 7 },
  'h': { grego: 'η', nome: 'Eta', valor: 8 },
  'i': { grego: 'ι', nome: 'Iota', valor: 10 },
  'í': { grego: 'ι', nome: 'Iota', valor: 10 },
  'y': { grego: 'ι', nome: 'Iota', valor: 10 },
  'k': { grego: 'κ', nome: 'Kappa', valor: 20 },
  'c': { grego: 'κ', nome: 'Kappa', valor: 20 },
  'q': { grego: 'κ', nome: 'Kappa', valor: 20 },
  'l': { grego: 'λ', nome: 'Lambda', valor: 30 },
  'm': { grego: 'μ', nome: 'Mu', valor: 40 },
  'n': { grego: 'ν', nome: 'Nu', valor: 50 },
  'x': { grego: 'ξ', nome: 'Xi', valor: 60 },
  'o': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'ó': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'ô': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'õ': { grego: 'ο', nome: 'Omicron', valor: 70 },
  'p': { grego: 'π', nome: 'Pi', valor: 80 },
  'r': { grego: 'ρ', nome: 'Rho', valor: 100 },
  's': { grego: 'σ', nome: 'Sigma', valor: 200 },
  'ç': { grego: 'σ', nome: 'Sigma', valor: 200 },
  't': { grego: 'τ', nome: 'Tau', valor: 300 },
  'u': { grego: 'υ', nome: 'Upsilon', valor: 400 },
  'ú': { grego: 'υ', nome: 'Upsilon', valor: 400 },
  'û': { grego: 'υ', nome: 'Upsilon', valor: 400 },
  'f': { grego: 'φ', nome: 'Phi', valor: 500 },
  'w': { grego: 'ω', nome: 'Omega', valor: 800 }
};

const DIGRAMAS_ISO = {
  'th': { grego: 'θ', nome: 'Theta', valor: 9 },
  'ph': { grego: 'φ', nome: 'Phi', valor: 500 },
  'ps': { grego: 'ψ', nome: 'Psi', valor: 700 },
  'ch': { grego: 'χ', nome: 'Chi', valor: 600 }
};

let isoState = {
  activeTab: "planilha",
  rows: [],
  novoTermo: "",
  singleInput: ""
};

function obterAscendenteIdxMandala() {
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && currentCalculatedData.Ascendente) {
    const absDeg = currentCalculatedData.Ascendente.grau_absoluto;
    return Math.floor(absDeg / 30);
  }
  return 0;
}

function calcularIsopsefiaData(texto) {
  if (!texto) return { bruto: 0, resto: 0, grego: '', passos: [], divisaoInteira: 0 };
  const normalizado = texto.toLowerCase();
  const passos = [];
  let i = 0, bruto = 0, stringGrega = '';

  while (i < normalizado.length) {
    const charAtual = normalizado[i];
    const proximoChar = normalizado[i + 1] || '';
    const par = charAtual + proximoChar;

    if (DIGRAMAS_ISO[par]) {
      const match = DIGRAMAS_ISO[par];
      bruto += match.valor;
      stringGrega += match.grego;
      passos.push({ letra: par.toUpperCase(), grego: match.grego, nome: match.nome, valor: match.valor });
      i += 2;
    } else if (MAPA_FONETICO_ISO[charAtual]) {
      const match = MAPA_FONETICO_ISO[charAtual];
      bruto += match.valor;
      stringGrega += match.grego;
      passos.push({ letra: charAtual.toUpperCase(), grego: match.grego, nome: match.nome, valor: match.valor });
      i++;
    } else {
      if (charAtual !== ' ') {
        passos.push({ letra: charAtual.toUpperCase(), grego: '?', nome: 'Desconhecido', valor: 0 });
      }
      i++;
    }
  }

  const divisaoInteira = Math.floor(bruto / 12);
  let resto = bruto % 12;
  if (resto === 0 && bruto > 0) resto = 12;

  return { bruto, resto, grego: stringGrega, passos, divisaoInteira };
}

function obterAtivacaoAstrologica(resto, ascIdx) {
  if (resto === 0) return { casa: '-', signIdx: -1 };
  const indexSigno = (ascIdx + resto - 1) % 12;
  return { casa: resto, signIdx: indexSigno };
}

/* FUNÇÃO CHAMADA PELO SUPABASE.JS AO CLICAR NO MENU */
function iniciarModuloIsopsefia() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: #dc2626; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para visualizar a Isopsefia.</div>`;
    return;
  }

  renderIsopsefiaUI(container);
}

function renderIsopsefiaUI(container) {
  const ascIdx = obterAscendenteIdxMandala();
  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : (typeof currentSubjectName !== 'undefined' ? currentSubjectName : 'Mapa Ativo');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">
      
      <!-- CABEÇALHO PADRONIZADO -->
      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">${escapeHtml(headerTitle)}</h2>
          <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
            Isopsefia Helenística • Vettius Valens
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #ffffff; padding: 6px 12px; border-radius: 8px; border: 1px solid #d4af37;">
          <span style="font-size: 11px; font-weight: 700; color: #103b70; font-family: 'Cinzel', serif;">ASCENDENTE:</span>
          ${getSignSvgHtmlIso(ascIdx, 22)}
        </div>
      </div>

      <!-- ABAS INTERNAS -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid #cbd5e1; margin-bottom: 20px;">
        <button onclick="mudarAbaIsopsefia('planilha')" style="padding: 10px 16px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 6px 6px 0 0; font-family: 'Cinzel', serif; ${isoState.activeTab === 'planilha' ? 'background: #103b70; color: #fcf6ba;' : 'background: #e2e8f0; color: #475569;'}">Planilha Dinâmica</button>
        <button onclick="mudarAbaIsopsefia('calculadora')" style="padding: 10px 16px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 6px 6px 0 0; font-family: 'Cinzel', serif; ${isoState.activeTab === 'calculadora' ? 'background: #103b70; color: #fcf6ba;' : 'background: #e2e8f0; color: #475569;'}">Análise Passo a Passo</button>
        <button onclick="mudarAbaIsopsefia('referencia')" style="padding: 10px 16px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 6px 6px 0 0; font-family: 'Cinzel', serif; ${isoState.activeTab === 'referencia' ? 'background: #103b70; color: #fcf6ba;' : 'background: #e2e8f0; color: #475569;'}">Tabela Jônica Clássica</button>
      </div>

      <!-- CONTEÚDO DAS ABAS -->
      <div id="isoTabContent">
        ${renderConteudoAbaAtual()}
      </div>

    </div>
  `;
}

function renderConteudoAbaAtual() {
  const ascIdx = obterAscendenteIdxMandala();

  if (isoState.activeTab === 'planilha') {
    return `
      <div style="background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #d4af37; margin-bottom: 16px; display: flex; gap: 8px;">
        <input type="text" id="isoNovoInput" placeholder="Digite o nome..." style="flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;" onkeypress="if(event.key==='Enter') adicionarTermoPlanilha()">
        <button onclick="adicionarTermoPlanilha()" style="background: #103b70; color: #fcf6ba; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">Adicionar</button>
      </div>

      <div style="background: #ffffff; border: 1px solid #d4af37; border-radius: 10px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background: #103b70; color: #fcf6ba; font-family: 'Cinzel', serif;">
              <th style="padding: 12px;">Termo / Nome</th>
              <th style="padding: 12px;">Transliteração Grega</th>
              <th style="padding: 12px; text-align: right;">Soma Bruta</th>
              <th style="padding: 12px; text-align: center;">Fórmula do Resto</th>
              <th style="padding: 12px; text-align: center;">Topos (Resto)</th>
              <th style="padding: 12px; text-align: center;">Signo Ativado</th>
              <th style="padding: 12px; text-align: center;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${isoState.rows.length === 0 ? `
              <tr><td colSpan="7" style="padding: 24px; text-align: center; color: #94a3b8;">Nenhum termo na planilha. Digite acima para começar.</td></tr>
            ` : isoState.rows.map((r, idx) => {
              const calc = calcularIsopsefiaData(r);
              const ativ = obterAtivacaoAstrologica(calc.resto, ascIdx);
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${escapeHtml(r)}</td>
                  <td style="padding: 10px 12px; font-size: 16px; font-family: serif; color: #103b70;">${calc.grego || '-'}</td>
                  <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0284c7;">${calc.bruto}</td>
                  <td style="padding: 10px 12px; text-align: center; color: #64748b; font-family: monospace;">${calc.bruto} - (12 × ${calc.divisaoInteira}) = <strong>${calc.resto}</strong></td>
                  <td style="padding: 10px 12px; text-align: center;"><span style="background: #fef08a; color: #854d0e; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${calc.resto > 0 ? calc.resto + 'º Topos' : '-'}</span></td>
                  <td style="padding: 10px 12px; text-align: center;">${getSignSvgHtmlIso(ativ.signIdx, 22)}</td>
                  <td style="padding: 10px 12px; text-align: center;"><button onclick="removerTermoPlanilha(${idx})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold;">Excluir</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (isoState.activeTab === 'calculadora') {
    const calc = calcularIsopsefiaData(isoState.singleInput);
    const ativ = obterAtivacaoAstrologica(calc.resto, ascIdx);
    return `
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 2; min-width: 280px; background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #d4af37;">
          <label style="font-size: 11px; font-weight: 700; color: #103b70; display: block; margin-bottom: 6px; font-family: 'Cinzel', serif;">DIGITE O NOME PARA DECOMPOSIÇÃO DETALHADA:</label>
          <input type="text" value="${escapeHtml(isoState.singleInput)}" oninput="atualizarSingleInput(this.value)" placeholder="Ex: Alexandros" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600; outline: none; margin-bottom: 20px;">

          <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
            <div style="background: #f8fafc; padding: 10px 14px; font-weight: 700; font-size: 12px; border-bottom: 1px solid #cbd5e1; color: #334155; font-family: 'Cinzel', serif;">Decomposição Letra por Letra</div>
            ${calc.passos.length === 0 ? '<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">Digite um nome para ver a análise.</div>' : calc.passos.map(p => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">
                <div><strong>${p.letra}</strong> → <span style="font-size: 16px; color: #103b70; font-family: serif; font-weight: bold;">${p.grego}</span> <small style="color: #64748b;">(${p.nome})</small></div>
                <div style="font-family: monospace; font-weight: 700; color: #1e293b;">+ ${p.valor}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 16px;">
          <div style="background: #103b70; color: #ffffff; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #d4af37;">
            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; font-family: 'Cinzel', serif;">Palavra em Grego</span>
            <div style="font-size: 28px; font-family: serif; font-weight: bold; margin: 8px 0; color: #fcf6ba;">${calc.grego || '-'}</div>
            <div style="display: flex; justify-content: space-around; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px;">
              <div><small style="display:block; opacity:0.8; font-size:10px;">SOMA</small><strong style="font-size:18px;">${calc.bruto}</strong></div>
              <div><small style="display:block; opacity:0.8; font-size:10px;">RESTO</small><strong style="font-size:18px; color: #fcf6ba;">${calc.resto}</strong></div>
            </div>
          </div>

          <div style="background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #d4af37; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Ascendente:</span>${getSignSvgHtmlIso(ascIdx, 20)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Topos Ativado:</span><strong style="color: #854d0e;">${calc.resto > 0 ? calc.resto + 'º Topos' : '-'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
              <span style="color: #64748b;">Signo Ativado:</span>${getSignSvgHtmlIso(ativ.signIdx, 20)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (isoState.activeTab === 'referencia') {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
        ${Object.entries(MAPA_FONETICO_ISO).reduce((acc, [latino, dados]) => {
          if (!acc.find(item => item.grego === dados.grego)) acc.push({ ...dados, latino: latino.toUpperCase() });
          return acc;
        }, []).map(item => `
          <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #d4af37; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="font-size: 14px; color: #1e293b;">${item.latino}</strong>
              <div style="font-size: 18px; color: #103b70; font-family: serif;">${item.grego}</div>
              <small style="font-size: 10px; color: #64748b;">${item.nome}</small>
            </div>
            <div style="background: #fef08a; color: #854d0e; font-family: monospace; font-weight: 800; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${item.valor}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/* EVENTOS E INTERAÇÕES DA ISOPSEFIA */
function mudarAbaIsopsefia(aba) {
  isoState.activeTab = aba;
  iniciarModuloIsopsefia();
}

function adicionarTermoPlanilha() {
  const input = document.getElementById('isoNovoInput');
  if (!input || !input.value.trim()) return;
  isoState.rows.push(input.value.trim());
  iniciarModuloIsopsefia();
}

function removerTermoPlanilha(idx) {
  isoState.rows.splice(idx, 1);
  iniciarModuloIsopsefia();
}

function atualizarSingleInput(val) {
  isoState.singleInput = val;
  const content = document.getElementById('isoTabContent');
  if (content) content.innerHTML = renderConteudoAbaAtual();
}
