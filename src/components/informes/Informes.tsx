import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { getEvents } from "../../services/apiService";

const Informes: React.FC = () => {
  const [informes, setInformes] = useState<any[]>([]); // Almacena datos completos de los informes
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const cargarInformes = () => {
      const informesGuardados = JSON.parse(
        localStorage.getItem("informes") || "[]"
      );
      setInformes(informesGuardados);
    };

    cargarInformes();

    const intervalo = setInterval(() => {
      generarInformeAutomatico();
    }, 2 * 60 * 60 * 1000); // Cada 2 horas

    return () => clearInterval(intervalo);
  }, []);

  const cargarEventos = async () => {
    try {
      const eventosObtenidos = await getEvents("active");
      return eventosObtenidos;
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
      return [];
    }
  };

  const generarInformeAutomatico = async () => {
    const eventosObtenidos = await cargarEventos();

    if (!eventosObtenidos || eventosObtenidos.length === 0) {
      alert("No hay eventos disponibles para generar el informe automático.");
      return;
    }

    const ahora = new Date();
    const nombreInforme = `informe_automatico_${format(
      ahora,
      "yyyy-MM-dd_HH-mm"
    )}`;

    const informeData = {
      nombre: nombreInforme,
      fecha: ahora,
      eventos: eventosObtenidos,
    };

    const nuevosInformes = [...informes, informeData];
    setInformes(nuevosInformes);
    localStorage.setItem("informes", JSON.stringify(nuevosInformes));

    generarPDF(nombreInforme, eventosObtenidos, ahora);
  };

  const generarPDF = (nombre: string, eventos: any[], fecha: Date) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Informe", 10, 10);
    doc.setFontSize(12);
    doc.text(`Fecha y hora: ${format(fecha, "yyyy-MM-dd HH:mm")}`, 10, 20);

    let currentY = 30;

    eventos.forEach((evento: any, index: number) => {
      doc.text(`Evento ${index + 1}`, 10, currentY);
      currentY += 10;
      doc.text(`  - IcodCli: ${evento.icodcli || "N/A"}`, 10, currentY);
      currentY += 10;
      doc.text(`  - Asunto: ${evento.asunto || "N/A"}`, 10, currentY);
      currentY += 10;
      doc.text(`  - Correo: ${evento.email || "N/A"}`, 10, currentY);
      currentY += 10;
      doc.text(`  - Sección: ${evento.section || "N/A"}`, 10, currentY);
      currentY += 10;
      doc.text(`  - Fecha: ${evento.created_at || "N/A"}`, 10, currentY);
      currentY += 10;
      doc.text(`  - Fuente: ${evento.fuente || "N/A"}`, 10, currentY);
      currentY += 15;

      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(`${nombre}.pdf`);
  };

  const descargarInforme = (informe: any) => {
    const { nombre, eventos, fecha } = informe;
    generarPDF(nombre, eventos, new Date(fecha));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Informes</h1>

      {/* Generación manual de informes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generar Informe Manual</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={generarInformeAutomatico}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Generar Informe
          </button>
        </div>
      </div>

      {/* Listado de informes automáticos */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Informes Generados</h2>
        <ul className="list-disc pl-4">
          {informes.length > 0 ? (
            informes.map((informe, index) => (
              <li key={index}>
                <button
                  onClick={() => descargarInforme(informe)}
                  className="text-blue-500 hover:underline"
                >
                  {informe.nombre}
                </button>
              </li>
            ))
          ) : (
            <p>No hay informes disponibles.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Informes;
