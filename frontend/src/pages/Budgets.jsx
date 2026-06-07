import { useEffect, useState } from 'react';
import BudgetCard from '../components/widgets/BudgetCard';
import Button from '../components/ui/Button';
import { budgetApi, formatRupee } from '../utils/api';

const defaultForm = {
  category: '',
  limit: '',
  month: '',
  year: '',
};

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const loadBudgets = async () => {
    try {
      const data = await budgetApi.getSummary();
      setBudgets(data.summary || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await budgetApi.createBudget({
        category: formData.category,
        limit: Number(formData.limit),
        month: formData.month,
        year: Number(formData.year),
      });
      setFormData(defaultForm);
      setShowForm(false);
      loadBudgets();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="budgets-page">
      <div className="page-heading page-heading-split">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="text-muted">Manage your category budgets and watch for alerts.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Cancel' : 'Add Budget'}
        </Button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-inner">
            <div className="section-grid">
              <div className="input-group">
                <label>Category</label>
                <input name="category" value={formData.category} onChange={handleChange} placeholder="Travel" />
              </div>
              <div className="input-group">
                <label>Limit</label>
                <input name="limit" type="number" value={formData.limit} onChange={handleChange} placeholder="50000" />
              </div>
              <div className="input-group">
                <label>Month</label>
                <input name="month" value={formData.month} onChange={handleChange} placeholder="June" />
              </div>
              <div className="input-group">
                <label>Year</label>
                <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="2026" />
              </div>
              <Button variant="primary" onClick={handleSubmit}>Create Budget</Button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-muted" style={{ color: '#ef4444' }}>{message}</p>}

      <div className="section-grid">
        {budgets.length > 0 ? (
          budgets.map((budget) => <BudgetCard key={budget.category} budget={budget} />)
        ) : (
          <div className="card">
            <div className="card-inner">
              <p className="text-muted">No budgets yet. Add a category to begin tracking spending.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Budgets;
