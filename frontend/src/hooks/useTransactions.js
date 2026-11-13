import { fetchAllTransactions } from '../utils/api';
import { useApp } from '../context/App';
import useAsync from './useAsync';

export default function useTransactions() {
  const { version } = useApp();
  const { data, loading, error, reload } = useAsync(fetchAllTransactions, [version]);
  return { transactions: data || [], loading: loading && !data, error, reload };
}
