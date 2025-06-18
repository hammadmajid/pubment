import { redirect } from 'react-router';
import { safeFetch } from '~/lib/fetch';
import {
  postCreateResponse,
  postErrorResponse,
  postListResponse,
} from '@repo/schemas/post';
import type { Route } from './+types/feed';
import { Post } from '~/components/post';
import { commitSession, getSession } from '~/session.server';

export function meta() {
  return [{ title: 'Feed | Social Media' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  const result = await safeFetch(
    { endpoint: '/post' },
    postListResponse,
    postErrorResponse,
    session.get('token'),
  );

  if (result.ok === false) {
    return result.error;
  }

  return {
    username: session.get('username'),
    data: result.value,
  };
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  if (loaderData instanceof Error) {
    return (
      <div className='bg-red-100 text-red-700 border border-red-300 rounded-md p-4 mx-auto mt-8'>
        <strong>Error:</strong> {loaderData.message}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 px-8 py-2'>
      {loaderData.data.data.length === 0 ? (
        <div className='text-center text-muted-foreground'>No posts yet.</div>
      ) : (
        loaderData.data.data.map((post) => (
          <Post key={post._id} isClickable={true} post={post} />
        ))
      )}
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const authorId = session.get('userId');

  const formData = await request.formData();
  const pathname = formData.get('pathname') as string;
  const content = formData.get('content') as string;

  const result = await safeFetch(
    {
      endpoint: '/post/create',
      body: {
        authorId,
        content,
      },
    },
    postCreateResponse,
    postErrorResponse,
    session.get('token'),
  );

  if (result.ok !== true) {
    return redirect('/500', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return redirect(`${pathname}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
