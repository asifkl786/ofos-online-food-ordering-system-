import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReview } from '../hooks/useReview';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import RatingStars from '../components/RatingStars';
import { formatCurrency } from '../utils/reviewHelpers';
import { FiStar, FiTrendingUp, FiMessageCircle, FiPlus } from 'react-icons/fi';

export default function ReviewPage() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { 
    reviews, 
    ratingSummary, 
    isLoading, 
    getRestaurantReviews, 
    getRatingSummary, 
    submitReview,
    vote,
    editReview,
    removeReview,
    canReview,
    canUserReview
  } = useReview();
  
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      getRestaurantReviews(restaurantId);
      getRatingSummary(restaurantId);
      canUserReview(restaurantId);
    }
  }, [restaurantId]);

  const ratingDistribution = ratingSummary?.ratingDistribution || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Reviews</h1>
            <p className="text-gray-500 text-sm mt-1">What people are saying</p>
          </div>
          {canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Write a Review
            </button>
          )}
        </div>

        {/* Rating Summary Card */}
        {ratingSummary && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex flex-wrap gap-8 items-start">
              {/* Left - Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800">{ratingSummary.averageRating?.toFixed(1) || 0}</div>
                <RatingStars rating={ratingSummary.averageRating || 0} size="md" />
                <p className="text-sm text-gray-500 mt-1">{ratingSummary.totalReviews} reviews</p>
              </div>

              {/* Right - Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = ratingSummary.totalReviews > 0 
                    ? (count / ratingSummary.totalReviews) * 100 
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-600">{star} ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-500">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <ReviewList reviews={reviews} isLoading={isLoading} onVote={vote} onUpdate={editReview} onDelete={removeReview} />

        {/* Load More */}
        {!isLoading && reviews.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors">
              Load More Reviews
            </button>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            orderId={restaurantId}
            restaurantId={restaurantId}
            onSubmit={submitReview}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </div>
    </div>
  );
}
