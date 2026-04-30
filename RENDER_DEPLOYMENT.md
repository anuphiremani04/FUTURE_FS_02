# Render Deployment Guide for Mini CRM

This guide will help you deploy the Mini CRM application on Render.

## Prerequisites

1. A Render account (create at https://render.com)
2. A MySQL database service (TiDB Cloud Free Tier recommended)
3. Your GitHub repository with the code

## Step 1: Set Up MySQL Database (TiDB Cloud - FREE)

1. Sign up at https://tidbcloud.com
2. Create a TiDB Serverless cluster (free tier available)
3. Get your connection details:
   - Host
   - Port
   - Username
   - Password
   - Database name

## Step 2: Deploy on Render

### Option A: Connect GitHub Repository

1. Push your code to GitHub
2. Go to https://render.com and sign in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `mini-crm` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or paid if preferred)

### Option B: Manual Deployment

1. Use Render CLI:
   ```bash
   npm install -g @render/cli
   render login
   render deploy
   ```

## Step 3: Set Environment Variables in Render

In Render Dashboard, go to your service → Environment:

Add these variables:

```
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
DB_HOST=your_tidb_host.c.tidb.cloud
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mini_crm
FRONTEND_ORIGIN=https://your-app-name.onrender.com
```

## Step 4: Verify Deployment

Once deployed:

1. Check the deployment logs in Render dashboard
2. Visit: `https://your-app-name.onrender.com`
3. Test the health endpoint: `https://your-app-name.onrender.com/api/health`

## Important Notes

- **Database**: Render doesn't include MySQL. Use TiDB Cloud (free tier) or PlanetScale
- **Free Tier**: Services spin down after 15 minutes of inactivity on free plan
- **SSL**: Render automatically provides HTTPS
- **Logs**: Monitor in Render Dashboard → Logs tab

## Troubleshooting

### Database Connection Failed
- Verify DB credentials in environment variables
- Check if your database allows external connections
- Ensure DB_HOST and DB_PORT are correct

### Application Won't Start
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure npm start command works locally

### CORS Issues
- Update FRONTEND_ORIGIN to your Render app URL
- Ensure the exact URL matches (including https://)

## Future Updates

To update your deployed app:

1. Push changes to GitHub
2. Render will automatically redeploy if connected to your repo
3. Monitor deployment progress in Render dashboard

## Support

- Render Docs: https://render.com/docs
- TiDB Docs: https://docs.tidbcloud.com
