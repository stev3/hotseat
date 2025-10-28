# Quick Setup Guide

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to http://localhost:3000

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - React components (UI components in `/ui`)
- `/lib` - Utility functions and Prisma client
- `/prisma` - Database schema
- `/tests` - Test files
- `server.js` - Custom HTTP server with Socket.IO

## Key Features

✅ Real-time synchronization with Socket.IO  
✅ QR code generation for easy access  
✅ 30-second timed rating rounds  
✅ Prisma + SQLite database  
✅ Export results as CSV or JSON  
✅ Modern UI with Tailwind CSS  

## Database

The app uses SQLite by default (stored at `./prisma/dev.db`). To use a different database:

1. Set the `DATABASE_URL` environment variable
2. Update `prisma/schema.prisma` datasource if needed
3. Run migrations: `npx prisma migrate dev`

## Troubleshooting

**Socket.IO not connecting:**
- Ensure the custom server is running (`node server.js`)
- Check browser console for connection errors

**Database errors:**
- Run `npx prisma generate`
- Reset database: `npx prisma migrate reset`

**Build errors:**
- Delete `.next` folder and rebuild
- Check Node.js version (requires 18+)

