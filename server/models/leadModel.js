const { pool } = require('../config/database');

function calculateLeadScore(lead) {
  let score = 0;
  if (lead.source === 'Website') score += 20;

  if (lead.email && lead.email.includes('@')) {
    const domain = lead.email.split('@')[1].toLowerCase();
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com'];
    if (!freeDomains.includes(domain)) score += 30;
  }

  const budget = Number(lead.budget || 0);
  if (budget >= 50000) score += 50;
  else if (budget >= 25000) score += 30;
  else if (budget > 0) score += 10;

  if (lead.source === 'Referral' || lead.source === 'LinkedIn') score += 15;

  const statusScores = {
    Qualified: 20,
    Contacted: 10,
    New: 5,
    Lost: -10,
    Converted: 0
  };
  score += statusScores[lead.status] || 0;

  return Math.min(100, Math.max(0, score));
}

function mapLeadRow(row) {
  return {
    id: String(row.id),
    name: row.lead_name,
    company: row.company_name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    status: row.status,
    score: row.lead_score,
    value: Number(row.budget || 0),
    notes: row.notes || '',
    pipeline: row.pipeline_stage || 'New Lead',
    salesperson: row.salesperson || 'Unassigned',
    dateAdded: new Date(row.created_at).toISOString().split('T')[0]
  };
}

async function getAllLeads() {
  const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
  return rows.map(mapLeadRow);
}

async function getLeadById(id) {
  const [rows] = await pool.query('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapLeadRow(rows[0]) : null;
}

async function createLead(payload) {
  const leadScore = calculateLeadScore({
    email: payload.email,
    source: payload.source,
    status: payload.status,
    budget: payload.value
  });

  const [result] = await pool.query(
    `INSERT INTO leads
      (lead_name, company_name, email, phone, source, status, lead_score, budget, notes, pipeline_stage, salesperson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.company,
      payload.email,
      payload.phone,
      payload.source || 'Website',
      payload.status || 'New',
      leadScore,
      Number(payload.value || 0),
      payload.notes || '',
      payload.pipeline || 'New Lead',
      payload.salesperson || 'Unassigned'
    ]
  );

  return getLeadById(result.insertId);
}

async function updateLead(id, payload) {
  const existing = await getLeadById(id);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...payload,
    value: payload.value !== undefined ? Number(payload.value) : Number(existing.value)
  };

  const leadScore = calculateLeadScore({
    email: merged.email,
    source: merged.source,
    status: merged.status,
    budget: merged.value
  });

  await pool.query(
    `UPDATE leads SET
      lead_name = ?, company_name = ?, email = ?, phone = ?,
      source = ?, status = ?, lead_score = ?, budget = ?, notes = ?, pipeline_stage = ?, salesperson = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.company,
      merged.email,
      merged.phone,
      merged.source,
      merged.status,
      leadScore,
      Number(merged.value || 0),
      merged.notes || '',
      merged.pipeline || 'New Lead',
      merged.salesperson || 'Unassigned',
      id
    ]
  );

  return getLeadById(id);
}

async function deleteLead(id) {
  const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  calculateLeadScore,
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};
