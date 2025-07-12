// src/pages/CheckoutPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Check, CreditCard, Home, MapPin, Wallet } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter'; // Assuming this path

// Define Address and PaymentMethod interfaces (adjust as per your data models)
interface Address {
    id: string;
    label: string; // e.g., "Home", "Work"
    address_line1: string;
    city: string;
    state: string;
    // Add other address fields
}

// Change `export const CheckoutPage` to `const CheckoutPage`
const CheckoutPage: React.FC = () => {
    // Placeholder order summary details (you'd get these from cart state/context)
    const subtotal = 5800;
    const deliveryFee = 500;
    const serviceFee = 100;
    const total = subtotal + deliveryFee + serviceFee;

    // Placeholder for selected address and payment method
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card'); // 'card', 'cash'
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    // Placeholder for user's saved addresses
    const savedAddresses: Address[] = [
        { id: 'addr1', label: 'Home', address_line1: '123 Main St, Lekki', city: 'Lagos', state: 'Lagos' },
        { id: 'addr2', label: 'Work', address_line1: '45B Business Park, Victoria Island', city: 'Lagos', state: 'Lagos' },
    ];

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            // Replaced alert with console.error as per instructions
            console.error('Please select a delivery address.');
            // You might want to show a custom UI message here instead of alert
            return;
        }
        console.log('Placing order with:', {
            address: selectedAddress,
            paymentMethod: selectedPaymentMethod,
            instructions: deliveryInstructions,
            totalAmount: total,
        });
        // Implement actual order creation API call and navigate to order confirmation page
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Address Section */}
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedAddress?.id} onValueChange={(value) => setSelectedAddress(savedAddresses.find(a => a.id === value) || null)}>
                                <div className="space-y-4">
                                    {savedAddresses.map((address) => (
                                        <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                                            <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                                            <Label htmlFor={`address-${address.id}`} className="flex flex-col flex-grow cursor-pointer">
                                                <span className="font-medium text-base">{address.label}</span>
                                                <span className="text-sm text-muted-foreground">{address.address_line1}, {address.city}, {address.state}</span>
                                            </Label>
                                        </div>
                                    ))}
                                    {/* Add option to add new address */}
                                    <Button variant="outline" className="w-full">
                                        <Home className="h-4 w-4 mr-2" /> Add New Address
                                    </Button>
                                </div>
                            </RadioGroup>
                            <div className="mt-6">
                                <Label htmlFor="delivery-instructions">Delivery Instructions (Optional)</Label>
                                <Textarea
                                    id="delivery-instructions"
                                    placeholder="e.g., Gate code, leave at reception, call on arrival"
                                    className="mt-2"
                                    value={deliveryInstructions}
                                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method Section */}
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                                        <RadioGroupItem value="card" id="payment-card" />
                                        <Label htmlFor="payment-card" className="flex items-center flex-grow cursor-pointer font-medium">
                                            <CreditCard className="h-5 w-5 mr-2" /> Pay with Card
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                                        <RadioGroupItem value="cash" id="payment-cash" />
                                        <Label htmlFor="payment-cash" className="flex items-center flex-grow cursor-pointer font-medium">
                                            <Wallet className="h-5 w-5 mr-2" /> Cash on Delivery
                                        </Label>
                                    </div>
                                    {/* Potentially: Add more payment options like Wallet, Bank Transfer */}
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary & Place Order Button */}
                <div className="lg:col-span-1">
                    <Card className="p-4 border shadow-sm sticky top-4"> {/* Added sticky for better UX on scroll */}
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatNaira(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Delivery Fee:</span>
                                <span>{formatNaira(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Service Fee:</span>
                                <span>{formatNaira(serviceFee)}</span>
                            </div>
                            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-xl">
                                <span>Total:</span>
                                <span>{formatNaira(total)}</span>
                            </div>
                            <Button
                                className="w-full mt-4"
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={!selectedAddress} // Disable if no address selected
                            >
                                Place Order {formatNaira(total)}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage; // <<< Add this line at the very end of the file