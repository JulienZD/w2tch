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
