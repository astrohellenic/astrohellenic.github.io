/* Endpoint /api/google — conectar a Google Agenda do astrólogo e escolher quais agendas bloqueiam horário.

   GET  ?code=...&state=...          volta do login do Google (o astrólogo é mandado pra cá pelo próprio Google)
   POST { acao:'iniciar',    jwt }   -> { url }  endereço do login do Google pra mandar o astrólogo
        { acao:'status',     jwt }   -> { conectado, email, principal, agendas:[{ id, nome, principal, cor, bloqueia }] }
        { acao:'salvar',     jwt, principal, ignoradas:[ids] }  guarda qual agenda recebe os agendamentos e quais NÃO bloqueiam
        { acao:'desconectar',jwt }

   "jwt" é o token de login do próprio site (Supabase): é ele que diz qual astrólogo está pedindo. Ninguém mexe na conexão de outro. */

const G = require('./_google');

const resposta = (res, status, json) => res.status(status).json(json);

async function iniciar(userId) {
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: G.env('GOOGLE_CLIENT_ID'),
    redirect_uri: G.REDIRECT_URI,
    response_type: 'code',
    scope: G.ESCOPOS,
    access_type: 'offline',   // pra receber o refresh token
    prompt: 'consent',        // sempre devolve o refresh token, mesmo se já tinha autorizado antes
    include_granted_scopes: 'true',
    state: G.criarEstado(userId)
  }).toString();
  return { ok: true, url };
}

async function status(userId) {
  const conexao = await G.lerConexao(userId);
  if (!conexao) return { ok: true, conectado: false };
  let agendas;
  try { agendas = await G.listarAgendas(userId, conexao); }
  catch (e) {
    if (e.revogado) return { ok: true, conectado: false, revogado: true };
    throw e;
  }
  const ignoradas = Array.isArray(conexao.ignoradas) ? conexao.ignoradas : [];
  const principal = conexao.principal || (agendas.find(a => a.principal) || {}).id || null;
  return {
    ok: true,
    conectado: true,
    email: conexao.email || null,
    fuso: await G.fusoDoAstrologo(userId, conexao),
    principal,
    agendas: agendas.map(a => ({ ...a, bloqueia: !ignoradas.includes(a.id) || a.id === principal }))
  };
}

async function salvar(userId, corpo) {
  const conexao = await G.lerConexao(userId);
  if (!conexao) return { ok: false, erro: 'Conecte a Google Agenda primeiro.' };
  const agendas = await G.listarAgendas(userId, conexao);
  const ids = agendas.map(a => a.id);
  const principal = ids.includes(corpo.principal) ? corpo.principal : (agendas.find(a => a.principal) || {}).id;
  const ignoradas = (Array.isArray(corpo.ignoradas) ? corpo.ignoradas : []).filter(id => ids.includes(id) && id !== principal);
  await G.atualizarConexao(userId, { principal, ignoradas });
  return { ok: true };
}

/* link da videochamada (Google Meet) do evento, se tiver; só aceita endereço https */
function linkDaVideochamada(ev) {
  const pontos = (ev.conferenceData && ev.conferenceData.entryPoints) || [];
  const video = pontos.find(p => p.entryPointType === 'video');
  const url = ev.hangoutLink || (video && video.uri) || null;
  return url && /^https:\/\//.test(url) ? url : null;
}

/* compromissos das agendas que BLOQUEIAM (as marcadas em Configurações → Agenda), pra tela Agenda do software mostrar
   "o que eu tenho". Só o astrólogo logado vê os dele; nada disso é guardado. Eventos "livres" (que não bloqueiam) ficam de fora. */
async function eventos(userId, corpo) {
  const conexao = await G.lerConexao(userId);
  if (!conexao) return { ok: true, conectado: false, eventos: [] };
  if (!G.ehData(corpo.de) || !G.ehData(corpo.ate)) return { ok: false, erro: 'Datas inválidas.' };
  const dias = (Date.parse(corpo.ate) - Date.parse(corpo.de)) / 86400000;
  if (dias < 0 || dias > 62) return { ok: false, erro: 'Período inválido.' };
  const { todas, ids } = await G.agendasQueBloqueiam(userId, conexao);
  const porId = new Map(todas.map(a => [a.id, a]));
  const fuso = await G.fusoDoAstrologo(userId, conexao);
  const timeMin = G.instanteLocal(corpo.de, 0, fuso).toISOString();
  const timeMax = G.instanteLocal(G.somarDias(corpo.ate, 1), 0, fuso).toISOString();
  const saida = [];
  const buscar = async (id) => {
    const r = await G.chamarGoogle(userId, conexao, '/calendars/' + encodeURIComponent(id) + '/events?' + new URLSearchParams({
      timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '250', timeZone: fuso,
      fields: 'items(id,summary,status,transparency,start,end,location,hangoutLink,conferenceData/entryPoints(entryPointType,uri))'
    }).toString()).catch(() => ({ items: [] })); // uma agenda sem acesso não derruba as outras
    (r.items || []).forEach(ev => {
      if (ev.status === 'cancelled' || ev.transparency === 'transparent') return;
      const diaInteiro = !!(ev.start && ev.start.date);
      let data, hi = null, hf = null;
      if (diaInteiro) { data = ev.start.date; }
      else {
        const ini = G.paraLocal(new Date(ev.start.dateTime), fuso), fim = G.paraLocal(new Date(ev.end.dateTime), fuso);
        data = ini.dataISO; hi = G.minParaHHMM(ini.minutos); hf = fim.dataISO === ini.dataISO ? G.minParaHHMM(fim.minutos) : null;
      }
      const ag = porId.get(id) || {};
      saida.push({ id: id + '|' + ev.id, calendario: ag.nome || '', cor: ag.cor || null, titulo: ev.summary || '(sem título)', local: ev.location || null, meet: linkDaVideochamada(ev), diaInteiro, data, hora_inicio: hi, hora_fim: hf });
    });
  };
  // algumas agendas por vez (o astrólogo pode ter dezenas, uma por aluno/cliente)
  const fila = ids.slice();
  await Promise.all(Array.from({ length: 8 }, async () => { while (fila.length) await buscar(fila.shift()); }));
  saida.sort((a, b) => (a.data + (a.hora_inicio || '00:00')).localeCompare(b.data + (b.hora_inicio || '00:00')));
  return { ok: true, conectado: true, fuso, eventos: saida.slice(0, 600) };
}

/* volta do Google: troca o código pelo token, guarda cifrado, e manda o navegador de volta pro site */
async function voltaDoGoogle(req, res) {
  const { code, state, error } = req.query || {};
  const voltar = (parametro) => { res.setHeader('Location', G.SITE + '/?google=' + parametro); res.status(302).end(); };
  if (error || !code) return voltar('cancelado');
  const userId = G.lerEstado(state);
  if (!userId) return voltar('erro');
  try {
    const t = await G.trocarCodigo(code);
    if (!t.refresh_token) return voltar('erro');
    // descobre o e-mail da conta (a agenda "principal" tem o e-mail como ID)
    const resp = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=freeBusyReader&maxResults=250', { headers: { Authorization: 'Bearer ' + t.access_token } });
    const lista = await resp.json();
    const primaria = ((lista && lista.items) || []).find(a => a.primary);
    const anterior = await G.lerConexao(userId);
    await G.salvarConexao(userId, {
      refresh_token_cifrado: G.cifrar(t.refresh_token),
      email: primaria ? primaria.id : null,
      principal: (anterior && anterior.principal) || (primaria ? primaria.id : null),
      ignoradas: (anterior && anterior.ignoradas) || []
    });
    G.esquecerAgendas(userId);
    return voltar('conectado');
  } catch (e) {
    console.error('google (volta):', e && e.message);
    return voltar('erro');
  }
}

module.exports = async function handler(req, res) {
  G.aplicarCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  try {
    if (req.method === 'GET') return await voltaDoGoogle(req, res);
    if (req.method !== 'POST') return resposta(res, 405, { ok: false, erro: 'Use POST.' });
    const origem = req.headers.origin;
    const permitidas = ['https://astrohellenic.com', 'https://www.astrohellenic.com', 'https://astrohellenic.github.io'];
    if (origem && !permitidas.includes(origem)) return resposta(res, 403, { ok: false, erro: 'Origem não permitida.' });

    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const userId = await G.usuarioDoJwt(corpo.jwt);
    if (!userId) return resposta(res, 401, { ok: false, erro: 'Sessão inválida. Entre de novo.' });

    if (corpo.acao === 'iniciar') return resposta(res, 200, await iniciar(userId));
    if (corpo.acao === 'status') return resposta(res, 200, await status(userId));
    if (corpo.acao === 'salvar') return resposta(res, 200, await salvar(userId, corpo));
    if (corpo.acao === 'eventos') return resposta(res, 200, await eventos(userId, corpo));
    if (corpo.acao === 'desconectar') { await G.apagarConexao(userId); G.esquecerAgendas(userId); return resposta(res, 200, { ok: true }); }
    return resposta(res, 400, { ok: false, erro: 'Ação desconhecida.' });
  } catch (e) {
    console.error('google:', e && e.message);
    return resposta(res, 502, { ok: false, erro: 'Não foi possível falar com a Google agora.' });
  }
};
