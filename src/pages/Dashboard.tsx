// @ts-nocheck
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  ChartPieIcon,
  CircleStackIcon,
  HomeIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../public/assets/logo-MN-25-peq.png";
import DataTable from "../components/dataTable/DataTable";
import AnalitycsData from "../components/dashboard/AnalitycsData";
import { RowData } from "../components/dataTable/types";
import { getEvents, Event } from "../services/apiService"; // Importar el servicio de API

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon },
  { name: "Datos", href: "#", icon: CircleStackIcon },
  { name: "Reports", href: "#", icon: ChartPieIcon },
  { name: "Usuarios", href: "#", icon: UserIcon },
  { name: "LogOut", href: "#", icon: ArrowRightOnRectangleIcon },
];

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("Dashboard");
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  // Estados para los datos de la API
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Llamada a la API al montar el componente
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents(); // Llamada a la API
        setEvents(data); // Guardamos los datos en el estado
      } catch (err: any) {
        setError(err.message); // Manejo de errores
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchEvents(); // Ejecutar la función
  }, []);

  const handleNavigationClick = (section: string) => {
    setCurrentSection(section);
  };

  const handleRowClick = (rowData: RowData) => {
    setSelectedRow(rowData);
  };

  return (
    <>
      <div>
        {/* Código del sidebar */}
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />
          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Cerrar Sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <img alt="Logo Mn" src={Logo} className="h-8 w-auto" />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href="#"
                              onClick={() => handleNavigationClick(item.name)}
                              className={classNames(
                                item.name === currentSection
                                  ? "bg-gray-50 text-[#0067c0]"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-[#0067c0]",
                                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  item.name === currentSection
                                    ? "text-[#0067c0]"
                                    : "text-gray-400 group-hover:text-[#0067c0]",
                                  "size-6 shrink-0"
                                )}
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Sidebar fijo en pantallas grandes */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img alt="Logo Mn" src={Logo} className="h-8 w-auto" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href="#"
                          onClick={() => handleNavigationClick(item.name)}
                          className={classNames(
                            item.name === currentSection
                              ? "bg-gray-50 text-[#0067c0]"
                              : "text-gray-700 hover:bg-gray-50 hover:text-[#0067c0]",
                            "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              item.name === currentSection
                                ? "text-[#0067c0]"
                                : "text-gray-400 group-hover:text-[#0067c0]",
                              "size-6 shrink-0"
                            )}
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            >
              <span className="sr-only">Abrir sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Sección según la navegación */}
              {selectedRow ? (
                <div>
                  <h2 className="text-2xl font-bold">Detalles de la Fila</h2>
                  <pre>{JSON.stringify(selectedRow, null, 2)}</pre>
                </div>
              ) : (
                <>
                  {currentSection === "Datos" && (
                    <DataTable
                      events={events} // Pasa los eventos directamente desde data.events
                      loading={loading}
                      error={error}
                      onRowClick={handleRowClick}
                    />
                  )}
                  {currentSection === "Dashboard" && (
                    <AnalitycsData events={events} /> // Pasar los eventos al componente de análisis
                  )}
                  {currentSection === "Reports" && <div>Reports Content</div>}
                  {currentSection === "Usuarios" && <div>Usuarios Content</div>}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
