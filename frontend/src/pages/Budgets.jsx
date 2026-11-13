import { useMemo, useState } from 'react';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import useAsync from '../hooks/useAsync';
import useTransactions from '../hooks/useTransactions';
import usePageTitle from '../hooks/usePageTitle';
import { useApp } from '../context/App';
import { useFeedback } from '../context/Feedback';
import { budgetApi, formatRupee } from '../utils/api';
import { MONTHS_FULL, budgetStatus, normCategory, spentForBudget, titleCase } from '../utils/finance';

const CATEGORY_SUGGESTIONS = ['Food', 'Groceries', 'Rent', 'Bills', 'Travel', 'Shopping', 'Health', 'Entertainment', 'Education'];

function BudgetForm({ budget, period, onClose, onSaved }) {
  const editing = Boolean(budget);
  const { toast } = useFeedback();
  const [form, setForm] = useState({
    category: budget ? titleCase(budget.category) : '',
    limit: budget?.limit ?? '',
    month: Number(budget?.month ?? period.month),
    year: Number(budget?.year ?? period.year),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const limit = Number(form.limit);
    if (!form.category.trim()) return setError('Choose or type a category.');
    if (!(limit > 0)) return setError('The limit must be more than zero.');
    const payload = {
      category: normCategory(form.category),
      limit,
      month: Number(form.month),
      year: Number(form.year),
    };
    setSaving(true);
    try {
      if (editing) await budgetApi.updateBudget(budget._id, payload);
      else await budgetApi.createBudget(payload);
      toast.success(editing ? 'Budget updated.' : 'Budget added.');
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? 'Edit budget' : 'Add budget'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="budget-form" loading={saving}>
            {editing ? 'Save changes' : 'Add budget'}
          </Button>
        </>
      }
    >
      <form id="budget-form" className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="b-category">Category</label>
          <input id="b-category" name="category" list="b-categories" value={form.category} onChange={set} placeholder="Food, Travel" autoFocus />
          <datalist id="b-categories">
            {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
          </datalist>
          <p className="hint">Matches expenses logged with the same category.</p>
        </div>
        <div className="field">
          <label htmlFor="b-limit">Monthly limit (₹)</label>
          <input id="b-limit" name="limit" type="number" inputMode="decimal" min="0" step="any" value={form.limit} onChange={set} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="b-month">Month</label>
            <select id="b-month" name="month" value={form.month} onChange={set}>
              {MONTHS_FULL.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="b-year">Year</label>
            <input id="b-year" name="year" type="number" min="2000" max="2100" value={form.year} onChange={set} />
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}

function Budgets() {
  usePageTitle('Budgets');
  const { version, bump } = useApp();
  const { toast, confirm } = useFeedback();
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [form, setForm] = useState(null);
  const [copying, setCopying] = useState(false);

  const budgetsQ = useAsync(() => budgetApi.getBudgets(), [version]);
  const { transactions, loading: txLoading, error: txError } = useTransactions();

  const all = budgetsQ.data?.budgets || [];
  const rows = useMemo(
    () =>
      all
        .filter((b) => Number(b.month) === period.month && Number(b.year) === period.year)
        .map((b) => {
          const spent = spentForBudget(b, transactions);
          return { ...b, spent, remaining: b.limit - spent, ...budgetStatus(spent, b.limit) };
        })
        .sort((a, b) => b.pct - a.pct),
    [all, period, transactions]
  );

  const budgeted = rows.reduce((s, r) => s + r.limit, 0);
  const spent = rows.reduce((s, r) => s + r.spent, 0);

  const shift = (delta) =>
    setPeriod((p) => {
      let month = p.month + delta;
      let year = p.year;
      if (month < 1) { month = 12; year -= 1; }
      if (month > 12) { month = 1; year += 1; }
      return { month, year };
    });

  const prevPeriod = period.month === 1 ? { month: 12, year: period.year - 1 } : { month: period.month - 1, year: period.year };
  const previous = all.filter((b) => Number(b.month) === prevPeriod.month && Number(b.year) === prevPeriod.year);

  const copyPrevious = async () => {
    setCopying(true);
    let done = 0;
    try {
      for (const b of previous) {
        await budgetApi.createBudget({ category: normCategory(b.category), limit: b.limit, month: period.month, year: period.year });
        done += 1;
      }
      toast.success(`Copied ${done} ${done === 1 ? 'budget' : 'budgets'} from ${MONTHS_FULL[prevPeriod.month - 1]}.`);
    } catch (err) {
      toast.error(done ? `Copied ${done}, then hit a problem: ${err.message}` : err.message);
    } finally {
      setCopying(false);
      bump();
    }
  };

  const remove = async (b) => {
    const ok = await confirm({
      title: 'Delete this budget?',
      message: `The ${titleCase(b.category)} budget for ${MONTHS_FULL[Number(b.month) - 1]} ${b.year} will be removed. Your transactions stay untouched.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await budgetApi.deleteBudget(b._id);
      toast.success('Budget deleted.');
      bump();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loading = (budgetsQ.loading && !budgetsQ.data) || txLoading;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Budgets</h1>
          <p className="muted">Set a limit per category and see how much of it is left.</p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setForm({ budget: null })}>Add budget</Button>
      </div>

      <div className="month-nav">
        <button className="btn icon secondary" onClick={() => shift(-1)} aria-label="Previous month"><Icon name="left" /></button>
        <h2 aria-live="polite">{MONTHS_FULL[period.month - 1]} {period.year}</h2>
        <button className="btn icon secondary" onClick={() => shift(1)} aria-label="Next month"><Icon name="right" /></button>
      </div>

      <ErrorBanner message={budgetsQ.error || txError} onRetry={budgetsQ.reload} />

      {loading ? (
        <Skeleton height={260} radius={18} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon="wallet"
            title={`No budgets for ${MONTHS_FULL[period.month - 1]}`}
            action={
              <div className="row center">
                <Button variant="primary" icon="plus" onClick={() => setForm({ budget: null })}>Add budget</Button>
                {previous.length > 0 && (
                  <Button loading={copying} onClick={copyPrevious}>Copy from {MONTHS_FULL[prevPeriod.month - 1]}</Button>
                )}
              </div>
            }
          >
            Pick a category and a limit, and spending against it shows up here.
          </EmptyState>
        </Panel>
      ) : (
        <>
          <div className="panel stat-strip" aria-label="Budget totals">
            <div><p className="muted small">Budgeted</p><p className="stat-value">{formatRupee(budgeted)}</p></div>
            <div><p className="muted small">Spent</p><p className="stat-value">{formatRupee(spent)}</p></div>
            <div>
              <p className="muted small">{budgeted - spent < 0 ? 'Over by' : 'Remaining'}</p>
              <p className={`stat-value ${budgeted - spent < 0 ? 'expense' : 'income'}`}>{formatRupee(Math.abs(budgeted - spent))}</p>
            </div>
          </div>
          <Panel>
            <ul className="budget-list">
              {rows.map((b) => (
                <li key={b._id}>
                  <div className="row-between">
                    <div>
                      <p className="font-medium">{titleCase(b.category)}</p>
                      <p className={`small status-text ${b.tone}`}>
                        {b.tone === 'over' ? `Over by ${formatRupee(-b.remaining)}` : `${formatRupee(b.remaining)} left`}, {b.label.toLowerCase()}
                      </p>
                    </div>
                    <div className="row">
                      <button className="btn icon ghost sm" onClick={() => setForm({ budget: b })} aria-label={`Edit ${titleCase(b.category)} budget`}><Icon name="edit" size={18} /></button>
                      <button className="btn icon ghost sm" onClick={() => remove(b)} aria-label={`Delete ${titleCase(b.category)} budget`}><Icon name="trash" size={18} /></button>
                    </div>
                  </div>
                  <ProgressBar value={b.pct} tone={b.tone} label={`${titleCase(b.category)} budget used`} />
                  <p className="muted small">{formatRupee(b.spent)} spent of {formatRupee(b.limit)}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}

      {form && <BudgetForm budget={form.budget} period={period} onClose={() => setForm(null)} onSaved={bump} />}
    </>
  );
}

export default Budgets;
