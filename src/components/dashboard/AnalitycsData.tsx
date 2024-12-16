import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConversionFunnel from "./ConversionFunnel";
import LineChartComponent from "./LineChartComponent";
import ClickStats from "./ClickStats";
import { generateData } from "../dataTable/generateData";

// Generamos los datos utilizando la función
const allStatsData = generateData(); // Esto genera un array de datos de estadísticas

const AnalitycsData: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null); // Fecha de inicio
  const [endDate, setEndDate] = useState<Date | null>(null); // Fecha de fin
  const [selectedColectivo, setSelectedColectivo] = useState<string>(""); // Filtro para el colectivo

  // Filtrado de los datos según el rango de fechas y el colectivo
  const filteredStatsData = useMemo(() => {
    return allStatsData.filter((item) => {
      const itemDate = new Date(item.horaFecha); // Convertimos la fecha en objeto Date

      // Filtro por fecha
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;

      // Filtro por colectivo, si es seleccionado
      if (selectedColectivo && item.colectivo !== selectedColectivo)
        return false;

      return true;
    });
  }, [startDate, endDate, selectedColectivo]); // Recalcular el filtro cuando cambien las fechas o el colectivo

  // Obtenemos los colectivos únicos de los datos para la selección
  const colectivos = useMemo(() => {
    const colectivosSet = new Set(allStatsData.map((item) => item.colectivo));
    return Array.from(colectivosSet);
  }, []);

  // Función para limpiar los filtros de fecha
  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Funciones para los filtros predefinidos
  const setTodayRange = () => {
    const today = new Date();
    setStartDate(new Date(today.setHours(0, 0, 0, 0)));
    setEndDate(new Date(today.setHours(23, 59, 59, 999)));
  };

  const setYesterdayRange = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setStartDate(new Date(yesterday.setHours(0, 0, 0, 0)));
    setEndDate(new Date(yesterday.setHours(23, 59, 59, 999)));
  };

  const setLast7DaysRange = () => {
    const today = new Date();
    setEndDate(today);
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    setStartDate(last7Days);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard de Lead Tracking</h1>

      {/* Filtro de colectivo y fechas */}
      <div className="flex items-center space-x-4 mb-8 flex-wrap">
        {/* Filtro de colectivo */}
        <div>
          <label>Seleccionar colectivo: </label>
          <select
            value={selectedColectivo}
            onChange={(e) => setSelectedColectivo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            <option value="">Todos</option>
            {colectivos.map((colectivo) => (
              <option key={colectivo} value={colectivo}>
                {colectivo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de fecha de inicio */}
        <div>
          <label>Fecha de inicio: </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            dateFormat="dd-MM-yyyy HH:mm"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            className="px-4 py-2 border border-gray-300 rounded"
            placeholderText="Selecciona una fecha"
          />
        </div>

        {/* Filtro de fecha de fin */}
        <div>
          <label>Fecha de fin: </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            dateFormat="dd-MM-yyyy HH:mm"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            className="px-4 py-2 border border-gray-300 rounded"
            placeholderText="Selecciona una fecha"
          />
        </div>
        {/* Filtros predefinidos */}
        <div className="space-x-4">
          <button
            onClick={setTodayRange}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Hoy
          </button>
          <button
            onClick={setYesterdayRange}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Ayer
          </button>
          <button
            onClick={setLast7DaysRange}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Últimos 7 días
          </button>
        </div>
        {/* Botón Limpiar fechas */}
        <div>
          <button
            onClick={clearDateFilters}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Limpiar fechas
          </button>
        </div>
      </div>

      {/* Gráfico de líneas con la evolución temporal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Evolución Temporal de Leads
        </h2>
        <LineChartComponent data={filteredStatsData} />
      </div>

      {/* Estadísticas de clics por colectivo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Estadísticas de Clics por Colectivo
        </h2>
        <ClickStats data={filteredStatsData} />
      </div>

      {/* Gráfico de la conversión */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Embudo de Conversión</h2>
        <ConversionFunnel data={filteredStatsData} />
      </div>
    </div>
  );
};

export default AnalitycsData;
