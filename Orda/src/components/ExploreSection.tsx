import React from 'react';
import { MapPin, Navigation as NavigationIcon, Store, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExploreSectionProps {
  userCoordinates: { lat: number; lng: number } | null;
}

const ExploreSection: React.FC<ExploreSectionProps> = ({ userCoordinates }) => {
  const nearbyOptions = [
    {
      id: 1,
      title: "Restaurants Near You",
      description: "Discover local favorites within 2km",
      icon: <Store className="h-6 w-6" />,
      count: 15,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Fast Food Joints",
      description: "Quick bites under 15 minutes",
      icon: <Utensils className="h-6 w-6" />,
      count: 8,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 3,
      title: "Traditional Cuisine",
      description: "Authentic local dishes",
      icon: <MapPin className="h-6 w-6" />,
      count: 12,
      color: "from-green-500 to-green-600"
    }
  ];

  const exploreAreas = [
    { name: "Oke-Fia", restaurants: 23, distance: 1.2 },
    { name: "Alekuwodo", restaurants: 18, distance: 2.1 },
    { name: "Old Garage", restaurants: 15, distance: 1.8 },
    { name: "Lameco", restaurants: 12, distance: 2.5 }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Explore Osogbo</h2>
        <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
          <NavigationIcon className="h-4 w-4 mr-2" />
          View Map
        </Button>
      </div>

      {/* Quick Explore Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {nearbyOptions.map((option) => (
          <Card
            key={option.id}
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border-0 shadow-sm"
          >
            <div className={`bg-gradient-to-r ${option.color} p-1`}>
              <CardContent className="bg-white m-1 rounded-sm p-4">
                <div className="flex items-center space-x-4">
                  <div className={`bg-gradient-to-r ${option.color} text-white p-3 rounded-xl`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {option.description}
                    </p>
                    <div className="mt-2">
                      <Badge 
                        variant="secondary"
                        className={`bg-gradient-to-r ${option.color} text-white border-0`}
                      >
                        {option.count} options
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Popular Areas */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Popular Areas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {exploreAreas.map((area) => (
            <Card
              key={area.name}
              className="cursor-pointer transition-all duration-300 hover:shadow-md hover:border-accent/20 border-2 border-transparent"
            >
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">{area.name}</h4>
                  <p className="text-sm text-gray-600">
                    {area.restaurants} restaurants
                  </p>
                  <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{area.distance} km away</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Location Info */}
      {userCoordinates && (
        <div className="mt-6 p-4 bg-accent/5 rounded-xl border border-accent/20">
          <div className="flex items-center space-x-3">
            <div className="bg-accent text-accent-foreground p-2 rounded-full">
              <NavigationIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-foreground font-medium">Location Services Active</p>
              <p className="text-gray-600 text-sm">
                Showing restaurants near your current location
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExploreSection;