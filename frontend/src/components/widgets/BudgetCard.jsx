import ProgressBar from '../ui/ProgressBar';
import { formatRupee } from '../../utils/api';

function BudgetCard({ budget }) {
  const limit = Number(budget.limit || budget.limitAmount || 0);
  const spent = Number(budget.spent || 0);
  const status = limit > 0 ? spent / limit : 0;
  const color = status > 1 ? 'var(--danger)' : status > 0.85 ? 'orange' : 'var(--success)';

  return (
    <div className="card budget-card">
      <div className="card-inner">
        <div className="budget-card-top">
          <div>
            <p className="eyebrow">{budget.category}</p>
            <p className="font-medium">{formatRupee(limit)}</p>
          </div>
          <span className={`badge ${status > 1 ? 'expense' : status > 0.85 ? 'income' : 'savings'}`}>
            {status > 1 ? 'Exceeded' : status > 0.85 ? 'Near limit' : 'Healthy'}
          </span>
        </div>
        <div className="budget-progress">
          <ProgressBar value={Math.min(100, status * 100)} color={color} />
          <p className="text-muted">{formatRupee(spent)} spent of {formatRupee(limit)}</p>
        </div>
      </div>
    </div>
  );
}

export default BudgetCard;
