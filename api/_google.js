/* Peças em comum das funções da Google Agenda (o "_" no começo do nome faz a Vercel NÃO tratar este arquivo como um endpoint).

   Como funciona a conexão (vale pra QUALQUER astrólogo, não só pro dono do projeto):
   - o astrólogo clica em "Conectar Google Agenda" (Configurações → Agenda), entra com a conta Google dele e autoriza;
   - guardamos só o "refresh token" dele, CIFRADO, na tabela google_conexoes do Supabase (só este servidor lê essa tabela);
   - com esse token o servidor lista TODAS as agendas da conta, vê os horários ocupados nelas e cria os eventos.
   Variáveis de ambiente (Vercel): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY. */

const crypto = require('crypto');

const SUPABASE_URL = 'https://ndgjenvddkmztmdixjhc.supabase.co';
const SUPABASE_ANON = 'sb_publishable_VTjldgs8Hv1RODaMg7T57Q_ISzbnm5C'; // a mesma chave pública que o próprio site já usa
const REDIRECT_URI = 'https://astrohellenicgithubio.vercel.app/api/google';
const SITE = 'https://astrohellenic.com';
const FUSO = 'America/Sao_Paulo';
// Só o mínimo: ler a lista de agendas, ver ocupado/livre e criar eventos. Nada de ler/apagar contatos nem arquivos.
const ESCOPOS = [
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

const ORIGENS_PERMITIDAS = ['https://astrohellenic.com', 'https://www.astrohellenic.com', 'https://astrohellenic.github.io'];

function aplicarCors(req, res) {
  const origem = req.headers.origin;
  if (origem && ORIGENS_PERMITIDAS.includes(origem)) res.setHeader('Access-Control-Allow-Origin', origem);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const env = (nome) => {
  const v = process.env[nome];
  if (!v) throw new Error(nome + ' não configurada');
  return v;
};

/* ---------- cifra do token e "estado" assinado do login ---------- */

const chaveCifra = () => crypto.createHash('sha256').update('astrohellenic-token|' + env('GOOGLE_CLIENT_SECRET')).digest();
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const deB64url = (s) => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');

function cifrar(texto) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chaveCifra(), iv);
  const enc = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}
function decifrar(base64) {
  const buf = Buffer.from(base64, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', chaveCifra(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8');
}

/* "estado" do login: vai e volta pelo Google, e prova que quem voltou é o astrólogo que começou (assinado, vale 15 min) */
function assinar(payload) { return b64url(crypto.createHmac('sha256', env('GOOGLE_CLIENT_SECRET')).update('estado|' + payload).digest()); }
function criarEstado(userId) {
  const payload = userId + '.' + (Date.now() + 15 * 60 * 1000);
  return b64url(payload) + '.' + assinar(payload);
}
function lerEstado(estado) {
  const [p, sig] = String(estado || '').split('.');
  if (!p || !sig) return null;
  const payload = deB64url(p).toString('utf8');
  const esperado = assinar(payload);
  if (sig.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;
  const [userId, exp] = payload.split('.');
  if (!userId || Number(exp) < Date.now()) return null;
  return userId;
}

/* ---------- Supabase (chave de serviço: só aqui no servidor) ---------- */

async function supa(caminho, opcoes = {}) {
  const chave = env('SUPABASE_SERVICE_ROLE_KEY');
  const resp = await fetch(SUPABASE_URL + caminho, {
    ...opcoes,
    headers: { apikey: chave, Authorization: 'Bearer ' + chave, 'Content-Type': 'application/json', ...(opcoes.headers || {}) }
  });
  const texto = await resp.text();
  const dados = texto ? JSON.parse(texto) : null;
  if (!resp.ok) throw new Error('Supabase: ' + ((dados && (dados.message || dados.error)) || resp.status));
  return dados;
}

/* quem é o astrólogo logado (pelo token de login do próprio site) */
async function usuarioDoJwt(jwt) {
  if (!jwt) return null;
  const resp = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + jwt } });
  if (!resp.ok) return null;
  const u = await resp.json();
  return u && u.id ? u.id : null;
}

async function lerConexao(userId) {
  const linhas = await supa('/rest/v1/google_conexoes?user_id=eq.' + encodeURIComponent(userId) + '&select=*');
  return linhas && linhas[0] ? linhas[0] : null;
}
async function salvarConexao(userId, campos) {
  await supa('/rest/v1/google_conexoes?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, ...campos, atualizado_em: new Date().toISOString() })
  });
}
async function apagarConexao(userId) {
  await supa('/rest/v1/google_conexoes?user_id=eq.' + encodeURIComponent(userId), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
}

/* ---------- Google ---------- */

async function trocarCodigo(code) {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' })
  });
  const dados = await resp.json();
  if (!resp.ok) throw new Error('Google recusou o código: ' + (dados.error_description || dados.error || resp.status));
  return dados;
}

const tokensEmMemoria = new Map(); // userId -> { valor, expira }
async function tokenDeAcesso(userId, conexao) {
  const guardado = tokensEmMemoria.get(userId);
  if (guardado && guardado.expira - 60000 > Date.now()) return guardado.valor;
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: decifrar(conexao.refresh_token_cifrado), client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), grant_type: 'refresh_token' })
  });
  const dados = await resp.json();
  if (!resp.ok || !dados.access_token) {
    const e = new Error('Google recusou o token: ' + (dados.error_description || dados.error || resp.status));
    e.revogado = dados.error === 'invalid_grant'; // o astrólogo tirou a permissão (ou ela expirou): precisa conectar de novo
    throw e;
  }
  tokensEmMemoria.set(userId, { valor: dados.access_token, expira: Date.now() + (dados.expires_in || 3600) * 1000 });
  return dados.access_token;
}

async function chamarGoogle(userId, conexao, caminho, opcoes = {}) {
  const token = await tokenDeAcesso(userId, conexao);
  const resp = await fetch('https://www.googleapis.com/calendar/v3' + caminho, {
    ...opcoes,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
  });
  const texto = await resp.text();
  const dados = texto ? JSON.parse(texto) : {};
  if (!resp.ok) throw new Error('Google Agenda: ' + ((dados.error && dados.error.message) || resp.status));
  return dados;
}

/* TODAS as agendas da conta (as próprias e as compartilhadas), sem as de feriados/aniversários, que não são compromissos */
const listaEmMemoria = new Map(); // userId -> { itens, expira }
async function listarAgendas(userId, conexao) {
  const guardada = listaEmMemoria.get(userId);
  if (guardada && guardada.expira > Date.now()) return guardada.itens;
  const itens = [];
  let pagina = '';
  for (let i = 0; i < 10; i++) {
    const r = await chamarGoogle(userId, conexao, '/users/me/calendarList?minAccessRole=freeBusyReader&maxResults=250' + (pagina ? '&pageToken=' + encodeURIComponent(pagina) : ''));
    (r.items || []).forEach(a => {
      if (String(a.id).includes('#')) return; // feriados, aniversários, etc.
      itens.push({ id: a.id, nome: a.summaryOverride || a.summary || a.id, principal: !!a.primary, cor: a.backgroundColor || null });
    });
    pagina = r.nextPageToken;
    if (!pagina) break;
  }
  listaEmMemoria.set(userId, { itens, expira: Date.now() + 5 * 60 * 1000 });
  return itens;
}
const esquecerAgendas = (userId) => listaEmMemoria.delete(userId);

/* ---------- datas em horário de Brasília ---------- */

function instanteLocal(dataISO, minutos) {
  const [a, m, d] = dataISO.split('-').map(Number);
  const chute = Date.UTC(a, m - 1, d, 0, minutos);
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(chute)).forEach(x => { p[x.type] = x.value; });
  const comoUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
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

module.exports = {
  SITE, FUSO, REDIRECT_URI, ESCOPOS, SUPABASE_URL, SUPABASE_ANON, aplicarCors, env,
  cifrar, decifrar, criarEstado, lerEstado,
  supa, usuarioDoJwt, lerConexao, salvarConexao, apagarConexao,
  trocarCodigo, tokenDeAcesso, chamarGoogle, listarAgendas, esquecerAgendas,
  instanteLocal, paraLocal, minParaHHMM, hhmmParaMin, ehData, ehHora, somarDias
};
