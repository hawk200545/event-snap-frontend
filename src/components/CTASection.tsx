import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const CTASection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 px-6 bg-surface/50" ref={ref}>
      <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to capture every moment?
        </h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          Create your first event room in seconds. No credit card required. Every photo, every face, delivered to the right person.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base transition-transform duration-200 hover:scale-105">
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface px-8 py-6 text-base transition-transform duration-200 hover:scale-105">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
