import { DataRow } from "./types";

// Función para generar una fecha aleatoria en 2024
const generateRandomDate = (): Date => {
  const start = new Date("2024-01-01");
  const end = new Date("2024-12-31");
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return randomDate;
};

export const generateData = (): DataRow[] => {
  const sources = [
    "mail.video",
    "mail.plus.video",
    "mail.precios",
    "mail.plus.precios",
  ];
  const data: DataRow[] = [];
  for (let i = 0; i < 50; i++) {
    data.push({
      fuente: sources[i % sources.length], // Asignamos las fuentes de forma cíclica
      icodcli: `IC${i + 1}`,
      correo: `correo${i + 1}@example.com`,
      asunto: `Asunto ${i + 1}`,
      horaFecha: generateRandomDate(),
      estado: i % 2 === 0 ? "Pendiente" : "Resuelto",
    });
  }
  return data;
};
