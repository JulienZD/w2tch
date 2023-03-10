import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { type PropsWithChildren } from 'react';
import { TemporaryAccountAlert } from '../auth/TemporaryAccountAlert';
import { AccountRequiredGuard } from './AccountRequiredGuard';
import { Footer } from './Footer';
import { Header } from './Header';

const isPageWithoutHeader = (route: string) => ['/', '/login', '/signup'].includes(route);
const isCustomStyledPage = (route: string) => ['/', '/join/[code]'].includes(route);
const isSpecialPage = (route: string) => ['/', '/login', '/signup'].includes(route);

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { route } = useRouter();
  const accountRequired = !isSpecialPage(route);
  const isCustomPage = isCustomStyledPage(route);
  const { status } = useSession();

  // TODO: Store and retrieve account expiry date
  const accountExpiryDate = new Date(2022, 11, 31); /* data?.user?.temporaryAccountExpiresOn */
  const bannerVisible = false; // accountRequired && !!accountExpiryDate;

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <AccountRequiredGuard />

      {bannerVisible && (
        <div className="container fixed bottom-4 left-0 right-0 z-50 mx-auto max-w-4xl px-2 md:px-0">
          <TemporaryAccountAlert temporaryAccountExpiresOn={accountExpiryDate} />
        </div>
      )}

      <div className={`container relative px-2 md:px-0 ${isCustomPage ? '' : 'max-w-none md:mx-auto md:max-w-3xl'}`}>
        {!isPageWithoutHeader(route) && <Header visible={status === 'authenticated'} />}

        <main className={`${isCustomPage ? '' : 'min-h-full pt-12 md:pt-40'} ${bannerVisible ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>

      <Footer fixed={isCustomPage} />
    </div>
  );
};
