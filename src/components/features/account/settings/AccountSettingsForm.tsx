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
      // password: '',
      // currentPassword: '',
    },
    mutation: updateAccount,
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (data.name === user.name) return;

    updateAccount.mutate(data);
  });

  return (
    <>
      <h2 className="my-0 text-xl">Profile</h2>
      <p>This information is displayed publicly.</p>
      <form onSubmit={handleSubmit} className="max-w-sm">
        <div className="form-control">
          <label htmlFor="name">Username</label>
          <input className="input" id="name" {...form.register('name')} />
          {errors.name && <p className="my-0 text-sm text-error">{errors.name}</p>}
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

        <button type="submit" className="btn-primary btn mt-4">
          Update
        </button>
      </form>
    </>
  );
};
