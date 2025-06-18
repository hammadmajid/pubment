'use client';

import type React from 'react';

import { Loader2Icon, PenSquare } from 'lucide-react';
import { useFetcher, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { ResponsiveDialogDrawer } from '~/components/responsive-modal';
import { useState, useEffect } from 'react';

export default function NewPost() {
  const [content, setContent] = useState('');
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data && !busy) {
      setOpen(false);
      setContent('');
    }
  }, [fetcher.state, fetcher.data, busy]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ResponsiveDialogDrawer
      open={open}
      setOpen={setOpen}
      title='New Post'
      description='Share your thoughts with the world'
      trigger={
        <Button className='w-full' onClick={() => setOpen(true)}>
          <PenSquare className='size-4 mr-2' />
          New Post
        </Button>
      }
    >
      <div className='space-y-4'>
        <div className='mx-auto'>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            cols={60}
            rows={10}
            className='resize-none'
          />
        </div>

        <div className='flex gap-2 pt-4'>
          <fetcher.Form method='post' action='/feed' className='flex-1'>
            <input hidden name='pathname' defaultValue={location.pathname} />
            <Textarea
              name='content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              hidden
              readOnly
            />
            <Button
              type='submit'
              size='lg'
              disabled={busy || content.trim() === ''}
              className='w-full'
            >
              {busy ? (
                <>
                  <Loader2Icon className='animate-spin size-4 mr-2' />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </fetcher.Form>

          <Button
            variant='outline'
            onClick={handleClose}
            disabled={busy}
            className='flex-1'
          >
            Close
          </Button>
        </div>
      </div>
    </ResponsiveDialogDrawer>
  );
}
