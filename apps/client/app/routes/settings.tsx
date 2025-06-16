import { destroySession, getSession } from '~/session.server';
import type { Route } from './+types/settings';
import AppWrapper from '~/components/app/wrapper';
import { Form, redirect } from 'react-router';
import { Button } from '~/components/ui/button';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  return session.get('userId');
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  return (
    <AppWrapper>
      <div className='px-8 py-2'>
        <Form method='post'>
          <Button variant='destructive'>Logout</Button>
        </Form>
      </div>
    </AppWrapper>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
