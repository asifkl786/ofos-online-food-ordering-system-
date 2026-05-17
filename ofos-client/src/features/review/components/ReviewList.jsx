import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewSkeleton from './ReviewSkeleton';

export default function ReviewList({ reviews, isLoading, onVote, onUpdate, onDelete }) {
  const [editingReview, setEditingReview] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);

  const canManageReview = (review) => {
    if (!currentUser) return false;
    return currentUser.role === 'ADMIN' || Number(currentUser.id) === Number(review.userId);
  };

  const handleDelete = async (review) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await onDelete?.(review.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-3 text-5xl">Star</div>
        <h3 className="text-lg font-semibold text-gray-700">No Reviews Yet</h3>
        <p className="mt-1 text-sm text-gray-500">Be the first to review this restaurant!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onVote={onVote}
            onEdit={setEditingReview}
            onDelete={handleDelete}
            canManage={canManageReview(review)}
          />
        ))}
      </div>

      {editingReview && (
        <ReviewForm
          initialReview={editingReview}
          isEditing
          onSubmit={(reviewData) => onUpdate?.(editingReview.id, reviewData)}
          onClose={() => setEditingReview(null)}
        />
      )}
    </>
  );
}
