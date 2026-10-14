/* ==========================================
   FASES DA VIDA PELOS REGENTES DA TRIPLICIDADE (FERRAMENTA DE TESTE)
   Doroteu I.22 e I.10 (estrutura), Valens II.1 e VII.2 (instrumento de tempo).
   A regra exata de qual signo conta é hipótese em teste: por isso os três cálculos (A, B, C) ficam lado a lado.
   As funções de cálculo (topo do arquivo) não mexem na tela: dá pra testar em Node (ver module.exports no fim).
   ========================================== */

const FV_SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const FV_ELEMENTOS = ['fogo', 'terra', 'ar', 'água'];                       // elemento do signo i = FV_ELEMENTOS[i % 4]
const FV_ELEMENTO_ROTULO = { fogo: 'Fogo', terra: 'Terra', ar: 'Ar', 'água': 'Água' };
const FV_OBLIQUIDADE = 23.44;

const FV_PLANETAS = {
  Sun:     { nome: 'Sol',      chave: 'Sol',      anosMenores: 19 },
  Moon:    { nome: 'Lua',      chave: 'Lua',      anosMenores: 25 },
  Mercury: { nome: 'Mercúrio', chave: 'Mercúrio', anosMenores: 20 },
  Venus:   { nome: 'Vênus',    chave: 'Vênus',    anosMenores: 8 },
  Mars:    { nome: 'Marte',    chave: 'Marte',    anosMenores: 15 },
  Jupiter: { nome: 'Júpiter',  chave: 'Júpiter',  anosMenores: 12 },
  Saturn:  { nome: 'Saturno',  chave: 'Saturno',  anosMenores: 30 }
};

/* Regentes da triplicidade (Doroteu): [primeiro, segundo, participante] */
const FV_TRIPLICIDADE = {
  fogo:   { dia: ['Sun', 'Jupiter', 'Saturn'],  noite: ['Jupiter', 'Sun', 'Saturn'] },
  terra:  { dia: ['Venus', 'Moon', 'Mars'],     noite: ['Moon', 'Venus', 'Mars'] },
  ar:     { dia: ['Saturn', 'Mercury', 'Jupiter'], noite: ['Mercury', 'Saturn', 'Jupiter'] },
  'água': { dia: ['Venus', 'Mars', 'Moon'],     noite: ['Mars', 'Venus', 'Moon'] }
};

const FV_DOMICILIO = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const FV_EXALTACAO = { Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6 };   // signo de exaltação
const FV_SIMBOLO_ID = { '☉': 'Sun', '☽': 'Moon', '☿': 'Mercury', '♀': 'Venus', '♂': 'Mars', '♃': 'Jupiter', '♄': 'Saturn' };

/* Tempo de ascensão de cada signo (em anos = graus de ascensão) na latitude dada, por ascensão oblíqua:
   OA(λ) = RA(λ) − AD, AD = asin(tan δ · tan φ). Latitude com sinal (sul = negativa). Devolve { tempos[12], polar }. */
function fvTemposAscensao(latGraus) {
  const rad = Math.PI / 180;
  const eps = FV_OBLIQUIDADE * rad;
  const tanPhi = Math.tan(latGraus * rad);
  let polar = false;
  const oa = (lambdaGraus) => {
    const lam = lambdaGraus * rad;
    let ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    if (ra < 0) ra += 2 * Math.PI;
    if (lambdaGraus >= 360) ra = 2 * Math.PI;                       // 360° = volta completa (atan2 devolveria 0)
    const delta = Math.asin(Math.sin(eps) * Math.sin(lam));
    let x = Math.tan(delta) * tanPhi;
    if (x > 1) { x = 1; polar = true; } else if (x < -1) { x = -1; polar = true; }
    return (ra - Math.asin(x)) / rad;
  };
  const tempos = [];
  for (let i = 0; i < 12; i++) tempos.push(oa((i + 1) * 30) - oa(i * 30));
  return { tempos, polar };
}

/* Seita do planeta: Sol, Júpiter e Saturno são diurnos; Lua, Vênus e Marte, noturnos; Mercúrio é diurno quando oriental
   (nasce antes do Sol, ou seja, está antes dele no zodíaco) e noturno quando ocidental. */
function fvDoDia(idPlaneta, absGraus, sunAbs) {
  if (idPlaneta === 'Mercury') return ((sunAbs - absGraus + 360) % 360) < 180;
  return ['Sun', 'Jupiter', 'Saturn'].includes(idPlaneta);
}

/* Dignidades de um planeta numa posição absoluta (0–360). isDia: seita do mapa (pra triplicidade). */
function fvDignidades(idPlaneta, absGraus, isDia, sunAbs) {
  const s = Math.floor(absGraus / 30) % 12;
  const g = absGraus - s * 30;
  const lista = [];
  if (FV_DOMICILIO[s] === idPlaneta) lista.push('domicílio');
  if (FV_EXALTACAO[idPlaneta] === s) lista.push('exaltação');
  const trip = FV_TRIPLICIDADE[FV_ELEMENTOS[s % 4]][isDia ? 'dia' : 'noite'];
  const posTrip = trip.indexOf(idPlaneta);
  if (posTrip >= 0) lista.push('triplicidade');
  if (fvDoDia(idPlaneta, absGraus, sunAbs) === isDia) lista.push('seita');
  if (typeof EGYPTIAN_TERMS !== 'undefined' && EGYPTIAN_TERMS[s]) {
    const faixa = EGYPTIAN_TERMS[s].find(t => g < t.deg);
    if (faixa && FV_SIMBOLO_ID[faixa.p] === idPlaneta) lista.push('termo');
  }
  const opostoExaltacao = FV_EXALTACAO[idPlaneta] !== undefined && (FV_EXALTACAO[idPlaneta] + 6) % 12 === s;
  if (opostoExaltacao) lista.push('queda (debilidade)');
  return lista;
}

/* Cálculo completo. entrada: { dados (currentCalculatedData), lat, nascimento (Date), fonte: 'luminar' | 'sizigia', hoje (Date) }.
   Devolve null se faltar dado. */
function fvCalcularFases(entrada) {
  const d = entrada.dados;
  if (!d || !d.Ascendente || !d.Sol || !d.Lua) return null;
  const ascAbs = d.Ascendente.grau_absoluto;
  const sunAbs = d.Sol.grau_absoluto;
  const isDia = ((sunAbs - ascAbs + 360) % 360) >= 180;               // Sol acima do horizonte (casas 7–12)
  const fonte = entrada.fonte === 'sizigia' && d.Sizigia ? 'sizigia' : 'luminar';
  const luminarId = isDia ? 'Sun' : 'Moon';
  const refAbs = fonte === 'sizigia' ? d.Sizigia.grau_absoluto : (isDia ? sunAbs : d.Lua.grau_absoluto);
  const signoRef = Math.floor(refAbs / 30) % 12;
  const elemento = FV_ELEMENTOS[signoRef % 4];
  const [id1, id2, idPart] = FV_TRIPLICIDADE[elemento][isDia ? 'dia' : 'noite'];
  const signoAsc = Math.floor(ascAbs / 30) % 12;
  const { tempos, polar } = fvTemposAscensao(entrada.lat);

  const descrever = (id) => {
    const abs = d[FV_PLANETAS[id].chave].grau_absoluto;
    const signo = Math.floor(abs / 30) % 12;
    return {
      id, nome: FV_PLANETAS[id].nome, abs, signo, signoNome: FV_SIGNOS[signo],
      grau: Math.floor(abs % 30), minuto: Math.floor(((abs % 30) % 1) * 60),
      casa: ((signo - signoAsc + 12) % 12) + 1,
      condicaoCasa: ['angular', 'sucedente', 'cadente'][((signo - signoAsc + 12) % 12) % 3],   // casas 1,4,7,10 angulares; 2,5,8,11 sucedentes; 3,6,9,12 cadentes
      regidoPor: FV_PLANETAS[FV_DOMICILIO[signo]].nome,
      dignidades: fvDignidades(id, abs, isDia, sunAbs)
    };
  };
  const reg1 = descrever(id1), reg2 = descrever(id2), part = descrever(idPart);

  const maisDias = (anos) => new Date(entrada.nascimento.getTime() + anos * 365.25 * 86400000);
  const idadeHoje = (entrada.hoje.getTime() - entrada.nascimento.getTime()) / (365.25 * 86400000);

  const regenteDoSigno = FV_PLANETAS[FV_DOMICILIO[reg1.signo]];
  const calculos = [
    { chave: 'A', titulo: 'A — Ascensão do signo do 1º regente',
      fonte: 'Ao completar o tempo de ascensão do signo onde está o primeiro regente.',
      idade: tempos[reg1.signo],
      conta: `${reg1.signoNome}: ${tempos[reg1.signo].toFixed(1)}`, signoConta: reg1.signo },
    { chave: 'B', titulo: 'B — Ascensão do signo do 2º regente, Valens II.1',
      fonte: 'No tempo de ascensão do signo onde está o segundo regente.',
      idade: tempos[reg2.signo],
      conta: `${reg2.signoNome}: ${tempos[reg2.signo].toFixed(1)}`, signoConta: reg2.signo },
    { chave: 'C', titulo: 'C — Maior entre ascensão e anos menores, Valens VII.2',
      fonte: 'O maior valor entre o tempo de ascensão do signo do primeiro regente e os anos menores do regente desse signo.',
      idade: Math.max(tempos[reg1.signo], regenteDoSigno.anosMenores),
      conta: `maior entre ${tempos[reg1.signo].toFixed(1)} (${reg1.signoNome}) e ${regenteDoSigno.anosMenores} (anos menores de ${regenteDoSigno.nome}, regente de ${reg1.signoNome})`,
      signoConta: reg1.signo, anosMenores: regenteDoSigno.anosMenores, regenteId: FV_DOMICILIO[reg1.signo] }
  ];
  calculos.forEach(c => { c.data = maisDias(c.idade); c.fase = idadeHoje < c.idade ? 1 : 2; });

  return { isDia, fonte, luminarId, signoRef, elemento, reg1, reg2, part, tempos, polar, calculos, idadeHoje, hoje: entrada.hoje, nascimento: entrada.nascimento };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fvTemposAscensao, fvDignidades, fvCalcularFases, FV_SIGNOS };
}

/* ==========================================
   TELA
   ========================================== */
let fvFonteEscolhida = 'luminar';

function iniciarModuloFasesVida() {
  const container = document.getElementById('mandala-container');
  if (!container) return;
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--preto-tinta); opacity: .75; font-size: 13px; font-weight: 600;">Carregue um mapa de cliente no menu lateral para ver as Fases da Vida.</div>`;
    return;
  }
  renderFasesVidaUI(container);
}

function fvEscolherFonte(valor) {
  fvFonteEscolhida = valor === 'sizigia' ? 'sizigia' : 'luminar';
  const container = document.getElementById('mandala-container');
  if (container) renderFasesVidaUI(container);
}
if (typeof window !== "undefined") window.fvEscolherFonte = fvEscolherFonte;

function fvFmtData(d) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fvFmtAnos(n) { return n.toFixed(1).replace('.', ',') + ' anos'; }
function fvNum(n, casas) { return n.toFixed(casas).replace('.', ','); }

/* Ícone do planeta / do signo no padrão do software: só o ícone; o nome ao lado só com os rótulos ligados (planetaComNome / signoComNome). */
function fvPlaneta(id, tam) {
  return (typeof planetaComNome === 'function') ? planetaComNome(id, tam || 24) : FV_PLANETAS[id].nome;
}
function fvSigno(idx, tam) {
  if (typeof signoComNome === 'function' && typeof getSignSvgHtmlDec === 'function') return signoComNome(getSignSvgHtmlDec(idx, tam || 20), idx);
  return FV_SIGNOS[idx];
}
const FV_LINHA = 'display:inline-flex; align-items:center; gap:6px; vertical-align:middle;';

function fvLinhaPlaneta(papel, p) {
  const partes = [];
  if (!p.dignidades.includes('domicílio')) partes.push(`regido por <span style="${FV_LINHA}">${fvPlaneta(FV_PLANETAS_ID[p.regidoPor], 20)}</span>`);
  p.dignidades.forEach(d => partes.push(d));
  return `
    <div style="padding:8px 0;">
      <span class="rotulo">${papel}</span>
      <div style="${FV_LINHA} font-size:13px; margin-top:3px; flex-wrap:wrap;">
        ${fvPlaneta(p.id, 26)} <span>em</span> ${fvSigno(p.signo, 22)} <span>${p.grau}°${String(p.minuto).padStart(2, '0')}'</span>
        <span>· casa ${p.casa} · ${p.condicaoCasa}</span>
      </div>
      ${partes.length ? `<div class="texto-apagado" style="font-size:11.5px; margin-top:3px;">${partes.join(' · ')}</div>` : ''}
    </div>`;
}
const FV_PLANETAS_ID = {};
Object.keys(FV_PLANETAS).forEach(id => { FV_PLANETAS_ID[FV_PLANETAS[id].nome] = id; });

function fvLinhaDoTempo(c, r) {
  const MAX = 90;
  const pc = (anos) => Math.max(0, Math.min(100, (anos / MAX) * 100));
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(a =>
    `<span style="position:absolute; left:${pc(a)}%; transform:translateX(-50%); font-size:9.5px; top:30px;">${a}</span>`).join('');
  return `
    <div style="position:relative; height:46px; margin:10px 6px 0;">
      <div style="position:absolute; left:0; width:${pc(c.idade)}%; top:8px; height:14px; border:1px solid var(--azul-egipcio-claro); box-sizing:border-box;" title="Fase 1"></div>
      <div style="position:absolute; left:${pc(c.idade)}%; right:0; top:8px; height:14px; border:1px solid var(--azul-egipcio-claro); border-left:3px solid var(--terracota); box-sizing:border-box;" title="Fase 2"></div>
      <div style="position:absolute; left:${pc(r.idadeHoje)}%; top:0; height:30px; width:0; border-left:2px solid var(--preto-tinta);" title="Hoje"></div>
      <span style="position:absolute; left:${pc(r.idadeHoje)}%; top:-12px; transform:translateX(-50%); font-size:9.5px; font-weight:700;">hoje</span>
      ${ticks}
    </div>`;
}

function fvConta(c, r) {
  const t = fvNum(r.tempos[c.signoConta], 1);
  if (c.chave !== 'C') return `<span style="${FV_LINHA}">${fvSigno(c.signoConta, 20)} <span>${t} anos de ascensão</span></span>`;
  return `<span style="${FV_LINHA} flex-wrap:wrap;">maior entre ${t} anos de ascensão de ${fvSigno(c.signoConta, 20)} e ${c.anosMenores} anos menores de ${fvPlaneta(c.regenteId, 20)}, que rege ${fvSigno(c.signoConta, 20)}</span>`;
}

function fvCartaoCalculo(c, r) {
  const ativoF1 = c.fase === 1;
  const quem = (reg) => `<span style="${FV_LINHA}">${fvPlaneta(reg.id, 22)} <span>com</span> ${fvPlaneta(r.part.id, 22)}</span>`;
  return `
    <div class="cartao">
      <div class="cabeca-cartao">
        <span class="nome-nivel">${c.titulo}</span>
        <span class="selo">${fvFmtAnos(c.idade)}</span>
      </div>
      <div class="texto-apagado" style="font-size:11.5px; margin-bottom:8px;">${c.fonte}</div>
      <div style="font-size:12.5px; margin-bottom:4px;">Conta: ${fvConta(c, r)}</div>
      <div style="font-size:13px; margin-bottom:2px;"><strong>Troca em ${fvFmtData(c.data)}</strong></div>
      <div class="texto-apagado" style="font-size:11px; margin-bottom:6px;">Nascimento + ${fvNum(c.idade, 2)} anos × 365,25 dias.</div>
      <div class="linha-info" style="line-height:1.9;">
        <div><strong>Fase 1</strong>${ativoF1 ? ' <span class="selo">hoje</span>' : ''} ${quem(r.reg1)}: de ${fvFmtData(r.nascimento)} até ${fvFmtData(c.data)}.</div>
        <div><strong>Fase 2</strong>${!ativoF1 ? ' <span class="selo">hoje</span>' : ''} ${quem(r.reg2)}: de ${fvFmtData(c.data)} até o fim da vida.</div>
      </div>
      ${fvLinhaDoTempo(c, r)}
    </div>`;
}

function renderFasesVidaUI(container) {
  const lat = (typeof currentGeo !== 'undefined' && currentGeo && currentGeo.lat !== undefined) ? currentGeo.lat : -23.5505;
  const r = fvCalcularFases({
    dados: currentCalculatedData, lat, nascimento: new Date(currentMoment), fonte: fvFonteEscolhida, hoje: new Date()
  });
  if (!r) {
    container.innerHTML = `<div style="padding: 24px; text-align: center;">Não foi possível calcular: dados do mapa incompletos.</div>`;
    return;
  }

  const fonteUsada = r.fonte === 'sizigia'
    ? `Sizígia pré-natal: <span style="${FV_LINHA}">${fvSigno(r.signoRef, 22)}</span>`
    : `Luminar da seita: <span style="${FV_LINHA}">${fvPlaneta(r.luminarId, 24)} ${fvSigno(r.signoRef, 22)}</span>`;
  const temSizigia = !!(currentCalculatedData.Sizigia);

  const tabelaAscensao = `
    <table class="tabela-epoca">
      <tr><th>Signo</th><th class="centro">Tempo de ascensão</th></tr>
      ${r.tempos.map((t, i) => `<tr><td>${fvSigno(i, 20)}</td><td class="centro">${fvNum(t, 1)}</td></tr>`).join('')}
      <tr><td><strong>Soma</strong></td><td class="centro"><strong>${fvNum(r.tempos.reduce((a, b) => a + b, 0), 1)}</strong></td></tr>
    </table>`;

  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column;">
      <div id="fases-vida-container" class="painel" style="width: 100%; font-family: 'Montserrat', sans-serif;">
        <div class="cabeca-ferramenta"><h3 class="titulo-ferramenta">Fases da Vida — Regentes da Triplicidade</h3><div class="acoes-ferramenta">
          <button type="button" onclick="salvarFasesVidaNaGaleria()" title="Salvar as Fases da Vida como imagem na galeria (com título e cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
          </button>
          <button type="button" onclick="capturarFasesVidaParaRelatorio()" title="Adicionar ao Relatório (sem cabeçalho)" class="botao-icone">
            <svg class="icone" viewBox="0 0 64 64"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
          </button>
        </div></div>
        <div style="text-align:center; margin-bottom:8px;"><span class="selo">ferramenta de teste</span></div>
        ${(typeof montarCabecalhoMandalaImagemHTML === 'function') ? montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { tintaSobreFolha: true }) : ''}

        <div id="fasesVidaResultsArea">
        <hr class="divisa">
        <h3 class="titulo-secao">Fonte e seita</h3>
        <div style="display:flex; flex-wrap:wrap; gap:18px; font-size:13px; margin-bottom:10px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="radio" name="fvFonte" value="luminar" ${r.fonte === 'luminar' ? 'checked' : ''} onchange="fvEscolherFonte('luminar')"> Luminar da seita
          </label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="radio" name="fvFonte" value="sizigia" ${r.fonte === 'sizigia' ? 'checked' : ''} ${temSizigia ? '' : 'disabled'} onchange="fvEscolherFonte('sizigia')"> Signo da sizígia pré-natal
          </label>
        </div>
        <div style="font-size:13px; line-height:2;">
          <div>Seita: <strong>${r.isDia ? 'diurna' : 'noturna'}</strong></div>
          <div>Fonte usada: ${fonteUsada}</div>
          <div class="texto-apagado" style="font-size:11.5px;">Latitude usada nos tempos de ascensão: ${fvNum(lat, 2)}°${r.polar ? ' — latitude polar: algum signo não nasce/se põe, resultado aproximado.' : ''}</div>
        </div>

        <hr class="divisa">
        <h3 class="titulo-secao">Regentes (tabela de Doroteu)</h3>
        <div class="grade-cartoes">
          <div class="cartao">
            ${fvLinhaPlaneta('Primeiro regente, fase 1', r.reg1)}
            ${fvLinhaPlaneta('Segundo regente, fase 2', r.reg2)}
            ${fvLinhaPlaneta('Participante, ajuda nas duas fases', r.part)}
          </div>
        </div>

        <hr class="divisa">
        <h3 class="titulo-secao">Idade da troca, três cálculos</h3>
        <div class="grade-cartoes">
          ${r.calculos.map(c => fvCartaoCalculo(c, r)).join('')}
        </div>
        <div class="texto-apagado" style="font-size:11.5px; margin-top:10px;">Hoje: ${fvFmtData(r.hoje)}, idade ${fvFmtAnos(r.idadeHoje)}. A vida tem duas fases; não existe terceira. Escala das barras: 0 a 90 anos.</div>

        <hr class="divisa">
        <h3 class="titulo-secao">Tempos de ascensão em anos</h3>
        <div class="envolve-tabela">${tabelaAscensao}</div>

        <hr class="divisa">
        <div class="texto-apagado" style="font-size:11.5px; line-height:1.55;">
          <strong>Fontes.</strong> A estrutura de início e fim da vida vem de Doroteu I.22 e I.10. O instrumento de tempo vem de Valens II.1 e VII.2.
          A regra exata de qual signo conta é hipótese em teste. Os tempos de ascensão são calculados por ascensão oblíqua, com obliquidade de 23,44° e 1 grau de ascensão igual a 1 ano.
          As tabelas antigas, como a de Valens com Áries 20, Câncer 33 e Capricórnio 27, são aproximações e ficam de 1 a 3 anos abaixo.
        </div>
        </div>
        <hr class="divisa-fim">
      </div>
    </div>`;
}

/* O html2canvas desenha a bolinha (radio) do navegador, com fundo branco, ignorando o estilo do papiro (transparente, contorno azul egípcio,
   miolo terracota). Durante a captura as bolinhas são trocadas por um desenho igual ao da tela; no fim voltam as originais. */
function fvTrocarRadiosParaCaptura(area) {
  const trocas = [];
  area.querySelectorAll('input[type="radio"]').forEach(inp => {
    const cs = getComputedStyle(inp);
    const bolinha = document.createElement('span');
    bolinha.style.cssText = `display:inline-block; position:relative; flex:0 0 auto; box-sizing:border-box; width:${inp.offsetWidth || 16}px; height:${inp.offsetHeight || 16}px; border-radius:50%; background:transparent; border:1.5px solid ${cs.borderTopColor};`;
    if (inp.checked) {
      const miolo = document.createElement('span');
      miolo.style.cssText = 'position:absolute; left:3px; top:3px; width:7px; height:7px; border-radius:50%; background:var(--terracota, #A03E25);';
      bolinha.appendChild(miolo);
    }
    inp.replaceWith(bolinha);
    trocas.push({ inp, bolinha });
  });
  return () => trocas.forEach(t => { if (t.bolinha.parentNode) t.bolinha.replaceWith(t.inp); });
}

/* Botão de galeria: título + cabeçalho padrão + resultados, SÓ AO TOCAR (mesmo padrão dos Decênios). */
function salvarFasesVidaNaGaleria() {
  const area = document.getElementById('fasesVidaResultsArea');
  if (!area) return;
  capturarESalvarNaGaleria(
    async () => {
      const voltar = fvTrocarRadiosParaCaptura(area);
      try { return await gerarImagemHtmlComCabecalho(area, { titulo: 'FASES DA VIDA', comCabecalho: true, papiro: true }); }
      finally { voltar(); }
    },
    `Astro_Hellenic_Fases_da_Vida_${(currentSubjectName || 'mapa').replace(/\s+/g, '_')}.png`
  );
}
if (typeof window !== "undefined") window.salvarFasesVidaNaGaleria = salvarFasesVidaNaGaleria;

/* Manda pro Relatório SÓ os resultados (sem título nem cabeçalho). */
async function capturarFasesVidaParaRelatorio() {
  const area = document.getElementById('fasesVidaResultsArea');
  if (!area) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
  const voltarRadios = fvTrocarRadiosParaCaptura(area);
  try {
    const papiro = window.temaMandala === 'ceu';
    const modoEscuro = !papiro && document.documentElement.classList.contains('tema-escuro');
    const fundo = papiro ? null : (modoEscuro ? '#1c1917' : fundoPainelClaro()); // Tema Céu: imagem sem fundo
    const canvas = recortarCanvasAoConteudo(await gerarImagemHtmlComCabecalho(area, { comCabecalho: false, papiro: true }), fundo);
    const total = adicionarCapturaRelatorio('fasesVida', canvas.toDataURL('image/png'));
    alert(`"Fases da Vida" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
  } catch (err) {
    console.error('Erro ao adicionar as Fases da Vida ao relatório:', err);
    alert('Não foi possível adicionar esta tela ao relatório.');
  } finally {
    voltarRadios();
  }
}
if (typeof window !== "undefined") window.capturarFasesVidaParaRelatorio = capturarFasesVidaParaRelatorio;
