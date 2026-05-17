import { FiStar, FiStar as FiStarOutline } from 'react-icons/fi';

export default function RatingStars({ rating, totalReviews, size = 'md', interactive = false, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating || 0);
  
  const fullStars = Math.floor(interactive ? selectedRating : rating);
  const hasHalfStar = !interactive && rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };
  
  const starClass = sizeClasses[size] || sizeClasses.md;
  
  const handleClick = (index) => {
    if (interactive) {
      setSelectedRating(index);
      onRatingChange?.(index);
    }
  };
  
  const displayRating = interactive ? selectedRating : rating;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" onMouseLeave={() => interactive && setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = interactive 
            ? (hoverRating >= star || selectedRating >= star)
            : star <= fullStars;
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              className={interactive ? 'cursor-pointer' : 'cursor-default'}
              disabled={!interactive}
            >
              <FiStar
                className={`${starClass} transition-colors ${
                  isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {totalReviews !== undefined && !interactive && (
        <span className="text-xs text-gray-500">({totalReviews} reviews)</span>
      )}
    </div>
  );
}

// Add useState import
import { useState } from 'react';