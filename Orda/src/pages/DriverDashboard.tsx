import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
    Truck,
    MapPin,
    Navigation,
    Clock,
    Star,
    Package,
    Route,
    CheckCircle,
    DollarSign,
    TrendingUp,
    Phone,
    User
} from 'lucide-react';

// Define interfaces for data structures
interface DriverRoute {
    id: string;
    status: string;
    start_location: any;
    current_location: any;
    estimated_completion_time: string | null;
    total_distance: number;
    total_duration: number;
    max_orders: number;
    current_order_count: number;
    created_at: string;
    route_orders: RouteOrder[];
}

interface RouteOrder {
    id: string;
    sequence_number: number;
    status: string;
    pickup_time: string | null;
    delivery_time: string | null;
    order: {
        id: string;
        order_number: string;
        total_amount: number;
        delivery_address: any;
        customer_notes: string;
        restaurant: {
            name: string;
            address: string;
            phone: string;
            latitude?: number; // Added for distance calculation
            longitude?: number; // Added for distance calculation
        };
        customer: {
            display_name: string;
            phone: string;
        };
        distance_to_restaurant?: number;
        distance_to_customer?: number;
    };
}

interface DeliveryStats {
    totalDeliveries: number;
    todayDeliveries: number;
    totalEarnings: number;
    averageRating: number;
}

// Define props for the DriverDashboard component
// `viewAsUserId` is optional and used when an admin wants to view another driver's dashboard
interface DriverDashboardProps {
    viewAsUserId?: string | null;
}

const DriverDashboard = ({ viewAsUserId }: DriverDashboardProps) => {
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const [activeRoute, setActiveRoute] = useState<DriverRoute | null>(null);
    const [availableOrders, setAvailableOrders] = useState<any[]>([]);
    const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<DeliveryStats>({
        totalDeliveries: 0,
        todayDeliveries: 0,
        totalEarnings: 0,
        averageRating: 0
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false); // Driver online status
    const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
    const [realTimeStats, setRealTimeStats] = useState({
        todayEarnings: 0,
        todayDeliveries: 0,
        avgRating: 4.8,
        completionRate: 98.5
    });

    // Determine which user ID to use for fetching data.
    // If `viewAsUserId` is provided (e.g., from AdminDashboard), use that.
    // Otherwise, use the ID of the currently logged-in user.
    const userIdToFetch = viewAsUserId || user?.id;

    // Real-time location tracking
    const trackLocation = useCallback(() => {
        if (navigator.geolocation && isOnline) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(newLocation);
                    // Update driver location in database
                    if (userIdToFetch) {
                        supabase
                            .from('driver_locations')
                            .upsert({
                                driver_id: userIdToFetch,
                                latitude: newLocation.lat,
                                longitude: newLocation.lng,
                                updated_at: new Date().toISOString()
                            })
                            .then(({ error }) => {
                                if (error) console.error('Error updating location:', error);
                            });
                    }
                },
                (error) => console.error('Location error:', error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
            );
        }
    }, [isOnline, userIdToFetch]);

    // Real-time order updates subscription
    useEffect(() => {
        if (!userIdToFetch) return;

        const subscription = supabase
            .channel('driver_orders')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'orders',
                    filter: `driver_id=eq.${userIdToFetch}`
                }, 
                (payload) => {
                    console.log('Order update received:', payload);
                    fetchDriverData(userIdToFetch);
                }
            )
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'route_orders'
                },
                (payload) => {
                    console.log('Route order update received:', payload);
                    fetchDriverData(userIdToFetch);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [userIdToFetch]);

    // Effect hook to fetch driver data when the `userIdToFetch` changes.
    useEffect(() => {
        if (userIdToFetch) {
            fetchDriverData(userIdToFetch);
        } else {
            setDashboardLoading(false);
        }
    }, [userIdToFetch]);

    // Start location tracking when driver goes online
    useEffect(() => {
        if (isOnline) {
            trackLocation();
        }
    }, [isOnline, trackLocation]);

    // Function to fetch all relevant driver data from Supabase
    // It now accepts `targetUserId` to fetch data for a specific user.
    const fetchDriverData = async (targetUserId: string) => {
        setDashboardLoading(true);
        try {
            // Fetch active route for the target driver
            const { data: routeData, error: routeError } = await supabase
                .from('driver_routes')
                .select(`
          *,
          route_orders!inner(
            *,
            orders!inner(
              id,
              order_number,
              total_amount,
              delivery_address,
              customer_notes,
              restaurants!inner(name, address, phone, latitude, longitude),
              profiles!customer_id(display_name, phone)
            )
          )
        `)
                .eq('driver_id', targetUserId) // Use targetUserId for fetching
                .eq('status', 'active')
                .single();

            // Handle the case where no active route is found for the given driver_id.
            // 'PGRST116' is the error code for "No rows found".
            if (routeError && routeError.code === 'PGRST116') {
                setActiveRoute(null); // Explicitly set activeRoute to null
            } else if (routeError) {
                // If it's any other error, throw it to be caught by the outer try-catch.
                throw routeError;
            }

            if (routeData) {
                const transformedRoute = {
                    ...routeData,
                    route_orders: routeData.route_orders.map((ro: any) => ({
                        ...ro,
                        order: {
                            ...ro.orders,
                            restaurant: ro.orders.restaurants,
                            customer: ro.orders.profiles
                        }
                    }))
                };
                setActiveRoute(transformedRoute);
            } else {
                setActiveRoute(null); // Ensure activeRoute is null if no data or PGRST116
            }

            // Fetch available orders with restaurant location data
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
          id,
          order_number,
          total_amount,
          delivery_address,
          customer_notes,
          created_at,
          restaurants!inner(name, address, phone, latitude, longitude),
          profiles!customer_id(display_name, phone)
        `)
                .eq('status', 'ready')
                .is('driver_id', null) // Only show orders not yet assigned to any driver
                .order('created_at', { ascending: true })
                .limit(20);

            if (ordersError) throw ordersError;

            // Get current driver location for distance calculations
            let driverLat = 6.5244; // Default to Lagos, Nigeria
            let driverLng = 3.3792;

            // Attempt to get actual geolocation if available
            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: false });
                    });
                    driverLat = position.coords.latitude;
                    driverLng = position.coords.longitude;
                } catch (error) {
                    console.log('Geolocation not available or denied. Using default location for distance calculation.');
                }
            }

            const transformedOrders = ordersData?.map(order => {
                const restaurant = order.restaurants;
                let distanceToRestaurant = 0;
                let distanceToCustomer = 0;

                // Calculate distance to restaurant using Haversine formula (approximate for small distances)
                if (restaurant.latitude && restaurant.longitude) {
                    const R = 6371; // Radius of Earth in kilometers
                    const dLat = (restaurant.latitude - driverLat) * Math.PI / 180;
                    const dLon = (restaurant.longitude - driverLng) * Math.PI / 180;
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(driverLat * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    distanceToRestaurant = R * c; // Distance in km
                }

                // Mock distance to customer for now, as delivery_address might not have lat/lng
                // In a real app, you'd integrate with a geocoding service for customer address.
                if (order.delivery_address && typeof order.delivery_address === 'object') {
                    distanceToCustomer = Math.random() * 10 + 2; // Mock distance for now (2-12 km)
                }

                return {
                    ...order,
                    restaurant,
                    customer: order.profiles,
                    distance_to_restaurant: Math.round(distanceToRestaurant * 10) / 10,
                    distance_to_customer: Math.round(distanceToCustomer * 10) / 10
                };
            }) || [];

            // Sort by closest restaurant first
            transformedOrders.sort((a, b) => (a.distance_to_restaurant || 999) - (b.distance_to_restaurant || 999));

            setAvailableOrders(transformedOrders);

            // Fetch delivery history for the target driver
            const { data: historyData, error: historyError } = await supabase
                .from('orders')
                .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          actual_delivery_time,
          restaurants!inner(name),
          profiles!customer_id(display_name)
        `)
                .eq('driver_id', targetUserId) // Use targetUserId for fetching
                .in('status', ['delivered', 'cancelled'])
                .order('created_at', { ascending: false })
                .limit(10);

            if (historyError) throw historyError;

            const transformedHistory = historyData?.map(order => ({
                ...order,
                restaurant: order.restaurants,
                customer: order.profiles
            })) || [];

            setDeliveryHistory(transformedHistory);

            // Calculate stats
            const today = new Date().toDateString();
            const todayDeliveries = transformedHistory.filter(order =>
                new Date(order.created_at).toDateString() === today && order.status === 'delivered'
            ).length;

            const totalEarnings = transformedHistory
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + (order.total_amount * 0.1), 0); // Assuming 10% commission

            setStats({
                totalDeliveries: transformedHistory.filter(order => order.status === 'delivered').length,
                todayDeliveries,
                totalEarnings,
                averageRating: 4.8 // Mock rating for now
            });

        } catch (error) {
            console.error('Error fetching driver data:', error);
            toast({
                title: "Error",
                description: "Failed to load driver data",
                variant: "destructive",
            });
        } finally {
            setDashboardLoading(false);
        }
    };

    // Function to accept an order and assign it to the driver's active route
    const acceptOrder = async (orderId: string) => {
        try {
            // Check if driver has reached maximum orders (5)
            if (activeRoute && activeRoute.current_order_count >= 5) {
                toast({
                    title: "Maximum Orders Reached",
                    description: "You can only handle 5 orders at a time",
                    variant: "destructive",
                });
                return;
            }

            // First, create a new route if none exists for the target driver
            let routeId = activeRoute?.id;

            if (!routeId) {
                const { data: newRoute, error: routeError } = await supabase
                    .from('driver_routes')
                    .insert({
                        driver_id: userIdToFetch, // Use userIdToFetch here
                        status: 'active',
                        start_location: null, // You might want to capture current driver location here
                        current_location: null,
                        estimated_completion_time: null,
                        total_distance: 0,
                        total_duration: 0,
                        max_orders: 5,
                        current_order_count: 1
                    })
                    .select()
                    .single();

                if (routeError) throw routeError;
                routeId = newRoute.id;
            } else {
                // Update current order count on existing route
                const { error: updateError } = await supabase
                    .from('driver_routes')
                    .update({
                        current_order_count: (activeRoute.current_order_count || 0) + 1
                    })
                    .eq('id', routeId);

                if (updateError) throw updateError;
            }

            // Assign the order to the driver and update its status
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    driver_id: userIdToFetch, // Use userIdToFetch here
                    status: 'picked_up', // Assuming direct pickup after acceptance
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (orderError) throw orderError;

            // Add the order to the route_orders table
            const { error: routeOrderError } = await supabase
                .from('route_orders')
                .insert({
                    route_id: routeId,
                    order_id: orderId,
                    sequence_number: (activeRoute?.route_orders.length || 0) + 1, // Simple sequencing
                    status: 'picked_up',
                    pickup_time: new Date().toISOString()
                });

            if (routeOrderError) throw routeOrderError;

            toast({
                title: "Success",
                description: "Order accepted and picked up successfully",
            });

            // Refresh data to update UI
            fetchDriverData(userIdToFetch);
        } catch (error) {
            console.error('Error accepting order:', error);
            toast({
                title: "Error",
                description: "Failed to accept order",
                variant: "destructive",
            });
        }
    };

    // Function to mark a delivery as complete
    const completeDelivery = async (routeOrderId: string, orderId: string) => {
        try {
            // Update main order status to delivered
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    status: 'delivered',
                    actual_delivery_time: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (orderError) throw orderError;

            // Update route order status to delivered
            const { error: routeOrderError } = await supabase
                .from('route_orders')
                .update({
                    status: 'delivered',
                    delivery_time: new Date().toISOString()
                })
                .eq('id', routeOrderId);

            if (routeOrderError) throw routeOrderError;

            toast({
                title: "Success",
                description: "Delivery completed successfully",
            });

            // Refresh data to update UI
            fetchDriverData(userIdToFetch);
        } catch (error) {
            console.error('Error completing delivery:', error);
            toast({
                title: "Error",
                description: "Failed to complete delivery",
                variant: "destructive",
            });
        }
    };

    // Helper function to format currency (Nigerian Naira)
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount / 100); // Assuming amount is in kobo/cents
    };

    // Helper function to format delivery address, handling different data types
    const formatAddress = (address: any) => {
        if (typeof address === 'string') return address;
        if (address?.street) {
            return `${address.street}, ${address.city || ''}`;
        }
        return 'Address not available';
    };

    // --- Conditional Rendering based on loading state and user type ---

    // If still loading authentication or dashboard data, show a spinner.
    if (loading || dashboardLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect logic:
    // If not loading, and not viewing as a specific user (i.e., direct access),
    // AND the logged-in user is not authenticated OR their user_type is not 'driver',
    // then redirect to authentication page.
    // This allows admins (who have a different user_type) to still use viewAsUserId.
    if (!loading && !viewAsUserId && (!user || profile?.user_type !== 'driver')) {
        return <Navigate to="/auth" replace />;
    }

    // If an admin is viewing (viewAsUserId is present) but no driver profile
    // was found for that specific user ID, display an informative message.
    // Note: This assumes a driver must have a profile.
    if (!loading && viewAsUserId && !profile) { // Checking for profile here as driver data is tied to profile
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Driver Profile Found for Selected User</h3>
                    <p className="text-muted-foreground text-center">
                        The selected user (ID: {viewAsUserId}) does not appear to have a driver profile.
                    </p>
                </Card>
            </div>
        );
    }

    // Main dashboard rendering
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="bg-white text-primary text-xl">
                                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'D'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    Driver Dashboard
                                </h1>
                                <p className="text-primary-foreground/80">
                                    Welcome back, {profile?.display_name || user?.email?.split('@')[0]}!
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4" />
                                    <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                                </div>
                                <p className="text-sm text-primary-foreground/80">Driver Rating</p>
                            </div>
                            <Badge variant={isOnline ? "secondary" : "destructive"}>
                                {isOnline ? "Online" : "Offline"}
                            </Badge>
                            <Button
                                variant="outline"
                                onClick={() => setIsOnline(!isOnline)}
                                className="text-white border-white hover:bg-white hover:text-primary"
                            >
                                {isOnline ? "Go Offline" : "Go Online"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todayDeliveries}</div>
                            <p className="text-xs text-muted-foreground">
                                Total: {stats.totalDeliveries}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total earned
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">
                                Average rating
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Route</CardTitle>
                            <Route className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeRoute?.route_orders.length || 0}/5</div>
                            <p className="text-xs text-muted-foreground">
                                Orders in route (max 5)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="active" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">Active Deliveries</TabsTrigger>
                        <TabsTrigger value="available">Available Orders</TabsTrigger>
                        <TabsTrigger value="history">Delivery History</TabsTrigger>
                    </TabsList>

                    {/* Active Deliveries Tab */}
                    <TabsContent value="active" className="space-y-6">
                        <h2 className="text-2xl font-bold">Active Route</h2>

                        {!activeRoute || activeRoute.route_orders.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Active Deliveries</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Accept orders from the available orders tab to start delivering.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {activeRoute.route_orders.map((routeOrder) => (
                                    <Card key={routeOrder.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center space-x-2">
                                                        <span>Order #{routeOrder.order.order_number}</span>
                                                        <Badge variant="outline">#{routeOrder.sequence_number}</Badge>
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {routeOrder.order.restaurant.name} → {routeOrder.order.customer.display_name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatPrice(routeOrder.order.total_amount)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Delivery fee included (placeholder)
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Pickup Address</h4>
                                                    <div className="flex items-start space-x-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                                        <div>
                                                            <p className="text-sm">{routeOrder.order.restaurant.address}</p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <Phone className="h-3 w-3" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {routeOrder.order.restaurant.phone}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-2">Delivery Address</h4>
                                                    <div className="flex items-start space-x-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                                        <div>
                                                            <p className="text-sm">{formatAddress(routeOrder.order.delivery_address)}</p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <Phone className="h-3 w-3" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {routeOrder.order.customer.phone}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {routeOrder.order.customer_notes && (
                                                <div>
                                                    <h4 className="font-semibold mb-1">Customer Notes</h4>
                                                    <p className="text-sm text-muted-foreground">{routeOrder.order.customer_notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <div className="flex items-center space-x-2">
                                                    {routeOrder.pickup_time && (
                                                        <Badge variant="secondary">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Picked up
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-x-2">
                                                    <Button variant="outline">
                                                        <Navigation className="h-4 w-4 mr-2" />
                                                        Navigate
                                                    </Button>
                                                    <Button onClick={() => completeDelivery(routeOrder.id, routeOrder.order.id)}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Complete Delivery
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Available Orders Tab */}
                    <TabsContent value="available" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Available Orders</h2>
                            <Badge variant="secondary">{availableOrders.length} orders available</Badge>
                        </div>

                        {availableOrders.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Available Orders</h3>
                                    <p className="text-muted-foreground text-center">
                                        Check back later for new delivery opportunities.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {availableOrders.map((order) => (
                                    <Card key={order.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center space-x-2">
                                                        <span>Order #{order.order_number}</span>
                                                        <Badge variant="outline">Ready for Pickup</Badge>
                                                        {order.distance_to_restaurant && order.distance_to_restaurant <= 2 && (
                                                            <Badge variant="secondary">Nearby</Badge>
                                                        )}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.restaurant.name} → {order.customer.display_name}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{order.distance_to_restaurant?.toFixed(1) || '?'} km to pickup</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Navigation className="h-3 w-3" />
                                                            <span>{order.distance_to_customer?.toFixed(1) || '?'} km delivery</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Total value
                                                    </p>
                                                    <p className="text-xs text-green-600 font-medium">
                                                        ~₦{Math.round(order.total_amount * 0.1 / 100)} delivery fee (placeholder)
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>Pickup Location</span>
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.restaurant.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.restaurant.address}
                                                    </p>
                                                    {order.restaurant.phone && (
                                                        <p className="text-sm text-muted-foreground flex items-center space-x-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{order.restaurant.phone}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="font-medium flex items-center space-x-1">
                                                        <Navigation className="h-4 w-4" />
                                                        <span>Delivery Location</span>
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.customer.display_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatAddress(order.delivery_address)}
                                                    </p>
                                                    {order.customer.phone && (
                                                        <p className="text-sm text-muted-foreground flex items-center space-x-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{order.customer.phone}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {order.customer_notes && (
                                                <div>
                                                    <h4 className="font-medium">Customer Notes</h4>
                                                    <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Truck className="h-4 w-4" />
                                                        <span>~{Math.round((order.distance_to_restaurant || 0) + (order.distance_to_customer || 0))} km total</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => acceptOrder(order.id)}
                                                    disabled={activeRoute && activeRoute.current_order_count >= 5}
                                                >
                                                    Accept Order
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {activeRoute && activeRoute.current_order_count >= 5 && (
                                    <Card className="border-orange-200 bg-orange-50">
                                        <CardContent className="text-center py-8">
                                            <Package className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-orange-800 mb-2">Maximum Orders Reached</h3>
                                            <p className="text-orange-600">
                                                You're currently handling the maximum of 5 orders. Complete some deliveries to accept new orders.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Delivery History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        <h2 className="text-2xl font-bold">Delivery History</h2>

                        <div className="space-y-4">
                            {deliveryHistory.map((order) => (
                                <Card key={order.id}>
                                    <CardContent className="flex items-center justify-between py-4">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">Order #{order.order_number}</span>
                                                <Badge variant={order.status === 'delivered' ? 'default' : 'destructive'}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.restaurant.name} → {order.customer.display_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Earned: {formatPrice(order.total_amount * 0.1)} (placeholder)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {deliveryHistory.length === 0 && (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Delivery History</h3>
                                        <p className="text-muted-foreground text-center">
                                            Once you complete deliveries, they will appear here.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DriverDashboard;
