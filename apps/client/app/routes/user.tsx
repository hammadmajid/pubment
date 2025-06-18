import { safeFetch } from '~/lib/fetch';
import type { Route } from './+types/user';
import {
  publicUserSuccessResponse,
  userErrorResponse,
} from '@repo/schemas/user';
import { Form, redirect } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { commitSession, getSession } from '~/session.server';
import {
  followErrorResponse,
  toggleFollowResponse,
} from '@repo/schemas/follow';
import { Post } from '~/components/post';
import { Button } from '~/components/ui/button';

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  const username = params.username;
  const userDataResult = await safeFetch(
    { endpoint: `/user/${username}` },
    publicUserSuccessResponse,
    userErrorResponse,
  );

  if (!userDataResult.ok) {
    return redirect('/404');
  }

  const loggedInUser = session.get('username');
  const isFollowing = userDataResult.value.user.followers.some(
    (follower) => follower.username === loggedInUser,
  );

  return {
    username: session.get('username'),
    user: userDataResult.value.user,
    posts: userDataResult.value.user.posts,
    followers: userDataResult.value.user.followers,
    following: userDataResult.value.user.following,
    isFollowing,
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };
}

export function meta({ params }: Route.MetaArgs) {
  const username = params.username || 'user';
  return [
    {
      title: `${username} | Social Media`,
    },
  ];
}

export default function UserPage({ loaderData }: Route.ComponentProps) {
  const user = loaderData.user;
  const posts = loaderData.posts;
  const following = loaderData.following;
  const followers = loaderData.followers;
  const isFollowing = loaderData.isFollowing;

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
        <CardHeader className='pb-4 flex items-center justify-between'>
          <div className='flex items-center justify-start gap-8'>
            <div className='flex justify-center mb-4'>
              <Avatar className='h-24 w-24'>
                <AvatarImage
                  src={user.profilePicture}
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
              <div className='flex gap-4 justify-center mt-2'>
                <span className='text-sm'>{followers.length} Followers</span>
                <span className='text-sm'>{following.length} Following</span>
              </div>
            </div>
          </div>
          <div>
            <Form method='post'>
              <input type='hidden' name='username' value={user.username} />
              <Button type='submit' variant='outline' size='lg'>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </Form>
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
      <div className='space-y-4'>
        {posts.length === 0 ? (
          <div className='text-center text-muted-foreground'>No posts yet.</div>
        ) : (
          posts.map((post) => (
            <Post key={post._id} isClickable={true} post={post} />
          ))
        )}
      </div>
    </div>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  const formData = await request.formData();
  const username = formData.get('username');

  const result = await safeFetch(
    {
      endpoint: `/follow/toggle`,
      body: {
        targetUsername: username,
      },
    },
    toggleFollowResponse,
    followErrorResponse,
    session.get('token'),
  );

  if (result.ok === false) {
    return redirect(`/500`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return redirect(`/user/${params.username}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
