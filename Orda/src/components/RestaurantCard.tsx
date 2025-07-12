import React from 'react';
import { Star, Clock, Truck, MapPin, Badge as BadgeIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
  specialties: string[];
  distance: number;
  promotion?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation to restaurant detail page
      window.location.href = `/restaurant/${restaurant.id}`;
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border-0 shadow-sm"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={restaurant.isOpen ? "default" : "secondary"}
            className={`${
              restaurant.isOpen 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-gray-500"
            } text-white`}
          >
            {restaurant.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>

        {/* Promotion Badge */}
        {restaurant.promotion && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#E94057] hover:bg-[#E94057]/90 text-white">
              <BadgeIcon className="h-3 w-3 mr-1" />
              {restaurant.promotion}
            </Badge>
          </div>
        )}

        {/* Distance Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            <MapPin className="h-3 w-3 mr-1" />
            {restaurant.distance} km
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Restaurant Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-[#102542] group-hover:text-[#E94057] transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-gray-600 text-sm">{restaurant.cuisine}</p>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1">
            {restaurant.specialties.slice(0, 3).map((specialty, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs text-gray-600 border-gray-200"
              >
                {specialty}
              </Badge>
            ))}
            {restaurant.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-600 border-gray-200">
                +{restaurant.specialties.length - 3} more
              </Badge>
            )}
          </div>

          {/* Rating and Delivery Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>₦{restaurant.deliveryFee}</span>
              </div>
            </div>
          </div>

          {/* Order Button */}
          <Button 
            className="w-full bg-[#E94057] hover:bg-[#E94057]/90 text-white transition-colors"
            disabled={!restaurant.isOpen}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/restaurant/${restaurant.id}`;
            }}
          >
            {restaurant.isOpen ? "Order Now" : "Closed"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;