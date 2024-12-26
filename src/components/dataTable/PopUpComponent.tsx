import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Event, getEventByCodcli } from "../../services/apiService";
import { updateEvent } from "../../services/apiService";

interface PopUpComponentProps {
  isOpen: boolean;
  icodCli: string | null;
  asunto: string | null;
  closePopup: () => void;
}
const PopUpComponent: React.FC<PopUpComponentProps> = ({
  isOpen,
  icodCli,
  asunto,
  closePopup,
}) => {
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!icodCli || !asunto) {
        setError("Faltan datos para recuperar el evento.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getEventByCodcli(icodCli, asunto);
        console.log("Datos del evento:", data);
        setEventDetails(data);
      } catch (err: any) {
        console.error("Error al obtener los detalles:", err); // Imprime el error completo
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

  const handleStatusChange = async () => {
    if (!eventDetails) return;

    const updatedStatus =
      eventDetails.status === "pendiente" ? "gestionado" : "pendiente";

    try {
      setButtonLoading(true);
      await updateEvent(eventDetails.id, updatedStatus);
      setEventDetails({ ...eventDetails, status: updatedStatus });
      alert("Estado actualizado con éxito.");
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
            <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Evento
                </h3>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closePopup}
                >
                  ✖
                </button>
              </div>
              {loading ? (
                <div className="mt-4 text-gray-500">Cargando...</div>
              ) : error ? (
                <div className="mt-4 text-red-500">{error}</div>
              ) : (
                eventDetails && (
                  <div className="mt-4 space-y-4">
                    <p>
                      <strong>ID:</strong> {eventDetails.id}
                    </p>
                    <p>
                      <strong>IcodCli:</strong> {eventDetails.icodcli || "N/A"}
                    </p>
                    <p>
                      <strong>Correo:</strong> {eventDetails.email || "N/A"}
                    </p>
                    <p>
                      <strong>Estado:</strong> {eventDetails.status}
                    </p>
                    <div className="flex justify-end mt-6">
                      <button
                        className={`py-2 px-4 text-white rounded ${
                          eventDetails.status === "pendiente"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={handleStatusChange}
                        disabled={buttonLoading}
                      >
                        {buttonLoading
                          ? "Actualizando..."
                          : eventDetails.status === "pendiente"
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
