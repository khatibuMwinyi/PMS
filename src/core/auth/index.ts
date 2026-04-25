import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter'; // Re-add PrismaAdapter
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs'; // For password comparison
import { UserRole } from '@prisma/client'; // For session typing
import type { DefaultSession } from 'next-auth'; // For session typing

import { jwtCallback, sessionCallback } from './callbacks';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // Use PrismaAdapter for session management
  session: { strategy: 'jwt' }, // Keep JWT strategy for statelessness
  providers: [ // Providers (e.g., Credentials) to be added in Phase 1 Step 2
    Credentials({
      // Define expected fields for credentials provider
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null; // Use email for login
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }, // Find by email
          include: { ownerProfile: true, providerProfile: true },
        });
        
        if (!user) return null;
        
        const isValid = await bcrypt.compare( // Use bcrypt to compare passwords
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status, // Include status in user object
          // name: user.ownerProfile?.firstName || user.providerProfile?.businessName, // This was for display, can be added back if needed
        };
      },
    }),
  ],
  callbacks: { jwt: jwtCallback, session: sessionCallback },
  pages: {
    signIn: '/login',
  },
});

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Add id to session user
      role: UserRole; // Use UserRole enum
      status: string; // Add status to session user
    } & DefaultSession['user']
  }
}