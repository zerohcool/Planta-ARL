import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "./assets/logo.png";
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
      JSON.stringify(calibraciones),
    );
  }, [calibraciones]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}-${mes}-${anio}`;
  };

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

        const encabezado1 = String(filas[0][0] ?? "")
          .trim()
          .toLowerCase();
        const encabezado2 = String(filas[0][1] ?? "")
          .trim()
          .toLowerCase();

        if (!encabezado1.includes("altura") || !encabezado2.includes("litro")) {
          alert(
            "El archivo no tiene el formato esperado. Debe contener columnas 'Altura' y 'Litros'.",
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
      const escala = (pdfHeight - margin * 2) / imgHeight;
      const ajustadoWidth = imgWidth * escala;
      const xCentrado = (pdfWidth - ajustadoWidth) / 2;
      pdf.addImage(
        imgData,
        "PNG",
        xCentrado,
        margin,
        ajustadoWidth,
        pdfHeight - margin * 2,
      );
    }

    pdf.save(`reporte_planta_arl_${fechaInforme}.pdf`);
  };







const exportarPDFA4 = () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 10;
  let y = 12;

  const logoX = margin;
  const logoY = y;
  const logoW = 36;
  const logoH = 10;
  const textX = logoX + logoW + 6;

  pdf.addImage(logo, "PNG", logoX, logoY, logoW, logoH);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Reporte Operacional", textX, y + 3.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Planta ARL", textX, y + 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Fecha informe: ${formatearFecha(fechaInforme)}`, pageWidth - 58, y + 6);

  y += 16;

  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 7;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Datos del Informe", margin, y);
  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`Operador: ${operador || "-"}`, margin, y);
  pdf.text(`Fecha: ${formatearFecha(fechaInforme)}`, 110, y);

  y += 11;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Stock", margin, y);
  y += 6;

  const card = (titulo, altura, stock, disponible, porcentaje, color) => {
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(220, 220, 220);
    pdf.roundedRect(margin, y, 190, 18, 2, 2, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 41, 59);
    pdf.text(titulo, margin + 4, y + 6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`Altura: ${altura || 0} cm`, margin + 45, y + 6);
    pdf.text(`Stock: ${Number(stock || 0).toLocaleString("es-CL")} L`, margin + 85, y + 6);
    pdf.text(
      `Disponible: ${Number(disponible || 0).toLocaleString("es-CL")} L`,
      margin + 130,
      y + 6
    );

    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(margin + 4, y + 10, 80, 4, 1, 1, "F");

    pdf.setFillColor(...color);
    pdf.roundedRect(
      margin + 4,
      y + 10,
      Math.max(2, 80 * (Number(porcentaje || 0) / 100)),
      4,
      1,
      1,
      "F"
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${Number(porcentaje || 0).toFixed(0)} %`, margin + 88, y + 13.5);

    y += 22;
  };

  card("Petróleo", alturaPetroleo, stockPetroleo, dispPetroleo, nivelPetroleo, [34, 197, 94]);
  card("Mezcla", alturaMezcla, stockMezcla, dispMezcla, nivelMezcla, [59, 130, 246]);
  card("Aceite Residual", alturaAceite, stockAceite, dispAceite, nivelAceite, [234, 179, 8]);

  

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Registro de Fabricación", margin, y);
  y += 6;

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(220, 220, 220);
  pdf.roundedRect(margin, y, 190, 34, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Detalle del Registro", margin + 4, y + 6);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);

  pdf.text(
    `Petróleo utilizado: ${Number(utilizadoPetroleo || 0).toLocaleString("es-CL", {
      maximumFractionDigits: 2,
    })} L`,
    margin + 4,
    y + 14
  );

  pdf.text(
    `Aceite utilizado: ${Number(utilizadoAceite || 0).toLocaleString("es-CL", {
      maximumFractionDigits: 2,
    })} L`,
    margin + 4,
    y + 20
  );

  pdf.text(
    `Mezcla fabricada: ${Number(mezclaFabricada || 0).toLocaleString("es-CL", {
      maximumFractionDigits: 2,
    })} L`,
    margin + 4,
    y + 26
  );

  pdf.text(
    `% Petróleo: ${Number(porcPetroleoFabricado || 0).toFixed(1)} %`,
    110,
    y + 26
  );

  pdf.text(
    `% Aceite: ${Number(porcAceiteFabricado || 0).toFixed(1)} %`,
    150,
    y + 26
  );

  y += 42;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Resumen", margin, y);
  y += 6;

  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, y, 190, 8, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  pdf.text("Estanque", margin + 2, y + 5.5);
  pdf.text("Altura", margin + 35, y + 5.5);
  pdf.text("Stock", margin + 58, y + 5.5);
  pdf.text("Utilizado", margin + 90, y + 5.5);
  pdf.text("Fabricado", margin + 125, y + 5.5);
  pdf.text("Disponible", margin + 160, y + 5.5);

  y += 8;

  const filaResumen = (nombre, altura, stock, utilizado, fabricado, disponible) => {
    pdf.setDrawColor(230, 230, 230);
    pdf.line(margin, y, pageWidth - margin, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);
    pdf.text(nombre, margin + 2, y + 5.5);
    pdf.text(String(altura || 0), margin + 35, y + 5.5);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(Number(stock || 0).toLocaleString("es-CL"), margin + 58, y + 5.5);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(220, 38, 38);
    pdf.text(String(utilizado), margin + 90, y + 5.5);

    pdf.setTextColor(22, 163, 74);
    pdf.text(String(fabricado), margin + 125, y + 5.5);

    pdf.setTextColor(37, 99, 235);
    pdf.text(String(disponible), margin + 160, y + 5.5);

    pdf.setTextColor(0, 0, 0);
    y += 8;
  };

  filaResumen(
    "Petróleo",
    alturaPetroleo,
    stockPetroleo,
    Number(utilizadoPetroleo || 0).toLocaleString("es-CL", { maximumFractionDigits: 2 }),
    "-",
    Number(dispPetroleo || 0).toLocaleString("es-CL")
  );

  filaResumen(
    "Mezcla",
    alturaMezcla,
    stockMezcla,
    "-",
    Number(mezclaFabricada || 0).toLocaleString("es-CL", { maximumFractionDigits: 2 }),
    Number(dispMezcla || 0).toLocaleString("es-CL")
  );

  filaResumen(
    "Aceite",
    alturaAceite,
    stockAceite,
    Number(utilizadoAceite || 0).toLocaleString("es-CL", { maximumFractionDigits: 2 }),
    "-",
    Number(dispAceite || 0).toLocaleString("es-CL")
  );

  y += 14;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Operador", margin, y);
  pdf.text("Firma del operador", 120, y);

  y += 16;

  pdf.setDrawColor(120, 120, 120);
  pdf.line(margin, y, 90, y);
  pdf.line(120, y, 200, y);

  y += 6;

  pdf.setTextColor(30, 41, 59);
  pdf.text(operador || "", margin, y);

  pdf.save(`reporte_a4_planta_arl_${fechaInforme}.pdf`);
};



  const stockPetroleo = obtenerLitrosDesdeAltura(
    calibraciones.petroleo,
    alturaPetroleo,
  );

  const stockMezcla = obtenerLitrosDesdeAltura(
    calibraciones.mezcla,
    alturaMezcla,
  );

  const stockAceite = obtenerLitrosDesdeAltura(
    calibraciones.aceite,
    alturaAceite,
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
            Planta ARL
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
                Medición por altura, cálculo de mezcla, registro de fabricación
                y gestión de calibraciones.
              </p>
            </div>

            {seccionActiva === "inicio" && (
              <div className="flex gap-3">
                <button
                  onClick={exportarPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl shadow transition whitespace-nowrap"
                >
                  Exportar PDF
                </button>

                <button
                  onClick={exportarPDFA4}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl shadow transition whitespace-nowrap"
                >
                  Exportar PDF A4
                </button>
              </div>
            )}
          </div>

          {seccionActiva === "inicio" && (
            <section
              ref={reporteRef}
              className="space-y-8 bg-white p-6 rounded-2xl shadow border border-slate-200"
            >
              <div className="flex items-center justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={logo}
                    alt="Logo empresa"
                    className="h-16 w-auto object-contain"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      Reporte Operacional
                    </h3>
                    <p className="text-slate-500">Planta ARL</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Fecha informe</p>
                  <p className="font-semibold text-slate-800">
                    {formatearFecha(fechaInforme)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
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
                    <p className="text-sm text-slate-600 mb-1">
                      Medición en cm
                    </p>
                    <input
                      type="number"
                      value={alturaPetroleo}
                      onChange={(e) => setAlturaPetroleo(e.target.value)}
                      placeholder="Ingrese altura"
                      className={inputClass}
                    />
                    <p className="mt-4 text-sm text-slate-500">
                      Stock calculado
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stockPetroleo.toLocaleString("es-CL")} L
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Capacidad disponible:{" "}
                      {dispPetroleo.toLocaleString("es-CL")} L
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
                    <h4 className="font-semibold mb-3 text-slate-800">
                      Mezcla
                    </h4>
                    <p className="text-sm text-slate-600 mb-1">
                      Medición en cm
                    </p>
                    <input
                      type="number"
                      value={alturaMezcla}
                      onChange={(e) => setAlturaMezcla(e.target.value)}
                      placeholder="Ingrese altura"
                      className={inputClass}
                    />
                    <p className="mt-4 text-sm text-slate-500">
                      Stock calculado
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stockMezcla.toLocaleString("es-CL")} L
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Capacidad disponible: {dispMezcla.toLocaleString("es-CL")}{" "}
                      L
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
                    <p className="text-sm text-slate-600 mb-1">
                      Medición en cm
                    </p>
                    <input
                      type="number"
                      value={alturaAceite}
                      onChange={(e) => setAlturaAceite(e.target.value)}
                      placeholder="Ingrese altura"
                      className={inputClass}
                    />
                    <p className="mt-4 text-sm text-slate-500">
                      Stock calculado
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stockAceite.toLocaleString("es-CL")} L
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Capacidad disponible: {dispAceite.toLocaleString("es-CL")}{" "}
                      L
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
                        <p className="text-sm mb-1 text-slate-700">
                          % Petróleo
                        </p>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={porcPetroleo}
                          onChange={(e) =>
                            setPorcPetroleo(Number(e.target.value))
                          }
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
                          onChange={(e) =>
                            setPorcAceite(Number(e.target.value))
                          }
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

              <div className="pt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-slate-500 mb-10">
                      Nombre del operador responsable
                    </p>
                    <div className="pt-2">
                      <div className="border-t border-slate-400"></div>
                      <p className="text-slate-800 font-medium mt-2">
                        {operador || ""}
                      </p>
                      <p className="text-sm text-slate-500">Operador</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-10">
                      Firma del operador
                    </p>
                    <div className="pt-2">
                      <div className="border-t border-slate-400"></div>
                      <p className="text-slate-800 font-medium mt-2"></p>
                      <p className="text-sm text-slate-500">Firma</p>
                    </div>
                  </div>
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
                Carga de tablas de calibración por estanque desde archivos
                Excel. La plantilla usa columnas <strong>Altura</strong> y{" "}
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
                    Puntos cargados:{" "}
                    <strong>{calibraciones.mezcla.length}</strong>
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
                    Puntos cargados:{" "}
                    <strong>{calibraciones.aceite.length}</strong>
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
