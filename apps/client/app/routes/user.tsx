import { safeFetch } from '~/lib/fetch';
import type { Route } from './+types/user';
import {
  publicUserSuccessResponse,
  userErrorResponse,
} from '@repo/schemas/user';
import { redirect } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import AppWrapper from '~/components/app/wrapper';
import { getSession } from '~/session.server';

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  const username = params.username;
  const result = await safeFetch(
    { endpoint: `/user/${username}` },
    publicUserSuccessResponse,
    userErrorResponse,
  );

  if (!result.ok) {
    return redirect('/404');
  }

  return {
    username: session.get('username'),
    data: result.value,
  };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const user = loaderData.data.user;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppWrapper username={loaderData.username}>
      <div className='px-8 py-2'>
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
      </div>
    </AppWrapper>
  );
}
