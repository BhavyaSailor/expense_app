import { NavLink } from 'react-router-dom';

const bottomNav = [
  { label: 'Dashboard', path: '/', icon: '🏠' },
  { label: 'Transactions', path: '/transactions', icon: '💳' },
  { label: 'Goals', path: '/goals', icon: '🎯' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];

function MobileNav() {
  return (
    <nav className="mobile-nav card">
      {bottomNav.map((item) => (
        <NavLink key={item.path} to={item.path} className="mobile-nav-link">
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;
