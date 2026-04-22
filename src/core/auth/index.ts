import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter'; // Re-add PrismaAdapter
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs'; // For password comparison
import { UserRole } from '@prisma/client'; // For session typing
import type { DefaultSession } from 'next-auth'; // For session typing

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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role; // Ensure role is passed to token
        token.status = (user as any).status; // Ensure status is passed to token
        token.id = user.id; // Ensure user ID is in token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as UserRole; // Type role correctly
        session.user.status = token.status as string; // Type status correctly
        session.user.id = token.id as string; // Ensure user ID is in session
      }
      return session;
    },
  },
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