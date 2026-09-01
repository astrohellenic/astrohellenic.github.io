/* ==========================================
   ENGINE DE CÁLCULO DE PROFECÇÕES (VALENS)
   Módulo matemático para Profecção Anual, Mensal e Diária
   ========================================== */

const PROFECCAO_ENGINE = (function() {

  const SIGNS = [
    { name: "Áries", ruler: "Marte" },
    { name: "Touro", ruler: "Vênus" },
    { name: "Gêmeos", ruler: "Mercúrio" },
    { name: "Câncer", ruler: "Lua" },
    { name: "Leão", ruler: "Sol" },
    { name: "Virgem", ruler: "Mercúrio" },
    { name: "Libra", ruler: "Vênus" },
    { name: "Escorpião", ruler: "Marte" },
    { name: "Sagitário", ruler: "Júpiter" },
    { name: "Capricórnio", ruler: "Saturno" },
    { name: "Aquário", ruler: "Saturno" },
    { name: "Peixes", ruler: "Júpiter" }
  ];

  /* CONSTANTES TEMPORAIS HELENÍSTICAS */
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MONTH_MS = (30 + (10.5 / 24)) * MS_PER_DAY; // 30d 10h 30m (30,4375 dias)
  const DAILY_STEP_MS = 2.5 * MS_PER_DAY;            // 60 horas (2,5 dias)
  const YEAR_MS = 12 * MONTH_MS;

  /* CÁLCULO DA PROFECÇÃO ANUAL & GRANDE CICLO DE 12 ANOS */
  function calcularProfeccaoAnual(ascSignIndex, idadeAnos) {
    if (ascSignIndex === undefined || ascSignIndex === null || idadeAnos < 0) return null;

    const grandCycleHouse = Math.floor(idadeAnos / 12) + 1;
    const grandCycleSignIdx = (ascSignIndex + (grandCycleHouse - 1)) % 12;

    const houseNumber = (idadeAnos % 12) + 1;
    const profectedSignIdx = (ascSignIndex + (idadeAnos % 12)) % 12;

    return {
      idade: idadeAnos,
      grandeCiclo: {
        casa: grandCycleHouse,
        signoIndex: grandCycleSignIdx,
        signoNome: SIGNS[grandCycleSignIdx].name,
        regente: SIGNS[grandCycleSignIdx].ruler
      },
      anoProfectado: {
        casa: houseNumber,
        signoIndex: profectedSignIdx,
        signoNome: SIGNS[profectedSignIdx].name,
        regente: SIGNS[profectedSignIdx].ruler
      }
    };
  }

  /* CÁLCULO DOS 12 MESES PROFECTADOS (PASSOS DE 30,43 DIAS) */
  function calcularProfeccaoMensal(startDateObj, annualSignIndex) {
    if (!startDateObj || isNaN(startDateObj.getTime()) || annualSignIndex === undefined) return [];

    const meses = [];
    let currentMonthStart = startDateObj.getTime();

    for (let m = 0; m < 12; m++) {
      const monthEnd = currentMonthStart + MONTH_MS;
      const monthSignIdx = (annualSignIndex + m) % 12;

      meses.push({
        mesNumero: m + 1,
        signoIndex: monthSignIdx,
        signoNome: SIGNS[monthSignIdx].name,
        regente: SIGNS[monthSignIdx].ruler,
        startTime: new Date(currentMonthStart),
        endTime: new Date(monthEnd)
      });

      currentMonthStart = monthEnd;
    }

    return meses;
  }

  /* CÁLCULO DOS PASSOS DIÁRIOS (12 PASSOS DE 60 HORAS POR MÊS) */
  function calcularProfeccaoDiaria(monthStartObj, monthSignIndex) {
    if (!monthStartObj || isNaN(monthStartObj.getTime()) || monthSignIndex === undefined) return [];

    const passos = [];
    let currentDailyStart = monthStartObj.getTime();

    for (let d = 0; d < 12; d++) {
      const dailyEnd = currentDailyStart + DAILY_STEP_MS;
      const dailySignIdx = (monthSignIndex + d) % 12;

      passos.push({
        passoNumero: d + 1,
        signoIndex: dailySignIdx,
        signoNome: SIGNS[dailySignIdx].name,
        regente: SIGNS[dailySignIdx].ruler,
        startTime: new Date(currentDailyStart),
        endTime: new Date(dailyEnd)
      });

      currentDailyStart = dailyEnd;
    }

    return passos;
  }

  /* FORMATAÇÃO DE DATA EM PORTUGUÊS */
  function formatarDataExtenso(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${weekDays[d.getDay()]}, ${day}/${month}/${year} às ${hours}:${minutes}`;
  }

  return {
    SIGNS,
    MONTH_MS,
    DAILY_STEP_MS,
    YEAR_MS,
    calcularProfeccaoAnual,
    calcularProfeccaoMensal,
    calcularProfeccaoDiaria,
    formatarDataExtenso
  };

})();

/* ==========================================
   INTEGRAÇÃO REATIVA COM A MANDALARS.JS
   ========================================== */

if (typeof window !== 'undefined') {
  window.PROFECCAO_ENGINE = PROFECCAO_ENGINE;

  /* PONTO DE ENTRADA DISPARADO DIRETO PELA MANDALARS.JS */
  window.atualizarProfeccaoComDadosRS = function(dadosNatal, dadosSolar, anoRevolucao, anoNascimento) {
    if (!dadosNatal || !dadosNatal.Ascendente) return;

    // 1. Extrai o índice do signo do Ascendente Natal (0 = Áries, 1 = Touro...)
    const ascSignoNome = dadosNatal.Ascendente.signo;
    const SIGNOS_INDEX = {
      "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
      "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
      "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
    };
    const ascSignIdx = SIGNOS_INDEX[ascSignoNome] !== undefined ? SIGNOS_INDEX[ascSignoNome] : Math.floor(dadosNatal.Ascendente.grau_absoluto / 30);

    // 2. Calcula a idade na Revolução Solar e executa a matemática helenística
    const idade = parseInt(anoRevolucao) - parseInt(anoNascimento);
    const resultadoAnual = PROFECCAO_ENGINE.calcularProfeccaoAnual(ascSignIdx, idade);

    // 3. Notifica o sistema ou renderiza as tabelas de profecção na interface
    if (typeof window.renderizarTabelaProfeccao === 'function') {
      window.renderizarTabelaProfeccao(resultadoAnual, dadosSolar);
    }
  };
}
