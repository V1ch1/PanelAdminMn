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

// Definir la interfaz del tipo de dato que devuelve la API de plantillas
export interface Plantilla {
  id: number;
  template_name: string;
  start_date: string; // La fecha de inicio de la plantilla
  end_date: string; // La fecha de fin de la plantilla
  click_count: number; // Número de clicks
  created_at: string; // Fecha de creación
  updated_at: string; // Fecha de la última actualización
}

export interface GetPlantillasResponse {
  reports: Plantilla[];
}

export const getPlantillas = async (): Promise<Plantilla[]> => {
  try {
    const response = await axiosInstance.get("/reports", {
      params: { page: 1, limit: 50 }, // Si necesitas más parámetros para la consulta, agrégales aquí
    });

    if (
      response.data?.data?.reports &&
      Array.isArray(response.data.data.reports)
    ) {
      return response.data.data.reports;
    }

    throw new Error("La API devolvió una estructura inesperada");
  } catch (error: any) {
    console.error("Error al obtener las plantillas:", error.message);
    throw new Error(
      error.response?.data?.message || "Error al obtener las plantillas"
    );
  }
};

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
