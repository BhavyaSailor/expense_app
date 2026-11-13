import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import { useFeedback } from '../../context/Feedback';
import { transactionsApi } from '../../utils/api';
import { titleCase, toISODate, txDate } from '../../utils/finance';

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'savings', label: 'Savings' },
];

const CATEGORY_SUGGESTIONS = [
  'Food', 'Groceries', 'Rent', 'Bills', 'Travel', 'Shopping', 'Health',
  'Entertainment', 'Education', 'Salary', 'Investments', 'Goals',
];

function TransactionForm({ transaction, onClose, onSaved }) {
  const editing = Boolean(transaction);
  const { toast } = useFeedback();
  const [form, setForm] = useState(() => ({
    name: transaction?.name || '',
    amount: transaction?.amount ?? '',
    type: transaction?.type || 'expense',
    category: transaction ? titleCase(transaction.category) : '',
    notes: transaction?.notes || '',
    date: transaction ? toISODate(txDate(transaction)) : toISODate(new Date()),
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const amount = Number(form.amount);
    if (!form.name.trim()) return setError('Enter a title for this transaction.');
    if (!(amount > 0)) return setError('Amount must be more than zero.');
    if (!form.category.trim()) return setError('Choose or type a category.');

    setSaving(true);
    try {
      if (editing) {
        await transactionsApi.updateTransaction(transaction._id || transaction.id, {
          name: form.name.trim(),
          amount,
          category: form.category.trim(),
          notes: form.notes.trim(),
        });
      } else {
        await transactionsApi.createTransaction({
          name: form.name.trim(),
          amount,
          type: form.type,
          category: form.category.trim(),
          notes: form.notes.trim() || undefined,
          date: form.date || undefined,
        });
      }
      toast.success(editing ? 'Transaction updated.' : 'Transaction added.');
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? 'Edit transaction' : 'Add transaction'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="tx-form" loading={saving}>
            {editing ? 'Save changes' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <form id="tx-form" className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <span className="label">Type</span>
          <Segmented
            label="Transaction type"
            options={TYPES}
            value={form.type}
            disabled={editing}
            onChange={(type) => setForm((f) => ({ ...f, type }))}
          />
          {editing && <p className="hint">Type and date can’t be changed after saving. Delete and re-add to change them.</p>}
        </div>
        <div className="field">
          <label htmlFor="tx-name">Title</label>
          <input id="tx-name" name="name" value={form.name} onChange={set} placeholder="Salary, groceries, rent" autoFocus />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="tx-amount">Amount (₹)</label>
            <input id="tx-amount" name="amount" type="number" inputMode="decimal" min="0" step="any" value={form.amount} onChange={set} placeholder="0" />
          </div>
          <div className="field">
            <label htmlFor="tx-date">Date</label>
            <input id="tx-date" name="date" type="date" value={form.date} onChange={set} disabled={editing} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="tx-category">Category</label>
          <input id="tx-category" name="category" list="tx-categories" value={form.category} onChange={set} placeholder="Food, Travel, Salary" />
          <datalist id="tx-categories">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="tx-notes">Notes (optional)</label>
          <input id="tx-notes" name="notes" value={form.notes} onChange={set} placeholder="Anything worth remembering" />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default TransactionForm;
