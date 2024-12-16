import React, { useState, useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { generateData } from "./generateData";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import IcodcliDetail from "../../icodcliDetail/IcodcliDetail";

console.log(generateData);

const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const DataTable: React.FC = () => {
  const [data, setData] = useState(generateData());
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null); // Estado para la fila seleccionada
  const [showDetails, setShowDetails] = useState(false); // Estado para mostrar/ocultar detalles de la fila

  // Añadir la columna para el campo 'colectivo'
  const columns = useMemo(
    () => [
      { Header: "Colectivo", accessor: "colectivo" }, // Nueva columna para 'colectivo'
      { Header: "Fuente*", accessor: "fuente" },
      { Header: "ICODCLI", accessor: "icodcli" },
      { Header: "Correo", accessor: "correo" },
      { Header: "Asunto", accessor: "asunto" },
      {
        Header: "Fecha / Hora",
        accessor: "horaFecha",
        // Cambia la celda para que no se formatee, solo se muestra el objeto Date
        Cell: ({ value }: any) => format(new Date(value), "dd-MM-yyyy HH:mm"),
        // Definir un sortType para manejar fechas correctamente
        sortType: (rowA: any, rowB: any) => {
          return (
            new Date(rowA.original.horaFecha).getTime() -
            new Date(rowB.original.horaFecha).getTime()
          );
        },
      },
      {
        Header: "Clics",
        accessor: "clics",
        Cell: ({ value }: any) => (value ? value.length : 0),
      },
      {
        Header: "ESTADO",
        accessor: "estado",
        Cell: ({ value, row }: any) => (
          <select
            className="px-2 py-1 border border-gray-300 rounded"
            value={value}
            onChange={(e) => {
              const updatedData = [...data];
              updatedData[row.index].estado = e.target.value;
              setData(updatedData);
            }}
            onClick={(e) => e.stopPropagation()} // Evita que el clic se propague
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        ),
      },
    ],
    [data]
  );

  const filteredData = useMemo(
    () =>
      data.filter((row) =>
        Object.values(row).some((value) =>
          normalizeText(String(value)).includes(normalizeText(searchTerm))
        )
      ),
    [data, searchTerm]
  );

  const filteredByDate = useMemo(
    () =>
      filteredData.filter((row) => {
        const rowDate = new Date(row.horaFecha);
        if (startDate && rowDate < startDate) return false;
        if (endDate && rowDate > endDate) return false;
        return true;
      }),
    [filteredData, startDate, endDate]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    page,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: filteredByDate,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setShowDetails(true);
  };

  const handleBackToTable = () => {
    setShowDetails(false);
    setSelectedRow(null);
  };

  if (showDetails && selectedRow) {
    return (
      <IcodcliDetail
        clientDetails={selectedRow}
        handleBackToTable={handleBackToTable}
      />
    );
  }

  return (
    <div className="p-6 rounded-lg shadow-lg">
      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label>Fecha de inicio: </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="px-4 py-2 border border-gray-300 rounded"
            placeholderText="Selecciona una fecha"
          />
        </div>
        <div>
          <label>Fecha de fin: </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="px-4 py-2 border border-gray-300 rounded"
            placeholderText="Selecciona una fecha"
          />
        </div>
        <button
          onClick={clearDateFilters}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Limpiar fechas
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded w-full mb-4"
      />

      <table
        {...getTableProps()}
        className="min-w-full border-collapse border border-gray-200"
      >
        <thead className="bg-gray-800 text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-4 py-2 border border-gray-300 cursor-pointer"
                >
                  {column.render("Header")}
                  {column.isSorted
                    ? column.isSortedDesc
                      ? " ↓"
                      : " ↑"
                    : " ↕️"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, index) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                } hover:bg-gray-200`}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className={`px-4 py-2 border border-gray-300 ${
                      cell.column.id !== "estado" ? "cursor-pointer" : ""
                    }`}
                    onClick={
                      cell.column.id !== "estado"
                        ? () => handleRowClick(row.original)
                        : undefined
                    }
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            {"<"}
          </button>
          <span className="px-4 py-2">
            Página {pageIndex + 1} de {rows.length / pageSize}
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            {">"}
          </button>
        </div>

        <div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Mostrar {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
