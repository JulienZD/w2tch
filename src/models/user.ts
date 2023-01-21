import { z } from 'zod';

export const profileSchema = {
  name: z.string().min(3).max(24),
};
