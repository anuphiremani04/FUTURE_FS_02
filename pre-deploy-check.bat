@echo off
REM Pre-deployment checklist for Render (Windows)

echo.
echo ==================================================
echo  Mini CRM - Render Deployment Checklist (Windows)
echo ==================================================
echo.

echo Checking Node.js version...
node --version
echo.

echo Checking npm version...
npm --version
echo.

if exist .env (
    echo [OK] .env file exists
) else (
    echo [!] .env file missing - copy from .env.example
)
echo.

echo Validating package.json...
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] package.json is valid
) else (
    echo [ERROR] package.json has errors
)
echo.

echo ==================================================
echo  DEPLOYMENT CHECKLIST
echo ==================================================
echo.
echo Before deploying to Render:
echo.
echo [ ] 1. Create MySQL database on TiDB Cloud
echo        - Sign up: https://tidbcloud.com
echo        - Create free Serverless cluster
echo        - Get connection credentials
echo.
echo [ ] 2. Get your database details:
echo        - DB_HOST (from TiDB)
echo        - DB_PORT (usually 4000)
echo        - DB_USER
echo        - DB_PASSWORD
echo        - DB_NAME
echo.
echo [ ] 3. Push code to GitHub
echo        - Create repo if needed
echo        - git init
echo        - git add .
echo        - git commit -m "Initial commit"
echo        - git push
echo.
echo [ ] 4. Sign up at https://render.com
echo.
echo [ ] 5. Create new Web Service:
echo        - Connect GitHub repo
echo        - Set Build: npm install
echo        - Set Start: npm start
echo.
echo [ ] 6. Add Environment Variables in Render:
echo        NODE_ENV=production
echo        PORT=5000
echo        JWT_SECRET=your_32_char_secure_key
echo        JWT_EXPIRES_IN=7d
echo        DB_HOST=your_tidb_host
echo        DB_PORT=4000
echo        DB_USER=your_username
echo        DB_PASSWORD=your_password
echo        DB_NAME=mini_crm
echo        FRONTEND_ORIGIN=https://your-app.onrender.com
echo.
echo [ ] 7. Deploy and monitor logs
echo.
echo [ ] 8. Test: https://your-app.onrender.com/api/health
echo.
pause
