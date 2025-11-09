import React from "react";

const AspectAnalysis = ({ stats }) => {
  if (!stats.aspects) return null;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Aspect Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats.aspects).map(([aspect, data]) => (
          <div
            key={aspect}
            className="border rounded-xl p-3 text-center bg-gray-50"
          >
            <h3 className="font-medium">{aspect}</h3>
            <p className="text-sm text-gray-600">{data.sentiment}</p>
            <p className="text-xl font-bold">{data.percentage}%</p>
            <p className="text-xs text-gray-500">Trend: {data.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AspectAnalysis;
