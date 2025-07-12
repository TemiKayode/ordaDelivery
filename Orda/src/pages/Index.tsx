import { useState, useEffect } from 'react';
import { MapPin, Search, Star, Clock, Truck, ShoppingCart, Percent, Navigation as NavigationIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import RestaurantCard from '@/components/RestaurantCard';
import CategorySection from '@/components/CategorySection';
import LocationBanner from '@/components/LocationBanner';
import PromotionalBanner from '@/components/PromotionalBanner';
import ExploreSection from '@/components/ExploreSection';
import FeaturedDeals from '@/components/FeaturedDeals';
import SearchTab from '@/components/SearchTab';
import CartSidebar from '@/components/CartSidebar';
import AuthModal from '@/components/auth/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import GetStartedModal from '@/components/GetStartedModal';
import MobileSearchDiscoverTabs from '@/components/MobileSearchDiscoverTabs';
import { UserDashboardHero } from '@/components/UserDashboardHero';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Index = () => {
    const [location, setLocation] = useState<string>('Detecting location...');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [userCoordinates, setUserCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const { user, profile, logout, isAdmin } = useAuth();
    const { items: cartItems, getTotalPrice, getDeliveryFee } = useCart();

    // Check for first-time mobile user
    useEffect(() => {
        const isFirstTime = !localStorage.getItem('orda_first_visit');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isFirstTime && isMobile) {
            setIsGetStartedOpen(true);
            localStorage.setItem('orda_first_visit', 'true');
        }
    }, []);

    // Auto-detect user location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserCoordinates({ lat: latitude, lng: longitude });

                    // Check if user is in Osogbo area
                    const osogboLat = 7.7840;
                    const osogboLng = 4.5405;
                    const distance = Math.sqrt(
                        Math.pow(latitude - osogboLat, 2) + Math.pow(longitude - osogboLng, 2)
                    );

                    if (distance < 0.1) { // Roughly 10km radius
                        setLocation('Osogbo, Osun State');
                    } else {
                        setLocation('Osogbo, Osun State'); // Fallback
                    }
                },
                (error) => {
                    console.log('Location access denied:', error);
                    setLocation('Osogbo, Osun State'); // Default to Osogbo
                }
            );
        }
    }, []);

    // Osogbo restaurants data (Updated)
    const osogboRestaurants = [
        {
            id: 1,
            name: "Embassy Restaurant",
            cuisine: "Continental",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
            rating: 4.5,
            deliveryTime: "20-30 mins",
            deliveryFee: 500,
            isOpen: true,
            specialties: ["Continental", "Local Dishes", "Grills"],
            distance: 1.2,
            promotion: "10% off first order"
        },
        {
            id: 2,
            name: "Alhaja Food Canteen",
            cuisine: "Local (Yoruba)",
            image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
            rating: 4.3,
            deliveryTime: "15-25 mins",
            deliveryFee: 400,
            isOpen: true,
            specialties: ["Amala", "Gbegiri", "Ewedu"],
            distance: 0.8
        },
        {
            id: 3,
            name: "Stomach Care",
            cuisine: "Nigerian",
            image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
            rating: 4.4,
            deliveryTime: "20-30 mins",
            deliveryFee: 450,
            isOpen: true,
            specialties: ["Jollof Rice", "Fried Rice", "Chicken"],
            distance: 1.5,
            promotion: "Free delivery on orders above ₦5000"
        },
        {
            id: 4,
            name: "Amazing Taste Delicacies",
            cuisine: "African Fusion",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
            rating: 4.6,
            deliveryTime: "25-35 mins",
            deliveryFee: 550,
            isOpen: true,
            specialties: ["Fusion Dishes", "Local Delicacies"],
            distance: 2.1
        },
        {
            id: 5,
            name: "BT Barbecue",
            cuisine: "Barbecue",
            image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
            rating: 4.7,
            deliveryTime: "15-20 mins",
            deliveryFee: 500,
            isOpen: true,
            specialties: ["Suya", "Grilled Chicken", "Barbecue"],
            distance: 0.9,
            promotion: "Buy 1 get 1 half price on suya"
        },
        {
            id: 6,
            name: "Shawarma & Co",
            cuisine: "Fast Food",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
            rating: 4.2,
            deliveryTime: "10-15 mins",
            deliveryFee: 300,
            isOpen: true,
            specialties: ["Shawarma", "Burgers", "Fries"],
            distance: 1.1
        },
        {
            id: 7,
            name: "BET Ofada & More",
            cuisine: "Yoruba Traditional",
            image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
            rating: 4.5,
            deliveryTime: "20-25 mins",
            deliveryFee: 450,
            isOpen: true,
            specialties: ["Ofada Rice", "Traditional Stews"],
            distance: 1.8,
            promotion: "Free drink with combo meal"
        },
        {
            id: 8,
            name: "Elysium Restaurant",
            cuisine: "Continental",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
            rating: 4.8,
            deliveryTime: "20-30 mins",
            deliveryFee: 600,
            isOpen: true,
            specialties: ["Continental Cuisine", "Fine Dining"],
            distance: 2.3
        },
        {
            id: 9,
            name: "Crispy Treat Cafe",
            cuisine: "Bakery & Cafe",
            image: "https://images.unsplash.com/photo-1559920117-76b92f0f29f0?w=400",
            rating: 4.0,
            deliveryTime: "15-20 mins",
            deliveryFee: 350,
            isOpen: true,
            specialties: ["Pastries", "Coffee", "Snacks"],
            distance: 0.7
        },
        {
            id: 10,
            name: "Chicken Republic",
            cuisine: "Fast Food",
            image: "https://images.unsplash.com/photo-1626082928096-7c9c0b1e4c7e?w=400",
            rating: 4.1,
            deliveryTime: "15-25 mins",
            deliveryFee: 400,
            isOpen: true,
            specialties: ["Fried Chicken", "Rice & Sides", "Burgers"],
            distance: 1.0,
            promotion: "20% off on Tuesdays"
        }
    ];

    // Nigerian Food Catalog - Each restaurant has 10 dishes + drinks
    const nigerianFoodCatalog = [
        // Mama Ngozi Kitchen - Traditional Nigerian
        { id: 1, name: 'Jollof Rice', restaurant: 'Mama Ngozi Kitchen', price: 2500, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', rating: 4.8, prepTime: '25-30 mins', category: 'Nigerian', description: 'Spicy rice cooked in tomato sauce with chicken' },
        { id: 2, name: 'Pounded Yam & Egusi', restaurant: 'Mama Ngozi Kitchen', price: 3000, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', rating: 4.7, prepTime: '30-35 mins', category: 'Swallow', description: 'Traditional pounded yam with melon seed soup' },
        { id: 3, name: 'Fried Rice', restaurant: 'Mama Ngozi Kitchen', price: 2800, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', rating: 4.6, prepTime: '20-25 mins', category: 'Nigerian', description: 'Colorful fried rice with vegetables and protein' },
        { id: 4, name: 'Amala & Ewedu', restaurant: 'Mama Ngozi Kitchen', price: 2200, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', rating: 4.5, prepTime: '25-30 mins', category: 'Swallow', description: 'Yam flour with jute leaf soup' },
        { id: 5, name: 'Pepper Soup', restaurant: 'Mama Ngozi Kitchen', price: 3500, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', rating: 4.9, prepTime: '35-40 mins', category: 'Nigerian', description: 'Spicy goat meat pepper soup' },
        { id: 6, name: 'Moi Moi', restaurant: 'Mama Ngozi Kitchen', price: 1500, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', rating: 4.4, prepTime: '40-45 mins', category: 'Nigerian', description: 'Steamed bean pudding with egg and fish' },
        { id: 7, name: 'Suya', restaurant: 'Mama Ngozi Kitchen', price: 2000, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', rating: 4.8, prepTime: '15-20 mins', category: 'Suya & Grills', description: 'Grilled spiced beef skewers' },
        { id: 8, name: 'Ofada Rice & Stew', restaurant: 'Mama Ngozi Kitchen', price: 2700, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', rating: 4.6, prepTime: '30-35 mins', category: 'Nigerian', description: 'Local rice with spicy pepper stew' },
        { id: 9, name: 'Akara & Bread', restaurant: 'Mama Ngozi Kitchen', price: 1200, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', rating: 4.3, prepTime: '10-15 mins', category: 'Nigerian', description: 'Bean fritters with fresh bread' },
        { id: 10, name: 'Plantain & Beans', restaurant: 'Mama Ngozi Kitchen', price: 1800, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', rating: 4.5, prepTime: '25-30 mins', category: 'Nigerian', description: 'Fried plantain with beans porridge' },

        // Drinks for Mama Ngozi Kitchen
        { id: 11, name: 'Zobo Drink', restaurant: 'Mama Ngozi Kitchen', price: 800, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.4, prepTime: '5 mins', category: 'Drinks', description: 'Refreshing hibiscus drink with ginger' },
        { id: 12, name: 'Chapman', restaurant: 'Mama Ngozi Kitchen', price: 1200, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400', rating: 4.6, prepTime: '5 mins', category: 'Drinks', description: 'Nigerian fruit cocktail' },
        { id: 13, name: 'Fresh Orange Juice', restaurant: 'Mama Ngozi Kitchen', price: 900, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', rating: 4.7, prepTime: '3 mins', category: 'Drinks', description: 'Freshly squeezed orange juice' },
        { id: 14, name: 'Kunu Drink', restaurant: 'Mama Ngozi Kitchen', price: 600, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.3, prepTime: '5 mins', category: 'Drinks', description: 'Millet-based traditional drink' },
        { id: 15, name: 'Tiger Nut Drink', restaurant: 'Mama Ngozi Kitchen', price: 700, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.5, prepTime: '5 mins', category: 'Drinks', description: 'Creamy tiger nut milk' },

        // Abuja Delights - Northern Nigerian Cuisine
        { id: 16, name: 'Tuwo Shinkafa', restaurant: 'Abuja Delights', price: 2800, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', rating: 4.7, prepTime: '35-40 mins', category: 'Swallow', description: 'Northern rice meal with miyan kuka' },
        { id: 17, name: 'Masa', restaurant: 'Abuja Delights', price: 1500, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', rating: 4.4, prepTime: '20-25 mins', category: 'Nigerian', description: 'Rice cakes with pepper sauce' },
        { id: 18, name: 'Dambu Nama', restaurant: 'Abuja Delights', price: 3200, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', rating: 4.8, prepTime: '25-30 mins', category: 'Nigerian', description: 'Shredded meat delicacy' },
        { id: 19, name: 'Kilishi', restaurant: 'Abuja Delights', price: 2500, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', rating: 4.9, prepTime: '0 mins', category: 'Suya & Grills', description: 'Spiced dried meat' },
        { id: 20, name: 'Fura da Nono', restaurant: 'Abuja Delights', price: 1200, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.3, prepTime: '10 mins', category: 'Drinks', description: 'Millet balls with fresh milk' },
        { id: 21, name: 'Miyan Kubewa', restaurant: 'Abuja Delights', price: 2600, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', rating: 4.6, prepTime: '30-35 mins', category: 'Swallow', description: 'Okra soup with meat' },
        { id: 22, name: 'Kosai', restaurant: 'Abuja Delights', price: 1000, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', rating: 4.2, prepTime: '15-20 mins', category: 'Nigerian', description: 'Bean cakes' },
        { id: 23, name: 'Gwate', restaurant: 'Abuja Delights', price: 1300, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', rating: 4.4, prepTime: '20-25 mins', category: 'Nigerian', description: 'Bean and corn cake' },
        { id: 24, name: 'Dan Wake', restaurant: 'Abuja Delights', price: 1800, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', rating: 4.5, prepTime: '25-30 mins', category: 'Nigerian', description: 'Steamed bean dumpling' },
        { id: 25, name: 'Tsire', restaurant: 'Abuja Delights', price: 2200, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', rating: 4.8, prepTime: '15-20 mins', category: 'Suya & Grills', description: 'Grilled meat on sticks' },

        // Drinks for Abuja Delights
        { id: 26, name: 'Fura Drink', restaurant: 'Abuja Delights', price: 700, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.5, prepTime: '5 mins', category: 'Drinks', description: 'Millet-based energy drink' },
        { id: 27, name: 'Kunun Aya', restaurant: 'Abuja Delights', price: 800, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.4, prepTime: '5 mins', category: 'Drinks', description: 'Tiger nut milk drink' },
        { id: 28, name: 'Tamarind Drink', restaurant: 'Abuja Delights', price: 600, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.3, prepTime: '5 mins', category: 'Drinks', description: 'Sweet and sour tamarind juice' },
        { id: 29, name: 'Ginger Drink', restaurant: 'Abuja Delights', price: 500, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.6, prepTime: '5 mins', category: 'Drinks', description: 'Spicy ginger beverage' },
        { id: 30, name: 'Watermelon Juice', restaurant: 'Abuja Delights', price: 800, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', rating: 4.4, prepTime: '3 mins', category: 'Drinks', description: 'Fresh watermelon juice' },

        // Calabar Kitchen - Cross River Delicacies
        { id: 31, name: 'Afang Soup', restaurant: 'Calabar Kitchen', price: 3500, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', rating: 4.9, prepTime: '45-50 mins', category: 'Swallow', description: 'Traditional Cross River soup with vegetables' },
        { id: 32, name: 'Edikang Ikong', restaurant: 'Calabar Kitchen', price: 3200, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', rating: 4.8, prepTime: '40-45 mins', category: 'Swallow', description: 'Nutritious vegetable soup' },
        { id: 33, name: 'Fisherman Soup', restaurant: 'Calabar Kitchen', price: 4000, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', rating: 4.9, prepTime: '35-40 mins', category: 'Nigerian', description: 'Fresh fish pepper soup' },
        { id: 34, name: 'Coconut Rice', restaurant: 'Calabar Kitchen', price: 2800, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', rating: 4.6, prepTime: '25-30 mins', category: 'Nigerian', description: 'Rice cooked in coconut milk' },
        { id: 35, name: 'Ekpang Nkukwo', restaurant: 'Calabar Kitchen', price: 3000, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', rating: 4.7, prepTime: '50-55 mins', category: 'Nigerian', description: 'Cocoyam and plantain porridge' },
        { id: 36, name: 'Abacha', restaurant: 'Calabar Kitchen', price: 2500, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', rating: 4.5, prepTime: '20-25 mins', category: 'Nigerian', description: 'African salad with palm oil dressing' },
        { id: 37, name: 'Nkwobi', restaurant: 'Calabar Kitchen', price: 3800, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', rating: 4.8, prepTime: '60-65 mins', category: 'Nigerian', description: 'Spiced cow foot delicacy' },
        { id: 38, name: 'Ukwa', restaurant: 'Calabar Kitchen', price: 2200, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', rating: 4.4, prepTime: '45-50 mins', category: 'Nigerian', description: 'Breadfruit porridge' },
        { id: 39, name: 'Pepper Soup (Fish)', restaurant: 'Calabar Kitchen', price: 3500, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', rating: 4.9, prepTime: '30-35 mins', category: 'Nigerian', description: 'Spicy catfish pepper soup' },
        { id: 40, name: 'Oha Soup', restaurant: 'Calabar Kitchen', price: 3300, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', rating: 4.7, prepTime: '40-45 mins', category: 'Swallow', description: 'Traditional soup with oha leaves' },

        // Drinks for Calabar Kitchen
        { id: 41, name: 'Coconut Water', restaurant: 'Calabar Kitchen', price: 800, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', rating: 4.6, prepTime: '0 mins', category: 'Drinks', description: 'Fresh coconut water' },
        { id: 42, name: 'Soursop Juice', restaurant: 'Calabar Kitchen', price: 1200, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', rating: 4.8, prepTime: '5 mins', category: 'Drinks', description: 'Creamy soursop fruit juice' },
        { id: 43, name: 'Cashew Juice', restaurant: 'Calabar Kitchen', price: 1000, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', rating: 4.5, prepTime: '5 mins', category: 'Drinks', description: 'Fresh cashew fruit juice' },
        { id: 44, name: 'Lime Juice', restaurant: 'Calabar Kitchen', price: 700, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', rating: 4.7, prepTime: '3 mins', category: 'Drinks', description: 'Fresh lime juice' },
        { id: 45, name: 'Guava Juice', restaurant: 'Calabar Kitchen', price: 1100, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', rating: 4.4, prepTime: '5 mins', category: 'Drinks', description: 'Sweet guava fruit juice' }
    ];

    const trendingDishes = nigerianFoodCatalog.slice(0, 15); // Show first 15 as trending

    const categories = [
        { name: 'Nigerian', icon: '🍛', count: 120 },
        { name: 'Continental', icon: '🍝', count: 45 },
        { name: 'Fast Food', icon: '🍔', count: 68 },
        { name: 'Suya & Grills', icon: '🥩', count: 32 },
        { name: 'Swallow', icon: '🥣', count: 89 },
        { name: 'Drinks', icon: '🥤', count: 156 },
    ];

    const filteredDishes = selectedCategory
        ? trendingDishes.filter(dish => dish.category === selectedCategory)
        : trendingDishes;

    const cartTotal = getTotalPrice() + getDeliveryFee();

    return (
        <div className="min-h-screen bg-background">
            <Navigation
                onCartClick={() => setIsCartOpen(true)}
                onAuthClick={() => setIsAuthOpen(true)}
                currentUser={user}
                profile={profile}
                onLogout={logout}
                isAdmin={isAdmin}
            />

            {/* Hero Section - Different for signed in users */}
            {user && profile ? (
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <UserDashboardHero
                        restaurants={osogboRestaurants}
                        location={location}
                        userCoordinates={userCoordinates}
                        userName={profile.display_name || 'User'}
                    />
                </div>
            ) : (
                <div className="bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <LocationBanner location={location} onLocationChange={setLocation} />

                        <div className="mt-8 text-center">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Delicious food,<br />delivered to your door
                            </h1>
                            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                                Discover the best restaurants in {location.split(',')[0]}.
                                Fresh ingredients, authentic flavors, fast delivery.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-md mx-auto">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Search for restaurants or dishes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 py-6 text-lg bg-white text-gray-900 border-0 rounded-2xl shadow-lg"
                                />
                            </div>

                            {/* Delivery Animation */}
                            <div className="mt-8 flex items-center justify-center space-x-4">
                                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <Truck className="h-5 w-5 animate-pulse" />
                                    <span className="text-sm">Delivering now...</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <Clock className="h-5 w-5" />
                                    <span className="text-sm">25 mins avg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Search & Discover Tabs */}
            <MobileSearchDiscoverTabs
                restaurants={osogboRestaurants}
                dishes={nigerianFoodCatalog}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryClick={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                location={location}
            />

            {/* Desktop Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 hidden md:block">
                {/* Promotional Banner */}
                <PromotionalBanner />

                {/* Categories */}
                <CategorySection
                    categories={categories}
                    onCategoryClick={setSelectedCategory}
                    selectedCategory={selectedCategory}
                />

                {/* Featured Deals */}
                <FeaturedDeals />

                {/* Top Restaurants in Osogbo */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Top Restaurants in Osogbo</h2>
                        <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
                            View All
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {osogboRestaurants.slice(0, 6).map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </section>

                {/* Explore Section */}
                <ExploreSection userCoordinates={userCoordinates} />

                {/* Search Tab - Full Nigerian Food Catalog */}
                <SearchTab dishes={nigerianFoodCatalog} />
            </div>

            {/* Modals */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCheckout={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                }}
            />

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartItems={cartItems}
                total={cartTotal}
            />

            <GetStartedModal
                isOpen={isGetStartedOpen}
                onClose={() => setIsGetStartedOpen(false)}
            />
        </div>
    );
};

export default Index;