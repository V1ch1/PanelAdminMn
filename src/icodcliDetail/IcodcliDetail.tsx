import React from "react";
import { format } from "date-fns";
import { ClientDetails } from "../components/dataTable/types";

interface IcodcliDetailProps {
  clientDetails: ClientDetails; // Definir el tipo de los datos que recibirá el componente
  handleBackToTable: () => void; // Función para volver a la tabla (si la necesitas)
}

const IcodcliDetail: React.FC<IcodcliDetailProps> = ({
  clientDetails,
  handleBackToTable,
}) => {
  return (
    <div className="p-6">
      <button onClick={handleBackToTable} className="text-blue-500 mb-4">
        Volver a la tabla
      </button>
      <div>
        <h2 className="text-2xl">Detalles de la Fila</h2>
        <p>
          <strong>Fuente:</strong> {clientDetails.fuente}
        </p>
        <p>
          <strong>ICODCLI:</strong> {clientDetails.icodcli}
        </p>
        <p>
          <strong>Correo:</strong> {clientDetails.correo}
        </p>
        <p>
          <strong>Asunto:</strong> {clientDetails.asunto}
        </p>
        <p>
          <strong>Fecha/Hora:</strong>{" "}
          {format(new Date(clientDetails.horaFecha), "dd-MM-yyyy HH:mm")}
        </p>
        <p>
          <strong>Estado:</strong> {clientDetails.estado}
        </p>
      </div>
    </div>
  );
};

export default IcodcliDetail;
