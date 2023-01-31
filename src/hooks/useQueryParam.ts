import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';

const isPrimitive = (value: unknown): value is string | number | boolean | undefined => {
  return value === null || value === undefined || (typeof value !== 'object' && typeof value !== 'function');
};

const zPrimitive = z.union([z.string(), z.number(), z.boolean()]);
const zStringifiedJson = z.preprocess((v) => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch (err) {
    return v;
  }
}, z.record(zPrimitive));
const zQueryParam = z.union([zStringifiedJson, zPrimitive.array(), zPrimitive]).optional();

export const useQueryParam = <T extends string | Record<string, unknown> | boolean | number | undefined>(
  key: string,
  defaultValue?: T
): [T, (value: T) => void] => {
  const router = useRouter();

  const [value, setValue] = useState<T>((): T => {
    const value = router.query[key];

    const parseResult = zQueryParam.safeParse(value);
    if (!parseResult.success) {
      console.warn(`Invalid query param for key ${key}: ${String(value)}`);
      return defaultValue as T;
    }

    return parseResult.data as T;
  });

  const updateQueryParam = (value: T | undefined) => {
    if (value) {
      router
        .push(
          {
            query: {
              ...router.query,
              [key]: isPrimitive(value) ? value : JSON.stringify(value),
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
