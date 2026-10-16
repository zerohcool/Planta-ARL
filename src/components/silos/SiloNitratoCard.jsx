// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo nitrato
import { calcularSiloNitrato } from "../../utils/silos/nitrato";

// Iconos de estado Lleno / Vacío
import iconoLleno from "../../assets/icons/Lleno.svg";
import iconoVacio from "../../assets/icons/Vacio.svg";

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

  // Determinar si el silo se encuentra lleno (medición en 0)
  const estaLleno = medicion !== "" && Number(medicion) === 0;

  // Alternar entre medición mínima (0 m, lleno) y medición máxima (alturaMaxima, vacío)
  const toggleMinMax = () => {
    if (estaLleno) {
      setMedicion(alturaMaxima.toFixed(2));
    } else {
      setMedicion("0");
    }
  };

  return (
    <div className="bg-amber-50 p-6 rounded-2xl shadow border border-amber-200">
      <h4 className="text-xl font-bold text-slate-800 mb-1">{titulo}</h4>
      <p className="text-sm text-amber-700 font-medium mb-4">Tipo: Nitrato</p>

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
              : "border-amber-200 focus:ring-amber-200 focus:border-amber-400"
          }`}
        />
        <button
          type="button"
          onClick={toggleMinMax}
          title={
            estaLleno
              ? `Silo lleno (0 m). Clic para vaciar (${alturaMaxima.toFixed(2)} m)`
              : `Silo vacío o parcial (${medicion || alturaMaxima.toFixed(2)} m). Clic para llenar (0 m)`
          }
          className="p-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer h-[50px] w-[50px]"
        >
          <img
            src={estaLleno ? iconoLleno : iconoVacio}
            alt={estaLleno ? "Silo Lleno" : "Silo Vacío"}
            className="w-8 h-8 object-contain transition-transform duration-200 active:scale-95"
          />
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
          className="p-3 sm:p-4 rounded-xl shadow-sm border border-amber-600/30 text-white min-w-0"
          style={{ backgroundColor: "rgb(245, 158, 11)" }}
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
          className="p-3 sm:p-4 rounded-xl shadow-sm border border-amber-200 min-w-0"
          style={{ backgroundColor: "rgb(254, 243, 199)" }}
        >
          <p className="text-xs sm:text-sm font-medium text-amber-800 whitespace-nowrap truncate">
            Capacidad disponible
          </p>
          <p className="text-xl sm:text-2xl font-bold text-amber-900 whitespace-nowrap truncate mt-1">
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
        style={{ backgroundColor: "rgb(254, 243, 199)" }}
      >
        <div
          className="h-4 rounded-full transition-all"
          style={{
            backgroundColor: "rgb(245, 158, 11)",
            width: medicionValida ? `${datos.porcentaje}%` : "0%",
          }}
        />
      </div>

      <p className="text-sm mt-2 text-amber-800 font-medium">
        Nivel ocupado: {medicionValida ? datos.porcentaje.toFixed(1) : "0.0"}%
      </p>
    </div>
  );
}

export default SiloNitratoCard;
