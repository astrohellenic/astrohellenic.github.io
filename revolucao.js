/* ==========================================
   MÓDULO DE REVOLUÇÃO SOLAR & PROFECÇÕES (VALENS)
   ========================================== */

function iniciarModuloRevolucao() {
  const container = document.getElementById('mandala-container');
  if (!container) return;

  if (!currentCalculatedData || currentSubjectName === "Agora") {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: #475569;">
        <i class="fa-solid fa-circle-info" style="font-size: 24px; color: #103b70; margin-bottom: 12px;"></i>
        <h3 style="margin: 0 0 8px 0; font-family: 'Cinzel', serif; color: #103b70;">Selecione um Cliente</h3>
        <p style="margin: 0; font-size: 13px;">Abra uma pasta no menu lateral e selecione o mapa natal do cliente.</p>
      </div>
    `;
    return;
  }

  const anoAtual = new Date().getFullYear();
  renderInterfaceRevolucao(container, anoAtual);
}

function renderInterfaceRevolucao(container, anoAlvo) {
  const natalData = currentCalculatedData;
  const natalAscAbs = natalData.Ascendente.grau_absoluto;
  const natalAscSignIdx = Math.floor(natalAscAbs / 30);

  const dataNascPartes = currentMoment; 
  const anoNasc = dataNascPartes.getFullYear();
  const idadeNaRS = anoAlvo - anoNasc;

  const profAnual = PROFECCAO_ENGINE.calcularProfeccaoAnual(natalAscSignIdx, idadeNaRS);
  const dataRS = new Date(anoAlvo, dataNascPartes.getMonth(), dataNascPartes.getDate(), dataNascPartes.getHours(), dataNascPartes.getMinutes());
  const profMensalList = PROFECCAO_ENGINE.calcularProfeccaoMensal(dataRS, profAnual.anoProfectado.signoIndex);

  let html = `
    <div id="rs-module-root" style="padding: 20px; max-width: 1200px; margin: 0 auto; font-family: 'Montserrat', sans-serif;">
      
      <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 10px; margin-bottom: 20px;">
        <div>
          <span style="font-family: 'Cinzel', serif; font-weight: 800; color: #103b70; font-size: 16px;">REVOLUÇÃO SOLAR ${anoAlvo}</span>
          <span style="font-size: 12px; color: #64748b; margin-left: 10px;">(Idade: ${idadeNaRS} anos)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button onclick="mudarAnoRS(${anoAlvo - 1})" class="icon-btn" style="padding: 6px 12px; font-weight: bold; cursor: pointer;">&laquo; Ano Anterior</button>
          <button onclick="mudarAnoRS(${anoAlvo + 1})" class="icon-btn" style="padding: 6px 12px; font-weight: bold; cursor: pointer;">Próximo Ano &raquo;</button>
        </div>
      </div>

      <div style="background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%); border: 2px solid #c59b27; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 12px; text-align: center; font-size: 13px; color: #78350f;">
          <div>Grande Ciclo (12a): <strong>Casa ${profAnual.grandeCiclo.casa} em ${profAnual.grandeCiclo.signoNome} (${profAnual.grandeCiclo.regente})</strong></div>
          <div>Ano (${idadeNaRS}a): <strong>Casa ${profAnual.anoProfectado.casa} em ${profAnual.anoProfectado.signoNome} — Senhor do Ano: ${profAnual.anoProfectado.regente}</strong></div>
        </div>
      </div>

      <div style="margin-bottom: 30px; text-align: center;">
        <div id="rs-mandala-container" style="display: flex; justify-content: center; min-height: 400px; align-items: center;">
          <p style="font-size: 12px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando mandalas...</p>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
          <thead>
            <tr style="background: #103b70; color: #ffffff; font-family: 'Cinzel', serif; text-align: left;">
              <th style="padding: 8px 12px;">Mês</th>
              <th style="padding: 8px 12px;">Signo Profectado</th>
              <th style="padding: 8px 12px;">Regente do Mês</th>
              <th style="padding: 8px 12px;">Início do Mês</th>
            </tr>
          </thead>
          <tbody>
  `;

  profMensalList.forEach(m => {
    html += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-weight: bold;">Mês ${m.mesNumero}</td>
        <td style="padding: 8px 12px; color: #103b70; font-weight: 700;">${m.signoNome}</td>
        <td style="padding: 8px 12px;">${m.regente}</td>
        <td style="padding: 8px 12px;">${PROFECCAO_ENGINE.formatarDataExtenso(m.startTime)}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>

      <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px;">
        <div id="daily-steps-accordion-container">
  `;

  profMensalList.forEach(m => {
    const passosDiarios = PROFECCAO_ENGINE.calcularProfeccaoDiaria(m.startTime, m.signoIndex);
    html += `
      <details style="margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
        <summary style="font-weight: 700; color: #103b70; cursor: pointer;">
          Mês ${m.mesNumero}: ${m.signoNome} (${PROFECCAO_ENGINE.formatarDataExtenso(m.startTime)})
        </summary>
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 8px;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155; text-align: left;">
              <th style="padding: 6px;">Passo</th>
              <th style="padding: 6px;">Signo Diário</th>
              <th style="padding: 6px;">Regente</th>
              <th style="padding: 6px;">Início do Passo (60h)</th>
            </tr>
          </thead>
          <tbody>
    `;

    passosDiarios.forEach(p => {
      html += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 5px 6px;">Passo ${p.passoNumero}</td>
          <td style="padding: 5px 6px; font-weight: 600; color: #103b70;">${p.signoNome}</td>
          <td style="padding: 5px 6px;">${p.regente}</td>
          <td style="padding: 5px 6px;">${PROFECCAO_ENGINE.formatarDataExtenso(p.startTime)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </details>
    `;
  });

  html += `
        </div>
      </div>

    </div>
  `;

  container.innerHTML = html;

  setTimeout(() => {
    carregarECalcularRS(anoAlvo, profAnual, profMensalList);
  }, 100);
}

function mudarAnoRS(novoAno) {
  const container = document.getElementById('mandala-container');
  if (container) renderInterfaceRevolucao(container, novoAno);
}

async function carregarECalcularRS(anoAlvo, profAnual, profMensalList) {
  const natalGeo = currentGeo;
  const ano = anoAlvo;
  const mes = String(currentMoment.getMonth() + 1).padStart(2, '0');
  const dia = String(currentMoment.getDate()).padStart(2, '0');
  const hora = String(currentMoment.getHours()).padStart(2, '0');
  const min = String(currentMoment.getMinutes()).padStart(2, '0');

  const fusoVal = (natalGeo && natalGeo.fuso !== undefined) ? natalGeo.fuso : calcularFusoPorLongitude(natalGeo.lon);

  try {
    const urlApi = `https://motor-astrologia.vercel.app/api/index?data=${ano}-${mes}-${dia}&hora=${hora}:${min}&fuso=${fusoVal}&lat=${natalGeo.lat}&lon=${natalGeo.lon}`;
    const res = await fetch(urlApi);
    if (!res.ok) throw new Error("Erro na API da RS");

    const apiJson = await res.json();

    const SIGNOS_INDEX = {
      "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
      "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
      "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
    };

    const rsAscData = apiJson.ascendente || {};
    const rsMcData = apiJson.meio_ceu || {};
    const rsSizigiaData = apiJson.sizigia || {};
    const rsPlanetas = apiJson.planetas || {};

    const rsAscAbs = ((SIGNOS_INDEX[rsAscData.signo] || 0) * 30) + (parseFloat(rsAscData.grau) || 0);
    const rsMcAbs = ((SIGNOS_INDEX[rsMcData.signo] || 0) * 30) + (parseFloat(rsMcData.grau) || 0);

    const checkRetro = (pObj) => {
      if (!pObj) return false;
      if (pObj.retrogrado !== undefined) return Boolean(pObj.retrogrado);
      if (pObj.velocidade !== undefined) return parseFloat(pObj.velocidade) < 0;
      return false;
    };

    const rsCalculatedData = {
      anoAlvo: anoAlvo,
      dataFormatada: `${dia}/${mes}/${ano} às ${hora}:${min}`,
      Ascendente: { grau_absoluto: rsAscAbs },
      MC: { grau_absoluto: rsMcAbs },
      Nodo_Norte: { grau_absoluto: rsPlanetas.NodoNorte ? rsPlanetas.NodoNorte.grau_absoluto : 0, retro: checkRetro(rsPlanetas.NodoNorte) },
      Sizigia: { grau_absoluto: rsSizigiaData.grau_absoluto !== undefined ? parseFloat(rsSizigiaData.grau_absoluto) : 0 },
      Sol: { grau_absoluto: rsPlanetas.Sol ? rsPlanetas.Sol.grau_absoluto : 0, retro: false },
      Lua: { grau_absoluto: rsPlanetas.Lua ? rsPlanetas.Lua.grau_absoluto : 0, retro: false },
      Mercúrio: { grau_absoluto: rsPlanetas.Mercurio ? rsPlanetas.Mercurio.grau_absoluto : 0, retro: checkRetro(rsPlanetas.Mercurio) },
      Vênus: { grau_absoluto: rsPlanetas.Venus ? rsPlanetas.Venus.grau_absoluto : 0, retro: checkRetro(rsPlanetas.Venus) },
      Marte: { grau_absoluto: rsPlanetas.Marte ? rsPlanetas.Marte.grau_absoluto : 0, retro: checkRetro(rsPlanetas.Marte) },
      Júpiter: { grau_absoluto: rsPlanetas.Jupiter ? rsPlanetas.Jupiter.grau_absoluto : 0, retro: checkRetro(rsPlanetas.Jupiter) },
      Saturno: { grau_absoluto: rsPlanetas.Saturno ? rsPlanetas.Saturno.grau_absoluto : 0, retro: checkRetro(rsPlanetas.Saturno) }
    };

    const natalFormattedData = {
      ...currentCalculatedData,
      dataFormatada: PROFECCAO_ENGINE.formatarDataExtenso(currentMoment)
    };

    if (typeof renderDualMandalaRS === 'function') {
      renderDualMandalaRS(natalFormattedData, rsCalculatedData, 'rs-mandala-container');
    }

  } catch (err) {
    const containerRS = document.getElementById('rs-mandala-container');
    if (containerRS) containerRS.innerHTML = `<p style="color: #dc2626;">Erro ao carregar os dados da Revolução Solar.</p>`;
  }
}
