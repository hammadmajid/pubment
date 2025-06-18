import { getSession } from '~/session.server';
import type { Route } from './+types/post';
import { Link, redirect } from 'react-router';
import { safeFetch } from '~/lib/fetch';
import { postErrorResponse, postResponse } from '@repo/schemas/post';
import { Post } from '~/components/app/post';
import { Card } from '~/components/ui/card';
import { CardContent, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { getRelativeTime } from '~/lib/utils';

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
    return redirect('/404');
  }

  return {
    username: session.get('username'),
    data: result.value.data,
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
  const post = loaderData.data.post;
  const comments = loaderData.data.comments;

  return (
    <div className='flex flex-col gap-6 px-8 py-2 mb-12'>
      <Post post={post} username={loaderData.username} />
      <div className='mt-4 ml-8'>
        <h3 className='text-lg font-semibold'>Comments</h3>
        {comments.length > 0 ? (
          <ul className='mt-2 flex flex-col gap-4'>
            {comments.map((comment) => (
              <li key={comment._id}>
                <Card className='bg-muted'>
                  <CardHeader className='flex flex-row items-start justify-between px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage
                          src={comment.author.profilePicture}
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
