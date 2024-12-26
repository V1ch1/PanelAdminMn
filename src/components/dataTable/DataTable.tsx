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

const DataTable: React.FC<DataTableProps> = ({
  events,
  loading,
  error,
  fetchEvents,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [tableData, setTableData] = useState<Event[]>(events);
  const [activeTab, setActiveTab] = useState<"pendientes" | "resueltos">(
    "pendientes"
  );

  console.log(tableData, "esto es tableData");

  // Configurar un intervalo para actualizar cada 30 segundos (comentado)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchEvents();
  //   }, 30000); // 30 segundos

  //   return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  // }, [fetchEvents]);

  useEffect(() => {
    setTableData(events);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return tableData
      .filter(
        (event) =>
          (activeTab === "pendientes" && event.status === "pendiente") ||
          (activeTab === "resueltos" && event.status === "resuelto")
      )
      .filter((event) =>
        Object.values(event).some((value) =>
          normalizeText(String(value)).includes(normalizeText(searchTerm))
        )
      );
  }, [tableData, searchTerm, activeTab]);

  if (loading) return <SkeletonLoader />;
  if (error) return <div>Error: {error}</div>;

  const openPopup = (event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setSelectedEvent(null);
  };

  const toggleStatus = () => {
    if (selectedEvent) {
      const updatedStatus =
        selectedEvent.status === "pendiente" ? "resuelto" : "pendiente";
      setSelectedEvent({ ...selectedEvent, status: updatedStatus });
      setTableData((prevData) =>
        prevData.map((event) =>
          event.id === selectedEvent.id
            ? { ...event, status: updatedStatus }
            : event
        )
      );
    }
  };

  const tableRows = filteredEvents.map((event) => [
    // event.id,
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
        onClick: () => openPopup(event),
      },
      "Ver más"
    ),
  ]);

  const columns = [
    // { name: "ID" },
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

  console.log(tableData, "esto es tableData");

  return (
    <div className="">
      {/* Tabs para seleccionar Pendientes o Resueltos */}
      <div
        className={`flex justify-center items-center border-b py-4 ${
          activeTab === "pendientes" ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <button
          onClick={() => setActiveTab("pendientes")}
          className={`py-2 px-4 font-semibold transition-all ${
            activeTab === "pendientes"
              ? "border-b-2 border-green-700 text-green-700"
              : "text-black"
          }`}
        >
          Leads Pendientes
        </button>
        <button
          onClick={() => setActiveTab("resueltos")}
          className={`py-2 px-4 font-semibold transition-all ${
            activeTab === "resueltos"
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
        style={{
          table: {
            tableLayout: "auto", // Ajuste automático del ancho de columnas
            width: "100%", // La tabla ocupa todo el espacio disponible
          },
          th: {
            whiteSpace: "nowrap", // Evita que el texto en el encabezado se envuelva
          },
          td: {
            whiteSpace: "nowrap", // Evita que el texto en las celdas se envuelva
          },
        }}
        language={{
          search: {
            placeholder: "Buscar eventos...",
          },
          pagination: {
            previous: "Anterior",
            next: "Siguiente",
            showing: "Mostrando",
            results: "resultados",
            to: "a",
            of: "de",
          },
        }}
      />

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closePopup}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all sm:w-3/4 md:w-1/2 lg:w-1/3">
                  <div className="flex justify-between items-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Información del Evento
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={closePopup}
                    >
                      ✖
                    </button>
                  </div>
                  {selectedEvent && (
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>ID:</strong> {selectedEvent.id}
                      </p>
                      <p>
                        <strong>Correo:</strong> {selectedEvent.email}
                      </p>
                      <p>
                        <strong>Fecha de Creación:</strong>{" "}
                        {new Date(selectedEvent.created_at).toLocaleString(
                          "es-ES",
                          {
                            dateStyle: "short",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                      <p>
                        <strong>IcodCli:</strong> {selectedEvent.icodcli}
                      </p>
                      <p>
                        <strong>Colectivo:</strong>{" "}
                        {selectedEvent.colectivo || "N/A"}
                      </p>
                      <p>
                        <strong>Asunto:</strong> {selectedEvent.asunto || "N/A"}
                      </p>
                      <p>
                        <strong>Fuente:</strong> {selectedEvent.fuente || "N/A"}
                      </p>
                      <p>
                        <strong>Sección:</strong> {selectedEvent.section}
                      </p>
                      <p>
                        <strong>Estado:</strong> {selectedEvent.status}
                      </p>
                      <div className="flex justify-end mt-6">
                        <button
                          className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={toggleStatus}
                        >
                          Marcar como{" "}
                          {selectedEvent.status === "pendiente"
                            ? "resuelto"
                            : "pendiente"}
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DataTable;
