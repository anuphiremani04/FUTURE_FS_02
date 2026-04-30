# FUTURE_FS_02

🚀 Mini CRM – Client Lead Management System

A full-stack Customer Relationship Management (CRM) system built with Node.js, Express, MySQL, and Vanilla JavaScript.

This application helps businesses manage leads, clients, sales pipelines, follow-ups, and analytics through an intuitive dashboard interface.

📌 Project Overview

Mini CRM provides a centralized platform for businesses to manage customer relationships efficiently.

It allows users to:

✔ Track and manage sales leads
✔ Convert leads into active clients
✔ Monitor sales pipelines
✔ Schedule follow-ups and tasks
✔ Visualize business analytics
✔ Track revenue and conversion rates

The system includes JWT authentication, interactive dashboards, modern UI, and real-time updates.

✨ Key Features
🔐 Authentication

Secure User Registration & Login

JWT-based authentication

Password encryption using bcrypt

Session management

👥 Lead Management

Add, edit, delete leads

Automatic lead scoring

Lead filtering & search

Export leads to CSV

Track lead sources

Lead Score is calculated based on:

Factor	Score
Corporate Email	+30
Website Inquiry	+20
High Budget	+50
Referral Source	+15
Lead Status	+5–20
💼 Client Management

Convert leads → clients

Track project revenue

Assign account managers

Monitor client status

📊 Sales Pipeline

Kanban style board with stages:

New Lead

Contacted

Qualified

Proposal Sent

Negotiation

Won / Lost

Supports drag and drop lead movement.

📅 Follow-Up System

Schedule follow-ups

Track completion

Overdue notifications

Link follow-ups with leads or clients

📈 Analytics Dashboard

Interactive charts powered by Chart.js

Metrics include:

Total Leads

Active Clients

Pending Deals

Revenue

Conversion Rate

Average Lead Score

Charts included:

📊 Lead distribution (Pie Chart)
📈 Monthly lead growth (Line Chart)
📊 Leads per month (Bar Chart)
📈 Revenue analytics (Line Chart)

🎨 UI Features

Modern dashboard interface

Dark mode support 🌙

Responsive design

Smooth animations

Real-time updates

Search & filtering

🛠️ Tech Stack
Frontend

HTML5

CSS3

JavaScript (ES6)

Chart.js

Font Awesome

Backend

Node.js

Express.js

MySQL

mysql2

Security

JWT Authentication

bcrypt password hashing

dotenv configuration

CORS protection

📂 Project Structure
Task-2
│
├── server
│   ├── config
│   │   ├── database.js
│   │   └── schema.sql
│   │
│   ├── controllers
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── clientController.js
│   │   ├── followupController.js
│   │   └── analyticsController.js
│   │
│   ├── models
│   │   ├── userModel.js
│   │   ├── leadModel.js
│   │   ├── clientModel.js
│   │   ├── followupModel.js
│   │   └── analyticsModel.js
│   │
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── followupRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   └── server.js
│
├── css
│   └── style.css
│
├── js
│   ├── app.js
│   ├── storage.js
│   └── reports.js
│
├── index.html
├── dashboard.html
│
├── package.json
├── .env.example
├── start-server.bat
└── view-database.bat

---

## 🚀 Deployment Guide

### Deploying to Render

**Step 1: Set Up External MySQL Database**

Since Render doesn't provide MySQL directly, use one of these free tier options:

- **TiDB Cloud** (Recommended) - https://tidbcloud.com
  - Sign up and create a free Serverless cluster
  - Get connection details: host, port, username, password

**Step 2: Connect GitHub Repository**

1. Push your code to GitHub
2. Visit [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `mini-crm`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Paid)

**Step 3: Set Environment Variables**

In Render Dashboard, go to your service → Environment and add:

```
NODE_ENV=production
JWT_SECRET=your_secure_random_secret_key_32_chars_minimum
JWT_EXPIRES_IN=7d
DB_HOST=your_tidb_host.c.tidb.cloud
DB_PORT=4000
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=mini_crm
FRONTEND_ORIGIN=https://your-app-name.onrender.com
```

**Step 4: Deploy**

1. Click "Deploy" in Render dashboard
2. Monitor logs for deployment status
3. Once deployed, visit: `https://your-app-name.onrender.com`
4. Test health check: `https://your-app-name.onrender.com/api/health`

**Important Notes:**

- Free tier services spin down after 15 minutes of inactivity
- Render provides automatic HTTPS
- Update `FRONTEND_ORIGIN` with your Render app URL
- Keep `JWT_SECRET` secure and different from development

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed troubleshooting.
