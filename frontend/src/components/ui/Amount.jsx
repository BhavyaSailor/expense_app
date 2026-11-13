import { formatRupee } from '../../utils/api';

function Amount({ type, value }) {
  const sign = type === 'income' ? '+' : type === 'expense' ? '−' : '';
  return (
    <span className={`amount ${type}`}>
      {sign}
      {formatRupee(value)}
    </span>
  );
}

export default Amount;
