import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { profileSchema } from '~/models/user';
import { trpc } from '~/utils/trpc';

const zAccountInfo = z.object(profileSchema);
//  signupSchema.pick({ name: true, password: true }).extend({
//   currentPassword: z.string(),
// });

type AccountSettingsFormProps = {
  user: User;
};

export const AccountSettingsForm: React.FC<AccountSettingsFormProps> = ({ user }) => {
  const form = useForm<typeof zAccountInfo['_type']>({
    defaultValues: {
      name: user.name,
      // password: '',
      // currentPassword: '',
    },
    resolver: zodResolver(zAccountInfo),
  });

  const updateAccount = trpc.me.updateAccount.useMutation({
    onSuccess: async (_, updated) => {
      await signIn('update-user', { user: { ...user, ...updated }, redirect: false });
    },
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
          <label htmlFor="name">Name</label>
          <input className="input" id="name" {...form.register('name')} />
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

        <button type="submit" className="btn">
          Save
        </button>
      </form>
    </>
  );
};
