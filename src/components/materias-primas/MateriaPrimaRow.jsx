function MateriaPrimaRow({
  item,
  index,
  materialesDisponibles,
  silosDisponibles,
  onChange,
  onToggleEstado,
  onEliminar,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          N° Guía
        </label>
        <input
          type="text"
          value={item.guia}
          onChange={(e) => onChange(index, "guia", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Guía"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Patente camión
        </label>
        <input
          type="text"
          value={item.patenteCamion}
          onChange={(e) => onChange(index, "patenteCamion", e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="ABCD12"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Patente estanque
        </label>
        <input
          type="text"
          value={item.patenteEstanque}
          onChange={(e) => onChange(index, "patenteEstanque", e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="EFGH34"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Material
        </label>
        <input
          list={`materiales-${index}`}
          value={item.material}
          onChange={(e) => onChange(index, "material", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Seleccione o escriba"
        />
        <datalist id={`materiales-${index}`}>
          {materialesDisponibles.map((material, i) => (
            <option key={i} value={material} />
          ))}
        </datalist>
      </div>

      <div className="md:col-span-1">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Cantidad (kg)
        </label>
        <input
          type="number"
          value={item.cantidadKg}
          onChange={(e) => onChange(index, "cantidadKg", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="0"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Silo descargado
        </label>
        <select
          value={item.silo}
          onChange={(e) => onChange(index, "silo", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Seleccione</option>
          {silosDisponibles.map((silo, i) => (
            <option key={i} value={silo}>
              {silo}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1 flex flex-col justify-end">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Estado
        </label>

        <button
          type="button"
          onClick={() => onToggleEstado(index)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            item.despachado
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-amber-100 text-amber-700 border border-amber-300"
          }`}
        >
          {item.despachado ? "Despachado" : "Pendiente"}
        </button>

        <p className="text-[11px] text-slate-500 mt-1 min-h-[32px]">
          {item.despachadoFecha
            ? `${item.despachadoFecha}`
            : "Sin fecha de despacho"}
        </p>
      </div>

      <div className="md:col-span-1 flex items-end">
        <button
          type="button"
          onClick={() => onEliminar(index)}
          className="w-full rounded-lg bg-red-100 text-red-700 border border-red-300 px-3 py-2 text-sm font-medium hover:bg-red-200 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default MateriaPrimaRow;