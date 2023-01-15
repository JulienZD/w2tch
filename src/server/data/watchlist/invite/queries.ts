import type { PrismaClient } from '@prisma/client';

export const getWatchlistInviteById = async (watchlistId: string, prisma: PrismaClient) => {
  return prisma.watchlistInvite.findFirst({
    where: {
      watchlistId,
      validUntil: { gte: new Date() },
      OR: [{ remainingUses: { gt: 0 } }, { remainingUses: { equals: null } }],
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
      inviteCode,
      validUntil: { gte: new Date() },
      OR: [{ remainingUses: { gt: 0 } }, { remainingUses: { equals: null } }],
    },
  });
};
