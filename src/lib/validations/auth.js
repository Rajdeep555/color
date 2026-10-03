import { z } from 'zod';


// base fields that actually map to the User model / get sent to the API
export const signupBaseSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z
        .string()
        .min(10, 'Enter a valid phone number')
        .max(15, 'Enter a valid phone number')
        .regex(/^\+?[0-9]+$/, 'Phone can only contain digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// client-side form schema — adds confirmPassword, which never reaches the API
export const signupSchema = signupBaseSchema
    .extend({ confirmPassword: z.string() })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export const loginSchema = z.object({
    phone: z.string().min(10, 'Phone number is required'),
    password: z.string().min(1, 'Password is required'),
});