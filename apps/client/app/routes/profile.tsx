import { safeFetch } from '~/lib/fetch';
import type { Route } from './+types/profile';
import {
  publicUserSuccessResponse,
  userErrorResponse,
} from '@repo/schemas/user';
import { redirect } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { getSession } from '~/session.server';
import { postErrorResponse, postListResponse } from '@repo/schemas/post';
import { Post } from '~/components/post';

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  const username = session.get('username');
  const userDataResult = await safeFetch(
    { endpoint: `/user/${username}` },
    publicUserSuccessResponse,
    userErrorResponse,
  );

  if (!userDataResult.ok) {
    return redirect('/404');
  }

  const userPostResult = await safeFetch(
    {
      endpoint: `/post/user/${username}`,
    },
    postListResponse,
    postErrorResponse,
    session.get('token'),
  );

  if (userPostResult.ok === false) {
    return redirect('/404');
  }

  return {
    user: userDataResult.value.user,
    posts: userPostResult.value,
  };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const user = loaderData.user;
  const posts = loaderData.posts;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='px-8 py-2 space-y-8'>
      <Card className='w-full mx-auto'>
        <CardHeader className='text-center pb-4 flex items-center justify-start gap-8'>
          <div className='flex justify-center mb-4'>
            <Avatar className='h-24 w-24'>
              <AvatarImage
                src={user.profilePicture || '/placeholder.svg'}
                alt={`${user.name}'s profile picture`}
              />
              <AvatarFallback className='text-lg font-semibold'>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='space-y-1'>
            <h2 className='text-2xl font-bold'>{user.name}</h2>
            <p className='text-muted-foreground'>@{user.username}</p>
          </div>
        </CardHeader>
        {user.bio && (
          <CardContent className='pt-0'>
            <p className='text-center text-sm leading-relaxed text-muted-foreground'>
              {user.bio}
            </p>
          </CardContent>
        )}
      </Card>
      <div>
        {posts.data.length === 0 ? (
          <div className='text-center text-muted-foreground'>No posts yet.</div>
        ) : (
          posts.data.map((post) => (
            <Post key={post._id} isClickable={true} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
