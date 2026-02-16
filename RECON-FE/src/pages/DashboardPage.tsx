import { useEffect, useState } from 'react';
import { analyticsApi } from '../api';
import { isApiError } from '../types/api';
import type { AnalyticsStats, PopularService } from '../types/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  TrendingUp, 
  Calendar, 
  FolderKanban, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle
} from 'lucide-react';

// Modern Bar Chart Component for Trends
function TrendChart({ 
  data 
}: { 
  data: { month: string; consultations: number; appointments: number }[];
}) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.consultations, d.appointments)),
    10 // Minimum scale
  );

  return (
    <div className="space-y-6">
      {/* Chart Area */}
      <div className="space-y-4 px-2">
        {data.map((item, index) => {
          const consultationsWidth = (item.consultations / maxValue) * 100;
          const appointmentsWidth = (item.appointments / maxValue) * 100;
          const total = item.consultations + item.appointments;

          return (
            <div key={index} className="group">
              {/* Month Label & Total */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {item.month}
                </span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {total} total
                </span>
              </div>

              {/* Bars Container */}
              <div className="space-y-2">
                {/* Consultations Bar */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="w-28 text-xs text-stone-600 dark:text-stone-400">
                      Consultations
                    </div>
                    <div className="relative flex-1">
                      <div className="h-8 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700 ease-out group-hover:from-emerald-400 group-hover:to-emerald-500"
                          style={{ 
                            width: `${consultationsWidth}%`,
                            transitionDelay: `${index * 50}ms`
                          }}
                        />
                      </div>
                      {/* Value Label */}
                      {item.consultations > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white mix-blend-difference">
                          {item.consultations}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointments Bar */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="w-28 text-xs text-stone-600 dark:text-stone-400">
                      Appointments
                    </div>
                    <div className="relative flex-1">
                      <div className="h-8 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out group-hover:from-blue-400 group-hover:to-blue-500"
                          style={{ 
                            width: `${appointmentsWidth}%`,
                            transitionDelay: `${index * 50 + 100}ms`
                          }}
                        />
                      </div>
                      {/* Value Label */}
                      {item.appointments > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white mix-blend-difference">
                          {item.appointments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 border-t border-stone-200 pt-4 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <span className="text-sm text-stone-600 dark:text-stone-400">Consultations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-blue-500 to-blue-600" />
          <span className="text-sm text-stone-600 dark:text-stone-400">Appointments</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-stone-50 p-4 dark:bg-stone-800/50">
        <div className="text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">Total Consultations</p>
          <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {data.reduce((sum, item) => sum + item.consultations, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">Total Appointments</p>
          <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
            {data.reduce((sum, item) => sum + item.appointments, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">Combined Total</p>
          <p className="mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">
            {data.reduce((sum, item) => sum + item.consultations + item.appointments, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Donut Chart Component
function DonutChart({ 
  data
}: { 
  data: { label: string; value: number; color: string }[];
}) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 160;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-stone-100 dark:text-stone-800"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const offset = ((100 - percentage) / 100) * circumference;
            
            const segment = (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(${currentAngle} ${size / 2} ${size / 2})`}
                className="transition-all duration-300"
              />
            );
            
            currentAngle += angle;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">{total}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Total</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-stone-700 dark:text-stone-300">{item.label}</span>
              <span className="ml-auto font-medium text-stone-900 dark:text-stone-100">
                {item.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TrendsData {
  [month: string]: {
    consultations: number;
    appointments: number;
  };
}

export function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [popular, setPopular] = useState<PopularService[]>([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let statsLoaded = false;
    let popularLoaded = false;
    let trendsLoaded = false;
    
    const checkAllLoaded = () => {
      if (statsLoaded && popularLoaded && trendsLoaded && !cancelled) {
        setLoading(false);
      }
    };
    
    // Load all data in parallel for fastest overall load time
    Promise.all([
      analyticsApi.getStats(),
      analyticsApi.getPopularServices(),
      analyticsApi.getTrends()
    ])
      .then(([statsRes, popularRes, trendsRes]) => {
        if (cancelled) return;
        
        // Handle stats
        if (isApiError(statsRes)) {
          setError(statsRes.error.message);
        } else {
          setStats(statsRes.data);
        }
        statsLoaded = true;
        checkAllLoaded();
        
        // Handle popular services
        if (!isApiError(popularRes)) {
          setPopular(Array.isArray(popularRes.data) ? popularRes.data : []);
        }
        popularLoaded = true;
        checkAllLoaded();
        
        // Handle trends
        if (!isApiError(trendsRes)) {
          setTrends(trendsRes.data);
        }
        trendsLoaded = true;
        checkAllLoaded();
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-stone-700 dark:border-t-blue-500" />
          <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Access Restricted
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Dashboard is available for staff and admin users only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overview = stats?.overview ?? { totalProjects: 0, totalConsultations: 0, totalAppointments: 0 };
  const byStage = stats?.projects?.byStage ?? {};
  const consultationsByStatus = stats?.consultations?.byStatus ?? {};
  const appointmentsByStatus = stats?.appointments?.byStatus ?? {};
  const totalStageProjects = Object.values(byStage).reduce((sum: number, count) => sum + (count as number), 0);
  
  // Calculate growth trends
  const recentConsultations = stats?.consultations?.last30Days ?? 0;
  const recentAppointments = stats?.appointments?.last30Days ?? 0;
  const consultationsGrowth = overview.totalConsultations > 0 
    ? ((recentConsultations / overview.totalConsultations) * 100).toFixed(1)
    : '0';
  const appointmentsGrowth = overview.totalAppointments > 0 
    ? ((recentAppointments / overview.totalAppointments) * 100).toFixed(1)
    : '0';

  // Format trends data for chart
  const trendChartData = trends 
    ? Object.entries(trends)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          consultations: data.consultations,
          appointments: data.appointments
        }))
    : [];

  // Status icons and colors - comprehensive mapping for all statuses
  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    // Appointments statuses
    pending: { icon: Clock, color: '#3b82f6', bg: 'bg-blue-500' },
    scheduled: { icon: Calendar, color: '#2563eb', bg: 'bg-blue-600' },
    approved: { icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500' },
    confirmed: { icon: CheckCircle2, color: '#059669', bg: 'bg-emerald-600' },
    completed: { icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500' },
    cancelled: { icon: XCircle, color: '#ef4444', bg: 'bg-red-500' },
    // Consultations statuses
    new: { icon: MessageCircle, color: '#3b82f6', bg: 'bg-blue-500' },
    contacted: { icon: Users, color: '#2563eb', bg: 'bg-blue-600' },
    in_progress: { icon: Activity, color: '#6366f1', bg: 'bg-indigo-500' },
    resolved: { icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500' },
    closed: { icon: XCircle, color: '#6b7280', bg: 'bg-stone-500' }
  };

  // Helper function to get color for status (case-insensitive)
  const getStatusColor = (status: string, index: number, type: 'consultation' | 'appointment'): string => {
    const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '_');
    const configColor = statusConfig[normalizedStatus]?.color;
    
    if (configColor) return configColor;
    
    // If not found in config, assign distinct colors based on type
    if (type === 'consultation') {
      const consultationColors = ['#3b82f6', '#2563eb', '#6366f1', '#8b5cf6', '#10b981'];
      return consultationColors[index % consultationColors.length];
    } else {
      const appointmentColors = ['#3b82f6', '#2563eb', '#10b981', '#059669', '#ef4444'];
      return appointmentColors[index % appointmentColors.length];
    }
  };

  const consultationsDonutData = Object.entries(consultationsByStatus).map(([status, count], index) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
    value: count as number,
    color: getStatusColor(status, index, 'consultation')
  }));

  const appointmentsDonutData = Object.entries(appointmentsByStatus).map(([status, count], index) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
    value: count as number,
    color: getStatusColor(status, index, 'appointment')
  }));

  const maxPopularCount = Math.max(...popular.map(p => p.count), 1);

  const statCards = [
    {
      title: 'Total Projects',
      value: overview.totalProjects,
      icon: FolderKanban,
      subtitle: `${totalStageProjects} in pipeline`,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-950/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Consultations',
      value: overview.totalConsultations,
      icon: Users,
      trend: `${consultationsGrowth}%`,
      subtitle: `${recentConsultations} in last 30 days`,
      trendUp: true,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Appointments',
      value: overview.totalAppointments,
      icon: Calendar,
      trend: `${appointmentsGrowth}%`,
      subtitle: `${recentAppointments} in last 30 days`,
      trendUp: true,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-950/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            Real-time overview of your business metrics and performance
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm dark:border-stone-700 dark:bg-stone-800">
          <Activity className="h-4 w-4 animate-pulse text-emerald-500" />
          <span className="text-stone-600 dark:text-stone-400">Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={stat.title} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                      {stat.value.toLocaleString()}
                    </p>
                    {stat.trend && (
                      <div className="mt-3 flex items-center gap-1">
                        <TrendIcon 
                          className="h-4 w-4 text-emerald-600 dark:text-emerald-400" 
                        />
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {stat.trend}
                        </span>
                        <span className="text-sm text-stone-500 dark:text-stone-500">of total</span>
                      </div>
                    )}
                    {stat.subtitle && (
                      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-xl p-3 ${stat.lightBg}`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trends Chart */}
      {trendChartData.length > 0 && (
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="border-b border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/20">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  Activity Trends
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Last 6 months comparison
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TrendChart data={trendChartData} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consultations by Status */}
        {Object.keys(consultationsByStatus).length > 0 && (
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/20">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    Consultations by Status
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Current distribution
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <DonutChart data={consultationsDonutData} />
            </CardContent>
          </Card>
        )}

        {/* Appointments by Status */}
        {Object.keys(appointmentsByStatus).length > 0 && (
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    Appointments by Status
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Current distribution
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <DonutChart data={appointmentsDonutData} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projects by Stage */}
        {Object.keys(byStage).length > 0 && (
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      Projects by Stage
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Pipeline distribution
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  {totalStageProjects} total
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(byStage).map(([stage, count]) => {
                  const percentage = totalStageProjects > 0 ? ((count as number) / totalStageProjects) * 100 : 0;
                  
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-stone-700 dark:text-stone-300">
                          {stage.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-stone-500 dark:text-stone-400">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {count as number}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Services */}
        {popular.length > 0 && (
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/20">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      Popular Services
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Most requested services
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  Top {popular.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {popular.map(({ service, count }, index) => {
                  const percentage = (count / maxPopularCount) * 100;
                  
                  return (
                    <div key={service} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                            {index + 1}
                          </span>
                          <span className="font-medium text-stone-700 dark:text-stone-300">
                            {service}
                          </span>
                        </div>
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {Object.keys(byStage).length === 0 && popular.length === 0 && trendChartData.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-stone-100 p-4 dark:bg-stone-800">
              <BarChart3 className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              No analytics data yet
            </h3>
            <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
              Start creating projects and scheduling consultations to see detailed insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}