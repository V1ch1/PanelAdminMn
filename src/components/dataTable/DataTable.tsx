// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Grid } from "gridjs-react";
import { h } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import PopUpComponent from "./PopUpComponent";
import { getEvents, Event } from "../../services/apiService";

const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-8 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
  </div>
);

const DataTable: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [asunto, setSelectAsunto] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIcodCli, setSelectedIcodCli] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pendiente" | "gestionado">(
    "pendiente"
  );

  const fetchEvents = async (status: "pendiente" | "gestionado") => {
    setLoading(true);
    setError(null);
    try {
      const events = await getEvents(status);
      setEvents(events);
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
    fetchEvents(activeTab);
  }, [activeTab]);

  const openPopup = (icodCli: string, asunto: string) => {
    setSelectedIcodCli(icodCli);
    setSelectAsunto(asunto);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    fetchEvents(activeTab); // Actualizar la tabla después de cerrar el popup
    setSelectAsunto("");
    setSelectedIcodCli(null);
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
    event.status || "N/A",
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
    "Estado",
    "Acciones",
  ];

  return (
    <div>
      {/* Botones Leads */}
      <div className="flex flex-col items-center md:flex-row md:justify-center space-y-4 md:space-y-0 md:space-x-4 border-b py-4">
        {/* Leads Buttons */}
        <button
          onClick={() => setActiveTab("pendiente")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "pendiente"
              ? "border-b-2 border-green-700 text-green-700"
              : "text-black"
          }`}
        >
          Leads Pendientes
        </button>
        <button
          onClick={() => setActiveTab("gestionado")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "gestionado"
              ? "border-b-2 border-red-700 text-red-700"
              : "text-black"
          }`}
        >
          Leads Resueltos
        </button>

        {/* Botón Refrescar */}
        <button
          onClick={() => fetchEvents(activeTab)}
          className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 md:ml-4"
        >
          Refrescar
        </button>
      </div>

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
            },
            noRecordsFound: "No se encontraron Leads en este momento",
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
          fetchEvents={() => fetchEvents(activeTab)} // Pasar la función para actualizar la tabla
        />
      )}
    </div>
  );
};

export default DataTable;
