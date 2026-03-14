// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo matriz
import { calcularSiloMatriz } from "../../utils/silos/matriz";

function SiloMatrizCard({ titulo = "Silo Matriz", medicion, setMedicion, parametros }) {
  // ========================================
  // CÁLCULO PRINCIPAL DEL SILO
  // ========================================
  // Se envía la medición al cálculo. Si está vacía, se usa 0 solo para evitar errores
  // matemáticos en pantalla, pero la validación igual marcará el campo como inválido.
  const datos = calcularSiloMatriz({
  distanciaVacia: Number(medicion) || 0,
  densidad: Number(parametros.densidad) || 0,
  H1: Number(parametros.H1) || 0,
  D1: Number(parametros.D1) || 0,
  H2: Number(parametros.H2) || 0,
  d0: Number(parametros.d0) || 0,
  H3: Number(parametros.H3) || 0,
});

  // ========================================
  // PARÁMETROS DE VALIDACIÓN
  // ========================================
  // Altura total máxima del silo, tomada desde el cálculo del propio silo
  const alturaMaxima = datos.Htot;

  // ========================================
  // VALIDACIONES
  // ========================================
  // 1) Campo obligatorio
  // 2) No permitir negativos
  // 3) No permitir valores sobre la altura máxima del silo
  const errorMedicion =
    medicion === ""
      ? "La medición es obligatoria."
      : Number(medicion) < 0
        ? "La medición no puede ser negativa."
        : Number(medicion) > alturaMaxima
          ? `La medición no puede superar ${alturaMaxima.toFixed(2)} m.`
          : "";

  // Estado general de validez del input
  const medicionValida = !errorMedicion;

  // ========================================
  // CÁLCULO DE CAPACIDAD DISPONIBLE EN TONELADAS
  // ========================================
  // Fórmula solicitada:
  // (Volumen disponible * densidad) / 1000
  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
      {/* Título de la tarjeta */}
      <h4 className="text-xl font-bold text-slate-800 mb-4">{titulo}</h4>

      {/* Campo de entrada de medición */}
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

      {/* Mensaje de error de validación */}
      {errorMedicion && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorMedicion}</p>
      )}

      {/* Texto auxiliar con altura máxima permitida */}
      <p className="mt-2 text-xs text-slate-500">
        Altura total del silo: {alturaMaxima.toFixed(2)} m
      </p>

      {/* Resumen principal de resultados */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Stock en toneladas */}
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

        {/* Capacidad disponible en toneladas */}
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

      {/* Barra visual del porcentaje ocupado */}
      <div className="w-full bg-slate-200 rounded-full h-4 mt-5 overflow-hidden">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{
            width: medicionValida ? `${datos.porcentaje}%` : "0%",
          }}
        />
      </div>

      {/* Texto del porcentaje ocupado */}
      <p className="text-sm mt-2 text-slate-700 font-medium">
        Nivel ocupado: {medicionValida ? datos.porcentaje.toFixed(1) : "0.0"}%
      </p>
    </div>
  );
}

export default SiloMatrizCard;