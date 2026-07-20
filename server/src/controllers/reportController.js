const pool = require('../config/db');

// generate daily usage report for a specific date
const getDailyReport = async (req, res) => {
  const { date } = req.query;

  const reportDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999)).toISOString();

  try {
    const result = await pool.query(`
      SELECT
        f.facility_id,
        f.name AS facility_name,
        f.priority_level,
        ROUND(AVG(em.production_value)::numeric, 2) AS avg_production,
        ROUND(AVG(em.consumption_value)::numeric, 2) AS avg_consumption,
        ROUND(AVG(em.battery_percentage)::numeric, 2) AS avg_battery,
        COUNT(CASE WHEN em.outage_flag = true THEN 1 END) AS outage_count,
        COUNT(em.metric_id) AS total_readings
      FROM energy_metrics em
      JOIN facilities f ON em.facility_id = f.facility_id
      WHERE em.recorded_at BETWEEN $1 AND $2
      GROUP BY f.facility_id, f.name, f.priority_level
      ORDER BY
        CASE f.priority_level
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'normal' THEN 3
        END
    `, [startOfDay, endOfDay]);

    return res.status(200).json({
      report_date: date || new Date().toISOString().split('T')[0],
      facilities: result.rows
    });
  } catch (err) {
    console.error('GetDailyReport error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// generate allocation summary for a given period
const getAllocationSummary = async (req, res) => {
  const { period } = req.query;

  let interval;
  if (period === 'weekly') interval = '7 days';
  else if (period === 'monthly') interval = '30 days';
  else interval = '24 hours';

  try {
    const result = await pool.query(`
      SELECT
        f.priority_level,
        COUNT(DISTINCT f.facility_id) AS facility_count,
        ROUND(AVG(em.production_value)::numeric, 2) AS avg_production,
        ROUND(AVG(em.consumption_value)::numeric, 2) AS avg_consumption,
        ROUND(AVG(em.battery_percentage)::numeric, 2) AS avg_battery,
        COUNT(CASE WHEN em.outage_flag = true THEN 1 END) AS total_outages
      FROM energy_metrics em
      JOIN facilities f ON em.facility_id = f.facility_id
      WHERE em.recorded_at >= NOW() - INTERVAL '${interval}'
      GROUP BY f.priority_level
      ORDER BY
        CASE f.priority_level
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'normal' THEN 3
        END
    `);

    return res.status(200).json({
      period: period || 'daily',
      summary: result.rows
    });
  } catch (err) {
    console.error('GetAllocationSummary error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// get audit logs (admin only)
const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        al.log_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.logged_at,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.logged_at DESC
      LIMIT 100
    `);

    return res.status(200).json({ logs: result.rows });
  } catch (err) {
    console.error('GetAuditLogs error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getDailyReport,
  getAllocationSummary,
  getAuditLogs
};