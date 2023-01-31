import { useRouter } from 'next/router';
import { useState } from 'react';
import type { z } from 'zod';
import { zQueryParams } from '~/models/queryParams';
import { isPrimitive } from '~/utils/validation';

type UseQueryParamsArgs<T extends z.ZodObject<z.ZodRawShape>> = {
  schema: T;
  fallback?: z.infer<T>;
};

/**
 * A hook to get and update multiple query params with Zod validation.
 *
 * The update function will only update the query params that are defined in the schema.
 * Passing `undefined` as the value will remove all query params that are defined in the schema.
 *
 * If you want to update a query param that is not defined in the schema, use `useQueryParam` instead.
 *
 * @param options.schema A Zod schema to validate the query params against
 * @param options.fallback The fallback value to use if the query params are invalid
 * @returns The value of the query params, and a function to update the query params
 */
export const useQueryParams = <T extends z.ZodObject<z.ZodRawShape>>({
  schema,
  fallback = {},
}: UseQueryParamsArgs<T>) => {
  const router = useRouter();

  const [rawQueryParams, setRawQueryParams] = useState<z.infer<T>>(() => {
    return parseRawQueryParams(router.query, schema, fallback);
  });

  const updateQueryParams = (newQueryParams: z.infer<T> | undefined) => {
    const newQuery = {
      ...router.query,
      ...Object.fromEntries(
        Object.entries(newQueryParams ?? {}).map(([k, v]) => {
          return [k, isPrimitive(v) ? v : JSON.stringify(v)];
        })
      ),
    };

    // If we're clearing all query params, remove all params in the schema from the URL
    if (!newQueryParams) {
      Object.keys(schema.shape).forEach((key) => delete newQuery[key]);
    }

    router.push({ query: newQuery }, undefined, { shallow: true }).catch(() => undefined);

    setRawQueryParams((current) => {
      // Strip out any query params that are no longer defined in the schema
      Object.keys(current)
        .filter((key) => newQuery[key] === undefined)
        .forEach((key) => delete current[key]);

      return { ...current, ...newQuery };
    });
  };

  return {
    queryParams: parseRawQueryParams(rawQueryParams, schema, fallback),
    setQueryParams: updateQueryParams,
  };
};

const parseRawQueryParams = <T extends z.ZodObject<z.ZodRawShape>>(
  queryParams: Record<string, unknown>,
  schema: T,
  fallback: z.infer<T>
) => {
  const parsedQuery = zQueryParams.catch(() => fallback).parse(queryParams);

  return schema
    .partial()
    .catch(() => fallback)
    .parse(parsedQuery) as z.infer<T>;
};
