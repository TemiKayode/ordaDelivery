import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, Clock, Truck } from 'lucide-react';
import { RestaurantCard } from '@/components/RestaurantCard';

interface Restaurant {
    id: string;
    name: string;
    description: string;
    cuisine: string;
    image: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: number;
    isOpen: boolean;
}

const SearchResultsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        cuisine: '',
        rating: 0,
        deliveryTime: '',
        priceRange: ''
    });

    // Mock search results
    const mockResults: Restaurant[] = [
        {
            id: '1',
            name: 'Lagos Kitchen',
            description: 'Authentic Nigerian cuisine with modern twist',
            cuisine: 'Nigerian',
            image: '/placeholder.svg',
            rating: 4.5,
            reviewCount: 234,
            deliveryTime: '25-35 min',
            deliveryFee: 500,
            isOpen: true
        },
        {
            id: '2',
            name: 'Amala Spot',
            description: 'Traditional Yoruba dishes',
            cuisine: 'Yoruba',
            image: '/placeholder.svg',
            rating: 4.2,
            reviewCount: 156,
            deliveryTime: '30-40 min',
            deliveryFee: 300,
            isOpen: true
        }
    ];

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams]);

    const performSearch = async (query: string) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Filter mock results based on query
            const filtered = mockResults.filter(restaurant =>
                restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
                restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
            );

            setResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery });
            performSearch(searchQuery);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Search Results</h1>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search restaurants or cuisines..."
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="cursor-pointer">
                        <Filter className="h-3 w-3 mr-1" />
                        All Cuisines
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                        Nigerian
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                        Fast Food
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                        Under 30 min
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                        4+ Stars
                    </Badge>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center py-8">
                    <p>Searching for restaurants...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Found {results.length} restaurant{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {results.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            ) : searchQuery ? (
                <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                        Try searching for different keywords or check your spelling
                    </p>
                </div>
            ) : (
                <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Start searching</h3>
                    <p className="text-muted-foreground">
                        Enter a restaurant name or cuisine type to find great food options
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;