import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(3).max(24),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});
