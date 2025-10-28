# How to Set DATABASE_URL in Railway

## The Issue
Your `hotseat` web service has `DATABASE_URL` as `<empty string>`. You need to link it to your `hotseat-db` PostgreSQL service.

## Solution: Use Railway's Reference System

Railway automatically creates the connection string. You just need to reference it.

### Steps in Railway Dashboard:

1. **You're already on the Variables tab** - Good!

2. **Look at the input fields at the top**:
   - You see: "VARIABLE_NAME" input
   - Next to it: "Add Reference" dropdown (this is the key!)

3. **Add the Reference**:
   - Click the **"Add Reference"** dropdown
   - Select **"hotseat-db"** (your database service)
   - A new field will appear
   - From that dropdown, select **"DATABASE_URL"**
   - Click the purple **"Add"** button

4. **This will create:**
   ```
   Name: DATABASE_URL
   Value: ${{ hotseat-db.DATABASE_URL }}
   Type: Reference
   ```

## What This Does

Instead of copying the connection string manually, Railway will:
- Automatically connect to your PostgreSQL database
- Set the correct connection string
- Update if the database URL changes
- Handle reconnections automatically

## Alternative: Manual Setup (Not Recommended)

If you need to set it manually for some reason:

1. Click on the **`hotseat-db`** database service
2. Go to the **"Variables"** tab
3. Find `DATABASE_URL` or `POSTGRES_URL`
4. Copy the value
5. Go back to `hotseat` service
6. Click on `DATABASE_URL` variable (the empty one)
7. Click edit/pencil icon
8. Paste the connection string
9. Save

But using "Add Reference" is much easier and more reliable!

## Verify It Worked

After adding the reference, you should see:
- `DATABASE_URL` with a value like: `postgresql://postgres:password@containers-us-west-xxx:5432/railway`
- Type shows as "Reference" or "Linked"
- The web service should automatically redeploy

## Next Steps

Once DATABASE_URL is set:
1. Railway will auto-redeploy your service
2. Check the build logs
3. Should see successful Prisma connection
4. App will start successfully!

## Troubleshooting

**"Reference not working?"**
- Make sure `hotseat-db` is running and has a green status
- Try removing the old empty `DATABASE_URL` first, then add the reference

**"Can't find hotseat-db in dropdown?"**
- Refresh the page
- Make sure the database service is deployed

**"Still empty after adding reference?"**
- Remove the variable completely
- Add it again as a reference
- Save and check again

---

**Key Point:** Use "Add Reference" dropdown, not typing the value manually!

