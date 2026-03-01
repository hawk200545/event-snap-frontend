import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { value: "50K+", label: "PHOTOS MATCHED" },
  { value: "2K+", label: "EVENTS CREATED" },
  { value: "<2s", label: "MATCH SPEED" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/60" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-sm mb-8">
          <span className="text-sm">✨</span>
          <span className="text-sm text-muted-foreground">AI-Powered Face Recognition</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
          Never Miss a Photo You're In
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Every camera. Every moment. Delivered to you. Upload a selfie and instantly find every photo of you from any event — across every guest's camera.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base font-medium">
            Create Your Event <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface px-8 py-6 text-base">
            See How It Works
          </Button>
        </div>

        <div className="flex items-center justify-center gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`px-8 md:px-12 ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
              <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs tracking-widest text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
