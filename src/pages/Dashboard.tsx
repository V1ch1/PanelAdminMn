// @ts-nocheck
import React, { useState } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Logo from "../../public/assets/logo-MN-25-peq.png";
import DataTable from "../components/dataTable/DataTable";
import UserManagement from "../components/users/UserManagement";
import Informes from "../components/informes/Informes";
import { useAuth } from "../utils/AuthContext";

const navigationBase = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "editor", "viewer"],
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: UserIcon,
    roles: ["admin"],
  },
  {
    name: "Informes",
    href: "/dashboard/informes",
    icon: DocumentChartBarIcon,
    roles: ["admin"],
  },
  {
    name: "LogOut",
    href: "#",
    icon: ArrowRightOnRectangleIcon,
    roles: ["admin", "editor", "viewer"],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Accedemos al contexto de autenticación
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("Usuario logueado:", user);

  // Filtra las opciones de navegación según el rol del usuario
  const navigation = navigationBase.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleNavigationClick = (item) => {
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
            <Route path="/" element={<DataTable />} />
            {user?.role === "admin" && (
              <Route path="/users" element={<UserManagement />} />
            )}
            {(user?.role === "admin" || user?.role === "editor") && (
              <Route path="/informes" element={<Informes />} />
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}
