import {
  postErrorResponse,
  postLikeResponse,
  postResponse,
} from '@repo/schemas/post';
import { Link, data, redirect, useFetcher } from 'react-router';
import { Post } from '~/components/app/post';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Card } from '~/components/ui/card';
import { CardContent, CardHeader } from '~/components/ui/card';
import { safeFetch } from '~/lib/fetch';
import { getRelativeTime } from '~/lib/utils';
import { commitSession, getSession } from '~/session.server';
import type { Route } from './+types/post';
import {
  commentCreateResponse,
  commentErrorResponse,
} from '@repo/schemas/comment';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  const postId = params.postId;

  const result = await safeFetch(
    {
      endpoint: `/post/${postId}`,
    },
    postResponse,
    postErrorResponse,
    session.get('token'),
  );

  if (result.ok === false) {
    throw data(result.error.message, 500);
  }

  const { post, comments } = result.value.data;

  return {
    userId: session.get('userId'),
    username: session.get('username'),
    post,
    comments,
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };
}

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Post ${params.postId} | Social Media` },
    {
      name: 'description',
      content: 'View details of a specific post.',
    },
  ];
}

export default function PostDetails({ loaderData }: Route.ComponentProps) {
  const { userId, username, post, comments } = loaderData;
  const isLiked = loaderData.post.likes.includes(userId ?? '');

  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';

  return (
    <div className='flex flex-col gap-6 px-8 py-2 mb-12'>
      <Post post={post} username={username ?? ''} isLiked={isLiked} />
      <div className='mt-4 ml-8'>
        <h3 className='text-lg font-semibold'>Comments</h3>
        <div className='my-4'>
          <fetcher.Form method='post' className='grid gap-2'>
            <input hidden name='intent' value='comment' />
            <Textarea className='w-full' name='content' required />
            <Button>Comment</Button>
          </fetcher.Form>
        </div>
        {comments.length > 0 ? (
          <ul className='mt-2 flex flex-col gap-4'>
            {comments.map((comment) => (
              <li key={comment._id}>
                <Card className='bg-muted'>
                  <CardHeader className='flex flex-row items-start justify-between px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage
                          src={comment.author.profilePicture ?? undefined}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {comment.author.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className='font-semibold leading-tight'>
                          <Link to={`/user/${comment.author.username}`}>
                            {comment.author.name}
                          </Link>
                        </span>
                        <div className='text-xs text-muted-foreground mt-0.5'>
                          @{comment.author.username}
                        </div>
                      </div>
                    </div>
                    <span className='text-xs text-muted-foreground mt-1 whitespace-nowrap'>
                      {getRelativeTime(comment.createdAt)}
                    </span>
                  </CardHeader>
                  <CardContent className='px-4'>
                    <span>{comment.content}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2'>No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const postId = params.postId;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'comment') {
    const content = formData.get('content') as string;
    const result = await safeFetch(
      {
        endpoint: '/comment/create',
        body: {
          postId,
          content,
          authorId: session.get('userId'),
        },
      },
      commentCreateResponse,
      commentErrorResponse,
      session.get('token'),
    );
    if (result.ok !== true) {
      throw data(`Failed to comment on post: ${postId}`, 500);
    }
  } else {
    // intent: like toggle
    const result = await safeFetch(
      {
        endpoint: `/post/${postId}/like`,
        body: {},
      },
      postLikeResponse,
      postErrorResponse,
      session.get('token'),
    );
    if (result.ok !== true) {
      throw data(`Failed to toggle like on post: ${postId}`, 500);
    }
  }

  return {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };
}
