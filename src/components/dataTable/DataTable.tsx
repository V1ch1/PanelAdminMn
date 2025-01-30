// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Grid } from "gridjs-react";
import { h } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import PopUpComponent from "./PopUpComponent";
import { getEvents, Event } from "../../services/apiService";
import { SkeletonLoader } from "../SkeletonLoader/SkeletonLoader";

const DataTable: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [asunto, setSelectAsunto] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIcodCli, setSelectedIcodCli] = useState<string | null>(null);

  // Recuperar todos los eventos combinando los estados
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Llamar a la API para obtener pendientes y gestionados
      const pendingEvents = await getEvents("pendiente");
      const managedEvents = await getEvents("gestionado");

      // Combinar ambos conjuntos de datos
      const combinedEvents = [...pendingEvents, ...managedEvents];
      setEvents(combinedEvents);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openPopup = (icodCli: string, asunto: string) => {
    setSelectedIcodCli(icodCli);
    setSelectAsunto(asunto);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false); // Cierra el popup
    setSelectAsunto(""); // Resetea el asunto seleccionado
    setSelectedIcodCli(null); // Resetea el icodCli seleccionado
  };

  const tableRows = events.map((event) => [
    new Date(event.created_at).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    event.email || "N/A",
    event.icodcli || "N/A",
    event.colectivo || "N/A",
    event.asunto || "N/A",
    event.fuente || "N/A",
    event.section || "N/A",
    h(
      "button",
      {
        className: "py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700",
        onClick: () => openPopup(event.icodcli, event.asunto),
      },
      "Ver más"
    ),
  ]);

  const columns = [
    "Fecha y Hora",
    "Correo",
    "IcodCli",
    "Colectivo",
    "Asunto",
    "Fuente",
    "Sección",
    "Acciones",
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Listado de Leads</h1>

      {/* Botón Refrescar */}
      <button
        onClick={fetchEvents}
        className="py-2 px-4 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Actualizar
      </button>

      {/* Tabla */}
      {loading ? (
        <SkeletonLoader />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Grid
          data={tableRows}
          columns={columns}
          sort={true}
          resizable={true}
          search={true}
          pagination={{ enabled: true, limit: 50 }}
          language={{
            search: {
              placeholder: "Buscar...",
            },
            pagination: {
              previous: "Anterior",
              next: "Siguiente",
              showing: "Mostrando",
              results: () => "resultados",
              to: "de",
              of: "de",
            },
            noRecordsFound: "No se encontraron leads en este momento",
          }}
          className={{
            table: "table-auto w-full text-sm",
            header: "bg-gray-100 text-gray-700 font-bold",
            row: "hover:bg-gray-50",
          }}
        />
      )}

      {/* Popup */}
      {selectedIcodCli && (
        <PopUpComponent
          isOpen={isOpen}
          icodCli={selectedIcodCli}
          asunto={asunto}
          closePopup={closePopup}
          fetchEvents={fetchEvents}
        />
      )}
    </div>
  );
};

export default DataTable;
