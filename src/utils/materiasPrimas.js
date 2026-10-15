export function obtenerFechaHoraActual() {
  const ahora = new Date();

  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yyyy = ahora.getFullYear();
  const hh = String(ahora.getHours()).padStart(2, "0");
  const min = String(ahora.getMinutes()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

export function crearFilaVaciaMMPP() {
  return {
    guia: "",
    patenteCamion: "",
    patenteEstanque: "",
    material: "",
    cantidadKg: "",
    silo: "",
    despachado: false,
    despachadoFecha: "",
  };
}
