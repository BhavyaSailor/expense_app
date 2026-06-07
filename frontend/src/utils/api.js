const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('expense_token');
const saveToken = (token) => localStorage.setItem('expense_token', token);
const clearToken = () => localStorage.removeItem('expense_token');

const getUser = () => {
  const user = localStorage.getItem('expense_user');
  return user ? JSON.parse(user) : null;
};

const saveUser = (user) => {
  localStorage.setItem('expense_user', JSON.stringify(user));
};

const clearUser = () => {
  localStorage.removeItem('expense_user');
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

const request = async (path, { method = 'GET', body, params, auth = true } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.error || 'Something went wrong';
    if (response.status === 401) {
      clearToken();
    }
    throw new Error(message);
  }

  return data;
};

const download = async (path, { params, auth = true } = {}) => {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.message || data.error || 'Something went wrong';
    if (response.status === 401) clearToken();
    throw new Error(message);
  }

  return response.blob();
};

export const formatRupee = (value) => {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password }, auth: false }),
  logout: () => {
    clearToken();
    clearUser();
  },
  saveToken,
  saveUser,
  getUser,
};

export const transactionsApi = {
  getTransactions: (params) => request('/transactions', { params }),
  createTransaction: (payload) => request('/transactions', { method: 'POST', body: payload }),
  updateTransaction: (id, payload) => request(`/transactions/${id}`, { method: 'PUT', body: payload }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  getDashboard: () => request('/dashboard'),
  getMonthlyTrend: () => request('/dashboard/monthly'),
  getCategorySpending: () => request('/dashboard/category'),
};

export const analyticsApi = {
  getMonthlyTrend: () => request('/analytics/monthly'),
  getCategorySpending: () => request('/analytics/category'),
  getRecentExpense: () => request('/analytics/recent'),
  getTopCategory: () => request('/analytics/top'),
  getStats: () => request('/analytics/stats'),
  getDailyAnalytics: () => request('/analytics/daily'),
};

export const budgetApi = {
  getSummary: () => request('/budget/summary'),
  getBudgets: () => request('/budget'),
  createBudget: (payload) => request('/budget', { method: 'POST', body: payload }),
  updateBudget: (id, payload) => request(`/budget/${id}`, { method: 'PUT', body: payload }),
  deleteBudget: (id) => request(`/budget/${id}`, { method: 'DELETE' }),
};

export const goalApi = {
  getGoals: () => request('/goal'),
  createGoal: (payload) => request('/goal', { method: 'POST', body: payload }),
  contributeGoal: (id, contribution) => request(`/goal/${id}/contribute`, { method: 'POST', body: { contribution } }),
  deleteGoal: (id) => request(`/goal/${id}`, { method: 'DELETE' }),
};

export const exportApi = {
  downloadCsv: () => download('/transactions/export', { auth: true }),
  downloadPdf: () => download('/export/pdf', { auth: true }),
};

export default {
  authApi,
  transactionsApi,
  dashboardApi,
  analyticsApi,
  budgetApi,
  goalApi,
  exportApi,
  formatRupee,
};
