import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/analysis';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Filters = {
  regulation_id?: string;
  subject_id?: string;
  batch_id?: string;
  section_id?: string;
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
  getPerformance: (params?: Filters) => api.get('/performance', { params }),
  getAttendance: (params?: Filters) => api.get('/attendance', { params }),
  getComparisons: (params?: Filters) => api.get('/comparisons', { params }),
  getAdminInsights: (params?: Filters) => api.get('/admin/co-po-insights', { params }),
  getBatchMarks: (params?: Filters) => api.get('/batch-marks', { params }),
  getBatchAttendance: (params?: Filters) => api.get('/batch-attendance', { params }),
  getInternalExternal: (params?: Filters) => api.get('/internal-external', { params }),
};

export default api;
