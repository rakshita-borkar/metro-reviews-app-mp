import React, { useState } from "react";

const ReviewFormModal = ({ station, onClose, onSubmit }) => {
  const [rating, setRating] = useState(3); // optional, not used in backend
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return; // don't allow empty reviews
    onSubmit(text);
    setText(""); // clear form
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-3">
          Write Review for {station.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            Review:
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border rounded p-2 w-full"
              rows={3}
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewFormModal;
