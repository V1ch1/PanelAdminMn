import React, { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

import "@ag-grid-community/styles/ag-grid.css"; // Estilos base de AG-Grid
import "@ag-grid-community/styles/ag-theme-quartz.css";
// Importar configuración de la grid
import gridConfig from "../../styles/gridConfig";

import {
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ModuleRegistry,
} from "ag-grid-community";

// Registra los módulos válidos
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
]);

interface Event {
  id: number;
  icodcli: string;
  colectivo: string;
  asunto: string;
  email: string;
  fuente: string;
  section: string;
  created_at: string;
  weight: number;
  status: string;
}

interface DataTableProps {
  events: { data: { events: Event[] } };
  loading: boolean;
  error: string | null;
  onRowClick: (event: Event) => void;
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
  onRowClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const validEvents = useMemo(() => {
    return (events?.data?.events || []) as Event[];
  }, [events]);

  const columns = useMemo(
    () => [
      {
        headerName: "ID",
        field: "id",
        filter: "agNumberColumnFilter",
        minWidth: 100,
        flex: 0.5,
      },
      {
        headerName: "IcodCli",
        field: "icodcli",
        filter: "agTextColumnFilter",
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: "Colectivo",
        field: "colectivo",
        filter: "agTextColumnFilter",
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: "Asunto",
        field: "asunto",
        filter: "agTextColumnFilter",
        minWidth: 200,
        flex: 2,
      },
      {
        headerName: "Correo",
        field: "email",
        filter: "agTextColumnFilter",
        minWidth: 180,
        flex: 1.5,
      },
      {
        headerName: "Fuente",
        field: "fuente",
        filter: "agTextColumnFilter",
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: "Sección",
        field: "section",
        filter: "agTextColumnFilter",
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: "Fecha / Hora",
        field: "created_at",
        filter: "agDateColumnFilter",
        valueFormatter: (params: { value: string }) =>
          format(new Date(params.value), "dd-MM-yyyy HH:mm"),
        minWidth: 160,
        flex: 1.2,
      },
      {
        headerName: "Peso",
        field: "weight",
        filter: "agNumberColumnFilter",
        minWidth: 100,
        flex: 0.5,
      },
      {
        headerName: "Estado",
        field: "status",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["Pendiente", "Resuelto"],
        },
        minWidth: 120,
        flex: 0.8,
      },
      {
        headerName: "Acciones",
        cellRenderer: (params: { data: Event }) => (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(params.data);
            }}
          >
            + Info
          </button>
        ),
        minWidth: 100,
        flex: 0.5,
        sortable: false,
        filter: false,
        suppressMovable: true,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return validEvents.filter((row) =>
      Object.values(row).some((value) =>
        normalizeText(String(value)).includes(normalizeText(searchTerm))
      )
    );
  }, [validEvents, searchTerm]);

  const filteredByDate = useMemo(() => {
    return filteredData.filter((row) => {
      const rowDate = new Date(row.created_at);
      if (startDate && rowDate < startDate) return false;
      if (endDate && rowDate > endDate) return false;
      return true;
    });
  }, [filteredData, startDate, endDate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Inicio:</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholderText="Fecha inicial"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Fin:</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholderText="Fecha final"
            />
          </div>
          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
          >
            Limpiar fechas
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar en todos los campos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-hidden">
          <div
            className="ag-theme-quartz"
            style={{
              height: "600px",
              width: "100%",
            }}
          >
            <AgGridReact
              columnDefs={columns}
              rowData={filteredByDate}
              {...gridConfig}
              onRowClicked={(e) => onRowClick(e.data)}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold">Detalles del Evento</h2>
            <p>
              <strong>ID:</strong> {selectedEvent.id}
            </p>
            <p>
              <strong>Asunto:</strong> {selectedEvent.asunto}
            </p>
            <p>
              <strong>Correo:</strong> {selectedEvent.email}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {format(new Date(selectedEvent.created_at), "dd-MM-yyyy HH:mm")}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={() => setSelectedEvent(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
