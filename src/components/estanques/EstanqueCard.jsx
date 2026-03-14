function EstanqueCard({
  titulo,
  altura,
  setAltura,
  errorAltura,
  maxAltura,
  stock,
  disponible,
  nivel,
  inputClass,
  colorClasses,
}) {
  return (
    <div className={`p-6 rounded-2xl shadow border ${colorClasses.card}`}>
      <h4 className="font-semibold mb-3 text-slate-800">{titulo}</h4>

      <p className="text-sm text-slate-600 mb-1">Medición en cm</p>

      <input
        type="number"
        value={altura}
        onChange={(e) => setAltura(e.target.value)}
        placeholder="Ingrese altura"
        className={`${inputClass} ${colorClasses.input} ${
          errorAltura ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""
        }`}
      />

      {errorAltura && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorAltura}</p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Altura máxima permitida: {maxAltura} cm
      </p>

      <p className="mt-4 text-sm text-slate-500">Stock calculado</p>
      <p className="text-2xl font-bold text-slate-800">
        {stock.toLocaleString("es-CL")} L
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Capacidad disponible: {disponible.toLocaleString("es-CL")} L
      </p>

      <div
        className={`w-full rounded-full h-4 mt-3 overflow-hidden ${colorClasses.progressBg}`}
      >
        <div
          className={`h-4 rounded-full transition-all ${colorClasses.progressFill}`}
          style={{ width: `${nivel}%` }}
        />
      </div>

      <p className="text-sm mt-2 text-slate-700 font-medium">
        {nivel.toFixed(0)} %
      </p>
    </div>
  );
}

export default EstanqueCard;