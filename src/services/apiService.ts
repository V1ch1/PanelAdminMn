// @ts-nocheck

import axiosInstance from "../api/axios"; // Importamos la configuración de Axios

// Definir la interfaz del tipo de dato que devuelve la API
export interface Event {
  id: string;
  fuente: string;
  section: string;
  email: string;
  icodcli: string;
  asunto: string;
  status: string;
  colectivo: string;
  created_at: string; // Asegúrate de que esta propiedad exista
}

interface GetEventByCodcliResponse {
  events: Event[];
}

// Endpoint para obtener todos los eventos
export const getEvents = async (status: string): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get("/get-events", {
      params: { status },
    });

    if (
      response.data?.data?.events &&
      Array.isArray(response.data.data.events)
    ) {
      return response.data.data.events;
    }

    throw new Error("La API devolvió una estructura inesperada");
  } catch (error: any) {
    console.error("Error al obtener los eventos:", error.message);
    throw new Error(
      error.response?.data?.message || "Error al obtener los eventos"
    );
  }
};

export const getEventByCodcli = async (
  codcli: string,
  asunto: string
): Promise<{ data: GetEventByCodcliResponse }> => {
  try {
    const url = `/get-event-by-codcli?icodcli=${encodeURIComponent(
      codcli
    )}&asunto=${encodeURIComponent(asunto)}`;
    const response = await axiosInstance.get<{
      data: GetEventByCodcliResponse;
    }>(url);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el evento por codcli:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener el evento por codcli"
    );
  }
};

// Endpoint para actualizar un evento
export const updateEvent = async (
  icodcli: string,
  status: string,
  asunto: string
): Promise<void> => {
  try {
    await axiosInstance.post("/update", { icodcli, status, asunto });
  } catch (error: any) {
    console.error("Error al actualizar el evento:", error.message);
    throw new Error(
      error.response?.data?.message || "Error al actualizar el evento"
    );
  }
};
