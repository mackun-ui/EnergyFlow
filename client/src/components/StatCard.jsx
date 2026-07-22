const StatCard = ({ title, value, unit, icon, color, subtitle }) => {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div style={{ flex: 1 }}>
          <p style={styles.title}>{title}</p>
          <div style={styles.valueRow}>
            <span style={{ ...styles.value, color }}>{value}</span>
            {unit && <span style={styles.unit}>{unit}</span>}
          </div>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={{
          ...styles.iconBox,
          background: `${color}18`,
          border: `1px solid ${color}30`,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#111827',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.06)',
    flex: 1,
    minWidth: '180px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  title: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '10px',
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
    color: '#4B5563',
  },
  subtitle: {
    fontSize: '12px',
    color: '#4B5563',
    marginTop: '6px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export default StatCard;