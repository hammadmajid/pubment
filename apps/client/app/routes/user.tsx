import { safeFetch } from '~/lib/fetch';
import type { Route } from './+types/user';
import { publicUserSuccessResponse } from '@repo/schemas/user';
import { redirect } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { isAuthenticated } from '~/lib/auth';
import { Skeleton } from '~/components/ui/skeleton';
import AppWrapper from '~/components/app/wrapper';

export async function clientLoader({ params }: Route.LoaderArgs) {
  if (!isAuthenticated()) {
    return redirect('/login');
  }

  const username = params.username;
  const result = await safeFetch(
    `/user/${username}`,
    {},
    publicUserSuccessResponse,
  );

  if (!result.ok) {
    return redirect('/404');
  }

  return result.value;
}

export function HydrateFallback() {
  return (
    <AppWrapper>
      <div className='p-6 sm:p-10 bg-background min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader className='text-center pb-4'>
            <div className='flex justify-center mb-4'>
              <Skeleton className='h-24 w-24 rounded-full' />
            </div>
            <div className='space-y-1'>
              <Skeleton className='h-8 w-32 mx-auto' />
              <Skeleton className='h-5 w-24 mx-auto' />
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <Skeleton className='h-4 w-3/4 mx-auto mt-2' />
          </CardContent>
        </Card>
      </div>
    </AppWrapper>
  );
}

export default function Component({
  params,
  loaderData,
}: Route.ComponentProps) {
  const user = loaderData.user;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppWrapper>
      <div className='p-6 sm:p-10 bg-background min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader className='text-center pb-4'>
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
