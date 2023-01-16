import { ClockIcon } from '@heroicons/react/24/solid';
import humanizeDuration from 'humanize-duration';

export const TemporaryAccountAlert: React.FC<{ temporaryAccountExpiresOn: Date }> = ({ temporaryAccountExpiresOn }) => {
  const timeDiff = temporaryAccountExpiresOn.getTime() - new Date().getTime();

  const timeUntilTemporaryAccountExpires = humanizeDuration(timeDiff, {
    round: true,
    units: ['w', 'd', 'h', 'm'],
    largest: 1,
    conjunction: ' and ',
  });

  const shortTimeUntilTemporaryAccountExpires = humanizeDuration(timeDiff, {
    round: true,
    units: ['w', 'd', 'h', 'm'],
    largest: 1,
  });

  return (
    <div>
      <div className="alert alert-warning hidden shadow-lg md:block">
        <div>
          <ClockIcon />
          <div className="flex flex-col items-start">
            <div>
              <span className="font-semibold">Heads up!</span> You&apos;re using a temporary account. There{' '}
              {timeUntilTemporaryAccountExpires.startsWith('1 ') ? 'is' : 'are'} {timeUntilTemporaryAccountExpires} left
              until you lose access.
            </div>
            <div>
              <a className="link-primary" href="/signup">
                Create an account
              </a>{' '}
              <span>to prevent losing access to your data.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="alert alert-warning mx-auto max-w-xs shadow-lg md:hidden">
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-x-1.5">
            <ClockIcon />
            <div>
              <span className="font-semibold">{shortTimeUntilTemporaryAccountExpires}</span> remaining
            </div>
          </div>
          <a className="link-primary" href="/signup">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};
