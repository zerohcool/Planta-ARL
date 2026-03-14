const PI = Math.PI;

export function calcularSiloMatriz({
  distanciaVacia,
  densidad = 1300,
  H1 = 4.26,
  D1 = 3.5,
  H2 = 1.67,
  d0 = 0.15,
  H3 = 0.2,
}) {
  const R1 = D1 / 2;
  const r0 = d0 / 2;
  const Htot = H1 + H2 + H3;

  const h = Math.max(0, Htot - Number(distanciaVacia || 0));

  const h1 = Math.min(Math.max(h - H3 - H2, 0), H1);
  const h2 = Math.min(Math.max(h - H3, 0), H2);
  const h3 = Math.min(h, H3);

  const V1 = PI * R1 ** 2 * h1;

  const Rh2 = r0 + (R1 - r0) * (h2 / H2);
  const V2 = (PI * h2 / 3) * (r0 ** 2 + r0 * Rh2 + Rh2 ** 2);

  const V3 = PI * r0 ** 2 * h3;

  const V1max = PI * R1 ** 2 * H1;
  const V2max = (PI * H2 / 3) * (R1 ** 2 + R1 * r0 + r0 ** 2);
  const V3max = PI * r0 ** 2 * H3;

  const Vmax = V1max + V2max + V3max;
  const Voc = V1 + V2 + V3;
  const Vvac = Math.max(0, Vmax - Voc);
  const masaKg = densidad * Voc;
  const stockTon = masaKg / 1000;
  const porcentaje = Vmax > 0 ? (Voc / Vmax) * 100 : 0;

  return {
    distanciaVacia,
    densidad,
    H1,
    D1,
    H2,
    d0,
    H3,
    R1,
    r0,
    Htot,
    h,
    h1,
    h2,
    h3,
    V1,
    V2,
    V3,
    Vmax,
    Voc,
    Vvac,
    masaKg,
    stockTon,
    porcentaje,
  };
}