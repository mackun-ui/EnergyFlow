const pool = require('../config/db');

// get latest energy metrics for all facilities
const getLatestMetrics = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT ON (em.facility_id)
                em.metric_id,
                em.facility_id,
                f.name AS facility_name,
                f.priority_level,
                em.production_value,
                em.consumption_value,
                em.outage_flag,
                em.recorded_at
            FROM energy_metrics em
            JOIN facilities f ON em.facility_id = f.facility_id
            ORDER BY em.facility_id, em.recorded_at DESC
        `);

        return res.status(200).json({ metrics: result.rows });
    } catch (err) {
        console.error('GetLatestMetrics error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// get historical metrics for a specific facility
const getHistoricalMetrics = async (req, res) => {
  const { facilityId } = req.params;
  const { period } = req.query;

  let interval;
  if (period === 'weekly') interval = '7 days';
  else if (period === 'monthly') interval = '30 days';
  else interval = '24 hours';

  try {
    const result = await pool.query(`
      SELECT
        em.metric_id,
        em.facility_id,
        f.name AS facility_name,
        em.production_value,
        em.consumption_value,
        em.battery_percentage,
        em.outage_flag,
        em.recorded_at
      FROM energy_metrics em
      JOIN facilities f ON em.facility_id = f.facility_id
      WHERE em.facility_id = $1
        AND em.recorded_at >= NOW() - INTERVAL '${interval}'
      ORDER BY em.recorded_at ASC
    `, [facilityId]);

    return res.status(200).json({ metrics: result.rows });
  } catch (err) {
    console.error('GetHistoricalMetrics error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// get community wide energy summary
const getCommunitySummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ROUND(AVG(em.production_value)::numeric, 2) AS avg_production,
        ROUND(AVG(em.consumption_value)::numeric, 2) AS avg_consumption,
        ROUND(AVG(em.battery_percentage)::numeric, 2) AS avg_battery,
        COUNT(CASE WHEN em.outage_flag = true THEN 1 END) AS outage_count,
        COUNT(DISTINCT em.facility_id) AS total_facilities
      FROM energy_metrics em
      WHERE em.recorded_at >= NOW() - INTERVAL '24 hours'
    `);

    return res.status(200).json({ summary: result.rows[0] });
  } catch (err) {
    console.error('GetCommunitySummary error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// get outage status for all facilities
const getOutageStatus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (em.facility_id)
        f.facility_id,
        f.name AS facility_name,
        f.priority_level,
        em.outage_flag,
        em.battery_percentage,
        em.recorded_at
      FROM energy_metrics em
      JOIN facilities f ON em.facility_id = f.facility_id
      ORDER BY em.facility_id, em.recorded_at DESC
    `);

    return res.status(200).json({ facilities: result.rows });
  } catch (err) {
    console.error('GetOutageStatus error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getLatestMetrics,
  getHistoricalMetrics,
  getCommunitySummary,
  getOutageStatus
};