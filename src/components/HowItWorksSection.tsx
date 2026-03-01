import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const steps = [
  {
    number: "01",
    title: "Create a Room",
    description: "Organizer creates a photo room for the event and gets a unique QR code to share with guests.",
  },
  {
    number: "02",
    title: "Guests Upload",
    description: "Guests scan the QR code and upload their photos. No account needed, no app required — just scan and share.",
  },
  {
    number: "03",
    title: "AI Maps Every Face",
    description: "Our AI processes every uploaded photo — detecting and mapping all faces using advanced facial embeddings.",
  },
  {
    number: "04",
    title: "Get Your Photos",
    description: "Upload a selfie and instantly receive every photo you appear in, from every camera at the event.",
  },
];

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="how-it-works" className="py-24 px-6 bg-surface/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <p className={`text-sm text-primary font-medium mb-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>How It Works</p>
        <h2 className={`text-3xl md:text-4xl font-bold text-foreground mb-4 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Four steps to every photo of you
        </h2>
        <p className={`text-muted-foreground mb-12 transition-all duration-700 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          From event creation to photo delivery — it all happens automatically.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative transition-all duration-600 hover:translate-y-[-4px] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: isVisible ? `${250 + i * 120}ms` : "0ms" }}
            >
              <div className="text-5xl font-black text-primary/20 mb-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{step.number}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
