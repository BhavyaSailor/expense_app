export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISODate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// Dates entered in the form are stored at midnight UTC. Read those as plain calendar days so they
// never shift by a day in other timezones; anything with a real time is converted normally.
export const txDate = (tx) => {
  const raw = tx.date || tx.createdAt;
  if (!raw) return new Date(NaN);
  if (typeof raw === 'string' && raw.endsWith('T00:00:00.000Z')) {
    const [y, m, d] = raw.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(raw);
};

export const formatDate = (d, withYear = true) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });

export const titleCase = (s = '') =>
  String(s).trim().replace(/(^|[\s/&-])([a-z])/g, (_, lead, ch) => lead + ch.toUpperCase());
export const normCategory = (s) => String(s || '').trim().toLowerCase();

export const sumType = (txs, type) => txs.reduce((sum, t) => (t.type === type ? sum + Number(t.amount || 0) : sum), 0);
export const totals = (txs) => {
  const income = sumType(txs, 'income');
  const expense = sumType(txs, 'expense');
  const savings = sumType(txs, 'savings');
  return { income, expense, savings, left: income - expense - savings };
};

export const percent = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);
export const formatPercent = (value) => `${Math.round(value * 10) / 10}%`;

export const RANGE_OPTIONS = [
  { value: '30d', label: '30 days' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: '12m', label: '12 months' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' },
];

export const resolveRange = ({ preset, from, to }) => {
  const now = new Date();
  const today = startOfDay(now);
  switch (preset) {
    case '30d':
      return { from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29), to: endOfDay(now) };
    case '3m':
    case '6m':
    case '12m': {
      const n = Number(preset.slice(0, -1));
      return { from: new Date(today.getFullYear(), today.getMonth() - (n - 1), 1), to: endOfDay(now) };
    }
    case 'custom': {
      const f = parseISODate(from);
      const t = parseISODate(to);
      return { from: f, to: t ? endOfDay(t) : null };
    }
    default:
      return { from: null, to: null };
  }
};

export const describeRange = ({ preset, from, to }) => {
  const labels = {
    '30d': 'in the last 30 days',
    '3m': 'in the last 3 months',
    '6m': 'in the last 6 months',
    '12m': 'in the last 12 months',
    all: 'across all time',
  };
  if (preset !== 'custom') return labels[preset] || '';
  if (from && to) return `from ${formatDate(parseISODate(from))} to ${formatDate(parseISODate(to))}`;
  if (from) return `since ${formatDate(parseISODate(from))}`;
  if (to) return `until ${formatDate(parseISODate(to))}`;
  return 'in your custom range';
};

export const inRange = (txs, { from, to }) =>
  txs.filter((t) => {
    const d = txDate(t);
    if (Number.isNaN(d.getTime())) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });

// One row per calendar month across the range, including empty months, so charts never skip time.
export const monthlySeries = (txs, bounds = {}) => {
  const dates = txs.map(txDate).filter((d) => !Number.isNaN(d.getTime()));
  if (!dates.length && !bounds.from) return [];
  const now = new Date();
  const min = dates.reduce((a, b) => (a < b ? a : b), dates[0] || now);
  const max = dates.reduce((a, b) => (a > b ? a : b), dates[0] || now);
  const startRef = bounds.from || min;
  const endRef = bounds.to || (max > now ? max : now);

  const rows = [];
  const index = {};
  let y = startRef.getFullYear();
  let m = startRef.getMonth();
  while ((y < endRef.getFullYear() || (y === endRef.getFullYear() && m <= endRef.getMonth())) && rows.length < 120) {
    const row = { key: `${y}-${m}`, year: y, month: m, income: 0, expense: 0, savings: 0 };
    index[row.key] = row;
    rows.push(row);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  txs.forEach((t) => {
    const d = txDate(t);
    const row = index[`${d.getFullYear()}-${d.getMonth()}`];
    if (row && ['income', 'expense', 'savings'].includes(t.type)) row[t.type] += Number(t.amount || 0);
  });

  const multiYear = rows.length > 0 && rows[0].year !== rows[rows.length - 1].year;
  let running = 0;
  return rows.map((r) => {
    running += r.savings;
    return {
      ...r,
      label: multiYear ? `${MONTHS_SHORT[r.month]} ’${String(r.year).slice(2)}` : MONTHS_SHORT[r.month],
      full: `${MONTHS_FULL[r.month]} ${r.year}`,
      total: running,
    };
  });
};

export const categoryTotals = (txs, type = 'expense', limit = 6) => {
  const map = new Map();
  txs.forEach((t) => {
    if (t.type !== type) return;
    const key = normCategory(t.category) || 'uncategorised';
    map.set(key, (map.get(key) || 0) + Number(t.amount || 0));
  });
  const all = [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const total = all.reduce((s, c) => s + c.value, 0);
  let list = all;
  if (all.length > limit) {
    const rest = all.slice(limit - 1).reduce((s, c) => s + c.value, 0);
    list = [...all.slice(0, limit - 1), { name: 'other categories', value: rest }];
  }
  return list.map((c) => ({ ...c, share: percent(c.value, total) }));
};

export const dailySeries = (txs, { from, to }, maxDays = 90) => {
  const expenses = txs.filter((t) => t.type === 'expense');
  const end = startOfDay(to || new Date());
  let start = from
    ? startOfDay(from)
    : expenses.length
      ? startOfDay(new Date(Math.min(...expenses.map((t) => txDate(t).getTime()))))
      : end;
  const floor = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (maxDays - 1));
  if (start < floor) start = floor;

  const byDay = {};
  expenses.forEach((t) => {
    const key = toISODate(txDate(t));
    byDay[key] = (byDay[key] || 0) + Number(t.amount || 0);
  });
  const rows = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const key = toISODate(d);
    rows.push({ key, label: formatDate(d, false), value: byDay[key] || 0 });
  }
  return rows;
};

// Budgets are per category, month and year. Transactions store categories in lower case.
export const spentForBudget = (budget, txs) => {
  const category = normCategory(budget.category);
  const month = Number(budget.month);
  const year = Number(budget.year);
  return txs.reduce((sum, t) => {
    if (t.type !== 'expense' || normCategory(t.category) !== category) return sum;
    const d = txDate(t);
    return d.getMonth() + 1 === month && d.getFullYear() === year ? sum + Number(t.amount || 0) : sum;
  }, 0);
};

export const budgetStatus = (spent, limit) => {
  const pct = percent(spent, limit);
  if (pct > 100) return { pct, tone: 'over', label: 'Over budget' };
  if (pct >= 80) return { pct, tone: 'warn', label: 'Close to the limit' };
  return { pct, tone: 'ok', label: 'On track' };
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
