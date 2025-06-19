import {
  loginResponse,
  loginSchema,
  userErrorResponse,
} from '@repo/schemas/user';
import { GalleryVerticalEnd, Loader2Icon, LogIn } from 'lucide-react';
import { Link, data, redirect, useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { safeFetch } from '~/lib/fetch';
import { commitSession, getSession } from '~/session.server';
import type { Route } from './+types/login';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('token')) {
    return redirect('/feed');
  }

  return data(
    { error: session.get('error') },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
}

export function meta() {
  return [
    { title: 'Login | Social Media' },
    {
      name: 'description',
      content:
        'Login into your account to connect with friends and share updates.',
    },
  ];
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;

  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <Link to='/' className='flex items-center gap-2 font-medium'>
            <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
              <GalleryVerticalEnd className='size-4' />
            </div>
            SocialApp
          </Link>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <fetcher.Form method='post' className='flex flex-col gap-6'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Login to your account</h1>
                <p className='text-muted-foreground text-sm text-balance'>
                  Enter your credentials below to login to your account
                </p>
              </div>
              <div className='grid gap-6'>
                <p>{error}</p>
                <div className='grid gap-3'>
                  <Label>Username</Label>
                  <Input
                    id='username'
                    name='username'
                    placeholder='johnd'
                    required
                  />
                </div>
                <div className='grid gap-3'>
                  <Label>Password</Label>
                  <Input
                    id='password'
                    name='password'
                    placeholder='••••••••'
                    type='password'
                    required
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full flex gap-2 items-center'
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2Icon className='animate-spin' />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LogIn />
                      Login
                    </>
                  )}
                </Button>
              </div>
              <div className='text-center text-sm'>
                Don&apos;t have an account?{' '}
                <Link to='/register' className='underline underline-offset-4'>
                  Sign up
                </Link>
              </div>
            </fetcher.Form>
          </div>
        </div>
      </div>
      <div className='bg-muted relative hidden lg:block'>
        <img
          src='/placeholder.png'
          alt='Social app background'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');

  const { success, data, error } = await loginSchema.safeParseAsync({
    username,
    password,
  });

  if (!success) {
    session.flash('error', error.message.toString());

    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  const result = await safeFetch(
    { endpoint: '/user/login', body: data },
    loginResponse,
    userErrorResponse,
  );

  if (result.ok !== true) {
    console.log(result.error.message);
    session.flash('error', result.error.message);

    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  const { userId, username: resultUsername, token } = result.value;
  session.set('token', token);
  session.set('userId', userId);
  session.set('username', resultUsername);

  return redirect('/feed', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
