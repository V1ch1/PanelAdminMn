import React, { useEffect, useState } from "react";
import { getPlantillas, Plantilla } from "../../services/apiService";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";

const Plantillas: React.FC = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError("Error al cargar las plantillas.");
        console.error("Error al cargar las plantillas:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarPlantillas();
  }, []);

  if (loading) return <p>Cargando plantillas...</p>;
  if (error) return <p>{error}</p>;

  // Mapeo de los datos para la tabla
  const datos = plantillas.map((plantilla) => [
    new Date(plantilla.start_date).toLocaleDateString("es-ES"), // Solo fecha (sin hora)
    plantilla.template_name, // Nombre de la plantilla
    plantilla.click_count, // Número de clicks
  ]);

  return (
    <div>
      <Grid
        data={datos}
        columns={[
          { name: "Fecha Envío", id: "start_date", width: "150px" },
          { name: "Nombre Plantilla", id: "nombre_plantilla", width: "350px" },
          { name: "Número de Clicks", id: "num_clicks", width: "120px" },
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
    </div>
  );
};

export default Plantillas;
