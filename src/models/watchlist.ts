import { z } from 'zod';

export const createWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
});

export const editWatchlistSchema = {
  name: z.string().min(1).max(100).optional(),
  isVisibleToPublic: z.boolean().optional(),
};

export const watchlistEntryFilterSchema = {
  type: z.enum(['MOVIE', 'TV_SHOW']).optional(),
  sort: z
    .object({
      by: z.enum(['rating', 'name', 'seenAt']),
      order: z.enum(['asc', 'desc']),
    })
    .optional(),
};
