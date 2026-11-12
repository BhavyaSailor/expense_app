import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Transactions', path: '/transactions', icon: '💳' },
  { label: 'Budgets', path: '/budgets', icon: '📈' },
  { label: 'Goals', path: '/goals', icon: '🎯' },
  { label: 'Savings', path: '/savings', icon: '💰' },
  { label: 'Analytics', path: '/analytics', icon: '📉' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-top card">
        <div className="card-inner">
          <div className="brand-logo">
            <span className="icon-pill">T</span>
            <div>
              <p className="eyebrow">Trackspense</p>
              <h1 className="section-title">Pulse</h1>
            </div>
          </div>
        </div>
      </div>
      <nav className="nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer card">
        <div className="card-inner">
          <p className="eyebrow">Pro Tip</p>
          <p className="text-muted">Check your budgets weekly to stay on track.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
