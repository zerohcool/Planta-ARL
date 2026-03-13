import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { calibracionesIniciales } from "./data/calibraciones";
import { obtenerLitrosDesdeAltura } from "./utils/calculos";

function App() {
  const reporteRef = useRef(null);

  const fechaHoy = new Date().toISOString().split("T")[0];

  const [seccionActiva, setSeccionActiva] = useState("inicio");

  const [operador, setOperador] = useState("");
  const [fechaInforme, setFechaInforme] = useState(fechaHoy);

  const [alturaPetroleo, setAlturaPetroleo] = useState("");
  const [alturaMezcla, setAlturaMezcla] = useState("");
  const [alturaAceite, setAlturaAceite] = useState("");

  const [mezclaObjetivo, setMezclaObjetivo] = useState("");
  const [porcPetroleo, setPorcPetroleo] = useState(30);
  const [porcAceite, setPorcAceite] = useState(70);

  const [petroleoUsar, setPetroleoUsar] = useState("");
  const [aceiteUsar, setAceiteUsar] = useState("");

  const [calibraciones, setCalibraciones] = useState(() => {
    const guardadas = localStorage.getItem("calibracionesPlantaARL");

    if (guardadas) {
      try {
        return JSON.parse(guardadas);
      } catch (error) {
        console.error("Error al leer calibraciones guardadas:", error);
      }
    }

    return calibracionesIniciales;
  });

  useEffect(() => {
    localStorage.setItem(
      "calibracionesPlantaARL",
      JSON.stringify(calibraciones)
    );
  }, [calibraciones]);

  const cargarExcelCalibracion = (tipoEstanque, archivo) => {
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });

        const nombreHoja = workbook.SheetNames[0];
        const hoja = workbook.Sheets[nombreHoja];

        const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 });

        if (filas.length < 2) {
          alert("El archivo Excel no contiene suficientes datos.");
          return;
        }

        const encabezado1 = String(filas[0][0] ?? "").trim().toLowerCase();
        const encabezado2 = String(filas[0][1] ?? "").trim().toLowerCase();

        if (!encabezado1.includes("altura") || !encabezado2.includes("litro")) {
          alert(
            "El archivo no tiene el formato esperado. Debe contener columnas 'Altura' y 'Litros'."
          );
          return;
        }

        const datos = filas
          .slice(1)
          .map((fila) => ({
            altura: Number(fila[0]),
            litros: Number(fila[1]),
          }))
          .filter((item) => !isNaN(item.altura) && !isNaN(item.litros))
          .sort((a, b) => a.altura - b.altura);

        if (datos.length === 0) {
          alert("No se encontraron datos válidos en el Excel.");
          return;
        }

        setCalibraciones((prev) => ({
          ...prev,
          [tipoEstanque]: datos,
        }));

        alert(`Calibración cargada correctamente para ${tipoEstanque}.`);
      } catch (error) {
        console.error(error);
        alert("Hubo un error al leer el archivo Excel.");
      }
    };

    reader.readAsArrayBuffer(archivo);
  };

  const descargarPlantillaCalibracion = () => {
    const datos = [];

    for (let altura = 0; altura <= 260; altura += 5) {
      datos.push({
        Altura: altura,
        Litros: "",
      });
    }

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Calibracion");
    XLSX.writeFile(libro, "plantilla_calibracion.xlsx");
  };

  const exportarPDF = async () => {
    const elemento = reporteRef.current;
    if (!elemento) return;

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;

    const margin = 8;
    const imgWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    } else {
      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");

      const pxPerMm = canvas.width / imgWidth;
      const pageHeightPx = (pdfHeight - margin * 2) * pxPerMm;

      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        pageCtx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          pageHeightPx,
          0,
          0,
          canvas.width,
          pageHeightPx
        );

        const pageData = pageCanvas.toDataURL("image/png");

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageData, "PNG", margin, margin, imgWidth, pdfHeight - margin * 2);

        renderedHeight += pageHeightPx;
        pageIndex++;
      }
    }

    pdf.save(`reporte_planta_arl_${fechaInforme}.pdf`);
  };

  const stockPetroleo = obtenerLitrosDesdeAltura(
    calibraciones.petroleo,
    alturaPetroleo
  );

  const stockMezcla = obtenerLitrosDesdeAltura(
    calibraciones.mezcla,
    alturaMezcla
  );

  const stockAceite = obtenerLitrosDesdeAltura(
    calibraciones.aceite,
    alturaAceite
  );

  const capPetroleo =
    calibraciones.petroleo.length > 0
      ? calibraciones.petroleo[calibraciones.petroleo.length - 1].litros
      : 0;

  const capMezcla =
    calibraciones.mezcla.length > 0
      ? calibraciones.mezcla[calibraciones.mezcla.length - 1].litros
      : 0;

  const capAceite =
    calibraciones.aceite.length > 0
      ? calibraciones.aceite[calibraciones.aceite.length - 1].litros
      : 0;

  const dispPetroleo = Math.max(0, capPetroleo - stockPetroleo);
  const dispMezcla = Math.max(0, capMezcla - stockMezcla);
  const dispAceite = Math.max(0, capAceite - stockAceite);

  const nivelPetroleo =
    capPetroleo > 0 ? Math.min((stockPetroleo / capPetroleo) * 100, 100) : 0;

  const nivelMezcla =
    capMezcla > 0 ? Math.min((stockMezcla / capMezcla) * 100, 100) : 0;

  const nivelAceite =
    capAceite > 0 ? Math.min((stockAceite / capAceite) * 100, 100) : 0;

  const objetivoLitros = Number(mezclaObjetivo) || 0;
  const utilizadoPetroleo = Number(petroleoUsar) || 0;
  const utilizadoAceite = Number(aceiteUsar) || 0;

  const sumaPorcentajes = Number(porcPetroleo) + Number(porcAceite);

  const porcentajesValidos =
    Number(porcPetroleo) >= 0 &&
    Number(porcAceite) >= 0 &&
    Number(porcPetroleo) <= 100 &&
    Number(porcAceite) <= 100 &&
    sumaPorcentajes === 100;

  const petroleoNecesarioCalc = porcentajesValidos
    ? objetivoLitros * (porcPetroleo / 100)
    : 0;

  const aceiteNecesarioCalc = porcentajesValidos
    ? objetivoLitros * (porcAceite / 100)
    : 0;

  const mezclaFabricada = utilizadoPetroleo + utilizadoAceite;

  const porcPetroleoFabricado = mezclaFabricada
    ? (utilizadoPetroleo / mezclaFabricada) * 100
    : 0;

  const porcAceiteFabricado = mezclaFabricada
    ? (utilizadoAceite / mezclaFabricada) * 100
    : 0;

  const navButtonClass = (seccion) =>
    `w-full text-left rounded-xl px-4 py-3 font-medium transition ${
      seccionActiva === seccion
        ? "bg-blue-600 text-white shadow"
        : "text-slate-200 hover:bg-slate-800"
    }`;

  const inputClass =
    "w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-wide">Planta ARL</h1>
          <p className="text-sm text-slate-400 mt-1">
            Panel de operación y calibraciones
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setSeccionActiva("inicio")}
            className={navButtonClass("inicio")}
          >
            Inicio
          </button>

          <button
            onClick={() => setSeccionActiva("calibraciones")}
            className={navButtonClass("calibraciones")}
          >
            Calibraciones
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400">Estado del sistema</p>
            <p className="font-semibold text-green-400 mt-1">Operativo</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Dashboard</p>
              <h2 className="text-4xl font-bold text-slate-800">
                Control diario de estanques
              </h2>
              <p className="text-slate-500 mt-2">
                Medición por altura, cálculo de mezcla, registro de fabricación y
                gestión de calibraciones.
              </p>
            </div>

            {seccionActiva === "inicio" && (
              <button
                onClick={exportarPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl shadow transition whitespace-nowrap"
              >
                Exportar PDF
              </button>
            )}
          </div>

          {seccionActiva === "inicio" && (
            <section ref={reporteRef} className="space-y-8 bg-white/0">
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Datos del Informe
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Nombre del operador
                    </p>
                    <input
                      type="text"
                      value={operador}
                      onChange={(e) => setOperador(e.target.value)}
                      placeholder="Ingrese nombre del operador"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Fecha del informe
                    </p>
                    <input
                      type="date"
                      value={fechaInforme}
                      onChange={(e) => setFechaInforme(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Stock
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                    <h4 className="font-semibold mb-3 text-slate-800">
                      Petróleo
                    </h4>

                    <p className="text-sm text-slate-600 mb-1">Medición en cm</p>

                    <input
                      type="number"
                      value={alturaPetroleo}
                      onChange={(e) => setAlturaPetroleo(e.target.value)}
                      placeholder="Ingrese altura"
                      className={inputClass}
                    />

                    <p className="mt-4 text-sm text-slate-500">Stock calculado</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stockPetroleo.toLocaleString("es-CL")} L
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
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

                  <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                    <h4 className="font-semibold mb-3 text-slate-800">Mezcla</h4>

                    <p className="text-sm text-slate-600 mb-1">Medición en cm</p>

                    <input
                      type="number"
                      value={alturaMezcla}
                      onChange={(e) => setAlturaMezcla(e.target.value)}
                      placeholder="Ingrese altura"
                      className={inputClass}
                    />

                    <p className="mt-4 text-sm text-slate-500">Stock calculado</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stockMezcla.toLocaleString("es-CL")} L
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
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

                  <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                    <h4 className="font-semibold mb-3 text-slate-800">
                      Aceite Residual
                    </h4>

                    <p className="text-sm text-slate-600 mb-1">Medición en cm</p>

                    <input
                      type="number"
                      value={alturaAceite}
                      onChange={(e) => setAlturaAceite(e.target.value)}
                      placeholder="Ingrese altura"
                      className={inputClass}
                    />

                    <p className="mt-4 text-sm text-slate-500">Stock calculado</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stockAceite.toLocaleString("es-CL")} L
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
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
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Calculadora y Registro de Fabricación
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                    <h4 className="text-lg font-semibold mb-4 text-slate-800">
                      Calculadora de Mezcla
                    </h4>

                    <p className="text-sm font-medium mb-1 text-slate-700">
                      Cantidad de mezcla a fabricar (L)
                    </p>

                    <input
                      type="number"
                      min="0"
                      placeholder="Litros"
                      value={mezclaObjetivo}
                      onChange={(e) => setMezclaObjetivo(e.target.value)}
                      className={`${inputClass} mb-4`}
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
                          className={inputClass}
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
                          className={inputClass}
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
                        Los porcentajes deben sumar exactamente 100%.
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

                  <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                    <h4 className="text-lg font-semibold mb-4 text-slate-800">
                      Registro de Fabricación
                    </h4>

                    <p className="text-sm mb-1 text-slate-700">
                      Petróleo utilizado (L)
                    </p>
                    <input
                      type="number"
                      min="0"
                      placeholder="Litros"
                      value={petroleoUsar}
                      onChange={(e) => setPetroleoUsar(e.target.value)}
                      className={`${inputClass} mb-3`}
                    />

                    <p className="text-sm mb-1 text-slate-700">
                      Aceite utilizado (L)
                    </p>
                    <input
                      type="number"
                      min="0"
                      placeholder="Litros"
                      value={aceiteUsar}
                      onChange={(e) => setAceiteUsar(e.target.value)}
                      className={inputClass}
                    />

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
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Resumen
                </h3>

                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b text-left text-slate-600">
                        <th className="pb-3">Estanque</th>
                        <th className="pb-3">Altura (cm)</th>
                        <th className="pb-3">Stock (L)</th>
                        <th className="pb-3">Utilizado (L)</th>
                        <th className="pb-3">Fabricado (L)</th>
                        <th className="pb-3">Disponible (L)</th>
                      </tr>
                    </thead>

                    <tbody className="text-slate-800">
                      <tr className="border-b">
                        <td className="py-3">Petróleo</td>
                        <td>{alturaPetroleo || 0}</td>
                        <td className="font-bold">
                          {stockPetroleo.toLocaleString("es-CL")}
                        </td>
                        <td className="text-red-600 font-medium">
                          {utilizadoPetroleo.toLocaleString("es-CL", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-green-600 font-medium">-</td>
                        <td className="text-blue-600 font-medium">
                          {dispPetroleo.toLocaleString("es-CL")}
                        </td>
                      </tr>

                      <tr className="border-b">
                        <td className="py-3">Mezcla</td>
                        <td>{alturaMezcla || 0}</td>
                        <td className="font-bold">
                          {stockMezcla.toLocaleString("es-CL")}
                        </td>
                        <td className="text-red-600 font-medium">-</td>
                        <td className="text-green-600 font-medium">
                          {mezclaFabricada.toLocaleString("es-CL", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-blue-600 font-medium">
                          {dispMezcla.toLocaleString("es-CL")}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3">Aceite</td>
                        <td>{alturaAceite || 0}</td>
                        <td className="font-bold">
                          {stockAceite.toLocaleString("es-CL")}
                        </td>
                        <td className="text-red-600 font-medium">
                          {utilizadoAceite.toLocaleString("es-CL", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-green-600 font-medium">-</td>
                        <td className="text-blue-600 font-medium">
                          {dispAceite.toLocaleString("es-CL")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {seccionActiva === "calibraciones" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Calibraciones
              </h3>

              <p className="text-slate-500 mb-6">
                Carga de tablas de calibración por estanque desde archivos Excel.
                La plantilla usa columnas <strong>Altura</strong> y{" "}
                <strong>Litros</strong>.
              </p>

              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  onClick={descargarPlantillaCalibracion}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Descargar plantilla Excel
                </button>
              </div>

              <p className="text-sm text-green-600 mb-6">
                Las calibraciones cargadas se guardan automáticamente en este
                navegador.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                  <h4 className="font-semibold mb-3">Calibración Petróleo</h4>

                  <p className="text-sm text-slate-600 mb-1">
                    Cargar archivo Excel (.xlsx / .xls)
                  </p>

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) =>
                      cargarExcelCalibracion("petroleo", e.target.files[0])
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <p className="mt-3 text-sm text-slate-700">
                    Puntos cargados:{" "}
                    <strong>{calibraciones.petroleo.length}</strong>
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                  <h4 className="font-semibold mb-3">Calibración Mezcla</h4>

                  <p className="text-sm text-slate-600 mb-1">
                    Cargar archivo Excel (.xlsx / .xls)
                  </p>

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) =>
                      cargarExcelCalibracion("mezcla", e.target.files[0])
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <p className="mt-3 text-sm text-slate-700">
                    Puntos cargados: <strong>{calibraciones.mezcla.length}</strong>
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                  <h4 className="font-semibold mb-3">Calibración Aceite</h4>

                  <p className="text-sm text-slate-600 mb-1">
                    Cargar archivo Excel (.xlsx / .xls)
                  </p>

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) =>
                      cargarExcelCalibracion("aceite", e.target.files[0])
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <p className="mt-3 text-sm text-slate-700">
                    Puntos cargados: <strong>{calibraciones.aceite.length}</strong>
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;