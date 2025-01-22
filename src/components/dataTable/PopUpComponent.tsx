// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Event, getEventByCodcli } from "../../services/apiService";
import { formatDate } from "../../utils/formatDate";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";

interface PopUpComponentProps {
  isOpen: boolean;
  icodCli: string | null;
  asunto: string | null;
  closePopup: () => void;
  fetchEvents: () => void; // Nueva propiedad para actualizar la tabla
}

const PopUpComponent: React.FC<PopUpComponentProps> = ({
  isOpen,
  icodCli,
  asunto,
  closePopup,
  fetchEvents, // Destructurar la nueva propiedad
}) => {
  const [eventDetails, setEventDetails] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Estado de isOpen, icodCli, asunto:", isOpen, icodCli, asunto);
    const fetchEventDetails = async () => {
      if (!icodCli || !asunto) {
        setError("Faltan datos para recuperar el evento.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await getEventByCodcli(icodCli, asunto);
        console.log("Datos del evento:", data);
        const orderedEvents = processEventData(data.events);
        setEventDetails(orderedEvents);
      } catch (err: any) {
        console.error("Error al obtener los detalles:", err);
        setError(
          err.response?.data?.message ||
            "Error al cargar los detalles del evento."
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && icodCli && asunto) fetchEventDetails(); // Condición más robusta
  }, [isOpen, icodCli, asunto]);

  const processEventData = (events: Event[]) => {
    // Ordenar los eventos, asegurándose de que el último evento sea el primero
    return events.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  if (!eventDetails && !loading) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closePopup}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-left">
              <div className="relative">
                <h3 className="text-2xl font-medium text-center text-gray-900 mb-10">
                  Detalles del Evento
                </h3>
                <button
                  type="button"
                  className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
                  onClick={closePopup}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center mt-4 border-t pt-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                </div>
              ) : error ? (
                <div className="mt-4 text-red-500">{error}</div>
              ) : (
                eventDetails && (
                  <div className="mt-4 space-y-4">
                    {/* Campo IcodCli */}
                    <div className="flex items-center">
                      <p className="mr-4">
                        <strong>IcodCli:</strong> {icodCli || "N/A"}
                      </p>
                      {icodCli && (
                        <button
                          onClick={() => navigator.clipboard.writeText(icodCli)}
                          className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
                        >
                          <ClipboardIcon className="h-5 w-5 mr-1" />
                          Copiar
                        </button>
                      )}
                    </div>

                    <p>
                      <strong>Asunto:</strong> {asunto || "N/A"}
                    </p>
                    <div className="flex items-center">
                      <p className="mr-4">
                        <strong>Correo:</strong>{" "}
                        {eventDetails?.[0]?.email || "N/A"}
                      </p>
                      {eventDetails?.[0]?.email && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              eventDetails[0].email || ""
                            )
                          }
                          className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
                        >
                          <ClipboardIcon className="h-5 w-5 mr-1" />
                          Copiar
                        </button>
                      )}
                    </div>
                    {eventDetails.map((event, index) => (
                      <div key={index} className="border-t pt-2">
                        <p>
                          <strong>Sección:</strong> {event.section || "N/A"}
                        </p>
                        <p>
                          <strong>Fecha:</strong> {formatDate(event.created_at)}
                        </p>
                        <p>
                          <strong>Fuente:</strong> {event.fuente || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PopUpComponent;
