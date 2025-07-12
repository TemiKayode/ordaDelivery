
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Star, Package } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  suffix = ''
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}{suffix}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs">
            {changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}% from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PerformanceMetricsProps {
  type: 'driver' | 'restaurant';
  metrics: {
    [key: string]: any;
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ type, metrics }) => {
  if (type === 'driver') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Earnings"
          value={`₦${metrics.todayEarnings?.toLocaleString() || 0}`}
          change={15}
          changeType="increase"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Deliveries Today"
          value={metrics.todayDeliveries || 0}
          change={8}
          changeType="increase"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Average Rating"
          value={metrics.avgRating || 0}
          suffix="/5"
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Completion Rate"
          value={metrics.completionRate || 0}
          suffix="%"
          change={2}
          changeType="increase"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Today's Revenue"
        value={`₦${metrics.todayRevenue?.toLocaleString() || 0}`}
        change={12}
        changeType="increase"
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Orders Today"
        value={metrics.todayOrders || 0}
        change={5}
        changeType="increase"
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Avg Prep Time"
        value={metrics.avgPreparationTime || 0}
        suffix=" mins"
        change={3}
        changeType="decrease"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Customer Rating"
        value={metrics.customerSatisfaction || 0}
        suffix="/5"
        icon={<Star className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};

export default PerformanceMetrics;
