import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Clock, Truck, MapPin, Filter } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter';
import { toast } from 'sonner';

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

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    restaurant_id: string;
    restaurant_name?: string;
    discount_percentage: number;
    is_featured: boolean;
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
        <div className="relative">
            {restaurant.image_url && (
                <img 
                    src={restaurant.image_url} 
                    alt={restaurant.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                />
            )}
            <div className="absolute top-2 right-2">
                <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
            </div>
        </div>
        
        <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
            
            <div className="flex items-center justify-between mb-2">
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
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <Truck className="w-4 h-4" />
                    <span>{formatNaira(restaurant.delivery_fee)} delivery</span>
                </div>
                
                <div className="text-sm text-gray-500">
                    Min: {formatNaira(restaurant.min_order_amount)}
                </div>
            </div>
            
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{restaurant.address}</span>
            </div>
        </CardContent>
    </Card>
);

interface MenuItemCardProps {
    item: MenuItem;
    onClick: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
    const discountedPrice = item.discount_percentage > 0 
        ? item.price * (1 - item.discount_percentage / 100)
        : item.price;

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
            <div className="flex items-center p-4">
                {item.image_url && (
                    <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                )}
                
                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {item.is_featured && (
                                <Badge variant="secondary" className="mb-1">Featured</Badge>
                            )}
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                            <p className="text-sm text-gray-500">From {item.restaurant_name}</p>
                        </div>
                        
                        <div className="text-right">
                            {item.discount_percentage > 0 ? (
                                <div>
                                    <span className="font-bold text-lg text-green-600">
                                        {formatNaira(discountedPrice)}
                                    </span>
                                    <div className="text-sm text-gray-500 line-through">
                                        {formatNaira(item.price)}
                                    </div>
                                    <Badge variant="destructive" className="text-xs">
                                        {item.discount_percentage}% OFF
                                    </Badge>
                                </div>
                            ) : (
                                <span className="font-bold text-lg">
                                    {formatNaira(item.price)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default function SearchResultsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');
    const [sortBy, setSortBy] = useState<'rating' | 'delivery_time' | 'delivery_fee'>('rating');

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams]);

    const performSearch = async (query: string) => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            // Search restaurants
            const { data: restaurantData, error: restaurantError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('is_active', true)
                .or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine_type.ilike.%${query}%,address.ilike.%${query}%`)
                .order(sortBy === 'rating' ? 'rating' : sortBy === 'delivery_time' ? 'avg_delivery_time' : 'delivery_fee', 
                       { ascending: sortBy !== 'rating' });

            if (restaurantError) throw restaurantError;
            setRestaurants(restaurantData || []);

            // Search menu items
            const { data: menuData, error: menuError } = await supabase
                .from('menu_items')
                .select(`
                    *,
                    restaurants!inner(name, is_active)
                `)
                .eq('is_available', true)
                .eq('restaurants.is_active', true)
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .order('is_featured', { ascending: false });

            if (menuError) throw menuError;
            
            const menuItemsWithRestaurant = (menuData || []).map(item => ({
                ...item,
                restaurant_name: item.restaurants?.name
            }));
            
            setMenuItems(menuItemsWithRestaurant);

        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to perform search');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery.trim() });
        }
    };

    const handleRestaurantClick = (restaurantId: string) => {
        navigate(`/restaurant/${restaurantId}`);
    };

    const handleMenuItemClick = (item: MenuItem) => {
        navigate(`/restaurant/${item.restaurant_id}#item-${item.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search for restaurants, dishes, or cuisines..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </form>

                    {searchParams.get('q') && (
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">
                                Search results for "{searchParams.get('q')}"
                            </h1>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value as any);
                                            if (searchParams.get('q')) {
                                                performSearch(searchParams.get('q')!);
                                            }
                                        }}
                                        className="border rounded px-3 py-1 text-sm"
                                    >
                                        <option value="rating">Sort by Rating</option>
                                        <option value="delivery_time">Sort by Delivery Time</option>
                                        <option value="delivery_fee">Sort by Delivery Fee</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Tabs */}
                {searchParams.get('q') && (
                    <div className="mb-6">
                        <div className="flex gap-4 border-b">
                            <button
                                className={`pb-2 px-1 font-medium ${
                                    activeTab === 'restaurants' 
                                        ? 'border-b-2 border-primary text-primary' 
                                        : 'text-gray-600'
                                }`}
                                onClick={() => setActiveTab('restaurants')}
                            >
                                Restaurants ({restaurants.length})
                            </button>
                            <button
                                className={`pb-2 px-1 font-medium ${
                                    activeTab === 'dishes' 
                                        ? 'border-b-2 border-primary text-primary' 
                                        : 'text-gray-600'
                                }`}
                                onClick={() => setActiveTab('dishes')}
                            >
                                Dishes ({menuItems.length})
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Searching...</p>
                    </div>
                )}

                {/* Results */}
                {!loading && searchParams.get('q') && (
                    <>
                        {activeTab === 'restaurants' && (
                            <div>
                                {restaurants.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {restaurants.map((restaurant) => (
                                            <RestaurantCard
                                                key={restaurant.id}
                                                restaurant={restaurant}
                                                onClick={() => handleRestaurantClick(restaurant.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No restaurants found for "{searchParams.get('q')}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'dishes' && (
                            <div>
                                {menuItems.length > 0 ? (
                                    <div className="grid gap-4">
                                        {menuItems.map((item) => (
                                            <MenuItemCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => handleMenuItemClick(item)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No dishes found for "{searchParams.get('q')}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!searchParams.get('q') && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Search for delicious food</h2>
                        <p className="text-gray-500">
                            Find your favorite restaurants and dishes in Osogbo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}