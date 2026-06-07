import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { transactionsApi, exportApi, formatRupee } from '../utils/api';

const defaultForm = {
  name: '',
  amount: '',
  type: 'income',
  category: '',
  notes: '',
  date: '',
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const location = useLocation();
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search,
        type: filterType,
        sortBy,
        page,
        limit: 10,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const data = await transactionsApi.getTransactions(params);
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, filterType, sortBy, page]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearch(q);
  }, [location.search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const payload = {
        name: formData.name,
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        notes: formData.notes,
        date: formData.date || undefined,
      };

      if (editingId) {
        await transactionsApi.updateTransaction(editingId, payload);
      } else {
        await transactionsApi.createTransaction(payload);
      }
      resetForm();
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id || transaction.id);
    setFormData({
      name: transaction.name,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      notes: transaction.notes || '',
      date: transaction.date ? transaction.date.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await transactionsApi.deleteTransaction(id);
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadFile = async (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = async () => {
    try {
      const blob = await exportApi.downloadCsv();
      downloadFile(blob, 'transactions.csv');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await exportApi.downloadPdf();
      downloadFile(blob, 'finance-report.pdf');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="transactions-page">
      <div className="page-heading page-heading-split">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="text-muted ">Search, filter, and manage your entries.</p>
        </div>
        <Button  variant="primary" onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Cancel' : 'Add Transaction'}
        </Button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-inner">
            <div className="card-header">
              <h2 className="section-title">{editingId ? 'Edit transaction' : 'New transaction'}</h2>
              <Button variant="primary" onClick={handleSubmit}>
                {editingId ? 'Save changes' : 'Create transaction'}
              </Button>
            </div>
            {error && <p className="text-muted" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="section-grid">
              <div className="input-group">
                <label>Title</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Salary, Grocery, Rent" />
              </div>
              <div className="input-group">
                <label>Amount</label>
                <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="1000" />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="input-group">
                <label>Category</label>
                <input name="category" value={formData.category} onChange={handleChange} placeholder="Salary, Food, Travel" />
              </div>
              <div className="input-group">
                <label>Notes</label>
                <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional details" />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input name="date" type="date" value={formData.date} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-inner">
          <div className="table-actions">
            <input
              className="transaction-search-box"
              type="search"
              placeholder="Search transactions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-chips">
              {['income', 'expense', 'savings'].map((type) => (
                <button
                  key={type}
                  className={`button ghost${filterType === type ? ' active' : ''}`}
                  onClick={() => setFilterType((current) => (current === type ? '' : type))}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="table-actions">
            <div className="input-group" style={{ minWidth: '180px' }}>
              <label htmlFor="start-date">Start date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ minWidth: '180px' }}>
              <label htmlFor="end-date">End date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="button-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={handleDownloadCsv}>Export CSV</Button>
              <Button variant="secondary" onClick={handleDownloadPdf}>Export PDF</Button>
            </div>
          </div>

          <div className="table-actions">
            <label>
              Sort by:{' '}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="-date">Newest by date</option>
                <option value="date">Oldest by date</option>
                <option value="-amount">Largest amount</option>
                <option value="amount">Smallest amount</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="text-muted">Loading transactions…</p>
          ) : (
            <div className="table-responsive">
              <table className="table-shell">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item._id || item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.date ? item.date.slice(0, 10) : item.createdAt?.slice(0, 10)}</td>
                      <td>{formatRupee(item.amount)}</td>
                      <td><Badge variant={item.type}>{item.type}</Badge></td>
                      <td>
                        <button className="button ghost" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="button ghost" onClick={() => handleDelete(item._id || item.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-actions">
            <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <span className="text-muted">Page {page} of {totalPages}</span>
            <Button variant="secondary" onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
