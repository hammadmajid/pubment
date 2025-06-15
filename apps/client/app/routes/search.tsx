import type { Route } from './+types/search';
import AppWrapper from '~/components/app/wrapper';

export default function Search({ loaderData }: Route.ComponentProps) {
  return (
    <AppWrapper>
      <div className='px-8 py-2'></div>
    </AppWrapper>
  );
}
