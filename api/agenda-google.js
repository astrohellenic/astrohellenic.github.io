/* Endpoint /api/agenda-google — usado pela página pública de agendar (agendar.html) e pela ferramenta Agenda.
   Funciona pra QUALQUER astrólogo que tenha conectado a Google Agenda (Configurações → Agenda → Conectar Google Agenda,
   ver api/google.js). Quem não conectou continua usando só a agenda do próprio software (nada aqui bloqueia nem cria).

   Quatro ações (POST, corpo JSON, campo "acao"; "u" = id do astrólogo, vem do link de agendar):
     ocupados  { u, de:'YYYY-MM-DD', ate:'YYYY-MM-DD' }  -> { ok, conectado, ocupados:[{ data, hora_inicio, hora_fim }] }
                horários em que QUALQUER agenda marcada como "bloqueia" está ocupada (já em horário de Brasília, cortados por dia)
     criar     { u, c, data, hora }                       -> { ok, eventId } | { ok:false, erro }
                confere o link (u, c) no Supabase e se o horário continua livre em todas as agendas, e cria o evento na agenda
                principal escolhida. Nome do cliente e duração vêm do Supabase, nunca do navegador.
     avisar    { u, c, servico } -> { ok, enviado }
                dispara o webhook do astrólogo (se tiver) com os dados do formulário + do horário confirmado
     apagar    { u, c, eventId }                          -> { ok }
                só apaga evento criado por esta função pra esse cliente (usado se a reserva no Supabase falhar) */

const G = require('./_google');

const MAX_DIAS_CONSULTA = 120;
const TAMANHO_LOTE_FREEBUSY = 50; // limite do Google por consulta

const ok = (json) => ({ status: 200, json });
const erro = (status, texto, extra = {}) => ({ status, json: { ok: false, erro: texto, ...extra } });

const agendasQueBloqueiam = G.agendasQueBloqueiam;

/* intervalos ocupados dentro de [inicio, fim] (instantes), já divididos por dia de Brasília */
async function buscarOcupados(userId, conexao, ids, inicio, fim, fuso) {
  const fatias = [];
  for (let i = 0; i < ids.length; i += TAMANHO_LOTE_FREEBUSY) {
    const lote = ids.slice(i, i + TAMANHO_LOTE_FREEBUSY);
    const dados = await G.chamarGoogle(userId, conexao, '/freeBusy', {
      method: 'POST',
      body: JSON.stringify({ timeMin: inicio.toISOString(), timeMax: fim.toISOString(), timeZone: fuso, items: lote.map(id => ({ id })) })
    });
    lote.forEach(id => {
      const cal = dados.calendars && dados.calendars[id];
      if (!cal || (cal.errors && cal.errors.length)) return; // agenda sem acesso de ver ocupado/livre: não dá pra consultar, segue
      (cal.busy || []).forEach(b => {
        let atual = G.paraLocal(new Date(b.start), fuso);
        const final = G.paraLocal(new Date(b.end), fuso);
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

/* regras de agendamento do astrólogo (Configurações → Agenda). Valem mesmo pra quem não conectou o Google. As colunas novas podem
   ainda não existir no banco: nesse caso cai nos valores de sempre (antecedência 2h, 45 dias, horários encadeados). */
async function lerRegras(userId) {
  const padrao = { antecedencia_min: 120, dias_a_frente: 45, passo_min: null };
  try {
    let linhas;
    try {
      linhas = await G.supa('/rest/v1/configuracoes?user_id=eq.' + encodeURIComponent(userId) + '&select=agenda_antecedencia_min,agenda_dias_a_frente,agenda_passo_min');
    } catch (e) { return padrao; } // colunas ainda não criadas
    const c = linhas && linhas[0];
    if (!c) return padrao;
    const inteiro = (v, min, max) => (Number.isFinite(Number(v)) && v !== null && Number(v) >= min && Number(v) <= max) ? Math.round(Number(v)) : null;
    return {
      antecedencia_min: inteiro(c.agenda_antecedencia_min, 0, 60 * 24 * 30) ?? padrao.antecedencia_min,
      dias_a_frente: inteiro(c.agenda_dias_a_frente, 1, 120) ?? padrao.dias_a_frente,
      passo_min: inteiro(c.agenda_passo_min, 5, 24 * 60)
    };
  } catch (e) { return padrao; }
}

async function acaoOcupados(corpo) {
  if (!corpo.u || !G.ehData(corpo.de) || !G.ehData(corpo.ate)) return erro(400, 'Dados inválidos.');
  const dias = (Date.parse(corpo.ate) - Date.parse(corpo.de)) / 86400000;
  if (dias < 0 || dias > MAX_DIAS_CONSULTA) return erro(400, 'Período inválido.');
  const regras = await lerRegras(corpo.u);
  // nunca consulta o Google além do que o astrólogo deixa marcar (menos dados e menos chance de passar do limite do Google)
  const conexao = await G.lerConexao(corpo.u);
  const fuso = conexao ? await G.fusoDoAstrologo(corpo.u, conexao) : G.FUSO;
  const limite = G.somarDias(G.paraLocal(new Date(), fuso).dataISO, regras.dias_a_frente + 1);
  if (corpo.ate > limite) corpo.ate = limite;
  if (corpo.de > corpo.ate) corpo.de = corpo.ate;
  if (!conexao) return ok({ ok: true, conectado: false, ocupados: [], regras, fuso });
  const { ids } = await agendasQueBloqueiam(corpo.u, conexao);
  const ocupados = await buscarOcupados(corpo.u, conexao, ids, G.instanteLocal(corpo.de, 0, fuso), G.instanteLocal(G.somarDias(corpo.ate, 1), 0, fuso), fuso);
  return ok({ ok: true, conectado: true, ocupados, regras, fuso });
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
  const fuso = await G.fusoDoAstrologo(u, conexao);
  const inicio = G.instanteLocal(data, ini, fuso);
  const fim = G.instanteLocal(data, ini + duracao, fuso);
  if (inicio.getTime() < Date.now()) return erro(409, 'Esse horário já passou.');

  const { ids, principal } = await agendasQueBloqueiam(u, conexao);
  if ((await buscarOcupados(u, conexao, ids, inicio, fim, fuso)).length) return erro(409, 'Esse horário acabou de ser ocupado. Escolha outro.');

  const nome = (agenda.cliente_nome || 'Cliente').toString().slice(0, 120);
  // contato que o próprio cliente já preencheu no formulário (cadastro/mapa): vai pra descrição do evento, pro astrólogo ver na hora
  let contato = '';
  try {
    const m = await G.supa('/rest/v1/mapas?id=eq.' + encodeURIComponent(c) + '&select=whatsapp,email');
    const dados = m && m[0];
    if (dados) {
      const limpa = (t) => String(t || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120);
      if (limpa(dados.whatsapp)) contato += '\nWhatsApp: ' + limpa(dados.whatsapp);
      if (limpa(dados.email)) contato += '\nE-mail: ' + limpa(dados.email);
    }
  } catch (e) { /* sem contato na descrição, o evento sai igual */ }
  const evento = await G.chamarGoogle(u, conexao, '/calendars/' + encodeURIComponent(principal) + '/events', {
    method: 'POST',
    body: JSON.stringify({
      summary: 'Atendimento - ' + nome,
      description: 'Agendado pelo Astro Hellenic.' + contato,
      start: { dateTime: inicio.toISOString(), timeZone: fuso },
      end: { dateTime: fim.toISOString(), timeZone: fuso },
      extendedProperties: { private: { origem: 'astrohellenic', mapa: String(c) } }
    })
  });
  return ok({ ok: true, eventId: evento.id });
}

/* Webhook do astrólogo (Configurações → Captação): avisado DEPOIS que o cliente confirma o horário, com os dados do formulário e do agendamento.
   O endereço do webhook fica só no servidor e os dados vêm do Supabase (nunca do navegador, salvo o nome do serviço, só texto). Nunca falha o agendamento. */
async function acaoAvisar(corpo) {
  const { u, c } = corpo;
  if (!u || !c) return erro(400, 'Dados inválidos.');
  const agenda = await agendaPublica(u, c);
  if (!agenda || !agenda.ja_agendado) return erro(409, 'Nenhum horário confirmado para esse cliente.');
  const cfg = await G.supa('/rest/v1/configuracoes?user_id=eq.' + encodeURIComponent(u) + '&select=webhook_url');
  const url = cfg && cfg[0] && String(cfg[0].webhook_url || '').trim();
  if (!url || !/^https:\/\//i.test(url)) return ok({ ok: true, enviado: false });
  const m = await G.supa('/rest/v1/mapas?id=eq.' + encodeURIComponent(c) + '&user_id=eq.' + encodeURIComponent(u) + '&select=nome,data_nascimento,hora_nascimento,cidade,latitude,longitude,whatsapp,email');
  const cliente = (m && m[0]) || {};
  const conexao = await G.lerConexao(u);
  const fuso = conexao ? await G.fusoDoAstrologo(u, conexao) : G.FUSO;
  const ag = agenda.ja_agendado;
  const carga = {
    evento: 'agendamento_confirmado',
    astrologo_id: u,
    cliente_id: c,
    servico: String(corpo.servico || '').slice(0, 120),
    cliente: { nome: cliente.nome || agenda.cliente_nome || '', whatsapp: cliente.whatsapp || '', email: cliente.email || '', data_nascimento: cliente.data_nascimento || '', hora_nascimento: cliente.hora_nascimento || '', cidade: cliente.cidade || '', latitude: cliente.latitude ?? null, longitude: cliente.longitude ?? null },
    agendamento: { data: ag.data, hora: String(ag.hora_inicio || '').slice(0, 5), fuso, duracao_min: Number(agenda.duracao) || null }
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(carga), signal: ctrl.signal });
    return ok({ ok: true, enviado: resp.ok });
  } catch (e) {
    console.error('agenda-google webhook:', e && e.message);
    return ok({ ok: true, enviado: false });
  } finally { clearTimeout(timer); }
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
    const acoes = { ocupados: acaoOcupados, criar: acaoCriar, apagar: acaoApagar, avisar: acaoAvisar };
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
