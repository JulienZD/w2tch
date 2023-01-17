import { Prisma, type PrismaClient, type Watchable, type WatchablesOnWatchlists } from '@prisma/client';

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
      OR: [
        {
          ownerId: userId,
        },
        {
          watchers: {
            some: {
              watcherId: userId,
            },
          },
        },
      ],
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

/**
 * `userId` is required if `allowVisibleToPublic` is `false` or `undefined`
 */
type GetWatchlistByIdArgs =
  | {
      id: string;
      ownerOnly?: boolean;
    } & (
      | {
          allowVisibleToPublic: true;
          userId?: string;
        }
      | {
          allowVisibleToPublic?: false;
          userId: string;
        }
    );

const defaultArgs = Prisma.validator<Prisma.WatchlistFindFirstArgs>()({
  include: {
    owner: {
      select: {
        name: true,
      },
    },
    watchers: {
      select: {
        watcherId: true,
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
});

export const getWatchlistById = async (
  { id, userId, allowVisibleToPublic = false, ownerOnly = false }: GetWatchlistByIdArgs,
  prisma: PrismaClient
) => {
  const memberArgs = !allowVisibleToPublic && {
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
  };

  const watchlist = await prisma.watchlist.findFirst({
    ...defaultArgs,
    where: {
      id,
      ...(ownerOnly ? { ownerId: userId } : memberArgs),
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
