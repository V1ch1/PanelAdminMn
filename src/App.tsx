import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext"; // Asegúrate de importar el contexto
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* Agregar redirección desde la raíz */}
        <Route path="/" element={<Navigate to="/login" />} />{" "}
        {/* O a /dashboard */}
      </Routes>
    </AuthProvider>
  );
};

export default App;
