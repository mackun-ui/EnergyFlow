import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Shield, UserX, Users } from 'lucide-react';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'resident',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      setNewUser({ username: '', password: '', role: 'resident' });
      setShowForm(false);
      showSuccess('User created successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
      showSuccess('User role updated successfully.');
      fetchUsers();
    } catch (err) {
      setError('Failed to update role.');
    }
  };

  const handleDeactivate = async (userId, username) => {
    if (!window.confirm(`Deactivate account for ${username}?`)) return;
    try {
      await api.patch(`/users/${userId}/deactivate`);
      showSuccess(`${username} has been deactivated.`);
      fetchUsers();
    } catch (err) {
      setError('Failed to deactivate user.');
    }
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return '#EF4444';
    if (role === 'energy_provider') return '#F59E0B';
    if (role === 'community_manager') return '#3B82F6';
    return '#00C853';
  };

  if (loading) return (
    <Layout>
      <div style={styles.centered}>Loading users...</div>
    </Layout>
  );

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>User Management</h1>
          <p style={styles.pageSubtitle}>
            Manage system accounts and role assignments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.primaryButton}
        >
          <UserPlus size={15} />
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {success && <div style={styles.successBox}>{success}</div>}
      {error && (
        <div style={styles.errorBox}>
          {error}
          <button onClick={() => setError('')} style={styles.dismissBtn}>✕</button>
        </div>
      )}

      {/* Create User Form */}
      {showForm && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create New User</h2>
          <form onSubmit={handleCreateUser} style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={styles.input}
              >
                <option value="resident">Resident</option>
                <option value="community_manager">Community Manager</option>
                <option value="energy_provider">Energy Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" style={{ ...styles.primaryButton, alignSelf: 'flex-end' }}>
              Create User
            </button>
          </form>
        </div>
      )}

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Users', value: users.length, icon: <Users size={20} color="#00C853" />, color: '#00C853' },
          { label: 'Active Users', value: users.filter(u => u.is_active).length, icon: <Shield size={20} color="#3B82F6" />, color: '#3B82F6' },
          { label: 'Inactive Users', value: users.filter(u => !u.is_active).length, icon: <UserX size={20} color="#EF4444" />, color: '#EF4444' },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statTop}>
              <div>
                <p style={styles.statLabel}>{stat.label}</p>
                <p style={{ ...styles.statValue, color: stat.color }}>{stat.value}</p>
              </div>
              <div style={{
                ...styles.statIcon,
                background: `${stat.color}18`,
                border: `1px solid ${stat.color}30`,
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>All Users</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Username</span>
            <span style={{ flex: 1 }}>Role</span>
            <span style={{ flex: 1 }}>Status</span>
            <span style={{ flex: 1 }}>Created</span>
            <span style={{ flex: 2 }}>Update Role</span>
            <span style={{ flex: 1 }}>Actions</span>
          </div>
          {users.map((u) => (
            <div key={u.user_id} style={styles.tableRow}>
              <span style={{ flex: 2, color: '#F1F5F9', fontWeight: '500' }}>
                {u.username}
                {u.user_id === user?.userId && (
                  <span style={styles.youBadge}>you</span>
                )}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{
                  ...styles.roleBadge,
                  background: `${getRoleColor(u.role)}18`,
                  color: getRoleColor(u.role),
                }}>
                  {u.role.replace(/_/g, ' ')}
                </span>
              </span>
              <span style={{ flex: 1 }}>
                <span style={{
                  ...styles.statusBadge,
                  background: u.is_active ? 'rgba(0,200,83,0.1)' : 'rgba(239,68,68,0.1)',
                  color: u.is_active ? '#00C853' : '#EF4444',
                }}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </span>
              <span style={{ flex: 1, color: '#4B5563', fontSize: '12px' }}>
                {new Date(u.created_at).toLocaleDateString()}
              </span>
              <span style={{ flex: 2 }}>
                {u.user_id !== user?.userId && u.is_active && (
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u.user_id, e.target.value)}
                    style={styles.roleSelect}
                  >
                    <option value="resident">Resident</option>
                    <option value="community_manager">Community Manager</option>
                    <option value="energy_provider">Energy Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </span>
              <span style={{ flex: 1 }}>
                {u.user_id !== user?.userId && u.is_active && (
                  <button
                    onClick={() => handleDeactivate(u.user_id, u.username)}
                    style={styles.deactivateButton}
                  >
                    Deactivate
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    fontSize: '16px',
    color: '#94A3B8',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#94A3B8',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00C853, #00952e)',
    color: '#FFFFFF',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(0,200,83,0.25)',
  },
  successBox: {
    background: 'rgba(0,200,83,0.1)',
    color: '#00C853',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    borderLeft: '3px solid #00C853',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    borderLeft: '3px solid #EF4444',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dismissBtn: {
    background: 'none',
    color: '#EF4444',
    fontSize: '16px',
    fontWeight: '700',
  },
  card: {
    background: '#111827',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: '20px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '160px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0A0F1E',
    fontSize: '13px',
    color: '#F1F5F9',
    width: '100%',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  statCard: {
    background: '#111827',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.06)',
    flex: 1,
    minWidth: '160px',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'flex',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    fontSize: '13px',
    color: '#94A3B8',
    gap: '8px',
  },
  youBadge: {
    background: 'rgba(0,200,83,0.15)',
    color: '#00C853',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '20px',
    marginLeft: '8px',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'capitalize',
    display: 'inline-block',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  roleSelect: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0A0F1E',
    fontSize: '12px',
    color: '#F1F5F9',
    width: '100%',
  },
  deactivateButton: {
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(239,68,68,0.3)',
  },
};

export default UsersPage;