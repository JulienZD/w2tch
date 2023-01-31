import type { IncomingMessage } from 'http';

/**
 * Whether the request is a client navigation request
 *
 * This can be used to determine whether to continue with performing operations in getServerSideProps
 *
 * https://github.com/vercel/next.js/discussions/19611#discussioncomment-972107
 */
export const isLoadedViaClientNavigation = (req?: IncomingMessage) => {
  return req?.url?.indexOf('/_next/data/') !== -1;
};
