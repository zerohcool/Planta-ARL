export function calcularSiloNitrato({
  distanciaVacia,
  densidad = 770,
  h1 = 0.5,
  h2 = 5.8,
  h3 = 0.8,
  h4 = 1.3,
  A1 = 3.4,
  B1 = 3.4,
  a3 = 2.88,
  b3 = 2.21,
  A4 = 1.44,
  B4 = 2.21,
  a4 = 0.14,
  b4 = 0.14,
}) {
  const Htot = h1 + h2 + h3 + h4;
  const Hoc = Math.max(0, Htot - Number(distanciaVacia || 0));

  const hoc1 = Math.min(Math.max(Hoc - h4 - h3 - h2, 0), h1);
  const hoc2 = Math.min(Math.max(Hoc - h4 - h3, 0), h2);
  const hoc3 = Math.min(Math.max(Hoc - h4, 0), h3);
  const hoc4 = Math.min(Hoc, h4);

  const areaBase1 = A1 * B1;
  const V1 = (1 / 3) * areaBase1 * hoc1;

  const areaBase2 = A1 * B1;
  const V2 = areaBase2 * hoc2;

  const a3h = a3 + (A1 - a3) * (hoc3 / h3);
  const b3h = b3 + (B1 - b3) * (hoc3 / h3);
  const areaSuperior3 = a3h * b3h;
  const areaInferior3 = a3 * b3;
  const V3 =
    hoc3 > 0
      ? (hoc3 / 3) *
        (areaSuperior3 + areaInferior3 + Math.sqrt(areaSuperior3 * areaInferior3))
      : 0;

  const a4h = a4 + (A4 - a4) * (hoc4 / h4);
  const b4h = b4 + (B4 - b4) * (hoc4 / h4);
  const areaSuperior4 = a4h * b4h;
  const areaInferior4 = a4 * b4;
  const V4 =
    hoc4 > 0
      ? 2 *
        ((hoc4 / 6) *
          (areaSuperior4 + 4 * ((a4h / 2) * (b4h / 2)) + areaInferior4))
      : 0;

  const V1max = (1 / 3) * areaBase1 * h1;
  const V2max = areaBase2 * h2;
  const V3max =
    (h3 / 3) * (A1 * B1 + a3 * b3 + Math.sqrt(A1 * B1 * a3 * b3));
  const V4max =
    2 *
    ((h4 / 6) * (A4 * B4 + 4 * ((A4 / 2) * (B4 / 2)) + a4 * b4));

  const Vmax = V1max + V2max + V3max + V4max;
  const Voc = V1 + V2 + V3 + V4;
  const Vvac = Math.max(0, Vmax - Voc);
  const masaKg = densidad * Voc;
  const stockTon = masaKg / 1000;
  const porcentaje = Vmax > 0 ? (Voc / Vmax) * 100 : 0;

  return {
    distanciaVacia,
    densidad,
    h1,
    h2,
    h3,
    h4,
    Htot,
    Hoc,
    hoc1,
    hoc2,
    hoc3,
    hoc4,
    V1,
    V2,
    V3,
    V4,
    Vmax,
    Voc,
    Vvac,
    masaKg,
    stockTon,
    porcentaje,
  };
}