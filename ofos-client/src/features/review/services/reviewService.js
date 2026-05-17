import api from '../../../api/axiosConfig';

export const reviewService = {
  // Add a review
  addReview: (reviewData) => {
    return api.post('/reviews', reviewData);
  },

  // Update current user's review
  updateReview: (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },

  // Get reviews for a restaurant
  getRestaurantReviews: (restaurantId, page = 0, size = 10) => {
    return api.get(`/reviews/restaurant/${restaurantId}`, {
      params: { page, size }
    });
  },

  // Get rating summary for a restaurant
  getRatingSummary: (restaurantId) => {
    return api.get(`/reviews/restaurant/${restaurantId}/rating-summary`);
  },

  // Get user's reviews
  getUserReviews: (page = 0, size = 10) => {
    return api.get('/reviews/my-reviews', { params: { page, size } });
  },

  // Vote helpful/not helpful
  voteHelpful: (reviewId, isHelpful) => {
    return api.post('/reviews/vote', { reviewId, isHelpful });
  },

  // Check if user can review
  canReview: (orderId) => {
    return api.get(`/reviews/can-review/${orderId}`);
  },

  // Delete review
  deleteReview: (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },
};
