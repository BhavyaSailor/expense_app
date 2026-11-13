import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import ErrorBanner from '../components/ui/ErrorBanner';
import useTransactions from '../hooks/useTransactions';
import usePageTitle from '../hooks/usePageTitle';
import { useFeedback } from '../context/Feedback';
import { authApi, formatRupee } from '../utils/api';
import { formatDate, totals, txDate } from '../utils/finance';

function Profile() {
  usePageTitle('Profile');
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const user = authApi.getUser();
  const { transactions, loading, error, reload } = useTransactions();
  const sums = useMemo(() => totals(transactions), [transactions]);
  const first = useMemo(
    () => transactions.reduce((min, t) => { const d = txDate(t); return !min || d < min ? d : min; }, null),
    [transactions]
  );

  const logout = () => {
    authApi.logout();
    toast.info('You’re logged out.');
    navigate('/login');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p className="muted">Your account and a summary of what you’ve tracked.</p>
        </div>
      </div>
      <div className="grid-even">
        <Panel title="Account">
          <dl className="details">
            <div><dt>Name</dt><dd>{user?.name || 'Not available'}</dd></div>
            <div><dt>Email</dt><dd>{user?.email || 'Not available'}</dd></div>
          </dl>
          <Button icon="logout" onClick={logout}>Log out</Button>
        </Panel>
        <Panel title="Activity">
          <ErrorBanner message={error} onRetry={reload} />
          {loading ? (
            <Skeleton height={140} />
          ) : (
            <dl className="details">
              <div><dt>Transactions</dt><dd>{transactions.length}</dd></div>
              <div><dt>Tracking since</dt><dd>{first ? formatDate(first) : 'No transactions yet'}</dd></div>
              <div><dt>Total income</dt><dd>{formatRupee(sums.income)}</dd></div>
              <div><dt>Total expenses</dt><dd>{formatRupee(sums.expense)}</dd></div>
              <div><dt>Total savings</dt><dd>{formatRupee(sums.savings)}</dd></div>
            </dl>
          )}
        </Panel>
      </div>
    </>
  );
}

export default Profile;
