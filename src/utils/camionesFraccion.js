// ========================================
// UTILIDAD: CONVERSIÓN A CAMIONES DE MATERIAS PRIMAS (MEDIA 25 TON)
// ========================================

export const TON_MEDIA_CAMION = 25;

/**
 * Convierte una cantidad de toneladas en cantidad de camiones de 25 toneladas,
 * formateado como número entero y fracción de cuartos (ej: 2, 2 1/4, 2 1/2, 2 3/4).
 * @param {number|string} toneladas - Cantidad en toneladas
 * @param {number} tonPorCamion - Media de toneladas por camión (por defecto 25)
 * @returns {string} - Cadena formateada, ej: "2 1/2"
 */
export function formatearCamionesFraccion(toneladas, tonPorCamion = TON_MEDIA_CAMION) {
  const ton = Math.max(0, Number(toneladas) || 0);
  if (ton === 0) return "0";

  const camiones = ton / tonPorCamion;
  const cuartosTotales = Math.round(camiones * 4);

  if (cuartosTotales === 0) {
    return "< 1/4";
  }

  const enteros = Math.floor(cuartosTotales / 4);
  const restoCuartos = cuartosTotales % 4;

  let fraccion = "";
  if (restoCuartos === 1) fraccion = "1/4";
  else if (restoCuartos === 2) fraccion = "1/2";
  else if (restoCuartos === 3) fraccion = "3/4";

  if (enteros > 0 && fraccion) {
    return `${enteros} ${fraccion}`;
  }
  if (enteros > 0 && !fraccion) {
    return `${enteros}`;
  }
  return fraccion;
}
