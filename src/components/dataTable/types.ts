export interface DataRow {
  fuente: string;
  icodcli: string;
  correo: string;
  asunto: string;
  horaFecha: Date;
  estado: string;
  clics: string[];
  colectivo: string;
}

export interface Column {
  Header: string;
  accessor: keyof DataRow;
}

export interface SortConfig {
  key: keyof DataRow;
  direction: "ascending" | "descending";
}

export interface ClientDetails {
  fuente: string;
  icodcli: string;
  correo: string;
  asunto: string;
  horaFecha: Date;
  estado: string;
  clics: string[];
  colectivo: string;
}

export interface RowData {
  id: number;
  name: string;
  age: number;
}
