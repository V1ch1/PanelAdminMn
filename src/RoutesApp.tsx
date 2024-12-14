import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./utils/AuthContext";

const RoutesApp = () => {
  const { user, loading } = useAuth(); // Obtén el usuario y el estado de carga desde el contexto

  if (loading) {
    return <div>Loading...</div>; // O puedes mostrar un spinner de carga aquí
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default RoutesApp;
