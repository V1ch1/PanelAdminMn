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

  useEffect(() => {
    const cargarEventos = async () => {
      setLoading(true);
      setError(null);
      try {
        const pendientes = await getEvents("pendiente");
        const gestionados = await getEvents("gestionado");
        setEventos([...pendientes, ...gestionados]);
      } catch (err: unknown) {
        setError("Error al cargar los eventos.");
        console.error("Error al cargar los eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

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

  const agruparPorHoraConColectivos = (eventos: Event[]) => {
    const hoy = new Date();
    const inicioDelDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );
    const finDelDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 1
    );

    const eventosHoy = eventos.filter((evento) => {
      const fechaEvento = new Date(evento.created_at);
      return fechaEvento >= inicioDelDia && fechaEvento < finDelDia;
    });

    const grupos = Array.from({ length: 24 }, (_, hora) => ({
      hora: `${hora}:00`,
      count: 0,
      colectivos: {} as Record<string, number>,
    }));

    eventosHoy.forEach((evento) => {
      const fechaEvento = new Date(evento.created_at);
      const hora = fechaEvento.getHours();
      const colectivo = corregirNombreColectivo(
        evento.colectivo || "Desconocido"
      );

      grupos[hora].count++;
      grupos[hora].colectivos[colectivo] =
        (grupos[hora].colectivos[colectivo] || 0) + 1;
    });

    return grupos.filter((grupo) => grupo.count > 0); // Filtrar las horas sin leads
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

  const datosPorHora = agruparPorHoraConColectivos(eventos);
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
      const total = valores.reduce(
        (acc, val) => acc + (typeof val === "number" ? val : 0),
        0
      );
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
      const total = valores.reduce(
        (acc, val) => acc + (typeof val === "number" ? val : 0),
        0
      );
      return [fecha, ...valores, total];
    }
  );

  // Sumar total de todas las horas
  const totalPorHora = datosPorHora.reduce(
    (total, grupo) => {
      total.count += grupo.count;
      Object.entries(grupo.colectivos).forEach(([colectivo, count]) => {
        total.colectivos[colectivo] =
          (total.colectivos[colectivo] || 0) + count;
      });
      return total;
    },
    { hora: "Total", count: 0, colectivos: {} }
  );

  const filasPorHoraConTotal = [
    ...datosPorHora.map((grupo) => [
      grupo.hora,
      grupo.count,
      Object.entries(grupo.colectivos)
        .map(([colectivo, count]) => `${colectivo}: ${count}`)
        .join(", "),
    ]),
    [
      totalPorHora.hora,
      totalPorHora.count,
      Object.entries(totalPorHora.colectivos)
        .map(([colectivo, count]) => `${colectivo}: ${count}`)
        .join(", "),
    ], // Fila total
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Informe de Leads</h1>

      {/* Tabla de Evolución de Leads por horas (Hoy) */}
      <h2 className="text-lg font-bold mt-6">
        Evolución de Leads por horas (Hoy)
      </h2>
      <div className="overflow-x-auto mb-6">
        <Grid
          data={filasPorHoraConTotal}
          columns={[
            { name: "Hora", id: "hora" },
            { name: "Cantidad", id: "count" },
            { name: "Colectivos", id: "colectivos" },
          ]}
          search={false}
          pagination={false}
          language={{
            search: {
              placeholder: "Buscar...",
            },
            noRecordsFound: "No se encontraron leads en este momento",
          }}
          className={{
            table: "table-auto min-w-full text-sm",
            header: "bg-blue-600 text-white font-bold text-2xl text-center p-4",
            row: "hover:bg-gray-50",
          }}
        />
      </div>

      {/* Tabla de Evolución de Leads por colectivo */}
      <h2 className="text-lg font-bold mt-6">
        Evolución de Leads por colectivo
      </h2>
      <div className="overflow-x-auto mb-6">
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

      {/* Tabla de Evolución de Leads por fuente */}
      <h2 className="text-lg font-bold mt-6">Evolución de Leads por fuente</h2>
      <div className="overflow-x-auto mb-6">
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
  );
};

export default Informes;
