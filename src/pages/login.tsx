import { zodResolver } from '@hookform/resolvers/zod';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { loginSchema } from '~/models/auth/login';
import { getFormOrMutationError } from '~/utils/form/get-errors';

const Login: NextPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const returnUrl = Array.isArray(router.query.returnUrl) ? router.query.returnUrl[0] : router.query.returnUrl;

  const [error, setError] = useState<string | undefined>(undefined);

  const onLogin = handleSubmit(async (data) => {
    const result = await signIn('credentials', { ...data, callbackUrl: returnUrl ?? '/', redirect: false });
    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      await router.push(returnUrl ?? '/');
    }
  });

  const errors = {
    email: getFormOrMutationError('email', formErrors),
    password: getFormOrMutationError('password', formErrors),
  };

  return (
    <div className="grid h-full place-content-center">
      <div className="prose rounded-3xl bg-base-200 p-10 shadow-md">
        <h1 className="text-center font-light">Login</h1>
        {error && <p className="my-0 text-sm text-error">Invalid credentials</p>}
        <form onSubmit={onLogin}>
          <div className="form-control">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input {...register('email')} type="email" className="input max-w-xs" placeholder="bruce@wayne.com" />
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

          <button className="btn-primary btn mt-6 w-full md:mt-4 md:w-auto md:min-w-[6rem]">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

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
