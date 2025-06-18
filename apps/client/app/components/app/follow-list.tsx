'use client';

import { useState } from 'react';
import { ResponsiveDialogDrawer } from '~/components/responsive-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface UserSummary {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string | null;
}

interface FollowListProps {
  followers: UserSummary[];
  followings: UserSummary[];
}

export default function FollowList({ followers, followings }: FollowListProps) {
  const [open, setOpen] = useState(false);

  const UserListItem = ({ user }: { user: UserSummary }) => (
    <div className='flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors'>
      <Avatar className='h-10 w-10'>
        <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
        <AvatarFallback>
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-foreground truncate'>
          {user.name}
        </p>
        <p className='text-sm text-muted-foreground truncate'>
          @{user.username}
        </p>
      </div>
    </div>
  );

  const EmptyState = ({ type }: { type: 'followers' | 'followings' }) => (
    <div className='flex flex-col items-center justify-center py-8 text-center'>
      <Users className='h-12 w-12 text-muted-foreground mb-4' />
      <h3 className='text-lg font-medium text-foreground mb-2'>
        No {type} yet
      </h3>
      <p className='text-sm text-muted-foreground max-w-sm'>
        {type === 'followers'
          ? "When people follow you, they'll appear here."
          : "When you follow people, they'll appear here."}
      </p>
    </div>
  );

  return (
    <ResponsiveDialogDrawer
      open={open}
      setOpen={setOpen}
      title='Connections'
      description="View your followers and people you're following"
      trigger={
        <Button variant='ghost' onClick={() => setOpen(true)}>
          <Users className='h-4 w-4 mr-2' />
          <span className='text-sm'>
            {followers.length} Followers
          </span>
          <span className='text-sm'>
            {followings.length} Following
          </span>
        </Button>
      }
    >
      <Tabs defaultValue='followers' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='followers' className='flex items-center gap-2'>
            Followers
            <span className='bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full'>
              {followers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value='followings' className='flex items-center gap-2'>
            Following
            <span className='bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full'>
              {followings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='followers' className='mt-4'>
          <ScrollArea className='h-[400px] w-full'>
            {followers.length > 0 ? (
              <div className='space-y-1'>
                {followers.map((follower) => (
                  <UserListItem key={follower._id} user={follower} />
                ))}
              </div>
            ) : (
              <EmptyState type='followers' />
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value='followings' className='mt-4'>
          <ScrollArea className='h-[400px] w-full'>
            {followings.length > 0 ? (
              <div className='space-y-1'>
                {followings.map((following) => (
                  <UserListItem key={following._id} user={following} />
                ))}
              </div>
            ) : (
              <EmptyState type='followings' />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </ResponsiveDialogDrawer>
  );
}
