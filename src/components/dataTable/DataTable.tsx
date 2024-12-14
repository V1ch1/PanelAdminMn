import React, { useState, useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { generateData } from "./generateData";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import IcodcliDetail from "../../icodcliDetail/IcodCliDetail";

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

  const columns = useMemo(
    () => [
      { Header: "Fuente*", accessor: "fuente" },
      { Header: "ICODCLI", accessor: "icodcli" },
      { Header: "Correo", accessor: "correo" },
      { Header: "Asunto", accessor: "asunto" },
      {
        Header: "Fecha / Hora",
        accessor: "horaFecha",
        Cell: ({ value }: any) => format(value, "dd-MM-yyyy HH:mm"),
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
    state: { sortBy, pageIndex, pageSize },
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

  // Manejar el clic en una fila de la tabla
  const handleRowClick = (row: any) => {
    setSelectedRow(row); // Guarda la fila seleccionada
    setShowDetails(true); // Muestra los detalles
  };

  // Volver a la vista de la tabla
  const handleBackToTable = () => {
    setShowDetails(false); // Oculta los detalles
    setSelectedRow(null); // Limpia la fila seleccionada
  };
  if (showDetails && selectedRow) {
    return (
      <IcodcliDetail
        clientDetails={selectedRow} // Pasar los datos al componente hijo
        handleBackToTable={handleBackToTable} // Pasar la función de vuelta
      />
    );
  }

  return (
    <div className="p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex items-center space-x-4">
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
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 mx-2"
          >
            Limpiar fechas
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full"
        />
      </div>

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
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <span className="ml-2 text-sm">↓</span>
                    ) : (
                      <span className="ml-2 text-sm">↑</span>
                    )
                  ) : (
                    <span className="ml-2 text-sm">↕️</span>
                  )}
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
                className={
                  index % 2 === 0 ? "bg-white" : "bg-gray-100 cursor-pointer"
                }
                onClick={() => handleRowClick(row.original)}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-4 py-2 border border-gray-300 cursor-pointer"
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
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 mx-2"
          >
            {"<<"}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 mx-2"
          >
            {"<"}
          </button>
          <span className="px-4 py-2">
            Página {pageIndex + 1} de {Math.ceil(rows.length / pageSize)}
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 mx-2"
          >
            {">"}
          </button>
          <button
            onClick={() => gotoPage(Math.ceil(rows.length / pageSize) - 1)}
            disabled={!canNextPage}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 mx-2"
          >
            {">>"}
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
