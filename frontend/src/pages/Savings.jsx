import { useEffect, useState } from 'react';
import LineChartPlaceholder from '../components/charts/LineChartPlaceholder';
import { dashboardApi, transactionsApi, formatRupee } from '../utils/api';

function Savings() {
  const [dashboard, setDashboard] = useState({});
  const [savings, setSavings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trend, setTrend] = useState([]);

  const loadSavings = async () => {
    try {
      const [summary, savingsData, monthly] = await Promise.all([
        dashboardApi.getDashboard(),
        transactionsApi.getTransactions({ type: 'savings', limit: 50 }),
        dashboardApi.getMonthlyTrend(),
      ]);

      setDashboard(summary);
      const txs = savingsData.transactions || [];
      setSavings(txs);

      const grouped = txs.reduce((acc, transaction) => {
        const category = transaction.category || 'Other';
        acc[category] = (acc[category] || 0) + Number(transaction.amount);
        return acc;
      }, {});

      setCategories(Object.entries(grouped).map(([category, total]) => ({ category, amount: total })));

      // map monthly trend data to chart-friendly format
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trend = (monthly.month || []).map((m) => ({ label: months[(m._id || 1) - 1] || String(m._id), value: m.total }));
      setTrend(trend);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadSavings();
  }, []);

  const savingsRate = dashboard.totalIncome ? Math.round((dashboard.totalSavings / dashboard.totalIncome) * 100) : 0;

  return (
    <div className="savings-page">
      <div className="page-heading">
        <h1 className="page-title">Savings</h1>
        <p className="text-muted">Overview of savings progress, goals, and categories.</p>
      </div>

      <div className="section-grid stats-grid">
        <div className="card">
          <div className="card-inner">
            <p className="eyebrow">Total Savings</p>
            <h2>{formatRupee(dashboard.totalSavings)}</h2>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <p className="eyebrow">Savings Rate</p>
            <h2>{savingsRate}%</h2>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <p className="eyebrow">Monthly Contribution</p>
            <h2>{formatRupee(12000)}</h2>
          </div>
        </div>
      </div>

      <LineChartPlaceholder title="Savings Trend" subtitle="Track your savings growth over time." data={trend} />

      <div className="section-grid widget-grid">
        {categories.length > 0 ? (
          categories.map((item) => (
            <div key={item.category} className="card">
              <div className="card-inner">
                <p className="eyebrow">{item.category}</p>
                <h3>{formatRupee(item.amount)}</h3>
                <p className="text-muted">Keep building your fund with regular contributions.</p>
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <div className="card-inner">
              <p className="text-muted">No savings categories available yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Savings;
