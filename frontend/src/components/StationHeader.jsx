import React from "react";
import StarRating from "./StarRating";

const StationHeader = ({ station, stats }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold">{station.name}</h1>
      <p className="text-gray-500">{station.line}</p>
      <div className="mt-2 flex items-center gap-4">
        <StarRating rating={stats.overallRating || 0} />
        <span className="text-sm text-gray-600">
          {stats.totalReviews} reviews
        </span>
      </div>
    </div>
  );
};

export default StationHeader;
