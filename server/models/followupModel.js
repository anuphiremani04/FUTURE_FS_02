const { pool } = require('../config/database');

function mapFollowupRow(row) {
  const derivedRelatedTo = row.related_to || (row.lead_id ? `Lead #${row.lead_id}` : 'General');
  return {
    id: String(row.id),
    title: row.title || 'Follow-up',
    relatedTo: derivedRelatedTo,
    dueDate: row.followup_date,
    description: row.notes || '',
    status: row.status,
    completed: !!row.completed
  };
}

async function getAllFollowups() {
  const [rows] = await pool.query('SELECT * FROM followups ORDER BY followup_date ASC');
  return rows.map(mapFollowupRow);
}

async function getFollowupById(id) {
  const [rows] = await pool.query('SELECT * FROM followups WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapFollowupRow(rows[0]) : null;
}

async function createFollowup(payload) {
  const status = payload.status || (payload.completed ? 'Completed' : 'Pending');
  const completed = payload.completed ? 1 : 0;

  const [result] = await pool.query(
    `INSERT INTO followups
      (lead_id, followup_date, notes, status, title, related_to, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.leadId || null,
      payload.dueDate,
      payload.description || payload.notes || '',
      status,
      payload.title || 'Follow-up',
      payload.relatedTo || '',
      completed
    ]
  );

  return getFollowupById(result.insertId);
}

async function updateFollowup(id, payload) {
  const current = await getFollowupById(id);
  if (!current) return null;

  const merged = {
    ...current,
    ...payload
  };

  const status = merged.status || (merged.completed ? 'Completed' : 'Pending');
  const completed = merged.completed ? 1 : 0;

  await pool.query(
    `UPDATE followups SET
      lead_id = ?,
      followup_date = ?,
      notes = ?,
      status = ?,
      title = ?,
      related_to = ?,
      completed = ?
     WHERE id = ?`,
    [
      merged.leadId || null,
      merged.dueDate,
      merged.description || merged.notes || '',
      status,
      merged.title || 'Follow-up',
      merged.relatedTo || '',
      completed,
      id
    ]
  );

  return getFollowupById(id);
}

async function deleteFollowup(id) {
  const [result] = await pool.query('DELETE FROM followups WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllFollowups,
  getFollowupById,
  createFollowup,
  updateFollowup,
  deleteFollowup
};
