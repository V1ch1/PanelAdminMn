import React from "react";
import { format } from "date-fns";
import { EnvelopeIcon, UserIcon, CheckIcon, CalendarIcon, ArrowLeftIcon, CommandLineIcon, PresentationChartLineIcon, ArrowTurnDownRightIcon, } from "@heroicons/react/20/solid";
const IcodcliDetail = ({ clientDetails, handleBackToTable, }) => {
    var _a, _b;
    return (<div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Botón para regresar */}
      <button onClick={handleBackToTable} className="flex items-center text-blue-500 mb-6 space-x-2 hover:text-blue-700">
        <ArrowLeftIcon className="h-5 w-5"/>
        <span>Volver a la tabla</span>
      </button>

      {/* Titulo del detalle */}
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Detalles de {clientDetails.correo}
      </h2>

      {/* Información detallada */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <EnvelopeIcon className="h-6 w-6 text-gray-500"/>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <strong>Correo:</strong> {clientDetails.correo}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <UserIcon className="h-6 w-6 text-gray-500"/>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <strong>Fuente principal:</strong> {clientDetails.fuente}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ArrowTurnDownRightIcon className="h-6 w-6 text-gray-500"/>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <strong>ICODCLI:</strong> {clientDetails.icodcli}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <CommandLineIcon className="h-6 w-6 text-gray-500"/>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <strong>Colectivo:</strong> {clientDetails.colectivo}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-6 w-6 text-gray-500"/>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <strong>Fecha/Hora:</strong>{" "}
              {format(new Date(clientDetails.horaFecha), "dd-MM-yyyy HH:mm")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <PresentationChartLineIcon className="h-6 w-6 text-gray-500"/>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <strong>Estado:</strong> {clientDetails.estado}
            </p>
          </div>
        </div>
      </div>

      {/* Sección para más información */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Resumen de la interacción:
        </h3>
        <div className="border-l-4 border-blue-500 pl-4 space-y-4">
          {/* Línea de tiempo con iconos */}
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-blue-500"/>
            <p className="text-sm text-gray-600">
              <strong>Número de clics:</strong>{" "}
              {((_a = clientDetails.clics) === null || _a === void 0 ? void 0 : _a.length) || 0}
            </p>
          </div>

          {/* Mostrar los clics realizados */}
          {((_b = clientDetails.clics) === null || _b === void 0 ? void 0 : _b.length) > 0 && (<div className="flex flex-col space-y-2 ml-8">
              <strong className="text-sm text-gray-600">
                Clics realizados:
              </strong>
              {clientDetails.clics.map((clic, index) => (<div key={index} className="flex items-center space-x-3">
                  <CheckIcon className="h-5 w-5 text-green-500"/>
                  <p className="text-sm text-gray-600">{clic}</p>
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
};
export default IcodcliDetail;
