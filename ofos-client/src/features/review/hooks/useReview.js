import { useDispatch, useSelector } from 'react-redux';
import {
  addReview,
  updateReview,
  deleteReview,
  fetchRestaurantReviews,
  fetchRatingSummary,
  fetchUserReviews,
  voteHelpful,
  checkCanReview,
  clearReviews,
} from '../slices/reviewSlice';

export const useReview = () => {
  const dispatch = useDispatch();
  const { reviews, ratingSummary, userReviews, canReview, isLoading, error, pagination } = useSelector(
    (state) => state.review
  );

  const submitReview = (reviewData) => {
    return dispatch(addReview(reviewData));
  };

  const editReview = (reviewId, reviewData) => {
    return dispatch(updateReview({ reviewId, reviewData }));
  };

  const removeReview = (reviewId) => {
    return dispatch(deleteReview(reviewId));
  };

  const getRestaurantReviews = (restaurantId, page = 0, size = 10) => {
    dispatch(fetchRestaurantReviews({ restaurantId, page, size }));
  };

  const getRatingSummary = (restaurantId) => {
    dispatch(fetchRatingSummary(restaurantId));
  };

  const getUserReviews = (page = 0, size = 10) => {
    dispatch(fetchUserReviews({ page, size }));
  };

  const vote = (reviewId, isHelpful) => {
    return dispatch(voteHelpful({ reviewId, isHelpful }));
  };

  const canUserReview = (orderId) => {
    dispatch(checkCanReview(orderId));
  };

  const clearAllReviews = () => {
    dispatch(clearReviews());
  };

  return {
    // State
    reviews,
    ratingSummary,
    userReviews,
    canReview,
    isLoading,
    error,
    pagination,
    
    // Actions
    submitReview,
    editReview,
    removeReview,
    getRestaurantReviews,
    getRatingSummary,
    getUserReviews,
    vote,
    canUserReview,
    clearAllReviews,
  };
};
