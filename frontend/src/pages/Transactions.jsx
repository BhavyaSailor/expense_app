import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';
import Amount from '../components/ui/Amount';
import Segmented from '../components/ui/Segmented';
import RangePicker from '../components/ui/RangePicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import useAsync from '../hooks/useAsync';
import useDebounced from '../hooks/useDebounced';
import usePageTitle from '../hooks/usePageTitle';
import { useApp } from '../context/App';
import { useFeedback } from '../context/Feedback';
import { exportApi, formatRupee, saveBlob, transactionsApi } from '../utils/api';
import { formatDate, resolveRange, titleCase, toISODate, txDate } from '../utils/finance';

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
  { value: 'savings', label: 'Savings' },
];

const PAGE_SIZE = 10;

function Transactions() {
  usePageTitle('Transactions');
  const { version, bump, openTxForm } = useApp();
  const { toast, confirm } = useFeedback();
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const [search, setSearch] = useState(q);
  useEffect(() => {
    setSearch(q);
    setPage(1);
  }, [q]);
  const debounced = useDebounced(search, 300);

  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('-date');
  const [page, setPage] = useState(1);
  const [range, setRange] = useState({ preset: 'all', from: '', to: '' });
  const [exporting, setExporting] = useState('');

  const bounds = useMemo(() => resolveRange(range), [range]);
  const startDate = bounds.from ? toISODate(bounds.from) : undefined;
  const endDate = bounds.to ? toISODate(bounds.to) : undefined;

  const { data, loading, error, reload } = useAsync(
    () =>
      transactionsApi.getTransactions({
        search: debounced.trim() || undefined,
        type: type || undefined,
        sortBy,
        page,
        limit: PAGE_SIZE,
        startDate,
        endDate,
      }),
    [version, debounced, type, sortBy, page, startDate, endDate]
  );

  const items = data?.transactions || [];
  const total = data?.totalTransactions || 0;
  const totalPages = Math.max(1, data?.totalPages || 1);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const filtersActive = Boolean(debounced.trim() || type || range.preset !== 'all');
  const clearFilters = () => {
    setSearch('');
    setType('');
    setRange({ preset: 'all', from: '', to: '' });
    setPage(1);
  };

  const remove = async (tx) => {
    const ok = await confirm({
      title: 'Delete this transaction?',
      message: `“${tx.name}” for ${formatRupee(tx.amount)} will be removed permanently.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await transactionsApi.deleteTransaction(tx._id || tx.id);
      toast.success('Transaction deleted.');
      bump();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportAs = async (kind) => {
    setExporting(kind);
    try {
      const blob = kind === 'csv' ? await exportApi.downloadCsv() : await exportApi.downloadPdf();
      saveBlob(blob, kind === 'csv' ? 'trackspense-transactions.csv' : 'trackspense-report.pdf');
      toast.success(kind === 'csv' ? 'CSV downloaded.' : 'PDF report downloaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting('');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Transactions</h1>
          <p className="muted">Search, filter and manage every entry.</p>
        </div>
        <div className="row">
          <Button icon="download" size="sm" loading={exporting === 'csv'} onClick={() => exportAs('csv')}>Export CSV</Button>
          <Button icon="download" size="sm" loading={exporting === 'pdf'} onClick={() => exportAs('pdf')}>Export PDF</Button>
        </div>
      </div>

      <Panel>
        <div className="filters">
          <div className="search search-wide">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, category or notes"
              aria-label="Search transactions"
            />
          </div>
          <Segmented label="Filter by type" options={TYPE_OPTIONS} value={type} onChange={(v) => { setType(v); setPage(1); }} />
          <select
            className="select-sm"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            aria-label="Sort transactions"
          >
            <option value="-date">Newest first</option>
            <option value="date">Oldest first</option>
            <option value="-amount">Largest amount</option>
            <option value="amount">Smallest amount</option>
          </select>
        </div>
        <div className="filters-range">
          <RangePicker value={range} onChange={(v) => { setRange(v); setPage(1); }} />
        </div>

        <ErrorBanner message={error} onRetry={reload} />

        {!data && loading ? (
          <div className="stack">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={44} />)}
          </div>
        ) : items.length === 0 && !error ? (
          filtersActive ? (
            <EmptyState icon="search" title="No transactions match" action={<Button onClick={clearFilters}>Clear filters</Button>}>
              Try a different search, type or date range.
            </EmptyState>
          ) : (
            <EmptyState icon="transactions" title="No transactions yet" action={<Button variant="primary" icon="plus" onClick={() => openTxForm()}>Add transaction</Button>}>
              Your income, expenses and savings will be listed here.
            </EmptyState>
          )
        ) : (
          <div className="table-wrap" aria-busy={loading}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="num">Amount</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id || t.id}>
                    <td data-label="Title" className="cell-title">{t.name}</td>
                    <td data-label="Category">{titleCase(t.category) || 'Uncategorised'}</td>
                    <td data-label="Date">{formatDate(txDate(t))}</td>
                    <td data-label="Type"><Badge tone={t.type}>{titleCase(t.type)}</Badge></td>
                    <td data-label="Amount" className="num"><Amount type={t.type} value={t.amount} /></td>
                    <td className="cell-actions">
                      <button className="btn icon ghost sm" onClick={() => openTxForm(t)} aria-label={`Edit ${t.name}`}>
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="btn icon ghost sm" onClick={() => remove(t)} aria-label={`Delete ${t.name}`}>
                        <Icon name="trash" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="pager">
            <span className="muted">
              {total} {total === 1 ? 'transaction' : 'transactions'}, page {page} of {totalPages}
            </span>
            <div className="row">
              <Button size="sm" icon="left" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
                <Icon name="right" size={18} />
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}

export default Transactions;
