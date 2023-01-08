import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { TMDBEntryTypes } from '../tmdb/models';
import { enhanceWatchlistWatchable } from './queries';

export const zWatchListAddEntry = z.object({
  id: z.string().or(z.number()).transform(String),
  type: z.enum(TMDBEntryTypes),
});

type WatchListAddEntry = z.infer<typeof zWatchListAddEntry> & {
  rating: number;
  name: string;
};

export const addEntryToWatchlist = async (watchlistId: string, entry: WatchListAddEntry, prisma: PrismaClient) => {
  const result = await prisma.watchlist.update({
    where: {
      id: watchlistId,
    },
    include: {
      watchables: {
        where: {
          watchable: {
            externalId: entry.id,
          },
        },
        include: {
          watchable: true,
        },
      },
    },
    data: {
      watchables: {
        create: {
          watchable: {
            connectOrCreate: {
              where: {
                source_externalId_type: {
                  externalId: entry.id,
                  source: 'TMDB',
                  type: entry.type,
                },
              },
              create: {
                name: entry.name,
                rating: entry.rating.toPrecision(2),
                externalId: entry.id,
                type: entry.type,
                source: 'TMDB',
              },
            },
          },
        },
      },
    },
  });

  const [watchableResult] = result.watchables.map(enhanceWatchlistWatchable);

  return watchableResult;
};
