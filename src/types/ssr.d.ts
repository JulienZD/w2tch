import type { z } from 'zod';
import type { zSEOProps } from '~/utils/seo';

export type WithSEOProps<T extends Record<string, unknown>> = T & z.infer<typeof zSEOProps>;
