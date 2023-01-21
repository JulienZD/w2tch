import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

type RouterPushArgs = Parameters<ReturnType<typeof useRouter>['push']>;

export const useRedirectIfAuth = (...routerPushArgs: RouterPushArgs) => {
  const { status } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      push(...routerPushArgs).catch(() => void 0);
    }
  }, [status, push, routerPushArgs]);
};
