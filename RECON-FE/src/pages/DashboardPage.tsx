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
  BarChart3,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
} from 'lucide-react';

// ─── Trend Bar Chart ────────────────────────────────────────────────────────
function TrendChart({
  data,
}: {
  data: { month: string; consultations: number; appointments: number }[];
}) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.consultations, d.appointments)),
    1,
  );

  const totalConsultations = data.reduce((s, d) => s + d.consultations, 0);
  const totalAppointments = data.reduce((s, d) => s + d.appointments, 0);

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        {data.map((item, index) => {
          const cw = (item.consultations / maxValue) * 100;
          const aw = (item.appointments / maxValue) * 100;
          return (
            <div key={index}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {item.month}
                </span>
                <span className="text-xs text-stone-400">
                  {item.consultations + item.appointments} total
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-xs text-stone-500">Consultations</span>
                  <div className="relative flex-1 h-6 overflow-hidden rounded-sm bg-stone-100">
                    <div
                      className="h-full bg-[#800000] transition-all duration-700 ease-out"
                      style={{ width: `${cw}%`, transitionDelay: `${index * 60}ms` }}
                    />
                    {item.consultations > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                        {item.consultations}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-xs text-stone-500">Appointments</span>
                  <div className="relative flex-1 h-6 overflow-hidden rounded-sm bg-stone-100">
                    <div
                      className="h-full bg-[#1a1a1a] transition-all duration-700 ease-out"
                      style={{ width: `${aw}%`, transitionDelay: `${index * 60 + 80}ms` }}
                    />
                    {item.appointments > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                        {item.appointments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 border-t border-stone-200 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-[#800000]" />
          <span className="text-xs text-stone-600">Consultations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-[#1a1a1a]" />
          <span className="text-xs text-stone-600">Appointments</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 border border-stone-200 rounded-sm">
        <div className="py-3 text-center">
          <p className="text-xs text-stone-500">Consultations</p>
          <p className="mt-0.5 text-lg font-bold text-[#800000]">{totalConsultations}</p>
        </div>
        <div className="py-3 text-center">
          <p className="text-xs text-stone-500">Appointments</p>
          <p className="mt-0.5 text-lg font-bold text-[#1a1a1a]">{totalAppointments}</p>
        </div>
        <div className="py-3 text-center">
          <p className="text-xs text-stone-500">Combined</p>
          <p className="mt-0.5 text-lg font-bold text-stone-700">
            {totalConsultations + totalAppointments}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const size = 144;
  const strokeW = 28;
  const r = (size - strokeW) / 2;
  const C = 2 * Math.PI * r;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      {/* SVG donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeW}
          />
          {data.map((item, i) => {
            const arc = (item.value / total) * C;
            const offset = C - cumulative;
            cumulative += arc;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeW}
                strokeDasharray={`${arc} ${C - arc}`}
                strokeDashoffset={offset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-[#1a1a1a]">{total}</p>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Total</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {data.map((item, i) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={i} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-stone-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-stone-400">{pct}%</span>
                <span className="font-semibold text-[#1a1a1a] w-6 text-right">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Types ────────────────────────────────────────────────────────────────────
interface TrendsData {
  [month: string]: { consultations: number; appointments: number };
}

// ─── Status palette ───────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:     '#3b82f6',
  scheduled:   '#2563eb',
  approved:    '#16a34a',
  confirmed:   '#15803d',
  completed:   '#16a34a',
  cancelled:   '#ef4444',
  new:         '#800000',
  contacted:   '#b45309',
  in_progress: '#6366f1',
  resolved:    '#16a34a',
  closed:      '#6b7280',
};

const FALLBACK_COLORS = [
  '#800000', '#1a1a1a', '#3b82f6', '#16a34a', '#6366f1', '#b45309', '#ef4444',
];

function getStatusColor(status: string, index: number): string {
  const key = status.toLowerCase().replace(/[\s-]/g, '_');
  return STATUS_COLORS[key] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// ─── Stat card sub-component ──────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  subtitle: string;
  trend?: string;
  accentColor: string;
}

function StatCard({ title, value, icon: Icon, subtitle, trend, accentColor }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{title}</p>
            <p className="mt-2 text-4xl font-bold text-[#1a1a1a] tracking-tight">
              {value.toLocaleString()}
            </p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" style={{ color: accentColor }} />
                <span className="text-xs font-semibold" style={{ color: accentColor }}>
                  {trend}
                </span>
                <span className="text-xs text-stone-400">of total</span>
              </div>
            )}
            <p className="mt-1.5 text-xs text-stone-400">{subtitle}</p>
          </div>
          <div
            className="ml-4 shrink-0 rounded-sm p-2.5"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [popular, setPopular] = useState<PopularService[]>([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      analyticsApi.getStats(),
      analyticsApi.getPopularServices(),
      analyticsApi.getTrends(),
    ])
      .then(([statsRes, popularRes, trendsRes]) => {
        if (cancelled) return;
        if (isApiError(statsRes)) {
          setError(statsRes.error.message);
        } else {
          setStats(statsRes.data);
        }
        if (!isApiError(popularRes)) {
          setPopular(Array.isArray(popularRes.data) ? popularRes.data : []);
        }
        if (!isApiError(trendsRes)) {
          setTrends(trendsRes.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-[#800000]" />
          <p className="mt-4 text-sm text-stone-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm border border-red-200 bg-white p-8 rounded-sm text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-4 text-base font-semibold text-[#1a1a1a]">Access Restricted</h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <p className="mt-1 text-xs text-stone-400">
            Dashboard is available for staff and admin users only.
          </p>
        </div>
      </div>
    );
  }

  // ── Derived data ──
  const overview = stats?.overview ?? {
    totalProjects: 0,
    totalConsultations: 0,
    totalAppointments: 0,
  };
  const byStage = stats?.projects?.byStage ?? {};
  const consultationsByStatus = stats?.consultations?.byStatus ?? {};
  const appointmentsByStatus = stats?.appointments?.byStatus ?? {};
  const totalStageProjects = Object.values(byStage).reduce(
    (s: number, c) => s + (c as number),
    0,
  );

  const recentConsultations = stats?.consultations?.last30Days ?? 0;
  const recentAppointments = stats?.appointments?.last30Days ?? 0;
  const consultationsGrowth =
    overview.totalConsultations > 0
      ? ((recentConsultations / overview.totalConsultations) * 100).toFixed(1)
      : '0';
  const appointmentsGrowth =
    overview.totalAppointments > 0
      ? ((recentAppointments / overview.totalAppointments) * 100).toFixed(1)
      : '0';

  const trendChartData = trends
    ? Object.entries(trends)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, d]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          consultations: d.consultations,
          appointments: d.appointments,
        }))
    : [];

  const consultationsDonutData = Object.entries(consultationsByStatus).map(
    ([status, count], i) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
      value: count as number,
      color: getStatusColor(status, i),
    }),
  );

  const appointmentsDonutData = Object.entries(appointmentsByStatus).map(
    ([status, count], i) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
      value: count as number,
      color: getStatusColor(status, i),
    }),
  );

  const maxPopularCount = Math.max(...popular.map((p) => p.count), 1);
  const hasData =
    Object.keys(byStage).length > 0 ||
    popular.length > 0 ||
    trendChartData.length > 0;

  const statusIcons: Record<string, React.ElementType> = {
    pending:     Clock,
    scheduled:   Calendar,
    approved:    CheckCircle2,
    confirmed:   CheckCircle2,
    completed:   CheckCircle2,
    cancelled:   XCircle,
    new:         MessageCircle,
    contacted:   Users,
    in_progress: Activity,
    resolved:    CheckCircle2,
    closed:      XCircle,
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Real-time overview of your business metrics and performance
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 border border-stone-200 bg-white px-3 py-1.5 text-xs rounded-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-stone-500 font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Projects"
          value={overview.totalProjects}
          icon={FolderKanban}
          subtitle={`${totalStageProjects} project${totalStageProjects !== 1 ? 's' : ''} in pipeline`}
          accentColor="#800000"
        />
        <StatCard
          title="Consultations"
          value={overview.totalConsultations}
          icon={Users}
          subtitle={`${recentConsultations} in the last 30 days`}
          trend={`${consultationsGrowth}%`}
          accentColor="#800000"
        />
        <StatCard
          title="Appointments"
          value={overview.totalAppointments}
          icon={Calendar}
          subtitle={`${recentAppointments} in the last 30 days`}
          trend={`${appointmentsGrowth}%`}
          accentColor="#1a1a1a"
        />
      </div>

      {/* ── Activity Trends ── */}
      {trendChartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-[#800000]" />
              <div>
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Activity Trends</h2>
                <p className="text-xs text-stone-400">Last 6 months — consultations vs appointments</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TrendChart data={trendChartData} />
          </CardContent>
        </Card>
      )}

      {/* ── Status Breakdowns ── */}
      {(Object.keys(consultationsByStatus).length > 0 ||
        Object.keys(appointmentsByStatus).length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.keys(consultationsByStatus).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[#800000]" />
                  <div>
                    <h2 className="text-sm font-semibold text-[#1a1a1a]">Consultations by Status</h2>
                    <p className="text-xs text-stone-400">Current distribution</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <DonutChart data={consultationsDonutData} />
              </CardContent>
            </Card>
          )}

          {Object.keys(appointmentsByStatus).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#1a1a1a]" />
                  <div>
                    <h2 className="text-sm font-semibold text-[#1a1a1a]">Appointments by Status</h2>
                    <p className="text-xs text-stone-400">Current distribution</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <DonutChart data={appointmentsDonutData} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Pipeline & Services ── */}
      {(Object.keys(byStage).length > 0 || popular.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Projects by Stage */}
          {Object.keys(byStage).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-[#800000]" />
                    <div>
                      <h2 className="text-sm font-semibold text-[#1a1a1a]">Projects by Stage</h2>
                      <p className="text-xs text-stone-400">Pipeline distribution</p>
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">
                    {totalStageProjects} total
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries(byStage).map(([stage, count]) => {
                    const pct =
                      totalStageProjects > 0
                        ? ((count as number) / totalStageProjects) * 100
                        : 0;
                    return (
                      <div key={stage}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="font-medium capitalize text-stone-600">
                            {stage.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-stone-400">{pct.toFixed(1)}%</span>
                            <span className="font-bold text-[#1a1a1a] w-5 text-right">
                              {count as number}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-sm bg-stone-100">
                          <div
                            className="h-full bg-[#800000] transition-all duration-500"
                            style={{ width: `${pct}%` }}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-[#800000]" />
                    <div>
                      <h2 className="text-sm font-semibold text-[#1a1a1a]">Popular Services</h2>
                      <p className="text-xs text-stone-400">Most requested services</p>
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">Top {popular.length > 5 ? 5 : popular.length}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {popular.slice(0,5).map(({ service, count }, index) => {
                    const pct = (count / maxPopularCount) * 100;
                    return (
                      <div key={service}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#800000] text-[10px] font-bold text-white">
                              {index + 1}
                            </span>
                            <span className="font-medium text-stone-700 truncate">{service}</span>
                          </div>
                          <span className="ml-3 shrink-0 font-bold text-[#1a1a1a]">{count}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-sm bg-stone-100">
                          <div
                            className="h-full bg-[#1a1a1a] transition-all duration-500"
                            style={{ width: `${pct}%` }}
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
      )}

      {/* ── Status Detail Tables ── */}
      {(Object.keys(consultationsByStatus).length > 0 ||
        Object.keys(appointmentsByStatus).length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.keys(consultationsByStatus).length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Consultation Status Breakdown</h2>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-stone-100">
                    {Object.entries(consultationsByStatus).map(([status, count], i) => {
                      const Icon = statusIcons[status.toLowerCase()] ?? Activity;
                      const color = getStatusColor(status, i);
                      return (
                        <tr key={status} className="flex items-center justify-between px-6 py-3 hover:bg-stone-50 transition-colors">
                          <td className="flex items-center gap-2.5">
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                            <span className="capitalize text-stone-600 text-xs">
                              {status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="font-semibold text-[#1a1a1a] text-xs tabular-nums">
                            {(count as number).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {Object.keys(appointmentsByStatus).length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Appointment Status Breakdown</h2>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-stone-100">
                    {Object.entries(appointmentsByStatus).map(([status, count], i) => {
                      const Icon = statusIcons[status.toLowerCase()] ?? Activity;
                      const color = getStatusColor(status, i);
                      return (
                        <tr key={status} className="flex items-center justify-between px-6 py-3 hover:bg-stone-50 transition-colors">
                          <td className="flex items-center gap-2.5">
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                            <span className="capitalize text-stone-600 text-xs">
                              {status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="font-semibold text-[#1a1a1a] text-xs tabular-nums">
                            {(count as number).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Empty State ── */}
      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-10 w-10 text-stone-300" />
            <h3 className="mt-4 text-base font-semibold text-[#1a1a1a]">No analytics data yet</h3>
            <p className="mt-2 text-center text-sm text-stone-400 max-w-xs">
              Start creating projects and scheduling consultations to see detailed insights here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
