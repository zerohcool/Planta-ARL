// ========================================
// DATOS Y CONFIGURACIÓN: CAMIONES FÁBRICA
// ========================================

export const camionesFabricaIniciales = [
  {
    id: "CF-01",
    patente: "GHJK-45",
    capacidadNitrato: 12, // Toneladas
    capacidadMatriz: 10, // Toneladas
    capacidadPetroleo: 600, // Litros
    estado: "disponible", // disponible | no operativo | fuera de faena
  },
  {
    id: "CF-02",
    patente: "LMNP-78",
    capacidadNitrato: 14,
    capacidadMatriz: 10,
    capacidadPetroleo: 750,
    estado: "disponible",
  },
  {
    id: "CF-03",
    patente: "RSTV-12",
    capacidadNitrato: 10,
    capacidadMatriz: 8,
    capacidadPetroleo: 500,
    estado: "no operativo",
  },
];

export const estadosCamion = [
  {
    valor: "disponible",
    etiqueta: "Disponible",
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dotClass: "bg-emerald-500",
  },
  {
    valor: "no operativo",
    etiqueta: "No Operativo",
    color: "red",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    dotClass: "bg-red-500",
  },
  {
    valor: "fuera de faena",
    etiqueta: "Fuera de Faena",
    color: "slate",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    dotClass: "bg-slate-400",
  },
];

// Capacidad máxima reglamentaria para camiones de materia prima externos
export const MAX_TON_ESTADIA = 28;
