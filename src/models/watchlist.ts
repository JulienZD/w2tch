import { z } from 'zod';

export const createWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
});
