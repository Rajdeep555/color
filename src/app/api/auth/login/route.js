import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request) {
    try {
        const body = await request.json();

        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message:
                        parsed.error.issues[0]?.message || 'Invalid input',
                },
                { status: 400 }
            );
        }

        const { phone, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: {
                phone: phone,
            },
        });

        // Same generic message for "no user" and "wrong password"
        if (!user || !user.isActive) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = await signToken({
            userId: user.id,
            role: user.role,
        });

        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
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
        console.error('Login error:', err);

        return NextResponse.json(
            {
                message:
                    'Something went wrong. Please try again.',
            },
            { status: 500 }
        );
    }
}