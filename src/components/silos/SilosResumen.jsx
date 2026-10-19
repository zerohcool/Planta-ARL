// ========================================
// IMPORTACIONES
// ========================================
import { calcularSiloMatriz } from "../../utils/silos/matriz";
import { calcularSiloNitrato } from "../../utils/silos/nitrato";
import { silosConfigResumen } from "../../config/silos";

// ========================================
// COMPONENTE RESUMEN GENERAL
// ========================================
function SilosResumen({
  medicionesSilos,
  parametrosMatriz,
  parametrosNitrato,
}) {
  // Totales acumulados
  let stockTotalMatriz = 0;
  let capacidadDisponibleMatriz = 0;
  let stockTotalNitrato = 0;
  let capacidadDisponibleNitrato = 0;

  // Recorremos todos los silos configurados
  Object.entries(silosConfigResumen).forEach(([siloId, tipo]) => {
    if (tipo === "blank") return;

    const medicion = Number(medicionesSilos[siloId]);

    // Si no hay medición válida, no se suma
    if (medicionesSilos[siloId] === "" || medicion < 0) return;

    if (tipo === "matriz") {
      const datos = calcularSiloMatriz({
        distanciaVacia: medicion,
        densidad: Number(parametrosMatriz.densidad) || 0,
        H1: Number(parametrosMatriz.H1) || 0,
        D1: Number(parametrosMatriz.D1) || 0,
        H2: Number(parametrosMatriz.H2) || 0,
        d0: Number(parametrosMatriz.d0) || 0,
        H3: Number(parametrosMatriz.H3) || 0,
      });

      if (medicion <= datos.Htot) {
        stockTotalMatriz += datos.stockTon;
        capacidadDisponibleMatriz += (datos.Vvac * datos.densidad) / 1000;
      }
    }

    if (tipo === "nitrato") {
      // Restricción operativa: mediciones menores a 0.5 m no son válidas por pirámide de llenado
      if (medicion < 0.5) return;

      const datos = calcularSiloNitrato({
        distanciaVacia: medicion,
        densidad: Number(parametrosNitrato.densidad) || 0,
        h1: Number(parametrosNitrato.h1) || 0,
        A1: Number(parametrosNitrato.A1) || 0,
        B1: Number(parametrosNitrato.B1) || 0,
        h2: Number(parametrosNitrato.h2) || 0,
        A2: Number(parametrosNitrato.A2) || 0,
        B2: Number(parametrosNitrato.B2) || 0,
        h3: Number(parametrosNitrato.h3) || 0,
        A3: Number(parametrosNitrato.A3) || 0,
        B3: Number(parametrosNitrato.B3) || 0,
        a3: Number(parametrosNitrato.a3) || 0,
        b3: Number(parametrosNitrato.b3) || 0,
        h4: Number(parametrosNitrato.h4) || 0,
        A4: Number(parametrosNitrato.A4) || 0,
        B4: Number(parametrosNitrato.B4) || 0,
        a4: Number(parametrosNitrato.a4) || 0,
        b4: Number(parametrosNitrato.b4) || 0,
      });

      if (medicion <= datos.Htot) {
        stockTotalNitrato += datos.stockTon;
        capacidadDisponibleNitrato += (datos.Vvac * datos.densidad) / 1000;
      }
    }
  });

  const stockTotalPlanta = stockTotalMatriz + stockTotalNitrato;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow border border-slate-200 p-6">
      <h4 className="text-xl font-bold text-slate-800 mb-5">
        Resumen General de Silos
      </h4>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Stock Matriz - Oscuro */}
        <div
          className="rounded-xl p-4 shadow-sm border border-sky-400/30 text-white min-w-0"
          style={{ backgroundColor: "rgb(75, 162, 227)" }}
        >
          <p className="text-sm font-medium text-white/90 whitespace-nowrap truncate" title="Stock total matriz">
            Stock total matriz
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {stockTotalMatriz.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        {/* Capacidad Matriz - Claro */}
        <div
          className="rounded-xl p-4 shadow-sm border border-sky-200 min-w-0"
          style={{ backgroundColor: "rgb(227, 241, 253)" }}
        >
          <p className="text-sm font-medium text-sky-800 whitespace-nowrap truncate" title="Capacidad total matriz">
            Capacidad total matriz
          </p>
          <p className="text-2xl font-bold text-sky-900 mt-1">
            {capacidadDisponibleMatriz.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        {/* Stock Nitrato - Oscuro */}
        <div
          className="rounded-xl p-4 shadow-sm border border-amber-600/30 text-white min-w-0"
          style={{ backgroundColor: "rgb(245, 158, 11)" }}
        >
          <p className="text-sm font-medium text-white/90 whitespace-nowrap truncate" title="Stock total nitrato">
            Stock total nitrato
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {stockTotalNitrato.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        {/* Capacidad Nitrato - Claro */}
        <div
          className="rounded-xl p-4 shadow-sm border border-amber-200 min-w-0"
          style={{ backgroundColor: "rgb(254, 243, 199)" }}
        >
          <p className="text-sm font-medium text-amber-800 whitespace-nowrap truncate" title="Capacidad total nitrato">
            Capacidad total nitrato
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {capacidadDisponibleNitrato.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        {/* Stock Total Planta - Oscuro Neutral */}
        <div className="bg-slate-800 border border-slate-700 text-white rounded-xl p-4 shadow-sm min-w-0">
          <p className="text-sm font-medium text-slate-300 whitespace-nowrap truncate" title="Stock total planta">
            Stock total planta
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {stockTotalPlanta.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>
      </div>
    </div>
  );
}

export default SilosResumen;
