const { pool } = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function createUser({ name, email, password, role = 'sales' }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.insertId]);
  return rows[0];
}

module.exports = {
  findByEmail,
  createUser
};
