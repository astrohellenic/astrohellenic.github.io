/* Endpoint /api/agenda-google — usado pela página pública de agendar (agendar.html) e pela ferramenta Agenda.
   Funciona pra QUALQUER astrólogo que tenha conectado a Google Agenda (Configurações → Agenda → Conectar Google Agenda,
   ver api/google.js). Quem não conectou continua usando só a agenda do próprio software (nada aqui bloqueia nem cria).

   Três ações (POST, corpo JSON, campo "acao"; "u" = id do astrólogo, vem do link de agendar):
     ocupados  { u, de:'YYYY-MM-DD', ate:'YYYY-MM-DD' }  -> { ok, conectado, ocupados:[{ data, hora_inicio, hora_fim }] }
                horários em que QUALQUER agenda marcada como "bloqueia" está ocupada (já em horário de Brasília, cortados por dia)
     criar     { u, c, data, hora }                       -> { ok, eventId } | { ok:false, erro }
                confere o link (u, c) no Supabase e se o horário continua livre em todas as agendas, e cria o evento na agenda
                principal escolhida. Nome do cliente e duração vêm do Supabase, nunca do navegador.
     apagar    { u, c, eventId }                          -> { ok }
                só apaga evento criado por esta função pra esse cliente (usado se a reserva no Supabase falhar) */

const G = require('./_google');

const MAX_DIAS_CONSULTA = 120;
const TAMANHO_LOTE_FREEBUSY = 50; // limite do Google por consulta

const ok = (json) => ({ status: 200, json });
const erro = (status, texto, extra = {}) => ({ status, json: { ok: false, erro: texto, ...extra } });

/* agendas que bloqueiam: todas da conta, menos as que o astrólogo desmarcou (a principal sempre bloqueia) */
async function agendasQueBloqueiam(userId, conexao) {
  const todas = await G.listarAgendas(userId, conexao);
  const ignoradas = Array.isArray(conexao.ignoradas) ? conexao.ignoradas : [];
  const principal = conexao.principal || (todas.find(a => a.principal) || {}).id;
  return { ids: todas.filter(a => !ignoradas.includes(a.id) || a.id === principal).map(a => a.id), principal };
}

/* intervalos ocupados dentro de [inicio, fim] (instantes), já divididos por dia de Brasília */
async function buscarOcupados(userId, conexao, ids, inicio, fim) {
  const fatias = [];
  for (let i = 0; i < ids.length; i += TAMANHO_LOTE_FREEBUSY) {
    const lote = ids.slice(i, i + TAMANHO_LOTE_FREEBUSY);
    const dados = await G.chamarGoogle(userId, conexao, '/freeBusy', {
      method: 'POST',
      body: JSON.stringify({ timeMin: inicio.toISOString(), timeMax: fim.toISOString(), timeZone: G.FUSO, items: lote.map(id => ({ id })) })
    });
    lote.forEach(id => {
      const cal = dados.calendars && dados.calendars[id];
      if (!cal || (cal.errors && cal.errors.length)) return; // agenda sem acesso de ver ocupado/livre: não dá pra consultar, segue
      (cal.busy || []).forEach(b => {
        let atual = G.paraLocal(new Date(b.start));
        const final = G.paraLocal(new Date(b.end));
        for (let seguranca = 0; seguranca < 400; seguranca++) {
          const ultimoDia = atual.dataISO === final.dataISO;
          fatias.push({ data: atual.dataISO, hora_inicio: G.minParaHHMM(atual.minutos), hora_fim: ultimoDia ? G.minParaHHMM(final.minutos) : '24:00' });
          if (ultimoDia) break;
          atual = { dataISO: G.somarDias(atual.dataISO, 1), minutos: 0 };
        }
      });
    });
  }
  return fatias.filter(f => f.hora_inicio !== f.hora_fim);
}

async function acaoOcupados(corpo) {
  if (!corpo.u || !G.ehData(corpo.de) || !G.ehData(corpo.ate)) return erro(400, 'Dados inválidos.');
  const dias = (Date.parse(corpo.ate) - Date.parse(corpo.de)) / 86400000;
  if (dias < 0 || dias > MAX_DIAS_CONSULTA) return erro(400, 'Período inválido.');
  const conexao = await G.lerConexao(corpo.u);
  if (!conexao) return ok({ ok: true, conectado: false, ocupados: [] });
  const { ids } = await agendasQueBloqueiam(corpo.u, conexao);
  const ocupados = await buscarOcupados(corpo.u, conexao, ids, G.instanteLocal(corpo.de, 0), G.instanteLocal(G.somarDias(corpo.ate, 1), 0));
  return ok({ ok: true, conectado: true, ocupados });
}

async function agendaPublica(u, c) {
  const resp = await fetch(G.SUPABASE_URL + '/rest/v1/rpc/agenda_publica', {
    method: 'POST',
    headers: { apikey: G.SUPABASE_ANON, Authorization: 'Bearer ' + G.SUPABASE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_user: u, p_mapa: c })
  });
  if (!resp.ok) return null;
  return resp.json();
}

async function acaoCriar(corpo) {
  const { u, c, data, hora } = corpo;
  if (!u || !c || !G.ehData(data) || !G.ehHora(hora)) return erro(400, 'Dados inválidos.');
  const agenda = await agendaPublica(u, c);
  if (!agenda) return erro(403, 'Link inválido ou expirado.');
  if (agenda.ja_agendado) return erro(409, 'Você já tem um horário marcado.');
  const conexao = await G.lerConexao(u);
  if (!conexao) return ok({ ok: true, eventId: null }); // astrólogo sem Google conectado: só o software grava

  const duracao = Number(agenda.duracao) || 60;
  const ini = G.hhmmParaMin(hora);
  const inicio = G.instanteLocal(data, ini);
  const fim = G.instanteLocal(data, ini + duracao);
  if (inicio.getTime() < Date.now()) return erro(409, 'Esse horário já passou.');

  const { ids, principal } = await agendasQueBloqueiam(u, conexao);
  if ((await buscarOcupados(u, conexao, ids, inicio, fim)).length) return erro(409, 'Esse horário acabou de ser ocupado. Escolha outro.');

  const nome = (agenda.cliente_nome || 'Cliente').toString().slice(0, 120);
  const evento = await G.chamarGoogle(u, conexao, '/calendars/' + encodeURIComponent(principal) + '/events', {
    method: 'POST',
    body: JSON.stringify({
      summary: 'Atendimento - ' + nome,
      description: 'Agendado pelo Astro Hellenic.',
      start: { dateTime: inicio.toISOString(), timeZone: G.FUSO },
      end: { dateTime: fim.toISOString(), timeZone: G.FUSO },
      extendedProperties: { private: { origem: 'astrohellenic', mapa: String(c) } }
    })
  });
  return ok({ ok: true, eventId: evento.id });
}

async function acaoApagar(corpo) {
  const { u, c, eventId } = corpo;
  if (!u || !c || !eventId) return erro(400, 'Dados inválidos.');
  const conexao = await G.lerConexao(u);
  if (!conexao) return ok({ ok: true });
  const { principal } = await agendasQueBloqueiam(u, conexao);
  const caminho = '/calendars/' + encodeURIComponent(principal) + '/events/' + encodeURIComponent(eventId);
  const evento = await G.chamarGoogle(u, conexao, caminho, { method: 'GET' });
  const priv = (evento.extendedProperties && evento.extendedProperties.private) || {};
  if (priv.origem !== 'astrohellenic' || priv.mapa !== String(c)) return erro(403, 'Evento não pertence a esse cliente.');
  await G.chamarGoogle(u, conexao, caminho, { method: 'DELETE' });
  return ok({ ok: true });
}

module.exports = async function handler(req, res) {
  G.aplicarCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, erro: 'Use POST.' }); return; }
  const permitidas = ['https://astrohellenic.com', 'https://www.astrohellenic.com', 'https://astrohellenic.github.io'];
  const origem = req.headers.origin;
  if (origem && !permitidas.includes(origem)) { res.status(403).json({ ok: false, erro: 'Origem não permitida.' }); return; }

  try {
    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const acoes = { ocupados: acaoOcupados, criar: acaoCriar, apagar: acaoApagar };
    const fn = acoes[corpo.acao];
    if (!fn) { res.status(400).json({ ok: false, erro: 'Ação desconhecida.' }); return; }
    const r = await fn(corpo);
    res.status(r.status).json(r.json);
  } catch (e) {
    // nunca devolve detalhes internos pro navegador; o motivo real fica nos Logs da Vercel
    console.error('agenda-google:', e && e.message);
    if (e && e.revogado) { res.status(409).json({ ok: false, erro: 'A conexão com a Google Agenda precisa ser refeita pelo astrólogo.', codigo: 'revogado' }); return; }
    res.status(502).json({ ok: false, erro: 'Não foi possível falar com a Google Agenda agora.' });
  }
};
