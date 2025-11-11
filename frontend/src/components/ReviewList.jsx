import React from "react";
import StarRating from "./StarRating";

const ReviewList = ({ reviews, onOpenReviewForm, onLoadMore, hasMore, loadingMore }) => {
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
                  <span className="text-xs text-gray-500">
                    {review.user} • {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">{review.text}</p>
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
