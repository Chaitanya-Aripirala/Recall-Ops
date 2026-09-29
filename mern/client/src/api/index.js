import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recallops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally: clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('recallops_token');
      localStorage.removeItem('recallops_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API calls ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ── Incidents API calls ──────────────────────────────────────────────────────
export const incidentAPI = {
  getScenarios: () => api.get('/incidents/scenarios'),
  startIncident: (scenarioId) => api.post('/incidents/start', { scenarioId }),
  getIncident: (id = 'latest') => api.get(`/incidents/current/${id}`),
  unlockEvidence: (id, evidenceId) => api.post(`/incidents/unlock/${id}`, { evidenceId }),
  advanceStage: (id) => api.post(`/incidents/advance/${id}`),
  executeAction: (id, actionId, approvedBy) => api.post(`/incidents/execute/${id}`, { actionId, approvedBy }),
  generatePostmortem: (id) => api.post(`/incidents/postmortem/${id}`),
  consolidateToMemory: (postmortemId) => api.post('/incidents/consolidate', { postmortemId }),
  resetDemo: () => api.post('/incidents/reset'),
};

// ── Memories API calls ───────────────────────────────────────────────────────
export const memoryAPI = {
  getAll: (params) => api.get('/memories', { params }),
  getById: (id) => api.get(`/memories/${id}`),
  reseed: () => api.post('/memories/reseed'),
  create: (data) => api.post('/memories/create', data),
};

// ── Analytics API calls ──────────────────────────────────────────────────────
export const analyticsAPI = {
  getBenchmarks: () => api.get('/analytics/benchmarks'),
  getPostmortems: () => api.get('/analytics/postmortems'),
};

export default api;
