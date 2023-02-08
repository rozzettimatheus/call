/* eslint-disable prettier/prettier */
import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import { User } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export default async function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<User>>
) {
  // restrict non-post requests
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { name, username } = req.body

  const user = await prisma.user.create({
    data: {
      name,
      username,
    },
  })

  setCookie({ res }, '@call:userId', user.id, {
    maxAge: 60 * 15, // 15m
    path: '/',
  })

  return res.status(201).json(user)
}
