import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupBaseSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth/jwt';

const SIGNUP_BONUS = 30; // ₹ given to every first-time joined user

/**
 * app/api/auth/signup/route.js
 * POST /api/auth/signup
 * Body: { name, email, phone, password }
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const parsed = signupBaseSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.errors[0]?.message || 'Invalid input' },
                { status: 400 }
            );
        }

        const { name, email, phone, password } = parsed.data;

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });

        if (existing) {
            return NextResponse.json(
                { message: 'An account with this email or phone already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user with the bonus applied, and record it as a real
        // Transaction row (so it shows up in the ledger/history), atomically
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: { name, email, phone, password: hashedPassword, balance: SIGNUP_BONUS },
            });

            await tx.transaction.create({
                data: {
                    type: 'CREDIT',
                    amount: SIGNUP_BONUS,
                    status: 'SUCCESS',
                    paymentMethod: 'OTHER',
                    userId: newUser.id,
                    performedById: newUser.id,
                    description: 'Sign-up bonus',
                    transactionDate: new Date(),
                },
            });

            return newUser;
        });

        const token = await signToken({ userId: user.id, role: user.role });

        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                balance: user.balance,
            },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json(
            { message: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}