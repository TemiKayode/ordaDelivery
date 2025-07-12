import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Truck, MapPin, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

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
  description?: string;
  address?: string;
  phone?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
  isAvailable: boolean;
  discount?: number;
}

const RestaurantDetail: React.FC = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRestaurant: Restaurant = {
      id: parseInt(restaurantId || '1'),
      name: "Embassy Restaurant",
      cuisine: "Continental",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      rating: 4.5,
      deliveryTime: "20-30 mins",
      deliveryFee: 500,
      isOpen: true,
      specialties: ["Continental", "Local Dishes", "Grills"],
      distance: 1.2,
      promotion: "10% off first order",
      description: "Experience authentic continental cuisine with a Nigerian twist. Fresh ingredients, bold flavors, and exceptional service.",
      address: "No. 15 Gbongan-Osogbo Road, Osogbo, Osun State",
      phone: "+234 803 123 4567"
    };

    const mockMenuItems: MenuItem[] = [
      // Nigerian Category
      {
        id: 1,
        name: "Jollof Rice Special",
        description: "Our signature jollof rice with chicken, beef, and prawns",
        price: 3500,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
        category: "Nigerian",
        rating: 4.8,
        prepTime: "25-30 mins",
        isAvailable: true,
        discount: 10
      },
      {
        id: 2,
        name: "Pepper Soup",
        description: "Spicy goat meat pepper soup with traditional spices",
        price: 2800,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
        category: "Nigerian",
        rating: 4.7,
        prepTime: "35-40 mins",
        isAvailable: true
      },
      {
        id: 3,
        name: "Fried Rice",
        description: "Colorful fried rice with vegetables and choice of protein",
        price: 3200,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
        category: "Nigerian",
        rating: 4.6,
        prepTime: "20-25 mins",
        isAvailable: true
      },
      // Continental Category
      {
        id: 4,
        name: "Grilled Chicken",
        description: "Perfectly seasoned grilled chicken with herb sauce",
        price: 4200,
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
        category: "Continental",
        rating: 4.9,
        prepTime: "30-35 mins",
        isAvailable: true
      },
      {
        id: 5,
        name: "Beef Steak",
        description: "Tender beef steak with mashed potatoes and vegetables",
        price: 6500,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
        category: "Continental",
        rating: 4.8,
        prepTime: "40-45 mins",
        isAvailable: true,
        discount: 15
      },
      {
        id: 6,
        name: "Fish and Chips",
        description: "Crispy battered fish with golden fries",
        price: 3800,
        image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400",
        category: "Continental",
        rating: 4.5,
        prepTime: "25-30 mins",
        isAvailable: true
      },
      // Drinks Category
      {
        id: 7,
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: 1200,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400",
        category: "Drinks",
        rating: 4.6,
        prepTime: "3-5 mins",
        isAvailable: true
      },
      {
        id: 8,
        name: "Chapman Cocktail",
        description: "Nigerian fruit cocktail with a refreshing twist",
        price: 1500,
        image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400",
        category: "Drinks",
        rating: 4.7,
        prepTime: "5-8 mins",
        isAvailable: true
      }
    ];

    setRestaurant(mockRestaurant);
    setMenuItems(mockMenuItems);
    setFilteredItems(mockMenuItems);
    setLoading(false);
  }, [restaurantId]);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  useEffect(() => {
    let filtered = menuItems;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery]);

  const handleAddToCart = (item: MenuItem) => {
    const finalPrice = item.discount 
      ? item.price - (item.price * item.discount / 100)
      : item.price;

    addItem({
      id: item.id.toString(),
      name: item.name,
      restaurant: restaurant?.name || '',
      price: finalPrice,
      image: item.image
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center">Restaurant not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onCartClick={() => {}}
        onAuthClick={() => navigate('/auth')}
        currentUser={user}
        profile={profile}
        onLogout={logout}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Restaurant Header */}
        <div className="bg-card rounded-xl overflow-hidden shadow-sm border mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg opacity-90">{restaurant.cuisine}</p>
            </div>
            {restaurant.isOpen && (
              <div className="absolute top-6 left-6">
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  Open Now
                </Badge>
              </div>
            )}
            {restaurant.promotion && (
              <div className="absolute top-6 right-6">
                <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {restaurant.promotion}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground mb-4">{restaurant.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">📞</span>
                    <span>{restaurant.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{restaurant.deliveryTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">₦{restaurant.deliveryFee}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Delivery Fee</p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Menu</h2>
            
            {/* Search */}
            <div className="relative max-w-sm">
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-sm">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        {item.discount && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-accent text-accent-foreground">
                              {item.discount}% OFF
                            </Badge>
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Unavailable</Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                {item.discount ? (
                                  <>
                                    <span className="font-bold text-accent">
                                      ₦{(item.price - (item.price * item.discount / 100)).toLocaleString()}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through">
                                      ₦{item.price.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-bold text-accent">
                                    ₦{item.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{item.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{item.prepTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.isAvailable}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No items found in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;