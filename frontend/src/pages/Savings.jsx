import { useMemo, useState } from 'react';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import RangePicker from '../components/ui/RangePicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import { SavingsChart } from '../components/charts/SeriesCharts';
import TxList from '../components/widgets/TxList';
import useTransactions from '../hooks/useTransactions';
import usePageTitle from '../hooks/usePageTitle';
import { useApp } from '../context/App';
import { formatRupee } from '../utils/api';
import { categoryTotals, formatPercent, inRange, monthlySeries, percent, resolveRange, sumType, titleCase, txDate } from '../utils/finance';

function Savings() {
  usePageTitle('Savings');
  const { openTxForm } = useApp();
  const [range, setRange] = useState({ preset: '12m', from: '', to: '' });
  const { transactions, loading, error, reload } = useTransactions();

  const bounds = useMemo(() => resolveRange(range), [range]);
  const scoped = useMemo(() => inRange(transactions, bounds), [transactions, bounds]);
  const saved = sumType(scoped, 'savings');
  const income = sumType(scoped, 'income');
  const monthly = useMemo(() => monthlySeries(scoped, bounds), [scoped, bounds]);
  const categories = useMemo(() => categoryTotals(scoped, 'savings', 8), [scoped]);
  const entries = useMemo(
    () => scoped.filter((t) => t.type === 'savings').sort((a, b) => txDate(b) - txDate(a)).slice(0, 8),
    [scoped]
  );
  const monthsWithData = monthly.length || 1;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Savings</h1>
          <p className="muted">Money you’ve set aside, and how fast it’s growing.</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {loading ? (
        <Skeleton height={380} radius={18} />
      ) : !error && (
        <>
          <div className="panel stat-strip">
            <div><p className="muted small">Saved in this period</p><p className="stat-value">{formatRupee(saved)}</p></div>
            <div>
              <p className="muted small">Savings rate</p>
              <p className="stat-value">{income > 0 ? formatPercent(percent(saved, income)) : 'No income'}</p>
            </div>
            <div><p className="muted small">Average per month</p><p className="stat-value">{formatRupee(Math.round(saved / monthsWithData))}</p></div>
          </div>

          {saved === 0 ? (
            <Panel>
              <EmptyState icon="layers" title="No savings in this period" action={<Button variant="primary" icon="plus" onClick={() => openTxForm()}>Add a savings entry</Button>}>
                Log a transaction with the Savings type to start building this view.
              </EmptyState>
            </Panel>
          ) : (
            <>
              <Panel title="Savings over time" subtitle="Running total starts at zero at the beginning of the range">
                <SavingsChart data={monthly} />
              </Panel>
              <div className="grid-even">
                <Panel title="By category">
                  <ul className="mini-list">
                    {categories.map((c) => (
                      <li key={c.name} className="row-between">
                        <span className="font-medium">{c.name === 'other categories' ? 'Other categories' : titleCase(c.name)}</span>
                        <span>{formatRupee(c.value)} <span className="muted">{formatPercent(c.share)}</span></span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="Latest savings entries">
                  <TxList items={entries} />
                </Panel>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Savings;
