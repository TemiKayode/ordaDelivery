import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChefHat, MapPin, Clock, Star } from 'lucide-react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: ChefHat,
      title: "Welcome to Orda!",
      description: "Discover the best local restaurants and delicious meals delivered right to your door.",
      illustration: "🍽️"
    },
    {
      icon: MapPin,
      title: "Find Local Favorites",
      description: "Browse restaurants near you in Osogbo and discover authentic Nigerian cuisine.",
      illustration: "📍"
    },
    {
      icon: Clock,
      title: "Quick & Easy Ordering",
      description: "Order your favorite meals with just a few taps. Fast delivery, fresh food.",
      illustration: "⚡"
    },
    {
      icon: Star,
      title: "Ready to Order?",
      description: "Let's get you started with your first delicious meal!",
      illustration: "🎉"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto bg-background border-border">
        <DialogHeader className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {steps[currentStep].illustration}
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base leading-relaxed">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-accent' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={nextStep}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-3"
            >
              {currentStep === steps.length - 1 ? "Let's Start Ordering!" : "Continue"}
            </Button>
            
            {currentStep < steps.length - 1 && (
              <Button
                variant="ghost"
                onClick={skipTutorial}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip Tutorial
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GetStartedModal;