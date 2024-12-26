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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pendiente" | "gestionado">(
    "pendiente"
  );

  const fetchEvents = async (status: "pendiente" | "gestionado") => {
    setLoading(true);
    setError(null);
    try {
      const events = await getEvents(status); // Llamada al servicio
      console.log("Eventos recibidos:", events); // Verifica los datos
      setEvents(events); // Asigna directamente los eventos
    } catch (err: unknown) {
      console.error("Error al obtener eventos:", err); // Depuración adicional
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      Object.values(event).some((value) =>
        normalizeText(String(value)).includes(normalizeText(searchTerm))
      )
    );
  }, [events, searchTerm]);

  const openPopup = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setSelectedEventId(null);
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <div>Error: {error}</div>;

  const tableRows = filteredEvents.map((event) => [
    new Date(event.created_at).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }), // Fecha y hora formateadas
    event.email || "N/A", // Correo
    event.icodcli || "N/A", // Código del cliente
    event.colectivo || "N/A", // Colectivo
    event.asunto || "N/A", // Asunto
    event.fuente || "N/A", // Fuente
    event.section || "N/A", // Sección
    event.status || "N/A", // Estado
    h(
      "button",
      {
        className: "py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700",
        onClick: () => openPopup(event.icodcli), // Abre el popup con `icodcli`
      },
      "Ver más"
    ),
  ]);

  const columns = [
    { name: "Fecha y Hora" },
    { name: "Correo" },
    { name: "IcodCli" },
    { name: "Colectivo" },
    { name: "Asunto" },
    { name: "Fuente" },
    { name: "Sección" },
    { name: "Estado" },
    { name: "Acciones" },
  ];

  return (
    <div>
      <div className="flex justify-center items-center border-b py-4">
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
      </div>

      <Grid
        data={tableRows}
        columns={columns}
        sort={true}
        resizable={true}
        search={{
          enabled: true,
          placeholder: "Buscar...",
        }}
        pagination={{
          enabled: true,
          limit: 50,
        }}
        className={{
          table: "table-auto w-full text-sm",
          header: "bg-gray-100 text-gray-700 font-bold",
          row: "hover:bg-gray-50",
        }}
      />

      <PopUpComponent
        isOpen={isOpen}
        eventId={selectedEventId}
        closePopup={closePopup}
      />
    </div>
  );
};

export default DataTable;
