import NextAuth, { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || 'anonymous';
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
