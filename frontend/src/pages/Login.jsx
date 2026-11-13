import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import usePageTitle from '../hooks/usePageTitle';
import { useFeedback } from '../context/Feedback';
import { authApi, isAuthed } from '../utils/api';

function Login() {
  usePageTitle('Log in');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useFeedback();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthed()) return <Navigate to="/" replace />;

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form.email.trim(), form.password);
      authApi.saveToken(data.token);
      if (data.user) authApi.saveUser(data.user);
      toast.success(data.user?.name ? `Welcome back, ${data.user.name.split(' ')[0]}.` : 'Welcome back.');
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up where you left off."
      footer={
        <>
          New to Trackspense? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form className="stack" onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={change} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={change} required />
            <button type="button" className="input-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}

export default Login;
