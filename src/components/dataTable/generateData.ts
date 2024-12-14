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

// Función para generar un número aleatorio de clics entre 1 y 4
const generateRandomClicks = (): number => {
  return Math.floor(Math.random() * 4) + 1;
};

// Función para obtener la lista de fuentes correspondientes a los clics
const generateClickSources = (
  firstSource: string,
  numClicks: number
): string[] => {
  const sources = [
    "mail.video",
    "mail.plus.video",
    "mail.precios",
    "mail.plus.precios",
  ];

  const clicks: string[] = [];
  let currentSourceIndex = sources.indexOf(firstSource);

  for (let i = 0; i < numClicks; i++) {
    clicks.push(sources[currentSourceIndex]);
    currentSourceIndex = (currentSourceIndex + 1) % sources.length; // Ciclo a través de la lista de fuentes
  }

  return clicks;
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
    const numClicks = generateRandomClicks(); // Número aleatorio de clics
    const firstSource = sources[i % sources.length]; // Fuente inicial
    const clicks = generateClickSources(firstSource, numClicks); // Generamos las fuentes de clics

    data.push({
      fuente: firstSource,
      icodcli: `IC${i + 1}`,
      correo: `correo${i + 1}@example.com`,
      asunto: `Asunto ${i + 1}`,
      horaFecha: generateRandomDate(),
      estado: i % 2 === 0 ? "Pendiente" : "Resuelto",
      clics: clicks, // Añadimos los clics a la fila de datos
    });
  }

  return data;
};
