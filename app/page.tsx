import Preloader from '@/components/Preloader';
import Header from '@/components/Header';
import ThreadLine from '@/components/ThreadLine';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Layers from '@/components/Layers';
import BodyMap from '@/components/BodyMap';
import Method from '@/components/Method';
import Reforma from '@/components/Reforma';
import TechRail from '@/components/TechRail';
import PriceList from '@/components/PriceList';
import BeforeAfter from '@/components/BeforeAfter';
import Voices from '@/components/Voices';
import StudioGallery from '@/components/StudioGallery';
import GiftCard from '@/components/GiftCard';
import Location from '@/components/Location';
import Finale from '@/components/Finale';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <Preloader />
      <a className="skip" href="#main">К содержанию</a>
      <Header />
      <ThreadLine />
      <main id="main">
        <Hero />
        <Manifesto />
        <Layers />
        <BodyMap />
        <Method />
        <Reforma />
        <TechRail />
        <PriceList />
        <BeforeAfter />
        <Voices />
        <StudioGallery />
        <GiftCard />
        <Location />
        <Finale />
      </main>
      <Footer />
    </>
  );
}
