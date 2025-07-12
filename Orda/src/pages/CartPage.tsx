import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNaira } from '@/utils/currencyFormatter';

const CartPage: React.FC = () => {
    const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
                        <Button asChild>
                            <Link to="/customer/dashboard">Browse Restaurants</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <Card key={`${item.id}-${JSON.stringify(item.customizations)}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    {item.image_url && (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <p className="font-medium text-primary">{formatNaira(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.customizations)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.customizations)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeFromCart(item.id, item.customizations)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatNaira(getCartTotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>{formatNaira(500)}</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatNaira(getCartTotal() + 500)}</span>
                                </div>
                            </div>
                            <Button className="w-full" asChild>
                                <Link to="/customer/checkout">Proceed to Checkout</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CartPage;