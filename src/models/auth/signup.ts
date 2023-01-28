import { z } from 'zod';
import { profileSchema } from '../user';

export const signupSchema = z.object(profileSchema);
