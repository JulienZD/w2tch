import type { UseTRPCMutationResult } from '@trpc/react-query/shared';
import type { FieldErrorsImpl } from 'react-hook-form';
import type { z } from 'zod';

export const getFormOrMutationError = <TFormErrors extends FormErrors, TMutation extends TRPCMutationWithZodError>(
  field: keyof NonNullable<TMutation['variables']> & keyof TFormErrors,
  errors: TFormErrors,
  mutation?: TMutation
) => {
  const _field = field as string;
  return errors[_field]?.message ?? mutation?.error?.data?.zodError?.fieldErrors?.[_field];
};

type FormErrors = Partial<
  FieldErrorsImpl<{
    [x: string]: unknown;
  }>
>;

type TRPCMutationWithZodError = UseTRPCMutationResult<
  unknown,
  { data?: { zodError?: z.typeToFlattenedError<Record<string, unknown>> | null } | null },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  unknown
>;
