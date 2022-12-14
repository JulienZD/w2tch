import type { UseTRPCMutationResult } from '@trpc/react-query/shared';
import type { FieldErrorsImpl } from 'react-hook-form';
import type { z } from 'zod';

export const getFormOrMutationError = (field: string, errors: FormErrors, mutation?: TRPCMutationWithZodError) => {
  return errors[field]?.message ?? mutation?.error?.data?.zodError?.fieldErrors?.[field];
};

type FormErrors = Partial<
  FieldErrorsImpl<{
    [x: string]: unknown;
  }>
>;

type TRPCMutationWithZodError = UseTRPCMutationResult<
  boolean,
  { data?: { zodError?: z.typeToFlattenedError<Record<string, unknown>> | null } | null },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  unknown
>;
