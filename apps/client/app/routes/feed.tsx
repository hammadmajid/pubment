import { redirect } from 'react-router';
import { isAuthenticated } from '~/lib/auth';
import { safeFetch } from '~/lib/fetch';
import { postListResponse } from '@repo/schemas/post';
import type { Route } from './+types/feed';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Heart, MessageCircle } from 'lucide-react';

export async function clientLoader() {
  if (!isAuthenticated()) {
    return redirect('/login');
  }

  const result = await safeFetch('/post', {}, postListResponse);

  if (result.ok === false) {
    return result.error;
  }

  return result.value;
}

export function HydrateFallback() {
  return (
    <div className='flex flex-col gap-6 max-w-xl mx-auto py-8'>
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='h-6 w-32 mb-2' />
            <Skeleton className='h-4 w-24' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  if (loaderData instanceof Error) {
    return (
      <div className='bg-red-100 text-red-700 border border-red-300 rounded-md p-4 max-w-xl mx-auto mt-8'>
        <strong>Error:</strong> {loaderData.message}
      </div>
    );
  }

  return (
    <main className='flex flex-col gap-6 max-w-xl mx-auto py-8'>
      {loaderData.data.length === 0 ? (
        <div className='text-center text-muted-foreground'>No posts yet.</div>
      ) : (
        loaderData.data.map((post) => (
          <Card key={post._id}>
            <CardHeader>
              <CardTitle>
                {post.author.name} (@{post.author.username})
              </CardTitle>
              <CardDescription>
                {new Date(post.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='whitespace-pre-line mb-4'>{post.content}</div>
              <div className='flex items-center gap-4 mt-2'>
                <button
                  type='button'
                  className='flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors'
                  aria-label='Like post'
                >
                  <Heart className='w-5 h-5' strokeWidth={2} />
                  <span className='text-sm'>{post.likes.length}</span>
                </button>
                <button
                  type='button'
                  className='flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors'
                  aria-label='Comment on post'
                >
                  <MessageCircle className='w-5 h-5' strokeWidth={2} />
                  <span className='text-sm'>Comment</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </main>
  );
}
