import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronLeft,
  FiClock,
  FiGlobe,
  FiHeart,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShare2,
  FiStar,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi';
import { useRestaurant } from '../hooks/useRestaurant';
import RatingStars from '../components/RatingStars';
import MenuPage from '../../menu/pages/MenuPage';
import ReviewList from '../../review/components/ReviewList';
import { useReview } from '../../review/hooks/useReview';
import Loader from '../../../components/common/Loader';

const formatCurrency = (amount) => {
  if (!amount) return 'Rs. 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTime = (timeString) => {
  if (!timeString) return 'Not specified';
  const [hours, minutes] = timeString.split(':');
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minutes} ${ampm}`;
};

const getRatingText = (rating) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3) return 'Average';
  return 'Poor';
};

const getRatingColor = (rating) => {
  if (rating >= 4) return 'bg-green-100 text-green-700';
  if (rating >= 3) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedRestaurant, isLoading, getRestaurantById, clearSelected } = useRestaurant();
  const { reviews, ratingSummary, isLoading: reviewsLoading, getRestaurantReviews, getRatingSummary, vote, editReview, removeReview } = useReview();
  const [activeTab, setActiveTab] = useState('menu');
  const [isLiked, setIsLiked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (id) {
      getRestaurantById(id);
      getRestaurantReviews(id);
      getRatingSummary(id);
      window.scrollTo(0, 0);
    }
    return () => clearSelected();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (error) {
      setShowShareToast(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (!selectedRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">Restaurant not found</h2>
          <p className="mb-6 text-gray-500">The restaurant does not exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const restaurant = selectedRestaurant;
  const mainAddress = restaurant.addresses?.[0];
  const displayRating = ratingSummary?.averageRating ?? restaurant.averageRating ?? 0;
  const displayReviewCount = ratingSummary?.totalReviews ?? restaurant.totalReviews ?? 0;
  const ratingColor = getRatingColor(displayRating);
  const ratingText = getRatingText(displayRating);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-80 overflow-hidden md:h-96 lg:h-[500px]">
        {restaurant.coverImageUrl ? (
          <img src={restaurant.coverImageUrl} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-500 to-red-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute left-4 right-4 top-4 z-20 flex justify-between">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white">
            <FiChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setIsLiked(!isLiked)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white">
              <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white">
              <FiShare2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showShareToast && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
              Link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-white">
          <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-white shadow-xl">
                {restaurant.logoUrl ? (
                  <img src={restaurant.logoUrl} alt={restaurant.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-3xl">OF</div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold md:text-4xl">{restaurant.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-orange-100">
                  <span>{restaurant.cuisineType}</span>
                  <span>{restaurant.city || mainAddress?.city || 'Location'}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${ratingColor}`}>
                Star {displayRating ? displayRating.toFixed(1) : '0.0'} - {ratingText}
              </div>
              <div className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {restaurant.isOpen ? <span className="flex items-center gap-1"><FiCheckCircle /> Open Now</span> : <span className="flex items-center gap-1"><FiXCircle /> Closed</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-6 px-4 relative z-10">
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="flex border-b border-gray-100">
            {[
              ['menu', 'Menu'],
              ['info', 'Info'],
              ['reviews', `Reviews (${displayReviewCount})`],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`relative flex-1 py-4 text-center font-medium transition-all ${activeTab === key ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
                {activeTab === key && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Ready to order?</h3>
                    <p className="text-sm text-orange-100">Browse our delicious menu items</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center"><div className="text-2xl font-bold">{formatCurrency(restaurant.deliveryFee)}</div><div className="text-xs text-orange-100">Delivery Fee</div></div>
                    <div className="text-center"><div className="text-2xl font-bold">{formatCurrency(restaurant.minimumOrderAmount)}</div><div className="text-xs text-orange-100">Min Order</div></div>
                    <div className="flex items-center gap-2"><FiTruck /><span className="text-sm">Free delivery above Rs. 500</span></div>
                  </div>
                </div>
              </div>
              <MenuPage />
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {restaurant.description && <InfoBlock icon={FiInfo} title="About"><p className="leading-relaxed text-gray-600">{restaurant.description}</p></InfoBlock>}
                  <InfoBlock icon={FiClock} title="Opening Hours"><div className="rounded-xl bg-gray-50 p-4"><span>{formatTime(restaurant.openingTime)} - {formatTime(restaurant.closingTime)}</span></div></InfoBlock>
                  {mainAddress && <InfoBlock icon={FiMapPin} title="Location"><div className="rounded-xl bg-gray-50 p-4 text-gray-600"><p>{mainAddress.streetAddress}</p><p>{mainAddress.city}, {mainAddress.state} - {mainAddress.zipCode}</p></div></InfoBlock>}
                </div>
                <div className="space-y-6">
                  <InfoBlock icon={FiPhone} title="Contact">
                    <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                      {restaurant.contactPhone && <p className="flex items-center gap-2"><FiPhone /> {restaurant.contactPhone}</p>}
                      {restaurant.contactEmail && <p className="flex items-center gap-2"><FiMail /> {restaurant.contactEmail}</p>}
                      {restaurant.website && <p className="flex items-center gap-2"><FiGlobe /> {restaurant.website}</p>}
                    </div>
                  </InfoBlock>
                  <InfoBlock icon={FiStar} title="Statistics">
                    <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
                      <div className="flex justify-between"><span>Total Reviews</span><span className="font-semibold">{displayReviewCount}</span></div>
                      <div className="flex justify-between"><span>Total Orders</span><span className="font-semibold">{restaurant.totalOrders || 0}</span></div>
                      <RatingStars rating={displayRating || 0} size="sm" />
                    </div>
                  </InfoBlock>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 p-6">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-800">{displayRating ? displayRating.toFixed(1) : '0.0'}</div>
                    <RatingStars rating={displayRating || 0} size="md" />
                    <p className="mt-1 text-sm text-gray-500">{displayReviewCount} reviews</p>
                  </div>
                </div>
              </div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Customer Reviews</h3>
                  <p className="text-sm text-gray-500">Latest feedback from delivered orders</p>
                </div>
                <Link to={`/reviews/${restaurant.id}`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  View All <FiArrowRight />
                </Link>
              </div>
              <ReviewList reviews={reviews} isLoading={reviewsLoading} onVote={vote} onUpdate={editReview} onDelete={removeReview} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, title, children }) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800"><Icon className="h-5 w-5 text-orange-500" /> {title}</h2>
      {children}
    </div>
  );
}
