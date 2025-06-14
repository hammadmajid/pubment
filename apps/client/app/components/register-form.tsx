import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Link } from 'react-router';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Create your account</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          Enter your details below to create a new account
        </p>
      </div>
      <div className='grid gap-6'>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className='grid gap-3'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' type='text' required placeholder='John Doe' />
          </div>
          <div className='grid gap-3'>
            <Label htmlFor='username'>Username</Label>
            <Input id='username' type='text' required placeholder='johndoe' />
          </div>
        </div>
        <div className='grid gap-3'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' required placeholder='john@example.com' />
        </div>
        <div className='grid gap-3'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' type='password' required />
        </div>
        <Button type='submit' className='w-full'>
          Register
        </Button>
      </div>
      <div className='text-center text-sm'>
        Already have an account?{' '}
        <Link to='/login' className='underline underline-offset-4'>
          Login
        </Link>
      </div>
    </form>
  );
}
