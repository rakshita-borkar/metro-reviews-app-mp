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
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewsOffset, setReviewsOffset] = useState(0);

  // Load stations once logged in
  useEffect(() => {
    if (loggedIn) getStations().then(setStations);
  }, [loggedIn]);

  // Load reviews first (fast), then stats (slow ML processing)
  useEffect(() => {
    if (!selectedStation) return;
    
    // Reset reviews when station changes
    setReviews([]);
    setReviewsOffset(0);
    setHasMoreReviews(false);
    
    // Load first 20 reviews
    setLoadingReviews(true);
    getReviews(selectedStation.id, 20, 0)
      .then((response) => {
        const reviewsData = response.results || response;
        const totalCount = response.count || reviewsData.length;
        setReviews(reviewsData);
        setReviewsOffset(20);
        setHasMoreReviews(reviewsData.length < totalCount);
        setLoadingReviews(false);
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
        setLoadingReviews(false);
      });
    
    // Load stats separately (this includes slow ML processing)
    setLoadingStats(true);
    getStationStats(selectedStation.id)
      .then((statsData) => {
        setStats(statsData);
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoadingStats(false);
      });
  }, [selectedStation]);
  
  const handleLoadMoreReviews = async () => {
    if (!selectedStation || loadingMoreReviews) return;
    
    setLoadingMoreReviews(true);
    try {
      const response = await getReviews(selectedStation.id, 20, reviewsOffset);
      const newReviews = response.results || response;
      const totalCount = response.count;
      
      setReviews([...reviews, ...newReviews]);
      const newOffset = reviewsOffset + newReviews.length;
      setReviewsOffset(newOffset);
      setHasMoreReviews(totalCount ? newOffset < totalCount : newReviews.length === 20);
    } catch (err) {
      console.error("Error loading more reviews:", err);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const handleReviewSubmit = async (rating, text) => {
    if (!selectedStation) return;
    await submitReview(selectedStation.id, rating, text);
    setShowReviewForm(false);

    // Refresh reviews (first 20) and stats
    const [newReviewsResponse, newStats] = await Promise.all([
      getReviews(selectedStation.id, 20, 0),
      getStationStats(selectedStation.id),
    ]);
    const newReviews = newReviewsResponse.results || newReviewsResponse;
    const totalCount = newReviewsResponse.count || newReviews.length;
    setReviews(newReviews);
    setReviewsOffset(20);
    setHasMoreReviews(newReviews.length < totalCount);
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
          {loadingStats && (
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center text-gray-500">
              Loading statistics...
            </div>
          )}
          {!loadingStats && <AspectAnalysis stats={stats} />}
          {!loadingStats && <RatingDistribution stats={stats} />}
          {loadingReviews ? (
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center text-gray-500">
              Loading reviews...
            </div>
          ) : (
            <ReviewList
              reviews={reviews}
              onOpenReviewForm={() => setShowReviewForm(true)}
              onLoadMore={handleLoadMoreReviews}
              hasMore={hasMoreReviews}
              loadingMore={loadingMoreReviews}
            />
          )}
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
