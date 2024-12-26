// PopUpComponent.tsx
import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Event } from "../../services/apiService";
import { getEventByCodcli, updateEvent } from "../../services/apiService";
import { CheckIcon } from "@heroicons/react/20/solid";

interface PopUpComponentProps {
  isOpen: boolean;
  eventId: string | null;
  closePopup: () => void;
}

const PopUpComponent: React.FC<PopUpComponentProps> = ({
  isOpen,
  eventId,
  closePopup,
}) => {
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventId) {
        setLoading(true);
        setError(null);
        try {
          const data = await getEventByCodcli(eventId);
          setEventDetails(data);
        } catch (err: any) {
          setError(err.message || "Error al cargar los detalles del evento");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleStatusChange = async () => {
    if (!eventDetails) return;

    const updatedStatus =
      eventDetails.status === "pendiente" ? "gestionado" : "pendiente";

    try {
      setButtonLoading(true);
      await updateEvent(eventDetails.id, updatedStatus);
      setEventDetails({ ...eventDetails, status: updatedStatus });
    } catch (error: any) {
      console.error("Error al actualizar el estado del evento:", error);
      alert("No se pudo actualizar el estado del evento.");
    } finally {
      setButtonLoading(false);
    }
  };

  return (
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

                {loading ? (
                  <div className="mt-4 text-gray-500">Cargando...</div>
                ) : error ? (
                  <div className="mt-4 text-red-500">{error}</div>
                ) : eventDetails ? (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <p>
                        <strong>IcodCli:</strong> {eventDetails.icodcli}
                      </p>
                      <p>
                        <strong>Correo:</strong> {eventDetails.email}
                      </p>
                      <p>
                        <strong>Colectivo:</strong>{" "}
                        {eventDetails.colectivo || "N/A"}
                      </p>
                      <p>
                        <strong>Asunto:</strong> {eventDetails.asunto || "N/A"}
                      </p>
                    </div>

                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="bg-green-500 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white">
                                  <CheckIcon
                                    className="h-5 w-5 text-white"
                                    aria-hidden="true"
                                  />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <strong>Fecha:</strong>{" "}
                                    {new Date(
                                      eventDetails.created_at
                                    ).toLocaleString("es-ES", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    <strong>Fuente:</strong>{" "}
                                    {eventDetails.fuente || "N/A"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    <strong>Sección:</strong>{" "}
                                    {eventDetails.section}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        className={`py-2 px-4 text-white rounded hover:opacity-90 ${
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
                ) : (
                  <div className="mt-4 text-gray-500">
                    No hay detalles disponibles.
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PopUpComponent;
