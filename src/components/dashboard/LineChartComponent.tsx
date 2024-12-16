import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

// Definimos el tipo de las props esperadas
interface LineChartComponentProps {
  data: { horaFecha: Date; clics: string[] }[]; // Datos esperados
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data }) => {
  // Preparamos los datos para el gráfico
  const chartData = data.map((row) => ({
    date: new Date(row.horaFecha),
    clicks: row.clics.length, // Contamos los clics
  }));

  // Opcional: Ordenamos los datos por fecha
  const sortedChartData = chartData.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sortedChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(tick, "dd-MM-yyyy")}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(label) => format(new Date(label), "dd-MM-yyyy")}
          formatter={(value) => `${value} clics`}
        />
        <Legend />
        <Line type="monotone" dataKey="clicks" stroke="#EF4444" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
