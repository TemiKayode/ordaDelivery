import React, { useState } from 'react';
import { MapPin, Navigation as NavigationIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LocationBannerProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationBanner: React.FC<LocationBannerProps> = ({ location, onLocationChange }) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleLocationUpdate = () => {
    if (newLocation.trim()) {
      onLocationChange(newLocation);
      setIsLocationModalOpen(false);
      setNewLocation('');
    }
  };

  const detectCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Simple geolocation - in a real app, you'd use a reverse geocoding API
          onLocationChange(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLocationModalOpen(false);
        },
        (error) => {
          console.log('Location access denied:', error);
          alert('Location access denied. Please enter your location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className="flex items-center space-x-3">
        <div className="bg-white/20 rounded-full p-2">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white/80 text-sm">Delivering to</p>
          <p className="text-white font-medium">{location}</p>
        </div>
      </div>

      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white"
          >
            Change
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Update Your Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enter your delivery address
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="e.g., 123 Main Street, Osogbo"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationUpdate()}
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Or</p>
              <Button
                onClick={detectCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <NavigationIcon className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsLocationModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLocationUpdate}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!newLocation.trim()}
              >
                Update Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationBanner;