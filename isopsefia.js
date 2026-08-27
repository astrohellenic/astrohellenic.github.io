<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hermes Workstation - Isopsefia Helenística</title>
    <!-- Tailwind CSS para estilização -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React e Babel via CDN -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Importação da Fonte Cinzel Bold e Inter do Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        .font-cinzel {
            font-family: 'Cinzel', serif;
        }

        /* RESET E REMOÇÃO COMPLETA DA BARRA LATERAL E COLUNAS DO BLOGGER */
        #sidebar-wrapper, 
        #sidebar, 
        .sidebar-container, 
        .sidebar, 
        aside, 
        .widget-area, 
        .sidebar-wrapper, 
        .navigation-drawer, 
        .drawer-container,
        .sidebar-back,
        .dimmer,
        .column-right-outer,
        .column-left-outer {
            display: none !important;
            width: 0 !important;
            max-width: 0 !important;
            flex: 0 0 0 !important;
            visibility: hidden !important;
        }

        #main-wrapper, 
        #main, 
        .main-outer, 
        .content-outer, 
        .main-inner, 
        .post-outer, 
        .page, 
        .post, 
        .article, 
        .content-inner, 
        .region-inner, 
        .columns-inner, 
        .centered,
        .column-center-outer,
        .column-center-inner,
        .blog-posts,
        .post-body,
        .entry-content,
        [role="main"] {
            width: 100% !important;
            max-width: 100% !important;
            float: none !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            flex: 1 1 100% !important;
            grid-template-columns: 1fr !important;
        }

        /* CENTRALIZA O APLICATIVO NA TELA */
        #root {
            width: 100% !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
        }

        /* Efeitos Metalizados Personalizados */
        .bg-white-metallic {
            background: linear-gradient(135deg, #ffffff 0%, #e8ecf1 40%, #f4f6f9 70%, #dbe0e8 100%);
        }

        .bg-black-metallic {
            background: linear-gradient(135deg, #2b2e35 0%, #121316 50%, #1a1c22 100%);
        }

        .bg-gold-metallic {
            background: linear-gradient(135deg, #d4af37 0%, #f7e08b 35%, #b89028 70%, #e5c158 100%);
        }

        .bg-gold-metallic-hover:hover {
            background: linear-gradient(135deg, #e5c158 0%, #fff0b3 35%, #c89e2c 70%, #f0d36b 100%);
        }

        .bg-blue-metallic {
            background: linear-gradient(135deg, #1080c5 0%, #3aa0e3 40%, #0d588e 80%, #166ba8 100%);
        }

        .text-gold-metallic {
            background: linear-gradient(135deg, #a3801a 0%, #d4af37 50%, #8a6810 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .text-blue-metallic {
            background: linear-gradient(135deg, #0d588e 0%, #1080c5 50%, #083c63 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .text-black-metallic {
            color: #121316;
        }

        .shimmer-card {
            box-shadow: 0 4px 20px -2px rgba(18, 19, 22, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
        }
    </style>
</head>
<body class="bg-white-metallic text-slate-900 min-h-screen selection:bg-amber-300 selection:text-amber-950">

    <div id="root"></div>

    <script type="text/babel">
        const { useState, useMemo } = React;

        const ZODIACO = [
            "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
            "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
        ];

        const MAPA_FONETICO = {
            'a': { grego: 'α', nome: 'Alpha', valor: 1 },
            'á': { grego: 'α', nome: 'Alpha', valor: 1 },
            'â': { grego: 'α', nome: 'Alpha', valor: 1 },
            'ã': { grego: 'α', nome: 'Alpha', valor: 1 },
            'à': { grego: 'α', nome: 'Alpha', valor: 1 },
            'b': { grego: 'β', nome: 'Beta', valor: 2 },
            'v': { grego: 'β', nome: 'Beta', valor: 2 },
            'g': { grego: 'γ', nome: 'Gamma', valor: 3 },
            'j': { grego: 'γ', nome: 'Gamma', valor: 3 },
            'd': { grego: 'δ', nome: 'Delta', valor: 4 },
            'e': { grego: 'ε', nome: 'Epsilon', valor: 5 },
            'é': { grego: 'ε', nome: 'Epsilon', valor: 5 },
            'ê': { grego: 'ε', nome: 'Epsilon', valor: 5 },
            'z': { grego: 'ζ', nome: 'Zeta', valor: 7 },
            'h': { grego: 'η', nome: 'Eta', valor: 8 },
            'i': { grego: 'ι', nome: 'Iota', valor: 10 },
            'í': { grego: 'ι', nome: 'Iota', valor: 10 },
            'y': { grego: 'ι', nome: 'Iota', valor: 10 },
            'k': { grego: 'κ', nome: 'Kappa', valor: 20 },
            'c': { grego: 'κ', nome: 'Kappa', valor: 20 },
            'q': { grego: 'κ', nome: 'Kappa', valor: 20 },
            'l': { grego: 'λ', nome: 'Lambda', valor: 30 },
            'm': { grego: 'μ', nome: 'Mu', valor: 40 },
            'n': { grego: 'ν', nome: 'Nu', valor: 50 },
            'x': { grego: 'ξ', nome: 'Xi', valor: 60 },
            'o': { grego: 'ο', nome: 'Omicron', valor: 70 },
            'ó': { grego: 'ο', nome: 'Omicron', valor: 70 },
            'ô': { grego: 'ο', nome: 'Omicron', valor: 70 },
            'õ': { grego: 'ο', nome: 'Omicron', valor: 70 },
            'p': { grego: 'π', nome: 'Pi', valor: 80 },
            'r': { grego: 'ρ', nome: 'Rho', valor: 100 },
            's': { grego: 'σ', nome: 'Sigma', valor: 200 },
            'ç': { grego: 'σ', nome: 'Sigma', valor: 200 },
            't': { grego: 'τ', nome: 'Tau', valor: 300 },
            'u': { grego: 'υ', nome: 'Upsilon', valor: 400 },
            'ú': { grego: 'υ', nome: 'Upsilon', valor: 400 },
            'û': { grego: 'υ', nome: 'Upsilon', valor: 400 },
            'f': { grego: 'φ', nome: 'Phi', valor: 500 },
            'w': { grego: 'ω', nome: 'Omega', valor: 800 }
        };

        const DIGRAMAS = {
            'th': { grego: 'θ', nome: 'Theta', valor: 9 },
            'ph': { grego: 'φ', nome: 'Phi', valor: 500 },
            'ps': { grego: 'ψ', nome: 'Psi', valor: 700 },
            'ch': { grego: 'χ', nome: 'Chi', valor: 600 }
        };

        function calcularIsopsefia(texto) {
            if (!texto) return { bruto: 0, resto: 0, grego: '', passos: [] };
            const normalizado = texto.toLowerCase();
            const passos = [];
            let i = 0;
            let bruto = 0;
            let stringGrega = '';

            while (i < normalizado.length) {
                const charAtual = normalizado[i];
                const proximoChar = normalizado[i + 1] || '';
                const par = charAtual + proximoChar;

                if (DIGRAMAS[par]) {
                    const match = DIGRAMAS[par];
                    bruto += match.valor;
                    stringGrega += match.grego;
                    passos.push({ letra: par.toUpperCase(), grego: match.grego, nome: match.nome, valor: match.valor });
                    i += 2;
                } else if (MAPA_FONETICO[charAtual]) {
                    const match = MAPA_FONETICO[charAtual];
                    bruto += match.valor;
                    stringGrega += match.grego;
                    passos.push({ letra: charAtual.toUpperCase(), grego: match.grego, nome: match.nome, valor: match.valor });
                    i++;
                } else {
                    if (charAtual !== ' ') {
                        passos.push({ letra: charAtual.toUpperCase(), grego: '?', nome: 'Desconhecido', valor: 0 });
                    }
                    i++;
                }
            }

            const divisaoInteira = Math.floor(bruto / 12);
            let resto = bruto % 12;
            if (resto === 0 && bruto > 0) {
                resto = 12;
            }

            return { bruto, resto, grego: stringGrega, passos, divisaoInteira };
        }

        function App() {
            const [ascendente, setAscendente] = useState("Capricórnio");
            const [activeTab, setActiveTab] = useState("planilha");
            const [planilhaRows, setPlanilhaRows] = useState([]);
            const [novoTermoText, setNovoTermoText] = useState("");
            const [singleInput, setSingleInput] = useState("");

            const ascIndex = useMemo(() => ZODIACO.indexOf(ascendente), [ascendente]);

            const obterMapeamentoAstrologico = (resto) => {
                if (resto === 0) return { casa: '-', signo: '-' };
                const casa = resto;
                const indexSigno = (ascIndex + resto - 1) % 12;
                const signo = ZODIACO[indexSigno];
                return { casa, signo };
            };

            const handleEditRow = (id, novoTexto) => {
                setPlanilhaRows(prev => prev.map(row => row.id === id ? { ...row, texto: novoTexto } : row));
            };

            const handleAddRow = () => {
                if (!novoTermoText.trim()) return;
                setPlanilhaRows(prev => [...prev, { id: Date.now().toString(), texto: novoTermoText.trim() }]);
                setNovoTermoText("");
            };

            const handleDeleteRow = (id) => {
                setPlanilhaRows(prev => prev.filter(row => row.id !== id));
            };

            const planilhaCalculada = useMemo(() => {
                return planilhaRows.map(row => {
                    const calc = calcularIsopsefia(row.texto);
                    const astros = obterMapeamentoAstrologico(calc.resto);
                    return { ...row, ...calc, ...astros };
                });
            }, [planilhaRows, ascIndex]);

            const calculoSingle = useMemo(() => {
                const calc = calcularIsopsefia(singleInput);
                const astros = obterMapeamentoAstrologico(calc.resto);
                return { ...calc, ...astros };
            }, [singleInput, ascIndex]);

            return (
                <div className="min-h-screen bg-white-metallic text-slate-900 font-sans pb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-300/80">
                    
                    {/* CABEÇALHO */}
                    <header className="bg-black-metallic text-slate-100 shadow-xl border-b-2 border-amber-500/40 sticky top-0 z-30 px-4 md:px-6 py-4">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gold-metallic flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                                    <svg className="w-6 h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-wider uppercase text-gold-metallic">
                                        Hermes Workstation
                                    </h1>
                                    <p className="font-cinzel text-xs text-slate-400 font-semibold tracking-wider">Isopsefia & Astrologia Helenística</p>
                                </div>
                            </div>

                            {/* SELETOR DE ASCENDENTE */}
                            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-sky-500/40 shadow-inner">
                                <label className="font-cinzel text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full bg-blue-metallic inline-block"></span>
                                    Ascendente:
                                </label>
                                <select 
                                    value={ascendente} 
                                    onChange={(e) => setAscendente(e.target.value)}
                                    className="font-cinzel bg-slate-950 text-sm font-bold focus:outline-none text-slate-100 cursor-pointer rounded-lg px-2 py-1 border border-slate-700 tracking-wide"
                                >
                                    {ZODIACO.map(signo => (
                                        <option key={signo} value={signo} className="bg-slate-900 text-slate-100 font-sans">
                                            {signo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                        
                        {/* INTRODUÇÃO EXPLICATIVA */}
                        <div className="bg-white/90 p-5 md:p-6 rounded-2xl border border-slate-300 shimmer-card mb-6">
                            <h2 className="font-cinzel text-base md:text-lg font-bold text-black-metallic tracking-wide mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold-metallic"></span>
                                O que é a Isopsefia Helenística?
                            </h2>
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                                A <strong>Isopsefia</strong> (do grego <em>ísos</em> "igual" e <em>psêphos</em> "seixo/cálculo") é a técnica milenar que converte as letras em valores numéricos do alfabeto jônico clássico. Na Astrologia Helenística (conforme registrada por astrólogos como Vettius Valens), calculamos o valor total de um nome e encontramos o seu <strong>resto da divisão por 12</strong>. O resto obtido indica exatamente qual <strong>Lugar (Topos)</strong> do horóscopo é ativado por aquele nome a partir do seu Ascendente.
                            </p>
                        </div>

                        {/* ABAS DE NAVEGAÇÃO */}
                        <div className="flex border-b border-slate-300 mb-6 overflow-x-auto gap-2">
                            <button 
                                onClick={() => setActiveTab("planilha")}
                                className={`font-cinzel px-5 py-3 text-xs md:text-sm font-bold transition-all duration-200 rounded-t-xl flex items-center gap-2 shrink-0 tracking-wider ${
                                    activeTab === "planilha" 
                                        ? "bg-blue-metallic text-white shadow-lg shadow-sky-600/20" 
                                        : "bg-slate-200/60 text-slate-700 hover:bg-slate-300/80 border border-slate-300"
                                }`}
                            >
                                A Planilha de Isopsefia
                            </button>
                            <button 
                                onClick={() => setActiveTab("calculadora")}
                                className={`font-cinzel px-5 py-3 text-xs md:text-sm font-bold transition-all duration-200 rounded-t-xl flex items-center gap-2 shrink-0 tracking-wider ${
                                    activeTab === "calculadora" 
                                        ? "bg-blue-metallic text-white shadow-lg shadow-sky-600/20" 
                                        : "bg-slate-200/60 text-slate-700 hover:bg-slate-300/80 border border-slate-300"
                                }`}
                            >
                                Calculadora Passo a Passo
                            </button>
                            <button 
                                onClick={() => setActiveTab("referencia")}
                                className={`font-cinzel px-5 py-3 text-xs md:text-sm font-bold transition-all duration-200 rounded-t-xl flex items-center gap-2 shrink-0 tracking-wider ${
                                    activeTab === "referencia" 
                                        ? "bg-blue-metallic text-white shadow-lg shadow-sky-600/20" 
                                        : "bg-slate-200/60 text-slate-700 hover:bg-slate-300/80 border border-slate-300"
                                }`}
                            >
                                Tabela Jônica Clássica
                            </button>
                        </div>

                        {/* TAB 1: PLANILHA */}
                        {activeTab === "planilha" && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur p-4 md:p-5 rounded-2xl border border-slate-300/80 shimmer-card">
                                    <div>
                                        <h2 className="font-cinzel text-base md:text-lg font-bold text-black-metallic tracking-wide">Planilha de Análise Dinâmica</h2>
                                        <p className="text-xs text-slate-600">Digite qualquer nome abaixo para calcular e analisar a ativação no mapa.</p>
                                    </div>
                                    <div className="flex w-full md:w-auto gap-2">
                                        <input 
                                            type="text" 
                                            value={novoTermoText}
                                            onChange={(e) => setNovoTermoText(e.target.value)}
                                            placeholder="Digite o nome..."
                                            className="bg-white px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64 shadow-inner"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddRow()}
                                        />
                                        
                                        <button 
                                            onClick={handleAddRow}
                                            className="font-cinzel bg-gold-metallic bg-gold-metallic-hover text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-md shadow-amber-500/20"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto border border-slate-300/80 rounded-2xl bg-white/90 backdrop-blur shimmer-card w-full">
                                    <table className="w-full text-left border-collapse min-w-[680px]">
                                        <thead>
                                            <tr className="bg-black-metallic text-slate-200 font-cinzel text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                                                <th className="py-4 px-4 whitespace-nowrap">Termo / Nome Latino</th>
                                                <th className="py-4 px-4 whitespace-nowrap">Transliteração Grega</th>
                                                <th className="py-4 px-4 text-right whitespace-nowrap">Soma Bruta</th>
                                                <th className="py-4 px-4 text-center whitespace-nowrap">Fórmula do Resto</th>
                                                <th className="py-4 px-4 text-center whitespace-nowrap">Resto (Topos)</th>
                                                <th className="py-4 px-4 text-center whitespace-nowrap">Signo Ativado</th>
                                                <th className="py-4 px-4 text-center whitespace-nowrap">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 text-sm">
                                            {planilhaCalculada.length > 0 ? (
                                                planilhaCalculada.map((row) => (
                                                    <tr key={row.id} className="hover:bg-slate-100/80 transition-colors">
                                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                                            <input 
                                                                type="text" 
                                                                value={row.texto}
                                                                onChange={(e) => handleEditRow(row.id, e.target.value)}
                                                                className="bg-transparent text-slate-900 font-bold focus:bg-white focus:px-2 focus:py-1 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-full transition-all"
                                                            />
                                                        </td>
                                                        <td className="py-3.5 px-4 font-serif text-lg text-slate-800 font-bold whitespace-nowrap">
                                                            {row.grego || <span className="text-xs text-slate-400 italic font-sans">vazio</span>}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-blue-metallic text-base whitespace-nowrap">
                                                            {row.bruto}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 whitespace-nowrap">
                                                            {row.bruto > 0 ? (
                                                                <span>
                                                                    {row.bruto} - (12 × {row.divisaoInteira}) = <strong className="text-slate-900 font-bold">{row.resto}</strong>
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        
                                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                            {row.resto > 0 ? (
                                                                <span className="font-cinzel inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-gold-metallic text-slate-950 shadow-sm tracking-wide">
                                                                    {row.resto}º Topos
                                                                </span>
                                                            ) : '-'}
                                                        </td>

                                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                            {row.signo !== '-' ? (
                                                                <span className="font-cinzel px-3 py-1 rounded-lg text-xs font-bold bg-blue-metallic text-white shadow-sm inline-block tracking-wide">
                                                                    {row.signo}
                                                                </span>
                                                            ) : '-'}
                                                        </td>

                                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                            <button 
                                                                onClick={() => handleDeleteRow(row.id)}
                                                                className="font-cinzel text-red-600 hover:text-red-800 font-bold p-1 rounded hover:bg-red-50 transition-all text-xs tracking-wider"
                                                            >
                                                                Excluir
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                                                        Sua planilha está vazia. Digite um nome no campo acima e clique em <strong className="text-slate-800">Adicionar</strong>.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CALCULADORA PASSO A PASSO */}
                        {activeTab === "calculadora" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white/90 p-5 md:p-6 rounded-2xl border border-slate-300 shimmer-card space-y-4">
                                        <h2 className="font-cinzel text-lg font-bold text-black-metallic tracking-wide">Calculadora Detalhada de Isopsefia</h2>
                                        <div className="space-y-1">
                                            <label className="font-cinzel text-xs text-slate-600 font-bold uppercase tracking-wider">Digite o nome para analisar:</label>
                                            <input 
                                                type="text" 
                                                value={singleInput}
                                                onChange={(e) => setSingleInput(e.target.value)}
                                                placeholder="Ex: Digite o nome..."
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white/90 shimmer-card">
                                        <div className="bg-black-metallic px-6 py-4 border-b border-slate-800">
                                            <h3 className="font-cinzel text-sm font-bold text-slate-100 tracking-wide">Decomposição Fonética Letra por Letra</h3>
                                        </div>
                                        {calculoSingle.passos.length > 0 ? (
                                            <div className="divide-y divide-slate-200">
                                                {calculoSingle.passos.map((passo, idx) => (
                                                    <div key={idx} className="px-6 py-3.5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-cinzel w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-800 shadow-sm">
                                                                {passo.letra}
                                                            </span>
                                                            <span className="text-slate-500 font-medium">translitera para</span>
                                                            <span className="font-serif text-xl font-bold text-blue-metallic w-6 text-center">{passo.grego}</span>
                                                            <span className="font-cinzel text-xs text-slate-500 font-bold">({passo.nome})</span>
                                                        </div>
                                                        <div className="font-mono font-bold text-slate-900 text-base">
                                                            + {passo.valor}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-6 py-12 text-center text-slate-500 font-medium">
                                                Digite um nome no campo acima para visualizar a decomposição completa.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-black-metallic p-6 rounded-2xl border-2 border-amber-500/40 text-center space-y-6 relative overflow-hidden shadow-xl text-slate-100">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-metallic"></div>
                                        <div>
                                            <h3 className="font-cinzel text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">Palavra em Grego</h3>
                                            <p className="font-serif text-3xl font-extrabold text-slate-100 tracking-wide">{calculoSingle.grego || '-'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                                                <span className="font-cinzel text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">Soma Bruta</span>
                                                <span className="font-mono text-2xl font-black text-blue-metallic">{calculoSingle.bruto}</span>
                                            </div>
                                            
                                            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                                                <span className="font-cinzel text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">Resto por 12</span>
                                                <span className="font-mono text-2xl font-black text-gold-metallic">{calculoSingle.resto || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2">
                                            <span className="font-cinzel text-[10px] uppercase tracking-wider text-amber-400 block font-bold">Equação de Valens:</span>
                                            <p className="font-mono text-xs text-slate-300">
                                                {calculoSingle.bruto} ÷ 12 = {calculoSingle.divisaoInteira}
                                            </p>
                                            <p className="font-mono text-xs text-slate-300">
                                                {calculoSingle.bruto} - (12 × {calculoSingle.divisaoInteira}) = <strong className="text-amber-400 font-bold">{calculoSingle.resto}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white/90 p-6 rounded-2xl border border-slate-300 shimmer-card space-y-4">
                                        <h3 className="font-cinzel text-xs uppercase tracking-wider text-slate-600 font-bold">Ativação no Horóscopo</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-slate-200">
                                                <span className="text-sm text-slate-600 font-medium">Ascendente de Referência:</span>
                                                <span className="font-cinzel text-sm font-bold text-slate-900">{ascendente}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-200">
                                                <span className="text-sm text-slate-600 font-medium">Ativação no Horóscopo:</span>
                                                <span className="font-cinzel text-sm font-bold text-gold-metallic">{calculoSingle.resto > 0 ? `${calculoSingle.resto}º Topos` : '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-slate-600 font-medium">Signo Ativado:</span>
                                                <span className="font-cinzel text-sm font-bold text-blue-metallic">{calculoSingle.signo}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: REFERÊNCIA */}
                        {activeTab === "referencia" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(MAPA_FONETICO).reduce((acc, [latino, dados]) => {
                                    if (!acc.find(item => item.grego === dados.grego)) {
                                        acc.push({ ...dados, latino: latino.toUpperCase() });
                                    }
                                    return acc;
                                }, []).map((item, idx) => (
                                    <div key={idx} className="bg-white/90 p-4 rounded-2xl border border-slate-300 flex items-center justify-between shimmer-card">
                                        <div className="flex items-center gap-3">
                                            <div className="font-cinzel w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-800">
                                                {item.latino}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-serif text-xl font-bold text-slate-900">{item.grego}</span>
                                                <span className="font-cinzel text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.nome}</span>
                                            </div>
                                        </div>
                                        <div className="font-mono font-black text-slate-950 bg-gold-metallic px-3 py-1 rounded-lg text-sm shadow-sm">
                                            {item.valor}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>

