// ========================================
// CONFIGURACIÓN CENTRALIZADA DE SILOS
// ========================================

// Grilla visual 3x3 de la planta
export const silosLayoutGrid = [
  [
    { id: "C1", tipo: "matriz" },
    { id: "B1", tipo: "matriz" },
    { id: "A1", tipo: "matriz" },
  ],
  [
    { id: "C2", tipo: "matriz" },
    { id: "B2", tipo: "nitrato" },
    { id: "A2", tipo: "nitrato" },
  ],
  [
    { id: "C3", tipo: "nitrato" },
    { id: "B3", tipo: "blank" },
    { id: "A3", tipo: "nitrato" },
  ],
];

// Tipos por silo para el cálculo de resumen
export const silosConfigResumen = {
  A1: "matriz",
  A2: "nitrato",
  A3: "nitrato",
  B1: "matriz",
  B2: "nitrato",
  B3: "blank",
  C1: "matriz",
  C2: "matriz",
  C3: "nitrato",
};

// Silos disponibles para recepción y descarga de materias primas
export const silosDisponiblesMMPP = [
  { id: "A1", label: "Silo A1 (Matriz)", material: "Matriz" },
  { id: "A2", label: "Silo A2 (Nitrato)", material: "Nitrato" },
  { id: "A3", label: "Silo A3 (Nitrato)", material: "Nitrato" },
  { id: "B1", label: "Silo B1 (Matriz)", material: "Matriz" },
  { id: "B2", label: "Silo B2 (Nitrato)", material: "Nitrato" },
  { id: "C1", label: "Silo C1 (Matriz)", material: "Matriz" },
  { id: "C2", label: "Silo C2 (Matriz)", material: "Matriz" },
  { id: "C3", label: "Silo C3 (Nitrato)", material: "Nitrato" },
];
