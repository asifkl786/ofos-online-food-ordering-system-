import { FiStar, FiStar as FiStarOutline } from 'react-icons/fi';

export default function RatingStars({ rating, totalReviews, size = 'md' }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const starClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FiStar key={`full-${i}`} className={`${starClass} text-yellow-400 fill-yellow-400`} />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <FiStar className={`${starClass} text-yellow-400`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FiStar className={`${starClass} text-yellow-400 fill-yellow-400`} />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStarOutline key={`empty-${i}`} className={`${starClass} text-gray-300`} />
        ))}
      </div>
      {totalReviews !== undefined && (
        <span className="text-xs text-gray-500">({totalReviews})</span>
      )}
    </div>
  );
}