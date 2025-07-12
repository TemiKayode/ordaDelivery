// src/pages/OrderConfirmationPage.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MapPin, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom'; // Assuming you use React Router
import { formatNaira } from '@/utils/currencyFormatter'; // Assuming this path

// Define Order interface (should match your database schema)
interface Order {
    id: string;
    total_amount: number;
    order_date: string;
    restaurant_name: string;
    delivery_address: string;
    estimated_delivery_time?: string; // e.g., "30-45 minutes" or specific time
    // Add other relevant details
}

// Change `export const OrderConfirmationPage` to `const OrderConfirmationPage`
const OrderConfirmationPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>(); // Get order ID from URL
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, you'd fetch the order details using orderId
        const fetchOrderDetails = async () => {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (orderId === 'mock123') { // Example mock data
                setOrder({
                    id: orderId,
                    total_amount: 6400,
                    order_date: new Date().toISOString(),
                    restaurant_name: 'Taste of Africa',
                    delivery_address: '123 Lekki Lane, Lagos',
                    estimated_delivery_time: '45-60 minutes',
                });
            } else {
                setOrder(null); // Order not found
            }
            setLoading(false);
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-lg text-muted-foreground">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive mb-4">Order Not Found</h1>
                <p className="text-muted-foreground">The order with ID "{orderId}" could not be found.</p>
                <Button asChild className="mt-6">
                    <Link to="/customer/dashboard">Back to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3 text-foreground">Order Placed Successfully!</h1>
            <p className="text-lg text-muted-foreground mb-8">
                Your order <span className="font-semibold">#{order.id.substring(0, 8)}</span> has been confirmed.
            </p>

            <Card className="max-w-md mx-auto p-6 border shadow-lg">
                <CardHeader className="border-b pb-4 mb-4">
                    <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-left">
                    <div className="flex items-center space-x-2 text-base">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>Restaurant: <span className="font-medium">{order.restaurant_name}</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-base">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Delivery to: <span className="font-medium">{order.delivery_address}</span></span>
                    </div>
                    <div className="flex items-center space-x-2 text-base">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Est. Delivery: <span className="font-medium">{order.estimated_delivery_time || 'N/A'}</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-4">
                        <span>Total Paid:</span>
                        <span>{formatNaira(order.total_amount)}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex justify-center">
                <Button asChild size="lg">
                    <Link to={`/customer/track-order/${order.id}`}>Track My Order</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link to="/customer/dashboard">Continue Shopping</Link>
                </Button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage; // <<< Add this line at the very end of the file