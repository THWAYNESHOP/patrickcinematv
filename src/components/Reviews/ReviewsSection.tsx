import { useState } from 'react';
import { Star, Trash2, Edit2, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Avatar from '../Avatar';

interface ReviewsSectionProps {
  mediaId: string;
  mediaType: 'movie' | 'tv' | 'sports' | 'anime';
  mediaTitle: string;
  mediaPoster: string;
}

// Star rating component
const StarRating = ({
  rating,
  onChange,
  size = 'md',
}: {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          type="button"
          className="text-yellow-400 transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-yellow-400' : ''
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function ReviewsSection({
  mediaId,
  mediaType,
  mediaTitle,
  mediaPoster,
}: ReviewsSectionProps) {
  const {
    addReview,
    removeReview,
    getReviewsForMedia,
    getAverageRatingForMedia,
  } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const mediaReviews = getReviewsForMedia(mediaId);
  const averageRating = getAverageRatingForMedia(mediaId);
  const userReview = mediaReviews.find((r) => !r.userId || r.userId === user?.email);

  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newRating, setNewRating] = useState(userReview?.rating || 0);
  const [newReviewText, setNewReviewText] = useState(userReview?.reviewText || '');

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error('Please select a rating before submitting');
      return;
    }

    addReview({
      mediaId,
      mediaType,
      mediaTitle,
      mediaPoster,
      rating: newRating,
      reviewText: newReviewText,
      userId: user?.email ?? undefined,
    });

    toast.success('Review submitted successfully!');
    setIsAddingReview(false);
  };

  const handleDeleteReview = (reviewId: string) => {
    removeReview(reviewId);
    toast.success('Review deleted');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Reviews</h2>
        {!isAddingReview && (
          <button
            onClick={() => setIsAddingReview(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-black font-semibold transition hover:bg-primaryHover"
          >
            <Edit2 className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Average rating */}
      {averageRating > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(averageRating)} size="lg" />
              <p className="text-gray-400 text-sm mt-1">
                Based on {mediaReviews.length} review{mediaReviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add new review form */}
      {isAddingReview && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {userReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button
              onClick={() => {
                setIsAddingReview(false);
                setNewRating(userReview?.rating || 0);
                setNewReviewText(userReview?.reviewText || '');
              }}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rating
            </label>
            <StarRating
              rating={newRating}
              onChange={setNewRating}
              size="lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="review-text" className="block text-sm font-medium text-gray-300 mb-2">
              Your Review
            </label>
            <textarea
              id="review-text"
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Share your thoughts about this..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary min-h-[120px]"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsAddingReview(false);
                setNewRating(userReview?.rating || 0);
                setNewReviewText(userReview?.reviewText || '');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-black font-semibold"
            >
              <Check className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {mediaReviews.length > 0 ? (
        <div className="space-y-4">
          {mediaReviews.map((review) => (
            <div
              key={review.id}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={null}
                    alt={review.userId?.split('@')[0] || 'User'}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold text-white">
                      {review.userId?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                {/* Only show delete button if it's the user's review */}
                {(!review.userId || review.userId === user?.email) && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-3">
                <StarRating rating={review.rating} size="sm" />
              </div>

              {review.reviewText && (
                <p className="mt-3 text-gray-200 text-sm leading-relaxed">
                  {review.reviewText}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </section>
  );
}
