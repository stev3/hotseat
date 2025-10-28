# HotSeat - Project Summary

## Overview
HotSeat is a full-stack real-time rating application where hosts conduct live rating sessions and attendees join via QR codes to rate participants.

## What Has Been Built

### ✅ Core Features Implemented

1. **Host Functionality**
   - Create sessions with custom titles
   - Generate and display QR codes for attendee join links
   - Manage participant queue
   - Start/control 30-second rating rounds
   - Apply deductions (0-10) to round scores
   - View results and export to CSV/JSON

2. **Attendee Functionality**
   - Join sessions via QR code or URL
   - Persistent name storage in localStorage
   - Submit scores (1-10) using buttons or keyboard (1-0 keys)
   - One vote per round enforced
   - Locked UI after vote submission
   - Real-time round updates

3. **Real-time Synchronization**
   - Socket.IO for live updates
   - Timer countdown synced across all clients
   - Vote aggregation and round results
   - Final scoreboard with rankings

### ✅ Technical Implementation

**Frontend:**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui components
- Client-side Socket.IO integration
- QR code generation (`qrcode` package)

**Backend:**
- Custom HTTP server with Socket.IO (`server.js`)
- Next.js API routes for REST endpoints
- Prisma ORM with SQLite
- Real-time event handlers

**Database Schema:**
- `Session` - Sessions with status and metadata
- `Participant` - Attendees with session association
- `Round` - Rating rounds with timing and deductions
- `Vote` - Individual votes with unique constraints

### ✅ Pages Created

1. **`/` (Home)** - Host landing page
   - Session title input
   - Create session button
   - Modern gradient UI

2. **`/host/[code]`** - Host console
   - Display session info and QR code
   - Attendee count
   - Participant queue management
   - Start session/round controls
   - Timer display
   - Round results and deduction input

3. **`/join/[code]`** - Attendee interface
   - Name input on first visit
   - Lobby waiting state
   - Active round voting interface
   - Vote submission with keyboard shortcuts
   - Locked state after voting

4. **`/results/[code]`** - Final scoreboard
   - Sorted participant rankings
   - Average, deduction, and total scores
   - CSV and JSON export
   - Highlighted top 3

### ✅ API Routes

- `POST /api/session` - Create session
- `GET /api/session/[code]` - Get session details
- `GET /api/session/[code]/scoreboard` - Get final scoreboard

### ✅ Socket.IO Events

**Client → Server:**
- `attendee:join` - Join as attendee
- `vote:submit` - Submit vote
- `host:startSession` - Start session
- `host:startRound` - Start round
- `host:applyDeduction` - Apply deduction
- `host:finishSession` - End session

**Server → Client:**
- `session:state` - Status updates
- `round:started` - Round began
- `round:tick` - Timer countdown
- `round:ended` - Round results
- `scoreboard:final` - Final rankings
- `vote:recorded` - Vote confirmed

### ✅ Key Features

**Constraints Enforced:**
- One vote per participant per round (unique constraint)
- Deductions bounded 0-10
- Total score cannot go below 0
- 30-second timer enforced by server
- Session states: LOBBY → ACTIVE → FINISHED

**Scoring Logic:**
- Round average = mean of all votes
- Total after deduction = max(0, average - deduction)
- Final ranking sorted by totalAfterDeduction descending

**Export Formats:**
- CSV: `participantName,average,deduction,totalAfterDeduction`
- JSON: Full scoreboard data

### ✅ Testing

- Basic Playwright tests for session creation
- Test configuration for Vitest
- E2E test setup for key flows

### ✅ Documentation

- Comprehensive README.md
- Setup guide (SETUP.md)
- API documentation in code
- TypeScript types throughout
- Inline comments for complex logic

## File Structure

```
hotseat/
├── app/
│   ├── api/session/        # REST API routes
│   ├── host/[code]/        # Host console page
│   ├── join/[code]/        # Attendee page
│   ├── results/[code]/     # Results page
│   └── page.tsx            # Landing page
├── components/ui/          # Reusable UI components
├── lib/                    # Utilities & Prisma client
├── prisma/
│   └── schema.prisma       # Database schema
├── tests/                  # Test files
├── server.js               # Custom Socket.IO server
├── README.md
└── package.json
```

## Running the App

1. Install: `npm install`
2. Setup DB: `npx prisma generate && npx prisma migrate dev --name init`
3. Run: `npm run dev`
4. Open: http://localhost:3000

## Next Steps (Optional Enhancements)

- [ ] Host setting to change round length
- [ ] Prevent duplicate participant names in queue
- [ ] Export button improvements
- [ ] Responsive design refinements
- [ ] Loading states and error boundaries
- [ ] Host authentication/permissions
- [ ] Session history and analytics

## Technical Highlights

- **Custom Server**: Required for Socket.IO integration with Next.js
- **Real-time Sync**: All attendees see updates instantly
- **Timer Authority**: Server controls 30s countdown
- **One Vote Per Round**: Enforced at database level with unique constraint
- **Export Results**: Both CSV and JSON formats
- **QR Code Sharing**: Easy attendee onboarding
- **Persistent Sessions**: All data saved in SQLite

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive mobile design
- Keyboard shortcuts (1-0 for voting)

---

Built with Next.js 14, Socket.IO, Prisma, and Tailwind CSS.

