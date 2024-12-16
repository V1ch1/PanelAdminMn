import React from "react";

interface ClickStatsCardProps {
  colectivo: string;
  clics: { [key: string]: number; total: number };
}

const ClickStatsCard: React.FC<ClickStatsCardProps> = ({
  colectivo,
  clics,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{colectivo}</h3>
      <div className="space-y-2">
        <div>
          <strong>mail.video: </strong> {clics["mail.video"]}
        </div>
        <div>
          <strong>mail.plus.video: </strong> {clics["mail.plus.video"]}
        </div>
        <div>
          <strong>mail.precios: </strong> {clics["mail.precios"]}
        </div>
        <div>
          <strong>mail.plus.precios: </strong> {clics["mail.plus.precios"]}
        </div>
        <div className="mt-4 font-semibold">
          <strong>Total: </strong> {clics.total}
        </div>
      </div>
    </div>
  );
};

export default ClickStatsCard;
