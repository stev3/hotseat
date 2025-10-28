# Railway Database Setup Fix

## The Error
```
Error validating datasource `db`: You must provide a nonempty URL. 
The environment variable `DATABASE_URL` resolved to an empty string.
```

## The Problem
Railway has your database (`hotseat-db`) but hasn't linked it to your web service (`hotseat`). The `DATABASE_URL` environment variable isn't being set.

## Quick Fix in Railway Dashboard

### Option 1: Auto-Link (Easiest)

1. Go to your Railway project dashboard
2. Click on the **`hotseat`** (web) service (the one that's failing)
3. Look for a prompt about linking the database
4. If you see "Add Database" or "Connect to Database", click it
5. Select `hotseat-db` from the list
6. Railway will automatically set `DATABASE_URL`

### Option 2: Manually Add Environment Variable

1. Go to your **`hotseat`** service
2. Click the **"Variables"** tab
3. Click **"New Variable"** or **"Add Reference"**
4. Select **"Reference"** as the type
5. Choose **"hotseat-db"** from the service list
6. Select **"DATABASE_URL"** from the variable list
7. Railway will automatically create the connection

### Option 3: Network Connector (Advanced)

If the above doesn't work:

1. Click the **"hotseat"** service
2. Go to **"Settings"** tab
3. Under **"Networking"**, add the database service
4. Railway will create the connection string

## Verify It Worked

After linking, you should see:
1. **Environment Variable:** `DATABASE_URL` in your `hotseat` service
2. **Value:** Should be a PostgreSQL connection string like `postgresql://...`
3. **Type:** "Referenced" (shows it comes from the database service)

## Redeploy

After adding the database connection:

1. Click **"New Deployment"** or wait for auto-redeploy
2. The service will restart with the `DATABASE_URL` set
3. Check logs to confirm it's working

## Expected Logs After Fix

You should see in the logs:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "railway" at "containers-us-west-xxx:5432"
✔ Generated Prisma Client
```

## Troubleshooting

**Still see empty DATABASE_URL?**
- Make sure you're editing the **web service** (`hotseat`), not the database service
- Check the Variables tab to confirm `DATABASE_URL` is listed

**Can't see the database service?**
- Make sure `hotseat-db` (PostgreSQL) is deployed and running
- It should have a green checkmark

**Want to verify the connection string?**
- In the `hotseat` service Variables tab
- Click on `DATABASE_URL` to view the full connection string
- Should start with `postgresql://`

## Quick Checklist

- [ ] Database service (`hotseat-db`) is running
- [ ] Added DATABASE_URL reference to web service (`hotseat`)
- [ ] Variable shows as "Referenced" type
- [ ] New deployment triggered
- [ ] Logs show successful connection to database

Once `DATABASE_URL` is set, your app should deploy successfully!

