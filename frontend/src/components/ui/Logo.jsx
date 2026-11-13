import { Link } from 'react-router-dom';

function Logo({ tone = 'default' }) {
  return (
    <Link to="/" className={`logo ${tone}`} aria-label="Trackspense home">
      <svg className="logo-mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="logo-bg" />
        <rect x="7" y="8" width="18" height="4" rx="2" className="logo-bar-a" />
        <rect x="7" y="14" width="12" height="4" rx="2" className="logo-bar-b" />
        <rect x="7" y="20" width="7" height="4" rx="2" className="logo-bar-c" />
      </svg>
      <span>Trackspense</span>
    </Link>
  );
}

export default Logo;
