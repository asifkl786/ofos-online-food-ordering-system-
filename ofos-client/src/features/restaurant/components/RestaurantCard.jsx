import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiTruck } from 'react-icons/fi';
import RatingStars from './RatingStars';
import { formatCurrency, getDeliveryEstimate, getCuisineIcon, getRatingColor, getRatingText } from '../utils/restaurantHelpers';

export default function RestaurantCard({ restaurant }) {
  const {
    id,
    name,
    description,
    logoUrl,
    cuisineType,
    averageRating,
    totalReviews,
    isOpen,
    minimumOrderAmount,
    deliveryFee,
  } = restaurant;
  
  const deliveryEstimate = getDeliveryEstimate();
  const cuisineIcon = getCuisineIcon(cuisineType);
  const ratingColor = getRatingColor(averageRating || 0);
  const ratingText = getRatingText(averageRating || 0);
  
  return (
    <Link to={`/restaurant/${id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-6xl">{cuisineIcon}</span>
            </div>
          )}
          
          {/* Rating Badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold ${ratingColor}`}>
            ⭐ {averageRating?.toFixed(1) || 'NEW'} • {ratingText}
          </div>
          
          {/* Open/Closed Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold ${
            isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </div>
          
          {/* Delivery Time Badge */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {deliveryEstimate} min
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1">
            {name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              {cuisineIcon} {cuisineType}
            </span>
          </div>
          
          {description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <FiTruck className="w-3 h-3" />
                {formatCurrency(deliveryFee)}
              </div>
              <div className="text-xs text-gray-400">•</div>
              <div className="text-xs text-gray-600">
                Min {formatCurrency(minimumOrderAmount)}
              </div>
            </div>
            <div className="text-orange-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Order Now →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}