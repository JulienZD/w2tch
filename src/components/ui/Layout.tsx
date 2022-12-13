import { useSession } from 'next-auth/react';
import type { PropsWithChildren } from 'react';
import { AccountRequiredGuard } from './AccountRequiredGuard';
import { Header } from './Header';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  // todo: determine actual values
  const accountRequired = false;
  const isHomePage = true;
  const { status } = useSession();

  return (
    <div className={`h-full ${accountRequired ? 'overflow-hidden' : ''}`}>
      <AccountRequiredGuard />

      <div
        className={`container relative h-full px-2 md:px-0 ${isHomePage ? '' : 'max-w-none md:mx-auto md:max-w-3xl'}`}
      >
        <Header visible={status === 'authenticated' && !isHomePage} />
      </div>

      <main className={`${isHomePage ? '' : 'h-full pt-4 md:pt-32'}`} /*todo: pb-20 if showTempAccountBanner */>
        {children}
      </main>
    </div>

    // Modal portal
  );
};
