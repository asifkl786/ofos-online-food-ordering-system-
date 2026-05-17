import { useState } from 'react';
import RatingStars from './RatingStars';
import { formatReviewDate, getRatingColor, getRatingText } from '../utils/reviewHelpers';
import { FiEdit2, FiFlag, FiThumbsDown, FiThumbsUp, FiTrash2 } from 'react-icons/fi';

export default function ReviewCard({ review, onVote, onEdit, onDelete, canManage = false, showHelpful = true }) {
  const [voted, setVoted] = useState(false);
  const ratingColor = getRatingColor(review.rating);
  const ratingText = getRatingText(review.rating);

  const handleVote = (isHelpful) => {
    if (!voted) {
      onVote?.(review.id, isHelpful);
      setVoted(true);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-red-500 font-semibold text-white">
            {review.userName?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{review.userName || 'Anonymous'}</h4>
            <p className="text-xs text-gray-400">{formatReviewDate(review.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(review)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                <FiEdit2 className="h-3 w-3" /> Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(review)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <FiTrash2 className="h-3 w-3" /> Delete
              </button>
            </>
          )}
          <div className={`rounded-full px-2 py-1 text-xs font-medium ${ratingColor} bg-opacity-10`}>
            {review.rating}.0 - {ratingText}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>
      )}

      {showHelpful && (
        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => handleVote(true)}
            disabled={voted}
            className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-green-600 disabled:opacity-50"
          >
            <FiThumbsUp className="h-4 w-4" />
            Helpful ({review.helpfulCount || 0})
          </button>
          <button
            type="button"
            onClick={() => handleVote(false)}
            disabled={voted}
            className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            <FiThumbsDown className="h-4 w-4" />
            Not Helpful ({review.notHelpfulCount || 0})
          </button>
          <button type="button" className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600">
            <FiFlag className="h-4 w-4" />
            Report
          </button>
        </div>
      )}
    </div>
  );
}
