interface SeenBadgeProps {
  seenOn: Date | null;
}

export const SeenBadge: React.FC<SeenBadgeProps> = ({ seenOn }) => (
  <div
    className={`badge min-w-[5rem] select-none ${seenOn ? 'badge-success' : 'badge-ghost'}`}
    title={seenOn?.toDateString()}
  >
    {seenOn ? 'Seen' : 'Unseen'}
  </div>
);
