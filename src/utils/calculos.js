export function obtenerLitrosDesdeAltura(tabla, alturaIngresada) {
  if (
    alturaIngresada === "" ||
    alturaIngresada === null ||
    alturaIngresada === undefined
  ) {
    return 0;
  }

  const altura = Number(alturaIngresada);

  if (!tabla || tabla.length === 0) return 0;
  if (isNaN(altura) || altura < 0) return 0;

  // Coincidencia exacta
  const filaExacta = tabla.find((item) => item.altura === altura);
  if (filaExacta) return filaExacta.litros;

  // Si la altura es menor o igual al primer registro de aforo
  if (altura <= tabla[0].altura) {
    return tabla[0].litros;
  }

  // Si la altura supera o iguala el aforo máximo registrado
  const ultimoPunto = tabla[tabla.length - 1];
  if (altura >= ultimoPunto.altura) {
    return ultimoPunto.litros;
  }

  // Interpolación lineal entre cotas adyacentes
  for (let i = 0; i < tabla.length - 1; i++) {
    const p0 = tabla[i];
    const p1 = tabla[i + 1];

    if (altura > p0.altura && altura < p1.altura) {
      const deltaAltura = p1.altura - p0.altura;
      if (deltaAltura === 0) return p0.litros;

      const factor = (altura - p0.altura) / deltaAltura;
      const litrosInterpolados = p0.litros + factor * (p1.litros - p0.litros);
      return Math.round(litrosInterpolados);
    }
  }

  return 0;
}

export function obtenerAlturaDesdeLitros(tabla, litrosIngresados) {
  if (
    litrosIngresados === "" ||
    litrosIngresados === null ||
    litrosIngresados === undefined
  ) {
    return 0;
  }

  const litros = Number(litrosIngresados);

  if (!tabla || tabla.length === 0) return 0;
  if (isNaN(litros) || litros <= 0) return 0;

  // Coincidencia exacta
  const filaExacta = tabla.find((item) => item.litros === litros);
  if (filaExacta) return filaExacta.altura;

  // Si los litros son menores o iguales al primer punto
  if (litros <= tabla[0].litros) {
    return tabla[0].altura;
  }

  // Si los litros superan o igualan el aforo máximo
  const ultimoPunto = tabla[tabla.length - 1];
  if (litros >= ultimoPunto.litros) {
    return ultimoPunto.altura;
  }

  // Interpolación lineal entre cotas de litros adyacentes
  for (let i = 0; i < tabla.length - 1; i++) {
    const p0 = tabla[i];
    const p1 = tabla[i + 1];

    if (litros > p0.litros && litros < p1.litros) {
      const deltaLitros = p1.litros - p0.litros;
      if (deltaLitros === 0) return p0.altura;

      const factor = (litros - p0.litros) / deltaLitros;
      const alturaInterpolada = p0.altura + factor * (p1.altura - p0.altura);
      return Math.round(alturaInterpolada);
    }
  }

  return 0;
}

export function parsearCSVCalibracion(textoCSV) {
  const lineas = textoCSV.trim().split("\n");

  if (lineas.length < 2) return [];

  const filas = lineas.slice(1);

  return filas
    .map((linea) => {
      const [altura, litros] = linea.split(",");

      return {
        altura: Number(String(altura).trim()),
        litros: Number(String(litros).trim()),
      };
    })
    .filter(
      (item) =>
        !isNaN(item.altura) &&
        !isNaN(item.litros)
    )
    .sort((a, b) => a.altura - b.altura);
}