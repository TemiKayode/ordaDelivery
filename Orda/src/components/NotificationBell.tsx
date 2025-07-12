
import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead?: (id: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  notifications, 
  onMarkAsRead 
}) => {
  const unreadCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-3 border-b last:border-b-0 hover:bg-muted/50"
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
