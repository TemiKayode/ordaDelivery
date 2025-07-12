
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Your Supabase client
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // For scrollable content on mobile
import { Clock, DollarSign, Package } from 'lucide-react'; // Example icons
import { useAuth } from '@/contexts/AuthContext'; // Assuming you use your AuthContext

// Define Order interface (adjust to your actual table schema)
interface Order {
    id: string;
    user_id: string;
    order_date: string; // ISO string or Date
    total_amount: number;
    status: 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
    restaurant_name: string; // Assuming you can get this, maybe via a join or denormalized
    delivery_address: string;
    items: Array<{
        food_id: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    // Add more fields as per your order table
}

export const OrderHistory: React.FC = () => {
    const { user, loading: authLoading } = useAuth(); // Get current user from auth context
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch if user is loaded and not null
        if (!authLoading && user) {
            const fetchOrders = async () => {
                setLoading(true);
                setError(null);
                try {
                    const { data, error } = await supabase
                        .from('orders')
                        .select(`
              id,
              order_date,
              total_amount,
              status,
              delivery_address,
              restaurant_name, // Assuming you have this or can join/fetch it
              items:order_items(food_id, name, quantity, price) // Example: join order items
            `)
                        .eq('user_id', user.id)
                        .order('order_date', { ascending: false }); // Show newest first

                    if (error) {
                        console.error('Error fetching orders:', error);
                        setError(error.message);
                    } else {
                        setOrders(data as Order[]);
                    }
                } catch (err) {
                    console.error('Unexpected error fetching orders:', err);
                    setError('Failed to load orders due to an unexpected error.');
                } finally {
                    setLoading(false);
                }
            };

            fetchOrders();
        } else if (!authLoading && !user) {
            // User is not logged in, or auth context indicates no user
            setLoading(false);
            setOrders([]); // Clear any previous orders
            setError('Please log in to view your order history.');
        }
    }, [user, authLoading]); // Re-run effect if user or auth loading state changes

    if (loading) {
        return (
            <Card className="p-4 text-center border">
                <p className="text-muted-foreground">Loading order history...</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-4 text-center border bg-red-50/50">
                <p className="text-red-600">Error: {error}</p>
                <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
            </Card>
        );
    }

    if (orders.length === 0) {
        return (
            <Card className="p-4 text-center border">
                <CardContent>
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground">No orders yet!</p>
                    <p className="text-muted-foreground text-sm mt-1">
                        Looks like you haven't placed any orders. Start exploring restaurants to find your next meal!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Past Orders</h2>
            <ScrollArea className="h-[calc(100vh-250px)] rounded-md border p-4"> {/* Example fixed height for scroll on mobile */}
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="border shadow-sm">
                            <CardHeader className="p-4 border-b">
                                <CardTitle className="text-lg font-semibold flex justify-between items-center">
                                    <span>Order #{order.id.substring(0, 8)}</span> {/* Shorten ID for display */}
                                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                        {order.status.replace(/_/g, ' ')}
                                    </Badge>
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(order.order_date).toLocaleString()}
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-foreground">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    <span>Total: ₦{order.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Restaurant: {order.restaurant_name || 'N/A'}</span>
                                </div>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    {order.items?.map((item, index) => (
                                        <li key={index}>
                                            {item.quantity}x {item.name} (₦{item.price.toFixed(2)})
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-sm text-muted-foreground mt-2">
                                    Delivery to: {order.delivery_address}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};