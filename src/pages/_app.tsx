import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

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
          </Layout>
        </NiceModal.Provider>
      </ThemeContextProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
