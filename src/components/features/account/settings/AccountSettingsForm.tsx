import type { User } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { profileSchema } from '~/models/user';
import { trpc } from '~/utils/trpc';
import { useTrpcForm } from '~/hooks/useTrpcForm';

const zAccountInfo = z
  .object({
    ...profileSchema,
    password: profileSchema.password
      .or(z.string().length(0))
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
    currentPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !!data.password === !!data.confirmPassword, {
    message: 'Password and confirmation must be provided together',
    path: ['confirmPassword'],
  })
  .refine((data) => data.password === undefined || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => (!data.password && !data.confirmPassword) || !!data.currentPassword?.length, {
    message: 'Current password is required when changing password',
    path: ['currentPassword'],
  })
  .refine((data) => !data.currentPassword || !!data.password?.length, {
    message: 'Enter a new password',
    path: ['password'],
  })
  .refine((data) => (!data.password && !data.currentPassword) || data.password !== data.currentPassword, {
    message: "New password can't match current password",
    path: ['currentPassword'],
  });

type AccountSettingsFormProps = {
  user: User;
};

const hasUserDataChanged = (data: z.infer<typeof zAccountInfo>, user: User) => {
  return Object.keys(data)
    .filter((field) => field in user)
    .some((field) => data[field as keyof typeof data] !== user[field as keyof User]);
};

export const AccountSettingsForm: React.FC<AccountSettingsFormProps> = ({ user }) => {
  const trpcUtil = trpc.useContext();
  const updateAccount = trpc.me.updateAccount.useMutation({
    onSuccess: async (_, updated) => {
      await signIn('update-user', { user: updated, redirect: false });
      await trpcUtil.me.settings.invalidate();

      form.reset({
        password: '',
        confirmPassword: '',
        currentPassword: '',
      });
    },
  });

  const { form, errors } = useTrpcForm({
    schema: zAccountInfo,
    defaultValues: {
      name: user.name,
      email: user.email ?? '',
    },
    mutation: updateAccount,
  });

  if (updateAccount.error?.data?.code === 'CONFLICT') {
    errors.email ??= 'This email is already in use';
  }

  const handleSubmit = form.handleSubmit((data) => {
    if (!hasUserDataChanged(data, user)) {
      return;
    }

    updateAccount.mutate(data);
  });

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-sm">
        <div className="form-control">
          <label htmlFor="name">Username</label>
          <input className="input" id="name" {...form.register('name')} />
          {errors.name && <p className="my-0 text-sm text-error">{errors.name}</p>}
        </div>

        <div className="form-control mt-8">
          <label htmlFor="email">
            Email <span className="align-middle text-sm">(Not shown to others)</span>
          </label>
          <input className="input" id="email" {...form.register('email')} />
          {errors.email && <p className="my-0 text-sm text-error">{errors.email}</p>}
        </div>

        <div className="form-control mt-8">
          <label htmlFor="currentPassword">Current Password</label>
          <input className="input" id="currentPassword" type="password" {...form.register('currentPassword')} />
        </div>
        {errors.currentPassword && <p className="my-0 text-sm text-error">{errors.currentPassword}</p>}

        <div className="form-control mt-4">
          <label htmlFor="password">New Password</label>
          <input className="input" id="password" type="password" {...form.register('password')} />
        </div>
        {errors.password && <p className="my-0 text-sm text-error">{errors.password}</p>}

        <div className="form-control mt-2">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input className="input" id="confirmPassword" type="password" {...form.register('confirmPassword')} />
        </div>
        {errors.confirmPassword && <p className="my-0 text-sm text-error">{errors.confirmPassword}</p>}

        <button type="submit" className={`btn-primary btn mt-8 ${updateAccount.isLoading ? 'loading' : ''}`}>
          Save account settings
        </button>
      </form>
    </>
  );
};
