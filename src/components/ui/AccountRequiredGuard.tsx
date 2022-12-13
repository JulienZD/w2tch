import { useRouter } from 'next/router';
import { useState } from 'react';
import { trpc } from '~/utils/trpc';

export const AccountRequiredGuard: React.FC = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const { asPath } = useRouter();
  // todo: replace with signin thing
  // const getMsg = trpc.auth.getSecretMessage.useQuery();

  const createAccount = async () => {
    // await getMsg.refetch();
  };

  if (!shouldShow) return null;

  return (
    <div className="absolute z-20 grid h-screen w-screen place-content-center bg-transparent backdrop-blur-md backdrop-filter">
      <div className="prose min-h-[12rem] w-[32rem] rounded bg-base-100 p-4">
        <h1 className="text-center">Account required</h1>
        <p>Hey there! You need an account to access this page.</p>
        <p>
          Already have one?{' '}
          <a href={`/login?returnUrl=${asPath}`} onClick={() => setShouldShow(false)} className="link-primary link">
            Login
          </a>
        </p>
        <p>
          <button onClick={createAccount} className="link-primary link">
            Get started
          </button>
          (no email required!)
        </p>
      </div>
    </div>
  );
};
