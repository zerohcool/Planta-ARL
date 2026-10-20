// ========================================
// IMPORTACIONES
// ========================================
import SiloMatrizCard from "./SiloMatrizCard";
import SiloNitratoCard from "./SiloNitratoCard";
import EmptySiloCard from "./EmptySiloCard";
import { silosLayoutGrid } from "../../config/silos";

// ========================================
// COMPONENTE PRINCIPAL DE LA GRILLA
// ========================================
function SilosGrid({
  medicionesSilos,
  actualizarMedicionSilo,
  estadosSilos = {},
  actualizarEstadoSilo,
  parametrosMatriz,
  parametrosNitrato,
}) {
  return (
    <div className="space-y-6">
      {silosLayoutGrid.map((fila, filaIndex) => (
        <div key={filaIndex} className="grid md:grid-cols-3 gap-6">
          {fila.map((silo) => {
            const esOperativo = (estadosSilos[silo.id] ?? "operativo") === "operativo";

            if (silo.tipo === "matriz") {
              return (
                <SiloMatrizCard
                  key={silo.id}
                  titulo={`Silo ${silo.id}`}
                  medicion={medicionesSilos[silo.id]}
                  setMedicion={(valor) =>
                    actualizarMedicionSilo(silo.id, valor)
                  }
                  parametros={parametrosMatriz}
                  esOperativo={esOperativo}
                  onToggleOperativo={() =>
                    actualizarEstadoSilo && actualizarEstadoSilo(silo.id)
                  }
                />
              );
            }

            if (silo.tipo === "nitrato") {
              return (
                <SiloNitratoCard
                  key={silo.id}
                  titulo={`Silo ${silo.id}`}
                  medicion={medicionesSilos[silo.id]}
                  setMedicion={(valor) =>
                    actualizarMedicionSilo(silo.id, valor)
                  }
                  parametros={parametrosNitrato}
                  esOperativo={esOperativo}
                  onToggleOperativo={() =>
                    actualizarEstadoSilo && actualizarEstadoSilo(silo.id)
                  }
                />
              );
            }

            return <EmptySiloCard key={silo.id} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default SilosGrid;
