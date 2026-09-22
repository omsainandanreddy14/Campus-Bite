import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star } from 'lucide-react';

const RatingModal = ({ order, isOpen, onClose }) => {
  const { submitFoodReview, submitRiderReview } = useApp();
  const [foodRatings, setFoodRatings] = useState(() => {
    const initial = {};
    if (order && order.items) {
      order.items.forEach(item => {
        initial[item.id] = 0; // 0 means unset — student must choose
      });
    }
    return initial;
  });
  const [foodComment, setFoodComment] = useState('');
  const [riderRating, setRiderRating] = useState(0); // 0 means unset — student must choose
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleStarClick = (foodId, starValue) => {
    setFoodRatings(prev => ({
      ...prev,
      [foodId]: starValue
    }));
  };

  const handleRiderStarClick = (starValue) => {
    setRiderRating(starValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // 1. Submit food reviews
      for (const item of order.items) {
        // Skip review posts for custom specials since they don't have matching database menu items
        if (item.id && item.id.startsWith('custom_special_')) {
          continue;
        }
        const rating = foodRatings[item.id];
        // Only submit if student actually chose a rating
        if (!rating || rating < 1) continue;
        const reviewText = foodComment;
        const res = await submitFoodReview(item.id, rating, reviewText, order.id);
        if (!res.success) {
          setError(res.error || 'Failed to submit food reviews');
          setSubmitting(false);
          return;
        }
      }

      // 2. Submit rider review if delivery partner was assigned and student gave a rating
      if (order.deliveryBoy && order.deliveryBoy !== 'Unassigned' && order.deliveryBoy !== 'N/A' && riderRating >= 1) {
        const res = await submitRiderReview(order.id, riderRating);
        if (!res.success) {
          setError(res.error || 'Failed to submit rider review');
          setSubmitting(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit ratings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-slide-up">
        
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="h-16 w-16 bg-emerald-105/10 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded-full flex items-center justify-center mx-auto text-3xl font-bold animate-bounce">
              🎉
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Thank You for Your Feedback!</h3>
              <p className="text-sm text-slate-400 mt-1">Your reviews help canteens and riders improve service quality.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Rate Order #{order.id}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tell us about the meal preparation and delivery partner.</p>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-955/20 border border-red-200/50 p-3 rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Food item reviews */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Dish Preparation Quality</h4>
              
              <div className="space-y-3">
                {order.items.map((item) => {
                  const rating = foodRatings[item.id] || 5;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-100/50 dark:border-slate-850/40 rounded-xl">
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">{item.name}</span>
                        <span className="text-[10px] text-slate-450 font-medium">Quantity: {item.quantity}</span>
                      </div>
                      
                      {/* Star rating selector */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => handleStarClick(item.id, star)}
                            className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star 
                              className={`h-5 w-5 ${
                                star <= rating 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-slate-350 dark:text-slate-750'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cooking Comment */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Food Review / Comments</label>
                <textarea
                  placeholder="How was the taste, temperature, and quantity? (e.g. Delicious Paneer, cooked to perfection!)"
                  value={foodComment}
                  onChange={(e) => setFoodComment(e.target.value)}
                  className="auth-input min-h-[80px] py-2.5 px-4 resize-none rounded-xl text-xs"
                  rows="3"
                />
              </div>
            </div>

            {/* Rider review */}
            {order.deliveryBoy && order.deliveryBoy !== 'Unassigned' && order.deliveryBoy !== 'N/A' && (
              <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">2. Courier Delivery Partner</h4>
                
                <div className="flex items-center justify-between p-3.5 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                      🚴
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">{order.deliveryBoy}</span>
                      <span className="text-[9px] text-slate-450 font-semibold uppercase">Rider Partner</span>
                    </div>
                  </div>
                  
                  {/* Star rating selector */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleRiderStarClick(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`h-5 w-5 ${
                            star <= riderRating 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-slate-350 dark:text-slate-750'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{submitting ? 'Submitting Feedback...' : 'Submit Ratings & Reviews'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
