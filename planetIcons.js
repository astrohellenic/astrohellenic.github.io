/* ==========================================
   ESTILO GLOBAL DOS ÍCONES DOS 7 PLANETAS
   (Configurável em Configurações > Aparência:
   "Planetas Ícones Simples" ou "Planetas Ícones
   Esféricos"). Este arquivo precisa ser carregado
   antes de mandala.js, tabelaTecnica.js, decenios.js,
   direcoes.js, profeccao.js e horas.js.
   ========================================== */

const PLANET_GLYPHS_SIMPLES = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄"
};

/* true = ícones esféricos 3D | false (padrão) = ícones simples (glifo) */
function estiloPlanetasEsferico() {
  return (typeof window.estiloPlanetas !== 'undefined' ? window.estiloPlanetas : 'simples') === 'esferico';
}

/* Ícone simples pronto para uso em tabelas/cabeçalhos (tag <svg> completa) */
function getPlanetSimpleSVG(planetId, size = 34) {
  const symbol = PLANET_GLYPHS_SIMPLES[planetId] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;"><text x="50" y="72" font-size="76" font-weight="900" fill="#c59b27" text-anchor="middle">${symbol}</text></svg>`;
}

/* Mesmo ícone simples, mas como fragmento <g> para ser embutido dentro de um <svg> já existente (usado na mandala) */
function getPlanetSimpleFragment(planetId) {
  const symbol = PLANET_GLYPHS_SIMPLES[planetId] || '';
  return `<g><text x="50" y="72" font-size="76" font-weight="900" fill="#c59b27" text-anchor="middle">${symbol}</text></g>`;
}
