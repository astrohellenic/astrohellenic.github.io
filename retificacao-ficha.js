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

/* Faixa na seção 5: o que a ficha diz sobre os fatos do cliente */
function rzFichaAviso() {
  if (!rzFichaInfo) return '';
  if (rzFichaInfo.enviado_em) {
    const d = new Date(rzFichaInfo.enviado_em);
    return `<div class="texto-apagado rz-fonte" style="margin-bottom:8px;">O cliente enviou os fatos em ${rzP2(d.getDate())}/${rzP2(d.getMonth() + 1)}/${d.getFullYear()}.</div>`;
  }
  return `<div class="rz-fonte" style="margin-bottom:8px; color:var(--terracota); font-weight:700;">O cliente ainda não enviou os fatos da vida dele.</div>`;
}

if (typeof window !== 'undefined') Object.assign(window, { rzAgendarSalvar, rzSalvarFicha });
