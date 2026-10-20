import React, { useState } from "react";
import { estadosCamion } from "../../data/camiones";
import { IconoCamionLleno } from "./CamionIcons";

function RegistroCamionesFabrica({
  flota,
  onAgregarCamion,
  onEditarCamion,
  onEliminarCamion,
  onCambiarEstado,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [camionEditando, setCamionEditando] = useState(null);

  // Estado del formulario
  const [formId, setFormId] = useState("");
  const [formPatente, setFormPatente] = useState("");
  const [formCapNitrato, setFormCapNitrato] = useState("");
  const [formCapMatriz, setFormCapMatriz] = useState("");
  const [formCapPetroleo, setFormCapPetroleo] = useState("");
  const [formEstado, setFormEstado] = useState("disponible");
  const [errorForm, setErrorForm] = useState("");

  const abrirModalCrear = () => {
    setCamionEditando(null);
    setFormId("");
    setFormPatente("");
    setFormCapNitrato("");
    setFormCapMatriz("");
    setFormCapPetroleo("");
    setFormEstado("disponible");
    setErrorForm("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (camion) => {
    setCamionEditando(camion);
    setFormId(camion.id);
    setFormPatente(camion.patente);
    setFormCapNitrato(String(camion.capacidadNitrato));
    setFormCapMatriz(String(camion.capacidadMatriz));
    setFormCapPetroleo(String(camion.capacidadPetroleo));
    setFormEstado(camion.estado || "disponible");
    setErrorForm("");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCamionEditando(null);
    setErrorForm("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formId.trim()) {
      setErrorForm("El identificador del camión (ID) es obligatorio.");
      return;
    }

    if (!formPatente.trim()) {
      setErrorForm("La patente es obligatoria.");
      return;
    }

    const nitrato = Number(formCapNitrato);
    const matriz = Number(formCapMatriz);
    const petroleo = Number(formCapPetroleo);

    if (isNaN(nitrato) || nitrato <= 0) {
      setErrorForm("La capacidad de nitrato debe ser un número mayor a 0.");
      return;
    }

    if (isNaN(matriz) || matriz <= 0) {
      setErrorForm("La capacidad de matriz debe ser un número mayor a 0.");
      return;
    }

    if (isNaN(petroleo) || petroleo < 0) {
      setErrorForm("La capacidad de petróleo debe ser un valor válido.");
      return;
    }

    // Verificar ID duplicado si es nuevo o si cambió
    const existeId = flota.some(
      (c) =>
        c.id.toLowerCase() === formId.trim().toLowerCase() &&
        (!camionEditando || c.id !== camionEditando.id),
    );

    if (existeId) {
      setErrorForm(`Ya existe un camión registrado con el ID "${formId.trim()}".`);
      return;
    }

    const payload = {
      id: formId.trim().toUpperCase(),
      patente: formPatente.trim().toUpperCase(),
      capacidadNitrato: nitrato,
      capacidadMatriz: matriz,
      capacidadPetroleo: petroleo,
      estado: formEstado,
    };

    if (camionEditando) {
      onEditarCamion(camionEditando.id, payload);
    } else {
      onAgregarCamion(payload);
    }

    cerrarModal();
  };

  const confirmarEliminar = (camion) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar el camión ${camion.id} (${camion.patente})? Esta acción no se puede deshacer.`,
      )
    ) {
      onEliminarCamion(camion.id);
    }
  };

  // Contadores
  const totalCamiones = flota.length;
  const disponibles = flota.filter((c) => c.estado === "disponible").length;
  const noOperativos = flota.filter((c) => c.estado === "no operativo").length;
  const fueraFaena = flota.filter((c) => c.estado === "fuera de faena").length;

  return (
    <div className="space-y-6">
      {/* Encabezado de la sección */}
      <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <IconoCamionLleno className="w-7 h-7" />
            </span>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Registro de Camiones Fábrica
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Gestión de flota, patentes, capacidades de carga y estado operativo para faena.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start md:self-auto"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Camión Fábrica
        </button>
      </div>

      {/* Tarjetas resumen de estado de la flota */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Flota
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCamiones}</p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Disponibles
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{disponibles}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">
              No Operativos
            </p>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-1">{noOperativos}</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Fuera de Faena
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{fueraFaena}</p>
        </div>
      </div>

      {/* Grilla de Tarjetas de Camiones */}
      {flota.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow border border-slate-200 text-center">
          <IconoCamionLleno className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <h4 className="text-lg font-bold text-slate-700">No hay camiones fábrica registrados</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Comienza agregando el primer camión fábrica haciendo clic en el botón superior "Nuevo Camión Fábrica".
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flota.map((camion) => {
            const configEstado =
              estadosCamion.find((e) => e.valor === camion.estado) || estadosCamion[0];

            return (
              <div
                key={camion.id}
                className="bg-white rounded-2xl shadow border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Encabezado tarjeta */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                        <IconoCamionLleno className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 leading-tight">
                          {camion.id}
                        </h4>
                        <p className="text-sm font-semibold text-slate-500 tracking-wider">
                          {camion.patente}
                        </p>
                      </div>
                    </div>

                    {/* Selector rápido de estado */}
                    <div className="relative">
                      <select
                        value={camion.estado}
                        onChange={(e) => onCambiarEstado(camion.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition ${configEstado.badgeClass}`}
                      >
                        {estadosCamion.map((est) => (
                          <option key={est.valor} value={est.valor}>
                            {est.etiqueta}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Capacidades del camión */}
                  <div className="space-y-2.5 py-4 border-y border-slate-100">
                    {/* Nitrato */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        Capacidad Nitrato:
                      </span>
                      <span className="font-bold text-slate-800">
                        {camion.capacidadNitrato.toLocaleString("es-CL")} ton
                      </span>
                    </div>

                    {/* Matriz */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        Capacidad Matriz:
                      </span>
                      <span className="font-bold text-slate-800">
                        {camion.capacidadMatriz.toLocaleString("es-CL")} ton
                      </span>
                    </div>

                    {/* Petróleo */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Capacidad Petróleo:
                      </span>
                      <span className="font-bold text-slate-800">
                        {camion.capacidadPetroleo.toLocaleString("es-CL")} L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-5 pt-3 flex items-center justify-end gap-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(camion)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => confirmarEliminar(camion)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Camión Fábrica */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-xl font-bold text-slate-800">
                {camionEditando ? "Editar Camión Fábrica" : "Nuevo Camión Fábrica"}
              </h4>
              <button
                type="button"
                onClick={cerrarModal}
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {errorForm && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                  {errorForm}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ID Camión
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="Ej: CF-01"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Patente
                  </label>
                  <input
                    type="text"
                    value={formPatente}
                    onChange={(e) => setFormPatente(e.target.value)}
                    placeholder="Ej: ABCD-12"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">
                    Cap. Nitrato (ton)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCapNitrato}
                    onChange={(e) => setFormCapNitrato(e.target.value)}
                    placeholder="12"
                    className="w-full border border-amber-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-800 mb-1">
                    Cap. Matriz (ton)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCapMatriz}
                    onChange={(e) => setFormCapMatriz(e.target.value)}
                    placeholder="10"
                    className="w-full border border-sky-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">
                    Cap. Petróleo (L)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formCapPetroleo}
                    onChange={(e) => setFormCapPetroleo(e.target.value)}
                    placeholder="600"
                    className="w-full border border-emerald-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Estado Operativo
                </label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 font-medium"
                >
                  {estadosCamion.map((est) => (
                    <option key={est.valor} value={est.valor}>
                      {est.etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition cursor-pointer"
                >
                  {camionEditando ? "Guardar Cambios" : "Crear Camión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroCamionesFabrica;
