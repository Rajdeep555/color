import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const globalForPrisma = globalThis;

function createPool() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        // close idle connections before the server (Neon/Supabase etc.) kills them
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 15_000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 5_000,
    });

    // Without this, a dropped idle connection can crash the process
    pool.on('error', (err) => {
        console.error('pg pool error (connection will be replaced):', err.message);
    });

    return pool;
}

const pool = globalForPrisma.pgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === 'development'
                ? ['error', 'warn']
                : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}