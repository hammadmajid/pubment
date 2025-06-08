import { Code, Database, Server } from 'lucide-react';

export default function TechStack() {
  return (
    <section className='w-full py-12 md:py-24 bg-muted/50'>
      <div className='container px-4 md:px-6'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
              Powered by Modern Technology
            </h2>
            <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
              Our platform is built with cutting-edge technologies to provide
              you with the best experience possible.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-8'>
            <div className='flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background'>
              <div className='p-3 rounded-full bg-primary/10'>
                <Code className='h-10 w-10 text-primary' />
              </div>
              <h3 className='text-xl font-bold'>React</h3>
              <p className='text-muted-foreground text-center'>
                A JavaScript library for building user interfaces with a focus
                on component-based architecture.
              </p>
            </div>
            <div className='flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background'>
              <div className='p-3 rounded-full bg-primary/10'>
                <Server className='h-10 w-10 text-primary' />
              </div>
              <h3 className='text-xl font-bold'>Express</h3>
              <p className='text-muted-foreground text-center'>
                A minimal and flexible Node.js web application framework that
                provides robust features.
              </p>
            </div>
            <div className='flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background'>
              <div className='p-3 rounded-full bg-primary/10'>
                <Database className='h-10 w-10 text-primary' />
              </div>
              <h3 className='text-xl font-bold'>MongoDB</h3>
              <p className='text-muted-foreground text-center'>
                A document database with the scalability and flexibility that
                you want with the querying you need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
