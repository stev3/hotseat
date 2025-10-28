#!/bin/bash

# Script to switch from SQLite to PostgreSQL for production deployment

echo "🔄 Switching HotSeat to PostgreSQL..."

# Backup original schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma.bak
echo "✅ Backed up original schema"

# Update schema for PostgreSQL
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Session {
  id           String       @id @default(cuid())
  code         String       @unique
  title        String
  status       String       // 'LOBBY' | 'ACTIVE' | 'FINISHED'
  createdAt    DateTime     @default(now())
  participants Participant[]
  rounds       Round[]
}

model Participant {
  id         String   @id @default(cuid())
  sessionId  String
  session    Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  name       String   // attendee display name
  joinedAt   DateTime @default(now())
  votes      Vote[]

  @@index([sessionId])
}

model Round {
  id              String   @id @default(cuid())
  sessionId       String
  session         Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  participantName String
  startsAt        DateTime
  endsAt          DateTime
  status          String   // 'PENDING' | 'RUNNING' | 'ENDED'
  deduction       Int      @default(0) // 0–10
  votes           Vote[]

  @@index([sessionId])
  @@index([status])
}

model Vote {
  id           String     @id @default(cuid())
  roundId      String
  round        Round      @relation(fields: [roundId], references: [id], onDelete: Cascade)
  participantId String
  participant  Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  score        Int        // 1–10 (single overall)
  createdAt    DateTime   @default(now())
  // Unique per participant per round to enforce one submission:
  @@unique([roundId, participantId])
  @@index([roundId])
  @@index([participantId])
}
EOF

echo "✅ Updated schema for PostgreSQL"

# Regenerate Prisma client
echo "📦 Regenerating Prisma client..."
npx prisma generate

echo ""
echo "✅ Switch complete!"
echo ""
echo "Next steps:"
echo "1. Make sure DATABASE_URL is set in your environment"
echo "2. Run migrations: npx prisma migrate deploy"
echo "3. Deploy your app"
echo ""
echo "To switch back to SQLite, run:"
echo "  cp prisma/schema.sqlite.prisma.bak prisma/schema.prisma && npx prisma generate"

