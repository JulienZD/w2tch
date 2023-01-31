import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import { isPrimitive, zPrimitive, zStringifiedJson } from '~/utils/validation';

const zQueryParam = z.union([zStringifiedJson, zPrimitive.array(), zPrimitive]).optional();

type UseQueryParamArgs<T extends z.ZodSchema> = {
  schema: T;
  fallback?: z.infer<T>;
};

/**
 * A hook to get and update a query param with Zod validation
 *
 * @param key The query param key
 * @param options.schema A Zod schema to validate the query param against
 * @param options.fallback The fallback value to use if the query param is invalid
 * @returns The value of the query param, and a function to update the query param
 */
export const useQueryParam = <T extends z.ZodSchema, R extends z.infer<T> | undefined = z.infer<T> | undefined>(
  key: string,
  { schema, fallback }: UseQueryParamArgs<T>
): [R, (value: R) => void] => {
  const router = useRouter();

  const [value, setValue] = useState<R>((): R => {
    const value = router.query[key];

    const parseResult = zQueryParam.safeParse(value);
    if (!parseResult.success) {
      console.warn(`Invalid query param for key ${key}: ${String(value)}`);
      return fallback as R;
    }

    const safeValueResult = schema.optional().safeParse(parseResult.data);

    return (safeValueResult.success ? safeValueResult.data : fallback) as R;
  });

  const updateQueryParam = (value: R) => {
    const newQuery = {
      ...router.query,
      [key]: isPrimitive(value) ? value : JSON.stringify(value),
    };

    if (!value) {
      delete newQuery[key];
    }

    router.push({ query: newQuery }, undefined, { shallow: true }).catch(() => undefined);

    setValue(value);
  };

  return [value, updateQueryParam];
};
