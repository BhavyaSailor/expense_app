import { useEffect, useState } from 'react';
import { formatRupee } from '../../utils/api';
import { formatPercent, percent } from '../../utils/finance';

function AllocationBar({ income, expense, savings }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const left = income - expense - savings;
  const whole = Math.max(income, expense + savings) || 1;
  const segments = [
    { key: 'spent', label: 'Spent', value: expense },
    { key: 'saved', label: 'Saved', value: savings },
    { key: 'left', label: 'Left', value: Math.max(left, 0) },
  ];

  return (
    <div className="alloc-wrap">
      <div
        className="alloc"
        role="img"
        aria-label={`Of ${formatRupee(income)} income: ${formatRupee(expense)} spent, ${formatRupee(savings)} saved, ${formatRupee(Math.max(left, 0))} left`}
      >
        {segments.map((s) => (
          <span key={s.key} className={`alloc-seg ${s.key}`} style={{ width: ready ? `${(s.value / whole) * 100}%` : '0%' }} />
        ))}
      </div>
      <ul className="alloc-legend">
        {segments.map((s) => (
          <li key={s.key}>
            <span className={`swatch alloc-swatch ${s.key}`} />
            <span className="alloc-label">{s.label}</span>
            <strong>{formatRupee(s.value)}</strong>
            <span className="alloc-share">{income > 0 ? `${formatPercent(percent(s.value, income))} of income` : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllocationBar;
