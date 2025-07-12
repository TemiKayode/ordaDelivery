import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { formatNaira } from '@/utils/currencyFormatter';

const CheckoutPage: React.FC = () => {
    const { items, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [deliveryInfo, setDeliveryInfo] = useState({
        address: '',
        phone: '',
        notes: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const deliveryFee = 500;
    const total = getCartTotal() + deliveryFee;

    const handlePlaceOrder = async () => {
        if (!user || items.length === 0) return;

        setIsProcessing(true);
        try {
            // Here you would typically:
            // 1. Create order in database
            // 2. Process payment
            // 3. Send notifications

            // For now, simulate processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            clearCart();
            navigate('/customer/order-confirmation/123', { replace: true });
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">Add some items before checkout!</p>
                        <Button onClick={() => navigate('/customer/dashboard')}>
                            Browse Restaurants
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    {/* Delivery Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="address">Delivery Address</Label>
                                <Input
                                    id="address"
                                    value={deliveryInfo.address}
                                    onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                                    placeholder="Enter your full address"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={deliveryInfo.phone}
                                    onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                                    placeholder="Your phone number"
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                                <Input
                                    id="notes"
                                    value={deliveryInfo.notes}
                                    onChange={(e) => setDeliveryInfo({...deliveryInfo, notes: e.target.value})}
                                    placeholder="Any special instructions"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="card" id="card" />
                                    <Label htmlFor="card">Credit/Debit Card</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash">Cash on Delivery</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="transfer" id="transfer" />
                                    <Label htmlFor="transfer">Bank Transfer</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item) => (
                                <div key={`${item.id}-${JSON.stringify(item.customizations)}`} className="flex justify-between">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>{formatNaira(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatNaira(getCartTotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>{formatNaira(deliveryFee)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>{formatNaira(total)}</span>
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || !deliveryInfo.address || !deliveryInfo.phone}
                            >
                                {isProcessing ? 'Processing...' : `Place Order - ${formatNaira(total)}`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;