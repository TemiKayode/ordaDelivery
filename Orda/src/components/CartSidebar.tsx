import React from 'react';
import { X, Plus, Minus, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getDeliveryFee,
    getTotalItems
  } = useCart();

  const subtotal = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <span>Your Order</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {getTotalItems()} items
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-gray-400">
                <ShoppingBag className="h-16 w-16 mx-auto" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 text-sm">
                  Add some delicious items to get started!
                </p>
              </div>
              <Button onClick={onClose} className="bg-accent hover:bg-accent/90">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.restaurant}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-accent">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                <h3 className="font-medium text-foreground">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>Delivery Fee</span>
                    </div>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "FREE" : `₦${deliveryFee}`}
                    </span>
                  </div>
                  
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">
                      🎉 Free delivery on orders above ₦5,000
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-accent">₦{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={onCheckout}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium"
              >
                Proceed to Checkout
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;