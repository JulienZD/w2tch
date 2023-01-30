import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { env } from '~/env/client.mjs';

const About: NextPage = () => {
  return (
    <div className="prose">
      <h1>About</h1>

      <h2 className="mb-2">Movie and TV data</h2>
      <section className="flex gap-x-8 max-md:flex-col md:items-center">
        <p>
          The data used in {env.NEXT_PUBLIC_APP_NAME} is provided by{' '}
          <Link href="https://themoviedb.org" className="text-primary" rel="noreferrer" target="_blank">
            The Movie Database
          </Link>{' '}
          (TMDB). This includes movie and TV show posters, descriptions, and more.
          <p className="mt-2 italic">
            {env.NEXT_PUBLIC_APP_NAME} uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </p>
        <Link href="https://themoviedb.org" rel="noreferrer" target="_blank">
          <Image width={160} height={160} src="/tmdb.svg" alt="" />
        </Link>
      </section>
    </div>
  );
};

export default About;
