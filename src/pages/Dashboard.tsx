// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  ChartPieIcon,
  HomeIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../public/assets/logo-MN-25-peq.png";
import DataTable from "../components/dataTable/DataTable";
import AnalitycsData from "../components/dashboard/AnalitycsData";
import UserManagement from "../components/users/UserManagement";
import { getEvents, Event as ApiEvent } from "../services/apiService";
import { useAuth } from "../utils/AuthContext";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Analítica", href: "/dashboard/analytics", icon: ChartPieIcon },
  { name: "Usuarios", href: "/dashboard/users", icon: UserIcon },
  { name: "LogOut", href: "#", icon: ArrowRightOnRectangleIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [intervalTime, setIntervalTime] = useState<number>(30000); // Intervalo predeterminado en ms
  const [customInterval, setCustomInterval] = useState<number>(30); // Intervalo personalizado en segundos

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        if (data?.data?.events && Array.isArray(data.data.events)) {
          setEvents(data.data.events);
        } else {
          console.error("La API devolvió un formato inesperado:", data);
          setEvents([]);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents(); // Llamada inicial

    // Configuración del intervalo
    const intervalId = setInterval(() => {
      const currentHour = new Date().getHours();

      // Cambiar el intervalo según el tramo horario
      if (currentHour >= 9 && currentHour < 18) {
        setIntervalTime(15000); // Cada 15 segundos en horario laboral
      } else {
        setIntervalTime(3600000); // Cada hora fuera de horario laboral
      }

      fetchEvents();
    }, intervalTime);

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
  }, [intervalTime]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInterval = Number(e.target.value);
    if (newInterval > 0) {
      setCustomInterval(newInterval);
      setIntervalTime(newInterval * 1000); // Actualiza el intervalo en ms
    }
  };

  const handleNavigationClick = (item: NavigationItem) => {
    if (item.name === "LogOut") {
      logout();
      navigate("/login");
      return;
    }
    navigate(item.href);
    setSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <ul role="list" className="space-y-4">
      {navigation.map((item) => (
        <li key={item.name}>
          <a
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              handleNavigationClick(item);
            }}
            className={classNames(
              location.pathname === item.href
                ? "text-[#0067c0] font-bold"
                : "text-gray-700 hover:text-[#0067c0]",
              "flex items-center text-lg font-semibold"
            )}
          >
            <item.icon className="h-6 w-6 mr-2" aria-hidden="true" />
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {/* Configuración del intervalo */}
      <div className="p-4 bg-gray-100 border-b flex items-center justify-between">
        <span className="text-sm font-semibold">Intervalo (segundos):</span>
        <input
          type="number"
          min={5}
          value={customInterval}
          onChange={handleIntervalChange}
          className="border rounded px-2 py-1 w-16 text-center"
        />
        <span className="text-sm text-gray-500 ml-4">
          Intervalo actual: {intervalTime / 1000} segundos
        </span>
      </div>

      {/* Botón de hamburguesa para abrir el menú en móvil */}
      <div className="lg:hidden flex justify-between items-center p-4 border-b">
        <img alt="Logo MN" src={Logo} className="h-8 w-auto object-contain" />
        <button onClick={() => setSidebarOpen(true)} className="text-black p-2">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Menú móvil */}
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-900/80" />
        <DialogPanel className="fixed inset-0 bg-white p-4">
          {/* Encabezado del menú móvil */}
          <div className="flex justify-between items-center">
            <img
              alt="Logo MN"
              src={Logo}
              className="h-8 w-auto object-contain"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-black p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Enlaces del menú móvil */}
          <div className="mt-8 flex flex-col items-center">
            {renderSidebarContent()}
          </div>
        </DialogPanel>
      </Dialog>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r">
        <div className="flex flex-col grow p-4">
          <img
            alt="Logo MN"
            src={Logo}
            className="h-12 w-auto object-contain mb-6"
          />
          {renderSidebarContent()}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="lg:pl-64">
        <main className="py-10 px-4">
          <Routes>
            <Route
              path="/"
              element={
                <DataTable events={events} loading={loading} error={error} />
              }
            />
            <Route
              path="/analytics"
              element={<AnalitycsData events={events} />}
            />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
