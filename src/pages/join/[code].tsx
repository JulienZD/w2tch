import type { NextPage, InferGetServerSidePropsType, GetServerSideProps } from 'next';
import type { WithSEOProps } from '~/types/ssr';
import { createSSGHelper } from '~/utils/ssg';

const WatchlistInviteByCode: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  code,
  invitee,
  watchlistName,
}) => {
  return (
    <>
      <h1>Invite by code</h1>
      <p>Code: {code}</p>
      <p>Watchlist: {watchlistName}</p>
      <p>Invitee: {invitee}</p>
    </>
  );
};

export default WatchlistInviteByCode;

export const getServerSideProps: GetServerSideProps<
  WithSEOProps<{ code: string; watchlistName: string; invitee: string }>
> = async (ctx) => {
  const { ssg } = await createSSGHelper(ctx);
  const inviteCode = ctx.params?.code as string | undefined;

  if (!inviteCode) {
    return {
      notFound: true,
    };
  }

  const invite = await ssg.watchlist.inviteByCode.fetch({ code: inviteCode });
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
