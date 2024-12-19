import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      css: {
        // Incluye rutas globales si es necesario
        includePaths: ["./node_modules"],
      },
    },
  },
  optimizeDeps: {
    include: ["ag-grid-community", "ag-grid-react"], // Asegúrate de que estas dependencias se procesen correctamente
  },
});
