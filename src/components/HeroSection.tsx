import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { value: "50K+", label: "PHOTOS MATCHED" },
  { value: "2K+", label: "EVENTS CREATED" },
  { value: "<2s", label: "MATCH SPEED" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/60" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-surface/50 backdrop-blur-sm mb-8 animate-glow-pulse animate-fade-in">
          <span className="text-sm animate-blink">✨</span>
          <span className="text-sm text-muted-foreground">AI-Powered Face Recognition</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
          Never Miss a Photo You're In
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
          Every camera. Every moment. Delivered to you. Upload a selfie and instantly find every photo of you from any event — across every guest's camera.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.45s", opacity: 0 }}>
          <Link to="/login">
            <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base font-medium transition-transform duration-200 hover:scale-105">
              Create Your Event <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" className="border-border text-foreground hover:bg-surface px-8 py-6 text-base transition-transform duration-200 hover:scale-105">
              See How It Works
            </Button>
          </a>
        </div>

        <div className="flex items-center justify-center gap-0 animate-fade-in" style={{ animationDelay: "0.6s", opacity: 0 }}>
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
