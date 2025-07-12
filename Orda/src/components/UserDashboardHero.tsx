// /src/components/UserDashboardHero.tsx

import React from 'react';
import { Clock, Star, Truck, Search, MapPin } from 'lucide-react'; // Added Search and MapPin icons
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RestaurantCard from './RestaurantCard'; // Assuming RestaurantCard is in the same directory

// --- Type Definitions ---
// These interfaces should ideally live in a shared types file (e.g., src/types.ts)
// for better organization and reusability across your application.

interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    image: string; // URL for the restaurant's main image
    coverImage?: string; // Optional URL for a cover image
    cuisine: string; // e.g., "Nigerian", "Intercontinental", "Fast Food"
    deliveryFee: number;
    minOrderAmount: number;
    avgDeliveryTime: number; // In minutes, for calculation purposes
    rating: number; // Average rating (e.g., 4.5)
    reviewCount: number; // Number of reviews
    isOpen: boolean; // True if the restaurant is currently open
    distance: number; // Distance from user in kilometers
    deliveryTime: string; // Display string, e.g., "30-45 mins" - could be derived from avgDeliveryTime
    // Add other properties that exist in your actual restaurant data (e.g., categories, promotions)
}

export interface UserDashboardHeroProps {
    restaurants: Restaurant[];
    location: string; // Current delivery location, e.g., "Osogbo"
    userCoordinates: { latitude: number; longitude: number } | null; // User's current coordinates
    userName: string; // Full name of the logged-in user
    onLocationChange?: () => void; // Callback for when user wants to change location
    onSearch?: (query: string) => void; // Callback for when user performs a search
}

// --- UserDashboardHero Component ---

export const UserDashboardHero: React.FC<UserDashboardHeroProps> = ({
    restaurants,
    location,
    userName,
    onLocationChange,
    onSearch,
}) => {
    // Extract first name for the welcome message, defaulting to 'Guest'
    const firstName = userName ? userName.split(' ')[0] : 'Guest';

    // --- Restaurant Filtering and Sorting Logic ---
    // Featured Restaurants: Open, sorted by rating then distance, top 6
    const featuredRestaurants = restaurants
        .filter(r => r.isOpen)
        .sort((a, b) => b.rating - a.rating || a.distance - b.distance)
        .slice(0, 6);

    // Nearby Restaurants: Open, within 2km, sorted by distance, top 4
    const nearbyRestaurants = restaurants
        .filter(r => r.isOpen && r.distance <= 2)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);

    // Calculate average rating safely, formatted to one decimal place
    const totalRating = restaurants.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = restaurants.length > 0 ? (totalRating / restaurants.length).toFixed(1) : 'N/A';

    // State for search input (if handling search within the component)
    const [searchQuery, setSearchQuery] = React.useState('');

    // Handle search input change
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Handle search submission (e.g., on Enter key press)
    const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onSearch) {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6"> {/* Added padding for better spacing */}
            {/* --- Top Section: Welcome, Location & Search --- */}
            <div className="space-y-5">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border shadow-sm">
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Welcome back, {firstName}! 👋
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-1 cursor-pointer" onClick={onLocationChange}>
                            <MapPin className="h-4 w-4 text-primary" /> Delivering to:
                            <span className="font-medium text-primary hover:underline transition-colors">
                                {location}
                            </span>
                            {/* This span can be made a button for better accessibility */}
                        </p>
                    </div>
                </div>

                {/* Search Bar - Prominently Placed */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for restaurants or dishes..."
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyDown={handleSearchSubmit}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            {/* --- Quick Stats/Highlights --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary"> {/* Changed accent to primary for stats */}
                                {restaurants.filter(r => r.isOpen).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Available Now</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">
                                {nearbyRestaurants.length}
                            </div>
                            <p className="text-xs text-muted-foreground">Within 2km</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">
                                {avgRating} <Star className="inline-block h-5 w-5 fill-yellow-400 text-yellow-400 -mt-1" /> {/* Added star icon */}
                            </div>
                            <p className="text-xs text-muted-foreground">Avg Rating</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Featured Restaurants Section --- */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Top Restaurants</h2>
                    <Badge variant="secondary" className="text-sm">
                        {featuredRestaurants.length} available
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Consider adding skeleton loaders here while restaurants are loading */}
                    {featuredRestaurants.length > 0 ? (
                        featuredRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full text-center py-8">
                            No top restaurants available right now. Check back soon!
                        </p>
                    )}
                </div>
            </section>

            {/* --- Nearby Quick Options Section --- */}
            {nearbyRestaurants.length > 0 && (
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <Truck className="h-5 w-5 text-primary" /> {/* Changed accent to primary */}
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Quick Delivery</h2>
                        <Badge variant="outline" className="text-sm">
                            Under 2km
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {nearbyRestaurants.map((restaurant) => (
                            <Card
                                key={restaurant.id}
                                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" // Enhanced shadow on hover
                            >
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        <img
                                            src={restaurant.image}
                                            alt={restaurant.name}
                                            className="w-full h-24 sm:h-28 object-cover rounded-md" // Slightly larger image height
                                        />
                                        <div>
                                            <h4 className="font-medium text-sm text-foreground truncate">
                                                {restaurant.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {restaurant.cuisine}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs font-medium">{restaurant.rating}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span className="text-xs">{restaurant.deliveryTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* --- Future Sections (Ideas for Uber Eats Feel) --- */}
            {/* You could add more sections here based on your data: */}
            {/* <section className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <CategoryCard name="Nigerian" icon={<img src="/icons/nigerian.png" alt="Nigerian food" />} />
          <CategoryCard name="Fast Food" icon={<Burger className="h-6 w-6" />} />
          <CategoryCard name="Pizza" icon={<Pizza className="h-6 w-6" />} />
          <CategoryCard name="Healthy" icon={<Leaf className="h-6 w-6" />} />
        </div>
      </section> */}

            {/* <section className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Deals & Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DealCard title="20% off your first order!" description="Use code ORDA20" image="/images/deal1.jpg" />
          <DealCard title="Free delivery on orders over ₦5000" description="Limited time offer" image="/images/deal2.jpg" />
        </div>
      </section> */}

        </div>
    );
};