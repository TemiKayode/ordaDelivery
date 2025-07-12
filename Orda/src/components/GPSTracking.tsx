
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import {
    MapPin,
    Navigation,
    Phone,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle,
    Copy
} from 'lucide-react';

interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

interface Driver {
    id: string;
    name: string;
    phone: string;
    currentLocation: Location;
    estimatedArrival: string;
}

interface GPSTrackingProps {
    orderId: string;
    customerLocation: Location;
    restaurantLocation: Location;
    driver?: Driver;
    orderStatus: string;
    deliveryCode?: string;
    isDriver?: boolean;
    onStatusUpdate?: (orderId: string, status: string, deliveryCode?: string) => void;
}

const GPSTracking: React.FC<GPSTrackingProps> = ({
    orderId,
    customerLocation,
    restaurantLocation,
    driver,
    orderStatus,
    deliveryCode,
    isDriver = false,
    onStatusUpdate
}) => {
    const { toast } = useToast();
    const mapRef = useRef<HTMLDivElement>(null);
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [enteredCode, setEnteredCode] = useState('');
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);

    // Mock map implementation - in production, use Leaflet.js or Google Maps
    useEffect(() => {
        if (mapRef.current) {
            // Initialize map here
            console.log('Map would be initialized here with locations:', {
                customer: customerLocation,
                restaurant: restaurantLocation,
                driver: driver?.currentLocation
            });
        }
    }, [customerLocation, restaurantLocation, driver]);

    // Real-time location tracking for drivers
    useEffect(() => {
        if (isDriver && navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setCurrentLocation(newLocation);
                    updateDriverLocation(newLocation);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast({
                        title: "Location Error",
                        description: "Unable to track your location. Please enable location services.",
                        variant: "destructive",
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [isDriver]);

    // Subscribe to real-time GPS updates
    useEffect(() => {
        if (!isDriver && driver) {
            const subscription = supabase
                .channel(`gps_tracking_${orderId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'gps_tracking',
                    filter: `order_id=eq.${orderId}`
                }, (payload) => {
                    if (payload.new) {
                        const { latitude, longitude } = payload.new;
                        setCurrentLocation({ latitude, longitude });
                    }
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [orderId, isDriver, driver]);

    const updateDriverLocation = async (location: Location) => {
        try {
            const { error } = await supabase
                .from('gps_tracking')
                .upsert({
                    order_id: orderId,
                    driver_id: driver?.id,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timestamp: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating driver location:', error);
        }
    };

    const verifyDeliveryCode = async () => {
        if (!enteredCode.trim()) {
            toast({
                title: "Invalid Code",
                description: "Please enter the delivery code",
                variant: "destructive",
            });
            return;
        }

        setIsVerifyingCode(true);
        try {
            // Verify the delivery code
            const { data, error } = await supabase
                .from('orders')
                .select('delivery_code')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            if (data.delivery_code === enteredCode.trim()) {
                // Code is correct, update order status to delivered
                await supabase
                    .from('orders')
                    .update({
                        status: 'delivered',
                        actual_delivery_time: new Date().toISOString()
                    })
                    .eq('id', orderId);

                toast({
                    title: "Delivery Confirmed!",
                    description: "Order has been successfully delivered",
                });

                onStatusUpdate?.(orderId, 'delivered', enteredCode);
            } else {
                toast({
                    title: "Invalid Code",
                    description: "The delivery code you entered is incorrect",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error verifying delivery code:', error);
            toast({
                title: "Error",
                description: "Failed to verify delivery code",
                variant: "destructive",
            });
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const copyDeliveryCode = () => {
        if (deliveryCode) {
            navigator.clipboard.writeText(deliveryCode);
            toast({
                title: "Copied!",
                description: "Delivery code copied to clipboard",
            });
        }
    };

    const calculateDistance = (loc1: Location, loc2: Location) => {
        const R = 6371; // Earth's radius in km
        const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
        const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'preparing': return <Clock className="h-5 w-5 text-orange-500" />;
            case 'ready': return <CheckCircle className="h-5 w-5 text-purple-500" />;
            case 'picked_up': return <Truck className="h-5 w-5 text-indigo-500" />;
            case 'delivering': return <Navigation className="h-5 w-5 text-cyan-500" />;
            case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'cancelled': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Order Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(orderStatus)}
                        <span>Order Status: {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!isDriver && deliveryCode && (orderStatus === 'delivering' || orderStatus === 'picked_up') && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-blue-900">Your Delivery Code</h4>
                                    <p className="text-sm text-blue-700">Show this code to the driver upon delivery</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-lg font-mono bg-white">
                                        {deliveryCode}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyDeliveryCode}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isDriver && orderStatus === 'delivering' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-green-900 mb-2">Verify Delivery</h4>
                            <p className="text-sm text-green-700 mb-3">
                                Ask the customer for their delivery code and enter it below to confirm delivery
                            </p>
                            <div className="flex items-center space-x-2">
                                <Input
                                    placeholder="Enter delivery code"
                                    value={enteredCode}
                                    onChange={(e) => setEnteredCode(e.target.value)}
                                    className="font-mono"
                                />
                                <Button 
                                    onClick={verifyDeliveryCode}
                                    disabled={isVerifyingCode}
                                >
                                    {isVerifyingCode ? 'Verifying...' : 'Verify'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Map */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div 
                        ref={mapRef} 
                        className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                        <div className="text-center text-gray-500">
                            <MapPin className="h-12 w-12 mx-auto mb-2" />
                            <p>Map will be rendered here</p>
                            <p className="text-xs">Integration with Leaflet.js or Google Maps</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Driver Information */}
            {driver && !isDriver && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Driver</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold">{driver.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    ETA: {driver.estimatedArrival}
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Driver
                            </Button>
                        </div>

                        {currentLocation && (
                            <div className="text-sm text-muted-foreground">
                                Distance: {calculateDistance(currentLocation, customerLocation).toFixed(1)} km away
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Location Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold">Restaurant</h4>
                            <p className="text-sm text-muted-foreground">
                                {restaurantLocation.address || `${restaurantLocation.latitude}, ${restaurantLocation.longitude}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold">Delivery Address</h4>
                            <p className="text-sm text-muted-foreground">
                                {customerLocation.address || `${customerLocation.latitude}, ${customerLocation.longitude}`}
                            </p>
                        </div>
                    </div>

                    {driver && currentLocation && (
                        <div className="flex items-start space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold">Driver Location</h4>
                                <p className="text-sm text-muted-foreground">
                                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GPSTracking;
