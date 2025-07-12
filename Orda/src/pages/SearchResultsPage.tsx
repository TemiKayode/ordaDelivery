// src/pages/SearchResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // To get search query from URL
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard'; // This import was already corrected, good!

// Define Restaurant interface (must match your data)
interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    image: string;
    cuisine: string;
    deliveryFee: number;
    minOrderAmount: number;
    avgDeliveryTime: number;
    rating: number;
    reviewCount: number;
    isOpen: boolean;
    distance: number;
    deliveryTime: string;
}

// Change `export const SearchResultsPage` to `const SearchResultsPage`
const SearchResultsPage: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Restaurant[]>([]);
    const [filters, setFilters] = useState({}); // Placeholder for filter state

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            // Simulate API call to search for restaurants
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock Data (replace with actual search API call)
            const mockRestaurants: Restaurant[] = [
                { id: 'r1', name: 'Local Chops', description: 'Authentic Nigerian street food.', address: '123 Lagos St', image: '/placeholder/local_chops.jpg', cuisine: 'Nigerian', deliveryFee: 300, minOrderAmount: 800, avgDeliveryTime: 25, rating: 4.5, reviewCount: 150, isOpen: true, distance: 1.2, deliveryTime: '25-35 mins' },
                { id: 'r2', name: 'Mama Put Deluxe', description: 'Best local dishes in town.', address: '456 Ikeja Rd', image: '/placeholder/mamaput.jpg', cuisine: 'Nigerian', deliveryFee: 500, minOrderAmount: 1200, avgDeliveryTime: 40, rating: 4.2, reviewCount: 200, isOpen: true, distance: 3.5, deliveryTime: '40-50 mins' },
                { id: 'r3', name: 'Pizza Zone', description: 'Freshly baked pizzas for everyone.', address: '789 Victoria Island', image: '/placeholder/pizza_zone.jpg', cuisine: 'Fast Food', deliveryFee: 600, minOrderAmount: 1500, avgDeliveryTime: 30, rating: 4.8, reviewCount: 500, isOpen: true, distance: 2.1, deliveryTime: '30-40 mins' },
            ];

            const filteredResults = mockRestaurants.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setResults(filteredResults);
            setLoading(false);
        };

        if (searchQuery) {
            performSearch();
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [searchQuery, filters]); // Re-run search if query or filters change

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This will naturally trigger the useEffect due to searchQuery change
        // You might also push to history here to update the URL
        // navigate(`/search?q=${searchQuery}`);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Search Results</h1>

            {/* Search Input and Filter Button */}
            <form onSubmit={handleSearchSubmit} className="flex space-x-2 mb-6">
                <div className="relative flex-grow">
                    <Input
                        type="text"
                        placeholder="Search for restaurants or dishes..."
                        className="w-full pl-10 pr-4 py-3 rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <Button variant="outline" size="lg" className="rounded-full">
                    <SlidersHorizontal className="h-5 w-5 mr-2" /> Filters
                </Button>
            </form>

            {loading ? (
                <p className="text-center text-lg text-muted-foreground">Searching...</p>
            ) : results.length === 0 ? (
                <div className="text-center p-8">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-xl font-semibold text-foreground">No results found</p>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage; // <<< Add this line at the very end of the file