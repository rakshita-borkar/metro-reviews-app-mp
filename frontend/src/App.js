import React, { useState, useEffect } from "react";
import StationSelector from "./components/StationSelector";
import StationHeader from "./components/StationHeader";
import InsightsBanner from "./components/InsightsBanner";
import AspectAnalysis from "./components/AspectAnalysis";
import RatingDistribution from "./components/RatingDistribution";
import ReviewList from "./components/ReviewList";
import ReviewFormModal from "./components/ReviewFormModal";

const App = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stats, setStats] = useState({});
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    // TODO: Fetch stations from API
    const mockStations = [
      { id: 1, name: "Central Station", line: "Red Line" },
      { id: 2, name: "North Station", line: "Green Line" },
    ];
    setStations(mockStations);
    setSelectedStation(mockStations[0]);
  }, []);

  useEffect(() => {
    if (!selectedStation) return;

    // TODO: Fetch stats and reviews for selected station
    const mockStats = {
      overallRating: 4.2,
      totalReviews: 23,
      reviewDistribution: { 5: 10, 4: 8, 3: 3, 2: 1, 1: 1 },
      aspects: {
        Cleanliness: { sentiment: "Positive", percentage: 75, trend: "↑" },
        Punctuality: { sentiment: "Neutral", percentage: 60, trend: "→" },
        Safety: { sentiment: "Negative", percentage: 40, trend: "↓" },
      },
      recentTrends: { thisMonth: 12, lastMonth: 10, sentiment: "Positive" },
    };
    const mockReviews = [
      { id: 1, overall_rating: 5, review_text: "Great station!", helpful_count: 2 },
      { id: 2, overall_rating: 3, review_text: "Okay, needs improvement.", helpful_count: 1 },
    ];
    setStats(mockStats);
    setReviews(mockReviews);
  }, [selectedStation]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">
      {stations.length > 0 && (
        <StationSelector
          stations={stations}
          selectedStation={selectedStation}
          onSelect={setSelectedStation}
        />
      )}
      {selectedStation && <StationHeader station={selectedStation} stats={stats} />}
      <InsightsBanner stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AspectAnalysis stats={stats} />
        <RatingDistribution stats={stats} />
      </div>
      <ReviewList reviews={reviews} onOpenReviewForm={() => setShowReviewForm(true)} />
      {showReviewForm && (
        <ReviewFormModal station={selectedStation} onClose={() => setShowReviewForm(false)} />
      )}
    </div>
  );
};

export default App;
