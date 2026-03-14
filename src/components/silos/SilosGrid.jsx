// ========================================
// IMPORTACIONES
// ========================================
import SiloMatrizCard from "./SiloMatrizCard";
import SiloNitratoCard from "./SiloNitratoCard";
import EmptySiloCard from "./EmptySiloCard";

// ========================================
// CONFIGURACIÓN VISUAL DE LA GRILLA
// ========================================
// Esta matriz define el orden visual de los silos en pantalla.
const silosConfig = [
  [
    { id: "C1", tipo: "matriz" },
    { id: "B1", tipo: "matriz" },
    { id: "A1", tipo: "matriz" },
  ],
  [
    { id: "C2", tipo: "matriz" },
    { id: "B2", tipo: "nitrato" },
    { id: "A2", tipo: "nitrato" },
  ],
  [
    { id: "C3", tipo: "nitrato" },
    { id: "B3", tipo: "blank" },
    { id: "A3", tipo: "nitrato" },
  ],
];

// ========================================
// COMPONENTE PRINCIPAL DE LA GRILLA
// ========================================
function SilosGrid({
  medicionesSilos,
  actualizarMedicionSilo,
  parametrosMatriz,
  parametrosNitrato,
}) {
  return (
    <div className="space-y-6">
      {silosConfig.map((fila, filaIndex) => (
        <div key={filaIndex} className="grid md:grid-cols-3 gap-6">
          {fila.map((silo) => {
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
