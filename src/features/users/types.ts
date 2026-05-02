import { z } from 'zod';
import { UserRole } from '@prisma/client';

// ─── Base Auth Schema ────────────────────────────────
const BaseAuthSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Owner Registration ────────────────────────────────
export const OwnerRegisterSchema = BaseAuthSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export type OwnerRegisterInput = z.infer<typeof OwnerRegisterSchema>;

// ─── Provider Registration ─────────────────────────────
export const ProviderRegisterSchema = BaseAuthSchema.extend({
  businessName: z.string().min(1, 'Business name is required'),
  serviceCategories: z.array(z.string()).min(1, 'Select at least one service category'),
  operationalZones: z.array(z.string()).min(1, 'Select at least one operational zone'),
});

export type ProviderRegisterInput = z.infer<typeof ProviderRegisterSchema>;

// ─── Login Schema ────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Role enum for validation ────────────────────────
export const RoleSchema = z.enum(['ADMIN', 'OWNER', 'PROVIDER', 'STAFF'] as const);

export type AppRole = z.infer<typeof RoleSchema>;
