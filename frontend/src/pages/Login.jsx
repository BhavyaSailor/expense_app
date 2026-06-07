import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { authApi } from '../utils/api';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await authApi.login(form.email, form.password);
      authApi.saveToken(data.token);
      if (data.user) {
        authApi.saveUser(data.user);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="card-inner">
          <h1 className="page-title">Welcome back</h1>
          <p className="text-muted">Log in to access your finance dashboard.</p>
          {error && <p className="text-muted" style={{ color: '#ef4444' }}>{error}</p>}
          <form onSubmit={handleSubmit} className="input-group">
            <div className="input-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button variant="primary" type="submit">Login</Button>
          </form>
          <p className="text-muted">Don’t have an account? <a href="/register">Register</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
