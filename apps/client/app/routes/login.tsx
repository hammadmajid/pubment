import { GalleryVerticalEnd } from 'lucide-react';
import { Link, redirect } from 'react-router';
import { LoginForm } from '~/components/login-form';
import { isAuthenticated } from '~/lib/auth';
import { Skeleton } from '~/components/ui/skeleton';

export async function clientLoader() {
  if (isAuthenticated()) {
    return redirect('/feed');
  }
}

export function HydrateFallback() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <Skeleton className='size-6 rounded-md' />
          <Skeleton className='h-6 w-24 rounded' />
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs space-y-4'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-10 w-full rounded' />
            <Skeleton className='h-10 w-full rounded' />
            <Skeleton className='h-10 w-full rounded' />
          </div>
        </div>
      </div>
      <div className='bg-muted relative hidden lg:block'>
        <Skeleton className='absolute inset-0 h-full w-full rounded-none' />
      </div>
    </div>
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

export default function Login() {
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
            <LoginForm />
          </div>
        </div>
      </div>
      <div className='bg-muted relative hidden lg:block'>
        <img
          src='/placeholder.png'
          alt='Image'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  );
}
