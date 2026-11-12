import { useEffect, useState } from 'react';
import GoalCard from '../components/widgets/GoalCard';
import Button from '../components/ui/Button';
import { goalApi } from '../utils/api';

const defaultForm = {
  name: '',
  targetAmount: '',
  targetDate: '',
};

function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const loadGoals = async () => {
    try {
      const data = await goalApi.getGoals();
      setGoals(data.goals || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await goalApi.createGoal({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate,
      });
      setFormData(defaultForm);
      setShowForm(false);
      loadGoals();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleContribute = async (goal) => {
    const contribution = window.prompt('Enter contribution amount');
    if (!contribution) return;

    try {
      await goalApi.contributeGoal(goal._id || goal.id, Number(contribution));
      loadGoals();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalApi.deleteGoal(id);
      loadGoals();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="goals-page">
      <div className="page-heading page-heading-split">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="text-muted">Track your financial goals with clarity and motivation.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Cancel' : 'Add Goal'}
        </Button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-inner">
            <div className="section-grid">
              <div className="input-group">
                <label>Goal name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Emergency Fund" />
              </div>
              <div className="input-group">
                <label>Target amount</label>
                <input name="targetAmount" type="number" value={formData.targetAmount} onChange={handleChange} placeholder="50000" />
              </div>
              <div className="input-group">
                <label>Target date</label>
                <input name="targetDate" type="date" value={formData.targetDate} onChange={handleChange} />
              </div>
              <Button variant="primary" onClick={handleSubmit}>Create Goal</Button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-muted" style={{ color: '#ef4444' }}>{message}</p>}

      <div className="section-grid">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal._id || goal.id} className="goal-card-wrapper">
              <GoalCard goal={goal} onContribute={() => handleContribute(goal)} />
              <div className="card-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <Button variant="ghost" onClick={() => handleDeleteGoal(goal._id || goal.id)}>Delete Goal</Button>
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <div className="card-inner">
              <p className="text-muted">No financial goals yet. Add one to begin tracking progress.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
