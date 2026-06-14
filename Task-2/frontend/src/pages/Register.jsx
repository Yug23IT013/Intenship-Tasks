import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdOutlineManageAccounts } from 'react-icons/md';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      const { data } = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.token, data.user);
      toast.success(`Account created! Welcome, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { label: '', color: '' };
    if (p.length < 6) return { label: 'Weak', color: '#ef4444' };
    if (p.length < 10) return { label: 'Fair', color: '#f59e0b' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) return { label: 'Strong', color: '#10b981' };
    return { label: 'Good', color: '#6366f1' };
  };
  const pwdStrength = getPasswordStrength();

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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Set up your admin account to get started</p>

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="register-name" name="name" type="text"
                value={form.name} onChange={handleChange}
                placeholder="John Doe"
                className={errors.name ? 'input-error' : ''}
                autoComplete="name"
              />
            </div>
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="register-email" name="email" type="email"
                value={form.email} onChange={handleChange}
                placeholder="admin@company.com"
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="register-password" name="password"
                type={showPwd ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters"
                className={errors.password ? 'input-error' : ''}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-right" id="toggle-pwd" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {form.password && (
              <div className="pwd-strength">
                <div className="pwd-bar">
                  <div className="pwd-fill" style={{ width: pwdStrength.label === 'Weak' ? '25%' : pwdStrength.label === 'Fair' ? '50%' : pwdStrength.label === 'Good' ? '75%' : '100%', background: pwdStrength.color }}></div>
                </div>
                <span style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
              </div>
            )}
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="confirm-password" name="confirmPassword"
                type={showPwd ? 'text' : 'password'}
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat password"
                className={errors.confirmPassword ? 'input-error' : ''}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" id="register-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading"><span className="btn-spinner"></span>Creating account...</span>
            ) : (
              <><FiUserPlus /> Create Account</>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" id="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
