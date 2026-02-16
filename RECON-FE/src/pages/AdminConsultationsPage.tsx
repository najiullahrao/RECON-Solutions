import { useEffect, useState } from 'react';
import { consultationsApi } from '../api';
import { isApiError } from '../types/api';
import type { Consultation } from '../types/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { MultiSelect } from '../components/ui/MultiSelect';

const CONSULTATION_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const CONSULTATION_OPTIONS = CONSULTATION_STATUSES.map((s) => ({
  value: s,
  label: s.replace(/_/g, ' '),
}));

export function AdminConsultationsPage() {
  const [list, setList] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    const params = statusFilter.length > 0 ? { status: statusFilter } : undefined;
    consultationsApi.list(params).then((res) => {
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
    const res = await consultationsApi.updateStatus(id, status);
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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Manage consultations</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            View and update consultation request status.
          </p>
        </div>
        <div className="w-56 min-w-0">
          <MultiSelect
            label="Filter by status"
            options={CONSULTATION_OPTIONS}
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
            <p className="text-stone-600 dark:text-stone-400">No consultations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{c.name}</span>
                  <span className="ml-2 text-sm text-stone-500 dark:text-stone-400">{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                    value={c.status ?? 'NEW'}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    disabled={updatingId === c.id}
                  >
                    {CONSULTATION_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {c.phone && <p className="text-sm text-stone-600 dark:text-stone-400">Phone: {c.phone}</p>}
                {c.service && <p className="text-sm text-stone-600 dark:text-stone-400">Service: {c.service}</p>}
                {c.location && <p className="text-sm text-stone-600 dark:text-stone-400">Location: {c.location}</p>}
                {c.message && <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{c.message}</p>}
                {c.created_at && (
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                    Submitted {new Date(c.created_at).toLocaleString()}
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
