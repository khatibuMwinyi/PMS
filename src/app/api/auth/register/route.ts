import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Validation schema
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['owner', 'provider', 'admin']),
});

export const POST = async (request: Request) => {
  if (process.env.NEXT_PUBLIC_FEATURE_AUTH_REGISTER !== 'true') {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 });
  }
  const body = await request.json();
  const result = RegisterSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }
  const { email, password, role } = result.data;
  const normalizedRole = role.toUpperCase() as any;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash: hashed, role: normalizedRole, phone: '' },
    select: { id: true, email: true, role: true },
  });
  return NextResponse.json(user, { status: 201 });
};
