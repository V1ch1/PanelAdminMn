import axiosInstance from "../api/axios"; // Importamos la configuración de Axios

// Definir la interfaz del tipo de dato que devuelve la API
export interface Event {
  id: string; // Ajusta este tipo según los datos reales de tu API
  fuente: string;
  section: string;
  email: string;
  icodcli: string;
  asunto: string;
  status: string;
  colectivo: string;
}

//Endpoint para obtener todos los eventos

// Endpoint para obtener todos los eventos
export const getEvents = async (status: string): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get("/get-events", {
      params: { status }, // Agrega el parámetro de consulta
    });

    console.log("Respuesta de la API:", response); // Verificar estructura de la respuesta

    // Extrae los eventos desde `response.data.data.events`
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

// Endpoint para obtener un evento por codcli
export const getEventByCodcli = async (codcli: string): Promise<Event> => {
  try {
    // Aquí ya no incluimos `/dev` porque está en la baseURL
    const response = await axiosInstance.get<Event>(
      `/get-event-by-codcli?codcli=${encodeURIComponent(codcli)}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el evento por codcli:", error.message);
    throw new Error(
      error.response?.data?.message || "Error al obtener el evento por codcli"
    );
  }
};

// Endpoint para actualizar un evento
export const updateEvent = async (
  id: string,
  status: string
): Promise<void> => {
  try {
    await axiosInstance.post("/update", { id, status });
  } catch (error: any) {
    console.error("Error al actualizar el evento:", error.message);
    throw new Error(
      error.response?.data?.message || "Error al actualizar el evento"
    );
  }
};
