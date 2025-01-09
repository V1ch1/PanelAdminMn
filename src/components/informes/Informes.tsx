// @ts-nocheck

import React, { useEffect, useState } from "react";
import { getEvents, Event } from "../../services/apiService";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { SkeletonLoader } from "../SkeletonLoader/SkeletonLoader";

const Informes: React.FC = () => {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pendiente" | "gestionado" | "totales">(
    "pendiente"
  );

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

  const corregirNombreColectivo = (nombre: string): string => {
    const mapeoCorrecciones: Record<string, string> = {
      asesorias: "Asesorías",
      abogados: "Abogados",
      "entidades-sociales": "EESS",
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

  const agruparPorDiaYColectivo = (eventos: Event[]) => {
    const grupos = eventos.reduce((acumulador: any, evento: Event) => {
      const fechaObj = new Date(evento.created_at);

      const diaReducido = fechaObj
        .toLocaleDateString("es-ES", { weekday: "short" })
        .replace(/^\w/, (c) => c.toUpperCase());

      const fecha = `${diaReducido}, ${fechaObj.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`;

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

  const datosAgrupados = agruparPorDiaYColectivo(eventos);

  const columnasColectivos = [
    { name: "Fecha", id: "fecha", width: "100px" },
    ...Array.from(
      new Set(
        eventos.map((evento) =>
          corregirNombreColectivo(evento.colectivo || "Desconocido")
        )
      )
    ).map((colectivo) => ({
      name: colectivo,
      id: colectivo,
      width: "80px",
    })),
    { name: "TOTAL", id: "total", width: "100px" },
  ];

  const filasColectivos = Object.entries(datosAgrupados).map(
    ([fecha, datos]: any) => {
      const valores = columnasColectivos
        .slice(1, -1)
        .map((columna) => datos.colectivo[columna.name] || 0);
      const total = valores.reduce((acc, val) => acc + val, 0);
      return [fecha, ...valores, total];
    }
  );

  const columnasFuentes = [
    { name: "Fecha", id: "fecha", width: "110px" },
    ...Array.from(
      new Set(eventos.map((evento) => evento.fuente || "Desconocido"))
    ).map((fuente) => ({
      name: fuente,
      id: fuente,
      width: "200px",
    })),
    { name: "TOTAL", id: "total", width: "100px" },
  ];

  const filasFuentes = Object.entries(datosAgrupados).map(
    ([fecha, datos]: any) => {
      const valores = columnasFuentes
        .slice(1, -1)
        .map((columna) => datos.fuente[columna.name] || 0);
      const total = valores.reduce((acc, val) => acc + val, 0);
      return [fecha, ...valores, total];
    }
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Informe de Leads</h1>

      {/* Botones de selección de estado */}
      <div className="mb-4 flex items-center space-x-2">
        <button
          onClick={() => setStatus("pendiente")}
          className={`py-2 px-4 font-semibold rounded ${
            status === "pendiente"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setStatus("gestionado")}
          className={`py-2 px-4 font-semibold rounded ${
            status === "gestionado"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Gestionados
        </button>
        <button
          onClick={() => setStatus("totales")}
          className={`py-2 px-4 font-semibold rounded ${
            status === "totales"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Totales
        </button>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {/* Tabla por Colectivo */}
          <h2 className="text-lg font-bold mt-6">Tabla por Colectivo</h2>
          <div className="overflow-x-auto">
            <Grid
              data={filasColectivos}
              columns={columnasColectivos}
              search={false}
              pagination={{
                enabled: true,
                limit: 10,
              }}
              resizable={true}
              language={{
                search: {
                  placeholder: "Buscar...",
                },
                pagination: {
                  previous: "Anterior",
                  next: "Siguiente",
                  showing: "Mostrando",
                  results: () => "resultados",
                  to: "de",
                  of: "de",
                },
                noRecordsFound: "No se encontraron leads en este momento",
              }}
              className={{
                table: "table-auto min-w-full text-sm",
                header: "bg-gray-100 text-gray-700 font-bold whitespace-nowrap",
                row: "hover:bg-gray-50",
              }}
            />
          </div>

          {/* Tabla por Fuente */}
          <h2 className="text-lg font-bold mt-6">Tabla por Fuente</h2>
          <div className="overflow-x-auto">
            <Grid
              data={filasFuentes}
              columns={columnasFuentes}
              search={false}
              pagination={{
                enabled: true,
                limit: 10,
              }}
              resizable={true}
              language={{
                search: {
                  placeholder: "Buscar...",
                },
                pagination: {
                  previous: "Anterior",
                  next: "Siguiente",
                  showing: "Mostrando",
                  results: () => "resultados",
                  to: "de",
                  of: "de",
                },
                noRecordsFound: "No se encontraron leads en este momento",
              }}
              className={{
                table: "table-auto min-w-full text-sm",
                header: "bg-gray-100 text-gray-700 font-bold whitespace-nowrap",
                row: "hover:bg-gray-50",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Informes;
