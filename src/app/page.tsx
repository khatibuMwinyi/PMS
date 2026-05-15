import {
  LandingNav,
  HeroEditorial,
  StepRail,
  QuoteDemo,
  ServiceTileGrid,
  TrustStrip,
  ProviderBand,
  FAQAccordion,
  FinalCta,
  FooterEditorial,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main id="top">
        <HeroEditorial />
        <StepRail />
        <QuoteDemo />
        <ServiceTileGrid />
        <TrustStrip />
        <ProviderBand />
        <FAQAccordion />
        <FinalCta />
      </main>
      <FooterEditorial />
    </>
  );
}
