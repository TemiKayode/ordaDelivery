import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Star, Truck, Plus, Minus, ShoppingCart } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    cuisine_type: string;
    image_url?: string;
    cover_image_url?: string;
    rating: number;
    review_count: number;
    avg_delivery_time: number;
    delivery_fee: number;
    min_order_amount: number;
    is_active: boolean;
    phone: string;
}

interface Category {
    id: string;
    name: string;
    description: string;
    sort_order: number;
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    category_id: string;
    prep_time: number;
    is_available: boolean;
    is_featured: boolean;
    discount_percentage: number;
    ingredients: string[];
    allergens?: string[];
}

interface MenuItemCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await onAddToCart(item, quantity);
            toast.success(`${item.name} added to cart!`);
        } catch (error) {
            toast.error('Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const discountedPrice = item.discount_percentage > 0 
        ? item.price * (1 - item.discount_percentage / 100)
        : item.price;

    return (
        <Card className="flex items-center p-4 border hover:shadow-md transition-shadow">
            {item.image_url && (
                <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-md mr-4"
                />
            )}
            <div className="flex-grow">
                <div className="flex items-start justify-between">
                    <div className="flex-grow">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.is_featured && (
                            <Badge variant="secondary" className="mb-2">Featured</Badge>
                        )}
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                                {item.discount_percentage > 0 ? (
                                    <>
                                        <span className="font-bold text-lg text-green-600">
                                            {formatNaira(discountedPrice)}
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                            {formatNaira(item.price)}
                                        </span>
                                        <Badge variant="destructive" className="text-xs">
                                            {item.discount_percentage}% OFF
                                        </Badge>
                                    </>
                                ) : (
                                    <span className="font-bold text-lg">
                                        {formatNaira(item.price)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {item.prep_time} mins
                            </div>
                        </div>

                        {item.ingredients && item.ingredients.length > 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                                Ingredients: {item.ingredients.join(', ')}
                            </p>
                        )}

                        {item.allergens && item.allergens.length > 0 && (
                            <p className="text-xs text-red-500 mb-2">
                                Allergens: {item.allergens.join(', ')}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <Button
                            onClick={handleAddToCart}
                            disabled={!item.is_available || isAdding}
                            className="w-full"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default function RestaurantDetailsPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (restaurantId) {
            fetchRestaurantData();
        }
    }, [restaurantId]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);

            // Fetch restaurant details
            const { data: restaurantData, error: restaurantError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('id', restaurantId)
                .eq('is_active', true)
                .single();

            if (restaurantError) throw restaurantError;
            setRestaurant(restaurantData);

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_active', true)
                .order('sort_order');

            if (categoriesError) throw categoriesError;
            setCategories(categoriesData || []);

            // Fetch menu items
            const { data: menuItemsData, error: menuItemsError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_available', true)
                .order('sort_order');

            if (menuItemsError) throw menuItemsError;
            setMenuItems(menuItemsData || []);

        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            toast.error('Failed to load restaurant details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (item: MenuItem, quantity: number) => {
        if (!restaurant) return;
        
        await addToCart({
            id: item.id,
            name: item.name,
            price: item.discount_percentage > 0 
                ? item.price * (1 - item.discount_percentage / 100)
                : item.price,
            quantity,
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            image_url: item.image_url
        });
    };

    const filteredMenuItems = selectedCategory === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category_id === selectedCategory);

    const groupedMenuItems = categories.reduce((acc, category) => {
        acc[category.id] = menuItems.filter(item => item.category_id === category.id);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading restaurant details...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
                    <Button onClick={() => navigate('/')}>Go back to home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restaurant Header */}
            <div className="relative">
                {restaurant.cover_image_url && (
                    <div className="h-64 bg-cover bg-center" 
                         style={{ backgroundImage: `url(${restaurant.cover_image_url})` }}>
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    </div>
                )}
                
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-start gap-6">
                        {restaurant.image_url && (
                            <img 
                                src={restaurant.image_url} 
                                alt={restaurant.name}
                                className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-lg"
                            />
                        )}
                        
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                            <p className="text-gray-600 mb-4">{restaurant.description}</p>
                            
                            <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                    <span className="font-semibold">{restaurant.rating}</span>
                                    <span className="text-gray-500">({restaurant.review_count} reviews)</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-5 h-5" />
                                    <span>{restaurant.avg_delivery_time} mins</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Truck className="w-5 h-5" />
                                    <span>{formatNaira(restaurant.delivery_fee)} delivery</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-gray-600">
                                    <MapPin className="w-5 h-5" />
                                    <span>{restaurant.address}</span>
                                </div>
                            </div>
                            
                            <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                            <p className="text-sm text-gray-500 mt-2">
                                Minimum order: {formatNaira(restaurant.min_order_amount)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="container mx-auto px-4 py-8">
                {/* Category Filter */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('all')}
                        >
                            All Items
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                {selectedCategory === 'all' ? (
                    // Show all items grouped by category
                    <div className="space-y-8">
                        {categories.map((category) => {
                            const categoryItems = groupedMenuItems[category.id] || [];
                            if (categoryItems.length === 0) return null;

                            return (
                                <div key={category.id}>
                                    <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                                    <p className="text-gray-600 mb-6">{category.description}</p>
                                    <div className="grid gap-4">
                                        {categoryItems.map((item) => (
                                            <MenuItemCard
                                                key={item.id}
                                                item={item}
                                                onAddToCart={handleAddToCart}
                                            />
                                        ))}
                                    </div>
                                    <Separator className="mt-8" />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Show filtered items
                    <div className="grid gap-4">
                        {filteredMenuItems.map((item) => (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}

                {filteredMenuItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No items available in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}