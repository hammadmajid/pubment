import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { postData } from '@repo/schemas/post';

interface PostProps {
  post: z.infer<typeof postData>;
}

export function Post({ post }: PostProps) {
  return (
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
  );
}
