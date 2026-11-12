import { useState, useEffect } from 'react';
import { authApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

function Topbar({ onOpenDrawer, onLogout }) {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = authApi.getUser();
    setUser(userData);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = (query || '').trim();
      if (q) navigate(`/transactions?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="topbar card">
      <div className="topbar-left">
        <button className="button ghost hamburger" onClick={onOpenDrawer} aria-label="Open navigation drawer">
          ☰
        </button>
        <div className="search-box input-group">
          {/* <label htmlFor="dashboard-search" className="sr-only">Search transactions</label> */}
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search transactions, categories, goals"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search transactions"
          />
        </div>
      </div>
      <div className="topbar-right">
        <button className="button secondary user-button" onClick={() => navigate('/profile')} aria-label="User profile">
          {user?.name || 'User'} <span>▾</span>
        </button>
        <button className="button ghost logout-btn" onClick={onLogout} aria-label="Logout">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;
