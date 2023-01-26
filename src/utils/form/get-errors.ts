/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseTRPCMutationResult } from '@trpc/react-query/shared';
import type { FieldErrorsImpl } from 'react-hook-form';
import type { z } from 'zod';

type ErrorKey<TFormErrors extends FormErrors, TMutation extends TRPCMutationWithZodError<any>> =
  | keyof NonNullable<TMutation['variables']>
  | keyof TFormErrors;

type ErrorValue = string | string[] | undefined;

export const getFormOrMutationError = <TFormErrors extends FormErrors, TMutation extends TRPCMutationWithZodError<any>>(
  field: ErrorKey<TFormErrors, TMutation>,
  errors: TFormErrors,
  mutation?: TMutation
) => {
  const _field = field as string;
  return errors[_field]?.message ?? mutation?.error?.data?.zodError?.fieldErrors?.[_field];
};

/**
 * Get errors from form and mutation
 */
export const getFormOrMutationErrors = <
  TFormErrors extends FormErrors,
  TMutation extends TRPCMutationWithZodError<any>
>(
  errors: TFormErrors,
  mutation?: TMutation
): Partial<Record<ErrorKey<TFormErrors, TMutation>, ErrorValue>> => {
  type _ErrorKey = ErrorKey<TFormErrors, TMutation>;

  const formFields = Object.keys(errors) as _ErrorKey[];
  const mutationFields = Object.keys(mutation?.error?.data?.zodError?.fieldErrors ?? {}) as _ErrorKey[];

  return Object.fromEntries(
    [...formFields, ...mutationFields].map((key) => {
      return [key, getFormOrMutationError(key, errors, mutation)];
    })
  ) as Partial<Record<_ErrorKey, ErrorValue>>;
};

type FormErrors = Partial<FieldErrorsImpl<Record<string, unknown>>>;

export type TRPCMutationWithZodError<TVariables> = UseTRPCMutationResult<
  unknown,
  { data?: { zodError?: z.typeToFlattenedError<Record<string, unknown>> | null } | null },
  TVariables,
  unknown
>;
