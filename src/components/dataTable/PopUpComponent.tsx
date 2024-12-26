import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Event, getEventByCodcli } from "../../services/apiService";
import { updateEvent } from "../../services/apiService";
import { formatDate } from "../../utils/formatDate";

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
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  console.log(eventDetails, "esto es eventDetails");

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
        const uniqueEvents = processEventData(data.events);
        setEventDetails(uniqueEvents);
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
    const uniqueEvents = events.reduce(
      (acc: { [key: string]: Event }, event) => {
        if (!acc[event.fuente]) {
          acc[event.fuente] = event;
        }
        return acc;
      },
      {}
    );

    const orderedEvents = ["mail.video", "mail.precios", "mail.plus.precios"]
      .map((fuente) => uniqueEvents[fuente])
      .filter((event) => event !== undefined);

    return orderedEvents;
  };

  const handleStatusChange = async (id: string) => {
    if (!eventDetails) return;

    const eventToUpdate = eventDetails.find((event) => event.id === id);
    if (!eventToUpdate) return;

    const updatedStatus =
      eventToUpdate.status === "pendiente" ? "gestionado" : "pendiente";

    try {
      setButtonLoading(true);
      await updateEvent(
        eventToUpdate.icodcli,
        updatedStatus,
        eventToUpdate.asunto
      );
      setEventDetails(
        eventDetails.map((event) =>
          event.id === eventToUpdate.id
            ? { ...event, status: updatedStatus }
            : event
        )
      );
      fetchEvents(); // Actualizar la tabla después de cambiar el estado
    } catch (error: any) {
      console.error("Error al actualizar el estado:", error);
      alert(
        "Error al actualizar el estado: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setButtonLoading(false);
    }
  };

  if (!eventDetails && !loading) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closePopup}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium align text-gray-900">
                  Detalles del Evento
                </h3>
                <button
                  type="button"
                  className="text-black hover:text-gray-700"
                  onClick={closePopup}
                >
                  ✖
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
                </div>
              ) : error ? (
                <div className="mt-4 text-red-500">{error}</div>
              ) : (
                eventDetails && (
                  <div className="mt-4 space-y-4">
                    <p>
                      <strong>IcodCli:</strong> {icodCli || "N/A"}
                    </p>
                    <p>
                      <strong>Asunto:</strong> {asunto || "N/A"}
                    </p>
                    <p>
                      <strong>Correo:</strong> {eventDetails[0].email || "N/A"}
                    </p>
                    {eventDetails.map((event, index) => (
                      <div key={index} className="border-t pt-2">
                        <p>
                          <strong>Sección:</strong> {event.section}
                        </p>
                        <p>
                          <strong>Fecha:</strong> {formatDate(event.created_at)}
                        </p>
                        <p>
                          <strong>Fuente:</strong> {event.fuente}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-end mt-6">
                      <button
                        className={`py-2 px-4 text-white rounded ${
                          eventDetails[0].status === "pendiente"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={() => handleStatusChange(eventDetails[0].id)}
                        disabled={buttonLoading}
                      >
                        {buttonLoading
                          ? "Actualizando..."
                          : eventDetails[0].status === "pendiente"
                          ? "Marcar como Resuelto"
                          : "Marcar como Pendiente"}
                      </button>
                    </div>
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
