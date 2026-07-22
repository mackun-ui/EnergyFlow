import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FileText, PieChart, Shield, Calendar } from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const [dailyReport, setDailyReport] = useState(null);
  const [allocationSummary, setAllocationSummary] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allocationRes, auditRes] = await Promise.all([
        api.get(`/reports/allocation?period=${period}`),
        user?.role === 'admin' ? api.get('/reports/audit-logs') : Promise.resolve({ data: { logs: [] } }),
      ]);
      setAllocationSummary(allocationRes.data.summary);
      setAuditLogs(auditRes.data.logs);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    try {
      const res = await api.get(`/reports/daily?date=${selectedDate}`);
      setDailyReport(res.data);
    } catch (err) {
      console.error('Failed to load daily report:', err);
    }
  };

  const getPriorityColor = (level) => {
    if (level === 'high') return '#EF4444';
    if (level === 'medium') return '#F59E0B';
    return '#00C853';
  };

  const tabs = [
    { id: 'daily', label: 'Daily Report', icon: <FileText size={15} /> },
    { id: 'allocation', label: 'Allocation Summary', icon: <PieChart size={15} /> },
    ...(user?.role === 'admin'
      ? [{ id: 'audit', label: 'Audit Logs', icon: <Shield size={15} /> }]
      : []),
  ];

  if (loading) return (
    <Layout>
      <div style={styles.centered}>Loading reports...</div>
    </Layout>
  );

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Reports & Analytics</h1>
          <p style={styles.pageSubtitle}>
            Energy usage reports and distribution summaries
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id
              ? { ...styles.tab, ...styles.tabActive }
              : styles.tab
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daily Report Tab */}
      {activeTab === 'daily' && (
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Generate Daily Report</h2>
            <div style={styles.filterRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Date</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={15} color="#4B5563" style={styles.inputIcon} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
              <button onClick={fetchDailyReport} style={styles.primaryButton}>
                Generate Report
              </button>
            </div>
          </div>

          {dailyReport && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                Daily Usage Report — {dailyReport.report_date}
              </h2>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyReport.facilities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="facility_name"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: '#F1F5F9',
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#94A3B8' }} />
                  <Bar dataKey="avg_production" name="Avg Production" fill="#00C853" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_consumption" name="Avg Consumption" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Table */}
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <span style={{ flex: 2 }}>Facility</span>
                  <span style={{ flex: 1 }}>Priority</span>
                  <span style={{ flex: 1 }}>Avg Production</span>
                  <span style={{ flex: 1 }}>Avg Consumption</span>
                  <span style={{ flex: 1 }}>Avg Battery</span>
                  <span style={{ flex: 1 }}>Outages</span>
                </div>
                {dailyReport.facilities.map((f) => (
                  <div key={f.facility_id} style={styles.tableRow}>
                    <span style={{ flex: 2, color: '#F1F5F9', fontWeight: '500' }}>
                      {f.facility_name}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{
                        ...styles.priorityBadge,
                        background: `${getPriorityColor(f.priority_level)}18`,
                        color: getPriorityColor(f.priority_level),
                      }}>
                        {f.priority_level}
                      </span>
                    </span>
                    <span style={{ flex: 1, color: '#00C853' }}>
                      {f.avg_production} kWh
                    </span>
                    <span style={{ flex: 1, color: '#3B82F6' }}>
                      {f.avg_consumption} kWh
                    </span>
                    <span style={{ flex: 1, color: '#94A3B8' }}>
                      {f.avg_battery}%
                    </span>
                    <span style={{ flex: 1, color: f.outage_count > 0 ? '#EF4444' : '#94A3B8' }}>
                      {f.outage_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Allocation Summary Tab */}
      {activeTab === 'allocation' && (
        <div style={styles.card}>
          <div style={styles.cardHeaderRow}>
            <h2 style={styles.cardTitle}>Allocation Summary</h2>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                fetchAllData();
              }}
              style={styles.periodSelect}
            >
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={allocationSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="priority_level" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#F1F5F9',
                }}
              />
              <Legend wrapperStyle={{ color: '#94A3B8' }} />
              <Bar dataKey="avg_production" name="Avg Production" fill="#00C853" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_consumption" name="Avg Consumption" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_outages" name="Total Outages" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={{ flex: 1 }}>Priority Level</span>
              <span style={{ flex: 1 }}>Facilities</span>
              <span style={{ flex: 1 }}>Avg Production</span>
              <span style={{ flex: 1 }}>Avg Consumption</span>
              <span style={{ flex: 1 }}>Avg Battery</span>
              <span style={{ flex: 1 }}>Total Outages</span>
            </div>
            {allocationSummary.map((row, i) => (
              <div key={i} style={styles.tableRow}>
                <span style={{ flex: 1 }}>
                  <span style={{
                    ...styles.priorityBadge,
                    background: `${getPriorityColor(row.priority_level)}18`,
                    color: getPriorityColor(row.priority_level),
                  }}>
                    {row.priority_level}
                  </span>
                </span>
                <span style={{ flex: 1, color: '#94A3B8' }}>{row.facility_count}</span>
                <span style={{ flex: 1, color: '#00C853' }}>{row.avg_production} kWh</span>
                <span style={{ flex: 1, color: '#3B82F6' }}>{row.avg_consumption} kWh</span>
                <span style={{ flex: 1, color: '#94A3B8' }}>{row.avg_battery}%</span>
                <span style={{ flex: 1, color: row.total_outages > 0 ? '#EF4444' : '#94A3B8' }}>
                  {row.total_outages}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab (admin only) */}
      {activeTab === 'audit' && user?.role === 'admin' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Audit Logs</h2>
          <p style={styles.cardSubtitle}>
            Last 100 system actions with timestamps
          </p>
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={{ flex: 1 }}>User</span>
              <span style={{ flex: 3 }}>Action</span>
              <span style={{ flex: 1 }}>Entity</span>
              <span style={{ flex: 2 }}>Timestamp</span>
            </div>
            {auditLogs.map((log) => (
              <div key={log.log_id} style={styles.tableRow}>
                <span style={{ flex: 1, color: '#00C853', fontWeight: '500' }}>
                  {log.username}
                </span>
                <span style={{ flex: 3, color: '#94A3B8' }}>
                  {log.action}
                </span>
                <span style={{ flex: 1, color: '#4B5563' }}>
                  {log.entity_type}
                </span>
                <span style={{ flex: 2, color: '#4B5563', fontSize: '12px' }}>
                  {new Date(log.logged_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '0px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    color: '#94A3B8',
    fontSize: '13px',
    fontWeight: '500',
    borderRadius: '8px 8px 0 0',
    border: '1px solid transparent',
    borderBottom: 'none',
    marginBottom: '-1px',
  },
  tabActive: {
    background: '#111827',
    color: '#00C853',
    border: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid #111827',
  },
  card: {
    background: '#111827',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: '20px',
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#4B5563',
    marginBottom: '20px',
    marginTop: '-16px',
  },
  filterRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '200px',
  },
  label: {
    fontSize: '11px',
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
    padding: '10px 14px 10px 40px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0A0F1E',
    fontSize: '13px',
    color: '#F1F5F9',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00C853, #00952e)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(0,200,83,0.25)',
    alignSelf: 'flex-end',
  },
  periodSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0A0F1E',
    fontSize: '13px',
    color: '#F1F5F9',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '20px',
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
  },
  priorityBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'uppercase',
  },
};

export default ReportsPage;