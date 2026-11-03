/* ==========================================
   RETIFICAÇÃO — FICHA NO SUPABASE (tabela `retificacoes`, uma por cliente/mapa)
   - `fatos` + `enviado_em`: o que o CLIENTE enviou pelo formulário (a ferramenta só lê).
   - `trabalho` (jsonb): tudo o que o ASTRÓLOGO escolhe na ferramenta (candidato, ajuste de minutos, origem do horário, fatos com técnicas
     e "Confirma?", conclusão, anexos). Salva sozinho, um instante depois de cada mudança.
   Depende de retificacao-sizigia.js (estado `rz...`). Sem localStorage: é trabalho do astrólogo, tem que valer em qualquer aparelho.
   ========================================== */

let rzFichaInfo = null;           // { enviado_em, temFatosDoCliente } da ficha do mapa em tela (null = ainda não existe ficha)
let rzSalvarTimer = null;
let rzSalvando = false;

function rzMapaIdAtual() { return (typeof currentMapaId !== 'undefined' && currentMapaId) ? String(currentMapaId) : null; }

function rzClienteSupabase() { return (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : null; }

/* O que vai em `trabalho`. O candidato é guardado por método + planeta (o índice na lista muda de um cálculo para outro). */
function rzTrabalhoParaSalvar() {
  const r = rzUltimo;
  const cand = (r && rzFinalSel && r.candidatos[rzFinalSel.idx]) ? r.candidatos[rzFinalSel.idx] : null;
  return {
    versao: 1,
    candidato: cand ? { regra: cand.regra, id: cand.id } : null,
    ajusteMin: rzFinalSel ? rzFinalSel.ajusteMin : 0,
    origemHorario: rzOrigemHorario,
    conclusao: rzConclusao,
    anexos: rzAnexos,
    abertas: rzAbertas,
    feitos: rzFeitos,
    fatos: rzFatos.map(f => ({ id: f.id, data: f.data, ate: f.ate, periodo: !!f.periodo, aberto: f.aberto !== false, feito: !!f.feito, texto: f.texto, conf: f.conf, tecnicas: f.tecnicas.map(t => ({ tipo: t.tipo, chave: t.chave })) }))
  };
}

/* Põe o que foi salvo de volta no estado da ferramenta. Sem `trabalho`, começa pelos fatos que o cliente enviou (já em ordem de data). */
function rzAplicarFicha(r, linha) {
  if (!linha) return;
  const t = linha.trabalho;
  if (t && typeof t === 'object') {
    if (t.candidato) {
      const i = r.candidatos.findIndex(c => c.regra === t.candidato.regra && c.id === t.candidato.id && c.horario);
      if (i >= 0) rzFinalSel = { idx: i, ajusteMin: Number(t.ajusteMin) || 0 };
    }
    rzOrigemHorario = t.origemHorario || '';
    rzConclusao = t.conclusao || '';
    rzAnexos = Array.isArray(t.anexos) ? t.anexos : [];
    rzAbertas = (t.abertas && typeof t.abertas === 'object') ? t.abertas : {};
    rzFeitos = (t.feitos && typeof t.feitos === 'object') ? t.feitos : {};
    if (Array.isArray(t.fatos) && t.fatos.length) {
      rzFatos = t.fatos.map(f => ({
        id: ++rzFatoSeq, data: f.data || '', ate: f.ate || '', periodo: !!f.periodo && !!f.ate, aberto: f.aberto !== false, feito: !!f.feito, texto: f.texto || '', conf: f.conf || '',
        tecnicas: (Array.isArray(f.tecnicas) && f.tecnicas.length ? f.tecnicas : []).map(x => ({ tipo: x.tipo === 'zr' ? 'zr' : 'circ', chave: x.chave }))
      }));
    }
  } else if (Array.isArray(linha.fatos) && linha.fatos.length) {
    rzFatos = linha.fatos.map(f => { const n = rzFatoVazio(++rzFatoSeq); n.data = f.data || ''; if (f.ate) { n.ate = f.ate; n.periodo = true; } n.texto = f.texto || ''; return n; });
  }
}

/* Busca a ficha do mapa em tela. Qualquer falha = segue sem ficha (a ferramenta continua funcionando, só não salva). */
async function rzCarregarFicha(r) {
  rzFichaInfo = null;
  const db = rzClienteSupabase(), mapa = rzMapaIdAtual();
  if (!db || !mapa) return;
  try {
    const { data, error } = await db.from('retificacoes').select('fatos, enviado_em, trabalho').eq('mapa_id', mapa).maybeSingle();
    if (error || !data) return;
    rzFichaInfo = { enviado_em: data.enviado_em, temFatosDoCliente: Array.isArray(data.fatos) && data.fatos.length > 0 };
    rzAplicarFicha(r, data);
  } catch (e) { console.warn('Ficha da retificação não carregou:', e); }
}

function rzMostrarStatusSalvo(texto) { const el = document.getElementById('rzSalvoStatus'); if (el) el.textContent = texto; }

/* Salva um instante depois da última mudança (várias mudanças seguidas viram um salvamento só) */
function rzAgendarSalvar() {
  if (!rzClienteSupabase() || !rzMapaIdAtual() || !rzUltimo) return;
  clearTimeout(rzSalvarTimer);
  rzMostrarStatusSalvo('Salvando...');
  rzSalvarTimer = setTimeout(rzSalvarFicha, 1200);
}

async function rzSalvarFicha() {
  const db = rzClienteSupabase(), mapa = rzMapaIdAtual();
  if (!db || !mapa || !rzUltimo || rzSalvando) { if (rzSalvando) rzAgendarSalvar(); return; }
  rzSalvando = true;
  try {
    const { data: { user } } = await db.auth.getUser();
    if (!user) { rzMostrarStatusSalvo('Sessão não identificada: não salvou.'); return; }
    const { error } = await db.from('retificacoes').upsert({ user_id: user.id, mapa_id: mapa, trabalho: rzTrabalhoParaSalvar(), atualizado_em: new Date().toISOString() }, { onConflict: 'user_id,mapa_id' });
    rzMostrarStatusSalvo(error ? 'Não salvou: ' + error.message : 'Salvo.');
  } catch (e) {
    rzMostrarStatusSalvo('Não salvou (sem conexão?).');
  } finally {
    rzSalvando = false;
  }
}

/* Link só da página dos fatos (página 2 do formulário), para quem já está cadastrado. Usa a chave da ficha do mapa (cria se ainda não tem).
   Padrão de link do software: só o ícone de elo; tocar copia e o ícone vira ✓ por um instante (igual ao Falando de Astrologia). */
const RZ_SVG_ELO = '<svg viewBox="0 0 64 64" width="30" height="30" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M27 37a11 11 0 0 0 15.5 0l9-9a11 11 0 0 0-15.5-15.5l-3 3"/><path d="M37 27a11 11 0 0 0-15.5 0l-9 9a11 11 0 0 0 15.5 15.5l3-3"/></svg>';
const RZ_SVG_ELO_OK = '<svg viewBox="0 0 64 64" width="30" height="30" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M12 34l14 14 26-28"/></svg>';
async function rzCopiarLinkFatos(btn) {
  const aviso = document.getElementById('rzLinkFatosAviso');
  const msg = (t) => { if (aviso) aviso.innerHTML = t; };
  msg('');
  const db = rzClienteSupabase(), mapa = rzMapaIdAtual();
  if (!db || !mapa) { msg('Abra um mapa salvo primeiro.'); return; }
  try {
    const { data: { user } } = await db.auth.getUser();
    if (!user) { msg('Sessão não identificada.'); return; }
    const { data: linha, error: e1 } = await db.from('retificacoes').select('token, enviado_em').eq('mapa_id', mapa).maybeSingle();
    if (e1) throw e1;
    let token = linha && linha.token;
    if (!token) {
      token = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
      const { error: e2 } = await db.from('retificacoes').upsert({ user_id: user.id, mapa_id: mapa, token, atualizado_em: new Date().toISOString() }, { onConflict: 'user_id,mapa_id' });
      if (e2) throw e2;
    }
    const url = `https://astrohellenic.github.io/formulario.html?u=${user.id}&m=${encodeURIComponent(mapa)}&t=${encodeURIComponent(token)}&p=2`;
    let copiou = false;
    try { await navigator.clipboard.writeText(url); copiou = true; } catch (e) {
      const t = document.createElement('textarea'); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; t.value = url; document.body.appendChild(t); t.focus(); t.select();
      try { copiou = document.execCommand('copy'); } catch (e2) { /* segue sem copiar */ } document.body.removeChild(t);
    }
    if (copiou) { if (btn) { btn.innerHTML = RZ_SVG_ELO_OK; setTimeout(() => { btn.innerHTML = RZ_SVG_ELO; }, 1500); } }
    else msg('Não consegui copiar neste aparelho.');
    if (linha && linha.enviado_em) msg('O cliente já enviou os fatos; o link vai avisar que já foi enviado.');
  } catch (e) {
    msg(`Não consegui gerar o link: ${(e && e.message) || 'erro'}`);
  }
}

/* Faixa na seção 5: o que a ficha diz sobre os fatos do cliente, e o botão do link só dos fatos */
function rzFichaAviso() {
  const botao = `<div style="display:flex; align-items:center; gap:4px; margin-bottom:8px;"><span class="texto-apagado rz-fonte">Link dos fatos</span><button type="button" title="Copiar o link dos fatos" aria-label="Copiar o link dos fatos" onclick="rzCopiarLinkFatos(this)" style="background:transparent; border:0; border-radius:0; padding:6px 10px; color:var(--azul-egipcio-escuro, #1034A6); cursor:pointer;">${RZ_SVG_ELO}</button></div><div id="rzLinkFatosAviso" class="rz-fonte" style="color:var(--terracota); margin:-4px 0 8px;"></div>`;
  if (!rzFichaInfo) return botao;
  if (rzFichaInfo.enviado_em) {
    const d = new Date(rzFichaInfo.enviado_em);
    return `<div class="texto-apagado rz-fonte" style="margin-bottom:8px;">O cliente enviou os fatos em ${rzP2(d.getDate())}/${rzP2(d.getMonth() + 1)}/${d.getFullYear()}.</div>` + botao;
  }
  return `<div class="rz-fonte" style="margin-bottom:8px; color:var(--terracota); font-weight:700;">O cliente ainda não enviou os fatos da vida dele.</div>` + botao;
}

if (typeof window !== 'undefined') Object.assign(window, { rzAgendarSalvar, rzSalvarFicha, rzCopiarLinkFatos });
