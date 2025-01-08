import React, { useEffect, useState } from "react";
import { getEvents } from "../../services/apiService";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/outline"; // Importar el icono de Heroicons

const Informes: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]); // Estado para los eventos
  const [loading, setLoading] = useState<boolean>(false); // Para mostrar el loading
  const [error, setError] = useState<string | null>(null); // Para manejar errores
  const [status, setStatus] = useState<"pendiente" | "gestionado" | "totales">(
    "pendiente"
  ); // Estado para el parámetro 'status'
  const [fechaInicio, setFechaInicio] = useState<string>(""); // Fecha de inicio
  const [fechaFin, setFechaFin] = useState<string>(""); // Fecha de fin
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false); // Estado para mostrar/ocultar filtros

  useEffect(() => {
    const cargarEventos = async () => {
      setLoading(true);
      setError(null);
      try {
        let eventosObtenidos = [];
        if (status === "totales") {
          const pendientes = await getEvents("pendiente");
          const gestionados = await getEvents("gestionado");
          eventosObtenidos = [...pendientes, ...gestionados];
        } else {
          eventosObtenidos = await getEvents(status);
        }
        setEventos(eventosObtenidos);
      } catch (err: unknown) {
        setError("Error al cargar los eventos.");
        console.error("Error al cargar los eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, [status]);

  // Filtrar eventos por rango de fechas
  const filtrarEventosPorRango = () => {
    if (!fechaInicio || !fechaFin) {
      return eventos; // Si no hay fechas seleccionadas, devuelve todos los eventos
    }

    const inicio = new Date(fechaInicio).setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin).setHours(23, 59, 59, 999);

    return eventos.filter((evento) => {
      const fechaEvento = new Date(evento.created_at).getTime();
      return fechaEvento >= inicio && fechaEvento <= fin;
    });
  };

  // Función para corregir nombres de colectivos
  const corregirNombreColectivo = (nombre: string): string => {
    const mapeoCorrecciones: Record<string, string> = {
      asesorias: "Asesorías",
      abogados: "Abogados",
      "entidades-sociales": "Entidades sociales",
      clinicas: "Clínicas",
      formacion: "Formación",
      odontologos: "Odontólogos",
    };

    // Si el nombre está en el mapeo, usamos la corrección
    if (mapeoCorrecciones[nombre.toLowerCase()]) {
      return mapeoCorrecciones[nombre.toLowerCase()];
    }

    // Si no está, aplicamos lógica general:
    // 1. Reemplazar guiones con espacios
    // 2. Capitalizar la primera letra
    return nombre
      .replace(/-/g, " ") // Cambiar guiones por espacios
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalizar la primera letra
  };

  // Agrupación y ordenación personalizada
  const agruparYOrdenarPorClave = (eventos: any[], clave: string) => {
    const agrupados = eventos.reduce((acumulador: any, evento: any) => {
      const valorClave = evento[clave] || "Desconocido";
      if (!acumulador[valorClave]) {
        acumulador[valorClave] = 0;
      }
      acumulador[valorClave]++;
      return acumulador;
    }, {});

    // Convertir en un array, aplicar corrección de nombres y ordenar
    const corregidosYOrdenados = Object.entries(agrupados)
      .map(([clave, total]) => [corregirNombreColectivo(clave), total])
      .sort(([, totalA], [, totalB]) => totalB - totalA); // Ordenar en orden descendente por el total

    return corregidosYOrdenados;
  };

  // Obtener datos procesados
  const eventosFiltrados = filtrarEventosPorRango();
  const totalEventosFiltrados = eventosFiltrados.length;
  const eventosPorColectivo = agruparYOrdenarPorClave(
    eventosFiltrados,
    "colectivo"
  );
  const eventosPorFuente = agruparYOrdenarPorClave(eventosFiltrados, "fuente");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Informe de Leads</h1>
      {/* Contenedor principal con botones y filtros */}
      <div className="mb-4 flex items-center justify-between flex-wrap">
        {/* Botones de estado */}
        <div className="flex">
          <button
            onClick={() => setStatus("pendiente")}
            className={`py-2 px-4 font-semibold ${
              status === "pendiente" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatus("gestionado")}
            className={`py-2 px-4 font-semibold ${
              status === "gestionado" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Gestionados
          </button>
          <button
            onClick={() => setStatus("totales")}
            className={`py-2 px-4 font-semibold ${
              status === "totales" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Totales
          </button>

          {/* Botón de filtros */}
          <button
            onClick={() => setMostrarFiltros((prev) => !prev)}
            className="ml-2 p-2 bg-gray-300 rounded hover:bg-gray-400 flex items-center"
            title="Mostrar/ocultar filtros"
          >
            <AdjustmentsVerticalIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Filtros de fecha (visibles solo si mostrarFiltros es true) */}
      {mostrarFiltros && (
        <div className="mb-4 flex flex-wrap space-x-4 w-full md:w-auto">
          <label className="flex flex-col">
            <span className="text-gray-700 font-bold">Fecha Inicio:</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border p-1 w-full"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 font-bold">Fecha Fin:</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border p-1 w-full"
            />
          </label>
        </div>
      )}

      {/* Mostrar estado de carga, errores o resultados */}
      {loading && <p>Cargando eventos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div>
          <p className="text-lg mb-4">
            {status === "totales"
              ? `Total de eventos: ${totalEventosFiltrados}`
              : `Total de eventos ${status}: ${totalEventosFiltrados}`}
          </p>

          {/* Totales por colectivo */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Total por Colectivo:</h2>
            <ul className="list-disc pl-6">
              {eventosPorColectivo.map(([colectivo, total]) => (
                <li key={colectivo}>
                  {colectivo}: {total}
                </li>
              ))}
            </ul>
          </div>

          {/* Totales por fuente */}
          <div>
            <h2 className="text-lg font-semibold">Total por Fuente:</h2>
            <ul className="list-disc pl-6">
              {eventosPorFuente.map(([fuente, total]) => (
                <li key={fuente}>
                  {fuente}: {total}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Informes;
