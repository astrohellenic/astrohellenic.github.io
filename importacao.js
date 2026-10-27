/* IMPORTAÇÃO DE MAPAS DE OUTROS SOFTWARES (arquivo)
   Lê o arquivo, tira os mapas e coloca na pasta "Importação" — o astrólogo arruma (WhatsApp, e-mail...) e só depois leva pros clientes.
   Mapa que já existe (mesmo código em qualquer pasta; sem código, mesmo nome + data + hora) é pulado, nunca duplica.
   Formato novo = uma função que devolve a lista de mapas + uma linha em IMPORTACAO_FORMATOS. */

const PASTA_IMPORTACAO = 'Importação';

/* Astro Gold (.SFcht): cabeçalho de 86 bytes ("Created ...") e depois registros fixos de 300 bytes, cada um com
   duas fichas de 160 bytes (a segunda é o mapa do par). Tudo em little-endian; longitude e fuso guardados com o oeste positivo. */
function importacaoLerAstroGold(buffer) {
  const bytes = new Uint8Array(buffer);
  const dv = new DataView(buffer);
  const utf8 = new TextDecoder('utf-8', { fatal: true });
  const cp1252 = new TextDecoder('windows-1252');
  const texto = (ini, fim) => {
    let f = bytes.subarray(ini, fim);
    let n = f.length;
    while (n > 0 && (f[n - 1] === 0x20 || f[n - 1] === 0)) n--;
    f = f.subarray(0, n);
    let s;
    try { s = utf8.decode(f); } catch (e) { s = cp1252.decode(f); }
    return s.replace(/[\x00-\x1f]/g, '').trim();
  };
  const dois = (n) => String(n).padStart(2, '0');

  const mapas = [];
  const total = Math.floor((bytes.length - 86) / 300);
  for (let i = 0; i < total; i++) {
    for (const desloc of [0, 160]) {
      const o = 86 + i * 300 + desloc;
      const nomeBruto = texto(o + 2, o + 52);
      if (!nomeBruto) continue;
      const lonOeste = dv.getFloat32(o + 92, true);
      const lat = dv.getFloat32(o + 96, true);
      const ano = dv.getUint16(o + 100, true);
      const mes = bytes[o + 102], dia = bytes[o + 103], hora = bytes[o + 104], min = bytes[o + 105];
      if (!(lat >= -90 && lat <= 90 && lonOeste >= -180 && lonOeste <= 180 && ano > 1800 && ano < 2100 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 && hora < 24 && min < 60)) continue;
      const m = nomeBruto.match(/^(\d{4}|-{4})\s*-\s*(.*)$/);
      mapas.push({
        codigo: m && /^\d+$/.test(m[1]) ? m[1] : null,
        nome: (m ? m[2] : nomeBruto).trim(),
        cidade: texto(o + 52, o + 72),
        latitude: Math.round(lat * 10000) / 10000,
        longitude: Math.round(-lonOeste * 10000) / 10000,
        data_nascimento: dois(dia) + '/' + dois(mes) + '/' + ano,
        hora_nascimento: dois(hora) + ':' + dois(min)
      });
    }
  }
  return mapas;
}

const IMPORTACAO_FORMATOS = [
  { nome: 'Astro Gold', reconhece: (b) => new TextDecoder('latin1').decode(new Uint8Array(b, 2, 7)) === 'Created', ler: importacaoLerAstroGold }
];

const importacaoSemZeros = (c) => String(c).replace(/^0+/, '') || '0';
const importacaoChaveSemCodigo = (m) => [m.nome, m.data_nascimento, m.hora_nascimento].join('|').toLowerCase();

async function importarArquivoDeMapas(input) {
  const arquivo = input.files && input.files[0];
  input.value = '';
  if (!arquivo) return;

  try {
    const buffer = await arquivo.arrayBuffer();
    const formato = IMPORTACAO_FORMATOS.find((f) => buffer.byteLength > 100 && f.reconhece(buffer));
    if (!formato) { alert('Não reconheci esse arquivo. Hoje só leio arquivos do Astro Gold.'); return; }
    const lidos = formato.ler(buffer);
    if (lidos.length === 0) { alert('Não encontrei mapas nesse arquivo.'); return; }

    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user ? user.id : null;

    // o que já existe, em qualquer pasta
    const existentes = [];
    for (let de = 0; ; de += 1000) {
      const { data, error } = await supabaseClient.from('mapas').select('codigo,nome,data_nascimento,hora_nascimento').range(de, de + 999);
      if (error) { alert('Erro ao conferir o que já existe: ' + error.message); return; }
      existentes.push(...data);
      if (data.length < 1000) break;
    }
    const codigosJa = new Set(existentes.filter((m) => m.codigo && String(m.codigo).trim() !== '').map((m) => importacaoSemZeros(String(m.codigo).trim())));
    const semCodigoJa = new Set(existentes.filter((m) => !m.codigo || String(m.codigo).trim() === '').map(importacaoChaveSemCodigo));

    const novos = [];
    let jaExistiam = 0;
    for (const m of lidos) {
      const ja = m.codigo ? codigosJa.has(importacaoSemZeros(m.codigo)) : semCodigoJa.has(importacaoChaveSemCodigo(m));
      if (ja) { jaExistiam++; continue; }
      if (!m.codigo) semCodigoJa.add(importacaoChaveSemCodigo(m));
      novos.push(m);
    }

    if (novos.length === 0) { alert('Nenhum mapa novo: todos os ' + lidos.length + ' já existem.'); return; }

    // a pasta Importação nasce na primeira vez
    if (!customFolders.includes(PASTA_IMPORTACAO)) {
      const { error } = await supabaseClient.from('pastas').insert([{ nome: PASTA_IMPORTACAO, user_id: userId }]);
      if (error) { alert('Erro ao criar a pasta Importação: ' + error.message); return; }
      customFolders.push(PASTA_IMPORTACAO);
    }

    const linhas = novos.map((m) => ({ ...m, pasta: PASTA_IMPORTACAO, tipo: 'Natal', user_id: userId }));
    for (let de = 0; de < linhas.length; de += 100) {
      const { error } = await supabaseClient.from('mapas').insert(linhas.slice(de, de + 100));
      if (error) { alert('Erro ao salvar (' + de + ' de ' + linhas.length + ' foram salvos): ' + error.message); return; }
    }

    alert(novos.length + ' mapas importados para a pasta "' + PASTA_IMPORTACAO + '". ' + jaExistiam + ' já existiam e foram pulados.');
    fecharModalImportacaoTexto();
    if (typeof abrirNavegacaoPastas === 'function') abrirNavegacaoPastas();
  } catch (e) {
    alert('Erro ao importar: ' + e.message);
  }
}
