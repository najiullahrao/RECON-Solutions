import { useEffect, useState } from 'react';
import { appointmentsApi } from '../api';
import { isApiError } from '../types/api';
import type { Appointment } from '../types/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { MultiSelect } from '../components/ui/MultiSelect';

const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
const APPOINTMENT_OPTIONS = APPOINTMENT_STATUSES.map((s) => ({ value: s, label: s }));

export function AdminAppointmentsPage() {
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    const params = statusFilter.length > 0 ? { status: statusFilter } : undefined;
    appointmentsApi.list(params).then((res) => {
      if (isApiError(res)) {
        setError(res.error.message);
        setList([]);
      } else {
        setList(Array.isArray(res.data) ? res.data : []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchList();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    const res = await appointmentsApi.updateStatus(id, status);
    setUpdatingId(null);
    if (!isApiError(res)) fetchList();
  };

  if (error && list.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Manage appointments</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            View and update appointment status.
          </p>
        </div>
        <div className="w-56 min-w-0">
          <MultiSelect
            label="Filter by status"
            options={APPOINTMENT_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All statuses"
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        </div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-stone-600 dark:text-stone-400">No appointments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{a.service}</span>
                  <span className="ml-2 text-sm text-stone-500 dark:text-stone-400">
                    {a.preferred_date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                    value={a.status ?? 'PENDING'}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    disabled={updatingId === a.id}
                  >
                    {APPOINTMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {a.location && <p className="text-sm text-stone-600 dark:text-stone-400">Location: {a.location}</p>}
                {a.created_at && (
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                    Requested {new Date(a.created_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
