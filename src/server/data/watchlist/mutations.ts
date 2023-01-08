import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { enhanceWatchlistMovie } from './queries';

export const zWatchListAddMovie = z.object({
  id: z.string().or(z.number()).transform(String),
  title: z.string().min(1),
  rating: z.number().min(0).max(10).nullable(),
});

export type WatchListAddMovie = z.infer<typeof zWatchListAddMovie>;

export const addMovieToWatchlist = async (watchlistId: string, movie: WatchListAddMovie, prisma: PrismaClient) => {
  const result = await prisma.watchlist.update({
    where: {
      id: watchlistId,
    },
    include: {
      movies: {
        where: {
          movie: {
            externalId: movie.id,
          },
        },
        include: {
          movie: true,
        },
      },
    },
    data: {
      movies: {
        create: {
          movie: {
            connectOrCreate: {
              where: {
                source_externalId: {
                  externalId: movie.id,
                  source: 'TMDB',
                },
              },
              create: {
                name: movie.title,
                rating: movie.rating,
                externalId: movie.id,
                source: 'TMDB',
              },
            },
          },
        },
      },
    },
  });

  const [movieResult] = result.movies.map(enhanceWatchlistMovie);

  return movieResult;
};
