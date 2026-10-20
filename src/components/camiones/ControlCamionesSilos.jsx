import React from "react";
import { IconoLleno, IconoVacio } from "../silos/SiloGaugeIcons";
import { IconoCamionLleno } from "./CamionIcons";
import { MAX_TON_ESTADIA } from "../../data/camiones";

function ControlCamionesSilos({
  flota,
  cargasCamiones,
  onActualizarCargaCamion,
  onCambiarEstadoCamion,
  camionesEstadia,
  onAgregarCamionEstadia,
  onActualizarCamionEstadia,
  onEliminarCamionEstadia,
}) {
  // Filtramos los camiones fábrica en faena (disponibles y no operativos, excluyendo fuera de faena)
  const camionesEnFaena = flota.filter(
    (c) => c.estado === "disponible" || c.estado === "no operativo"
  );
  const cantDisponibles = camionesEnFaena.filter((c) => c.estado === "disponible").length;
  const cantNoOperativos = camionesEnFaena.filter((c) => c.estado === "no operativo").length;

  // ========================================
  // CÁLCULOS DEL RESUMEN
  // ========================================
  // 1. Camiones Fábrica en faena
  let totalNitratoCF = 0;
  let totalMatrizCF = 0;
  let capTotalNitratoCF = 0;
  let capTotalMatrizCF = 0;

  camionesEnFaena.forEach((camion) => {
    const carga = cargasCamiones[camion.id] || { nitrato: "0", matriz: "0" };
    const nit = Math.min(camion.capacidadNitrato, Math.max(0, Number(carga.nitrato) || 0));
    const mat = Math.min(camion.capacidadMatriz, Math.max(0, Number(carga.matriz) || 0));

    totalNitratoCF += nit;
    totalMatrizCF += mat;
    capTotalNitratoCF += camion.capacidadNitrato;
    capTotalMatrizCF += camion.capacidadMatriz;
  });

  // 2. Camiones con Estadía
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

  // 3. Totales combinados
  const totalNitratoTransito = totalNitratoCF + totalNitratoEstadia;
  const totalMatrizTransito = totalMatrizCF + totalMatrizEstadia;
  const granTotalMaterialCamiones = totalNitratoTransito + totalMatrizTransito;

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-8">
      {/* ========================================================
          SECCIÓN 1: CAMIONES FÁBRICA EN FAENA (HORIZONTAL)
      ======================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
                <IconoCamionLleno className="w-5 h-5" />
              </span>
              <h4 className="text-xl font-bold text-slate-800">
                Control de Camiones Fábrica
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {cantDisponibles} Disponibles
              </span>
              {cantNoOperativos > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                  {cantNoOperativos} No Operativos
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Registro diario de carga de Nitrato y Matriz en camiones fábrica en faena. Puedes alternar el estado (Disponible, No Operativo o Fuera de Faena).
            </p>
          </div>
        </div>

        {camionesEnFaena.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No hay camiones fábrica en faena (Disponibles o No Operativos).
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Ve a la sección "Camiones Fábrica" en el menú lateral para registrar camiones o cambiar su estado a disponible.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {camionesEnFaena.map((camion) => {
              const carga = cargasCamiones[camion.id] || { nitrato: "0", matriz: "0" };
              const valNit = Number(carga.nitrato) || 0;
              const valMat = Number(carga.matriz) || 0;

              const porcNit = Math.min(100, Math.max(0, (valNit / camion.capacidadNitrato) * 100));
              const porcMat = Math.min(100, Math.max(0, (valMat / camion.capacidadMatriz) * 100));

              const nitLleno = valNit >= camion.capacidadNitrato;
              const matLleno = valMat >= camion.capacidadMatriz;

              const toggleNit = () => {
                if (nitLleno) {
                  onActualizarCargaCamion(camion.id, "nitrato", "0");
                } else {
                  onActualizarCargaCamion(camion.id, "nitrato", String(camion.capacidadNitrato));
                }
              };

              const toggleMat = () => {
                if (matLleno) {
                  onActualizarCargaCamion(camion.id, "matriz", "0");
                } else {
                  onActualizarCargaCamion(camion.id, "matriz", String(camion.capacidadMatriz));
                }
              };

              const esNoOperativo = camion.estado === "no operativo";

              return (
                <div
                  key={camion.id}
                  className={`rounded-2xl border p-4 transition shadow-2xs ${
                    esNoOperativo
                      ? "bg-red-50/20 border-red-200 hover:border-red-300"
                      : "bg-slate-50/60 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {/* Fila Horizontal: ID | Tarjeta Nitrato | Tarjeta Matriz | Estado */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
                    {/* 1. ID Y DATOS BÁSICOS */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                          esNoOperativo
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {camion.id}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-800 text-base leading-tight">
                            Camión {camion.id}
                          </h5>
                          {esNoOperativo && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                              No Op.
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                          Patente: {camion.patente}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Petróleo: {camion.capacidadPetroleo} L
                        </p>
                      </div>
                    </div>

                    {/* 2. TARJETA NITRATO */}
                    <div className="lg:col-span-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Nitrato (Máx: {camion.capacidadNitrato}t)
                        </label>
                        <span className="text-xs font-bold text-amber-800">
                          {porcNit.toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={camion.capacidadNitrato}
                            value={carga.nitrato}
                            onChange={(e) =>
                              onActualizarCargaCamion(camion.id, "nitrato", e.target.value)
                            }
                            placeholder="0"
                            className="w-full border border-amber-300 rounded-lg py-1.5 px-2.5 pr-8 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700 pointer-events-none">
                            ton
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={toggleNit}
                          title={
                            nitLleno
                              ? `Nitrato lleno (${camion.capacidadNitrato} ton). Clic para vaciar a 0.`
                              : `Cargar nitrato al máximo (${camion.capacidadNitrato} ton).`
                          }
                          className="p-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg transition shadow-2xs flex items-center justify-center shrink-0 cursor-pointer h-[34px] w-[34px]"
                          style={{ color: "rgb(245, 158, 11)" }}
                        >
                          {nitLleno ? (
                            <IconoLleno className="w-5 h-5 transition-transform active:scale-95" />
                          ) : (
                            <IconoVacio className="w-5 h-5 transition-transform active:scale-95" />
                          )}
                        </button>
                      </div>

                      {/* Barra de progreso Nitrato */}
                      <div className="w-full bg-amber-200/70 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: "rgb(245, 158, 11)",
                            width: `${porcNit}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 3. TARJETA MATRIZ */}
                    <div className="lg:col-span-3 p-3 bg-sky-50/80 rounded-xl border border-sky-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          Matriz (Máx: {camion.capacidadMatriz}t)
                        </label>
                        <span className="text-xs font-bold text-sky-800">
                          {porcMat.toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={camion.capacidadMatriz}
                            value={carga.matriz}
                            onChange={(e) =>
                              onActualizarCargaCamion(camion.id, "matriz", e.target.value)
                            }
                            placeholder="0"
                            className="w-full border border-sky-300 rounded-lg py-1.5 px-2.5 pr-8 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-700 pointer-events-none">
                            ton
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={toggleMat}
                          title={
                            matLleno
                              ? `Matriz llena (${camion.capacidadMatriz} ton). Clic para vaciar a 0.`
                              : `Cargar matriz al máximo (${camion.capacidadMatriz} ton).`
                          }
                          className="p-1 bg-white hover:bg-sky-100 border border-sky-300 rounded-lg transition shadow-2xs flex items-center justify-center shrink-0 cursor-pointer h-[34px] w-[34px]"
                          style={{ color: "rgb(75, 162, 227)" }}
                        >
                          {matLleno ? (
                            <IconoLleno className="w-5 h-5 transition-transform active:scale-95" />
                          ) : (
                            <IconoVacio className="w-5 h-5 transition-transform active:scale-95" />
                          )}
                        </button>
                      </div>

                      {/* Barra de progreso Matriz */}
                      <div className="w-full bg-sky-200/70 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: "rgb(75, 162, 227)",
                            width: `${porcMat}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 4. ESTADO */}
                    <div className="lg:col-span-3 flex flex-col justify-center">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Estado del Camión
                      </label>
                      <div className="relative">
                        <select
                          value={camion.estado}
                          onChange={(e) => onCambiarEstadoCamion(camion.id, e.target.value)}
                          className={`w-full text-xs font-bold rounded-xl py-2 px-3 border shadow-2xs cursor-pointer focus:outline-none focus:ring-2 appearance-none pr-8 transition ${
                            camion.estado === "disponible"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-200"
                              : camion.estado === "no operativo"
                              ? "bg-red-50 text-red-800 border-red-300 focus:ring-red-200"
                              : "bg-slate-100 text-slate-700 border-slate-300 focus:ring-slate-200"
                          }`}
                        >
                          <option value="disponible">🟢 Disponible</option>
                          <option value="no operativo">🔴 No Operativo</option>
                          <option value="fuera de faena">⚪ Fuera de Faena</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          SECCIÓN 2: CAMIONES DE MATERIAS PRIMAS CON ESTADÍA (HORIZONTAL)
      ======================================================== */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <h4 className="text-xl font-bold text-slate-800">
                Camiones de Materias Primas con Estadía
              </h4>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Camiones externos (ramplas o bateas) que pernoctan en faena con carga de Nitrato o Matriz (máx. {MAX_TON_ESTADIA} ton/camión).
            </p>
          </div>

          <button
            type="button"
            onClick={onAgregarCamionEstadia}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Camión Estadía
          </button>
        </div>

        {camionesEstadia.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
            <p className="text-sm text-slate-500">
              No hay camiones de materia prima con estadía registrados en este turno.
            </p>
            <button
              type="button"
              onClick={onAgregarCamionEstadia}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              + Registrar camión con estadía
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {camionesEstadia.map((camion, index) => {
              const valTon = Number(camion.toneladas) || 0;
              const estaLleno = valTon >= MAX_TON_ESTADIA;
              const esNitrato = camion.tipo === "nitrato";

              const toggleLlenoEstadia = () => {
                if (estaLleno) {
                  onActualizarCamionEstadia(camion.id, "toneladas", "0");
                } else {
                  onActualizarCamionEstadia(camion.id, "toneladas", String(MAX_TON_ESTADIA));
                }
              };

              return (
                <div
                  key={camion.id}
                  className={`p-3.5 rounded-2xl border shadow-2xs transition ${
                    esNitrato
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-sky-50/60 border-sky-200"
                  }`}
                >
                  {/* Fila Horizontal: Estadía # & Patente | Tipo Materia Prima | Toneladas (Lleno/Vacío) | Eliminar */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                    {/* COL 1: ÍNDICE Y IDENTIFICADOR / PATENTE (md:col-span-4) */}
                    <div className="md:col-span-4 flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-black shrink-0 border ${
                          esNitrato
                            ? "bg-amber-200 text-amber-900 border-amber-300"
                            : "bg-sky-200 text-sky-900 border-sky-300"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Patente / Identificador
                        </label>
                        <input
                          type="text"
                          value={camion.identificador}
                          onChange={(e) =>
                            onActualizarCamionEstadia(
                              camion.id,
                              "identificador",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="Ej: Batea 01 / Patente"
                          className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>

                    {/* COL 2: MATERIA PRIMA (NITRATO / MATRIZ) (md:col-span-3) */}
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Materia Prima
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onActualizarCamionEstadia(camion.id, "tipo", "nitrato")
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                            esNitrato
                              ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${esNitrato ? "bg-white" : "bg-amber-500"}`}
                          ></span>
                          Nitrato
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onActualizarCamionEstadia(camion.id, "tipo", "matriz")
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                            !esNitrato
                              ? "bg-sky-500 text-white border-sky-600 shadow-2xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-sky-50"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${!esNitrato ? "bg-white" : "bg-sky-500"}`}
                          ></span>
                          Matriz
                        </button>
                      </div>
                    </div>

                    {/* COL 3: CARGA TONELADAS (MÁX 28 TON) CON BOTÓN LLENO / VACÍO (md:col-span-4) */}
                    <div className="md:col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">
                          Carga (Máx {MAX_TON_ESTADIA} ton)
                        </label>
                        <span className="text-[11px] font-bold text-slate-700">
                          {((valTon / MAX_TON_ESTADIA) * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={MAX_TON_ESTADIA}
                            value={camion.toneladas}
                            onChange={(e) =>
                              onActualizarCamionEstadia(
                                camion.id,
                                "toneladas",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
                            ton
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={toggleLlenoEstadia}
                          title={
                            estaLleno
                              ? `Camión lleno (${MAX_TON_ESTADIA} ton). Clic para vaciar a 0.`
                              : `Cargar camión al máximo (${MAX_TON_ESTADIA} ton).`
                          }
                          className={`p-1 bg-white border rounded-lg transition shadow-2xs flex items-center justify-center shrink-0 cursor-pointer h-[32px] w-[32px] ${
                            esNitrato
                              ? "border-amber-300 hover:bg-amber-100 text-amber-500"
                              : "border-sky-300 hover:bg-sky-100 text-sky-500"
                          }`}
                        >
                          {estaLleno ? (
                            <IconoLleno className="w-5 h-5 transition-transform active:scale-95" />
                          ) : (
                            <IconoVacio className="w-5 h-5 transition-transform active:scale-95" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* COL 4: BOTÓN ELIMINAR (md:col-span-1) */}
                    <div className="md:col-span-1 flex items-center justify-end md:justify-center pt-2 md:pt-4">
                      <button
                        type="button"
                        onClick={() => onEliminarCamionEstadia(camion.id)}
                        title="Eliminar este camión con estadía"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          SECCIÓN 3: RESUMEN GENERAL DE CAMIONES Y ESTADÍAS
      ======================================================== */}
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-xl font-bold text-slate-800 mb-4">
          Resumen General de Camiones y Estadías
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Nitrato en Camiones Fábrica */}
          <div
            className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-amber-600/30 text-white min-w-0"
            style={{ backgroundColor: "rgb(245, 158, 11)" }}
          >
            <p className="text-xs font-medium text-white/90 truncate">
              Nitrato Camiones Fábrica
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
              {totalNitratoCF.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
            </p>
            <p className="text-[11px] text-white/80 mt-1 truncate">
              Cap: {capTotalNitratoCF.toLocaleString("es-CL")}t ({cantDisponibles} disp. / {cantNoOperativos} no op.)
            </p>
          </div>

          {/* Matriz en Camiones Fábrica */}
          <div
            className="p-3.5 sm:p-4 rounded-xl shadow-sm border border-sky-400/30 text-white min-w-0"
            style={{ backgroundColor: "rgb(75, 162, 227)" }}
          >
            <p className="text-xs font-medium text-white/90 truncate">
              Matriz Camiones Fábrica
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
              {totalMatrizCF.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ton
            </p>
            <p className="text-[11px] text-white/80 mt-1 truncate">
              Cap: {capTotalMatrizCF.toLocaleString("es-CL")}t ({cantDisponibles} disp. / {cantNoOperativos} no op.)
            </p>
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
    </div>
  );
}

export default ControlCamionesSilos;
