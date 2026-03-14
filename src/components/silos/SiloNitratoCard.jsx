// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo nitrato
import { calcularSiloNitrato } from "../../utils/silos/nitrato";

function SiloNitratoCard({ medicion, setMedicion, parametros }) {
  // ========================================
  // CÁLCULO PRINCIPAL DEL SILO
  // ========================================
  // Si la medición viene vacía, se usa 0 solo para no romper cálculos internos,
  // pero la validación seguirá mostrando el error correspondiente.
  const datos = calcularSiloNitrato({
  distanciaVacia: Number(medicion) || 0,
  densidad: Number(parametros.densidad) || 0,
  h1: Number(parametros.h1) || 0,
  A1: Number(parametros.A1) || 0,
  B1: Number(parametros.B1) || 0,
  h2: Number(parametros.h2) || 0,
  h3: Number(parametros.h3) || 0,
  a3: Number(parametros.a3) || 0,
  b3: Number(parametros.b3) || 0,
  h4: Number(parametros.h4) || 0,
  A4: Number(parametros.A4) || 0,
  B4: Number(parametros.B4) || 0,
  a4: Number(parametros.a4) || 0,
  b4: Number(parametros.b4) || 0,
});

  // ========================================
  // PARÁMETROS DE VALIDACIÓN
  // ========================================
  // Altura máxima total del silo nitrato
  const alturaMaxima = datos.Htot;

  // ========================================
  // VALIDACIONES
  // ========================================
  const errorMedicion =
    medicion === ""
      ? "La medición es obligatoria."
      : Number(medicion) < 0
        ? "La medición no puede ser negativa."
        : Number(medicion) > alturaMaxima
          ? `La medición no puede superar ${alturaMaxima.toFixed(2)} m.`
          : "";

  // Estado general del campo
  const medicionValida = !errorMedicion;

  // ========================================
  // CÁLCULO DE CAPACIDAD DISPONIBLE EN TONELADAS
  // ========================================
  // Fórmula:
  // (Volumen disponible * densidad) / 1000
  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
      {/* Título del módulo */}
      <h4 className="text-xl font-bold text-slate-800 mb-4">Silo Nitrato</h4>

      {/* Entrada de la medición */}
      <p className="text-sm text-slate-600 mb-1">Distancia vacía medida (m)</p>
      <input
        type="number"
        step="0.01"
        value={medicion}
        onChange={(e) => setMedicion(e.target.value)}
        placeholder="Ingrese medición"
        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
          errorMedicion
            ? "border-red-500 focus:ring-red-200 focus:border-red-500"
            : "border-slate-300 focus:ring-blue-200 focus:border-blue-500"
        }`}
      />

      {/* Error visible para el usuario */}
      {errorMedicion && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorMedicion}</p>
      )}

      {/* Información auxiliar */}
      <p className="mt-2 text-xs text-slate-500">
        Altura total del silo: {alturaMaxima.toFixed(2)} m
      </p>

      {/* Tarjetas resumen */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Stock */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
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

        {/* Capacidad disponible */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
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

      {/* Indicador visual */}
      <div className="w-full bg-slate-200 rounded-full h-4 mt-5 overflow-hidden">
        <div
          className="bg-emerald-600 h-4 rounded-full transition-all"
          style={{
            width: medicionValida ? `${datos.porcentaje}%` : "0%",
          }}
        />
      </div>

      {/* Porcentaje ocupado */}
      <p className="text-sm mt-2 text-slate-700 font-medium">
        Nivel ocupado: {medicionValida ? datos.porcentaje.toFixed(1) : "0.0"}%
      </p>
    </div>
  );
}

export default SiloNitratoCard;