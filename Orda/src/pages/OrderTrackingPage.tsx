// src/pages/OrderTrackingPage.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps } from '@/components/ui/steps'; // Assuming you have a Steps component for order status
import { Bike, Phone, Utensils } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import GPSTracking from '@/components/GPSTracking'; // Your existing component (already fixed this import)

// Define Order interface (simplified for tracking)
interface Order {
    id: string;
    status: 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
    restaurant_name: string;
    driver_name?: string;
    driver_phone?: string;
    estimated_delivery_time?: string;
    // Potentially: driver_location (for map)
}

// Change `export const OrderTrackingPage` to `const OrderTrackingPage`
const OrderTrackingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, you'd fetch order details and set up real-time listeners (e.g., Supabase Realtime)
        const fetchAndListenToOrder = async () => {
            setLoading(true);
            // Simulate API call + real-time updates
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate initial load
            setOrder({
                id: orderId || 'mock456',
                status: 'on_the_way', // Example initial status
                restaurant_name: 'The Food Place',
                driver_name: 'Adebayo T.',
                driver_phone: '+2348012345678',
                estimated_delivery_time: '20-30 minutes',
            });
            setLoading(false);

            // Simulate status updates (in a real app, this would be real-time from backend)
            // const interval = setInterval(() => {
            //   setOrder(prev => {
            //     if (prev?.status === 'on_the_way') {
            //       return { ...prev, status: 'delivered' };
            //     }
            //     return prev;
            //   });
            // }, 10000); // Update every 10 seconds
            // return () => clearInterval(interval);
        };

        fetchAndListenToOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-lg text-muted-foreground">Loading order tracking...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive mb-4">Order Not Found</h1>
                <p className="text-muted-foreground">The order with ID "{orderId}" could not be tracked.</p>
                <Button asChild className="mt-6">
                    <Link to="/customer/dashboard">Back to Home</Link>
                </Button>
            </div>
        );
    }

    // Define steps for the order progress (you'll likely need a custom Steps UI component)
    const orderSteps = [
        { id: 'pending', label: 'Order Placed', current: order.status === 'pending' },
        { id: 'preparing', label: 'Preparing', current: order.status === 'preparing' },
        { id: 'on_the_way', label: 'On The Way', current: order.status === 'on_the_way' },
        { id: 'delivered', label: 'Delivered', current: order.status === 'delivered' },
    ];
    const currentStepIndex = orderSteps.findIndex(step => step.id === order.status);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Order #{order.id.substring(0, 8)}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Timeline (requires a custom Steps component) */}
                    <Card className="border shadow-sm p-6">
                        <CardTitle className="mb-4 text-xl">Order Status</CardTitle>
                        {/* Example of how a custom Steps component would be used */}
                        {/* <Steps steps={orderSteps} currentStepIndex={currentStepIndex} /> */}
                        <div className="text-center text-primary font-semibold text-xl mt-4">
                            Currently: {order.status.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        {order.status === 'on_the_way' && (
                            <p className="text-center text-muted-foreground mt-2">
                                Estimated Delivery: {order.estimated_delivery_time}
                            </p>
                        )}
                    </Card>

                    {/* Live Map Tracking */}
                    <Card className="border shadow-sm p-0 overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Live Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 w-full p-0">
                            {/* Your GPSTracking component goes here */}
                            <GPSTracking
                                orderId={order.id}
                                driverId={undefined} // Pass actual driver ID if available
                                isDriver={false} // Set to true if this is the driver's view
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground bg-background/80 p-3 rounded-md shadow-md">
                                Map goes here (GPSTracking component)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Restaurant & Driver Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border shadow-sm p-6">
                        <CardTitle className="mb-4 text-xl flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-primary" /> Restaurant Info
                        </CardTitle>
                        <CardContent className="space-y-2">
                            <p className="font-semibold text-lg">{order.restaurant_name}</p>
                            <Button variant="outline" className="w-full">
                                View Restaurant
                            </Button>
                        </CardContent>
                    </Card>

                    {order.driver_name && (
                        <Card className="border shadow-sm p-6">
                            <CardTitle className="mb-4 text-xl flex items-center gap-2">
                                <Bike className="h-5 w-5 text-primary" /> Driver Info
                            </CardTitle>
                            <CardContent className="space-y-2">
                                <p className="font-semibold text-lg">{order.driver_name}</p>
                                {order.driver_phone && (
                                    <Button className="w-full" onClick={() => window.open(`tel:${order.driver_phone}`)}>
                                        <Phone className="h-4 w-4 mr-2" /> Call Driver
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Button asChild variant="destructive" className="w-full">
                        <Link to={`/customer/order-history`}>Report Issue / Cancel Order</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage; // <<< Add this line at the very end of the file