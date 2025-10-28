const http = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    // Initialize Socket.IO
    const io = new Server(server, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Import Prisma dynamically
    let prismaPromise = null;
    const getPrisma = async () => {
        if (!prismaPromise) {
            const { PrismaClient } = require('@prisma/client');
            prismaPromise = new PrismaClient();
        }
        return prismaPromise;
    };

    const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    io.on('connection', async (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('attendee:join', async (data) => {
            try {
                const { sessionCode, participantName } = data;
                socket.join(`session:${sessionCode}`);

                const prisma = await getPrisma();
                const session = await prisma.session.findUnique({
                    where: { code: sessionCode },
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                let participant = await prisma.participant.findFirst({
                    where: {
                        sessionId: session.id,
                        name: participantName,
                    },
                });

                if (!participant) {
                    participant = await prisma.participant.create({
                        data: {
                            sessionId: session.id,
                            name: participantName,
                        },
                    });
                }

                socket.data.participantId = participant.id;
                socket.data.sessionCode = sessionCode;

                const participants = await prisma.participant.findMany({
                    where: { sessionId: session.id },
                });

                io.to(`session:${sessionCode}`).emit('session:state', {
                    status: session.status,
                    attendeesCount: participants.length,
                    queue: [],
                });
            } catch (error) {
                console.error('attendee:join error:', error);
                socket.emit('error', { message: 'Failed to join' });
            }
        });

        socket.on('host:startSession', async (data) => {
            try {
                const { sessionCode } = data;
                const prisma = await getPrisma();
                const session = await prisma.session.findUnique({
                    where: { code: sessionCode },
                    include: { participants: true },
                });

                if (!session || session.participants.length === 0) {
                    socket.emit('error', { message: 'Cannot start: no attendees' });
                    return;
                }

                await prisma.session.update({
                    where: { id: session.id },
                    data: { status: 'ACTIVE' },
                });

                io.to(`session:${sessionCode}`).emit('session:state', {
                    status: 'ACTIVE',
                    attendeesCount: session.participants.length,
                    queue: [],
                });
            } catch (error) {
                console.error('host:startSession error:', error);
                socket.emit('error', { message: 'Failed to start session' });
            }
        });

        socket.on('host:startRound', async (data) => {
            try {
                const { sessionCode, participantName } = data;
                const prisma = await getPrisma();
                const session = await prisma.session.findUnique({
                    where: { code: sessionCode },
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                const now = new Date();
                const endsAt = new Date(now.getTime() + 30000);

                const round = await prisma.round.create({
                    data: {
                        sessionId: session.id,
                        participantName,
                        startsAt: now,
                        endsAt,
                        status: 'RUNNING',
                        deduction: 0,
                    },
                });

                io.to(`session:${sessionCode}`).emit('round:started', {
                    roundId: round.id,
                    participantName,
                    endsAt: endsAt.toISOString(),
                });

                const timerInterval = setInterval(async () => {
                    const remaining = Math.max(0, endsAt.getTime() - Date.now());
                    io.to(`session:${sessionCode}`).emit('round:tick', {
                        msRemaining: remaining,
                    });

                    if (remaining === 0) {
                        clearInterval(timerInterval);

                        await prisma.round.update({
                            where: { id: round.id },
                            data: { status: 'ENDED' },
                        });

                        const votes = await prisma.vote.findMany({
                            where: { roundId: round.id },
                        });

                        const average = votes.length > 0
                            ? votes.reduce((sum, v) => sum + v.score, 0) / votes.length
                            : 0;
                        const totalAfterDeduction = Math.max(0, average - round.deduction);

                        io.to(`session:${sessionCode}`).emit('round:ended', {
                            roundId: round.id,
                            average: Number(average.toFixed(2)),
                            votesCount: votes.length,
                            deduction: round.deduction,
                            totalAfterDeduction: Number(totalAfterDeduction.toFixed(2)),
                        });
                    }
                }, 1000);
            } catch (error) {
                console.error('host:startRound error:', error);
                socket.emit('error', { message: 'Failed to start round' });
            }
        });

        socket.on('vote:submit', async (data) => {
            try {
                const { roundId, score } = data;
                const participantId = socket.data.participantId;
                const prisma = await getPrisma();

                if (!participantId) {
                    socket.emit('error', { message: 'Not authenticated' });
                    return;
                }

                const existingVote = await prisma.vote.findFirst({
                    where: {
                        roundId,
                        participantId,
                    },
                });

                if (existingVote) {
                    socket.emit('vote:recorded', {
                        message: 'Vote already recorded',
                        score: existingVote.score,
                    });
                    return;
                }

                await prisma.vote.create({
                    data: {
                        roundId,
                        participantId,
                        score,
                    },
                });

                socket.emit('vote:recorded', { score });
            } catch (error) {
                console.error('vote:submit error:', error);
                socket.emit('error', { message: 'Failed to submit vote' });
            }
        });

        socket.on('host:applyDeduction', async (data) => {
            try {
                const { roundId, deduction } = data;
                const prisma = await getPrisma();
                const round = await prisma.round.findUnique({
                    where: { id: roundId },
                });

                if (!round) {
                    socket.emit('error', { message: 'Round not found' });
                    return;
                }

                const clampedDeduction = Math.max(0, Math.min(10, deduction));
                await prisma.round.update({
                    where: { id: roundId },
                    data: { deduction: clampedDeduction },
                });

                const votes = await prisma.vote.findMany({
                    where: { roundId },
                });

                const average = votes.length > 0
                    ? votes.reduce((sum, v) => sum + v.score, 0) / votes.length
                    : 0;
                const totalAfterDeduction = Math.max(0, average - clampedDeduction);

                const session = await prisma.session.findUnique({
                    where: { id: round.sessionId },
                });

                if (session) {
                    io.to(`session:${session.code}`).emit('round:ended', {
                        roundId,
                        average: Number(average.toFixed(2)),
                        votesCount: votes.length,
                        deduction: clampedDeduction,
                        totalAfterDeduction: Number(totalAfterDeduction.toFixed(2)),
                    });
                }
            } catch (error) {
                console.error('host:applyDeduction error:', error);
                socket.emit('error', { message: 'Failed to apply deduction' });
            }
        });

        socket.on('host:finishSession', async (data) => {
            try {
                const { sessionCode } = data;
                const prisma = await getPrisma();
                const session = await prisma.session.findUnique({
                    where: { code: sessionCode },
                    include: {
                        rounds: {
                            where: { status: 'ENDED' },
                            include: { votes: true },
                        },
                        participants: true
                    },
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                const rounds = session.rounds.filter((r) => r.status === 'ENDED');
                const participants = session.participants;

                const scoreboard = [];

                for (const participant of participants) {
                    const roundsForParticipant = rounds.filter(
                        (r) => r.participantName === participant.name
                    );

                    let totalAverage = 0;
                    let totalAfterAllDeductions = 0;
                    let totalDeduction = 0;
                    const roundCount = roundsForParticipant.length;

                    for (const round of roundsForParticipant) {
                        const votes = round.votes || [];
                        if (votes.length > 0) {
                            const avg = votes.reduce((sum, v) => sum + v.score, 0) / votes.length;
                            const total = Math.max(0, avg - round.deduction);
                            totalAverage += avg;
                            totalAfterAllDeductions += total;
                        }
                        totalDeduction += round.deduction;
                    }

                    scoreboard.push({
                        participantName: participant.name,
                        average: roundCount > 0 ? totalAverage / roundCount : 0,
                        deduction: roundCount > 0 ? totalDeduction / roundCount : 0,
                        totalAfterDeduction: roundCount > 0 ? totalAfterAllDeductions / roundCount : 0,
                    });
                }

                await prisma.session.update({
                    where: { id: session.id },
                    data: { status: 'FINISHED' },
                });

                io.to(`session:${sessionCode}`).emit('scoreboard:final', {
                    rows: scoreboard.sort((a, b) => b.totalAfterDeduction - a.totalAfterDeduction),
                });

                socket.emit('redirect', { url: `/results/${sessionCode}` });
            } catch (error) {
                console.error('host:finishSession error:', error);
                socket.emit('error', { message: 'Failed to finish session' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    server
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
