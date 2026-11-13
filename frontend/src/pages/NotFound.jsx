import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import usePageTitle from '../hooks/usePageTitle';

function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="not-found">
      <Logo />
      <p className="nf-code" aria-hidden="true">404</p>
      <h1>We can’t find that page</h1>
      <p className="muted">The link may be old, or the address may have a typo.</p>
      <Link className="btn primary" to="/">
        Go to your dashboard
      </Link>
    </div>
  );
}

export default NotFound;
