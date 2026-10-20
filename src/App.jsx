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
import {
  obtenerLitrosDesdeAltura,
  obtenerAlturaDesdeLitros,
} from "./utils/calculos";
import EstanquesGrid from "./components/estanques/EstanquesGrid";

// Imagenes de silos
import nitratoGuia from "./assets/nitrato-guia.png";
import matrizGuia from "./assets/matriz-guia.png";

// Componentes card silos
import SilosGrid from "./components/silos/SilosGrid";
import SilosResumen from "./components/silos/SilosResumen";
import { silosConfigResumen } from "./config/silos";

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

  // Registro de informes guardados por fecha (persistencia local / preparado para backend y BD)
  const [informesGuardadosPorFecha, setInformesGuardadosPorFecha] = useState(
    () => {
      try {
        const guardados = localStorage.getItem("informesGuardadosPlantaARL");
        return guardados ? JSON.parse(guardados) : {};
      } catch (e) {
        console.error("Error al leer historial de informes guardados:", e);
        return {};
      }
    },
  );

  // Indicador de si ya existen datos registrados previamente para la fecha seleccionada
  const tieneDatosFecha = Boolean(informesGuardadosPorFecha[fechaInforme]);

  // ========================================
  // ESTADOS DE STOCK Y MEDICIÓN DE ESTANQUES
  // ========================================
  // Modo de ingreso: "litros" (por defecto) o "altura" (medición en cm)
  const [modoIngresoEstanques, setModoIngresoEstanques] = useState("litros");

  // Litros ingresados directamente (modo litros)
  const [litrosPetroleo, setLitrosPetroleo] = useState("");
  const [litrosMezcla, setLitrosMezcla] = useState("");
  const [litrosAceite, setLitrosAceite] = useState("");

  // Alturas ingresadas manualmente en cm (modo altura)
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
  // ESTADOS DE REGISTRO DE FABRICACIÓN E INGRESOS DEL DÍA
  // ========================================
  // Litros recepcionados del día por camión (por defecto 0)
  const [ingresoPetroleo, setIngresoPetroleo] = useState("0");
  const [ingresoAceite, setIngresoAceite] = useState("0");

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
  // FUNCIÓN: REGISTRAR INFORME PARA LA FECHA SELECCIONADA
  // ========================================
  // Guarda un registro local para la fecha actual (indicador de estado / preparado para base de datos)
  const registrarInformeParaFechaActual = () => {
    const registro = {
      operador,
      fechaInforme,
      medicionesSilos: { ...medicionesSilos },
      modoIngresoEstanques,
      litrosPetroleo,
      litrosMezcla,
      litrosAceite,
      alturaPetroleo,
      alturaMezcla,
      alturaAceite,
      ingresoPetroleo,
      ingresoAceite,
      petroleoUsar,
      aceiteUsar,
      guardadoEn: new Date().toISOString(),
    };

    setInformesGuardadosPorFecha((prev) => {
      const actualizados = {
        ...prev,
        [fechaInforme]: registro,
      };
      localStorage.setItem(
        "informesGuardadosPlantaARL",
        JSON.stringify(actualizados),
      );
      return actualizados;
    });
  };

  // ========================================
  // FUNCIÓN: VALIDACION DE CAMPOS
  // ========================================
  // Valida campos de operador, estanques y restricción de silos de Nitrato
  const validarFormularioAntesDeExportar = () => {
    if (errorSilosNitrato) {
      alert(
        "Hay mediciones inválidas en los silos de Nitrato. La medición no puede ser inferior a 0.4 m por la pirámide de llenado y ubicación de la escotilla.",
      );
      return false;
    }

    if (!formularioValido) {
      alert(
        "Debes completar correctamente el nombre del operador y los valores de stock/medición de los estanques antes de exportar el PDF.",
      );
      return false;
    }

    registrarInformeParaFechaActual();
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
    // DATOS DEL OPERADOR
    // ----------------------------------------
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Datos del Operador", margin, y);
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
      alturaReportePetroleo,
      stockPetroleo,
      dispPetroleo,
      nivelPetroleo,
      [34, 197, 94],
    );
    card(
      "Mezcla",
      alturaReporteMezcla,
      stockMezcla,
      dispMezcla,
      nivelMezcla,
      [59, 130, 246],
    );
    card(
      "Aceite Residual",
      alturaReporteAceite,
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
    pdf.text("Altura", margin + 28, y + 5.5);
    pdf.text("Stock", margin + 48, y + 5.5);
    pdf.text("Ingreso", margin + 74, y + 5.5);
    pdf.text("Utilizado", margin + 102, y + 5.5);
    pdf.text("Fabricado", margin + 132, y + 5.5);
    pdf.text("Disponible", margin + 162, y + 5.5);

    y += 8;

    // Función interna para dibujar una fila del resumen
    const filaResumen = (
      nombre,
      altura,
      stock,
      ingreso,
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
      pdf.text(String(altura || 0), margin + 28, y + 5.5);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(
        Number(stock || 0).toLocaleString("es-CL"),
        margin + 48,
        y + 5.5,
      );

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(22, 163, 74);
      pdf.text(String(ingreso), margin + 74, y + 5.5);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(220, 38, 38);
      pdf.text(String(utilizado), margin + 102, y + 5.5);

      pdf.setTextColor(14, 165, 233);
      pdf.text(String(fabricado), margin + 132, y + 5.5);

      pdf.setTextColor(37, 99, 235);
      pdf.text(String(disponible), margin + 162, y + 5.5);

      pdf.setTextColor(0, 0, 0);
      y += 8;
    };

    // Filas del resumen
    filaResumen(
      "Petróleo",
      alturaReportePetroleo,
      stockPetroleo,
      recepcionPetroleo > 0
        ? `+${recepcionPetroleo.toLocaleString("es-CL")}`
        : "0",
      Number(utilizadoPetroleo || 0).toLocaleString("es-CL", {
        maximumFractionDigits: 2,
      }),
      "-",
      Number(dispPetroleo || 0).toLocaleString("es-CL"),
    );

    filaResumen(
      "Mezcla",
      alturaReporteMezcla,
      stockMezcla,
      "-",
      "-",
      Number(mezclaFabricada || 0).toLocaleString("es-CL", {
        maximumFractionDigits: 2,
      }),
      Number(dispMezcla || 0).toLocaleString("es-CL"),
    );

    filaResumen(
      "Aceite",
      alturaReporteAceite,
      stockAceite,
      recepcionAceite > 0
        ? `+${recepcionAceite.toLocaleString("es-CL")}`
        : "0",
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
  // CÁLCULO DE CAPACIDAD TOTAL Y ALTURA MÁXIMA POR ESTANQUE
  // ========================================
  // Se toma el último valor de cada tabla de calibración como capacidad y altura máxima
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

  // ========================================
  // CÁLCULO DE STOCK SEGÚN MODO ACTIVO
  // ========================================
  // Si está en modo litros se usa el valor ingresado; si está en modo altura se calcula mediante la tabla
  const stockPetroleo =
    modoIngresoEstanques === "litros"
      ? litrosPetroleo === ""
        ? 0
        : Number(litrosPetroleo) || 0
      : obtenerLitrosDesdeAltura(calibraciones.petroleo, alturaPetroleo);

  const stockMezcla =
    modoIngresoEstanques === "litros"
      ? litrosMezcla === ""
        ? 0
        : Number(litrosMezcla) || 0
      : obtenerLitrosDesdeAltura(calibraciones.mezcla, alturaMezcla);

  const stockAceite =
    modoIngresoEstanques === "litros"
      ? litrosAceite === ""
        ? 0
        : Number(litrosAceite) || 0
      : obtenerLitrosDesdeAltura(calibraciones.aceite, alturaAceite);

  // Alturas equivalentes estimadas desde litros (modo litros) o mediciones reales (modo altura)
  const alturaEquivPetroleo =
    modoIngresoEstanques === "litros"
      ? litrosPetroleo !== ""
        ? obtenerAlturaDesdeLitros(
            calibraciones.petroleo,
            Number(litrosPetroleo) || 0,
          )
        : 0
      : alturaPetroleo;

  const alturaEquivMezcla =
    modoIngresoEstanques === "litros"
      ? litrosMezcla !== ""
        ? obtenerAlturaDesdeLitros(
            calibraciones.mezcla,
            Number(litrosMezcla) || 0,
          )
        : 0
      : alturaMezcla;

  const alturaEquivAceite =
    modoIngresoEstanques === "litros"
      ? litrosAceite !== ""
        ? obtenerAlturaDesdeLitros(
            calibraciones.aceite,
            Number(litrosAceite) || 0,
          )
        : 0
      : alturaAceite;

  // Valores de altura a reportar en PDF y tabla resumen
  const alturaReportePetroleo =
    modoIngresoEstanques === "litros"
      ? alturaEquivPetroleo
      : alturaPetroleo || 0;
  const alturaReporteMezcla =
    modoIngresoEstanques === "litros" ? alturaEquivMezcla : alturaMezcla || 0;
  const alturaReporteAceite =
    modoIngresoEstanques === "litros" ? alturaEquivAceite : alturaAceite || 0;

  // ========================================
  // TOGGLE DE MODO DE INGRESO (CONVERSIÓN BIDIRECCIONAL)
  // ========================================
  const toggleModoIngresoEstanques = () => {
    if (modoIngresoEstanques === "litros") {
      // De litros a altura
      if (litrosPetroleo !== "") {
        const alt = obtenerAlturaDesdeLitros(
          calibraciones.petroleo,
          Number(litrosPetroleo) || 0,
        );
        setAlturaPetroleo(alt > 0 ? String(alt) : "");
      }
      if (litrosMezcla !== "") {
        const alt = obtenerAlturaDesdeLitros(
          calibraciones.mezcla,
          Number(litrosMezcla) || 0,
        );
        setAlturaMezcla(alt > 0 ? String(alt) : "");
      }
      if (litrosAceite !== "") {
        const alt = obtenerAlturaDesdeLitros(
          calibraciones.aceite,
          Number(litrosAceite) || 0,
        );
        setAlturaAceite(alt > 0 ? String(alt) : "");
      }
      setModoIngresoEstanques("altura");
    } else {
      // De altura a litros
      if (alturaPetroleo !== "") {
        const lts = obtenerLitrosDesdeAltura(
          calibraciones.petroleo,
          alturaPetroleo,
        );
        setLitrosPetroleo(lts > 0 ? String(lts) : "");
      }
      if (alturaMezcla !== "") {
        const lts = obtenerLitrosDesdeAltura(
          calibraciones.mezcla,
          alturaMezcla,
        );
        setLitrosMezcla(lts > 0 ? String(lts) : "");
      }
      if (alturaAceite !== "") {
        const lts = obtenerLitrosDesdeAltura(
          calibraciones.aceite,
          alturaAceite,
        );
        setLitrosAceite(lts > 0 ? String(lts) : "");
      }
      setModoIngresoEstanques("litros");
    }
  };

  // ========================================
  // VALIDACIONES
  // ========================================
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

  const errorLitrosPetroleo =
    litrosPetroleo === ""
      ? "El stock de petróleo es obligatorio."
      : Number(litrosPetroleo) > capPetroleo
        ? `No puede superar ${capPetroleo.toLocaleString("es-CL")} L.`
        : "";

  const errorLitrosMezcla =
    litrosMezcla === ""
      ? "El stock de mezcla es obligatorio."
      : Number(litrosMezcla) > capMezcla
        ? `No puede superar ${capMezcla.toLocaleString("es-CL")} L.`
        : "";

  const errorLitrosAceite =
    litrosAceite === ""
      ? "El stock de aceite es obligatorio."
      : Number(litrosAceite) > capAceite
        ? `No puede superar ${capAceite.toLocaleString("es-CL")} L.`
        : "";

  // Validación de silos Nitrato: la medición no puede ser inferior a 0.4 m
  const errorSilosNitrato = Object.entries(medicionesSilos).some(
    ([id, val]) => {
      if (val === "" || val === null || val === undefined) return false;
      const num = Number(val);
      const tipo = silosConfigResumen[id];
      return tipo === "nitrato" && !isNaN(num) && num < 0.4;
    },
  );

  const formularioValido =
    !errorOperador &&
    !errorSilosNitrato &&
    (modoIngresoEstanques === "litros"
      ? !errorLitrosPetroleo && !errorLitrosMezcla && !errorLitrosAceite
      : !errorAlturaPetroleo && !errorAlturaMezcla && !errorAlturaAceite);

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
  // CÁLCULOS DE MEZCLA Y RECEPCIONES
  // ========================================
  // Valores numéricos usados en la calculadora, recepciones y en el registro
  const recepcionPetroleo = Number(ingresoPetroleo) || 0;
  const recepcionAceite = Number(ingresoAceite) || 0;
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
              {/* Datos del Operador */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Datos del Operador
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre del operador
                    </label>
                    <input
                      type="text"
                      value={operador}
                      onChange={(e) => setOperador(e.target.value)}
                      placeholder="Ingrese nombre del operador"
                      className={`${inputClass} bg-white ${errorOperador ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`}
                    />
                    {errorOperador && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errorOperador}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <label className="text-sm font-medium text-slate-700">
                        Fecha del informe
                      </label>

                      {/* Indicador de datos guardados para la fecha (preparado para base de datos) */}
                      {tieneDatosFecha ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                          title="Existen datos guardados para esta fecha en el sistema"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          Con datos guardados
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200/80 text-slate-600 border border-slate-300"
                          title="Sin registros previos guardados para esta fecha"
                        >
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          Sin datos registrados
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={fechaInforme}
                        onChange={(e) => setFechaInforme(e.target.value)}
                        className={`${inputClass} bg-white flex-1`}
                      />

                      {/* Fecha informe formateada dentro de la tarjeta al costado del selector */}
                      <div className="bg-white px-4 py-2 border border-slate-300 rounded-lg shadow-2xs text-center shrink-0 min-w-[130px]">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                          Fecha informe
                        </p>
                        <p className="text-base font-bold text-slate-800 mt-1 leading-none">
                          {formatearFecha(fechaInforme) || "--/--/----"}
                        </p>
                      </div>
                    </div>
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

              {/* Tarjeta unificada: Stock Planta ARL, Recepción, Registro de Fabricación y Resumen */}
              <div>
                <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 space-y-8">
                  {/* Stock Planta ARL */}
                  <div className="pb-6 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          Stock Planta ARL
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {modoIngresoEstanques === "litros"
                            ? "Ingreso directo en litros. El sistema estima la cota/altura correspondiente."
                            : "Ingreso por medición de altura en cm según tablas de calibración."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={toggleModoIngresoEstanques}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl font-medium shadow-sm transition text-sm cursor-pointer self-start sm:self-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                        <span>
                          Modo:{" "}
                          <strong className="text-blue-600">
                            {modoIngresoEstanques === "litros"
                              ? "Directo (Litros)"
                              : "Medición (Altura cm)"}
                          </strong>
                        </span>
                      </button>
                    </div>

                    <EstanquesGrid
                      modoIngreso={modoIngresoEstanques}
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
                      litrosPetroleo={litrosPetroleo}
                      setLitrosPetroleo={setLitrosPetroleo}
                      litrosMezcla={litrosMezcla}
                      setLitrosMezcla={setLitrosMezcla}
                      litrosAceite={litrosAceite}
                      setLitrosAceite={setLitrosAceite}
                      errorLitrosPetroleo={errorLitrosPetroleo}
                      errorLitrosMezcla={errorLitrosMezcla}
                      errorLitrosAceite={errorLitrosAceite}
                      capPetroleo={capPetroleo}
                      capMezcla={capMezcla}
                      capAceite={capAceite}
                      alturaEquivPetroleo={alturaEquivPetroleo}
                      alturaEquivMezcla={alturaEquivMezcla}
                      alturaEquivAceite={alturaEquivAceite}
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

                  {/* RECEPCIÓN CAMIONES (INGRESO DEL DÍA) */}
                  <div className="pb-6 border-b border-slate-200">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-slate-800 tracking-wide flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                          />
                        </svg>
                        RECEPCIÓN CAMIONES (INGRESO DEL DÍA)
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Litros recepcionados si llega camión con petróleo y/o aceite durante el turno (por defecto 0 L).
                      </p>
                    </div>

                    {/* Inputs en otra fila debajo del título */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                      {/* Recepción Petróleo */}
                      <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                          Petróleo:
                        </label>
                        <div className="relative w-32 sm:w-36">
                          <input
                            type="number"
                            min="0"
                            value={ingresoPetroleo}
                            onChange={(e) => setIngresoPetroleo(e.target.value)}
                            onFocus={(e) => {
                              if (e.target.value === "0") setIngresoPetroleo("");
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim() === "") setIngresoPetroleo("0");
                            }}
                            placeholder="0"
                            className="w-full text-right font-bold text-slate-800 pr-7 py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-colors shadow-2xs"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            L
                          </span>
                        </div>
                      </div>

                      {/* Recepción Aceite */}
                      <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                          Aceite:
                        </label>
                        <div className="relative w-32 sm:w-36">
                          <input
                            type="number"
                            min="0"
                            value={ingresoAceite}
                            onChange={(e) => setIngresoAceite(e.target.value)}
                            onFocus={(e) => {
                              if (e.target.value === "0") setIngresoAceite("");
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim() === "") setIngresoAceite("0");
                            }}
                            placeholder="0"
                            className="w-full text-right font-bold text-slate-800 pr-7 py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-colors shadow-2xs"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            L
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Tarjeta 1: Petróleo utilizado */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between min-w-0">
                      <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-emerald-900 mb-2 truncate" title="Petróleo utilizado (L)">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                        <span className="truncate">Petróleo utilizado</span>
                      </label>
                      <div className="relative mt-auto">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={petroleoUsar}
                          onChange={(e) => setPetroleoUsar(e.target.value)}
                          className="w-full bg-white border border-emerald-300 rounded-lg p-2.5 pr-7 font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 text-lg shadow-2xs"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                          L
                        </span>
                      </div>
                    </div>

                    {/* Tarjeta 2: Aceite utilizado */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between min-w-0">
                      <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-amber-900 mb-2 truncate" title="Aceite utilizado (L)">
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                        <span className="truncate">Aceite utilizado</span>
                      </label>
                      <div className="relative mt-auto">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={aceiteUsar}
                          onChange={(e) => setAceiteUsar(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-lg p-2.5 pr-7 font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 text-lg shadow-2xs"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700 pointer-events-none">
                          L
                        </span>
                      </div>
                    </div>

                    {/* Tarjeta 3: Mezcla fabricada */}
                    <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 shadow-xs flex flex-col justify-between min-w-0">
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-sky-800 font-semibold mb-2 truncate" title="Mezcla fabricada">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                        <span className="truncate">Mezcla fabricada</span>
                      </p>
                      <div className="mt-auto h-[46px] flex items-center">
                        <p className="text-xl xl:text-2xl font-bold text-sky-950 truncate">
                          {mezclaFabricada.toLocaleString("es-CL", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          <span className="text-sm font-semibold text-sky-700">L</span>
                        </p>
                      </div>
                    </div>

                    {/* Tarjeta 4: % Petróleo */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col justify-between min-w-0">
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-800 font-semibold mb-2 truncate" title="% Petróleo">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">% Petróleo</span>
                      </p>
                      <div className="mt-auto h-[46px] flex items-center">
                        <p className="text-xl xl:text-2xl font-bold text-emerald-950 truncate">
                          {porcPetroleoFabricado.toFixed(1)}{" "}
                          <span className="text-sm font-semibold text-emerald-700">%</span>
                        </p>
                      </div>
                    </div>

                    {/* Tarjeta 5: % Aceite */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col justify-between min-w-0">
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-800 font-semibold mb-2 truncate" title="% Aceite">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                        <span className="truncate">% Aceite</span>
                      </p>
                      <div className="mt-auto h-[46px] flex items-center">
                        <p className="text-xl xl:text-2xl font-bold text-amber-950 truncate">
                          {porcAceiteFabricado.toFixed(1)}{" "}
                          <span className="text-sm font-semibold text-amber-700">%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen con su tabla integrado dentro de la misma tarjeta */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-slate-800">
                        Resumen
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Balance general por estanque considerando mediciones, stock, ingresos recepcionados, consumo y mezcla fabricada.
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-[700px]">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <th className="py-3 px-4">Estanque</th>
                            <th className="py-3 px-4">Altura (cm)</th>
                            <th className="py-3 px-4">Stock (L)</th>
                            <th className="py-3 px-4">Ingreso (L)</th>
                            <th className="py-3 px-4">Utilizado (L)</th>
                            <th className="py-3 px-4">Fabricado (L)</th>
                            <th className="py-3 px-4">Disponible (L)</th>
                          </tr>
                        </thead>

                        <tbody className="text-slate-800 divide-y divide-slate-100 bg-white">
                          <tr className="hover:bg-emerald-50/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Petróleo
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {alturaReportePetroleo || 0}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {stockPetroleo.toLocaleString("es-CL")}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">
                              {recepcionPetroleo > 0
                                ? `+${recepcionPetroleo.toLocaleString("es-CL")}`
                                : "0"}
                            </td>
                            <td className="py-3.5 px-4 text-red-600 font-medium">
                              {utilizadoPetroleo > 0
                                ? utilizadoPetroleo.toLocaleString("es-CL", {
                                    maximumFractionDigits: 2,
                                  })
                                : "0"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">-</td>
                            <td className="py-3.5 px-4 text-emerald-700 font-bold">
                              {dispPetroleo.toLocaleString("es-CL")}
                            </td>
                          </tr>

                          <tr className="hover:bg-sky-50/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                Mezcla
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {alturaReporteMezcla || 0}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {stockMezcla.toLocaleString("es-CL")}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">-</td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">-</td>
                            <td className="py-3.5 px-4 text-sky-700 font-bold">
                              {mezclaFabricada > 0
                                ? mezclaFabricada.toLocaleString("es-CL", {
                                    maximumFractionDigits: 2,
                                  })
                                : "0"}
                            </td>
                            <td className="py-3.5 px-4 text-blue-700 font-bold">
                              {dispMezcla.toLocaleString("es-CL")}
                            </td>
                          </tr>

                          <tr className="hover:bg-amber-50/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Aceite
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {alturaReporteAceite || 0}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {stockAceite.toLocaleString("es-CL")}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-amber-700">
                              {recepcionAceite > 0
                                ? `+${recepcionAceite.toLocaleString("es-CL")}`
                                : "0"}
                            </td>
                            <td className="py-3.5 px-4 text-red-600 font-medium">
                              {utilizadoAceite > 0
                                ? utilizadoAceite.toLocaleString("es-CL", {
                                    maximumFractionDigits: 2,
                                  })
                                : "0"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">-</td>
                            <td className="py-3.5 px-4 text-amber-700 font-bold">
                              {dispAceite.toLocaleString("es-CL")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
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
