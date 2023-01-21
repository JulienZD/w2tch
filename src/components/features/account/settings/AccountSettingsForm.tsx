import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signupSchema } from '~/models/auth/signup';

const zAccountInfo = signupSchema.pick({ name: true, password: true }).extend({
  currentPassword: z.string(),
});

type AccountSettingsFormProps = {
  user: User;
};

export const AccountSettingsForm: React.FC<AccountSettingsFormProps> = ({ user }) => {
  const form = useForm<typeof zAccountInfo['_type']>({
    defaultValues: {
      name: user.name as string,
      password: '',
      currentPassword: '',
    },
    resolver: zodResolver(zAccountInfo),
  });

  return (
    <>
      <h2 className="my-0">Profile</h2>
      <p>This information is displayed publicly.</p>
      <form className="max-w-sm">
        <div className="form-control">
          <label htmlFor="name">Name</label>
          <input className="input" id="name" {...form.register('name')} />
        </div>

        <h2>Security</h2>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" type="password" {...form.register('password')} />
        </div>

        <div className="form-control">
          <label htmlFor="currentPassword">Current Password</label>
          <input className="input" id="currentPassword" type="currentPassword" {...form.register('currentPassword')} />
        </div>
      </form>
    </>
  );
};
