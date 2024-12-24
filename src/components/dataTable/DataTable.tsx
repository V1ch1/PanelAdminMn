// @ts-nocheck
import React, { useMemo, useState, Fragment } from "react";
import { Grid } from "gridjs-react";
import { h } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import { Dialog, Transition } from "@headlessui/react";
import { Event } from "../../services/apiService";

interface DataTableProps {
  events: Event[];
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventData, setEventData] = useState<Event[]>(events);

  const openPopup = (event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setSelectedEvent(null);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setEventData((prevData) =>
      prevData.map((event) =>
        event.id === id ? { ...event, status: newStatus } : event
      )
    );
  };

  const filteredEvents = useMemo(() => {
    return eventData.filter((event) =>
      Object.values(event).some((value) =>
        normalizeText(String(value)).includes(normalizeText(searchTerm))
      )
    );
  }, [eventData, searchTerm]);

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
    h(
      "select",
      {
        className: "border rounded px-2 py-1",
        value: event.status,
        onChange: (e) => handleStatusChange(event.id, e.target.value),
      },
      h("option", { value: "pendiente" }, "Pendiente"),
      h("option", { value: "resuelto" }, "Resuelto")
    ),
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
    { name: "ID", width: "60px" },
    { name: "Fecha y Hora", width: "70px" },
    { name: "Correo", width: "150px" },
    { name: "IcodCli", width: "60px" },
    { name: "Colectivo", width: "70px" },
    { name: "Asunto", width: "200px" },
    { name: "Fuente", width: "70px" },
    { name: "Sección", width: "70px" },
    { name: "Estado", width: "100px" },
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

      {/* PopUp */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closePopup}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Información del Evento
                  </Dialog.Title>
                  <div className="mt-4 space-y-2">
                    {selectedEvent && (
                      <>
                        <p>
                          <strong>ID:</strong> {selectedEvent.id}
                        </p>
                        <p>
                          <strong>Asunto:</strong> {selectedEvent.asunto}
                        </p>
                        <p>
                          <strong>Colectivo:</strong> {selectedEvent.colectivo}
                        </p>
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {new Date(selectedEvent.created_at).toLocaleString(
                            "es-ES"
                          )}
                        </p>
                        <p>
                          <strong>Correo:</strong> {selectedEvent.email}
                        </p>
                        <p>
                          <strong>Fuente:</strong> {selectedEvent.fuente}
                        </p>
                        <p>
                          <strong>IcodCli:</strong> {selectedEvent.icodcli}
                        </p>
                        <p>
                          <strong>Sección:</strong> {selectedEvent.section}
                        </p>
                        <p>
                          <strong>Estado:</strong> {selectedEvent.status}
                        </p>
                        <p>
                          <strong>Weight:</strong> {selectedEvent.weight}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      onClick={closePopup}
                    >
                      Cerrar
                    </button>
                  </div>
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
