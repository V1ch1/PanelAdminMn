import React, { useEffect, useState } from "react";
import { getPlantillas, Plantilla } from "../../services/apiService";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";

const Plantillas: React.FC = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [plantillasFiltradas, setPlantillasFiltradas] = useState<Plantilla[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  useEffect(() => {
    const cargarPlantillas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPlantillas();
        console.log(response);

        // Ordenar las plantillas por 'start_date' en orden descendente (más reciente primero)
        const plantillasOrdenadas = response.sort((a, b) => {
          return (
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
          );
        });

        setPlantillas(plantillasOrdenadas);
        setPlantillasFiltradas(plantillasOrdenadas);
      } catch (err) {
        setError("Error al cargar las plantillas.");
        console.error("Error al cargar las plantillas:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarPlantillas();
  }, []);

  const aplicarFiltros = () => {
    let plantillasFiltradas = [...plantillas];

    if (fechaInicio) {
      plantillasFiltradas = plantillasFiltradas.filter(
        (p) => new Date(p.start_date) >= new Date(fechaInicio)
      );
    }

    if (fechaFin) {
      plantillasFiltradas = plantillasFiltradas.filter(
        (p) => new Date(p.end_date) <= new Date(fechaFin)
      );
    }

    setPlantillasFiltradas(plantillasFiltradas);
  };

  // Mapeo de los datos para la tabla
  const datos = plantillasFiltradas.map((plantilla) => [
    new Date(plantilla.start_date).toLocaleDateString("es-ES"), // Solo fecha (sin hora)
    plantilla.template_name, // Nombre de la plantilla
    plantilla.click_count, // Número de clicks
  ]);

  return (
    <div>
      <div className="flex justify-end gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="fechaInicio">Fecha inicio:</label>
          <input
            type="date"
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="fechaFin">Fecha fin:</label>
          <input
            type="date"
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={aplicarFiltros}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Aplicar Filtros
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p>Cargando plantillas...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-600">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <Grid
          data={datos}
          columns={[
            { name: "Fecha Envío", id: "start_date", width: "150px" },
            {
              name: "Nombre Plantilla",
              id: "nombre_plantilla",
              width: "350px",
            },
            { name: "Número de Leads", id: "num_clicks", width: "120px" },
          ]}
          search={true}
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
      )}
    </div>
  );
};

export default Plantillas;
