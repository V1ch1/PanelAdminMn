import React, { useEffect, useState } from "react";
import { getEvents, Event } from "../../services/apiService";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import PlantillasTab from "./Plantillas";

const Informes: React.FC = () => {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [selectedTab, setSelectedTab] = useState(0); // 0: "Por hora", 1: "Por colectivo", 2: "Por fuente", 3: "Plantillas"

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const pendientes = await getEvents("pendiente");
        const gestionados = await getEvents("gestionado");
        setEventos([...pendientes, ...gestionados]);
      } catch (err: unknown) {
        console.error("Error al cargar los eventos:", err);
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

  interface Agrupado {
    colectivo: Record<string, number>;
    fuente: Record<string, number>;
  }

  const agruparPorDiaYColectivo = (eventos: Event[]) => {
    const grupos = eventos.reduce(
      (acumulador: Record<string, Agrupado>, evento: Event) => {
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
      },
      {} as Record<string, Agrupado>
    );

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

  interface DatosAgrupados {
    colectivo: Record<string, number>;
    fuente: Record<string, number>;
  }
  const filasColectivos = Object.entries(datosAgrupados).map(
    ([fecha, datos]: [string, DatosAgrupados]) => {
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
    ([fecha, datos]: [string, DatosAgrupados]) => {
      const valores = columnasFuentes
        .slice(1, -1)
        .map((columna) => datos.fuente[columna.name] || 0); // Accedemos a "fuente" aquí
      const total = valores.reduce(
        (acc, val) => acc + (typeof val === "number" ? val : 0),
        0
      );
      return [fecha, ...valores, total];
    }
  );

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

      {/* Tabs */}
      <div className="mb-4">
        <ul className="flex border-b">
          {/* Tab 2: Por colectivo */}
          <li className="mr-1">
            <button
              className={`px-4 py-2 font-semibold ${
                selectedTab === 1
                  ? "border-b-2 border-[#1371CF] text-[#1371CF]"
                  : "text-gray-500 hover:text-[#1371CF]"
              }`}
              onClick={() => setSelectedTab(1)}
            >
              Colectivos
            </button>
          </li>
          {/* Tab 1: Por hora */}
          <li className="mr-1">
            <button
              className={`px-4 py-2 font-semibold ${
                selectedTab === 0
                  ? "border-b-2 border-[#1371CF] text-[#1371CF]"
                  : "text-gray-500 hover:text-[#1371CF]"
              }`}
              onClick={() => setSelectedTab(0)}
            >
              Horas
            </button>
          </li>

          {/* Tab 4: Plantillas */}
          <li className="mr-1">
            <button
              className={`px-4 py-2 font-semibold ${
                selectedTab === 3
                  ? "border-b-2 border-[#1371CF] text-[#1371CF]"
                  : "text-gray-500 hover:text-[#1371CF]"
              }`}
              onClick={() => setSelectedTab(3)}
            >
              Plantillas
            </button>
          </li>
          {/* Tab 3: Por fuente */}
          <li className="mr-1">
            <button
              className={`px-4 py-2 font-semibold ${
                selectedTab === 2
                  ? "border-b-2 border-[#1371CF] text-[#1371CF]"
                  : "text-gray-500 hover:text-[#1371CF]"
              }`}
              onClick={() => setSelectedTab(2)}
            >
              Fuentes
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <div className="p-4">
          <Grid
            data={filasPorHoraConTotal}
            columns={["Hora", "Leads", "Colectivos"]}
            sort={true}
            resizable={true}
            pagination={{
              limit: 50,
            }}
            language={{
              search: { placeholder: "Buscar..." },
              pagination: {
                previous: "Anterior",
                next: "Siguiente",
                showing: "Mostrando",
                results: () => "resultados",
                to: "de",
                of: "de",
              },
              noRecordsFound: "No se encontraron plantillas",
            }}
            className={{
              table: "table-auto min-w-full text-sm",
              tr: "hover:bg-gray-50",
            }}
          />
        </div>
      )}

      {selectedTab === 1 && (
        <div className="p-4">
          <Grid
            data={filasColectivos}
            columns={columnasColectivos.map((columna) => columna.name)}
            sort={true}
            resizable={true}
            pagination={{
              limit: 50,
            }}
            language={{
              search: { placeholder: "Buscar..." },
              pagination: {
                previous: "Anterior",
                next: "Siguiente",
                showing: "Mostrando",
                results: () => "resultados",
                to: "de",
                of: "de",
              },
              noRecordsFound: "No se encontraron plantillas",
            }}
            className={{
              table: "table-auto min-w-full text-sm",
              tr: "hover:bg-gray-50",
            }}
          />
        </div>
      )}

      {selectedTab === 2 && (
        <div className="p-4">
          <Grid
            data={filasFuentes}
            columns={columnasFuentes.map((columna) => columna.name)}
          />
        </div>
      )}

      {selectedTab === 3 && <PlantillasTab />}
    </div>
  );
};

export default Informes;
