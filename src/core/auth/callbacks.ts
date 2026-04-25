export const jwtCallback = async ({ token, user }) => {
  if (user) {
    token.role = (user as any).role;
    token.status = (user as any).status;
    token.id = user.id;
  }
  return token;
};

export const sessionCallback = async ({ session, token }) => {
  if (token) {
    session.user.role = token.role as any;
    session.user.status = token.status as any;
    session.user.id = token.id as any;
  }
  return session;
};
