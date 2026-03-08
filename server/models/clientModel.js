const { pool } = require('../config/database');

function mapClientRow(row) {
  return {
    id: String(row.id),
    name: row.client_name,
    company: row.company_name,
    email: row.email,
    phone: row.phone,
    dealValue: Number(row.project_value || 0),
    status: row.status,
    assignedTo: row.assigned_manager || 'Unassigned',
    notes: row.notes || '',
    dateConverted: new Date(row.created_at).toISOString().split('T')[0]
  };
}

async function getAllClients() {
  const [rows] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
  return rows.map(mapClientRow);
}

async function getClientById(id) {
  const [rows] = await pool.query('SELECT * FROM clients WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapClientRow(rows[0]) : null;
}

async function createClient(payload) {
  const [result] = await pool.query(
    `INSERT INTO clients
      (client_name, company_name, email, phone, project_value, status, assigned_manager, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.company,
      payload.email,
      payload.phone,
      Number(payload.dealValue || 0),
      payload.status || 'Active',
      payload.assignedTo || 'Unassigned',
      payload.notes || ''
    ]
  );

  await pool.query(
    'INSERT INTO sales (client_id, revenue_amount, deal_status) VALUES (?, ?, ?)',
    [result.insertId, Number(payload.dealValue || 0), 'Closed Won']
  );

  return getClientById(result.insertId);
}

async function updateClient(id, payload) {
  const existing = await getClientById(id);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...payload,
    dealValue: payload.dealValue !== undefined ? Number(payload.dealValue) : Number(existing.dealValue)
  };

  await pool.query(
    `UPDATE clients SET
      client_name = ?, company_name = ?, email = ?, phone = ?,
      project_value = ?, status = ?, assigned_manager = ?, notes = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.company,
      merged.email,
      merged.phone,
      Number(merged.dealValue || 0),
      merged.status || 'Active',
      merged.assignedTo || 'Unassigned',
      merged.notes || '',
      id
    ]
  );

  await pool.query(
    `UPDATE sales
       SET revenue_amount = ?, deal_status = ?
     WHERE client_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [Number(merged.dealValue || 0), merged.status === 'Active' ? 'Closed Won' : merged.status, id]
  );

  return getClientById(id);
}

async function deleteClient(id) {
  const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
