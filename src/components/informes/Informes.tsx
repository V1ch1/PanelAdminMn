import React, { useEffect, useState } from "react";
import { getEvents } from "../../services/apiService";
import { jsPDF } from "jspdf";

const Informes: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]); // Estado para los eventos
  const [loading, setLoading] = useState<boolean>(false); // Para mostrar el loading
  const [error, setError] = useState<string | null>(null); // Para manejar errores
  const [status, setStatus] = useState<"pendiente" | "gestionado">("pendiente"); // Estado para el parámetro 'status'

  // Función para cargar los eventos
  useEffect(() => {
    const cargarEventos = async () => {
      setLoading(true); // Iniciar el loading
      setError(null); // Resetear el error
      try {
        // Llamamos a la API con el estado 'pendiente'
        const eventosObtenidos = await getEvents(status);
        console.log("Eventos obtenidos:", eventosObtenidos); // Ver los datos en consola
        setEventos(eventosObtenidos); // Guardar los eventos en el estado
      } catch (err: unknown) {
        setError("Error al cargar los eventos.");
        console.error("Error al cargar los eventos:", err);
      } finally {
        setLoading(false); // Finalizar el loading
      }
    };

    cargarEventos(); // Llamar a la función para cargar los eventos
  }, [status]); // Dependencia para recargar los eventos cuando cambie 'status'

  // Función para generar el PDF
  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Informe de Eventos", 10, 10);

    // Agregar fecha y periodo de tiempo
    const fechaActual = new Date();
    const periodoInicio = "2025-01-01"; // Periodo de ejemplo
    const periodoFin = "2025-01-31"; // Periodo de ejemplo
    doc.setFontSize(12);
    doc.text(`Fecha de Generación: ${fechaActual.toLocaleString()}`, 10, 20);
    doc.text(`Periodo: ${periodoInicio} - ${periodoFin}`, 10, 30);

    // Agrupar eventos por fuente
    const agrupadosPorFuente = agruparPorFuente(eventos);

    // Sección de Contactos por Fuente
    doc.setFontSize(14);
    doc.text("Contactos por Fuente:", 10, 50);
    doc.setFontSize(12);

    let currentY = 60;
    let totalContactosPorFuente = 0;
    let totalPendientes = 0;
    let totalResueltos = 0;

    // Título de las fuentes
    doc.setFontSize(12);
    doc.text("Fuente", 10, currentY);
    doc.text("Núm Oportunidades", 80, currentY); // Alineación en la columna 80
    currentY += 10;

    // Detalles por fuente
    ["mail.video", "mail.precios", "mail.plus.precios"].forEach((fuente) => {
      const fuenteEventos = agrupadosPorFuente[fuente] || [];
      const totalFuente = fuenteEventos.length;
      totalContactosPorFuente += totalFuente;

      // Contar los eventos pendientes y resueltos
      fuenteEventos.forEach((evento: any) => {
        if (evento.status === "pendiente") totalPendientes++;
        if (evento.status === "gestionado") totalResueltos++;
      });

      doc.text(fuente, 10, currentY); // Nombre de la fuente
      doc.text(`${totalFuente}`, 80, currentY); // Número de oportunidades
      currentY += 10;
    });

    // Mostrar el total de Contactos por Fuente debajo de las oportunidades, en la misma columna
    doc.text(`Total Contactos por Fuente:`, 10, currentY);
    doc.text(`${totalContactosPorFuente}`, 80, currentY); // Total alineado en la columna de los números
    currentY += 20;

    // Sección de Contactos por Colectivo
    doc.setFontSize(14);
    doc.text("Contactos por Colectivo:", 10, currentY);
    doc.setFontSize(12);

    currentY += 10;
    const agrupadosPorColectivo = agruparPorColectivo(eventos);
    let totalContactosPorColectivo = 0;

    // Título de los colectivos
    doc.setFontSize(12);
    doc.text("Colectivo", 10, currentY);
    doc.text("Núm Oportunidades", 80, currentY); // Alineación en la columna 80
    currentY += 10;

    // Detalles por colectivo
    Object.keys(agrupadosPorColectivo).forEach((colectivo) => {
      const colectivoEventos = agrupadosPorColectivo[colectivo];
      const totalColectivo = colectivoEventos.length;
      totalContactosPorColectivo += totalColectivo;

      doc.text(colectivo, 10, currentY); // Nombre del colectivo
      doc.text(`${totalColectivo}`, 80, currentY); // Número de oportunidades
      currentY += 10;
    });

    // Mostrar el total de Contactos por Colectivo debajo de las oportunidades, alineado en la columna 80
    doc.text(`Total contactos por Colectivo:`, 10, currentY);
    doc.text(`${totalContactosPorColectivo}`, 80, currentY);
    currentY += 20;

    // Sección de Totales de Pendientes y Resueltos
    doc.setFontSize(14);
    doc.text("Totales por Estado:", 10, currentY);
    doc.setFontSize(12);
    currentY += 10;

    // Mostrar Totales de Pendientes y Resueltos con formato especial
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0); // Color rojo para el texto
    doc.text(`Total Pendientes: ${totalPendientes}`, 10, currentY);
    doc.text(`${totalPendientes}`, 80, currentY); // Alineado en la misma columna
    currentY += 10;
    doc.setTextColor(0, 102, 0); // Color verde para el texto
    doc.text(`Total Resueltos: ${totalResueltos}`, 10, currentY);
    doc.text(`${totalResueltos}`, 80, currentY); // Alineado en la misma columna
    currentY += 20;

    // Guardar el archivo PDF
    const nombreInforme = `informe_eventos_${fechaActual.toLocaleDateString()}`;
    doc.save(`${nombreInforme}.pdf`);
  };

  // Función para agrupar eventos por fuente
  const agruparPorFuente = (eventos: any[]) => {
    return eventos.reduce((grupo: any, evento: any) => {
      const fuente = evento.fuente || "Desconocido";
      if (!grupo[fuente]) {
        grupo[fuente] = [];
      }
      grupo[fuente].push(evento);
      return grupo;
    }, {});
  };

  // Función para agrupar eventos por colectivo
  const agruparPorColectivo = (eventos: any[]) => {
    return eventos.reduce((grupo: any, evento: any) => {
      const colectivo = evento.colectivo || "Desconocido";
      if (!grupo[colectivo]) {
        grupo[colectivo] = [];
      }
      grupo[colectivo].push(evento);
      return grupo;
    }, {});
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Eventos Pendientes</h1>

      {/* Botones para cambiar el estado ('pendiente' o 'gestionado') */}
      <div className="mb-4">
        <button
          onClick={() => setStatus("pendiente")}
          className={`py-2 px-4 font-semibold ${
            status === "pendiente" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setStatus("gestionado")}
          className={`py-2 px-4 font-semibold ${
            status === "gestionado" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Gestionados
        </button>
      </div>

      {/* Si estamos cargando, mostramos un mensaje de carga */}
      {loading && <p>Cargando eventos...</p>}

      {/* Si hay un error, lo mostramos */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Si no estamos cargando ni hay error, mostramos los eventos */}
      {!loading && !error && eventos.length === 0 && (
        <p>No hay eventos disponibles.</p>
      )}

      {eventos.length > 0 && (
        <div>Haz click en Generar PDF para crear informe</div>
      )}

      {/* <ul className="list-disc pl-4">
        {eventos.map((evento, index) => (
          <li key={index}>
            <p>
              <strong>Evento {index + 1}:</strong>
            </p>
            <p>
              <strong>Colectivo:</strong> {evento.colectivo}
            </p>
            <p>
              <strong>Fuente:</strong> {evento.fuente}
            </p>
            <p>
              <strong>Estado:</strong> {evento.status}
            </p>
          </li>
        ))}
      </ul> */}

      {/* Botón para generar el PDF */}
      <button
        onClick={generarPDF}
        className="py-2 px-4 bg-green-600 text-white rounded mt-4"
      >
        Generar PDF
      </button>
    </div>
  );
};

export default Informes;
