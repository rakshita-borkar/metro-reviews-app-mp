import React from "react";

const RatingDistribution = ({ stats }) => {
  if (!stats.reviewDistribution || !stats.totalReviews) return null;

  // Convert keys to numbers and sort in descending order (5 to 1)
  const distribution = Object.entries(stats.reviewDistribution)
    .map(([rating, count]) => [Number(rating), count])
    .sort((a, b) => b[0] - a[0]); // Sort by rating descending

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Rating Distribution</h2>
      <div className="space-y-2">
        {distribution.map(([rating, count]) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="w-6">{rating}★</span>
            <div className="flex-1 bg-gray-200 h-3 rounded">
              <div
                className="bg-yellow-400 h-3 rounded"
                style={{
                  width: `${(count / stats.totalReviews) * 100 || 0}%`,
                }}
              />
            </div>
            <span className="w-8 text-sm text-gray-600">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingDistribution;
