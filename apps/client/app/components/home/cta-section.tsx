import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

export default function CTASection() {
  return (
    <section className='w-full py-12 md:py-24 bg-primary text-primary-foreground'>
      <div className='container px-4 md:px-6'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
              Ready to Join Our Community?
            </h2>
            <p className='max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
              Start connecting with like-minded individuals and share your
              experiences today.
            </p>
          </div>
          <div className='flex flex-col gap-2 min-[400px]:flex-row'>
            <Link to='/register'>
              <Button size='lg' variant='secondary' className='px-8'>
                Create Account
              </Button>
            </Link>
            <Link to='/features'>
              <Button
                size='lg'
                variant='outline'
                className='border-primary-foreground px-8'
              >
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
