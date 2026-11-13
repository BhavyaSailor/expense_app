import { useMemo, useState } from 'react';
import Panel from '../components/ui/Panel';
import RangePicker from '../components/ui/RangePicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import TrendChart from '../components/charts/TrendChart';
import CategoryChart from '../components/charts/CategoryChart';
import { DailyChart } from '../components/charts/SeriesCharts';
import useTransactions from '../hooks/useTransactions';
import usePageTitle from '../hooks/usePageTitle';
import { formatRupee } from '../utils/api';
import {
  categoryTotals, dailySeries, formatDate, formatPercent, inRange, monthlySeries,
  resolveRange, titleCase, totals, txDate,
} from '../utils/finance';

function Analytics() {
  usePageTitle('Analytics');
  const [range, setRange] = useState({ preset: '12m', from: '', to: '' });
  const { transactions, loading, error, reload } = useTransactions();

  const bounds = useMemo(() => resolveRange(range), [range]);
  const scoped = useMemo(() => inRange(transactions, bounds), [transactions, bounds]);
  const expenses = useMemo(() => scoped.filter((t) => t.type === 'expense'), [scoped]);
  const sums = useMemo(() => totals(scoped), [scoped]);
  const monthly = useMemo(() => monthlySeries(scoped, bounds), [scoped, bounds]);
  const categories = useMemo(() => categoryTotals(scoped, 'expense'), [scoped]);
  const daily = useMemo(() => dailySeries(scoped, bounds), [scoped, bounds]);
  const biggest = useMemo(
    () => [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [expenses]
  );
  const average = expenses.length ? sums.expense / expenses.length : 0;
  const top = categories[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Patterns in your income, spending and categories.</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {loading ? (
        <Skeleton height={420} radius={18} />
      ) : !error && scoped.length === 0 ? (
        <Panel><EmptyState icon="chart" title="Nothing to analyse yet">There are no transactions in this date range. Try a wider range.</EmptyState></Panel>
      ) : !error && (
        <>
          <div className="panel stat-strip stat-strip-4">
            <div><p className="muted small">Total spent</p><p className="stat-value">{formatRupee(sums.expense)}</p></div>
            <div><p className="muted small">Average expense</p><p className="stat-value">{formatRupee(Math.round(average))}</p></div>
            <div><p className="muted small">Biggest expense</p><p className="stat-value">{biggest[0] ? formatRupee(biggest[0].amount) : '₹0'}</p></div>
            <div>
              <p className="muted small">Top category</p>
              <p className="stat-value">{top ? (top.name === 'other categories' ? 'Other' : titleCase(top.name)) : 'None'}</p>
              {top && <p className="muted small">{formatPercent(top.share)} of spending</p>}
            </div>
          </div>

          <Panel title="Income and expenses by month">
            <TrendChart data={monthly} height={300} />
          </Panel>

          <div className="grid-even">
            <Panel title="Spending by category">
              {categories.length ? <CategoryChart data={categories} /> : <EmptyState icon="chart" title="No expenses in this range" />}
            </Panel>
            <Panel title="Biggest expenses">
              {biggest.length ? (
                <ul className="mini-list">
                  {biggest.map((t) => (
                    <li key={t._id} className="row-between">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="muted small">{titleCase(t.category)}, {formatDate(txDate(t))}</p>
                      </div>
                      <span className="amount expense">{formatRupee(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon="chart" title="No expenses in this range" />
              )}
            </Panel>
          </div>

          <Panel title="Daily spending" subtitle="Up to the last 90 days of the range">
            <DailyChart data={daily} />
          </Panel>
        </>
      )}
    </>
  );
}

export default Analytics;
