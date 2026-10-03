"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * app/page.js — the TRUE root, outside any route group.
 * This is what fixes the collision: nothing else can claim "/" now.
 */
export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="relative min-h-dvh w-full overflow-hidden bg-[#0b0518] text-white">
            <Image
                src="/images/1st.png"
                alt="Welcome"
                fill
                priority
                className="object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0518]/70 to-[#0b0518]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(147,51,234,0.25),transparent_60%)]" />

            <div
                className="relative z-10 flex min-h-dvh flex-col justify-end px-6 pt-6"
                style={{ paddingBottom: 'max(2.5rem, calc(env(safe-area-inset-bottom) + 1.5rem))' }}
            >
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold italic tracking-tight">WELCOME</h1>
                    <p className="mt-2 text-sm font-medium text-yellow-300">
                        Win Big, Play Smart
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <Button variant="primary" onClick={() => router.push('/signup')}>
                        Sign Up
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/login')}>
                        Login
                    </Button>

                    <p className="pt-4 text-center text-sm text-slate-300">
                        Already have an account?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="font-semibold text-white underline-offset-2 hover:underline"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}