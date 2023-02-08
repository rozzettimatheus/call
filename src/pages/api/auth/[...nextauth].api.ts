/* eslint-disable prettier/prettier */
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'
import { PrismaAdapter } from '@/lib/auth/prisma-adapter'
import { NextApiRequest, NextApiResponse } from 'next'

const EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email'
const PROFILE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'

export function buildNextAuthOptions(
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',

        authorization: {
          params: {
            scope: `${EMAIL_SCOPE} ${PROFILE_SCOPE} ${CALENDAR_SCOPE}`,
          },
        },
        profile(profile: GoogleProfile) {
          return {
            id: profile.sub,
            name: profile.name,
            username: '', // not used
            email: profile.email,
            avatar_url: profile.picture,
          }
        },
      }),
    ],

    callbacks: {
      async signIn({ account }) {
        if (!account?.scope?.includes(CALENDAR_SCOPE)) {
          return '/register/connect-calendar/?error=permissions'
        }

        return true
      },
      async session({ session, user }) {
        return {
          ...session,
          user,
        }
      },
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res))
}
