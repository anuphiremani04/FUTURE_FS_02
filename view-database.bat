@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

title Database Viewer - Mini CRM

:menu
cls
echo ========================================
echo    Mini CRM - Database Viewer
echo ========================================
echo.
echo 1. Show all tables
echo 2. View leads
echo 3. View clients
echo 4. View followups
echo 5. View sales
echo 6. View users
echo 7. Count records in all tables
echo 8. Watch leads (auto-refresh every 3 seconds)
echo 9. Watch clients (auto-refresh every 3 seconds)
echo 10. Exit
echo.
set /p choice="Enter your choice (1-10): "

if "%choice%"=="1" goto show_tables
if "%choice%"=="2" goto view_leads
if "%choice%"=="3" goto view_clients
if "%choice%"=="4" goto view_followups
if "%choice%"=="5" goto view_sales
if "%choice%"=="6" goto view_users
if "%choice%"=="7" goto count_all
if "%choice%"=="8" goto watch_leads
if "%choice%"=="9" goto watch_clients
if "%choice%"=="10" goto end
goto menu

:show_tables
cls
echo Fetching all tables...
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SHOW TABLES'); console.log('Tables in database:'); rows.forEach(r => console.log('  -', Object.values(r)[0])); await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:view_leads
cls
echo Leads Table:
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT id, lead_name, company_name, email, status, source, lead_score, budget FROM leads ORDER BY id'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:view_clients
cls
echo Clients Table:
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT id, client_name, company_name, email, project_value, status, assigned_manager FROM clients ORDER BY id'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:view_followups
cls
echo Followups Table:
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT id, title, related_to, followup_date, status, completed FROM followups ORDER BY followup_date'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:view_sales
cls
echo Sales Table:
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT s.id, c.client_name, s.revenue_amount, s.deal_status, s.created_at FROM sales s JOIN clients c ON s.client_id = c.id ORDER BY s.id'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:view_users
cls
echo Users Table (passwords hidden):
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:count_all
cls
echo Record counts:
echo.
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const tables = ['users', 'leads', 'clients', 'followups', 'sales']; for (const table of tables) { const [rows] = await pool.query('SELECT COUNT(*) as count FROM ' + table); console.log(table.padEnd(15), ':', rows[0].count, 'records'); } await pool.end(); })().catch(e => { console.error(e); process.exit(1); });"
echo.
pause
goto menu

:watch_leads
cls
echo ========================================
echo  Auto-Refresh: Leads Table (Every 3s)
echo  Press Ctrl+C to stop
echo ========================================
echo.
:watch_leads_loop
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT id, lead_name, status, source, lead_score, budget FROM leads ORDER BY id'); console.clear(); console.log('=== LEADS TABLE (Auto-refresh) ==='); console.log('Last updated:', new Date().toLocaleTimeString()); console.log('Press Ctrl+C to stop\n'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); });"
timeout /t 3 /nobreak >nul
goto watch_leads_loop

:watch_clients
cls
echo ========================================
echo  Auto-Refresh: Clients Table (Every 3s)
echo  Press Ctrl+C to stop
echo ========================================
echo.
:watch_clients_loop
node -e "require('dotenv').config(); const { pool } = require('./server/config/database'); (async()=>{ const [rows] = await pool.query('SELECT id, client_name, company_name, email, project_value, status FROM clients ORDER BY id'); console.clear(); console.log('=== CLIENTS TABLE (Auto-refresh) ==='); console.log('Last updated:', new Date().toLocaleTimeString()); console.log('Press Ctrl+C to stop\n'); console.table(rows); await pool.end(); })().catch(e => { console.error(e); });"
timeout /t 3 /nobreak >nul
goto watch_clients_loop

:end
exit /b 0
