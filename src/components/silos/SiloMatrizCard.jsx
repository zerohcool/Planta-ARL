// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo matriz
import { calcularSiloMatriz } from "../../utils/silos/matriz";

function SiloMatrizCard({
  titulo = "Silo Matriz",
  medicion,
  setMedicion,
  parametros,
}) {
  // ========================================
  // CÁLCULO PRINCIPAL DEL SILO
  // ========================================
  const datos = calcularSiloMatriz({
    distanciaVacia: Number(medicion) || 0,
    densidad: Number(parametros.densidad) || 0,
    H1: Number(parametros.H1) || 0,
    D1: Number(parametros.D1) || 0,
    H2: Number(parametros.H2) || 0,
    d0: Number(parametros.d0) || 0,
    H3: Number(parametros.H3) || 0,
  });

  // Altura máxima permitida para la medición
  const alturaMaxima = datos.Htot;

  // Validaciones del campo
  const errorMedicion =
    medicion === ""
      ? "La medición es obligatoria."
      : Number(medicion) < 0
        ? "La medición no puede ser negativa."
        : Number(medicion) > alturaMaxima
          ? `La medición no puede superar ${alturaMaxima.toFixed(2)} m.`
          : "";

  const medicionValida = !errorMedicion;

  // Cálculo de capacidad disponible en toneladas
  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;

  return (
    <div className="bg-sky-50 p-6 rounded-2xl shadow border border-sky-200">
      <h4 className="text-xl font-bold text-slate-800 mb-1">{titulo}</h4>
      <p className="text-sm text-sky-700 font-medium mb-4">Tipo: Matriz</p>

      <p className="text-sm text-slate-600 mb-1">Distancia vacía medida (m)</p>
      <input
        type="number"
        step="0.01"
        value={medicion}
        onChange={(e) => setMedicion(e.target.value)}
        placeholder="Ingrese medición"
        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 bg-white ${
          errorMedicion
            ? "border-red-500 focus:ring-red-200 focus:border-red-500"
            : "border-sky-200 focus:ring-sky-200 focus:border-sky-400"
        }`}
      />

      {errorMedicion && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorMedicion}</p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Altura total del silo: {alturaMaxima.toFixed(2)} m
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-green-100">
          <p className="text-sm text-slate-500">Stock toneladas</p>
          <p className="text-2xl font-bold text-slate-800">
            {medicionValida
              ? datos.stockTon.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })
              : "0,00"}{" "}
            ton
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-100">
          <p className="text-sm text-slate-500">Capacidad disponible</p>
          <p className="text-2xl font-bold text-slate-800">
            {medicionValida
              ? capacidadDisponibleTon.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })
              : "0,00"}{" "}
            ton
          </p>
        </div>
      </div>

      <div className="w-full bg-sky-100 rounded-full h-4 mt-5 overflow-hidden">
        <div
          className="bg-sky-500 h-4 rounded-full transition-all"
          style={{
            width: medicionValida ? `${datos.porcentaje}%` : "0%",
          }}
        />
      </div>

      <p className="text-sm mt-2 text-slate-700 font-medium">
        Nivel ocupado: {medicionValida ? datos.porcentaje.toFixed(1) : "0.0"}%
      </p>
    </div>
  );
}

export default SiloMatrizCard;