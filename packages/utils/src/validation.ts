import { z } from 'zod';
import { UserRole, SkillLevel, JobStatus, PaymentStatus } from '@connectgig/types';

// User validation schemas
export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  role: z.nativeEnum(UserRole),
  kycVerified: z.boolean().optional(),
});

export const WorkerProfileSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
  }),
});

export const JobSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters').max(200, 'Job title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  budget: z.number().min(1, 'Budget must be at least 1'),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(500, 'Review comment too long'),
  jobId: z.string().uuid('Invalid job ID'),
});

export const PaymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be at least 0.01'),
  method: z.enum(['card', 'upi', 'wallet', 'bank_transfer']),
  currency: z.string().length(3, 'Currency must be 3 characters').default('INR'),
});

// Form validation helpers
export const validateEmail = (email: string): boolean => {
  try {
    UserSchema.shape.email.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePhone = (phone: string): boolean => {
  try {
    UserSchema.shape.phone.parse(phone);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitization helpers
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, ''); // Remove non-digits
};

// Type guards
export const isUserRole = (value: unknown): value is UserRole => {
  return Object.values(UserRole).includes(value as UserRole);
};

export const isSkillLevel = (value: unknown): value is SkillLevel => {
  return Object.values(SkillLevel).includes(value as SkillLevel);
};

export const isJobStatus = (value: unknown): value is JobStatus => {
  return Object.values(JobStatus).includes(value as JobStatus);
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus => {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
};
