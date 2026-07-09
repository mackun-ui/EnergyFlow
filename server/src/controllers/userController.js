const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error('GetAllUsers error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// create a new user (admin only)
const createUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password and role are required.' });
  }

  const validRoles = ['admin', 'energy_provider', 'community_manager', 'resident'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, role, created_at`,
      [username, passwordHash, role]
    );

    const newUser = result.rows[0];

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, 'user', $3)`,
      [req.user.userId, `Admin created account: ${username}`, newUser.user_id]
    );

    return res.status(201).json({
      message: 'User created successfully.',
      user: newUser
    });

  } catch (err) {
    console.error('CreateUser error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// update a user's role (admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['admin', 'energy_provider', 'community_manager', 'resident'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1
       WHERE user_id = $2
       RETURNING user_id, username, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, 'user', $3)`,
      [req.user.userId, `Updated role for user ID ${id} to ${role}`, id]
    );

    return res.status(200).json({
      message: 'User role updated successfully.',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('UpdateUserRole error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// deactivate a user account (admin only)
const deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users SET is_active = false
       WHERE user_id = $1
       RETURNING user_id, username, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, 'user', $3)`,
      [req.user.userId, `Deactivated account for user ID ${id}`, id]
    );

    return res.status(200).json({
      message: 'User account deactivated successfully.',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('DeactivateUser error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllUsers, createUser, updateUserRole, deactivateUser };