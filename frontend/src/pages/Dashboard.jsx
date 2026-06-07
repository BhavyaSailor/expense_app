import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import LineChartPlaceholder from '../components/charts/LineChartPlaceholder';
import PieChartPlaceholder from '../components/charts/PieChartPlaceholder';
import RecentTransactions from '../components/widgets/RecentTransactions';
import BudgetCard from '../components/widgets/BudgetCard';
import GoalCard from '../components/widgets/GoalCard';
import { dashboardApi, budgetApi, goalApi, transactionsApi, formatRupee } from '../utils/api';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [dashboardSeries, setDashboardSeries] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardData, budgetData, goalData, transactionData, monthlyData, categoryData] = await Promise.all([
        dashboardApi.getDashboard(),
        budgetApi.getSummary(),
        goalApi.getGoals(),
        transactionsApi.getTransactions({ limit: 5 }),
        dashboardApi.getMonthlyTrend(),
        dashboardApi.getCategorySpending(),
      ]);

      setSummary(dashboardData);
      setBudgetSummary(budgetData.summary || []);
      setGoals(goalData.goals || []);
      setRecent(transactionData.transactions || []);

      setMonthlyTrend(
        (monthlyData.month || []).map((item) => ({
          label: monthNames[(item._id || 0) - 1] || `M${item._id}`,
          value: item.total || 0,
        }))
      );
      setCategorySpending(
        (categoryData.category || []).map((item) => ({
          label: item.category,
          value: item.totalSpent || 0,
        }))
      );
      setDashboardSeries([
        { label: 'Income', value: dashboardData.totalIncome || 0 },
        { label: 'Expense', value: dashboardData.totalExpense || 0 },
        { label: 'Savings', value: dashboardData.totalSavings || 0 },
        { label: 'Balance', value: dashboardData.balance || 0 },
      ]);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted">A modern view of your finances, savings, and progress.</p>
        <br />
      </div>

      <div className="section-grid stats-grid">
        <StatCard title="Total Income" value={formatRupee(summary.totalIncome)} change="Tracked across all income sources" icon="💵" accent="income" />
        <StatCard title="Total Expense" value={formatRupee(summary.totalExpense)} change="Total spending this period" icon="📉" accent="expense" />
        <StatCard title="Total Savings" value={formatRupee(summary.totalSavings)} change="Current savings contributions" icon="💰" accent="savings" />
        <StatCard title="Available Balance" value={formatRupee(summary.balance)} change="Available for budgets and goals" icon="🧾" accent="primary" />
      </div>

      <div className="section-grid charts-grid">
        <LineChartPlaceholder title="Monthly Expense Trend" subtitle="See expense flow across recent months." data={monthlyTrend} />
        <div className="section-grid">
          <PieChartPlaceholder title="Spending by Category" subtitle="Top categories this month." data={categorySpending} />
      
        </div>
      </div>
      <br />

      <div className="section-grid widget-grid">
        <RecentTransactions transactions={recent} />
        <div className="card">
          <div className="card-inner">
            <div className="card-header">
              <h2 className="section-title">Active Budgets</h2>
              <button className="button ghost" onClick={() => navigate('/budgets')}>Review</button>
            </div>
            <div className="budget-grid">
              {budgetSummary.length > 0 ? (
                budgetSummary.slice(0, 3).map((budget) => (
                  <BudgetCard key={budget.category} budget={budget} />
                ))
              ) : (
                <p className="text-muted">No budget summary available yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <div className="card-header">
              <h2 className="section-title">Active Goals</h2>
              <button className="button ghost" onClick={() => navigate('/goals')}>Track</button>
            </div>
            <div className="goal-grid">
              {goals.length > 0 ? (
                goals.slice(0, 3).map((goal) => <GoalCard key={goal._id || goal.id} goal={goal} />)
              ) : (
                <p className="text-muted">No goals found yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="text-muted">Refreshing dashboard data...</p>}
    </div>
  );
}

export default Dashboard;
