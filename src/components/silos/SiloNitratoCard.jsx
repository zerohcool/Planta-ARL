// ========================================
// IMPORTACIONES
// ========================================
// Función utilitaria que realiza todos los cálculos geométricos del silo nitrato
import { calcularSiloNitrato } from "../../utils/silos/nitrato";

// Iconos vectoriales de estado Lleno / Vacío
import { IconoLleno, IconoVacio } from "./SiloGaugeIcons";

// Utilidad para formatear camiones de 25 ton en cuartos
import { formatearCamionesFraccion } from "../../utils/camionesFraccion";

function SiloNitratoCard({
  titulo = "Silo Nitrato",
  medicion,
  setMedicion,
  parametros,
  esOperativo = true,
  onToggleOperativo,
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
    medicionLleno: 0.4,
  });

  // Altura máxima del silo
  const alturaMaxima = datos.Htot;

  // Límite mínimo operativo: nunca menos de 0.4 m debido a la pirámide de llenado y ubicación de escotilla
  const medicionMinima = 0.4;

  // Validaciones
  const errorMedicion =
    medicion === ""
      ? "La medición es obligatoria."
      : Number(medicion) < medicionMinima
        ? `La medición no puede ser menor a ${medicionMinima} m (límite por cono de llenado y escotilla).`
        : Number(medicion) > alturaMaxima
          ? `La medición no puede superar ${alturaMaxima.toFixed(2)} m.`
          : "";

  const medicionValida = !errorMedicion;

  // Capacidad disponible en toneladas (solo si es operativo)
  const capacidadDisponibleTon = (datos.Vvac * datos.densidad) / 1000;
  const capacidadDisponibleEfectiva = esOperativo ? capacidadDisponibleTon : 0;

  // Determinar si el silo se encuentra lleno (medición en el mínimo físico permitido: 0.4 m)
  const estaLleno = medicion !== "" && Number(medicion) <= medicionMinima;

  // Alternar entre medición mínima (0.4 m, lleno) y medición máxima (alturaMaxima, vacío)
  const toggleMinMax = () => {
    if (estaLleno) {
      setMedicion(alturaMaxima.toFixed(2));
    } else {
      setMedicion(medicionMinima.toFixed(2));
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl shadow border transition ${
        esOperativo
          ? "bg-amber-50 border-amber-200"
          : "bg-slate-50 border-red-300 ring-1 ring-red-200"
      }`}
    >
      {/* Cabecera del Silo: Título + Botón de Operatividad */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="text-xl font-bold text-slate-800 mb-0.5">{titulo}</h4>
          <p className="text-sm text-amber-700 font-medium">Tipo: Nitrato</p>
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
          min={medicionMinima}
          max={alturaMaxima.toFixed(2)}
          value={medicion}
          onChange={(e) => setMedicion(e.target.value)}
          placeholder={`Mínimo ${medicionMinima} m`}
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
              ? `Silo lleno (${medicionMinima.toFixed(2)} m). Clic para vaciar (${alturaMaxima.toFixed(2)} m)`
              : `Silo vacío o parcial (${medicion || alturaMaxima.toFixed(2)} m). Clic para llenar al máximo (${medicionMinima.toFixed(2)} m)`
          }
          className="p-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer h-[50px] w-[50px]"
          style={{ color: "rgb(245, 158, 11)" }}
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
        Rango de medición: {medicionMinima.toFixed(2)} m (lleno) a {alturaMaxima.toFixed(2)} m (vacío)
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Toneladas ocupadas */}
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

        {/* Capacidad disponible */}
        <div
          className={`p-3 sm:p-4 rounded-xl shadow-sm border min-w-0 ${
            esOperativo
              ? "border-amber-200 text-amber-900"
              : "border-red-200 text-red-900 bg-red-50/50"
          }`}
          style={esOperativo ? { backgroundColor: "rgb(254, 243, 199)" } : {}}
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
