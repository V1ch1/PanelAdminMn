// @ts-nocheck
import React, { useMemo, useState } from "react";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { Event } from "../../services/apiService"; // Importamos la interfaz correcta

interface DataTableProps {
  events: Event[]; // Usamos la interfaz real
  loading: boolean;
  error: string | null;
}

const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const DataTable: React.FC<DataTableProps> = ({ events, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    event.icodcli,
    event.colectivo || "N/A",
    event.asunto || "N/A",
    event.email,
    event.fuente || "N/A",
    event.section,
    event.status,
  ]);

  const columns = [
    "ID",
    "IcodCli",
    "Colectivo",
    "Asunto",
    "Correo",
    "Fuente",
    "Sección",
    "Estado",
  ];

  return (
    <div className="space-y-6">
      {/* Tabla */}
      <Grid
        data={tableData}
        columns={columns}
        sort={true}
        resizable={true}
        search={true}
        pagination={{
          enabled: true,
          limit: 20,
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
