import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

export default function FAQ() {
  return (
    <section className='w-full py-12 md:py-24'>
      <div className='container px-4 md:px-6'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
              Frequently Asked Questions
            </h2>
            <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
              Find answers to common questions about our platform.
            </p>
          </div>
          <div className='mx-auto w-full max-w-3xl space-y-4 mt-8'>
            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='item-1'>
                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                <AccordionContent>
                  Creating an account is simple. Click on the "Get Started"
                  button on our homepage or the "Login" button in the navigation
                  bar and follow the sign-up process. You'll need to provide a
                  valid email address and create a password.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-2'>
                <AccordionTrigger>
                  Is the platform free to use?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, our basic features are completely free to use. We also
                  offer premium plans with additional features for users who
                  want an enhanced experience. You can view our pricing details
                  on the pricing page.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-3'>
                <AccordionTrigger>How is my data protected?</AccordionTrigger>
                <AccordionContent>
                  We take data privacy seriously. All user data is encrypted and
                  stored securely. We never share your personal information with
                  third parties without your consent. You can learn more about
                  our data protection practices in our privacy policy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-4'>
                <AccordionTrigger>Can I delete my account?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can delete your account at any time. Go to your
                  account settings and select the "Delete Account" option.
                  Please note that this action is irreversible and all your data
                  will be permanently removed from our servers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-5'>
                <AccordionTrigger>
                  How do I report inappropriate content?
                </AccordionTrigger>
                <AccordionContent>
                  If you encounter any inappropriate content, you can report it
                  by clicking the "Report" button next to the content. Our
                  moderation team reviews all reports and takes appropriate
                  action according to our community guidelines.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
