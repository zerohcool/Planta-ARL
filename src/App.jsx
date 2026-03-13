import { useState } from "react";

function App() {
  const [petroleo, setPetroleo] = useState("");
  const [mezcla, setMezcla] = useState("");
  const [aceite, setAceite] = useState("");

  const [mezclaObjetivo, setMezclaObjetivo] = useState("");

  const [porcPetroleo, setPorcPetroleo] = useState(70);
  const [porcAceite, setPorcAceite] = useState(30);

  const [petroleoUsar, setPetroleoUsar] = useState("");
  const [aceiteUsar, setAceiteUsar] = useState("");

  const capPetroleo = 20;
  const capMezcla = 30;
  const capAceite = 20;

  /* DISPONIBLE */

  const dispPetroleo = capPetroleo - (Number(petroleo) || 0);
  const dispMezcla = capMezcla - (Number(mezcla) || 0);
  const dispAceite = capAceite - (Number(aceite) || 0);

  /* NIVELES */

  const nivelPetroleo = ((Number(petroleo) || 0) / capPetroleo) * 100;
  const nivelMezcla = ((Number(mezcla) || 0) / capMezcla) * 100;
  const nivelAceite = ((Number(aceite) || 0) / capAceite) * 100;

  /* CALCULADORA */

  const petroleoNecesarioCalc =
    (Number(mezclaObjetivo) || 0) * (porcPetroleo / 100);
  const aceiteNecesarioCalc =
    (Number(mezclaObjetivo) || 0) * (porcAceite / 100);

  /* FABRICACION */

  const utilizadoPetroleo = Number(petroleoUsar) || 0;
  const utilizadoAceite = Number(aceiteUsar) || 0;

  const mezclaFabricada = utilizadoPetroleo + utilizadoAceite;

  /* PORCENTAJES */

  const porcPetroleoFabricado = mezclaFabricada
    ? (utilizadoPetroleo / mezclaFabricada) * 100
    : 0;

  const porcAceiteFabricado = mezclaFabricada
    ? (utilizadoAceite / mezclaFabricada) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Planta ARL</h1>

        {/* STOCK */}

        <div className="grid md:grid-cols-3 gap-6">
          {/* PETROLEO */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Stock Petróleo</h2>

            <input
              type="number"
              placeholder="m³"
              value={petroleo}
              onChange={(e) => setPetroleo(e.target.value)}
              className="w-full border rounded p-2"
            />

            <p className="mt-3 text-sm text-gray-500">
              Disponible: {dispPetroleo.toFixed(2)} m³
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${nivelPetroleo}%` }}
              ></div>
            </div>

            <p className="text-sm mt-1">{nivelPetroleo.toFixed(0)} %</p>
          </div>

          {/* MEZCLA */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Stock Mezcla</h2>

            <input
              type="number"
              placeholder="m³"
              value={mezcla}
              onChange={(e) => setMezcla(e.target.value)}
              className="w-full border rounded p-2"
            />

            <p className="mt-3 text-sm text-gray-500">
              Disponible: {dispMezcla.toFixed(2)} m³
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${nivelMezcla}%` }}
              ></div>
            </div>

            <p className="text-sm mt-1">{nivelMezcla.toFixed(0)} %</p>
          </div>

          {/* ACEITE */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Stock Aceite Residual</h2>

            <input
              type="number"
              placeholder="m³"
              value={aceite}
              onChange={(e) => setAceite(e.target.value)}
              className="w-full border rounded p-2"
            />

            <p className="mt-3 text-sm text-gray-500">
              Disponible: {dispAceite.toFixed(2)} m³
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
              <div
                className="bg-yellow-500 h-4 rounded-full"
                style={{ width: `${nivelAceite}%` }}
              ></div>
            </div>

            <p className="text-sm mt-1">{nivelAceite.toFixed(0)} %</p>
          </div>
        </div>

        {/* CALCULADORAS */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* CALCULADORA MEZCLA */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Calculadora de Mezcla
            </h2>

            <p className="text-sm font-medium">
              Cantidad de mezcla a fabricar (m³)
            </p>

            <input
              type="number"
              value={mezclaObjetivo}
              onChange={(e) => setMezclaObjetivo(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">% Petróleo</p>

                <input
                  type="number"
                  value={porcPetroleo}
                  onChange={(e) => setPorcPetroleo(Number(e.target.value))}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <p className="text-sm">% Aceite</p>

                <input
                  type="number"
                  value={porcAceite}
                  onChange={(e) => setPorcAceite(Number(e.target.value))}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <p>Petróleo necesario</p>

                <p className="text-2xl font-bold">
                  {petroleoNecesarioCalc.toFixed(2)} m³
                </p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <p>Aceite necesario</p>

                <p className="text-2xl font-bold">
                  {aceiteNecesarioCalc.toFixed(2)} m³
                </p>
              </div>
            </div>
          </div>

          {/* FABRICAR */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Fabricar Mezcla</h2>

            <p className="text-sm">Petróleo a usar (m³)</p>

            <input
              type="number"
              value={petroleoUsar}
              onChange={(e) => setPetroleoUsar(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            />

            <p className="text-sm">Aceite a usar (m³)</p>

            <input
              type="number"
              value={aceiteUsar}
              onChange={(e) => setAceiteUsar(e.target.value)}
              className="w-full border rounded p-2"
            />

            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <p>
                Mezcla generada:
                <strong className="ml-2">
                  {mezclaFabricada.toFixed(2)} m³
                </strong>
              </p>

              <p>
                % Petróleo:
                <strong className="ml-2">
                  {porcPetroleoFabricado.toFixed(1)} %
                </strong>
              </p>

              <p>
                % Aceite:
                <strong className="ml-2">
                  {porcAceiteFabricado.toFixed(1)} %
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* RESUMEN */}

        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-lg font-semibold mb-4">Resumen</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2">Estanque</th>
                <th className="pb-2">Stock</th>
                <th className="pb-2">Utilizado</th>
                <th className="pb-2">Fabricado</th>
                <th className="pb-2">Disponible</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="py-2">Petróleo</td>
                <td>{petroleo || 0}</td>
                <td className="text-red-600">{utilizadoPetroleo.toFixed(2)}</td>
                <td>-</td>
                <td>{dispPetroleo.toFixed(2)}</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">Mezcla</td>
                <td>{mezcla || 0}</td>
                <td>-</td>
                <td className="text-green-600">{mezclaFabricada.toFixed(2)}</td>
                <td>{dispMezcla.toFixed(2)}</td>
              </tr>

              <tr>
                <td className="py-2">Aceite</td>
                <td>{aceite || 0}</td>
                <td className="text-red-600">{utilizadoAceite.toFixed(2)}</td>
                <td>-</td>
                <td>{dispAceite.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
