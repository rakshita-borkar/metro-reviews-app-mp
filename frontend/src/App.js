import React, { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import StationSelector from "./components/StationSelector";
import StationHeader from "./components/StationHeader";
import ReviewList from "./components/ReviewList";
import ReviewFormModal from "./components/ReviewFormModal";
import AspectAnalysis from "./components/AspectAnalysis";
import InsightsBanner from "./components/InsightsBanner";
import RatingDistribution from "./components/RatingDistribution";
import { getStations, getReviews, getStationStats, submitReview } from "./api";

function App() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  // Load stations once logged in
  useEffect(() => {
    if (loggedIn) getStations().then(setStations);
  }, [loggedIn]);

  // Load reviews + stats whenever station changes
  useEffect(() => {
    if (!selectedStation) return;
    const fetchData = async () => {
      const [reviewsData, statsData] = await Promise.all([
        getReviews(selectedStation.id),
        getStationStats(selectedStation.id),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    };
    fetchData();
  }, [selectedStation]);

  const handleReviewSubmit = async (text) => {
    if (!selectedStation) return;
    await submitReview(selectedStation.id, text);
    setShowReviewForm(false);

    // Refresh reviews and stats
    const [newReviews, newStats] = await Promise.all([
      getReviews(selectedStation.id),
      getStationStats(selectedStation.id),
    ]);
    setReviews(newReviews);
    setStats(newStats);
  };

  if (!loggedIn) return <AuthForm onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <StationSelector
        stations={stations}
        selectedStation={selectedStation}
        onSelect={setSelectedStation}
      />

      {selectedStation && (
        <>
          <StationHeader station={selectedStation} stats={stats} />
          <InsightsBanner stats={stats} />
          <AspectAnalysis stats={stats} />
          <RatingDistribution stats={stats} />
          <ReviewList
            reviews={reviews}
            onOpenReviewForm={() => setShowReviewForm(true)}
          />
          {showReviewForm && (
            <ReviewFormModal
              station={selectedStation}
              onClose={() => setShowReviewForm(false)}
              onSubmit={handleReviewSubmit}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
