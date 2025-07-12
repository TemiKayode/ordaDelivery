
import React, { useState } from 'react';
import { Search, MapPin, Filter, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import CategorySection from './CategorySection';
import RestaurantCard from './RestaurantCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
  specialties: string[];
  distance: number;
  promotion?: string;
}

interface Dish {
  id: number;
  name: string;
  restaurant: string;
  price: number;
  image: string;
  rating: number;
  prepTime: string;
  category: string;
  description: string;
}

interface MobileSearchDiscoverTabsProps {
  restaurants: Restaurant[];
  dishes: Dish[];
  categories: Array<{ name: string; icon: string; count: number }>;
  selectedCategory: string | null;
  onCategoryClick: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  location: string;
}

const MobileSearchDiscoverTabs: React.FC<MobileSearchDiscoverTabsProps> = ({
  restaurants,
  dishes,
  categories,
  selectedCategory,
  onCategoryClick,
  searchQuery,
  onSearchChange,
  location
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');

  if (!isMobile) return null;

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? dish.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const handleRestaurantClick = (restaurantName: string) => {
    // Find the restaurant by name and navigate to its page
    const restaurant = restaurants.find(r => r.name.toLowerCase() === restaurantName.toLowerCase());
    if (restaurant) {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  return (
    <div className="md:hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg p-1 mb-6">
          <TabsTrigger 
            value="discover" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground transition-all"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger 
            value="search" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground transition-all"
          >
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Location Display */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Categories */}
          <CategorySection
            categories={categories}
            onCategoryClick={onCategoryClick}
            selectedCategory={selectedCategory}
          />

          {/* Restaurants Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {selectedCategory ? `${selectedCategory} Restaurants` : 'Popular Restaurants'}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {filteredRestaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </div>
          </section>

          {/* Popular Dishes */}
          {filteredDishes.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                {selectedCategory ? `${selectedCategory} Dishes` : 'Popular Dishes'}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {filteredDishes.slice(0, 8).map((dish) => (
                  <Card key={dish.id} className="border rounded-lg overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {dish.name}
                          </h4>
                          <p 
                            className="text-xs text-muted-foreground truncate cursor-pointer hover:text-accent transition-colors"
                            onClick={() => handleRestaurantClick(dish.restaurant)}
                          >
                            {dish.restaurant}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {dish.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-accent">
                              ₦{dish.price.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{dish.rating}</span>
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
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search restaurants, dishes, or cuisines..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryClick(null)}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryClick(category.name)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          {searchQuery ? (
            <div className="space-y-6">
              {/* Restaurant Results */}
              {filteredRestaurants.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Restaurants ({filteredRestaurants.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredRestaurants.map((restaurant) => (
                      <Card 
                        key={restaurant.id} 
                        className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                      >
                        <CardContent className="p-3">
                          <div className="flex space-x-3">
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm truncate">
                                {restaurant.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {restaurant.cuisine}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{restaurant.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{restaurant.deliveryTime}</span>
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

              {/* Dish Results */}
              {filteredDishes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Dishes ({filteredDishes.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {filteredDishes.map((dish) => (
                      <Card key={dish.id} className="border rounded-lg overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex space-x-3">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm truncate">
                                {dish.name}
                              </h4>
                              <p 
                                className="text-xs text-muted-foreground truncate cursor-pointer hover:text-accent transition-colors"
                                onClick={() => handleRestaurantClick(dish.restaurant)}
                              >
                                {dish.restaurant}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {dish.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-semibold text-accent">
                                  ₦{dish.price.toLocaleString()}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {dish.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* No Results */}
              {filteredRestaurants.length === 0 && filteredDishes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for something else or browse our categories
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Search for restaurants, dishes, or cuisines
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Find your favorite food in {location}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileSearchDiscoverTabs;
