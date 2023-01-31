import type { NiceModalHandler } from '@ebay/nice-modal-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useCloseModalOnNavigate = (modal: NiceModalHandler) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeComplete', modal.remove);

    return () => {
      router.events.off('routeChangeComplete', modal.remove);
    };
  }, [router, modal.remove]);
};
