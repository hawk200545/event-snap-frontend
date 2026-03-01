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
  return (
    <section id="how-it-works" className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">How It Works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16">
          Four steps to every photo of you
        </h2>
        <p className="text-muted-foreground mb-12 -mt-12">
          From event creation to photo delivery — it all happens automatically.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-5xl font-black text-primary/20 mb-4">{step.number}</div>
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
