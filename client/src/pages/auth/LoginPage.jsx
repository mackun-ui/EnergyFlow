import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Zap, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <Zap size={28} color="#00C853" />
          </div>
          <h1 style={styles.title}>EnergyFlow</h1>
          <p style={styles.subtitle}>Community Renewable Energy Management</p>
          <p style={styles.region}>Rural Ghana Initiative</p>
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={15} color="#4B5563" style={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={15} color="#4B5563" style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A0F1E',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%)',
    top: '-100px',
    left: '-100px',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)',
    bottom: '-100px',
    right: '-50px',
    pointerEvents: 'none',
  },
  card: {
    background: '#111827',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoBox: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(0,200,83,0.15)',
    border: '1px solid rgba(0,200,83,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    marginBottom: '4px',
  },
  region: {
    fontSize: '11px',
    color: '#00C853',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    borderLeft: '3px solid #EF4444',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0A0F1E',
    fontSize: '14px',
    color: '#F1F5F9',
  },
  button: {
    background: 'linear-gradient(135deg, #00C853, #00952e)',
    color: '#FFFFFF',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '8px',
    boxShadow: '0 4px 20px rgba(0,200,83,0.3)',
    transition: 'opacity 0.2s',
  },
  registerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: '#94A3B8',
  },
  link: {
    color: '#00C853',
    fontWeight: '600',
  },
};

export default LoginPage;