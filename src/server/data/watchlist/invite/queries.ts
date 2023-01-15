import type { PrismaClient } from '@prisma/client';

const defaultWhere = (prisma: PrismaClient) => ({
  validUntil: { gte: new Date() },
  OR: [{ maxUses: null }, { uses: { lt: prisma.watchlistInvite.fields.maxUses } }],
});

export const getWatchlistInviteById = async (watchlistId: string, prisma: PrismaClient) => {
  return prisma.watchlistInvite.findFirst({
    where: {
      ...defaultWhere(prisma),
      watchlistId,
    },
  });
};

export const getWatchlistInviteByCode = async (inviteCode: string, prisma: PrismaClient) => {
  return prisma.watchlistInvite.findFirst({
    include: {
      watchlist: {
        select: {
          name: true,
          owner: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    where: {
      ...defaultWhere(prisma),
      inviteCode,
    },
  });
};
