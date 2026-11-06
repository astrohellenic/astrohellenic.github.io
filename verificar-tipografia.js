/* Guarda da tipografia (06/11/2026). Rodar: node verificar-tipografia.js
   A fonte de cada texto é decidida SÓ em tipografia.css. Este script falha se achar Cinzel, Montserrat, Caveat ou Architects escritos soltos em
   página, script ou CSS que não esteja na lista de exceções. Texto novo: use a classe do papel em tipografia.css, nunca font-family no estilo. */
const fs = require('fs'), path = require('path');
const EXCECOES = {
  'tipografia.css': 'a regra em si',
  'temas.css': 'comentário histórico do Sulfite',
  'relatorio.js': 'relatório: documento/PDF autônomo (não tem o tipografia.css), segue os mesmos papéis', 'retificacao-relatorio.js': 'relatório da retificação (PDF), mesmos papéis',
  'financeiro.js': 'relatório do Financeiro (PDF), mesmos papéis',
  'mandala.js': 'textos dentro de SVG/PNG: usam Cinzel (título) e Architects Daughter (resto), embutidas na imagem por aplicarFonteSVG',
  'roda.js': 'textos dentro do SVG da roda', 'papiro.js': 'troca de fonte nas imagens salvas',
  'lotes-calculadora.js': 'texto em SVG/imagem', 'liberacao.js': 'texto em SVG/imagem', 'profeccao.js': 'texto em SVG/imagem',
  'sinastria.js': 'texto em SVG/imagem', 'horas.js': 'texto em SVG/imagem', 'direcoes.js': 'texto em SVG/imagem',
  'matrizVisibilidade.js': 'texto em SVG', 'tabelaTecnica.js': 'texto em SVG',
  'fontes-imagem.js': 'dados das fontes embutidas nas imagens', 'tz-lookup.js': 'biblioteca de fuso (dados)',
  'dialogos.js': 'janela de impressão (documento à parte)'
};
const ERRO = /Cinzel|Montserrat|Caveat|Architects/;
let achou = 0;
const ign = new Set(['node_modules', '.git', 'docs']);
(function ler(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f); const st = fs.statSync(p);
    if (st.isDirectory()) { if (!ign.has(f)) ler(p); continue; }
    if (!/\.(html|js|css)$/.test(f) || f === 'verificar-tipografia.js' || EXCECOES[f]) continue;
    fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
      if (/fonts\.googleapis/.test(l)) return;
      if (/^\s*(\/\*|\*)/.test(l)) return; /* comentário */
      if (ERRO.test(l)) { achou++; console.log(p + ':' + (i + 1) + '  ' + l.trim().slice(0, 140)); }
    });
  }
})('.');
console.log(achou ? '\n' + achou + ' lugar(es) com fonte solta. Use a classe do papel em tipografia.css.' : 'Tipografia OK: nenhuma fonte solta.');
process.exit(achou ? 1 : 0);
