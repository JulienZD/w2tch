import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { useRedirectIfAuth } from '~/hooks/useRedirectIfAuth';
import { signupSchema } from '~/models/auth/signup';
import { getFormOrMutationErrors } from '~/utils/form/get-errors';
import { api } from '~/utils/api';

const Signup: NextPage = () => {
  useRedirectIfAuth('/');

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors: error },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });
  const signup = api.auth.signup.useMutation({
    onSuccess: (_, { email, password }) => {
      return signIn('credentials', {
        email,
        password,
        callbackUrl: returnUrl || '/',
      });
    },
  });

  const returnUrl = Array.isArray(router.query.returnUrl) ? router.query.returnUrl[0] : router.query.returnUrl;

  const handleSignup = handleSubmit((data) => signup.mutate(data));
  const errors = {
    ...getFormOrMutationErrors(error, signup),
    unknown:
      signup.error?.data?.code && !['BAD_REQUEST', 'CONFLICT'].includes(signup.error?.data?.code)
        ? signup.error?.message ?? 'An unknown error occurred'
        : undefined,
  };

  errors.email ??= signup.error?.data?.code === 'CONFLICT' ? 'Email already in use' : undefined;

  return (
    <div className="prose grid h-full place-content-center">
      <div className="rounded-3xl bg-base-200 px-4 pt-10 shadow-md md:px-8">
        <h1 className="text-center font-light">Sign up</h1>
        {errors.unknown && <p className="my-2 text-sm text-error">{errors.unknown}</p>}

        <form onSubmit={handleSignup}>
          <div className="form-control">
            <label htmlFor="name" className="label">
              Username
            </label>
            <input id="name" {...register('name')} className="input max-w-xs" placeholder="Marty McFly" />
            {errors.name && <p className="my-0 text-sm text-error">{errors.name}</p>}
          </div>
          <div className="form-control">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              className="input max-w-xs"
              placeholder="bruce@wayne.com"
            />
            {errors.email && <p className="my-0 text-sm text-error">{errors.email}</p>}
          </div>
          <div className="form-control">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input {...register('password')} type="password" className="input max-w-xs" />
            {errors.password && <p className="my-0 text-sm text-error">{errors.password}</p>}
          </div>

          {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}

          <button
            className={`btn-primary btn mt-6 mb-4 w-full md:w-auto md:min-w-[6rem] ${
              signup.isLoading ? 'loading' : ''
            }`}
          >
            Create Account
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link
            className="text-primary no-underline"
            href={{
              pathname: '/login',
              ...(returnUrl && { query: { returnUrl } }),
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
