import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext"; // Asegúrate de importar el contexto
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute"; // Asegúrate de crear este componente

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida de dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Redirigir desde la raíz a /login o /dashboard según el estado de autenticación */}
        <Route
          path="/"
          element={
            <Navigate
              to={localStorage.getItem("user") ? "/dashboard" : "/login"} // Verifica si hay un usuario autenticado
            />
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
