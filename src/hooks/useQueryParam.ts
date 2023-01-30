import { useRouter } from 'next/router';
import { useState } from 'react';

export const useQueryParam = <T extends string | undefined>(key: string, defaultValue?: T): [T, (value: T) => void] => {
  const router = useRouter();

  const [value, setValue] = useState<T>((): T => {
    const value = router.query[key];

    if (Array.isArray(value) && !!value.length) {
      return value[0] as T;
    }

    return (value ?? defaultValue) as T;
  });

  const updateQueryParam = (value: T | undefined) => {
    if (value) {
      router
        .push(
          {
            query: {
              ...router.query,
              [key]: value,
            },
          },
          undefined,
          { shallow: true }
        )
        .catch(() => undefined);
    } else {
      const { [key]: _, ...query } = router.query;

      router
        .push(
          {
            query,
          },
          undefined,
          { shallow: true }
        )
        .catch(() => undefined);
    }
    setValue(value as T);
  };

  return [value, updateQueryParam];
};
