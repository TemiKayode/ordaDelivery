// src/pages/CartPage.tsx
import React, { useState } from 'react'; // Make sure React is imported
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, XCircle } from 'lucide-react';
import { formatNaira } from '@/utils/currencyFormatter';

// Define CartItem interface (adjust based on your actual cart item structure)
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    // Potentially: add_ons, restaurant_id, restaurant_name
}

// Change `export const CartPage` to `const CartPage`
const CartPage: React.FC = () => {
    // Placeholder cart state - you'll get this from a global state/context (e.g., Zustand, React Context)
    const cartItems: CartItem[] = [
        { id: '1', name: 'Jollof Rice with Chicken', price: 2500, quantity: 1, image: '/placeholder/jollof.jpg' },
        { id: '2', name: 'Pounded Yam with Egusi', price: 3000, quantity: 2, image: '/placeholder/pounded_yam.jpg' },
        { id: '3', name: 'Coca-Cola (50cl)', price: 300, quantity: 3, image: '/placeholder/coke.jpg' },
    ];

    // Placeholder for delivery fee and service fee
    const deliveryFee = 500;
    const serviceFee = 100;

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + deliveryFee + serviceFee;

    // Placeholder functions for cart actions
    const handleRemoveItem = (id: string) => {
        console.log(`Remove item: ${id}`);
        // Implement logic to remove item from global cart state
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        console.log(`Update quantity for ${id} to ${newQuantity}`);
        // Implement logic to update item quantity in global cart state
    };

    const handleProceedToCheckout = () => {
        console.log("Proceeding to checkout...");
        // Implement navigation to /checkout
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Your Cart</h1>

            {cartItems.length === 0 ? (
                <Card className="p-8 text-center border">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-xl font-semibold text-foreground">Your cart is empty!</p>
                    <p className="text-muted-foreground mt-2">Start adding delicious meals to your basket.</p>
                    <Button className="mt-6">Explore Restaurants</Button> {/* Link to customer dashboard */}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <ScrollArea className="h-[calc(100vh-200px)] md:h-auto rounded-md border p-4">
                            {cartItems.map((item) => (
                                <Card key={item.id} className="mb-4">
                                    <CardContent className="flex items-center p-4">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                                        )}
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                            <p className="text-muted-foreground text-sm">{formatNaira(item.price)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                                            <span className="font-medium">{item.quantity}</span>
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                                <XCircle className="h-5 w-5 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </ScrollArea>
                    </div>

                    <div className="md:col-span-1">
                        <Card className="p-4 border shadow-sm">
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
                                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{formatNaira(total)}</span>
                                </div>
                                <Button className="w-full mt-4" size="lg" onClick={handleProceedToCheckout}>
                                    Proceed to Checkout
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage; // <<< Add this line at the very end of the file