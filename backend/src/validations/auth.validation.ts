import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'password is required'),
});

export const completeRegSchema = z
  .object({
    email: z.string().email().trim().toLowerCase(),
    firstName: z.string().min(2).trim(),
    lastName: z.string().min(2).trim().optional(),
    password: z
      .string()
      .min(8, 'password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
});

export const sendOtpSchema = z.object({
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  code: z.string(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
      });
    }

    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New password cannot be the same as current password',
        path: ['newPassword'],
      });
    }
  });

export type SignupInput = z.infer<typeof completeRegSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type updateInput = z.infer<typeof updateUserSchema>;

export type resetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type changePasswordInput = z.infer<typeof changePasswordSchema>;
