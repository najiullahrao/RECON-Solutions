import { useEffect, useState } from 'react';
import { appointmentsApi } from '../api';
import { isApiError } from '../types/api';
import type { Appointment } from '../types/api';
import { Card, CardContent } from '../components/ui/Card';

export function MyAppointmentsPage() {
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    appointmentsApi
      .listMy()
      .then((res) => {
        if (cancelled) return;
        if (isApiError(res)) {
          setError(res.error.message);
          setList([]);
          return;
        }
        setList(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
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
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">My appointments</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Your requested appointments and their status.
        </p>
      </div>
      {list.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-stone-600 dark:text-stone-400">You have no appointments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{a.service}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Preferred date: {a.preferred_date}
                    </p>
                    {a.location && (
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                        Location: {a.location}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      a.status === 'confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : a.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {a.status ?? 'pending'}
                  </span>
                </div>
                {a.created_at && (
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                    Requested {new Date(a.created_at).toLocaleDateString()}
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
