import {
  followErrorResponse,
  toggleFollowResponse,
} from '@repo/schemas/follow';
import {
  publicUserSuccessResponse,
  userErrorResponse,
} from '@repo/schemas/user';
import { Loader2Icon } from 'lucide-react';
import { data, redirect, useFetcher } from 'react-router';
import FollowList from '~/components/app/follow-list';
import { Post } from '~/components/app/post';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { safeFetch } from '~/lib/fetch';
import { commitSession, getSession } from '~/session.server';
import type { Route } from './+types/user';

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  const username = params.username;
  const userDataResult = await safeFetch(
    { endpoint: `/user/${username}` },
    publicUserSuccessResponse,
  );

  if (userDataResult.ok !== true) {
    throw data(userDataResult.error, 500);
  }

  const loggedInUser = session.get('username');
  const user = userDataResult.value.user;
  const posts = user.posts;
  // to prevent typescript from complaining
  const followers = user.followers
    .filter((f) => f._id && f.username && f.name && f.profilePicture)
    .map((f) => ({
      _id: f._id,
      username: f.username,
      name: f.name,
      profilePicture: f.profilePicture,
    }));
  const following = user.following
    .filter((f) => f._id && f.username && f.name && f.profilePicture)
    .map((f) => ({
      _id: f._id,
      username: f.username,
      name: f.name,
      profilePicture: f.profilePicture,
    }));
  const isFollowing = user.followers.some(
    (follower) => follower.username === loggedInUser,
  );

  return {
    userId: session.get('userId'),
    username: session.get('username'),
    user,
    posts,
    followers,
    following,
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
      title: `${username} | Pubment`,
    },
  ];
}

export default function UserPage({ loaderData }: Route.ComponentProps) {
  const { user, userId, username, posts, following, followers, isFollowing } =
    loaderData;

  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';

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
              <FollowList followers={followers} followings={following} />
            </div>
          </div>
          <div>
            <fetcher.Form method='post'>
              <input type='hidden' name='username' value={user.username} />
              <Button type='submit' variant='outline' size='lg' disabled={busy}>
                {busy ? (
                  <Loader2Icon className='animate-spin' />
                ) : (
                  <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                )}
              </Button>
            </fetcher.Form>
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
      <div className='space-y-3'>
        {posts.length === 0 ? (
          <div className='text-center text-muted-foreground'>No posts yet.</div>
        ) : (
          posts.map((post) => (
            <Post
              key={post._id}
              isClickable={true}
              post={post}
              username={username ?? ''}
              isLiked={post.likes.includes(userId ?? '')}
            />
          ))
        )}
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  const formData = await request.formData();
  const username = formData.get('username');

  const result = await safeFetch(
    {
      endpoint: '/follow/toggle',
      body: {
        targetUsername: username,
      },
    },
    toggleFollowResponse,
    session.get('token'),
  );

  if (result.ok === false) {
    throw data(result.error, 500);
  }

  return {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };
}
