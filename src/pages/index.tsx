import { type NextPage } from 'next';
import { useSession } from 'next-auth/react';
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
              Create <span className="text-gradient from-indigo-300 to-red-400">Movie Watchlists</span> with ease
            </h1>
            <div className="py-6">
              {session ? (
                <p>Welcome back, {session.user?.name}!</p>
              ) : (
                <>
                  <p>Create, manage, and share movie watch lists with your friends.</p>
                  <p className="mt-2">No account required.</p>
                </>
              )}
            </div>
            {session ? (
              <a className="btn-primary btn mt-2" href="/dashboard">
                To my watch lists
              </a>
            ) : (
              <>
                <a className="btn-primary btn" href="/new">
                  Get started
                </a>
                <p className="mt-2 text-sm">
                  Already have an account?{' '}
                  <a className="link-primary" href="/login">
                    Login
                  </a>
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
