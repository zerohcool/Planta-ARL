import { useMemo, useState } from "react";
import MateriaPrimaRow from "./MateriaPrimaRow";

function obtenerFechaHoraActual() {
  const ahora = new Date();

  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yyyy = ahora.getFullYear();
  const hh = String(ahora.getHours()).padStart(2, "0");
  const min = String(ahora.getMinutes()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

function crearFilaVacia() {
  return {
    guia: "",
    patenteCamion: "",
    patenteEstanque: "",
    material: "",
    cantidadKg: "",
    silo: "",
    despachado: false,
    despachadoFecha: "",
  };
}

function IngresoMateriasPrimas() {
  const [ingresos, setIngresos] = useState([crearFilaVacia()]);

  const materialesDisponibles = ["Matriz", "Nitrato"];
  const silosDisponibles = ["Silo Matriz", "Silo Nitrato", "Silo 3", "Silo 4"];

  const agregarFila = () => {
    setIngresos((prev) => [...prev, crearFilaVacia()]);
  };

  const eliminarFila = (index) => {
    setIngresos((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarFila = (index, campo, valor) => {
    setIngresos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
    );
  };

  const toggleEstado = (index) => {
    setIngresos((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const nuevoEstado = !item.despachado;

        return {
          ...item,
          despachado: nuevoEstado,
          despachadoFecha: nuevoEstado ? obtenerFechaHoraActual() : "",
        };
      })
    );
  };

  const resumen = useMemo(() => {
    const acumulado = {};
    let totalGeneral = 0;

    ingresos.forEach((item) => {
      const material = item.material?.trim();
      const cantidad = Number(item.cantidadKg) || 0;

      if (!material || cantidad <= 0) return;

      acumulado[material] = (acumulado[material] || 0) + cantidad;
      totalGeneral += cantidad;
    });

    return {
      porMaterial: Object.entries(acumulado),
      totalGeneral,
    };
  }, [ingresos]);

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Ingreso Materias Primas
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Registro de camiones recepcionados para abastecimiento de matriz o nitrato.
          </p>
        </div>

        <button
          type="button"
          onClick={agregarFila}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Agregar
        </button>
      </div>

      <div className="space-y-4">
        {ingresos.map((item, index) => (
          <MateriaPrimaRow
            key={index}
            item={item}
            index={index}
            materialesDisponibles={materialesDisponibles}
            silosDisponibles={silosDisponibles}
            onChange={actualizarFila}
            onToggleEstado={toggleEstado}
            onEliminar={eliminarFila}
          />
        ))}
      </div>

      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Resumen de totales recepcionados
        </h4>

        {resumen.porMaterial.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay cantidades ingresadas.
          </p>
        ) : (
          <div className="space-y-2">
            {resumen.porMaterial.map(([material, total]) => (
              <div
                key={material}
                className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="text-slate-700 font-medium">{material}</span>
                <span className="text-slate-900 font-bold">
                  {total.toLocaleString("es-CL")} kg
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3 mt-4">
              <span className="text-white font-semibold">Total general</span>
              <span className="text-white font-bold">
                {resumen.totalGeneral.toLocaleString("es-CL")} kg
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default IngresoMateriasPrimas;