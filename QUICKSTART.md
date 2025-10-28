# Quick Start Guide

Get HotSeat running in 3 steps:

## 1. Install Dependencies
```bash
npm install
```

## 2. Setup Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 3. Start the App
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Try It Out

1. **Create a session** on the home page
2. **Scan the QR code** or copy the join URL
3. **Open join URL** in another tab/device
4. **Enter your name** as an attendee
5. **Start the session** from host console
6. **Add participants** to the queue
7. **Start a round** and watch the 30s timer
8. **Submit scores** as an attendee
9. **Apply deductions** if needed
10. **Finish session** to see results

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## Key Files

- `server.js` - Custom Socket.IO server
- `app/page.tsx` - Landing page
- `app/host/[code]/page.tsx` - Host console
- `app/join/[code]/page.tsx` - Attendee page
- `app/results/[code]/page.tsx` - Results page
- `prisma/schema.prisma` - Database schema

## Features

✅ Real-time sync with Socket.IO  
✅ QR code generation  
✅ 30-second timed rounds  
✅ One vote per participant per round  
✅ Deductions and final scoreboard  
✅ CSV/JSON export  

Enjoy rating sessions!

