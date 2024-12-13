export interface User {
  username: string;
  role: "admin" | "user"; // Solo dos roles
}

// Función de login
export const login = (username: string, password: string): boolean => {
  if (username === "admin" && password === "admin") {
    const user = { username, role: "admin" };
    localStorage.setItem("user", JSON.stringify(user)); // Guardamos el usuario en LocalStorage
    return true;
  } else if (username === "user" && password === "user") {
    const user = { username, role: "user" };
    localStorage.setItem("user", JSON.stringify(user)); // Guardamos el usuario en LocalStorage
    return true;
  }
  return false;
};

// Función de logout
export const logout = (): void => {
  localStorage.removeItem("user"); // Borramos el usuario de LocalStorage
};
