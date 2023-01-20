import { z } from 'zod';
import { optionalObject } from './optionalObject';

export const zSEOProps = z
  .object({
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }),
  })
  .passthrough();

export const hasSSRSeoProps = (pageProps: unknown): pageProps is z.infer<typeof zSEOProps> => {
  const result = zSEOProps.safeParse(pageProps);
  return result.success;
};

export const optionalSeo = <T extends z.infer<typeof zSEOProps>['seo']>(condition: boolean, obj: T) =>
  optionalObject(condition, { seo: obj });
