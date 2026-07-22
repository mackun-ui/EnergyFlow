import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LayoutDashboard, Calendar, BarChart2, LogOut, Users } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/scheduling', label: 'Scheduling', icon: <Calendar size={18} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
    ...(user?.role === 'admin'
      ? [{ path: '/users', label: 'Users', icon: <Users size={18} /> }]
      : []),
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoIconBox}>
          <Zap size={20} color="#00C853" />
        </div>
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
        <div style={styles.userInfo}>
          <p style={styles.username}>{user?.username}</p>
          <p style={styles.role}>{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) =>
              isActive
                ? { ...styles.navItem, ...styles.navItemActive }
                : styles.navItem
            }
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutButton}>
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#080D1A',
    borderRight: '1px solid rgba(255,255,255,0.06)',
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
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(0,200,83,0.15)',
    border: '1px solid rgba(0,200,83,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoTitle: {
    color: '#F1F5F9',
    fontWeight: '700',
    fontSize: '16px',
    lineHeight: 1.2,
  },
  logoSubtitle: {
    color: '#4B5563',
    fontSize: '11px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
    padding: '12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00C853, #00952e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  userInfo: {
    overflow: 'hidden',
  },
  username: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  role: {
    color: '#4B5563',
    fontSize: '11px',
    textTransform: 'capitalize',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    paddingLeft: '12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 14px',
    borderRadius: '10px',
    color: '#94A3B8',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: 'rgba(0,200,83,0.12)',
    color: '#00C853',
    fontWeight: '600',
    border: '1px solid rgba(0,200,83,0.2)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 14px',
    borderRadius: '10px',
    background: 'transparent',
    color: '#4B5563',
    fontSize: '13px',
    fontWeight: '500',
    marginTop: '8px',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.2s',
  },
};

export default Sidebar;