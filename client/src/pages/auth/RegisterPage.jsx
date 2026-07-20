import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'resident',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>⚡</div>
          <h1 style={styles.title}>EnergyFlow</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="resident">Resident</option>
              <option value="community_manager">Community Manager</option>
              <option value="energy_provider">Energy Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in here</Link>
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
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
    padding: '20px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#757575',
  },
  error: {
    background: '#FFEBEE',
    color: '#C62828',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    borderLeft: '4px solid #C62828',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#424242',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1.5px solid #E0E0E0',
    fontSize: '14px',
    color: '#212121',
    width: '100%',
  },
  button: {
    background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
    color: '#FFFFFF',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '8px',
  },
  loginText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: '#757575',
  },
  link: {
    color: '#2E7D32',
    fontWeight: '600',
  },
};

export default RegisterPage;