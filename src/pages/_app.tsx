import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';

import { trpc } from '../utils/trpc';

import '../styles/globals.css';
import { Layout } from '~/components/ui/Layout';
import { ThemeContextProvider } from '~/contexts/ThemeProvider';
import NiceModal from '@ebay/nice-modal-react';
import { SEO } from '~/components/common/SEO';
import { hasSSRSeoProps } from '~/utils/seo';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <ThemeContextProvider>
        <NiceModal.Provider>
          <Layout>
            {hasSSRSeoProps(pageProps) && <SEO {...pageProps.seo} />}
            <Component {...pageProps} />
            <Analytics
              debug={process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production'}
              // Prevent analytics from running on preview deployments
              mode={process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'production' : 'development'}
            />
          </Layout>
        </NiceModal.Provider>
      </ThemeContextProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
