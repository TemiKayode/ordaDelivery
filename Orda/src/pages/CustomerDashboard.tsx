import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Changed from '@/contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'; // Changed from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Clock,
    Star,
    Truck,
    Package,
    Edit,
    Save,
    X
} from 'lucide-react';

// Define interfaces for data structures
interface Order {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    delivery_fee: number;
    created_at: string;
    estimated_delivery_time: string | null;
    restaurant: {
        name: string;
        image_url: string;
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

// Define props for the CustomerDashboard component
// `viewAsUserId` is optional and used when an admin wants to view another customer's dashboard
interface CustomerDashboardProps {
    viewAsUserId?: string | null;
}

const CustomerDashboard = ({ viewAsUserId }: CustomerDashboardProps) => {
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        display_name: profile?.display_name || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
    });

    // Determine which user ID to use for fetching data.
    // If `viewAsUserId` is provided (e.g., from AdminDashboard), use that.
    // Otherwise, use the ID of the currently logged-in user.
    const userIdToFetch = viewAsUserId || user?.id;

    // Update profile form state when the profile data changes (e.g., after initial fetch or an update)
    useEffect(() => {
        if (profile) {
            setProfileForm({
                display_name: profile.display_name || '',
                phone: profile.phone || '',
                address: profile.address || ''
            });
        }
    }, [profile]);

    // Effect hook to fetch orders data when the `userIdToFetch` changes.
    useEffect(() => {
        if (userIdToFetch) {
            fetchOrders(userIdToFetch);
        } else {
            // If no user ID is available to fetch data for, set loading to false.
            setOrdersLoading(false);
        }
    }, [userIdToFetch]);

    // Function to fetch all relevant customer orders from Supabase
    // It now accepts `targetUserId` to fetch data for a specific user.
    const fetchOrders = async (targetUserId: string) => {
        setOrdersLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          delivery_fee,
          created_at,
          estimated_delivery_time,
          restaurants!inner(name, image_url),
          order_items!inner(
            id,
            quantity,
            unit_price,
            menu_items!inner(name, description)
          )
        `)
                .eq('customer_id', targetUserId) // Use targetUserId for fetching
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform the data to match our interface
            const transformedOrders = data?.map(order => ({
                ...order,
                restaurant: order.restaurants,
                order_items: order.order_items.map(item => ({
                    ...item,
                    menu_item: item.menu_items
                }))
            })) || [];

            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast({
                title: "Error",
                description: "Failed to load orders",
                variant: "destructive",
            });
        } finally {
            setOrdersLoading(false);
        }
    };

    // Function to update the customer's profile
    const updateProfile = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: profileForm.display_name,
                    phone: profileForm.phone,
                    address: profileForm.address,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userIdToFetch); // Use userIdToFetch to update the correct profile

            if (error) throw error;

            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            setEditingProfile(false);
            // Re-fetch user profile to ensure `profile` context is updated
            // Assuming useAuth has a mechanism to re-fetch or is reactive
            // If not, you might need to manually update the profile state in AuthContext or here
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        }
    };

    // Helper function to determine the color of the order status badge
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'confirmed': return 'bg-blue-500';
            case 'preparing': return 'bg-orange-500';
            case 'ready': return 'bg-purple-500';
            case 'picked_up': return 'bg-indigo-500';
            case 'delivering': return 'bg-cyan-500';
            case 'delivered': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    // Helper function to format currency (Nigerian Naira)
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount / 100); // Assuming amount is in kobo/cents
    };

    // --- Conditional Rendering based on loading state and user type ---

    // If still loading authentication or dashboard data, show a spinner.
    if (loading || ordersLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect logic:
    // If not loading, and not viewing as a specific user (i.e., direct access),
    // AND the logged-in user is not authenticated OR their user_type is not 'customer',
    // then redirect to authentication page.
    // This allows admins (who have a different user_type) to still use viewAsUserId.
    if (!loading && !viewAsUserId && (!user || profile?.user_type !== 'customer')) {
        return <Navigate to="/auth" replace />;
    }

    // If an admin is viewing (viewAsUserId is present) but no customer profile
    // was found for that specific user ID, display an informative message.
    // Note: This assumes a customer must have a profile.
    if (!loading && viewAsUserId && !profile) { // Checking for profile here as customer data is tied to profile
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Customer Profile Found for Selected User</h3>
                    <p className="text-muted-foreground text-center">
                        The selected user (ID: {userIdToFetch}) does not appear to have a customer profile.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="bg-white text-primary text-xl">
                                {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Welcome back, {profile?.display_name || user?.email?.split('@')[0]}!
                            </h1>
                            <p className="text-primary-foreground/80">
                                Manage your orders and profile
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Tabs defaultValue="orders" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="orders">Order History</TabsTrigger>
                        <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                    </TabsList>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Your Orders</h2>
                            <Badge variant="secondary">{orders.length} total orders</Badge>
                        </div>

                        {orders.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Start by browsing restaurants and placing your first order!
                                    </p>
                                    <Button onClick={() => window.location.href = '/'}>
                                        Browse Restaurants
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Card key={order.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center space-x-2">
                                                        <span>Order #{order.order_number}</span>
                                                        <Badge className={getStatusColor(order.status)}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </Badge>
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.restaurant.name} • {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Delivery: {formatPrice(order.delivery_fee)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {order.order_items.map((item) => (
                                                    <div key={item.id} className="flex justify-between">
                                                        <span>{item.quantity}x {item.menu_item.name}</span>
                                                        <span>{formatPrice(item.unit_price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.estimated_delivery_time && (
                                                <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Estimated delivery: {new Date(order.estimated_delivery_time).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Profile Information</CardTitle>
                                    {!editingProfile ? (
                                        <Button variant="outline" onClick={() => setEditingProfile(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <div className="space-x-2">
                                            <Button variant="outline" onClick={() => setEditingProfile(false)}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button onClick={updateProfile}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="display_name">Full Name</Label>
                                        {editingProfile ? (
                                            <Input
                                                id="display_name"
                                                value={profileForm.display_name}
                                                onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>{profile?.display_name || 'Not set'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{user?.email}</span>
                                            <Badge variant="secondary">Verified</Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        {editingProfile ? (
                                            <Input
                                                id="phone"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="Enter your phone number"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{profile?.phone || 'Not set'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="user_type">Account Type</Label>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline">Customer</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Delivery Address</Label>
                                    {editingProfile ? (
                                        <Textarea
                                            id="address"
                                            value={profileForm.address}
                                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                            placeholder="Enter your delivery address"
                                            rows={3}
                                        />
                                    ) : (
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                            <span>{profile?.address || 'No address set'}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default CustomerDashboard;
