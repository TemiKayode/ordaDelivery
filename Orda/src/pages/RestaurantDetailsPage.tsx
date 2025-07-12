// src/pages/RestaurantDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Star, Truck } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter'; // Assuming this path
import { MenuItemCard } from '@/components/MenuItemCard'; // You'll need to create this component

// Define Restaurant and MenuItem interfaces (adjust to your schema)
interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    cuisine: string;
    image: string;
    coverImage?: string;
    rating: number;
    reviewCount: number;
    avgDeliveryTime: number; // in minutes
    deliveryFee: number;
    minOrderAmount: number;
    isOpen: boolean;
    phone: string;
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string; // e.g., "Main Dishes", "Sides", "Drinks"
    // Potentially: add_ons, customization_options
}

// Dummy MenuItemCard component for this example (you'll replace with your actual one)
const MenuItemCard: React.FC<{ item: MenuItem; onAddToCart: (item: MenuItem, quantity: number) => void }> = ({ item, onAddToCart }) => (
    <Card className="flex items-center p-3 border hover:shadow-md transition-shadow">
        {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />}
        <div className="flex-grow">
            <h3 className="font-semibold text-base">{item.name}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
            <p className="font-bold text-lg mt-1">{formatNaira(item.price)}</p>
        </div>
        <Button size="sm" onClick={() => onAddToCart(item, 1)}>Add</Button>
    </Card>
);

// Change `export const RestaurantDetailsPage` to `const RestaurantDetailsPage`
const RestaurantDetailsPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurantAndMenu = async () => {
            setLoading(true);
            // Simulate API call to fetch restaurant and its menu
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock Data (replace with actual Supabase fetches)
            if (restaurantId === 'mock1') {
                setRestaurant({
                    id: 'mock1',
                    name: 'The Jollof Spot',
                    description: 'Authentic Nigerian Jollof and local delicacies.',
                    address: '15 Adeola Odeku St, Victoria Island, Lagos',
                    cuisine: 'Nigerian',
                    image: '/placeholder/restaurant_jollof_spot.jpg',
                    coverImage: '/placeholder/jollof_cover.jpg',
                    rating: 4.7,
                    reviewCount: 325,
                    avgDeliveryTime: 35,
                    deliveryFee: 400,
                    minOrderAmount: 1000,
                    isOpen: true,
                    phone: '+2348011223344',
                });
                setMenu([
                    { id: 'item1', name: 'Jollof Rice with Grilled Chicken', description: 'Smoky Jollof rice served with tender grilled chicken.', price: 2500, category: 'Main Dishes', image: '/placeholder/jollof_chicken.jpg' },
                    { id: 'item2', name: 'Efo Riro with Pounded Yam', description: 'Rich spinach soup with assorted meats, served with pounded yam.', price: 3200, category: 'Main Dishes', image: '/placeholder/efo_riro.jpg' },
                    { id: 'item3', name: 'Suya Skewers (Beef)', description: 'Spicy grilled beef skewers, served with onions and tomatoes.', price: 1800, category: 'Sides', image: '/placeholder/suya.jpg' },
                    { id: 'item4', name: 'Chapman Drink', description: 'Refreshing Nigerian cocktail.', price: 700, category: 'Drinks' },
                ]);
            } else {
                setRestaurant(null); // Not found
                setMenu([]);
            }
            setLoading(false);
        };

        fetchRestaurantAndMenu();
    }, [restaurantId]);

    const handleAddToCart = (item: MenuItem, quantity: number) => {
        console.log(`Added ${quantity} of ${item.name} to cart.`);
        // Implement logic to add item to global cart state (e.g., using a context or Redux)
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-lg text-muted-foreground">Loading restaurant details...</p>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive mb-4">Restaurant Not Found</h1>
                <p className="text-muted-foreground">The restaurant you are looking for could not be found.</p>
                <Button asChild className="mt-6">
                    <Link to="/customer/dashboard">Back to Home</Link>
                </Button>
            </div>
        );
    }

    // Group menu items by category
    const categorizedMenu = menu.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-200 overflow-hidden">
                <img
                    src={restaurant.coverImage || restaurant.image}
                    alt={`Cover image for ${restaurant.name}`}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="container mx-auto p-4 md:p-6 lg:p-8 -mt-16 sm:-mt-24 relative z-10"> {/* Pull content up */}
                {/* Restaurant Header Card */}
                <Card className="p-6 border shadow-lg bg-background">
                    <div className="flex items-start mb-4">
                        <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md shadow-md mr-6"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{restaurant.name}</h1>
                            <p className="text-muted-foreground text-sm mt-1">{restaurant.cuisine} • {restaurant.address}</p>
                            <div className="flex items-center space-x-2 text-sm mt-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{restaurant.rating} ({restaurant.reviewCount} reviews)</span>
                                <Separator orientation="vertical" className="h-4" />
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{restaurant.avgDeliveryTime}-{restaurant.avgDeliveryTime + 15} mins</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm mt-1 text-muted-foreground">
                                <Truck className="h-4 w-4" />
                                <span>Delivery Fee: {formatNaira(restaurant.deliveryFee)}</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>Min. Order: {formatNaira(restaurant.minOrderAmount)}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{restaurant.description}</p>
                    {!restaurant.isOpen && (
                        <Badge variant="destructive" className="mt-4">Currently Closed</Badge>
                    )}
                </Card>

                {/* Menu Sections */}
                <div className="mt-8 space-y-8">
                    {Object.keys(categorizedMenu).map((category) => (
                        <section key={category}>
                            <h2 className="text-2xl font-bold text-foreground mb-4">{category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categorizedMenu[category].map((item) => (
                                    <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
            {/* Fixed bottom cart/checkout button for mobile */}
            {/* You'd have your CartSidebar or a fixed button here that shows cart items/total */}
            <CardFooter className="fixed bottom-0 left-0 w-full bg-background border-t p-4 z-50 shadow-lg flex justify-between items-center md:hidden">
                <span className="text-lg font-semibold">Total: {formatNaira(menu.reduce((sum, item) => sum + item.price, 0))}</span> {/* Placeholder total */}
                <Button>View Cart</Button>
            </CardFooter>
        </div>
    );
};

export default RestaurantDetailsPage; // <<< Add this line at the very end of the file