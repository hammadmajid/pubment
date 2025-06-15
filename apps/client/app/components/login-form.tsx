'use client';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Link, useNavigate } from 'react-router';
import {
  loginResponse,
  loginSchema,
} from '@repo/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import z from 'zod';
import { safeFetch } from '~/lib/fetch';
import { toast } from 'sonner';
import { useState } from 'react';
import { setToken, setUserId } from '~/lib/auth';

export function LoginForm({ className }: React.ComponentProps<'form'>) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const result = await safeFetch(
      '/user/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      },
      loginResponse,
    );

    if (result.ok === false) {
      toast('Failed to login', {
        description: result.error.message,
      });
    } else {
      setToken(result.value.token);
      setUserId(result.value.userId);
      navigate('/feed');
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6', className)}
      >
        <div className='flex flex-col items-center gap-2 text-center'>
          <h1 className='text-2xl font-bold'>Login to your account</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            Enter your credentials below to login to your account
          </p>
        </div>
        <div className='grid gap-6'>
          <div className='grid gap-3'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='shadcn' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid gap-3'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type='submit'
            className='w-full'
            disabled={form.formState.isSubmitting}
          >
            Login
          </Button>
        </div>
        <div className='text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link to='/register' className='underline underline-offset-4'>
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
