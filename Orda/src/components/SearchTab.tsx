import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Plus, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';

interface Dish {
  id: number;
  name: string;
  restaurant: string;
  price: number;
  image: string;
  rating: number;
  prepTime: string;
  category: string;
  description?: string;
}

interface SearchTabProps {
  dishes: Dish[];
}

const SearchTab: React.FC<SearchTabProps> = ({ dishes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [filterCategory, setFilterCategory] = useState('all');
  const { addItem } = useCart();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(dishes.map(dish => dish.category))];
    return cats;
  }, [dishes]);

  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    let filtered = dishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dish.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || dish.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort dishes
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'prep-time':
        filtered.sort((a, b) => {
          const timeA = parseInt(a.prepTime.split('-')[0]);
          const timeB = parseInt(b.prepTime.split('-')[0]);
          return timeA - timeB;
        });
        break;
      default: // popularity
        break;
    }

    return filtered;
  }, [dishes, searchQuery, sortBy, filterCategory]);

  const handleAddToCart = (dish: Dish) => {
    addItem({
      id: dish.id.toString(),
      name: dish.name,
      restaurant: dish.restaurant,
      price: dish.price,
      image: dish.image
    });
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#102542]">Search & Discover</h2>
        <Badge variant="secondary" className="bg-[#E94057]/10 text-[#E94057]">
          {filteredDishes.length} results
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for dishes, restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 text-lg border-2 border-gray-200 focus:border-[#E94057] rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="prep-time">Fastest Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <Card
              key={dish.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border-0 shadow-sm"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                    {dish.category}
                  </Badge>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{dish.rating}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Dish Info */}
                  <div>
                    <h3 className="font-semibold text-lg text-[#102542] group-hover:text-[#E94057] transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{dish.restaurant}</p>
                    {dish.description && (
                      <p className="text-gray-500 text-xs mt-1">{dish.description}</p>
                    )}
                  </div>

                  {/* Price and Time */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#E94057]">
                      ₦{dish.price.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-600 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{dish.prepTime}</span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    className="w-full bg-[#E94057] hover:bg-[#E94057]/90 text-white transition-colors group"
                    onClick={() => handleAddToCart(dish)}
                  >
                    <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No dishes found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </section>
  );
};

export default SearchTab;