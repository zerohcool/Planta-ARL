// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo nitrato
import { calcularSiloNitrato } from "../../utils/silos/nitrato";

function SiloNitratoCard({
  titulo = "Silo Nitrato",
  medicion,
  setMedicion,
  parametros,
}) {
  // ========================================
  // CÁLCULO PRINCIPAL DEL SILO
  // ========================================
  const datos = calcularSiloNitrato({
    distanciaVacia: Number(medicion) || 0,
    densidad: Number(parametros.densidad) || 0,
    h1: Number(parametros.h1) || 0,
    A1: Number(parametros.A1) || 0,
    B1: Number(parametros.B1) || 0,
    h2: Number(parametros.h2) || 0,
    A2: Number(parametros.A2) || 0,
    B2: Number(parametros.B2) || 0,
    h3: Number(parametros.h3) || 0,
    A3: Number(parametros.A3) || 0,
    B3: Number(parametros.B3) || 0,
    a3: Number(parametros.a3) || 0,
    b3: Number(parametros.b3) || 0,
    h4: Number(parametros.h4) || 0,
    A4: Number(parametros.A4) || 0,
    B4: Number(parametros.B4) || 0,
    a4: Number(parametros.a4) || 0,
    b4: Number(parametros.b4) || 0,
  });

  // Altura máxima del silo
  const alturaMaxima = datos.Htot;

  // Validaciones
  const errorMedicion =
    medicion === ""
      ? "La medición es obligatoria."
      : Number(medicion) < 0
        ? "La medición no puede ser negativa."
        : Number(medicion) > alturaMaxima
          ? `La medición no puede superar ${alturaMaxima.toFixed(2)} m.`
          : "";

  const medicionValida = !errorMedicion;

  // Capacidad disponible en toneladas
  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;

  return (
    <div className="bg-amber-50 p-6 rounded-2xl shadow border border-amber-200">
      <h4 className="text-xl font-bold text-slate-800 mb-1">{titulo}</h4>
      <p className="text-sm text-amber-700 font-medium mb-4">Tipo: Nitrato</p>

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
            : "border-amber-200 focus:ring-amber-200 focus:border-amber-400"
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

        <div className="bg-white p-4 rounded-xl border border-amber-100">
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

      <div className="w-full bg-amber-100 rounded-full h-4 mt-5 overflow-hidden">
        <div
          className="bg-amber-500 h-4 rounded-full transition-all"
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

export default SiloNitratoCard;
