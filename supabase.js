/* ==========================================
   MÓDULO DE BANCO DE DADOS E NAVEGAÇÃO (SUPABASE)
   ========================================== */

const SUPABASE_URL = "https://ndgjenvddkmztmdixjhc.supabase.co";
const SUPABASE_KEY = "sb_publishable_VTjldgs8Hv1RODaMg7T57Q_ISzbnm5C";
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
var supabaseClient = window.supabaseClient;

let activeFolder = "Clientes";
let customFolders = ["Clientes"];
let cachedFolderData = [];
let selectedMapIds = new Set();
let isSelectionMode = false;
// Valor-padrão até carregarOrdenacaoClientes (chamada após o login, junto
// de carregarTemaMandala/carregarEstiloPlanetas) trazer o que está salvo
// na CONTA do astrólogo — usa a tabela configuracoes, não localStorage,
// porque precisa valer em qualquer navegador/aparelho que ele usar, não
// só no que fez a mudança.
let currentSortField = 'codigo';
let currentSortDirection = 'asc';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* BUSCA AUTOMÁTICA DE FUSO POR LONGITUDE */
function calcularFusoPorLongitude(lon) {
  if (lon === undefined || lon === null || isNaN(lon)) return -3;
  return Math.round(lon / 15);
}

/* 1. CARREGA AS PASTAS EM ORDEM ALFABÉTICA DO SUPABASE
   REGRA IMPORTANTE (bug de 24/10/2026): "a lista veio vazia" NUNCA pode ser entendido como "conta nova" sem ter certeza de que o login estava válido.
   Quando a rede ainda não voltou (app reaberto, iPad acordando) ou a renovação do login falha no meio, o Supabase não dá erro: responde VAZIO, como se
   fosse uma pessoa sem login. O site então mostrava só a pasta Clientes, sem as pastas e sem as definições, como uma conta nova — e, num app instalado, sem
   como recarregar. Agora: só vale a resposta de um login CONFIRMADO; qualquer dúvida mostra um aviso, tenta de novo sozinho (rede de volta, app em primeiro
   plano, a cada poucos segundos) e, quando consegue, recarrega também as definições da conta. */
window.__contaCarregada = false;
let __contaFalhouAntes = false, __tentativasConta = 0, __timerConta = null, __carregandoConta = false;

/* usuário com login confirmado, ou null; renova o login se estiver vencendo */
async function obterUsuarioParaCarregar() {
  try {
    let { data: { session } } = await supabaseClient.auth.getSession();
    const agora = Math.floor(Date.now() / 1000);
    if (!session || (session.expires_at && session.expires_at < agora + 30)) {
      const r = await supabaseClient.auth.refreshSession();
      session = r && r.data ? r.data.session : null;
    }
    return session ? session.user : null;
  } catch (e) { return null; }
}

function telaDeLoginAberta() {
  const o = document.getElementById('loginOverlay');
  return !!(o && o.classList.contains('visible'));
}
function esconderAvisoConta() {
  const b = document.getElementById('avisoContaNaoCarregada');
  if (b) b.remove();
}
function mostrarAvisoConta() {
  if (telaDeLoginAberta() || document.getElementById('avisoContaNaoCarregada')) return;
  const b = document.createElement('div');
  b.id = 'avisoContaNaoCarregada';
  b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 10px);z-index:100000;max-width:min(560px,92vw);box-sizing:border-box;padding:12px 16px;background:#F3E3B8;color:#16233F;border:2px solid #A03E25;box-shadow:0 4px 18px rgba(0,0,0,.35);font:600 15px/1.35 Cinzel,serif;text-align:center';
  const t = document.createElement('div');
  t.textContent = 'Não consegui carregar os seus dados agora. Tentando de novo...';
  const linha = document.createElement('div');
  linha.style.cssText = 'margin-top:10px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
  const mk = (txt, acao) => {
    const x = document.createElement('button');
    x.type = 'button'; x.textContent = txt;
    x.style.cssText = 'background:transparent;border:1.5px solid #1034A6;color:#1034A6;padding:8px 14px;font:700 14px Cinzel,serif;cursor:pointer;border-radius:0';
    x.addEventListener('click', acao);
    return x;
  };
  linha.appendChild(mk('Tentar agora', () => { tentarCarregarContaDeNovo(); }));
  linha.appendChild(mk('Recarregar a página', () => { location.reload(); }));
  b.appendChild(t); b.appendChild(linha);
  document.body.appendChild(b);
}
function agendarNovaTentativaConta() {
  clearTimeout(__timerConta);
  const espera = [2000, 5000, 10000, 20000, 40000][Math.min(__tentativasConta, 4)] || 60000;
  __tentativasConta++;
  __timerConta = setTimeout(tentarCarregarContaDeNovo, espera);
}
async function tentarCarregarContaDeNovo() {
  if (window.__contaCarregada || __carregandoConta || telaDeLoginAberta()) return; /* sem login não há o que carregar */
  clearTimeout(__timerConta);
  await carregarPastasSalvas();
}
/* ao voltar a rede ou o app para a frente, tenta na hora (só enquanto a conta não carregou) */
window.addEventListener('online', () => { if (!window.__contaCarregada) tentarCarregarContaDeNovo(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && !window.__contaCarregada && __contaFalhouAntes) tentarCarregarContaDeNovo(); });

/* depois de uma falha que se resolveu: traz de novo as definições da conta (tema, estilos, ordem dos botões...) e redesenha */
async function recarregarDefinicoesDaConta(user) {
  const funcoes = [typeof carregarTemaMandala === 'function' && carregarTemaMandala, typeof carregarNivelPlano === 'function' && carregarNivelPlano,
    typeof carregarEstiloPlanetas === 'function' && carregarEstiloPlanetas, typeof carregarEstiloMandala === 'function' && carregarEstiloMandala,
    typeof carregarMostrarRotulosGlifos === 'function' && carregarMostrarRotulosGlifos, typeof carregarOrdenacaoClientes === 'function' && carregarOrdenacaoClientes,
    typeof carregarOrdemBotoesTopo === 'function' && carregarOrdemBotoesTopo].filter(Boolean);
  for (const f of funcoes) { try { await f(user.id); } catch (e) { console.error(e); } }
  try { if (typeof carregarMapasDoBanco === 'function') await carregarMapasDoBanco(activeFolder); } catch (e) { console.error(e); }
  try { reRenderizarModuloAtivo(); } catch (e) { console.error(e); }
}

async function carregarPastasSalvas() {
  if (__carregandoConta) return;
  __carregandoConta = true;
  let carregou = false, usuario = null;
  try {
    usuario = await obterUsuarioParaCarregar();
    if (usuario) {
      const ler = () => supabaseClient.from('pastas').select('nome').order('nome', { ascending: true });
      const { data, error } = await ler();
      if (!error && Array.isArray(data)) {
        if (data.length > 0) { customFolders = data.map(p => p.nome); carregou = true; }
        else {
          /* vazio: só é "conta nova" se o servidor CONFIRMA o login agora e uma segunda leitura continua vazia */
          const { data: conf, error: erroConf } = await supabaseClient.auth.getUser();
          if (!erroConf && conf && conf.user) {
            const { data: de_novo, error: erro2 } = await ler();
            if (!erro2 && Array.isArray(de_novo)) {
              if (de_novo.length > 0) { customFolders = de_novo.map(p => p.nome); carregou = true; }
              else {
                await supabaseClient.from('pastas').insert([{ nome: 'Clientes', user_id: conf.user.id }]);
                customFolders = ['Clientes']; carregou = true;
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Erro ao carregar pastas:", e);
  }
  __carregandoConta = false;

  if (carregou) {
    window.__contaCarregada = true;
    esconderAvisoConta();
    if (__contaFalhouAntes) { __contaFalhouAntes = false; await recarregarDefinicoesDaConta(usuario); }
  } else if (!telaDeLoginAberta()) {
    __contaFalhouAntes = true;
    setTimeout(mostrarAvisoConta, 800);
    agendarNovaTentativaConta();
  }
  renderMenuPrincipal();

  /* PREENCHE O SELECT DE PASTAS DO NOVO MAPA AUTOMATICAMENTE */
  const selectPastaModal = document.getElementById('modalPasta');
  if (selectPastaModal && Array.isArray(customFolders)) {
    const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    selectPastaModal.innerHTML = pastasOrdenadas.map(p => 
      `<option value="${escapeHtml(p)}" ${p === activeFolder ? 'selected' : ''}>${escapeHtml(p)}</option>`
    ).join('');
  }
}

/* ÍCONES MONOLINE DO MENU LATERAL (grade 64, traço vem de .icone) */
const MENU_ICONES = {
  cima: '<polyline points="12,40 32,20 52,40"/>',
  baixo: '<polyline points="12,24 32,44 52,24"/>',
  olho: '<path d="M6 32 C14 18 24 14 32 14 C40 14 50 18 58 32 C50 46 40 50 32 50 C24 50 14 46 6 32 Z"/><circle cx="32" cy="32" r="8"/>',
  salvar: '<path d="M10 8 H46 L56 18 V56 H10 Z"/><path d="M20 8 V24 H44 V8"/><rect x="18" y="36" width="28" height="20"/>',
  marcador: '<path d="M16 8 H48 V58 L32 46 L16 58 Z"/>',
  info: '<circle cx="32" cy="32" r="22"/><line x1="32" y1="28" x2="32" y2="44"/><circle cx="32" cy="20" r="1.5"/>',
  baixarArquivo: '<path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="32" y1="26" x2="32" y2="46"/><polyline points="24,38 32,46 40,38"/>',
  check: '<polyline points="14,34 26,46 50,18"/>',
  imprimir: '<path d="M18,22 V8 H46 V22"/><rect x="8" y="22" width="48" height="24" rx="4"/><path d="M18,38 H46 V58 H18 Z"/><circle cx="47" cy="30" r="1.5"/>',
  aparencia: '<path d="M32 8 C18 8 8 18 8 30 C8 44 20 56 34 56 C40 56 42 52 40 48 C38 44 40 40 46 40 H50 C54 40 56 37 56 33 C56 19 46 8 32 8 Z"/><circle cx="20" cy="30" r="3"/><circle cx="28" cy="20" r="3"/><circle cx="40" cy="20" r="3"/>',
  relatorio: '<path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/>',
  servicos: '<path d="M32 54 C10 38 8 24 14 17 C20 10 30 12 32 20 C34 12 44 10 50 17 C56 24 54 38 32 54 Z"/>',
  captacao: '<circle cx="26" cy="20" r="10"/><path d="M8 54 C8 40 16 34 26 34 C36 34 44 40 44 54"/><path d="M50 22 V40 M41 31 H59"/>',
  agenda: '<rect x="8" y="12" width="48" height="44" rx="4"/><line x1="8" y1="24" x2="56" y2="24"/><line x1="20" y1="6" x2="20" y2="18"/><line x1="44" y1="6" x2="44" y2="18"/><line x1="18" y1="34" x2="26" y2="34"/><line x1="30" y1="34" x2="38" y2="34"/><line x1="42" y1="34" x2="46" y2="34"/><line x1="18" y1="44" x2="26" y2="44"/><line x1="30" y1="44" x2="38" y2="44"/>',
  seguranca: '<path d="M32 6 L52 14 V32 C52 44 44 52 32 58 C20 52 12 44 12 32 V14 Z"/><polyline points="23,32 30,39 42,25"/>',
  estrela: '<path d="M32 8 L38 25 L56 26 L42 37 L47 55 L32 45 L17 55 L22 37 L8 26 L26 25 Z"/>',
  sol: '<circle cx="32" cy="32" r="10"/><path d="M32 6 V14 M32 50 V58 M6 32 H14 M50 32 H58 M14 14 L20 20 M44 44 L50 50 M14 50 L20 44 M44 20 L50 14"/>',
  lua: '<path d="M46 38 A22 22 0 1 1 26 10 A17 17 0 0 0 46 38 Z"/>',
  automatico: '<circle cx="32" cy="32" r="22"/><path d="M32 10 A22 22 0 0 1 32 54 Z"/>',
  planetaSimples: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="2"/>',
  planetaEsferico: '<circle cx="32" cy="32" r="22"/><path d="M19 26 A15 15 0 0 1 30 17"/>',
  fonte: '<path d="M10 52 L26 12 L42 52 M16 38 H36"/><path d="M50 28 V52"/>',
  olhoCortado: '<path d="M6 32 C14 18 24 14 32 14 C40 14 50 18 58 32 C50 46 40 50 32 50 C24 50 14 46 6 32 Z"/><circle cx="32" cy="32" r="8"/><line x1="10" y1="54" x2="54" y2="10"/>',
  alvo: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="2"/>',
  pizza: '<circle cx="32" cy="32" r="22"/><path d="M32 10 V32 H54 M32 32 L18 50"/>',
  checkCirculo: '<circle cx="32" cy="32" r="22"/><polyline points="21,33 29,41 44,24"/>',
  enviar: '<path d="M10 40 V54 H54 V40"/><line x1="32" y1="8" x2="32" y2="42"/><polyline points="20,20 32,8 44,20"/>',
  sair: '<path d="M26 10 H12 V54 H26"/><line x1="22" y1="32" x2="56" y2="32"/><polyline points="44,20 56,32 44,44"/>',
  fechar: '<path d="M16 16 L48 48 M48 16 L16 48"/>',
  voltar: '<polyline points="40,12 20,32 40,52"/>',
  avancar: '<polyline points="24,12 44,32 24,52"/>',
  lixeira: '<path d="M12 16 H52 M24 16 V10 H40 V16 M16 16 L19 54 H45 L48 16 M28 26 V44 M36 26 V44"/>',
  editar: '<path d="M12 52 L16 38 L42 12 L52 22 L26 48 Z M36 18 L46 28"/>',
  pasta: '<path d="M10 18 A4 4 0 0 1 14 14 H26 L32 22 H50 A4 4 0 0 1 54 26 V46 A4 4 0 0 1 50 50 H14 A4 4 0 0 1 10 46 Z"/>',
  buscar: '<circle cx="28" cy="28" r="16"/><line x1="40" y1="40" x2="54" y2="54"/>',
  relogio: '<circle cx="32" cy="32" r="22"/><polyline points="32,18 32,32 42,38"/>',
  mais: '<path d="M32 12 V52 M12 32 H52"/>',
  novoMapa: '<circle cx="26" cy="16" r="9"/><path d="M10,54 C10,38 17,32 26,32 C35,32 42,38 42,54"/><line x1="50" y1="30" x2="50" y2="46"/><line x1="42" y1="38" x2="58" y2="38"/>',
  whatsapp: '<path transform="translate(4 4) scale(2.3333)" stroke-width="1.2857" d="M20.463 3.488A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/>',
  video: '<rect x="6" y="18" width="34" height="28" rx="4"/><polyline points="40,28 58,18 58,46 40,36"/>',
  email: '<rect x="8" y="14" width="48" height="36" rx="3"/><polyline points="8,18 32,36 56,18"/>',
  ordemAsc: '<path d="M18 10 V50 M8 40 L18 50 L28 40 M38 16 H44 M38 28 H50 M38 40 H56"/>',
  ordemDesc: '<path d="M18 54 V14 M8 24 L18 14 L28 24 M38 48 H44 M38 36 H50 M38 24 H56"/>',
  importar: '<path d="M10,38 V54 A4,4 0 0 0 14,58 H50 A4,4 0 0 0 54,54 V38"/><polyline points="10,38 24,38 28,46 36,46 40,38 54,38"/><line x1="32" y1="6" x2="32" y2="36"/><polyline points="20,24 32,36 44,24"/>'
};
function menuIcone(nome, tam = 22) {
  return `<svg class="icone" viewBox="0 0 64 64" width="${tam}" height="${tam}" aria-hidden="true">${MENU_ICONES[nome]}</svg>`;
}
function menuLogoHtml() {
  return `<img class="logo-claro" src="astrohellenic.svg?v=20261024" alt="AstroHellenic" style="max-height: 38px; width: auto;"><img class="logo-escuro" src="astrohellenic-escuro.svg?v=20261024" alt="AstroHellenic" style="max-height: 38px; width: auto;"><img class="logo-sulfite" src="astrohellenic-sulfite.svg?v=20261024" alt="AstroHellenic" style="max-height: 38px; width: auto;">`;
}
function menuLinhaPasta(pasta, comAvancar) {
  const attr = escapeHtml(pasta).replace(/'/g, "&#39;");
  return `
      <div class="menu-pasta" onclick="abrirConteudoPasta('${attr}')">
        <div class="nome-pasta">${menuIcone('pasta')}<span>${escapeHtml(pasta)}</span></div>
        <div class="acoes-pasta" onclick="event.stopPropagation()">
          <button type="button" class="botao-icone" onclick="editarNomePasta(event, '${attr}')" title="Renomear pasta" style="color: var(--cinza);">${menuIcone('editar')}</button>
          <button type="button" class="botao-icone botao-apagar" onclick="apagarPasta(event, '${attr}')" title="Apagar pasta">${menuIcone('lixeira')}</button>
          ${comAvancar ? `<span class="botao-icone" style="width:20px">${menuIcone('avancar')}</span>` : ''}
        </div>
      </div>`;
}

/* NÍVEL 1: MENU PRINCIPAL LIMPO (clientes e pastas — as configurações ficam na página própria, botão da barra superior) */
function renderMenuPrincipal() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const htmlPastas = pastasOrdenadas.map(p => menuLinhaPasta(p, false)).join('');

  sidebar.innerHTML = `
    <div class="sidebar-header">
      ${menuLogoHtml()}
    </div>
    <div style="flex: 1; overflow-y: auto;">
      <div class="menu-acoes">
        <button type="button" class="botao-icone" onclick="abrirModalNovoMapa()" title="Novo Mapa Astral">${menuIcone('novoMapa')}</button>
        <button type="button" class="botao-icone" onclick="abrirModalImportacaoTexto()" title="Importar Lista em Massa">${menuIcone('importar')}</button>
      </div>
      <div class="menu-rotulo-linha">
        <span class="rotulo">Pastas</span>
        <button type="button" class="add-folder-btn" onclick="criarNovaPasta()">+ Pasta</button>
      </div>
      ${htmlPastas}
    </div>
  `;
}

/* TEMA CÉU (claro/céu): preferência do APARELHO, no localStorage (chave astro_tema_mandala) — igual ao modo de
   cor claro/escuro. O Céu hoje cobre o software inteiro, então é aparência, não dado da conta; e assim o
   index.html já abre no tema certo, sem piscar o claro/escuro por trás (ver o script no <head>/<body>).
   Não migrar de volta pro Supabase por semelhança com a Regra de ouro 2 — decisão do astrólogo (03/10/2026). */
function lerTemaMandalaLocal() {
  try {
    const t = localStorage.getItem('astro_tema_mandala');
    return (t === 'ceu' || t === 'claro' || t === 'sulfite') ? t : null;
  } catch (e) { return null; }
}

function aplicarTemaMandala(tema) {
  window.temaMandala = tema;
  if (typeof window.aplicarModoCor === 'function') { // o Céu não tem base escura: reaplica o modo com o tema já definido
    let modo = 'auto'; try { modo = localStorage.getItem('astro_modo_cor') || 'auto'; } catch (e) {}
    window.aplicarModoCor(modo);
  }
  document.body.classList.toggle('tema-ceu', tema === 'ceu');
  document.documentElement.classList.toggle('tema-sulfite', tema === 'sulfite');
  // Se a mandala já tinha sido desenhada com outro tema, refaz o desenho já com o tema certo.
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof renderMandala === 'function') {
    if (mandalaEstaNaTela()) renderMandala();
    else reRenderizarModuloAtivo(); // outra ferramenta aberta: refaz ELA com o tema novo (se ainda esperando o mapa, não faz nada)
  }
}

/* CHAMADO LOGO APÓS O LOGIN. Se este aparelho já tem o tema guardado, não há nada a fazer (já foi aplicado na
   abertura). Só num aparelho que ainda não escolheu: lê UMA VEZ o que estava salvo na conta (tema_mandala, de
   antes dessa mudança), guarda no aparelho e aplica — quem já usava o Céu não perde a escolha. */
async function carregarTemaMandala(userId) {
  if (lerTemaMandalaLocal()) return;
  let tema = 'claro';
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('tema_mandala')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && data.tema_mandala) tema = data.tema_mandala;
  } catch (e) {
    console.error("Erro ao ler o tema da mandala da conta:", e);
  }
  try { localStorage.setItem('astro_tema_mandala', tema); } catch (e) {}
  aplicarTemaMandala(tema);
}

/* PLANO DO USUÁRIO (perfis.nivel: basico | essencial | pro | admin). window.nivelPlano fica null até a resposta chegar (ou se a leitura falhar) —
   nesse caso NADA é bloqueado, pra um erro de rede nunca trancar quem paga. Os temas Céu e Sulfite são do Essencial pra cima. */
const NIVEIS_COM_TEMAS = ['essencial', 'pro', 'admin'];
function temaLiberadoNoPlano(tema) {
  if (tema !== 'ceu' && tema !== 'sulfite') return true;
  return !window.nivelPlano || NIVEIS_COM_TEMAS.includes(window.nivelPlano);
}
/* Ícones esféricos dos planetas: também do Essencial pra cima (os simples são pra todos). A escolha guardada na conta NÃO é apagada —
   só deixa de valer enquanto o plano não libera, e volta sozinha se o plano subir. */
function estiloPlanetasLiberadoNoPlano(estilo) {
  if (estilo !== 'esferico') return true;
  return !window.nivelPlano || NIVEIS_COM_TEMAS.includes(window.nivelPlano);
}
function aplicarLimiteEstiloPlanetas() {
  if (estiloPlanetasLiberadoNoPlano(window.estiloPlanetas)) return;
  window.estiloPlanetas = 'simples';
  reRenderizarModuloAtivo();
}
/* FERRAMENTAS DE TESTE: só a conta admin (perfis.nivel = 'admin') vê e abre. Aqui a regra é OPOSTA à dos temas: enquanto o plano não
   chegou (ou a leitura falhou) a ferramenta fica ESCONDIDA — erro de rede nunca abre ferramenta de teste pra quem não é admin. */
const FERRAMENTAS_SO_ADMIN = ['fasesVida', 'isopsefia', 'retificacaoSizigia', 'catarche'];
function usuarioEhAdmin() { return window.nivelPlano === 'admin'; }
function ferramentaLiberada(modulo) { return !FERRAMENTAS_SO_ADMIN.includes(modulo) || usuarioEhAdmin(); }
function aplicarVisibilidadeFerramentasAdmin() {
  FERRAMENTAS_SO_ADMIN.forEach(chave => {
    const btn = document.querySelector(`#top-bar [data-modulo-key="${chave}"]`);
    if (btn) btn.style.display = usuarioEhAdmin() ? '' : 'none';
  });
  if (FERRAMENTAS_SO_ADMIN.includes(window.moduloTecnicoAtivo)) abrirModuloTecnica(usuarioEhAdmin() ? window.moduloTecnicoAtivo : 'mandala', true);
}
async function carregarNivelPlano(userId) {
  try {
    const { data, error } = await supabaseClient.from('perfis').select('nivel').eq('user_id', userId).maybeSingle();
    if (error) return;
    window.nivelPlano = (data && data.nivel) || 'basico';
  } catch (e) { return; }
  aplicarVisibilidadeFerramentasAdmin();
  // Quem é do plano Básico e estava com um tema do Essencial (escolhido antes do bloqueio) volta pro Claro.
  aplicarLimiteEstiloPlanetas();
  if (!temaLiberadoNoPlano(window.temaMandala)) salvarAparencia('claro');
  else if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
}

/* SALVA A APARÊNCIA ESCOLHIDA NA TELA APARÊNCIA: 'ceu' | 'claro' | 'escuro' | 'auto'. Uma escolha só, tudo no
   APARELHO (localStorage), não na conta: o modo de cor (astro_modo_cor: claro/escuro/auto — "seguir o tema do
   aparelho" só faz sentido por aparelho) e o Tema Céu (astro_tema_mandala: ceu/claro).
   - 'ceu': liga o Céu, que é um tema INDEPENDENTE — sem base clara nem escura por trás (aplicarModoCor desliga o
     "tema-escuro" enquanto o Céu estiver ligado). O modo de cor guardado não é apagado, só deixa de valer.
   - 'claro' / 'escuro' / 'auto': desliga o Céu e aplica o modo — o automático só escolhe entre claro e escuro, nunca Céu.
   window.aplicarModoCor vem do script inline em index.html (roda antes de supabase.js). */
function salvarAparencia(escolha) {
  if (!temaLiberadoNoPlano(escolha)) { alert('Este tema é do plano Essencial ou Pro. No plano Básico você usa os temas Claro e Escuro.'); return; }
  const tema = (escolha === 'ceu' || escolha === 'sulfite') ? escolha : 'claro';
  try { localStorage.setItem('astro_tema_mandala', tema); } catch (e) {}
  window.temaMandala = tema; // antes do aplicarModoCor: ele consulta se o Céu está ligado
  let modo = escolha;
  if (tema === 'ceu' || tema === 'sulfite') { modo = 'auto'; try { modo = localStorage.getItem('astro_modo_cor') || 'auto'; } catch (e) {} }
  else { try { localStorage.setItem('astro_modo_cor', escolha); } catch (e) {} }
  if (typeof window.aplicarModoCor === 'function') window.aplicarModoCor(modo);
  document.body.classList.toggle('tema-ceu', tema === 'ceu');
  document.documentElement.classList.toggle('tema-sulfite', tema === 'sulfite');
  if (typeof currentCalculatedData !== 'undefined' && currentCalculatedData && typeof renderMandala === 'function') {
    if (mandalaEstaNaTela()) renderMandala();
  }
  if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
}

/* CARREGA O ESTILO DOS ÍCONES DOS PLANETAS DO SUPABASE (chamado logo após o login) */
async function carregarEstiloPlanetas(userId) {
  let estilo = 'simples';
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('estilo_planetas')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && data.estilo_planetas) estilo = data.estilo_planetas;
  } catch (e) {
    console.error("Erro ao carregar estilo dos planetas:", e);
  }
  window.estiloPlanetas = estilo;
  aplicarLimiteEstiloPlanetas();
  reRenderizarModuloAtivo();
}

/* SALVA O ESTILO DOS ÍCONES DOS PLANETAS ESCOLHIDO E ATUALIZA A TELA NA HORA */
async function salvarEstiloPlanetas(estilo) {
  if (!estiloPlanetasLiberadoNoPlano(estilo)) { alert('Os ícones esféricos são do plano Essencial ou Pro. No plano Básico você usa os ícones simples.'); return; }
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, estilo_planetas: estilo }, { onConflict: 'user_id' });

    if (!error) {
      window.estiloPlanetas = estilo;
      reRenderizarModuloAtivo();
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else {
      alert("Erro ao salvar estilo dos planetas: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar estilo dos planetas.");
  }
}

/* ESTILO DA MANDALA (Astro Hellenic / francês) — preferência do astrólogo, guardada no Supabase (configuracoes.estilo_mandala),
   não no aparelho. Só o FORMATO do desenho (ver estiloMandalaAtual em mandala.js); cores e ícones seguem o tema.
   Sem escolha salva (ou coluna ainda não criada), vale o padrão de sempre de cada tema. */
async function carregarEstiloMandala(userId) {
  let estilo = null;
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('estilo_mandala')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && (data.estilo_mandala === 'astrohellenic' || data.estilo_mandala === 'astrohellenic_reto' || data.estilo_mandala === 'comum' || data.estilo_mandala === 'frances')) estilo = data.estilo_mandala;
  } catch (e) {
    console.error("Erro ao carregar o estilo da mandala:", e);
  }
  if (estilo && estilo !== window.estiloMandala) {
    window.estiloMandala = estilo;
    reRenderizarModuloAtivo();
  }
}

async function salvarEstiloMandala(estilo) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, estilo_mandala: estilo }, { onConflict: 'user_id' });

    if (!error) {
      window.estiloMandala = estilo;
      reRenderizarModuloAtivo();
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else if (/estilo_mandala/i.test(error.message || '')) {
      alert("Falta criar a coluna do estilo da mandala no banco. No Supabase, abra o SQL Editor e rode:\n\nalter table configuracoes add column estilo_mandala text;\n\nDepois escolha o estilo de novo.");
    } else {
      alert("Erro ao salvar o estilo da mandala: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar o estilo da mandala.");
  }
}

/* RÓTULOS DOS GLIFOS (nome do planeta ao lado do ícone) — preferência do astrólogo, guardada no Supabase (configuracoes.mostrar_rotulos_glifos),
   não no aparelho. Sem valor salvo (ou coluna ainda não criada), os nomes aparecem (padrão). Ver planetaComNome em planetIcons.js. */
async function carregarMostrarRotulosGlifos(userId) {
  let valor = true;
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('mostrar_rotulos_glifos')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && typeof data.mostrar_rotulos_glifos === 'boolean') valor = data.mostrar_rotulos_glifos;
  } catch (e) {
    console.error("Erro ao carregar a preferência dos rótulos dos glifos:", e);
  }
  if (valor !== window.mostrarRotulosGlifos) {
    window.mostrarRotulosGlifos = valor;
    reRenderizarModuloAtivo();
  }
}

async function salvarMostrarRotulosGlifos(valor) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, mostrar_rotulos_glifos: valor }, { onConflict: 'user_id' });

    if (!error) {
      window.mostrarRotulosGlifos = valor;
      reRenderizarModuloAtivo();
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else if (/mostrar_rotulos_glifos/i.test(error.message || '')) {
      alert("Falta criar a coluna dos rótulos dos glifos no banco. No Supabase, abra o SQL Editor e rode:\n\nalter table configuracoes add column mostrar_rotulos_glifos boolean default true;\n\nDepois escolha de novo.");
    } else {
      alert("Erro ao salvar a preferência dos rótulos dos glifos: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar a preferência dos rótulos dos glifos.");
  }
}

/* REDESENHA A FERRAMENTA ATUALMENTE ABERTA (usado ao trocar o estilo dos ícones dos planetas) */
function reRenderizarModuloAtivo() {
  if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData) return;
  // Recarregou a página com outra ferramenta aberta e o mapa ainda está chegando (ver window.onload em
  // mandala.js): moduloTecnicoAtivo ainda é undefined, e cair no 'mandala' aqui sobrescrevia a ferramenta
  // guardada (astro_ultimo_modulo) e cancelava a restauração. A ferramenta pendente já abre com o estilo certo.
  if (window.moduloPendenteRestaurar) return;
  descartarModulosGuardados(); // o estilo mudou: as telas guardadas das outras ferramentas ficariam com o antigo
  const modulo = window.moduloTecnicoAtivo || 'mandala';
  if (modulo === 'configuracoes') { atualizarTelaConfiguracoes(); return; } // a página de Configurações não depende do estilo dos ícones
  if (typeof abrirModuloTecnica === 'function') abrirModuloTecnica(modulo, true);
}

/* ORDEM DOS BOTÕES DA BARRA SUPERIOR (Configurações > Aparência)
   As chaves abaixo são as mesmas do atributo data-modulo-key de cada botão
   dentro de #top-bar .top-bar-controls, em index.html. */
const ORDEM_BOTOES_TOPO_PADRAO = ['relatorio', 'tabelaTecnica', 'mandala', 'sinastria', 'direcoes', 'liberacao', 'decenios', 'profeccao', 'lotes', 'horas', 'fasesVida', 'retificacaoSizigia', 'catarche', 'isopsefia', 'agenda', 'configuracoes', 'financeiro'];

const ROTULOS_BOTOES_TOPO = {
  relatorio: 'Relatório',
  tabelaTecnica: 'Tabela Técnica',
  mandala: 'Natal',
  sinastria: 'Sinastria',
  direcoes: 'Direções Primárias',
  liberacao: 'Liberação Zodiacal',
  decenios: 'Decênios',
  profeccao: 'Profecção',
  lotes: 'Calculadora de Lotes',
  horas: 'Horas Planetárias',
  fasesVida: 'Fases da Vida (teste)',
  retificacaoSizigia: 'Achador de horário pela sizígia (teste)',
  catarche: 'Catarché (teste)',
  isopsefia: 'Isopsefia',
  agenda: 'Agenda',
  configuracoes: 'Configurações',
  financeiro: 'Financeiro'
};

/* Completa uma ordem salva com chaves novas que não existiam quando ela foi
   salva (ex.: um botão adicionado à barra depois), colocando-as no fim, e
   descarta chaves que não existem mais. */
function completarOrdemBotoesTopo(ordem) {
  const base = Array.isArray(ordem) ? ordem.filter(chave => ORDEM_BOTOES_TOPO_PADRAO.includes(chave)) : [];
  ORDEM_BOTOES_TOPO_PADRAO.forEach(chave => {
    if (!base.includes(chave)) base.push(chave);
  });
  return base;
}

/* Reordena de verdade os botões dentro de #top-bar .top-bar-controls,
   movendo os elementos já existentes (appendChild move, não clona — os
   onclick continuam funcionando normalmente). */
function aplicarOrdemBotoesTopo(ordem) {
  const container = document.querySelector('#top-bar .top-bar-controls');
  if (!container) return;
  completarOrdemBotoesTopo(ordem).forEach(chave => {
    const btn = container.querySelector(`[data-modulo-key="${chave}"]`);
    if (btn) container.appendChild(btn);
  });
}

/* CARREGA A ORDEM DOS BOTÕES DA BARRA SUPERIOR DO SUPABASE (chamado logo após o login) */
async function carregarOrdemBotoesTopo(userId) {
  let ordem = ORDEM_BOTOES_TOPO_PADRAO;
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('ordem_botoes_topo')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data && Array.isArray(data.ordem_botoes_topo) && data.ordem_botoes_topo.length > 0) {
      ordem = data.ordem_botoes_topo;
    }
  } catch (e) {
    console.error("Erro ao carregar ordem dos botões da barra superior:", e);
  }
  window.ordemBotoesTopo = completarOrdemBotoesTopo(ordem);
  aplicarOrdemBotoesTopo(window.ordemBotoesTopo);
}

/* SALVA A ORDEM DOS BOTÕES DA BARRA SUPERIOR ESCOLHIDA E ATUALIZA A TELA NA HORA */
async function salvarOrdemBotoesTopo(novaOrdem) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert("Sessão não identificada."); return; }

    const { error } = await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, ordem_botoes_topo: novaOrdem }, { onConflict: 'user_id' });

    if (!error) {
      window.ordemBotoesTopo = novaOrdem;
      aplicarOrdemBotoesTopo(novaOrdem);
      if (typeof atualizarTelaConfiguracoes === 'function') atualizarTelaConfiguracoes();
    } else {
      alert("Erro ao salvar ordem dos botões: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão ao salvar ordem dos botões.");
  }
}

/* USADO PELAS SETAS ▲▼ DA TELA DE APARÊNCIA: troca a posição de uma chave
   com a vizinha (direcao: -1 sobe, +1 desce) e salva. */
function moverBotaoTopo(chave, direcao) {
  const ordemAtual = completarOrdemBotoesTopo(window.ordemBotoesTopo);
  const i = ordemAtual.indexOf(chave);
  const j = i + direcao;
  if (i === -1 || j < 0 || j >= ordemAtual.length) return;
  [ordemAtual[i], ordemAtual[j]] = [ordemAtual[j], ordemAtual[i]];
  salvarOrdemBotoesTopo(ordemAtual);
}



/* Ferramentas que ficam "guardadas" ao trocar pra outra (a tela, com tudo o que foi digitado/escolhido/rolado,
   é só tirada do #mandala-container e recolocada na volta, em vez de ser reconstruída do zero). Ficam de fora a
   Mandala/Radix (estado global, redesenhada de qualquer jeito), as Horas (dependem do relógio) e a Agenda
   (dados podem mudar por fora, ex.: novos agendamentos). */
const MODULOS_GUARDAVEIS = ['relatorio', 'tabelaTecnica', 'profeccao', 'decenios', 'isopsefia', 'liberacao', 'direcoes', 'lotes', 'sinastria', 'fasesVida', 'retificacaoSizigia', 'catarche'];
window.modulosGuardados = window.modulosGuardados || {};

/* Esquece as telas guardadas — chamada sempre que o que elas mostram deixa de valer (outro mapa/momento
   calculado em executarCalculo, ou mudança de estilo em reRenderizarModuloAtivo). */
function descartarModulosGuardados() { window.modulosGuardados = {}; }
window.descartarModulosGuardados = descartarModulosGuardados;

/* A Mandala é mesmo o que está (ou vai estar) na tela? Falso quando outra ferramenta está aberta ou esperando o
   mapa chegar (recarregou a página com ela aberta). Quem redesenha a mandala "por baixo dos panos" (carregar o
   tema, voltar do login...) TEM que perguntar isso antes: renderMandala() escreve direto no #mandala-container,
   então chamá-la com outra ferramenta aberta joga a mandala por cima dela — gigante, sem a classe modo-mandala e
   sem os botões da Mandala, até apertar o ícone da Mandala de novo. */
function mandalaEstaNaTela() {
  if (window.moduloPendenteRestaurar) return false;
  const m = window.moduloTecnicoAtivo;
  return !m || m === 'mandala' || m === 'radix';
}
window.mandalaEstaNaTela = mandalaEstaNaTela;

/* Abrir módulo técnicas */
function abrirModuloTecnica(modulo, forcar) {
  // Clicar UMA vez no ícone da ferramenta que JÁ está aberta (e é guardável) não faz nada: antes reconstruía a
  // tela do zero e perdia o que estava ali. DUPLO clique (dois cliques em até 450 ms, com a ferramenta já aberta
  // desde o primeiro) reinicia de propósito. Contado aqui e não no evento "dblclick" pra funcionar também no
  // toque. "forcar" é pra quem quer redesenhar sem perguntar (reRenderizarModuloAtivo).
  if (!forcar) {
    const agora = Date.now();
    const ultimo = window.ultimoCliqueIcone;
    let jaAberta = false;
    if (modulo === window.moduloTecnicoAtivo && MODULOS_GUARDAVEIS.includes(modulo)) {
      const c = document.getElementById('mandala-container');
      if (c && c.childNodes.length && !c.querySelector('[data-spinner-troca]')) {
        jaAberta = true;
        const duplo = ultimo && ultimo.modulo === modulo && ultimo.jaAberta && (agora - ultimo.t) < 450;
        window.ultimoCliqueIcone = duplo ? null : { modulo, t: agora, jaAberta: true };
        if (!duplo) return;
      }
    }
    if (!jaAberta) window.ultimoCliqueIcone = { modulo, t: agora, jaAberta: false };
  }
  window.moduloPendenteRestaurar = null; // qualquer navegação explícita cancela a ferramenta que aguardava o mapa carregar
  const moduloAnterior = window.moduloTecnicoAtivo;
  window.moduloTecnicoAtivo = modulo;
  try { localStorage.setItem('astro_ultimo_modulo', modulo); } catch (e) {}
  const cRadix = document.getElementById('mandala-container');
  const cRev = document.getElementById('revolucao-container');
  const cOverlay = document.getElementById('mandala-controls-overlay');
  const cActionsOverlay = document.getElementById('mandala-actions-overlay');
   
  if (cRadix) cRadix.style.display = 'none';
  if (cRev) cRev.style.display = 'none';
  if (cOverlay) cOverlay.style.display = 'none';
  if (cActionsOverlay) cActionsOverlay.style.display = 'none';
  const cBarraInferior = document.getElementById('barra-inferior-mandala');
  if (cBarraInferior) cBarraInferior.style.display = 'none';

  // #mandala-container está prestes a ser reconstruído do zero pro módulo
  // "modulo" (seja qual for), então a Matriz de Visibilidade nunca
  // continua ali dentro depois disso — zera a aparência "apertada" do
  // botão que a mostra (matrizVisibilidade.js), senão ele ficava marcado
  // como ativo mesmo depois de trocar de ferramenta e voltar pra Mandala.
  const btnMatrizMandala = document.getElementById('btn-matriz-visibilidade-mandala');
  if (btnMatrizMandala) btnMatrizMandala.classList.remove('matriz-visibilidade-ativa');

  // Esvazia #mandala-container ANTES de trocar as classes/CSS do modo —
  // ele é reaproveitado por quase todos os módulos (Mandala, Tabela
  // Técnica, Profecção, Relatório etc.), então sem isso o HTML do módulo
  // ANTERIOR ficava ali dentro por um instante (só escondido via
  // display:none) até o novo módulo terminar de reconstruir o próprio
  // conteúdo. Módulos com uma etapa assíncrona no meio (a mandala, que
  // gera a imagem via SVG->Image->Canvas antes de substituir o innerHTML
  // — ver renderMandala) dão tempo do navegador pintar esse conteúdo
  // antigo já sob as classes/CSS do modo NOVO (ex.: texto de relatório
  // espremido no layout de altura travada do modo-mandala), um flash
  // feio e quebrado entre uma ferramenta e outra. Um spinner neutro aqui
  // garante que, quando o container reaparecer, nunca mostre restos de
  // outro módulo — o próprio init do módulo novo substitui isso em
  // seguida pelo conteúdo de verdade (ou por um loading próprio dele).
  // Guarda a tela da ferramenta que está saindo (só se ela já terminou de montar — se ainda mostra o spinner
  // de carregamento, não há nada de útil pra guardar) e pega a da que está entrando, se houver.
  let telaRestaurada = null;
  if (cRadix) {
    if (moduloAnterior && moduloAnterior !== modulo && MODULOS_GUARDAVEIS.includes(moduloAnterior)
        && cRadix.childNodes.length && !cRadix.querySelector('[data-spinner-troca]')) {
      const frag = document.createDocumentFragment();
      while (cRadix.firstChild) frag.appendChild(cRadix.firstChild);
      window.modulosGuardados[moduloAnterior] = { frag, scrollY: window.scrollY, scrollTop: cRadix.scrollTop };
    }
    if (MODULOS_GUARDAVEIS.includes(modulo) && moduloAnterior !== modulo && window.modulosGuardados[modulo]) {
      telaRestaurada = window.modulosGuardados[modulo];
      delete window.modulosGuardados[modulo];
    }
  }

  if (cRadix && telaRestaurada) {
    cRadix.innerHTML = '';
    cRadix.appendChild(telaRestaurada.frag);
  } else if (cRadix) {
    cRadix.innerHTML = `
      <div data-spinner-troca style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #d4af37;"></i>
      </div>
    `;
  }

  document.body.classList.toggle('modo-mandala', modulo === 'mandala' || modulo === 'radix');
  if (modulo !== 'mandala') document.body.classList.remove('mandala-papiro-tela'); // a folha de papiro é só da tela da Mandala (renderMandala liga de novo ao voltar)

  // #mandala-container tem "overflow-y: scroll" fixo no CSS (precisa disso
  // só no modo Mandala/Radix, pra imagem da mandala ter uma altura de
  // referência pra encolher — ver o comentário de ":not(.modo-mandala)"
  // no index.html). Fora desse modo é a PÁGINA (body/html) que rola de
  // verdade; mas só ter "overflow-y: scroll" já basta pro navegador tratar
  // #mandala-container como o "ancestral com rolagem" de qualquer
  // position:sticky lá dentro (ex.: a barra do editor de Relatório) —
  // mesmo ele nunca rolando de fato nesse modo, o que fazia a barra
  // grudar num lugar que não acompanha a rolagem real da tela. Corrige
  // aqui, no único lugar que troca de módulo, pra nunca vazar de um
  // módulo pro outro (a mandala continua recebendo "scroll" de volta).
  if (cRadix) cRadix.style.overflowY = (modulo === 'mandala' || modulo === 'radix') ? '' : 'visible';

  // Fora do modo Mandala/Radix, o #top-bar (ícones das ferramentas) vira
  // position:fixed (ver body.topbar-fixo no index.html) — assim o
  // astrólogo pode trocar de ferramenta a qualquer momento, mesmo rolado
  // bem fundo numa tela longa (ex.: editando um Relatório), sem precisar
  // sair da tela atual só pra enxergar os ícones. No modo Mandala ele
  // continua no fluxo normal, de propósito (ver o comentário da regra
  // CSS "body.topbar-fixo #top-bar").
  // DECISÃO DO ASTRÓLOGO (11/10/2026): a barra do sistema fica presa no topo da PÁGINA (no fluxo, não acompanha a rolagem —
  // fixa na tela ela ficava na frente ao dar zoom) em TODAS as ferramentas, MENOS no Relatório: lá ela é fixa na tela, em cima
  // da barra do relatório, porque ele sai toda hora pra outra ferramenta capturar imagem e volta.
  document.body.classList.toggle('topbar-fixo', modulo === 'relatorio');
  if (typeof ajustarEspacadorTopBar === 'function') ajustarEspacadorTopBar();

// 1. MANDALA / MAPA NATAL (Globinho)
if (telaRestaurada) {
  if (cRadix) cRadix.style.display = 'block';
  requestAnimationFrame(() => {
    if (cRadix) cRadix.scrollTop = telaRestaurada.scrollTop;
    window.scrollTo(0, telaRestaurada.scrollY);
  });
  } else if (modulo === 'mandala' || modulo === 'radix') {
  if (cRadix) cRadix.style.display = 'block';
  if (cOverlay) cOverlay.style.display = 'flex';
  if (cActionsOverlay) cActionsOverlay.style.display = 'flex';
  if (cBarraInferior) cBarraInferior.style.display = ''; // bloco (o CSS decide); nunca 'flex': a barra tem a camada de rolagem dentro
  if (typeof renderMandala === 'function') renderMandala();
  }
  // 2. TABELA TÉCNICA
    else if (modulo === 'tabelaTecnica') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloTabelaTecnica === 'function') iniciarModuloTabelaTecnica();
  }  
  // 3. REVOLUÇÃO SOLAR (Solzinho)
  else if (modulo === 'revolucao') {
    if (cRev) cRev.style.display = 'block';
      if (typeof iniciarModuloRevolucao === 'function') iniciarModuloRevolucao();
    } 
  // 4. PROFECÇÃO (Setinha)
  else if (modulo === 'profeccao') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloProfeccao === 'function') iniciarModuloProfeccao();
  } 
  // 5. DECÊNIOS (Ampulheta)
  else if (modulo === 'decenios') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloDecenios === 'function') iniciarModuloDecenios();
  } 
  // 6. ISOPSEFIA (Calculadora)
  else if (modulo === 'isopsefia') {
    if (cRadix) cRadix.style.display = 'block';
    if (!ferramentaLiberada(modulo)) { // em teste: só admin (mesma regra da Fases da Vida)
      if (cRadix) cRadix.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;font-weight:600;">Esta ferramenta está disponível só para a conta admin.</div>';
    } else if (typeof iniciarModuloIsopsefia === 'function') iniciarModuloIsopsefia();
  }
  // 7. LIBERAÇÃO ZODIACAL
  else if (modulo === 'liberacao') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloLiberacao === 'function') iniciarModuloLiberacao();
  }
  // 8. DIREÇÕES PRIMÁRIAS
  else if (modulo === 'direcoes') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloDirecoes === 'function') iniciarModuloDirecoes();
  }
  // 8B. CALCULADORA DE LOTES
  else if (modulo === 'lotes') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloLotes === 'function') iniciarModuloLotes();
  }
  // 9. HORAS PLANETÁRIAS
  else if (modulo === 'horas') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloHoras === 'function') iniciarModuloHoras();
  }
  // 9B. FASES DA VIDA (regentes da triplicidade — ferramenta de teste)
  else if (modulo === 'fasesVida') {
    if (cRadix) cRadix.style.display = 'block';
    if (!ferramentaLiberada(modulo)) { // ferramenta de teste: só admin (a leitura do plano pode ainda estar a caminho; aplicarVisibilidadeFerramentasAdmin reabre se for admin)
      if (cRadix) cRadix.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;font-weight:600;">Esta ferramenta está disponível só para a conta admin.</div>';
    } else if (typeof iniciarModuloFasesVida === 'function') iniciarModuloFasesVida();
  }
  // 9C. ACHADOR DE HORÁRIO PELA SIZÍGIA (retificação pelos antigos — ferramenta de teste; não depende do mapa em tela)
  else if (modulo === 'retificacaoSizigia') {
    if (cRadix) cRadix.style.display = 'block';
    if (!ferramentaLiberada(modulo)) {
      if (cRadix) cRadix.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;font-weight:600;">Esta ferramenta está disponível só para a conta admin.</div>';
    } else if (typeof iniciarModuloRetificacaoSizigia === 'function') iniciarModuloRetificacaoSizigia();
  }
  // 9D. CATARCHÉ (astrologia dos começos — ferramenta de teste; usa o mapa salvo em tela)
  else if (modulo === 'catarche') {
    if (cRadix) cRadix.style.display = 'block';
    if (!ferramentaLiberada(modulo)) {
      if (cRadix) cRadix.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;font-weight:600;">Esta ferramenta está disponível só para a conta admin.</div>';
    } else if (typeof iniciarModuloCatarche === 'function') iniciarModuloCatarche();
  }
  // 10. RELATÓRIO (Mapa Natal Clássico em PDF)
  else if (modulo === 'relatorio') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloRelatorio === 'function') iniciarModuloRelatorio();
  }
  // 11. AGENDA (disponibilidade + agendamentos — ainda sem Google Agenda)
  else if (modulo === 'agenda') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloAgenda === 'function') iniciarModuloAgenda();
  }
  // 13. CONFIGURAÇÕES (página inteira, configuracoes.js — não depende de mapa aberto)
  else if (modulo === 'configuracoes') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloConfiguracoes === 'function') iniciarModuloConfiguracoes();
  }
  // 13B. FINANCEIRO (entradas mensais)
  else if (modulo === 'financeiro') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloFinanceiro === 'function') iniciarModuloFinanceiro();
  }
  // 12. SINASTRIA (mandala dupla: mapa em tela + segundo mapa escolhido)
  else if (modulo === 'sinastria') {
    if (cRadix) cRadix.style.display = 'block';
    if (typeof iniciarModuloSinastria === 'function') iniciarModuloSinastria();
  }
}

/* NÍVEL 2C: TELA DE PASTAS COM "IMPORTAR EM MASSA" NO TOPO */
function abrirNavegacaoPastas() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  let html = `
    <div class="sidebar-header">
      <span class="sidebar-nome-pasta">Pastas</span>
      <button type="button" class="add-folder-btn" onclick="criarNovaPasta()">+ Pasta</button>
    </div>
    <div style="flex: 1; overflow-y: auto;">
      <div class="menu-pasta" onclick="abrirModalImportacaoTexto()">
        <div class="nome-pasta">${menuIcone('importar')}<span>Importar Lista em Massa</span></div>
        <span class="botao-icone" style="width:20px">${menuIcone('avancar')}</span>
      </div>
  `;
  pastasOrdenadas.forEach(pasta => { html += menuLinhaPasta(pasta, true); });
  html += `</div>`;
  sidebar.innerHTML = html;
}

/* NÍVEL 3C: TELA DE MAPAS DA PASTA */
async function abrirConteudoPasta(nomePasta) {
  activeFolder = nomePasta;
  selectedMapIds.clear();
  isSelectionMode = false;

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <button type="button" class="botao-icone" onclick="renderMenuPrincipal()" title="Voltar às pastas">${menuIcone('voltar')}</button>
      <span class="sidebar-nome-pasta">${escapeHtml(nomePasta)}</span>
      <button type="button" class="botao-icone botao-apagar" id="trashModeBtn" onclick="alternarModoSelecao()" title="Selecionar para apagar">${menuIcone('lixeira')}</button>
    </div>

    <div class="search-box-container">
      <input type="text" id="filterClientsInput" class="client-search-input" placeholder="Buscar nesta pasta..." oninput="executarBuscaLocal(this.value)">
    </div>
    <div class="search-box-container">
      <select id="sortFieldSelect" class="menu-select" onchange="aplicarOrdenacaoLista(this.value)" title="Ordenar por">
        <option value="codigo" ${currentSortField === 'codigo' ? 'selected' : ''}>Código</option>
        <option value="nome" ${currentSortField === 'nome' ? 'selected' : ''}>Nome</option>
        <option value="cidade" ${currentSortField === 'cidade' ? 'selected' : ''}>Cidade</option>
        <option value="tipo" ${currentSortField === 'tipo' ? 'selected' : ''}>Tipo</option>
      </select>
      <button type="button" id="sortDirectionBtn" class="botao-icone" onclick="alternarDirecaoOrdenacao()" title="${currentSortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}" style="width: 32px; flex: 0 0 auto;">
        ${menuIcone(currentSortDirection === 'asc' ? 'ordemAsc' : 'ordemDesc', 20)}
      </button>
    </div>

    <div id="selectionActionBar" class="barra-selecao">
      <label>
        <input type="checkbox" id="selectAllCheckbox" onchange="marcarTodosMapas(this.checked)" class="map-select-cb" style="margin: 0;"> Selecionar Todos
      </label>
      <button type="button" class="botao-texto" onclick="confirmarExclusaoSelecionados()">
        Apagar (<span id="selectedCount">0</span>)
      </button>
    </div>

    <div id="clientsListContainer" class="client-list-container">
      <div class="menu-vazio"><i class="fa-solid fa-spinner fa-spin"></i> Carregando mapas...</div>
    </div>
  `;

  await carregarMapasDoBanco(nomePasta);
}

/* CARREGA MAPAS E ORDENA PRIORIZANDO O CÓDIGO NUMÉRICO */
async function carregarMapasDoBanco(nomePasta) {
  try {
    const { data, error } = await supabaseClient
      .from('mapas')
      .select('*')
      .eq('pasta', nomePasta);

    if (!error && Array.isArray(data)) {
      cachedFolderData = data.map(item => ({
        id: item.id,
        pasta: item.pasta || activeFolder,
        codigo: (item.codigo && String(item.codigo).trim() !== '') ? item.codigo : null,
        nome: item.nome,
        tipo: item.tipo || 'Natal',
        dataNascimento: item.data_nascimento,
        horaNascimento: item.hora_nascimento,
        cidade: item.cidade,
        latitude: item.latitude,
        longitude: item.longitude,
        whatsapp: item.whatsapp || null,
        email: item.email || null
      }));
      ordenarCachedFolderData();
      await carregarSelosFatosRetificacao();
      renderListaMapas(cachedFolderData);
    }
  } catch (err) {
    console.error("Erro ao carregar mapas:", err);
  }
}

/* SELINHO "fatos enviados" (retificação): aparece na lista, ao lado do nome, quando o cliente enviou os fatos da vida. Só sai quando o astrólogo toca nele
   (não sai ao abrir a ferramenta). Fica no Supabase (retificacoes.fatos_vistos_em), então vale em qualquer aparelho. Sem a coluna ou sem rede: lista normal, sem selinho. */
window.retifFatosNovos = window.retifFatosNovos || new Set();
async function carregarSelosFatosRetificacao() {
  try {
    const { data, error } = await supabaseClient.from('retificacoes').select('mapa_id').not('enviado_em', 'is', null).is('fatos_vistos_em', null);
    window.retifFatosNovos = new Set((!error && Array.isArray(data)) ? data.map(r => String(r.mapa_id)) : []);
  } catch (e) { window.retifFatosNovos = new Set(); }
}
async function tirarSeloFatosRetificacao(id) {
  try {
    const { error } = await supabaseClient.from('retificacoes').update({ fatos_vistos_em: new Date().toISOString() }).eq('mapa_id', String(id));
    if (error) { alert('Não foi possível tirar o selinho: ' + error.message); return; }
    window.retifFatosNovos.delete(String(id));
    renderListaMapas(cachedFolderData);
  } catch (e) { alert('Não foi possível tirar o selinho (sem conexão?).'); }
}
window.tirarSeloFatosRetificacao = tirarSeloFatosRetificacao;

/* ORDENAÇÃO DA LISTA DE CLIENTES (campo + direção escolhidos pelo usuário) */
function compararValoresOrdenacao(a, b, campo) {
  if (campo === 'codigo') {
    const codA = parseInt(a.codigo, 10);
    const codB = parseInt(b.codigo, 10);

    const temCodA = !isNaN(codA);
    const temCodB = !isNaN(codB);

    if (temCodA && temCodB) return codA - codB;
    if (temCodA) return -1;
    if (temCodB) return 1;

    return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
  }

  if (campo === 'cidade') return (a.cidade || '').localeCompare(b.cidade || '', 'pt-BR');
  if (campo === 'tipo') return (a.tipo || '').localeCompare(b.tipo || '', 'pt-BR');

  // 'nome' e qualquer outro caso caem no padrão alfabético por nome
  return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
}

function ordenarCachedFolderData() {
  cachedFolderData.sort((a, b) => {
    const resultado = compararValoresOrdenacao(a, b, currentSortField);
    return currentSortDirection === 'desc' ? -resultado : resultado;
  });
}

function reordenarERenderizar() {
  ordenarCachedFolderData();
  const inputEl = document.getElementById('filterClientsInput');
  executarBuscaLocal(inputEl ? inputEl.value : '');
}

/* CARREGA A ORDENAÇÃO SALVA NA CONTA (chamado logo após o login, igual
   carregarTemaMandala/carregarEstiloPlanetas) */
async function carregarOrdenacaoClientes(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes')
      .select('ordenacao_clientes_campo, ordenacao_clientes_direcao')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data) {
      if (data.ordenacao_clientes_campo) currentSortField = data.ordenacao_clientes_campo;
      if (data.ordenacao_clientes_direcao) currentSortDirection = data.ordenacao_clientes_direcao;
    }
  } catch (e) {
    console.error("Erro ao carregar ordenação de clientes:", e);
  }
}

/* SALVA A ORDENAÇÃO ESCOLHIDA NA CONTA — dispara em segundo plano (sem
   travar a reordenação, que já acontece na hora, localmente) */
async function salvarOrdenacaoClientes() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient
      .from('configuracoes')
      .upsert({ user_id: user.id, ordenacao_clientes_campo: currentSortField, ordenacao_clientes_direcao: currentSortDirection }, { onConflict: 'user_id' });
  } catch (e) {
    console.error("Erro ao salvar ordenação de clientes:", e);
  }
}

function aplicarOrdenacaoLista(campo) {
  currentSortField = campo;
  reordenarERenderizar();
  salvarOrdenacaoClientes();
}

function alternarDirecaoOrdenacao() {
  currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';

  const btn = document.getElementById('sortDirectionBtn');
  if (btn) {
    btn.title = currentSortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente';
    btn.innerHTML = `${menuIcone(currentSortDirection === 'asc' ? 'ordemAsc' : 'ordemDesc', 20)}`;
  }

  reordenarERenderizar();
  salvarOrdenacaoClientes();
}

function renderListaMapas(lista) {
  const container = document.getElementById('clientsListContainer');
  if (!container) return;

  if (!lista || lista.length === 0) {
    container.innerHTML = `<div class="menu-vazio">Nenhum mapa encontrado.</div>`;
    return;
  }

  let html = '';
  lista.forEach((item, indexNaTela) => {
    // posição REAL do mapa na lista da pasta: na busca, a lista da tela é menor (filtrada), então o índice dela não serve pra abrir/editar o mapa certo
    const index = cachedFolderData.indexOf(item);
    const cod = item.codigo ? `${item.codigo} - ` : '';
    const tipoStr = item.tipo ? ` ${item.tipo}` : '';
    const dataStr = item.dataNascimento || "Data n/i";
    const horaStr = item.horaNascimento || "";
    const dataHoraStr = horaStr ? `${dataStr} às ${horaStr}` : dataStr;
    const cidStr = item.cidade || "Local n/i";
    const isChecked = selectedMapIds.has(item.id) ? 'checked' : '';

 // Trata o número do WhatsApp para o link direto
    const numWhats = item.whatsapp ? item.whatsapp.replace(/\D/g, '') : '';
    const linkWhats = numWhats ? (numWhats.length <= 11 ? `55${numWhats}` : numWhats) : '';

    html += `
      <div class="client-card-item" id="card-item-${indexNaTela}">
        ${isSelectionMode ? `<input type="checkbox" class="map-select-cb" value="${item.id}" ${isChecked} onchange="alternarSelecaoMapa(${item.id}, this.checked)">` : ''}
        <div class="client-corpo" onclick="${isSelectionMode ? `alternarSelecaoPorCard(${item.id})` : `selecionarRegistro(${index}); fecharSidebar();`}">
          <div class="client-name">${cod}${escapeHtml(item.nome || 'Sem Nome')}<span class="client-tipo">${escapeHtml(tipoStr)}</span>${(window.retifFatosNovos && window.retifFatosNovos.has(String(item.id))) ? `<button type="button" class="selo-fatos" onclick="event.stopPropagation(); tirarSeloFatosRetificacao(${item.id})" title="O cliente enviou os fatos da vida. Toque para tirar o selinho.">fatos enviados</button>` : ''}</div>
          <div class="client-meta">${escapeHtml(dataHoraStr)} • ${escapeHtml(cidStr)}</div>
        </div>
        ${!isSelectionMode ? `
          <div class="card-actions">
            ${linkWhats ? `
              <button type="button" class="action-record-btn whats-btn" onclick="event.stopPropagation(); window.open('https://wa.me/${linkWhats}', '_blank')" title="Abrir WhatsApp">
                ${menuIcone('whatsapp', 18)}
              </button>
            ` : ''}
            ${item.email ? `
              <button type="button" class="action-record-btn email-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${escapeHtml(item.email)}'); alert('E-mail copiado!');" title="Copiar E-mail">
                ${menuIcone('email', 18)}
              </button>
            ` : ''}
            <button type="button" class="action-record-btn edit-btn" onclick="abrirModalEdicao(event, ${index})" title="Editar">
              ${menuIcone('editar', 18)}
            </button>
            <button type="button" class="action-record-btn delete-btn" onclick="deletarRegistroUnico(event, ${item.id})" title="Apagar">
              ${menuIcone('lixeira', 18)}
            </button>
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

/* MODO DE SELEÇÃO MÚLTIPLA E EXCLUSÃO */
function alternarModoSelecao() {
  isSelectionMode = !isSelectionMode;
  selectedMapIds.clear();
  
  const bar = document.getElementById('selectionActionBar');
  if (bar) bar.style.display = isSelectionMode ? 'flex' : 'none';
  
  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.innerText = '0';

  renderListaMapas(cachedFolderData);
}

function alternarSelecaoMapa(id, isChecked) {
  if (isChecked) selectedMapIds.add(id);
  else selectedMapIds.delete(id);

  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.innerText = selectedMapIds.size;
}

function alternarSelecaoPorCard(id) {
  const isChecked = selectedMapIds.has(id);
  alternarSelecaoMapa(id, !isChecked);
  renderListaMapas(cachedFolderData);
}

function marcarTodosMapas(checked) {
  selectedMapIds.clear();
  if (checked) {
    cachedFolderData.forEach(item => selectedMapIds.add(item.id));
  }
  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.innerText = selectedMapIds.size;

  renderListaMapas(cachedFolderData);
}

async function confirmarExclusaoSelecionados() {
  if (selectedMapIds.size === 0) {
    alert("Nenhum mapa selecionado.");
    return;
  }

  if (await astroConfirm(`Deseja realmente apagar os ${selectedMapIds.size} mapas selecionados?`)) {
    try {
      const idsArray = Array.from(selectedMapIds);
      const { error } = await supabaseClient.from('mapas').delete().in('id', idsArray);

      if (!error) {
        alert("Mapas apagados com sucesso!");
        alternarModoSelecao();
        carregarMapasDoBanco(activeFolder);
      } else {
        alert("Erro ao apagar mapas: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão ao apagar.");
    }
  }
}

function executarBuscaLocal(termo) {
  const q = termo.toLowerCase().trim();
  if (!q) {
    renderListaMapas(cachedFolderData);
    return;
  }
  const filtrados = cachedFolderData.filter(item => 
    (item.nome && item.nome.toLowerCase().includes(q)) || 
    (item.codigo && String(item.codigo).toLowerCase().includes(q)) ||
    (item.cidade && item.cidade.toLowerCase().includes(q))
  );
  renderListaMapas(filtrados);
}

async function criarNovaPasta() {
  const nome = await astroPrompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();

  if (!customFolders.includes(limpo)) {
    try {
      let userId = null;
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;

      const { error } = await supabaseClient.from('pastas').insert([{ nome: limpo, user_id: userId }]);
      if (!error) {
        customFolders.push(limpo);
        abrirNavegacaoPastas();
      } else {
        alert("Erro ao criar pasta: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  }
}

async function editarNomePasta(event, pastaAntiga) {
  event.stopPropagation();
  const novoNome = await astroPrompt(`Novo nome para a pasta "${pastaAntiga}":`, pastaAntiga);
  if (!novoNome || !novoNome.trim() || novoNome.trim() === pastaAntiga) return;
  
  const nomeLimpo = novoNome.trim();

  try {
    await supabaseClient.from('mapas').update({ pasta: nomeLimpo }).eq('pasta', pastaAntiga);
    await supabaseClient.from('pastas').update({ nome: nomeLimpo }).eq('nome', pastaAntiga);
    
    const index = customFolders.indexOf(pastaAntiga);
    if (index !== -1) {
      customFolders[index] = nomeLimpo;
      if (activeFolder === pastaAntiga) activeFolder = nomeLimpo;
      abrirNavegacaoPastas();
    }
  } catch (e) {
    alert("Erro ao renomear pasta.");
  }
}

async function apagarPasta(event, pastaParaDeletar) {
  event.stopPropagation();

  if (customFolders.length <= 1) {
    alert("Você precisa manter pelo menos uma pasta.");
    return;
  }

  if (await astroConfirm(`Deseja remover a pasta "${pastaParaDeletar}" e todos os mapas gravados nela?`)) {
    try {
      await supabaseClient.from('mapas').delete().eq('pasta', pastaParaDeletar);
      await supabaseClient.from('pastas').delete().eq('nome', pastaParaDeletar);
      
      customFolders = customFolders.filter(p => p !== pastaParaDeletar);
      abrirNavegacaoPastas();
    } catch (e) {
      alert("Erro ao apagar pasta.");
    }
  }
}

/* MODAL DE EDIÇÃO E IMPORTAÇÃO DE MAPAS */
function abrirModalEdicao(event, index) {
  event.stopPropagation();
  const item = cachedFolderData[index];
  if (!item) return;

  document.getElementById('editModalId').value = item.id;
  const selectPasta = document.getElementById('editModalPasta');
  if (selectPasta) {
    const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    selectPasta.innerHTML = pastasOrdenadas.map(p => 
      `<option value="${escapeHtml(p)}" ${p === (item.pasta || activeFolder) ? 'selected' : ''}>${escapeHtml(p)}</option>`
    ).join('');
  }

  document.getElementById('editModalTipoMapa').value = item.tipo || 'Natal';
  document.getElementById('editModalCodigo').value = item.codigo || '';
  document.getElementById('editModalNome').value = item.nome || '';
  document.getElementById('editModalData').value = item.dataNascimento || '';
  document.getElementById('editModalHora').value = item.horaNascimento || '';
  document.getElementById('editModalCidadeInput').value = item.cidade || '';
  document.getElementById('editModalWhatsapp').value = item.whatsapp || '';
  document.getElementById('editModalEmail').value = item.email || '';

  editSelectedCityGeo = {
    lat: parseFloat(item.latitude) || -23.5505,
    lon: parseFloat(item.longitude) || -46.6333,
    name: item.cidade || 'São Paulo, SP'
  };

  document.getElementById('editCityResultsList').style.display = 'none';
  document.getElementById('modalEditOverlay').style.display = 'flex';
}

function fecharModalEdicao() {
  document.getElementById('modalEditOverlay').style.display = 'none';
}

async function salvarEdicaoMapaModal() {
  const idMapa = document.getElementById('editModalId').value;
  const pastaVal = document.getElementById('editModalPasta') ? document.getElementById('editModalPasta').value : activeFolder;
  const tipo = document.getElementById('editModalTipoMapa').value;
  const codDigitado = document.getElementById('editModalCodigo').value.trim();
  const nome = document.getElementById('editModalNome').value.trim();
  const dataStr = normalizarDataNascimento(document.getElementById('editModalData').value);
  const horaStr = normalizarHoraNascimento(document.getElementById('editModalHora').value);

  const whatsappVal = document.getElementById('editModalWhatsapp') ? document.getElementById('editModalWhatsapp').value.trim() : null;
  const emailVal = document.getElementById('editModalEmail') ? document.getElementById('editModalEmail').value.trim() : null;

  if (!nome) { alert("Informe o nome."); return; }
  if (!dataStr) { alert("Data inválida. Use o formato DD/MM/AAAA (ex.: 11/06/1999)."); return; }
  if (horaStr === null) { alert("Horário inválido. Use o formato HH:MM (ex.: 18:28), de 00:00 a 23:59."); return; }

  let lat = editSelectedCityGeo ? editSelectedCityGeo.lat : -23.5505;
  let lon = editSelectedCityGeo ? editSelectedCityGeo.lon : -46.6333;

  try {
    const { error } = await supabaseClient
      .from('mapas')
      .update({
        pasta: pastaVal,
        tipo: tipo,
        codigo: codDigitado !== "" ? codDigitado : null,
        nome: nome,
        data_nascimento: dataStr,
        hora_nascimento: horaStr,
        cidade: editSelectedCityGeo ? editSelectedCityGeo.name : document.getElementById('editModalCidadeInput').value,
        latitude: lat,
        longitude: lon,
        whatsapp: whatsappVal || null,
        email: emailVal || null
      })
      .eq('id', idMapa);

    if (!error) {
      fecharModalEdicao();
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao atualizar: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão.");
  }
}

function abrirModalImportacaoTexto() {
  document.getElementById('importTextArea').value = "";
  document.getElementById('modalImportOverlay').style.display = "flex";
}

function fecharModalImportacaoTexto() {
  document.getElementById('modalImportOverlay').style.display = "none";
}

/* Coordenada da cidade escrita na lista (mesma busca do cadastro de mapa). Guarda o que já achou: cidade repetida não busca de novo. */
async function buscarCoordenadaDaCidade(texto, cache) {
  const chave = texto.trim().toLowerCase();
  if (!chave) return null;
  if (chave in cache) return cache[chave];
  let achou = null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&limit=1`);
    const dados = await res.json();
    if (dados && dados.length > 0) achou = { latitude: parseFloat(dados[0].lat), longitude: parseFloat(dados[0].lon) };
  } catch (e) { achou = null; }
  cache[chave] = achou;
  await new Promise(r => setTimeout(r, 1100)); // o serviço de mapas pede no máximo 1 busca por segundo
  return achou;
}

async function processarImportacaoTextoEmMassa() {
  const rawText = document.getElementById('importTextArea').value.trim();
  if (!rawText) { alert("Cole o texto com a lista de clientes."); return; }

  const linhas = rawText.split('\n');
  const registros = [];
  const semCidade = [];
  const cache = {};

  for (const linha of linhas) {
    let l = linha.trim();
    if (!l) continue;

    let partes = l.split(/[,;\t]/);
    let nomeBruto = partes[0] ? partes[0].trim() : "Sem Nome";
    let codigo = null;
    let nome = nomeBruto;

    let matchCod = nomeBruto.match(/^(\d+)\s*[-_]?\s*(.+)$/);
    if (matchCod) {
      codigo = matchCod[1];
      nome = matchCod[2].trim();
    }

    let dataStr = partes[1] ? partes[1].trim() : "01/01/2000";
    let horaStr = partes[2] ? partes[2].trim() : "";
    let cidadeStr = partes[3] ? partes[3].trim() : "";

    const coord = await buscarCoordenadaDaCidade(cidadeStr, cache);
    if (!coord) { semCidade.push(nome); continue; }

    registros.push({
      pasta: activeFolder,
      tipo: 'Natal',
      codigo: codigo,
      nome: nome,
      data_nascimento: dataStr,
      hora_nascimento: horaStr,
      cidade: cidadeStr,
      latitude: coord.latitude,
      longitude: coord.longitude
    });
  }

  const aviso = semCidade.length ? `\n\nNão achei a cidade de ${semCidade.length} e não importei: ${semCidade.join(', ')}.` : "";
  if (registros.length === 0) { alert("Nenhum registro importado." + aviso); return; }

  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const registrosComUser = registros.map(r => ({ ...r, user_id: userId }));

    const { error } = await supabaseClient.from('mapas').insert(registrosComUser);
    if (!error) {
      alert(`Sucesso! ${registros.length} clientes importados para a pasta "${activeFolder}".` + aviso);
      fecharModalImportacaoTexto();
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao salvar importação: " + error.message);
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

async function deletarRegistroUnico(event, idMapa) {
  event.stopPropagation();
  if (!await astroConfirm("Deseja realmente apagar este mapa?")) return;

  try {
    const { error } = await supabaseClient.from('mapas').delete().eq('id', idMapa);
    if (!error) {
      carregarMapasDoBanco(activeFolder);
    } else {
      alert("Erro ao deletar registro.");
    }
  } catch (e) {
    alert("Erro de conexão.");
  }
}

/* SALVAR MAPA DA BARRA SUPERIOR (COM OPÇÃO DE CRIAR PASTA DIRETAMENTE) */
function salvarMapaNaPlanilha() {
  if (!customFolders || customFolders.length === 0) {
    customFolders = ["Clientes"];
  }

  const ano = currentMoment.getFullYear();
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const nomePadrao = (currentSubjectName && currentSubjectName !== "") ? currentSubjectName : "Céu do Momento";

  renderizarModalSalvamentoComOpcaoPasta(nomePadrao, dia, mes, ano, hora, min);
}

function renderizarModalSalvamentoComOpcaoPasta(nomePadrao, dia, mes, ano, hora, min) {
  const pastasOrdenadas = [...customFolders].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  let optionsPastas = '';
  pastasOrdenadas.forEach(p => {
    optionsPastas += `<option value="${escapeHtml(p)}" ${p === activeFolder ? 'selected' : ''}>${escapeHtml(p)}</option>`;
  });

  // Revolução Solar/Lunar só se salvam como o que são (tipo fixo); os demais mapas nunca viram revolução.
  const tipoMapaAtual = window.currentMapType;
  const tipoFixo = (tipoMapaAtual === 'Revolução Solar' || tipoMapaAtual === 'Revolução Lunar') ? tipoMapaAtual : null;
  const opcoesTipo = tipoFixo
    ? `<option value="${tipoFixo}" selected>${tipoFixo}</option>`
    : ['Trânsito', 'Pergunta', 'Evento', 'Início', 'Natal']
        .map(t => `<option value="${t}" ${t === 'Trânsito' ? 'selected' : ''}>${t}</option>`).join('');

  let modal = document.getElementById('modalSaveCurrentMap');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalSaveCurrentMap';
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 16px; box-sizing: border-box;";
    document.body.appendChild(modal);
  }

    modal.innerHTML = `
    <div class="janela" style="width: 420px;" role="dialog" aria-modal="true"><div class="janela-corpo">
      <div class="janela-topo">
        <div class="titulo-secao" style="margin: 0;">Salvar Mapa Atual</div>
        <button type="button" class="botao-icone" onclick="document.getElementById('modalSaveCurrentMap').style.display='none'" title="Fechar">${menuIcone('fechar', 18)}</button>
      </div>

      <div>
        <div class="janela-rotulo-linha">
          <label>Salvar na Pasta</label>
          <button type="button" class="botao-texto" onclick="criarPastaDiretoNoModalSalvamento()">+ Criar Nova Pasta</button>
        </div>
        <select id="saveMapFolderSelect" class="modal-select">${optionsPastas}</select>
      </div>

      <div>
        <label>Tipo de Mapa</label>
        <select id="saveMapTipoSelect" class="modal-select" ${tipoFixo ? 'disabled' : ''}>
          ${opcoesTipo}
        </select>
      </div>

      <div>
        <label>Código (Opcional)</label>
        <input type="text" id="saveMapCodigoInput" class="modal-input" value="${escapeHtml(currentCustomCode || '')}">
      </div>

      <div>
        <label>Nome Completo / Título da Pergunta</label>
        <input type="text" id="saveMapNameInput" class="modal-input" value="${escapeHtml(nomePadrao)}">
      </div>

      <div style="display: flex; gap: 16px;">
        <div style="flex: 1;">
          <label>Data</label>
          <input type="text" id="saveMapDataInput" class="modal-input" value="${dia}/${mes}/${ano}">
        </div>
        <div style="flex: 1;">
          <label>Horário</label>
          <input type="text" id="saveMapHoraInput" class="modal-input" value="${hora}:${min}">
        </div>
      </div>

      <div>
        <label>Local</label>
        <input type="text" id="saveMapCidadeInput" class="modal-input" value="${escapeHtml(currentGeo.city)}">
      </div>

      <div class="janela-acoes">
        <button type="button" class="botao-texto janela-sec" onclick="document.getElementById('modalSaveCurrentMap').style.display='none'">Cancelar</button>
        <button type="button" class="botao-texto" onclick="executarSalvarMapaAtual()">Salvar Registro</button>
      </div>
    </div></div>
  `;

  modal.style.display = 'flex';
}

async function criarPastaDiretoNoModalSalvamento() {
  const nome = await astroPrompt("Nome da nova pasta:");
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();

  if (!customFolders.includes(limpo)) {
    try {
      let userId = null;
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;

      const { error } = await supabaseClient.from('pastas').insert([{ nome: limpo, user_id: userId }]);
      if (!error) {
        customFolders.push(limpo);
        activeFolder = limpo;
        
        const ano = currentMoment.getFullYear();
        const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
        const dia = String(currentMoment.getDate()).padStart(2, '0');
        const hora = String(currentMoment.getHours()).padStart(2, '0');
        const min = String(currentMoment.getMinutes()).padStart(2, '0');
        const nomeAtual = document.getElementById('saveMapNameInput')?.value || "Céu do Momento";
        const codigoAtual = document.getElementById('saveMapCodigoInput')?.value;
        
        renderizarModalSalvamentoComOpcaoPasta(nomeAtual, dia, mes, ano, hora, min);
        const campoCodigo = document.getElementById('saveMapCodigoInput');
        if (campoCodigo && codigoAtual !== undefined) campoCodigo.value = codigoAtual;
      } else {
        alert("Erro ao criar pasta: " + error.message);
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  } else {
    alert("Essa pasta já existe.");
  }
}

async function executarSalvarMapaAtual() {
  const pastaAlvo = document.getElementById('saveMapFolderSelect').value;
  const tipo = document.getElementById('saveMapTipoSelect').value;
  const codigoDigitado = document.getElementById('saveMapCodigoInput').value.trim();
  const nome = document.getElementById('saveMapNameInput').value.trim();
  const dataStr = document.getElementById('saveMapDataInput').value.trim();
  const horaStr = document.getElementById('saveMapHoraInput').value.trim();
  const cidStr = document.getElementById('saveMapCidadeInput').value.trim();

  if (!nome) { alert("Informe o nome do mapa."); return; }

  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const { error } = await supabaseClient
      .from('mapas')
      .insert([{
        pasta: pastaAlvo,
        tipo: tipo,
        codigo: codigoDigitado || null,
        nome: nome,
        data_nascimento: dataStr,
        hora_nascimento: horaStr,
        cidade: cidStr,
        latitude: currentGeo.lat,
        longitude: currentGeo.lon,
        user_id: userId
      }]);

    if (!error) {
      alert(`Mapa "${nome}" salvo como [${tipo}] com sucesso na pasta "${pastaAlvo}"!`);
      document.getElementById('modalSaveCurrentMap').style.display = 'none';
    } else {
      alert("Erro ao salvar no banco: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar o mapa.");
  }
}

/* FUNÇÃO EXCLUSIVA PARA SALVAR MAPA GERADO PELA REVOLUÇÃO SOLAR */
async function salvarRevolucaoSolarNoBanco(pastaAlvo, dadosRS) {
  try {
    let userId = null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) userId = user.id;

    const { error } = await supabaseClient
      .from('mapas')
      .insert([{
        pasta: pastaAlvo || activeFolder,
        tipo: 'Revolução Solar',
        codigo: dadosRS.codigo || null,
        nome: `${dadosRS.nome} - RS ${dadosRS.anoRS}`,
        data_nascimento: dadosRS.dataRS,
        hora_nascimento: dadosRS.horaRS,
        cidade: dadosRS.cidade,
        latitude: dadosRS.lat,
        longitude: dadosRS.lon,
        user_id: userId
      }]);

    if (!error) {
      alert(`Revolução Solar de ${dadosRS.anoRS} salva com sucesso na pasta "${pastaAlvo || activeFolder}"!`);
    } else {
      alert("Erro ao salvar Revolução Solar: " + error.message);
    }
  } catch (err) {
    alert("Erro de conexão ao salvar Revolução Solar.");
  }
}
