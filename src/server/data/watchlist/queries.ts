import type { PrismaClient, Watchable, WatchablesOnWatchlists } from '@prisma/client';

export const enhanceWatchlistWatchable = ({
  seenOn,
  watchable,
}: WatchablesOnWatchlists & {
  watchable: Watchable;
}) => ({
  ...watchable,
  rating: watchable.rating?.toNumber(),
  seenOn,
});

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
          watchables: true,
        },
      },
    },
  });

  return watchlists.map(({ _count, ...watchlist }) => ({
    ...watchlist,
    isOwner: watchlist.ownerId === userId,
    memberCount: _count.watchers,
    watchableCount: _count.watchables,
  }));
};

type GetWatchlistByIdArgs = {
  id: string;
  userId: string;
  ownerOnly?: boolean;
};

export const getWatchlistById = async (
  { id, userId, ownerOnly = false }: GetWatchlistByIdArgs,
  prisma: PrismaClient
) => {
  const watchlist = await prisma.watchlist.findFirst({
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      watchables: {
        include: {
          watchable: {
            select: {
              name: true,
              id: true,
              externalId: true,
              rating: true,
              type: true,
              source: true,
              image: true,
              runtime: true,
            },
          },
        },
      },
      _count: {
        select: {
          watchers: true,
          watchables: true,
        },
      },
    },
    where: {
      id,
      ...(ownerOnly
        ? { ownerId: userId }
        : {
            OR: [
              {
                watchers: {
                  some: {
                    watcherId: userId,
                  },
                },
              },
              {
                ownerId: userId,
              },
            ],
          }),
    },
  });

  if (!watchlist) {
    return null;
  }

  // Prisma's returned data structure isn't very easy to work with to display data,
  // so we map it into a better structure
  const { _count, ...watchlistData } = watchlist;
  const enhancedWatchables = watchlistData.watchables.map(enhanceWatchlistWatchable);
  const sortedWatchables = [...enhancedWatchables].sort((a, b) => a.id.localeCompare(b.id));
  const mappedWatchList = {
    ...watchlistData,
    isOwner: watchlist.ownerId === userId,
    memberCount: _count.watchers,
    watchableCount: _count.watchables,
    watchables: sortedWatchables,
  };

  return mappedWatchList;
};
