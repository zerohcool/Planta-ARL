// ========================================
// TARJETA VACÍA PARA CONSERVAR EL LAYOUT
// ========================================
// Esta tarjeta se usa cuando se necesita mantener
// el espacio de la grilla sin mostrar un silo real.
function EmptySiloCard() {
  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl min-h-[320px] hidden md:block" />
  );
}

export default EmptySiloCard;