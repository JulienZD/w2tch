import Link from 'next/link';

export const Footer: React.FC<{ fixed?: boolean }> = ({ fixed }) => {
  return (
    <footer className={fixed ? 'fixed bottom-2 mx-auto' : 'mt-4 pb-2'}>
      <ul className="flex w-full items-center gap-x-4 text-sm">
        <li>
          Made by{' '}
          <Link href="https://github.com/JulienZD/" className="text-primary" rel="noreferrer" target="_blank">
            Julien
          </Link>
        </li>

        <li>
          Data provided by{' '}
          <Link href="/about" className="text-primary">
            TMDB
          </Link>
        </li>
      </ul>
    </footer>
  );
};
