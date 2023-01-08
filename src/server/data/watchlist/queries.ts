import type { PrismaClient, Movie, MoviesOnWatchlists } from '@prisma/client';

export const enhanceWatchlistMovie = ({
  seenOn,
  movie,
}: MoviesOnWatchlists & {
  movie: Movie;
}) => ({
  ...movie,
  rating: movie.rating?.toNumber(),
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
          movies: true,
        },
      },
    },
  });

  return watchlists.map(({ _count, ...watchlist }) => ({
    ...watchlist,
    isOwner: watchlist.ownerId === userId,
    memberCount: _count.watchers,
    movieCount: _count.movies,
  }));
};

export const getWatchlistById = async (id: string, userId: string, prisma: PrismaClient) => {
  const watchlist = await prisma.watchlist.findFirst({
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      movies: {
        include: {
          movie: {
            select: {
              name: true,
              id: true,
              externalId: true,
              rating: true,
              source: true,
            },
          },
        },
      },
      _count: {
        select: {
          watchers: true,
          movies: true,
        },
      },
    },
    where: {
      id,
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
    },
  });

  if (!watchlist) {
    return null;
  }

  // Prisma's returned data structure isn't very easy to work with to display data,
  // so we map it into a better structure
  const { _count, ...watchlistData } = watchlist;
  const enhancedMovies = watchlistData.movies.map(enhanceWatchlistMovie);
  const sortedMovies = [...enhancedMovies].sort((a, b) => a.id.localeCompare(b.id));
  const mappedWatchList = {
    ...watchlistData,
    isOwner: watchlist.ownerId === userId,
    memberCount: _count.watchers,
    movieCount: _count.movies,
    movies: sortedMovies,
  };

  return mappedWatchList;
};
