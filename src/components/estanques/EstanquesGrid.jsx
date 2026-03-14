import EstanqueCard from "./EstanqueCard";
import { estanquesConfig } from "../../config/estanques";

function EstanquesGrid({
  alturaPetroleo,
  setAlturaPetroleo,
  alturaMezcla,
  setAlturaMezcla,
  alturaAceite,
  setAlturaAceite,
  errorAlturaPetroleo,
  errorAlturaMezcla,
  errorAlturaAceite,
  maxAlturaPetroleo,
  maxAlturaMezcla,
  maxAlturaAceite,
  stockPetroleo,
  stockMezcla,
  stockAceite,
  dispPetroleo,
  dispMezcla,
  dispAceite,
  nivelPetroleo,
  nivelMezcla,
  nivelAceite,
  inputClass,
}) {
  const estanquesData = {
    petroleo: {
      altura: alturaPetroleo,
      setAltura: setAlturaPetroleo,
      errorAltura: errorAlturaPetroleo,
      maxAltura: maxAlturaPetroleo,
      stock: stockPetroleo,
      disponible: dispPetroleo,
      nivel: nivelPetroleo,
    },
    mezcla: {
      altura: alturaMezcla,
      setAltura: setAlturaMezcla,
      errorAltura: errorAlturaMezcla,
      maxAltura: maxAlturaMezcla,
      stock: stockMezcla,
      disponible: dispMezcla,
      nivel: nivelMezcla,
    },
    aceite: {
      altura: alturaAceite,
      setAltura: setAlturaAceite,
      errorAltura: errorAlturaAceite,
      maxAltura: maxAlturaAceite,
      stock: stockAceite,
      disponible: dispAceite,
      nivel: nivelAceite,
    },
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {estanquesConfig.map((estanque) => {
        const data = estanquesData[estanque.key];

        return (
          <EstanqueCard
            key={estanque.key}
            titulo={estanque.nombre}
            altura={data.altura}
            setAltura={data.setAltura}
            errorAltura={data.errorAltura}
            maxAltura={data.maxAltura}
            stock={data.stock}
            disponible={data.disponible}
            nivel={data.nivel}
            inputClass={inputClass}
            colorClasses={estanque.colorClasses}
          />
        );
      })}
    </div>
  );
}

export default EstanquesGrid;