import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import TransactionForm from '../widgets/TransactionForm';
import { AppContext } from '../../context/App';
import { useFeedback } from '../../context/Feedback';
import { UNAUTHORIZED_EVENT, authApi } from '../../utils/api';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useFeedback();
  const [drawer, setDrawer] = useState(false);
  const [version, setVersion] = useState(0);
  const [txForm, setTxForm] = useState(null);

  useEffect(() => {
    setDrawer(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onExpired = () => {
      toast.error('Your session expired. Log in again to continue.');
      navigate('/login', { replace: true });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onExpired);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onExpired);
  }, [navigate, toast]);

  const context = useMemo(
    () => ({
      version,
      bump: () => setVersion((v) => v + 1),
      openTxForm: (transaction = null) => setTxForm({ transaction }),
    }),
    [version]
  );

  const logout = () => {
    authApi.logout();
    toast.info('You’re logged out.');
    navigate('/login');
  };

  return (
    <AppContext.Provider value={context}>
      <div className="app-shell">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Sidebar open={drawer} onClose={() => setDrawer(false)} onLogout={logout} />
        {drawer && <div className="scrim" onClick={() => setDrawer(false)} aria-hidden="true" />}
        <div className="main-col">
          <Topbar onMenu={() => setDrawer(true)} />
          <main id="main" className="page">
            <Outlet />
          </main>
        </div>
        <MobileNav onMore={() => setDrawer(true)} />
        {txForm && (
          <TransactionForm
            transaction={txForm.transaction}
            onClose={() => setTxForm(null)}
            onSaved={context.bump}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default AppLayout;
