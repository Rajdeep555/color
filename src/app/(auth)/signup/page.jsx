'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { signupSchema } from '@/lib/validations/auth';

export default function SignupPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setServerError(result.message || 'Something went wrong. Please try again.');
                return;
            }

            router.push('/login');
        } catch {
            setServerError('Network error. Please try again.');
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col justify-center bg-[#0b0518] px-6 py-12 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(147,51,234,0.25),transparent_60%)]" />

            <div className="relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold italic tracking-tight">SIGN UP</h1>
                    <p className="mt-2 text-sm font-medium text-yellow-300">
                        Create your account to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <InputField
                        label="Full Name"
                        placeholder="Alice Smith"
                        error={errors.name?.message}
                        {...register('name')}
                    />
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />
                    <InputField
                        label="Phone"
                        type="tel"
                        placeholder="9876543210"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                    <InputField
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <InputField
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    {serverError && (
                        <p className="text-center text-sm text-red-400">{serverError}</p>
                    )}

                    <div className="pt-2">
                        <Button type="submit" variant="secondary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-slate-300">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="font-semibold text-white underline-offset-2 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}