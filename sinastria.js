(function() {
    /* ===== MÓDULO DE SINASTRIA =====
       Sinastria = duas mandalas lado a lado, pra comparar dois mapas: a da
       DIREITA é sempre o mapa que já estava aberto no #mandala-container
       (o "mapa em tela", vindo de currentCalculatedData/currentMoment/
       currentGeo/currentSubjectName — mandala.js), a da ESQUERDA é um
       segundo mapa escolhido aqui dentro, numa busca própria deste módulo
       (não usa a barra lateral de clientes: selecionar lá troca o mapa
       principal, o que apagaria o mapa da direita).

       ===== BLOCO COPIADO DE profeccao.js (gerarMandalaSVG e tudo que ela
       usa) =====
       Cópia deliberada, não reinventada: é a MESMA lógica de desenho da
       mandala principal (mandala.js) — anéis/hastes dourados, aspectos,
       dodecatemoria, termos egípcios, lotes herméticos, planetas em SVG 3D
       com sombra e mancha de combustão — que profeccao.js já portou pra
       gerar mandalas em miniatura, coexistindo várias na mesma página (por
       isso os IDs de gradiente/filtro em construirDefsPlanetas levam um
       sufixo por instância). Não toca em mandala.js nem em profeccao.js. */

    const SIGNS = [
        { ruler: "Mars", rulerName: "Marte" },
        { ruler: "Venus", rulerName: "Vênus" },
        { ruler: "Mercury", rulerName: "Mercúrio" },
        { ruler: "Moon", rulerName: "Lua" },
        { ruler: "Sun", rulerName: "Sol" },
        { ruler: "Mercury", rulerName: "Mercúrio" },
        { ruler: "Venus", rulerName: "Vênus" },
        { ruler: "Mars", rulerName: "Marte" },
        { ruler: "Jupiter", rulerName: "Júpiter" },
        { ruler: "Saturn", rulerName: "Saturno" },
        { ruler: "Saturn", rulerName: "Saturno" },
        { ruler: "Jupiter", rulerName: "Júpiter" }
    ];

    const SIGN_ELEMENTS = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];
    const ELEMENT_SIGN_COLORS = { fire: "#e84118", earth: "#8b4513", air: "#0ea5e9", water: "#1d4ed8" };

    const MONOLINE_ZODIAC_SVGS = [
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M6,25c0,0-5-5-5-11S3,1,13,1c13.25,0,19,22,19,63"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M58,25c0,0,5-5,5-11S61,1,51,1C37.75,1,32,23,32,64"></path>`,
        `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="32" cy="43" r="18"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,3c14,0,15,12,15,12s0,10,17,10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,3C50,3,49,15,49,15s0,10-17,10"></path>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M0,8c0,0,16,4,32,4s32-4,32-4"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M64,56c0,0-16-4-32-4S0,56,0,56"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="21" y1="12" x2="21" y2="52"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="43" y1="12" x2="43" y2="52"></line>`,
        `<circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="11" cy="27" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5,19c0,0,7-6,28-6c15,0,31,10,31,10"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="53" cy="37" r="10"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M59,45c0,0-7,6-28,6C16,51,0,41,0,41"></path>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M22.649,33.597 c-8.337-4.888-11.134-15.608-6.247-23.946C21.29,1.312,32.012-1.485,40.35,3.403c8.337,4.888,11.134,15.608,6.247,23.946 C46.597,27.35,36,46,36,54"></path><circle fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" cx="19" cy="42" r="9"></circle><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M53.064,58c-1.473,2.963-4.531,5-8.064,5 c-4.971,0-9-4.029-9-9"></path>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,64c0,0-6-5-6-12s0-40,0-40s0-11-8-11s-8,11-8,11 v40"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,52V12c0,0,0.083-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M16,12c0,0,0-10-8-10"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,24c0,0,0-14,6-14s6,14,6,14s-1,34-27,34"></path>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M41.667,38.002 c3.913-2.939,6.444-7.619,6.444-12.891C48.111,16.213,40.897,9,32,9s-16.111,7.213-16.111,16.111c0,5.27,2.53,9.948,6.442,12.889"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="38" x2="23" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="41" y1="38" x2="64" y2="38"></line><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="0" y1="55" x2="64" y2="55"></line>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M30,52V12c0,0,0-11,8-11s8,11,8,11s0,33,0,40 c0,0,0,6,6,6h5"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,52V12c0,0,0-11,8-11s8,11,8,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14,12c0,0,0-10-8-10"></path><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="bevel" stroke-linecap="round" points="52,53 57,58 52,63 "></polyline>`,
        `<line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="63" y1="1" x2="0" y2="64"></line><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="36,1 63,1 63,28 "></polyline><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="1" y1="28" x2="36" y2="63"></line>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M9,5c0,0,0-4,6-4c5,0,4,10,4,10v29"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M19,11c0,0,0-10,7-10s7,10,7,10v29c0,0-1,14,15,14"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,40c-3,0-12,1-12,12c0,1,1,11-12,11"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M48,54c3.866,0,7-3.134,7-7s-3.134-7-7-7"></path>`,
        `<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,28 16,16 20,28 36,16 40,28 55,16 63,28 "></polyline><polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="0,48 16,36 20,48 36,36 40,48 55,36 63,48 "></polyline>`,
        `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M54,0c0,0-10,16-10,32s10,32,10,32"></path><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M10,64c0,0,10-16,10-32S10,0,10,0"></path><line fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" x1="7" y1="32" x2="57" y2="32"></line>`
    ];

    const PLANETS_DEF = [
        { id: "Sun", key: "Sol" },
        { id: "Moon", key: "Lua" },
        { id: "Mercury", key: "Mercúrio" },
        { id: "Venus", key: "Vênus" },
        { id: "Mars", key: "Marte" },
        { id: "Jupiter", key: "Júpiter" },
        { id: "Saturn", key: "Saturno" }
    ];

    const EGYPTIAN_TERMS = [
        [{ p: "♃", deg: 6 }, { p: "♀", deg: 12 }, { p: "☿", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
        [{ p: "♀", deg: 8 }, { p: "☿", deg: 14 }, { p: "♃", deg: 22 }, { p: "♄", deg: 27 }, { p: "♂", deg: 30 }],
        [{ p: "☿", deg: 6 }, { p: "♃", deg: 12 }, { p: "♀", deg: 17 }, { p: "♂", deg: 24 }, { p: "♄", deg: 30 }],
        [{ p: "♂", deg: 7 }, { p: "♀", deg: 13 }, { p: "☿", deg: 19 }, { p: "♃", deg: 26 }, { p: "♄", deg: 30 }],
        [{ p: "♃", deg: 6 }, { p: "♀", deg: 11 }, { p: "♄", deg: 18 }, { p: "☿", deg: 24 }, { p: "♂", deg: 30 }],
        [{ p: "☿", deg: 7 }, { p: "♀", deg: 17 }, { p: "♃", deg: 21 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }],
        [{ p: "♄", deg: 6 }, { p: "☿", deg: 14 }, { p: "♃", deg: 21 }, { p: "♀", deg: 28 }, { p: "♂", deg: 30 }],
        [{ p: "♂", deg: 7 }, { p: "♀", deg: 11 }, { p: "☿", deg: 19 }, { p: "♃", deg: 24 }, { p: "♄", deg: 30 }],
        [{ p: "♃", deg: 12 }, { p: "♀", deg: 17 }, { p: "☿", deg: 21 }, { p: "♄", deg: 26 }, { p: "♂", deg: 30 }],
        [{ p: "☿", deg: 7 }, { p: "♃", deg: 14 }, { p: "♀", deg: 22 }, { p: "♄", deg: 26 }, { p: "♂", deg: 30 }],
        [{ p: "☿", deg: 7 }, { p: "♀", deg: 13 }, { p: "♃", deg: 20 }, { p: "♂", deg: 25 }, { p: "♄", deg: 30 }],
        [{ p: "♀", deg: 12 }, { p: "♃", deg: 16 }, { p: "☿", deg: 19 }, { p: "♂", deg: 28 }, { p: "♄", deg: 30 }]
    ];

    function eclToScreenAngle(eclDeg, refAbs) {
        return (180 - (eclDeg - refAbs) + 36000) % 360;
    }

    function polarToCart(cx, cy, r, angleDeg) {
        const rad = angleDeg * Math.PI / 180.0;
        return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
    }

    function formatDegMin(absDeg) {
        const normDeg = (absDeg % 360 + 360) % 360;
        const degInSign = normDeg % 30;
        const degrees = Math.floor(degInSign);
        const minutes = Math.round((degInSign - degrees) * 60);
        const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${degrees}°${minStr}′`;
    }

    function calculateSevenLots(ascAbs, isDay, planetObj) {
        const sun = planetObj.Sun.abs;
        const moon = planetObj.Moon.abs;
        const merc = planetObj.Mercury.abs;
        const ven = planetObj.Venus.abs;
        const mars = planetObj.Mars.abs;
        const jup = planetObj.Jupiter.abs;
        const sat = planetObj.Saturn.abs;

        const fortAbs = ((isDay ? (ascAbs + moon - sun) : (ascAbs + sun - moon)) + 36000) % 360;
        const spirAbs = ((isDay ? (ascAbs + sun - moon) : (ascAbs + moon - sun)) + 36000) % 360;
        const erosAbs = ((isDay ? (ascAbs + ven - spirAbs) : (ascAbs + spirAbs - ven)) + 36000) % 360;
        const necAbs = ((isDay ? (ascAbs + fortAbs - merc) : (ascAbs + merc - fortAbs)) + 36000) % 360;
        const courAbs = ((isDay ? (ascAbs + fortAbs - mars) : (ascAbs + mars - fortAbs)) + 36000) % 360;
        const vicAbs = ((isDay ? (ascAbs + jup - spirAbs) : (ascAbs + spirAbs - jup)) + 36000) % 360;
        const nemAbs = ((isDay ? (ascAbs + fortAbs - sat) : (ascAbs + sat - fortAbs)) + 36000) % 360;

        return [
            { key: "fortune", label: "FORT", type: "fortune", deg: fortAbs },
            { key: "spirit", label: "ESP", type: "spirit", deg: spirAbs },
            { key: "venus", label: "EROS", type: "venus", sym: "♀", deg: erosAbs },
            { key: "mercury", label: "NEC", type: "mercury", sym: "☿", deg: necAbs },
            { key: "mars", label: "AUD", type: "mars", sym: "♂", deg: courAbs },
            { key: "jupiter", label: "VIT", type: "jupiter", sym: "♃", deg: vicAbs },
            { key: "saturn", label: "NÊM", type: "saturn", sym: "♄", deg: nemAbs }
        ];
    }

    function aplicarEmpilhamentoRadial(items, distMinimaGraus = 6.5, passoRadial = 22) {
        if (!items || items.length === 0) return;
        items.forEach(it => { it.aShift = it.aScreen; it.rOffset = 0; });

        const naEcliptica = items.filter(it => it.type !== 'lot').sort((a, b) => a.aScreen - b.aScreen);
        if (naEcliptica.length === 0) return;

        const grupos = [[naEcliptica[0]]];
        for (let i = 1; i < naEcliptica.length; i++) {
            if (naEcliptica[i].aScreen - naEcliptica[i - 1].aScreen < distMinimaGraus) {
                grupos[grupos.length - 1].push(naEcliptica[i]);
            } else {
                grupos.push([naEcliptica[i]]);
            }
        }

        grupos.forEach(grupo => {
            if (grupo.length <= 1) return;
            const membros = grupo.filter(it => it.id !== 'Sun');
            let camada = 1;
            membros.forEach((item, idx) => {
                const direcao = idx % 2 === 0 ? 1 : -1;
                item.rOffset = direcao * camada * passoRadial;
                if (idx % 2 === 1) camada++;
            });
        });

        const sol = naEcliptica.find(it => it.id === 'Sun');
        if (sol) {
            naEcliptica.forEach(it => {
                let diff = Math.abs(it.deg - sol.deg);
                if (diff > 180) diff = 360 - diff;
                if (diff <= 15) it.rOffset = 0;
            });
        }
    }

    function aplicarDesvioLateralLotes(items, distMinimaGraus = 6) {
        const lotes = items.filter(it => it.type === 'lot').sort((a, b) => a.aScreen - b.aScreen);
        if (lotes.length === 0) return;
        lotes.forEach(it => it.aShift = it.aScreen);

        for (let pass = 0; pass < 12; pass++) {
            for (let i = 0; i < lotes.length - 1; i++) {
                const atual = lotes[i];
                const proximo = lotes[i + 1];
                const diff = proximo.aShift - atual.aShift;
                if (diff < distMinimaGraus) {
                    const overlap = (distMinimaGraus - diff) / 2;
                    atual.aShift -= overlap;
                    proximo.aShift += overlap;
                }
            }
        }
    }

    /* Defs (filtros/gradientes) dos planetas e da mancha de combustão, com IDs
       sufixados por instância — as duas mini-mandalas da Sinastria (esquerda
       e direita) coexistem na mesma página, então não podem compartilhar os
       mesmos IDs de SVG. */
    let wheelInstanceCounter = 0;

    function construirDefsPlanetas(sufixo) {
        return `
            <radialGradient id="combustionGlow_${sufixo}" cx="50%" cy="50%" r="50%">
          ${combustaoStopsAuto()}
            </radialGradient>
        `;
    }

    function fragmentoPlaneta3D(planetId, sufixo) {
        return (typeof getIconeFragmento === 'function') ? getIconeFragmento('planeta', planetId) : '';
    }

    /* GERA A MANDALA DA SINASTRIA EM SVG — desenhada pela RODA CENTRAL (desenharRodaSVG, roda.js), a mesma de todas as ferramentas: o
       estilo (francês / Astro Hellenic) e o desenho em si moram lá. Aqui ficam só os ids de SVG por instância (as duas mandalas
       coexistem na página), o cartão escuro, o planeta e a escala igual das duas (opcoes.rCanvasMinimo). Sem destaques de signo,
       sem cabeçalho nem céu. Devolve { svg, rCanvas } (rCanvas = a margem que ESTE mapa pediria sozinho). */
    function gerarMandalaSVG(dados, opcoes = {}) {
        if (!dados || !dados.Ascendente) {
            return { svg: `<div style="padding: 40px 10px; text-align: center; color: var(--text-faint); font-size: 12px; font-family: 'Montserrat', sans-serif;">Sem dados para desenhar o mapa.</div>`, rCanvas: 0 };
        }

        // TEMA CÉU — roda SECUNDÁRIA: "tinta sobre o papiro" (as cores vêm da roda central).
        const papiro = typeof window !== 'undefined' && window.temaMandala === 'ceu';
        const sufixo = `sw${wheelInstanceCounter++}`;

        const roda = desenharRodaSVG({
            tintaPapiro: papiro,
            ferramenta: {
                dados,
                rCanvasMinimo: opcoes.rCanvasMinimo || 0,
                // fundoDisco/halo do tema escuro usam --bg-card (#262220), NÃO --bg-main (#1c1917): cada mandala fica dentro do seu cartão
                // (ver renderSinastriaTela) — pra não aparecer o "quadrado" claro entre a borda dourada do cartão e o disco escuro.
                fundoEscuro: '#262220',
                abertura: ({ canvasSize, fundoDisco }) => `<svg viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block; margin: 0 auto;">
            <defs>${construirDefsPlanetas(sufixo)}</defs>
            <rect width="${canvasSize}" height="${canvasSize}" fill="${fundoDisco}"/>`,
                fragmentoPlaneta: (id) => fragmentoPlaneta3D(id, sufixo),
                glowSol: (pos, raio, tinta) => `<circle cx="${pos.x}" cy="${pos.y}" r="${raio}" fill="${tinta.fundoDisco}"/>` +
                    `<circle cx="${pos.x}" cy="${pos.y}" r="${raio}" fill="url(#combustionGlow_${sufixo})"/>`
            }
        });
        return { svg: roda.svg, rCanvas: roda.rCanvasNatural };
    }

    /* ===== FIM DA MANDALA (roda central) ===== */

    /* ===== A PARTIR DAQUI: LÓGICA PRÓPRIA DA SINASTRIA ===== */

    /* Gera as duas mandalas (esquerda/direita) já na MESMA escala visual:
       desenha as duas uma vez pra descobrir de qual delas precisa de mais
       margem (rCanvas natural maior) e, se precisar, redesenha só a menor
       forçando o mesmo canvas da maior — assim as duas ficam do mesmo
       tamanho na tela, nunca cortando planeta nenhuma das duas. */
    function gerarMandalasComEscalaIgual(dadosEsquerda, dadosDireita) {
        const resEsquerda = gerarMandalaSVG(dadosEsquerda, {});
        const resDireita = gerarMandalaSVG(dadosDireita, {});
        const rCanvasFinal = Math.max(resEsquerda.rCanvas, resDireita.rCanvas);

        const svgEsquerda = (resEsquerda.rCanvas < rCanvasFinal)
            ? gerarMandalaSVG(dadosEsquerda, { rCanvasMinimo: rCanvasFinal }).svg
            : resEsquerda.svg;
        const svgDireita = (resDireita.rCanvas < rCanvasFinal)
            ? gerarMandalaSVG(dadosDireita, { rCanvasMinimo: rCanvasFinal }).svg
            : resDireita.svg;

        return { svgEsquerda, svgDireita };
    }

    // Estado só desta aba/sessão (não persiste no Supabase nem no
    // localStorage): é "estado de navegação da ferramenta atual", não uma
    // preferência do astrólogo — some ao trocar de módulo ou recarregar.
    let sinastriaSegundoMapa = null; // { nome, codigo, cidade, moment, geo, dados }
    let sinastriaListaMapas = null;
    let sinastriaCarregandoLista = false;
    let sinastriaPastaSelecionada = null; // null = mostrando a lista de pastas

    function sinastriaLinhaInfo(nome, codigo, momentDate, geo) {
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const fusoVal = (geo && geo.fuso !== undefined) ? geo.fuso : -3;
        const fusoFormatted = `UTC${fusoVal >= 0 ? '+' + fusoVal : fusoVal}`;
        const dia = String(momentDate.getDate()).padStart(2, '0');
        const mes = String(momentDate.getMonth() + 1).padStart(2, '0');
        const ano = momentDate.getFullYear();
        const hora = String(momentDate.getHours()).padStart(2, '0');
        const min = String(momentDate.getMinutes()).padStart(2, '0');
        const diaSemana = diasSemana[momentDate.getDay()];
        const cidade = (geo && geo.city) ? geo.city : 'Local n/i';
        const titulo = codigo ? `${codigo} ${nome}` : nome;
        return `
            <div style="font-family: 'Cinzel', serif; font-size: 15px; font-weight: 800; color: var(--primary-blue); margin-bottom: 2px;">${escapeHtml(titulo || 'Sem Nome')}</div>
            <div style="font-size: 11px; color: var(--text-muted-2); font-weight: 500;">${diaSemana} • ${dia}/${mes}/${ano} às ${hora}:${min} (${fusoFormatted})</div>
            <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(cidade)}</div>
        `;
    }

    /* Calcula os dados astrológicos completos de um mapa salvo (linha da
       tabela "mapas") para desenhar a mini-mandala dele — mesma chamada e
       mesmo formato de retorno de executarCalculo() em mandala.js (cópia
       deliberada da transformação da resposta da API, só generalizada para
       receber data/hora/local de QUALQUER mapa, não só o currentMoment/
       currentGeo do mapa principal). */
    async function sinastriaCalcularDadosMapa(row) {
        let ano = 2000, mes = 1, dia = 1;
        if (row.data_nascimento && row.data_nascimento.includes('/')) {
            const partes = row.data_nascimento.split('/');
            if (partes.length === 3) {
                dia = parseInt(partes[0]);
                mes = parseInt(partes[1]);
                ano = parseInt(partes[2]);
            }
        }

        let hora = 12, min = 0;
        if (row.hora_nascimento && row.hora_nascimento.includes(':')) {
            const partesH = row.hora_nascimento.split(':');
            if (partesH.length >= 2) {
                hora = parseInt(partesH[0]);
                min = parseInt(partesH[1]);
            }
        }

        const lat = parseFloat(row.latitude) || -23.5505;
        const lon = parseFloat(row.longitude) || -46.6333;
        const fuso = (typeof calcularFusoPreciso === 'function')
            ? calcularFusoPreciso(lat, lon, ano, mes, dia, hora, min)
            : ((typeof calcularFusoPorLongitude === 'function') ? calcularFusoPorLongitude(lon) : -3);

        const momentDate = new Date(ano, mes - 1, dia, hora, min);
        const geo = { lat, lon, fuso, city: row.cidade || "Localidade não informada" };

        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const horaStr = `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

        try {
            const urlApi = `https://motor-astrologia.vercel.app/api/index?data=${dataStr}&hora=${horaStr}&fuso=${fuso}&lat=${lat}&lon=${lon}`;
            const res = await fetch(urlApi);
            if (!res.ok) return null;
            const apiJson = await res.json();

            const SIGNOS_INDEX = {
                "Aries": 0, "Touro": 1, "Gemeos": 2, "Cancer": 3,
                "Leao": 4, "Virgem": 5, "Libra": 6, "Escorpiao": 7,
                "Sagitario": 8, "Capricornio": 9, "Aquario": 10, "Peixes": 11
            };

            const planetas = apiJson.planetas || {};
            const ascData = apiJson.ascendente || {};
            const mcData = apiJson.meio_ceu || {};
            const sizigiaData = apiJson.sizigia || {};

            const ascAbs = ((SIGNOS_INDEX[ascData.signo] || 0) * 30) + (parseFloat(ascData.grau) || 0);
            const mcAbs = ((SIGNOS_INDEX[mcData.signo] || 0) * 30) + (parseFloat(mcData.grau) || 0);

            const checkRetro = (pObjApi) => {
                if (!pObjApi) return false;
                if (pObjApi.retrogrado !== undefined) return Boolean(pObjApi.retrogrado);
                if (pObjApi.velocidade !== undefined) return parseFloat(pObjApi.velocidade) < 0;
                return false;
            };

            const dados = {
                Ascendente: { grau_absoluto: ascAbs },
                MC: { grau_absoluto: mcAbs },
                Nodo_Norte: { grau_absoluto: planetas.NodoNorte ? planetas.NodoNorte.grau_absoluto : 0, retro: checkRetro(planetas.NodoNorte) },
                Sizigia: { grau_absoluto: sizigiaData.grau_absoluto !== undefined ? parseFloat(sizigiaData.grau_absoluto) : 0 },
                Sol: { grau_absoluto: planetas.Sol ? planetas.Sol.grau_absoluto : 0, retro: false, lat: planetas.Sol ? parseFloat(planetas.Sol.latitude) || 0 : 0 },
                Lua: { grau_absoluto: planetas.Lua ? planetas.Lua.grau_absoluto : 0, retro: false, lat: planetas.Lua ? parseFloat(planetas.Lua.latitude) || 0 : 0 },
                Mercúrio: { grau_absoluto: planetas.Mercurio ? planetas.Mercurio.grau_absoluto : 0, retro: checkRetro(planetas.Mercurio), lat: planetas.Mercurio ? parseFloat(planetas.Mercurio.latitude) || 0 : 0 },
                Vênus: { grau_absoluto: planetas.Venus ? planetas.Venus.grau_absoluto : 0, retro: checkRetro(planetas.Venus), lat: planetas.Venus ? parseFloat(planetas.Venus.latitude) || 0 : 0 },
                Marte: { grau_absoluto: planetas.Marte ? planetas.Marte.grau_absoluto : 0, retro: checkRetro(planetas.Marte), lat: planetas.Marte ? parseFloat(planetas.Marte.latitude) || 0 : 0 },
                Júpiter: { grau_absoluto: planetas.Jupiter ? planetas.Jupiter.grau_absoluto : 0, retro: checkRetro(planetas.Jupiter), lat: planetas.Jupiter ? parseFloat(planetas.Jupiter.latitude) || 0 : 0 },
                Saturno: { grau_absoluto: planetas.Saturno ? planetas.Saturno.grau_absoluto : 0, retro: checkRetro(planetas.Saturno), lat: planetas.Saturno ? parseFloat(planetas.Saturno.latitude) || 0 : 0 }
            };

            return { dados, moment: momentDate, geo };
        } catch (err) {
            console.error("Erro ao calcular o segundo mapa da Sinastria:", err);
            return null;
        }
    }

    /* Busca (uma vez por visita ao módulo) todos os mapas salvos, de todas
       as pastas — mesmo padrão de agendamento.js (iniciarModuloAgenda), que
       também precisa de uma lista de clientes sem passar pela navegação por
       pastas da barra lateral. A navegação em si (escolher a pasta antes de
       ver os clientes) é feita aqui dentro, filtrando essa lista já
       carregada — não refaz a busca no Supabase a cada pasta aberta. */
    async function sinastriaGarantirListaCarregada() {
        if (sinastriaListaMapas) {
            sinastriaRenderizarListaPicker(sinastriaFiltrarPorPastaAtual(sinastriaListaMapas));
            return;
        }
        if (sinastriaCarregandoLista) return;
        sinastriaCarregandoLista = true;

        try {
            const { data, error } = await supabaseClient
                .from('mapas')
                .select('id, nome, codigo, pasta, cidade, data_nascimento, hora_nascimento, latitude, longitude');

            if (!error && Array.isArray(data)) {
                sinastriaListaMapas = data;
                if (typeof compararValoresOrdenacao === 'function') {
                    sinastriaListaMapas.sort((a, b) => compararValoresOrdenacao(a, b, 'nome'));
                }
                sinastriaRenderizarListaPicker(sinastriaFiltrarPorPastaAtual(sinastriaListaMapas));
            } else {
                const cont = document.getElementById('sinastriaListaContainer');
                if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--danger);">Erro ao carregar a lista de mapas.</div>`;
            }
        } catch (e) {
            console.error("Erro ao carregar mapas para a Sinastria:", e);
            const cont = document.getElementById('sinastriaListaContainer');
            if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--danger);">Erro de conexão.</div>`;
        } finally {
            sinastriaCarregandoLista = false;
        }
    }

    // Mesmo critério de carregarMapasDoBanco (supabase.js): só os mapas com
    // pasta exatamente igual à pasta aberta.
    function sinastriaFiltrarPorPastaAtual(lista) {
        if (!sinastriaPastaSelecionada) return lista;
        return lista.filter(item => item.pasta === sinastriaPastaSelecionada);
    }

    /* Lista de pastas (mesma fonte que a barra lateral usa: customFolders,
       de supabase.js) — mostrada antes da lista de clientes, pra ficar mais
       fácil achar o mapa certo em vez de rolar uma lista única com todos os
       clientes de todas as pastas juntos. */
    function sinastriaRenderizarPastas() {
        const cont = document.getElementById('sinastriaListaContainer');
        if (!cont) return;

        const pastas = (typeof customFolders !== 'undefined' && Array.isArray(customFolders) && customFolders.length > 0) ? customFolders : ['Clientes'];
        const pastasOrdenadas = [...pastas].sort((a, b) => a.localeCompare(b, 'pt-BR'));

        let html = '';
        pastasOrdenadas.forEach(pasta => {
            const pastaAttrEscapada = escapeHtml(pasta).replace(/'/g, "&#39;");
            html += `
                <div onclick="sinastriaAbrirPasta('${pastaAttrEscapada}')" style="margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); padding: 10px 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-primary); flex-shrink: 0;"><path d="M4,7 A2,2 0 0 1 6,5 H10 L12,7.5 H19 A2,2 0 0 1 21,9.5 V17 A2,2 0 0 1 19,19 H6 A2,2 0 0 1 4,17 Z"/></svg>
                        <span style="font-size: 12px; font-weight: 700; color: var(--primary-blue);">${escapeHtml(pasta)}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--gold-primary);"></i>
                </div>
            `;
        });
        cont.innerHTML = html || `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--text-faint);">Nenhuma pasta encontrada.</div>`;
    }

    window.sinastriaAbrirPasta = function(pasta) {
        sinastriaPastaSelecionada = pasta;
        const container = document.getElementById('mandala-container');
        if (container) renderSinastriaTela(container);
    };

    window.sinastriaVoltarPastas = function() {
        sinastriaPastaSelecionada = null;
        const container = document.getElementById('mandala-container');
        if (container) renderSinastriaTela(container);
    };

    function sinastriaRenderizarListaPicker(lista) {
        const cont = document.getElementById('sinastriaListaContainer');
        if (!cont) return;

        if (!lista || lista.length === 0) {
            cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--text-faint);">Nenhum mapa encontrado.</div>`;
            return;
        }

        let html = '';
        lista.forEach(item => {
            const cod = item.codigo ? `${item.codigo} - ` : '';
            const cidStr = item.cidade || 'Local n/i';
            html += `
                <div onclick="sinastriaSelecionarMapa(${item.id})" style="margin: 4px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); padding: 8px 10px; cursor: pointer;">
                    <div style="color: var(--primary-blue); font-weight: 700; font-size: 12px;">${cod}${escapeHtml(item.nome || 'Sem Nome')}</div>
                    <div style="color: var(--text-muted); font-size: 10px; margin-top: 2px;">${escapeHtml(cidStr)}</div>
                </div>
            `;
        });
        cont.innerHTML = html;
    }

    window.sinastriaFiltrarLista = function(query) {
        if (!sinastriaListaMapas) return;
        const q = (query || '').toLowerCase().trim();
        const base = sinastriaFiltrarPorPastaAtual(sinastriaListaMapas);
        const filtrada = !q ? base : base.filter(item => {
            return (item.nome || '').toLowerCase().includes(q)
                || (item.codigo ? String(item.codigo).toLowerCase().includes(q) : false)
                || (item.cidade || '').toLowerCase().includes(q);
        });
        sinastriaRenderizarListaPicker(filtrada);
    };

    window.sinastriaSelecionarMapa = async function(id) {
        if (!sinastriaListaMapas) return;
        const row = sinastriaListaMapas.find(m => m.id === id);
        if (!row) return;

        const cont = document.getElementById('sinastriaListaContainer');
        if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--primary-blue);"><i class="fa-solid fa-spinner fa-spin" style="color: var(--gold-primary);"></i> Calculando mapa...</div>`;

        const resultado = await sinastriaCalcularDadosMapa(row);
        if (!resultado) {
            if (cont) cont.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 12px; color: var(--danger);">Erro ao calcular esse mapa. Toque para tentar de novo.</div>`;
            return;
        }

        sinastriaSegundoMapa = {
            nome: row.nome || 'Sem Nome',
            codigo: row.codigo || null,
            cidade: row.cidade,
            moment: resultado.moment,
            geo: resultado.geo,
            dados: resultado.dados
        };

        const container = document.getElementById('mandala-container');
        if (container) renderSinastriaTela(container);
    };

    window.sinastriaTrocarMapa = function() {
        sinastriaSegundoMapa = null;
        const container = document.getElementById('mandala-container');
        if (container) renderSinastriaTela(container);
    };

    /* Monta a tela inteira: mandala esquerda (segundo mapa, ou o buscador
       quando ainda não escolhido) + mandala direita (o mapa que já estava
       em tela, sem tocar em currentCalculatedData/currentMoment/currentGeo). */
    function renderSinastriaTela(container) {
        const nomeA = (typeof currentSubjectName !== 'undefined') ? currentSubjectName : 'Mapa em tela';
        const codigoA = (typeof currentCustomCode !== 'undefined') ? currentCustomCode : null;
        const momentA = (typeof currentMoment !== 'undefined' && currentMoment instanceof Date) ? currentMoment : new Date();
        const geoA = (typeof currentGeo !== 'undefined' && currentGeo) ? currentGeo : { lat: -23.5505, lon: -46.6333, fuso: -3, city: 'São Paulo, SP' };

        let cardEsquerdaHtml;
        let cardDireitaHtml;

        // Cabeçalho PADRÃO do mapa em tela também enquanto o segundo mapa ainda
        // não foi escolhido (o da esquerda ganha um espaço invisível do mesmo
        // tamanho, pra os dois cartões ficarem alinhados).
        const horasSolo = (typeof window.calcularHorasPlanetariasProf === 'function')
            ? window.calcularHorasPlanetariasProf(momentA, geoA.lat, geoA.lon, geoA.fuso !== undefined ? geoA.fuso : -3) : null;
        const cabSolo = montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, { largura: 480, titulo: nomeA, momento: momentA, geo: geoA, horasInfo: horasSolo, tintaSobreFolha: true });
        const espacoCabSolo = `<div aria-hidden="true" style="visibility: hidden;">${cabSolo}</div>`;

        if (sinastriaSegundoMapa) {
            // As duas mandalas são geradas juntas pra ficarem na MESMA escala
            // visual (ver gerarMandalasComEscalaIgual) — senão quem tem mais
            // planetas colados (precisa de mais margem) aparece menor que a
            // outra, mesmo os dois cartões tendo a mesma largura.
            const { svgEsquerda, svgDireita } = gerarMandalasComEscalaIgual(sinastriaSegundoMapa.dados, currentCalculatedData);

            // Cabeçalho PADRÃO (função global, mandala.js) acima de cada mandala,
            // cada um na largura de uma mandala e com a mesma altura.
            const LARGURA_CAB = 480;
            const coresCab = coresCabecalhoMandala(document.documentElement.classList.contains('tema-escuro'), null);
            const horasDe = (momento, geo) => (typeof window.calcularHorasPlanetariasProf === 'function')
                ? window.calcularHorasPlanetariasProf(momento, geo.lat, geo.lon, geo.fuso !== undefined ? geo.fuso : -3) : null;
            const m2 = sinastriaSegundoMapa;
            const opcEsq = { largura: LARGURA_CAB, titulo: m2.nome, momento: m2.moment, geo: m2.geo, tipoMapa: 'Natal', horasInfo: horasDe(m2.moment, m2.geo) };
            const opcDir = { largura: LARGURA_CAB, titulo: nomeA, momento: momentA, geo: geoA, horasInfo: horasDe(momentA, geoA) };
            const altCab = Math.max(
                montarCabecalhoMandalaLayout(m2.dados, 2, coresCab, null, opcEsq).altura,
                montarCabecalhoMandalaLayout(currentCalculatedData, 2, coresCab, null, opcDir).altura);
            const cabEsq = montarCabecalhoMandalaImagemHTML(m2.dados, null, Object.assign({ alturaMinima: altCab, tintaSobreFolha: true }, opcEsq));
            const cabDir = montarCabecalhoMandalaImagemHTML(currentCalculatedData, null, Object.assign({ alturaMinima: altCab, tintaSobreFolha: true }, opcDir));
            const cardCss = "background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);";

            cardEsquerdaHtml = `
                <div style="flex: 1 1 0; min-width: 280px;">
                    ${cabEsq}
                    <div style="${cardCss}">${svgEsquerda}</div>
                </div>
            `;

            cardDireitaHtml = `
                <div style="flex: 1 1 0; min-width: 280px;">
                    ${cabDir}
                    <div style="${cardCss}">${svgDireita}</div>
                </div>
            `;
        } else if (sinastriaPastaSelecionada) {
            // Dentro de uma pasta: cabeçalho com "voltar" + nome da pasta,
            // busca (filtra só dentro dela) e a lista de clientes.
            cardEsquerdaHtml = `
                <div style="flex: 1 1 0; min-width: 280px;">
                ${espacoCabSolo}
                <div style="background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 14px 12px; display: flex; flex-direction: column; min-height: 320px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <button onclick="sinastriaVoltarPastas()" title="Voltar às pastas" style="color: var(--primary-blue); border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); padding: 4px 8px; cursor: pointer; flex-shrink: 0;">
                            <i class="fa-solid fa-chevron-left" style="color: var(--gold-primary);"></i>
                        </button>
                        <div style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--primary-blue); font-weight: 700; text-transform: uppercase; flex: 1; text-align: center;">${escapeHtml(sinastriaPastaSelecionada)}</div>
                    </div>
                    <div class="search-box-container" style="margin-bottom: 10px;">
                        <input type="text" id="sinastriaBuscaInput" class="client-search-input" placeholder="Buscar nesta pasta..." oninput="sinastriaFiltrarLista(this.value)" style="width: 100%; border: 1px solid var(--gold-primary); border-radius: 8px; background: var(--bg-card); color: var(--primary-blue);">
                    </div>
                    <div id="sinastriaListaContainer" class="client-list-container" style="flex: 1; overflow-y: auto; min-height: 220px; max-height: 420px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-main);">
                        <div style="padding: 16px; text-align: center; font-size: 12px; color: var(--primary-blue);"><i class="fa-solid fa-spinner fa-spin" style="color: var(--gold-primary);"></i> Carregando mapas...</div>
                    </div>
                </div>
                </div>
            `;

            cardDireitaHtml = `
                <div style="flex: 1 1 0; min-width: 280px;">
                    ${cabSolo}
                    <div style="background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                        ${gerarMandalaSVG(currentCalculatedData, {}).svg}
                    </div>
                </div>
            `;
        } else {
            // Ainda sem pasta escolhida: mostra a lista de pastas primeiro
            // (mesma fonte que a barra lateral usa), pra facilitar achar o
            // mapa certo em vez de uma lista única com todo mundo junto.
            cardEsquerdaHtml = `
                <div style="flex: 1 1 0; min-width: 280px;">
                ${espacoCabSolo}
                <div style="background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 14px 12px; display: flex; flex-direction: column; min-height: 320px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--primary-blue); font-weight: 700; margin-bottom: 12px; text-transform: uppercase; text-align: center;">Selecione a Pasta</div>
                    <div id="sinastriaListaContainer" class="client-list-container" style="flex: 1; overflow-y: auto; min-height: 220px; max-height: 420px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-main);">
                        <div style="padding: 16px; text-align: center; font-size: 12px; color: var(--primary-blue);"><i class="fa-solid fa-spinner fa-spin" style="color: var(--gold-primary);"></i> Carregando pastas...</div>
                    </div>
                </div>
                </div>
            `;

            cardDireitaHtml = `
                <div style="flex: 1 1 0; min-width: 280px;">
                    ${cabSolo}
                    <div style="background: var(--bg-card); border: 1.5px solid var(--gold-primary); border-radius: 14px; padding: 12px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                        ${gerarMandalaSVG(currentCalculatedData, {}).svg}
                    </div>
                </div>
            `;
        }

        const mandalasHtml = `
            <div id="${sinastriaSegundoMapa ? 'sinastriaDuasColunas' : 'sinastriaSelecao'}" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 18px;">
                ${cardEsquerdaHtml}
                ${cardDireitaHtml}
            </div>
        `;

        /* Barra de ícones (sem texto), igual às outras ferramentas: galeria,
           relatório e trocar mapa (setinhas). Só com os dois mapas escolhidos. */
        const btnCss = "width: 36px; height: 36px; background: var(--bg-main); border: 1px solid #d4af37; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 0; color: var(--primary-blue);";
        const trocarBtnHtml = sinastriaSegundoMapa ? `
            <div style="display: flex; justify-content: flex-end; align-items: flex-start; gap: 6px; margin-bottom: 8px;">
                <button type="button" onclick="sinastriaSalvarNaGaleria()" title="Salvar a Sinastria como imagem na galeria (com título e cabeçalhos)" style="${btnCss}">
                    <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="21" cy="25" r="5"/><path d="M6,46 L22,32 L34,43 L44,34 L58,47"/></svg>
                </button>
                <button type="button" onclick="sinastriaAdicionarAoRelatorio()" title="Adicionar ao Relatório (as duas mandalas com cabeçalhos)" style="${btnCss}">
                    <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14,4 H40 L50,14 V60 H14 Z"/><path d="M40,4 V14 H50"/><line x1="21" y1="28" x2="43" y2="28"/><line x1="21" y1="38" x2="43" y2="38"/><line x1="21" y1="48" x2="35" y2="48"/></svg>
                </button>
                <button type="button" onclick="sinastriaTrocarMapa()" title="Trocar o segundo mapa" style="${btnCss}">
                    <i class="fa-solid fa-arrow-right-arrow-left" style="font-size: 15px;"></i>
                </button>
            </div>
        ` : '';

        const blocoMandalasHtml = mandalasHtml;

        container.innerHTML = `
            <div id="sinastria-container" style="width: 100%; padding: 20px; background-color: var(--bg-main); font-family: 'Montserrat', sans-serif;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <h2 style="font-family: 'Cinzel', serif; color: var(--primary-blue); margin: 0; font-size: 18px; text-transform: uppercase;">Sinastria</h2>
                </div>
                ${trocarBtnHtml}
                ${blocoMandalasHtml}
            </div>
        `;

        if (sinastriaSegundoMapa) {
            // nada a fazer: as imagens só são geradas ao tocar nos botões
        } else if (sinastriaPastaSelecionada) {
            sinastriaGarantirListaCarregada();
        } else {
            sinastriaRenderizarPastas();
        }
    }

    /* IMAGENS DA SINASTRIA (galeria e relatório): título + cabeçalhos + cartões +
       mandalas saem direto do SVG (rápido), só ao tocar nos botões. */
    function sinastriaFundoCaptura() {
        // Tema Céu: imagem salva sobre papiro (cor chapada pro recorte achar a borda), claro ou escuro.
        // Imagem pro RELATÓRIO (window.__capturaSemFundo ligado só durante a captura): sem fundo nenhum, só as linhas em tinta.
        if (window.temaMandala === 'ceu') return window.__capturaSemFundo ? null : papiroCores().chapado;
        return document.documentElement.classList.contains('tema-escuro') ? '#1c1917' : '#fffdf5';
    }

    async function sinastriaMontarImagem(comTitulo) {
        const fundo = sinastriaFundoCaptura();
        const topo = await window.montarTopoDuasMandalas('sinastriaDuasColunas');
        if (!topo) return null;
        if (!comTitulo) return topo;
        const W = topo.width / 2;
        const cores = (window.temaMandala === 'ceu') ? coresCabecalhoTinta() : coresCabecalhoMandala(document.documentElement.classList.contains('tema-escuro'), null);
        const titulo = await rasterizarSvgParaCanvas(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="34" viewBox="0 0 ${W} 34"><text x="${W / 2}" y="26" text-anchor="middle" font-family="serif" font-size="20" font-weight="800" letter-spacing="1" fill="${cores.titulo}">SINASTRIA</text></svg>`, W, 34, fundo, 2);
        const gap = 32;
        const saida = document.createElement('canvas');
        saida.width = topo.width;
        saida.height = titulo.height + gap + topo.height;
        const ctx = saida.getContext('2d');
        if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, saida.width, saida.height); }
        ctx.drawImage(titulo, 0, 0);
        ctx.drawImage(topo, 0, titulo.height + gap);
        return saida;
    }

    function sinastriaSalvarNaGaleria() {
        capturarESalvarNaGaleria(
            () => sinastriaMontarImagem(true),
            `Astro_Hellenic_Sinastria_${((typeof currentSubjectName !== 'undefined' && currentSubjectName) || 'mapa').replace(/\s+/g, '_')}.png`
        );
    }
    window.sinastriaSalvarNaGaleria = sinastriaSalvarNaGaleria;

    /* Manda as duas mandalas (com os cabeçalhos) pro Relatório. */
    async function sinastriaAdicionarAoRelatorio() {
        window.__capturaSemFundo = true;
        try {
            const bruto = await sinastriaMontarImagem(false);
            if (!bruto) { alert('Tela não encontrada para adicionar ao relatório.'); return; }
            const canvas = recortarCanvasAoConteudo(bruto, sinastriaFundoCaptura());
            const total = adicionarCapturaRelatorio('sinastria', canvas.toDataURL('image/png'));
            alert(`"Sinastria" foi adicionado ao relatório (${total}ª imagem desta ferramenta). Gere o relatório novamente para ver essa página atualizada.`);
        } catch (err) {
            console.error('Erro ao adicionar a Sinastria ao relatório:', err);
            alert('Não foi possível adicionar esta tela ao relatório.');
        } finally {
            window.__capturaSemFundo = false;
        }
    }
    window.sinastriaAdicionarAoRelatorio = sinastriaAdicionarAoRelatorio;

    /* PONTO DE ENTRADA DO MÓDULO — chamado por abrirModuloTecnica('sinastria') (supabase.js) */
    async function iniciarModuloSinastria() {
        const container = document.getElementById('mandala-container');
        if (!container) return;

        if (typeof currentCalculatedData === 'undefined' || !currentCalculatedData || !currentCalculatedData.Ascendente) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--danger); font-family: sans-serif;">Nenhum mapa carregado no sistema.</div>`;
            return;
        }

        renderSinastriaTela(container);
    }

    window.iniciarModuloSinastria = iniciarModuloSinastria;
})();
