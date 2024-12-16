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

// Lista de colectivos
const colectivos = [
  "Abogados",
  "Arquitectos",
  "Asesorías",
  "Clínicas",
  "Consulting",
  "Formación",
  "Ingenieros",
  "Limpieza",
  "Odontólogos",
  "Procuradores",
  "Servicios",
];

// Función principal para generar los datos
export const generateData = (): DataRow[] => {
  const sources = [
    "mail.video",
    "mail.plus.video",
    "mail.precios",
    "mail.plus.precios",
  ];

  // Inicializamos un objeto para contar los leads por colectivo
  const colectivoCounts: { [key: string]: number } = colectivos.reduce(
    (acc, colectivo) => {
      acc[colectivo] = 0; // Cada colectivo tiene inicialmente 0 leads
      return acc;
    },
    {} as { [key: string]: number }
  );

  const data: DataRow[] = [];

  // Aseguramos que cada colectivo tenga al menos 10 leads
  for (let i = 0; i < 10; i++) {
    colectivos.forEach((colectivo) => {
      const numClicks = generateRandomClicks(); // Número aleatorio de clics
      const firstSource = sources[i % sources.length]; // Fuente inicial
      const clicks = generateClickSources(firstSource, numClicks); // Generamos las fuentes de clics

      // Generamos un nuevo lead para el colectivo
      data.push({
        fuente: firstSource,
        icodcli: `IC${i + 1}`,
        correo: `correo${i + 1}@example.com`,
        asunto: `Asunto ${i + 1}`,
        horaFecha: generateRandomDate(),
        estado: i % 2 === 0 ? "Pendiente" : "Resuelto",
        clics: clicks, // Añadimos los clics a la fila de datos
        colectivo, // Asignamos el colectivo
      });

      colectivoCounts[colectivo]++; // Aumentamos el contador de leads para este colectivo
    });
  }

  // Aseguramos que los 50 leads adicionales se asignen aleatoriamente entre los colectivos
  for (let i = 0; i < 50 - colectivos.length * 10; i++) {
    const randomColectivo =
      colectivos[Math.floor(Math.random() * colectivos.length)];
    const numClicks = generateRandomClicks();
    const firstSource = sources[i % sources.length];
    const clicks = generateClickSources(firstSource, numClicks);

    // Generamos un nuevo lead para un colectivo aleatorio
    data.push({
      fuente: firstSource,
      icodcli: `IC${i + colectivos.length * 10 + 1}`,
      correo: `correo${i + colectivos.length * 10 + 1}@example.com`,
      asunto: `Asunto ${i + colectivos.length * 10 + 1}`,
      horaFecha: generateRandomDate(),
      estado: i % 2 === 0 ? "Pendiente" : "Resuelto",
      clics: clicks,
      colectivo: randomColectivo, // Asignamos un colectivo aleatorio
    });

    colectivoCounts[randomColectivo]++; // Aumentamos el contador para el colectivo seleccionado
  }

  return data;
};
