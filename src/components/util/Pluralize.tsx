import pluralize from 'pluralize';

interface PluralizeProps {
  word: string;
  count: number;
}

export const Pluralize: React.FC<PluralizeProps> = ({ word, count }) => (
  <span>
    {count} {pluralize(word, count)}
  </span>
);
