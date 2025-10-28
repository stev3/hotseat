# HotSeat - Live Rating App

A real-time rating application where a host conducts live rating sessions and attendees join via QR code to rate participants.

## Features

- 🎯 Real-time synchronization with Socket.IO
- 📱 QR code generation for easy join links
- ⏱️ 30-second timed rating rounds
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 💾 SQLite database with Prisma ORM
- 📊 CSV and JSON export for results
- 🌐 Support for multiple attendees joining mid-session

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS + shadcn/ui**
- **Socket.IO** for real-time communication
- **Prisma** with SQLite
- **QR Code** generation
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd hotseat
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### As a Host

1. Go to the home page (`/`)
2. Enter a session title and click "Begin"
3. Share the QR code or join URL with attendees
4. Add participants to the queue
5. Start the session when ready
6. For each participant:
   - Click "Start Round" (30-second timer begins)
   - Attendees submit scores (1-10)
   - Apply deductions (0-10) if needed
   - Move to next participant
7. Click "Finish Session" to view final results

### As an Attendee

1. Scan the QR code or visit the join URL
2. Enter your display name
3. Wait for the session to start
4. When a round begins:
   - See the participant's name
   - Select a score (1-10) via buttons or keyboard (1-0)
   - Submit your vote (locked after submission)
5. View results at the end

## Project Structure

```
hotseat/
├── app/
│   ├── api/
│   │   └── session/          # API routes
│   ├── host/[code]/          # Host console
│   ├── join/[code]/          # Attendee interface
│   ├── results/[code]/       # Final scoreboard
│   └── page.tsx              # Landing page
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── mock-prisma.ts        # Fallback store
│   └── utils.ts              # Utilities
├── prisma/
│   └── schema.prisma         # Database schema
└── server.js                 # Socket.IO server
```

## API Routes

- `POST /api/session` - Create a new session
- `GET /api/session/[code]` - Get session details
- `GET /api/session/[code]/scoreboard` - Get final scoreboard

## Socket.IO Events

### Client → Server
- `attendee:join` - Join as attendee
- `vote:submit` - Submit a vote
- `host:startSession` - Start the session
- `host:startRound` - Start a round
- `host:applyDeduction` - Apply deduction to round
- `host:finishSession` - End the session

### Server → Client
- `session:state` - Session state update
- `round:started` - Round started
- `round:tick` - Countdown timer update
- `round:ended` - Round ended with results
- `scoreboard:final` - Final scoreboard
- `vote:recorded` - Vote successfully recorded

## Testing

Run tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

## Data Model

### Session
- `id`: Unique identifier
- `code`: Join code
- `title`: Session name
- `status`: LOBBY | ACTIVE | FINISHED

### Participant
- `id`: Unique identifier
- `sessionId`: Reference to session
- `name`: Display name
- `joinedAt`: Timestamp

### Round
- `id`: Unique identifier
- `sessionId`: Reference to session
- `participantName`: Name being rated
- `startsAt`: Start timestamp
- `endsAt`: End timestamp (30s after start)
- `status`: PENDING | RUNNING | ENDED
- `deduction`: 0-10 deduction applied

### Vote
- `id`: Unique identifier
- `roundId`: Reference to round
- `participantId`: Voter's ID
- `score`: 1-10 rating

## Scoring

- **Round average**: Mean of all votes
- **Total after deduction**: `max(0, average - deduction)`
- **Final ranking**: Sorted by total after deduction (descending)

## Features in Detail

### One Vote Per Round
Each attendee can submit exactly one vote per round. The UI locks after submission and prevents changes.

### Deductions
Host can apply deductions (0-10) to round totals. The total cannot go below 0.

### Timer Authority
Server controls the 30-second timer and enforces round end times.

### Export Results
- CSV format: `participantName,average,deduction,totalAfterDeduction`
- JSON format: Full scoreboard data

## Environment Variables

Local Development:
- `DATABASE_URL`: Auto-set to SQLite (./prisma/dev.db)
- `PORT`: Server port (defaults to 3000)

Production Deployment:
- `DATABASE_URL`: PostgreSQL connection string (provided by hosting)
- `NODE_ENV`: Set to `production`

## Deployment

**Important:** HotSeat requires a persistent server (not compatible with Vercel serverless).

### Quick Deploy Options:

**Railway** (Recommended):
1. Push to GitHub
2. Connect to Railway
3. Add PostgreSQL database
4. Railway auto-deploys

**Render:**
1. Push to GitHub  
2. Create web service
3. Add PostgreSQL database
4. Set environment variables

See [DEPLOY.md](./DEPLOY.md) for detailed instructions.

**Note:** Before deploying to production, switch from SQLite to PostgreSQL:
```bash
./scripts/switch-to-postgres.sh
```

## Development Notes

- Socket.IO runs on a custom server (`server.js`) to support real-time features
- In-memory fallback available if database is unavailable
- QR codes generated client-side using `qrcode` package
- Component library follows shadcn/ui patterns

## License

MIT

