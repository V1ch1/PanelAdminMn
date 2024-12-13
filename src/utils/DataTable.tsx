import React, { useState, useMemo } from "react";

const generateData = () => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    data.push({
      fuente: `Fuente ${i + 1}`,
      icodcli: `IC${i + 1}`,
      correo: `correo${i + 1}@example.com`,
      asunto: `Asunto ${i + 1}`,
      horaFecha: `2024-12-13 12:00`,
      estado: i % 2 === 0 ? "Activo" : "Inactivo",
    });
  }
  return data;
};

const DataTable: React.FC = () => {
  const data = useMemo(() => generateData(), []);
  const columns = useMemo(
    () => [
      { Header: "FUENTE*", accessor: "fuente" },
      { Header: "ICODCLI", accessor: "icodcli" },
      { Header: "CORREO", accessor: "correo" },
      { Header: "ASUNTO", accessor: "asunto" },
      { Header: "HORA/FECHA", accessor: "horaFecha" },
      { Header: "ESTADO", accessor: "estado" },
    ],
    []
  );

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 25;
  const pageRows = data.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const [localData, setLocalData] = useState(data); // Estado para los datos editados

  const sortedData = useMemo(() => {
    let sortableItems = [...localData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [localData, sortConfig]);

  const handleSort = (column: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === column && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: column, direction });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeStatus = (index: number, newStatus: string) => {
    const updatedData = [...localData];
    updatedData[index].estado = newStatus;
    setLocalData(updatedData);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort(column.accessor)}
              >
                {column.Header}
                {sortConfig?.key === column.accessor
                  ? sortConfig.direction === "ascending"
                    ? " 🔼"
                    : " 🔽"
                  : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData
            .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
            .map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {columns.map((column) => (
                  <td key={column.accessor} className="px-4 py-2">
                    {column.accessor === "estado" ? (
                      // Selector de estado
                      <select
                        value={row.estado}
                        onChange={(e) =>
                          handleChangeStatus(rowIndex, e.target.value)
                        }
                        className="bg-gray-100 p-2 rounded"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    ) : (
                      row[column.accessor]
                    )}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <div>
          Página {currentPage + 1} de{" "}
          {Math.ceil(localData.length / rowsPerPage)}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={(currentPage + 1) * rowsPerPage >= localData.length}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default DataTable;
