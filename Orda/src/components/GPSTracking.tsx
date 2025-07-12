import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Truck } from 'lucide-react';

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  bearing?: number;
  timestamp: string;
}

interface GPSTrackingProps {
  orderId: string;
  driverId?: string;
  isDriver?: boolean;
}

const GPSTracking: React.FC<GPSTrackingProps> = ({ orderId, driverId, isDriver = false }) => {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (driverId) {
      fetchLastLocation();
      setupRealtimeTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [driverId]);

  const fetchLastLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('gps_tracking')
        .select('*')
        .eq('driver_id', driverId)
        .eq('order_id', orderId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCurrentLocation({
          latitude: parseFloat(data.latitude.toString()),
          longitude: parseFloat(data.longitude.toString()),
          accuracy: data.accuracy ? parseFloat(data.accuracy.toString()) : undefined,
          speed: data.speed ? parseFloat(data.speed.toString()) : undefined,
          bearing: data.bearing ? parseFloat(data.bearing.toString()) : undefined,
          timestamp: data.timestamp
        });
      }
    } catch (error) {
      console.error('Error fetching last location:', error);
    }
  };

  const setupRealtimeTracking = () => {
    const channel = supabase
      .channel(`gps_tracking_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newLocation = payload.new;
          setCurrentLocation({
            latitude: parseFloat(newLocation.latitude.toString()),
            longitude: parseFloat(newLocation.longitude.toString()),
            accuracy: newLocation.accuracy ? parseFloat(newLocation.accuracy.toString()) : undefined,
            speed: newLocation.speed ? parseFloat(newLocation.speed.toString()) : undefined,
            bearing: newLocation.bearing ? parseFloat(newLocation.bearing.toString()) : undefined,
            timestamp: newLocation.timestamp
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          bearing: position.coords.heading || undefined,
          timestamp: new Date().toISOString()
        };

        updateLocationInDatabase(location);
        setCurrentLocation(location);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsTracking(false);
      },
      options
    );

    setWatchId(id);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const updateLocationInDatabase = async (location: GPSLocation) => {
    try {
      const { error } = await supabase
        .from('gps_tracking')
        .insert({
          driver_id: driverId,
          order_id: orderId,
          latitude: parseFloat(location.latitude.toString()),
          longitude: parseFloat(location.longitude.toString()),
          accuracy: location.accuracy ? parseFloat(location.accuracy.toString()) : undefined,
          speed: location.speed ? parseFloat(location.speed.toString()) : undefined,
          bearing: location.bearing ? parseFloat(location.bearing.toString()) : undefined,
          timestamp: location.timestamp
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const openInGoogleMaps = () => {
    if (currentLocation) {
      const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getLocationAccuracy = () => {
    if (!currentLocation?.accuracy) return 'Unknown';
    if (currentLocation.accuracy < 10) return 'High';
    if (currentLocation.accuracy < 50) return 'Medium';
    return 'Low';
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'Unknown';
    return `${(speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>GPS Tracking</span>
          {isTracking && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDriver && (
          <div className="flex space-x-2">
            <Button
              onClick={startTracking}
              disabled={isTracking}
              className="flex items-center space-x-2"
            >
              <Truck className="h-4 w-4" />
              <span>{isTracking ? 'Tracking Active' : 'Start Tracking'}</span>
            </Button>
            {isTracking && (
              <Button
                variant="outline"
                onClick={stopTracking}
                className="flex items-center space-x-2"
              >
                <span>Stop Tracking</span>
              </Button>
            )}
          </div>
        )}

        {currentLocation && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Latitude:</span>
                <p className="font-mono">{currentLocation.latitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Longitude:</span>
                <p className="font-mono">{currentLocation.longitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Accuracy:</span>
                <p>{getLocationAccuracy()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Speed:</span>
                <p>{formatSpeed(currentLocation.speed)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={openInGoogleMaps}
                className="flex items-center space-x-2"
              >
                <Navigation className="h-4 w-4" />
                <span>Open in Maps</span>
              </Button>
            </div>
          </div>
        )}

        {!currentLocation && !isDriver && (
          <div className="text-center py-4 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tracking data available</p>
          </div>
        )}

        {!currentLocation && isDriver && !isTracking && (
          <div className="text-center py-4 text-muted-foreground">
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Start tracking to share your location</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GPSTracking;