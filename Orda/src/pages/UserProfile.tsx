import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Phone, Mail, Camera, Star } from 'lucide-react';

const UserProfile: React.FC = () => {
    const { user, profile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
    });

    const orderHistory = [
        {
            id: '1',
            restaurant: 'Lagos Kitchen',
            items: ['Jollof Rice', 'Grilled Chicken'],
            total: 3500,
            date: '2024-01-15',
            status: 'delivered'
        },
        {
            id: '2',
            restaurant: 'Amala Spot',
            items: ['Amala & Ewedu', 'Assorted Meat'],
            total: 2800,
            date: '2024-01-10',
            status: 'delivered'
        }
    ];

    const handleSave = async () => {
        try {
            // Here you would update the profile in your database
            console.log('Updating profile:', formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="orders">Order History</TabsTrigger>
                        <TabsTrigger value="addresses">Addresses</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Personal Information</CardTitle>
                                    <Button 
                                        variant={isEditing ? "outline" : "default"}
                                        onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                    >
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={profile?.avatar_url} />
                                        <AvatarFallback>
                                            {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{profile?.full_name || 'User'}</h3>
                                        <p className="text-muted-foreground">{user?.email}</p>
                                        <Badge variant="secondary" className="mt-1">
                                            {profile?.user_type || 'Customer'}
                                        </Badge>
                                    </div>
                                    {isEditing && (
                                        <Button variant="outline" size="sm">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Change Photo
                                        </Button>
                                    )}
                                </div>

                                <Separator />

                                {/* Form Fields */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={user?.email || ''}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave}>Save Changes</Button>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {orderHistory.map((order) => (
                                        <div key={order.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{order.restaurant}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.items.join(', ')}
                                                    </p>
                                                </div>
                                                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span>{order.date}</span>
                                                <span className="font-medium">₦{order.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="addresses">
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Manage your delivery addresses</p>
                                {/* Address management UI would go here */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Manage your app preferences and notifications</p>
                                {/* Preferences UI would go here */}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default UserProfile;