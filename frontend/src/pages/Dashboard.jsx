import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import RangePicker from '../components/ui/RangePicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import ProgressBar from '../components/ui/ProgressBar';
import AllocationBar from '../components/charts/AllocationBar';
import TrendChart from '../components/charts/TrendChart';
import CategoryChart from '../components/charts/CategoryChart';
import TxList from '../components/widgets/TxList';
import useTransactions from '../hooks/useTransactions';
import useAsync from '../hooks/useAsync';
import usePageTitle from '../hooks/usePageTitle';
import { useApp } from '../context/App';
import { authApi, budgetApi, formatRupee, goalApi } from '../utils/api';
import {
  MONTHS_FULL, budgetStatus, categoryTotals, describeRange, greeting, inRange,
  monthlySeries, percent, resolveRange, spentForBudget, titleCase, totals, txDate,
} from '../utils/finance';

function Dashboard() {
  usePageTitle('Dashboard');
  const { version, openTxForm } = useApp();
  const user = authApi.getUser();
  const [range, setRange] = useState({ preset: '6m', from: '', to: '' });
  const { transactions, loading, error, reload } = useTransactions();
  const budgetsQ = useAsync(() => budgetApi.getBudgets(), [version]);
  const goalsQ = useAsync(() => goalApi.getGoals(), [version]);

  const bounds = useMemo(() => resolveRange(range), [range]);
  const scoped = useMemo(() => inRange(transactions, bounds), [transactions, bounds]);
  const sums = useMemo(() => totals(scoped), [scoped]);
  const monthly = useMemo(() => monthlySeries(scoped, bounds), [scoped, bounds]);
  const categories = useMemo(() => categoryTotals(scoped, 'expense'), [scoped]);
  const recent = useMemo(
    () => [...transactions].sort((a, b) => txDate(b) - txDate(a)).slice(0, 6),
    [transactions]
  );

  const now = new Date();
  const monthBudgets = useMemo(
    () =>
      (budgetsQ.data?.budgets || [])
        .filter((b) => Number(b.month) === now.getMonth() + 1 && Number(b.year) === now.getFullYear())
        .map((b) => {
          const spent = spentForBudget(b, transactions);
          return { ...b, spent, ...budgetStatus(spent, b.limit) };
        })
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [budgetsQ.data, transactions]
  );
  const goals = useMemo(
    () =>
      [...(goalsQ.data?.goals || [])]
        .sort((a, b) => Number(a.status === 'Completed') - Number(b.status === 'Completed'))
        .slice(0, 3),
    [goalsQ.data]
  );

  const firstName = user?.name?.split(' ')[0];
  const overspent = sums.left < 0;
  const empty = !loading && !error && transactions.length === 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{firstName ? `${greeting()}, ${firstName}` : greeting()}</h1>
          <p className="muted">Here’s where your money has gone.</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {loading ? (
        <>
          <Skeleton height={220} radius={28} />
          <div className="grid-2">
            <Skeleton height={340} radius={18} />
            <Skeleton height={340} radius={18} />
          </div>
        </>
      ) : empty ? (
        <Panel>
          <EmptyState
            icon="transactions"
            title="No transactions yet"
            action={<Button variant="primary" icon="plus" onClick={() => openTxForm()}>Add your first transaction</Button>}
          >
            Add an income or expense and your month starts to take shape here.
          </EmptyState>
        </Panel>
      ) : !error && (
        <>
          <section className="hero" aria-label="Summary">
            <p className="hero-label">{overspent ? 'Overspent by' : 'Left to spend'}</p>
            <p className="hero-figure">{formatRupee(Math.abs(sums.left))}</p>
            <p className="hero-sub">
              {sums.income > 0
                ? `of ${formatRupee(sums.income)} earned ${describeRange(range)}`
                : `No income recorded ${describeRange(range)}`}
              {overspent && ', so spending and saving came to more than you earned'}
            </p>
            <AllocationBar income={sums.income} expense={sums.expense} savings={sums.savings} />
          </section>

          <div className="grid-2">
            <Panel title="Income and expenses" subtitle="Month by month">
              <TrendChart data={monthly} />
            </Panel>
            <Panel title="Where it went" subtitle="Expenses by category">
              {categories.length ? (
                <CategoryChart data={categories} />
              ) : (
                <EmptyState icon="chart" title="No expenses in this period">Try a wider date range.</EmptyState>
              )}
            </Panel>
          </div>

          <div className="grid-2">
            <Panel
              title="Recent transactions"
              action={<Link className="btn ghost sm" to="/transactions">View all</Link>}
            >
              <TxList items={recent} />
            </Panel>
            <div className="stack-lg">
              <Panel
                title={`${MONTHS_FULL[now.getMonth()]} budgets`}
                action={<Link className="btn ghost sm" to="/budgets">Manage</Link>}
              >
                {monthBudgets.length ? (
                  <ul className="mini-list">
                    {monthBudgets.map((b) => (
                      <li key={b._id}>
                        <div className="row-between">
                          <span className="font-medium">{titleCase(b.category)}</span>
                          <span className={`status-text ${b.tone}`}>{formatRupee(b.spent)} of {formatRupee(b.limit)}</span>
                        </div>
                        <ProgressBar value={b.pct} tone={b.tone} label={`${titleCase(b.category)} budget used`} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No budgets set for this month yet. <Link to="/budgets">Set one up</Link>.</p>
                )}
              </Panel>
              <Panel title="Goals" action={<Link className="btn ghost sm" to="/goals">See all</Link>}>
                {goals.length ? (
                  <ul className="mini-list">
                    {goals.map((g) => {
                      const pct = percent(g.currentAmount, g.targetAmount);
                      return (
                        <li key={g._id}>
                          <div className="row-between">
                            <span className="font-medium">{g.name}</span>
                            <span className="muted">{formatRupee(g.currentAmount)} of {formatRupee(g.targetAmount)}</span>
                          </div>
                          <ProgressBar value={pct} tone="brand" label={`${g.name} progress`} />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="muted">No goals yet. <Link to="/goals">Create your first goal</Link>.</p>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Dashboard;
