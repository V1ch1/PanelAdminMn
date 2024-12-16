import React, { useMemo } from "react";
import ClickStatsCard from "./ClickStatsCard";
import { DataRow } from "../dataTable/types";

// Definir las props del componente ClickStats
interface ClickStatsProps {
  data: DataRow[];
}

const ClickStats: React.FC<ClickStatsProps> = ({ data }) => {
  // Filtrar y procesar los datos para obtener los clics por colectivo y tipo de fuente
  const clickData = useMemo(() => {
    const dataMap: { [key: string]: { [key: string]: number; total: number } } =
      {};

    // Procesamos cada item de los datos
    data.forEach((item) => {
      const colectivo = item.colectivo;
      const fuente = item.fuente; // Asegúrate de que `fuente` esté en los datos

      if (!dataMap[colectivo]) {
        // Inicializamos el mapa para cada colectivo con clics por tipo de fuente y total
        dataMap[colectivo] = {
          "mail.video": 0,
          "mail.plus.video": 0,
          "mail.precios": 0,
          "mail.plus.precios": 0,
          total: 0,
        };
      }

      // Asegurarse de que la fuente esté definida en las claves esperadas
      if (fuente && dataMap[colectivo][fuente] !== undefined) {
        // Aumentamos el conteo de clics por tipo de fuente
        dataMap[colectivo][fuente] += 1;
        // Aumentamos el total de clics
        dataMap[colectivo].total += 1;
      }
    });

    return dataMap;
  }, [data]); // Dependemos de los datos pasados como props

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Object.entries(clickData).map(([colectivo, clics]) => (
        <ClickStatsCard key={colectivo} colectivo={colectivo} clics={clics} />
      ))}
    </div>
  );
};

export default ClickStats;
