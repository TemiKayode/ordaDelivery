import React from 'react';
import { Percent, Clock, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PromotionalBanner: React.FC = () => {
  const promotions = [
    {
      id: 1,
      title: "New User Special",
      description: "Get 25% off your first order",
      code: "ORDNEW25",
      icon: <Gift className="h-5 w-5" />,
      color: "from-purple-500 to-pink-500",
      discount: "25% OFF"
    },
    {
      id: 2,
      title: "Free Delivery Weekend",
      description: "No delivery fees on orders above ₦3000",
      code: "FREEDELIVERY",
      icon: <Percent className="h-5 w-5" />,
      color: "from-green-500 to-emerald-500",
      discount: "FREE"
    },
    {
      id: 3,
      title: "Quick Bites",
      description: "Fast food under 15 minutes",
      code: "QUICK15",
      icon: <Clock className="h-5 w-5" />,
      color: "from-orange-500 to-red-500",
      discount: "< 15 MIN"
    }
  ];

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // In a real app, you'd show a toast notification here
    alert(`Promo code ${code} copied to clipboard!`);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Special Offers</h2>
        <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
          View All Offers
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <Card 
            key={promo.id}
            className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`bg-gradient-to-r ${promo.color} p-1`}>
              <CardContent className="bg-white m-1 rounded-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`bg-gradient-to-r ${promo.color} text-white p-2 rounded-lg`}>
                    {promo.icon}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`bg-gradient-to-r ${promo.color} text-white border-0`}
                  >
                    {promo.discount}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {promo.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {promo.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="bg-gray-100 px-3 py-1 rounded border-2 border-dashed border-gray-300">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {promo.code}
                      </span>
                    </div>
                    <Button
                      onClick={() => copyPromoCode(promo.code)}
                      variant="outline"
                      size="sm"
                      className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PromotionalBanner;