import { z } from 'zod';

export const createWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
});

export const editWatchlistSchema = {
  name: z.string().min(1).max(100).optional(),
  isVisibleToPublic: z.boolean().optional(),
};
