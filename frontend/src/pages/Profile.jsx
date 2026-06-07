import { useEffect, useState } from 'react';
import { authApi, dashboardApi, formatRupee } from '../utils/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const u = authApi.getUser();
    setUser(u);

    const loadStats = async () => {
      try {
        const res = await dashboardApi.getDashboard();
        setStats(res);
      } catch (err) {
        console.error(err.message);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="profile-page">
      <div className="page-heading page-heading-split">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="text-muted">Your account information and security settings.</p>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">User Information</h2>
            <div className="input-group">
              <label>Name</label>
              <input type="text" value={user?.name || ''} readOnly />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} readOnly />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Account Statistics</h2>
            <div className="stats-grid">
              <div className="card stat-card compact">
                <div className="card-inner">
                  <p className="eyebrow">Total Income</p>
                  <h3>{formatRupee(stats.totalIncome || 0)}</h3>
                </div>
              </div>
              <div className="card stat-card compact">
                <div className="card-inner">
                  <p className="eyebrow">Total Expense</p>
                  <h3>{formatRupee(stats.totalExpense || 0)}</h3>
                </div>
              </div>
              <div className="card stat-card compact">
                <div className="card-inner">
                  <p className="eyebrow">Total Savings</p>
                  <h3>{formatRupee(stats.totalSavings || 0)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
