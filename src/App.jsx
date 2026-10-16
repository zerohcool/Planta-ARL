// ========================================
// IMPORTACIONES
// ========================================
// Hooks de React para manejar estado, efectos y referencias al DOM
import { useEffect, useRef, useState } from "react";

// Librería para leer y generar archivos Excel
import * as XLSX from "xlsx";

// Librería para generar PDFs
import jsPDF from "jspdf";

// Librería para capturar una sección HTML como imagen
import html2canvas from "html2canvas";

// Recursos y datos del proyecto
import logo from "./assets/logo.png";
import { calibracionesIniciales } from "./data/calibraciones";
import { obtenerLitrosDesdeAltura } from "./utils/calculos";
import EstanquesGrid from "./components/estanques/EstanquesGrid";

// Imagenes de silos
import nitratoGuia from "./assets/nitrato-guia.png";
import matrizGuia from "./assets/matriz-guia.png";

// Componentes card silos
import SilosGrid from "./components/silos/SilosGrid";
import SilosResumen from "./components/silos/SilosResumen";

// Componentes Materias primas
import IngresoMateriasPrimas from "./components/materias-primas/IngresoMateriasPrimas";
import { crearFilaVaciaMMPP } from "./utils/materiasPrimas";

function App() {
  // ========================================
  // REFERENCIAS
  // ========================================
  // Referencia al bloque visual del reporte para exportarlo como PDF tipo captura
  const reporteRef = useRef(null);

  // ========================================
  // VALORES INICIALES
  // ========================================
  // Fecha actual en formato YYYY-MM-DD para usarla por defecto
  const fechaHoy = new Date().toISOString().split("T")[0];

  // ========================================
  // ESTADOS DE NAVEGACIÓN
  // ========================================
  // Controla qué sección del panel está visible: "silos", "materias-primas", "calibraciones" o "parametros-silos"
  const [seccionActiva, setSeccionActiva] = useState("silos");

  // ========================================
  // ESTADOS DEL INFORME
  // ========================================
  // Datos generales del reporte
  const [operador, setOperador] = useState("");
  const [fechaInforme, setFechaInforme] = useState(fechaHoy);

  // ========================================
  // ESTADOS DE ALTURA DE ESTANQUES
  // ========================================
  // Alturas ingresadas manualmente por el usuario para cada estanque
  const [alturaPetroleo, setAlturaPetroleo] = useState("");
  const [alturaMezcla, setAlturaMezcla] = useState("");
  const [alturaAceite, setAlturaAceite] = useState("");

  // ========================================
  // ESTADOS DE CALCULADORA DE MEZCLA
  // ========================================
  // Litros objetivo a fabricar y porcentajes teóricos de mezcla
  const [mezclaObjetivo, setMezclaObjetivo] = useState("");
  const [porcPetroleo, setPorcPetroleo] = useState(30);
  const [porcAceite, setPorcAceite] = useState(70);
  const [mostrarModalCalculadora, setMostrarModalCalculadora] = useState(false);

  // ========================================
  // ESTADOS DE REGISTRO DE FABRICACIÓN
  // ========================================
  // Litros realmente usados en la fabricación
  const [petroleoUsar, setPetroleoUsar] = useState("");
  const [aceiteUsar, setAceiteUsar] = useState("");

  // ========================================
  // ESTADO DE CALIBRACIONES
  // ========================================
  // Se intenta cargar desde localStorage; si falla, se usan las calibraciones iniciales
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

  const restablecerCalibraciones = () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas restablecer las calibraciones por defecto?",
    );

    if (!confirmar) return;

    localStorage.removeItem("calibracionesPlantaARL");
    setCalibraciones(calibracionesIniciales);
  };

  // ========================================
  // ESTADO DE INGRESO DE MATERIAS PRIMAS
  // ========================================
  // Se conserva en el estado raíz y en localStorage para evitar pérdidas al cambiar de sección o recargar
  const [ingresosMMPP, setIngresosMMPP] = useState(() => {
    const guardados = localStorage.getItem("materiasPrimasPlantaARL");
    if (guardados) {
      try {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (error) {
        console.error("Error al leer materias primas guardadas:", error);
      }
    }
    return [crearFilaVaciaMMPP()];
  });

  // ========================================
  // MEDICIONES DE TODOS LOS SILOS
  // ========================================
  // Cada silo guarda su medición de distancia vacía.
  // Esto permite escalar fácilmente y mantener el código ordenado.
  const [medicionesSilos, setMedicionesSilos] = useState({
    A1: "",
    A2: "",
    A3: "",
    B1: "",
    B2: "",
    B3: "",
    C1: "",
    C2: "",
    C3: "",
  });

  // ========================================
  // ACTUALIZAR MEDICIÓN DE UN SILO
  // ========================================
  // Recibe el nombre del silo y el valor ingresado por el usuario.
  const actualizarMedicionSilo = (silo, valor) => {
    setMedicionesSilos((prev) => ({
      ...prev,
      [silo]: valor,
    }));
  };

  // ========================================
  // PARÁMETROS EDITABLES DE SILOS
  // ========================================
  // Estos parámetros permiten adaptar la app a silos
  // con diferentes geometrías y capacidades.

  // Parámetros del silo Matriz
  const [parametrosMatriz, setParametrosMatriz] = useState({
    densidad: 1300,
    H1: 4.26,
    D1: 3.5,
    H2: 1.67,
    d0: 0.15,
    H3: 0.2,
  });

  // Parámetros del silo Nitrato
  const [parametrosNitrato, setParametrosNitrato] = useState({
    densidad: 770,
    h1: 0.5,
    A1: 3.4,
    B1: 3.4,
    h2: 5.8,
    A2: 3.4,
    B2: 3.4,
    h3: 0.8,
    A3: 3.49,
    B3: 3.49,
    a3: 2.88,
    b3: 2.21,
    h4: 1.3,
    A4: 1.44,
    B4: 2.21,
    a4: 0.14,
    b4: 0.14,
  });

  // ========================================
  // HELPERS PARA ACTUALIZAR PARÁMETROS
  // ========================================
  // Actualiza un campo del silo Matriz
  const actualizarParametroMatriz = (campo, valor) => {
    setParametrosMatriz((prev) => ({
      ...prev,
      [campo]: valor === "" ? "" : Number(valor),
    }));
  };

  // Actualiza un campo del silo Nitrato
  const actualizarParametroNitrato = (campo, valor) => {
    setParametrosNitrato((prev) => ({
      ...prev,
      [campo]: valor === "" ? "" : Number(valor),
    }));
  };

  // ========================================
  // EFECTO: GUARDAR CALIBRACIONES EN LOCALSTORAGE
  // ========================================
  // Cada vez que cambian las calibraciones, se guardan automáticamente
  useEffect(() => {
    localStorage.setItem(
      "calibracionesPlantaARL",
      JSON.stringify(calibraciones),
    );
  }, [calibraciones]);

  // Cada vez que cambian los ingresos de materias primas, se guardan automáticamente
  useEffect(() => {
    localStorage.setItem(
      "materiasPrimasPlantaARL",
      JSON.stringify(ingresosMMPP),
    );
  }, [ingresosMMPP]);

  // ========================================
  // FUNCIÓN AUXILIAR: FORMATEAR FECHA
  // ========================================
  // Convierte fecha YYYY-MM-DD a formato DD-MM-AAAA
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}-${mes}-${anio}`;
  };

  // ========================================
  // FUNCIÓN: CARGAR EXCEL DE CALIBRACIÓN
  // ========================================
  // Lee un archivo Excel, valida que tenga columnas "Altura" y "Litros",
  // transforma los datos y los guarda en el estado de calibraciones
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

  // ========================================
  // FUNCIÓN: DESCARGAR PLANTILLA DE CALIBRACIÓN
  // ========================================
  // Genera un archivo Excel base con columnas Altura y Litros
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

  // ========================================
  // FUNCIÓN: VALIDACION DE CAMPOS
  // ========================================
  // Valida si los campos nombre del operador y medicion de estanques estan llenos

  const validarFormularioAntesDeExportar = () => {
    if (!formularioValido) {
      alert(
        "Debes completar correctamente el nombre del operador y las mediciones de los estanques antes de exportar el PDF.",
      );
      return false;
    }

    return true;
  };

  // ========================================
  // FUNCIÓN: EXPORTAR PDF TIPO CAPTURA
  // ========================================
  // Captura la sección visual del reporte y la convierte a PDF
  const exportarPDF = async () => {
    if (!validarFormularioAntesDeExportar()) return;

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

  // ========================================
  // FUNCIÓN: EXPORTAR PDF A4 MAQUETADO
  // ========================================
  // Genera un PDF estructurado manualmente con jsPDF
  const exportarPDFA4 = () => {
    if (!validarFormularioAntesDeExportar()) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 10;
    let y = 12;

    // ----------------------------------------
    // CABECERA DEL REPORTE
    // ----------------------------------------
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
    pdf.text(
      `Fecha informe: ${formatearFecha(fechaInforme)}`,
      pageWidth - 58,
      y + 6,
    );

    y += 16;

    // Línea separadora bajo el encabezado
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;

    // ----------------------------------------
    // DATOS DEL INFORME
    // ----------------------------------------
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

    // ----------------------------------------
    // BLOQUE STOCK
    // ----------------------------------------
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Stock", margin, y);
    y += 6;

    // Función interna para dibujar una tarjeta de estanque en el PDF
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
      pdf.text(
        `Stock: ${Number(stock || 0).toLocaleString("es-CL")} L`,
        margin + 85,
        y + 6,
      );
      pdf.text(
        `Disponible: ${Number(disponible || 0).toLocaleString("es-CL")} L`,
        margin + 130,
        y + 6,
      );

      // Barra base
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(margin + 4, y + 10, 80, 4, 1, 1, "F");

      // Barra de progreso según porcentaje
      pdf.setFillColor(...color);
      pdf.roundedRect(
        margin + 4,
        y + 10,
        Math.max(2, 80 * (Number(porcentaje || 0) / 100)),
        4,
        1,
        1,
        "F",
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(
        `${Number(porcentaje || 0).toFixed(0)} %`,
        margin + 88,
        y + 13.5,
      );

      // Avanza la posición vertical para la siguiente tarjeta
      y += 22;
    };

    // Tarjetas de stock para cada estanque
    card(
      "Petróleo",
      alturaPetroleo,
      stockPetroleo,
      dispPetroleo,
      nivelPetroleo,
      [34, 197, 94],
    );
    card(
      "Mezcla",
      alturaMezcla,
      stockMezcla,
      dispMezcla,
      nivelMezcla,
      [59, 130, 246],
    );
    card(
      "Aceite Residual",
      alturaAceite,
      stockAceite,
      dispAceite,
      nivelAceite,
      [234, 179, 8],
    );

    // Espacio entre última tarjeta y siguiente sección
    y += 2;

    // ----------------------------------------
    // REGISTRO DE FABRICACIÓN
    // ----------------------------------------
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
      `Petróleo utilizado: ${Number(utilizadoPetroleo || 0).toLocaleString(
        "es-CL",
        {
          maximumFractionDigits: 2,
        },
      )} L`,
      margin + 4,
      y + 14,
    );

    pdf.text(
      `Aceite utilizado: ${Number(utilizadoAceite || 0).toLocaleString(
        "es-CL",
        {
          maximumFractionDigits: 2,
        },
      )} L`,
      margin + 4,
      y + 20,
    );

    pdf.text(
      `Mezcla fabricada: ${Number(mezclaFabricada || 0).toLocaleString(
        "es-CL",
        {
          maximumFractionDigits: 2,
        },
      )} L`,
      margin + 4,
      y + 26,
    );

    pdf.text(
      `% Petróleo: ${Number(porcPetroleoFabricado || 0).toFixed(1)} %`,
      110,
      y + 26,
    );

    pdf.text(
      `% Aceite: ${Number(porcAceiteFabricado || 0).toFixed(1)} %`,
      150,
      y + 26,
    );

    y += 42;

    // ----------------------------------------
    // RESUMEN
    // ----------------------------------------
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Resumen", margin, y);
    y += 6;

    // Encabezado de la tabla
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

    // Función interna para dibujar una fila del resumen
    const filaResumen = (
      nombre,
      altura,
      stock,
      utilizado,
      fabricado,
      disponible,
    ) => {
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, y, pageWidth - margin, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(nombre, margin + 2, y + 5.5);
      pdf.text(String(altura || 0), margin + 35, y + 5.5);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(
        Number(stock || 0).toLocaleString("es-CL"),
        margin + 58,
        y + 5.5,
      );

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

    // Filas del resumen
    filaResumen(
      "Petróleo",
      alturaPetroleo,
      stockPetroleo,
      Number(utilizadoPetroleo || 0).toLocaleString("es-CL", {
        maximumFractionDigits: 2,
      }),
      "-",
      Number(dispPetroleo || 0).toLocaleString("es-CL"),
    );

    filaResumen(
      "Mezcla",
      alturaMezcla,
      stockMezcla,
      "-",
      Number(mezclaFabricada || 0).toLocaleString("es-CL", {
        maximumFractionDigits: 2,
      }),
      Number(dispMezcla || 0).toLocaleString("es-CL"),
    );

    filaResumen(
      "Aceite",
      alturaAceite,
      stockAceite,
      Number(utilizadoAceite || 0).toLocaleString("es-CL", {
        maximumFractionDigits: 2,
      }),
      "-",
      Number(dispAceite || 0).toLocaleString("es-CL"),
    );

    // ----------------------------------------
    // FIRMA DEL OPERADOR
    // ----------------------------------------
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

    // Guardar archivo final
    pdf.save(`reporte_a4_planta_arl_${fechaInforme}.pdf`);
  };

  // ========================================
  // CÁLCULO DE STOCK ACTUAL SEGÚN ALTURA
  // ========================================
  // Convierte la altura ingresada en litros usando la tabla de calibración
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

  // ========================================
  // CÁLCULO DE CAPACIDAD TOTAL POR ESTANQUE
  // ========================================
  // Se toma el último valor de litros de cada tabla de calibración como capacidad máxima
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

  // Alturas máximas permitidas según calibración
  const maxAlturaPetroleo =
    calibraciones.petroleo.length > 0
      ? calibraciones.petroleo[calibraciones.petroleo.length - 1].altura
      : 0;

  const maxAlturaMezcla =
    calibraciones.mezcla.length > 0
      ? calibraciones.mezcla[calibraciones.mezcla.length - 1].altura
      : 0;

  const maxAlturaAceite =
    calibraciones.aceite.length > 0
      ? calibraciones.aceite[calibraciones.aceite.length - 1].altura
      : 0;

  // Validaciones
  const errorOperador = !operador.trim()
    ? "El nombre del operador es obligatorio."
    : "";

  const errorAlturaPetroleo =
    alturaPetroleo === ""
      ? "La medición de petróleo es obligatoria."
      : Number(alturaPetroleo) > maxAlturaPetroleo
        ? `La medición no puede superar ${maxAlturaPetroleo} cm.`
        : "";

  const errorAlturaMezcla =
    alturaMezcla === ""
      ? "La medición de mezcla es obligatoria."
      : Number(alturaMezcla) > maxAlturaMezcla
        ? `La medición no puede superar ${maxAlturaMezcla} cm.`
        : "";

  const errorAlturaAceite =
    alturaAceite === ""
      ? "La medición de aceite es obligatoria."
      : Number(alturaAceite) > maxAlturaAceite
        ? `La medición no puede superar ${maxAlturaAceite} cm.`
        : "";

  const formularioValido =
    !errorOperador &&
    !errorAlturaPetroleo &&
    !errorAlturaMezcla &&
    !errorAlturaAceite;

  // ========================================
  // CÁLCULO DE CAPACIDAD DISPONIBLE
  // ========================================
  // Litros disponibles restantes en cada estanque
  const dispPetroleo = Math.max(0, capPetroleo - stockPetroleo);
  const dispMezcla = Math.max(0, capMezcla - stockMezcla);
  const dispAceite = Math.max(0, capAceite - stockAceite);

  // ========================================
  // CÁLCULO DE NIVEL DE LLENADO (%)
  // ========================================
  // Se calcula el porcentaje de llenado de cada estanque
  const nivelPetroleo =
    capPetroleo > 0 ? Math.min((stockPetroleo / capPetroleo) * 100, 100) : 0;

  const nivelMezcla =
    capMezcla > 0 ? Math.min((stockMezcla / capMezcla) * 100, 100) : 0;

  const nivelAceite =
    capAceite > 0 ? Math.min((stockAceite / capAceite) * 100, 100) : 0;

  // ========================================
  // CÁLCULOS DE MEZCLA
  // ========================================
  // Valores numéricos usados en la calculadora y en el registro
  const objetivoLitros = Number(mezclaObjetivo) || 0;
  const utilizadoPetroleo = Number(petroleoUsar) || 0;
  const utilizadoAceite = Number(aceiteUsar) || 0;

  // Suma de porcentajes ingresados
  const sumaPorcentajes = Number(porcPetroleo) + Number(porcAceite);

  // Validación: ambos porcentajes deben estar entre 0 y 100 y sumar exactamente 100
  const porcentajesValidos =
    Number(porcPetroleo) >= 0 &&
    Number(porcAceite) >= 0 &&
    Number(porcPetroleo) <= 100 &&
    Number(porcAceite) <= 100 &&
    sumaPorcentajes === 100;

  // Cálculo teórico de litros necesarios para fabricar la mezcla objetivo
  const petroleoNecesarioCalc = porcentajesValidos
    ? objetivoLitros * (porcPetroleo / 100)
    : 0;

  const aceiteNecesarioCalc = porcentajesValidos
    ? objetivoLitros * (porcAceite / 100)
    : 0;

  // Cálculo real según el registro de fabricación
  const mezclaFabricada = utilizadoPetroleo + utilizadoAceite;

  const porcPetroleoFabricado = mezclaFabricada
    ? (utilizadoPetroleo / mezclaFabricada) * 100
    : 0;

  const porcAceiteFabricado = mezclaFabricada
    ? (utilizadoAceite / mezclaFabricada) * 100
    : 0;

  // ========================================
  // CLASES AUXILIARES DE ESTILO
  // ========================================
  // Clase dinámica para botones del menú lateral
  const navButtonClass = (seccion) =>
    `w-full text-left rounded-xl px-4 py-3 font-medium transition ${
      seccionActiva === seccion
        ? "bg-blue-600 text-white shadow"
        : "text-slate-200 hover:bg-slate-800"
    }`;

  // Clase base para inputs
  const inputClass =
    "w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500";

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ========================================
          SIDEBAR / MENÚ LATERAL
      ======================================== */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-wide">Planta ARL</h1>
          <p className="text-sm text-slate-400 mt-1">
            Panel de operación y calibraciones
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setSeccionActiva("silos")}
            className={navButtonClass("silos")}
          >
            Silos
          </button>

          <button
            onClick={() => setSeccionActiva("materias-primas")}
            className={navButtonClass("materias-primas")}
          >
            Ingreso Materias Primas
          </button>

          <button
            onClick={() => setSeccionActiva("calibraciones")}
            className={navButtonClass("calibraciones")}
          >
            Calibraciones
          </button>

          <button
            onClick={() => setSeccionActiva("parametros-silos")}
            className={navButtonClass("parametros-silos")}
          >
            Parámetros Silos
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400">Estado del sistema</p>
            <p className="font-semibold text-green-400 mt-1">Operativo</p>
          </div>
        </div>
      </aside>

      {/* ========================================
          CONTENIDO PRINCIPAL
      ======================================== */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado general del dashboard */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <img
                src={logo}
                alt="Enaex"
                className="h-10 w-auto object-contain mb-3"
              />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                Control diario de Materias Primas
              </h2>
              <p className="text-slate-500 mt-2">
                Medición por altura, cálculo de mezcla y registro de fabricación.
              </p>
            </div>

            {/* Botones de exportación visibles en la sección de silos */}
            {seccionActiva === "silos" && (
              <div className="flex gap-3">
                <button
                  onClick={exportarPDF}
                  disabled={!formularioValido}
                  className={`px-5 py-3 rounded-xl shadow transition whitespace-nowrap text-white ${
                    formularioValido
                      ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Exportar PDF
                </button>

                <button
                  onClick={exportarPDFA4}
                  disabled={!formularioValido}
                  className={`px-5 py-3 rounded-xl shadow transition whitespace-nowrap text-white ${
                    formularioValido
                      ? "bg-slate-800 hover:bg-slate-900 cursor-pointer"
                      : "bg-slate-400 cursor-not-allowed"
                  }`}
                >
                  Exportar PDF A4
                </button>
              </div>
            )}
          </div>

          {/* ========================================
              SECCIÓN PRINCIPAL DEL REPORTE UNIFICADO (SILOS)
          ======================================== */}
          {seccionActiva === "silos" && (
            <section
              ref={reporteRef}
              className="space-y-8 bg-white p-6 rounded-2xl shadow border border-slate-200"
            >
              {/* Cabecera visual del reporte */}
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

              {/* Datos generales del informe */}
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
                      className={`${inputClass} ${errorOperador ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`}
                    />
                    {errorOperador && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errorOperador}
                      </p>
                    )}
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

              {/* Silos de Matriz y Nitrato */}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Silos</h3>
                <p className="text-slate-500 mb-6">
                  Visualización general de los silos de Matriz y Nitrato. Cada
                  tarjeta calcula stock y capacidad disponible en toneladas según
                  la medición ingresada y los parámetros configurados.
                </p>

                <SilosGrid
                  medicionesSilos={medicionesSilos}
                  actualizarMedicionSilo={actualizarMedicionSilo}
                  parametrosMatriz={parametrosMatriz}
                  parametrosNitrato={parametrosNitrato}
                />

                <SilosResumen
                  medicionesSilos={medicionesSilos}
                  parametrosMatriz={parametrosMatriz}
                  parametrosNitrato={parametrosNitrato}
                />
              </div>

              {/* Tarjetas de stock por estanque */}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Stock
                </h3>

                <EstanquesGrid
                  alturaPetroleo={alturaPetroleo}
                  setAlturaPetroleo={setAlturaPetroleo}
                  alturaMezcla={alturaMezcla}
                  setAlturaMezcla={setAlturaMezcla}
                  alturaAceite={alturaAceite}
                  setAlturaAceite={setAlturaAceite}
                  errorAlturaPetroleo={errorAlturaPetroleo}
                  errorAlturaMezcla={errorAlturaMezcla}
                  errorAlturaAceite={errorAlturaAceite}
                  maxAlturaPetroleo={maxAlturaPetroleo}
                  maxAlturaMezcla={maxAlturaMezcla}
                  maxAlturaAceite={maxAlturaAceite}
                  stockPetroleo={stockPetroleo}
                  stockMezcla={stockMezcla}
                  stockAceite={stockAceite}
                  dispPetroleo={dispPetroleo}
                  dispMezcla={dispMezcla}
                  dispAceite={dispAceite}
                  nivelPetroleo={nivelPetroleo}
                  nivelMezcla={nivelMezcla}
                  nivelAceite={nivelAceite}
                  inputClass={inputClass}
                />
              </div>

              {/* Registro real de fabricación a lo largo con botón de Calculadora de Mezcla */}
              <div>
                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        Registro de Fabricación
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Litros reales utilizados en la fabricación de mezcla.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMostrarModalCalculadora(true)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition text-sm cursor-pointer self-start sm:self-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Calculadora de Mezcla
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700">
                        Petróleo utilizado (L)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Litros"
                        value={petroleoUsar}
                        onChange={(e) => setPetroleoUsar(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700">
                        Aceite utilizado (L)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Litros"
                        value={aceiteUsar}
                        onChange={(e) => setAceiteUsar(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="p-2">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        Mezcla fabricada
                      </p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {mezclaFabricada.toLocaleString("es-CL", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        L
                      </p>
                    </div>

                    <div className="p-2 sm:border-l border-slate-200">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        % Petróleo
                      </p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {porcPetroleoFabricado.toFixed(1)} %
                      </p>
                    </div>

                    <div className="p-2 sm:border-l border-slate-200">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        % Aceite
                      </p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {porcAceiteFabricado.toFixed(1)} %
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla resumen */}
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

              {/* Área de firma */}
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

          {/* ========================================
              SECCIÓN DE CALIBRACIONES
          ======================================== */}
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
                <button
                  onClick={restablecerCalibraciones}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition"
                >
                  Restablecer calibraciones por defecto
                </button>
              </div>

              <p className="text-sm text-green-600 mb-6">
                Las calibraciones cargadas se guardan automáticamente en este
                navegador.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Carga calibración petróleo */}
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

                {/* Carga calibración mezcla */}
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

                {/* Carga calibración aceite */}
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


          {seccionActiva === "parametros-silos" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Parámetros de Silos
              </h3>

              <p className="text-slate-500 mb-6">
                Configura las dimensiones y densidades de los silos. Las
                imágenes sirven como guía visual para identificar correctamente
                cada parámetro.
              </p>

              <div className="grid xl:grid-cols-2 gap-6">
                {/* ======================================== */}
                {/* PARÁMETROS SILO NITRATO */}
                {/* ======================================== */}
                <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                  <h4 className="text-xl font-bold text-slate-800 mb-5">
                    Parámetros Silo Nitrato
                  </h4>

                  <div className="grid lg:grid-cols-2 gap-6 items-start">
                    {/* Imagen guía */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <img
                        src={nitratoGuia}
                        alt="Guía visual parámetros silo nitrato"
                        className="w-full h-auto rounded-lg"
                      />
                      <p className="text-xs text-slate-500 mt-3">
                        Referencia visual para identificar lados y alturas de
                        cada sección del silo nitrato.
                      </p>
                    </div>

                    {/* Formulario */}
                    <div className="space-y-6">
                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3">
                          General
                        </h5>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Densidad (kg/m³)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.densidad}
                              onChange={(e) =>
                                actualizarParametroNitrato(
                                  "densidad",
                                  e.target.value,
                                )
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3">
                          1. Pirámide superior
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado a
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.A1}
                              onChange={(e) =>
                                actualizarParametroNitrato("A1", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado b
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.B1}
                              onChange={(e) =>
                                actualizarParametroNitrato("B1", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-slate-600 mb-1">
                              Altura h1
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.h1}
                              onChange={(e) =>
                                actualizarParametroNitrato("h1", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3">
                          2. Prisma rectangular
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado A
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.A2}
                              onChange={(e) =>
                                actualizarParametroNitrato("A2", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado B
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.B2}
                              onChange={(e) =>
                                actualizarParametroNitrato("B2", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-slate-600 mb-1">
                              Altura h2
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.h2}
                              onChange={(e) =>
                                actualizarParametroNitrato("h2", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3">
                          3. Pirámide truncada invertida
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado A
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.A3}
                              onChange={(e) =>
                                actualizarParametroNitrato("A3", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado B
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.B3}
                              onChange={(e) =>
                                actualizarParametroNitrato("B3", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado a
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.a3}
                              onChange={(e) =>
                                actualizarParametroNitrato("a3", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado b
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.b3}
                              onChange={(e) =>
                                actualizarParametroNitrato("b3", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-slate-600 mb-1">
                              Altura h3
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.h3}
                              onChange={(e) =>
                                actualizarParametroNitrato("h3", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3">
                          4. Pirámide truncada invertida doble
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado A
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.A4}
                              onChange={(e) =>
                                actualizarParametroNitrato("A4", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado B
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.B4}
                              onChange={(e) =>
                                actualizarParametroNitrato("B4", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado a
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.a4}
                              onChange={(e) =>
                                actualizarParametroNitrato("a4", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-600 mb-1">
                              Lado b
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.b4}
                              onChange={(e) =>
                                actualizarParametroNitrato("b4", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-slate-600 mb-1">
                              Altura h4
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametrosNitrato.h4}
                              onChange={(e) =>
                                actualizarParametroNitrato("h4", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg p-3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ======================================== */}
                {/* PARÁMETROS SILO MATRIZ */}
                {/* ======================================== */}
                <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                  <h4 className="text-xl font-bold text-slate-800 mb-5">
                    Parámetros Silo Matriz
                  </h4>

                  <div className="grid lg:grid-cols-2 gap-6 items-start">
                    {/* Imagen guía */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <img
                        src={matrizGuia}
                        alt="Guía visual parámetros silo matriz"
                        className="w-full h-auto rounded-lg"
                      />
                      <p className="text-xs text-slate-500 mt-3">
                        Referencia visual para identificar diámetros, alturas y
                        secciones del silo matriz.
                      </p>
                    </div>

                    {/* Formulario */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Densidad ρ (kg/m³)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parametrosMatriz.densidad}
                          onChange={(e) =>
                            actualizarParametroMatriz(
                              "densidad",
                              e.target.value,
                            )
                          }
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Altura cilindro grande H1 (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parametrosMatriz.H1}
                          onChange={(e) =>
                            actualizarParametroMatriz("H1", e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Diámetro cilindro grande D1 (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parametrosMatriz.D1}
                          onChange={(e) =>
                            actualizarParametroMatriz("D1", e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Altura cono truncado H2 (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parametrosMatriz.H2}
                          onChange={(e) =>
                            actualizarParametroMatriz("H2", e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Diámetro cilindro pequeño d0 (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parametrosMatriz.d0}
                          onChange={(e) =>
                            actualizarParametroMatriz("d0", e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Altura cilindro pequeño H3 (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parametrosMatriz.H3}
                          onChange={(e) =>
                            actualizarParametroMatriz("H3", e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {seccionActiva === "materias-primas" && (
            <IngresoMateriasPrimas
              ingresos={ingresosMMPP}
              setIngresos={setIngresosMMPP}
            />
          )}
        </div>
      </main>

      {/* ========================================
          MODAL: CALCULADORA DE MEZCLA
      ======================================== */}
      {mostrarModalCalculadora && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">
                    Calculadora de Mezcla
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cálculo teórico de proporciones para fabricación
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalCalculadora(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">
                  Cantidad de mezcla a fabricar (L)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Litros objetivo"
                  value={mezclaObjetivo}
                  onChange={(e) => setMezclaObjetivo(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">
                    % Petróleo
                  </label>
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
                  <label className="block text-sm font-semibold mb-1 text-slate-700">
                    % Aceite
                  </label>
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

              <div className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Suma de porcentajes:</span>
                <span
                  className={`font-bold ${
                    porcentajesValidos ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {sumaPorcentajes}%
                </span>
              </div>

              {!porcentajesValidos && (
                <p className="text-xs text-red-600 font-medium">
                  Los porcentajes deben sumar exactamente 100%.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium">
                    Petróleo necesario
                  </p>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    {petroleoNecesarioCalc.toLocaleString("es-CL", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    L
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                  <p className="text-xs text-amber-600 font-medium">
                    Aceite necesario
                  </p>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    {aceiteNecesarioCalc.toLocaleString("es-CL", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    L
                  </p>
                </div>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="flex items-center justify-end gap-3 p-6 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMostrarModalCalculadora(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mezclaObjetivo && porcentajesValidos) {
                    setPetroleoUsar(petroleoNecesarioCalc);
                    setAceiteUsar(aceiteNecesarioCalc);
                  }
                  setMostrarModalCalculadora(false);
                }}
                disabled={!mezclaObjetivo || !porcentajesValidos}
                className={`px-4 py-2 text-sm font-medium rounded-xl text-white shadow-sm transition ${
                  mezclaObjetivo && porcentajesValidos
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    : "bg-slate-400 cursor-not-allowed"
                }`}
              >
                Aplicar a Fabricación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
