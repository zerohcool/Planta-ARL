import { IconoLleno, IconoVacio } from "../silos/SiloGaugeIcons";

function EstanqueCard({
  titulo,
  modoIngreso = "litros", // "litros" o "altura"
  // Modo altura
  altura,
  setAltura,
  errorAltura,
  maxAltura,
  // Modo litros
  litros,
  setLitros,
  errorLitros,
  capTotal,
  // Valores calculados
  stock,
  disponible,
  nivel,
  alturaEquivalente,
  inputClass,
  colorClasses,
  colorIcono,
}) {
  const estaLleno =
    modoIngreso === "litros"
      ? litros !== "" && Number(litros) >= capTotal
      : altura !== "" && Number(altura) >= maxAltura;

  const toggleMinMax = () => {
    if (modoIngreso === "litros") {
      if (estaLleno) {
        setLitros("0");
      } else {
        setLitros(String(capTotal));
      }
    } else {
      if (estaLleno) {
        setAltura("0");
      } else {
        setAltura(String(maxAltura));
      }
    }
  };

  const errorActual = modoIngreso === "litros" ? errorLitros : errorAltura;

  return (
    <div className={`p-6 rounded-2xl shadow border ${colorClasses.card}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-800">{titulo}</h4>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-600">
          {modoIngreso === "litros" ? "Modo Litros" : "Modo Altura"}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-1">
        {modoIngreso === "litros" ? "Stock en litros (L)" : "Medición en cm"}
      </p>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          min="0"
          value={modoIngreso === "litros" ? litros : altura}
          onChange={(e) => {
            if (modoIngreso === "litros") {
              setLitros(e.target.value);
            } else {
              setAltura(e.target.value);
            }
          }}
          placeholder={
            modoIngreso === "litros" ? "Ingrese litros" : "Ingrese altura"
          }
          className={`flex-1 ${inputClass} ${colorClasses.input} ${
            errorActual
              ? "border-red-500 focus:ring-red-200 focus:border-red-500"
              : ""
          }`}
        />
        <button
          type="button"
          onClick={toggleMinMax}
          title={
            estaLleno
              ? `Estanque lleno. Clic para vaciar (0 ${
                  modoIngreso === "litros" ? "L" : "cm"
                })`
              : `Estanque no lleno. Clic para llenar al máximo (${
                  modoIngreso === "litros"
                    ? `${capTotal.toLocaleString("es-CL")} L`
                    : `${maxAltura} cm`
                })`
          }
          className="p-1.5 bg-white hover:bg-slate-50 border rounded-lg transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer h-[50px] w-[50px]"
          style={{
            borderColor: colorIcono,
            color: colorIcono,
          }}
        >
          {estaLleno ? (
            <IconoLleno className="w-8 h-8 transition-transform duration-200 active:scale-95" />
          ) : (
            <IconoVacio className="w-8 h-8 transition-transform duration-200 active:scale-95" />
          )}
        </button>
      </div>

      {errorActual && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorActual}</p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        {modoIngreso === "litros"
          ? `Capacidad máxima: ${capTotal.toLocaleString("es-CL")} L`
          : `Altura máxima permitida: ${maxAltura} cm`}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {modoIngreso === "litros" ? "Stock registrado" : "Stock calculado"}
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {stock.toLocaleString("es-CL")} L
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {modoIngreso === "litros" ? "Altura estimada" : "Medición"}
          </p>
          <p className="text-base font-semibold text-slate-700">
            {modoIngreso === "litros" ? `${alturaEquivalente || 0} cm` : `${altura || 0} cm`}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        Capacidad disponible:{" "}
        <strong className="text-slate-800">{disponible.toLocaleString("es-CL")} L</strong>
      </p>

      <div
        className={`w-full rounded-full h-4 mt-3 overflow-hidden ${colorClasses.progressBg}`}
      >
        <div
          className={`h-4 rounded-full transition-all duration-300 ${colorClasses.progressFill}`}
          style={{ width: `${nivel}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-slate-500">Nivel de llenado</span>
        <span className="text-sm text-slate-700 font-bold">{nivel.toFixed(0)} %</span>
      </div>
    </div>
  );
}

export default EstanqueCard;