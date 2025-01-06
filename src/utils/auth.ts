import axiosInstance from "../api/axios"; // Instancia configurada de Axios
import axios from "axios"; // Importa axios para poder usar isAxiosError

// Función de login
export const login = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post("/login", {
      email: username,
      password: password,
    });

    if (response.status === 200 || response.status === 201) {
      if (response.data && response.data.data) {
        const { email, role } = response.data.data;
        const user = {
          username: email,
          role: role, // Asumiendo que el backend devuelve un valor para el rol
        };

        console.log("Usuario logueado: ", user); // Verificar si el usuario tiene los valores correctos
        localStorage.setItem("user", JSON.stringify(user)); // Guarda el usuario en localStorage

        return user;
      } else {
        console.error(
          "Error: No se encontraron los datos del usuario en la respuesta."
        );
        return null;
      }
    } else {
      console.error("Error en el login: Respuesta inesperada", response);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error de Axios:", error.response?.data || error.message);
    } else {
      console.error("Error desconocido:", error);
    }
    return null;
  }
};
