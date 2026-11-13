import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import usePageTitle from '../hooks/usePageTitle';
import { useFeedback } from '../context/Feedback';
import { authApi, isAuthed } from '../utils/api';

function Register() {
  usePageTitle('Create account');
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthed()) return <Navigate to="/" replace />;

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    setLoading(true);
    try {
      await authApi.register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created. Log in to get started.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking income, spending and savings in one place."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="stack" onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" value={form.name} onChange={change} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={change} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={change} required />
            <button type="button" className="input-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
          <p className="hint">At least 8 characters.</p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

export default Register;
