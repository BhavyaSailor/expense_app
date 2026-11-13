import { useState } from 'react';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import useAsync from '../hooks/useAsync';
import usePageTitle from '../hooks/usePageTitle';
import { useApp } from '../context/App';
import { useFeedback } from '../context/Feedback';
import { formatRupee, goalApi, transactionsApi } from '../utils/api';
import { formatDate, formatPercent, percent, toISODate } from '../utils/finance';

function GoalForm({ onClose, onSaved }) {
  const { toast } = useFeedback();
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const target = Number(form.targetAmount);
    if (!form.name.trim()) return setError('Give your goal a name.');
    if (!(target > 0)) return setError('The target must be more than zero.');
    setSaving(true);
    try {
      await goalApi.createGoal({ name: form.name.trim(), targetAmount: target, targetDate: form.targetDate || undefined });
      toast.success('Goal created.');
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create a goal"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="goal-form" loading={saving}>Create goal</Button>
        </>
      }
    >
      <form id="goal-form" className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="g-name">Goal name</label>
          <input id="g-name" name="name" value={form.name} onChange={set} placeholder="Emergency fund, new laptop" autoFocus />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="g-target">Target (₹)</label>
            <input id="g-target" name="targetAmount" type="number" inputMode="decimal" min="0" step="any" value={form.targetAmount} onChange={set} />
          </div>
          <div className="field">
            <label htmlFor="g-date">Target date (optional)</label>
            <input id="g-date" name="targetDate" type="date" min={toISODate(new Date())} value={form.targetDate} onChange={set} />
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}

function ContributeForm({ goal, onClose, onSaved }) {
  const { toast } = useFeedback();
  const remaining = goal.targetAmount - goal.currentAmount;
  const [amount, setAmount] = useState('');
  const [log, setLog] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!(value > 0)) return setError('Enter an amount more than zero.');
    setSaving(true);
    try {
      const res = await goalApi.contributeGoal(goal._id, value);
      const excess = res.goal?.excessAmount || 0;
      const applied = value - excess;
      let note = excess > 0 ? `Goal complete. ${formatRupee(excess)} was over the target and wasn’t added.` : `Added ${formatRupee(applied)} to ${goal.name}.`;
      if (log && applied > 0) {
        try {
          await transactionsApi.createTransaction({
            name: `Goal: ${goal.name}`,
            amount: applied,
            type: 'savings',
            category: 'goals',
            date: toISODate(new Date()),
          });
        } catch {
          note += ' It couldn’t be logged as a savings transaction.';
        }
      }
      toast.success(note);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      size="sm"
      title={`Add to ${goal.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="contribute-form" loading={saving}>Add money</Button>
        </>
      }
    >
      <form id="contribute-form" className="stack" onSubmit={submit} noValidate>
        <p className="muted">{formatRupee(remaining)} left to reach {formatRupee(goal.targetAmount)}.</p>
        <div className="field">
          <label htmlFor="c-amount">Amount (₹)</label>
          <input id="c-amount" type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </div>
        <label className="check">
          <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} />
          <span>Also record this as a savings transaction</span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}

function dueText(goal, remaining) {
  if (!goal.targetDate) return null;
  const due = new Date(goal.targetDate);
  const days = Math.ceil((due - new Date()) / 86400000);
  if (days < 0) return `Target date passed on ${formatDate(due)}.`;
  const months = Math.max(1, Math.ceil(days / 30));
  return `Due ${formatDate(due)}, ${days} ${days === 1 ? 'day' : 'days'} left. Save about ${formatRupee(Math.ceil(remaining / months))} a month to get there.`;
}

function Goals() {
  usePageTitle('Goals');
  const { version, bump } = useApp();
  const { toast, confirm } = useFeedback();
  const { data, loading, error, reload } = useAsync(() => goalApi.getGoals(), [version]);
  const [dialog, setDialog] = useState(null);
  const goals = data?.goals || [];

  const remove = async (g) => {
    const ok = await confirm({
      title: 'Delete this goal?',
      message: `“${g.name}” and its progress of ${formatRupee(g.currentAmount)} will be removed. Savings transactions you logged stay.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await goalApi.deleteGoal(g._id);
      toast.success('Goal deleted.');
      bump();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Goals</h1>
          <p className="muted">Save toward something specific and watch it fill up.</p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setDialog({ kind: 'new' })}>Add goal</Button>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      {loading && !data ? (
        <div className="goal-grid"><Skeleton height={200} radius={18} /><Skeleton height={200} radius={18} /></div>
      ) : goals.length === 0 && !error ? (
        <Panel>
          <EmptyState icon="target" title="No goals yet" action={<Button variant="primary" icon="plus" onClick={() => setDialog({ kind: 'new' })}>Create your first goal</Button>}>
            A goal could be an emergency fund, a trip or a new laptop.
          </EmptyState>
        </Panel>
      ) : (
        <div className="goal-grid">
          {goals.map((g) => {
            const done = g.currentAmount >= g.targetAmount;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const pct = percent(g.currentAmount, g.targetAmount);
            const due = done ? null : dueText(g, remaining);
            return (
              <Panel key={g._id} className="goal">
                <div className="row-between">
                  <h2>{g.name}</h2>
                  {done ? <Badge tone="income">Completed</Badge> : <Badge tone="neutral">{formatPercent(pct)}</Badge>}
                </div>
                <p className="goal-amount">
                  {formatRupee(g.currentAmount)} <span className="muted">of {formatRupee(g.targetAmount)}</span>
                </p>
                <ProgressBar value={pct} tone={done ? 'ok' : 'brand'} label={`${g.name} progress`} />
                <p className="muted small">{done ? 'You reached this goal.' : `${formatRupee(remaining)} to go.`} {due}</p>
                <div className="row">
                  {!done && <Button variant="primary" size="sm" icon="plus" onClick={() => setDialog({ kind: 'add', goal: g })}>Add money</Button>}
                  <Button variant="ghost" size="sm" onClick={() => remove(g)} aria-label={`Delete ${g.name}`}>
                    <Icon name="trash" size={18} />
                    Delete
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {dialog?.kind === 'new' && <GoalForm onClose={() => setDialog(null)} onSaved={bump} />}
      {dialog?.kind === 'add' && <ContributeForm goal={dialog.goal} onClose={() => setDialog(null)} onSaved={bump} />}
    </>
  );
}

export default Goals;
