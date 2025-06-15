'use client';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Link } from 'react-router';
import { registrationResponse, registrationSchema } from '@repo/schemas/user';
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
import { useNavigate } from "react-router";
import { setToken, setUserId } from '~/lib/auth';

export function RegisterForm({ className }: React.ComponentProps<'form'>) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
  });

  async function onSubmit(values: z.infer<typeof registrationSchema>) {
    setIsLoading(true);
    const result = await safeFetch(
      '/user/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      },
      registrationResponse,
    );

    if (result.ok === false) {
      toast('Failed to register', {
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
          <h1 className='text-2xl font-bold'>Create your account</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            Enter your details below to create a new account
          </p>
        </div>
        <div className='grid gap-6'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='grid gap-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
          </div>
          <div className='grid gap-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id='email'
                      type='email'
                      required
                      placeholder='john@example.com'
                      {...field}
                    />
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
                    <Input id='password' type='password' required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type='submit' className='w-full' disabled={isLoading}>
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
    </Form>
  );
}
