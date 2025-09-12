import React from 'react';

interface StatCardProps {
  title: string;
  time: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, time }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{time}</p>
    </div>
  );
};
