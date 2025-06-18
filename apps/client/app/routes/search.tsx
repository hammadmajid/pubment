import { getSession } from '~/session.server';
import type { Route } from './+types/search';
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  return {
    userId: session.get('userId'),
    username: session.get('username'),
  };
}

export default function Search({ loaderData }: Route.ComponentProps) {
  return <div className='px-8 py-2'></div>;
}
