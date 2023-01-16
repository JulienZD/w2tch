import { shortEnglishHumanizer } from '~/utils/humanizeDuration';
import type { RouterOutputs } from '~/utils/trpc';

interface InvitesTableProps {
  invites: NonNullable<RouterOutputs['watchlist']['invitesById']>;
  rows?: number;
}

export const InvitesTable: React.FC<InvitesTableProps> = ({ invites, rows = invites.length }) => {
  return (
    <div className="mt-4">
      <div className="mb-2 text-sm font-medium text-base-content">Existing invites:</div>
      <div className="flex flex-col gap-y-2">
        <table className="table-transparent table table-fixed">
          <thead className="w-full table-fixed" style={{ display: 'table' }}>
            <th>Code</th>
            <th>Uses</th>
            <th>Expires</th>
          </thead>
          <tbody
            style={
              rows !== invites.length
                ? {
                    display: 'block',
                    maxHeight: `${rows * 3.5}rem`, // each row is 3.5rem tall
                    overflowY: 'auto',
                    tableLayout: 'fixed',
                  }
                : undefined
            }
          >
            {invites.map((invite) => {
              const timeDiff = (invite.validUntil?.getTime() || Date.now()) - Date.now();

              const timeUntilExpiry = shortEnglishHumanizer(timeDiff, {
                round: true,
                units: ['w', 'd', 'h', 'm'],
                largest: 1,
                spacer: '',
              });

              return (
                <tr key={invite.code} className="h-[3.5rem] w-full table-fixed" style={{ display: 'table' }}>
                  <td className="text-xs md:text-base">{invite.code}</td>
                  <td className="text-sm md:text-base">
                    {invite.hasUnlimitedUsages ? '∞' : `${invite.uses} / ${invite.maxUses as number}`}
                  </td>
                  <td className="text-sm md:text-base">{invite.validUntil ? timeUntilExpiry : '∞'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
