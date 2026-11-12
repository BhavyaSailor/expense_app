import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import { formatRupee } from '../../utils/api';

function GoalCard({ goal, onContribute }) {
  const targetAmount = Number(goal.targetAmount || goal.target || 0);
  const currentAmount = Number(goal.currentAmount || goal.current || 0);
  const remaining = targetAmount - currentAmount;
  const progress = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;
  const completed = goal.status === 'Completed' || currentAmount >= targetAmount;

  return (
    <div className={`card goal-card ${completed ? 'goal-completed' : ''}`}>
      <div className="card-inner">
        <div className="goal-card-top">
          <div>
            <p className="eyebrow">{goal.name}</p>
            <h3>{formatRupee(targetAmount)}</h3>
          </div>
          <span className="badge savings">{completed ? 'Completed' : 'In progress'}</span>
        </div>
        <p className="text-muted">{formatRupee(currentAmount)} saved • Remaining {formatRupee(remaining)}</p>
        <ProgressBar value={progress} color={completed ? 'var(--success)' : 'var(--primary)'} />
        <div className="goal-footer">
          <Button variant="primary" onClick={onContribute}>
            {completed ? 'View' : 'Contribute'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GoalCard;
