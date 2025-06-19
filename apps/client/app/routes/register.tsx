import {
  registrationResponse,
  registrationSchema,
  userErrorResponse,
} from '@repo/schemas/user';
import { ArrowUpToLine, GalleryVerticalEnd, Loader2Icon } from 'lucide-react';
import { Link, data, redirect, useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { safeFetch } from '~/lib/fetch';
import { commitSession, getSession } from '~/session.server';
import type { Route } from './+types/register';

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
    { title: 'Register | Social Media' },
    {
      name: 'description',
      content:
        'Create a new account to connect with friends and share updates.',
    },
  ];
}

export default function Register({ loaderData }: Route.ComponentProps) {
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
                <h1 className='text-2xl font-bold'>Create your account</h1>
                <p className='text-muted-foreground text-sm text-balance'>
                  Enter your details below to create a new account
                </p>
              </div>
              <div className='grid gap-6'>
                <p className='text-destructive font-medium'>{error}</p>
                <div className='grid gap-3'>
                  <Label>Name</Label>
                  <Input
                    id='name'
                    name='name'
                    placeholder='John Doe'
                    required
                  />
                </div>
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
                  <Label>Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='john@example.com'
                    required
                  />
                </div>
                <div className='grid gap-3'>
                  <Label>Password</Label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    placeholder='••••••••'
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
                      <ArrowUpToLine />
                      Register
                    </>
                  )}
                </Button>
              </div>
              <div className='text-center text-sm'>
                Already have an account?{' '}
                <Link to='/login' className='underline underline-offset-4'>
                  Login
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
  const name = form.get('name');
  const username = form.get('username');
  const email = form.get('email');
  const password = form.get('password');

  const result = await safeFetch(
    { endpoint: '/user/register', body: { name, username, email, password } },
    registrationResponse,
  );

  if (result.ok !== true) {
    session.flash('error', result.error);

    return redirect('/register', {
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
