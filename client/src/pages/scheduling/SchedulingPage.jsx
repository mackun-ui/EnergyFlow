import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SchedulingPage = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New schedule form state
  const [newSchedule, setNewSchedule] = useState({
    facility_id: '',
    time_slot: '',
  });

  // Edit schedule state
  const [editingSchedule, setEditingSchedule] = useState(null);

  const isAdminOrProvider =
    user?.role === 'admin' || user?.role === 'energy_provider';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, schedulesRes] = await Promise.all([
        api.get('/schedules/facilities'),
        api.get('/schedules'),
      ]);
      setFacilities(facilitiesRes.data.facilities);
      setSchedules(schedulesRes.data.schedules);
    } catch (err) {
      setError('Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUpdatePriority = async (facilityId, newPriority) => {
    try {
      await api.patch(`/schedules/facilities/${facilityId}/priority`, {
        priority_level: newPriority,
      });
      showSuccess('Facility priority updated successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update priority.');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', newSchedule);
      setNewSchedule({ facility_id: '', time_slot: '' });
      showSuccess('Supply schedule created successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create schedule.');
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/schedules/${editingSchedule.schedule_id}`, {
        time_slot: editingSchedule.time_slot,
        is_active: editingSchedule.is_active,
      });
      setEditingSchedule(null);
      showSuccess('Schedule updated successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule.');
    }
  };

  const handleLowEnergyProtocol = async () => {
    if (!window.confirm('This will deactivate all normal and medium priority schedules. Continue?')) return;
    try {
      await api.post('/schedules/low-energy-protocol');
      showSuccess('Low energy protocol applied. Only high priority facilities remain active.');
      fetchData();
    } catch (err) {
      setError('Failed to apply low energy protocol.');
    }
  };

  const getPriorityColor = (level) => {
    if (level === 'high') return '#C62828';
    if (level === 'medium') return '#FFA000';
    return '#2E7D32';
  };

  if (loading) return (
    <Layout>
      <div style={styles.centered}>Loading scheduling data...</div>
    </Layout>
  );

  return (
    <Layout>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Energy Scheduling</h1>
          <p style={styles.pageSubtitle}>
            Manage facility priorities and supply schedules
          </p>
        </div>
        {isAdminOrProvider && (
          <button
            onClick={handleLowEnergyProtocol}
            style={styles.dangerButton}
          >
            ⚠️ Apply Low Energy Protocol
          </button>
        )}
      </div>

      {/* Success and error messages */}
      {success && <div style={styles.successBox}>{success}</div>}
      {error && (
        <div style={styles.errorBox}>
          {error}
          <button onClick={() => setError('')} style={styles.dismissBtn}>✕</button>
        </div>
      )}

      {/* Facilities and Priority */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Facility Priority Levels</h2>
        <p style={styles.cardSubtitle}>
          High priority facilities receive power first during low energy periods.
        </p>
        <div style={styles.table}>
          {/* Table Header */}
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Facility</span>
            <span style={{ flex: 1 }}>Current Priority</span>
            {user?.role === 'admin' && (
              <span style={{ flex: 1 }}>Update Priority</span>
            )}
          </div>
          {/* Table Rows */}
          {facilities.map((facility) => (
            <div key={facility.facility_id} style={styles.tableRow}>
              <span style={{ flex: 2, fontWeight: '500' }}>
                {facility.name}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{
                  ...styles.priorityBadge,
                  background: `${getPriorityColor(facility.priority_level)}20`,
                  color: getPriorityColor(facility.priority_level),
                }}>
                  {facility.priority_level}
                </span>
              </span>
              {user?.role === 'admin' && (
                <span style={{ flex: 1 }}>
                  <select
                    value={facility.priority_level}
                    onChange={(e) =>
                      handleUpdatePriority(facility.facility_id, e.target.value)
                    }
                    style={styles.select}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="normal">Normal</option>
                  </select>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create New Schedule */}
      {isAdminOrProvider && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create Supply Schedule</h2>
          <form onSubmit={handleCreateSchedule} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Facility</label>
                <select
                  value={newSchedule.facility_id}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, facility_id: e.target.value })
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select a facility</option>
                  {facilities.map((f) => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 - 18:00"
                  value={newSchedule.time_slot}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, time_slot: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.submitButton}>
                + Add Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Schedules */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Supply Schedules</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Facility</span>
            <span style={{ flex: 1 }}>Priority</span>
            <span style={{ flex: 1 }}>Time Slot</span>
            <span style={{ flex: 1 }}>Status</span>
            {isAdminOrProvider && (
              <span style={{ flex: 1 }}>Actions</span>
            )}
          </div>
          {schedules.map((schedule) => (
            <div key={schedule.schedule_id} style={styles.tableRow}>
              {editingSchedule?.schedule_id === schedule.schedule_id ? (
                // Edit mode
                <form
                  onSubmit={handleUpdateSchedule}
                  style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}
                >
                  <span style={{ flex: 2, fontWeight: '500' }}>
                    {schedule.facility_name}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{
                      ...styles.priorityBadge,
                      background: `${getPriorityColor(schedule.priority_level)}20`,
                      color: getPriorityColor(schedule.priority_level),
                    }}>
                      {schedule.priority_level}
                    </span>
                  </span>
                  <input
                    type="text"
                    value={editingSchedule.time_slot}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        time_slot: e.target.value,
                      })
                    }
                    style={{ ...styles.input, flex: 1, padding: '6px 10px' }}
                  />
                  <select
                    value={editingSchedule.is_active}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        is_active: e.target.value === 'true',
                      })
                    }
                    style={{ ...styles.select, flex: 1 }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                    <button type="submit" style={styles.saveButton}>Save</button>
                    <button
                      type="button"
                      onClick={() => setEditingSchedule(null)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // View mode
                <>
                  <span style={{ flex: 2, fontWeight: '500' }}>
                    {schedule.facility_name}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{
                      ...styles.priorityBadge,
                      background: `${getPriorityColor(schedule.priority_level)}20`,
                      color: getPriorityColor(schedule.priority_level),
                    }}>
                      {schedule.priority_level}
                    </span>
                  </span>
                  <span style={{ flex: 1, fontSize: '13px' }}>
                    {schedule.time_slot}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{
                      ...styles.statusBadge,
                      background: schedule.is_active ? '#E8F5E9' : '#FFEBEE',
                      color: schedule.is_active ? '#2E7D32' : '#C62828',
                    }}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                  {isAdminOrProvider && (
                    <span style={{ flex: 1 }}>
                      <button
                        onClick={() => setEditingSchedule(schedule)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                    </span>
                  )}
                </>
              )}
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
  dangerButton: {
    background: '#FFEBEE',
    color: '#C62828',
    border: '1.5px solid #C62828',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  successBox: {
    background: '#E8F5E9',
    color: '#2E7D32',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    borderLeft: '4px solid #2E7D32',
  },
  errorBox: {
    background: '#FFEBEE',
    color: '#C62828',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    borderLeft: '4px solid #C62828',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dismissBtn: {
    background: 'none',
    color: '#C62828',
    fontSize: '16px',
    fontWeight: '700',
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
    marginBottom: '4px',
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#9E9E9E',
    marginBottom: '20px',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  tableHeader: {
    display: 'flex',
    padding: '10px 16px',
    background: '#F5F5F5',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #F5F5F5',
    fontSize: '13px',
    color: '#424242',
  },
  priorityBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'uppercase',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  form: {
    marginTop: '8px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: '160px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#424242',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #E0E0E0',
    fontSize: '13px',
    color: '#212121',
    width: '100%',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #E0E0E0',
    fontSize: '13px',
    color: '#212121',
    background: '#FFFFFF',
    width: '100%',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    alignSelf: 'flex-end',
    whiteSpace: 'nowrap',
  },
  editButton: {
    background: '#E3F2FD',
    color: '#1565C0',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #1565C0',
  },
  saveButton: {
    background: '#E8F5E9',
    color: '#2E7D32',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #2E7D32',
  },
  cancelButton: {
    background: '#F5F5F5',
    color: '#757575',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #E0E0E0',
  },
};

export default SchedulingPage;