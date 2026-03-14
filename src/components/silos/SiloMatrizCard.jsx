import { calcularSiloMatriz } from "../../utils/silos/matriz";

function SiloMatrizCard({ medicion, setMedicion }) {
  const datos = calcularSiloMatriz({
    distanciaVacia: Number(medicion) || 0,
  });

  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
      <h4 className="text-xl font-bold text-slate-800 mb-4">Silo Matriz</h4>

      <p className="text-sm text-slate-600 mb-1">Distancia vacía medida (m)</p>
      <input
        type="number"
        step="0.01"
        value={medicion}
        onChange={(e) => setMedicion(e.target.value)}
        placeholder="Ingrese medición"
        className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
      />

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-slate-500">Stock toneladas</p>
          <p className="text-2xl font-bold text-slate-800">
            {datos.stockTon.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm text-slate-500">Capacidad disponible</p>
          <p className="text-2xl font-bold text-slate-800">
            {capacidadDisponibleTon.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-4 mt-5 overflow-hidden">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${datos.porcentaje}%` }}
        />
      </div>

      <p className="text-sm mt-2 text-slate-700 font-medium">
        Nivel ocupado: {datos.porcentaje.toFixed(1)}%
      </p>
    </div>
  );
}

export default SiloMatrizCard;