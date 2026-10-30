/* ==========================================================
   CAMADAS DO TEMPO — peças comuns das ferramentas de períodos em níveis
   (Liberação Zodiacal, Decênios e as que vierem).

   1) BARRINHA DO TEMPO de cada período: vazia antes de começar, cheia depois de terminar, enchendo durante.
      Cor vai de azul (começo) a ocre (metade) a terracota (fim), como a barra do site Falando de Astrologia,
      lendo as cores do tema em uso (claro, escuro ou Céu). Filete fino, só contorno + preenchimento.
      Uma linha só: "62% [barra] 11/20 meses" (quanto já passou do total, na unidade do nível).
   2) CABEÇALHO DO NÍVEL ABERTO na navegação em camadas: "← Nível 2: glifo ▾ →", datas e a barrinha;
      a setinha abre a lista de todos os períodos daquele nível.
   3) BUSCA POR DATA ("Ir para a data"): calendário + campo + botão Ir (+ Hoje quando há data escolhida).

   Quem usa passa o que é próprio da ferramenta (glifo, formato da data, nome da função que abre o período).
   Mexeu aqui? Conferir a Liberação e os Decênios. */

function corDoTempo(f) {
  const css = getComputedStyle(document.documentElement);
  const rgb = (nome, padrao) => {
    const m = (css.getPropertyValue(nome).trim() || padrao).match(/^#?([0-9a-f]{6})$/i);
    const n = parseInt((m ? m[1] : padrao.slice(1)), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = rgb('--azul-egipcio-claro', '#1F5FA3'), O = rgb('--ocre', '#B5852F'), T = rgb('--terracota', '#A03E25');
  const de = f < 0.5 ? A : O, para = f < 0.5 ? O : T, t = f < 0.5 ? f / 0.5 : (f - 0.5) / 0.5;
  return `rgb(${de.map((c, k) => Math.round(c + (para[k] - c) * t)).join(',')})`;
}

const UNIDADES_TEMPO = {
  anos: { ms: 360 * 86400000, um: 'ano', varios: 'anos' },
  meses: { ms: 30 * 86400000, um: 'mês', varios: 'meses' },
  dias: { ms: 86400000, um: 'dia', varios: 'dias' },
  horas: { ms: 3600000, um: 'hora', varios: 'horas' }
};
function numeroTempo(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','); }

/* unidade ('anos', 'meses', 'dias' ou 'horas'): no fim da barra aparece quanto já passou do total, na unidade do nível (ex.: 11/20 meses). */
function barraTempo(inicio, fim, estilo, tamanhoLetra, unidade) {
  const agora = new Date();
  const f = Math.max(0, Math.min(1, (agora - inicio) / (fim - inicio)));
  const cor = corDoTempo(f);
  const pct = agora >= fim ? 100 : Math.floor(f * 100);
  const h = (estilo && /height:\s*3px/.test(estilo)) ? 3 : 5;
  const u = UNIDADES_TEMPO[unidade];
  const total = u ? Math.round(((fim - inicio) / u.ms) * 2) / 2 : 0;
  const passou = u ? Math.floor(Math.min(f * total, total)) : 0;
  const fimTexto = u ? `<span style="font-size: ${tamanhoLetra || 11}px; line-height: 1; white-space: nowrap; color: ${cor};">${numeroTempo(passou)}/${numeroTempo(total)} ${total === 1 ? u.um : u.varios}</span>` : '';
  return `<div style="display: flex; align-items: center; gap: 6px; ${(estilo || '').replace(/height:\s*3px;?/, '')}"><span style="font-size: ${tamanhoLetra || 11}px; font-weight: 700; min-width: 34px; text-align: right; line-height: 1; color: ${cor};">${pct}%</span><div style="flex: 1; height: ${h}px; border: 1px solid ${cor}; box-sizing: content-box;"><div style="height: 100%; width: ${(f * 100).toFixed(2)}%; background: ${cor};"></div></div>${fimTexto}</div>`;
}

/* Linha de tabela só com a barrinha, logo embaixo da linha do período. colunas = quantas colunas a tabela tem. */
function linhaBarraTempo(inicio, fim, unidade, colunas) {
  return `<tr class="zr-barra"><td colspan="${colunas || 5}">${barraTempo(inicio, fim, 'height: 3px;', 9, unidade)}</td></tr>`;
}

/* Cabeçalho do nível aberto. Opções:
   - id: prefixo do menu (o menu fica em id + 'MenuNivel' + n); n: número do nível; lista/idx: períodos e o aberto;
   - fnIr: nome da função global que abre o período de índice i; glifo(item, tam): HTML do glifo; fmtData(data);
   - unidade: da barrinha; inicio(item)/fim(item): opcionais (padrão item.start / item.end). */
function cabecalhoNivelTempo(o) {
  const ini = o.inicio || (x => x.start), fim = o.fim || (x => x.end);
  const x = o.lista[o.idx];
  const seta = (dir) => {
    const destino = o.idx + dir;
    const fora = destino < 0 || destino >= o.lista.length;
    return `<button type="button" class="botao-icone"${fora ? ' disabled style="opacity: .35; cursor: default;"' : ` onclick="${o.fnIr}(${destino})"`} title="${dir < 0 ? 'Anterior' : 'Próximo'}"><svg class="icone" viewBox="0 0 64 64"><polyline points="${dir < 0 ? '40,12 20,32 40,52' : '24,12 44,32 24,52'}"/></svg></button>`;
  };
  const itens = o.lista.map((y, i) => `<div class="item-menu${i === o.idx ? ' ativa' : ''}" onclick="${o.fnIr}(${i})" style="display: flex; align-items: center; gap: 10px; justify-content: space-between;"><span style="display: flex; align-items: center; gap: 6px;">${o.glifo(y, 20)}</span><span class="texto-apagado" style="font-size: 12px; white-space: nowrap;">${o.fmtData(ini(y))} a ${o.fmtData(fim(y))}</span></div>`).join('');
  return `<div style="position: relative; margin: 12px 0 8px;">
      <div class="linha-ano-profectado" style="margin-bottom: 4px;">
        <span data-html2canvas-ignore="true">${seta(-1)}</span>
        <span class="linha-glifo" style="justify-content: center; gap: 6px; cursor: pointer;" onclick="const m=document.getElementById('${o.id}MenuNivel${o.n}'); m.style.display = m.style.display === 'none' ? 'block' : 'none';" title="Ver todos os períodos do nível ${o.n}"><strong>Nível ${o.n}:</strong> ${o.glifo(x, 20)}<svg class="icone" data-html2canvas-ignore="true" viewBox="0 0 64 64" style="width: 14px; height: 14px;"><polyline points="12,24 32,44 52,24"/></svg></span>
        <span data-html2canvas-ignore="true">${seta(1)}</span>
      </div>
      <div class="texto-apagado" style="text-align: center; font-size: 12px;">${o.fmtData(ini(x))} a ${o.fmtData(fim(x))}</div>
      ${barraTempo(ini(x), fim(x), 'margin: 6px 16px 0;', 11, o.unidade)}
      <div id="${o.id}MenuNivel${o.n}" class="menu-flutuante" data-html2canvas-ignore="true" style="display: none; position: absolute; top: 40px; left: 50%; transform: translateX(-50%); z-index: 9999; width: min(360px, 92%); box-sizing: border-box; max-height: 340px; overflow-y: auto;">${itens}</div>
    </div>`;
}

/* BUSCA POR DATA. A ferramenta guarda a data escolhida (Date ao meio-dia, ou null = hoje) e, quando a pessoa toca em Ir,
   abre a árvore até o período que contém a data. O campo NUNCA age sozinho ao mudar (o seletor do iPad dispara "change" com a data
   de hoje no instante em que abre): só o botão Ir leva à data. Tamanho mínimo no campo: vazio com appearance:none some no iPad.
   Opções: id (do campo), data (Date ou null), fnIr (função global que recebe 'AAAA-MM-DD' ou '' para voltar a hoje). */
function buscaPorDataHTML(o) {
  const d = o.data;
  const valor = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
  return `<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; color: var(--azul-egipcio-escuro);">
        <button type="button" class="botao-icone" onclick="const i=document.getElementById('${o.id}'); try { i.showPicker(); } catch (e) { i.focus(); i.click(); }" title="Ir para a data"><svg class="icone" viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="44" rx="3"/><line x1="8" y1="26" x2="56" y2="26"/><line x1="20" y1="6" x2="20" y2="18"/><line x1="44" y1="6" x2="44" y2="18"/></svg></button>
        <input type="date" id="${o.id}" value="${valor}" title="Ir para a data" style="background: transparent; color: var(--preto-tinta); font-family: inherit; font-size: 13px; padding: 6px 0; border: 0; border-bottom: var(--contorno-fino) solid var(--azul-egipcio-claro); border-radius: 0; outline: none; -webkit-appearance: none; appearance: none; min-height: 36px; min-width: 160px; box-sizing: border-box;">
        <button type="button" class="botao-texto" onclick="const v=document.getElementById('${o.id}').value; if (v) ${o.fnIr}(v);">Ir</button>
        ${d ? `<button type="button" class="botao-texto" onclick="${o.fnIr}('')">Hoje</button>` : ''}
      </div>`;
}

/* 'AAAA-MM-DD' do campo -> Date ao meio-dia (hora local), ou null se vazio */
function dataDoCampoBusca(valor) {
  if (!valor) return null;
  const [a, m, d] = valor.split('-').map(Number);
  return new Date(a, m - 1, d, 12, 0);
}
