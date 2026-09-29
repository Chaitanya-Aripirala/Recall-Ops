import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.centered}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Left panel – branding */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            RECALL<span>OPS</span>
          </div>
          <h1 className={styles.tagline}>AI Incident Intelligence</h1>
          <p className={styles.sub}>
            Memory-driven incident response — evidence, hypotheses, approval-gated actions,
            postmortems and organisational learning.
          </p>
          <ul className={styles.features}>
            {[
              '⚡ Real-time incident command centre',
              '🧠 Persistent memory recall across incidents',
              '🔬 Root-cause hypothesis engine',
              '📋 Auto-generated postmortems',
            ].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel – form */}
      <div className={styles.formPanel}>
        <div className={`${styles.card} glass-card fade-in-up`}>
          <div className={styles.cardHeader}>
            <h2>Welcome back</h2>
            <p>Sign in to your RecallOps account</p>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account?{' '}
            <Link to="/register">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
