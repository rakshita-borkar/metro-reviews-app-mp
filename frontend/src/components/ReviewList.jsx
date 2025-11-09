import React from "react";
import StarRating from "./StarRating";

const ReviewList = ({ reviews, onOpenReviewForm }) => {
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
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-lg p-3 bg-gray-50"
            >
              <StarRating rating={review.overall_rating} />
              <p className="mt-1">{review.review_text}</p>
              <button className="text-sm text-blue-600 mt-1">
                👍 Helpful ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
