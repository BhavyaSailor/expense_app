const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');
const TOKEN_KEY = 'expense_token';
const USER_KEY = 'expense_user';

export const UNAUTHORIZED_EVENT = 'trackspense:unauthorized';

const store = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
};

const getToken = () => store.get(TOKEN_KEY);
const saveToken = (token) => store.set(TOKEN_KEY, token);
const clearToken = () => store.remove(TOKEN_KEY);

export const isAuthed = () => Boolean(getToken());

const getUser = () => {
  try {
    const raw = store.get(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const saveUser = (user) => store.set(USER_KEY, JSON.stringify(user));
const clearUser = () => store.remove(USER_KEY);

const buildUrl = (path, params = {}) => {
  if (!API_BASE) {
    throw new Error('The app is missing VITE_API_BASE. Add it to frontend/.env and restart the dev server.');
  }
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

const send = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
};

const failure = (response, data, auth) => {
  if (response.status === 401 && auth) {
    clearToken();
    clearUser();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return new Error(data.message || data.error || 'Something went wrong. Please try again.');
};

const request = async (path, { method = 'GET', body, params, auth = true } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await send(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw failure(response, data, auth);
  return data;
};

const download = async (path) => {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await send(buildUrl(path), { method: 'GET', headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw failure(response, data, true);
  }
  return response.blob();
};

export const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const formatRupee = (value) => {
  const amount = Number(value) || 0;
  const text = Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return `${amount < 0 ? '−' : ''}₹${text}`;
};

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
export const formatCompact = (value) => {
  const amount = Number(value) || 0;
  return `${amount < 0 ? '−' : ''}₹${compact.format(Math.abs(amount))}`;
};

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password }, auth: false }),
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

// Charts need every transaction, not one page. The backend has no cap on `limit`, so page in large chunks.
export const fetchAllTransactions = async () => {
  const limit = 500;
  let page = 1;
  let totalPages = 1;
  let all = [];
  do {
    const data = await transactionsApi.getTransactions({ limit, page, sortBy: '-date' });
    all = all.concat(data.transactions || []);
    totalPages = data.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return all;
};

export const budgetApi = {
  getBudgets: () => request('/budget'),
  createBudget: (payload) => request('/budget', { method: 'POST', body: payload }),
  updateBudget: (id, payload) => request(`/budget/${id}`, { method: 'PUT', body: payload }),
  deleteBudget: (id) => request(`/budget/${id}`, { method: 'DELETE' }),
};

export const goalApi = {
  getGoals: () => request('/goal'),
  createGoal: (payload) => request('/goal', { method: 'POST', body: payload }),
  contributeGoal: (id, contribution) =>
    request(`/goal/${id}/contribute`, { method: 'POST', body: { contribution } }),
  deleteGoal: (id) => request(`/goal/${id}`, { method: 'DELETE' }),
};

export const exportApi = {
  downloadCsv: () => download('/transactions/export'),
  downloadPdf: () => download('/export/pdf'),
};
