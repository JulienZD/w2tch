import type { User } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { profileSchema } from '~/models/user';
import { trpc } from '~/utils/trpc';
import { useTrpcForm } from '~/hooks/useTrpcForm';

const zAccountInfo = z.object(profileSchema);
//  signupSchema.pick({ name: true, password: true }).extend({
//   currentPassword: z.string(),
// });

type AccountSettingsFormProps = {
  user: User;
};

const hasUserDataChanged = (data: z.infer<typeof zAccountInfo>, user: User) => {
  return Object.keys(data)
    .filter((field) => field in user)
    .some((field) => data[field as keyof typeof data] !== user[field as keyof User]);
};

export const AccountSettingsForm: React.FC<AccountSettingsFormProps> = ({ user }) => {
  const updateAccount = trpc.me.updateAccount.useMutation({
    onSuccess: async (_, updated) => {
      await signIn('update-user', { user: { ...user, ...updated }, redirect: false });
    },
  });

  const { form, errors } = useTrpcForm({
    schema: zAccountInfo,
    defaultValues: {
      name: user.name,
      email: user.email ?? '',
      // password: '',
      // currentPassword: '',
    },
    mutation: updateAccount,
  });

  errors.email ??= updateAccount.error?.data?.code === 'CONFLICT' ? 'This email is already in use' : undefined;

  const handleSubmit = form.handleSubmit((data) => {
    if (!hasUserDataChanged(data, user)) {
      return;
    }

    updateAccount.mutate(data);
  });

  return (
    <>
      <h2 className="my-0 text-xl">Profile</h2>
      <p className="mb-2">This information is displayed publicly.</p>
      <form onSubmit={handleSubmit} className="max-w-sm">
        <div className="form-control">
          <label htmlFor="name">Username</label>
          <input className="input" id="name" {...form.register('name')} />
          {errors.name && <p className="my-0 text-sm text-error">{errors.name}</p>}
        </div>

        <h2 className="mb-0 mt-8 text-xl">Account</h2>
        <p className="mb-2">This information is only visible to you.</p>

        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" {...form.register('email')} />
          {errors.email && <p className="my-0 text-sm text-error">{errors.email}</p>}
        </div>

        {/* <h2 className="text-xl">Security</h2>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" type="password" {...form.register('password')} />
        </div>

        <div className="form-control">
          <label htmlFor="currentPassword">Current Password</label>
          <input className="input" id="currentPassword" type="currentPassword" {...form.register('currentPassword')} />
        </div> */}

        <button type="submit" className={`btn-primary btn mt-4 ${updateAccount.isLoading ? 'loading' : ''}`}>
          Update
        </button>
      </form>
    </>
  );
};
