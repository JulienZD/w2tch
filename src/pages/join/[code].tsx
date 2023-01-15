import type { NextPage, InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { WithSEOProps } from '~/types/ssr';
import { createSSGHelper } from '~/utils/ssg';
import { trpc } from '~/utils/trpc';

const WatchlistInviteByCode: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  code,
  invitee,
  watchlistName,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const join = trpc.invite.join.useMutation({
    onSuccess: ({ watchlistId }) => {
      return router.push(`/watchlist/${watchlistId}`);
    },
  });

  return (
    <div className="prose mx-0 grid h-screen max-w-none place-content-center px-0">
      <h1>You have been invited!</h1>
      <p>
        {invitee} invited you to join &apos;{watchlistName}&apos;
      </p>
      {join.error && <p className="text-red-500">Failed to accept invite: {join.error.message}</p>}
      {session ? (
        <button className={`btn-primary btn ${join.isLoading ? 'loading' : ''}`} onClick={() => join.mutate({ code })}>
          Accept invite
        </button>
      ) : (
        <p>
          <Link
            href={{
              pathname: '/login',
              query: {
                returnUrl: router.asPath,
              },
            }}
          >
            Sign in
          </Link>{' '}
          to accept the invite
        </p>
      )}
    </div>
  );
};

export default WatchlistInviteByCode;

export const getServerSideProps: GetServerSideProps<
  WithSEOProps<{ code: string; watchlistName: string; invitee: string }>
> = async (ctx) => {
  const { ssg } = await createSSGHelper(ctx);
  const inviteCode = ctx.params?.code;

  if (typeof inviteCode !== 'string') {
    return {
      notFound: true,
    };
  }

  const invite = await ssg.invite.byCode.fetch({ code: inviteCode });
  if (!invite) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      code: inviteCode,
      invitee: invite.invitee,
      watchlistName: invite.watchlistName,
      seo: {
        title: "You've been invited!",
        description: `${invite.invitee ?? ''} invited you to join their watchlist, '${invite.watchlistName}'`,
      },
    },
  };
};
