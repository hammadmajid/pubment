import { Github } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

export default function Footer() {
  return (
    <footer className='border-t bg-background'>
      <div className='container flex flex-col gap-6 py-8 px-4 md:px-6'>
        <div className='grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6'>
          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-medium'>Legal</h3>
            <Link
              to='/terms'
              className='text-sm text-muted-foreground hover:underline'
            >
              Terms
            </Link>
            <Link
              to='/privacy'
              className='text-sm text-muted-foreground hover:underline'
            >
              Privacy
            </Link>
          </div>
          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-medium'>Company</h3>
            <Link
              to='/about'
              className='text-sm text-muted-foreground hover:underline'
            >
              About
            </Link>
          </div>
          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-medium'>Account</h3>
            <Link
              to='/login'
              className='text-sm text-muted-foreground hover:underline'
            >
              Login
            </Link>
          </div>
          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-medium'>Social</h3>
            <Link
              to='https://github.com'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
            >
              <Github className='h-4 w-4' />
              <span>GitHub</span>
            </Link>
          </div>
          <div className='flex flex-col gap-2 sm:col-span-2'>
            <h3 className='text-lg font-medium'>Join Us</h3>
            <p className='text-sm text-muted-foreground'>
              Be part of our growing community.
            </p>
            <Link to='/register'>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} SocialApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
