/* Endpoint /api/agenda-google — liga a agenda do Astro Hellenic à Google Agenda do astrólogo.

   Três ações (POST, corpo JSON, campo "acao"):
     ocupados  { de:'YYYY-MM-DD', ate:'YYYY-MM-DD' }          -> { ocupados:[{ data, hora_inicio, hora_fim }] }
                os horários em que a Google Agenda está ocupada (já em horário de Brasília, "cortados" por dia)
     criar     { u, c, data, hora }                           -> { ok:true, eventId } | { ok:false, erro }
                confere o link (u = astrólogo, c = cliente) no Supabase, confere se o horário continua livre no Google
                e cria o evento. Nome do cliente e duração vêm do Supabase, nunca do navegador.
     apagar    { u, c, eventId }                              -> { ok:true }
                só apaga evento criado por esta função pra esse mesmo cliente (usado se a reserva no Supabase falhar)

   A conta de acesso é uma "conta de serviço" do Google, com a agenda do astrólogo compartilhada com ela
   (Variáveis de ambiente na Vercel: GOOGLE_SERVICE_ACCOUNT_JSON e GOOGLE_CALENDAR_ID). Sem biblioteca nenhuma:
   o token é assinado aqui com o módulo crypto do Node e as chamadas vão por fetch. Nada do Google passa pro navegador. */

const crypto = require('crypto');

const ORIGENS_PERMITIDAS = [
  'https://astrohellenic.com',
  'https://www.astrohellenic.com',
  'https://astrohellenic.github.io'
];

const FUSO = 'America/Sao_Paulo';
const SUPABASE_URL = 'https://ndgjenvddkmztmdixjhc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VTjldgs8Hv1RODaMg7T57Q_ISzbnm5C'; // a mesma chave pública que o próprio site já usa
const MAX_DIAS_CONSULTA = 120;

function aplicarCors(req, res) {
  const origem = req.headers.origin;
  if (origem && ORIGENS_PERMITIDAS.includes(origem)) res.setHeader('Access-Control-Allow-Origin', origem);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/* ---------- Google: token da conta de serviço ---------- */

/* Lê o JSON da conta de serviço mesmo quando o texto colado veio "estragado" do jeito mais comum: quebras de linha de verdade
   DENTRO do texto da chave (o JSON exige "\\n"), ou aspas "curvas" trocadas pelo teclado/visualizador do aparelho.
   Só mexe nas quebras de linha que estão dentro de aspas; as de fora (entre os campos) são válidas e ficam como estão. */
function consertarJson(texto) {
  let t = String(texto).replace(/[\u201C\u201D]/g, '"').replace(/^\uFEFF/, '').trim();
  let saida = '', dentro = false, escapado = false;
  for (const c of t) {
    if (dentro) {
      if (escapado) { saida += c; escapado = false; continue; }
      if (c === '\\') { saida += c; escapado = true; continue; }
      if (c === '"') { dentro = false; saida += c; continue; }
      if (c === '\n') { saida += '\\n'; continue; }
      if (c === '\r') { continue; }
      if (c === '\t') { saida += '\\t'; continue; }
      saida += c;
    } else {
      if (c === '"') dentro = true;
      saida += c;
    }
  }
  // Texto colado sem o "}" do final (o último caractere costuma ficar de fora na hora de copiar): fecha o que ficou aberto
  let abertas = 0; dentro = false; escapado = false;
  for (const c of saida) {
    if (dentro) { if (escapado) escapado = false; else if (c === '\\') escapado = true; else if (c === '"') dentro = false; continue; }
    if (c === '"') dentro = true; else if (c === '{') abertas++; else if (c === '}') abertas--;
  }
  return saida + (dentro ? '"' : '') + '}'.repeat(Math.max(0, abertas));
}

function lerChaveDaConta() {
  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!bruto) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON não configurada');
  let obj;
  try { obj = JSON.parse(bruto); }
  catch (e) { obj = JSON.parse(consertarJson(bruto)); }
  // Algumas vezes o valor vem embrulhado (texto dentro de aspas, ou o arquivo de outro tipo): tenta achar a conta dentro dele
  if (typeof obj === 'string') { try { obj = JSON.parse(obj); } catch (e) { /* segue pro erro abaixo */ } }
  if (obj && !obj.client_email && obj.service_account) obj = obj.service_account;
  if (!obj || !obj.client_email || !obj.private_key) {
    // só os NOMES dos campos (nunca os valores) pra dar pra ver nos Logs o que foi colado
    const campos = obj && typeof obj === 'object' ? Object.keys(obj).join(', ') : typeof obj;
    throw new Error('JSON da conta de serviço incompleto (campos encontrados: ' + campos + '; tamanho: ' + bruto.length + ')');
  }
  return obj;
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

let tokenCache = { valor: null, expira: 0 };
async function tokenGoogle() {
  const agora = Math.floor(Date.now() / 1000);
  if (tokenCache.valor && tokenCache.expira - 60 > agora) return tokenCache.valor;
  const conta = lerChaveDaConta();
  const cabecalho = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const corpo = b64url(JSON.stringify({
    iss: conta.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: agora,
    exp: agora + 3600
  }));
  const assinatura = crypto.createSign('RSA-SHA256').update(cabecalho + '.' + corpo).sign(conta.private_key);
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: cabecalho + '.' + corpo + '.' + b64url(assinatura)
    })
  });
  const dados = await resp.json();
  if (!resp.ok || !dados.access_token) throw new Error('Google recusou o token: ' + (dados.error_description || dados.error || resp.status));
  tokenCache = { valor: dados.access_token, expira: agora + (dados.expires_in || 3600) };
  return tokenCache.valor;
}

async function chamarGoogle(caminho, opcoes) {
  const token = await tokenGoogle();
  const resp = await fetch('https://www.googleapis.com/calendar/v3' + caminho, {
    ...opcoes,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
  });
  const texto = await resp.text();
  const dados = texto ? JSON.parse(texto) : {};
  if (!resp.ok) throw new Error('Google Agenda: ' + ((dados.error && dados.error.message) || resp.status));
  return dados;
}

const calendarioId = () => {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error('GOOGLE_CALENDAR_ID não configurada');
  return id;
};

/* ---------- datas em horário de Brasília ---------- */

/* meia-noite de "dataISO" em Brasília, como instante UTC. O Brasil não tem horário de verão desde 2019 (UTC-3 fixo);
   em vez de assumir isso, mede o deslocamento real do fuso naquele dia com o Intl. */
function instanteLocal(dataISO, minutos) {
  const [a, m, d] = dataISO.split('-').map(Number);
  const chute = Date.UTC(a, m - 1, d, 0, minutos);
  const partes = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(chute)).forEach(p => { partes[p.type] = p.value; });
  const comoUtc = Date.UTC(+partes.year, +partes.month - 1, +partes.day, +partes.hour, +partes.minute, +partes.second);
  return new Date(chute - (comoUtc - chute));
}

function paraLocal(instante) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(instante).forEach(x => { p[x.type] = x.value; });
  return { dataISO: `${p.year}-${p.month}-${p.day}`, minutos: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10) };
}

const minParaHHMM = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const hhmmParaMin = (h) => { const [a, b] = String(h).slice(0, 5).split(':').map(Number); return a * 60 + b; };
const ehData = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s));
const ehHora = (s) => /^\d{2}:\d{2}/.test(String(s));
const somarDias = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/* ---------- ocupados ---------- */

/* intervalos ocupados do Google dentro de [inicio, fim] (instantes), já divididos por dia de Brasília */
async function buscarOcupados(inicio, fim) {
  const dados = await chamarGoogle('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: inicio.toISOString(), timeMax: fim.toISOString(), timeZone: FUSO, items: [{ id: calendarioId() }] })
  });
  const cal = dados.calendars && dados.calendars[calendarioId()];
  if (!cal) throw new Error('Google Agenda: calendário não encontrado na resposta');
  if (cal.errors && cal.errors.length) throw new Error('Google Agenda: ' + (cal.errors[0].reason || 'erro no calendário') + ' (a agenda foi compartilhada com a conta de serviço?)');
  const fatias = [];
  (cal.busy || []).forEach(b => {
    let atual = paraLocal(new Date(b.start));
    const final = paraLocal(new Date(b.end));
    // Primeiro dia até o último: cada dia fica com a sua fatia
    for (let seguranca = 0; seguranca < 400; seguranca++) {
      const ultimoDia = atual.dataISO === final.dataISO;
      fatias.push({ data: atual.dataISO, hora_inicio: minParaHHMM(atual.minutos), hora_fim: ultimoDia ? minParaHHMM(final.minutos) : '24:00' });
      if (ultimoDia) break;
      atual = { dataISO: somarDias(atual.dataISO, 1), minutos: 0 };
    }
  });
  return fatias.filter(f => f.hora_inicio !== f.hora_fim);
}

async function acaoOcupados(corpo) {
  if (!ehData(corpo.de) || !ehData(corpo.ate)) return { status: 400, json: { ok: false, erro: 'Datas inválidas.' } };
  const dias = (Date.parse(corpo.ate) - Date.parse(corpo.de)) / 86400000;
  if (dias < 0 || dias > MAX_DIAS_CONSULTA) return { status: 400, json: { ok: false, erro: 'Período inválido.' } };
  const ocupados = await buscarOcupados(instanteLocal(corpo.de, 0), instanteLocal(somarDias(corpo.ate, 1), 0));
  return { status: 200, json: { ok: true, ocupados } };
}

/* ---------- criar / apagar ---------- */

async function agendaPublica(u, c) {
  const resp = await fetch(SUPABASE_URL + '/rest/v1/rpc/agenda_publica', {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_user: u, p_mapa: c })
  });
  if (!resp.ok) return null;
  return resp.json();
}

async function acaoCriar(corpo) {
  const { u, c, data, hora } = corpo;
  if (!u || !c || !ehData(data) || !ehHora(hora)) return { status: 400, json: { ok: false, erro: 'Dados inválidos.' } };
  const agenda = await agendaPublica(u, c);
  if (!agenda) return { status: 403, json: { ok: false, erro: 'Link inválido ou expirado.' } };
  if (agenda.ja_agendado) return { status: 409, json: { ok: false, erro: 'Você já tem um horário marcado.' } };
  const duracao = Number(agenda.duracao) || 60;
  const ini = hhmmParaMin(hora);
  const inicio = instanteLocal(data, ini);
  const fim = instanteLocal(data, ini + duracao);
  if (inicio.getTime() < Date.now()) return { status: 409, json: { ok: false, erro: 'Esse horário já passou.' } };

  const ocupados = await buscarOcupados(inicio, fim);
  if (ocupados.length) return { status: 409, json: { ok: false, erro: 'Esse horário acabou de ser ocupado. Escolha outro.' } };

  const nome = (agenda.cliente_nome || 'Cliente').toString().slice(0, 120);
  const evento = await chamarGoogle('/calendars/' + encodeURIComponent(calendarioId()) + '/events', {
    method: 'POST',
    body: JSON.stringify({
      summary: 'Atendimento - ' + nome,
      description: 'Agendado pelo Astro Hellenic.',
      start: { dateTime: inicio.toISOString(), timeZone: FUSO },
      end: { dateTime: fim.toISOString(), timeZone: FUSO },
      extendedProperties: { private: { origem: 'astrohellenic', mapa: String(c) } }
    })
  });
  return { status: 200, json: { ok: true, eventId: evento.id } };
}

async function acaoApagar(corpo) {
  const { c, eventId } = corpo;
  if (!c || !eventId) return { status: 400, json: { ok: false, erro: 'Dados inválidos.' } };
  const caminho = '/calendars/' + encodeURIComponent(calendarioId()) + '/events/' + encodeURIComponent(eventId);
  const evento = await chamarGoogle(caminho, { method: 'GET' });
  const priv = (evento.extendedProperties && evento.extendedProperties.private) || {};
  if (priv.origem !== 'astrohellenic' || priv.mapa !== String(c)) return { status: 403, json: { ok: false, erro: 'Evento não pertence a esse cliente.' } };
  await chamarGoogle(caminho, { method: 'DELETE' });
  return { status: 200, json: { ok: true } };
}

/* ---------- entrada ---------- */

module.exports = async function handler(req, res) {
  aplicarCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, erro: 'Use POST.' }); return; }
  const origem = req.headers.origin;
  if (origem && !ORIGENS_PERMITIDAS.includes(origem)) { res.status(403).json({ ok: false, erro: 'Origem não permitida.' }); return; }

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
    res.status(502).json({ ok: false, erro: 'Não foi possível falar com a Google Agenda agora.' });
  }
};
