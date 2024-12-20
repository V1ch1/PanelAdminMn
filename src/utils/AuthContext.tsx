import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, User } from "./auth"; // Simulación de API para login/logout

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Al cargar la aplicación, recuperamos el usuario de localStorage si existe
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    const isLoggedIn = apiLogin(username, password);
    if (isLoggedIn) {
      const user: User = { username, role: "admin" }; // Ejemplo de roles
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    }
    return isLoggedIn;
  };

  const handleLogout = (): void => {
    apiLogout(); // Llamada a la API de logout (opcional)
    localStorage.removeItem("user");
    setUser(null);
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
