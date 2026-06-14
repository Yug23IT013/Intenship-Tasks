import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdOutlineManageAccounts } from 'react-icons/md';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email || !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow glow-1"></div>
        <div className="auth-glow glow-2"></div>
        <div className="auth-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.3}s`, '--x': `${Math.random() * 100}%` }}></div>
          ))}
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <MdOutlineManageAccounts className="auth-logo-icon" />
          <h1 className="auth-brand">EMS</h1>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to manage your employee records</p>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="login-email" name="email" type="email"
                value={form.email} onChange={handleChange}
                placeholder="admin@company.com"
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="login-password" name="password"
                type={showPwd ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-right" id="toggle-password" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" id="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading"><span className="btn-spinner"></span>Signing in...</span>
            ) : (
              <><FiLogIn /> Sign In</>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" id="register-link">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
