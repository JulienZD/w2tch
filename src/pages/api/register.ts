import bcrypt from 'bcryptjs';
import type { NextApiHandler } from 'next';
import { z } from 'zod';
import { prisma } from '~/server/db/client';

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'This request only supports POST requests' });
  }

  const result = z
    .object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      password: z.string().min(8).max(100),
    })
    .safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { name, email, password } = result.data;

  try {
    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err instanceof Error ? err.toString() : err });
  }
};

export default handler;
