const pool = require('../config/db');

// get all facilities with their priority levels
const getFacilities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        facility_id,
        name,
        priority_level,
        created_at
      FROM facilities
      ORDER BY
        CASE priority_level
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'normal' THEN 3
        END
    `);

    return res.status(200).json({ facilities: result.rows });
  } catch (err) {
    console.error('GetFacilities error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// update a facility priority level (admin only)
const updateFacilityPriority = async (req, res) => {
  const { facilityId } = req.params;
  const { priority_level } = req.body;

  const validPriorities = ['high', 'medium', 'normal'];
  if (!validPriorities.includes(priority_level)) {
    return res.status(400).json({ message: 'Invalid priority level. Must be high, medium, or normal.' });
  }

  try {
    const result = await pool.query(`
      UPDATE facilities
      SET priority_level = $1
      WHERE facility_id = $2
      RETURNING facility_id, name, priority_level
    `, [priority_level, facilityId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found.' });
    }

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, 'facility', $3)
    `, [req.user.userId, `Updated priority for ${result.rows[0].name} to ${priority_level}`, facilityId]);

    return res.status(200).json({
      message: 'Facility priority updated successfully.',
      facility: result.rows[0]
    });
  } catch (err) {
    console.error('UpdateFacilityPriority error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// get all supply schedules
const getSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ss.schedule_id,
        ss.facility_id,
        f.name AS facility_name,
        f.priority_level,
        ss.time_slot,
        ss.is_active,
        ss.created_at,
        ss.updated_at
      FROM supply_schedules ss
      JOIN facilities f ON ss.facility_id = f.facility_id
      ORDER BY
        CASE f.priority_level
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'normal' THEN 3
        END
    `);

    return res.status(200).json({ schedules: result.rows });
  } catch (err) {
    console.error('GetSchedules error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// create a new supply schedule (energy provider and admin only)
const createSchedule = async (req, res) => {
  const { facility_id, time_slot } = req.body;

  if (!facility_id || !time_slot) {
    return res.status(400).json({ message: 'Facility ID and time slot are required.' });
  }

  try {
    // check facility exists
    const facility = await pool.query(
      'SELECT facility_id, name FROM facilities WHERE facility_id = $1',
      [facility_id]
    );

    if (facility.rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found.' });
    }

    const result = await pool.query(`
      INSERT INTO supply_schedules (facility_id, time_slot, is_active, created_by)
      VALUES ($1, $2, true, $3)
      RETURNING schedule_id, facility_id, time_slot, is_active, created_at
    `, [facility_id, time_slot, req.user.userId]);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, 'supply_schedule', $3)
    `, [req.user.userId, `Created schedule for ${facility.rows[0].name}: ${time_slot}`, result.rows[0].schedule_id]);

    return res.status(201).json({
      message: 'Supply schedule created successfully.',
      schedule: result.rows[0]
    });
  } catch (err) {
    console.error('CreateSchedule error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// update an existing supply schedule (energy provider and admin only)
const updateSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  const { time_slot, is_active } = req.body;

  try {
    const result = await pool.query(`
      UPDATE supply_schedules
      SET
        time_slot = COALESCE($1, time_slot),
        is_active = COALESCE($2, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE schedule_id = $3
      RETURNING schedule_id, facility_id, time_slot, is_active, updated_at
    `, [time_slot, is_active, scheduleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, 'supply_schedule', $3)
    `, [req.user.userId, `Updated schedule ID ${scheduleId}`, scheduleId]);

    return res.status(200).json({
      message: 'Supply schedule updated successfully.',
      schedule: result.rows[0]
    });
  } catch (err) {
    console.error('UpdateSchedule error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// apply low energy protocol
// deactivates all normal and medium priority schedules
const applyLowEnergyProtocol = async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE supply_schedules ss
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      FROM facilities f
      WHERE ss.facility_id = f.facility_id
        AND f.priority_level IN ('normal', 'medium')
      RETURNING ss.schedule_id, f.name AS facility_name, f.priority_level
    `);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, 'system', null)
    `, [req.user.userId, 'Low energy protocol activated — normal and medium priority schedules suspended']);

    return res.status(200).json({
      message: 'Low energy protocol applied. Only high priority facilities remain active.',
      affected_schedules: result.rows
    });
  } catch (err) {
    console.error('ApplyLowEnergyProtocol error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getFacilities,
  updateFacilityPriority,
  getSchedules,
  createSchedule,
  updateSchedule,
  applyLowEnergyProtocol
};