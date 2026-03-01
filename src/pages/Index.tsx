import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CompareSection from "@/components/CompareSection";
import EventsSection from "@/components/EventsSection";
import TechStackSection from "@/components/TechStackSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <CompareSection />
      <EventsSection />
      <TechStackSection />
      <CTASection />
    </div>
  );
};

export default Index;
