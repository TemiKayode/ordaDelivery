import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Ensure all Select components are imported
import DriverDashboard from './DriverDashboard';
import RestaurantDashboard from './RestaurantDashboard';
import CustomerDashboard from './CustomerDashboard';


// ... (AnalyticsOverview and UserActivityFeed remain the same)

export default function AdminDashboard() {
    const { user, profile, loading } = useAuth();
    const [drivers, setDrivers] = useState<any[]>([]);
    const [sellers, setSellers] = useState<any[]>([]); // New state for sellers
    const [customers, setCustomers] = useState<any[]>([]); // New state for customers
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null); // New state for selected customer

    useEffect(() => {
        const fetchData = async () => {
            // Fetch all drivers
            const { data: driversData, error: driversError } = await supabase
                .from('profiles')
                .select('id, display_name')
                .eq('user_type', 'driver');
            if (!driversError) setDrivers(driversData || []);

            // Fetch all sellers (restaurants)
            const { data: sellersData, error: sellersError } = await supabase
                .from('profiles')
                .select('id, display_name') // Assuming 'display_name' is suitable for restaurants, or you might need to join with a 'restaurants' table if their names are there.
                .eq('user_type', 'seller'); // Assuming 'seller' is the user_type for restaurants
            if (!sellersError) setSellers(sellersData || []);

            // Fetch all customers
            const { data: customersData, error: customersError } = await supabase
                .from('profiles')
                .select('id, display_name')
                .eq('user_type', 'customer');
            if (!customersError) setCustomers(customersData || []);
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    if (!profile?.is_admin) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs defaultValue="analytics" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="activity">User Activity</TabsTrigger>
                    <TabsTrigger value="driver">Drivers</TabsTrigger>
                    <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
                    <TabsTrigger value="customer">Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                    <AnalyticsOverview />
                </TabsContent>

                <TabsContent value="activity">
                    <UserActivityFeed />
                </TabsContent>

                <TabsContent value="driver">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select a Driver</label>
                        <Select onValueChange={setSelectedDriverId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id}>
                                        {driver.display_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedDriverId ? (
                        <DriverDashboard viewAsUserId={selectedDriverId} />
                    ) : (
                        <p>Select a driver to view their dashboard</p>
                    )}
                </TabsContent>

                <TabsContent value="restaurant">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select a Restaurant</label>
                        <Select onValueChange={setSelectedSellerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a restaurant" />
                            </SelectTrigger>
                            <SelectContent>
                                {sellers.map((seller) => (
                                    <SelectItem key={seller.id} value={seller.id}>
                                        {seller.display_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedSellerId ? (
                        <RestaurantDashboard viewAsUserId={selectedSellerId} />
                    ) : (
                        <p>Select a restaurant to view its dashboard</p>
                    )}
                </TabsContent>

                <TabsContent value="customer">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select a Customer</label>
                        <Select onValueChange={setSelectedCustomerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                        {customer.display_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCustomerId ? (
                        <CustomerDashboard viewAsUserId={selectedCustomerId} />
                    ) : (
                        <p>Select a customer to view their dashboard</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}