import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { type PropsWithChildren } from 'react';
import { TemporaryAccountAlert } from '../auth/TemporaryAccountAlert';
import { AccountRequiredGuard } from './AccountRequiredGuard';
import { Header } from './Header';

const isSpecialPage = (path: string) => ['/', '/login', '/signup'].includes(path);

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { asPath: path } = useRouter();
  const accountRequired = !isSpecialPage(path);
  const isHomePage = path === '/';
  const { status } = useSession();

  // TODO: Store and retrieve account expiry date
  const accountExpiryDate = new Date(2022, 11, 31); /*data?.user?.temporaryAccountExpiresOn*/
  const bannerVisible = false; // accountRequired && !!accountExpiryDate;

  return (
    <div className={`h-full ${accountRequired ? 'overflow-hidden' : ''}`}>
      <AccountRequiredGuard />

      {bannerVisible && (
        <div className="container fixed bottom-4 left-0 right-0 z-50 mx-auto max-w-4xl px-2 md:px-0">
          <TemporaryAccountAlert temporaryAccountExpiresOn={accountExpiryDate} />
        </div>
      )}

      <div
        className={`container relative h-full px-2 md:px-0 ${isHomePage ? '' : 'max-w-none md:mx-auto md:max-w-3xl'}`}
      >
        <Header visible={status === 'authenticated' && !isHomePage} />

        <main className={`${isHomePage ? '' : 'h-full pt-4 md:pt-32'} ${bannerVisible ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>
    </div>

    // Modal portal
  );
};
