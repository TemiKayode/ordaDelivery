import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Changed from '@/contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'; // Changed from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
    Store,
    Plus,
    Edit,
    Trash2,
    Eye,
    Clock,
    Star,
    Package,
    DollarSign,
    Users,
    User,
    TrendingUp
} from 'lucide-react';

// Define interfaces for data structures
interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    image_url: string;
    cuisine_type: string;
    delivery_fee: number;
    min_order_amount: number;
    avg_delivery_time: number;
    rating: number;
    review_count: number;
    is_active: boolean;
}

interface MenuCategory {
    id: string;
    name: string;
    description: string;
    sort_order: number;
    is_active: boolean;
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    prep_time: number;
    is_available: boolean;
    is_featured: boolean;
    category_id: string;
    image_url?: string;
    stock_quantity: number;
    low_stock_threshold: number;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    customer: {
        display_name: string;
        phone: string;
    };
    order_items: {
        id: string;
        quantity: number;
        menu_item: {
            name: string;
        };
    }[];
}

// Define props for the RestaurantDashboard component
// `viewAsUserId` is optional and used when an admin wants to view another restaurant's dashboard
interface RestaurantDashboardProps {
    viewAsUserId?: string | null;
}

const RestaurantDashboard = ({ viewAsUserId }: RestaurantDashboardProps) => {
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [restaurantUsers, setRestaurantUsers] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null); // State for image file selection
    const [isUploadingImage, setIsUploadingImage] = useState(false); // State for tracking image upload status

    // Determine which user ID to use for fetching data.
    // If `viewAsUserId` is provided (e.g., from AdminDashboard), use that.
    // Otherwise, use the ID of the currently logged-in user.
    const userIdToFetch = viewAsUserId || user?.id;

    // Effect hook to fetch restaurant data when the `userIdToFetch` changes.
    useEffect(() => {
        if (userIdToFetch) {
            fetchRestaurantData(userIdToFetch);
        } else {
            // If no user ID is available to fetch data for, set loading to false.
            setDashboardLoading(false);
        }
    }, [userIdToFetch]);

    // Function to fetch all relevant restaurant data from Supabase
    // It now accepts `targetUserId` to fetch data for a specific user.
    const fetchRestaurantData = async (targetUserId: string) => {
        setDashboardLoading(true);
        try {
            // Fetch restaurant information based on the target user ID
            const { data: restaurantData, error: restaurantError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', targetUserId) // Use targetUserId for fetching
                .single();

            // Handle the case where no restaurant is found for the given owner_id.
            // 'PGRST116' is the error code for "No rows found".
            if (restaurantError && restaurantError.code === 'PGRST116') {
                setRestaurant(null); // Explicitly set restaurant to null
                setCategories([]);
                setMenuItems([]);
                setOrders([]);
                setRestaurantUsers([]);
                setDashboardLoading(false);
                return; // Exit the function early
            } else if (restaurantError) {
                // If it's any other error, throw it to be caught by the outer try-catch.
                throw restaurantError;
            }

            // If restaurant data is found, proceed to fetch related data
            if (restaurantData) {
                setRestaurant(restaurantData);

                // Fetch menu categories for the restaurant
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('restaurant_id', restaurantData.id)
                    .order('sort_order');
                if (categoriesError) throw categoriesError;
                setCategories(categoriesData || []);

                // Fetch menu items for the restaurant, including stock information
                const { data: menuData, error: menuError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', restaurantData.id)
                    .order('sort_order');
                if (menuError) throw menuError;
                setMenuItems(menuData || []);

                // Fetch recent orders for the restaurant, including customer and item details
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select(`
            id,
            order_number,
            status,
            payment_status,
            total_amount,
            created_at,
            profiles!customer_id(display_name, phone),
            order_items!inner(
              id,
              quantity,
              menu_items!inner(name)
            )
          `)
                    .eq('restaurant_id', restaurantData.id)
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (ordersError) throw ordersError;

                // Transform order data to match the Order interface structure
                const transformedOrders = ordersData?.map(order => ({
                    ...order,
                    customer: order.profiles,
                    order_items: order.order_items.map(item => ({
                        ...item,
                        menu_item: item.menu_items
                    }))
                })) || [];
                setOrders(transformedOrders);

                // Fetch restaurant users (staff, managers) associated with this restaurant
                const { data: usersData, error: usersError } = await supabase
                    .from('restaurant_users')
                    .select(`
            *,
            profiles!user_id(display_name, avatar_url)
          `)
                    .eq('restaurant_id', restaurantData.id);
                if (usersError) throw usersError;
                setRestaurantUsers(usersData || []);
            }
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            toast({
                title: "Error",
                description: "Failed to load restaurant data",
                variant: "destructive",
            });
        } finally {
            setDashboardLoading(false);
        }
    };

    // Function to update the status of an order
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Order status updated successfully",
            });

            // Re-fetch all restaurant data to ensure UI is up-to-date
            if (userIdToFetch) {
                fetchRestaurantData(userIdToFetch);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast({
                title: "Error",
                description: "Failed to update order status",
                variant: "destructive",
            });
        }
    };

    // Function to toggle the availability of a menu item
    const toggleMenuItemAvailability = async (itemId: string, isAvailable: boolean) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
                .eq('id', itemId);

            if (error) throw error;

            toast({
                title: "Success",
                description: `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`,
            });

            // Update local state to reflect the change immediately
            setMenuItems(items =>
                items.map(item =>
                    item.id === itemId ? { ...item, is_available: isAvailable } : item
                )
            );
        } catch (error) {
            console.error('Error updating menu item:', error);
            toast({
                title: "Error",
                description: "Failed to update menu item",
                variant: "destructive",
            });
        }
    };

    // Function to update the stock quantity of a menu item
    const updateMenuItemStock = async (itemId: string, newStock: number) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .update({
                    stock_quantity: newStock,
                    updated_at: new Date().toISOString()
                })
                .eq('id', itemId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Stock quantity updated successfully",
            });

            // Update local state to reflect the change immediately
            setMenuItems(items =>
                items.map(item =>
                    item.id === itemId ? { ...item, stock_quantity: newStock } : item
                )
            );
        } catch (error) {
            console.error('Error updating stock:', error);
            toast({
                title: "Error",
                description: "Failed to update stock quantity",
                variant: "destructive",
            });
        }
    };

    // Placeholder function for image upload. In a real application, this would
    // involve uploading to Supabase Storage and getting a public URL.
    const handleImageUpload = async (itemId: string, file: File) => {
        setIsUploadingImage(true);
        try {
            // For now, we'll just create a placeholder URL
            // In a real app, you'd upload to Supabase Storage or another service
            const placeholderUrl = `https://placehold.co/300x200/aabbcc/ffffff?text=${encodeURIComponent(file.name)}`;

            const { error } = await supabase
                .from('menu_items')
                .update({
                    image_url: placeholderUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', itemId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Image uploaded successfully (placeholder)",
            });

            // Update local state with the new placeholder image URL
            setMenuItems(items =>
                items.map(item =>
                    item.id === itemId ? { ...item, image_url: placeholderUrl } : item
                )
            );
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive",
            });
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Placeholder function for inviting a new user to the restaurant team
    const inviteUser = async (email: string, role: string = 'staff') => {
        try {
            // In a real app, you'd integrate with Supabase Auth to send invitations
            // or create new users with specific roles.
            toast({
                title: "Invitation Sent",
                description: `Invitation sent to ${email} as ${role} (placeholder)`,
            });
        } catch (error) {
            console.error('Error inviting user:', error);
            toast({
                title: "Error",
                description: "Failed to send invitation",
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
    if (loading || dashboardLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect logic:
    // If not loading, and not viewing as a specific user (i.e., direct access),
    // AND the logged-in user is not authenticated OR their user_type is not 'restaurant',
    // then redirect to authentication page.
    // This allows admins (who have a different user_type) to still use viewAsUserId.
    if (!loading && !viewAsUserId && (!user || profile?.user_type !== 'restaurant')) {
        return <Navigate to="/auth" replace />;
    }

    // If an admin is viewing (viewAsUserId is present) but no restaurant data
    // was found for that specific user ID, display an informative message.
    if (!loading && viewAsUserId && !restaurant) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 text-center">
                    <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Restaurant Found for Selected User</h3>
                    <p className="text-muted-foreground text-center">
                        The selected user (ID: {viewAsUserId}) does not appear to own a restaurant.
                    </p>
                </Card>
            </div>
        );
    }

    // If a regular restaurant owner logs in directly and no restaurant is found for them,
    // prompt them to set up their restaurant.
    if (!restaurant) { // This condition is only hit if viewAsUserId is NOT present or if it was present but the above block handled it.
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Store className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Restaurant Found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                You need to set up your restaurant first to access the dashboard.
                            </p>
                            {/* This button would typically navigate to a restaurant setup form */}
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Set Up Restaurant
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Main dashboard rendering
    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                            <p className="text-primary-foreground/80">Restaurant Management Dashboard</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4" />
                                    <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                                </div>
                                <p className="text-sm text-primary-foreground/80">
                                    {restaurant.review_count} reviews
                                </p>
                            </div>
                            <Badge variant={restaurant.is_active ? "secondary" : "destructive"}>
                                {restaurant.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Tabs defaultValue="orders" className="space-y-6">
                    {/* Tabs Navigation */}
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="menu">Menu & Stock</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Orders Tab Content */}
                    <TabsContent value="orders" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Recent Orders</h2>
                            <Badge variant="secondary">{orders.length} pending orders</Badge>
                        </div>

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
                                                    {order.customer.display_name} • {new Date(order.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                                                <div className="space-x-1">
                                                    {/* Conditional buttons for order status updates */}
                                                    {order.status === 'pending' && (
                                                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                                                            Confirm
                                                        </Button>
                                                    )}
                                                    {order.status === 'confirmed' && (
                                                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                                            Start Preparing
                                                        </Button>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                                                            Mark Ready
                                                        </Button>
                                                    )}
                                                    {order.status === 'ready' && (
                                                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'picked_up')}>
                                                            Picked Up
                                                        </Button>
                                                    )}
                                                    {order.status === 'picked_up' && (
                                                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivering')}>
                                                            Delivering
                                                        </Button>
                                                    )}
                                                    {order.status === 'delivering' && (
                                                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                                            Delivered
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {order.order_items.map((item) => (
                                                <div key={item.id} className="flex justify-between">
                                                    <span>{item.quantity}x {item.menu_item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {orders.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No recent orders found.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Menu & Stock Management Tab Content */}
                    <TabsContent value="menu" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Menu & Stock Management</h2>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {menuItems.map((item) => (
                                <Card key={item.id} className={item.stock_quantity <= item.low_stock_threshold ? 'border-orange-200' : ''}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{item.name}</CardTitle>
                                            <div className="flex items-center space-x-2">
                                                {item.stock_quantity <= item.low_stock_threshold && (
                                                    <Badge variant="destructive">Low Stock</Badge>
                                                )}
                                                <Switch
                                                    checked={item.is_available}
                                                    onCheckedChange={(checked) => toggleMenuItemAvailability(item.id, checked)}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {item.image_url && (
                                            <div className="aspect-video rounded-md overflow-hidden">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    // Fallback for broken images
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null; // prevents infinite loop
                                                        e.currentTarget.src = `https://placehold.co/300x200/cccccc/333333?text=No+Image`;
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{formatPrice(item.price)}</span>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{item.prep_time}min</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor={`stock-${item.id}`} className="text-sm font-medium">
                                                    Stock Quantity
                                                </Label>
                                                <Badge variant={item.stock_quantity > item.low_stock_threshold ? 'default' : 'destructive'}>
                                                    {item.stock_quantity} units
                                                </Badge>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id={`stock-${item.id}`}
                                                    type="number"
                                                    value={item.stock_quantity}
                                                    onChange={(e) => updateMenuItemStock(item.id, parseInt(e.target.value) || 0)}
                                                    className="h-8"
                                                    min="0"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateMenuItemStock(item.id, item.stock_quantity + 10)}
                                                >
                                                    +10
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`image-${item.id}`} className="text-sm font-medium">
                                                Product Image
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id={`image-${item.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageUpload(item.id, file);
                                                        }
                                                    }}
                                                    className="h-8"
                                                    disabled={isUploadingImage}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {menuItems.length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground">
                                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No menu items found. Add some to get started!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Team Management Tab Content */}
                    <TabsContent value="team" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Team Management</h2>
                            <Button onClick={() => {
                                // Using browser prompt for simplicity. In a real app, use a custom modal.
                                const email = prompt('Enter email address to invite:');
                                const role = prompt('Enter role (owner/manager/staff):', 'staff');
                                if (email && role) inviteUser(email, role);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Invite User
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Restaurant Team</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Manage users who can access your restaurant dashboard
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Restaurant Owner (current logged-in or viewed as) */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{profile?.display_name || user?.email || 'Restaurant Owner'}</p>
                                                <p className="text-sm text-muted-foreground">Owner</p>
                                            </div>
                                        </div>
                                        <Badge>Owner</Badge>
                                    </div>

                                    {/* Team Members */}
                                    {restaurantUsers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-secondary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{member.profiles?.display_name || 'Unknown User'}</p>
                                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline">{member.role}</Badge>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {restaurantUsers.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No team members yet. Invite users to help manage your restaurant.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab Content */}
                    <TabsContent value="analytics" className="space-y-6">
                        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{orders.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        +10% from last month (placeholder)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatPrice(orders.reduce((sum, order) => sum + order.total_amount, 0))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        +15% from last month (placeholder)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{restaurant.rating.toFixed(1)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {restaurant.review_count} reviews
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{menuItems.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {menuItems.filter(item => item.is_available).length} available
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Settings Tab Content */}
                    <TabsContent value="settings" className="space-y-6">
                        <h2 className="text-2xl font-bold">Restaurant Settings</h2>

                        <Card>
                            <CardHeader>
                                <CardTitle>Restaurant Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Restaurant Name</Label>
                                        <Input id="name" value={restaurant.name} readOnly /> {/* Added readOnly for demonstration */}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cuisine">Cuisine Type</Label>
                                        <Input id="cuisine" value={restaurant.cuisine_type || ''} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" value={restaurant.phone || ''} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={restaurant.email || ''} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="delivery_fee">Delivery Fee (NGN)</Label>
                                        <Input id="delivery_fee" value={(restaurant.delivery_fee / 100).toString()} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="min_order">Minimum Order (NGN)</Label>
                                        <Input id="min_order" value={(restaurant.min_order_amount / 100).toString()} readOnly />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" value={restaurant.description || ''} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" value={restaurant.address} readOnly />
                                </div>
                                {/* Save Changes button would be active if these fields were editable */}
                                <Button disabled>Save Changes (Read-only for now)</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
