import { useEffect, useState } from 'react';
import LineChartPlaceholder from '../components/charts/LineChartPlaceholder';
import PieChartPlaceholder from '../components/charts/PieChartPlaceholder';
import { analyticsApi, formatRupee } from '../utils/api';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Analytics() {
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [topCategory, setTopCategory] = useState(null);
  const [daily, setDaily] = useState([]);

  const loadAnalytics = async () => {
    try {
      const [monthlyData, categoriesData, statsData, recentData, topData, dailyData] = await Promise.all([
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getCategorySpending(),
        analyticsApi.getStats(),
        analyticsApi.getRecentExpense(),
        analyticsApi.getTopCategory(),
        analyticsApi.getDailyAnalytics(),
      ]);

      setMonthly(
        (monthlyData.analytics || []).map((item) => ({
          label: monthNames[(item._id?.month || 0) - 1] || `M${item._id?.month}`,
          value: item.total || 0,
        }))
      );
      setCategories(
        (categoriesData.category || []).map((item) => ({
          label: item.category,
          value: item.totalSpent || 0,
        }))
      );
      setStats(statsData.stats || null);
      setRecentExpenses(recentData.recent || []);
      setTopCategory(topData.topCategory || null);
      setDaily(dailyData.daily || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="analytics-page">
      <div className="page-heading">
        <h1 className="page-title">Analytics</h1>
        <p className="text-muted ">Explore income, expenses, budgets, and category performance.</p>
      </div>
      <br />

      <div className="section-grid charts-grid">
        <LineChartPlaceholder title="Monthly Expense Trend" subtitle="Compare expense totals over time." data={monthly} />
        <PieChartPlaceholder title="Top Expense Categories" subtitle="Where your money goes." data={categories} />
      </div>
<br />
      <div className="section-grid charts-grid">
        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Performance Summary</h2>
            <p className="text-muted">Quick view of key metrics.</p>
            {stats ? (
              <div className="stats-grid">
                <div className="card stat-card compact">
                  <div className="card-inner">
                    <p className="eyebrow">Total Transactions</p>
                    <h3>{stats.totalTransactions}</h3>
                  </div>
                </div>
                <div className="card stat-card compact">
                  <div className="card-inner">
                    <p className="eyebrow">Income</p>
                    <h3>{formatRupee(stats.totalIncome)}</h3>
                  </div>
                </div>
                <div className="card stat-card compact">
                  <div className="card-inner">
                    <p className="eyebrow">Expense</p>
                    <h3>{formatRupee(stats.totalExpense)}</h3>
                  </div>
                </div>
                <div className="card stat-card compact">
                  <div className="card-inner">
                    <p className="eyebrow">Savings</p>
                    <h3>{formatRupee(stats.totalSavings)}</h3>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">Loading stats…</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Top Category</h2>
            <p className="text-muted">Highest spending bucket.</p>
            {topCategory ? (
              <p>{topCategory._id}: {formatRupee(topCategory.total)}</p>
            ) : (
              <p className="text-muted">No top category data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="section-grid charts-grid">
        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Recent Expenses</h2>
            <p className="text-muted">Latest expense transactions.</p>
            {recentExpenses.length > 0 ? (
              <ul>
                {recentExpenses.map((item) => (
                  <li key={item._id || item.id}>
                    {item.name} • {formatRupee(item.amount)} • {item.date ? item.date.slice(0, 10) : item.createdAt?.slice(0, 10)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No recent expense records.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Daily Expense Trend</h2>
            <p className="text-muted">A day-by-day view.</p>
            {daily.length > 0 ? (
              <ul>
                {daily.map((item) => (
                  <li key={item.date}>{item.date}: {formatRupee(item.total)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No daily expense data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
