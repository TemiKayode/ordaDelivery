// src/pages/UserProfile.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Key, MapPin, User, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have an AuthContext

// Define Address and PaymentMethod interfaces (match your Supabase schema)
interface Address {
    id: string;
    label: string;
    address_line1: string;
    city: string;
    state: string;
    zip_code?: string;
    // Add other address fields
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'bank_transfer' | 'ussd'; // etc.
    last4?: string; // Last 4 digits of card
    bank_name?: string;
    // Add other relevant payment details
}

// Change `export const UserProfile` to `const UserProfile`
const UserProfile: React.FC = () => {
    const { user, signOut } = useAuth(); // Get user info from auth context

    // Placeholder user data and state for forms
    const [userName, setUserName] = useState(user?.user_metadata?.full_name || 'John Doe');
    const [userEmail, setUserEmail] = useState(user?.email || 'user@example.com');
    const [userPhone, setUserPhone] = useState(user?.phone || 'N/A');

    const [addresses, setAddresses] = useState<Address[]>([
        { id: 'a1', label: 'Home', address_line1: '123 Main St', city: 'Lagos', state: 'Lagos', zip_code: '100001' },
        { id: 'a2', label: 'Office', address_line1: '456 Business Ave', city: 'Lagos', state: 'Lagos', zip_code: '100001' },
    ]);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: 'pm1', type: 'card', last4: '4242' },
        { id: 'pm2', type: 'bank_transfer', bank_name: 'GTBank' },
    ]);

    // Handle form submissions
    const handleUpdateProfile = () => {
        console.log('Update profile:', { userName, userEmail, userPhone });
        // Call API to update user profile
    };

    const handleAddAddress = () => {
        console.log('Add new address');
        // Implement modal/form to add new address
    };

    const handleDeleteAddress = (id: string) => {
        console.log('Delete address:', id);
        setAddresses(addresses.filter(addr => addr.id !== id));
        // Call API to delete address
    };

    const handleAddPaymentMethod = () => {
        console.log('Add new payment method');
        // Implement modal/form to add new payment method
    };

    const handleDeletePaymentMethod = (id: string) => {
        console.log('Delete payment method:', id);
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
        // Call API to delete payment method
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground">User Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="mt-1" disabled /> {/* Email often not editable directly */}
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="mt-1" />
                        </div>
                        <Button onClick={handleUpdateProfile} className="w-full">Save Changes</Button>
                        <Button variant="outline" className="w-full">
                            <Key className="h-4 w-4 mr-2" /> Change Password
                        </Button>
                    </CardContent>
                </Card>

                {/* Delivery Addresses */}
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" /> Delivery Addresses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="border p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{addr.label}</p>
                                    <p className="text-sm text-muted-foreground">{addr.address_line1}, {addr.city}</p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteAddress(addr.id)}>Remove</Button>
                            </div>
                        ))}
                        <Button onClick={handleAddAddress} className="w-full">Add New Address</Button>
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="border shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" /> Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {paymentMethods.map((pm) => (
                            <div key={pm.id} className="border p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold capitalize">
                                        {pm.type} {pm.last4 ? `(**** ${pm.last4})` : ''} {pm.bank_name ? `(${pm.bank_name})` : ''}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Securely saved</p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePaymentMethod(pm.id)}>Remove</Button>
                            </div>
                        ))}
                        <Button onClick={handleAddPaymentMethod} className="w-full">Add New Payment Method</Button>
                    </CardContent>
                </Card>

                {/* Logout Section */}
                <Card className="border shadow-sm lg:col-span-2">
                    <CardContent className="p-4 flex justify-center">
                        <Button variant="outline" className="w-full max-w-sm" onClick={signOut}>Log Out</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserProfile; // <<< Add this line at the very end of the file