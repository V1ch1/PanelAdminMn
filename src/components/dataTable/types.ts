export interface DataRow {
  fuente: string;
  icodcli: string;
  correo: string;
  asunto: string;
  horaFecha: Date;
  estado: string;
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
  horaFecha: string;
  estado: string;
}
