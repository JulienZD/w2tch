import type { PrismaClient } from '@prisma/client';

export const getWatchlistsForUser = async (userId: string, prisma: PrismaClient) => {
  const watchlists = await prisma.watchlist.findMany({
    where: {
      watchers: {
        some: {
          watcherId: userId,
        },
      },
    },
    include: {
      _count: {
        select: {
          watchers: true,
          movies: true,
        },
      },
    },
  });

  return watchlists.map(({ _count, ...group }) => ({
    ...group,
    isOwner: group.ownerId === userId,
    memberCount: _count.watchers,
    movieCount: _count.movies,
  }));
};
