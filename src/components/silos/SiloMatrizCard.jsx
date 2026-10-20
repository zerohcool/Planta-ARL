// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo matriz
import { calcularSiloMatriz } from "../../utils/silos/matriz";

// Iconos vectoriales de estado Lleno / Vacío
import { IconoLleno, IconoVacio } from "./SiloGaugeIcons";

// Utilidad para formatear camiones de 25 ton en cuartos
import { formatearCamionesFraccion } from "../../utils/camionesFraccion";

function SiloMatrizCard({
  titulo = "Silo Matriz",
  medicion,
  setMedicion,
  parametros,
  esOperativo = true,
  onToggleOperativo,
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

  // Cálculo de capacidad disponible en toneladas (solo si es operativo)
  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;
  const capacidadDisponibleEfectiva = esOperativo ? capacidadDisponibleTon : 0;

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
    <div
      className={`p-6 rounded-2xl shadow border transition ${
        esOperativo
          ? "bg-sky-50 border-sky-200"
          : "bg-slate-50 border-red-300 ring-1 ring-red-200"
      }`}
    >
      {/* Cabecera del Silo: Título + Botón de Operatividad */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="text-xl font-bold text-slate-800 mb-0.5">{titulo}</h4>
          <p className="text-sm text-sky-700 font-medium">Tipo: Matriz</p>
        </div>

        {/* Botón interactivo para cambiar entre Operativo y No Operativo */}
        <button
          type="button"
          onClick={onToggleOperativo}
          title={
            esOperativo
              ? "Silo Operativo. Clic para marcar como No Operativo"
              : "Silo No Operativo. Clic para marcar como Operativo"
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
            esOperativo
              ? "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              esOperativo ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {esOperativo ? "Operativo" : "No Operativo"}
        </button>
      </div>

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
          title={
            estaLleno
              ? `Silo lleno (0 m). Clic para vaciar (${alturaMaxima.toFixed(2)} m)`
              : `Silo vacío o parcial (${medicion || alturaMaxima.toFixed(2)} m). Clic para llenar (0 m)`
          }
          className="p-1.5 bg-white hover:bg-sky-100 border border-sky-300 rounded-lg transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer h-[50px] w-[50px]"
          style={{ color: "rgb(75, 162, 227)" }}
        >
          {estaLleno ? (
            <IconoLleno className="w-8 h-8 transition-transform duration-200 active:scale-95" />
          ) : (
            <IconoVacio className="w-8 h-8 transition-transform duration-200 active:scale-95" />
          )}
        </button>
      </div>

      {errorMedicion && (
        <p className="mt-2 text-sm text-red-600 font-medium">{errorMedicion}</p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Altura total del silo: {alturaMaxima.toFixed(2)} m
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Toneladas ocupadas */}
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

        {/* Capacidad disponible */}
        <div
          className={`p-3 sm:p-4 rounded-xl shadow-sm border min-w-0 ${
            esOperativo
              ? "border-sky-200 text-sky-900"
              : "border-red-200 text-red-900 bg-red-50/50"
          }`}
          style={esOperativo ? { backgroundColor: "rgb(227, 241, 253)" } : {}}
        >
          <p className="text-xs sm:text-sm font-medium truncate">
            Capacidad disponible
          </p>
          <p className="text-xl sm:text-2xl font-bold whitespace-nowrap truncate mt-1">
            {medicionValida
              ? capacidadDisponibleEfectiva.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })
              : "0,00"}{" "}
            ton
          </p>
          <p className="text-[11px] font-bold mt-0.5 truncate">
            {esOperativo && medicionValida
              ? `${formatearCamionesFraccion(capacidadDisponibleEfectiva)} camiones (25t)`
              : "No disponible (No operativo)"}
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