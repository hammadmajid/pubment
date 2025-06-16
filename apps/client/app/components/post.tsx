import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '~/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { postData } from '@repo/schemas/post';
import { Link } from 'react-router';
import { getRelativeTime } from '~/lib/utils';

interface PostProps {
  post: z.infer<typeof postData>;
  isClickable?: boolean;
}

export function Post({ post, isClickable = false }: PostProps) {
  return (
    <Card key={post._id}>
      <CardHeader>
        <CardTitle>
          <Link to={`/user/${post.author.username}`}>
            {post.author.name} (@{post.author.username})
          </Link>
        </CardTitle>
        <CardDescription>{getRelativeTime(post.createdAt)}</CardDescription>
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
          <button
            type='button'
            className='flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors'
            aria-label='Like post'
          >
            <Heart className='w-5 h-5' strokeWidth={2} />
            <span className='text-sm'>{post.likes.length}</span>
          </button>
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
