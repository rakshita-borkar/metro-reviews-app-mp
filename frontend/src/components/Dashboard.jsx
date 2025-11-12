import React, { useEffect, useState } from 'react';
import StationSelector from './StationSelector';
import StationHeader from './StationHeader';
import ReviewList from './ReviewList';
import ReviewFormModal from './ReviewFormModal';
import AspectAnalysis from './AspectAnalysis';
import RatingDistribution from './RatingDistribution';
import { getStations, getReviews, getStationStats, submitReview } from '../api';
import { deleteReview } from '../api';

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewsOffset, setReviewsOffset] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load stations on mount
  useEffect(() => {
    getStations().then(setStations);
    // get currently logged-in user (if any)
    import('../api').then(({ getCurrentUser }) => getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null)));
  }, []);

  // Load reviews and stats when station changes
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
        console.error('Error loading reviews:', err);
        setLoadingReviews(false);
      });

    // Load stats separately
    setLoadingStats(true);
    getStationStats(selectedStation.id)
      .then((statsData) => {
        setStats(statsData);
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error('Error loading stats:', err);
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
      console.error('Error loading more reviews:', err);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const handleReviewSubmit = async (rating, text) => {
    if (!selectedStation) return;
    try {
      setSubmittingReview(true);
      await submitReview(selectedStation.id, rating, text);
      setShowReviewForm(false);

      // Refresh reviews and stats
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
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!selectedStation) return;
    // Confirm deletion
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await deleteReview(reviewId);
      // Refresh reviews and stats
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
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto pb-16">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100">Explore metro station reviews and share your experience</p>
      </div>

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
              onDeleteReview={handleDeleteReview}
              currentUser={currentUser}
            />
          )}
          {showReviewForm && (
            <ReviewFormModal
              station={selectedStation}
              onClose={() => setShowReviewForm(false)}
              onSubmit={handleReviewSubmit}
              submitting={submittingReview}
            />
          )}
        </>
      )}
    </div>
  );
}
