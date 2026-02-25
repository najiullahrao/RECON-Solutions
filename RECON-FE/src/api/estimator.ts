import { api } from './client';
import type { EstimatorPayload, EstimatorResponse } from '../types/api';

export const estimatorApi = {
  getEstimate: (payload: EstimatorPayload) =>
    api.post<EstimatorResponse>('/estimator', payload, { skipAuth: true }),
};
