import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import RatingStars from './RatingStars';
import { FiX, FiStar } from 'react-icons/fi';

const reviewSchema = yup.object({
  rating: yup.number().min(1, 'Please select a rating').required('Rating is required'),
  comment: yup.string().min(10, 'Please write at least 10 characters').max(500, 'Comment too long'),
});

export default function ReviewForm({ orderId, restaurantId, restaurantName, initialReview = null, isEditing = false, onSubmit, onClose }) {
  const [selectedRating, setSelectedRating] = useState(initialReview?.rating || 0);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const reviewData = isEditing
      ? { rating: values.rating, comment: values.comment, reviewImages: initialReview?.reviewImages || '' }
      : {
          ...values,
          orderId,
          restaurantId,
          reviewType: 'RESTAURANT',
        };
    const result = await onSubmit(reviewData);
    if (result?.meta?.requestStatus === 'rejected') {
      setSubmitting(false);
      return;
    }
    resetForm();
    setSelectedRating(0);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiStar className="text-yellow-500" /> {isEditing ? 'Edit Review' : 'Write a Review'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <Formik
          initialValues={{ rating: initialReview?.rating || 0, comment: initialReview?.comment || '' }}
          validationSchema={reviewSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="p-5 space-y-5">
              {/* Rating Section */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center">
                  <RatingStars
                    rating={values.rating}
                    size="xl"
                    interactive={true}
                    onRatingChange={(rating) => setFieldValue('rating', rating)}
                  />
                </div>
                <ErrorMessage name="rating" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Comment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <Field
                  as="textarea"
                  name="comment"
                  rows="4"
                  placeholder="Share your experience with this restaurant..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <ErrorMessage name="comment" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Tips */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">💡 Tips for a helpful review:</p>
                <ul className="text-xs text-gray-400 mt-1 space-y-1 list-disc list-inside">
                  <li>Tell us about the food quality and taste</li>
                  <li>Mention the service and delivery experience</li>
                  <li>Be specific and honest</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Review' : 'Submit Review')}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
