import React from 'react';
import { Star, Clock, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

interface FeaturedDeal {
  id: string;
  name: string;
  restaurant: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  rating: number;
  prepTime: string;
  discount: number;
  description: string;
  websiteUrl?: string;
}

const FeaturedDeals: React.FC = () => {
  const { addItem } = useCart();

  const featuredDeals: FeaturedDeal[] = [
    {
      id: 'deal-1',
      name: 'Mega Combo Deal',
      restaurant: 'Embassy Restaurant',
      originalPrice: 4500,
      discountedPrice: 3200,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      rating: 4.8,
      prepTime: '25-30 mins',
      discount: 29,
      description: 'Jollof rice, grilled chicken, coleslaw & drink',
      websiteUrl: 'https://embassy-restaurant.com/mega-combo'
    },
    {
      id: 'deal-2',
      name: 'Suya Party Pack',
      restaurant: 'BT Barbecue',
      originalPrice: 6000,
      discountedPrice: 4500,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      rating: 4.9,
      prepTime: '15-20 mins',
      discount: 25,
      description: '1kg mixed suya with extras & 2 drinks',
      websiteUrl: 'https://bt-barbecue.com/party-pack'
    },
    {
      id: 'deal-3',
      name: 'Traditional Feast',
      restaurant: 'Alhaja Food Canteen',
      originalPrice: 3500,
      discountedPrice: 2800,
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      rating: 4.6,
      prepTime: '20-25 mins',
      discount: 20,
      description: 'Amala, gbegiri, ewedu with assorted meat'
    }
  ];

  const handleAddToCart = (deal: FeaturedDeal) => {
    addItem({
      id: deal.id,
      name: deal.name,
      restaurant: deal.restaurant,
      price: deal.discountedPrice,
      image: deal.image
    });
  };

  const handleDealClick = (deal: FeaturedDeal) => {
    if (deal.websiteUrl) {
      window.open(deal.websiteUrl, '_blank');
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Featured Deals</h2>
        <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
          View All Deals
        </Button>
      </div>

      {/* Vertical Scrollable Deals */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
        {featuredDeals.map((deal) => (
          <Card
            key={deal.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:border-accent/30 overflow-hidden border rounded-xl bg-card flex flex-row h-32"
            onClick={() => handleDealClick(deal)}
          >
            {/* Image Container */}
            <div className="relative w-32 flex-shrink-0 overflow-hidden">
              <img
                src={deal.image}
                alt={deal.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Discount Badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold px-1.5 py-0.5">
                  {deal.discount}% OFF
                </Badge>
              </div>
            </div>

            <CardContent className="flex-1 p-3 flex flex-col justify-between">
              <div className="space-y-1">
              {/* Deal Info */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {deal.name}
                  </h3>
                  {deal.websiteUrl && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-accent transition-colors" />
                  )}
                </div>
                <p className="text-muted-foreground text-xs">{deal.restaurant}</p>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{deal.description}</p>
              </div>

                {/* Pricing & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-bold text-accent">
                      ₦{deal.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₦{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{deal.rating}</span>
                  </div>
                </div>

                {/* Prep Time */}
                <div className="flex items-center space-x-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{deal.prepTime}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button 
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors group mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(deal);
                }}
              >
                <Plus className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform" />
                Add
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedDeals;