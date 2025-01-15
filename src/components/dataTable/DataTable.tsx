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
    fetchEvents(activeTab);
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Leads</h1>

      {/* Pestañas */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("pendiente")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "pendiente"
              ? "border-b-2 border-green-700 text-green-700"
              : "text-gray-500 hover:text-green-700"
          }`}
        >
          Leads Pendientes
        </button>
        <button
          onClick={() => setActiveTab("gestionado")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "gestionado"
              ? "border-b-2 border-red-700 text-red-700"
              : "text-gray-500 hover:text-red-700"
          }`}
        >
          Leads Resueltos
        </button>

        {/* Botón Refrescar */}
        <button
          onClick={() => fetchEvents(activeTab)}
          className="py-2 px-4 ml-auto bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Actualizar
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
          fetchEvents={() => fetchEvents(activeTab)} // Pasar la función para actualizar la tabla
        />
      )}
    </div>
  );
};

export default DataTable;
