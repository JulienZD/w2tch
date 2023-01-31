import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { env } from '~/env/client.mjs';

const About: NextPage = () => {
  const { status } = useSession();
  return (
    <div className="prose">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="mb-0">About</h1>

        {status === 'unauthenticated' && (
          <Link href="/" className="btn-link btn no-underline">
            Home
          </Link>
        )}
      </div>

      <h2>Source code</h2>
      <section>
        <p>
          {env.NEXT_PUBLIC_APP_NAME} was made by{' '}
          <Link href="https://jzd.me" className="text-primary" rel="noreferrer" target="_blank">
            Julien
          </Link>{' '}
          , the source code can be found on{' '}
          <Link href={env.NEXT_PUBLIC_REPOSITORY} className="text-primary" rel="noreferrer" target="_blank">
            GitHub
          </Link>
          .
        </p>
        <p>
          The stack consists of{' '}
          <Link href="https://nextjs.org" className="text-primary" rel="noreferrer" target="_blank">
            Next.js
          </Link>
          ,{' '}
          <Link href="https://tailwindcss.com" className="text-primary" rel="noreferrer" target="_blank">
            Tailwind CSS
          </Link>
          , and{' '}
          <Link href="https://trpc.io" className="text-primary" rel="noreferrer" target="_blank">
            tRPC
          </Link>
          .
        </p>
      </section>

      <h2 id="tmdb" className="mb-2">
        Movie and TV data
      </h2>
      <section className="flex gap-x-8 max-md:flex-col md:items-center">
        <div>
          <p>
            The data used in {env.NEXT_PUBLIC_APP_NAME} is provided by{' '}
            <Link href="https://themoviedb.org" className="text-primary" rel="noreferrer" target="_blank">
              The Movie Database
            </Link>{' '}
            (TMDB). This includes movie and TV show posters, descriptions, and more.
          </p>
          <p className="mt-2 italic">
            {env.NEXT_PUBLIC_APP_NAME} uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
        <Link href="https://themoviedb.org" rel="noreferrer" target="_blank">
          <Image width={160} height={160} src="/tmdb.svg" alt="" />
        </Link>
      </section>
    </div>
  );
};

export default About;
