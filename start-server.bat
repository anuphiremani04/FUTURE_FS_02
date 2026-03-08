@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

title Mini CRM Server

echo ========================================
echo    Mini CRM Server Startup
echo ========================================
echo.

set "SERVER_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":5000 .*LISTENING"') do (
  set "SERVER_PID=%%p"
  goto :port_checked
)

:port_checked
if defined SERVER_PID (
  echo Server is already running on port 5000 ^(PID !SERVER_PID!^).
  echo.
  echo Open http://localhost:5000 in your browser.
  echo.
  echo Press any key to exit...
  pause >nul
  exit /b 0
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Failed to install dependencies.
    echo Press any key to exit...
    pause >nul
    exit /b 1
  )
)

echo Starting server on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm start

if errorlevel 1 (
  echo.
  echo Server exited with an error.
  echo Press any key to exit...
  pause >nul
  exit /b 1
)
