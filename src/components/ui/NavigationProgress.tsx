import { useRouter } from 'next/router';

import NProgress from 'nprogress';
import { useEffect } from 'react';

// Some custom styles for NProgress are declared in `globals.css`
NProgress.configure({
  showSpinner: false,
  template:
    '<div class="fixed top-0 left-0 right-0 z-10"><div class="h-1 bg-gradient-to-r" role="bar" style="width: 100%;"><div class="peg"></div></div></div>',
});

export const NavigationProgress: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string, options?: { shallow?: boolean }) => {
      if (!options?.shallow && url !== router.asPath) {
        NProgress.start();
      }
    };

    const handleRouteChangeComplete = () => NProgress.done();
    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  return null;
};
