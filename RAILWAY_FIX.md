# Railway Deployment Fix

## The Problem
Railway was trying to start the app without building it first. Next.js needs `next build` to generate production assets.

## The Fix
Updated `railway.json` to:
1. **Build phase:** Run `npm install`, generate Prisma client, and build Next.js
2. **Deploy phase:** Run migrations then start the server

## Next Steps

1. **Commit and push the fixes:**
   ```bash
   git add railway.json railway.toml package.json
   git commit -m "Fix Railway deployment - add build command"
   git push
   ```

2. **Railway will auto-redeploy** from your latest commit

3. **Monitor the logs** in Railway dashboard to see:
   - Build phase: `npm install && npx prisma generate && npm run build`
   - Deploy phase: `npx prisma migrate deploy && npm start`

4. **Check database migrations** in the deploy logs

## If It Still Fails

### Manual Fix via Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Force redeploy
railway up
```

### Or Check Build Logs:
In Railway dashboard:
1. Go to your service
2. Click "View Logs"
3. Check if "Build" phase completed successfully
4. Check if "Deploy" phase has errors

### Common Issues:

**"Prisma client not found"**
- Solution: Build command already includes `npx prisma generate`

**"Database migrations failed"**  
- Solution: Start command includes `npx prisma migrate deploy`

**"Cannot connect to database"**
- Solution: Ensure PostgreSQL service is running and DATABASE_URL is set

## Verify Deployment

After successful deployment:
1. Open your app URL from Railway
2. Create a test session
3. Verify everything works

## Need Help?

Check Railway logs:
- Click on your service in Railway
- Select "Deployments" tab
- Click on latest deployment
- View "Build Logs" and "Deploy Logs"

