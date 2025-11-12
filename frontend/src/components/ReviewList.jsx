import React from "react";
import StarRating from "./StarRating";

const ReviewList = ({ reviews, onOpenReviewForm, onLoadMore, hasMore, loadingMore, onDeleteReview, currentUser }) => {
  // Normalize currentUser to support both string (legacy) and object shapes
  const currentUsername = typeof currentUser === 'string' ? currentUser : currentUser?.username;
  const currentIsStaff = typeof currentUser === 'object' ? !!currentUser?.is_staff : false;
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border border-green-300";
      case "neutral":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      case "negative":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-300";
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Recent Reviews</h2>
        <button
          onClick={onOpenReviewForm}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Write Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={review.rating} />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {review.user} • {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {/* Delete button */}
                    {onDeleteReview && currentUsername && (review.user === currentUsername || currentIsStaff) && (
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="text-red-500 text-sm hover:underline"
                        title="Delete review"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm">{review.text}</p>
                
                {/* Aspect Badges */}
                {review.aspects && review.aspects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.aspects.map((aspect, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                          aspect.sentiment
                        )}`}
                      >
                        {aspect.aspect}: {aspect.sentiment}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : "Load More Reviews"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;
