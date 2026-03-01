import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const features = [
  { feature: "Photo sources", eventsnap: "Every camera at the event", google: "Your camera only" },
  { feature: "Account required", eventsnap: "No — just scan a QR code", google: "Yes — Google account + app" },
  { feature: "Data retention", eventsnap: "Temporary event rooms", google: "Stored forever by Google" },
  { feature: "Photo sharing", eventsnap: "Automatic face-based delivery", google: "Manual album sharing" },
  { feature: "Cross-device search", eventsnap: true, google: false },
  { feature: "Privacy-first design", eventsnap: true, google: false },
];

const CompareSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="compare" className="py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <p className={`text-sm text-primary font-medium mb-3 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>Compare</p>
        <h2 className={`text-3xl md:text-4xl font-bold text-foreground mb-4 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Why not Google Photos?
        </h2>
        <p className={`text-muted-foreground mb-12 transition-all duration-700 delay-150 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          Google Photos is great for your personal library. EventSnap is built for shared moments.
        </p>

        <div className={`bg-surface rounded-xl border border-border overflow-hidden transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid grid-cols-3 gap-0">
            <div className="p-4 font-medium text-sm text-muted-foreground border-b border-border">Feature</div>
            <div className="p-4 font-semibold text-sm text-primary border-b border-border text-center">EventSnap</div>
            <div className="p-4 font-medium text-sm text-muted-foreground border-b border-border text-center">Google Photos</div>

            {features.map((row, i) => (
              <div key={row.feature} className="contents">
                <div className="p-4 text-sm text-foreground border-b border-border last:border-0">{row.feature}</div>
                <div className="p-4 text-sm text-center border-b border-border last:border-0">
                  {typeof row.eventsnap === "boolean" ? (
                    row.eventsnap ? <Check className="w-5 h-5 text-accent mx-auto" /> : <X className="w-5 h-5 text-destructive mx-auto" />
                  ) : (
                    <span className="text-foreground">{row.eventsnap}</span>
                  )}
                </div>
                <div className="p-4 text-sm text-center border-b border-border last:border-0">
                  {typeof row.google === "boolean" ? (
                    row.google ? <Check className="w-5 h-5 text-accent mx-auto" /> : <X className="w-5 h-5 text-destructive mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">{row.google}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-8 text-center transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link to="/login">
            <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 transition-transform duration-200 hover:scale-105">
              Switch to EventSnap
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompareSection;
