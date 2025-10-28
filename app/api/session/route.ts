import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCode } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        const { title } = await req.json();

        if (!title || typeof title !== 'string') {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        const code = generateCode();
        const session = await prisma.session.create({
            data: {
                code,
                title,
                status: 'LOBBY',
            },
        });

        return NextResponse.json({ code: session.code });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}

