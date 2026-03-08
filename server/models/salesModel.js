const { pool } = require('../config/database');

async function getAllSales() {
  const [rows] = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
  return rows;
}

module.exports = {
  getAllSales
};
