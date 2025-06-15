import type { Route } from './+types/settings';
import AppWrapper from '~/components/app/wrapper';

export default function Settings({ loaderData }: Route.ComponentProps) {
  return (
    <AppWrapper>
      <div className='px-8 py-2'></div>
    </AppWrapper>
  );
}
