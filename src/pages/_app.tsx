import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';
import * as Sentry from '@sentry/nextjs';
import NiceModal from '@ebay/nice-modal-react';

import { api } from '../utils/api';

import '../styles/globals.css';
import { Layout } from '~/components/ui/Layout';
import { ThemeContextProvider } from '~/contexts/ThemeProvider';
import { NavigationProgress } from '~/components/ui/NavigationProgress';
import { SEO } from '~/components/common/SEO';
import { hasSSRSeoProps } from '~/utils/seo';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  if (session) {
    Sentry.setUser({ id: session.user.id, username: session.user.name });
  }
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ThemeContextProvider>
        <NiceModal.Provider>
          <Layout>
            {hasSSRSeoProps(pageProps) && <SEO {...pageProps.seo} />}
            <NavigationProgress />
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

export default api.withTRPC(MyApp);
