import React, { useMemo } from "react";
import { FunnelChart, Funnel, Tooltip, Legend } from "recharts";
import { DataRow } from "../dataTable/types";

interface ConversionFunnelProps {
  data: DataRow[]; // Recibe un array de datos de tipo `DataRow`
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  // Filtrar y procesar los datos para obtener el embudo de conversión
  const funnelData = useMemo(() => {
    // Aquí adaptamos los datos a las etapas del embudo
    const stages = [
      "Visto el vídeo",
      "Formulario completado",
      "Interesado en precios",
      "Lead cualificado",
    ];

    const dataMap = stages.map((stage) => {
      // Conteo de cuántos elementos de 'data' cumplen con cada etapa
      const count = data.filter((item) => item.asunto === stage).length;
      return {
        name: stage,
        value: count,
      };
    });

    return dataMap;
  }, [data]);

  return (
    <FunnelChart width={500} height={300}>
      <Funnel data={funnelData} dataKey="value" nameKey="name" />
      <Tooltip />
      <Legend />
    </FunnelChart>
  );
};

export default ConversionFunnel;
