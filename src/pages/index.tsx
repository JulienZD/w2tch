import { type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SEO } from '~/components/common/SEO';

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <SEO />
      <div className="hero min-h-screen">
        <div className="hero-content">
          <div className="max-w-xs sm:max-w-xl">
            <h1 className="font-bolder text-3xl sm:text-5xl">
              Create <span className="text-gradient from-indigo-300 to-red-400">Watchlists</span> with ease
            </h1>
            <div className="py-6">
              {session ? (
                <p>Welcome back, {session.user.name}!</p>
              ) : (
                <p>Create, manage, and share watchlists with your friends.</p>
              )}
            </div>
            {session ? (
              <Link className="btn-primary btn mt-2" href="/dashboard">
                My watchlists
              </Link>
            ) : (
              <>
                <Link className="btn-primary btn" href="/signup">
                  Get started
                </Link>
                <p className="mt-2 text-sm">
                  Already have an account?{' '}
                  <Link className="link-primary" href="/login">
                    Login
                  </Link>
                </p>
              </>
            )}
          </div>
          <div className="hidden w-56 sm:block" />
        </div>
      </div>
    </>
  );
};

export default Home;
