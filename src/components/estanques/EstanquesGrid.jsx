import EstanqueCard from "./EstanqueCard";
import { estanquesConfig } from "../../config/estanques";

function EstanquesGrid({
  modoIngreso = "litros",
  // Altura
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
  // Litros
  litrosPetroleo,
  setLitrosPetroleo,
  litrosMezcla,
  setLitrosMezcla,
  litrosAceite,
  setLitrosAceite,
  errorLitrosPetroleo,
  errorLitrosMezcla,
  errorLitrosAceite,
  capPetroleo,
  capMezcla,
  capAceite,
  // Estimaciones
  alturaEquivPetroleo,
  alturaEquivMezcla,
  alturaEquivAceite,
  // Valores calculados
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
      litros: litrosPetroleo,
      setLitros: setLitrosPetroleo,
      errorLitros: errorLitrosPetroleo,
      capTotal: capPetroleo,
      alturaEquivalente: alturaEquivPetroleo,
      stock: stockPetroleo,
      disponible: dispPetroleo,
      nivel: nivelPetroleo,
    },
    mezcla: {
      altura: alturaMezcla,
      setAltura: setAlturaMezcla,
      errorAltura: errorAlturaMezcla,
      maxAltura: maxAlturaMezcla,
      litros: litrosMezcla,
      setLitros: setLitrosMezcla,
      errorLitros: errorLitrosMezcla,
      capTotal: capMezcla,
      alturaEquivalente: alturaEquivMezcla,
      stock: stockMezcla,
      disponible: dispMezcla,
      nivel: nivelMezcla,
    },
    aceite: {
      altura: alturaAceite,
      setAltura: setAlturaAceite,
      errorAltura: errorAlturaAceite,
      maxAltura: maxAlturaAceite,
      litros: litrosAceite,
      setLitros: setLitrosAceite,
      errorLitros: errorLitrosAceite,
      capTotal: capAceite,
      alturaEquivalente: alturaEquivAceite,
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
            modoIngreso={modoIngreso}
            altura={data.altura}
            setAltura={data.setAltura}
            errorAltura={data.errorAltura}
            maxAltura={data.maxAltura}
            litros={data.litros}
            setLitros={data.setLitros}
            errorLitros={data.errorLitros}
            capTotal={data.capTotal}
            alturaEquivalente={data.alturaEquivalente}
            stock={data.stock}
            disponible={data.disponible}
            nivel={data.nivel}
            inputClass={inputClass}
            colorClasses={estanque.colorClasses}
            colorIcono={estanque.colorIcono}
          />
        );
      })}
    </div>
  );
}

export default EstanquesGrid;