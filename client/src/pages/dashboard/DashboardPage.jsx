import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [outages, setOutages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, outagesRes, historyRes] = await Promise.all([
        api.get('/energy/summary'),
        api.get('/energy/outages'),
        api.get('/energy/history/1?period=daily'),
      ]);

      setSummary(summaryRes.data.summary);
      setOutages(outagesRes.data.facilities);
      setHistory(historyRes.data.metrics.map((m) => ({
        time: new Date(m.recorded_at).getHours() + ':00',
        Production: parseFloat(m.production_value),
        Consumption: parseFloat(m.consumption_value),
        Battery: parseFloat(m.battery_percentage),
      })));
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (percentage) => {
    if (percentage >= 50) return '#2E7D32';
    if (percentage >= 20) return '#FFA000';
    return '#C62828';
  };

  const getPriorityColor = (level) => {
    if (level === 'high') return '#C62828';
    if (level === 'medium') return '#FFA000';
    return '#2E7D32';
  };

  if (loading) return (
    <Layout>
      <div style={styles.centered}>Loading dashboard...</div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div style={styles.errorBox}>{error}</div>
    </Layout>
  );

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Energy Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Live monitoring for rural Ghana communities
          </p>
        </div>
        <button onClick={fetchDashboardData} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div style={styles.statsRow}>
          <StatCard
            title="Avg Production"
            value={summary.avg_production}
            unit="kWh"
            icon="☀️"
            color="#2E7D32"
            subtitle="Last 24 hours"
          />
          <StatCard
            title="Avg Consumption"
            value={summary.avg_consumption}
            unit="kWh"
            icon="⚡"
            color="#1565C0"
            subtitle="Last 24 hours"
          />
          <StatCard
            title="Avg Battery"
            value={summary.avg_battery}
            unit="%"
            icon="🔋"
            color={getBatteryColor(summary.avg_battery)}
            subtitle="Storage level"
          />
          <StatCard
            title="Outage Events"
            value={summary.outage_count}
            icon="⚠️"
            color="#C62828"
            subtitle="Last 24 hours"
          />
        </div>
      )}

      {/* Chart */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Energy Production vs Consumption (24h)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Production"
              stroke="#2E7D32"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Consumption"
              stroke="#1565C0"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Facility Outage Status */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Facility Status</h2>
        <div style={styles.facilityGrid}>
          {outages.map((facility) => (
            <div key={facility.facility_id} style={styles.facilityCard}>
              <div style={styles.facilityTop}>
                <p style={styles.facilityName}>{facility.facility_name}</p>
                <span style={{
                  ...styles.priorityBadge,
                  background: `${getPriorityColor(facility.priority_level)}20`,
                  color: getPriorityColor(facility.priority_level),
                }}>
                  {facility.priority_level}
                </span>
              </div>

              {/* Battery bar */}
              <div style={styles.batteryLabel}>
                <span>Battery</span>
                <span style={{
                  color: getBatteryColor(facility.battery_percentage),
                  fontWeight: '600'
                }}>
                  {facility.battery_percentage}%
                </span>
              </div>
              <div style={styles.batteryBarBg}>
                <div style={{
                  ...styles.batteryBarFill,
                  width: `${facility.battery_percentage}%`,
                  background: getBatteryColor(facility.battery_percentage),
                }} />
              </div>

              {/* Outage status */}
              <div style={{
                ...styles.statusBadge,
                background: facility.outage_flag ? '#FFEBEE' : '#E8F5E9',
                color: facility.outage_flag ? '#C62828' : '#2E7D32',
              }}>
                {facility.outage_flag ? '🔴 Outage Detected' : '🟢 Normal'}
              </div>
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
    color: '#757575',
  },
  errorBox: {
    background: '#FFEBEE',
    color: '#C62828',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #C62828',
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
    color: '#212121',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#757575',
  },
  refreshButton: {
    background: '#FFFFFF',
    border: '1.5px solid #E0E0E0',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#424242',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '20px',
  },
  facilityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  facilityCard: {
    background: '#F9F9F9',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #EEEEEE',
  },
  facilityTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '8px',
  },
  facilityName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  priorityBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  batteryLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#757575',
    marginBottom: '6px',
  },
  batteryBarBg: {
    height: '6px',
    background: '#E0E0E0',
    borderRadius: '3px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  statusBadge: {
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center',
  },
};

export default DashboardPage;