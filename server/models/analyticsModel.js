const { pool } = require('../config/database');

async function getLeadsPerMonth() {
  const [rows] = await pool.query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_key, COUNT(*) AS total
    FROM leads
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY month_key
    ORDER BY month_key ASC
  `);

  const data = {};
  rows.forEach((row) => {
    data[row.month_key] = Number(row.total);
  });
  return data;
}

async function getConversionRateBySource() {
  const [rows] = await pool.query(`
    SELECT source,
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) AS converted
    FROM leads
    GROUP BY source
  `);

  const data = {};
  rows.forEach((row) => {
    const total = Number(row.total || 0);
    const converted = Number(row.converted || 0);
    data[row.source || 'Unknown'] = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';
  });
  return data;
}

async function getRevenueByMonth() {
  const [rows] = await pool.query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_key,
           SUM(revenue_amount) AS total_revenue
    FROM sales
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY month_key
    ORDER BY month_key ASC
  `);

  const data = {};
  rows.forEach((row) => {
    data[row.month_key] = Number(row.total_revenue || 0);
  });
  return data;
}

module.exports = {
  getLeadsPerMonth,
  getConversionRateBySource,
  getRevenueByMonth
};
