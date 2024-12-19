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

// Función para obtener los eventos desde la API
export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get<Event[]>("/get-events"); // Endpoint del GET
    return response.data; // Devolvemos los datos de la respuesta
  } catch (error: any) {
    console.error("Error al obtener los eventos:", error.message);
    throw new Error(
      error.response?.data?.message || "Error al obtener los eventos"
    );
  }
};
