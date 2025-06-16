import { getSession } from '~/session.server';
import type { Route } from './+types/post';
import { redirect } from 'react-router';
import { safeFetch } from '~/lib/fetch';
import { postErrorResponse, postResponse } from '@repo/schemas/post';
import AppWrapper from '~/components/app/wrapper';
import { Post } from '~/components/post';

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

export function meta() {
  return [
    { title: 'Post Details | Social Media' },
    {
      name: 'description',
      content: 'View details of a specific post.',
    },
  ];
}

export default function PostDetails({ loaderData }: Route.ComponentProps) {
  return (
    <AppWrapper username={loaderData.username}>
      <div className='flex flex-col gap-6 px-8 py-2'>
        <Post post={loaderData.data} />
      </div>
    </AppWrapper>
  );
}
