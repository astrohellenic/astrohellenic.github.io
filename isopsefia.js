/* ==========================================
   MÓDULO DE ISOPSEFIA HELENÍSTICA
   ========================================== */

const ZODIACO_ISOPSEFIA = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

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

function obterAscendenteMandala() {
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && currentCalculatedData.Ascendente) {
    const absDeg = currentCalculatedData.Ascendente.grau_absoluto;
    const signIdx = Math.floor(absDeg / 30);
    return ZODIACO_ISOPSEFIA[signIdx] || "Áries";
  }
  return "Áries";
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

function obterAtivacaoAstrologica(resto, ascendente) {
  if (resto === 0) return { casa: '-', signo: '-' };
  const ascIndex = ZODIACO_ISOPSEFIA.indexOf(ascendente);
  const indexSigno = (ascIndex + resto - 1) % 12;
  return { casa: resto, signo: ZODIACO_ISOPSEFIA[indexSigno] };
}

/* FUNÇÃO CHAMADA PELO SUPABASE.JS AL CLICAR NO MENU */
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
  const ascAtual = obterAscendenteMandala();
  const headerTitle = currentCustomCode ? `${currentCustomCode} - ${currentSubjectName}` : (typeof currentSubjectName !== 'undefined' ? currentSubjectName : 'Mapa Ativo');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; overflow-y: auto; padding: 20px; background-color: var(--bg-main, #f8fafc); font-family: 'Montserrat', sans-serif;">
      
      <!-- CABEÇALHO PADRONIZADO (ESTILO PROFECÇÃO/DECÊNIOS) -->
      <div style="background: #fffdf5; padding: 16px 20px; border-radius: 14px; border: 1.5px solid #d4af37; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 800; color: #103b70; margin: 0; text-transform: uppercase;">${escapeHtml(headerTitle)}</h2>
          <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px;">
            Isopsefia Helenística • Vettius Valens
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #ffffff; padding: 6px 12px; border-radius: 8px; border: 1px solid #d4af37;">
          <span style="font-size: 11px; font-weight: 700; color: #103b70; font-family: 'Cinzel', serif;">ASCENDENTE:</span>
          <strong style="font-size: 12px; color: #1e293b;">${ascAtual}</strong>
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
  const ascAtual = obterAscendenteMandala();

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
              const ativ = obterAtivacaoAstrologica(calc.resto, ascAtual);
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${escapeHtml(r)}</td>
                  <td style="padding: 10px 12px; font-size: 16px; font-family: serif; color: #103b70;">${calc.grego || '-'}</td>
                  <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0284c7;">${calc.bruto}</td>
                  <td style="padding: 10px 12px; text-align: center; color: #64748b; font-family: monospace;">${calc.bruto} - (12 × ${calc.divisaoInteira}) = <strong>${calc.resto}</strong></td>
                  <td style="padding: 10px 12px; text-align: center;"><span style="background: #fef08a; color: #854d0e; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${calc.resto > 0 ? calc.resto + 'º Topos' : '-'}</span></td>
                  <td style="padding: 10px 12px; text-align: center;"><span style="background: #e0f2fe; color: #103b70; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${ativ.signo}</span></td>
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
    const ativ = obterAtivacaoAstrologica(calc.resto, ascAtual);
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
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Ascendente:</span><strong>${ascAtual}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Topos Ativado:</span><strong style="color: #854d0e;">${calc.resto > 0 ? calc.resto + 'º Topos' : '-'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
              <span style="color: #64748b;">Signo Ativado:</span><strong style="color: #103b70;">${ativ.signo}</strong>
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
