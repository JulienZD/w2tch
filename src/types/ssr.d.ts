import type { z } from 'zod';
import type { zSEOProps } from '~/utils/seo';

export type WithSEOProps<T extends Record<string, unknown>, Optional extends boolean = false> = T &
  (Optional extends true ? Partial<z.infer<typeof zSEOProps>> : z.infer<typeof zSEOProps>);
