import axios from 'axios';
import { clearToken, getToken } from './auth';

const API_BASE_URL = 'http://localhost:3000/analysis';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type Filters = {
  regulation_id?: string;
  subject_id?: string;
  batch_id?: string;
  section_id?: string;
  offering_id?: string;
};

export type InternalExternalRecord = {
  student_id: number;
  student_name: string;
  internal_percentage: number | null;
  external_percentage: number | null;
  gap: number | null;
};

export const analyticsService = {
  getFilterOptions: (params?: Filters) => api.get('/admin/filter-options', { params }),
  getCoPoMapping: (params?: Filters) => api.get('/co-po-mapping', { params }),
  getCoAttainment: (params?: Filters) => api.get('/co-attainment', { params }),
  getPoAttainment: (params?: Filters) => api.get('/po-attainment', { params }),
  getTeacherPerformanceInsights: (params?: Filters) => api.get('/teacher-performance-insights', { params }),
  getPerformance: (params?: Filters) => api.get('/performance', { params }),
  getAttendance: (params?: Filters) => api.get('/attendance', { params }),
  getComparisons: (params?: Filters) => api.get('/comparisons', { params }),
  getAdminInsights: (params?: Filters) => api.get('/admin/co-po-insights', { params }),
  getBatchMarks: (params?: Filters) => api.get('/batch-marks', { params }),
  getBatchAttendance: (params?: Filters) => api.get('/batch-attendance', { params }),
  getAttendanceMetrics: (params?: Filters) => api.get('/attendance-metrics', { params }),
  getInternalExternal: (params?: Filters) => api.get('/internal-external', { params }),
};


export default api;
