import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Star, Send } from 'lucide-react';

interface ReviewFormProps {
  orderId: string;
  restaurantId: string;
  driverId?: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  orderId, 
  restaurantId, 
  driverId, 
  onReviewSubmitted 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    restaurant_rating: 0,
    driver_rating: 0,
    food_rating: 0,
    delivery_rating: 0
  });
  const [comments, setComments] = useState({
    restaurant_comment: '',
    driver_comment: '',
    food_comment: '',
    delivery_comment: ''
  });

  const handleRatingClick = (category: keyof typeof ratings, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const renderStarRating = (category: keyof typeof ratings, label: string) => {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 cursor-pointer transition-colors ${
                star <= ratings[category]
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
              onClick={() => handleRatingClick(category, star)}
            />
          ))}
        </div>
      </div>
    );
  };

  const submitReview = async () => {
    if (!user) return;

    // Validate that at least one rating is provided
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating) {
      toast({
        title: "Rating Required",
        description: "Please provide at least one rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        customer_id: user.id,
        restaurant_id: restaurantId,
        driver_id: driverId || null,
        order_id: orderId,
        restaurant_rating: ratings.restaurant_rating || null,
        driver_rating: ratings.driver_rating || null,
        food_rating: ratings.food_rating || null,
        delivery_rating: ratings.delivery_rating || null,
        restaurant_comment: comments.restaurant_comment || null,
        driver_comment: comments.driver_comment || null,
        food_comment: comments.food_comment || null,
        delivery_comment: comments.delivery_comment || null
      };

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setRatings({
        restaurant_rating: 0,
        driver_rating: 0,
        food_rating: 0,
        delivery_rating: 0
      });
      setComments({
        restaurant_comment: '',
        driver_comment: '',
        food_comment: '',
        delivery_comment: ''
      });

      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5" />
          <span>Rate Your Experience</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurant Rating */}
          <div className="space-y-3">
            {renderStarRating('restaurant_rating', 'Restaurant Overall')}
            <Textarea
              placeholder="How was the restaurant? (optional)"
              value={comments.restaurant_comment}
              onChange={(e) => setComments(prev => ({ 
                ...prev, 
                restaurant_comment: e.target.value 
              }))}
              rows={3}
            />
          </div>

          {/* Food Rating */}
          <div className="space-y-3">
            {renderStarRating('food_rating', 'Food Quality')}
            <Textarea
              placeholder="How was the food? (optional)"
              value={comments.food_comment}
              onChange={(e) => setComments(prev => ({ 
                ...prev, 
                food_comment: e.target.value 
              }))}
              rows={3}
            />
          </div>

          {/* Driver Rating (if applicable) */}
          {driverId && (
            <div className="space-y-3">
              {renderStarRating('driver_rating', 'Driver Service')}
              <Textarea
                placeholder="How was the driver? (optional)"
                value={comments.driver_comment}
                onChange={(e) => setComments(prev => ({ 
                  ...prev, 
                  driver_comment: e.target.value 
                }))}
                rows={3}
              />
            </div>
          )}

          {/* Delivery Rating */}
          <div className="space-y-3">
            {renderStarRating('delivery_rating', 'Delivery Experience')}
            <Textarea
              placeholder="How was the delivery? (optional)"
              value={comments.delivery_comment}
              onChange={(e) => setComments(prev => ({ 
                ...prev, 
                delivery_comment: e.target.value 
              }))}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={submitReview}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;