import React, { useState } from 'react';
import { MapPin, ShoppingCart, User, LogOut, Menu, Bell, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import NotificationCenter from './NotificationCenter';

interface NavigationProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  currentUser: any;
  profile?: any;
  onLogout: () => void;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  onCartClick,
  onAuthClick,
  currentUser,
  profile,
  onLogout,
  isAdmin = false
}) => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg p-2">
              <span className="font-bold text-xl">Orda</span>
            </div>
            <div className="hidden md:block">
              <span className="text-lg font-semibold text-foreground">Food Delivery</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* User Greeting */}
            {currentUser && (
              <div className="text-foreground">
                <span className="text-sm font-medium">
                  Hi {profile?.display_name?.split(' ')[0] || currentUser.email?.split('@')[0] || 'there'}! 
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  What would you like to order today?
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Osogbo, Osun State</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications Button */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative text-foreground hover:text-accent hover:bg-accent/10"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onCartClick}
                className="relative text-foreground hover:text-accent hover:bg-accent/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 bg-accent h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-foreground hover:text-accent hover:bg-accent/10">
                      <User className="h-5 w-5 mr-2" />
                      <span className="hidden lg:inline">{profile?.display_name?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => {
                      const dashboardPath = profile?.user_type === 'customer' ? '/customer-dashboard' :
                                          profile?.user_type === 'restaurant' ? '/restaurant-dashboard' :
                                          profile?.user_type === 'driver' ? '/driver-dashboard' : '/';
                      window.location.href = dashboardPath;
                    }}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {/* Admin Menu Items */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => window.location.href = '/driver-dashboard'}>
                          <Truck className="mr-2 h-4 w-4" />
                          Driver Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = '/restaurant-dashboard'}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Restaurant Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={onAuthClick}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative text-foreground hover:text-accent"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 bg-accent h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {currentUser ? (
                  <>
                    <DropdownMenuItem onClick={() => {
                      const dashboardPath = profile?.user_type === 'customer' ? '/customer-dashboard' :
                                            profile?.user_type === 'restaurant' ? '/restaurant-dashboard' :
                                            profile?.user_type === 'driver' ? '/driver-dashboard' : '/';
                      window.location.href = dashboardPath;
                    }}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {/* Admin Menu Items for Mobile */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => window.location.href = '/driver-dashboard'}>
                          <Truck className="mr-2 h-4 w-4" />
                          Driver Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = '/restaurant-dashboard'}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Restaurant Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={onAuthClick}>
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
};

export default Navigation;