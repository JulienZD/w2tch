import type { NextPage } from 'next';
import Link from 'next/link';

const NotFound: NextPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col">
        <h1>Page not found</h1>
        <Link href="/" className="link-primary mt-4 text-center">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
