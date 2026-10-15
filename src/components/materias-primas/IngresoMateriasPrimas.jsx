import { useEffect, useMemo, useState } from "react";
import MateriaPrimaRow from "./MateriaPrimaRow";
import { silosDisponiblesMMPP } from "../../config/silos";
import {
  obtenerFechaHoraActual,
  crearFilaVaciaMMPP,
} from "../../utils/materiasPrimas";

function IngresoMateriasPrimas({
  ingresos: ingresosProp,
  setIngresos: setIngresosProp,
}) {
  // Estado local de respaldo en caso de usarse de forma autónoma
  const [ingresosLocales, setIngresosLocales] = useState(() => {
    const guardados = localStorage.getItem("materiasPrimasPlantaARL");
    if (guardados) {
      try {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error al leer materias primas guardadas:", e);
      }
    }
    return [crearFilaVaciaMMPP()];
  });

  const ingresos = ingresosProp ?? ingresosLocales;
  const setIngresos = setIngresosProp ?? setIngresosLocales;

  // Persistencia local autónoma cuando no se controlan las props externamente
  useEffect(() => {
    if (!setIngresosProp) {
      localStorage.setItem(
        "materiasPrimasPlantaARL",
        JSON.stringify(ingresosLocales),
      );
    }
  }, [ingresosLocales, setIngresosProp]);

  const materialesDisponibles = ["Matriz", "Nitrato"];
  const silosDisponibles = silosDisponiblesMMPP;

  const agregarFila = () => {
    setIngresos((prev) => [...prev, crearFilaVaciaMMPP()]);
  };

  const eliminarFila = (index) => {
    setIngresos((prev) => {
      const filtrados = prev.filter((_, i) => i !== index);
      return filtrados.length > 0 ? filtrados : [crearFilaVaciaMMPP()];
    });
  };

  const limpiarRegistros = () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas limpiar la lista de ingresos de materias primas?",
    );
    if (!confirmar) return;
    setIngresos([crearFilaVaciaMMPP()]);
  };

  const actualizarFila = (index, campo, valor) => {
    setIngresos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item,
      ),
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
      }),
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={limpiarRegistros}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
          >
            Limpiar registros
          </button>
          <button
            type="button"
            onClick={agregarFila}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Agregar camión
          </button>
        </div>
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