import React, { useEffect, useState } from "react";
import { getEvents } from "../../services/apiService";

const Informes: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]); // Estado para los eventos
  const [loading, setLoading] = useState<boolean>(false); // Para mostrar el loading
  const [error, setError] = useState<string | null>(null); // Para manejar errores
  const [status, setStatus] = useState<"pendiente" | "gestionado" | "totales">(
    "pendiente"
  ); // Estado para el parámetro 'status'
  const [fechaInicio, setFechaInicio] = useState<string>(""); // Fecha de inicio
  const [fechaFin, setFechaFin] = useState<string>(""); // Fecha de fin

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

  // Agrupar eventos por clave y ordenar
  const agruparYOrdenarPorClave = (eventos: any[], clave: string) => {
    const agrupados = eventos.reduce((acumulador: any, evento: any) => {
      const valorClave = evento[clave] || "Desconocido";
      if (!acumulador[valorClave]) {
        acumulador[valorClave] = 0;
      }
      acumulador[valorClave]++;
      return acumulador;
    }, {});

    // Convertir en un array y ordenar por valores descendentes
    return Object.entries(agrupados).sort((a: any, b: any) => b[1] - a[1]);
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
      <h1 className="text-2xl font-bold mb-4">Gestión de Eventos</h1>

      {/* Botones para cambiar el estado */}
      <div className="mb-4 flex space-x-4">
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
      </div>

      {/* Filtros por fecha */}
      <div className="mb-4">
        <label>
          Fecha Inicio:
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="ml-2 border p-1"
          />
        </label>
        <label className="ml-4">
          Fecha Fin:
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="ml-2 border p-1"
          />
        </label>
      </div>

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
