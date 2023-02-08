import { User } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { Adapter, AdapterUser } from 'next-auth/adapters'
import { parseCookies, destroyCookie } from 'nookies'

import { prisma } from '../prisma'

function mapToAdapterUser(user: User): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email!,
    avatar_url: user.avatar_url!,
    emailVerified: null,
  }
}

/**
 *
 * caso nao tivesse o adapter, o nextauth tentaria criar o user do zero com as configs padrão
 */
export function PrismaAdapter(
  req: NextApiRequest,
  // eslint-disable-next-line prettier/prettier
  res: NextApiResponse
): Adapter {
  return {
    async createUser(user) {
      // pegar id dos cookies - so tem acesso aos req / res
      // vem trazendo os req res desde o nextauth.api
      // sempre tras todos os cookies
      const { '@call:userId': userIdCookies } = parseCookies({ req })

      if (!userIdCookies) {
        throw new Error('User ID not found on cookies')
      }

      const prismaUser = await prisma.user.update({
        where: {
          id: userIdCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      // remover cookie apos cadastro completo
      // passando o res para modificar
      destroyCookie({ res }, '@call:userId', {
        path: '/',
      })

      return mapToAdapterUser(prismaUser)
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) return null

      return mapToAdapterUser(user)
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return null
      }

      return mapToAdapterUser(user)
    },

    async getUserByAccount({ providerAccountId, provider }) {
      // nao pode throw error
      // deve retornar o usuario ou nulo
      const account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider,
            provider_account_id: providerAccountId,
          },
        },
        // traz junto o user
        include: {
          user: true,
        },
      })

      if (!account?.user) {
        return null
      }

      return mapToAdapterUser(account.user)
    },

    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id!,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return mapToAdapterUser(prismaUser)
    },

    // async deleteUser(userId) {
    //   await prisma.user.delete({
    //     where: {
    //       id: userId,
    //     },
    //   })
    // },

    async linkAccount(account) {
      // criar nova account
      await prisma.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },

    // async unlinkAccount({ providerAccountId, provider }) {},

    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          user_id: userId,
          expires,
          session_token: sessionToken,
        },
      })

      return {
        sessionToken,
        userId,
        expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      const prismaSession = await prisma.session.findUnique({
        where: {
          session_token: sessionToken,
        },
        include: {
          user: true,
        },
      })

      if (!prismaSession) {
        return null
      }

      const { user, ...session } = prismaSession

      return {
        session: {
          expires: session.expires,
          sessionToken: session.session_token,
          userId: session.user_id,
        },
        user: mapToAdapterUser(user),
      }
    },

    async updateSession({ sessionToken, expires, userId }) {
      const prismaSession = await prisma.session.update({
        where: {
          session_token: sessionToken,
        },
        data: {
          expires,
          user_id: userId,
        },
      })

      return {
        expires: prismaSession.expires,
        sessionToken: prismaSession.session_token,
        userId: prismaSession.user_id,
      }
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          session_token: sessionToken,
        },
      })
    },

    // async createVerificationToken({ identifier, expires, token }) {},

    // async useVerificationToken({ identifier, token }) {},
  }
}
