import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Store, MapPin, Phone, Mail, Clock, DollarSign, Upload } from 'lucide-react';

const RestaurantOnboarding = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cuisine_type: '',
    delivery_fee: '',
    min_order_amount: '',
    avg_delivery_time: '30',
    image_url: '',
    cover_image_url: '',
    opening_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }
  });

  // Redirect if not authenticated or not a restaurant owner
  if (!loading && (!user || profile?.user_type !== 'restaurant')) {
    return <Navigate to="/auth" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setRestaurantData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setRestaurantData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day as keyof typeof prev.opening_hours],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return restaurantData.name && restaurantData.description && restaurantData.cuisine_type;
      case 2:
        return restaurantData.address && restaurantData.phone && restaurantData.email;
      case 3:
        return restaurantData.delivery_fee && restaurantData.min_order_amount;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const submitRestaurant = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Convert fees from naira to cents
      const deliveryFeeInCents = Math.round(parseFloat(restaurantData.delivery_fee) * 100);
      const minOrderInCents = Math.round(parseFloat(restaurantData.min_order_amount) * 100);

      const { error } = await supabase
        .from('restaurants')
        .insert({
          owner_id: user.id,
          name: restaurantData.name,
          description: restaurantData.description,
          address: restaurantData.address,
          phone: restaurantData.phone,
          email: restaurantData.email,
          cuisine_type: restaurantData.cuisine_type,
          delivery_fee: deliveryFeeInCents,
          min_order_amount: minOrderInCents,
          avg_delivery_time: parseInt(restaurantData.avg_delivery_time),
          image_url: restaurantData.image_url || null,
          cover_image_url: restaurantData.cover_image_url || null,
          opening_hours: restaurantData.opening_hours,
          is_active: false, // Requires admin approval
          is_verified: false
        });

      if (error) throw error;

      toast({
        title: "Restaurant Submitted",
        description: "Your restaurant has been submitted for review. You'll be notified once it's approved.",
      });

      // Redirect to dashboard
      window.location.href = '/restaurant-dashboard';
    } catch (error) {
      console.error('Error submitting restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to submit restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cuisineTypes = [
    'Nigerian', 'Continental', 'Fast Food', 'Chinese', 'Indian', 'Italian', 
    'Mexican', 'Japanese', 'Lebanese', 'Seafood', 'Vegetarian', 'Desserts', 'Other'
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Store className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Restaurant Onboarding</h1>
              <p className="text-primary-foreground/80">
                Join Orda and start receiving orders from customers in your area
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Restaurant Information"}
              {step === 2 && "Contact & Location"}
              {step === 3 && "Pricing & Delivery"}
              {step === 4 && "Operating Hours"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={restaurantData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your restaurant name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={restaurantData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your restaurant and what makes it special"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="cuisine_type">Cuisine Type *</Label>
                  <Select value={restaurantData.cuisine_type} onValueChange={(value) => handleInputChange('cuisine_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={restaurantData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete restaurant address"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={restaurantData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="08012345678"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={restaurantData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="restaurant@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Delivery */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="delivery_fee">Delivery Fee (₦) *</Label>
                    <Input
                      id="delivery_fee"
                      type="number"
                      value={restaurantData.delivery_fee}
                      onChange={(e) => handleInputChange('delivery_fee', e.target.value)}
                      placeholder="500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="min_order_amount">Minimum Order (₦) *</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      value={restaurantData.min_order_amount}
                      onChange={(e) => handleInputChange('min_order_amount', e.target.value)}
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avg_delivery_time">Avg. Delivery Time (mins)</Label>
                    <Input
                      id="avg_delivery_time"
                      type="number"
                      value={restaurantData.avg_delivery_time}
                      onChange={(e) => handleInputChange('avg_delivery_time', e.target.value)}
                      placeholder="30"
                      min="10"
                      max="120"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Operating Hours */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Set Your Operating Hours</h3>
                {days.map((day) => (
                  <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={restaurantData.opening_hours[day as keyof typeof restaurantData.opening_hours].open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        disabled={restaurantData.opening_hours[day as keyof typeof restaurantData.opening_hours].closed}
                        className="w-24"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={restaurantData.opening_hours[day as keyof typeof restaurantData.opening_hours].close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        disabled={restaurantData.opening_hours[day as keyof typeof restaurantData.opening_hours].closed}
                        className="w-24"
                      />
                    </div>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={restaurantData.opening_hours[day as keyof typeof restaurantData.opening_hours].closed}
                        onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                      />
                      <span className="text-sm">Closed</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 4 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={submitRestaurant}
                  disabled={submitting}
                  className="flex items-center space-x-2"
                >
                  <Store className="h-4 w-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Restaurant'}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantOnboarding;