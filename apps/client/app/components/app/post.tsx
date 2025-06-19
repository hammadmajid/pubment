import type { postData } from '@repo/schemas/post';
import { Heart, Loader2Icon, MessageCircle } from 'lucide-react';
import { Link, useFetcher } from 'react-router';
import type { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn, getRelativeTime } from '~/lib/utils';
import { Button } from '../ui/button';

interface PostProps {
  username: string;
  post: z.infer<typeof postData>;
  isLiked: boolean;
  isClickable?: boolean;
}

export function Post({
  username,
  post,
  isLiked,
  isClickable = false,
}: PostProps) {
  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';
  console.log(isLiked);

  return (
    <Card key={post._id}>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div className='flex items-center gap-3'>
          <Avatar>
            <AvatarImage
              src={post.author.profilePicture ?? undefined}
              alt={post.author.name}
            />
            <AvatarFallback>{post.author.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className='leading-tight'>
              <Link
                to={
                  post.author.username === username
                    ? '/profile'
                    : `/user/${post.author.username}`
                }
              >
                {post.author.name}
              </Link>
            </CardTitle>
            <div className='text-xs text-muted-foreground mt-0.5'>
              @{post.author.username}
            </div>
          </div>
        </div>
        <CardDescription className='text-xs text-muted-foreground mt-1 whitespace-nowrap'>
          {getRelativeTime(post.createdAt)}
        </CardDescription>
      </CardHeader>

      {isClickable ? (
        <Link
          to={`/post/${post._id}`}
          className='block no-underline text-inherit'
        >
          <CardContent>
            <div className='whitespace-pre-line mb-4'>{post.content}</div>
          </CardContent>
        </Link>
      ) : (
        <CardContent>
          <div className='whitespace-pre-line mb-4'>{post.content}</div>
        </CardContent>
      )}

      <CardContent className='pt-0'>
        <div className='flex items-center gap-4 mt-2'>
          <fetcher.Form action={`/post/${post._id}/`} method='post'>
            <input hidden name='intent' value='like' />
            <input hidden name='postId' value={post._id} />
            <Button variant='ghost' disabled={busy} type='submit'>
              {busy ? (
                <Loader2Icon className='w-5 h-5 animate-spin' />
              ) : (
                <Heart
                  className={cn(
                    'w-5 h-5',
                    isLiked && 'fill-red-500 text-red-500',
                  )}
                  strokeWidth={2}
                />
              )}
              <span className='text-sm'>{post.likes.length}</span>
            </Button>
          </fetcher.Form>
          <Link
            to={`/post/${post._id}`}
            className='flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors'
            aria-label='Comment on post'
          >
            <MessageCircle className='w-5 h-5' strokeWidth={2} />
            <span className='text-sm'>Comment</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
