import { ClockIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';

const formatOptions = {
  style: 'unit',
  unitDisplay: 'narrow',
} satisfies Intl.NumberFormatOptions;

const hourFormatter = new Intl.NumberFormat(undefined, { ...formatOptions, unit: 'hour' });
const minuteFormatter = new Intl.NumberFormat(undefined, {
  ...formatOptions,
  unit: 'minute',
  minimumIntegerDigits: 2,
});

interface RuntimeProps {
  minutes?: number | null;
}

export const Runtime: React.FC<RuntimeProps> = ({ minutes: _runtimeInMinutes }) => {
  const runtimeInMinutes = _runtimeInMinutes ?? 0;

  const { hours, minutes } = useMemo(() => {
    const hours = Math.floor(runtimeInMinutes / 60);
    const minutes = runtimeInMinutes % 60;

    return {
      hours: hourFormatter.format(hours),
      minutes: minuteFormatter.format(minutes),
    };
  }, [runtimeInMinutes]);

  const runtimeText = runtimeInMinutes === 0 ? 'Unknown' : runtimeInMinutes > 60 ? `${hours} ${minutes}` : minutes;
  return (
    <span className="flex select-none items-center gap-x-1">
      <ClockIcon className="h-4 w-4 stroke-current" />
      <span>{runtimeText}</span>
    </span>
  );
};
