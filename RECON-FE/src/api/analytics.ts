import { api } from './client';
import type { AnalyticsStats, AnalyticsTrends, PopularService } from '../types/api';

const BASE = '/analytics';

export const analyticsApi = {
  getStats: () => api.get<AnalyticsStats>(`${BASE}/stats`),
  getTrends: () => api.get<AnalyticsTrends>(`${BASE}/trends`),
  getPopularServices: () => api.get<PopularService[]>(`${BASE}/popular-services`),
};
