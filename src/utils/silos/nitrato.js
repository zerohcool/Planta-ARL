// ========================================
// UTILIDAD DE CÁLCULO PARA SILO NITRATO
// ========================================
// Esta función replica la lógica geométrica del silo tipo nitrato
// usando únicamente interpolación lineal simple, tal como indicaste
// que se utiliza en la planilla Excel.
//
// Estructura del silo:
// 1) Pirámide superior
// 2) Prisma rectangular
// 3) Pirámide truncada invertida
// 4) Pirámide truncada invertida doble
//
// La medición ingresada es la distancia vacía desde arriba.
// A partir de eso se calcula la altura ocupada desde abajo.
//
// Importante:
// - NO se usa interpolación lineal con h/2
// - SÍ se usa interpolación lineal simple para lados variables
// - Las fórmulas de volumen parcial siguen la lógica de tronco geométrico

export function calcularSiloNitrato({
  // Medición ingresada por el usuario: distancia vacía
  distanciaVacia,

  // Densidad del material en kg/m³
  densidad = 770,

  // Alturas de cada sección
  h1 = 0.5, // pirámide superior
  h2 = 5.8, // prisma rectangular
  h3 = 0.8, // pirámide truncada invertida
  h4 = 1.3, // pirámide truncada invertida doble

  // Sección 1 y 2: dimensiones superiores/base rectangular grande
  A1 = 3.4,
  B1 = 3.4,

  // Sección 3: base inferior de la pirámide truncada invertida
  a3 = 2.88,
  b3 = 2.21,

  // Sección 4: parte superior de la pirámide doble
  A4 = 1.44,
  B4 = 2.21,

  // Sección 4: base pequeña inferior
  a4 = 0.14,
  b4 = 0.14,
}) {
  // ========================================
  // ALTURAS TOTALES
  // ========================================
  // Altura total del silo
  const Htot = h1 + h2 + h3 + h4;

  // Altura ocupada por material, medida desde abajo hacia arriba
  const Hoc = Math.max(0, Htot - Number(distanciaVacia || 0));

  // ========================================
  // ALTURAS OCUPADAS POR CADA SECCIÓN
  // ========================================
  // Se reparte la altura ocupada total en las distintas secciones
  // desde abajo hacia arriba.
  //
  // hoc1 = material dentro de la pirámide superior
  // hoc2 = material dentro del prisma rectangular
  // hoc3 = material dentro de la pirámide truncada invertida
  // hoc4 = material dentro de la pirámide truncada invertida doble

  const hoc1 = Math.min(Math.max(Hoc - h4 - h3 - h2, 0), h1);
  const hoc2 = Math.min(Math.max(Hoc - h4 - h3, 0), h2);
  const hoc3 = Math.min(Math.max(Hoc - h4, 0), h3);
  const hoc4 = Math.min(Hoc, h4);

  // ========================================
  // SECCIÓN 1: PIRÁMIDE SUPERIOR
  // ========================================
  // Fórmula:
  // V = (1/3) * A_base * h
  const areaBase1 = A1 * B1;
  const V1 = (1 / 3) * areaBase1 * hoc1;

  // ========================================
  // SECCIÓN 2: PRISMA RECTANGULAR
  // ========================================
  // Fórmula:
  // V = A_base * h
  const areaBase2 = A1 * B1;
  const V2 = areaBase2 * hoc2;

  // ========================================
  // SECCIÓN 3: PIRÁMIDE TRUNCADA INVERTIDA
  // ========================================
  // Se usa interpolación lineal simple para obtener los lados
  // correspondientes a la altura ocupada hoc3.
  //
  // Fórmulas tipo Excel:
  // a(h) = a + (A - a) * h/H
  // b(h) = b + (B - b) * h/H

  const a3h = a3 + (A1 - a3) * (hoc3 / h3);
  const b3h = b3 + (B1 - b3) * (hoc3 / h3);

  // Área superior a la altura ocupada
  const areaSuperior3 = a3h * b3h;

  // Área inferior fija
  const areaInferior3 = a3 * b3;

  // Fórmula del tronco de pirámide:
  // V = h/3 * (A1 + A2 + sqrt(A1*A2))
  const V3 =
    hoc3 > 0
      ? (hoc3 / 3) *
        (areaSuperior3 + areaInferior3 + Math.sqrt(areaSuperior3 * areaInferior3))
      : 0;

  // ========================================
  // SECCIÓN 4: PIRÁMIDE TRUNCADA INVERTIDA DOBLE
  // ========================================
  // También se usa interpolación lineal simple, SIN usar h/2.
  //
  // Se asume que el volumen total corresponde a dos cuerpos iguales,
  // por eso al final se multiplica por 2.

  const a4h = a4 + (A4 - a4) * (hoc4 / h4);
  const b4h = b4 + (B4 - b4) * (hoc4 / h4);

  // Área superior interpolada
  const areaSuperior4 = a4h * b4h;

  // Área inferior fija
  const areaInferior4 = a4 * b4;

  // Fórmula de tronco de pirámide simple, multiplicado por 2
  // para representar la geometría doble del silo.
  const V4 =
    hoc4 > 0
      ? 2 *
        ((hoc4 / 3) *
          (areaSuperior4 + areaInferior4 + Math.sqrt(areaSuperior4 * areaInferior4)))
      : 0;

  // ========================================
  // VOLÚMENES MÁXIMOS POR SECCIÓN
  // ========================================
  // Se calculan las capacidades máximas de cada sección
  // usando la misma lógica geométrica completa.

  const V1max = (1 / 3) * areaBase1 * h1;

  const V2max = areaBase2 * h2;

  const areaSuperior3Max = A1 * B1;
  const areaInferior3Max = a3 * b3;
  const V3max =
    (h3 / 3) *
    (areaSuperior3Max +
      areaInferior3Max +
      Math.sqrt(areaSuperior3Max * areaInferior3Max));

  const areaSuperior4Max = A4 * B4;
  const areaInferior4Max = a4 * b4;
  const V4max =
    2 *
    ((h4 / 3) *
      (areaSuperior4Max +
        areaInferior4Max +
        Math.sqrt(areaSuperior4Max * areaInferior4Max)));

  // ========================================
  // TOTALES
  // ========================================
  // Volumen máximo del silo
  const Vmax = V1max + V2max + V3max + V4max;

  // Volumen ocupado por material
  const Voc = V1 + V2 + V3 + V4;

  // Volumen libre
  const Vvac = Math.max(0, Vmax - Voc);

  // Masa ocupada en kg
  const masaKg = densidad * Voc;

  // Masa disponible en kg
  const masaDisponibleKg = densidad * Vvac;

  // Stock en toneladas
  const stockTon = masaKg / 1000;

  // Capacidad disponible en toneladas
  const capacidadDisponibleTon = masaDisponibleKg / 1000;

  // Porcentaje ocupado del silo
  const porcentaje = Vmax > 0 ? (Voc / Vmax) * 100 : 0;

  // ========================================
  // RETORNO DE RESULTADOS
  // ========================================
  return {
    distanciaVacia,
    densidad,

    // Parámetros geométricos
    h1,
    h2,
    h3,
    h4,
    Htot,

    // Alturas ocupadas
    Hoc,
    hoc1,
    hoc2,
    hoc3,
    hoc4,

    // Interpolaciones útiles para depurar
    a3h,
    b3h,
    a4h,
    b4h,

    // Volúmenes parciales
    V1,
    V2,
    V3,
    V4,

    // Volúmenes totales
    Vmax,
    Voc,
    Vvac,

    // Masas
    masaKg,
    masaDisponibleKg,

    // Resultados finales
    stockTon,
    capacidadDisponibleTon,
    porcentaje,
  };
}