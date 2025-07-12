
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DriverDashboard } from './DriverDashboard';
import { CustomerDashboard } from './CustomerDashboard';
import { RestaurantDashboard } from './RestaurantDashboard';
import {
    Users,
    Store,
    Truck,
    Package,
    DollarSign,
    TrendingUp,
    Eye,
    Shield,
    CheckCircle,
    XCircle,
    Search,
    Filter
} from 'lucide-react';

interface User {
    id: string;
    email: string;
    display_name: string;
    user_type: string;
    phone: string;
    created_at: string;
    last_sign_in_at: string;
    is_active: boolean;
}

interface Restaurant {
    id: string;
    name: string;
    owner_id: string;
    cuisine_type: string;
    is_active: boolean;
    created_at: string;
    rating: number;
    total_orders: number;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer: { display_name: string };
    restaurant: { name: string };
    driver: { display_name: string } | null;
}

const AdminDashboard = () => {
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeDrivers: 0
    });
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [dashboardLoading, setDashboardLoading] = useState(true);

    useEffect(() => {
        if (user && profile?.user_type === 'admin') {
            fetchAdminData();
        }
    }, [user, profile]);

    const fetchAdminData = async () => {
        setDashboardLoading(true);
        try {
            // Fetch users with profiles
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;
            setUsers(usersData || []);

            // Fetch restaurants
            const { data: restaurantsData, error: restaurantsError } = await supabase
                .from('restaurants')
                .select(`
                    *,
                    profiles!owner_id(display_name)
                `)
                .order('created_at', { ascending: false });

            if (restaurantsError) throw restaurantsError;
            setRestaurants(restaurantsData || []);

            // Fetch recent orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    status,
                    total_amount,
                    created_at,
                    profiles!customer_id(display_name),
                    restaurants!restaurant_id(name),
                    driver_profiles:profiles!driver_id(display_name)
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (ordersError) throw ordersError;

            const transformedOrders = ordersData?.map(order => ({
                ...order,
                customer: order.profiles,
                restaurant: order.restaurants,
                driver: order.driver_profiles
            })) || [];

            setOrders(transformedOrders);

            // Calculate stats
            const totalRevenue = transformedOrders
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + order.total_amount, 0);

            const activeDrivers = usersData?.filter(user => 
                user.user_type === 'driver' && user.is_active
            ).length || 0;

            setStats({
                totalUsers: usersData?.length || 0,
                totalRestaurants: restaurantsData?.length || 0,
                totalOrders: transformedOrders.length,
                totalRevenue,
                activeDrivers
            });

        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast({
                title: "Error",
                description: "Failed to load admin data",
                variant: "destructive",
            });
        } finally {
            setDashboardLoading(false);
        }
    };

    const updateUserStatus = async (userId: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: isActive })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(user => 
                user.id === userId ? { ...user, is_active: isActive } : user
            ));

            toast({
                title: "Success",
                description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            });
        } catch (error) {
            console.error('Error updating user status:', error);
            toast({
                title: "Error",
                description: "Failed to update user status",
                variant: "destructive",
            });
        }
    };

    const updateRestaurantStatus = async (restaurantId: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('restaurants')
                .update({ is_active: isActive })
                .eq('id', restaurantId);

            if (error) throw error;

            setRestaurants(restaurants.map(restaurant => 
                restaurant.id === restaurantId ? { ...restaurant, is_active: isActive } : restaurant
            ));

            toast({
                title: "Success",
                description: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
            });
        } catch (error) {
            console.error('Error updating restaurant status:', error);
            toast({
                title: "Error",
                description: "Failed to update restaurant status",
                variant: "destructive",
            });
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount / 100);
    };

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

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
        return matchesSearch && matchesType;
    });

    if (loading || dashboardLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || profile?.user_type !== 'admin') {
        return <Navigate to="/auth" replace />;
    }

    if (selectedUser) {
        const selectedUserData = users.find(u => u.id === selectedUser);
        if (selectedUserData?.user_type === 'driver') {
            return (
                <div>
                    <Button 
                        onClick={() => setSelectedUser(null)}
                        className="mb-4"
                        variant="outline"
                    >
                        ← Back to Admin Dashboard
                    </Button>
                    <DriverDashboard viewAsUserId={selectedUser} />
                </div>
            );
        } else if (selectedUserData?.user_type === 'customer') {
            return (
                <div>
                    <Button 
                        onClick={() => setSelectedUser(null)}
                        className="mb-4"
                        variant="outline"
                    >
                        ← Back to Admin Dashboard
                    </Button>
                    <CustomerDashboard viewAsUserId={selectedUser} />
                </div>
            );
        } else if (selectedUserData?.user_type === 'restaurant') {
            return (
                <div>
                    <Button 
                        onClick={() => setSelectedUser(null)}
                        className="mb-4"
                        variant="outline"
                    >
                        ← Back to Admin Dashboard
                    </Button>
                    <RestaurantDashboard viewAsUserId={selectedUser} />
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center space-x-4">
                        <Shield className="h-12 w-12" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-primary-foreground/80">
                                Manage users, restaurants, and orders
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeDrivers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">User Management</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-64"
                                    />
                                </div>
                                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="customer">Customers</SelectItem>
                                        <SelectItem value="restaurant">Restaurants</SelectItem>
                                        <SelectItem value="driver">Drivers</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <Card key={user.id}>
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Users className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{user.display_name || 'No name'}</h3>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.phone} • Joined {new Date(user.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant={user.user_type === 'admin' ? 'destructive' : 'outline'}>
                                                {user.user_type?.charAt(0).toUpperCase() + user.user_type?.slice(1)}
                                            </Badge>
                                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedUser(user.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Dashboard
                                                </Button>
                                                <Button
                                                    variant={user.is_active ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => updateUserStatus(user.id, !user.is_active)}
                                                    disabled={user.user_type === 'admin'}
                                                >
                                                    {user.is_active ? (
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                    )}
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Restaurants Tab */}
                    <TabsContent value="restaurants" className="space-y-6">
                        <h2 className="text-2xl font-bold">Restaurant Management</h2>

                        <div className="space-y-4">
                            {restaurants.map((restaurant) => (
                                <Card key={restaurant.id}>
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                                                <Store className="h-6 w-6 text-secondary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{restaurant.name}</h3>
                                                <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Rating: {restaurant.rating}/5 • {restaurant.total_orders} orders
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                                                {restaurant.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Button
                                                variant={restaurant.is_active ? "destructive" : "default"}
                                                size="sm"
                                                onClick={() => updateRestaurantStatus(restaurant.id, !restaurant.is_active)}
                                            >
                                                {restaurant.is_active ? (
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                )}
                                                {restaurant.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-6">
                        <h2 className="text-2xl font-bold">Order Management</h2>

                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id}>
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div>
                                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {order.customer?.display_name} • {order.restaurant?.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                            <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
