import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const session = await prisma.session.findUnique({
            where: { code: params.code },
            include: {
                participants: true,
                rounds: {
                    where: { status: 'ENDED' },
                    include: { votes: true },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Calculate scoreboard
        const scoreboard = [];

        for (const participant of session.participants) {
            const roundsForParticipant = session.rounds.filter(
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

        // Sort by totalAfterDeduction descending
        scoreboard.sort((a, b) => b.totalAfterDeduction - a.totalAfterDeduction);

        return NextResponse.json({ scoreboard });
    } catch (error) {
        console.error('Error fetching scoreboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scoreboard' },
            { status: 500 }
        );
    }
}

