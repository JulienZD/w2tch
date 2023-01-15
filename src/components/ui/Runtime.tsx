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
  minutes: number;
}

export const Runtime: React.FC<RuntimeProps> = ({ minutes: runtimeInMinutes }) => {
  const { hours, minutes } = useMemo(() => {
    const hours = Math.floor(runtimeInMinutes / 60);
    const minutes = runtimeInMinutes % 60;

    return {
      hours: hourFormatter.format(hours),
      minutes: minuteFormatter.format(minutes),
    };
  }, [runtimeInMinutes]);

  return (
    <span className="flex select-none items-center gap-x-1">
      <ClockIcon className="h-4 w-4 stroke-current" />
      <span>
        {runtimeInMinutes >= 60 && hours} {minutes}
      </span>
    </span>
  );
};
