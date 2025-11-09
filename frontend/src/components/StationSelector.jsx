import React from "react";

const StationSelector = ({ stations, selectedStation, onSelect }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Select Station</h2>
      <select
        className="w-full border rounded-lg p-2"
        value={selectedStation?.id || ""}
        onChange={(e) => {
          const station = stations.find((s) => s.id === parseInt(e.target.value));
          onSelect(station);
        }}
      >
        {stations.map((station) => (
          <option key={station.id} value={station.id}>
            {station.name} ({station.line})
          </option>
        ))}
      </select>
    </div>
  );
};

export default StationSelector;
