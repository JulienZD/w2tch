import { type NextPage } from 'next';

const Home: NextPage = () => {
  const user = {} as { name: string };
  const tagline = 'tagline';
  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content">
          <div className="max-w-xs sm:max-w-xl">
            <h1 className="font-bolder text-3xl sm:text-5xl">
              Create <span className="text-gradient from-red-500 to-emerald-500">Movie Watchlists</span> with ease
            </h1>
            <div className="py-6">
              {user ? (
                <p>Welcome back, {user.name}</p>
              ) : (
                <>
                  <p>{tagline}</p>
                  <p className="mt-2">No account required.</p>
                </>
              )}
            </div>
            {user ? (
              <a className="btn-primary btn mt-2" href="/overview">
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
