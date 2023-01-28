import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps } from 'react-hook-form';
import type { z } from 'zod';
import { getFormOrMutationErrors, type TRPCMutationWithZodError } from '~/utils/form/get-errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTrpcForm = <ZSchema extends z.ZodSchema, TMutation extends TRPCMutationWithZodError<any>>({
  schema,
  mutation,
  ...formProps
}: { schema: ZSchema; mutation?: TMutation } & Omit<UseFormProps<z.infer<ZSchema>>, 'resolver'>) => {
  const { formState, ...form } = useForm<z.infer<ZSchema>>({
    resolver: zodResolver(schema),
    ...formProps,
  });

  const errors = getFormOrMutationErrors(formState.errors, mutation);

  return {
    form,
    errors,
  };
};
