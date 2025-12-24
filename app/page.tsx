import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesGrid from "./components/FeaturesGrid";
import HowItWorksSection from "./components/HowItWorksSection";
import IntegrationsSection from "./components/IntegrationsSection";
import TestimonialSection from "./components/TestimonialSection";
import StatsSection from "./components/StatsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-foreground)]">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorksSection />
      <IntegrationsSection />
      <TestimonialSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
