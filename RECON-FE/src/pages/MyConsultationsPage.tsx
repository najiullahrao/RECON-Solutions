import { useEffect, useState } from 'react';
import { consultationsApi } from '../api';
import { isApiError } from '../types/api';
import type { Consultation } from '../types/api';
import { Card, CardContent } from '../components/ui/Card';

export function MyConsultationsPage() {
  const [list, setList] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    consultationsApi
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">My consultations</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Your submitted consultation requests and their status.
        </p>
      </div>
      {list.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-stone-600 dark:text-stone-400">You have no consultation requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{c.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{c.email}</p>
                    {c.service && (
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                        Service: {c.service}
                      </p>
                    )}
                    {c.message && (
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{c.message}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      c.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : c.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {c.status ?? 'pending'}
                  </span>
                </div>
                {c.created_at && (
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                    Submitted {new Date(c.created_at).toLocaleDateString()}
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
