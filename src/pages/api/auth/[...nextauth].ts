// Store credentials sessions in the database
// Adapted from https://github.com/nextauthjs/next-auth/discussions/4394#discussioncomment-3293618
import NextAuth, { type CallbacksOptions, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { randomUUID } from 'crypto';
import { getCookie, setCookie } from 'cookies-next';
import { encode, decode } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { env } from '~/env/server.mjs';
import { prisma } from '~/server/db/client';
import type { User } from 'next-auth';

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const TWENTY_FOUR_HOURS = 24 * 60 * 60;

const addTimeToDate = (time: number, date: Date) => {
  return new Date(date.getTime() + time * 1000);
};

const isCredentialsCallback = (req: NextApiRequest) =>
  req.query.nextauth?.includes('callback') && req.query.nextauth?.includes('credentials') && req.method === 'POST';

export const createAuthOptions = (req: NextApiRequest, res: NextApiResponse): NextAuthOptions => {
  const adapter = PrismaAdapter(prisma);

  const callbacks: Partial<CallbacksOptions> = {
    async signIn({ user }) {
      // Check if this sign in callback is being called in the credentials authentication flow. If so, use the next-auth adapter to create a session entry in the database (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
      if (!isCredentialsCallback(req) || !user) {
        return true;
      }

      const sessionToken = randomUUID();
      const sessionMaxAge = THIRTY_DAYS;
      const sessionExpiry = addTimeToDate(sessionMaxAge, new Date());

      await adapter.createSession({
        sessionToken: sessionToken,
        userId: user.id,
        expires: sessionExpiry,
      });

      setCookie('next-auth.session-token', sessionToken, {
        expires: sessionExpiry,
        req,
        res,
      });

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.user = {
          name: user.name,
          email: user.email,
          id: user.id,
        };
      }
      return token;
    },
    session({ session, user }) {
      if (user) {
        session.user = {
          name: user.name as string,
          email: user.email,
          id: user.id,
        };
      }

      return session;
    },
  };

  const authOptions: NextAuthOptions = {
    session: {
      maxAge: THIRTY_DAYS,
      updateAge: TWENTY_FOUR_HOURS,
    },
    pages: {
      signIn: '/login',
    },
    jwt: {
      encode: async ({ token, secret, maxAge }) => {
        if (!isCredentialsCallback(req)) {
          return encode({ token, secret, maxAge });
        }

        const cookie = getCookie('next-auth.session-token', { req: req });

        return (cookie as string) || '';
      },
      decode: async ({ token, secret }) => {
        if (isCredentialsCallback(req)) {
          return null;
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return decode({ token, secret });
      },
    },
    debug: env.NODE_ENV === 'development',
    adapter,
    secret: env.NEXTAUTH_SECRET,
    providers: [
      // This provider is used to refresh the session token, updating any user data that may have changed.
      CredentialsProvider({
        id: 'update-user',
        credentials: {},
        // @ts-expect-error This is fine, we send an empty object, but next-auth expects a different type
        authorize(credentials?: { user: string }) {
          if (!credentials) return null;
          return { user: JSON.parse(credentials.user) as User };
        },
      }),
      CredentialsProvider({
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'Email' },
          password: { label: 'Password', type: 'password', placeholder: 'Password' },
        },
        authorize: async (credentials) => {
          if (!credentials?.email || !credentials?.password) return null;

          try {
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
            });

            if (!user) return null;

            const match = await bcrypt.compare(credentials.password, user.password);
            if (!match) return null;

            return {
              id: user.id,
              email: user.email,
              username: user.name,
            };
          } catch (error) {
            console.log('Authorize error:', error);
            return null;
          }
        },
      }),
    ],
    callbacks: callbacks,
  };

  return authOptions;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = createAuthOptions(req, res);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptions);
}
