import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
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

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#f87171', '#fbbf24', '#34d399', '#22d3ee'];
  const pw = strength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      {/* Brand panel */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            RECALL<span>OPS</span>
          </div>
          <h1 className={styles.tagline}>Join the platform</h1>
          <p className={styles.sub}>
            Create your account and start resolving incidents faster with AI-powered memory recall
            and root-cause analysis.
          </p>
          <ul className={styles.features}>
            {[
              '🛡 Approval-gated automated actions',
              '📊 Cross-incident analytics',
              '🔁 Memory OFF/ON comparison',
              '📝 Automatic runbook generation',
            ].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className={styles.formPanel}>
        <div className={`${styles.card} glass-card fade-in-up`}>
          <div className={styles.cardHeader}>
            <h2>Create account</h2>
            <p>Start your RecallOps journey</p>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Chen"
                autoComplete="name"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
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
              {form.password && (
                <div className={styles.strengthBar}>
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={styles.strengthSegment}
                      style={{ background: i <= pw ? strengthColor[pw] : 'var(--ink-700)' }}
                    />
                  ))}
                  <span className={styles.strengthLabel} style={{ color: strengthColor[pw] }}>
                    {strengthLabel[pw]}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                className={`${styles.input} ${form.confirm && form.confirm !== form.password ? styles.inputError : ''}`}
              />
              {form.confirm && form.confirm !== form.password && (
                <span className={styles.fieldError}>Passwords don't match</span>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account?{' '}
            <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
