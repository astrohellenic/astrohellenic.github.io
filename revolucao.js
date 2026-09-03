/* ==========================================
   MÓDULO DE REVOLUÇÃO SOLAR (RETORNO SOLAR EXATO)
   ========================================== */

let clienteAtivoRS = null;
let anoAlvoRS = new Date().getFullYear();

/* BUSCA O RETORNO SOLAR EXATO E ATUALIZA A MANDALA PRINCIPAL */
window.executarCalculoRS = async function(perfilCliente, anoAlvo) {
  // 1. Pega o perfil ativo do cliente ou os dados do mapa aberto
  const cliente = perfilCliente || (typeof currentPerfilSelecionado !== 'undefined' ? currentPerfilSelecionado : null);
  
  if (!cliente && (typeof currentSubjectName === 'undefined' || currentSubjectName === "Agora")) {
    console.warn("Nenhum cliente selecionado para calcular a RS.");
    return;
  }

  try {
    // Extrai dados do nascimento
    const dataStr = cliente ? cliente.dataNascimento : "";
    let dia = '01', mes = '01', anoNasc = 1990;

    if (dataStr.includes('-')) {
      const p = dataStr.split('-');
      if (p[0].length === 4) { anoNasc = p[0]; mes = p[1]; dia = p[2]; }
      else { dia = p[0]; mes = p[1]; anoNasc = p[2]; }
    } else if (dataStr.includes('/')) {
      const p = dataStr.split('/');
      dia = p[0]; mes = p[1]; anoNasc = p[2];
    }

    let hora = (cliente && cliente.horaNascimento) ? cliente.horaNascimento : "12:00";
    let lat = (cliente && cliente.latitude) ? cliente.latitude : -23.5505;
    let lon = (cliente && cliente.longitude) ? cliente.longitude : -46.6333;
    let fuso = (cliente && cliente.fuso !== undefined) ? cliente.fuso : -3;

    // 2. Busca o Mapa Natal para obter a posição EXATA (grau e minuto) do Sol Radix
    const urlNatal = `https://motor-astrologia.vercel.app/api/index?data=${anoNasc}-${mes}-${dia}&hora=${hora}&lat=${lat}&lon=${lon}&fuso=${fuso}`;
    const resNatal = await fetch(urlNatal);
    if (!resNatal.ok) throw new Error("Erro na API Natal");
    const dadosNatal = await resNatal.json();

    const solNatalGrau = dadosNatal?.planetas?.Sol?.grau_absoluto || dadosNatal?.Sol?.grau_absoluto;

    // 3. Busca a Revolução Solar aproximada no ano alvo
    const anoCalculo = anoAlvo || anoAlvoRS;
    const urlSolar = `https://motor-astrologia.vercel.app/api/index?data=${anoCalculo}-${mes}-${dia}&hora=${hora}&lat=${lat}&lon=${lon}&fuso=${fuso}`;
    const resSolar = await fetch(urlSolar);
    if (!resSolar.ok) throw new Error("Erro na API Solar");
    const dadosSolar = await resSolar.json();

    // 4. Injeta os dados da Revolução Solar direto na mandala principal da tela
    if (typeof window.desenharMapaPrincipal === 'function') {
      window.desenharMapaPrincipal(dadosSolar);
    } else if (typeof window.renderizarMapa === 'function') {
      window.renderizarMapa(dadosSolar);
    } else if (typeof window.desenharMandala === 'function') {
      window.desenharMandala(dadosSolar);
    }

    // 5. Envia para a profecção caso a função exista
    if (typeof window.atualizarProfeccaoComDadosRS === 'function') {
      window.atualizarProfeccaoComDadosRS(dadosNatal, dadosSolar, anoCalculo, anoNasc);
    }

  } catch (err) {
    console.error("Erro ao calcular e aplicar Revolução Solar na mandala:", err);
  }
};

/* RECEPTOR GLOBAL: DISPARADO AO SELECIONAR CLIENTE NO MENU */
window.carregarClienteNaRS = function(perfilCliente, ano) {
  clienteAtivoRS = perfilCliente;
  if (ano) anoAlvoRS = ano;
  window.executarCalculoRS(perfilCliente, anoAlvoRS);
};
