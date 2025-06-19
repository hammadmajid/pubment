import { safeFetch } from '~/lib/fetch';
import type { Route } from './+types/profile';
import {
  publicUserSuccessResponse,
  userErrorResponse,
} from '@repo/schemas/user';
import { data, redirect } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { commitSession, getSession } from '~/session.server';
import { Post } from '~/components/app/post';
import FollowList from '~/components/app/follow-list';

export function meta() {
  return [{ title: 'Profile | Social Media' }];
}

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

  if (userDataResult.ok !== true) {
    throw data(userDataResult.error.message, 500);
  }

  return {
    userId: session.get('userId'),
    user: userDataResult.value.user,
    posts: userDataResult.value.user.posts,
    // assert these to prevent typescript from complaining
    followers: userDataResult.value.user.followers.map((f) => {
      return {
        _id: f._id!,
        username: f.username!,
        name: f.name!,
        profilePicture: f.profilePicture!,
      };
    }),
    following: userDataResult.value.user.following.map((f) => {
      return {
        _id: f._id!,
        username: f.username!,
        name: f.name!,
        profilePicture: f.profilePicture!,
      };
    }),
    header: {
      'Set-Cookie': await commitSession(session),
    },
  };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const user = loaderData.user;
  const posts = loaderData.posts;
  const followers = loaderData.followers;
  const following = loaderData.following;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='px-8 py-2 space-y-8 mb-12'>
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
        </CardHeader>
        {user.bio && (
          <CardContent className='pt-0'>
            <p className='text-sm leading-relaxed text-muted-foreground'>
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
              username={user.username}
              isLiked={post.likes.includes(loaderData.userId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
