import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Truck, MapPin } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter';

interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    cuisine_type: string;
    image_url?: string;
    rating: number;
    review_count: number;
    avg_delivery_time: number;
    delivery_fee: number;
    min_order_amount: number;
    is_active: boolean;
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    className?: string;
}

export default function RestaurantCard({ restaurant, className = '' }: RestaurantCardProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/restaurant/${restaurant.id}`);
    };

    return (
        <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}
            onClick={handleClick}
        >
            <div className="relative">
                {restaurant.image_url ? (
                    <img 
                        src={restaurant.image_url} 
                        alt={restaurant.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/60">
                            {restaurant.name.charAt(0)}
                        </span>
                    </div>
                )}
                
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                </div>
                
                {!restaurant.is_active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                        <Badge variant="destructive">Currently Closed</Badge>
                    </div>
                )}
            </div>
            
            <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-sm">{restaurant.rating}</span>
                        <span className="text-gray-500 text-sm">({restaurant.review_count})</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.avg_delivery_time} mins</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Truck className="w-4 h-4" />
                        <span>{formatNaira(restaurant.delivery_fee)} delivery</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                        Min: {formatNaira(restaurant.min_order_amount)}
                    </div>
                </div>
                
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{restaurant.address}</span>
                </div>
            </CardContent>
        </Card>
    );
}