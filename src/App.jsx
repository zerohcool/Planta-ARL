import { useState } from "react";
import { calibracionesIniciales } from "./data/calibraciones";
import {
  obtenerLitrosDesdeAltura,
  parsearCSVCalibracion,
} from "./utils/calculos";


function App() {
  const [petroleo, setPetroleo] = useState("");
  const [mezcla, setMezcla] = useState("");
  const [aceite, setAceite] = useState("");

  const [mezclaObjetivo, setMezclaObjetivo] = useState("");

  const [porcPetroleo, setPorcPetroleo] = useState(70);
  const [porcAceite, setPorcAceite] = useState(30);

  const [petroleoUsar, setPetroleoUsar] = useState("");
  const [aceiteUsar, setAceiteUsar] = useState("");

  const [alturaPetroleo, setAlturaPetroleo] = useState("");
  const [alturaMezcla, setAlturaMezcla] = useState("");
  const [alturaAceite, setAlturaAceite] = useState("");

  const [calibraciones, setCalibraciones] = useState(calibracionesIniciales);

  // Capacidades nominales en litros
  const capPetroleo = 20000;
  const capMezcla = 30000;
  const capAceite = 20000;

  const stockPetroleo = Number(petroleo) || 0;
  const stockMezcla = Number(mezcla) || 0;
  const stockAceite = Number(aceite) || 0;

  const objetivoLitros = Number(mezclaObjetivo) || 0;

  const utilizadoPetroleo = Number(petroleoUsar) || 0;
  const utilizadoAceite = Number(aceiteUsar) || 0;




  /*Funcion para cargar archivo */ 
    const cargarCSVCalibracion = (tipoEstanque, archivo) => {
      if (!archivo) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const texto = e.target.result;
        const datos = parsearCSVCalibracion(texto);

        if (datos.length === 0) {
          alert("El archivo no contiene datos válidos.");
          return;
        }

        setCalibraciones((prev) => ({
          ...prev,
          [tipoEstanque]: datos,
        }));
      };

      reader.readAsText(archivo);
    };








  /*Variables segun medicion */
    const litrosPetroleoDesdeAltura = obtenerLitrosDesdeAltura(
      calibraciones.petroleo,
      alturaPetroleo
    );

    const litrosMezclaDesdeAltura = obtenerLitrosDesdeAltura(
      calibraciones.mezcla,
      alturaMezcla
    );

    const litrosAceiteDesdeAltura = obtenerLitrosDesdeAltura(
      calibraciones.aceite,
      alturaAceite
    );

  /* VALIDACIONES STOCK */
  const errorPetroleo = stockPetroleo < 0 || stockPetroleo > capPetroleo;
  const errorMezcla = stockMezcla < 0 || stockMezcla > capMezcla;
  const errorAceite = stockAceite < 0 || stockAceite > capAceite;

  /* DISPONIBLE */
  const dispPetroleo = Math.max(0, capPetroleo - stockPetroleo);
  const dispMezcla = Math.max(0, capMezcla - stockMezcla);
  const dispAceite = Math.max(0, capAceite - stockAceite);

  /* NIVELES */
  const nivelPetroleo = Math.min((stockPetroleo / capPetroleo) * 100, 100);
  const nivelMezcla = Math.min((stockMezcla / capMezcla) * 100, 100);
  const nivelAceite = Math.min((stockAceite / capAceite) * 100, 100);

  /* VALIDACIÓN PORCENTAJES */
  const sumaPorcentajes = Number(porcPetroleo) + Number(porcAceite);
  const porcentajesValidos =
    Number(porcPetroleo) >= 0 &&
    Number(porcAceite) >= 0 &&
    Number(porcPetroleo) <= 100 &&
    Number(porcAceite) <= 100 &&
    sumaPorcentajes === 100;

  /* CALCULADORA */
  const petroleoNecesarioCalc = porcentajesValidos
    ? objetivoLitros * (porcPetroleo / 100)
    : 0;

  const aceiteNecesarioCalc = porcentajesValidos
    ? objetivoLitros * (porcAceite / 100)
    : 0;

  /* FABRICACIÓN */
  const errorPetroleoUsar = utilizadoPetroleo < 0;
  const errorAceiteUsar = utilizadoAceite < 0;

  const mezclaFabricada = utilizadoPetroleo + utilizadoAceite;

  /* PORCENTAJES FABRICADOS */
  const porcPetroleoFabricado = mezclaFabricada
    ? (utilizadoPetroleo / mezclaFabricada) * 100
    : 0;

  const porcAceiteFabricado = mezclaFabricada
    ? (utilizadoAceite / mezclaFabricada) * 100
    : 0;

  const inputBase = "w-full border rounded-lg p-3 outline-none transition";
  const inputOk =
    "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
  const inputError =
    "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-wide">Planta ARL</h1>
          <p className="text-sm text-slate-400 mt-1">
            Panel de operación y reporte
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="bg-blue-600 text-white rounded-xl px-4 py-3 font-medium shadow">
            Inicio
          </div>

          <div className="hover:bg-slate-800 rounded-xl px-4 py-3 text-slate-200 transition cursor-pointer">
            Stocks
          </div>

          <div className="hover:bg-slate-800 rounded-xl px-4 py-3 text-slate-200 transition cursor-pointer">
            Calculadora
          </div>

          <div className="hover:bg-slate-800 rounded-xl px-4 py-3 text-slate-200 transition cursor-pointer">
            Fabricado
          </div>

          <div className="hover:bg-slate-800 rounded-xl px-4 py-3 text-slate-200 transition cursor-pointer">
            Resumen
          </div>

          <div className="hover:bg-slate-800 rounded-xl px-4 py-3 text-slate-200 transition cursor-pointer">
            Calibraciones
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400">Estado del sistema</p>
            <p className="font-semibold text-green-400 mt-1">Operativo</p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <p className="text-sm text-slate-500">Dashboard</p>
            <h2 className="text-4xl font-bold text-slate-800">
              Control diario de estanques
            </h2>
            <p className="text-slate-500 mt-2">
              Registro de stock final, cálculo referencial de mezcla y reporte
              de fabricación.
            </p>
          </div>

          {/*seccion de prueba visual*/}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Cálculo por Altura
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h4 className="font-semibold mb-3">Petróleo</h4>
                <p className="text-sm text-slate-600 mb-1">Altura medida</p>
                <input
                  type="number"
                  value={alturaPetroleo}
                  onChange={(e) => setAlturaPetroleo(e.target.value)}
                  className="w-full border rounded-lg p-3"
                  placeholder="Ingrese altura"
                />

                <p className="text-sm text-slate-600 mt-4 mb-1">
                  Cargar calibración CSV
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => cargarCSVCalibracion("petroleo", e.target.files[0])}
                  className="w-full border rounded-lg p-2"
                />





                <p className="mt-3 text-slate-700">
                  Litros calculados:{" "}
                  <strong>{litrosPetroleoDesdeAltura.toLocaleString("es-CL")} L</strong>
                </p>


                <p className="mt-2 text-xs text-slate-500">
                  Puntos cargados: {calibraciones.petroleo.length}
                </p>



              </div>

              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h4 className="font-semibold mb-3">Mezcla</h4>
                <p className="text-sm text-slate-600 mb-1">Altura medida</p>
                <input
                  type="number"
                  value={alturaMezcla}
                  onChange={(e) => setAlturaMezcla(e.target.value)}
                  className="w-full border rounded-lg p-3"
                  placeholder="Ingrese altura"
                />

                <p className="text-sm text-slate-600 mt-4 mb-1">
                  Cargar calibración CSV
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => cargarCSVCalibracion("mezcla", e.target.files[0])}
                  className="w-full border rounded-lg p-2"
                />




                <p className="mt-3 text-slate-700">
                  Litros calculados:{" "}
                  <strong>{litrosMezclaDesdeAltura.toLocaleString("es-CL")} L</strong>
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Puntos cargados: {calibraciones.mezcla.length}
                </p>  




              </div>

              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h4 className="font-semibold mb-3">Aceite</h4>
                <p className="text-sm text-slate-600 mb-1">Altura medida</p>
                <input
                  type="number"
                  value={alturaAceite}
                  onChange={(e) => setAlturaAceite(e.target.value)}
                  className="w-full border rounded-lg p-3"
                  placeholder="Ingrese altura"
                />


                <p className="text-sm text-slate-600 mt-4 mb-1">
                  Cargar calibración CSV
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => cargarCSVCalibracion("aceite", e.target.files[0])}
                  className="w-full border rounded-lg p-2"
                />




                <p className="mt-3 text-slate-700">
                  Litros calculados:{" "}
                  <strong>{litrosAceiteDesdeAltura.toLocaleString("es-CL")} L</strong>
                </p>


                <p className="mt-2 text-xs text-slate-500">
                  Puntos cargados: {calibraciones.aceite.length}
                </p>



              </div>
            </div>
          </section>








          {/* TARJETAS RESUMEN */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
              <p className="text-sm text-slate-500">Capacidad Petróleo</p>
              <p className="text-2xl font-bold text-slate-800">
                {capPetroleo.toLocaleString("es-CL")} L
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
              <p className="text-sm text-slate-500">Capacidad Mezcla</p>
              <p className="text-2xl font-bold text-slate-800">
                {capMezcla.toLocaleString("es-CL")} L
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
              <p className="text-sm text-slate-500">Capacidad Aceite</p>
              <p className="text-2xl font-bold text-slate-800">
                {capAceite.toLocaleString("es-CL")} L
              </p>
            </div>
          </div>

          {/* STOCK */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Stocks</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* PETRÓLEO */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h2 className="font-semibold mb-3 text-slate-800">
                  Stock Petróleo
                </h2>

                <p className="text-sm text-slate-600 mb-1">
                  Stock final medido (L)
                </p>

                <input
                  type="number"
                  min="0"
                  max={capPetroleo}
                  placeholder="Litros"
                  value={petroleo}
                  onChange={(e) => setPetroleo(e.target.value)}
                  className={`${inputBase} ${
                    errorPetroleo ? inputError : inputOk
                  }`}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Capacidad máxima: {capPetroleo.toLocaleString("es-CL")} L
                </p>

                {errorPetroleo && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    El valor debe estar entre 0 y{" "}
                    {capPetroleo.toLocaleString("es-CL")} L.
                  </p>
                )}

                <p className="mt-3 text-sm text-slate-500">
                  Capacidad disponible: {dispPetroleo.toLocaleString("es-CL")} L
                </p>

                <div className="w-full bg-slate-200 rounded-full h-4 mt-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${nivelPetroleo}%` }}
                  ></div>
                </div>

                <p className="text-sm mt-2 text-slate-700 font-medium">
                  {nivelPetroleo.toFixed(0)} %
                </p>
              </div>

              {/* MEZCLA */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h2 className="font-semibold mb-3 text-slate-800">
                  Stock Mezcla
                </h2>

                <p className="text-sm text-slate-600 mb-1">
                  Stock final medido (L)
                </p>

                <input
                  type="number"
                  min="0"
                  max={capMezcla}
                  placeholder="Litros"
                  value={mezcla}
                  onChange={(e) => setMezcla(e.target.value)}
                  className={`${inputBase} ${
                    errorMezcla ? inputError : inputOk
                  }`}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Capacidad máxima: {capMezcla.toLocaleString("es-CL")} L
                </p>

                {errorMezcla && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    El valor debe estar entre 0 y{" "}
                    {capMezcla.toLocaleString("es-CL")} L.
                  </p>
                )}

                <p className="mt-3 text-sm text-slate-500">
                  Capacidad disponible: {dispMezcla.toLocaleString("es-CL")} L
                </p>

                <div className="w-full bg-slate-200 rounded-full h-4 mt-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${nivelMezcla}%` }}
                  ></div>
                </div>

                <p className="text-sm mt-2 text-slate-700 font-medium">
                  {nivelMezcla.toFixed(0)} %
                </p>
              </div>

              {/* ACEITE */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h2 className="font-semibold mb-3 text-slate-800">
                  Stock Aceite Residual
                </h2>

                <p className="text-sm text-slate-600 mb-1">
                  Stock final medido (L)
                </p>

                <input
                  type="number"
                  min="0"
                  max={capAceite}
                  placeholder="Litros"
                  value={aceite}
                  onChange={(e) => setAceite(e.target.value)}
                  className={`${inputBase} ${
                    errorAceite ? inputError : inputOk
                  }`}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Capacidad máxima: {capAceite.toLocaleString("es-CL")} L
                </p>

                {errorAceite && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    El valor debe estar entre 0 y{" "}
                    {capAceite.toLocaleString("es-CL")} L.
                  </p>
                )}

                <p className="mt-3 text-sm text-slate-500">
                  Capacidad disponible: {dispAceite.toLocaleString("es-CL")} L
                </p>

                <div className="w-full bg-slate-200 rounded-full h-4 mt-3 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-4 rounded-full transition-all"
                    style={{ width: `${nivelAceite}%` }}
                  ></div>
                </div>

                <p className="text-sm mt-2 text-slate-700 font-medium">
                  {nivelAceite.toFixed(0)} %
                </p>
              </div>
            </div>
          </section>

          {/* CALCULADORAS */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Operación
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* CALCULADORA */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">
                  Calculadora de Mezcla
                </h2>

                <p className="text-sm font-medium mb-1 text-slate-700">
                  Cantidad de mezcla a fabricar (L)
                </p>

                <input
                  type="number"
                  min="0"
                  placeholder="Litros"
                  value={mezclaObjetivo}
                  onChange={(e) => setMezclaObjetivo(e.target.value)}
                  className={`${inputBase} ${inputOk} mb-4`}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-1 text-slate-700">% Petróleo</p>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={porcPetroleo}
                      onChange={(e) => setPorcPetroleo(Number(e.target.value))}
                      className={`${inputBase} ${
                        porcentajesValidos ? inputOk : inputError
                      }`}
                    />
                  </div>

                  <div>
                    <p className="text-sm mb-1 text-slate-700">% Aceite</p>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={porcAceite}
                      onChange={(e) => setPorcAceite(Number(e.target.value))}
                      className={`${inputBase} ${
                        porcentajesValidos ? inputOk : inputError
                      }`}
                    />
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Suma de porcentajes:{" "}
                  <strong
                    className={
                      porcentajesValidos ? "text-green-600" : "text-red-600"
                    }
                  >
                    {sumaPorcentajes}%
                  </strong>
                </p>

                {!porcentajesValidos && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    Los porcentajes deben estar entre 0% y 100%, y sumar
                    exactamente 100%.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <p className="text-slate-600">Petróleo necesario</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {petroleoNecesarioCalc.toLocaleString("es-CL", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      L
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
                    <p className="text-slate-600">Aceite necesario</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {aceiteNecesarioCalc.toLocaleString("es-CL", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      L
                    </p>
                  </div>
                </div>
              </div>

              {/* FABRICADO */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">
                  Fabricado
                </h2>

                <p className="text-sm mb-1 text-slate-700">
                  Petróleo utilizado (L)
                </p>

                <input
                  type="number"
                  min="0"
                  placeholder="Litros"
                  value={petroleoUsar}
                  onChange={(e) => setPetroleoUsar(e.target.value)}
                  className={`${inputBase} ${
                    errorPetroleoUsar ? inputError : inputOk
                  } mb-3`}
                />

                {errorPetroleoUsar && (
                  <p className="mb-3 text-sm text-red-600 font-medium">
                    El valor no puede ser negativo.
                  </p>
                )}

                <p className="text-sm mb-1 text-slate-700">
                  Aceite utilizado (L)
                </p>

                <input
                  type="number"
                  min="0"
                  placeholder="Litros"
                  value={aceiteUsar}
                  onChange={(e) => setAceiteUsar(e.target.value)}
                  className={`${inputBase} ${
                    errorAceiteUsar ? inputError : inputOk
                  }`}
                />

                {errorAceiteUsar && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    El valor no puede ser negativo.
                  </p>
                )}

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
                  <p className="text-slate-700">
                    Mezcla fabricada:
                    <strong className="ml-2 text-slate-900">
                      {mezclaFabricada.toLocaleString("es-CL", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      L
                    </strong>
                  </p>

                  <p className="text-slate-700">
                    % Petróleo:
                    <strong className="ml-2 text-slate-900">
                      {porcPetroleoFabricado.toFixed(1)} %
                    </strong>
                  </p>

                  <p className="text-slate-700">
                    % Aceite:
                    <strong className="ml-2 text-slate-900">
                      {porcAceiteFabricado.toFixed(1)} %
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RESUMEN */}
          <section>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Resumen</h3>

            <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="pb-3">Estanque</th>
                    <th className="pb-3">Stock Final (L)</th>
                    <th className="pb-3">Utilizado (L)</th>
                    <th className="pb-3">Fabricado (L)</th>
                    <th className="pb-3">Capacidad Disponible (L)</th>
                  </tr>
                </thead>

                <tbody className="text-slate-800">
                  <tr className="border-b">
                    <td className="py-3">Petróleo</td>
                    <td>{stockPetroleo.toLocaleString("es-CL")}</td>
                    <td className="text-red-600">
                      {utilizadoPetroleo.toLocaleString("es-CL", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>-</td>
                    <td>{dispPetroleo.toLocaleString("es-CL")}</td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-3">Mezcla</td>
                    <td>{stockMezcla.toLocaleString("es-CL")}</td>
                    <td>-</td>
                    <td className="text-green-600">
                      {mezclaFabricada.toLocaleString("es-CL", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>{dispMezcla.toLocaleString("es-CL")}</td>
                  </tr>

                  <tr>
                    <td className="py-3">Aceite</td>
                    <td>{stockAceite.toLocaleString("es-CL")}</td>
                    <td className="text-red-600">
                      {utilizadoAceite.toLocaleString("es-CL", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>-</td>
                    <td>{dispAceite.toLocaleString("es-CL")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;