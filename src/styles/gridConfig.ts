// styles/gridConfig.ts
const gridConfig = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  },
  pagination: true,
  paginationPageSize: 10,
  animateRows: true,
  suppressRowClickSelection: true, // Evita la selección al hacer clic
  enableCellTextSelection: true,
  suppressCellSelection: true, // Evita la selección de celdas
};

export default gridConfig;
