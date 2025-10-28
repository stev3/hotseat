import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
    var __prisma: PrismaClient | undefined;
}

if (typeof window === 'undefined') {
    if (!global.__prisma) {
        global.__prisma = new PrismaClient();
    }
    prisma = global.__prisma;
} else {
    // Client-side placeholder
    prisma = {} as PrismaClient;
}

export default prisma;

