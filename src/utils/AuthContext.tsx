import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login, logout, User } from "./auth"; // Importa las funciones y el tipo de usuario

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean; // Estado de carga para saber si ya se ha recuperado el usuario
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Agregamos el estado de carga

  // Al cargar la página, intentamos obtener la información del usuario desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Cuando se termina de cargar, ya no estamos en "carga"
  }, []);

  // Función para manejar el login
  const handleLogin = (username: string, password: string): boolean => {
    const isLoggedIn = login(username, password);
    if (isLoggedIn) {
      const user: User = { username, role: "admin" }; // Tipo 'User' con roles específicos
      localStorage.setItem("user", JSON.stringify(user)); // Guardamos el usuario en LocalStorage
      setUser(user); // Establecemos el usuario en el estado
    }
    return isLoggedIn;
  };

  // Función para manejar el logout
  const handleLogout = (): void => {
    logout();
    localStorage.removeItem("user"); // Borramos el usuario de LocalStorage
    setUser(null); // Restablecemos el estado
  };

  return (
    <AuthContext.Provider
      value={{ user, login: handleLogin, logout: handleLogout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
