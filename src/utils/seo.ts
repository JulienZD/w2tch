import { z } from 'zod';

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
