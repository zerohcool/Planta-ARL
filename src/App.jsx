export function obtenerLitrosDesdeAltura(tabla, alturaIngresada) {
  const altura = Number(alturaIngresada);

  if (!tabla || tabla.length === 0) return 0;
  if (isNaN(altura) || altura < 0) return 0;

  const filaExacta = tabla.find((item) => item.altura === altura);
  if (filaExacta) return filaExacta.litros;

  let filaMenor = null;

  for (let i = 0; i < tabla.length; i++) {
    if (tabla[i].altura <= altura) {
      filaMenor = tabla[i];
    } else {
      break;
    }
  }

  return filaMenor ? filaMenor.litros : 0;
}