// @ts-nocheck

import React, { useEffect, useState } from "react";
import { getEvents } from "../../services/apiService";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/outline";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";

const Informes: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pendiente" | "gestionado" | "totales">(
    "pendiente"
  );
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);
  const [eventosSinFiltrar, setEventosSinFiltrar] = useState<any[]>([]);

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
        setEventosSinFiltrar(eventosObtenidos); // Mantén los datos sin filtrar
      } catch (err: unknown) {
        setError("Error al cargar los eventos.");
        console.error("Error al cargar los eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, [status]);

  const filtrarEventosPorRango = () => {
    if (!fechaInicio || !fechaFin) {
      return eventos;
    }

    const inicio = new Date(fechaInicio).setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin).setHours(23, 59, 59, 999);

    return eventos.filter((evento) => {
      const fechaEvento = new Date(evento.created_at).getTime();
      return fechaEvento >= inicio && fechaEvento <= fin;
    });
  };

  const corregirNombreColectivo = (nombre: string): string => {
    const mapeoCorrecciones: Record<string, string> = {
      asesorias: "Asesorías",
      abogados: "Abogados",
      "entidades-sociales": "Entidades sociales",
      clinicas: "Clínicas",
      formacion: "Formación",
      odontologos: "Odontólogos",
    };

    if (mapeoCorrecciones[nombre.toLowerCase()]) {
      return mapeoCorrecciones[nombre.toLowerCase()];
    }

    return nombre
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const agruparPorDiaYColectivo = (eventos: any[]) => {
    const grupos = eventos.reduce((acumulador: any, evento: any) => {
      const fecha = new Date(evento.created_at).toISOString().split("T")[0];
      const colectivo = corregirNombreColectivo(
        evento.colectivo || "Desconocido"
      );
      const fuente = evento.fuente || "Desconocido";

      if (!acumulador[fecha]) {
        acumulador[fecha] = { colectivo: {}, fuente: {} };
      }

      if (!acumulador[fecha].colectivo[colectivo]) {
        acumulador[fecha].colectivo[colectivo] = 0;
      }
      if (!acumulador[fecha].fuente[fuente]) {
        acumulador[fecha].fuente[fuente] = 0;
      }

      acumulador[fecha].colectivo[colectivo]++;
      acumulador[fecha].fuente[fuente]++;
      return acumulador;
    }, {});

    return grupos;
  };

  const eventosFiltrados = filtrarEventosPorRango(); // Datos filtrados para los totales
  const datosAgrupados = agruparPorDiaYColectivo(eventosFiltrados);

  // Añade "TOTAL" al final de las columnas
  const columnasColectivos = [
    "Fecha",
    ...Array.from(
      new Set(
        eventosSinFiltrar.map((evento) =>
          corregirNombreColectivo(evento.colectivo || "Desconocido")
        )
      )
    ),
    "TOTAL",
  ];

  const filasColectivos = Object.entries(
    agruparPorDiaYColectivo(eventosSinFiltrar)
  ).map(([fecha, datos]: any) => {
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Formato día-mes-año
    const valores = columnasColectivos
      .slice(1, -1)
      .map((colectivo) => datos.colectivo[colectivo] || 0);
    const total = valores.reduce((acc, val) => acc + val, 0);
    return [fechaFormateada, ...valores, total];
  });

  // Tabla de Fuente
  const columnasFuentes = [
    "Fecha",
    ...Array.from(
      new Set(eventosSinFiltrar.map((evento) => evento.fuente || "Desconocido"))
    ),
    "TOTAL",
  ];

  const filasFuentes = Object.entries(
    agruparPorDiaYColectivo(eventosSinFiltrar)
  ).map(([fecha, datos]: any) => {
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Formato día-mes-año
    const valores = columnasFuentes
      .slice(1, -1)
      .map((fuente) => datos.fuente[fuente] || 0);
    const total = valores.reduce((acc, val) => acc + val, 0);
    return [fechaFormateada, ...valores, total];
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Eventos</h1>

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

          {/* <button
            onClick={() => setMostrarFiltros((prev) => !prev)}
            className="ml-2 p-2 bg-gray-300 rounded hover:bg-gray-400 flex items-center"
            title="Mostrar/ocultar filtros"
          >
            <AdjustmentsVerticalIcon className="h-5 w-5 text-gray-700" />
          </button> */}
        </div>
      </div>

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
          {/* <button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
            }}
            className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded hover:bg-gray-300 self-end"
          >
            Borrar
          </button> */}
        </div>
      )}

      {/* Mostrar estado de carga, errores o resultados */}
      {loading && <p>Cargando eventos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div>
          {/* <p className="text-lg mb-4">
            {status === "totales"
              ? `Total de eventos: ${eventosFiltrados.length}`
              : `Total de eventos ${status}: ${eventosFiltrados.length}`}
          </p>
          Contenedor para Totales por Colectivo y Fuente
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Total por Colectivo:</h2>
              <ul className="list-disc pl-6">
                {Object.entries(
                  eventosFiltrados.reduce(
                    (acumulador: Record<string, number>, evento: any) => {
                      const colectivo = corregirNombreColectivo(
                        evento.colectivo || "Desconocido"
                      );
                      acumulador[colectivo] = (acumulador[colectivo] || 0) + 1;
                      return acumulador;
                    },
                    {}
                  )
                ).map(([colectivo, total]) => (
                  <li key={colectivo}>
                    {colectivo}: {total}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Total por Fuente:</h2>
              <ul className="list-disc pl-6">
                {Object.entries(
                  eventosFiltrados.reduce(
                    (acumulador: Record<string, number>, evento: any) => {
                      const fuente = evento.fuente || "Desconocido";
                      acumulador[fuente] = (acumulador[fuente] || 0) + 1;
                      return acumulador;
                    },
                    {}
                  )
                ).map(([fuente, total]) => (
                  <li key={fuente}>
                    {fuente}: {total}
                  </li>
                ))}
              </ul>
            </div>
          </div> */}
          {/* Tablas dinámicas */}
          <h2 className="text-lg font-bold mt-6">Tabla por Colectivo</h2>
          <Grid
            data={[columnasColectivos, ...filasColectivos]}
            search={false}
            pagination={{
              enabled: true,
              limit: 10,
            }}
            resizable={true}
          />
          <h2 className="text-lg font-bold mt-6">Tabla por Fuente</h2>
          <Grid
            data={[columnasFuentes, ...filasFuentes]}
            search={false}
            pagination={{
              enabled: true,
              limit: 10,
            }}
            resizable={true}
          />
        </div>
      )}
    </div>
  );
};

export default Informes;
