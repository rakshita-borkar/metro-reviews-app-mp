import React from "react";

const InsightsBanner = ({ stats }) => {
  if (!stats.recentTrends) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-2xl text-center">
      <p className="text-sm font-medium">
        📈 Trends: This month {stats.recentTrends.thisMonth}, Last month{" "}
        {stats.recentTrends.lastMonth} — Sentiment is{" "}
        <span className="font-semibold">{stats.recentTrends.sentiment}</span>
      </p>
    </div>
  );
};

export default InsightsBanner;
