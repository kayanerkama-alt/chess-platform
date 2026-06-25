# Railway Deployment Guide

This guide covers deploying UCX Chess Platform to Railway.

## Prerequisites
- [Railway account](https://railway.app)
- GitHub repository connected to Railway (optional but recommended)

## Deployment Steps

### Method 1: One-Click Deploy (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway will auto-detect the Nixpacks configuration

### Method 2: Manual Setup

1. Create a new project on Railway
2. Add a PostgreSQL or MariaDB database (optional - uses SQLite by default)
3. Add environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   DB_PATH=/data/chess.db
   JWT_SECRET=<generate with: openssl rand -hex 64>
   ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
   ```
4. Configure persistent disk at `/data` for SQLite storage
5. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `DB_PATH` | SQLite database path | No |
| `JWT_SECRET` | Secret for JWT tokens (64 hex chars) | Yes |
| `ENCRYPTION_KEY` | Data encryption key (32 hex chars) | Yes |

Generate secrets with:
```bash
# JWT Secret
openssl rand -hex 64

# Encryption Key
openssl rand -hex 32
```

## Persistent Storage

Railway's ephemeral filesystem requires persistent storage for the SQLite database:

1. In Railway dashboard, go to your project
2. Click on your service (chess-platform)
3. Go to "Settings" → "Volumes"
4. Add a volume at `/data`
5. Set `DB_PATH=/data/chess.db`

## Custom Domain (Optional)

1. Go to project settings → Networking
2. Add custom domain
3. Configure DNS records as shown
4. Wait for SSL certificate provisioning

## WebSocket Support

The app uses WebSockets for real-time multiplayer. Railway supports WebSocket connections by default on their Pro plan. For hobby plans, you may need to use a separate WebSocket service or enable WebSocket support in settings.

## Monitoring

- View logs: Railway dashboard → Service → Deployments → View Logs
- Metrics: Available on Pro plan
- Alerts: Configure in project settings

## Troubleshooting

### Connection Issues
- Check that `DB_PATH` points to the persistent volume
- Verify environment variables are set correctly
- Check Railway logs for errors

### Performance Issues
- Upgrade Railway plan for more resources
- Consider using a managed database instead of SQLite
- Enable caching if available

### WebSocket Not Working
- Ensure `NODE_ENV=production` is set
- Check Railway networking settings
- Consider using a dedicated WebSocket service for high traffic