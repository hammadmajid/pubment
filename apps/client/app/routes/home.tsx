import CTASection from '~/components/home/cta-section';
import FAQ from '~/components/home/faq';
import Footer from '~/components/home/footer';
import Hero from '~/components/home/hero';
import Navbar from '~/components/home/navbar';
import TechStack from '~/components/home/tech-stack';

export function meta() {
  return [
    { title: 'Social Media' },
    {
      name: 'description',
      content: 'Mini social media app built with modern stack',
    },
  ];
}

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col mx-auto max-w-max'>
      <Navbar />
      <main className='flex-grow'>
        <Hero />
        <TechStack />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
