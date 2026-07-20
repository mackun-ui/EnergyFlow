import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/scheduling', label: 'Scheduling', icon: '📅' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <span style={styles.logoIcon}>⚡</span>
        <div>
          <p style={styles.logoTitle}>EnergyFlow</p>
          <p style={styles.logoSubtitle}>Rural Ghana</p>
        </div>
      </div>

      {/* User info */}
      <div style={styles.userSection}>
        <div style={styles.avatar}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={styles.username}>{user?.username}</p>
          <p style={styles.role}>{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) =>
              isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem
            }
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutButton}>
        🚪 Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '18px',
  },
  logoSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#FFA000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '16px',
    flexShrink: 0,
  },
  username: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '13px',
  },
  role: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
    textTransform: 'capitalize',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '18px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px',
    width: '100%',
    transition: 'all 0.2s',
  },
};

export default Sidebar;