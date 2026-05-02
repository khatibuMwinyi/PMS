import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Validation schema for registration
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['OWNER', 'PROVIDER', 'ADMIN']).default('OWNER'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      );
    }

    const { email, password, role, firstName, lastName, phone } = result.data;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with related profile based on role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as UserRole,
        phone: phone || '',
        ...(role === 'OWNER' && firstName && lastName
          ? {
              ownerProfile: {
                create: {
                  firstName,
                  lastName,
                },
              },
            }
          : {}),
        ...(role === 'PROVIDER'
          ? {
              providerProfile: {
                create: {
                  businessName: body.businessName || '',
                  serviceCategories: body.serviceCategories || [],
                  operationalZones: body.operationalZones || [],
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
