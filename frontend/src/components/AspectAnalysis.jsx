import React from "react";

const AspectAnalysis = ({ stats }) => {
  if (!stats.aspects) return null;

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-50 border-green-300";
      case "negative":
        return "bg-red-50 border-red-300";
      case "neutral":
        return "bg-gray-50 border-gray-300";
      default:
        return "bg-blue-50 border-blue-300";
    }
  };

  const getSentimentBadgeColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Aspect Analysis (9 Dimensions)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats.aspects).map(([aspect, data]) => (
          <div
            key={aspect}
            className={`border-2 rounded-xl p-4 transition ${getSentimentColor(data.sentiment)}`}
          >
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">{aspect}</h3>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getSentimentBadgeColor(data.sentiment)}`}>
                {data.sentiment}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-2xl font-bold text-gray-900">{data.percentage}%</span>
                <span className="text-xs text-gray-500">{data.trend}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    data.sentiment === "Positive"
                      ? "bg-green-500"
                      : data.sentiment === "Negative"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AspectAnalysis;
