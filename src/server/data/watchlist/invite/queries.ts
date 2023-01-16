import type { PrismaClient } from '@prisma/client';

const defaultWhere = (prisma: PrismaClient) => ({
  validUntil: { gte: new Date() },
  OR: [{ maxUses: null }, { uses: { lt: prisma.watchlistInvite.fields.maxUses } }],
});

export const getWatchlistInvitesById = async (watchlistId: string, prisma: PrismaClient) => {
  return prisma.watchlistInvite.findMany({
    where: {
      ...defaultWhere(prisma),
      watchlistId,
    },
    orderBy: {
      createdAt: 'desc',
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
