## FUTURE_FS_02

🚀 Mini CRM – Client Lead Management System

A full-stack Customer Relationship Management (CRM) system built using Node.js, Express, MySQL, and Vanilla JavaScript.

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

The system includes:

JWT authentication

Interactive dashboards

Modern UI

Real-time updates

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

Lead Score Calculation
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

Kanban-style board with stages:

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

Metrics

Total Leads

Active Clients

Pending Deals

Revenue

Conversion Rate

Average Lead Score

Charts

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

## 📂 Project Structure

```
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
```
