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
                    orderBy: { startsAt: 'asc' },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: session.id,
            code: session.code,
            title: session.title,
            status: session.status,
            attendeesCount: session.participants.length,
            participants: session.participants.map((p) => ({
                id: p.id,
                name: p.name,
                joinedAt: p.joinedAt,
            })),
            rounds: session.rounds,
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}

