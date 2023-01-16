import { zodResolver } from '@hookform/resolvers/zod';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { signupSchema } from '~/models/auth/signup';
import { getFormOrMutationError } from '~/utils/form/get-errors';
import { trpc } from '~/utils/trpc';

const Signup: NextPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors: error },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });
  const signup = trpc.auth.signup.useMutation({
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
    name: getFormOrMutationError('name', error, signup),
    email:
      getFormOrMutationError('email', error, signup) ?? signup.error?.data?.code === 'CONFLICT'
        ? 'Email already in use'
        : undefined,
    password: getFormOrMutationError('password', error, signup),
    unknown:
      signup.error?.data?.code && !['BAD_REQUEST', 'CONFLICT'].includes(signup.error?.data?.code)
        ? signup.error?.message ?? 'An unknown error occurred'
        : undefined,
  };

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
      </div>
    </div>
  );
};

export default Signup;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
