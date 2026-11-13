import Icon from '../ui/Icon';
import Amount from '../ui/Amount';
import { formatDate, titleCase, txDate } from '../../utils/finance';

const ICON = { income: 'arrowDown', expense: 'arrowUp', savings: 'layers' };

function TxList({ items }) {
  return (
    <ul className="ledger">
      {items.map((t) => (
        <li key={t._id || t.id}>
          <span className={`tx-dot ${t.type}`}>
            <Icon name={ICON[t.type] || 'transactions'} size={16} />
          </span>
          <div className="tx-main">
            <p className="tx-name">{t.name}</p>
            <p className="muted small">
              {titleCase(t.category) || 'Uncategorised'}, {formatDate(txDate(t))}
            </p>
          </div>
          <Amount type={t.type} value={t.amount} />
        </li>
      ))}
    </ul>
  );
}

export default TxList;
