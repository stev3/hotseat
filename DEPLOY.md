# Deployment Guide for HotSeat

## Important: Vercel Limitation

**HotSeat cannot run on Vercel** because it requires a persistent server for Socket.IO connections. Vercel's serverless functions cannot maintain long-lived WebSocket connections.

## Recommended: Deploy on Railway or Render

These platforms support persistent servers and Socket.IO.

---

## Option 1: Railway (Recommended)

### Prerequisites
- GitHub account
- Railway account (free tier available)

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

4. **Update Prisma Schema:**
   
   Change `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from sqlite
     url      = env("DATABASE_URL")
   }
   ```

5. **Deploy:**
   - Railway auto-detects and deploys
   - Add environment variable: `NODE_ENV=production`
   - Railway will run `npm start`

6. **First Deploy Migration:**
   - Railway runs `npx prisma migrate deploy` automatically
   - Your app is live!

### Railway Environment Variables
- `DATABASE_URL` - Auto-provided
- `NODE_ENV=production`
- `PORT` - Auto-provided

---

## Option 2: Render

### Prerequisites
- GitHub account
- Render account (free tier available)

### Steps

1. **Push to GitHub** (same as Railway above)

2. **Create Web Service:**
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Use these settings:
     - **Name:** hotseat
     - **Environment:** Node
     - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
     - **Start Command:** `npm start`
     - **Plan:** Free

3. **Add PostgreSQL Database:**
   - Go to "New" → "PostgreSQL"
   - Name: `hotseat-db`
   - Click "Create Database"
   - Copy the "Internal Database URL"

4. **Update Prisma Schema** (same as Railway)

5. **Add Environment Variable:**
   - In your web service settings
   - Add `DATABASE_URL` with the PostgreSQL connection string
   - Add `NODE_ENV=production`

6. **Deploy:**
   - Render auto-deploys on git push
   - Check logs to ensure migrations run

---

## Updating Prisma for Production

Before deploying, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

Regenerate client:
```bash
npx prisma generate
```

Commit and push:
```bash
git add .
git commit -m "Update for PostgreSQL"
git push
```

---

## Alternative: Hybrid Approach

If you want to use Vercel for static parts:

### Frontend on Vercel + Backend on Railway

**Split the app:**
- Frontend (Next.js static export) on Vercel
- Backend Socket.IO server on Railway

This requires restructuring the app into separate frontend/backend repos.

---

## Environment Variables to Set

### Railway
```
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Render
```
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## First-Time Deployment Issues

### Migration Errors
If migrations fail:
```bash
# Reset database in production
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Socket.IO Connection Issues
- Check that your server URL is correct in client code
- Ensure WebSocket connections aren't blocked
- Use `wss://` for HTTPS in production

---

## Monitoring

### Railway
- View logs in Railway dashboard
- Set up health checks

### Render
- View logs in Render dashboard
- Set up health checks
- Enable auto-redeploy on git push

---

## Cost Estimate

### Free Tiers
- **Railway:** $5/month free credit
- **Render:** Free tier with limitations

### Paid Tiers
- Both start around $7-10/month for better performance

---

## Production Checklist

- [ ] Update `prisma/schema.prisma` to PostgreSQL
- [ ] Set environment variables
- [ ] Test database migrations
- [ ] Verify Socket.IO connections
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (auto by default)
- [ ] Monitor logs for errors

---

## Troubleshooting

### "Database not found"
- Ensure `DATABASE_URL` is set correctly
- Run migrations manually if needed

### "Socket.IO not connecting"
- Check server URL in production
- Verify WebSocket support in your hosting provider

### "Migration failed"
- Check database permissions
- Ensure `prisma migrate deploy` runs in build step

### App won't start
- Check Node.js version (needs 18+)
- Verify `DATABASE_URL` is accessible
- Check build logs for errors

---

## Quick Deploy Commands

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Render
```bash
# Render CLI (optional)
npm install -g render-cli
render login
render deploy
```

---

For help, check the logs in your hosting provider's dashboard.

