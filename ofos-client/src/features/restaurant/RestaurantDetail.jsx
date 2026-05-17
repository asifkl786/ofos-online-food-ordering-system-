import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from './hooks/useRestaurant';
import { 
  FiClock, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiGlobe,
  FiTruck,
  FiDollarSign,
  FiStar,
  FiChevronLeft,
  FiShare2,
  FiHeart
} from 'react-icons/fi';
import RatingStars from './components/RatingStars';
import { formatCurrency, formatTime, getRatingColor, getRatingText } from './utils/restaurantHelpers';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedRestaurant, isLoading, getRestaurantById, clearSelected } = useRestaurant();
  
  useEffect(() => {
    if (id) {
      getRestaurantById(id);
    }
    return () => clearSelected();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-semibold text-gray-700">Restaurant not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }
  
  const restaurant = selectedRestaurant;
  const mainAddress = restaurant.addresses?.[0];
  const ratingColor = getRatingColor(restaurant.averageRating || 0);
  const ratingText = getRatingText(restaurant.averageRating || 0);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-linear-to-r from-orange-500 to-red-500">
        {restaurant.coverImageUrl ? (
          <img 
            src={restaurant.coverImageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">🍽️</span>
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
            <FiShare2 className="w-5 h-5 text-gray-700" />
          </button>
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
            <FiHeart className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        
        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                {restaurant.logoUrl ? (
                  <img 
                    src={restaurant.logoUrl} 
                    alt={restaurant.name}
                    className="w-20 h-20 rounded-xl border-4 border-white bg-white object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl border-4 border-white bg-white flex items-center justify-center">
                    <span className="text-3xl">🍕</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{restaurant.name}</h1>
                  <p className="text-orange-200 mt-1">{restaurant.cuisineType}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${ratingColor}`}>
                  ⭐ {restaurant.averageRating?.toFixed(1) || 'NEW'} • {ratingText}
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              {restaurant.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
                  <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
                </div>
              )}
              
              {/* Opening Hours */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Opening Hours</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>{formatTime(restaurant.openingTime)} - {formatTime(restaurant.closingTime)}</span>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              {mainAddress && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Location</h2>
                  <div className="flex items-start gap-2 text-gray-600">
                    <FiMapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <p>{mainAddress.streetAddress}</p>
                      <p>{mainAddress.city}, {mainAddress.state} - {mainAddress.zipCode}</p>
                      <p>{mainAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Contact Info */}
              {(restaurant.contactPhone || restaurant.contactEmail || restaurant.website) && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Contact</h2>
                  <div className="space-y-2">
                    {restaurant.contactPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-4 h-4" />
                        <a href={`tel:${restaurant.contactPhone}`} className="hover:text-orange-500">
                          {restaurant.contactPhone}
                        </a>
                      </div>
                    )}
                    {restaurant.contactEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMail className="w-4 h-4" />
                        <a href={`mailto:${restaurant.contactEmail}`} className="hover:text-orange-500">
                          {restaurant.contactEmail}
                        </a>
                      </div>
                    )}
                    {restaurant.website && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiGlobe className="w-4 h-4" />
                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                          {restaurant.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Order Info */}
            <div className="bg-orange-50 rounded-xl p-5 h-fit">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiTruck className="w-4 h-4" /> Delivery Fee
                  </span>
                  <span className="font-semibold">{formatCurrency(restaurant.deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" /> Min Order
                  </span>
                  <span className="font-semibold">{formatCurrency(restaurant.minimumOrderAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiStar className="w-4 h-4" /> Rating
                  </span>
                  <RatingStars rating={restaurant.averageRating || 0} size="sm" />
                </div>
                <div className="pt-4 border-t border-orange-200">
                  <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}