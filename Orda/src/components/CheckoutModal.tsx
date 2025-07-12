import React, { useState } from 'react';
import { MapPin, CreditCard, User, Phone, Clock, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CartItem } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  total
}) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [orderData, setOrderData] = useState({
    deliveryAddress: '',
    phone: '',
    paymentMethod: '',
    specialInstructions: '',
    estimatedTime: '25-35'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep(3);
    setIsProcessing(false);
    
    toast({
      title: "Order Placed Successfully!",
      description: "Your delicious food is being prepared.",
    });
  };

  const resetAndClose = () => {
    setStep(1);
    setOrderData({
      deliveryAddress: '',
      phone: '',
      paymentMethod: '',
      specialInstructions: '',
      estimatedTime: '25-35'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center space-x-2">
            {step === 1 && <><User className="h-6 w-6 text-accent" /><span>Delivery Details</span></>}
            {step === 2 && <><CreditCard className="h-6 w-6 text-accent" /><span>Payment</span></>}
            {step === 3 && <><CheckCircle className="h-6 w-6 text-green-500" /><span>Order Confirmed</span></>}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div 
                  className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Delivery Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <Textarea
                    id="address"
                    placeholder="Enter your full delivery address"
                    value={orderData.deliveryAddress}
                    onChange={(e) => setOrderData({ ...orderData, deliveryAddress: e.target.value })}
                    className="pl-10 min-h-[80px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="080XXXXXXXX"
                      value={orderData.phone}
                      onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Delivery Time</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{orderData.estimatedTime} minutes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Any special requests for your order..."
                value={orderData.specialInstructions}
                onChange={(e) => setOrderData({ ...orderData, specialInstructions: e.target.value })}
                className="min-h-[60px]"
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
              disabled={!orderData.deliveryAddress || !orderData.phone}
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-accent">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <Label>Payment Method *</Label>
              <Select 
                value={orderData.paymentMethod} 
                onValueChange={(value) => setOrderData({ ...orderData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="card">Debit/Credit Card</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wallet">Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Delivery Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your order will be delivered to: {orderData.deliveryAddress}
                  </p>
                  <p className="text-sm text-blue-700">
                    Phone: {orderData.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handlePlaceOrder}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!orderData.paymentMethod || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Place Order - ₦${total.toLocaleString()}`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h3>
              <p className="text-gray-600">Your order has been placed successfully</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-foreground mb-3">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Total</span>
                  <span className="font-medium">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium capitalize">{orderData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-medium">{orderData.estimatedTime} mins</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetAndClose}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={resetAndClose}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Track Order
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;