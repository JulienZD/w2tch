import { zodResolver } from '@hookform/resolvers/zod';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
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
    getValues,
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });
  const signup = trpc.auth.signup.useMutation();

  // Login after successful signup
  useEffect(() => {
    const login = async () => {
      if (signup.isSuccess) {
        const { email, password } = getValues();
        await signIn('credentials', {
          email,
          password,
          callbackUrl: '/',
        });
      }
    };

    login().catch(console.error);
  }, [getValues, router, signup.isSuccess]);

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
    <div className="container prose">
      <h1>Create account</h1>
      {/* <p>
        This will convert your temporary account into a permanent one. Afterwards you can login using the email and
        password combination you provided.
      </p> */}
      <form onSubmit={handleSignup}>
        {errors.unknown && <p className="my-2 text-sm text-error">{errors.unknown}</p>}

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

        <button className="btn-primary btn mt-2">Create Account</button>
      </form>
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
