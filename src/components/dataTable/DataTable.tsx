// @ts-nocheck
import React, { useEffect, useMemo, useState, Fragment } from "react";
import { Grid } from "gridjs-react";
import { h } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import { Dialog, Transition } from "@headlessui/react";
import { Event } from "../../services/apiService";

interface DataTableProps {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => void; // Función para actualizar los datos
}

const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const DataTable: React.FC<DataTableProps> = ({
  events,
  loading,
  error,
  fetchEvents,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Configurar un intervalo para actualizar cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents();
    }, 30000); // 30 segundos

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      Object.values(event).some((value) =>
        normalizeText(String(value)).includes(normalizeText(searchTerm))
      )
    );
  }, [events, searchTerm]);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;

  const tableData = filteredEvents.map((event) => [
    event.id,
    new Date(event.created_at).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    event.email,
    event.icodcli,
    event.colectivo || "N/A",
    event.asunto || "N/A",
    event.fuente || "N/A",
    event.section,
    event.status,
    h(
      "button",
      {
        className: "py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700",
        onClick: () => alert(`Ver más información sobre el ID: ${event.id}`),
      },
      "Ver más"
    ),
  ]);

  const columns = [
    { name: "ID", width: "60px" },
    { name: "Fecha y Hora", width: "70px" },
    { name: "Correo", width: "150px" },
    { name: "IcodCli", width: "60px" },
    { name: "Colectivo", width: "70px" },
    { name: "Asunto", width: "200px" },
    { name: "Fuente", width: "70px" },
    { name: "Sección", width: "70px" },
    { name: "Estado", width: "70px" },
    { name: "Acciones", width: "60px" },
  ];

  return (
    <div className="space-y-6">
      <Grid
        data={tableData}
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
    </div>
  );
};

export default DataTable;
