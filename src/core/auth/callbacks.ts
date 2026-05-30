import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

export const jwtCallback = async ({ token, user }: { token: JWT; user: User }) => {
  if (user) {
    token.role = (user as any).role;
    token.status = (user as any).status;
    token.id = user.id;
  }
  return token;
};

export const sessionCallback = async ({ session, token }: { session: Session; token: JWT }) => {
  if (token) {
    (session.user as any).role = (token as any).role;
    (session.user as any).status = (token as any).status;
    (session.user as any).id = (token as any).id;
  }
  return session;
};
