
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Bell,
    Package,
    Truck,
    CheckCircle,
    AlertCircle,
    Star,
    DollarSign,
    Clock,
    X
} from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'delivery' | 'promotion' | 'system' | 'review';
    is_read: boolean;
    created_at: string;
    order_id?: string;
    restaurant_id?: string;
    driver_id?: string;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user && isOpen) {
            fetchNotifications();
            subscribeToNotifications();
        }
    }, [user, isOpen]);

    const fetchNotifications = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast({
                title: "Error",
                description: "Failed to load notifications",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = () => {
        if (!user) return;

        const subscription = supabase
            .channel(`notifications_${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                const newNotification = payload.new as Notification;
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Show toast notification
                toast({
                    title: newNotification.title,
                    description: newNotification.message,
                });
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);

            toast({
                title: "Success",
                description: "All notifications marked as read",
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast({
                title: "Error",
                description: "Failed to mark notifications as read",
                variant: "destructive",
            });
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast({
                title: "Error",
                description: "Failed to delete notification",
                variant: "destructive",
            });
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package className="h-5 w-5 text-blue-500" />;
            case 'delivery': return <Truck className="h-5 w-5 text-green-500" />;
            case 'promotion': return <DollarSign className="h-5 w-5 text-purple-500" />;
            case 'review': return <Star className="h-5 w-5 text-yellow-500" />;
            case 'system': return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate to relevant page based on notification type
        if (notification.order_id) {
            window.location.href = `/customer/track-order/${notification.order_id}`;
        } else if (notification.restaurant_id) {
            window.location.href = `/customer/restaurant/${notification.restaurant_id}`;
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </SheetTitle>
                            <SheetDescription>
                                Stay updated with your orders and account activity
                            </SheetDescription>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                            <p className="text-muted-foreground">
                                You'll see your notifications here when they arrive
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <Card 
                                        key={notification.id}
                                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                            !notification.is_read ? 'border-primary/20 bg-primary/5' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className={`text-sm font-medium ${
                                                                !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                                            }`}>
                                                                {notification.title}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(notification.created_at).toLocaleString()}
                                                                </span>
                                                                {!notification.is_read && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        New
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default NotificationCenter;
