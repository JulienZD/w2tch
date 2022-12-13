import { env } from '~/env/client.mjs';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
}

const appName = env.NEXT_PUBLIC_APP_NAME;

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  title ??= appName;
  const pageTitle = title === appName ? title : `${title} | ${appName}`;
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
    </Head>
  );
};
