import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useRequiresAuth = () => {
  const { status, data } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      push('/login').catch(() => void 0);
    }
  }, [push, status]);

  return { user: data?.user };
};
