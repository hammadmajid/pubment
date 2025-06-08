import { Link } from 'react-router';
import SVGPattern from '~/components/home/svg-pattern';
import { Button } from '~/components/ui/button';

export default function Hero() {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='grid gap-6 lg:grid-cols-2 lg:gap-12 items-center'>
          <div className='space-y-4'>
            <div className='inline-block rounded-lg bg-muted px-3 py-1 text-sm'>
              Connect. Share. Grow.
            </div>
            <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl'>
              Your Social World, Reimagined
            </h1>
            <p className='max-w-[600px] text-muted-foreground md:text-xl'>
              Join our community where meaningful connections happen. Share your
              story, discover new perspectives, and build relationships that
              matter.
            </p>
            <div className='flex flex-col gap-2 min-[400px]:flex-row'>
              <Link to='/signup'>
                <Button size='lg' className='px-8'>
                  Get Started
                </Button>
              </Link>
              <Link to='/about'>
                <Button size='lg' variant='outline' className='px-8'>
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className='flex justify-center lg:justify-end'>
            <SVGPattern />
          </div>
        </div>
      </div>
    </section>
  );
}
