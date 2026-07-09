const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

// register a new user (admin only in production, open for seeding/testing)
const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password and role are required.' });
  }

  const validRoles = ['admin', 'energy_provider', 'community_manager', 'resident'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    // check if username already exists
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

    const user = result.rows[0];
    const token = generateToken(user);

    // log the action
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, 'user', $3)`,
      [user.user_id, `Registered new account: ${username}`, user.user_id]
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role,
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = generateToken(user);

    // log the action
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, 'user', $3)`,
      [user.user_id, `User logged in: ${username}`, user.user_id]
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// get current logged in user
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, role, created_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: result.rows[0] });

  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };