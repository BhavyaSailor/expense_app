import Badge from '../ui/Badge';
import { formatRupee } from '../../utils/api';
import { useNavigate } from 'react-router-dom';


function RecentTransactions({ transactions }) {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div className="card-inner">
        <div className="card-header">
          <h2 className="section-title">Recent Transactions</h2>
          <button className="button ghost" onClick={() => navigate('/transactions')}>View all</button>
        </div>
        <div className="transaction-list">
          {transactions.map((item) => (
            <div key={item._id || item.id} className="transaction-item">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-muted">{item.category} • {item.date ? item.date.slice(0, 10) : item.createdAt?.slice(0, 10)}</p>
              </div>
              <div>
                <p className={item.type}>{formatRupee(item.amount)}</p>
                <Badge variant={item.type}>{item.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentTransactions;
