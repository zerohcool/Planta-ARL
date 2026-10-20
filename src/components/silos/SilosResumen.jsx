// ========================================
// IMPORTACIONES
// ========================================
import { calcularSiloMatriz } from "../../utils/silos/matriz";
import { calcularSiloNitrato } from "../../utils/silos/nitrato";
import { silosConfigResumen } from "../../config/silos";
import { formatearCamionesFraccion } from "../../utils/camionesFraccion";
import { MAX_TON_ESTADIA } from "../../data/camiones";

// ========================================
// COMPONENTE RESÚMENES CONSOLIDADOS:
// 1. Resumen General de Silos
// 2. Resumen General de Camiones y Estadías
// 3. Requerimiento para Llenar (Camiones 25 ton)
// ========================================
function SilosResumen({
  medicionesSilos = {},
  estadosSilos = {},
  parametrosMatriz,
  parametrosNitrato,
  flotaCamionesFabrica = [],
  cargasCamionesFabrica = {},
  camionesEstadia = [],
}) {
  // ========================================
  // 1. CÁLCULOS: SILOS DE MATRIZ Y NITRATO
  // ========================================
  let stockTotalMatriz = 0;
  let capacidadDisponibleMatrizSilos = 0;
  let cantMatrizOperativos = 0;
  let totalMatrizSilos = 0;

  let stockTotalNitrato = 0;
  let capacidadDisponibleNitratoSilos = 0;
  let cantNitratoOperativos = 0;
  let totalNitratoSilos = 0;

  Object.entries(silosConfigResumen).forEach(([siloId, tipo]) => {
    if (tipo === "blank") return;

    const esOperativo = (estadosSilos[siloId] ?? "operativo") === "operativo";
    const medicion = Number(medicionesSilos[siloId]);
    const tieneMedicion = medicionesSilos[siloId] !== "" && !isNaN(medicion) && medicion >= 0;

    if (tipo === "matriz") {
      totalMatrizSilos++;
      if (esOperativo) cantMatrizOperativos++;

      if (tieneMedicion) {
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
          // Solo silos OPERATIVOS suman capacidad disponible para llenado
          if (esOperativo) {
            capacidadDisponibleMatrizSilos += (datos.Vvac * datos.densidad) / 1000;
          }
        }
      }
    }

    if (tipo === "nitrato") {
      totalNitratoSilos++;
      if (esOperativo) cantNitratoOperativos++;

      // Restricción operativa: mediciones menores a 0.4 m no son válidas por pirámide de llenado
      if (tieneMedicion && medicion >= 0.4) {
        const datos = calcularSiloNitrato({
          distanciaVacia: medicion,
          densidad: Number(parametrosNitrato.densidad) || 0,
          medicionLleno: 0.4,
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
          // Solo silos OPERATIVOS suman capacidad disponible para llenado
          if (esOperativo) {
            capacidadDisponibleNitratoSilos += (datos.Vvac * datos.densidad) / 1000;
          }
        }
      }
    }
  });

  const stockTotalPlanta = stockTotalMatriz + stockTotalNitrato;

  // ========================================
  // 2. CÁLCULOS: CAMIONES FÁBRICA EN FAENA
  // ========================================
  let totalNitratoCF = 0;
  let totalMatrizCF = 0;
  let capTotalNitratoCF = 0;
  let capTotalMatrizCF = 0;
  let capDisponibleNitratoCF = 0;
  let capDisponibleMatrizCF = 0;

  const camionesCFEnFaena = flotaCamionesFabrica.filter(
    (c) => c.estado === "disponible" || c.estado === "no operativo"
  );
  const camionesCFDisponibles = camionesCFEnFaena.filter((c) => c.estado === "disponible");
  const cantCFNoOperativos = camionesCFEnFaena.length - camionesCFDisponibles.length;

  camionesCFEnFaena.forEach((camion) => {
    const carga = cargasCamionesFabrica[camion.id] || { nitrato: "0", matriz: "0" };
    const nit = Math.min(camion.capacidadNitrato, Math.max(0, Number(carga.nitrato) || 0));
    const mat = Math.min(camion.capacidadMatriz, Math.max(0, Number(carga.matriz) || 0));

    totalNitratoCF += nit;
    totalMatrizCF += mat;
    capTotalNitratoCF += camion.capacidadNitrato;
    capTotalMatrizCF += camion.capacidadMatriz;

    // Solo los camiones disponibles (operativos) tienen capacidad disponible para cargar
    if (camion.estado === "disponible") {
      capDisponibleNitratoCF += Math.max(0, camion.capacidadNitrato - nit);
      capDisponibleMatrizCF += Math.max(0, camion.capacidadMatriz - mat);
    }
  });

  // ========================================
  // 3. CÁLCULOS: CAMIONES CON ESTADÍA
  // ========================================
  let totalNitratoEstadia = 0;
  let totalMatrizEstadia = 0;

  camionesEstadia.forEach((camion) => {
    const ton = Math.min(MAX_TON_ESTADIA, Math.max(0, Number(camion.toneladas) || 0));
    if (camion.tipo === "nitrato") {
      totalNitratoEstadia += ton;
    } else {
      totalMatrizEstadia += ton;
    }
  });

  const totalNitratoTransito = totalNitratoCF + totalNitratoEstadia;
  const totalMatrizTransito = totalMatrizCF + totalMatrizEstadia;
  const granTotalMaterialCamiones = totalNitratoTransito + totalMatrizTransito;

  // ========================================
  // 4. TOTALES CONSOLIDADOS PARA LLENAR (SILOS + CAMIONES FÁBRICA)
  // ========================================
  const totalCapDisponibleNitrato = capacidadDisponibleNitratoSilos + capDisponibleNitratoCF;
  const totalCapDisponibleMatriz = capacidadDisponibleMatrizSilos + capDisponibleMatrizCF;

  // Conversión a camiones de materias primas (media 25 ton)
  const camionesNitratoSilos = formatearCamionesFraccion(capacidadDisponibleNitratoSilos);
  const camionesNitratoCF = formatearCamionesFraccion(capDisponibleNitratoCF);
  const camionesNitratoTotal = formatearCamionesFraccion(totalCapDisponibleNitrato);

  const camionesMatrizSilos = formatearCamionesFraccion(capacidadDisponibleMatrizSilos);
  const camionesMatrizCF = formatearCamionesFraccion(capDisponibleMatrizCF);
  const camionesMatrizTotal = formatearCamionesFraccion(totalCapDisponibleMatriz);

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-8">
      {/* ========================================================
          1. RESUMEN GENERAL DE SILOS
      ======================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h4 className="text-xl font-bold text-slate-800">
            Resumen General de Silos
          </h4>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Operativos: {cantMatrizOperativos + cantNitratoOperativos}
            </span>
            {(totalMatrizSilos + totalNitratoSilos - cantMatrizOperativos - cantNitratoOperativos) > 0 && (
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                No operativos: {totalMatrizSilos + totalNitratoSilos - cantMatrizOperativos - cantNitratoOperativos}
              </span>
            )}
          </div>
        </div>

        {/* 5 Tarjetas principales de métricas de silos */}
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
            <p className="text-[11px] text-white/80 mt-1">
              En silos de Matriz
            </p>
          </div>

          {/* Capacidad Disponible Matriz (Solo Silos Operativos) - Claro */}
          <div
            className="rounded-xl p-4 shadow-sm border border-sky-200 min-w-0 flex flex-col justify-between"
            style={{ backgroundColor: "rgb(227, 241, 253)" }}
          >
            <div>
              <p className="text-sm font-medium text-sky-800 whitespace-nowrap truncate" title="Capacidad disponible matriz (silos operativos)">
                Capacidad disp. matriz
              </p>
              <p className="text-2xl font-bold text-sky-900 mt-1">
                {capacidadDisponibleMatrizSilos.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })}{" "}
                ton
              </p>
            </div>
            <p className="text-xs font-bold text-sky-800 mt-2 bg-sky-200/70 py-1 px-2 rounded-lg inline-block self-start">
              🚚 {camionesMatrizSilos} camiones (25t)
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
            <p className="text-[11px] text-white/80 mt-1">
              En silos de Nitrato
            </p>
          </div>

          {/* Capacidad Disponible Nitrato (Solo Silos Operativos) - Claro */}
          <div
            className="rounded-xl p-4 shadow-sm border border-amber-200 min-w-0 flex flex-col justify-between"
            style={{ backgroundColor: "rgb(254, 243, 199)" }}
          >
            <div>
              <p className="text-sm font-medium text-amber-800 whitespace-nowrap truncate" title="Capacidad disponible nitrato (silos operativos)">
                Capacidad disp. nitrato
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {capacidadDisponibleNitratoSilos.toLocaleString("es-CL", {
                  maximumFractionDigits: 2,
                })}{" "}
                ton
              </p>
            </div>
            <p className="text-xs font-bold text-amber-900 mt-2 bg-amber-200/70 py-1 px-2 rounded-lg inline-block self-start">
              🚚 {camionesNitratoSilos} camiones (25t)
            </p>
          </div>

          {/* Stock Total Planta - Oscuro Neutral */}
          <div className="bg-slate-800 border border-slate-700 text-white rounded-xl p-4 shadow-sm min-w-0 flex flex-col justify-between">
            <div>
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
            <p className="text-[11px] text-slate-300 mt-1">
              N: {stockTotalNitrato.toFixed(1)}t | M: {stockTotalMatriz.toFixed(1)}t
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. RESUMEN GENERAL DE CAMIONES Y ESTADÍAS
      ======================================================== */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h4 className="text-xl font-bold text-slate-800">
            Resumen General de Camiones y Estadías
          </h4>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Disponibles: {camionesCFDisponibles.length}
            </span>
            {cantCFNoOperativos > 0 && (
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                No operativos: {cantCFNoOperativos}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Nitrato en Camiones Fábrica */}
          <div
            className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-amber-600/30 text-white min-w-0 flex flex-col justify-between"
            style={{ backgroundColor: "rgb(245, 158, 11)" }}
          >
            <div>
              <p className="text-xs font-medium text-white/90 truncate">
                Nitrato Camiones Fábrica
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                {totalNitratoCF.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-white/20">
              <p className="text-[11px] text-white/80 truncate">
                Cap. Total: {capTotalNitratoCF.toLocaleString("es-CL")}t ({camionesCFDisponibles.length} disp.)
              </p>
              <p className="text-[11px] font-bold text-white mt-0.5 truncate">
                Disp: {capDisponibleNitratoCF.toFixed(1)}t ({camionesNitratoCF} cam. 25t)
              </p>
            </div>
          </div>

          {/* Matriz en Camiones Fábrica */}
          <div
            className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-sky-400/30 text-white min-w-0 flex flex-col justify-between"
            style={{ backgroundColor: "rgb(75, 162, 227)" }}
          >
            <div>
              <p className="text-xs font-medium text-white/90 truncate">
                Matriz Camiones Fábrica
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                {totalMatrizCF.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-white/20">
              <p className="text-[11px] text-white/80 truncate">
                Cap. Total: {capTotalMatrizCF.toLocaleString("es-CL")}t ({camionesCFDisponibles.length} disp.)
              </p>
              <p className="text-[11px] font-bold text-white mt-0.5 truncate">
                Disp: {capDisponibleMatrizCF.toFixed(1)}t ({camionesMatrizCF} cam. 25t)
              </p>
            </div>
          </div>

          {/* Nitrato en Estadía */}
          <div
            className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-amber-200 min-w-0"
            style={{ backgroundColor: "rgb(254, 243, 199)" }}
          >
            <p className="text-xs font-medium text-amber-900 truncate">
              Nitrato en Estadía
            </p>
            <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-1 truncate">
              {totalNitratoEstadia.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
            </p>
            <p className="text-[11px] text-amber-700 mt-1 truncate">
              {camionesEstadia.filter((c) => c.tipo === "nitrato").length} camión(es)
            </p>
          </div>

          {/* Matriz en Estadía */}
          <div
            className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-sky-200 min-w-0"
            style={{ backgroundColor: "rgb(227, 241, 253)" }}
          >
            <p className="text-xs font-medium text-sky-900 truncate">
              Matriz en Estadía
            </p>
            <p className="text-xl sm:text-2xl font-bold text-sky-900 mt-1 truncate">
              {totalMatrizEstadia.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
            </p>
            <p className="text-[11px] text-sky-700 mt-1 truncate">
              {camionesEstadia.filter((c) => c.tipo === "matriz").length} camión(es)
            </p>
          </div>

          {/* Gran Total Camiones */}
          <div className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-slate-300 bg-slate-800 text-white min-w-0 col-span-2 md:col-span-4 lg:col-span-1">
            <p className="text-xs font-medium text-slate-300 truncate">
              Total Tránsito Camiones
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
              {granTotalMaterialCamiones.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
            </p>
            <p className="text-[11px] text-slate-300 mt-1 truncate">
              N: {totalNitratoTransito.toFixed(1)}t | M: {totalMatrizTransito.toFixed(1)}t
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. REQUERIMIENTO PARA LLENAR (CAMIONES 25 TONELADAS)
      ======================================================== */}
      <div className="pt-6 border-t border-slate-200">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🚚</span> Requerimiento para Llenar (Camiones de Materias Primas - Media 25 ton)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo consolidado de camiones de materia prima necesarios para llenar silos operativos y camiones fábrica disponibles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Card Requerimiento Nitrato */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-200/80">
              <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Nitrato para Llenar
              </span>
              <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                {camionesNitratoTotal} camión(es)
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-2xl font-black text-amber-900">
                  {totalCapDisponibleNitrato.toLocaleString("es-CL", { maximumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-bold text-amber-800 ml-1">toneladas</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-amber-900">
                  {camionesNitratoTotal}
                </span>
                <span className="text-xs font-bold text-amber-700 ml-1">camiones</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-2 border-t border-amber-200/60 text-amber-800">
              <div className="flex justify-between">
                <span>• Silos Operativos ({cantNitratoOperativos}/{totalNitratoSilos}):</span>
                <span className="font-bold">
                  {capacidadDisponibleNitratoSilos.toFixed(1)} ton ({camionesNitratoSilos} cam.)
                </span>
              </div>
              <div className="flex justify-between">
                <span>• Camiones Fábrica ({camionesCFDisponibles.length} disp.):</span>
                <span className="font-bold">
                  {capDisponibleNitratoCF.toFixed(1)} ton ({camionesNitratoCF} cam.)
                </span>
              </div>
            </div>
          </div>

          {/* Card Requerimiento Matriz */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-sky-200/80">
              <span className="text-xs font-bold uppercase text-sky-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                Matriz para Llenar
              </span>
              <span className="text-xs font-black text-sky-900 bg-sky-200/80 px-2.5 py-0.5 rounded-full">
                {camionesMatrizTotal} camión(es)
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-2xl font-black text-sky-900">
                  {totalCapDisponibleMatriz.toLocaleString("es-CL", { maximumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-bold text-sky-800 ml-1">toneladas</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-sky-900">
                  {camionesMatrizTotal}
                </span>
                <span className="text-xs font-bold text-sky-700 ml-1">camiones</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-2 border-t border-sky-200/60 text-sky-800">
              <div className="flex justify-between">
                <span>• Silos Operativos ({cantMatrizOperativos}/{totalMatrizSilos}):</span>
                <span className="font-bold">
                  {capacidadDisponibleMatrizSilos.toFixed(1)} ton ({camionesMatrizSilos} cam.)
                </span>
              </div>
              <div className="flex justify-between">
                <span>• Camiones Fábrica ({camionesCFDisponibles.length} disp.):</span>
                <span className="font-bold">
                  {capDisponibleMatrizCF.toFixed(1)} ton ({camionesMatrizCF} cam.)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SilosResumen;
