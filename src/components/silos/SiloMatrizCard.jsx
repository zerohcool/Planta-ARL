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

  // Alternar entre medición mínima (0 m) y medición máxima (alturaMaxima)
  const toggleMinMax = () => {
    if (medicion !== "" && Number(medicion) === 0) {
      setMedicion(alturaMaxima.toFixed(2));
    } else {
      setMedicion("0");
    }
  };

  return (
    <div className="bg-sky-50 p-6 rounded-2xl shadow border border-sky-200">
      <h4 className="text-xl font-bold text-slate-800 mb-1">{titulo}</h4>
      <p className="text-sm text-sky-700 font-medium mb-4">Tipo: Matriz</p>

      <p className="text-sm text-slate-600 mb-1">Distancia vacía medida (m)</p>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          step="0.01"
          value={medicion}
          onChange={(e) => setMedicion(e.target.value)}
          placeholder="Ingrese medición"
          className={`flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 bg-white ${
            errorMedicion
              ? "border-red-500 focus:ring-red-200 focus:border-red-500"
              : "border-sky-200 focus:ring-sky-200 focus:border-sky-400"
          }`}
        />
        <button
          type="button"
          onClick={toggleMinMax}
          title={`Alternar medición entre 0 m (lleno) y ${alturaMaxima.toFixed(2)} m (vacío)`}
          className="p-3 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-lg transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>
      </div>

      {errorMedicion && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorMedicion}</p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Altura total del silo: {alturaMaxima.toFixed(2)} m
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        <div
          className="p-3 sm:p-4 rounded-xl shadow-sm border border-sky-400/30 text-white min-w-0"
          style={{ backgroundColor: "rgb(75, 162, 227)" }}
        >
          <p className="text-xs sm:text-sm font-medium text-white/90 whitespace-nowrap truncate">
            Toneladas ocupadas
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap truncate mt-1">
            {medicionValida
              ? datos.stockTon.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })
              : "0,00"}{" "}
            ton
          </p>
        </div>

        <div
          className="p-3 sm:p-4 rounded-xl shadow-sm border border-sky-200 min-w-0"
          style={{ backgroundColor: "rgb(227, 241, 253)" }}
        >
          <p className="text-xs sm:text-sm font-medium text-sky-800 whitespace-nowrap truncate">
            Capacidad disponible
          </p>
          <p className="text-xl sm:text-2xl font-bold text-sky-900 whitespace-nowrap truncate mt-1">
            {medicionValida
              ? capacidadDisponibleTon.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })
              : "0,00"}{" "}
            ton
          </p>
        </div>
      </div>

      <div
        className="w-full rounded-full h-4 mt-5 overflow-hidden"
        style={{ backgroundColor: "rgb(227, 241, 253)" }}
      >
        <div
          className="h-4 rounded-full transition-all"
          style={{
            backgroundColor: "rgb(75, 162, 227)",
            width: medicionValida ? `${datos.porcentaje}%` : "0%",
          }}
        />
      </div>

      <p className="text-sm mt-2 text-sky-800 font-medium">
        Nivel ocupado: {medicionValida ? datos.porcentaje.toFixed(1) : "0.0"}%
      </p>
    </div>
  );
}

export default SiloMatrizCard;