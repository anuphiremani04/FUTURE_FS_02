#!/bin/bash
# Pre-deployment checklist for Render

echo "🔍 Mini CRM - Render Deployment Checklist"
echo "=========================================="
echo ""

# Check Node version
echo "✓ Node.js version:"
node --version

# Check npm
echo "✓ npm version:"
npm --version

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✓ .env file exists"
else
    echo "✗ .env file missing - copy from .env.example"
fi

# Check if package.json is valid
echo "✓ Checking package.json..."
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    echo "  ✓ package.json is valid"
else
    echo "  ✗ package.json has errors"
fi

# Check dependencies
echo "✓ Dependencies to be installed:"
npm list --depth=0 2>/dev/null | grep -E "├──|└──" | head -10

echo ""
echo "🚀 Deployment Checklist:"
echo "========================"
echo "[ ] Database created on TiDB Cloud or similar"
echo "[ ] Database credentials available (host, user, password)"
echo "[ ] GitHub repository created and code pushed"
echo "[ ] Render account created"
echo "[ ] JWT_SECRET changed to a secure value"
echo "[ ] FRONTEND_ORIGIN updated to Render app URL"
echo "[ ] DB_HOST, DB_USER, DB_PASSWORD set in environment"
echo "[ ] NODE_ENV set to 'production'"
echo ""
echo "Once ready, visit https://render.com to deploy!"
