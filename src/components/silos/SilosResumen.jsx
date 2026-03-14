// ========================================
// IMPORTACIONES
// ========================================
import { calcularSiloMatriz } from "../../utils/silos/matriz";
import { calcularSiloNitrato } from "../../utils/silos/nitrato";

// ========================================
// CONFIGURACIÓN DE TIPOS POR SILO
// ========================================
const configResumen = {
  A1: "matriz",
  A2: "nitrato",
  A3: "nitrato",
  B1: "matriz",
  B2: "nitrato",
  B3: "blank",
  C1: "matriz",
  C2: "matriz",
  C3: "nitrato",
};

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
  Object.entries(configResumen).forEach(([siloId, tipo]) => {
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
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Stock total matriz</p>
          <p className="text-2xl font-bold text-slate-800">
            {stockTotalMatriz.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">
            Capacidad disponible total matriz
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {capacidadDisponibleMatriz.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Stock total nitrato</p>
          <p className="text-2xl font-bold text-slate-800">
            {stockTotalNitrato.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">
            Capacidad disponible total nitrato
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {capacidadDisponibleNitrato.toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}{" "}
            ton
          </p>
        </div>

        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Stock total planta</p>
          <p className="text-2xl font-bold text-slate-800">
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
