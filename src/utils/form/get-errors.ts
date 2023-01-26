import type { UseTRPCMutationResult } from '@trpc/react-query/shared';
import type { FieldErrorsImpl } from 'react-hook-form';
import type { z } from 'zod';

type ErrorKey<TFormErrors extends FormErrors, TMutation extends TRPCMutationWithZodError> = keyof NonNullable<
  TMutation['variables']
> &
  keyof TFormErrors;

export const getFormOrMutationError = <TFormErrors extends FormErrors, TMutation extends TRPCMutationWithZodError>(
  field: ErrorKey<TFormErrors, TMutation>,
  errors: TFormErrors,
  mutation?: TMutation
) => {
  const _field = field as string;
  return errors[_field]?.message ?? mutation?.error?.data?.zodError?.fieldErrors?.[_field];
};

export const getFormOrMutationErrors = <TFormErrors extends FormErrors, TMutation extends TRPCMutationWithZodError>(
  errors: TFormErrors,
  mutation?: TMutation
): Record<ErrorKey<TFormErrors, TMutation>, string | string[] | undefined> => {
  type _ErrorKey = ErrorKey<TFormErrors, TMutation>;
  const _errors = {} as Record<_ErrorKey, string | string[] | undefined>;
  Object.keys(errors).forEach((key) => {
    _errors[key as _ErrorKey] = getFormOrMutationError(key as _ErrorKey, errors, mutation);
  });

  if (!mutation?.error?.data?.zodError?.fieldErrors) return _errors;

  Object.keys(mutation.error.data.zodError.fieldErrors).forEach((key) => {
    _errors[key as _ErrorKey] = getFormOrMutationError(key as _ErrorKey, errors, mutation);
  });

  return _errors;
};

type FormErrors = Partial<FieldErrorsImpl<Record<string, unknown>>>;

type TRPCMutationWithZodError = UseTRPCMutationResult<
  unknown,
  { data?: { zodError?: z.typeToFlattenedError<Record<string, unknown>> | null } | null },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  unknown
>;
