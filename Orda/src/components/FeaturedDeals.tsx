import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Percent } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter';
import { toast } from 'sonner';

interface FeaturedDeal {
    id: string;
    name: string;
    description: string;
    price: number;
    discount_percentage: number;
    image_url?: string;
    restaurant_id: string;
    restaurant_name: string;
    restaurant_rating: number;
    prep_time: number;
    is_available: boolean;
}

export default function FeaturedDeals() {
    const [deals, setDeals] = useState<FeaturedDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeaturedDeals();
    }, []);

    const fetchFeaturedDeals = async () => {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select(`
                    id,
                    name,
                    description,
                    price,
                    discount_percentage,
                    image_url,
                    restaurant_id,
                    prep_time,
                    is_available,
                    restaurants!inner(
                        name,
                        rating,
                        is_active
                    )
                `)
                .eq('is_featured', true)
                .eq('is_available', true)
                .eq('restaurants.is_active', true)
                .gt('discount_percentage', 0)
                .order('discount_percentage', { ascending: false })
                .limit(8);

            if (error) throw error;

            const formattedDeals: FeaturedDeal[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                discount_percentage: item.discount_percentage,
                image_url: item.image_url,
                restaurant_id: item.restaurant_id,
                restaurant_name: item.restaurants.name,
                restaurant_rating: item.restaurants.rating,
                prep_time: item.prep_time,
                is_available: item.is_available
            }));

            setDeals(formattedDeals);
        } catch (error) {
            console.error('Error fetching featured deals:', error);
            toast.error('Failed to load featured deals');
        } finally {
            setLoading(false);
        }
    };

    const handleDealClick = (deal: FeaturedDeal) => {
        // Navigate to restaurant page and scroll to the specific item
        navigate(`/restaurant/${deal.restaurant_id}#item-${deal.id}`);
    };

    if (loading) {
        return (
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Featured Deals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, index) => (
                            <Card key={index} className="animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                                <CardContent className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (deals.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Featured Deals</h2>
                    <p className="text-gray-600">Don't miss out on these amazing offers!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deals.map((deal) => {
                        const discountedPrice = deal.price * (1 - deal.discount_percentage / 100);
                        
                        return (
                            <Card 
                                key={deal.id} 
                                className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                onClick={() => handleDealClick(deal)}
                            >
                                <div className="relative">
                                    {deal.image_url ? (
                                        <img 
                                            src={deal.image_url} 
                                            alt={deal.name}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                                            <Percent className="w-12 h-12 text-primary/60" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="destructive" className="font-bold">
                                            {deal.discount_percentage}% OFF
                                        </Badge>
                                    </div>
                                    
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="secondary">Featured</Badge>
                                    </div>
                                </div>
                                
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{deal.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{deal.description}</p>
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span>{deal.restaurant_rating}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{deal.prep_time} mins</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 mb-3">From {deal.restaurant_name}</p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatNaira(discountedPrice)}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through ml-2">
                                                {formatNaira(deal.price)}
                                            </span>
                                        </div>
                                        
                                        <div className="text-sm font-medium text-green-600">
                                            Save {formatNaira(deal.price - discountedPrice)}
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        className="w-full" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDealClick(deal);
                                        }}
                                        disabled={!deal.is_available}
                                    >
                                        {deal.is_available ? 'Order Now' : 'Unavailable'}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                
                <div className="text-center mt-8">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/search?q=featured')}
                    >
                        View All Deals
                    </Button>
                </div>
            </div>
        </section>
    );
}