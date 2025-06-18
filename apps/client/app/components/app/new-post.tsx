import { Loader2Icon, PenSquare } from 'lucide-react';
import { useFetcher, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';

export default function NewPost() {
  const [content, setContent] = useState('');
  let location = useLocation();
  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className='w-full'>
          <PenSquare className='size-4 mr-2' />
          New Post
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New Post</DrawerTitle>
          <DrawerDescription>
            Share your thoughts with the world
          </DrawerDescription>
        </DrawerHeader>
        <div className='mx-auto'>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            cols={60}
            rows={10}
          />
        </div>
        <DrawerFooter className='text-center max-w-md mx-auto'>
          <fetcher.Form method='post' action='/feed'>
            <input hidden name='pathname' defaultValue={location.pathname} />
            <Textarea
              name='content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              hidden
            />
            <Button
              type='submit'
              size='lg'
              disabled={busy || content === ''}
              className='w-full'
            >
              {busy ? <Loader2Icon className='animate-spin' /> : 'Post'}
            </Button>
          </fetcher.Form>
          <DrawerClose asChild>
            <Button variant='outline'>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
