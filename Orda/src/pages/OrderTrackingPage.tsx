
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import GPSTracking from '../components/GPSTracking';
import {
    Package,
    Clock,
    CheckCircle,
    Truck,
    MapPin,
    Phone,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';

interface Order {
    id: string;
    order_number: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
    total_amount: number;
    delivery_address: any;
    estimated_delivery_time: string;
    actual_delivery_time?: string;
    delivery_code: string;
    created_at: string;
    restaurant: {
        id: string;
        name: string;
        address: string;
        phone: string;
        latitude: number;
        longitude: number;
    };
    driver?: {
        id: string;
        display_name: string;
        phone: string;
    };
    order_items: {
        id: string;
        quantity: number;
        unit_price: number;
        menu_item: {
            name: string;
            description: string;
        };
    }[];
}

const OrderTrackingPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [orderLoading, setOrderLoading] = useState(true);

    useEffect(() => {
        if (orderId && user) {
            fetchOrder();
            subscribeToOrderUpdates();
        }
    }, [orderId, user]);

    const fetchOrder = async () => {
        if (!orderId) return;

        setOrderLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    restaurants!restaurant_id(
                        id,
                        name,
                        address,
                        phone,
                        latitude,
                        longitude
                    ),
                    driver_profiles:profiles!driver_id(
                        id,
                        display_name,
                        phone
                    ),
                    order_items!inner(
                        id,
                        quantity,
                        unit_price,
                        menu_items!inner(name, description)
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;

            const transformedOrder = {
                ...data,
                restaurant: data.restaurants,
                driver: data.driver_profiles,
                order_items: data.order_items.map((item: any) => ({
                    ...item,
                    menu_item: item.menu_items
                }))
            };

            setOrder(transformedOrder);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast({
                title: "Error",
                description: "Failed to load order details",
                variant: "destructive",
            });
        } finally {
            setOrderLoading(false);
        }
    };

    const subscribeToOrderUpdates = () => {
        if (!orderId) return;

        const subscription = supabase
            .channel(`order_${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
            }, (payload) => {
                if (payload.new) {
                    setOrder(prevOrder => prevOrder ? { ...prevOrder, ...payload.new } : null);
                    
                    // Show notification for status changes
                    if (payload.old && payload.old.status !== payload.new.status) {
                        toast({
                            title: "Order Update",
                            description: `Your order is now ${payload.new.status}`,
                        });
                    }
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const getStatusSteps = () => {
        const steps = [
            { key: 'pending', label: 'Order Placed', icon: Package },
            { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { key: 'preparing', label: 'Preparing', icon: Clock },
            { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
            { key: 'picked_up', label: 'Picked Up', icon: Truck },
            { key: 'delivering', label: 'On the Way', icon: Truck },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle }
        ];

        const currentStepIndex = steps.findIndex(step => step.key === order?.status);
        
        return steps.map((step, index) => ({
            ...step,
            isCompleted: index <= currentStepIndex,
            isActive: index === currentStepIndex,
            isCancelled: order?.status === 'cancelled'
        }));
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount / 100);
    };

    const formatAddress = (address: any) => {
        if (typeof address === 'string') return address;
        if (address?.street) {
            return `${address.street}, ${address.city || ''}`;
        }
        return 'Address not available';
    };

    const getEstimatedTime = () => {
        if (!order?.estimated_delivery_time) return null;
        
        const estimatedTime = new Date(order.estimated_delivery_time);
        const now = new Date();
        const diffMs = estimatedTime.getTime() - now.getTime();
        const diffMins = Math.ceil(diffMs / (1000 * 60));
        
        if (diffMins <= 0) return "Arriving now";
        if (diffMins < 60) return `${diffMins} minutes`;
        
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
    };

    if (loading || orderLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
                    <p className="text-muted-foreground mb-4">
                        The order you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                    <Button onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    const statusSteps = getStatusSteps();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="text-white hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Track Your Order</h1>
                            <p className="text-primary-foreground/80">
                                Order #{order.order_number} from {order.restaurant.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Order Status Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            {statusSteps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.key} className="flex flex-col items-center space-y-2">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                            step.isCancelled ? 'bg-red-100 border-red-500 text-red-500' :
                                            step.isCompleted ? 'bg-primary text-white border-primary' :
                                            step.isActive ? 'bg-primary/20 border-primary text-primary' :
                                            'bg-gray-100 border-gray-300 text-gray-400'
                                        }`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-medium ${
                                                step.isCompleted || step.isActive ? 'text-foreground' : 'text-muted-foreground'
                                            }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                        {index < statusSteps.length - 1 && (
                                            <div className={`absolute h-0.5 w-8 transform translate-x-6 ${
                                                step.isCompleted ? 'bg-primary' : 'bg-gray-300'
                                            }`} style={{ marginTop: '24px' }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {order.status === 'cancelled' && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <span className="text-red-800 font-medium">Order Cancelled</span>
                                </div>
                                <p className="text-red-700 text-sm mt-1">
                                    This order has been cancelled. Please contact support if you have any questions.
                                </p>
                            </div>
                        )}

                        {(order.status === 'delivering' || order.status === 'picked_up') && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-blue-900">Estimated Delivery Time</h4>
                                        <p className="text-blue-700">{getEstimatedTime()}</p>
                                    </div>
                                    <Truck className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* GPS Tracking */}
                {order.status !== 'pending' && order.status !== 'cancelled' && (
                    <GPSTracking
                        orderId={order.id}
                        customerLocation={{
                            latitude: 7.7840, // Default to Osogbo coordinates
                            longitude: 4.5405,
                            address: formatAddress(order.delivery_address)
                        }}
                        restaurantLocation={{
                            latitude: order.restaurant.latitude || 7.7840,
                            longitude: order.restaurant.longitude || 4.5405,
                            address: order.restaurant.address
                        }}
                        driver={order.driver ? {
                            id: order.driver.id,
                            name: order.driver.display_name,
                            phone: order.driver.phone,
                            currentLocation: { latitude: 7.7840, longitude: 4.5405 },
                            estimatedArrival: getEstimatedTime() || 'Calculating...'
                        } : undefined}
                        orderStatus={order.status}
                        deliveryCode={order.delivery_code}
                    />
                )}

                {/* Order Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Restaurant</h4>
                                <div className="space-y-1">
                                    <p className="font-medium">{order.restaurant.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.restaurant.address}</p>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{order.restaurant.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Delivery Address</h4>
                                <div className="space-y-1">
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                        <p className="text-sm">{formatAddress(order.delivery_address)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Items Ordered</h4>
                            <div className="space-y-2">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">{item.quantity}x {item.menu_item.name}</span>
                                            {item.menu_item.description && (
                                                <p className="text-sm text-muted-foreground">{item.menu_item.description}</p>
                                            )}
                                        </div>
                                        <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total</span>
                                <span className="text-lg font-semibold">{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Order placed: {new Date(order.created_at).toLocaleString()}</p>
                            {order.actual_delivery_time && (
                                <p>Delivered: {new Date(order.actual_delivery_time).toLocaleString()}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Driver Contact */}
                {order.driver && (order.status === 'picked_up' || order.status === 'delivering') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Driver</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">{order.driver.display_name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Your order is on its way
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Driver
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;
