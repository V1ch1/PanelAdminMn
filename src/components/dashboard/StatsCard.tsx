// src/components/dashboard/StatsCard.tsx
import React from "react";

interface StatsCardProps {
  title: string;
  value: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-3xl">{value}</p>
    </div>
  );
};

export default StatsCard;
