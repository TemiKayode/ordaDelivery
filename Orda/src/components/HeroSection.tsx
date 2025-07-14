import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Truck } from 'lucide-react';

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const popularSearches = [
        'Jollof Rice',
        'Suya',
        'Amala',
        'Pepper Soup',
        'Shawarma',
        'Pizza'
    ];

    return (
        <section className="relative bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Delicious Food
                        <span className="block text-accent">Delivered in Osogbo</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
                        Discover authentic Nigerian cuisine and international flavors from your favorite local restaurants
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                            <div className="flex-grow relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="Search for restaurants, dishes, or cuisines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 py-4 text-lg bg-white text-gray-900 border-0 focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg font-semibold"
                            >
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Popular Searches */}
                    <div className="mb-12">
                        <p className="text-white/80 mb-4">Popular searches:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {popularSearches.map((search) => (
                                <button
                                    key={search}
                                    onClick={() => {
                                        setSearchQuery(search);
                                        navigate(`/search?q=${encodeURIComponent(search)}`);
                                    }}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-colors"
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Local Restaurants</h3>
                            <p className="text-white/80 text-sm">
                                Discover the best local eateries in Osogbo and surrounding areas
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                            <p className="text-white/80 text-sm">
                                Quick and reliable delivery to your doorstep in 30 minutes or less
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
                            <p className="text-white/80 text-sm">
                                Track your order in real-time from kitchen to your door
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
    );
}