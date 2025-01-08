import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../../public/assets/logo-MN-25-peq.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedCredentials = localStorage.getItem("credentials");
    if (savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials);
      setUsername(username);
      setPassword(password);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(username, password);

    if (result) {
      setError("");
      if (rememberMe) {
        localStorage.setItem(
          "credentials",
          JSON.stringify({ username, password })
        );
      } else {
        localStorage.removeItem("credentials");
      }
      localStorage.setItem("user", JSON.stringify(result));
      navigate("/dashboard");
    } else {
      setError("La contraseña o el nombre de usuario son incorrectos");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <div className="flex items-center justify-center h-20 shrink-0">
          <img
            alt="Logo Mn"
            src={Logo}
            className="h-12 w-auto object-contain"
          />
        </div>
        {error && (
          <div className="text-red-500 mb-4 text-center text-sm">{error}</div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            className="w-full p-2 border rounded mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            className="mr-2"
            onChange={(e) => setRememberMe(e.target.checked)}
            checked={rememberMe}
          />
          <label htmlFor="rememberMe" className="text-gray-700 text-sm">
            Recordar contraseña
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};

export default Login;
