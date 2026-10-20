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

  // Distancia vacía cuando el silo está al 100% de capacidad operativa (cono de nitrato bajo escotilla)
  medicionLleno = 0.4,

  // Alturas de cada sección
  h1 = 0.5, // pirámide superior (distancia vacía cuando esta sección se vacía completamente)
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
  // Altura total de secciones inferiores (prisma y pirámides inferiores)
  const Hinf = h2 + h3 + h4;
  // Altura total del silo
  const Htot = h1 + Hinf;

  // Medición numérica de distancia vacía
  const dist = Number(distanciaVacia || 0);

  // ========================================
  // VOLÚMENES MÁXIMOS POR SECCIÓN
  // ========================================
  // Se calculan las capacidades máximas de cada sección
  // usando la misma lógica geométrica completa.

  const areaBase1 = A1 * B1;
  const V1max = (1 / 3) * areaBase1 * h1;

  const areaBase2 = A1 * B1;
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

  // Volumen máximo total del silo
  const Vmax = V1max + V2max + V3max + V4max;

  // ========================================
  // SECCIÓN 1: PIRÁMIDE SUPERIOR
  // ========================================
  // El nitrato forma un cono/pirámide natural de apilamiento bajo el punto central de llenado.
  // Por la posición descentrada de la escotilla de medición:
  // - A dist <= medicionLleno (0.40 m): el silo está al 100% de su capacidad.
  // - A dist >= h1 (0.50 m): la pirámide superior se ha vaciado (material a ras de sección 2).
  // - Entre 0.40 m y 0.50 m: la pirámide se vacía de forma proporcional.
  let fraccion1 = 0;
  if (dist <= medicionLleno) {
    fraccion1 = 1;
  } else if (dist < h1) {
    fraccion1 = (h1 - dist) / (h1 - medicionLleno);
  } else {
    fraccion1 = 0;
  }

  const V1 = V1max * fraccion1;
  const hoc1 = h1 * fraccion1;

  // ========================================
  // SECCIONES INFERIORES: 2, 3 Y 4
  // ========================================
  // La distancia vacía dentro de las secciones inferiores se mide a partir de la base de h1 hacia abajo
  const distanciaInf = Math.max(0, dist - h1);
  const HocInf = Math.max(0, Hinf - distanciaInf);

  const hoc2 = Math.min(Math.max(HocInf - h4 - h3, 0), h2);
  const hoc3 = Math.min(Math.max(HocInf - h4, 0), h3);
  const hoc4 = Math.min(HocInf, h4);
  const Hoc = hoc1 + HocInf;

  // ========================================
  // SECCIÓN 2: PRISMA RECTANGULAR
  // ========================================
  // Fórmula:
  // V = A_base * h
  const V2 = areaBase2 * hoc2;

  // ========================================
  // SECCIÓN 3: PIRÁMIDE TRUNCADA INVERTIDA
  // ========================================
  // Se usa interpolación lineal simple para obtener los lados
  // correspondientes a la altura ocupada hoc3.
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
  // TOTALES
  // ========================================
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
    medicionLleno,

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

    // Volúmenes máximos
    V1max,
    V2max,
    V3max,
    V4max,

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