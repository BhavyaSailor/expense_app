import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';

const ITEMS = [
  { label: 'Home', path: '/', icon: 'dashboard', end: true },
  { label: 'Transactions', path: '/transactions', icon: 'transactions' },
  { label: 'Budgets', path: '/budgets', icon: 'wallet' },
  { label: 'Goals', path: '/goals', icon: 'target' },
];

function MobileNav({ onMore }) {
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {ITEMS.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => `bottom-link${isActive ? ' active' : ''}`}>
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button className="bottom-link" onClick={onMore}>
        <Icon name="menu" size={22} />
        <span>More</span>
      </button>
    </nav>
  );
}

export default MobileNav;
