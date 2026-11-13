import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import { authApi } from '../../utils/api';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'dashboard', end: true },
  { label: 'Transactions', path: '/transactions', icon: 'transactions' },
  { label: 'Budgets', path: '/budgets', icon: 'wallet' },
  { label: 'Goals', path: '/goals', icon: 'target' },
  { label: 'Savings', path: '/savings', icon: 'layers' },
  { label: 'Analytics', path: '/analytics', icon: 'chart' },
];

const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

function Sidebar({ open, onClose, onLogout }) {
  const user = authApi.getUser();
  return (
    <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Sidebar">
      <div className="sidebar-brand">
        <Logo />
        <button className="btn icon ghost drawer-close" onClick={onClose} aria-label="Close menu">
          <Icon name="x" />
        </button>
      </div>
      <nav className="nav-list" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end} className={linkClass}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <NavLink to="/profile" className={linkClass}>
          <Icon name="user" />
          <span className="truncate">{user?.name || 'Profile'}</span>
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <Icon name="settings" />
          <span>Settings</span>
        </NavLink>
        <button className="nav-link nav-button" onClick={onLogout}>
          <Icon name="logout" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
