import { Github } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

export default function Navbar() {
  return (
    <header className='border-b bg-background'>
      <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
        <Link to='/' className='flex items-center gap-2'>
          <span className='text-xl font-bold'>SocialApp</span>
        </Link>
        <nav className='flex items-center gap-4 sm:gap-6'>
          <Link
            to='/about'
            className='text-sm font-medium hover:underline underline-offset-4'
          >
            About
          </Link>
          <Link
            to='https://github.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='ghost' size='icon'>
              <Github className='h-5 w-5' />
              <span className='sr-only'>GitHub</span>
            </Button>
          </Link>
          <Link to='/login'>
            <Button>Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
