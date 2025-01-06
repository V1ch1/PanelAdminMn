import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../utils/auth";
import { emailRoles } from "../utils/emailRoles"; // Importa los roles basados en email

// Definimos el contexto
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Recuperar usuario del localStorage cuando se carga el componente
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // Verifica y reasigna el rol si está definido en emailRoles
      const role =
        emailRoles[parsedUser.username] || parsedUser.role || "viewer";
      setUser({ ...parsedUser, role }); // Asegúrate de incluir el rol
    }
    setLoading(false);
  }, []);

  // Función de login
  const login = async (username, password) => {
    const result = await loginApi(username, password); // Llamada a la API de login
    if (result) {
      // Asigna el rol basado en el email
      const role = emailRoles[username] || "viewer"; // Rol por defecto si no está en la lista
      const userWithRole = { ...result, role };

      setUser(userWithRole); // Guarda el usuario en el estado
      localStorage.setItem("user", JSON.stringify(userWithRole)); // Guarda el usuario en el localStorage
      return userWithRole;
    }
    return null;
  };

  // Función de logout
  const logout = () => {
    setUser(null); // Limpiamos el estado
    localStorage.removeItem("user"); // Removemos el usuario del localStorage
    navigate("/login"); // Redirigimos al login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
