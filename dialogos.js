/* CAIXAS DE AVISO, CONFIRMAÇÃO E PERGUNTA DO PRÓPRIO SITE.
   Substituem as janelas nativas do navegador (alert/confirm/prompt), que têm cara diferente em cada navegador
   (Safari, Chrome...) e não seguem o tema. Aqui a janela usa as mesmas classes das outras janelas do site
   (.modal-box, .modal-title, .modal-input, .btn-primary, .btn-secondary), então no Tema Céu vira papiro sozinha
   (ver o bloco "janelas" do index.html) e nos outros temas segue o tema normal.

   - astroAlert(msg)                     -> Promise<void>
   - astroConfirm(msg)                   -> Promise<boolean>
   - astroPrompt(msg, valorPadrao = '')  -> Promise<string|null>   (null = cancelou)
   - window.alert(msg) também passa por aqui (não bloqueia; mostra a caixa e segue) — assim os ~190 avisos
     espalhados pelo código ganham a janela do site sem precisar mexer em cada um. confirm/prompt precisam
     de "await", porque devolvem a resposta (os pontos de uso foram trocados por astroConfirm/astroPrompt).
   Várias chamadas seguidas viram uma fila: aparece uma de cada vez. */
(function () {
  var fila = [];
  var emUso = false;
  var overlay = null;

  function montar() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'astroDialogoOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); display: none; align-items: center; justify-content: center; z-index: 100000000; padding: 16px; box-sizing: border-box;';
    overlay.innerHTML =
      '<div class="modal-box" style="width: 420px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box;" role="dialog" aria-modal="true">' +
        '<div id="astroDialogoMsg" style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;"></div>' +
        '<input type="text" id="astroDialogoInput" class="modal-input" style="display: none;" autocomplete="off">' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn-secondary" id="astroDialogoCancelar">Cancelar</button>' +
          '<button type="button" class="btn-primary" id="astroDialogoOk">OK</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function proxima() {
    if (emUso || !fila.length) return;
    emUso = true;
    montar();
    var item = fila.shift();
    var msg = overlay.querySelector('#astroDialogoMsg');
    var input = overlay.querySelector('#astroDialogoInput');
    var btnOk = overlay.querySelector('#astroDialogoOk');
    var btnCancelar = overlay.querySelector('#astroDialogoCancelar');

    msg.textContent = item.msg;
    input.style.display = item.tipo === 'prompt' ? 'block' : 'none';
    input.value = item.tipo === 'prompt' ? (item.valorPadrao || '') : '';
    btnCancelar.style.display = item.tipo === 'alert' ? 'none' : '';
    btnOk.textContent = 'OK';
    overlay.style.display = 'flex';

    function fechar(resultado) {
      overlay.style.display = 'none';
      btnOk.onclick = null; btnCancelar.onclick = null; input.onkeydown = null; overlay.onkeydown = null;
      emUso = false;
      item.resolver(resultado);
      proxima();
    }
    var ok = function () { fechar(item.tipo === 'prompt' ? input.value : true); };
    var cancelar = function () { fechar(item.tipo === 'prompt' ? null : (item.tipo === 'confirm' ? false : undefined)); };
    btnOk.onclick = ok;
    btnCancelar.onclick = cancelar;
    overlay.onkeydown = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); cancelar(); }
      else if (e.key === 'Enter' && item.tipo !== 'prompt') { e.preventDefault(); ok(); }
    };
    input.onkeydown = function (e) {
      // stopPropagation: senão o mesmo Enter subiria até o overlay e já confirmaria a PRÓXIMA caixa da fila
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); ok(); }
    };
    // foco: no campo (pergunta) ou no OK; sem tela travada se o navegador não deixar focar
    setTimeout(function () {
      try { (item.tipo === 'prompt' ? input : btnOk).focus(); if (item.tipo === 'prompt') input.select(); } catch (e) { /* sem foco, segue */ }
    }, 30);
  }

  function enfileirar(tipo, msg, valorPadrao) {
    return new Promise(function (resolver) {
      fila.push({ tipo: tipo, msg: String(msg == null ? '' : msg), valorPadrao: valorPadrao, resolver: resolver });
      // se o corpo da página ainda não existe (script cedo demais), espera
      if (document.body) proxima(); else document.addEventListener('DOMContentLoaded', proxima, { once: true });
    });
  }

  window.astroAlert = function (msg) { return enfileirar('alert', msg); };
  window.astroConfirm = function (msg) { return enfileirar('confirm', msg); };
  window.astroPrompt = function (msg, valorPadrao) { return enfileirar('prompt', msg, valorPadrao); };

  // O alert nativo bloqueava e não devolvia nada; este mostra a janela do site e segue.
  window.alert = function (msg) { window.astroAlert(msg); };
})();

/* DATA E HORA DE NASCIMENTO — usadas ao criar/editar mapa (campos de texto livre). Padronizam pra DD/MM/AAAA e HH:MM,
   aceitando "6/3/1978", "06-03-1978", "10h45", "9h"; devolvem null se a data/hora não existe. Hora vazia -> ''. */
window.normalizarDataNascimento = function (txt) {
  var m = String(txt || '').trim().match(/^(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{4})$/);
  if (!m) return null;
  var d = parseInt(m[1], 10), mes = parseInt(m[2], 10), a = parseInt(m[3], 10), dt = new Date(a, mes - 1, d);
  if (a < 1000 || dt.getFullYear() !== a || dt.getMonth() !== mes - 1 || dt.getDate() !== d) return null;
  return String(d).padStart(2, '0') + '/' + String(mes).padStart(2, '0') + '/' + a;
};
window.normalizarHoraNascimento = function (txt) {
  var t = String(txt || '').trim().toLowerCase();
  if (!t) return '';
  var m = t.match(/^(\d{1,2})\s*(?::|h)\s*(\d{1,2})?\s*(?:min)?$/);
  if (!m) return null;
  var h = parseInt(m[1], 10), mi = m[2] ? parseInt(m[2], 10) : 0;
  if (h > 23 || mi > 59) return null;
  return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
};

/* PDF GERADO PELO SERVIDOR: abre numa ABA NOVA em vez de trocar a tela do software (recarregar a página do PDF dava erro e
   o astrólogo tinha que entrar de novo). O navegador só deixa abrir uma aba num toque, então a aba em branco é aberta NA HORA
   do toque (abrir) e só depois, quando o PDF chega, recebe o endereço dele (mostrar). Se o navegador bloquear a aba, cai no
   comportamento de antes (baixar o arquivo). Usado por Relatório e Financeiro. */
window.astroAbaPdf = {
  abrir: function () {
    var aba = null;
    try { aba = window.open('', '_blank'); } catch (e) { aba = null; }
    if (aba) {
      try {
        aba.document.title = 'Gerando PDF…';
        aba.document.body.style.cssText = 'margin:0;font-family:sans-serif;color:#103b70;background:#fffdf5;display:flex;align-items:center;justify-content:center;height:100vh;';
        aba.document.body.textContent = 'Gerando o PDF…';
      } catch (e) { /* aba sem acesso: segue mesmo assim */ }
    }
    return aba;
  },
  mostrar: function (aba, blob, nome) {
    var url = URL.createObjectURL(blob);
    if (aba && !aba.closed) {
      aba.location.href = url;
    } else {
      var link = document.createElement('a');
      link.href = url;
      link.download = nome;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 10 * 60 * 1000);
  },
  fechar: function (aba) {
    try { if (aba && !aba.closed) aba.close(); } catch (e) { /* ignora */ }
  }
};
