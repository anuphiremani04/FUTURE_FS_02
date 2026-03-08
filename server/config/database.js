const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password:
    process.env.DB_PASSWORD && process.env.DB_PASSWORD !== 'your_mysql_password'
      ? process.env.DB_PASSWORD
      : '',
  database: process.env.DB_NAME || 'mini_crm'
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await connection.end();
}

async function ensureColumn(tableName, columnName, definitionSql) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbConfig.database, tableName, columnName]
  );

  if (Number(rows[0].total) === 0) {
    await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definitionSql}`);
  }
}

async function seedLeadIfMissing(lead) {
  const [rows] = await pool.query('SELECT id FROM leads WHERE email = ? LIMIT 1', [lead.email]);
  if (rows.length > 0) return;

  await pool.query(
    `INSERT INTO leads
      (lead_name, company_name, email, phone, source, status, lead_score, budget, notes, pipeline_stage, salesperson, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
    [
      lead.lead_name,
      lead.company_name,
      lead.email,
      lead.phone,
      lead.source,
      lead.status,
      lead.lead_score,
      lead.budget,
      lead.notes,
      lead.pipeline_stage,
      lead.salesperson,
      lead.daysAgo
    ]
  );
}

async function seedClientIfMissing(client) {
  const [rows] = await pool.query('SELECT id FROM clients WHERE email = ? LIMIT 1', [client.email]);
  if (rows.length > 0) return;

  const [result] = await pool.query(
    `INSERT INTO clients
      (client_name, company_name, email, phone, project_value, status, assigned_manager, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
    [
      client.client_name,
      client.company_name,
      client.email,
      client.phone,
      client.project_value,
      client.status,
      client.assigned_manager,
      client.notes,
      client.daysAgo
    ]
  );

  await pool.query(
    'INSERT INTO sales (client_id, revenue_amount, deal_status, created_at) VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))',
    [result.insertId, Number(client.project_value || 0), client.status === 'Active' ? 'Closed Won' : client.status, client.daysAgo]
  );
}

async function seedFollowupIfMissing(followup) {
  const [rows] = await pool.query(
    'SELECT id FROM followups WHERE title = ? AND related_to = ? AND followup_date = DATE_ADD(CURDATE(), INTERVAL ? DAY) LIMIT 1',
    [followup.title, followup.related_to, followup.dueInDays]
  );
  if (rows.length > 0) return;

  await pool.query(
    `INSERT INTO followups
      (lead_id, followup_date, notes, status, title, related_to, completed, created_at)
     VALUES (?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
    [
      followup.lead_id || null,
      followup.dueInDays,
      followup.notes,
      followup.status,
      followup.title,
      followup.related_to,
      followup.completed ? 1 : 0,
      followup.createdDaysAgo
    ]
  );
}

async function initializeDatabase() {
  await ensureDatabaseExists();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'sales',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_name VARCHAR(150) NOT NULL,
      company_name VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      phone VARCHAR(40),
      source VARCHAR(80) DEFAULT 'Website',
      status VARCHAR(80) DEFAULT 'New',
      lead_score INT DEFAULT 0,
      budget DECIMAL(12,2) DEFAULT 0,
      notes TEXT,
      pipeline_stage VARCHAR(80) DEFAULT 'New Lead',
      salesperson VARCHAR(120) DEFAULT 'Unassigned',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(150) NOT NULL,
      company_name VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      phone VARCHAR(40),
      project_value DECIMAL(12,2) DEFAULT 0,
      status VARCHAR(80) DEFAULT 'Active',
      assigned_manager VARCHAR(120),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS followups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id INT NULL,
      followup_date DATE NOT NULL,
      notes TEXT,
      status VARCHAR(80) DEFAULT 'Pending',
      title VARCHAR(180),
      related_to VARCHAR(180),
      completed TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      revenue_amount DECIMAL(12,2) DEFAULT 0,
      deal_status VARCHAR(80) DEFAULT 'Closed Won',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  await ensureColumn('users', 'name', "VARCHAR(120) NOT NULL DEFAULT 'User'");
  await ensureColumn('users', 'email', "VARCHAR(180) NOT NULL DEFAULT ''");
  await ensureColumn('users', 'password', "VARCHAR(255) NOT NULL DEFAULT ''");
  await ensureColumn('users', 'role', "VARCHAR(50) NOT NULL DEFAULT 'sales'");
  await ensureColumn('users', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('leads', 'lead_name', "VARCHAR(150) NOT NULL DEFAULT 'Lead'");
  await ensureColumn('leads', 'company_name', "VARCHAR(180) NOT NULL DEFAULT 'Company'");
  await ensureColumn('leads', 'email', "VARCHAR(180) NOT NULL DEFAULT ''");
  await ensureColumn('leads', 'phone', 'VARCHAR(40)');
  await ensureColumn('leads', 'source', "VARCHAR(80) DEFAULT 'Website'");
  await ensureColumn('leads', 'status', "VARCHAR(80) DEFAULT 'New'");
  await ensureColumn('leads', 'lead_score', 'INT DEFAULT 0');
  await ensureColumn('leads', 'budget', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('leads', 'notes', 'TEXT');
  await ensureColumn('leads', 'pipeline_stage', "VARCHAR(80) DEFAULT 'New Lead'");
  await ensureColumn('leads', 'salesperson', "VARCHAR(120) DEFAULT 'Unassigned'");
  await ensureColumn('leads', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('clients', 'client_name', "VARCHAR(150) NOT NULL DEFAULT 'Client'");
  await ensureColumn('clients', 'company_name', "VARCHAR(180) NOT NULL DEFAULT 'Company'");
  await ensureColumn('clients', 'email', "VARCHAR(180) NOT NULL DEFAULT ''");
  await ensureColumn('clients', 'phone', 'VARCHAR(40)');
  await ensureColumn('clients', 'project_value', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('clients', 'status', "VARCHAR(80) DEFAULT 'Active'");
  await ensureColumn('clients', 'assigned_manager', 'VARCHAR(120)');
  await ensureColumn('clients', 'notes', 'TEXT');
  await ensureColumn('clients', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('followups', 'lead_id', 'INT NULL');
  await ensureColumn('followups', 'followup_date', 'DATE');
  await ensureColumn('followups', 'notes', 'TEXT');
  await ensureColumn('followups', 'status', "VARCHAR(80) DEFAULT 'Pending'");
  await ensureColumn('followups', 'title', 'VARCHAR(180)');
  await ensureColumn('followups', 'related_to', 'VARCHAR(180)');
  await ensureColumn('followups', 'completed', 'TINYINT(1) DEFAULT 0');
  await ensureColumn('followups', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn('sales', 'client_id', 'INT NOT NULL DEFAULT 1');
  await ensureColumn('sales', 'revenue_amount', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('sales', 'deal_status', "VARCHAR(80) DEFAULT 'Closed Won'");
  await ensureColumn('sales', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  // Migrate legacy enum columns from early schema versions to flexible varchar columns.
  await pool.query("ALTER TABLE leads MODIFY COLUMN source VARCHAR(80) DEFAULT 'Website'");
  await pool.query("ALTER TABLE leads MODIFY COLUMN status VARCHAR(80) DEFAULT 'New'");

  // Normalize legacy/imported data so dashboard status-driven metrics stay accurate.
  await pool.query(`
    UPDATE leads
       SET status = CASE
         WHEN status IS NULL OR TRIM(status) = '' THEN 'New'
         WHEN LOWER(TRIM(status)) = 'new' THEN 'New'
         WHEN LOWER(TRIM(status)) = 'contacted' THEN 'Contacted'
         WHEN LOWER(TRIM(status)) = 'qualified' THEN 'Qualified'
         WHEN LOWER(TRIM(status)) = 'lost' THEN 'Lost'
         WHEN LOWER(TRIM(status)) = 'converted' THEN 'Converted'
         ELSE status
       END
  `);

  await pool.query(`
    UPDATE leads
       SET source = CASE
         WHEN source IS NULL OR TRIM(source) = '' THEN 'Website'
         WHEN LOWER(TRIM(source)) = 'linkedin' THEN 'LinkedIn'
         WHEN LOWER(TRIM(source)) = 'referral' THEN 'Referral'
         WHEN LOWER(TRIM(source)) = 'website' THEN 'Website'
         WHEN LOWER(TRIM(source)) = 'email campaign' THEN 'Email Campaign'
         WHEN LOWER(TRIM(source)) = 'trade show' THEN 'Trade Show'
         WHEN LOWER(TRIM(source)) = 'cold call' THEN 'Cold Call'
         ELSE source
       END
  `);

  const [leadRows] = await pool.query('SELECT COUNT(*) AS total FROM leads');
  if (leadRows[0].total === 0) {
    await pool.query(
      `INSERT INTO leads
        (lead_name, company_name, email, phone, source, status, lead_score, budget, notes, pipeline_stage, salesperson, created_at)
       VALUES
        ('Acme Corporation', 'Acme Inc.', 'contact@acme.com', '+1-555-0101', 'LinkedIn', 'New', 80, 50000, 'Enterprise interest in full suite', 'New Lead', 'John Smith', DATE_SUB(NOW(), INTERVAL 120 DAY)),
        ('TechFlow Solutions', 'TechFlow Ltd.', 'info@techflow.com', '+1-555-0102', 'Referral', 'Contacted', 75, 35000, 'Initial discovery call done', 'Contacted', 'Sarah Johnson', DATE_SUB(NOW(), INTERVAL 95 DAY)),
        ('Northwind Healthcare', 'Northwind Health Systems', 'procurement@northwindhealth.com', '+1-555-0108', 'Referral', 'Qualified', 100, 90000, 'Compliance checklist complete', 'Proposal Sent', 'Sarah Johnson', DATE_SUB(NOW(), INTERVAL 45 DAY)),
        ('Harbor Manufacturing', 'Harbor MFG Co.', 'it@harbormfg.com', '+1-555-0111', 'Trade Show', 'Qualified', 90, 67000, 'Negotiation in progress', 'Negotiation', 'John Smith', DATE_SUB(NOW(), INTERVAL 12 DAY)),
        ('Atlas Media Partners', 'Atlas Media', 'growth@atlasmediapartners.com', '+1-555-0112', 'Cold Call', 'Converted', 80, 52000, 'Converted after trial', 'Won', 'Mike Davis', DATE_SUB(NOW(), INTERVAL 8 DAY))`
    );
  }

  const [clientRows] = await pool.query('SELECT COUNT(*) AS total FROM clients');
  if (clientRows[0].total === 0) {
    await pool.query(
      `INSERT INTO clients
        (client_name, company_name, email, phone, project_value, status, assigned_manager, notes, created_at)
       VALUES
        ('Enterprise Plus', 'Enterprise Plus Group', 'partnerships@enterprise-plus.com', '+1-555-0106', 120000, 'Active', 'Mike Davis', 'Annual contract active', DATE_SUB(NOW(), INTERVAL 60 DAY)),
        ('Atlas Media Partners', 'Atlas Media', 'growth@atlasmediapartners.com', '+1-555-0112', 52000, 'Active', 'Mike Davis', 'Onboarding completed', DATE_SUB(NOW(), INTERVAL 14 DAY)),
        ('BluePeak Logistics', 'BluePeak Transport', 'ops@bluepeaklogistics.com', '+1-555-0107', 58000, 'Active', 'John Smith', 'API onboarding in progress', DATE_SUB(NOW(), INTERVAL 30 DAY))`
    );
  }

  const [salesRows] = await pool.query('SELECT COUNT(*) AS total FROM sales');
  if (salesRows[0].total === 0) {
    const [clients] = await pool.query('SELECT id, project_value, status, created_at FROM clients');
    for (const client of clients) {
      await pool.query(
        'INSERT INTO sales (client_id, revenue_amount, deal_status, created_at) VALUES (?, ?, ?, ?)',
        [client.id, Number(client.project_value || 0), client.status === 'Active' ? 'Closed Won' : client.status, client.created_at]
      );
    }
  }

  const [followupRows] = await pool.query('SELECT COUNT(*) AS total FROM followups');
  if (followupRows[0].total === 0) {
    await pool.query(
      `INSERT INTO followups
        (lead_id, followup_date, notes, status, title, related_to, completed, created_at)
       VALUES
        (NULL, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Send revised pricing proposal', 'Pending', 'Pricing follow-up', 'Summit Retail Group', 0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
        (NULL, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Book technical discovery call', 'Pending', 'Discovery call', 'Vector Fintech Labs', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
        (NULL, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Contract signature follow-up', 'Pending', 'Contract follow-up', 'Northwind Healthcare', 0, DATE_SUB(NOW(), INTERVAL 1 DAY))`
    );
  }

  const [leadTotalRows] = await pool.query('SELECT COUNT(*) AS total FROM leads');
  if (Number(leadTotalRows[0].total) < 12) {
    const extraLeads = [
      {
        lead_name: 'BluePeak Logistics',
        company_name: 'BluePeak Transport',
        email: 'ops@bluepeaklogistics.com',
        phone: '+1-555-0107',
        source: 'Website',
        status: 'Contacted',
        lead_score: 100,
        budget: 58000,
        notes: 'Needs shipping dashboard integration with CRM API.',
        pipeline_stage: 'Contacted',
        salesperson: 'John Smith',
        daysAgo: 49
      },
      {
        lead_name: 'Summit Retail Group',
        company_name: 'Summit Retail',
        email: 'digital@summitretail.com',
        phone: '+1-555-0109',
        source: 'LinkedIn',
        status: 'New',
        lead_score: 90,
        budget: 42000,
        notes: 'Multi-store rollout with phased onboarding.',
        pipeline_stage: 'New Lead',
        salesperson: 'Mike Davis',
        daysAgo: 24
      },
      {
        lead_name: 'Vector Fintech Labs',
        company_name: 'Vector Fintech',
        email: 'hello@vectorfintech.io',
        phone: '+1-555-0110',
        source: 'Email Campaign',
        status: 'Contacted',
        lead_score: 70,
        budget: 31000,
        notes: 'Requested recorded demo and pricing tiers.',
        pipeline_stage: 'Contacted',
        salesperson: 'Sarah Johnson',
        daysAgo: 16
      },
      {
        lead_name: 'GlobalForge Energy',
        company_name: 'GlobalForge Energy Ltd.',
        email: 'partnerships@globalforgeenergy.com',
        phone: '+1-555-0131',
        source: 'Referral',
        status: 'Lost',
        lead_score: 35,
        budget: 27000,
        notes: 'Budget frozen until next quarter.',
        pipeline_stage: 'Lost',
        salesperson: 'John Smith',
        daysAgo: 33
      },
      {
        lead_name: 'Nexa Cloud Systems',
        company_name: 'Nexa Cloud',
        email: 'it@nexacloudsystems.com',
        phone: '+1-555-0142',
        source: 'Website',
        status: 'Converted',
        lead_score: 100,
        budget: 84000,
        notes: 'Converted after security review and pilot.',
        pipeline_stage: 'Won',
        salesperson: 'Sarah Johnson',
        daysAgo: 18
      }
    ];

    for (const lead of extraLeads) {
      await seedLeadIfMissing(lead);
    }
  }

  const [clientTotalRows] = await pool.query('SELECT COUNT(*) AS total FROM clients');
  if (Number(clientTotalRows[0].total) < 5) {
    const extraClients = [
      {
        client_name: 'Northwind Healthcare',
        company_name: 'Northwind Health Systems',
        email: 'procurement@northwindhealth.com',
        phone: '+1-555-0108',
        project_value: 90000,
        status: 'Active',
        assigned_manager: 'Sarah Johnson',
        notes: 'Compliance package approved and rollout started.',
        daysAgo: 20
      },
      {
        client_name: 'Nexa Cloud Systems',
        company_name: 'Nexa Cloud',
        email: 'it@nexacloudsystems.com',
        phone: '+1-555-0142',
        project_value: 84000,
        status: 'Active',
        assigned_manager: 'Sarah Johnson',
        notes: 'Migration support package signed.',
        daysAgo: 18
      }
    ];

    for (const client of extraClients) {
      await seedClientIfMissing(client);
    }
  }

  const [followupTotalRows2] = await pool.query('SELECT COUNT(*) AS total FROM followups');
  if (Number(followupTotalRows2[0].total) < 6) {
    const extraFollowups = [
      {
        title: 'Send revised proposal',
        related_to: 'Summit Retail Group',
        dueInDays: 2,
        notes: 'Include enterprise onboarding and timeline.',
        status: 'Pending',
        completed: false,
        createdDaysAgo: 2
      },
      {
        title: 'Quarterly business review',
        related_to: 'Enterprise Plus',
        dueInDays: 7,
        notes: 'Prepare ROI metrics and expansion plan.',
        status: 'Pending',
        completed: false,
        createdDaysAgo: 1
      },
      {
        title: 'Security handover call',
        related_to: 'Nexa Cloud Systems',
        dueInDays: -1,
        notes: 'Follow up on overdue SOC integration checklist.',
        status: 'Pending',
        completed: false,
        createdDaysAgo: 3
      }
    ];

    for (const followup of extraFollowups) {
      await seedFollowupIfMissing(followup);
    }
  }
}

module.exports = {
  pool,
  initializeDatabase
};
