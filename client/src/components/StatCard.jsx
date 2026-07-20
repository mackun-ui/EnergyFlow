const StatCard = ({ title, value, unit, icon, color, subtitle }) => {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          <p style={styles.title}>{title}</p>
          <div style={styles.valueRow}>
            <span style={{ ...styles.value, color }}>{value}</span>
            {unit && <span style={styles.unit}>{unit}</span>}
          </div>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={{ ...styles.iconBox, background: `${color}20` }}>
          <span style={styles.icon}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    flex: 1,
    minWidth: '180px',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '12px',
    color: '#757575',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  value: {
    fontSize: '28px',
    fontWeight: '700',
  },
  unit: {
    fontSize: '13px',
    color: '#9E9E9E',
  },
  subtitle: {
    fontSize: '12px',
    color: '#9E9E9E',
    marginTop: '4px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '22px',
  },
};

export default StatCard;